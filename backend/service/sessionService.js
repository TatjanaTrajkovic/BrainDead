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

async function getNextQuestion(sessionId, db = database) {
  const [questions] = await db.query(
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
  const [answers] = await db.query('SELECT answer_id, text FROM answer WHERE question_id = ?', [
    question.question_id,
  ]);

  return { ...question, answers };
}

async function answerQuestion(sessionId, answerId) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    // Omgången måste finnas och vara aktiv. FOR UPDATE låser raden, så ett dubbelklick
    // inte kan räknas två gånger.
    const [sessions] = await connection.query(
      `SELECT current_health
       FROM game_session
       WHERE session_id = ? AND status = 'ACTIVE'
       FOR UPDATE`,
      [sessionId],
    );
    if (sessions.length === 0) {
      await connection.rollback();
      return null;
    }

    const question = await getNextQuestion(sessionId, connection);
    if (!question) {
      await connection.rollback();
      return null;
    }
    const [answers] = await connection.query(
      `SELECT health_multiplier, feedback
      FROM answer
      WHERE answer_id = ? AND question_id = ?`,
      [answerId, question.question_id],
    );
    if (answers.length === 0) {
      await connection.rollback();
      return null;
    }
    const answer = answers[0];

    await connection.query(
      `INSERT INTO session_question (session_id, question_id, answer_id) VALUES (?, ?, ?)`,
      [sessionId, question.question_id, answerId],
    );

    // Aldrig över 1.00, avrundat till två decimaler
    const health = Math.min(
      1,
      Math.round(Number(sessions[0].current_health) * Number(answer.health_multiplier) * 100) / 100,
    );

    // Slut när hälsan är 0 eller när det inte finns fler frågor
    const nextQuestion = health > 0 ? await getNextQuestion(sessionId, connection) : null;
    const finished = nextQuestion === null;
    const status = finished ? 'COMPLETED' : 'ACTIVE';

    await connection.query(
      `UPDATE game_session
       SET current_health = ?, status = ?,
           finished_at = CASE WHEN ? = 1 THEN NOW() ELSE NULL END
       WHERE session_id = ?`,
      [health, status, finished ? 1 : 0, sessionId],
    );

    await connection.commit();

    return {
      session: { session_id: Number(sessionId), current_health: health, status },
      feedback: answer.feedback,
      next_question: nextQuestion,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { createSession, getNextQuestion, answerQuestion };
