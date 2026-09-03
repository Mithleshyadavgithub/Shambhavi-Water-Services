const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

exports.getPayments = async (req, res) => {
  try {
    const { customer, page = 1, limit = 10 } = req.query;
    const query = {};
    if (customer) query.customer = customer;
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('customer', 'name phone customerId')
      .populate('order', 'orderId totalAmount')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, collectedBy: req.user._id });
    // Reduce outstanding amount
    await Customer.findByIdAndUpdate(req.body.customer, { $inc: { outstandingAmount: -payment.amount } });
    // Update order payment status if orderId provided
    if (req.body.order) {
      const order = await Order.findById(req.body.order);
      if (order) {
        order.paidAmount += payment.amount;
        order.paymentStatus = order.paidAmount >= order.totalAmount ? 'paid' : order.paidAmount > 0 ? 'partial' : 'pending';
        await order.save();
      }
    }
    res.status(201).json({ success: true, data: payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const { customer } = req.query;
    const matchStage = customer ? { customer: new (require('mongoose').Types.ObjectId)(customer) } : {};
    const summary = await Payment.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: summary[0] || { total: 0, count: 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyPaymentStatus = async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;
    if (orderId) {
      const order = await Order.findOne({ orderId });
      if (order && order.paymentStatus === 'paid') {
        return res.json({ success: true, status: 'paid', order });
      }
    }
    res.json({ success: true, status: 'verified', transactionId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

