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
