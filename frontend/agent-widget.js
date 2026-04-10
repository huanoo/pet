// 智能体助手组件
(function() {
    // 注入 CSS 样式
    const style = document.createElement('style');
    style.textContent = `
        /* 智能体悬浮按钮 */
        .agent-fab {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #9A482A;
            box-shadow: 0 4px 12px rgba(154, 72, 42, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9990;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid white;
        }
        .agent-fab:hover {
            transform: scale(1.1) rotate(5deg);
            background: #B96848;
        }
        .agent-fab img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }
        .agent-fab .badge {
            position: absolute;
            top: 0;
            right: 0;
            width: 12px;
            height: 12px;
            background: #10B981;
            border: 2px solid white;
            border-radius: 50%;
        }

        /* 智能体模态框 - 复用现有样式，确保兼容性 */
        .agent-modal-mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none; /* 默认隐藏 */
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
        }
        .agent-modal-content {
            width: 90%;
            max-width: 760px;
            background: white;
            border-radius: 12px;
            padding: 24px;
            animation: modalFadeIn 0.3s ease;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            border: 3px solid #c2410c;
            box-shadow: 0 0 0 2px #fda4af, 0 4px 12px rgba(194,65,12,0.15);
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* 聊天气泡样式 */
        .agent-message-container {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 16px;
            padding-right: 8px;
        }
        /* 滚动条美化 */
        .agent-message-container::-webkit-scrollbar {
            width: 6px;
        }
        .agent-message-container::-webkit-scrollbar-track {
            background: #f1f1f1; 
        }
        .agent-message-container::-webkit-scrollbar-thumb {
            background: #d1d5db; 
            border-radius: 3px;
        }
        .agent-message-container::-webkit-scrollbar-thumb:hover {
            background: #9ca3af; 
        }
        
        /* 智能体专用样式类，确保在所有页面中都能正常工作 */
        .cute-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        .cute-input:focus {
            outline: none;
            border-color: #c2410c;
            box-shadow: 0 0 0 2px rgba(194, 65, 12, 0.2);
        }
        .btn-primary {
            background: #9A482A;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-primary:hover {
            background: #7c3c22;
        }
        .btn-primary:disabled {
            background: #d1d5db;
            cursor: not-allowed;
        }
        .cute-font {
            font-family: 'ZCOOL KuaiLe', 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif;
        }
        .flex {
            display: flex;
        }
        .flex-1 {
            flex: 1;
        }
        .justify-between {
            justify-content: space-between;
        }
        .items-center {
            align-items: center;
        }
        .mb-4 {
            margin-bottom: 1rem;
        }
        .gap-3 {
            gap: 0.75rem;
        }
        .w-10 {
            width: 2.5rem;
        }
        .h-10 {
            height: 2.5rem;
        }
        .rounded-full {
            border-radius: 9999px;
        }
        .mr-1 {
            margin-right: 0.25rem;
        }
        .border-2 {
            border-width: 2px;
        }
        .border-\[\#E68A48\] {
            border-color: #E68A48;
        }
        .text-lg {
            font-size: 1.125rem;
        }
        .font-bold {
            font-weight: 700;
        }
        .text-gray-800 {
            color: #1f2937;
        }
        .text-sm {
            font-size: 0.875rem;
        }
        .text-gray-500 {
            color: #6b7280;
        }
        .text-gray-400 {
            color: #9ca3af;
        }
        .hover\:text-\[\#c2410c\]:hover {
            color: #c2410c;
        }
        .cursor-pointer {
            cursor: pointer;
        }
        .text-xl {
            font-size: 1.25rem;
        }
        .bg-neutral-50 {
            background-color: #f9fafb;
        }
        .border {
            border-width: 1px;
        }
        .border-neutral-200 {
            border-color: #e5e7eb;
        }
        .rounded-lg {
            border-radius: 0.5rem;
        }
        .p-4 {
            padding: 1rem;
        }
        .h-\[50vh\] {
            height: 50vh;
        }
        .space-y-3 {
            space-y: 0.75rem;
        }
        .mt-auto {
            margin-top: auto;
        }
        .whitespace-nowrap {
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);

    // 注入 HTML 结构
    const fabHTML = `
        <div class="agent-fab" id="agent-fab" title="智能体助手">
            <img id="agent-fab-img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20furry%20little%20creature%20with%20big%20eyes%20and%20fluffy%20hair%2C%20friendly%20expression%2C%20simple%20style%2C%20white%20background&image_size=square" alt="可爱毛头助手" onerror="this.src='图片/1.png'">
            <div class="badge"></div>
        </div>
        <div class="agent-modal-mask" id="agent-modal">
            <div class="agent-modal-content">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-3">
                        <img id="agent-avatar" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20furry%20little%20creature%20with%20big%20eyes%20and%20fluffy%20hair%2C%20friendly%20expression%2C%20simple%20style%2C%20white%20background&image_size=square" alt="可爱毛头智能体" class="w-10 h-10 rounded-full mr-1 border-2 border-[#E68A48]" onerror="this.src='图片/1.png'">
                        <div>
                            <div class="text-lg font-bold text-gray-800 cute-font" id="agent-title">小P助手</div>
                            <div class="text-sm text-gray-500 cute-font" id="agent-subtitle">在线</div>
                        </div>
                    </div>
                    <button class="text-gray-400 hover:text-[#c2410c] cursor-pointer" id="close-agent-modal">
                        <i class="fa fa-times text-xl"></i>
                    </button>
                </div>
                <div id="agent-messages" class="agent-message-container bg-neutral-50 border border-neutral-200 rounded-lg p-4 h-[50vh] space-y-3"></div>
                <div class="mt-auto flex gap-3">
                    <input id="agent-input" type="text" placeholder="输入你想问的问题…" class="cute-input cute-font flex-1">
                    <button id="agent-send" class="btn-primary cute-font whitespace-nowrap">发送</button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = fabHTML;
    document.body.appendChild(container);

    // 逻辑处理
    const agentModal = document.getElementById('agent-modal');
    const agentMessages = document.getElementById('agent-messages');
    const agentInput = document.getElementById('agent-input');
    const agentSend = document.getElementById('agent-send');
    const agentAvatar = document.getElementById('agent-avatar');
    const agentTitle = document.getElementById('agent-title');
    const closeAgentModalBtn = document.getElementById('close-agent-modal');
    const agentFab = document.getElementById('agent-fab');

    let agentConversationId = '';
    let agentTargetName = '';
    let agentBusy = false;

    // 工具函数：转义 HTML
    function escapeHtml(s) {
        if (!s) return '';
        return s.toString()
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    // 显示 Toast 提示 (依赖页面已有的 showToast 或自带简易版)
    function showMsg(msg, isSuccess = true) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, isSuccess);
        } else {
            alert(msg); // 降级处理
        }
    }

    // 追加消息
    function appendAgentMessage(role, text) {
        const el = document.createElement('div');
        if (role === 'user') {
            el.className = 'flex justify-end';
            el.innerHTML = `<div class="max-w-[80%] bg-[#9A482A] text-white rounded-2xl px-4 py-2 cute-font whitespace-pre-wrap">${escapeHtml(text)}</div>`;
        } else {
            el.className = 'flex justify-start items-start gap-2';
            el.innerHTML = `
                <img src="${escapeHtml(agentAvatar.src)}" class="w-8 h-8 rounded-full border border-[#E68A48]" alt="智能体头像">
                <div class="max-w-[80%] bg-white border border-neutral-200 rounded-2xl px-4 py-2 cute-font text-gray-800 whitespace-pre-wrap">${escapeHtml(text)}</div>
            `;
        }
        agentMessages.appendChild(el);
        agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    // 设置忙碌状态
    function setAgentBusyState(busy) {
        agentBusy = busy;
        agentSend.disabled = busy;
        agentInput.disabled = busy;
        agentSend.textContent = busy ? '发送中…' : '发送';
    }

    // 重置聊天
    function resetAgentChat() {
        if (!agentConversationId) { // 仅在首次打开或强制重置时清空
             agentMessages.innerHTML = '';
             appendAgentMessage('assistant', agentTargetName ? `你好，我是小P，现在在为「${agentTargetName}」提供咨询服务。` : '你好，我是小P，有什么可以帮你？');
        }
    }

    // 核心暴露方法：打开模态框
    window.openAgentModal = function(targetName = '') {
        // 如果切换了咨询对象，重置会话
        if (targetName && targetName !== agentTargetName) {
            agentConversationId = '';
            agentMessages.innerHTML = '';
        }
        
        agentTargetName = targetName || '';
        agentTitle.textContent = agentTargetName ? `智能体助手 · ${agentTargetName}` : '智能体助手';
        agentModal.style.display = 'flex'; // 使用 flex 布局居中
        
        if (agentMessages.children.length === 0) {
            resetAgentChat();
        }
        
        agentInput.focus();
    };

    function closeAgentModal() {
        agentModal.style.display = 'none';
        setAgentBusyState(false);
    }

    // 发送消息逻辑
    async function sendToAgent() {
        if (agentBusy) return;
        const text = agentInput.value.trim();
        if (!text) return;
        
        agentInput.value = '';
        appendAgentMessage('user', text);
        setAgentBusyState(true);

        try {
            // 尝试从 cookie 或 localStorage 获取 token，或者直接让后端处理
            // 注意：这里假设 fetch 会自动带上 cookie (credentials: 'include')
            const resp = await fetch('http://127.0.0.1:3000/api/agent/chat', { // 使用绝对路径，兼容 Live Server (5500端口) 和后端 (3000端口)
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: text,
                    conversation_id: agentConversationId || undefined,
                    inputs: { 
                        target_name: agentTargetName || undefined, 
                        page: document.title || 'unknown' 
                    }
                })
            });
            
            const result = await resp.json();
            if (result.code !== 200) {
                showMsg(result.msg || '智能体调用失败 🐾', false);
                appendAgentMessage('assistant', result.msg ? `(系统提示：${result.msg})` : '我这边暂时无法回复，请稍后再试。');
                setAgentBusyState(false);
                return;
            }
            
            const data = result.data || {};
            if (data.conversation_id) agentConversationId = data.conversation_id;
            const answer = (data.answer || data.message || '').toString().trim() || '我没有生成到有效回复。';
            
            appendAgentMessage('assistant', answer);
        } catch (err) {
            console.error(err);
            showMsg('网络异常，请检查连接 🐶', false);
            appendAgentMessage('assistant', '网络开小差了，请稍后再试。');
        } finally {
            setAgentBusyState(false);
            agentInput.focus();
        }
    }

    // 事件绑定
    closeAgentModalBtn.addEventListener('click', closeAgentModal);
    
    agentModal.addEventListener('click', (e) => {
        if (e.target === agentModal) closeAgentModal();
    });

    agentSend.addEventListener('click', sendToAgent);
    
    agentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendToAgent();
    });

    // 悬浮按钮点击事件
    agentFab.addEventListener('click', () => {
        window.openAgentModal();
    });

    console.log('🐾 智能体助手组件已加载');
})();
