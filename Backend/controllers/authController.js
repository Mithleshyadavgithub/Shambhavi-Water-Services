const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, role: role || 'customer' });

    // If customer role, create customer profile
    if (user.role === 'customer') {
      const customer = await Customer.create({
        user: user._id,
        name,
        phone: phone || '',
        email,
        address: req.body.address || '',
        area: req.body.area || 'General',
      });
      user.customerId = customer._id;
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, customerId: user.customerId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('customerId');
  res.json({ success: true, user });
};

// @route PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, address, area } = req.body;
    
    // Update User model
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    );

    // If customer role, update Customer model
    if (user.role === 'customer' && user.customerId) {
      await Customer.findByIdAndUpdate(
        user.customerId,
        { name, phone, address, area },
        { new: true, runValidators: true }
      );
    }

    const updatedUser = await User.findById(req.user.id).populate('customerId');
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
