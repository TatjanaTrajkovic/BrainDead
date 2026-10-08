const questionService = require('../service/questionService');

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
