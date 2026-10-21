const authService = require('../service/authService');
// const utils = require('../utils/validateUsername');
const { TOKEN_COOKIE, TOKEN_COOKIE_OPTIONS } = require('../utils/authCookie');

exports.createGuest = async (req, res) => {
  try {
    const existing =
      req.cookies[TOKEN_COOKIE] && (await authService.findByToken(req.cookies[TOKEN_COOKIE]));
    if (existing) {
      return res.status(200).json(existing);
    }

    const { userId, token } = await authService.createGuest();
    res.cookie(TOKEN_COOKIE, token, TOKEN_COOKIE_OPTIONS);
    res.status(201).json({
      user_id: userId,
      username: null,
      role: 'PLAYER',
      is_guest: true,
      display_name: `Gäst-${userId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte skapa gäst' });
  }
};

exports.createUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
  }

  if (req.user && !req.user.is_guest) {
    return res.status(400).json({ error: 'Du är redan inloggad som registrerad användare' });
  }

  try {
    let user;

    if (req.user) {
      // Gäst: uppgradera befintlig rad, cookien fortsätter gälla
      user = await authService.guestToUser(req.user.user_id, username, password);
    } else {
      // Ingen spelare: skapa ny användare och logga in direkt
      const result = await authService.registerUser(username, password);
      res.cookie(TOKEN_COOKIE, result.token, TOKEN_COOKIE_OPTIONS);
      user = result.user;
    }

    // Samma form som /auth/guest och /auth/me, så att frontend kan lägga svaret direkt i player
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'USERNAME_TAKEN') {
      return res.status(409).json({ error: 'Användarnamnet är upptaget' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Serverfel' });
  }
};

// loadUser har redan hämtat spelaren från cookien, så det är bara att skicka tillbaka den
exports.getMe = (req, res) => {
  res.status(200).json(req.user);
};
