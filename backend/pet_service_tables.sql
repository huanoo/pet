-- 宠物上门喂养与寄养服务相关数据库表

-- 1. 服务者信息表
CREATE TABLE IF NOT EXISTS pet_service_providers (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '服务者ID',
  `user_id` INT NOT NULL COMMENT '关联用户ID',
  `nickname` VARCHAR(50) NOT NULL COMMENT '服务者昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `service_type` ENUM('feeding', 'foster', 'both') NOT NULL COMMENT '服务类型:feeding上门喂养,foster寄养,both两者',
  `location` VARCHAR(100) NOT NULL COMMENT '服务区域',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '详细地址',
  `feeding_price` DECIMAL(10,2) DEFAULT NULL COMMENT '上门喂养价格(元/次)',
  `foster_price` DECIMAL(10,2) DEFAULT NULL COMMENT '寄养价格(元/天)',
  `experience_years` INT DEFAULT 0 COMMENT '从业经验(年)',
  `introduction` TEXT COMMENT '个人介绍',
  `services` JSON COMMENT '服务项目JSON数组',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `wechat` VARCHAR(50) DEFAULT NULL COMMENT '微信号',
  `reputation_level` ENUM('new', 'bronze', 'silver', 'gold') DEFAULT 'new' COMMENT '信誉等级',
  `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT '平均评分(1-5)',
  `total_orders` INT DEFAULT 0 COMMENT '完成订单数',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_id` (`user_id`),
  KEY `idx_service_type` (`service_type`),
  KEY `idx_location` (`location`),
  KEY `idx_reputation` (`reputation_level`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `fk_provider_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物服务者信息表';

-- 2. 服务评价表
CREATE TABLE IF NOT EXISTS pet_service_reviews (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `provider_id` INT NOT NULL COMMENT '被评价服务者ID',
  `reviewer_id` INT NOT NULL COMMENT '评价用户ID',
  `order_id` INT DEFAULT NULL COMMENT '关联订单ID',
  `rating` DECIMAL(2,1) NOT NULL COMMENT '评分(1-5)',
  `content` TEXT COMMENT '评价内容',
  `tags` JSON COMMENT '评价标签JSON数组',
  `is_anonymous` TINYINT DEFAULT 0 COMMENT '是否匿名:0否,1是',
  `status` TINYINT DEFAULT 1 COMMENT '状态:0隐藏,1显示',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `fk_review_provider` FOREIGN KEY (`provider_id`) REFERENCES `pet_service_providers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物服务评价表';

-- 3. 服务需求帖子表
CREATE TABLE IF NOT EXISTS pet_service_requests (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '需求ID',
  `user_id` INT NOT NULL COMMENT '发布用户ID',
  `type` ENUM('feeding', 'foster') NOT NULL COMMENT '需求类型',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `area` VARCHAR(100) NOT NULL COMMENT '所在区域',
  `address` VARCHAR(200) DEFAULT NULL COMMENT '详细地址',
  `start_date` DATE NOT NULL COMMENT '服务开始日期',
  `end_date` DATE NOT NULL COMMENT '服务结束日期',
  `budget` DECIMAL(10,2) DEFAULT NULL COMMENT '预算价格',
  `pet_type` ENUM('cat', 'dog', 'other') NOT NULL COMMENT '宠物类型',
  `pet_breed` VARCHAR(50) DEFAULT NULL COMMENT '宠物品种',
  `pet_age` INT DEFAULT NULL COMMENT '宠物年龄',
  `pet_info` TEXT COMMENT '宠物详细信息',
  `service_requirement` TEXT COMMENT '服务需求说明',
  `contact_info` VARCHAR(100) NOT NULL COMMENT '联系方式',
  `status` ENUM('open', 'closed', 'completed') DEFAULT 'open' COMMENT '状态:open进行中,closed已关闭,completed已完成',
  `response_count` INT DEFAULT 0 COMMENT '响应人数',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_area` (`area`),
  CONSTRAINT `fk_request_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物服务需求帖子表';

-- 4. 服务订单表
CREATE TABLE IF NOT EXISTS pet_service_orders (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `request_id` INT NOT NULL COMMENT '关联需求ID',
  `provider_id` INT NOT NULL COMMENT '服务者ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `status` ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  `price` DECIMAL(10,2) NOT NULL COMMENT '成交价格',
  `start_date` DATE NOT NULL COMMENT '服务开始日期',
  `end_date` DATE NOT NULL COMMENT '服务结束日期',
  `remark` TEXT COMMENT '备注',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_order_request` FOREIGN KEY (`request_id`) REFERENCES `pet_service_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_provider` FOREIGN KEY (`provider_id`) REFERENCES `pet_service_providers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物服务订单表';

-- 插入示例服务者数据
INSERT INTO pet_service_providers 
(user_id, nickname, avatar, service_type, location, address, feeding_price, foster_price, experience_years, introduction, services, phone, wechat, reputation_level, rating, total_orders, status) 
VALUES
(1, '王小萌', 'https://picsum.photos/60/60?random=100', 'both', '朝阳区 · 望京SOHO附近', '望京SOHO T3', 40.00, 60.00, 5, '5年养宠经验，家有2猫1狗，提供上门喂养、寄养服务。可视频回访，每日发送宠物状态照片。熟悉各种宠物习性，能处理常见突发情况。', '["上门喂食、换水", "清理猫砂/遛狗", "宠物陪玩", "视频回访", "健康观察"]', '138****1234', 'wangxiaomeng_pet', 'gold', 5.0, 328, 1),
(2, '李爱宠', 'https://picsum.photos/60/60?random=101', 'feeding', '海淀区 · 中关村附近', '中关村大街1号', 35.00, NULL, 3, '专业宠物护理师，持有宠物护理证书。擅长猫咪上门喂养，可处理紧急医疗情况。服务细致认真，深受宠物主人信赖。', '["专业喂食护理", "健康监测", "紧急处理", "定期报告", "医疗协助"]', '139****5678', 'liaichong_2020', 'gold', 4.8, 256, 1),
(3, '陈阿姨', 'https://picsum.photos/60/60?random=102', 'foster', '丰台区 · 方庄小区', '方庄小区12号楼', NULL, 50.00, 8, '退休阿姨，时间充裕，家有宽敞小院。专门接收中小型犬寄养，每日遛弯2次，精心照顾。像对待自家孩子一样对待每一只宠物。', '["宽敞寄养空间", "每日遛弯2次", "定时喂食", "陪伴玩耍", "视频通话"]', '136****9012', 'chenayi_pet', 'silver', 4.9, 189, 1),
(4, '赵小白', 'https://picsum.photos/60/60?random=103', 'both', '西城区 · 金融街附近', '金融街中心', 45.00, 70.00, 4, '宠物医院护士，专业医疗知识。提供上门喂养和寄养服务，可处理宠物常见疾病。专业背景让宠物主人更安心。', '["医疗级护理", "健康检查", "疫苗提醒", "用药管理", "紧急救治"]', '137****3456', 'zhaoxiaobai_vet', 'silver', 4.6, 156, 1),
(5, '刘喵喵', 'https://picsum.photos/60/60?random=104', 'feeding', '东城区 · 王府井附近', '王府井大街88号', 30.00, NULL, 8, '猫咪专精，养猫8年经验。提供上门喂养、铲屎、陪玩服务，猫咪性格温和友好。价格实惠，服务周到。', '["猫咪专精", "铲屎清洁", "陪玩互动", "毛发护理", "环境检查"]', '135****7890', 'liumiaomiao_cat', 'bronze', 4.7, 89, 1),
(6, '张狗狗', 'https://picsum.photos/60/60?random=105', 'foster', '通州区 · 梨园附近', '梨园狗舍', NULL, 45.00, 2, '训犬师出身，专业狗狗训练。提供寄养+训练服务，让您的狗狗在寄养期间也能学习新技能。虽然是新服务者，但专业度不输老手。', '["专业训犬", "行为纠正", "寄养训练", "每日训练报告", "社交训练"]', '133****2468', 'zhangdoggie', 'new', 5.0, 23, 1);

-- 插入示例评价数据
INSERT INTO pet_service_reviews (provider_id, reviewer_id, rating, content, is_anonymous, status) VALUES
(1, 2, 5.0, '非常专业，猫咪照顾得很好，每天发照片给我，很放心！', 0, 1),
(1, 3, 5.0, '服务态度很好，狗狗寄养回来很开心，推荐！', 0, 1),
(2, 1, 5.0, '很专业，发现猫咪有点不对劲及时告诉我，带去医院检查发现是轻微感冒。', 0, 1),
(2, 4, 4.0, '服务不错，就是价格稍微贵一点，但是值得。', 0, 1),
(3, 1, 5.0, '陈阿姨人特别好，我家狗狗寄养回来胖了一圈，很开心！', 0, 1),
(3, 2, 5.0, '阿姨很细心，每天发视频给我看狗狗，真的很放心。', 0, 1),
(4, 5, 5.0, '专业的就是不一样，我家猫咪需要定期吃药，小白处理得很好。', 0, 1),
(4, 6, 4.0, '服务专业，但是寄养价格稍高，不过医疗背景让人放心。', 0, 1),
(5, 3, 5.0, '性价比很高，对猫咪很有耐心，推荐！', 0, 1),
(5, 4, 4.0, '服务不错，就是有时候回复消息稍慢。', 0, 1),
(6, 1, 5.0, '狗狗寄养回来学会了很多指令，太惊喜了！', 0, 1),
(6, 2, 5.0, '虽然是新服务者，但是专业度很高，狗狗照顾得很好。', 0, 1);

-- 5. 需求响应记录表
CREATE TABLE IF NOT EXISTS pet_service_responses (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '响应ID',
  `request_id` INT NOT NULL COMMENT '需求ID',
  `provider_id` INT NOT NULL COMMENT '响应服务者ID',
  `status` ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending' COMMENT '状态:pending待处理,accepted已接受,rejected已拒绝,cancelled已取消',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_request_provider` (`request_id`, `provider_id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_provider_id` (`provider_id`),
  CONSTRAINT `fk_response_request` FOREIGN KEY (`request_id`) REFERENCES `pet_service_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_response_provider` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求响应记录表';

-- 插入示例需求帖子数据
INSERT INTO pet_service_requests 
(user_id, type, title, area, address, start_date, end_date, budget, pet_type, pet_breed, pet_age, pet_info, service_requirement, contact_info, status, response_count) 
VALUES
(1, 'feeding', '寻找春节期间上门喂养猫咪', '朝阳区 · 国贸', '国贸公寓', '2024-02-08', '2024-02-17', 50.00, 'cat', '英短蓝猫', 2, '已绝育，性格温顺', '需要每天上门一次，喂食、铲屎、换水，偶尔陪玩10分钟', '138****1111', 'open', 3),
(2, 'foster', '端午假期寻找金毛寄养家庭', '海淀区 · 西二旗', '西二旗小区', '2024-06-08', '2024-06-10', 80.00, 'dog', '金毛', 3, '公，性格友好不咬人，需要每天遛弯2次', '希望寄养家庭有院子或经常遛狗，自带狗粮', '139****2222', 'open', 1),
(3, 'feeding', '出差一周，寻找上门喂养服务', '西城区 · 金融街', '金融街一号', '2024-03-15', '2024-03-22', 45.00, 'cat', '布偶猫', 1, '母，已绝育，性格温顺', '需要每天上门2次（早晚各一次），喂食、铲屎、梳毛', '136****3333', 'open', 5),
(4, 'foster', '寻找长期寄养，因工作调动', '丰台区 · 丽泽桥', '丽泽家园', '2024-04-01', '2024-06-30', 60.00, 'cat', '橘猫+狸花', 2, '2只猫咪，都已绝育，性格乖巧', '因工作调动需要长期寄养3个月，希望找到有爱心的寄养家庭', '137****4444', 'open', 2);
