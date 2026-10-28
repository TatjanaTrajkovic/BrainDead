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

exports.updateQuestion = async (req, res) => {
  const validationError = validateQuestion(req.body, { requireAnswerId: true });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const result = await questionService.updateQuestion(req.params.questionId, req.body);
    if (result.error === 'QUESTION_NOT_FOUND') {
      return res.status(404).json({ error: 'Frågan finns inte' });
    }
    if (result.error === 'INVALID_ANSWER') {
      return res.status(400).json({ error: 'Svaren hör inte till frågan' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Kunde inte uppdatera frågan' });
  }
};

exports.setQuestionStatus = async (req, res) => {
  const { status } = req.body;
  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    return res.status(400).json({ error: 'Ogiltig status' });
  }
  try {
    const result = await questionService.setQuestionStatus(req.params.questionId, status);
    if (result.error === 'QUESTION_NOT_FOUND') {
      return res.status(404).json({ error: 'Frågan finns inte' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Kunde inte ändra frågans status' });
  }
};
