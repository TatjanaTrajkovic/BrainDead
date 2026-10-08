const database = require('../connectionMySQL');

async function getAllQuestions() {
  const [rows] = await database.query('SELECT * FROM questions');
  return rows;
}

module.exports = { getAllQuestions };
