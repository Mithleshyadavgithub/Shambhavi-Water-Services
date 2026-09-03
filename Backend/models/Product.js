const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['water-jar', 'water-bottle', 'accessory', 'subscription-plan'],
    required: true,
  },
  size: { type: String }, // e.g. "20L", "10L", "5L", "1L"
  unit: { type: String, default: 'piece' }, // piece, pack, month
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number }, // original price for showing discount
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  sku: { type: String, unique: true, sparse: true },
  customerTypes: [{
    type: String,
    enum: ['home', 'office', 'restaurant', 'hotel', 'institution'],
  }],
  subscriptionAvailable: { type: Boolean, default: false },
  subscriptionDiscount: { type: Number, default: 0 }, // percent
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  tags: [{ type: String }], // for AI search: "drinking", "bulk", "daily"
  active: { type: Boolean, default: true },
  // AI metadata
  aiDescription: { type: String }, // Rich description for AI to use
  useCases: [{ type: String }], // AI context: ["daily drinking","office hydration"]
  recommendFor: [{ type: String }], // e.g. ["family of 4","office 10-20 people"]
  monthlyUsageEstimate: { type: String }, // "2-4 per month for family of 4"
}, { timestamps: true });

// Virtual: is low stock?
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Text index for AI search
productSchema.index({ name: 'text', description: 'text', tags: 'text', aiDescription: 'text' });
productSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model('Product', productSchema);
