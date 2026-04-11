/**
 * 假数据模块 - 为所有数据库表提供模拟数据
 * 当数据库不可用时，系统会自动返回这些假数据
 */

// 假数据开关 - 设置为 false，只在数据库连接失败时使用假数据
const FAKE_DATA_ENABLED = false;

// ===== 用户数据 =====
const fakeUsers = [
  { id: 1, tel: '13800138000', user_name: '张三', user_type: 'user', community_id: 1 },
  { id: 2, tel: '13800138001', user_name: '李四', user_type: 'user', community_id: 1 },
  { id: 3, tel: '13800138002', user_name: '王五', user_type: 'user', community_id: 2 },
  { id: 4, tel: '13800138003', user_name: '赵六', user_type: 'user', community_id: 2 },
  { id: 5, tel: '13800138004', user_name: '钱七', user_type: 'user', community_id: 3 },
  { id: 6, tel: '13800138005', user_name: '孙八', user_type: 'user', community_id: 3 },
  { id: 7, tel: '13800138006', user_name: '周九', user_type: 'user', community_id: 1 },
  { id: 8, tel: '13800138007', user_name: '吴十', user_type: 'user', community_id: 2 },
  { id: 9, tel: '13800138008', user_name: '郑十一', user_type: 'user', community_id: 3 },
  { id: 10, tel: '13800138009', user_name: '陈十二', user_type: 'user', community_id: 1 },
  { id: 11, tel: '13800138010', user_name: '管理员', user_type: 'admin', community_id: null },
  { id: 12, tel: '13800138011', user_name: '刘十三', user_type: 'user', community_id: 1 },
  { id: 13, tel: '13800138012', user_name: '黄十四', user_type: 'user', community_id: 2 },
  { id: 14, tel: '13800138013', user_name: '林十五', user_type: 'user', community_id: 3 },
  { id: 15, tel: '13800138014', user_name: '何十六', user_type: 'user', community_id: 1 },
];

// ===== 社区数据 =====
const fakeCommunities = [
  { id: 1, name: '阳光花园小区' },
  { id: 2, name: '翠湖天地社区' },
  { id: 3, name: '金色家园小区' },
  { id: 4, name: '紫云苑社区' },
  { id: 5, name: '绿城小区' },
];

// ===== 宠物数据 =====
const fakePets = [
  { id: 1, user_id: 1, pet_name: '小白', pet_breed: '金毛犬', pet_age: 3, pet_vaccine: '已接种', pet_cert_id: 'PET2024001', pet_register_time: '2024-01-15', pet_avatar: '', create_time: '2024-01-15 10:30:00' },
  { id: 2, user_id: 1, pet_name: '咪咪', pet_breed: '英短猫', pet_age: 2, pet_vaccine: '已接种', pet_cert_id: 'PET2024002', pet_avatar: '', create_time: '2024-02-20 14:20:00' },
  { id: 3, user_id: 2, pet_name: '旺财', pet_breed: '哈士奇', pet_age: 4, pet_vaccine: '已接种', pet_cert_id: 'PET2024003', pet_avatar: '', create_time: '2024-01-10 09:15:00' },
  { id: 4, user_id: 3, pet_name: '花花', pet_breed: '布偶猫', pet_age: 1, pet_vaccine: '已接种', pet_cert_id: 'PET2024004', pet_avatar: '', create_time: '2024-03-05 16:45:00' },
  { id: 5, user_id: 4, pet_name: '大黄', pet_breed: '中华田园犬', pet_age: 5, pet_vaccine: '已接种', pet_cert_id: 'PET2024005', pet_avatar: '', create_time: '2024-01-20 11:00:00' },
  { id: 6, user_id: 5, pet_name: '豆豆', pet_breed: '泰迪犬', pet_age: 2, pet_vaccine: '已接种', pet_cert_id: 'PET2024006', pet_avatar: '', create_time: '2024-02-10 13:30:00' },
  { id: 7, user_id: 6, pet_name: '橘子', pet_breed: '橘猫', pet_age: 3, pet_vaccine: '已接种', pet_cert_id: 'PET2024007', pet_avatar: '', create_time: '2024-03-12 15:20:00' },
  { id: 8, user_id: 7, pet_name: '黑豹', pet_breed: '拉布拉多', pet_age: 4, pet_vaccine: '已接种', pet_cert_id: 'PET2024008', pet_avatar: '', create_time: '2024-01-25 10:00:00' },
  { id: 9, user_id: 8, pet_name: '雪球', pet_breed: '萨摩耶', pet_age: 2, pet_vaccine: '已接种', pet_cert_id: 'PET2024009', pet_avatar: '', create_time: '2024-02-28 14:00:00' },
  { id: 10, user_id: 9, pet_name: '可乐', pet_breed: '柯基犬', pet_age: 1, pet_vaccine: '已接种', pet_cert_id: 'PET2024010', pet_avatar: '', create_time: '2024-03-18 09:30:00' },
  { id: 11, user_id: 10, pet_name: '布丁', pet_breed: '美短猫', pet_age: 2, pet_vaccine: '已接种', pet_cert_id: 'PET2024011', pet_avatar: '', create_time: '2024-02-15 11:45:00' },
  { id: 12, user_id: 12, pet_name: '奥利奥', pet_breed: '边牧', pet_age: 3, pet_vaccine: '已接种', pet_cert_id: 'PET2024012', pet_avatar: '', create_time: '2024-01-30 16:00:00' },
  { id: 13, user_id: 13, pet_name: '奶茶', pet_breed: '博美犬', pet_age: 2, pet_vaccine: '已接种', pet_cert_id: 'PET2024013', pet_avatar: '', create_time: '2024-02-22 10:20:00' },
  { id: 14, user_id: 14, pet_name: '年糕', pet_breed: '暹罗猫', pet_age: 1, pet_vaccine: '已接种', pet_cert_id: 'PET2024014', pet_avatar: '', create_time: '2024-03-25 14:30:00' },
  { id: 15, user_id: 15, pet_name: '汤圆', pet_breed: '柴犬', pet_age: 3, pet_vaccine: '已接种', pet_cert_id: 'PET2024015', pet_avatar: '', create_time: '2024-02-08 09:00:00' },
];

// ===== 公告数据 =====
const fakeAnnouncements = [
  { id: 1, title: '关于文明养宠的温馨提示', content: '请各位业主文明养宠，出门遛狗请牵绳，及时清理宠物粪便，共同维护小区环境。', is_top: 1, publish_time: '2024-03-15 09:00:00', created_at: '2024-03-15 09:00:00' },
  { id: 2, title: '春季宠物疫苗接种通知', content: '春季是宠物疾病高发期，请各位宠物主人及时为宠物接种疫苗，保障宠物健康。', is_top: 1, publish_time: '2024-03-10 10:30:00', created_at: '2024-03-10 10:30:00' },
  { id: 3, title: '社区宠物登记开始啦', content: '为更好地管理社区宠物，现开展宠物登记工作，请携带宠物证件到物业登记。', is_top: 0, publish_time: '2024-03-05 14:00:00', created_at: '2024-03-05 14:00:00' },
  { id: 4, title: '关于禁止饲养烈性犬的通知', content: '根据相关规定，本社区禁止饲养烈性犬，请相关业主在7日内妥善处理。', is_top: 0, publish_time: '2024-02-28 09:30:00', created_at: '2024-02-28 09:30:00' },
  { id: 5, title: '宠物友好社区活动预告', content: '本周六上午9点将在社区广场举办宠物运动会，欢迎携带爱宠参加！', is_top: 0, publish_time: '2024-03-20 16:00:00', created_at: '2024-03-20 16:00:00' },
];

// ===== 违规类型数据 =====
const fakeViolationTypes = [
  { id: 1, type_name: '未牵绳遛狗', deduction_score: 5 },
  { id: 2, type_name: '未清理宠物粪便', deduction_score: 3 },
  { id: 3, type_name: '宠物噪音扰民', deduction_score: 2 },
  { id: 4, type_name: '未接种疫苗', deduction_score: 10 },
  { id: 5, type_name: '无证养宠', deduction_score: 8 },
  { id: 6, type_name: '宠物进入公共区域', deduction_score: 3 },
  { id: 7, type_name: '宠物呕吐物未清理', deduction_score: 2 },
  { id: 8, type_name: '违规饲养烈性犬', deduction_score: 20 },
  { id: 9, type_name: '宠物攻击他人', deduction_score: 15 },
];

// ===== 违规记录数据 =====
const fakeViolationRecords = [
  { id: 1, pet_id: 1, user_id: 1, community_id: 1, violation_type_id: 1, violation_time: '2024-03-10 08:30:00', violation_desc: '在小区花园遛狗未牵绳', handle_status: 'resolved', handle_result: '已教育并警告', handler: '管理员', pet_name: '小白', type_name: '未牵绳遛狗', deduction_score: 5, owner_name: '张三', owner_tel: '13800138000' },
  { id: 2, pet_id: 3, user_id: 2, community_id: 1, violation_type_id: 2, violation_time: '2024-03-12 19:00:00', violation_desc: '未及时清理宠物粪便', handle_status: 'resolved', handle_result: '已清理并教育', handler: '管理员', pet_name: '旺财', type_name: '未清理宠物粪便', deduction_score: 3, owner_name: '李四', owner_tel: '13800138001' },
  { id: 3, pet_id: 5, user_id: 4, community_id: 2, violation_type_id: 3, violation_time: '2024-03-14 22:00:00', violation_desc: '夜间犬吠扰民', handle_status: 'pending', handle_result: '', handler: '管理员', pet_name: '大黄', type_name: '宠物噪音扰民', deduction_score: 2, owner_name: '赵六', owner_tel: '13800138003' },
  { id: 4, pet_id: 6, user_id: 5, community_id: 3, violation_type_id: 6, violation_time: '2024-03-16 15:00:00', violation_desc: '携带宠物进入儿童游乐场', handle_status: 'resolved', handle_result: '已劝离', handler: '管理员', pet_name: '豆豆', type_name: '宠物进入公共区域', deduction_score: 3, owner_name: '钱七', owner_tel: '13800138004' },
  { id: 5, pet_id: 8, user_id: 7, community_id: 1, violation_type_id: 1, violation_time: '2024-03-18 07:00:00', violation_desc: '晨练时未牵绳', handle_status: 'pending', handle_result: '', handler: '管理员', pet_name: '黑豹', type_name: '未牵绳遛狗', deduction_score: 5, owner_name: '周九', owner_tel: '13800138006' },
];

// ===== 文明分数数据 =====
const fakePetCivilizationScores = [
  { id: 1, user_id: 1, community_id: 1, base_score: 100, bonus_score: 20, total_score: 95, leash_deduction: 5, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 2, user_id: 2, community_id: 1, base_score: 100, bonus_score: 20, total_score: 97, leash_deduction: 0, feces_deduction: 3, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 3, user_id: 3, community_id: 2, base_score: 100, bonus_score: 20, total_score: 100, leash_deduction: 0, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 4, user_id: 4, community_id: 2, base_score: 100, bonus_score: 0, total_score: 98, leash_deduction: 0, feces_deduction: 0, noise_deduction: 2, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 5, user_id: 5, community_id: 3, base_score: 100, bonus_score: 20, total_score: 97, leash_deduction: 0, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 3, other_deduction: 0 },
  { id: 6, user_id: 6, community_id: 3, base_score: 100, bonus_score: 20, total_score: 100, leash_deduction: 0, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 7, user_id: 7, community_id: 1, base_score: 100, bonus_score: 20, total_score: 95, leash_deduction: 5, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 8, user_id: 8, community_id: 2, base_score: 100, bonus_score: 20, total_score: 100, leash_deduction: 0, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 9, user_id: 9, community_id: 3, base_score: 100, bonus_score: 20, total_score: 100, leash_deduction: 0, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
  { id: 10, user_id: 10, community_id: 1, base_score: 100, bonus_score: 20, total_score: 100, leash_deduction: 0, feces_deduction: 0, noise_deduction: 0, vaccine_deduction: 0, cert_deduction: 0, public_area_deduction: 0, other_deduction: 0 },
];

// ===== 社区文明分数数据 =====
const fakeCommunityCivilizationScores = [
  { community_id: 1, month_01: 82.5, month_02: 78.0, month_03: 85.2, month_04: 90.0, month_05: 88.5, month_06: 92.0, month_07: 89.5, month_08: 93.0, month_09: 87.2, month_10: 91.5, month_11: 94.8, month_12: 96.0 },
  { community_id: 2, month_01: 75.0, month_02: 72.5, month_03: 78.0, month_04: 82.0, month_05: 85.0, month_06: 88.0, month_07: 86.5, month_08: 90.0, month_09: 88.5, month_10: 92.0, month_11: 90.2, month_12: 93.5 },
  { community_id: 3, month_01: 88.0, month_02: 85.5, month_03: 82.0, month_04: 86.0, month_05: 89.5, month_06: 87.0, month_07: 90.5, month_08: 92.0, month_09: 89.5, month_10: 94.0, month_11: 91.5, month_12: 95.0 },
  { community_id: 4, month_01: 70.0, month_02: 75.0, month_03: 78.0, month_04: 72.0, month_05: 79.5, month_06: 83.0, month_07: 86.5, month_08: 89.0, month_09: 84.5, month_10: 87.0, month_11: 90.2, month_12: 92.5 },
  { community_id: 5, month_01: 85.0, month_02: 88.5, month_03: 90.0, month_04: 87.0, month_05: 84.5, month_06: 82.0, month_07: 85.5, month_08: 88.0, month_09: 91.5, month_10: 93.0, month_11: 90.8, month_12: 94.0 },
];

// ===== 地图图层数据 =====
const fakeMapLayers = [
  { id: 1, name: '推荐遛宠区（绿区）', type: 'safe', path: [[116.397, 39.908], [116.399, 39.908], [116.399, 39.910], [116.397, 39.910]], color: '#22c55e', created_at: '2024-01-01' },
  { id: 2, name: '限制遛宠区（黄区）', type: 'warning', path: [[116.396, 39.905], [116.398, 39.905], [116.398, 39.908], [116.396, 39.908]], color: '#f59e0b', created_at: '2024-01-01' },
  { id: 3, name: '禁止遛宠区（红区）', type: 'ban', path: [[116.395, 39.900], [116.397, 39.900], [116.397, 39.902], [116.395, 39.902]], color: '#ef4444', created_at: '2024-01-01' },
];

// ===== 地图标记数据 =====
const fakeMapMarkers = [
  { id: 1, name: '1号流浪猫安置点', type: 'poi', lng: 116.397428, lat: 39.909230, info: '余粮50% | 今日已投喂3次', created_at: '2024-01-01' },
  { id: 2, name: '社区爱心投喂处', type: 'poi', lng: 116.398500, lat: 39.910500, info: '急需补粮 | 建议携带猫粮', created_at: '2024-01-01' },
  { id: 3, name: '3号流浪狗投喂点', type: 'poi', lng: 116.396800, lat: 39.907800, info: '余粮80% | 有饮用水', created_at: '2024-01-01' },
  { id: 4, name: '儿童区旁投喂点', type: 'poi', lng: 116.395500, lat: 39.904500, info: '禁止投喂大型犬粮', created_at: '2024-01-01' },
  { id: 5, name: '发现流浪狗', type: 'event', lng: 116.398000, lat: 39.909000, info: '用户上报隐患', created_at: '2024-03-20 10:30:00' },
  { id: 6, name: '宠物粪便未清理', type: 'event', lng: 116.397500, lat: 39.908500, info: '用户上报隐患', created_at: '2024-03-19 15:20:00' },
];

// ===== 宠物医院数据 =====
const fakePetHospitals = [
  { id: 1, name: '萌宠安康宠物医院', address: '社区西侧商业街102号', tel: '010-66668888', lng: 116.396, lat: 39.911, opening_hours: '09:00-21:00' },
  { id: 2, name: '爱心宠物诊所', address: '幸福路28号', tel: '010-55554444', lng: 116.400, lat: 39.907, opening_hours: '24小时营业' },
  { id: 3, name: '和谐社区宠物服务中心', address: '北门路15号', tel: '010-88887777', lng: 116.394, lat: 39.908, opening_hours: '08:30-20:00' }
];

// ===== 宠物商店数据 =====
const fakePetShops = [
  { id: 1, name: '宠友之家精品店', address: '社区东门外30米', tel: '010-12345678', lng: 116.399, lat: 39.912, opening_hours: '10:00-22:00', category: 'shop' },
  { id: 2, name: '淘气猫宠物生活馆', address: '商业广场B1层', tel: '010-87654321', lng: 116.395, lat: 39.905, opening_hours: '10:00-21:30', category: 'grooming' },
  { id: 3, name: '汪星人零食工坊', address: '西门路口5号', tel: '010-99990000', lng: 116.398, lat: 39.904, opening_hours: '09:00-19:00', category: 'shop' }
];

// ===== 宠物服务需求数据 =====
const fakePetServiceRequests = [
  { id: 1, user_id: 1, type: 'feeding', title: '寻找春节期间上门喂养猫咪', area: '朝阳区 · 国贸', address: '国贸公寓', start_date: '2024-02-08', end_date: '2024-02-17', budget: 50.00, pet_type: 'cat', pet_breed: '英短蓝猫', pet_age: 2, pet_info: '已绝育，性格温顺', service_requirement: '需要每天上门一次，喂食、铲屎、换水，偶尔陪玩10分钟', contact_info: '138****1111', status: 'open', response_count: 3, publisher_name: '张三', create_time: '2024-01-15T10:00:00' },
  { id: 2, user_id: 2, type: 'foster', title: '端午假期寻找金毛寄养家庭', area: '海淀区 · 西二旗', address: '西二旗小区', start_date: '2024-06-08', end_date: '2024-06-10', budget: 80.00, pet_type: 'dog', pet_breed: '金毛', pet_age: 3, pet_info: '公，性格友好不咬人，需要每天遛弯2次', service_requirement: '希望寄养家庭有院子或经常遛狗，自带狗粮', contact_info: '139****2222', status: 'open', response_count: 1, publisher_name: '李四', create_time: '2024-01-16T11:00:00' },
  { id: 3, user_id: 3, type: 'feeding', title: '出差一周，寻找上门喂养服务', area: '西城区 · 金融街', address: '金融街一号', start_date: '2024-03-15', end_date: '2024-03-22', budget: 45.00, pet_type: 'cat', pet_breed: '布偶猫', pet_age: 1, pet_info: '母，已绝育，性格温顺', service_requirement: '需要每天上门2次（早晚各一次），喂食、铲屎、梳毛', contact_info: '136****3333', status: 'open', response_count: 5, publisher_name: '王五', create_time: '2024-01-17T12:00:00' },
  { id: 4, user_id: 4, type: 'foster', title: '寻找长期寄养，因工作调动', area: '丰台区 · 丽泽桥', address: '丽泽家园', start_date: '2024-04-01', end_date: '2024-06-30', budget: 60.00, pet_type: 'cat', pet_breed: '橘猫+狸花', pet_age: 2, pet_info: '2只猫咪，都已绝育，性格乖巧', service_requirement: '因工作调动需要长期寄养3个月，希望找到有爱心的寄养家庭', contact_info: '137****4444', status: 'open', response_count: 2, publisher_name: '赵六', create_time: '2024-01-18T13:00:00' },
];

// ===== 宠物服务者数据 =====
const fakePetServiceProviders = [
  { id: 1, user_id: 1, nickname: '王小萌', avatar: 'https://picsum.photos/60/60?random=100', service_type: 'both', location: '朝阳区 · 望京SOHO附近', address: '望京SOHO T3', feeding_price: 40.00, foster_price: 60.00, experience_years: 5, introduction: '5年养宠经验，家有2猫1狗，提供上门喂养、寄养服务。专业、细心、有爱心，深受客户好评。', services: '["上门喂食、换水", "清理猫砂/遛狗", "宠物陪玩"]', phone: '13800138000', wechat: 'wangxiaomeng_pet', reputation_level: 'gold', rating: 5.0, total_orders: 328, status: 1, create_time: '2024-01-01', civility_score: 95 },
  { id: 2, user_id: 2, nickname: '李爱宠', avatar: 'https://picsum.photos/60/60?random=101', service_type: 'feeding', location: '海淀区 · 中关村附近', address: '中关村大街1号', feeding_price: 35.00, foster_price: null, experience_years: 3, introduction: '专业宠物护理师，持有宠物护理证书。擅长猫咪护理，对宠物行为有深入研究。', services: '["专业喂食护理", "健康监测", "紧急处理"]', phone: '13800138001', wechat: 'liaichong_2020', reputation_level: 'gold', rating: 4.8, total_orders: 256, status: 1, create_time: '2024-01-01', civility_score: 92 },
  { id: 3, user_id: 3, nickname: '张宠物', avatar: 'https://picsum.photos/60/60?random=102', service_type: 'foster', location: '西城区 · 金融街附近', address: '金融街一号院', feeding_price: null, foster_price: 80.00, experience_years: 4, introduction: '家庭式寄养，环境温馨，24小时陪伴。有独立宠物房间和户外活动空间。', services: '["家庭寄养", "24小时看护", "每日视频反馈"]', phone: '13800138002', wechat: 'zhangchongwu', reputation_level: 'silver', rating: 4.9, total_orders: 189, status: 1, create_time: '2024-01-15', civility_score: 88 },
  { id: 4, user_id: 4, nickname: '刘遛狗师', avatar: 'https://picsum.photos/60/60?random=103', service_type: 'walking', location: '丰台区 · 丽泽桥附近', address: '丽泽家园', feeding_price: null, foster_price: null, walking_price: 30.00, experience_years: 2, introduction: '专业遛狗师，熟悉狗狗行为学，能让您的爱犬在散步中得到充分运动。', services: '["专业遛狗", "行为训练", "社交活动"]', phone: '13800138003', wechat: 'liulougou', reputation_level: 'silver', rating: 4.7, total_orders: 145, status: 1, create_time: '2024-02-01', civility_score: 90 },
  { id: 5, user_id: 5, nickname: '陈美容师', avatar: 'https://picsum.photos/60/60?random=104', service_type: 'grooming', location: '东城区 · 王府井附近', address: '王府井大街88号', feeding_price: null, foster_price: null, grooming_price: 120.00, experience_years: 6, introduction: '6年宠物美容经验，精通各种犬猫造型设计，让您的宠物焕然一新。', services: '["洗澡美容", "造型设计", "指甲修剪"]', phone: '13800138004', wechat: 'chenmeirong', reputation_level: 'gold', rating: 4.9, total_orders: 420, status: 1, create_time: '2024-01-10', civility_score: 94 },
  { id: 6, user_id: 6, nickname: '小周训练师', avatar: 'https://picsum.photos/60/60?random=105', service_type: 'training', location: '通州区 · 梨园附近', address: '梨园小区', feeding_price: null, foster_price: null, training_price: 200.00, experience_years: 3, introduction: '专业宠物行为训练师，帮助解决狗狗不良行为问题，培养良好习惯。', services: '["基础训练", "行为纠正", "社交训练"]', phone: '13800138005', wechat: 'xiaozhouxunlian', reputation_level: 'bronze', rating: 4.6, total_orders: 78, status: 1, create_time: '2024-03-01', civility_score: 87 },
];

// ===== 响应记录数据 =====
const fakePetServiceResponses = [];

// ===== 数据操作函数 =====

const fakeData = {
  enabled: FAKE_DATA_ENABLED,

  // 获取所有假数据
  getAllData() {
    return {
      users: fakeUsers,
      communities: fakeCommunities,
      pets: fakePets,
      announcements: fakeAnnouncements,
      violationTypes: fakeViolationTypes,
      violationRecords: fakeViolationRecords,
      petCivilizationScores: fakePetCivilizationScores,
      communityCivilizationScores: fakeCommunityCivilizationScores,
      mapLayers: fakeMapLayers,
      mapMarkers: fakeMapMarkers,
    };
  },

  // 用户相关
  getUsers() { return fakeUsers; },
  getUserById(id) { return fakeUsers.find(u => u.id === id); },
  getUserByTel(tel) { return fakeUsers.find(u => u.tel === tel); },

  // 社区相关
  getCommunities() { return fakeCommunities; },
  getCommunityById(id) { return fakeCommunities.find(c => c.id === id); },
  searchCommunities(keyword) {
    if (!keyword) return fakeCommunities;
    return fakeCommunities.filter(c => c.name.includes(keyword));
  },

  // 宠物相关
  getPets() { return fakePets; },
  getPetsByUserId(userId) { return fakePets.filter(p => p.user_id === userId); },
  getPetById(id) { return fakePets.find(p => p.id === id); },

  // 公告相关
  getAnnouncements() {
    return [...fakeAnnouncements].sort((a, b) => {
      if (a.is_top !== b.is_top) return b.is_top - a.is_top;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  },

  // 违规类型
  getViolationTypes() { return fakeViolationTypes.filter(v => v.status !== 0); },

  // 违规记录
  getViolationRecords(filter) {
    let records = fakeViolationRecords.map(v => ({
      ...v,
      owner_name: v.owner_name || this.getUserById(v.user_id)?.user_name,
      owner_tel: v.owner_tel || this.getUserById(v.user_id)?.tel,
    }));
    if (filter && filter !== 'all') {
      records = records.filter(v => v.violation_type_id === parseInt(filter));
    }
    return records.sort((a, b) => new Date(b.violation_time) - new Date(a.violation_time));
  },

  // 文明分数
  getPetCivilizationScore(userId) {
    return fakePetCivilizationScores.find(s => s.user_id === userId);
  },
  getAllPetCivilizationScores(communityId) {
    if (communityId) {
      return fakePetCivilizationScores.filter(s => s.community_id === parseInt(communityId));
    }
    return fakePetCivilizationScores;
  },

  // 社区文明分数
  getCommunityCivilizationScore(communityId, month) {
    const score = fakeCommunityCivilizationScores.find(s => s.community_id === parseInt(communityId));
    if (!score) return null;
    const monthCol = `month_${month.toString().padStart(2, '0')}`;
    return {
      communityId: parseInt(communityId),
      month: parseInt(month),
      score: score[monthCol] || 100
    };
  },
  getCommunityCivilizationScores() {
    return fakeCommunityCivilizationScores;
  },

  // 地图数据
  getMapLayers() { return fakeMapLayers; },
  getMapMarkers(type) {
    if (type) return fakeMapMarkers.filter(m => m.type === type);
    return fakeMapMarkers;
  },
  getMapData() {
    const zones = fakeMapLayers.map(z => ({
      ...z,
      path: typeof z.path === 'string' ? JSON.parse(z.path) : z.path
    }));
    const pois = [
      ...fakeMapMarkers.filter(m => m.type === 'poi'),
      ...fakePetHospitals.map(h => ({ ...h, category: 'hospital', type: 'poi' })),
      ...fakePetShops.map(s => ({ ...s, type: 'poi' }))
    ];
    const live_events = fakeMapMarkers
      .filter(m => m.type === 'event')
      .slice(-10)
      .map(e => ({
        lng: e.lng,
        lat: e.lat,
        desc: e.name,
        time: new Date(e.created_at).toLocaleTimeString()
      }));
    return { zones, pois, live_events };
  },

  getPetHospitals() { return fakePetHospitals; },
  getPetShops() { return fakePetShops; },

  // 统计数据
  getDashboardStats() {
    return {
      petCount: fakePets.length,
      violationCount: fakeViolationRecords.length,
      civilScore: (fakePetCivilizationScores.reduce((sum, s) => sum + s.total_score, 0) / fakePetCivilizationScores.length).toFixed(1)
    };
  },

  getCommunityPetHeatmap() {
    return fakeCommunities.map(c => {
      const communityUsers = fakeUsers.filter(u => u.community_id === c.id);
      const petCount = fakePets.filter(p => communityUsers.some(u => u.id === p.user_id)).length;
      return { name: c.name, petCount };
    }).sort((a, b) => b.petCount - a.petCount);
  },

  getCivilizationTrend() {
    const currentMonth = new Date().getMonth() + 1;
    const months = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m <= 0) m += 12;
      months.push(m);
    }
    return months.map(m => {
      const monthCol = `month_${m.toString().padStart(2, '0')}`;
      const avgScore = fakeCommunityCivilizationScores.reduce((sum, s) => sum + (s[monthCol] || 100), 0) / fakeCommunityCivilizationScores.length;
      return { month: `${m}月`, score: Math.round(avgScore) };
    });
  },

  getPetStats() {
    const catCount = fakePets.filter(p => p.pet_breed.includes('猫')).length;
    const dogCount = fakePets.filter(p => p.pet_breed.includes('犬') || p.pet_breed.includes('狗')).length;
    const otherCount = fakePets.length - catCount - dogCount;
    const petList = fakePets.slice(0, 20).map(p => {
      const user = this.getUserById(p.user_id);
      let category = '其他';
      if (p.pet_breed.includes('猫')) category = '猫类';
      else if (p.pet_breed.includes('犬') || p.pet_breed.includes('狗')) category = '犬类';
      return {
        pet_name: p.pet_name,
        pet_breed: p.pet_breed,
        pet_age: p.pet_age,
        owner_name: user?.user_name || '未知',
        create_time: p.create_time,
        category
      };
    });
    return {
      total: fakePets.length,
      catCount,
      dogCount,
      otherCount,
      newCount: 2,
      petList
    };
  },

  getViolationStats() {
    const total = fakeViolationRecords.length;
    const pending = fakeViolationRecords.filter(v => v.handle_status !== 'resolved').length;
    const resolved = fakeViolationRecords.filter(v => v.handle_status === 'resolved').length;
    const monthCount = fakeViolationRecords.filter(v => {
      const recordMonth = new Date(v.violation_time).getMonth() + 1;
      return recordMonth === new Date().getMonth() + 1;
    }).length;
    const typeStats = fakeViolationTypes.map(vt => {
      const count = fakeViolationRecords.filter(v => v.violation_type_id === vt.id).length;
      return {
        name: vt.type_name,
        count,
        ratio: total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%'
      };
    }).filter(t => t.count > 0);
    return { total, pending, resolved, monthCount, typeStats };
  },

  getCommunityListStats() {
    return fakeCommunities.map(c => {
      const scores = fakePetCivilizationScores.filter(s => s.community_id === c.id);
      const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length : 100;
      return {
        id: c.id,
        name: c.name,
        score: avgScore.toFixed(1),
        userCount: scores.length
      };
    });
  },

  getCommunityCivilizationStats(communityId) {
    const community = this.getCommunityById(parseInt(communityId));
    const scores = fakePetCivilizationScores.filter(s => s.community_id === parseInt(communityId));
    const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length : 100;
    const score = avgScore.toFixed(1);
    const seed = parseInt(communityId) || 0;
    const dimensions = [
      { name: '宠物规范度', score: Math.min(100, 85 + (seed % 5)), trend: 'up', change: 2.3 },
      { name: '环境整洁度', score: Math.min(100, 92 - (seed % 3)), trend: 'up', change: 1.8 },
      { name: '邻里和谐度', score: Math.min(100, 88 + (seed % 4)), trend: 'down', change: 0.5 },
      { name: '违规整改率', score: Math.min(100, 95 - (seed % 2)), trend: 'up', change: 3.1 }
    ];
    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}年${d.getMonth() + 1}月`);
    }
    const trend = months.map((m, i) => ({
      month: m,
      score: (parseFloat(score) - i * 0.5 + (Math.random() - 0.5)).toFixed(1),
      change: Math.random() > 0.5 ? '↑' + (Math.random()).toFixed(1) : '↓' + (Math.random()).toFixed(1),
      reason: '模拟数据'
    }));
    return {
      name: community?.name || '全区综合',
      score,
      level: score >= 90 ? '优秀' : (score >= 80 ? '良好' : '待改进'),
      dimensions,
      trend
    };
  },

  // 添加新记录（模拟）
  addAnnouncement(announcement) {
    const newId = Math.max(...fakeAnnouncements.map(a => a.id)) + 1;
    fakeAnnouncements.push({ ...announcement, id: newId });
    return newId;
  },

  deleteAnnouncement(id) {
    const index = fakeAnnouncements.findIndex(a => a.id === id);
    if (index > -1) {
      fakeAnnouncements.splice(index, 1);
      return true;
    }
    return false;
  },

  addViolationRecord(record) {
    const newId = Math.max(...fakeViolationRecords.map(v => v.id), 0) + 1;
    fakeViolationRecords.push({ ...record, id: newId });
    return newId;
  },

  deleteViolation(id) {
    const index = fakeViolationRecords.findIndex(v => v.id === id);
    if (index > -1) {
      fakeViolationRecords.splice(index, 1);
      return true;
    }
    return false;
  },

  addPet(pet) {
    const newId = Math.max(...fakePets.map(p => p.id)) + 1;
    fakePets.push({ ...pet, id: newId });
    return newId;
  },

  updatePet(id, updates) {
    const index = fakePets.findIndex(p => p.id === id);
    if (index > -1) {
      fakePets[index] = { ...fakePets[index], ...updates };
      return true;
    }
    return false;
  },

  deletePet(id) {
    const index = fakePets.findIndex(p => p.id === id);
    if (index > -1) {
      fakePets.splice(index, 1);
      return true;
    }
    return false;
  },

  addMapMarker(marker) {
    const newId = Math.max(...fakeMapMarkers.map(m => m.id)) + 1;
    fakeMapMarkers.push({ ...marker, id: newId, created_at: new Date().toISOString() });
    return newId;
  },

  updateUserCommunity(userId, communityId) {
    const user = this.getUserById(userId);
    if (user) {
      user.community_id = communityId;
      return true;
    }
    return false;
  },

  updatePetCivilizationScore(userId, column, value) {
    const score = this.getPetCivilizationScore(userId);
    if (score) {
      score[column] = (score[column] || 0) + value;
      // 重新计算总分
      const deductions = [
        'leash_deduction', 'feces_deduction', 'noise_deduction',
        'vaccine_deduction', 'cert_deduction', 'public_area_deduction', 'other_deduction'
      ];
      const totalDeduction = deductions.reduce((sum, d) => sum + (score[d] || 0), 0);
      score.total_score = score.base_score + score.bonus_score - totalDeduction;
      return true;
    }
    return false;
  },

  initPetScoreRecord(userId, communityId) {
    const existing = this.getPetCivilizationScore(userId);
    if (!existing) {
      fakePetCivilizationScores.push({
        id: fakePetCivilizationScores.length + 1,
        user_id: userId,
        community_id: communityId,
        base_score: 100,
        bonus_score: 0,
        total_score: 100,
        leash_deduction: 0,
        feces_deduction: 0,
        noise_deduction: 0,
        vaccine_deduction: 0,
        cert_deduction: 0,
        public_area_deduction: 0,
        other_deduction: 0
      });
      return true;
    }
    return false;
  },

  // 宠物服务需求相关
  getPetServiceRequests() { return fakePetServiceRequests; },
  getPetServiceRequestById(id) { return fakePetServiceRequests.find(r => r.id === id); },
  addPetServiceRequest(request) {
    const newId = fakePetServiceRequests.length > 0 ? Math.max(...fakePetServiceRequests.map(r => r.id)) + 1 : 1;
    fakePetServiceRequests.push({ ...request, id: newId, create_time: new Date().toISOString() });
    return newId;
  },
  
  // 宠物服务者相关
  getPetServiceProviders() { return fakePetServiceProviders; },
  getPetServiceProviderById(id) { return fakePetServiceProviders.find(p => p.id === parseInt(id)); },
  getPetServiceProviderByUserId(userId) { return fakePetServiceProviders.find(p => p.user_id === userId); },
  addPetServiceProvider(provider) {
    const newId = fakePetServiceProviders.length > 0 ? Math.max(...fakePetServiceProviders.map(p => p.id)) + 1 : 1;
    fakePetServiceProviders.push({ ...provider, id: newId, create_time: new Date().toISOString() });
    return newId;
  },
  
  // 服务者评价相关
  getPetServiceReviews(providerId) {
    const pid = parseInt(providerId);
    // 为每个服务者生成不同的评价数据
    const reviewsMap = {
      1: [
        { id: 1, provider_id: 1, reviewer_id: 2, reviewer_name: '李四', rating: 5, content: '服务非常好，照顾得很细心！每天准时上门，还会发视频给我看猫咪的情况，非常放心！', is_anonymous: 0, create_time: '2024-03-15T10:00:00' },
        { id: 2, provider_id: 1, reviewer_id: 3, reviewer_name: '王五', rating: 5, content: '小王真的很专业，我家狗狗很喜欢她。寄养期间每天都带狗狗出去玩，回来后狗狗状态很好！', is_anonymous: 0, create_time: '2024-03-10T14:30:00' },
        { id: 3, provider_id: 1, reviewer_id: 4, reviewer_name: '赵六', rating: 5, content: '春节期间帮我照顾猫咪，非常负责。家里收拾得很干净，猫咪也很开心，强烈推荐！', is_anonymous: 0, create_time: '2024-02-20T09:15:00' },
        { id: 4, provider_id: 1, reviewer_id: 5, reviewer_name: '钱七', rating: 4, content: '整体服务不错，就是价格稍微贵一点，但是物有所值。', is_anonymous: 0, create_time: '2024-02-05T16:45:00' },
      ],
      2: [
        { id: 5, provider_id: 2, reviewer_id: 1, reviewer_name: '张三', rating: 5, content: '李师傅很专业，猫咪护理知识很丰富，还教了我很多养猫小技巧。', is_anonymous: 0, create_time: '2024-03-12T11:20:00' },
        { id: 6, provider_id: 2, reviewer_id: 3, reviewer_name: '王五', rating: 4, content: '服务很好，就是有时候回复消息慢了一点，但整体还是很满意的。', is_anonymous: 0, create_time: '2024-03-01T13:00:00' },
        { id: 7, provider_id: 2, reviewer_id: 6, reviewer_name: '孙八', rating: 5, content: '非常专业的宠物护理师，我家猫咪之前有点应激，李师傅处理得很好。', is_anonymous: 0, create_time: '2024-02-18T10:30:00' },
      ],
      3: [
        { id: 8, provider_id: 3, reviewer_id: 1, reviewer_name: '张三', rating: 5, content: '家庭式寄养真的很温馨，张师傅家环境很好，有独立的宠物房间，每天还会发视频给我。', is_anonymous: 0, create_time: '2024-03-18T15:00:00' },
        { id: 9, provider_id: 3, reviewer_id: 2, reviewer_name: '李四', rating: 5, content: '出差一周，把狗狗寄养在这里，回来看到狗狗很开心，还胖了一点，哈哈！', is_anonymous: 0, create_time: '2024-03-05T09:30:00' },
        { id: 10, provider_id: 3, reviewer_id: 7, reviewer_name: '周九', rating: 4, content: '服务不错，价格也比较合理，就是位置稍微有点远。', is_anonymous: 0, create_time: '2024-02-28T14:20:00' },
      ],
      4: [
        { id: 11, provider_id: 4, reviewer_id: 1, reviewer_name: '张三', rating: 5, content: '刘师傅遛狗很专业，我家金毛每次都很期待和他出去玩，回来都累趴了，哈哈！', is_anonymous: 0, create_time: '2024-03-20T17:00:00' },
        { id: 12, provider_id: 4, reviewer_id: 5, reviewer_name: '钱七', rating: 4, content: '遛狗服务不错，就是有时候时间不太准时，但狗狗玩得很开心。', is_anonymous: 0, create_time: '2024-03-08T11:10:00' },
      ],
      5: [
        { id: 13, provider_id: 5, reviewer_id: 1, reviewer_name: '张三', rating: 5, content: '陈美容师技术真的太好了！给我家泰迪剪的造型超级可爱，朋友们都问在哪剪的。', is_anonymous: 0, create_time: '2024-03-22T10:00:00' },
        { id: 14, provider_id: 5, reviewer_id: 2, reviewer_name: '李四', rating: 5, content: '6年经验果然不一样，手法很温柔，我家猫咪平时很怕生，但在陈师傅这里很乖。', is_anonymous: 0, create_time: '2024-03-15T14:30:00' },
        { id: 15, provider_id: 5, reviewer_id: 3, reviewer_name: '王五', rating: 5, content: '美容效果超级好，价格虽然贵一点但是值得，环境也很干净。', is_anonymous: 0, create_time: '2024-03-01T16:00:00' },
        { id: 16, provider_id: 5, reviewer_id: 6, reviewer_name: '孙八', rating: 4, content: '技术很好，就是需要提前预约，生意太好了！', is_anonymous: 0, create_time: '2024-02-20T09:45:00' },
      ],
      6: [
        { id: 17, provider_id: 6, reviewer_id: 1, reviewer_name: '张三', rating: 5, content: '小周训练师很专业，我家狗狗之前喜欢乱叫，经过训练后改善了很多。', is_anonymous: 0, create_time: '2024-03-10T13:30:00' },
        { id: 18, provider_id: 6, reviewer_id: 4, reviewer_name: '赵六', rating: 4, content: '训练效果不错，狗狗学会了很多指令，就是训练周期有点长。', is_anonymous: 0, create_time: '2024-02-25T11:00:00' },
      ],
    };
    return reviewsMap[pid] || [
      { id: 1, provider_id: pid, reviewer_id: 2, reviewer_name: '李四', rating: 5, content: '服务非常好，照顾得很细心！', is_anonymous: 0, create_time: '2024-01-15T10:00:00' },
      { id: 2, provider_id: pid, reviewer_id: 3, reviewer_name: '王五', rating: 4, content: '整体不错，沟通顺畅。', is_anonymous: 0, create_time: '2024-01-10T14:30:00' },
    ];
  },
  addPetServiceReview(review) {
    return true;
  },
  
  // 响应记录相关
  getMyResponses(userId) { 
    return fakePetServiceResponses.filter(r => r.provider_id === userId);
  },
  addResponse(response) {
    const newId = fakePetServiceResponses.length > 0 ? Math.max(...fakePetServiceResponses.map(r => r.id)) + 1 : 1;
    fakePetServiceResponses.push({ ...response, id: newId });
    return newId;
  },
};

module.exports = fakeData;
