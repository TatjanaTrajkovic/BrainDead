const TOKEN_COOKIE = 'braindead_token';

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript i webbläsaren kan inte läsa nyckeln
  sameSite: 'lax',
  maxAge: 365 * 24 * 60 * 60 * 1000, // ett år, så att gästen kan återuppta sin omgång
};

module.exports = { TOKEN_COOKIE, TOKEN_COOKIE_OPTIONS };
