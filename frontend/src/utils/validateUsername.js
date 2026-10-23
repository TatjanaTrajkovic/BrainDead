// Samma regler som backend/utils/validateUsername.js, så att spelaren ser felet direkt.
// Backend kontrollerar alltid igen och är den som bestämmer. Ändras reglerna, ändra båda filerna
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 11;

const ALLOWED_CHARACTERS = /^[a-zA-Z0-9åäöÅÄÖ_-]+$/;
const RESERVED_PREFIX = /^gäst/iu;

// Returnerar ett felmeddelande, eller null om namnet är godkänt
export function validateUsername(username) {
  const name = username.normalize('NFC').trim();
  if (name.length < USERNAME_MIN_LENGTH) {
    return `Minst ${USERNAME_MIN_LENGTH} tecken`;
  }
  if (name.length > USERNAME_MAX_LENGTH) {
    return `Max ${USERNAME_MAX_LENGTH} tecken`;
  }
  if (!ALLOWED_CHARACTERS.test(name)) {
    return 'Bara bokstäver, siffror, - och _';
  }
  if (RESERVED_PREFIX.test(name)) {
    return 'Får inte börja med "Gäst"';
  }
  return null;
}
