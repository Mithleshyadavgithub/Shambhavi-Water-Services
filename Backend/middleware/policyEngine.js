/**
 * Shambhavi AI — Policy Engine
 * Enforces spending limits and approval gates for AI-initiated actions.
 * This is what makes money actions "bounded" per Razorpay Track 01 requirements.
 */

const AuditLog = require('../models/AuditLog');

const LIMITS = {
  maxOrderAmount: () => parseInt(process.env.AI_MAX_ORDER_AMOUNT || 5000),
  maxDiscountPercent: () => parseInt(process.env.AI_MAX_DISCOUNT_PERCENT || 15),
  maxCampaignBudget: () => parseInt(process.env.AI_MAX_CAMPAIGN_BUDGET || 2000),
};

/**
 * Middleware: validate AI order amount
 */
exports.validateOrderAmount = async (req, res, next) => {
  const { totalAmount, amount } = req.body;
  const orderAmount = totalAmount || amount;

  if (!orderAmount) return next();

  const max = LIMITS.maxOrderAmount();
  if (orderAmount > max) {
    const customerId = req.body.customerId || req.user?.customerId;

    // Log the block
    await AuditLog.create({
      action: 'POLICY_BLOCKED',
      actor: 'AI_AGENT',
      customerId,
      amount: orderAmount,
      reason: `AI order blocked: ₹${orderAmount} exceeds limit of ₹${max}`,
      approval: 'POLICY_BLOCKED',
      status: 'BLOCKED',
      metadata: { requestBody: req.body, limits: { maxOrderAmount: max } },
    }).catch(() => {});

    return res.status(400).json({
      success: false,
      blocked: true,
      message: `❌ Order amount ₹${orderAmount} exceeds the maximum AI order limit of ₹${max}.`,
      reason: 'AMOUNT_LIMIT_EXCEEDED',
      limit: max,
      hint: 'For large orders, please contact our team directly or visit our admin panel.',
    });
  }

  next();
};

/**
 * Middleware: validate campaign discount
 */
exports.validateDiscount = (req, res, next) => {
  const { discountPercent } = req.body;
  if (!discountPercent) return next();

  const max = LIMITS.maxDiscountPercent();
  if (discountPercent > max) {
    return res.status(400).json({
      success: false,
      blocked: true,
      message: `❌ Discount ${discountPercent}% exceeds maximum allowed (${max}%).`,
      reason: 'DISCOUNT_LIMIT_EXCEEDED',
    });
  }
  next();
};

/**
 * Middleware: validate campaign budget
 */
exports.validateCampaignBudget = (req, res, next) => {
  const { budget } = req.body;
  if (!budget) return next();

  const max = LIMITS.maxCampaignBudget();
  if (budget > max) {
    return res.status(400).json({
      success: false,
      blocked: true,
      message: `❌ Campaign budget ₹${budget} exceeds maximum allowed (₹${max}).`,
      reason: 'BUDGET_LIMIT_EXCEEDED',
    });
  }
  next();
};

/**
 * Get current policy limits (for admin dashboard display)
 */
exports.getPolicyLimits = (req, res) => {
  res.json({
    success: true,
    limits: {
      maxOrderAmount: LIMITS.maxOrderAmount(),
      maxDiscountPercent: LIMITS.maxDiscountPercent(),
      maxCampaignBudget: LIMITS.maxCampaignBudget(),
      currency: 'INR',
      requiresHumanApproval: true,
    },
  });
};
