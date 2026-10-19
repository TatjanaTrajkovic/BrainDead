const authService = require('../service/authService');
const { TOKEN_COOKIE } = require('../utils/authCookie');

// Översätter cookien till req.user, så att controllern vet vilken spelare som anropar.
// Ingen eller ogiltig cookie ger 401 innan controllern körs.
async function requireUser(req, res, next) {
  try {
    const token = req.cookies[TOKEN_COOKIE];
    const user = token ? await authService.findByToken(token) : null;

    if (!user) {
      return res.status(401).json({ error: 'Ingen spelare' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfel' });
  }
}

module.exports = requireUser;
