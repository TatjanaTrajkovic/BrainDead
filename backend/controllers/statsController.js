const statsService = require('../service/statsService');

exports.getQuestionStats = async (req, res) => {
  try {
    const stats = await statsService.getQuestionStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kunde inte hämta statistiken' });
  }
};
