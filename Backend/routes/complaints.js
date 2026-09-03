const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id', authorize('admin', 'manager'), updateComplaint);

module.exports = router;
