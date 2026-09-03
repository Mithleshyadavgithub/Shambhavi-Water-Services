const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
} = require('../controllers/razorpayController');

// Payments
router.post('/create-order', optionalProtect, createRazorpayOrder);
router.post('/verify', optionalProtect, verifyPayment);

// Webhook — raw body for signature verification
router.post('/webhook', express.json(), razorpayWebhook);

module.exports = router;
