const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedbackController');

router.get('/:answerId/feedback', feedbackController.getFeedbackByAnswerId);

module.exports = router;
