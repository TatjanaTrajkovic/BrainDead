const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateQuestion } = require('./validateQuestion');

function answer(overrides = {}) {
  return { text: 'Springer', health_change: 10, feedback: 'Det gick bra.', ...overrides };
}

function question(overrides = {}) {
  return {
    title: 'Hållplatsen',
    scenario: 'Du står vid hållplatsen.',
    text: 'Vad gör du?',
    answers: [answer(), answer(), answer(), answer()],
    ...overrides,
  };
}

function withAnswer(index, overrides) {
  const answers = [answer(), answer(), answer(), answer()];
  answers[index] = answer(overrides);
  return question({ answers });
}

test('godkänner en giltig fråga', () => {
  assert.equal(validateQuestion(question()), null);
});

test('godkänner exakt maxlängd', () => {
  assert.equal(
    validateQuestion(
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

test('längden räknas efter trim', () => {
  assert.equal(validateQuestion(question({ scenario: `  ${'a'.repeat(500)}  ` })), null);
  assert.equal(validateQuestion(question({ scenario: '   ' })), 'Scenariot saknas');
});

test('saknad body eller saknade fält', () => {
  assert.equal(validateQuestion(undefined), 'Fråga saknas');
  assert.equal(validateQuestion(question({ text: undefined })), 'Frågetexten saknas');
  assert.equal(validateQuestion(question({ text: 42 })), 'Frågetexten saknas');
  assert.equal(validateQuestion(question({ answers: undefined })), 'Svar saknas');
  assert.equal(validateQuestion(withAnswer(0, { feedback: '' })), 'Svar 1: feedback saknas');
});

test('för lång text', () => {
  assert.match(validateQuestion(question({ scenario: 'a'.repeat(501) })), /max 500/);
  assert.match(validateQuestion(question({ text: 'a'.repeat(256) })), /max 255/);
  assert.match(
    validateQuestion(withAnswer(1, { text: 'a'.repeat(151) })),
    /Svar 2: texten.*max 150/,
  );
  assert.match(
    validateQuestion(withAnswer(1, { feedback: 'a'.repeat(501) })),
    /Svar 2: feedback.*max 500/,
  );
});

test('kräver exakt 4 svar', () => {
  assert.match(validateQuestion(question({ answers: [answer(), answer(), answer()] })), /4 svar/);
  assert.match(
    validateQuestion(question({ answers: [answer(), answer(), answer(), answer(), answer()] })),
    /4 svar/,
  );
});

test('health_change måste vara ett heltal', () => {
  for (const value of [1.5, '10', null, undefined, NaN]) {
    assert.equal(
      validateQuestion(withAnswer(2, { health_change: value })),
      'Svar 3: health_change måste vara ett heltal',
    );
  }
  assert.equal(validateQuestion(withAnswer(0, { health_change: 0 })), null);
});

test('answer_id krävs bara vid redigering', () => {
  assert.equal(validateQuestion(question()), null);
  assert.equal(validateQuestion(question(), { requireAnswerId: true }), 'Svar 1: answer_id saknas');
});
