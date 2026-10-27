const { test } = require('node:test');
const assert = require('node:assert/strict');

// Byter ut databasen mot en låtsasdatabas som sparar SQL-frågan.
// Måste ligga före require av highScoreService
const sentQueries = [];
require.cache[require.resolve('../connectionMySQL')] = {
  exports: {
    query: async (sql) => {
      sentQueries.push(sql);
      return [[{ username: 'Erik', score: 80 }]];
    },
  },
};

const { getHighScores } = require('./highScoreService');

test('topplistan visar bara aktiva spelare med rollen PLAYER', async () => {
  const rows = await getHighScores();
  const sql = sentQueries.at(-1);

  assert.deepEqual(rows, [{ username: 'Erik', score: 80 }]);
  assert.match(sql, /u\.status = 'ACTIVE'/);
  assert.match(sql, /u\.role = 'PLAYER'/);
});

