const authService = require('../service/authService');
const { TOKEN_COOKIE, TOKEN_COOKIE_OPTIONS } = require('../utils/authCookie');
const { normalizeUsername, validateUsername } = require('../utils/validateUsername');
const { normalizePassword, validatePassword } = require('../utils/validatePassword');

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
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
  }

  if (req.user && !req.user.is_guest) {
    return res.status(400).json({ error: 'Du är redan inloggad som registrerad användare' });
  }

  const cleanUsername = normalizeUsername(username);
  const cleanPassword = normalizePassword(password);

  const usernameError = validateUsername(cleanUsername);
  if (usernameError) {
    return res.status(400).json({ error: usernameError });
  }
  const passwordError = validatePassword(cleanPassword);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  try {
    let user;

    if (req.user) {
      // Gäst: uppgradera befintlig rad, cookien fortsätter gälla
      user = await authService.guestToUser(req.user.user_id, cleanUsername, cleanPassword);
    } else {
      // Ingen spelare: skapa ny användare och logga in direkt
      const result = await authService.registerUser(cleanUsername, cleanPassword);
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

exports.logoutUser = async (req, res) => {
  try {
    if (req.user.is_guest) {
      return res.status(400).json({ error: 'Gäster kan inte logga ut' });
    }
    await authService.logoutUser(req.user.user_id);
    res.clearCookie(TOKEN_COOKIE, { httpOnly: true, sameSite: 'lax' });
    return res.status(200).json({ message: 'Utloggad' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte logga ut' });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
  }
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = normalizePassword(password);

  try {
    const result = await authService.loginUser(cleanUsername, cleanPassword);
    // Samma svar för fel användarnamn och fel lösenord, så att det inte avslöjas vilka namn som finns
    if (!result) {
      return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
    }
    res.cookie(TOKEN_COOKIE, result.token, TOKEN_COOKIE_OPTIONS);
    return res.status(200).json(result.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte logga in' });
  }
};
