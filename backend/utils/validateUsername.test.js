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

test('otillåtna tecken', () => {
  assert.match(validateUsername('Anna Berg'), /bara innehålla/);
  assert.match(validateUsername('Anna😀'), /bara innehålla/);
  assert.match(validateUsername('Anna!'), /bara innehålla/);
  assert.match(validateUsername('José'), /bara innehålla/);
});

test('spärrar namn som börjar på Gäst', () => {
  assert.match(validateUsername('Gäst-12'), /Gäst/);
  assert.match(validateUsername('GÄSTEN'), /Gäst/);
  assert.match(validateUsername('gäst'), /Gäst/);
  assert.equal(validateUsername('Agäst'), null);
});

test('normaliserar namnet', () => {
  assert.equal(normalizeUsername('  Åsa '), 'Åsa');
  // "a" + två prickar (två tecken) blir ett "ä"
  assert.equal(normalizeUsername('ära'), 'ära');
  assert.equal(validateUsername(normalizeUsername('ära')), null);
});
