const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const requireUser = require('../middleware/requireUser');

router.post('/sessions', requireUser, sessionController.createSession);
router.get('/sessions/active', requireUser, sessionController.getActiveSession);
router.get('/sessions/:sessionId/question', requireUser, sessionController.getNextQuestion);
router.post('/sessions/:sessionId/answer', requireUser, sessionController.answerQuestion);
router.get('/sessions/:sessionId', requireUser, sessionController.getSession);

module.exports = router;
