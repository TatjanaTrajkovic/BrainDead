require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
// Port och frontend-adress läses från .env. Fallback gör att det fungerar lokalt utan ändringar
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

const cookieParser = require('cookie-parser');

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

app.listen(port, () => {
  console.log(`The Brain Deads are listening on backend port ${port}`);
});
