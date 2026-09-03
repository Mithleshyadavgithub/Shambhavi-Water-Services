const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

// ─── Razorpay instance ───────────────────────────────────────
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_REPLACE_ME') {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ─── @POST /api/payments/create-order ───────────────────────
// Creates a Razorpay order server-side and returns order_id to frontend
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, name, phone, email, address, area } = req.body; // our internal order ID and delivery details
    if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required' });

    // Validate delivery details if provided
    if (name !== undefined && !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    if (phone !== undefined && !phone.trim()) return res.status(400).json({ success: false, message: 'Phone is required' });
    if (address !== undefined && !address.trim()) return res.status(400).json({ success: false, message: 'Address is required' });
    if (area !== undefined && !area.trim()) return res.status(400).json({ success: false, message: 'Area is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Update order delivery details if provided
    if (address) order.address = address;
    if (area) order.area = area;
    await order.save();

    // Update customer profile
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

    // Verify this order belongs to the logged-in user
    if (req.user && req.user.role === 'customer') {
      const customer = await Customer.findById(order.customer);
      if (!customer || customer._id.toString() !== req.user.customerId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
      }
    }

    // Policy check: max order amount
    const maxAmount = parseInt(process.env.AI_MAX_ORDER_AMOUNT || 5000);
    if (order.totalAmount > maxAmount) {
      await AuditLog.create({
        action: 'POLICY_BLOCKED',
        actor: 'AI_AGENT',
        customerId: order.customer,
        orderId: order._id,
        amount: order.totalAmount,
        reason: `Order amount ₹${order.totalAmount} exceeds AI limit of ₹${maxAmount}`,
        approval: 'POLICY_BLOCKED',
        status: 'BLOCKED',
      });
      return res.status(400).json({
        success: false,
        message: `Order amount ₹${order.totalAmount} exceeds maximum allowed (₹${maxAmount}). Please contact our team.`,
      });
    }

    const razorpay = getRazorpay();

    // Demo mode: no real Razorpay key
    if (!razorpay) {
      const demoOrderId = `order_demo_${Date.now()}`;
      order.razorpayOrderId = demoOrderId;
      order.paymentStatus = 'awaiting_payment';
      await order.save();

      await AuditLog.create({
        action: 'CREATE_RAZORPAY_ORDER',
        actor: 'AI_AGENT',
        customerId: order.customer,
        orderId: order._id,
        amount: order.totalAmount,
        razorpayOrderId: demoOrderId,
        reason: 'Demo mode: Razorpay keys not configured',
        approval: 'CUSTOMER_CONFIRMED',
        status: 'SUCCESS',
        metadata: { mode: 'demo' },
      });

      return res.json({
        success: true,
        demo: true,
        razorpayOrderId: demoOrderId,
        amount: order.totalAmount * 100,
        currency: 'INR',
        keyId: 'demo_key',
        orderNumber: order.orderId,
      });
    }

    // Create real Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: order.orderId,
      notes: {
        internalOrderId: order._id.toString(),
        customerName: req.user?.name || 'Customer',
        aiInitiated: order.aiInitiated ? 'yes' : 'no',
      },
    });

    // Save Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = 'awaiting_payment';
    await order.save();

    // Audit log
    await AuditLog.create({
      action: 'CREATE_RAZORPAY_ORDER',
      actor: order.aiInitiated ? 'AI_AGENT' : 'CUSTOMER',
      customerId: order.customer,
      orderId: order._id,
      amount: order.totalAmount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      reason: `Razorpay order created for ${order.orderId}. Customer confirmed purchase.`,
      approval: 'CUSTOMER_CONFIRMED',
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderNumber: order.orderId,
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @POST /api/payments/verify ─────────────────────────────
// Server-side signature verification (required by Razorpay docs)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Find our internal order
    const order = await Order.findById(orderId) || await Order.findOne({ razorpayOrderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret || keySecret === 'REPLACE_ME') {
      // Demo mode: auto-approve
      order.razorpayPaymentId = razorpayPaymentId || 'demo_pay_' + Date.now();
      order.paymentStatus = 'paid';
      order.paidAmount = order.totalAmount;
      order.paymentMethod = 'razorpay';
      order.customerConfirmed = true;
      await order.save();

      await AuditLog.create({
        action: 'PAYMENT_CAPTURED',
        actor: 'WEBHOOK',
        customerId: order.customer,
        orderId: order._id,
        amount: order.totalAmount,
        razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        reason: 'Demo mode: payment auto-approved',
        approval: 'AUTOMATIC',
        status: 'SUCCESS',
        metadata: { mode: 'demo' },
      });

      // Update customer outstanding amount
      await Customer.findByIdAndUpdate(order.customer, {
        $inc: { outstandingAmount: -order.totalAmount },
      });

      return res.json({ success: true, verified: true, demo: true, orderNumber: order.orderId });
    }

    // Real signature verification
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await AuditLog.create({
        action: 'VERIFY_PAYMENT',
        actor: 'CUSTOMER',
        customerId: order.customer,
        orderId: order._id,
        amount: order.totalAmount,
        razorpayOrderId,
        razorpayPaymentId,
        reason: 'Payment signature verification FAILED',
        approval: 'AUTOMATIC',
        status: 'FAILED',
        errorMessage: 'Signature mismatch',
      });
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Signature valid — update order
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = 'paid';
    order.paidAmount = order.totalAmount;
    order.paymentMethod = 'razorpay';
    order.customerConfirmed = true;
    await order.save();

    // Create payment record
    const payment = await Payment.create({
      customer: order.customer,
      order: order._id,
      amount: order.totalAmount,
      method: 'razorpay',
      status: 'success',
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      currency: 'INR',
      note: `Razorpay payment for ${order.orderId}`,
    });

    // Update customer outstanding
    await Customer.findByIdAndUpdate(order.customer, {
      $inc: { outstandingAmount: -order.totalAmount },
    });

    // Audit log
    await AuditLog.create({
      action: 'VERIFY_PAYMENT',
      actor: 'CUSTOMER',
      customerId: order.customer,
      orderId: order._id,
      amount: order.totalAmount,
      currency: 'INR',
      razorpayOrderId,
      razorpayPaymentId,
      reason: `Payment verified and captured for order ${order.orderId}`,
      approval: 'AUTOMATIC',
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      verified: true,
      orderNumber: order.orderId,
      amount: order.totalAmount,
      message: '✅ Payment successful! Your water delivery is confirmed.',
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @POST /api/webhooks/razorpay ───────────────────────────
// Razorpay sends events here. We verify signature, check idempotency, update DB.
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature (if secret is configured)
    if (webhookSecret && webhookSecret !== 'REPLACE_ME') {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSig !== signature) {
        console.warn('⚠️  Webhook signature mismatch');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    const eventId = event.id; // Razorpay event ID for idempotency

    // Check for duplicate event (idempotency)
    if (eventId) {
      const existing = await AuditLog.findOne({ webhookEventId: eventId });
      if (existing) {
        console.log(`ℹ️  Duplicate webhook event ${eventId} — skipping`);
        return res.json({ success: true, message: 'Already processed' });
      }
    }

    const eventType = event.event;
    const payload = event.payload;

    // ── payment.captured ────────────────────────────────────
    if (eventType === 'payment.captured') {
      const payment = payload.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;
      const amountPaise = payment?.amount;

      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.razorpayPaymentId = razorpayPaymentId;
        order.paymentStatus = 'paid';
        order.paidAmount = amountPaise / 100;
        await order.save();

        await Payment.create({
          customer: order.customer,
          order: order._id,
          amount: amountPaise / 100,
          method: 'razorpay',
          status: 'success',
          razorpayPaymentId,
          razorpayOrderId,
          webhookEventId: eventId,
          currency: payment?.currency || 'INR',
        });

        await Customer.findByIdAndUpdate(order.customer, {
          $inc: { outstandingAmount: -(amountPaise / 100) },
        });

        await AuditLog.create({
          action: 'PAYMENT_CAPTURED',
          actor: 'WEBHOOK',
          customerId: order.customer,
          orderId: order._id,
          amount: amountPaise / 100,
          currency: payment?.currency || 'INR',
          razorpayOrderId,
          razorpayPaymentId,
          webhookEventId: eventId,
          reason: `Webhook: payment.captured for order ${order.orderId}`,
          approval: 'WEBHOOK',
          status: 'SUCCESS',
        });
      }
    }

    // ── payment.failed ───────────────────────────────────────
    if (eventType === 'payment.failed') {
      const payment = payload.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const errorReason = payment?.error_description || 'Payment failed';

      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'payment_failed';
        await order.save();

        await AuditLog.create({
          action: 'PAYMENT_FAILED',
          actor: 'WEBHOOK',
          customerId: order.customer,
          orderId: order._id,
          amount: order.totalAmount,
          razorpayOrderId,
          webhookEventId: eventId,
          reason: `Webhook: payment.failed — ${errorReason}`,
          approval: 'WEBHOOK',
          status: 'FAILED',
          errorMessage: errorReason,
        });
      }
    }

    // ── order.paid ──────────────────────────────────────────
    if (eventType === 'order.paid') {
      const rzpOrder = payload.order?.entity;
      const rzpOrderId = rzpOrder?.id;
      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paidAmount = rzpOrder.amount_paid / 100;
        await order.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
