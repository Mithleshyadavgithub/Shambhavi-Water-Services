const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['cash', 'upi', 'bank-transfer', 'cheque', 'online', 'razorpay'],
    default: 'cash',
  },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  note: { type: String },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  // ── Razorpay fields ─────────────────────────────────
  razorpayPaymentId: { type: String, index: true },
  razorpayOrderId: { type: String },
  razorpaySignature: { type: String },
  webhookEventId: { type: String, unique: true, sparse: true }, // idempotency
  currency: { type: String, default: 'INR' },
}, { timestamps: true });

paymentSchema.pre('save', async function (next) {
  if (!this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
