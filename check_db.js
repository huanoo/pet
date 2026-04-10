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
    const [petRows] = await pool.query('SELECT COUNT(*) as count FROM pets');
    console.log('Pets count:', petRows[0].count);

    const [violationRows] = await pool.query('SELECT COUNT(*) as count FROM pet_violation_records');
    console.log('Violations count:', violationRows[0].count);

    const [scoreRows] = await pool.query('SELECT AVG(total_score) as avgScore FROM pet_civilization_score');
    console.log('Avg Score:', scoreRows[0].avgScore);

    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);

  } catch (err) {
    console.error('Database Error:', err);
  } finally {
    process.exit();
  }
})();
