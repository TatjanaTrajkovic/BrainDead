const database = require('../connectionMySQL');

async function createSession(userId) {
  const [existing] = await database.query(
    `SELECT session_id, current_health, status
     FROM game_session
     WHERE user_id = ? AND status = 'ACTIVE'
     LIMIT 1`,
    [userId],
  );
  if (existing.length > 0) {
    return { session: existing[0], created: false };
  }

  const [result] = await database.query('INSERT INTO game_session (user_id) VALUES (?)', [userId]);

  return {
    session: { session_id: result.insertId, current_health: 1, status: 'ACTIVE' },
    created: true,
  };
}

module.exports = { createSession };
