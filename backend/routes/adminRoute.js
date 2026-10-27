const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const loadUser = require('../middleware/loadUser');
const questionController = require('../controllers/questionController');

router.use(loadUser(), requireAdmin);

router.get('/questions', questionController.getAllQuestions);

module.exports = router;
