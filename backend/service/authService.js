const crypto = require('crypto');
const database = require('../connectionMySQL');

// Databasen sparar bara en hash av token, själva token finns bara i spelarens cookie.
// Läcker databasen går det alltså inte att logga in som någon annan.
// SHA-256 räcker eftersom token är slumpad och inte går att gissa, till skillnad från lösenord
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createGuest() {
  const token = crypto.randomUUID();
  const [result] = await database.query(
    'INSERT INTO users (is_guest, auth_token) VALUES (TRUE, ?)',
    [hashToken(token)],
  );
  return { userId: result.insertId, token };
}

// display_name är namnet som visas, samma som i topplistan: användarnamnet, eller Gäst-<id> för gäster
async function findByToken(token) {
  const [rows] = await database.query(
    `SELECT user_id, username, role, is_guest,
            COALESCE(username, CONCAT('Gäst-', user_id)) AS display_name
     FROM users
     WHERE auth_token = ? AND status = ?`,
    [hashToken(token), 'ACTIVE'],
  );
  return rows[0] ?? null;
}

module.exports = { createGuest, findByToken };
