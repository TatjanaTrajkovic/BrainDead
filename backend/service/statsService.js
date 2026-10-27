const database = require('../connectionMySQL');

// Dödsfall per fråga: avslutade omgångar med hälsa 0, räknade på frågan som besvarades sist.
// session_question saknar tidsstämpel, så sista svaret är det högsta session_question_id i omgången.
// Admins omgångar räknas inte, så att testspel inte påverkar statistiken.
// Frågor utan dödsfall saknas i svaret och får 0 när statistiken sätts ihop
async function getDeathsPerQuestion() {
  const [rows] = await database.query(
    `SELECT sq.question_id, COUNT(*) AS deaths
     FROM game_session gs
     JOIN users u ON u.user_id = gs.user_id
     JOIN (
       SELECT session_id, MAX(session_question_id) AS last_sq_id
       FROM session_question
       GROUP BY session_id
     ) AS last ON last.session_id = gs.session_id
     JOIN session_question sq ON sq.session_question_id = last.last_sq_id
     WHERE gs.status = 'COMPLETED' AND gs.current_health = 0
       AND u.role = 'PLAYER'
     GROUP BY sq.question_id`,
  );
  return rows;
}

async function getAnswerCounts() {
  const [rows] = await database.query(
    `SELECT question_id, COUNT(*) AS answer_count
     FROM session_question
     GROUP BY question_id`,
  );
}

module.exports = { getDeathsPerQuestion };
