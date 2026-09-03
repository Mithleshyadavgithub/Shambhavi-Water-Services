const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrderStatus, 
  updateOrder, 
  createPublicOrder, 
  trackOrderPublic, 
  cancelOrderPublic, 
  lookupOrdersPublic, 
  getPublicRecentOrders,
  confirmPendingOrder 
} = require('../controllers/orderController');
const { optionalProtect, protect, authorize } = require('../middleware/auth');

// Public route for guest checkout, order tracking, cancellation, history, lookup, and confirming pending AI orders
router.post('/public', createPublicOrder);
router.get('/public/history', getPublicRecentOrders);
router.get('/track/:orderId', trackOrderPublic);
router.put('/track/:orderId/cancel', cancelOrderPublic);
router.post('/lookup', lookupOrdersPublic);
router.put('/:id/confirm', optionalProtect, confirmPendingOrder);

router.use(protect);
router.get('/', getOrders);
router.post('/', authorize('admin', 'manager', 'customer'), createOrder);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id', authorize('admin', 'manager'), updateOrder);

module.exports = router;
