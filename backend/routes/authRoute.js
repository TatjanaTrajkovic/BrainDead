const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loadUser = require('../middleware/loadUser');

router.post('/auth/guest', authController.createGuest);
router.get('/auth/me', loadUser({ reqired: true }), authController.getMe);
router.post('/auth/signup', loadUser({ required: false }), authController.createUser);

module.exports = router;
