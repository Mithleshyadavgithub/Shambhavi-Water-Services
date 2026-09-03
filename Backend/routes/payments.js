const express = require('express');
const router = express.Router();
const { getPayments, createPayment, getPaymentSummary, verifyPaymentStatus } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public route for payment verification & live detection
router.post('/verify-status', verifyPaymentStatus);

router.use(protect);
router.get('/', getPayments);
router.post('/', authorize('admin', 'manager'), createPayment);
router.get('/summary', getPaymentSummary);

module.exports = router;
