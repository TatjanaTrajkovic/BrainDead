// LIKE tolkar % och _ som jokertecken, och \ som escape-tecken.
// Escapas de matchar sökningen bara sig själva, så att t.ex. "_" inte hittar alla
function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&');
}

module.exports = { escapeLike };
