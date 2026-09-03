const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @GET /api/growth/insights
exports.getGrowthInsights = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // ── Core metrics ───────────────────────────────────────
    const [currentRevenue, previousRevenue, totalCustomers, activeSubscriptions] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Customer.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'active' }),
    ]);

    const currentRev = currentRevenue[0]?.total || 0;
    const prevRev = previousRevenue[0]?.total || 0;
    const currentOrders = currentRevenue[0]?.count || 0;
    const revenueGrowth = prevRev > 0 ? Math.round(((currentRev - prevRev) / prevRev) * 100) : 0;
    const aov = currentOrders > 0 ? Math.round(currentRev / currentOrders) : 0;
    const subscriptionRate = totalCustomers > 0 ? Math.round((activeSubscriptions / totalCustomers) * 100) : 0;

    // ── Upsell opportunity: frequent buyers without subscription ──
    const frequentBuyers = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$customer', orderCount: { $sum: 1 }, totalSpend: { $sum: '$totalAmount' } } },
      { $match: { orderCount: { $gte: 3 } } },
      { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'customer', as: 'subs' } },
      { $match: { 'subs.status': { $ne: 'active' } } },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customerInfo' } },
      { $unwind: '$customerInfo' },
      {
        $project: {
          customerId: '$_id',
          name: '$customerInfo.name',
          area: '$customerInfo.area',
          orderCount: 1,
          totalSpend: 1,
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 50 },
    ]);

    // ── Lapsed customers (ordered before 30 days but not recently) ──
    const lapsedCustomers = await Order.aggregate([
      { $group: { _id: '$customer', lastOrder: { $max: '$createdAt' } } },
      { $match: { lastOrder: { $lt: thirtyDaysAgo, $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customerInfo' } },
      { $unwind: '$customerInfo' },
      { $project: { customerId: '$_id', name: '$customerInfo.name', lastOrder: 1 } },
      { $limit: 20 },
    ]);

    // ── Revenue by area ────────────────────────────────────
    const revenueByArea = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: '$area', revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // ── Subscription conversion opportunity ─────────────────
    const subscriptionRevenuePotential = frequentBuyers.length * 1080; // avg monthly plan price
    const actualSubscriptionRevenue = activeSubscriptions * 1080;

    // ── Audit log stats ────────────────────────────────────
    const aiStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      insights: {
        revenue: {
          current: currentRev,
          previous: prevRev,
          growth: revenueGrowth,
          growthLabel: revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`,
        },
        orders: {
          count: currentOrders,
          averageOrderValue: aov,
        },
        customers: {
          total: totalCustomers,
          activeSubscriptions,
          subscriptionRate,
          lapsed: lapsedCustomers.length,
        },
        opportunities: {
          frequentBuyersWithoutSubscription: frequentBuyers.length,
          frequentBuyers: frequentBuyers.slice(0, 10),
          lapsedCustomers: lapsedCustomers.slice(0, 10),
          subscriptionRevenuePotential,
          actualSubscriptionRevenue,
          potentialMonthlyGain: subscriptionRevenuePotential - actualSubscriptionRevenue,
        },
        revenueByArea,
        aiActivity: aiStats,
        // AI narrative summary
        summary: generateInsightSummary({
          currentRev,
          revenueGrowth,
          frequentBuyers: frequentBuyers.length,
          subscriptionRevenuePotential,
          actualSubscriptionRevenue,
          lapsed: lapsedCustomers.length,
          aov,
        }),
      },
    });
  } catch (err) {
    console.error('Growth insights error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateInsightSummary({ currentRev, revenueGrowth, frequentBuyers, subscriptionRevenuePotential, actualSubscriptionRevenue, lapsed, aov }) {
  const lines = [];
  lines.push(`📊 **Revenue this month:** ₹${currentRev.toLocaleString()} (${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% vs last month)`);

  if (frequentBuyers > 0) {
    lines.push(`\n💡 **Top opportunity:** ${frequentBuyers} frequent customers are ordering 3+ times/month but haven't subscribed yet.`);
    lines.push(`   Converting them could add ₹${(subscriptionRevenuePotential - actualSubscriptionRevenue).toLocaleString()}/month in recurring revenue.`);
  }

  if (lapsed > 0) {
    lines.push(`\n⚠️  **${lapsed} customers** haven't ordered in 30+ days. A win-back campaign could recover this revenue.`);
  }

  lines.push(`\n📦 **Average order value:** ₹${aov} — consider bundling products to increase this.`);

  return lines.join('\n');
}

// @GET /api/growth/audit
exports.getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, actor } = req.query;
    const query = {};
    if (action) query.action = action;
    if (actor) query.actor = actor;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('customerId', 'name phone')
      .populate('orderId', 'orderId totalAmount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
