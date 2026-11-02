const { test } = require('node:test');
const assert = require('node:assert/strict');

// Byter ut sessionService mot en låtsasversion som minns om den anropades.
// Måste ligga före require av sessionController
let createCalled = false;
// Det getSessionReview ska svara i nästa test
let reviewResult = null;
require.cache[require.resolve('../service/sessionService')] = {
  exports: {
    createSession: async () => {
      createCalled = true;
      return { session: { session_id: 1 }, created: true };
    },
    getSessionReview: async () => {
      if (reviewResult instanceof Error) {
        throw reviewResult;
      }
      return reviewResult;
    },
  },
};

const { createSession, getSessionReview } = require('./sessionController');

// Enkel låtsas-res som sparar statuskod och svar
function fakeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test('admin får 403 och ingen omgång skapas', async () => {
  createCalled = false;
  const res = fakeRes();
  await createSession({ user: { user_id: 1, role: 'ADMIN' }, body: {} }, res);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: 'Admin kan inte spela' });
  assert.equal(createCalled, false);
});

test('spelare kan starta en omgång som vanligt', async () => {
  createCalled = false;
  const res = fakeRes();
  await createSession({ user: { user_id: 2, role: 'PLAYER' }, body: {} }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(createCalled, true);
});

function reviewReq() {
  return { user: { user_id: 2, role: 'PLAYER' }, params: { sessionId: '5' } };
}

test('genomgången svarar 200 med frågorna', async () => {
  reviewResult = { session_id: 5, current_health: 70, total_questions: 10, questions: [] };
  const res = fakeRes();
  await getSessionReview(reviewReq(), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, reviewResult);
});

test('genomgången av en annans omgång ger 404', async () => {
  reviewResult = { error: 'SESSION_NOT_FOUND' };
  const res = fakeRes();
  await getSessionReview(reviewReq(), res);
  assert.equal(res.statusCode, 404);
});

test('genomgången av en omgång som inte är klar ger 403', async () => {
  reviewResult = { error: 'SESSION_NOT_COMPLETED' };
  const res = fakeRes();
  await getSessionReview(reviewReq(), res);
  assert.equal(res.statusCode, 403);
});

test('databasfel i genomgången ger 500', async (t) => {
  t.mock.method(console, 'error', () => {});
  reviewResult = new Error('db nere');
  const res = fakeRes();
  await getSessionReview(reviewReq(), res);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Kunde inte hämta svaren' });
});
