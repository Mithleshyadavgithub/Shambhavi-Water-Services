const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    required: true,
  },
  quantityPerDelivery: { type: Number, default: 1 },
  pricePerDelivery: { type: Number, required: true },
  monthlyPrice: { type: Number }, // computed monthly cost
  discountPercent: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
  },
  startDate: { type: Date, default: Date.now },
  nextDeliveryDate: { type: Date },
  deliveryAddress: { type: String },
  deliveryArea: { type: String },
  notes: { type: String },
  // AI tracking
  aiRecommended: { type: Boolean, default: false },
  convertedFromOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

subscriptionSchema.pre('save', async function (next) {
  if (!this.subscriptionId) {
    const count = await mongoose.model('Subscription').countDocuments();
    this.subscriptionId = `SUB${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
