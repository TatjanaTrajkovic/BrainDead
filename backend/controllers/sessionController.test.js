const { test } = require('node:test');
const assert = require('node:assert/strict');

// Byter ut sessionService mot en låtsasversion som minns om den anropades.
// Måste ligga före require av sessionController
let createCalled = false;
require.cache[require.resolve('../service/sessionService')] = {
  exports: {
    createSession: async () => {
      createCalled = true;
      return { session: { session_id: 1 }, created: true };
    },
  },
};

const { createSession } = require('./sessionController');

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
