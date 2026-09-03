const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomers, activeCustomers,
      todayOrders, pendingDeliveries,
      todayRevenue, pendingPayments,
      openComplaints
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'active' }),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ status: { $in: ['pending', 'assigned', 'out-for-delivery'] } }),
      Payment.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Customer.aggregate([{ $group: { _id: null, total: { $sum: '$outstandingAmount' } } }]),
      Complaint.countDocuments({ status: { $in: ['open', 'assigned', 'in-progress'] } }),
    ]);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const recentOrders = await Order.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalCustomers, activeCustomers, todayOrders, pendingDeliveries,
        todayRevenue: todayRevenue[0]?.total || 0,
        pendingPayments: pendingPayments[0]?.total || 0,
        openComplaints,
        monthlyRevenue,
        recentOrders,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
