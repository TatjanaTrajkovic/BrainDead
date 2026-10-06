require('dotenv').config();

const connectionMySQL = require('./connectionMySQL');

const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
