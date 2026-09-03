const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, updateStock, getAICatalog
} = require('../controllers/productController');

// Public / AI-readable
router.get('/catalog', getAICatalog);
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin only
router.post('/', protect, authorize('admin', 'manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/stock', protect, authorize('admin', 'manager', 'delivery'), updateStock);

module.exports = router;
