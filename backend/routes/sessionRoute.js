const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/sessions', sessionController.createSession);

module.exports = router;
