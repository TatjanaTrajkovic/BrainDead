const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// NFC gör "ä" till ett tecken, även när det skrivits som "a" + prickar.
// Annars blir samma lösenord olika hash beroende på enhet, och inloggningen misslyckas.
// Ingen trim, mellanslag kan vara en del av lösenordet
function normalizePassword(password) {
  return password.normalize('NFC');
}

// Returnerar ett felmeddelande, eller null om lösenordet är godkänt.
// Anropa med det normaliserade lösenordet
function validatePassword(password) {
  // trim bara i kontrollen, lösenordet sparas som det skrevs. Fångar t.ex. åtta mellanslag
  if (typeof password !== 'string' || password.trim().length === 0) {
    return 'Lösenordet saknas';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Lösenordet måste vara minst ${PASSWORD_MIN_LENGTH} tecken`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Lösenordet får vara max ${PASSWORD_MAX_LENGTH} tecken`;
  }
  return null;
}

module.exports = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  normalizePassword,
  validatePassword,
};
