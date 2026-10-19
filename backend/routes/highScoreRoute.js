const express = require('express');
const router = express.Router();
const highScoreController = require('../controllers/highScoreController');

router.get('/highscores', highScoreController.getHighScores);

module.exports = router;
