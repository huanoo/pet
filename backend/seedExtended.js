const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'gentlepet_db',
      charset: 'utf8mb4',
      multipleStatements: true // 允许执行多条 SQL 语句
    });

    console.log('✅ 数据库连接成功');

    // 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, 'seed_data_extended.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // 分割 SQL 语句并执行
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      try {
        await connection.execute(statement + ';');
      } catch (err) {
        // 忽略重复键错误
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  跳过重复数据: ${err.message.substring(0, 100)}...`);
        } else {
          console.error(`❌ 执行 SQL 失败: ${err.message}`);
        }
      }
    }

    console.log('\n✅ 扩展数据插入完成！');

    // 验证数据
    console.log('\n📊 各表数据量统计：');
    const tables = [
      'community',
      'users',
      'pets',
      'announcements',
      'violation_types',
      'pet_civilization_score',
      'pet_violation_records',
      'community_civilization_score',
      'map_layers',
      'map_markers'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${rows[0].count} 条记录`);
      } catch (err) {
        console.log(`  ${table}: 查询失败 (${err.message})`);
      }
    }

  } catch (err) {
    console.error('❌ 数据库操作失败:', err.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行种子脚本
seedDatabase();
