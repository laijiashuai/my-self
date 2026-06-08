(async () => {
    // 1. 加载配置（只加载一次）
    const config = await ConfigManager.loadConfig();
    if (!config) {
        console.error('配置加载失败，页面无法正常工作');
        return;
    }
})();

const ACCOUNTS = [
    { id: 'MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM', cardIndex: 0 },
    { id: 'MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL', cardIndex: 1 }
];

async function fetchAccountsData() {
    const API_BASE = ConfigManager.getAPIBase();
    try {
        if (API_BASE) {
            const res = await fetch(`${API_BASE}accounts`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } else {
            console.log('API Base null');
        }
    } catch (err) {
        console.error(`获取数据失败: ${API_BASE}accounts`, err);
        return {};
    }
}

async function updateCardData() {
    const data = await fetchAccountsData();
    const cards = document.querySelectorAll('.card');

    for (const account of ACCOUNTS) {
        const card = cards[account.cardIndex];
        if (!card) continue;

        const fansEl = card.querySelector('.fans-count');
        const likesEl = card.querySelector('.likes-count');
        const accountData = data[account.id];

        if (accountData) {
            fansEl.textContent = accountData.fans;
            likesEl.textContent = accountData.likes;
        } else {
            fansEl.textContent = '--';
            likesEl.textContent = '--';
        }
    }

}

// 3. 入场动画 + 数据加载
window.addEventListener('load', async () => {
    // 1. 入场动画
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // 2. 加载数据（等动画开始后再请求，不阻塞渲染）
    setTimeout(async () => {
        await updateCardData();
    }, 300);
});

// 4. 点击波纹
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function (e) {
        if (!e.target.classList.contains('btn')) {
            this.style.transition = 'transform 0.15s';
            this.style.transform = 'scale(0.98)';
            setTimeout(() => { this.style.transform = ''; }, 150);
        }
    });
});
