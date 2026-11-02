const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const loadUser = require('../middleware/loadUser');

router.post('/sessions', loadUser(), sessionController.createSession);
router.get('/sessions/active', loadUser(), sessionController.getActiveSession);
router.get('/sessions/:sessionId/question', loadUser(), sessionController.getNextQuestion);
router.post('/sessions/:sessionId/answer', loadUser(), sessionController.answerQuestion);
router.get('/sessions/:sessionId', loadUser(), sessionController.getSession);
router.get('/sessions/:sessionId/review', loadUser(), sessionController.getSessionReview);

module.exports = router;
