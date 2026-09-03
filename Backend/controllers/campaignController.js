const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const Product = require('../models/Product');

// @POST /api/campaigns/draft — AI generates a campaign draft
exports.createCampaignDraft = async (req, res) => {
  try {
    const { targetSegment, offerType, discountPercent, customProductId } = req.body;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find target customers based on segment
    let targetCustomers = [];
    let aiReasoning = '';
    let estimatedRevenue = 0;
    let campaignName = '';
    let offerDescription = '';

    if (targetSegment === 'non-subscribers' || !targetSegment) {
      // Frequent buyers without subscriptions — highest value segment
      const frequentNonSubs = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$customer', orderCount: { $sum: 1 }, totalSpend: { $sum: '$totalAmount' } } },
        { $match: { orderCount: { $gte: 3 } } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'customer', as: 'subs' } },
        { $match: { subs: { $size: 0 } } },
        { $limit: 100 },
      ]);
      targetCustomers = frequentNonSubs.map(c => c._id);
      estimatedRevenue = targetCustomers.length * 1080;
      campaignName = '🌊 Monthly Plan — Convert Frequent Buyers';
      offerDescription = `${discountPercent || 10}% off on first month subscription for customers ordering 3+ times/month`;
      aiReasoning = `Found ${targetCustomers.length} customers ordering 3+ times/month without a subscription. Converting them to monthly plans at ₹1080/month (after ${discountPercent || 10}% discount) would generate ₹${(targetCustomers.length * 1080 * (1 - (discountPercent || 10) / 100)).toLocaleString()}/month in recurring revenue.`;
    } else if (targetSegment === 'lapsed') {
      const lapsedCustomers = await Order.aggregate([
        { $group: { _id: '$customer', lastOrder: { $max: '$createdAt' } } },
        { $match: { lastOrder: { $lt: thirtyDaysAgo, $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
        { $limit: 50 },
      ]);
      targetCustomers = lapsedCustomers.map(c => c._id);
      estimatedRevenue = targetCustomers.length * 200;
      campaignName = '🔄 Win-Back Campaign — Lapsed Customers';
      offerDescription = 'Special offer to bring back customers who haven\'t ordered in 30+ days';
      aiReasoning = `Found ${targetCustomers.length} customers who haven't ordered in 30-90 days. A win-back offer could re-activate them, recovering an estimated ₹${estimatedRevenue.toLocaleString()} in monthly revenue.`;
    } else if (targetSegment === 'high-value') {
      const highValue = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$customer', totalSpend: { $sum: '$totalAmount' } } },
        { $match: { totalSpend: { $gte: 500 } } },
        { $limit: 30 },
      ]);
      targetCustomers = highValue.map(c => c._id);
      estimatedRevenue = targetCustomers.length * 400;
      campaignName = '⭐ Premium Upgrade — High-Value Customers';
      offerDescription = 'Exclusive dispenser bundle offer for our top customers';
      aiReasoning = `Found ${targetCustomers.length} high-value customers (₹500+ spend this month). Offering them a premium dispenser bundle could increase AOV significantly.`;
    } else if (targetSegment === 'office-customers') {
      const officeCusts = await Customer.find({ customerType: 'office' }).select('_id').limit(50);
      targetCustomers = officeCusts.map(c => c._id);
      estimatedRevenue = targetCustomers.length * 1440;
      campaignName = '🏢 Office Monthly Plan Campaign';
      offerDescription = 'Office monthly water plan with 20% discount for bulk orders';
      aiReasoning = `Found ${targetCustomers.length} office customers. The Office Monthly Plan at ₹1440/month (20% discount) would be highly relevant for them.`;
    }

    // Find a relevant product
    let relatedProduct = null;
    if (customProductId) {
      relatedProduct = customProductId;
    } else if (targetSegment === 'non-subscribers' || !targetSegment) {
      const plan = await Product.findOne({ category: 'subscription-plan', active: true });
      relatedProduct = plan?._id;
    }

    // Create campaign draft
    const campaign = await Campaign.create({
      name: campaignName,
      description: offerDescription,
      targetSegment: targetSegment || 'non-subscribers',
      targetCustomers,
      targetCount: targetCustomers.length,
      offerType: offerType || 'subscription-discount',
      discountPercent: discountPercent || 10,
      offerDescription,
      relatedProduct,
      estimatedRevenue,
      budget: Math.min(estimatedRevenue * 0.1, parseInt(process.env.AI_MAX_CAMPAIGN_BUDGET || 2000)),
      status: 'pending_approval',
      aiGenerated: true,
      aiReasoning,
      createdByUser: req.user._id,
    });

    // Audit log
    await AuditLog.create({
      action: 'CREATE_CAMPAIGN',
      actor: 'AI_AGENT',
      amount: estimatedRevenue,
      campaignId: campaign._id,
      reason: aiReasoning,
      approval: 'ADMIN_APPROVED', // will be set when admin approves
      status: 'PENDING',
      metadata: { segment: targetSegment, targetCount: targetCustomers.length },
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: `✅ Campaign draft created with ${targetCustomers.length} target customers. Awaiting admin approval.`,
    });
  } catch (err) {
    console.error('Campaign draft error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .populate('relatedProduct', 'name price size')
      .populate('approvedBy', 'name')
      .populate('createdByUser', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: campaigns, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/campaigns/:id
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('relatedProduct', 'name price size aiDescription')
      .populate('approvedBy', 'name email')
      .populate('targetCustomers', 'name phone area');
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/campaigns/:id/approve — Admin approves campaign
exports.approveCampaign = async (req, res) => {
  try {
    const { note } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (campaign.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: `Campaign is already ${campaign.status}` });
    }

    campaign.status = 'approved';
    campaign.approvedBy = req.user._id;
    campaign.approvedAt = new Date();
    campaign.approvalNote = note || 'Approved by admin';
    await campaign.save();

    await AuditLog.create({
      action: 'APPROVE_CAMPAIGN',
      actor: 'ADMIN',
      campaignId: campaign._id,
      reason: `Admin approved campaign: ${campaign.name}`,
      approval: 'ADMIN_APPROVED',
      status: 'SUCCESS',
      metadata: { approvalNote: note, adminId: req.user._id },
    });

    res.json({ success: true, data: campaign, message: `Campaign "${campaign.name}" approved. Ready to execute.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/campaigns/:id/execute — Execute approved campaign
exports.executeCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (campaign.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Campaign must be approved before execution' });
    }

    campaign.status = 'executed';
    campaign.executedAt = new Date();
    // In a real system, this would send SMS/notifications to target customers
    campaign.results = {
      contacted: campaign.targetCount,
      converted: 0, // tracked over time
      revenueGenerated: 0,
    };
    await campaign.save();

    await AuditLog.create({
      action: 'EXECUTE_CAMPAIGN',
      actor: 'ADMIN',
      campaignId: campaign._id,
      amount: campaign.budget,
      reason: `Campaign executed: ${campaign.name} targeting ${campaign.targetCount} customers`,
      approval: 'ADMIN_APPROVED',
      status: 'SUCCESS',
      metadata: { targetCount: campaign.targetCount, estimatedRevenue: campaign.estimatedRevenue },
    });

    res.json({
      success: true,
      data: campaign,
      message: `🚀 Campaign "${campaign.name}" executed! Targeting ${campaign.targetCount} customers.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
