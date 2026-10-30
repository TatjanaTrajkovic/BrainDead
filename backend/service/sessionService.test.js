const { test } = require('node:test');
const assert = require('node:assert/strict');

// Byter ut databasen mot en låtsasdatabas. sessionRow är omgången som getSession hittar
// (null = ingen omgång), reviewRows är raderna som genomgångens SQL ger.
// Måste ligga före require av sessionService
let sessionRow = null;
let reviewRows = [];
const sentQueries = [];
require.cache[require.resolve('../connectionMySQL')] = {
  exports: {
    query: async (sql) => {
      sentQueries.push(sql);
      if (sql.includes('FROM game_session')) {
        return [sessionRow ? [sessionRow] : []];
      }
      if (sql.includes('COUNT(*)')) {
        return [[{ total_questions: 10 }]];
      }
      return [reviewRows];
    },
  },
};

const { getSessionReview } = require('./sessionService');

// En rad per svar, som SQL:en ger dem
function row(questionId, chosenAnswerId, answerId, healthChange) {
  return {
    question_id: questionId,
    scenario: `Scenario ${questionId}`,
    question_text: `Fråga ${questionId}`,
    chosen_answer_id: chosenAnswerId,
    answer_id: answerId,
    answer_text: `Svar ${answerId}`,
    health_change: healthChange,
    feedback: `Feedback ${answerId}`,
  };
}

test('en annans omgång, eller en som inte finns, ger SESSION_NOT_FOUND', async () => {
  sessionRow = null;
  assert.deepEqual(await getSessionReview(1, 2), { error: 'SESSION_NOT_FOUND' });
});

test('en omgång som inte är avslutad ger SESSION_NOT_COMPLETED', async () => {
  for (const status of ['ACTIVE', 'PAUSED']) {
    sessionRow = { session_id: 1, current_health: 70, status };
    assert.deepEqual(await getSessionReview(1, 2), { error: 'SESSION_NOT_COMPLETED' });
  }
});

test('svaren grupperas per fråga och bästa svaret markeras', async () => {
  sessionRow = { session_id: 1, current_health: 70, status: 'COMPLETED' };
  reviewRows = [
    // Fråga 1: spelaren valde 2 (drar 10), bäst är 1 (drar 0)
    row(1, 2, 1, 0),
    row(1, 2, 2, 10),
    row(1, 2, 3, 20),
    row(1, 2, 4, 25),
    // Fråga 6: två svar drar 0, spelaren valde det andra av dem
    row(6, 22, 21, 0),
    row(6, 22, 22, 0),
    row(6, 22, 23, 20),
    row(6, 22, 24, 30),
  ];

  const review = await getSessionReview(1, 2);

  assert.equal(review.total_questions, 10);
  assert.equal(review.questions.length, 2);

  const [first, sixth] = review.questions;
  assert.equal(first.text, 'Fråga 1');
  assert.equal(first.chosen_answer_id, 2);
  assert.equal(first.is_correct, false);
  assert.deepEqual(
    first.answers.map((a) => a.is_best),
    [true, false, false, false],
  );
  assert.deepEqual(first.answers[1], {
    answer_id: 2,
    text: 'Svar 2',
    health_change: 10,
    feedback: 'Feedback 2',
    is_best: false,
  });

  assert.equal(sixth.is_correct, true);
  assert.deepEqual(
    sixth.answers.map((a) => a.is_best),
    [true, true, false, false],
  );
});

test('SQL:en tar bara med besvarade frågor, i den ordning de spelades', async () => {
  sessionRow = { session_id: 1, current_health: 0, status: 'COMPLETED' };
  reviewRows = [];
  const review = await getSessionReview(1, 2);
  const sql = sentQueries.find((q) => q.includes('JOIN answer'));

  assert.deepEqual(review.questions, []);
  assert.match(sql, /sq\.answer_id IS NOT NULL/);
  assert.match(sql, /ORDER BY sq\.session_question_id, a\.answer_id/);
});
