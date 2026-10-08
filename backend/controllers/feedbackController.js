const feedbackService = require('../service/feedbackService');

exports.getFeedbackByAnswerId = async (req, res) => {
  try {
    const answerId = Number(req.params.answerId);

    if (!Number.isInteger(answerId) || answerId <= 0) {
      return res.status(400).json({
        message: 'Ogiltigt svar-ID',
      });
    }

    const result = await feedbackService.getFeedbackByAnswerId(answerId);

    if (!result) {
      return res.status(404).json({
        message: 'Ingen feedback hittades',
      });
    }

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({
      message: 'Kunde inte hämta feedback',
    });
  }
};
