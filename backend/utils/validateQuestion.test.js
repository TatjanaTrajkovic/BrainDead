const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeQuestion, validateQuestion } = require('./validateQuestion');

function answer(overrides = {}) {
  return { text: 'Springer', health_change: 10, feedback: 'Det gick bra.', ...overrides };
}

function question(overrides = {}) {
  return {
    scenario: 'Du står vid hållplatsen.',
    text: 'Vad gör du?',
    answers: [answer(), answer(), answer(), answer()],
    ...overrides,
  };
}

function check(body) {
  return validateQuestion(normalizeQuestion(body));
}

test('godkänner en giltig fråga', () => {
  assert.equal(check(question()), null);
});

test('godkänner exakt maxlängd', () => {
  assert.equal(
    check(
      question({
        scenario: 'a'.repeat(500),
        text: 'a'.repeat(255),
        answers: [
          answer({ text: 'a'.repeat(150), feedback: 'a'.repeat(500) }),
          answer(),
          answer(),
          answer(),
        ],
      }),
    ),
    null,
  );
});

test('trimmar kanterna innan längden kontrolleras', () => {
  assert.deepEqual(normalizeQuestion(question({ scenario: '  hej  ' })).scenario, 'hej');
  assert.equal(check(question({ scenario: '   ' })), 'Scenario saknas');
});

test('saknad body eller saknade fält', () => {
  assert.equal(check(undefined), 'Scenario saknas');
  assert.equal(check(question({ text: undefined })), 'Frågetext saknas');
  assert.equal(check(question({ text: 42 })), 'Frågetext saknas');
  assert.match(
    check(question({ answers: [answer({ feedback: '' }), answer(), answer(), answer()] })),
    /Svar 1: feedback saknas/,
  );
});

test('för lång text', () => {
  assert.match(check(question({ scenario: 'a'.repeat(501) })), /max 500/);
  assert.match(check(question({ text: 'a'.repeat(256) })), /max 255/);
  assert.match(
    check(question({ answers: [answer(), answer({ text: 'a'.repeat(151) }), answer(), answer()] })),
    /Svar 2: text får vara max 150/,
  );
});

test('kräver exakt 4 svar', () => {
  assert.match(check(question({ answers: [answer(), answer(), answer()] })), /exakt 4/);
  assert.match(
    check(question({ answers: [answer(), answer(), answer(), answer(), answer()] })),
    /exakt 4/,
  );
  assert.match(check(question({ answers: undefined })), /exakt 4/);
  assert.match(check(question({ answers: answer() })), /exakt 4/);
});

test('health_change måste vara ett heltal', () => {
  for (const value of [1.5, '10', null, undefined, NaN]) {
    assert.match(
      check(
        question({ answers: [answer(), answer(), answer({ health_change: value }), answer()] }),
      ),
      /Svar 3: health_change måste vara ett heltal/,
    );
  }
  assert.equal(
    check(question({ answers: [answer({ health_change: 0 }), answer(), answer(), answer()] })),
    null,
  );
});
