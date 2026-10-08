const database = require('../connectionMySQL');

async function getAllQuestions() {
  const [rows] = await database.query('SELECT * FROM question');
  return rows;
}

module.exports = { getAllQuestions };
