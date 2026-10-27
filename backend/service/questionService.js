const database = require('../connectionMySQL');

async function getAllQuestions() {
  const [rows] = await database.query(`SELECT q.question_id,
                                              q.scenario,
                                              q.text AS question_text,
                                              q.position,
                                              q.status,
                                              a.answer_id,
                                              a.text AS answer_text,
                                              a.health_change,
                                              a.feedback
                                       FROM question q
                                              LEFT JOIN answer a ON a.question_id = q.question_id
                                       ORDER BY q.position, q.question_id, a.answer_id`);

  const questions = new Map();

  for (const row of rows) {
    if (!questions.has(row.question_id)) {
      questions.set(row.question_id, {
        question_id: row.question_id,
        scenario: row.scenario,
        text: row.question_text,
        position: row.position,
        status: row.status,
        answers: [],
      });
    }
    if (row.answer_id !== null) {
      questions.get(row.question_id).answers.push({
        answer_id: row.answer_id,
        text: row.answer_text,
        health_change: row.health_change,
        feedback: row.feedback,
      });
    }
  }
  return [...questions.values()];
}

// Frågan läggs sist. Fråga och svar sparas i samma transaktion, så att ett fel aldrig
// lämnar en fråga utan svar. Svarar i samma form som getAllQuestions
async function createQuestion({ scenario, text, answers }) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    // FOR UPDATE låser frågorna, så att två admins som sparar samtidigt inte får samma position
    const [[{ maxPosition }]] = await connection.query(
      'SELECT COALESCE(MAX(position), 0) AS maxPosition FROM question FOR UPDATE',
    );
    const position = maxPosition + 1;

    const [questionResult] = await connection.execute(
      'INSERT INTO question (scenario, text, position) VALUES (?, ?, ?)',
      [scenario, text, position],
    );
    const questionId = questionResult.insertId;

    const savedAnswers = [];
    for (const answer of answers) {
      const [answerResult] = await connection.execute(
        'INSERT INTO answer (question_id, text, health_change, feedback) VALUES (?, ?, ?, ?)',
        [questionId, answer.text, answer.health_change, answer.feedback],
      );
      savedAnswers.push({ answer_id: answerResult.insertId, ...answer });
    }

    await connection.commit();

    return {
      question_id: questionId,
      scenario,
      text,
      position,
      status: 'ACTIVE',
      answers: savedAnswers,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { getAllQuestions, createQuestion };
