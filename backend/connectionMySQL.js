const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // DECIMAL-kolumner (t.ex. current_health) returneras som tal i stället för strängar
  decimalNumbers: true,
});

module.exports = pool;
