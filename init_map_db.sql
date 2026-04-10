
CREATE TABLE IF NOT EXISTS map_layers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'safe, warning, ban',
  path JSON NOT NULL,
  color VARCHAR(20) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_markers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'poi, event',
  lng DECIMAL(10, 6) NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 初始化默认数据
INSERT INTO map_layers (name, type, path, color) VALUES 
('推荐遛宠区（绿区）', 'safe', '[[116.397, 39.908], [116.399, 39.908], [116.399, 39.910], [116.397, 39.910]]', '#22c55e'),
('限制遛宠区（黄区）', 'warning', '[[116.396, 39.905], [116.398, 39.905], [116.398, 39.908], [116.396, 39.908]]', '#f59e0b'),
('禁止遛宠区（红区）', 'ban', '[[116.395, 39.900], [116.397, 39.900], [116.397, 39.902], [116.395, 39.902]]', '#ef4444');

INSERT INTO map_markers (name, type, lng, lat, info) VALUES 
('1号流浪猫安置点', 'poi', 116.397428, 39.909230, '余粮50% | 今日已投喂3次'),
('社区爱心投喂处', 'poi', 116.398500, 39.910500, '急需补粮 | 建议携带猫粮'),
('3号流浪狗投喂点', 'poi', 116.396800, 39.907800, '余粮80% | 有饮用水'),
('儿童区旁投喂点', 'poi', 116.395500, 39.904500, '禁止投喂大型犬粮');
