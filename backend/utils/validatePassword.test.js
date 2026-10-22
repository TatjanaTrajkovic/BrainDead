const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizePassword, validatePassword } = require('./validatePassword');

// Alla tecken är tillåtna, så lösenfraser och specialtecken ska gå igenom
test('godkänner lösenfraser och specialtecken', () => {
  assert.equal(validatePassword('röd katt på taket'), null);
  assert.equal(validatePassword('a!@#$%^&*'), null);
});

// Exakt på gränsen ska gå igenom, ett tecken utanför ska stoppas
test('gränserna 8 och 128 tecken', () => {
  assert.equal(validatePassword('x'.repeat(8)), null);
  assert.match(validatePassword('x'.repeat(7)), /minst 8/);
  assert.equal(validatePassword('x'.repeat(128)), null);
  assert.match(validatePassword('x'.repeat(129)), /max 128/);
});

// Bara blanktecken räknas som inget lösenord, men mellanslag runt riktiga tecken är okej
test('saknat lösenord eller bara blanktecken', () => {
  assert.equal(validatePassword(''), 'Lösenordet saknas');
  assert.equal(validatePassword(undefined), 'Lösenordet saknas');
  assert.equal(validatePassword(42), 'Lösenordet saknas');
  assert.equal(validatePassword('        '), 'Lösenordet saknas');
  assert.equal(validatePassword(' \t\n     '), 'Lösenordet saknas');
  assert.equal(validatePassword('  hemligt  '), null);
});

// .normalize('NFD') istället för att klistra in tecknen, formerna ser likadana ut i editorn
test('normaliserar lösenordet', () => {
  // "a" + ring ovanför (två tecken) blir ett "å"
  assert.equal(normalizePassword('å'.normalize('NFD')), 'å'.normalize('NFC'));
  // Ingen trim, mellanslagen är en del av lösenordet
  assert.equal(normalizePassword('  hej  '), '  hej  ');
  // 8 tecken innan normalisering men bara 4 efter, därför valideras det normaliserade
  const decomposed = 'å'.normalize('NFD').repeat(4);
  assert.equal(validatePassword(decomposed), null);
  assert.match(validatePassword(normalizePassword(decomposed)), /minst 8/);
});
