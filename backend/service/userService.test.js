const { test } = require('node:test');
const assert = require('node:assert/strict');

// Byter ut databasen mot en låtsasdatabas som sparar SQL-frågan.
// Måste ligga före require av userService
const sentQueries = [];
require.cache[require.resolve('../connectionMySQL')] = {
  exports: {
    query: async (sql) => {
      sentQueries.push(sql);
      return [{ affectedRows: 3 }];
    },
  },
};

const { deleteOldGuests } = require('./userService');

test('rensningen raderar bara gäster äldre än 30 dagar utan omgångar', async () => {
  const deleted = await deleteOldGuests();
  const sql = sentQueries.at(-1);

  assert.equal(deleted, 3);
  assert.match(sql, /^\s*DELETE FROM users/);
  assert.match(sql, /is_guest = TRUE/);
  assert.match(sql, /created_at < NOW\(\) - INTERVAL 30 DAY/);
  assert.match(sql, /NOT EXISTS \(SELECT 1 FROM game_session/);
});
