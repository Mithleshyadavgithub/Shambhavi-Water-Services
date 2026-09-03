const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getGrowthInsights, getAuditLog } = require('../controllers/growthController');
const { getPolicyLimits } = require('../middleware/policyEngine');

router.get('/insights', protect, authorize('admin', 'manager'), getGrowthInsights);
router.get('/audit', protect, authorize('admin', 'manager'), getAuditLog);
router.get('/policy-limits', protect, authorize('admin'), getPolicyLimits);

module.exports = router;
