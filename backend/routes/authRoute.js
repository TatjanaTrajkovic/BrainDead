const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loadUser = require('../middleware/loadUser');

router.post('/auth/guest', authController.createGuest);
router.get('/auth/me', loadUser({ required: true }), authController.getMe);
router.post('/auth/signup', loadUser({ required: false }), authController.createUser);
router.post('/auth/login', authController.login);
router.post('/auth/logout', loadUser({ required: true }), authController.logout);

module.exports = router;
