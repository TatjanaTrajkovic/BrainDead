const authService = require('../service/authService');
const cookie = require('../utils/authCookie');

exports.createGuest = async (req, res) => {
  try {
    const existing =
      req.cookies[cookie.TOKEN_COOKIE] &&
      (await authService.findByToken(req.cookies[cookie.TOKEN_COOKIE]));
    if (existing) {
      return res.status(200).json(existing);
    }

    const { userId, token } = await authService.createGuest();
    res.cookie(cookie.TOKEN_COOKIE, token, cookie.TOKEN_COOKIE_OPTIONS);
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

// requireUser har redan hämtat spelaren från cookien, så det är bara att skicka tillbaka den
exports.getMe = (req, res) => {
  res.status(200).json(req.user);
};
