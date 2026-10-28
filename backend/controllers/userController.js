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

// Admin kan inte ändra sin egen roll, så det finns alltid minst en admin kvar.
// userId kontrolleras som heltal, annars läser MySQL "1abc" som 1
exports.setUserRole = async (req, res) => {
  const userId = Number(req.params.userId);
  const role = req.body?.role;

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Ogiltigt spelar-id' });
  }
  if (role !== 'PLAYER' && role !== 'ADMIN') {
    return res.status(400).json({ error: 'role måste vara PLAYER eller ADMIN' });
  }
  if (userId === req.user.user_id) {
    return res.status(400).json({ error: 'Du kan inte ändra din egen roll' });
  }

  try {
    const result = await userService.setUserRole(userId, role);
    if (result.error === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'Spelaren finns inte' });
    }
    if (result.error === 'NOT_ELIGIBLE') {
      return res.status(400).json({ error: 'Bara aktiva registrerade spelare kan få en ny roll' });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Kunde inte ändra rollen' });
  }
};
