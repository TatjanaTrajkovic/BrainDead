const database = require('../connectionMySQL');

// Topplistan: varje spelares bästa avslutade omgång, högst poäng först.
// Bara COMPLETED med hälsa över 0 räknas, pausade och döda omgångar visas inte.
// Gäster har inget användarnamn och visas som "Gäst-<user_id>".
// Vid lika poäng vinner den som blev klar först.
async function getHighScores() {
  const [rows] = await database.query(
    `SELECT username, score
     FROM (
       SELECT COALESCE(u.username, CONCAT('Gäst-', u.user_id)) as username,
              gs.current_health AS score,
              gs.finished_at,
              -- Numrerar varje spelares omgångar från bäst (1) till sämst
              ROW_NUMBER() OVER (
                PARTITION BY gs.user_id
                ORDER BY gs.current_health DESC, gs.finished_at ASC
              ) AS rn
       FROM game_session gs
       JOIN users u ON u.user_id = gs.user_id
       WHERE gs.status = 'COMPLETED' AND gs.current_health > 0
     ) best
     WHERE rn = 1
     ORDER BY score DESC, finished_at ASC
     LIMIT 10`,
  );
  return rows;
}

module.exports = { getHighScores };
