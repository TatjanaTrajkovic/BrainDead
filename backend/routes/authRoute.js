const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireUser = require('../middleware/requireUser');

router.post('/auth/guest', authController.createGuest);
router.get('/auth/me', requireUser, authController.getMe);

module.exports = router;
