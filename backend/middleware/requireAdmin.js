function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Ingen spelare' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Kräver admin' });
  }
  next();
}

module.exports = requireAdmin;
