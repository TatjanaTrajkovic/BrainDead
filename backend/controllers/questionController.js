const questionService = require('../service/questionService');
const { normalizeQuestion, validateQuestion } = require('../utils/validateQuestion');

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  const question = normalizeQuestion(req.body);

  const validationError = validateQuestion(question);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const created = await questionService.createQuestion(question);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte spara frågan' });
  }
};
