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
// lämnar en fråga utan svar. Svarar i samma form som getAllQuestions.
// validateQuestion trimmar bara när den mäter, så texterna trimmas här innan de sparas
async function createQuestion(question) {
  const scenario = question.scenario.trim();
  const text = question.text.trim();
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
    for (const answer of question.answers) {
      const saved = {
        text: answer.text.trim(),
        health_change: answer.health_change,
        feedback: answer.feedback.trim(),
      };
      const [answerResult] = await connection.execute(
        'INSERT INTO answer (question_id, text, health_change, feedback) VALUES (?, ?, ?, ?)',
        [questionId, saved.text, saved.health_change, saved.feedback],
      );
      savedAnswers.push({ answer_id: answerResult.insertId, ...saved });
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

async function updateQuestion(questionId, question) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT question_id
      FROM question
      WHERE question_id = ?`,
      [questionId],
    );
    if (existing.length === 0) {
      await connection.rollback();
      return { error: 'QUESTION_NOT_FOUND' };
    }

    const [answers] = await connection.query(`SELECT answer_id FROM answer WHERE question_id = ?`, [
      questionId,
    ]);

    const existingIds = new Set(answers.map((a) => a.answer_id));
    const sentIds = new Set(question.answers.map((a) => a.answer_id));
    const sameAnswers =
      sentIds.size === existingIds.size && [...sentIds].every((id) => existingIds.has(id));
    if (!sameAnswers) {
      await connection.rollback();
      return { error: 'INVALID_ANSWER' };
    }

    await connection.query(`UPDATE question SET scenario = ?, text = ? WHERE question_id = ?`, [
      question.scenario.trim(),
      question.text.trim(),
      questionId,
    ]);
    for (const answer of question.answers) {
      await connection.query(
        `UPDATE answer
         SET text = ?, health_change = ?, feedback = ?
         WHERE answer_id = ? AND question_id = ?`,
        [
          answer.text.trim(),
          answer.health_change,
          answer.feedback.trim(),
          answer.answer_id,
          questionId,
        ],
      );
    }
    await connection.commit();
    return { question_id: Number(questionId) };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function setQuestionStatus(questionId, status) {
  const [result] = await database.query(`UPDATE question SET status = ? WHERE question_id = ?`, [
    status,
    questionId,
  ]);
  if (result.affectedRows === 0) {
    return { error: 'QUESTION_NOT_FOUND' };
  }
  return { question_id: Number(questionId), status };
}

module.exports = { getAllQuestions, createQuestion, updateQuestion, setQuestionStatus };
