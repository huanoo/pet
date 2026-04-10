const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'gentlepet_db',
  charset: 'utf8mb4'
});

(async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM pets');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
