const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/api/sessions', sessionController.createSession);

module.exports = router;
