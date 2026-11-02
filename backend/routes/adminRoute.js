const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const loadUser = require('../middleware/loadUser');
const questionController = require('../controllers/questionController');
const statsController = require('../controllers/statsController');
const userController = require('../controllers/userController');

router.use(loadUser(), requireAdmin);

router.get('/questions', questionController.getAllQuestions);
router.post('/questions', questionController.createQuestion);
router.put('/questions/:questionId', questionController.updateQuestion);
router.get('/stats', statsController.getQuestionStats);
router.get('/users', userController.getAllUsers);
router.patch('/users/:userId/role', userController.setUserRole);
router.patch('/questions/:questionId/status', questionController.setQuestionStatus);
router.get('/users/:userId/sessions', userController.getUserSessions);
router.patch('/users/:userId/status', userController.setBanStatus);
router.delete('/guests', userController.deleteOldGuests);

module.exports = router;
