// 页面切换动画系统
class PageTransition {
    constructor() {
        this.currentPage = window.location.pathname;
        this.init();
    }

    init() {
        // 监听所有链接点击
        this.setupLinkListeners();
        // 监听页面加载完成
        this.setupPageLoad();
    }

    setupLinkListeners() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                this.handleLinkClick(link, e);
            }
        });
    }

    handleLinkClick(link, e) {
        const href = link.getAttribute('href');
        if (!href) return;

        // 检查是否是页面内跳转（以#开头）
        if (href.startsWith('#')) {
            // 页面内跳转，不添加动画
            return;
        }

        // 检查是否是外部链接
        if (href.startsWith('http://') || href.startsWith('https://')) {
            // 外部链接，不添加动画
            return;
        }

        // 检查是否是同一个页面
        const currentPath = window.location.pathname;
        const targetPath = new URL(href, window.location.origin).pathname;
        
        if (currentPath === targetPath) {
            // 同一个页面，不添加动画
            return;
        }

        // 是页面切换，添加动画
        e.preventDefault();
        this.startTransition(href);
    }

    startTransition(href) {
        // 添加离开动画
        document.body.classList.add('page-transition-out');

        // 等待动画完成后跳转
        setTimeout(() => {
            window.location.href = href;
        }, 400);
    }

    setupPageLoad() {
        // 页面加载时添加进入动画
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.add('page-transition-in');
            }, 50);
        });

        // 页面加载完成后移除动画类
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.remove('page-transition-in');
            }, 400);
        });
    }
}

// 页面切换动画样式
const style = document.createElement('style');
style.textContent = `
    /* 页面切换动画样式 */
    .page-transition-out {
        animation: pageFadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .page-transition-in {
        animation: pageFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes pageFadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.98);
        }
    }

    @keyframes pageFadeIn {
        from {
            opacity: 0;
            transform: scale(1.02);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    /* 确保页面内容在动画期间正确显示 */
    body {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(style);

// 初始化页面切换动画
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
});
