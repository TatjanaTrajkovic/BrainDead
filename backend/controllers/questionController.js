const questionService = require('../service/questionService');
const { validateQuestion } = require('../utils/validateQuestion');

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Serverfel' });
  }
};

exports.createQuestion = async (req, res) => {
  const validationError = validateQuestion(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const created = await questionService.createQuestion(req.body);
    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Kunde inte spara frågan' });
  }
};
