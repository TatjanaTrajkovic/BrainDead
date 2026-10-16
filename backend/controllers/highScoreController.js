const highScoreService = require('../service/highScoreService');

// En tom topplista är inget fel, så svaret är 200 med [] och inte 404
exports.getHighScores = async (req, res) => {
  try {
    const highScores = await highScoreService.getHighScores();
    res.status(200).json(highScores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta topplistan' });
  }
};
