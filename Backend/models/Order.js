const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Product-based order (new AI catalog)
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number, default: 1 },
    pricePerUnit: { type: Number },
    subtotal: { type: Number },
  }],
  // Legacy fields (kept for backward compat)
  waterType: { type: String, default: '20L Can' },
  quantity: { type: Number, min: 1 },
  pricePerUnit: { type: Number },
  deliveryCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'out-for-delivery', 'delivered', 'cancelled', 'payment_failed'],
    default: 'pending',
  },
  deliveryStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial', 'failed', 'awaiting_payment'],
    default: 'pending',
  },
  paidAmount: { type: Number, default: 0 },
  address: { type: String },
  area: { type: String },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  notes: { type: String },
  // ── Razorpay Integration ──────────────────────────────
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cash', 'upi', 'bank-transfer', 'cheque', 'online', 'gpay', 'phonepe', 'paytm'],
    default: 'cash',
  },
  upiProvider: { type: String }, // 'Google Pay' | 'PhonePe' | 'Paytm' | 'Razorpay' | 'Other'
  transactionId: { type: String },
  paymentScreenshot: { type: String },
  cancellationReason: { type: String },
  // ── AI Agent Tracking ─────────────────────────────────
  aiInitiated: { type: Boolean, default: false },
  customerConfirmed: { type: Boolean, default: false },
  agentSessionId: { type: String },
  aiReason: { type: String }, // what AI recommended and why
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
