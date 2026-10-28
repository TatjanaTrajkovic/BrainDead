const database = require('../connectionMySQL');
const { escapeLike } = require('../utils/escapeLike');

// Gäster blir många, så listan visar bara de nyaste. Paginering behövs först om det inte räcker
const USER_LIST_LIMIT = 100;

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

module.exports = { USER_LIST_LIMIT, TYPE_FILTERS, getAllUsers, setUserRole };
