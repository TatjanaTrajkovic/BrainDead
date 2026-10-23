// Samma regler som backend/utils/validatePassword.js, så att spelaren ser felet direkt.
// Backend kontrollerar alltid igen och är den som bestämmer. Ändras reglerna, ändra båda filerna
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Returnerar ett felmeddelande, eller null om lösenordet är godkänt
export function validatePassword(password) {
  if (password.trim().length === 0) {
    return 'Lösenordet saknas';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Minst ${PASSWORD_MIN_LENGTH} tecken`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Max ${PASSWORD_MAX_LENGTH} tecken`;
  }
  return null;
}
