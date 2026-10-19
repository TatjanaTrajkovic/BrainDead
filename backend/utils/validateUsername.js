// Längden är mätt mot ID-kortet på startsidan: 11 "M" (bredaste tecknet i Special Elite)
// är det mesta som får plats på en rad. Topplistan rymmer fler, så ID-kortet bestämmer.
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 11;

// Bara tecken vi har mätt bredden på. Emoji och t.ex. kinesiska tecken är bredare än "M"
const ALLOWED_CHARACTERS = /^[a-zA-Z0-9åäöÅÄÖ_-]+$/;

// Gäster visas som "Gäst-<user_id>" i topplistan, så ingen får se ut som en gäst
const RESERVED_PREFIX = /^gäst/iu;

// NFC gör "ä" till ett tecken, även när det skrivits som "a" + prickar.
// trim tar bort mellanslag som råkat följa med i kanterna, t.ex. vid kopiering
function normalizeUsername(username) {
  return username.normalize('NFC').trim();
}

// Returnerar ett felmeddelande, eller null om namnet är godkänt.
// Anropa med det normaliserade namnet
function validateUsername(username) {
  if (typeof username !== 'string' || username.length === 0) {
    return 'Användarnamn saknas';
  }
  if (username.length < USERNAME_MIN_LENGTH) {
    return `Användarnamnet måste vara minst ${USERNAME_MIN_LENGTH} tecken`;
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return `Användarnamnet får vara max ${USERNAME_MAX_LENGTH} tecken`;
  }
  if (!ALLOWED_CHARACTERS.test(username)) {
    return 'Användarnamnet får bara innehålla bokstäver, siffror, - och _';
  }
  if (RESERVED_PREFIX.test(username)) {
    return 'Användarnamnet får inte börja med "Gäst"';
  }
  return null;
}

module.exports = {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  normalizeUsername,
  validateUsername,
};
