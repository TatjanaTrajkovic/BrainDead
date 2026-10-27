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

module.exports = { getAllQuestions };
