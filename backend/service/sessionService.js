const database = require('../connectionMySQL');

async function createSession(userId, forceNew = false) {
  const existing = await getActiveSession(userId);
  if (existing && !forceNew) {
    return { session: existing, created: false };
  }
  if (existing) {
    await database.query(
      `UPDATE game_session
       SET status = 'PAUSED', finished_at = NOW()
       WHERE session_id = ?`,
      [existing.session_id],
    );
  }
  const [result] = await database.query('INSERT INTO game_session (user_id) VALUES (?)', [userId]);
  return {
    session: { session_id: result.insertId, current_health: 100, status: 'ACTIVE' },
    created: true,
  };
}

async function getActiveSession(userId, db = database) {
  const [rows] = await db.query(
    `SELECT session_id, current_health, status, started_at
     FROM game_session
     WHERE user_id = ? AND status = 'ACTIVE'
    ORDER BY started_at DESC
     LIMIT 1`,
    [userId],
  );
  return rows.length > 0 ? rows[0] : null;
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
  const [counts] = await db.query(
    `SELECT
  (SELECT COUNT(*) FROM question WHERE status = 'ACTIVE') AS total_questions,
  (SELECT COUNT(*) FROM session_question WHERE session_id = ?) AS answered_count`,
    [sessionId],
  );

  return {
    ...question,
    answers,
    total_questions: Number(counts[0].total_questions),
    answered_count: Number(counts[0].answered_count),
  };
}

async function answerQuestion(sessionId, answerId, userId) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    // Omgången måste finnas, tillhöra spelaren och vara aktiv. En annans omgång ger samma svar
    // som en som inte finns. FOR UPDATE låser raden, så ett dubbelklick inte kan räknas två gånger.
    const [sessions] = await connection.query(
      `SELECT current_health, status
       FROM game_session
       WHERE session_id = ? AND user_id = ?
       FOR UPDATE`,
      [sessionId, userId],
    );
    if (sessions.length === 0) {
      await connection.rollback();
      return { error: 'SESSION_NOT_FOUND' };
    }
    if (sessions[0].status !== 'ACTIVE') {
      await connection.rollback();
      return { error: 'SESSION_NOT_ACTIVE' };
    }

    const question = await getNextQuestion(sessionId, connection);
    if (!question) {
      await connection.rollback();
      return { error: 'SESSION_NOT_ACTIVE' };
    }
    const [answers] = await connection.query(
      `SELECT health_change, feedback
      FROM answer
      WHERE answer_id = ? AND question_id = ?`,
      [answerId, question.question_id],
    );
    if (answers.length === 0) {
      await connection.rollback();
      return { error: 'INVALID_ANSWER' };
    }
    const answer = answers[0];

    await connection.query(
      `INSERT INTO session_question (session_id, question_id, answer_id) VALUES (?, ?, ?)`,
      [sessionId, question.question_id, answerId],
    );

    const health = Math.max(0, Math.min(100, sessions[0].current_health - answer.health_change));

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

// Hämtar en omgång, men bara om den tillhör spelaren. En annans omgång ger null (404),
// så det inte avslöjas att den finns
async function getSession(sessionId, userId) {
  const [rows] = await database.query(
    `SELECT session_id, current_health, status, started_at, finished_at
     FROM game_session
     WHERE session_id = ? AND user_id = ?`,
    [sessionId, userId],
  );
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}

module.exports = { createSession, getNextQuestion, answerQuestion, getSession, getActiveSession };
