require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
// Port och frontend-adress läses från .env. Fallback gör att det fungerar lokalt utan ändringar
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const path = require('path');

const cookieParser = require('cookie-parser');

app.set('trust proxy', 1);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionRoute = require('./routes/sessionRoute');
const highScoreRoute = require('./routes/highScoreRoute');
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/api/admin', adminRoute);
app.use('/api', sessionRoute);
app.use('/api', highScoreRoute);
app.use('/api', authRoute);

// I produktion serverar backend den byggda frontenden, så allt ligger på samma adress
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));
// Vue Router använder vanliga sökvägar (/admin, /game), så alla sidor som inte är API får index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`The Brain Deads are listening on backend port ${port}`);
});
