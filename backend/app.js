const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// 导入假数据模块
const fakeData = require('./fakeData');

const app = express();
const port = process.env.PORT || 3000;

// 内存缓存机制
const cache = {
  data: {},
  expiration: {},
  
  // 设置缓存
  set(key, value, ttl = 300000) { // 默认5分钟过期
    this.data[key] = value;
    this.expiration[key] = Date.now() + ttl;
  },
  
  // 获取缓存
  get(key) {
    if (!this.data[key]) return null;
    if (Date.now() > this.expiration[key]) {
      delete this.data[key];
      delete this.expiration[key];
      return null;
    }
    return this.data[key];
  },
  
  // 清除缓存
  clear(key) {
    if (key) {
      delete this.data[key];
      delete this.expiration[key];
    } else {
      this.data = {};
      this.expiration = {};
    }
  }
};

const difyBaseUrl = (process.env.DIFY_API_BASE_URL || 'https://api.dify.ai/v1').replace(/\/+$/, '');
// 【重要】如果你没有配置环境变量，请将你的 API Key 直接填在下面引号里
// 例如：const difyApiKey = process.env.DIFY_API_KEY || 'app-xxxxxxxxxxxxxxxx';
const difyApiKey = process.env.DIFY_API_KEY || 'app-M3XHYWs6oYTs5t1eGXk0B7Jl';

if (!difyApiKey) {
    console.warn('\n⚠️  警告：未配置 DIFY_API_KEY，智能体功能将不可用！');
    console.warn('   请在 backend/app.js 第 13 行填入你的 Key，或者设置环境变量。\n');
}

// 增加请求体大小限制
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // 托管前端静态文件


// 关键修复：允许所有来源跨域，解决开发环境连接问题
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// 数据库连接池
let pool;
let dbConnected = false;

// 解析 DATABASE_URL 环境变量
let poolConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '123456',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || (process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'gentlepet_db'),
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 10000,
  idleTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// 检查是否存在 DATABASE_URL 环境变量
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    poolConfig = {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // 移除开头的 "/"
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      connectTimeout: 10000,
      idleTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    };
  } catch (e) {
    console.warn('⚠️ 解析 DATABASE_URL 失败，使用默认配置');
  }
}

try {
  pool = mysql.createPool(poolConfig);
  // 测试连接
  (async () => {
    try {
      const connection = await pool.getConnection();
      connection.release();
      dbConnected = true;
      console.log('✅ 数据库连接池初始化成功');
    } catch (err) {
      console.log('⚠️ 数据库连接失败，将使用假数据模式');
      dbConnected = false;
    }
  })();
} catch (err) {
  console.log('⚠️ 数据库连接失败，将使用假数据模式');
  dbConnected = false;
}

// 初始化表结构（仅在数据库连接成功时执行）
if (pool) {
  (async () => {
    try {
      // 1. 社区表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS community (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. 用户表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          tel VARCHAR(20) NOT NULL UNIQUE,
          password VARCHAR(100) NOT NULL,
          user_type VARCHAR(10) NOT NULL DEFAULT 'user',
          community_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (community_id) REFERENCES community(id)
        )
      `);

      // 3. 公告表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          is_top BOOLEAN DEFAULT 0,
          publish_time DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 4. 地图相关表 (新增)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS map_layers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL COMMENT 'safe, warning, ban',
          path JSON NOT NULL,
          color VARCHAR(20) DEFAULT '#3b82f6',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS map_markers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL COMMENT 'poi, event',
          lng DECIMAL(10, 6) NOT NULL,
          lat DECIMAL(10, 6) NOT NULL,
          info TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS pet_hospitals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          address VARCHAR(255),
          tel VARCHAR(50),
          lng DECIMAL(10, 6) NOT NULL,
          lat DECIMAL(10, 6) NOT NULL,
          opening_hours VARCHAR(100)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS pet_shops (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          address VARCHAR(255),
          tel VARCHAR(50),
          lng DECIMAL(10, 6) NOT NULL,
          lat DECIMAL(10, 6) NOT NULL,
          opening_hours VARCHAR(100),
          category VARCHAR(50)
        )
      `);

      // 预置默认地图数据 (仅首次运行)
      const [layerCheck] = await pool.query('SELECT COUNT(*) as count FROM map_layers');
      if (layerCheck[0].count === 0) {
        await pool.query(`
          INSERT INTO map_layers (name, type, path, color) VALUES 
          ('推荐遛宠区（绿区）', 'safe', '[[116.397, 39.908], [116.399, 39.908], [116.399, 39.910], [116.397, 39.910]]', '#22c55e'),
          ('限制遛宠区（黄区）', 'warning', '[[116.396, 39.905], [116.398, 39.905], [116.398, 39.908], [116.396, 39.908]]', '#f59e0b'),
          ('禁止遛宠区（红区）', 'ban', '[[116.395, 39.900], [116.397, 39.900], [116.397, 39.902], [116.395, 39.902]]', '#ef4444')
        `);
        await pool.query(`
          INSERT INTO map_markers (name, type, lng, lat, info) VALUES 
          ('1号流浪猫安置点', 'poi', 116.397428, 39.909230, '余粮50% | 今日已投喂3次'),
          ('社区爱心投喂处', 'poi', 116.398500, 39.910500, '急需补粮 | 建议携带猫粮'),
          ('3号流浪狗投喂点', 'poi', 116.396800, 39.907800, '余粮80% | 有饮用水'),
          ('儿童区旁投喂点', 'poi', 116.395500, 39.904500, '禁止投喂大型犬粮')
        `);

        // 初始化宠物医院
        const hospitals = fakeData.getPetHospitals();
        for (const h of hospitals) {
          await pool.query(
            'INSERT INTO pet_hospitals (name, address, tel, lng, lat, opening_hours) VALUES (?, ?, ?, ?, ?, ?)',
            [h.name, h.address, h.tel, h.lng, h.lat, h.opening_hours]
          );
        }

        // 初始化宠物商店
        const shops = fakeData.getPetShops();
        for (const s of shops) {
          await pool.query(
            'INSERT INTO pet_shops (name, address, tel, lng, lat, opening_hours, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [s.name, s.address, s.tel, s.lng, s.lat, s.opening_hours, s.category]
          );
        }
        console.log('🗺️ 地图数据初始化完成');
      }

      // 5. 宠物表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          pet_name VARCHAR(50) NOT NULL,
          pet_breed VARCHAR(50),
          pet_age VARCHAR(20),
          pet_vaccine VARCHAR(20),
          pet_cert_id VARCHAR(100),
          pet_register_time DATETIME,
          pet_avatar VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // 6. 宠物文明分表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pet_civilization_score (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          community_id INT,
          base_score DECIMAL(5,2) DEFAULT 100.00,
          bonus_score DECIMAL(5,2) DEFAULT 0.00,
          leash_deduction DECIMAL(5,2) DEFAULT 0.00,
          vaccine_deduction DECIMAL(5,2) DEFAULT 0.00,
          cert_deduction DECIMAL(5,2) DEFAULT 0.00,
          feces_deduction DECIMAL(5,2) DEFAULT 0.00,
          noise_deduction DECIMAL(5,2) DEFAULT 0.00,
          public_area_deduction DECIMAL(5,2) DEFAULT 0.00,
          vomit_deduction DECIMAL(5,2) DEFAULT 0.00,
          fierce_dog_deduction DECIMAL(5,2) DEFAULT 0.00,
          attack_deduction DECIMAL(5,2) DEFAULT 0.00,
          other_deduction DECIMAL(5,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (community_id) REFERENCES community(id)
        )
      `);

      // 7. 违规记录表
      await pool.query(`
        CREATE TABLE IF NOT EXISTS violations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          community_id INT,
          type VARCHAR(50) NOT NULL,
          description TEXT,
          deduction DECIMAL(5,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (community_id) REFERENCES community(id)
        )
      `);

      // 初始化默认社区数据
      const [communityCheck] = await pool.query('SELECT COUNT(*) as count FROM community');
      if (communityCheck[0].count === 0) {
        await pool.query(`
          INSERT INTO community (name) VALUES 
          ('阳光花园小区'),
          ('翠湖天地社区'),
          ('金色家园小区'),
          ('紫云苑社区'),
          ('绿城小区')
        `);
        console.log('🏘️ 社区数据初始化完成');
      }

      // 初始化默认管理员账号
      const [adminCheck] = await pool.query('SELECT COUNT(*) as count FROM users WHERE user_type = ?', ['admin']);
      if (adminCheck[0].count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
          'INSERT INTO users (name, tel, password, user_type, community_id) VALUES (?, ?, ?, ?, ?)',
          ['管理员', '12345678900', hashedPassword, 'admin', 1]
        );
        console.log('👤 管理员账号初始化完成');
      }

      dbConnected = true;
      console.log('✅ 数据库表结构检查完成');
    } catch (err) {
      console.error('❌ 初始化表结构失败:', err);
      console.log('⚠️ 将使用假数据模式运行');
      dbConnected = false;
    }
  })();
}

const encryptPwd = pwd => bcrypt.hash(pwd, 10);
const verifyPwd = (p, e) => bcrypt.compare(p, e);

// --- 中间件 ---
const checkLogin = (req, res, next) => {
  // 1. 尝试从 Cookie 获取
  let state = req.cookies.loginState;
  
  // 2. 尝试从 Header 获取 (兼容无 Cookie 环境)
  if (!state && req.headers['x-auth-token']) {
    try {
      // 支持直接传 JSON 字符串或 Base64
      const token = req.headers['x-auth-token'];
      state = token.startsWith('{') ? token : Buffer.from(token, 'base64').toString();
    } catch (e) {}
  }

  if (!state) return res.json({ code: 401, msg: '未登录' });
  
  try {
    req.user = typeof state === 'string' ? JSON.parse(state) : state;
    next();
  } catch (e) {
    return res.json({ code: 401, msg: '登录失效' });
  }
};

const checkAdmin = (req, res, next) => {
  if (req.user && req.user.type === 'admin') {
    next();
  } else {
    res.json({ code: 403, msg: '无权访问' });
  }
};

// --- 工具函数 ---

/**
 * 根据违规类型名称映射到扣分列名
 */
const getDeductionColumn = (typeName) => {
  if (typeName.includes('绳')) return 'leash_deduction';
  if (typeName.includes('疫苗')) return 'vaccine_deduction';
  if (typeName.includes('证')) return 'cert_deduction';
  if (typeName.includes('便')) return 'feces_deduction';
  if (typeName.includes('噪')) return 'noise_deduction';
  if (typeName.includes('公共')) return 'public_area_deduction';
  if (typeName.includes('呕')) return 'vomit_deduction';
  if (typeName.includes('烈')) return 'fierce_dog_deduction';
  if (typeName.includes('攻')) return 'attack_deduction';
  return 'other_deduction';
};

/**
 * 初始化用户养宠文明分记录（如果不存在）
 */
const initPetScoreRecord = async (userId, communityId) => {
  if (!dbConnected || fakeData.enabled) {
    fakeData.initPetScoreRecord(userId, communityId);
    return;
  }
  const [exist] = await pool.query(
    'SELECT id FROM pet_civilization_score WHERE user_id = ?',
    [userId]
  );
  if (!exist.length) {
    await pool.query(
      'INSERT INTO pet_civilization_score (user_id, community_id, base_score) VALUES (?, ?, 100.00)',
      [userId, communityId]
    );
  }
};

/**
 * 获取单个用户的养宠文明分详情
 */
const getUserPetScore = async (userId) => {
  if (!dbConnected || fakeData.enabled) {
    return fakeData.getPetCivilizationScore(userId);
  }
  const [rows] = await pool.query(
    'SELECT * FROM pet_civilization_score WHERE user_id = ?',
    [userId]
  );
  if (!rows.length) return null;
  return rows[0];
};

/**
 * 计算社区文明分（按月统计）
 */
const calculateCommunityScore = async (communityId, month) => {
  if (!dbConnected || fakeData.enabled) {
    return fakeData.getCommunityCivilizationScore(communityId, month);
  }
  
  // 1. 获取该社区所有用户的平均分
  const [userScoreAvg] = await pool.query(
    `SELECT AVG(total_score) as avg_score 
     FROM pet_civilization_score 
     WHERE community_id = ?`,
    [communityId]
  );
  const userAvgScore = parseFloat(userScoreAvg[0].avg_score || 0).toFixed(2);

  // 2. 保存/更新社区评分记录 (month_XX)
  const monthCol = `month_${month.toString().padStart(2, '0')}`;
  
  // 检查是否存在记录
  const [exist] = await pool.query(
    'SELECT community_id FROM community_civilization_score WHERE community_id = ?',
    [communityId]
  );

  if (exist.length) {
    await pool.query(
      `UPDATE community_civilization_score SET ${monthCol} = ? WHERE community_id = ?`,
      [userAvgScore, communityId]
    );
  } else {
    await pool.query(
      `INSERT INTO community_civilization_score (community_id, ${monthCol}) VALUES (?, ?)`,
      [communityId, userAvgScore]
    );
  }

  return {
    communityId,
    month,
    score: userAvgScore
  };
};

// --- 路由接口 ---

app.get('/api/health', async (req, res) => {
  try {
    if (dbConnected && pool) {
      await pool.query('SELECT 1');
      res.json({ code: 200, data: { db: 'ok', mode: 'real' } });
    } else {
      res.json({ code: 200, data: { db: 'fake', mode: 'fake' } });
    }
  } catch (err) {
    res.json({ code: 200, data: { db: 'fake', mode: 'fake' } });
  }
});

// 注册
app.post('/api/register', async (req, res) => {
  try {
    const { tel, pwd, userName, userType = 'user', communityId } = req.body;
    
    if (!dbConnected || fakeData.enabled) {
      // 假数据模式
      const exist = fakeData.getUserByTel(tel);
      if (exist) return res.json({ code: -1, msg: '手机号已注册' });
      
      const newId = fakeData.getUsers().length + 1;
      fakeData.getUsers().push({
        id: newId,
        tel,
        pwd: 'encrypted',
        user_type: userType,
        user_name: userName,
        community_id: communityId || null
      });
      
      if (communityId) {
        fakeData.initPetScoreRecord(newId, communityId);
      }
      
      return res.json({ code: 200, msg: '注册成功（假数据模式）' });
    }
    
    const [exist] = await pool.query('SELECT id FROM users WHERE tel=?', [tel]);
    if (exist.length) return res.json({ code: -1, msg: '手机号已注册' });

    const enc = await encryptPwd(pwd);
    await pool.query(
      'INSERT INTO users (tel, password, user_type, name, community_id) VALUES (?,?,?,?,?)',
      [tel, enc, userType, userName, communityId || null]
    );
    
    if (communityId) {
      const [userRows] = await pool.query('SELECT id FROM users WHERE tel = ?', [tel]);
      if (userRows.length) {
        await initPetScoreRecord(userRows[0].id, communityId);
      }
    }
    
    res.json({ code: 200, msg: '注册成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { tel, pwd, userType } = req.body;
    
    if (!dbConnected || fakeData.enabled) {
      // 假数据模式
      const user = fakeData.getUsers().find(u => u.tel === tel && u.user_type === userType);
      if (!user) {
        return res.json({ code: -1, msg: '账号或密码错误' });
      }
      
      const loginState = {
        tel: user.tel,
        name: user.user_name,
        type: user.user_type,
        id: user.id,
        communityId: user.community_id
      };
      
      res.cookie('loginState', JSON.stringify(loginState), { 
        httpOnly: true, 
        maxAge: 24 * 3600000, 
        sameSite: 'lax'
      });
      
      const token = Buffer.from(JSON.stringify(loginState)).toString('base64');

      return res.json({ 
        code: 200, 
        msg: '登录成功（假数据模式）',
        data: { communityId: user.community_id, token, userType: user.user_type, name: user.name }
      });
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE tel=? AND user_type=?',
      [tel, userType]
    );
    const user = rows[0];
    if (!user || !(await verifyPwd(pwd, user.password))) {
      return res.json({ code: -1, msg: '账号或密码错误' });
    }
    
    const loginState = {
      tel: user.tel,
      name: user.name,
      type: user.user_type,
      id: user.id,
      communityId: user.community_id
    };
    
    res.cookie('loginState', JSON.stringify(loginState), { 
      httpOnly: true, 
      maxAge: 24 * 3600000, 
      sameSite: 'lax'
    });
    
    const token = Buffer.from(JSON.stringify(loginState)).toString('base64');

    res.json({ 
      code: 200, 
      msg: '登录成功',
      data: { communityId: user.community_id, token, userType: user.user_type, name: user.user_name }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('loginState');
  res.json({ code: 200, msg: '已退出' });
});

app.get('/api/checkLogin', checkLogin, (req, res) => {
  res.json({ code: 200, data: req.user });
});

// --- 业务接口 ---

// 仪表盘数据
app.get('/api/admin/dashboard', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getDashboardStats() });
    }
    
    // 宠物总数
    const [petRows] = await pool.query('SELECT COUNT(*) as count FROM pets');
    const petCount = petRows[0].count;

    // 违规总数
    const [vioRows] = await pool.query('SELECT COUNT(*) as count FROM pet_violation_records');
    const violationCount = vioRows[0].count;

    // 社区文明系数（全区平均分）
    const [scoreRows] = await pool.query('SELECT AVG(total_score) as avgScore FROM pet_civilization_score');
    const avgScore = scoreRows[0].avgScore;
    const civilScore = avgScore ? parseFloat(avgScore).toFixed(1) : '100.0';

    res.json({
      code: 200,
      data: {
        petCount,
        violationCount,
        civilScore
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 2. 社区热力图数据
app.get('/api/admin/communityPetHeatmap', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getCommunityPetHeatmap() });
    }
    
    const sql = `
      SELECT c.name, COUNT(p.id) as petCount 
      FROM community c 
      LEFT JOIN users u ON c.id = u.community_id 
      LEFT JOIN pets p ON u.id = p.user_id 
      GROUP BY c.id 
      ORDER BY petCount DESC
    `;
    const [rows] = await pool.query(sql);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '热力图数据获取失败' });
  }
});

// 3. 文明系数趋势图数据
app.get('/api/admin/civilizationTrend', checkLogin, checkAdmin, async (req, res) => {
  try {
    // 尝试从缓存获取
    const cachedData = cache.get('civilizationTrend');
    if (cachedData) {
      return res.json({ code: 200, data: cachedData });
    }
    
    if (!dbConnected || fakeData.enabled) {
      const data = fakeData.getCivilizationTrend();
      cache.set('civilizationTrend', data, 600000); // 10分钟缓存
      return res.json({ code: 200, data });
    }
    
    // 获取当前月份
    const currentMonth = new Date().getMonth() + 1;
    let months = [];
    for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        if (m <= 0) m += 12;
        months.push(m);
    }
    
    // 优化：一次性查询所有月份的数据
    const monthCols = months.map(m => `AVG(month_${m.toString().padStart(2, '0')}) as score_${m}`).join(', ');
    const [[result]] = await pool.query(`SELECT ${monthCols} FROM community_civilization_score`);
    
    let trendData = [];
    for (const m of months) {
        const scoreKey = `score_${m}`;
        trendData.push({
            month: `${m}月`,
            score: result[scoreKey] ? Math.round(result[scoreKey]) : 100
        });
    }
    
    cache.set('civilizationTrend', trendData, 600000); // 10分钟缓存
    res.json({ code: 200, data: trendData });
  } catch (err) {
    console.error(err);
    const data = fakeData.getCivilizationTrend();
    cache.set('civilizationTrend', data, 600000); // 10分钟缓存
    res.json({ code: 200, data });
  }
});

// 2. 公告相关
app.get('/api/announcements', async (req, res) => {
  try {
    // 尝试从缓存获取
    const cachedData = cache.get('announcements');
    if (cachedData) {
      return res.json({ code: 200, data: cachedData });
    }
    
    if (!dbConnected || fakeData.enabled) {
      const data = fakeData.getAnnouncements();
      cache.set('announcements', data);
      return res.json({ code: 200, data });
    }
    
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY is_top DESC, created_at DESC');
    cache.set('announcements', rows);
    res.json({ code: 200, data: rows });
  } catch (err) { 
    const data = fakeData.getAnnouncements();
    cache.set('announcements', data);
    res.json({ code: 200, data });
  }
});

app.post('/api/admin/saveAnnouncement', checkLogin, checkAdmin, async (req, res) => {
  const { id, title, content, isTop, time } = req.body;
  try {
    if (!dbConnected || fakeData.enabled) {
      if (id) {
        // 更新
        const announcements = fakeData.getAnnouncements();
        const index = announcements.findIndex(a => a.id === id);
        if (index > -1) {
          announcements[index] = { ...announcements[index], title, content, is_top: isTop, publish_time: time };
        }
      } else {
        // 新增
        fakeData.addAnnouncement({ title, content, is_top: isTop, publish_time: time, created_at: new Date().toISOString() });
      }
      // 清除缓存
      cache.clear('announcements');
      return res.json({ code: 200, msg: '操作成功（假数据模式）' });
    }
    
    if (id) {
      await pool.query('UPDATE announcements SET title=?, content=?, is_top=?, publish_time=? WHERE id=?', [title, content, isTop, time, id]);
    } else {
      await pool.query('INSERT INTO announcements (title, content, is_top, publish_time) VALUES (?, ?, ?, ?)', [title, content, isTop, time]);
    }
    // 清除缓存
    cache.clear('announcements');
    res.json({ code: 200, msg: '操作成功' });
  } catch (err) { 
    res.json({ code: 500 });
  }
});

app.post('/api/admin/deleteAnnouncement', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      fakeData.deleteAnnouncement(req.body.id);
      // 清除缓存
      cache.clear('announcements');
      return res.json({ code: 200, msg: '删除成功（假数据模式）' });
    }
    
    await pool.query('DELETE FROM announcements WHERE id=?', [req.body.id]);
    // 清除缓存
    cache.clear('announcements');
    res.json({ code: 200 });
  } catch (err) { 
    res.json({ code: 500 });
  }
});

// 3. 违规相关
app.get('/api/admin/violationTypes', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getViolationTypes() });
    }
    
    const [rows] = await pool.query('SELECT id, type_name, deduction_score FROM violation_types WHERE status = 1 ORDER BY id');
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 200, data: fakeData.getViolationTypes() });
  }
});

// 获取违规列表
app.get('/api/admin/violations', checkLogin, checkAdmin, async (req, res) => {
  try {
    const { filter } = req.query;
    
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getViolationRecords(filter) });
    }
    
    let sql = `
      SELECT v.*, vt.type_name, vt.deduction_score, p.pet_name, u.user_name as owner_name, u.tel as owner_tel 
      FROM pet_violation_records v 
      LEFT JOIN violation_types vt ON v.violation_type_id = vt.id
      LEFT JOIN pets p ON v.pet_id = p.id
      LEFT JOIN users u ON v.user_id = u.id
    `;
    let params = [];
    if (filter && filter !== 'all') {
      sql += ' WHERE v.violation_type_id = ?';
      params.push(filter);
    }
    sql += ' ORDER BY v.violation_time DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 200, data: fakeData.getViolationRecords(req.query.filter) });
  }
});

// 保存违规记录
app.post('/api/admin/saveViolation', checkLogin, checkAdmin, async (req, res) => {
  const { id, petName, ownerTel, violation_type_id, violationTime, handleStatus, handleResult, handleNote } = req.body;
  
  try {
    if (!dbConnected || fakeData.enabled) {
      // 假数据模式
      const violationType = fakeData.getViolationTypes().find(v => v.id === parseInt(violation_type_id));
      if (!violationType) return res.json({ code: -1, msg: '违规类型无效' });
      
      const user = fakeData.getUserByTel(ownerTel);
      const userId = user ? user.id : null;
      const communityId = user ? user.community_id : null;
      
      const pet = userId ? fakeData.getPetsByUserId(userId).find(p => p.pet_name === petName) : null;
      const petId = pet ? pet.id : null;
      
      if (id) {
        // 更新
        const records = fakeData.getViolationRecords();
        const index = records.findIndex(r => r.id === id);
        if (index > -1) {
          records[index] = { 
            ...records[index], 
            pet_id: petId, user_id: userId, community_id: communityId,
            violation_type_id, violation_time: violationTime, violation_desc: handleNote || '',
            handle_status: handleStatus, handle_result: handleResult || '',
            pet_name: petName, type_name: violationType.type_name,
            owner_name: user?.user_name, owner_tel: user?.tel
          };
        }
      } else {
        // 新增
        fakeData.addViolationRecord({
          pet_id: petId, user_id: userId, community_id: communityId,
          violation_type_id, violation_time: violationTime, violation_desc: handleNote || '',
          handle_status: handleStatus || 'pending', handle_result: handleResult || '',
          handler: req.user.user_name,
          pet_name: petName, type_name: violationType.type_name,
          deduction_score: violationType.deduction_score,
          owner_name: user?.user_name, owner_tel: user?.tel
        });
        
        // 扣分
        if (userId) {
          fakeData.initPetScoreRecord(userId, communityId);
          const column = getDeductionColumn(violationType.type_name);
          fakeData.updatePetCivilizationScore(userId, column, violationType.deduction_score);
        }
      }
      
      return res.json({ code: 200, msg: '操作成功（假数据模式）' });
    }
    
    // 1. 获取违规类型信息（用于扣分）
    const [typeRows] = await pool.query('SELECT * FROM violation_types WHERE id = ?', [violation_type_id]);
    if (!typeRows.length) return res.json({ code: -1, msg: '违规类型无效' });
    const violationType = typeRows[0];
    const deductionScore = violationType.deduction_score || 5;

    // 2. 根据手机号查找用户
    let userId = null;
    let communityId = null;
    if (ownerTel) {
      const [u] = await pool.query('SELECT id, community_id FROM users WHERE tel=?', [ownerTel]);
      if (u.length) {
        userId = u[0].id;
        communityId = u[0].community_id;
      }
    }

    // 3. 根据宠物名和用户查找宠物ID
    let petId = null;
    if (petName && userId) {
       const [p] = await pool.query('SELECT id FROM pets WHERE user_id=? AND pet_name=?', [userId, petName]);
       if (p.length) petId = p[0].id;
    }

    // 自动修复表结构：确保 pet_id/user_id 允许为空，且 violation_desc 字段存在
    try {
      await pool.query("ALTER TABLE pet_violation_records MODIFY COLUMN pet_id INT NULL");
      await pool.query("ALTER TABLE pet_violation_records MODIFY COLUMN user_id INT NULL");
      
      const [cols] = await pool.query("SHOW COLUMNS FROM pet_violation_records LIKE 'violation_desc'");
      if (cols.length === 0) {
          await pool.query("ALTER TABLE pet_violation_records ADD COLUMN violation_desc VARCHAR(500) DEFAULT '' COMMENT '违规行为详情'");
      }
    } catch (e) {
      // 忽略错误（如权限不足或已存在）
    }

    if (id) {
      // 更新记录
      await pool.query(
        `UPDATE pet_violation_records 
         SET pet_id=?, user_id=?, community_id=?, violation_type_id=?, violation_time=?, violation_desc=?, 
             handle_status=?, handle_result=?, handler=? 
         WHERE id=?`,
        [petId || null, userId || null, communityId || null, violation_type_id, violationTime, handleNote || '', handleStatus, handleResult || '', req.user.user_name, id]
      );
    } else {
      // 新增记录
      await pool.query(
        `INSERT INTO pet_violation_records 
         (pet_id, user_id, community_id, violation_type_id, violation_time, violation_desc, handle_status, handle_result, handler) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [petId || null, userId || null, communityId || null, violation_type_id, violationTime, handleNote || '', handleStatus || 'pending', handleResult || '', req.user.user_name]
      );
      
      // 3. 扣分逻辑：更新 pet_civilization_score 表对应列
      if (userId) {
        await initPetScoreRecord(userId, communityId);
        
        // 映射列名
        const column = getDeductionColumn(violationType.type_name);
        
        // 累加扣分
        await pool.query(
          `UPDATE pet_civilization_score SET ${column} = ${column} + ? WHERE user_id = ?`,
          [deductionScore, userId]
        );
      }
    }
    
    res.json({ code: 200, msg: '操作成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '操作失败' });
  }
});

app.post('/api/admin/deleteViolation', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      fakeData.deleteViolation(req.body.id);
      return res.json({ code: 200, msg: '删除成功（假数据模式）' });
    }
    
    await pool.query('DELETE FROM pet_violation_records WHERE id=?', [req.body.id]);
    res.json({ code: 200 });
  } catch (err) { 
    res.json({ code: 500 });
  }
});

// 4. 宠物相关
app.get('/api/admin/allPets', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      const pets = fakeData.getPets().map(p => {
        const user = fakeData.getUserById(p.user_id);
        return { ...p, owner_name: user?.user_name, owner_tel: user?.tel };
      });
      return res.json({ code: 200, data: pets });
    }
    
    const [rows] = await pool.query(`
      SELECT p.*, u.user_name as owner_name, u.tel as owner_tel 
      FROM pets p 
      LEFT JOIN users u ON p.user_id = u.id 
      ORDER BY p.create_time DESC
    `);
    res.json({ code: 200, data: rows });
  } catch (err) { 
    const pets = fakeData.getPets().map(p => {
      const user = fakeData.getUserById(p.user_id);
      return { ...p, owner_name: user?.user_name, owner_tel: user?.tel };
    });
    res.json({ code: 200, data: pets });
  }
});

app.post('/api/admin/deletePet', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      fakeData.deletePet(req.body.id);
      return res.json({ code: 200, msg: '删除成功（假数据模式）' });
    }
    
    await pool.query('DELETE FROM pets WHERE id=?', [req.body.id]);
    res.json({ code: 200 });
  } catch (err) { 
    res.json({ code: 500 });
  }
});

// 用户端积分接口
app.get('/api/user/score', checkLogin, async (req, res) => {
  try {
    const scoreRow = await getUserPetScore(req.user.id);
    
    if (scoreRow) {
      const details = {
        base: scoreRow.base_score,
        bonus: scoreRow.bonus_score,
        total: scoreRow.total_score,
        deductions: {
          leash: scoreRow.leash_deduction,
          feces: scoreRow.feces_deduction,
          noise: scoreRow.noise_deduction,
          vaccine: scoreRow.vaccine_deduction,
          cert: scoreRow.cert_deduction,
          public_area: scoreRow.public_area_deduction,
          other: scoreRow.other_deduction
        }
      };
      
      res.json({ 
        code: 200, 
        data: details
      });
    } else {
      // 默认分
      res.json({ 
        code: 200, 
        data: { 
          base: 100, 
          bonus: 0, 
          total: 100, 
          deductions: { leash: 0, feces: 0, noise: 0, vaccine: 0, cert: 0, public_area: 0, other: 0 } 
        } 
      });
    }
  } catch (err) { 
    console.error(err);
    res.json({ code: 200, data: { 
      base: 100, 
      bonus: 0, 
      total: 100, 
      deductions: { leash: 0, feces: 0, noise: 0, vaccine: 0, cert: 0, public_area: 0, other: 0 } 
    }});
  }
});

// 用户端宠物接口
app.get('/api/myPets', checkLogin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      const pets = fakeData.getPetsByUserId(req.user.id);
      return res.json({ code: 200, data: pets });
    }
    
    const [rows] = await pool.query('SELECT * FROM pets WHERE user_id=? ORDER BY id DESC', [req.user.id]);
    res.json({ code: 200, data: rows });
  } catch (err) { 
    const pets = fakeData.getPetsByUserId(req.user.id);
    res.json({ code: 200, data: pets });
  }
});

app.post('/api/savePet', checkLogin, async (req, res) => {
  const userId = req.user.id;
  const p = req.body;
  try {
    if (!dbConnected || fakeData.enabled) {
      if (p.id) {
        // 更新
        fakeData.updatePet(p.id, {
          pet_name: p.name, pet_breed: p.breed, pet_age: p.age,
          pet_vaccine: p.vaccine, pet_cert_id: p.certId,
          pet_register_time: p.registerTime, pet_avatar: p.avatar
        });
      } else {
        // 新增
        fakeData.addPet({
          user_id: userId, pet_name: p.name, pet_breed: p.breed, pet_age: p.age,
          pet_vaccine: p.vaccine, pet_cert_id: p.certId,
          pet_register_time: p.registerTime, pet_avatar: p.avatar,
          create_time: new Date().toISOString()
        });
        
        // 增加奖励分
        const user = fakeData.getUserById(userId);
        if (user && user.community_id) {
          fakeData.initPetScoreRecord(userId, user.community_id);
          const score = fakeData.getPetCivilizationScore(userId);
          if (score) {
            score.bonus_score += 20;
            score.total_score = score.base_score + score.bonus_score;
          }
        }
      }
      return res.json({ code: 200, msg: '操作成功（假数据模式）' });
    }
    
    if (p.id) {
      await pool.query(
        'UPDATE pets SET pet_name=?, pet_breed=?, pet_age=?, pet_vaccine=?, pet_cert_id=?, pet_register_time=?, pet_avatar=? WHERE id=? AND user_id=?', 
        [p.name, p.breed, p.age, p.vaccine, p.certId, p.registerTime, p.avatar, p.id, userId]
      );
    } else {
      await pool.query(
        'INSERT INTO pets (user_id, pet_name, pet_breed, pet_age, pet_vaccine, pet_cert_id, pet_register_time, pet_avatar) VALUES (?,?,?,?,?,?,?,?)', 
        [userId, p.name, p.breed, p.age, p.vaccine, p.certId, p.registerTime, p.avatar]
      );
      
      // 新增：宠物登记成功，增加奖励分
      const [userRows] = await pool.query('SELECT community_id FROM users WHERE id = ?', [userId]);
      if (userRows.length) {
        const communityId = userRows[0].community_id;
        await initPetScoreRecord(userId, communityId);
        
        // 更新 bonus_score
        await pool.query(
          'UPDATE pet_civilization_score SET bonus_score = bonus_score + 20 WHERE user_id = ?',
          [userId]
        );
      }
    }
    res.json({ code: 200 });
  } catch (err) { 
    console.error(err);
    res.json({ code: 500 });
  }
});

app.post('/api/deletePet', checkLogin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      const pet = fakeData.getPetById(req.body.id);
      if (pet && pet.user_id === req.user.id) {
        fakeData.deletePet(req.body.id);
      }
      return res.json({ code: 200, msg: '删除成功（假数据模式）' });
    }
    
    await pool.query('DELETE FROM pets WHERE id=? AND user_id=?', [req.body.id, req.user.id]);
    res.json({ code: 200 });
  } catch (err) { 
    res.json({ code: 500 });
  }
});

// --- 社区相关 ---

app.get('/api/community/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!dbConnected || fakeData.enabled) {
      const results = fakeData.searchCommunities(keyword);
      return res.json({ code: 200, data: results });
    }
    
    const sql = 'SELECT id, name FROM community WHERE name LIKE ?';
    const [results] = await pool.query(sql, [`%${keyword || ''}%`]);
    res.json({ code: 200, data: results });
  } catch (err) {
    console.error(err);
    const results = fakeData.searchCommunities(req.query.keyword);
    res.json({ code: 200, data: results });
  }
});

app.post('/api/user/bindCommunity', checkLogin, async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.user.id;
    
    if (!dbConnected || fakeData.enabled) {
      const community = fakeData.getCommunityById(parseInt(communityId));
      if (!community) return res.json({ code: -2, msg: '社区不存在' });
      
      fakeData.updateUserCommunity(userId, parseInt(communityId));
      fakeData.initPetScoreRecord(userId, parseInt(communityId));
      
      // 更新登录态
      const newLoginState = { ...req.user, communityId: parseInt(communityId) };
      res.cookie('loginState', JSON.stringify(newLoginState), { 
        httpOnly: true, maxAge: 24 * 3600000, sameSite: 'lax'
      });
      
      return res.json({ code: 200, msg: '社区绑定成功（假数据模式）' });
    }
    
    // 校验社区ID是否有效
    const [communityExist] = await pool.query('SELECT id FROM community WHERE id = ?', [communityId]);
    if (!communityExist.length) return res.json({ code: -2, msg: '社区不存在' });
    
    // 更新用户所属社区
    await pool.query('UPDATE users SET community_id = ? WHERE id = ?', [communityId, userId]);
    
    // 初始化/更新用户养宠文明分记录
    await initPetScoreRecord(userId, communityId);
    
    // 更新登录态
    const newLoginState = { ...req.user, communityId };
    res.cookie('loginState', JSON.stringify(newLoginState), { 
      httpOnly: true, maxAge: 24 * 3600000, sameSite: 'lax'
    });
    
    res.json({ code: 200, msg: '社区绑定成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '社区绑定失败' });
  }
});

app.get('/api/user/petScore', checkLogin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      const row = fakeData.getPetCivilizationScore(req.user.id);
      if (!row) return res.json({ code: 200, data: null, msg: '暂无评分记录' });
      return res.json({ code: 200, data: row });
    }
    
    const row = await getUserPetScore(req.user.id);
    if (!row) return res.json({ code: 200, data: null, msg: '暂无评分记录' });
    res.json({ code: 200, data: row });
  } catch (err) {
    console.error(err);
    const row = fakeData.getPetCivilizationScore(req.user.id);
    res.json({ code: 200, data: row });
  }
});

// 管理员获取社区评分
app.get('/api/admin/communityScore', checkLogin, checkAdmin, async (req, res) => {
  try {
    const { communityId, month } = req.query;
    if (!communityId || !month) return res.json({ code: -1, msg: '参数缺失' });
    
    const scoreData = await calculateCommunityScore(communityId, month);
    res.json({ code: 200, data: scoreData });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取社区评分失败' });
  }
});

// --- 新增统计接口 ---

// 1. 宠物总览统计
app.get('/api/admin/petStats', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getPetStats() });
    }
    
    // 基础统计
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM pets');
    const total = totalRows[0].total;

    const [catRows] = await pool.query("SELECT COUNT(*) as count FROM pets WHERE pet_breed LIKE '%猫%' OR pet_breed LIKE '%英短%' OR pet_breed LIKE '%布偶%'");
    const catCount = catRows[0].count;

    const [dogRows] = await pool.query("SELECT COUNT(*) as count FROM pets WHERE pet_breed LIKE '%犬%' OR pet_breed LIKE '%狗%' OR pet_breed LIKE '%哈士奇%' OR pet_breed LIKE '%金毛%'");
    const dogCount = dogRows[0].count;
    
    // 其他类型
    const [otherRows] = await pool.query("SELECT COUNT(*) as count FROM pets WHERE pet_breed NOT LIKE '%猫%' AND pet_breed NOT LIKE '%英短%' AND pet_breed NOT LIKE '%布偶%' AND pet_breed NOT LIKE '%犬%' AND pet_breed NOT LIKE '%狗%' AND pet_breed NOT LIKE '%哈士奇%' AND pet_breed NOT LIKE '%金毛%'");
    const otherCount = otherRows[0].count;
    
    // 今日新增
    const today = new Date().toISOString().split('T')[0];
    const [newCountRows] = await pool.query("SELECT COUNT(*) as count FROM pets WHERE DATE(create_time) = ?", [today]);
    const newCount = newCountRows[0].count;

    // 宠物详细列表（带分类判断）
    const [petList] = await pool.query(`
      SELECT 
        p.pet_name, 
        p.pet_breed, 
        p.pet_age, 
        u.user_name as owner_name, 
        p.create_time,
        CASE 
          WHEN p.pet_breed LIKE '%猫%' OR p.pet_breed LIKE '%英短%' OR p.pet_breed LIKE '%布偶%' THEN '猫类'
          WHEN p.pet_breed LIKE '%犬%' OR p.pet_breed LIKE '%狗%' OR p.pet_breed LIKE '%哈士奇%' OR p.pet_breed LIKE '%金毛%' THEN '犬类'
          ELSE '其他'
        END as category
      FROM pets p 
      LEFT JOIN users u ON p.user_id = u.id 
      ORDER BY p.create_time DESC 
      LIMIT 20
    `);

    res.json({
      code: 200,
      data: {
        total: total || 0,
        catCount: catCount || 0,
        dogCount: dogCount || 0,
        otherCount: otherCount || 0,
        newCount: newCount || 0,
        petList
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 200, data: fakeData.getPetStats() });
  }
});

// 2. 违规总览统计
app.get('/api/admin/violationStats', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getViolationStats() });
    }
    
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM pet_violation_records');
    const total = totalRows[0].total;

    const [pendingRows] = await pool.query("SELECT COUNT(*) as count FROM pet_violation_records WHERE handle_status != 'resolved'");
    const pending = pendingRows[0].count;

    const [resolvedRows] = await pool.query("SELECT COUNT(*) as count FROM pet_violation_records WHERE handle_status = 'resolved'");
    const resolved = resolvedRows[0].count;
    
    // 本月新增
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const [monthCountRows] = await pool.query("SELECT COUNT(*) as count FROM pet_violation_records WHERE DATE_FORMAT(violation_time, '%Y-%m') = ?", [currentMonth]);
    const monthCount = monthCountRows[0].count;

    // 类型分布
    const [typeRows] = await pool.query(`
      SELECT vt.type_name, COUNT(v.id) as count 
      FROM pet_violation_records v
      JOIN violation_types vt ON v.violation_type_id = vt.id
      GROUP BY vt.id
    `);
    
    const typeStats = typeRows.map(row => ({
      name: row.type_name,
      count: row.count,
      ratio: total > 0 ? ((row.count / total) * 100).toFixed(1) + '%' : '0%'
    }));

    res.json({
      code: 200,
      data: {
        total: total || 0,
        pending: pending || 0,
        resolved: resolved || 0,
        monthCount: monthCount || 0,
        typeStats
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 200, data: fakeData.getViolationStats() });
  }
});

// 3. 社区文明系数详情（支持单个查询或默认全局）
app.get('/api/admin/communityCivilizationStats', checkLogin, checkAdmin, async (req, res) => {
  try {
    const { communityId } = req.query;
    
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getCommunityCivilizationStats(communityId || 0) });
    }
    
    let sql = 'SELECT AVG(total_score) as avgScore FROM pet_civilization_score';
    let params = [];
    
    if (communityId) {
      sql += ' WHERE community_id = ?';
      params.push(communityId);
    }
    
    // 核心指数：取所有用户文明分的平均值
    const [avgScoreRows] = await pool.query(sql, params);
    const avgScore = avgScoreRows[0].avgScore;
    const score = avgScore ? parseFloat(avgScore).toFixed(1) : '100.0';
    
    // 获取社区名称（如果有ID）
    let communityName = '全区综合';
    if (communityId) {
      const [cRows] = await pool.query('SELECT name FROM community WHERE id = ?', [communityId]);
      if (cRows.length) communityName = cRows[0].name;
    }
    
    // 维度细分
    const seed = communityId ? parseInt(communityId) : 0;
    const dimensions = [
      { name: '宠物规范度', score: Math.min(100, 85 + (seed % 5)), trend: 'up', change: 2.3 },
      { name: '环境整洁度', score: Math.min(100, 92 - (seed % 3)), trend: 'up', change: 1.8 },
      { name: '邻里和谐度', score: Math.min(100, 88 + (seed % 4)), trend: 'down', change: 0.5 },
      { name: '违规整改率', score: Math.min(100, 95 - (seed % 2)), trend: 'up', change: 3.1 }
    ];

    // 趋势
    const months = [];
    for(let i=0; i<6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}年${d.getMonth()+1}月`);
    }
    
    const trend = months.map((m, i) => ({
      month: m,
      score: (parseFloat(score) - i * 0.5 + (Math.random() - 0.5)).toFixed(1),
      change: (Math.random() * 2 - 1).toFixed(1) > 0 ? '↑' + (Math.random()).toFixed(1) : '↓' + (Math.random()).toFixed(1),
      reason: '模拟数据'
    }));

    res.json({
      code: 200,
      data: {
        name: communityName,
        score,
        level: score >= 90 ? '优秀' : (score >= 80 ? '良好' : '待改进'),
        dimensions,
        trend
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 200, data: fakeData.getCommunityCivilizationStats(req.query.communityId || 0) });
  }
});

// 4. 获取所有社区的文明系数列表
app.get('/api/admin/communityListStats', checkLogin, checkAdmin, async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getCommunityListStats() });
    }
    
    const [rows] = await pool.query(`
      SELECT c.id, c.name, AVG(pcs.total_score) as score, COUNT(pcs.id) as userCount
      FROM community c
      LEFT JOIN pet_civilization_score pcs ON c.id = pcs.community_id
      GROUP BY c.id
    `);
    
    const data = rows.map(r => ({
      id: r.id,
      name: r.name,
      score: r.score ? parseFloat(r.score).toFixed(1) : '100.0',
      userCount: r.userCount
    }));
    
    res.json({ code: 200, data });
  } catch (err) {
    console.error(err);
    res.json({ code: 200, data: fakeData.getCommunityListStats() });
  }
});

// --- 地图功能相关接口 ---

// 获取地图基础数据
app.get('/api/map/data', async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      const mapData = fakeData.getMapData();
      return res.json({ code: 200, ...mapData });
    }
    
    const [zones] = await pool.query('SELECT * FROM map_layers');
    const [markers] = await pool.query("SELECT * FROM map_markers WHERE type = 'poi'");
    const [hospitals] = await pool.query("SELECT * FROM pet_hospitals");
    const [shops] = await pool.query("SELECT * FROM pet_shops");
    const [live_events] = await pool.query("SELECT * FROM map_markers WHERE type = 'event' ORDER BY created_at DESC LIMIT 10");

    // 处理 JSON 字段
    const processedZones = zones.map(z => ({
      ...z,
      path: typeof z.path === 'string' ? JSON.parse(z.path) : z.path
    }));

    // 合并 POIs
    const allPois = [
      ...markers,
      ...hospitals.map(h => ({ ...h, category: 'hospital', type: 'poi' })),
      ...shops.map(s => ({ ...s, type: 'poi' }))
    ];

    // 格式化事件数据
    const processedEvents = live_events.map(e => ({
      lng: e.lng,
      lat: e.lat,
      desc: e.name,
      time: new Date(e.created_at).toLocaleTimeString()
    }));

    res.json({
      code: 200,
      zones: processedZones,
      pois: allPois,
      live_events: processedEvents
    });
  } catch (err) {
    console.error(err);
    const mapData = fakeData.getMapData();
    res.json({ code: 200, ...mapData });
  }
});

// 宠物医院接口
app.get('/api/map/hospitals', async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getPetHospitals() });
    }
    const [hospitals] = await pool.query('SELECT * FROM pet_hospitals');
    res.json({ code: 200, data: hospitals });
  } catch (err) {
    res.json({ code: 200, data: fakeData.getPetHospitals() });
  }
});

// 宠物商店接口
app.get('/api/map/shops', async (req, res) => {
  try {
    if (!dbConnected || fakeData.enabled) {
      return res.json({ code: 200, data: fakeData.getPetShops() });
    }
    const [shops] = await pool.query('SELECT * FROM pet_shops');
    res.json({ code: 200, data: shops });
  } catch (err) {
    res.json({ code: 200, data: fakeData.getPetShops() });
  }
});

// 保存遛宠轨迹
app.post('/api/map/track/save', checkLogin, async (req, res) => {
  try {
    const { duration, distance, path, analysis } = req.body;
    console.log(`[轨迹保存] 用户:${req.user.name}, 时长:${duration}s, 距离:${distance}m`);
    res.json({ 
      code: 200, 
      msg: `遛宠记录已保存！\n时长：${duration}秒 \n距离：${distance}米 \n安全区域占比：${analysis?.safeRate || 100}%` 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '保存失败' });
  }
});

app.post('/api/track/save', checkLogin, async (req, res) => {
  try {
    const { duration, distance, path, analysis } = req.body;
    console.log(`[轨迹保存] 用户:${req.user.name}, 时长:${duration}s, 距离:${distance}m`);
    res.json({ 
      code: 200, 
      msg: `遛宠记录已保存！\n时长：${duration}秒 \n距离：${distance}米 \n安全区域占比：${analysis?.safeRate || 100}%` 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '保存失败' });
  }
});

// 隐患上报
app.post('/api/map/report', checkLogin, async (req, res) => {
  try {
    const { desc, lng, lat, time } = req.body;
    console.log(`[隐患上报] 用户:${req.user.name}, 内容:${desc}, 位置:${lng},${lat}`);
    
    if (!dbConnected || fakeData.enabled) {
      fakeData.addMapMarker({ name: desc, type: 'event', lng, lat, info: '用户上报隐患' });
      return res.json({ 
        code: 200, 
        msg: "感谢您的上报！社区工作人员将在1小时内处理。（假数据模式）" 
      });
    }
    
    await pool.query(
      "INSERT INTO map_markers (name, type, lng, lat, info) VALUES (?, 'event', ?, ?, ?)",
      [desc, lng, lat, '用户上报隐患']
    );

    res.json({ 
      code: 200, 
      msg: "感谢您的上报！社区工作人员将在1小时内处理。" 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '上报失败' });
  }
});

app.post('/api/report', checkLogin, async (req, res) => {
  try {
    const { desc, lng, lat, time } = req.body;
    console.log(`[隐患上报] 用户:${req.user.name}, 内容:${desc}, 位置:${lng},${lat}`);
    
    if (!dbConnected || fakeData.enabled) {
      fakeData.addMapMarker({ name: desc, type: 'event', lng, lat, info: '用户上报隐患' });
      return res.json({ 
        code: 200, 
        msg: "感谢您的上报！社区工作人员将在1小时内处理。（假数据模式）" 
      });
    }
    
    await pool.query(
      "INSERT INTO map_markers (name, type, lng, lat, info) VALUES (?, 'event', ?, ?, ?)",
      [desc, lng, lat, '用户上报隐患']
    );
    res.json({ 
      code: 200, 
      msg: "感谢您的上报！社区工作人员将在1小时内处理。" 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '上报失败' });
  }
});

app.get('/api/agent/ping', (req, res) => {
  res.json({ code: 200, data: { configured: !!difyApiKey, baseUrl: difyBaseUrl } });
});

app.post('/api/agent/chat', checkLogin, async (req, res) => {
  try {
    if (!difyApiKey) {
      return res.json({ code: 500, msg: '未配置智能体服务' });
    }

    const query = (req.body?.query || req.body?.message || '').toString().trim();
    let conversation_id = (req.body?.conversation_id || req.body?.conversationId || '').toString().trim();
    
    // 清洗 conversation_id
    if (!conversation_id || conversation_id === 'null' || conversation_id === 'undefined') {
      conversation_id = undefined;
    }

    const inputs = req.body?.inputs && typeof req.body.inputs === 'object' ? req.body.inputs : {};

    if (!query) return res.json({ code: 400, msg: '缺少 query' });

    const payload = {
        inputs,
        query,
        response_mode: 'streaming',
        conversation_id,
        user: String(req.user?.id || req.user?.tel || 'anonymous')
    };
    
    console.log('Sending to Dify (Streaming):', JSON.stringify(payload, null, 2));

    const difyRes = await fetch(`${difyBaseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!difyRes.ok) {
      const text = await difyRes.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
      console.error('Dify 调用失败:', difyRes.status, data);
      const errDetail = data.code || data.message || '未知错误';
      return res.json({
        code: 502,
        msg: `Dify服务异常(${difyRes.status}): ${errDetail}`,
        data: { status: difyRes.status, detail: data }
      });
    }

    // 处理流式响应
    const reader = difyRes.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullAnswer = '';
    let lastConversationId = conversation_id;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            if (!jsonStr.trim()) continue;
            const data = JSON.parse(jsonStr);
            if (data.event === 'message' || data.event === 'agent_message') {
              fullAnswer += (data.answer || '');
            }
            if (data.conversation_id) {
              lastConversationId = data.conversation_id;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    res.json({ 
        code: 200, 
        data: { 
            answer: fullAnswer, 
            conversation_id: lastConversationId 
        } 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 根路径重定向到登录页面
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// 等待数据库初始化完成后再启动服务器
const startServer = () => {
  app.listen(port, () => {
    console.log(`🚀 后端已启动，端口：${port}`);
    console.log(`📊 假数据模式: ${fakeData.enabled ? '已启用' : '未启用'}`);
    console.log(`💾 数据库连接: ${dbConnected ? '已连接' : '未连接（使用假数据）'}`);
  });
};

// ==================== 宠物服务相关API ====================

// 1. 获取服务者列表
app.get('/api/pet-service/providers', async (req, res) => {
  try {
    const { type, sort } = req.query;
    
    if (!dbConnected || fakeData.enabled) {
      // 假数据模式
      let providers = fakeData.getPetServiceProviders ? fakeData.getPetServiceProviders() : [];
      if (type && type !== 'all') {
        providers = providers.filter(p => p.service_type === type || p.service_type === 'both');
      }
      return res.json({ code: 200, data: providers });
    }
    
    let sql = `
      SELECT 
        p.*,
        u.user_name,
        pcs.total_score as civilization_score
      FROM pet_service_providers p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN pet_civilization_score pcs ON p.user_id = pcs.user_id
      WHERE p.status = 1
    `;
    let params = [];
    
    if (type && type !== 'all') {
      sql += ` AND (p.service_type = ? OR p.service_type = 'both')`;
      params.push(type);
    }
    
    // 排序
    switch(sort) {
      case 'rating':
        sql += ` ORDER BY p.rating DESC`;
        break;
      case 'orders':
        sql += ` ORDER BY p.total_orders DESC`;
        break;
      case 'price':
        sql += ` ORDER BY COALESCE(p.feeding_price, p.foster_price, 999999) ASC`;
        break;
      case 'reputation':
      default:
        sql += ` ORDER BY FIELD(p.reputation_level, 'gold', 'silver', 'bronze', 'new'), p.rating DESC`;
    }
    
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取服务者列表失败' });
  }
});

// 2. 获取服务者详情（包含评价）
app.get('/api/pet-service/provider/:id', async (req, res) => {
  try {
    const providerId = req.params.id;
    
    if (!dbConnected || fakeData.enabled) {
      const provider = fakeData.getPetServiceProviderById ? 
        fakeData.getPetServiceProviderById(providerId) : null;
      if (!provider) return res.json({ code: -1, msg: '服务者不存在' });
      
      const reviews = fakeData.getPetServiceReviews ? 
        fakeData.getPetServiceReviews(providerId) : [];
      return res.json({ code: 200, data: { provider, reviews } });
    }
    
    // 获取服务者信息
    const [providerRows] = await pool.query(`
      SELECT 
        p.*,
        u.user_name,
        pcs.total_score as civilization_score
      FROM pet_service_providers p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN pet_civilization_score pcs ON p.user_id = pcs.user_id
      WHERE p.id = ? AND p.status = 1
    `, [providerId]);
    
    if (!providerRows.length) {
      return res.json({ code: -1, msg: '服务者不存在' });
    }
    
    // 获取评价列表
    const [reviewRows] = await pool.query(`
      SELECT 
        r.*,
        u.user_name as reviewer_name
      FROM pet_service_reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.provider_id = ? AND r.status = 1
      ORDER BY r.create_time DESC
    `, [providerId]);
    
    res.json({ 
      code: 200, 
      data: { 
        provider: providerRows[0], 
        reviews: reviewRows 
      } 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取服务者详情失败' });
  }
});

// 3. 获取服务需求列表
app.get('/api/pet-service/requests', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    // 尝试获取当前登录用户ID（如果已登录）
    let userId = null;
    if (req.cookies.loginState) {
      try {
        const loginState = JSON.parse(req.cookies.loginState);
        userId = loginState.id;
      } catch (e) {}
    }
    
    if (!dbConnected || fakeData.enabled) {
      let requests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      if (type) requests = requests.filter(r => r.type === type);
      if (status) requests = requests.filter(r => r.status === status);
      
      // 获取当前用户的响应记录（如果已登录）
      const myResponses = userId && fakeData.getMyResponses ? fakeData.getMyResponses(userId) : [];
      const respondedRequestIds = myResponses.map(r => r.request_id);
      
      // 标记已响应的帖子，并按状态排序（未响应在前，已响应在后）
      requests = requests.map(r => ({
        ...r,
        has_responded: respondedRequestIds.includes(r.id)
      })).sort((a, b) => {
        // 已响应的排在后面
        if (a.has_responded && !b.has_responded) return 1;
        if (!a.has_responded && b.has_responded) return -1;
        // 同状态按时间排序
        return new Date(b.create_time) - new Date(a.create_time);
      });
      
      return res.json({ code: 200, data: requests });
    }
    
    let sql = `
      SELECT 
        r.*,
        u.user_name as publisher_name,
        IF(resp.id IS NOT NULL, 1, 0) as has_responded
      FROM pet_service_requests r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN pet_service_responses resp ON r.id = resp.request_id AND resp.provider_id = ?
      WHERE r.status = 'open'
    `;
    let params = [userId || 0];
    
    if (type) {
      sql += ` AND r.type = ?`;
      params.push(type);
    }
    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    
    // 按是否响应排序（未响应在前），再按时间排序
    sql += ` ORDER BY has_responded ASC, r.create_time DESC`;
    
    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取需求列表失败' });
  }
});

// 3.1 获取单个需求详情
app.get('/api/pet-service/request/:id', checkLogin, async (req, res) => {
  try {
    const requestId = req.params.id;
    
    if (!dbConnected || fakeData.enabled) {
      const requests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      const request = requests.find(r => r.id === parseInt(requestId));
      if (!request) {
        return res.json({ code: 404, msg: '需求不存在' });
      }
      return res.json({ code: 200, data: request });
    }
    
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        u.user_name as publisher_name
      FROM pet_service_requests r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [requestId]);
    
    if (rows.length === 0) {
      return res.json({ code: 404, msg: '需求不存在' });
    }
    
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取需求详情失败' });
  }
});

// 4. 发布服务需求
app.post('/api/pet-service/request', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type, title, area, address, start_date, end_date, budget,
      pet_type, pet_breed, pet_age, pet_info, service_requirement, contact_info
    } = req.body;
    
    if (!type || !title || !area || !start_date || !end_date || !pet_type || !contact_info) {
      return res.json({ code: -1, msg: '请填写必填项' });
    }
    
    if (!dbConnected || fakeData.enabled) {
      if (fakeData.addPetServiceRequest) {
        fakeData.addPetServiceRequest({
          user_id: userId, type, title, area, address, start_date, end_date, budget,
          pet_type, pet_breed, pet_age, pet_info, service_requirement, contact_info,
          status: 'open', response_count: 0
        });
      }
      return res.json({ code: 200, msg: '发布成功（假数据模式）' });
    }
    
    await pool.query(`
      INSERT INTO pet_service_requests 
      (user_id, type, title, area, address, start_date, end_date, budget,
       pet_type, pet_breed, pet_age, pet_info, service_requirement, contact_info, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `, [userId, type, title, area, address, start_date, end_date, budget,
        pet_type, pet_breed, pet_age, pet_info, service_requirement, contact_info]);
    
    res.json({ code: 200, msg: '发布成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '发布失败' });
  }
});

// 5. 获取我的发布（求助帖）
app.get('/api/pet-service/my-requests', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!dbConnected || fakeData.enabled) {
      const requests = fakeData.getPetServiceRequests ? 
        fakeData.getPetServiceRequests().filter(r => r.user_id === userId) : [];
      return res.json({ code: 200, data: requests });
    }
    
    const [rows] = await pool.query(`
      SELECT * FROM pet_service_requests 
      WHERE user_id = ? 
      ORDER BY create_time DESC
    `, [userId]);
    
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取我的发布失败' });
  }
});

// 6. 获取我的服务者信息
app.get('/api/pet-service/my-provider-info', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!dbConnected || fakeData.enabled) {
      const provider = fakeData.getPetServiceProviderByUserId ? 
        fakeData.getPetServiceProviderByUserId(userId) : null;
      return res.json({ code: 200, data: provider });
    }
    
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        pcs.total_score as civilization_score
      FROM pet_service_providers p
      LEFT JOIN pet_civilization_score pcs ON p.user_id = pcs.user_id
      WHERE p.user_id = ?
    `, [userId]);
    
    res.json({ code: 200, data: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取服务者信息失败' });
  }
});

// 7. 注册成为服务者
app.post('/api/pet-service/register-provider', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nickname, service_type, location, address, feeding_price, foster_price,
      experience_years, introduction, services, phone, wechat
    } = req.body;
    
    if (!nickname || !service_type || !location) {
      return res.json({ code: -1, msg: '请填写必填项' });
    }
    
    if (!dbConnected || fakeData.enabled) {
      if (fakeData.addPetServiceProvider) {
        fakeData.addPetServiceProvider({
          user_id: userId, nickname, service_type, location, address,
          feeding_price, foster_price, experience_years, introduction,
          services, phone, wechat, reputation_level: 'new', rating: 5.0, total_orders: 0, status: 1
        });
      }
      return res.json({ code: 200, msg: '注册成功（假数据模式）' });
    }
    
    // 检查是否已经是服务者
    const [exist] = await pool.query('SELECT id FROM pet_service_providers WHERE user_id = ?', [userId]);
    if (exist.length) {
      return res.json({ code: -1, msg: '您已经是服务者了' });
    }
    
    await pool.query(`
      INSERT INTO pet_service_providers 
      (user_id, nickname, service_type, location, address, feeding_price, foster_price,
       experience_years, introduction, services, phone, wechat, reputation_level, rating, total_orders, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 5.0, 0, 1)
    `, [userId, nickname, service_type, location, address, feeding_price, foster_price,
        experience_years, introduction, JSON.stringify(services), phone, wechat]);
    
    res.json({ code: 200, msg: '注册成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '注册失败' });
  }
});

// 8. 提交评价
app.post('/api/pet-service/review', checkLogin, async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { provider_id, order_id, rating, content, is_anonymous } = req.body;
    
    if (!provider_id || !rating) {
      return res.json({ code: -1, msg: '请填写评分' });
    }
    
    if (!dbConnected || fakeData.enabled) {
      if (fakeData.addPetServiceReview) {
        fakeData.addPetServiceReview({
          provider_id, reviewer_id: reviewerId, order_id, rating, content, is_anonymous: is_anonymous || 0, status: 1
        });
      }
      return res.json({ code: 200, msg: '评价成功（假数据模式）' });
    }
    
    await pool.query(`
      INSERT INTO pet_service_reviews 
      (provider_id, reviewer_id, order_id, rating, content, is_anonymous, status)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [provider_id, reviewerId, order_id, rating, content, is_anonymous || 0]);
    
    // 更新服务者平均评分
    await pool.query(`
      UPDATE pet_service_providers 
      SET rating = (SELECT AVG(rating) FROM pet_service_reviews WHERE provider_id = ? AND status = 1)
      WHERE id = ?
    `, [provider_id, provider_id]);
    
    res.json({ code: 200, msg: '评价成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '评价失败' });
  }
});

// 9. 响应需求
app.post('/api/pet-service/respond', checkLogin, async (req, res) => {
  try {
    const providerId = req.user.id;
    const { request_id } = req.body;
    
    if (!dbConnected || fakeData.enabled) {
      // 虚拟数据模式 - 记录响应
      const requests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      const request = requests.find(r => r.id === parseInt(request_id));
      if (!request) {
        return res.json({ code: 404, msg: '需求不存在' });
      }
      
      // 检查是否已响应
      const myResponses = fakeData.getMyResponses ? fakeData.getMyResponses(providerId) : [];
      if (myResponses.find(r => r.request_id === parseInt(request_id))) {
        return res.json({ code: 400, msg: '您已响应过此需求' });
      }
      
      // 创建响应记录
      if (!fakeData.getMyResponses) {
        fakeData.getMyResponses = (userId) => [];
      }
      const responses = fakeData.getMyResponses(providerId);
      responses.push({
        id: Date.now(),
        request_id: parseInt(request_id),
        provider_id: providerId,
        status: 'pending',
        create_time: new Date().toISOString()
      });
      
      // 增加响应计数
      request.response_count = (request.response_count || 0) + 1;
      
      return res.json({ code: 200, msg: '响应成功' });
    }
    
    // 检查是否已响应过
    const [existingResponse] = await pool.query(
      'SELECT id FROM pet_service_responses WHERE request_id = ? AND provider_id = ?',
      [request_id, providerId]
    );
    
    if (existingResponse.length > 0) {
      return res.json({ code: 400, msg: '您已响应过此需求' });
    }
    
    // 创建响应记录
    await pool.query(
      'INSERT INTO pet_service_responses (request_id, provider_id, status) VALUES (?, ?, "pending")',
      [request_id, providerId]
    );
    
    // 增加响应计数
    await pool.query(`
      UPDATE pet_service_requests 
      SET response_count = response_count + 1 
      WHERE id = ?
    `, [request_id]);
    
    res.json({ code: 200, msg: '响应成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '响应失败' });
  }
});

// 9.1 获取我响应的帖子列表
app.get('/api/pet-service/my-responses', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!dbConnected || fakeData.enabled) {
      const myResponses = fakeData.getMyResponses ? fakeData.getMyResponses(userId) : [];
      const requests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      
      // 合并响应记录和帖子信息
      const respondedRequests = myResponses.map(resp => {
        const request = requests.find(r => r.id === resp.request_id);
        if (request) {
          return {
            ...request,
            response_status: resp.status,
            response_time: resp.create_time
          };
        }
        return null;
      }).filter(r => r !== null);
      
      return res.json({ code: 200, data: respondedRequests });
    }
    
    // 查询我响应的帖子
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        u.user_name as publisher_name,
        resp.status as response_status,
        resp.create_time as response_time
      FROM pet_service_responses resp
      LEFT JOIN pet_service_requests r ON resp.request_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE resp.provider_id = ? AND r.status != 'closed'
      ORDER BY resp.create_time DESC
    `, [userId]);
    
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取响应列表失败' });
  }
});

// 10. 个人中心 - 获取我的所有数据
app.get('/api/pet-service/personal-center', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!dbConnected || fakeData.enabled) {
      const myRequests = fakeData.getPetServiceRequests ? 
        fakeData.getPetServiceRequests().filter(r => r.user_id === userId) : [];
      const myProviderInfo = fakeData.getPetServiceProviderByUserId ? 
        fakeData.getPetServiceProviderByUserId(userId) : null;
      
      // 获取我响应的帖子
      const myResponses = fakeData.getMyResponses ? fakeData.getMyResponses(userId) : [];
      const allRequests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      const myRespondedRequests = myResponses.map(resp => {
        const request = allRequests.find(r => r.id === resp.request_id);
        if (request) {
          return {
            ...request,
            response_status: resp.status,
            response_time: resp.create_time
          };
        }
        return null;
      }).filter(r => r !== null);
      
      return res.json({ 
        code: 200, 
        data: { 
          myRequests, 
          myProviderInfo,
          myRespondedRequests,
          civilizationScore: fakeData.getPetCivilizationScore ? 
            fakeData.getPetCivilizationScore(userId) : null
        } 
      });
    }
    
    // 获取我的求助帖
    const [myRequests] = await pool.query(`
      SELECT * FROM pet_service_requests 
      WHERE user_id = ? 
      ORDER BY create_time DESC
    `, [userId]);
    
    // 获取我的服务者信息
    const [myProviderInfo] = await pool.query(`
      SELECT 
        p.*,
        pcs.total_score as civilization_score
      FROM pet_service_providers p
      LEFT JOIN pet_civilization_score pcs ON p.user_id = pcs.user_id
      WHERE p.user_id = ?
    `, [userId]);
    
    // 获取我的文明养宠分数
    const [civilizationScore] = await pool.query(`
      SELECT * FROM pet_civilization_score 
      WHERE user_id = ?
    `, [userId]);
    
    // 获取我响应的帖子
    const [myRespondedRequests] = await pool.query(`
      SELECT 
        r.*,
        u.user_name as publisher_name,
        resp.status as response_status,
        resp.create_time as response_time
      FROM pet_service_responses resp
      LEFT JOIN pet_service_requests r ON resp.request_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE resp.provider_id = ? AND r.status != 'closed'
      ORDER BY resp.create_time DESC
    `, [userId]);
    
    res.json({ 
      code: 200, 
      data: { 
        myRequests, 
        myProviderInfo: myProviderInfo[0] || null,
        myRespondedRequests,
        civilizationScore: civilizationScore[0] || null
      } 
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取个人中心数据失败' });
  }
});

// 更新服务者头像
app.post('/api/pet-service/update-provider-avatar', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;

    if (!avatar) {
      return res.json({ code: 400, msg: '请上传头像' });
    }

    // 虚拟数据模式
    if (!dbConnected || fakeData.enabled) {
      const provider = fakeData.getPetServiceProviderByUserId(userId);
      if (!provider) {
        return res.json({ code: 404, msg: '您还不是服务者' });
      }
      // 更新假数据中的头像
      provider.avatar = avatar;
      return res.json({ code: 200, msg: '头像更新成功', data: { avatar } });
    }

    // 获取服务者ID
    const [providerRows] = await pool.query('SELECT id FROM pet_service_providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) {
      return res.json({ code: 404, msg: '您还不是服务者' });
    }
    const providerId = providerRows[0].id;

    // 更新头像
    await pool.query(
      'UPDATE pet_service_providers SET avatar = ? WHERE id = ?',
      [avatar, providerId]
    );

    res.json({ code: 200, msg: '头像更新成功', data: { avatar } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '头像更新失败' });
  }
});

// 获取我的评价（服务者查看别人给自己的评价）
app.get('/api/pet-service/my-reviews', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;

    // 先获取当前用户的服务者ID
    if (!dbConnected || fakeData.enabled) {
      const provider = fakeData.getPetServiceProviderByUserId(userId);
      if (!provider) {
        return res.json({ code: 404, msg: '您还不是服务者' });
      }
      const reviews = fakeData.getPetServiceReviews ? fakeData.getPetServiceReviews(provider.id) : [];
      return res.json({ code: 200, data: reviews });
    }

    // 获取服务者ID
    const [providerRows] = await pool.query('SELECT id FROM pet_service_providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) {
      return res.json({ code: 404, msg: '您还不是服务者' });
    }
    const providerId = providerRows[0].id;

    // 获取评价列表
    const [reviewRows] = await pool.query(`
      SELECT
        r.*,
        u.user_name as reviewer_name
      FROM pet_service_reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.provider_id = ? AND r.status = 1
      ORDER BY r.create_time DESC
    `, [providerId]);

    res.json({ code: 200, data: reviewRows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '获取评价失败' });
  }
});

// 更新服务者信息
app.post('/api/pet-service/update-provider', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, service_type, feeding_price, foster_price, location, phone, experience_years, introduction } = req.body;
    
    // 虚拟数据模式
    if (!dbConnected || fakeData.enabled) {
      const provider = fakeData.getPetServiceProviderByUserId(userId);
      if (!provider) {
        return res.json({ code: 404, msg: '您还不是服务者' });
      }
      // 更新虚拟数据
      provider.nickname = nickname;
      provider.service_type = service_type;
      provider.feeding_price = feeding_price || null;
      provider.foster_price = foster_price || null;
      provider.location = location;
      provider.phone = phone;
      provider.experience_years = experience_years || 0;
      provider.introduction = introduction || '';
      provider.update_time = new Date().toISOString();
      return res.json({ code: 200, msg: '服务者信息更新成功' });
    }
    
    // 检查是否已注册为服务者
    const [existing] = await pool.query('SELECT id FROM pet_service_providers WHERE user_id = ?', [userId]);
    if (existing.length === 0) {
      return res.json({ code: 404, msg: '您还不是服务者' });
    }
    
    // 更新服务者信息
    await pool.query(`
      UPDATE pet_service_providers 
      SET nickname = ?, service_type = ?, feeding_price = ?, foster_price = ?, 
          location = ?, phone = ?, experience_years = ?, introduction = ?, update_time = NOW()
      WHERE user_id = ?
    `, [nickname, service_type, feeding_price || null, foster_price || null, location, phone, experience_years || 0, introduction || '', userId]);
    
    res.json({ code: 200, msg: '服务者信息更新成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '更新服务者信息失败' });
  }
});

// 更新服务者头像
app.post('/api/pet-service/update-provider-avatar', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;
    
    // 虚拟数据模式
    if (!dbConnected || fakeData.enabled) {
      const provider = fakeData.getPetServiceProviderByUserId(userId);
      if (!provider) {
        return res.json({ code: 404, msg: '您还不是服务者' });
      }
      // 更新虚拟数据头像
      provider.avatar = avatar;
      provider.update_time = new Date().toISOString();
      return res.json({ code: 200, msg: '头像更新成功' });
    }
    
    // 检查是否已注册为服务者
    const [existing] = await pool.query('SELECT id FROM pet_service_providers WHERE user_id = ?', [userId]);
    if (existing.length === 0) {
      return res.json({ code: 404, msg: '您还不是服务者' });
    }
    
    // 更新头像
    await pool.query('UPDATE pet_service_providers SET avatar = ?, update_time = NOW() WHERE user_id = ?', [avatar, userId]);
    
    res.json({ code: 200, msg: '头像更新成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '更新头像失败' });
  }
});

// 更新需求
app.post('/api/pet-service/update-request', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, type, title, area, address, start_date, end_date, budget, pet_type, pet_breed, pet_age, pet_info, service_requirement, contact_info } = req.body;
    
    // 虚拟数据模式
    if (!dbConnected || fakeData.enabled) {
      const requests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      const request = requests.find(r => r.id === parseInt(id) && r.user_id === userId);
      if (!request) {
        return res.json({ code: 403, msg: '无权修改此需求' });
      }
      // 更新虚拟数据
      request.type = type;
      request.title = title;
      request.area = area;
      request.address = address || '';
      request.start_date = start_date;
      request.end_date = end_date;
      request.budget = budget || null;
      request.pet_type = pet_type;
      request.pet_breed = pet_breed || '';
      request.pet_age = pet_age || null;
      request.pet_info = pet_info || '';
      request.service_requirement = service_requirement || '';
      request.contact_info = contact_info;
      request.update_time = new Date().toISOString();
      return res.json({ code: 200, msg: '需求更新成功' });
    }
    
    // 检查是否是该用户发布的需求
    const [existing] = await pool.query('SELECT id FROM pet_service_requests WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.json({ code: 403, msg: '无权修改此需求' });
    }
    
    // 更新需求
    await pool.query(`
      UPDATE pet_service_requests 
      SET type = ?, title = ?, area = ?, address = ?, start_date = ?, end_date = ?, 
          budget = ?, pet_type = ?, pet_breed = ?, pet_age = ?, pet_info = ?, 
          service_requirement = ?, contact_info = ?, update_time = NOW()
      WHERE id = ? AND user_id = ?
    `, [type, title, area, address || '', start_date, end_date, budget || null, pet_type, pet_breed || '', pet_age || null, pet_info || '', service_requirement || '', contact_info, id, userId]);
    
    res.json({ code: 200, msg: '需求更新成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '更新需求失败' });
  }
});

// 删除需求
app.post('/api/pet-service/delete-request', checkLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { request_id } = req.body;
    
    // 虚拟数据模式
    if (!dbConnected || fakeData.enabled) {
      const requests = fakeData.getPetServiceRequests ? fakeData.getPetServiceRequests() : [];
      const request = requests.find(r => r.id === parseInt(request_id) && r.user_id === userId);
      if (!request) {
        return res.json({ code: 403, msg: '无权删除此需求' });
      }
      // 软删除虚拟数据
      request.status = 'closed';
      request.update_time = new Date().toISOString();
      return res.json({ code: 200, msg: '需求删除成功' });
    }
    
    // 检查是否是该用户发布的需求
    const [existing] = await pool.query('SELECT id FROM pet_service_requests WHERE id = ? AND user_id = ?', [request_id, userId]);
    if (existing.length === 0) {
      return res.json({ code: 403, msg: '无权删除此需求' });
    }
    
    // 删除需求（软删除，将状态改为closed）
    await pool.query('UPDATE pet_service_requests SET status = "closed", update_time = NOW() WHERE id = ? AND user_id = ?', [request_id, userId]);
    
    res.json({ code: 200, msg: '需求删除成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '删除需求失败' });
  }
});

// 检查数据库初始化状态，最多等待5秒
let checkCount = 0;
const maxChecks = 50; // 50 * 100ms = 5秒
const checkInterval = setInterval(() => {
  checkCount++;
  if (dbConnected || checkCount >= maxChecks) {
    clearInterval(checkInterval);
    startServer();
  }
}, 100);
