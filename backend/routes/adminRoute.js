const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const loadUser = require('../middleware/loadUser');
const questionController = require('../controllers/questionController');
const statsController = require('../controllers/statsController');

router.use(loadUser(), requireAdmin);

router.get('/questions', questionController.getAllQuestions);
router.post('/questions', questionController.createQuestion);
router.put('/questions/:questionId', questionController.updateQuestion);
router.get('/stats', statsController.getQuestionStats);

module.exports = router;
