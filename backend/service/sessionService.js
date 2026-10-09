const database = require('../connectionMySQL');

async function createSession(userId) {
  const [existing] = await database.query(
    `SELECT session_id, current_health, status
     FROM game_session
     WHERE user_id = ? AND status = 'ACTIVE'
     LIMIT 1`,
    [userId],
  );
  if (existing.length > 0) {
    return { session: existing[0], created: false };
  }

  const [result] = await database.query('INSERT INTO game_session (user_id) VALUES (?)', [userId]);

  return {
    session: { session_id: result.insertId, current_health: 1, status: 'ACTIVE' },
    created: true,
  };
}

async function getNextQuestion(sessionId) {
  const [questions] = await database.query(
    `SELECT question_id, scenario, text, position
     FROM question
     WHERE status = 'ACTIVE'
       AND question_id NOT IN (
         SELECT question_id FROM session_question WHERE session_id = ?
       )
     ORDER BY position
     LIMIT 1`,
    [sessionId],
  );
  if (questions.length === 0) {
    return null;
  }

  const question = questions[0];
  const [answers] = await database.query(
    'SELECT answer_id, text FROM answer WHERE question_id = ?',
    [question.question_id],
  );

  return { ...question, answers };
}

async function answerQuestion(sessionId, answerId) {
  const question = await getNextQuestion(sessionId);
  if (!question) {
    return null;
  }
  const [answers] = await database.query(
    `SELECT health_multiplier, feedback
      FROM answer 
      WHERE answer_id = ? AND question_id = ?`,
    [answerId, question.question_id],
  );
  if (answers.length === 0) {
    return null;
  }
  const answer = answers[0];

  await database.query(
    `INSERT INTO session_question (session_id, question_id, answer_id) VALUES (?, ?, ?)`,
    [sessionId, question.question_id, answerId],
  );
}

module.exports = { createSession, getNextQuestion, answerQuestion };
