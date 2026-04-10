const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'gentlepet_db',
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // 测试连接
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('✅ 数据库连接成功:', rows);
    
    // 检查表
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📊 数据库表:', tables.map(t => Object.values(t)[0]));
    
    // 检查社区数据
    const [communities] = await pool.query('SELECT * FROM community');
    console.log('🏘️ 社区数据:', communities);
    
    await pool.end();
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
  }
}

testDB();
