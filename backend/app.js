require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const cookieParser = require('cookie-parser');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const questionRoute = require('./routes/questionRoute');
const sessionRoute = require('./routes/sessionRoute');
const highScoreRoute = require('./routes/highScoreRoute');

app.use('/admin', questionRoute);
app.use('/api', sessionRoute);
app.use('/api', highScoreRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
