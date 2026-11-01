const database = require('../connectionMySQL');

// En ny omgång får en rad i session_question per aktiv fråga, med answer_id = NULL.
// Omgången låser alltså sina frågor och deras ordning vid start, så att frågor som läggs till,
// inaktiveras eller flyttas efteråt bara påverkar nya omgångar (#163)
async function createSession(userId, forceNew = false) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    const existing = await getActiveSession(userId, connection);
    if (existing && !forceNew) {
      await connection.rollback();
      return { session: existing, created: false };
    }
    if (existing) {
      await connection.query(
        `UPDATE game_session
         SET status = 'PAUSED', finished_at = NOW()
         WHERE session_id = ?`,
        [existing.session_id],
      );
    }
    const [result] = await connection.query('INSERT INTO game_session (user_id) VALUES (?)', [
      userId,
    ]);
    const sessionId = result.insertId;

    // ORDER BY gör att session_question_id följer position, och det är den ordningen frågorna spelas i
    await connection.query(
      `INSERT INTO session_question (session_id, question_id)
       SELECT ?, question_id
       FROM question
       WHERE status = 'ACTIVE'
       ORDER BY position, question_id`,
      [sessionId],
    );

    await connection.commit();
    return {
      session: { session_id: sessionId, current_health: 100, status: 'ACTIVE' },
      created: true,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
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
  // Nästa obesvarade fråga bland omgångens egna. Ingen status-kontroll här: en fråga som
  // inaktiverats efter start finns kvar i omgången
  const [questions] = await db.query(
    `SELECT q.question_id, q.scenario, q.text, q.position
     FROM session_question sq
     JOIN question q ON q.question_id = sq.question_id
     WHERE sq.session_id = ? AND sq.answer_id IS NULL
     ORDER BY sq.session_question_id
     LIMIT 1`,
    [sessionId],
  );
  if (questions.length === 0) {
    return null;
  }

  const question = questions[0];
  const [answers] = await db.query(
    'SELECT answer_id, text FROM answer WHERE question_id = ? ORDER BY RAND()',
    [question.question_id],
  );
  // COUNT(answer_id) räknar bara besvarade rader, eftersom NULL inte räknas
  const [counts] = await db.query(
    `SELECT COUNT(*) AS total_questions, COUNT(answer_id) AS answered_count
     FROM session_question
     WHERE session_id = ?`,
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

    // Raden skapades när omgången startade, så svaret fylls i i stället för att läggas till
    await connection.query(
      `UPDATE session_question
       SET answer_id = ?
       WHERE session_id = ? AND question_id = ? AND answer_id IS NULL`,
      [answerId, sessionId, question.question_id],
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

// Genomgången efter en avslutad omgång (#205): varje besvarad fråga med alla svar, spelarens val
// och vilket svar som var bäst. Bara spelarens egen omgång, och bara om den är avslutad
async function getSessionReview(sessionId, userId) {
  const session = await getSession(sessionId, userId);
  if (!session) {
    return { error: 'SESSION_NOT_FOUND' };
  }
  if (session.status !== 'COMPLETED') {
    return { error: 'SESSION_NOT_COMPLETED' };
  }

  // Frågor som aldrig nåddes (hälsan tog slut) har answer_id = NULL och kommer inte med.
  // Raderna sorteras som omgången spelades, och svaren i samma ordning som i admin
  const [rows] = await database.query(
    `SELECT q.question_id, q.scenario, q.text AS question_text, sq.answer_id AS chosen_answer_id,
            a.answer_id, a.text AS answer_text, a.health_change, a.feedback
     FROM session_question sq
     JOIN question q ON q.question_id = sq.question_id
     JOIN answer a ON a.question_id = sq.question_id
     WHERE sq.session_id = ? AND sq.answer_id IS NOT NULL
     ORDER BY sq.session_question_id, a.answer_id`,
    [sessionId],
  );
  const [counts] = await database.query(
    'SELECT COUNT(*) AS total_questions FROM session_question WHERE session_id = ?',
    [sessionId],
  );

  return {
    session_id: session.session_id,
    current_health: session.current_health,
    total_questions: Number(counts[0].total_questions),
    questions: groupReviewRows(rows),
  };
}

// Gör en rad per svar till en fråga med fyra svar. Bästa svaret är det som drar minst hälsa.
// Två svar kan dra lika lite (t.ex. 0), och då är båda bäst och båda räknas som rätt
function groupReviewRows(rows) {
  const questions = [];
  for (const row of rows) {
    let question = questions.at(-1);
    if (!question || question.question_id !== row.question_id) {
      question = {
        question_id: row.question_id,
        scenario: row.scenario,
        text: row.question_text,
        chosen_answer_id: row.chosen_answer_id,
        answers: [],
      };
      questions.push(question);
    }
    question.answers.push({
      answer_id: row.answer_id,
      text: row.answer_text,
      health_change: Number(row.health_change),
      feedback: row.feedback,
    });
  }

  for (const question of questions) {
    const best = Math.min(...question.answers.map((a) => a.health_change));
    for (const answer of question.answers) {
      answer.is_best = answer.health_change === best;
    }
    question.is_correct = question.answers.some(
      (a) => a.answer_id === question.chosen_answer_id && a.is_best,
    );
  }
  return questions;
}

module.exports = {
  createSession,
  getNextQuestion,
  answerQuestion,
  getSession,
  getActiveSession,
  getSessionReview,
};
