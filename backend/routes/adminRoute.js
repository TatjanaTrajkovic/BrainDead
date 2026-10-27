const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const loadUser = require('../middleware/loadUser');
const questionController = require('../controllers/questionController');
const userController = require('../controllers/userController');

router.use(loadUser(), requireAdmin);

router.get('/questions', questionController.getAllQuestions);
router.put('/questions/:questionId', questionController.updateQuestion);
router.get('/users', userController.getAllUsers);

module.exports = router;
