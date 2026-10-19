const crypto = require('crypto');
const database = require('../connectionMySQL');

async function createGuest() {
  const token = crypto.randomUUID();
  const [result] = await database.query(
    'INSERT INTO users (is_guest, auth_token) VALUES (TRUE, ?)',
    [token],
  );
  return { userId: result.insertId, token };
}

async function findByToken(token) {
  const [rows] = await database.query(
    'SELECT user_id, username, role, is_guest FROM users WHERE auth_token = ? AND status = ?',
    [token, 'ACTIVE'],
  );
  return rows[0] ?? null;
}

module.exports = { createGuest, findByToken };
