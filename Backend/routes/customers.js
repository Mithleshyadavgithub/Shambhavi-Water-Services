const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin', 'manager'), getCustomers);
router.post('/', authorize('admin', 'manager'), createCustomer);
router.get('/:id', getCustomer);
router.put('/:id', authorize('admin', 'manager'), updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;
