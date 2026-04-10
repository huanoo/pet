/**
 * 数据库数据插入脚本
 * 为所有表插入真实数据
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'gentlepet_db',
  charset: 'utf8mb4'
};

// 生成密码哈希
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seedDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 1. 插入社区数据
    console.log('\n📍 插入社区数据...');
    const communities = [
      [1, '阳光花园小区'],
      [2, '翠湖天地社区'],
      [3, '金色家园小区'],
      [4, '紫云苑社区'],
      [5, '绿城小区']
    ];
    for (const [id, name] of communities) {
      await connection.execute(
        'INSERT INTO community (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?',
        [id, name, name]
      );
    }
    console.log('✅ 社区数据插入完成');

    // 2. 插入用户数据
    console.log('\n👤 插入用户数据...');
    const passwordHash = await hashPassword('123456');
    const users = [
      [1, '13800138000', passwordHash, 'user', '张三', 1],
      [2, '13800138001', passwordHash, 'user', '李四', 1],
      [3, '13800138002', passwordHash, 'user', '王五', 2],
      [4, '13800138003', passwordHash, 'user', '赵六', 2],
      [5, '13800138004', passwordHash, 'user', '钱七', 3],
      [6, '13800138005', passwordHash, 'user', '孙八', 3],
      [7, '13800138006', passwordHash, 'user', '周九', 1],
      [8, '13800138007', passwordHash, 'user', '吴十', 2],
      [9, '13800138008', passwordHash, 'user', '郑十一', 3],
      [10, '13800138009', passwordHash, 'user', '陈十二', 1],
      [11, '13800138010', passwordHash, 'admin', '管理员', null],
      [12, '13800138011', passwordHash, 'user', '刘十三', 1],
      [13, '13800138012', passwordHash, 'user', '黄十四', 2],
      [14, '13800138013', passwordHash, 'user', '林十五', 3],
      [15, '13800138014', passwordHash, 'user', '何十六', 1]
    ];
    for (const user of users) {
      await connection.execute(
        `INSERT INTO users (id, tel, pwd, user_type, user_name, community_id) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE user_name = ?, community_id = ?`,
        [...user, user[4], user[5]]
      );
    }
    console.log('✅ 用户数据插入完成');

    // 3. 插入宠物数据
    console.log('\n🐾 插入宠物数据...');
    const pets = [
      [1, 1, '小白', '金毛犬', 3, '已接种', 'PET2024001', '2024-01-15', '2024-01-15 10:30:00'],
      [2, 1, '咪咪', '英短猫', 2, '已接种', 'PET2024002', '2024-02-20', '2024-02-20 14:20:00'],
      [3, 2, '旺财', '哈士奇', 4, '已接种', 'PET2024003', '2024-01-10', '2024-01-10 09:15:00'],
      [4, 3, '花花', '布偶猫', 1, '已接种', 'PET2024004', '2024-03-05', '2024-03-05 16:45:00'],
      [5, 4, '大黄', '中华田园犬', 5, '已接种', 'PET2024005', '2024-01-20', '2024-01-20 11:00:00'],
      [6, 5, '豆豆', '泰迪犬', 2, '已接种', 'PET2024006', '2024-02-10', '2024-02-10 13:30:00'],
      [7, 6, '橘子', '橘猫', 3, '已接种', 'PET2024007', '2024-03-12', '2024-03-12 15:20:00'],
      [8, 7, '黑豹', '拉布拉多', 4, '已接种', 'PET2024008', '2024-01-25', '2024-01-25 10:00:00'],
      [9, 8, '雪球', '萨摩耶', 2, '已接种', 'PET2024009', '2024-02-28', '2024-02-28 14:00:00'],
      [10, 9, '可乐', '柯基犬', 1, '已接种', 'PET2024010', '2024-03-18', '2024-03-18 09:30:00'],
      [11, 10, '布丁', '美短猫', 2, '已接种', 'PET2024011', '2024-02-15', '2024-02-15 11:45:00'],
      [12, 12, '奥利奥', '边牧', 3, '已接种', 'PET2024012', '2024-01-30', '2024-01-30 16:00:00'],
      [13, 13, '奶茶', '博美犬', 2, '已接种', 'PET2024013', '2024-02-22', '2024-02-22 10:20:00'],
      [14, 14, '年糕', '暹罗猫', 1, '已接种', 'PET2024014', '2024-03-25', '2024-03-25 14:30:00'],
      [15, 15, '汤圆', '柴犬', 3, '已接种', 'PET2024015', '2024-02-08', '2024-02-08 09:00:00']
    ];
    for (const pet of pets) {
      await connection.execute(
        `INSERT INTO pets (id, user_id, pet_name, pet_breed, pet_age, pet_vaccine, pet_cert_id, pet_register_time, create_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE pet_name = ?, pet_breed = ?`,
        [...pet, pet[2], pet[3]]
      );
    }
    console.log('✅ 宠物数据插入完成');

    // 4. 插入公告数据
    console.log('\n📢 插入公告数据...');
    const announcements = [
      [1, '关于文明养宠的温馨提示', '请各位业主文明养宠，出门遛狗请牵绳，及时清理宠物粪便，共同维护小区环境。', 1, '2024-03-15 09:00:00', '2024-03-15 09:00:00'],
      [2, '春季宠物疫苗接种通知', '春季是宠物疾病高发期，请各位宠物主人及时为宠物接种疫苗，保障宠物健康。', 1, '2024-03-10 10:30:00', '2024-03-10 10:30:00'],
      [3, '社区宠物登记开始啦', '为更好地管理社区宠物，现开展宠物登记工作，请携带宠物证件到物业登记。', 0, '2024-03-05 14:00:00', '2024-03-05 14:00:00'],
      [4, '关于禁止饲养烈性犬的通知', '根据相关规定，本社区禁止饲养烈性犬，请相关业主在7日内妥善处理。', 0, '2024-02-28 09:30:00', '2024-02-28 09:30:00'],
      [5, '宠物友好社区活动预告', '本周六上午9点将在社区广场举办宠物运动会，欢迎携带爱宠参加！', 0, '2024-03-20 16:00:00', '2024-03-20 16:00:00']
    ];
    for (const ann of announcements) {
      await connection.execute(
        `INSERT INTO announcements (id, title, content, is_top, publish_time, created_at) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE title = ?, content = ?`,
        [...ann, ann[1], ann[2]]
      );
    }
    console.log('✅ 公告数据插入完成');

    // 5. 插入违规类型数据
    console.log('\n⚠️ 插入违规类型数据...');
    const violationTypes = [
      [1, '未牵绳遛狗', 5, 1],
      [2, '未清理宠物粪便', 3, 1],
      [3, '宠物噪音扰民', 2, 1],
      [4, '未接种疫苗', 10, 1],
      [5, '无证养宠', 8, 1],
      [6, '宠物进入公共区域', 3, 1],
      [7, '宠物呕吐物未清理', 2, 1],
      [8, '违规饲养烈性犬', 20, 1],
      [9, '宠物攻击他人', 15, 1]
    ];
    for (const vt of violationTypes) {
      await connection.execute(
        `INSERT INTO violation_types (id, type_name, deduction_score, status) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE type_name = ?, deduction_score = ?`,
        [...vt, vt[1], vt[2]]
      );
    }
    console.log('✅ 违规类型数据插入完成');

    // 6. 插入宠物文明分数数据（不包含 total_score，因为它是生成的）
    console.log('\n⭐ 插入宠物文明分数数据...');
    const scores = [
      [1, 1, 1, 100, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
      [2, 2, 1, 100, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 20],
      [3, 3, 2, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
      [4, 4, 2, 100, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
      [5, 5, 3, 100, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 20],
      [6, 6, 3, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
      [7, 7, 1, 100, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
      [8, 8, 2, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
      [9, 9, 3, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
      [10, 10, 1, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20]
    ];
    for (const score of scores) {
      await connection.execute(
        `INSERT INTO pet_civilization_score 
         (id, user_id, community_id, base_score, leash_deduction, vaccine_deduction, 
          cert_deduction, feces_deduction, noise_deduction, public_area_deduction, 
          vomit_deduction, other_deduction, fierce_dog_deduction, attack_deduction, bonus_score) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         base_score = ?, bonus_score = ?, leash_deduction = ?, feces_deduction = ?`,
        [...score, score[3], score[14], score[4], score[7]]
      );
    }
    console.log('✅ 宠物文明分数数据插入完成');

    // 7. 插入违规记录数据
    console.log('\n📝 插入违规记录数据...');
    const violations = [
      [1, 1, 1, 1, 1, '2024-03-10 08:30:00', '在小区花园遛狗未牵绳', 'completed', '已教育并警告', '管理员'],
      [2, 3, 2, 1, 2, '2024-03-12 19:00:00', '未及时清理宠物粪便', 'completed', '已清理并教育', '管理员'],
      [3, 5, 4, 2, 3, '2024-03-14 22:00:00', '夜间犬吠扰民', 'pending', '', '管理员'],
      [4, 6, 5, 3, 6, '2024-03-16 15:00:00', '携带宠物进入儿童游乐场', 'completed', '已劝离', '管理员'],
      [5, 8, 7, 1, 1, '2024-03-18 07:00:00', '晨练时未牵绳', 'pending', '', '管理员']
    ];
    for (const v of violations) {
      await connection.execute(
        `INSERT INTO pet_violation_records 
         (id, pet_id, user_id, community_id, violation_type_id, violation_time, 
          violation_desc, handle_status, handle_result, handler) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         violation_desc = ?, handle_status = ?`,
        [...v, v[6], v[7]]
      );
    }
    console.log('✅ 违规记录数据插入完成');

    // 8. 插入社区文明分数数据
    console.log('\n🏘️ 插入社区文明分数数据...');
    const communityScores = [
      [1, 92.5, 93.0, 94.2, 95.0, 95.5, 96.0, 96.5, 97.0, 97.2, 97.5, 97.8, 98.0],
      [2, 88.0, 89.5, 90.0, 91.0, 92.0, 93.0, 93.5, 94.0, 94.5, 95.0, 95.2, 95.5],
      [3, 90.0, 90.5, 91.0, 92.0, 92.5, 93.0, 93.5, 94.0, 94.5, 95.0, 95.5, 96.0]
    ];
    for (const cs of communityScores) {
      await connection.execute(
        `INSERT INTO community_civilization_score 
         (community_id, month_01, month_02, month_03, month_04, month_05, month_06,
          month_07, month_08, month_09, month_10, month_11, month_12) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         month_01 = ?, month_02 = ?, month_03 = ?`,
        [...cs, cs[1], cs[2], cs[3]]
      );
    }
    console.log('✅ 社区文明分数数据插入完成');

    // 9. 插入地图图层数据
    console.log('\n🗺️ 插入地图图层数据...');
    const mapLayers = [
      [1, '推荐遛宠区（绿区）', 'safe', '[[116.397, 39.908], [116.399, 39.908], [116.399, 39.910], [116.397, 39.910]]', '#22c55e'],
      [2, '限制遛宠区（黄区）', 'warning', '[[116.396, 39.905], [116.398, 39.905], [116.398, 39.908], [116.396, 39.908]]', '#f59e0b'],
      [3, '禁止遛宠区（红区）', 'ban', '[[116.395, 39.900], [116.397, 39.900], [116.397, 39.902], [116.395, 39.902]]', '#ef4444']
    ];
    for (const ml of mapLayers) {
      await connection.execute(
        `INSERT INTO map_layers (id, name, type, path, color) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = ?, path = ?`,
        [...ml, ml[1], ml[3]]
      );
    }
    console.log('✅ 地图图层数据插入完成');

    // 10. 插入地图标记数据
    console.log('\n📍 插入地图标记数据...');
    const mapMarkers = [
      [1, '1号流浪猫安置点', 'poi', 116.397428, 39.909230, '余粮50% | 今日已投喂3次'],
      [2, '社区爱心投喂处', 'poi', 116.398500, 39.910500, '急需补粮 | 建议携带猫粮'],
      [3, '3号流浪狗投喂点', 'poi', 116.396800, 39.907800, '余粮80% | 有饮用水'],
      [4, '儿童区旁投喂点', 'poi', 116.395500, 39.904500, '禁止投喂大型犬粮'],
      [5, '发现流浪狗', 'event', 116.398000, 39.909000, '用户上报隐患'],
      [6, '宠物粪便未清理', 'event', 116.397500, 39.908500, '用户上报隐患']
    ];
    for (const mm of mapMarkers) {
      await connection.execute(
        `INSERT INTO map_markers (id, name, type, lng, lat, info) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = ?, info = ?`,
        [...mm, mm[1], mm[5]]
      );
    }
    console.log('✅ 地图标记数据插入完成');

    // 验证数据
    console.log('\n📊 验证数据插入情况:');
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
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${rows[0].count} 条记录`);
    }

    console.log('\n✅ 所有数据插入完成！');
    console.log('\n登录信息:');
    console.log('  管理员: 13800138010 / 123456');
    console.log('  普通用户: 13800138000 / 123456 (张三)');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

seedDatabase();
