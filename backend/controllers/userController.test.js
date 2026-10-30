const { test } = require('node:test');
const assert = require('node:assert/strict');

// Byter ut userService mot en låtsasversion. Måste ligga före require av userController
let deleteResult = async () => 2;
require.cache[require.resolve('../service/userService')] = {
  exports: {
    deleteOldGuests: () => deleteResult(),
  },
};

const { deleteOldGuests } = require('./userController');

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

test('rensningen svarar med antalet raderade gäster', async () => {
  deleteResult = async () => 2;
  const res = fakeRes();
  await deleteOldGuests({}, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { deleted: 2 });
});

test('inga gamla gäster ger { deleted: 0 }, inte ett fel', async () => {
  deleteResult = async () => 0;
  const res = fakeRes();
  await deleteOldGuests({}, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { deleted: 0 });
});

test('databasfel ger 500', async (t) => {
  t.mock.method(console, 'error', () => {});
  deleteResult = async () => {
    throw new Error('databasen svarar inte');
  };
  const res = fakeRes();
  await deleteOldGuests({}, res);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Kunde inte rensa gästerna' });
});