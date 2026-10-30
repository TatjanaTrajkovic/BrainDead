const database = require('../connectionMySQL');
const { escapeLike } = require('../utils/escapeLike');

// Gäster blir många, så listan visar bara de nyaste. Paginering behövs först om det inte räcker
const USER_LIST_LIMIT = 100;

// Så gammal måste en gäst vara för att räknas som gammal och kunna rensas
const GUEST_MAX_AGE_DAYS = 30;

const TYPE_FILTERS = {
  registered: 'u.is_guest = FALSE',
  guest: 'u.is_guest = TRUE',
  banned: `u.status = 'BANNED'`,
};

// Spelarlistan för admin, nyast först. Kolumnerna väljs en och en,
// så att password_hash och auth_token aldrig följer med.
// best_score följer samma regel som topplistan: bästa avslutade omgång med hälsa över 0.
// Sökningen går mot display_name, så att gäster går att hitta som "Gäst-<id>"
async function getAllUsers({ type, search } = {}) {
  const conditions = [];
  const params = [];

  if (type) {
    conditions.push(TYPE_FILTERS[type]);
  }
  if (search) {
    conditions.push(`COALESCE(u.username, CONCAT('Gäst-', u.user_id)) LIKE ?`);
    params.push(`%${escapeLike(search)}%`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await database.query(
    `SELECT u.user_id,
            COALESCE(u.username, CONCAT('Gäst-', u.user_id)) AS display_name,
            u.role,
            u.status,
            u.is_guest,
            u.created_at,
            COUNT(gs.session_id) AS session_count,
            MAX(CASE WHEN gs.status = 'COMPLETED' AND gs.current_health > 0
                     THEN gs.current_health END) AS best_score
     FROM users u
     LEFT JOIN game_session gs ON gs.user_id = u.user_id
     ${where}
     GROUP BY u.user_id
     ORDER BY u.created_at DESC, u.user_id DESC
     LIMIT ?`,
    [...params, USER_LIST_LIMIT],
  );

  return rows.map((row) => ({
    ...row,
    is_guest: Boolean(row.is_guest),
    session_count: Number(row.session_count),
  }));
}

// Villkoren ligger i UPDATE, så att en spelare som bannas samtidigt inte hinner bli admin.
// Matchar ingen rad avgör en SELECT om spelaren saknas eller är gäst, bannad eller inaktiv
async function setUserRole(userId, role) {
  const [result] = await database.query(
    `UPDATE users SET role = ? WHERE user_id = ? AND is_guest = FALSE AND status = 'ACTIVE'`,
    [role, userId],
  );
  if (result.affectedRows === 0) {
    const [rows] = await database.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
    return { error: rows.length === 0 ? 'USER_NOT_FOUND' : 'NOT_ELIGIBLE' };
  }
  return { user_id: Number(userId), role };
}

// En spelares omgångar för admin, nyast först. null om spelaren inte finns.
// Omgången får en rad i session_question per fråga när den startar (#163), så
// total_questions är antalet rader och answered_count de besvarade. Siffrorna ändras
// därför inte i efterhand när frågor läggs till eller inaktiveras
async function getUserSessions(userId) {
  const [users] = await database.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
  if (users.length === 0) {
    return null;
  }

  // COUNT(sq.answer_id) räknar bara besvarade rader, eftersom NULL inte räknas
  const [rows] = await database.query(
    `SELECT gs.session_id,
            gs.started_at,
            gs.finished_at,
            gs.status,
            gs.current_health,
            COUNT(sq.answer_id) AS answered_count,
            COUNT(sq.session_question_id) AS total_questions
     FROM game_session gs
     LEFT JOIN session_question sq ON sq.session_id = gs.session_id
     WHERE gs.user_id = ?
     GROUP BY gs.session_id
     ORDER BY gs.started_at DESC, gs.session_id DESC`,
    [userId],
  );

  return rows.map((row) => ({
    ...row,
    answered_count: Number(row.answered_count),
    total_questions: Number(row.total_questions),
  }));
}

// Vid bann blir auth_token NULL i samma UPDATE. findByToken släpper bara igenom ACTIVE,
// men utan NULL skulle en gammal cookie fungera igen när spelaren avbannas.
// role = 'PLAYER' ligger i UPDATE, så att en spelare som blir admin samtidigt inte bannas
async function setBanStatus(userId, status) {
  const [result] = await database.query(
    `UPDATE users
     SET status = ?,
         auth_token = IF(? = 'BANNED', NULL, auth_token)
     WHERE user_id = ? AND is_guest = FALSE AND role = 'PLAYER'`,
    [status, status, userId],
  );
  if (result.affectedRows === 0) {
    const [rows] = await database.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
    return { error: rows.length === 0 ? 'USER_NOT_FOUND' : 'NOT_ELIGIBLE' };
  }
  return { user_id: Number(userId), status };
}

// Gäster äldre än 30 dagar utan omgångar raderas. game_session pekar på users,
// så en gäst med omgångar går inte att radera, och NOT EXISTS hoppar över dem.
// Kontrollen och raderingen är samma DELETE, så ingen gäst hinner starta en omgång mellan dem
async function deleteOldGuests() {
  const [result] = await database.query(
    `DELETE FROM users
     WHERE is_guest = TRUE
       AND created_at < NOW() - INTERVAL ${GUEST_MAX_AGE_DAYS} DAY
       AND NOT EXISTS (SELECT 1 FROM game_session gs WHERE gs.user_id = users.user_id)`,
  );
  return result.affectedRows;
}

module.exports = {
  USER_LIST_LIMIT,
  TYPE_FILTERS,
  getAllUsers,
  setUserRole,
  getUserSessions,
  setBanStatus,
  deleteOldGuests,
};
