const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// Helper to save base64 payment screenshots
const saveBase64Image = (base64Str) => {
  if (!base64Str || !base64Str.startsWith('data:')) return base64Str;
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64Str;
  
  const extension = matches[1].split('/')[1] || 'png';
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `payment_${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension}`;
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
};

exports.getOrders = async (req, res) => {
  try {
    const { status, area, page = 1, limit = 10, customer } = req.query;
    const query = {};
    if (status) query.status = status;
    if (area) query.area = area;
    if (customer) query.customer = customer;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name phone area customerId')
      .populate('deliveryStaff', 'name phone')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone area address customerId')
      .populate('deliveryStaff', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createOrder = async (req, res) => {
  try {
    const isUpi = ['upi', 'gpay', 'phonepe', 'paytm'].includes(req.body.paymentMethod);
    if (isUpi && !req.body.paymentScreenshot && !req.body.transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment screenshot or 12-digit UPI UTR is strictly required for UPI orders to prevent fraud.' 
      });
    }

    if (req.body.paymentScreenshot) {
      req.body.paymentScreenshot = saveBase64Image(req.body.paymentScreenshot);
    }

    // For UPI orders, set paymentStatus as pending (awaiting admin verification) unless processed via verified gateway
    if (isUpi && req.body.paymentStatus !== 'paid') {
      req.body.paymentStatus = 'pending';
    }

    const order = await Order.create(req.body);
    // Update customer order count
    await Customer.findByIdAndUpdate(req.body.customer, { $inc: { totalOrders: 1 } });
    res.status(201).json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPublicOrder = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      address, 
      area, 
      waterType, 
      quantity, 
      paymentMethod, 
      paymentScreenshot, 
      totalAmount,
      paymentStatus,
      paidAmount,
      upiProvider,
      transactionId
    } = req.body;
    if (!name || !phone || !email || !address || !area || !waterType || !quantity || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const isUpi = ['upi', 'gpay', 'phonepe', 'paytm'].includes(paymentMethod);
    // ANTI-FRAUD CHECK: Block any UPI order without payment screenshot or UTR number
    if (isUpi && !paymentScreenshot && !transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Proof of payment is strictly required for UPI orders. Please upload your payment screenshot or enter the 12-digit UTR.' 
      });
    }

    // 1. Find or create the customer by phone number
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({
        name,
        phone,
        email: email.trim().toLowerCase(),
        address,
        area,
        waterType,
        defaultQuantity: quantity,
      });
    } else {
      // Update details if they have changed or are empty
      customer.name = name;
      customer.address = address;
      customer.area = area;
      if (email) customer.email = email.trim().toLowerCase();
      await customer.save();
    }

    // 2. Save payment screenshot if provided
    let screenshotUrl = '';
    if (paymentScreenshot) {
      screenshotUrl = saveBase64Image(paymentScreenshot);
    }

    // 3. Create the order
    const order = await Order.create({
      customer: customer._id,
      waterType,
      quantity,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      upiProvider: upiProvider || '',
      transactionId: transactionId || '',
      paymentStatus: paymentMethod === 'razorpay' && paymentStatus === 'paid' ? 'paid' : 'pending',
      paidAmount: paymentMethod === 'razorpay' && paymentStatus === 'paid' ? totalAmount : (isUpi && paymentStatus === 'paid' ? totalAmount : 0),
      status: 'pending',
      address,
      area,
    });

    // 4. Update customer order count
    customer.totalOrders += 1;
    await customer.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryStaff } = req.body;
    const update = { status };
    if (deliveryStaff) update.deliveryStaff = deliveryStaff;
    if (status === 'delivered') update.deliveryDate = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'name phone area');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.trackOrderPublic = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('customer', 'name area');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        waterType: order.waterType,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        upiProvider: order.upiProvider,
        transactionId: order.transactionId,
        address: order.address,
        area: order.area,
        orderDate: order.orderDate || order.createdAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deliveryDate: order.deliveryDate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrderPublic = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { 
        status: 'cancelled',
        paymentStatus: 'failed',
        cancellationReason: cancellationReason || 'Not specified'
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.lookupOrdersPublic = async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone || !email) {
      return res.status(400).json({ success: false, message: 'Please provide both mobile number and email' });
    }

    const customer = await Customer.findOne({
      phone: phone.trim(),
      email: email.trim().toLowerCase()
    });

    if (!customer) {
      return res.json({ success: true, data: [] });
    }

    const orders = await Order.find({ customer: customer._id })
      .select('orderId createdAt waterType quantity totalAmount status paymentStatus upiProvider transactionId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirmPendingOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, area, paymentMethod, paymentScreenshot, paymentStatus, paidAmount, upiProvider, transactionId } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const mongoose = require('mongoose');
    let order = null;
    if (mongoose.isValidObjectId(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check (if customer is logged in)
    if (req.user && req.user.role === 'customer' && order.customer) {
      const customer = await Customer.findById(order.customer);
      if (customer && customer._id.toString() !== req.user.customerId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to confirm this order' });
      }
    }

    // Process screenshot if provided
    let screenshotUrl = '';
    if (paymentScreenshot) {
      screenshotUrl = saveBase64Image(paymentScreenshot);
    }

    const isPaid = paymentStatus === 'paid';

    // Update order details
    order.paymentMethod = paymentMethod;
    if (upiProvider) order.upiProvider = upiProvider;
    if (transactionId) order.transactionId = transactionId;
    if (screenshotUrl) order.paymentScreenshot = screenshotUrl;
    order.address = address || order.address;
    order.area = area || order.area;
    order.customerConfirmed = true;
    order.paymentStatus = isPaid ? 'paid' : (paymentStatus || 'pending');
    order.paidAmount = isPaid ? (paidAmount || order.totalAmount) : (paidAmount || 0);
    order.status = 'pending';
    await order.save();

    // Update customer details
    if (order.customer) {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (email) customer.email = email.trim().toLowerCase();
        if (address) customer.address = address;
        if (area) customer.area = area;
        await customer.save();
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublicRecentOrders = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 50);
    const orders = await Order.find({})
      .populate('customer', 'name phone area')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
