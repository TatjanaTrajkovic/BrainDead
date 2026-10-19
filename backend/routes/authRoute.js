const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/auth/guest', authController.createGuest);

module.exports = router;
