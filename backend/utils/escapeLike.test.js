const { test } = require('node:test');
const assert = require('node:assert/strict');
const { escapeLike } = require('./escapeLike');

test('lämnar vanlig text orörd', () => {
  assert.equal(escapeLike('zombiejan'), 'zombiejan');
  assert.equal(escapeLike('Gäst-482'), 'Gäst-482');
});

test('escapar jokertecken och backslash', () => {
  assert.equal(escapeLike('anna_93'), 'anna\\_93');
  assert.equal(escapeLike('100%'), '100\\%');
  assert.equal(escapeLike('a\\b'), 'a\\\\b');
});
