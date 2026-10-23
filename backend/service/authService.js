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
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const candidate = await scrypt(password, salt, 64);
  const expectedBuffer = Buffer.from(hash, 'hex');

  if (candidate.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidate, expectedBuffer);
}

// username är UNIQUE i databasen, så ett upptaget namn ger ER_DUP_ENTRY.
// Det blir USERNAME_TAKEN (409), allt annat kastas vidare och blir 500
function handleDbError(err) {
  if (err.code === 'ER_DUP_ENTRY') {
    const e = new Error('Användarnamnet är upptaget');
    e.code = 'USERNAME_TAKEN';
    throw e;
  }
  throw err;
}

async function createGuest() {
  const token = crypto.randomUUID();
  const [result] = await database.query(
    'INSERT INTO users (is_guest, auth_token) VALUES (TRUE, ?)',
    [hashToken(token)],
  );
  return { userId: result.insertId, token };
}

// Ny spelare utan gäst: kontot får en token direkt, så att spelaren är inloggad
async function registerUser(username, password) {
  const hashedPassword = await hashPassword(password);
  const token = crypto.randomUUID();
  try {
    const [result] = await database.execute(
      'INSERT INTO users (username, password_hash, auth_token) VALUES (?, ?, ?)',
      [username, hashedPassword, hashToken(token)],
    );
    // Samma form som findByToken. display_name är användarnamnet, precis som COALESCE ger
    const user = {
      user_id: result.insertId,
      username,
      role: 'PLAYER',
      is_guest: false,
      display_name: username,
    };
    return { user, token };
  } catch (err) {
    handleDbError(err);
  }
}

// Gästen blir ett konto, så att poängen följer med. auth_token ligger kvar, så cookien fortsätter gälla
async function guestToUser(userId, username, password) {
  const hashedPassword = await hashPassword(password);
  try {
    await database.execute(
      `UPDATE users SET username = ?, password_hash = ?, is_guest = FALSE
       WHERE user_id = ? AND is_guest = TRUE AND status = ?`,
      [username, hashedPassword, userId, 'ACTIVE'],
    );
    return { user_id: userId, username, role: 'PLAYER', is_guest: false, display_name: username };
  } catch (err) {
    handleDbError(err);
  }
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

// Gästens omgångar flyttas till kontot, så att poängen och en pågående omgång följer med.
// Körs med loginUsers anslutning, så att allt ingår i samma transaktion
async function moveGuestSessions(connection, guestId, userId) {
  const [guestActive] = await connection.execute(
    `SELECT session_id FROM game_session WHERE user_id = ? AND status = 'ACTIVE'`,
    [guestId],
  );
  if (guestActive.length > 0) {
    await connection.execute(
      `UPDATE game_session
       SET status = 'PAUSED', finished_at = NOW()
       WHERE user_id = ? AND status = 'ACTIVE'`,
      [userId],
    );
  }

  await connection.execute('UPDATE game_session SET user_id = ? WHERE user_id = ?', [
    userId,
    guestId,
  ]);
  // Tas bort efter flytten, annars stoppar främmande nyckeln i game_session borttagningen.
  await connection.execute('DELETE FROM users WHERE user_id = ? AND is_guest = TRUE', [guestId]);
}

// null både när användarnamnet saknas och när lösenordet är fel,
// så att controllern inte kan avslöja vilka användarnamn som finns.
// Ny token vid varje inloggning, den gamla slutar gälla
async function loginUser(username, password, guestId = null) {
  const [rows] = await database.execute(
    `SELECT user_id, username, role, password_hash
     FROM users
     WHERE username = ? AND status = ? AND is_guest = FALSE`,
    [username, 'ACTIVE'],
  );
  const row = rows[0];
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return null;
  }

  const token = crypto.randomUUID();

  // Transaktionen börjar först när lösenordet är godkänt, så att ett fel lösenord
  // aldrig lämnar en påbörjad transaktion efter sig. Allt sparas tillsammans eller inte alls
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    if (guestId) {
      await moveGuestSessions(connection, guestId, row.user_id);
    }

    await connection.execute('UPDATE users SET auth_token = ? WHERE user_id = ?', [
      hashToken(token),
      row.user_id,
    ]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  // Samma form som findByToken, password_hash skickas aldrig vidare
  const user = {
    user_id: row.user_id,
    username: row.username,
    role: row.role,
    is_guest: false,
    display_name: row.username,
  };
  return { user, token };
}

// Token slutar gälla, även om någon har kvar en kopia av cookien
async function logoutUser(userId) {
  await database.execute('UPDATE users SET auth_token = NULL WHERE user_id = ?', [userId]);
}

module.exports = {
  createGuest,
  findByToken,
  registerUser,
  verifyPassword,
  guestToUser,
  loginUser,
  logoutUser,
};
