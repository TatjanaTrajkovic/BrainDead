const database = require('../connectionMySQL');

// Topplistan: varje spelares bästa avslutade omgång, högst poäng först.
// Bara COMPLETED med hälsa över 0 räknas, pausade och döda omgångar visas inte.
// Bara aktiva spelare med rollen PLAYER visas, så bannade och admins syns inte.
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
          AND u.status = 'ACTIVE' AND u.role = 'PLAYER'
     ) best
     WHERE rn = 1
     ORDER BY score DESC, finished_at ASC
     LIMIT 10`,
  );
  return rows;
}

// En spelares bästa omgång. Högsta hälsa från en avslutad omgång (COMPLETED och health > 0).
// Returnerar poängen som ett Number, eller null om spelaren inte har klarat någon omgång än.
async function getUserBestScore(userId) {
  const [rows] = await database.query(
    `SELECT MAX(current_health) AS best_health
     FROM game_session
     WHERE user_id = ? AND status = 'COMPLETED' AND current_health > 0`,
    [userId],
  );
  const best = rows[0]?.best_health;
  return best != null ? Number(best) : null;
}

module.exports = { getHighScores, getUserBestScore };
