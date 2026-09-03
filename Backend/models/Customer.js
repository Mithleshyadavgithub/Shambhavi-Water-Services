const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  landmark: { type: String },
  waterType: { type: String, enum: ['20L Can', '10L Can', '5L Bottle', '1L Bottle'], default: '20L Can' },
  defaultQuantity: { type: Number, default: 1 },
  subscriptionType: {
    type: String,
    enum: ['daily', 'alternate', 'weekly', 'monthly', 'on-demand'],
    default: 'on-demand',
  },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  outstandingAmount: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

// Auto-generate customer ID
customerSchema.pre('save', async function (next) {
  if (!this.customerId) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerId = `SWS${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
