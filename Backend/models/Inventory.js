const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: String,
    enum: ['20L Can', '10L Can', '5L Bottle', '1L Bottle'],
    unique: true,
    required: true,
  },
  pricePerUnit: { type: Number, required: true },
  totalStock: { type: Number, default: 0 },
  availableStock: { type: Number, default: 0 },
  withCustomers: { type: Number, default: 0 },
  damaged: { type: Number, default: 0 },
  lowStockAlert: { type: Number, default: 20 },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
