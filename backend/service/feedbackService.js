const database = require('../connectionMySQL');

async function getFeedbackByAnswerId(answerId) {
  const [rows] = await database.query('SELECT feedback FROM answer WHERE answer_id = ?', [
    answerId,
  ]);

  return rows[0];
}

module.exports = { getFeedbackByAnswerId };
