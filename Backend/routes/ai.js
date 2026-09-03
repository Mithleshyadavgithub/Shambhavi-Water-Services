const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/auth');
const { chat, health } = require('../controllers/aiController');

router.get('/health', health);
router.post('/chat', optionalProtect, chat);

module.exports = router;
