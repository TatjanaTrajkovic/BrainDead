const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_CA_CERT ? { ca: process.env.DB_CA_CERT } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
