const authService = require('../service/authService');
const { TOKEN_COOKIE } = require('../utils/authCookie');

// loadUser({ required: true })  -> 401 om ingen giltig cookie
// loadUser({ required: false }) -> släpper igenom, req.user kan vara undefined
function loadUser({ required = true } = {}) {
  return async (req, res, next) => {
    try {
      const token = req.cookies[TOKEN_COOKIE];
      const user = token ? await authService.findByToken(token) : null;

      if (user) {
        req.user = user;
      } else if (required) {
        return res.status(401).json({ error: 'Ingen spelare' });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Serverfel' });
    }
  };
}

module.exports = loadUser;
