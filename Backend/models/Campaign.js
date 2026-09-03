const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignId: { type: String, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  // Targeting
  targetSegment: {
    type: String,
    enum: ['frequent-buyers', 'non-subscribers', 'high-value', 'lapsed', 'office-customers', 'all'],
  },
  targetCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  targetCount: { type: Number, default: 0 },
  // Offer
  offerType: {
    type: String,
    enum: ['subscription-discount', 'bulk-discount', 'free-delivery', 'combo-offer'],
  },
  discountPercent: { type: Number, default: 0 },
  offerDescription: { type: String },
  relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // Financials
  estimatedRevenue: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },
  actualRevenue: { type: Number, default: 0 },
  // Status flow: draft → pending_approval → approved → executed
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'executed', 'cancelled'],
    default: 'draft',
  },
  // Approval
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approvalNote: { type: String },
  // Execution
  executedAt: { type: Date },
  results: {
    contacted: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
  },
  // AI metadata
  aiGenerated: { type: Boolean, default: true },
  aiReasoning: { type: String }, // Why AI recommended this campaign
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

campaignSchema.pre('save', async function (next) {
  if (!this.campaignId) {
    const count = await mongoose.model('Campaign').countDocuments();
    this.campaignId = `CAM${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
