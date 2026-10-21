const crypto = require('crypto');
const { promisify } = require('util');
const database = require('../connectionMySQL');

const scrypt = promisify(crypto.scrypt);

// Databasen sparar bara en hash av token, själva token finns bara i spelarens cookie.
// Läcker databasen går det alltså inte att logga in som någon annan.
// SHA-256 räcker eftersom token är slumpad och inte går att gissa, till skillnad från lösenord
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const candidate = await scrypt(password, salt, 64);
  const expectedBuffer = Buffer.from(hash, 'hex');

  if (candidate.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidate, expectedBuffer);
}

async function createGuest() {
  const token = crypto.randomUUID();
  const [result] = await database.query(
    'INSERT INTO users (is_guest, auth_token) VALUES (TRUE, ?)',
    [hashToken(token)],
  );
  return { userId: result.insertId, token };
}

async function registerUser(username, password) {
  const hashedPassword = await hashPassword(password);
  const [existing] = await database.query('SELECT user_id FROM users WHERE username = ?', [
    username,
  ]);

  if (existing.length > 0) throw new Error('Username taken');

  const [result] = await database.execute(
    'INSERT INTO users(username, password_hash) VALUES (?, ?)',
    [username, hashedPassword],
  );
  return { userId: result.insertId, username };
}

async function guestToUser(userId, username, password) {
  const hashedPassword = await hashPassword(password);
  let result;
  try {
    [result] = await database.execute(
      `UPDATE users SET username = ?, password_hash = ?, is_guest = FALSE WHERE user_id = ? AND status = ?`,
      [username, hashedPassword, userId, 'ACTIVE'],
    );
  } catch (err) {
    // Förutsätter UNIQUE-constraint på username i databasen
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('Användarnamnet är upptaget');
      e.code = 'USERNAME_TAKEN';
      throw e;
    }
    throw err;
  }
  if (result.affectedRows === 0) {
    throw new Error('Användaren är inte en gäst');
  }

  return { userId: userId, username, is_guest: false };
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

module.exports = { createGuest, findByToken, registerUser, verifyPassword, guestToUser };
