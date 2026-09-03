const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // What happened
  action: {
    type: String,
    enum: [
      'CREATE_RAZORPAY_ORDER',
      'VERIFY_PAYMENT',
      'PAYMENT_CAPTURED',
      'PAYMENT_FAILED',
      'CREATE_SUBSCRIPTION',
      'APPLY_DISCOUNT',
      'CREATE_CAMPAIGN',
      'APPROVE_CAMPAIGN',
      'EXECUTE_CAMPAIGN',
      'AI_RECOMMENDATION',
      'POLICY_BLOCKED',
    ],
    required: true,
  },
  // Who did it
  actor: {
    type: String,
    enum: ['AI_AGENT', 'CUSTOMER', 'ADMIN', 'WEBHOOK', 'SYSTEM'],
    required: true,
  },
  // Context
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  // Money details
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  // Razorpay
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  webhookEventId: { type: String },
  // Explainability
  reason: { type: String }, // Why this action was taken
  approval: {
    type: String,
    enum: ['CUSTOMER_CONFIRMED', 'ADMIN_APPROVED', 'AUTOMATIC', 'POLICY_BLOCKED', 'WEBHOOK'],
  },
  // Result
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'BLOCKED', 'PENDING'],
    default: 'SUCCESS',
  },
  errorMessage: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // extra context
}, { timestamps: true });

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ customerId: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
