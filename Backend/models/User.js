const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['admin', 'manager', 'delivery', 'customer'],
    default: 'customer',
  },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
