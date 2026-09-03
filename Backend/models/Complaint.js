const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: {
    type: String,
    enum: ['water-quality', 'late-delivery', 'billing', 'damaged-can', 'staff-behavior', 'other'],
    required: true,
  },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  resolution: { type: String },
}, { timestamps: true });

complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `CMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
