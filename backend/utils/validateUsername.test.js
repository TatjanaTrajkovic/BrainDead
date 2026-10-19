const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeUsername, validateUsername } = require('./validateUsername');

test('godkänner vanliga namn', () => {
  assert.equal(validateUsername('Erik'), null);
  assert.equal(validateUsername('Åsa-Öberg'), null);
  assert.equal(validateUsername('anna_93'), null);
});

test('godkänner exakt 3 och exakt 11 tecken', () => {
  assert.equal(validateUsername('Ola'), null);
  assert.equal(validateUsername('MMMMMMMMMMM'), null);
});

test('saknat eller tomt namn', () => {
  assert.equal(validateUsername(''), 'Användarnamn saknas');
  assert.equal(validateUsername(undefined), 'Användarnamn saknas');
  assert.equal(validateUsername(42), 'Användarnamn saknas');
});

test('för kort eller för långt', () => {
  assert.match(validateUsername('ab'), /minst 3/);
  assert.match(validateUsername('MMMMMMMMMMMM'), /max 11/);
});
