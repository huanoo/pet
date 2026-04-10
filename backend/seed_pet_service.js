const mysql = require('mysql2/promise');

async function seedData() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'gentlepet_db',
    charset: 'utf8mb4'
  });

  try {
    // 1. 创建表
    console.log('创建宠物服务相关表...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_service_providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        service_type ENUM('feeding', 'foster', 'both') NOT NULL,
        location VARCHAR(100) NOT NULL,
        address VARCHAR(200) DEFAULT NULL,
        feeding_price DECIMAL(10,2) DEFAULT NULL,
        foster_price DECIMAL(10,2) DEFAULT NULL,
        experience_years INT DEFAULT 0,
        introduction TEXT,
        services JSON,
        phone VARCHAR(20) DEFAULT NULL,
        wechat VARCHAR(50) DEFAULT NULL,
        reputation_level ENUM('new', 'bronze', 'silver', 'gold') DEFAULT 'new',
        rating DECIMAL(2,1) DEFAULT 5.0,
        total_orders INT DEFAULT 0,
        status TINYINT DEFAULT 1,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_user_id (user_id),
        KEY idx_service_type (service_type),
        KEY idx_location (location),
        KEY idx_reputation (reputation_level),
        KEY idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_service_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        order_id INT DEFAULT NULL,
        rating DECIMAL(2,1) NOT NULL,
        content TEXT,
        tags JSON,
        is_anonymous TINYINT DEFAULT 0,
        status TINYINT DEFAULT 1,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_provider_id (provider_id),
        KEY idx_reviewer_id (reviewer_id),
        KEY idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_service_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('feeding', 'foster') NOT NULL,
        title VARCHAR(100) NOT NULL,
        area VARCHAR(100) NOT NULL,
        address VARCHAR(200) DEFAULT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        budget DECIMAL(10,2) DEFAULT NULL,
        pet_type ENUM('cat', 'dog', 'other') NOT NULL,
        pet_breed VARCHAR(50) DEFAULT NULL,
        pet_age INT DEFAULT NULL,
        pet_info TEXT,
        service_requirement TEXT,
        contact_info VARCHAR(100) NOT NULL,
        status ENUM('open', 'closed', 'completed') DEFAULT 'open',
        response_count INT DEFAULT 0,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        KEY idx_type (type),
        KEY idx_status (status),
        KEY idx_area (area)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_service_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        provider_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        price DECIMAL(10,2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        remark TEXT,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_request_id (request_id),
        KEY idx_provider_id (provider_id),
        KEY idx_user_id (user_id),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建响应记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_service_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        provider_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
        message TEXT,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_unique_response (request_id, provider_id),
        KEY idx_provider_id (provider_id),
        KEY idx_request_id (request_id),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('表创建完成！');

    // 2. 清空旧数据
    console.log('清空旧数据...');
    await pool.query('DELETE FROM pet_service_reviews');
    await pool.query('DELETE FROM pet_service_orders');
    await pool.query('DELETE FROM pet_service_responses');
    await pool.query('DELETE FROM pet_service_requests');
    await pool.query('DELETE FROM pet_service_providers');

    // 3. 插入服务者数据
    console.log('插入服务者数据...');
    const providers = [
      {
        user_id: 1,
        nickname: '王小萌',
        avatar: 'https://picsum.photos/60/60?random=100',
        service_type: 'both',
        location: '朝阳区 · 望京SOHO附近',
        address: '望京SOHO T3',
        feeding_price: 40.00,
        foster_price: 60.00,
        experience_years: 5,
        introduction: '5年养宠经验，家有2猫1狗，提供上门喂养、寄养服务。可视频回访，每日发送宠物状态照片。熟悉各种宠物习性，能处理常见突发情况。',
        services: JSON.stringify(['上门喂食、换水', '清理猫砂/遛狗', '宠物陪玩', '视频回访', '健康观察']),
        phone: '138****1234',
        wechat: 'wangxiaomeng_pet',
        reputation_level: 'gold',
        rating: 5.0,
        total_orders: 328,
        status: 1
      },
      {
        user_id: 2,
        nickname: '李爱宠',
        avatar: 'https://picsum.photos/60/60?random=101',
        service_type: 'feeding',
        location: '海淀区 · 中关村附近',
        address: '中关村大街1号',
        feeding_price: 35.00,
        foster_price: null,
        experience_years: 3,
        introduction: '专业宠物护理师，持有宠物护理证书。擅长猫咪上门喂养，可处理紧急医疗情况。服务细致认真，深受宠物主人信赖。',
        services: JSON.stringify(['专业喂食护理', '健康监测', '紧急处理', '定期报告', '医疗协助']),
        phone: '139****5678',
        wechat: 'liaichong_2020',
        reputation_level: 'gold',
        rating: 4.8,
        total_orders: 256,
        status: 1
      },
      {
        user_id: 3,
        nickname: '陈阿姨',
        avatar: 'https://picsum.photos/60/60?random=102',
        service_type: 'foster',
        location: '丰台区 · 方庄小区',
        address: '方庄小区12号楼',
        feeding_price: null,
        foster_price: 50.00,
        experience_years: 8,
        introduction: '退休阿姨，时间充裕，家有宽敞小院。专门接收中小型犬寄养，每日遛弯2次，精心照顾。像对待自家孩子一样对待每一只宠物。',
        services: JSON.stringify(['宽敞寄养空间', '每日遛弯2次', '定时喂食', '陪伴玩耍', '视频通话']),
        phone: '136****9012',
        wechat: 'chenayi_pet',
        reputation_level: 'silver',
        rating: 4.9,
        total_orders: 189,
        status: 1
      },
      {
        user_id: 4,
        nickname: '赵小白',
        avatar: 'https://picsum.photos/60/60?random=103',
        service_type: 'both',
        location: '西城区 · 金融街附近',
        address: '金融街中心',
        feeding_price: 45.00,
        foster_price: 70.00,
        experience_years: 4,
        introduction: '宠物医院护士，专业医疗知识。提供上门喂养和寄养服务，可处理宠物常见疾病。专业背景让宠物主人更安心。',
        services: JSON.stringify(['医疗级护理', '健康检查', '疫苗提醒', '用药管理', '紧急救治']),
        phone: '137****3456',
        wechat: 'zhaoxiaobai_vet',
        reputation_level: 'silver',
        rating: 4.6,
        total_orders: 156,
        status: 1
      },
      {
        user_id: 5,
        nickname: '刘喵喵',
        avatar: 'https://picsum.photos/60/60?random=104',
        service_type: 'feeding',
        location: '东城区 · 王府井附近',
        address: '王府井大街88号',
        feeding_price: 30.00,
        foster_price: null,
        experience_years: 8,
        introduction: '猫咪专精，养猫8年经验。提供上门喂养、铲屎、陪玩服务，猫咪性格温和友好。价格实惠，服务周到。',
        services: JSON.stringify(['猫咪专精', '铲屎清洁', '陪玩互动', '毛发护理', '环境检查']),
        phone: '135****7890',
        wechat: 'liumiaomiao_cat',
        reputation_level: 'bronze',
        rating: 4.7,
        total_orders: 89,
        status: 1
      },
      {
        user_id: 6,
        nickname: '张狗狗',
        avatar: 'https://picsum.photos/60/60?random=105',
        service_type: 'foster',
        location: '通州区 · 梨园附近',
        address: '梨园狗舍',
        feeding_price: null,
        foster_price: 45.00,
        experience_years: 2,
        introduction: '训犬师出身，专业狗狗训练。提供寄养+训练服务，让您的狗狗在寄养期间也能学习新技能。虽然是新服务者，但专业度不输老手。',
        services: JSON.stringify(['专业训犬', '行为纠正', '寄养训练', '每日训练报告', '社交训练']),
        phone: '133****2468',
        wechat: 'zhangdoggie',
        reputation_level: 'new',
        rating: 5.0,
        total_orders: 23,
        status: 1
      }
    ];

    for (const provider of providers) {
      await pool.query(`
        INSERT INTO pet_service_providers 
        (user_id, nickname, avatar, service_type, location, address, feeding_price, foster_price, 
         experience_years, introduction, services, phone, wechat, reputation_level, rating, total_orders, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        provider.user_id, provider.nickname, provider.avatar, provider.service_type, 
        provider.location, provider.address, provider.feeding_price, provider.foster_price,
        provider.experience_years, provider.introduction, provider.services, provider.phone,
        provider.wechat, provider.reputation_level, provider.rating, provider.total_orders, provider.status
      ]);
    }
    console.log('服务者数据插入完成！');

    // 4. 插入评价数据
    console.log('插入评价数据...');
    const reviews = [
      { provider_id: 1, reviewer_id: 2, rating: 5.0, content: '非常专业，猫咪照顾得很好，每天发照片给我，很放心！', is_anonymous: 0 },
      { provider_id: 1, reviewer_id: 3, rating: 5.0, content: '服务态度很好，狗狗寄养回来很开心，推荐！', is_anonymous: 0 },
      { provider_id: 2, reviewer_id: 1, rating: 5.0, content: '很专业，发现猫咪有点不对劲及时告诉我，带去医院检查发现是轻微感冒。', is_anonymous: 0 },
      { provider_id: 2, reviewer_id: 4, rating: 4.0, content: '服务不错，就是价格稍微贵一点，但是值得。', is_anonymous: 0 },
      { provider_id: 3, reviewer_id: 1, rating: 5.0, content: '陈阿姨人特别好，我家狗狗寄养回来胖了一圈，很开心！', is_anonymous: 0 },
      { provider_id: 3, reviewer_id: 2, rating: 5.0, content: '阿姨很细心，每天发视频给我看狗狗，真的很放心。', is_anonymous: 0 },
      { provider_id: 4, reviewer_id: 5, rating: 5.0, content: '专业的就是不一样，我家猫咪需要定期吃药，小白处理得很好。', is_anonymous: 0 },
      { provider_id: 4, reviewer_id: 6, rating: 4.0, content: '服务专业，但是寄养价格稍高，不过医疗背景让人放心。', is_anonymous: 0 },
      { provider_id: 5, reviewer_id: 3, rating: 5.0, content: '性价比很高，对猫咪很有耐心，推荐！', is_anonymous: 0 },
      { provider_id: 5, reviewer_id: 4, rating: 4.0, content: '服务不错，就是有时候回复消息稍慢。', is_anonymous: 0 },
      { provider_id: 6, reviewer_id: 1, rating: 5.0, content: '狗狗寄养回来学会了很多指令，太惊喜了！', is_anonymous: 0 },
      { provider_id: 6, reviewer_id: 2, rating: 5.0, content: '虽然是新服务者，但是专业度很高，狗狗照顾得很好。', is_anonymous: 0 }
    ];

    for (const review of reviews) {
      await pool.query(`
        INSERT INTO pet_service_reviews (provider_id, reviewer_id, rating, content, is_anonymous, status)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [review.provider_id, review.reviewer_id, review.rating, review.content, review.is_anonymous]);
    }
    console.log('评价数据插入完成！');

    // 5. 插入需求帖子数据
    console.log('插入需求帖子数据...');
    const requests = [
      {
        user_id: 1,
        type: 'feeding',
        title: '寻找春节期间上门喂养猫咪',
        area: '朝阳区 · 国贸',
        address: '国贸公寓',
        start_date: '2024-02-08',
        end_date: '2024-02-17',
        budget: 50.00,
        pet_type: 'cat',
        pet_breed: '英短蓝猫',
        pet_age: 2,
        pet_info: '已绝育，性格温顺',
        service_requirement: '需要每天上门一次，喂食、铲屎、换水，偶尔陪玩10分钟',
        contact_info: '138****1111',
        status: 'open',
        response_count: 3
      },
      {
        user_id: 2,
        type: 'foster',
        title: '端午假期寻找金毛寄养家庭',
        area: '海淀区 · 西二旗',
        address: '西二旗小区',
        start_date: '2024-06-08',
        end_date: '2024-06-10',
        budget: 80.00,
        pet_type: 'dog',
        pet_breed: '金毛',
        pet_age: 3,
        pet_info: '公，性格友好不咬人，需要每天遛弯2次',
        service_requirement: '希望寄养家庭有院子或经常遛狗，自带狗粮',
        contact_info: '139****2222',
        status: 'open',
        response_count: 1
      },
      {
        user_id: 3,
        type: 'feeding',
        title: '出差一周，寻找上门喂养服务',
        area: '西城区 · 金融街',
        address: '金融街一号',
        start_date: '2024-03-15',
        end_date: '2024-03-22',
        budget: 45.00,
        pet_type: 'cat',
        pet_breed: '布偶猫',
        pet_age: 1,
        pet_info: '母，已绝育，性格温顺',
        service_requirement: '需要每天上门2次（早晚各一次），喂食、铲屎、梳毛',
        contact_info: '136****3333',
        status: 'open',
        response_count: 5
      },
      {
        user_id: 4,
        type: 'foster',
        title: '寻找长期寄养，因工作调动',
        area: '丰台区 · 丽泽桥',
        address: '丽泽家园',
        start_date: '2024-04-01',
        end_date: '2024-06-30',
        budget: 60.00,
        pet_type: 'cat',
        pet_breed: '橘猫+狸花',
        pet_age: 2,
        pet_info: '2只猫咪，都已绝育，性格乖巧',
        service_requirement: '因工作调动需要长期寄养3个月，希望找到有爱心的寄养家庭',
        contact_info: '137****4444',
        status: 'open',
        response_count: 2
      },
      {
        user_id: 5,
        type: 'feeding',
        title: '周末两天上门喂养',
        area: '东城区 · 东直门',
        address: '东直门内大街',
        start_date: '2024-01-20',
        end_date: '2024-01-21',
        budget: 35.00,
        pet_type: 'cat',
        pet_breed: '暹罗猫',
        pet_age: 3,
        pet_info: '公，活泼好动',
        service_requirement: '周末外出，需要每天上门一次，喂食、铲屎',
        contact_info: '135****5555',
        status: 'open',
        response_count: 2
      },
      {
        user_id: 6,
        type: 'foster',
        title: '春节假期寻找猫咪寄养',
        area: '通州区 · 九棵树',
        address: '九棵树小区',
        start_date: '2024-02-09',
        end_date: '2024-02-17',
        budget: 55.00,
        pet_type: 'cat',
        pet_breed: '美短',
        pet_age: 2,
        pet_info: '母，胆小但温顺',
        service_requirement: '春节回家，需要寄养8天，希望寄养家庭环境安静',
        contact_info: '133****6666',
        status: 'open',
        response_count: 1
      }
    ];

    for (const request of requests) {
      await pool.query(`
        INSERT INTO pet_service_requests 
        (user_id, type, title, area, address, start_date, end_date, budget, pet_type, pet_breed, 
         pet_age, pet_info, service_requirement, contact_info, status, response_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        request.user_id, request.type, request.title, request.area, request.address,
        request.start_date, request.end_date, request.budget, request.pet_type, request.pet_breed,
        request.pet_age, request.pet_info, request.service_requirement, request.contact_info,
        request.status, request.response_count
      ]);
    }
    console.log('需求帖子数据插入完成！');

    // 6. 插入一些响应记录（用于测试）
    console.log('插入响应记录数据...');
    const responses = [
      { request_id: 1, provider_id: 2, status: 'pending', message: '我可以帮忙，有时间' },
      { request_id: 1, provider_id: 3, status: 'pending', message: '经验丰富，可以接' },
      { request_id: 2, provider_id: 1, status: 'accepted', message: '没问题，可以寄养' },
      { request_id: 3, provider_id: 4, status: 'pending', message: '专业护理，放心交给我' },
      { request_id: 4, provider_id: 5, status: 'rejected', message: '时间冲突，抱歉' },
      { request_id: 5, provider_id: 6, status: 'pending', message: '可以接，周末有空' }
    ];

    for (const response of responses) {
      await pool.query(`
        INSERT INTO pet_service_responses (request_id, provider_id, status, message)
        VALUES (?, ?, ?, ?)
      `, [response.request_id, response.provider_id, response.status, response.message]);
    }
    console.log('响应记录数据插入完成！');

    console.log('\n✅ 所有数据插入成功！');
    console.log('📊 插入统计：');
    console.log('  - 服务者：6位');
    console.log('  - 评价：12条');
    console.log('  - 需求帖子：6条');
    console.log('  - 响应记录：6条');

  } catch (error) {
    console.error('❌ 错误：', error.message);
  } finally {
    await pool.end();
  }
}

seedData();
