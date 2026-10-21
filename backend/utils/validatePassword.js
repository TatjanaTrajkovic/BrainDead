const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;

const ALLOWED_CHARACTERS = /^[a-zA-Z0-9åäöÅÄÖ_-]+$/;

// NFC gör "ä" till ett tecken, även när det skrivits som "a" + prickar.
// Annars blir samma lösenord olika hash beroende på enhet, och inloggningen misslyckas.
// Ingen trim, mellanslag kan vara en del av lösenordet
function normalizePassword(password) {
  return password.normalize('NFC');
}

// Returnerar ett felmeddelande, eller null om lösenordet är godkänt.
// Anropa med det normaliserade lösenordet
function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return 'Lösenordet saknas';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Lösenordet måste vara minst ${PASSWORD_MIN_LENGTH} tecken`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Lösenordet får vara max ${PASSWORD_MAX_LENGTH} tecken`;
  }
  if (!ALLOWED_CHARACTERS.test(password)) {
    return `Lösenordet får bara innehålla bokstäver, siffror, - och _`;
  }
  return null;
}

module.exports = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  ALLOWED_CHARACTERS,
  normalizePassword,
  validatePassword,
};
