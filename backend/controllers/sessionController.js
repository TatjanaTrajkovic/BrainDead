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
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Ingen session hittad' });
    }
    if (session.status === 'COMPLETED') {
      return res.status(200).json({ finished: true });
    }

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
  // Body ska innehålla answerId (camelCase), samma värde som heter answer_id i svaret från /question
  const { answerId } = req.body;
  const { sessionId } = req.params;
  try {
    const result = await sessionService.answerQuestion(sessionId, answerId);
    if (result.error === 'SESSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Ingen session hittad' });
    }
    if (result.error === 'SESSION_NOT_ACTIVE') {
      return res.status(409).json({ error: 'Omgången är redan avslutad' });
    }
    if (result.error === 'INVALID_ANSWER') {
      return res.status(400).json({ error: 'Svaret hör inte till den aktuella frågan' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte spara svaret' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ error: 'Ingen session hittad' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fel vid hämtning av session' });
  }
};
