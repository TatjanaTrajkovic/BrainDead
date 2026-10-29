const userService = require('../service/userService');

// type och search är valfria. Utan dem kommer alla spelare.
// Ett okänt type, eller en parameter som skickats flera gånger, ger 400
exports.getAllUsers = async (req, res) => {
  const { type, search } = req.query;

  if (type !== undefined && !Object.hasOwn(userService.TYPE_FILTERS, type)) {
    return res.status(400).json({ error: 'type måste vara registered, guest eller banned' });
  }
  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ error: 'search måste vara en text' });
  }

  try {
    const users = await userService.getAllUsers({ type, search: search?.trim() });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta spelarna' });
  }
};

// En spelares omgångar, nyast först. En spelare utan omgångar ger [], en som inte finns ger 404
exports.getUserSessions = async (req, res) => {
  const { userId } = req.params;
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'userId måste vara ett heltal' });
  }

  try {
    const sessions = await userService.getUserSessions(Number(userId));
    if (!sessions) {
      return res.status(404).json({ error: 'Spelaren finns inte' });
    }
    res.status(200).json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta omgångarna' });
  }
};
