const { rateLimit } = require('express-rate-limit');

// Bromsar den som gissar lösenord: max 10 misslyckade inloggningar per IP på 15 minuter
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'För många inloggningsförsök, prova igen om en stund.' },
});
