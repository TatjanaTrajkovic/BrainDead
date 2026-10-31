const database = require('../connectionMySQL');

// Dödsfall per fråga: avslutade omgångar med hälsa 0, räknade på frågan som besvarades sist.
// session_question saknar tidsstämpel, men raderna skapas i spelordning när omgången startar (#163),
// så sista svaret är det högsta session_question_id bland de besvarade raderna.
// Admins omgångar räknas inte, så att testspel inte påverkar statistiken.
// Bara omgångar som startat efter att frågan senast ändrades räknas, så att gamla och nya
// siffror inte blandas (#228).
// Frågor utan dödsfall saknas i svaret och får 0 när statistiken sätts ihop
async function getDeathsPerQuestion() {
  const [rows] = await database.query(
    `SELECT sq.question_id, COUNT(*) AS deaths
     FROM game_session gs
     JOIN users u ON u.user_id = gs.user_id
     JOIN (
       SELECT session_id, MAX(session_question_id) AS last_sq_id
       FROM session_question
       WHERE answer_id IS NOT NULL
       GROUP BY session_id
     ) AS last ON last.session_id = gs.session_id
     JOIN session_question sq ON sq.session_question_id = last.last_sq_id
     JOIN question q ON q.question_id = sq.question_id
     WHERE gs.status = 'COMPLETED' AND gs.current_health = 0
       AND u.role = 'PLAYER'
       AND gs.started_at >= q.updated_at
     GROUP BY sq.question_id`,
  );
  return rows;
}

// Alla frågor och svar, även inaktiva och ospelade, med hur många gånger varje svar valts.
// Admins val räknas inte, och inte heller val från omgångar som startade innan frågan senast
// ändrades (#228). Filtren ligger i subqueryn och i ON och inte i WHERE, annars skulle
// svar som aldrig valts försvinna i stället för att få 0
async function getAnswerCounts() {
  const [rows] = await database.query(
    `SELECT q.question_id,
            q.title,
            q.text AS question_text,
            q.position,
            q.status,
            a.answer_id,
            a.text AS answer_text,
            a.health_change,
            -- Räknar bara träffar. Ett svar utan träff har NULL här och får 0
            COUNT(pa.answer_id) AS times_chosen
     FROM question q
     JOIN answer a ON a.question_id = q.question_id
     LEFT JOIN (
       SELECT sq.answer_id, gs.started_at
       FROM session_question sq
       JOIN game_session gs ON gs.session_id = sq.session_id
       JOIN users u ON u.user_id = gs.user_id
       WHERE u.role = 'PLAYER'
     ) AS pa ON pa.answer_id = a.answer_id AND pa.started_at >= q.updated_at
     GROUP BY q.question_id, a.answer_id
     ORDER BY q.position, a.answer_id`,
  );
  return rows;
}

// Gör om de platta raderna från SQL till en fråga per objekt med svaren i en lista.
// Frågor som saknas i deathRows har inga dödsfall och får 0
function buildQuestionStats(answerRows, deathRows) {
  const deathsByQuestion = new Map();
  for (const row of deathRows) {
    deathsByQuestion.set(row.question_id, row.deaths);
  }

  const questions = new Map();
  for (const row of answerRows) {
    if (!questions.has(row.question_id)) {
      questions.set(row.question_id, {
        question_id: row.question_id,
        title: row.title,
        text: row.question_text,
        position: row.position,
        status: row.status,
        times_answered: 0,
        deaths: deathsByQuestion.get(row.question_id) ?? 0,
        answers: [],
      });
    }
    const question = questions.get(row.question_id);
    question.answers.push({
      answer_id: row.answer_id,
      text: row.answer_text,
      health_change: row.health_change,
      times_chosen: row.times_chosen,
    });
    question.times_answered += row.times_chosen;
  }

  return [...questions.values()];
}

async function getQuestionStats() {
  const [answerRows, deathRows] = await Promise.all([getAnswerCounts(), getDeathsPerQuestion()]);
  return buildQuestionStats(answerRows, deathRows);
}

module.exports = { buildQuestionStats, getQuestionStats };
