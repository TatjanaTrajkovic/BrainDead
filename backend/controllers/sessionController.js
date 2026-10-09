const sessionService = require('../service/sessionService');

const testUserId = 1; // TODO: byt mot req.user.id när inloggningen finns

exports.createSession = async (req, res) => {
  try {
    const { session, created } = await sessionService.createSession(testUserId);
    res.status(created ? 201 : 200).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte starta omgången' });
  }
};

exports.getNextQuestion = async (req, res) => {
  try {
    const question = await sessionService.getNextQuestion(req.params.sessionId);
    if (!question) {
      return res.status(200).json({ finished: true });
    }
    res.status(200).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta frågan' });
  }
};

exports.answerQuestion = async (req, res) => {
  const { answerId } = req.body;
  const { sessionId } = req.params;
  try {
    const result = await sessionService.answerQuestion(sessionId, answerId);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: 'Ogiltig svar' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte spara svaret' });
  }
};
