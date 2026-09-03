const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateDiscount, validateCampaignBudget } = require('../middleware/policyEngine');
const {
  createCampaignDraft,
  getCampaigns,
  getCampaign,
  approveCampaign,
  executeCampaign,
} = require('../controllers/campaignController');

router.get('/', protect, authorize('admin', 'manager'), getCampaigns);
router.get('/:id', protect, authorize('admin', 'manager'), getCampaign);
router.post('/draft', protect, authorize('admin', 'manager'), validateDiscount, validateCampaignBudget, createCampaignDraft);
router.post('/:id/approve', protect, authorize('admin'), approveCampaign);
router.post('/:id/execute', protect, authorize('admin'), executeCampaign);

module.exports = router;
