const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/sessions', sessionController.createSession);
router.get('/sessions/:sessionId/question', sessionController.getNextQuestion);
router.post('/sessions/:sessionId/answer', sessionController.answerQuestion);

module.exports = router;
