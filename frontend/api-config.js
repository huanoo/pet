/**
 * API 配置文件
 * 所有前端页面共享的 API 基础地址配置
 */

const API_CONFIG = {
    // 后端 API 基础地址
    BASE_URL: 'https://pet-production-28ba.up.railway.app/api',
    
    // 常用 API 端点
    ENDPOINTS: {
        // 社区相关
        COMMUNITY_SEARCH: '/community/search',
        COMMUNITY_LIST: '/community',
        
        // 用户相关
        LOGIN: '/login',
        REGISTER: '/register',
        CHECK_LOGIN: '/checkLogin',
        USER_SCORE: '/user/score',
        USER_PETS: '/myPets',
        SAVE_PET: '/savePet',
        
        // 公告相关
        ANNOUNCEMENTS: '/announcements',
        
        // 宠物相关
        PET_STATS: '/admin/petStats',
        
        // 违规相关
        VIOLATION_STATS: '/admin/violationStats',
        
        // 地图相关
        MAP_LAYERS: '/map/layers',
        MAP_MARKERS: '/map/markers',
        
        // 文明评分相关
        CIVILIZATION_SCORE: '/civilization/score',
        CIVILIZATION_TREND: '/civilization/trend',
        
        // AI 助手
        AGENT_CHAT: '/agent/chat'
    }
};

// 导出配置（兼容不同模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
