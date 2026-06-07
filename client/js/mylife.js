const API_BASE = 'http://106.13.191.103:3001/api/douyin/';

const ACCOUNTS = [
    { id: 'MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM', cardIndex: 0 },
    { id: 'MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL', cardIndex: 1 }
];

async function fetchAccountsData() {
    try {
        const res = await fetch(`${API_BASE}accounts`);
        return await res.json();
    } catch (err) {
        console.error('获取配置失败:', err);
        return {};
    }
}

async function updateCardData(account) {
    const card = document.querySelectorAll('.card')[account.cardIndex];
    const fansEl = card.querySelector('.fans-count');
    const likesEl = card.querySelector('.likes-count');

    const data = await fetchAccountsData();
    const accountData = data[account.id];

    if (accountData) {
        fansEl.textContent = accountData.fans;
        likesEl.textContent = accountData.likes;
    } else {
        fansEl.textContent = '--';
        likesEl.textContent = '--';
    }
}

window.addEventListener('load', async () => {
    // 1. 入场动画
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            //card.style.transition = 'opacity 0.5s, transform 0.5s';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // 2. 加载数据（等动画开始后再请求，不阻塞渲染）
    setTimeout(async () => {
        await updateCardData(ACCOUNTS[0]);
        await updateCardData(ACCOUNTS[1]);
    }, 300);
});


// 点击波纹效果
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function (e) {
        if (!e.target.classList.contains('btn')) {
            this.style.transition = 'transform 0.15s';
            this.style.transform = 'scale(0.98)';
            setTimeout(() => { this.style.transform = ''; }, 150);
        }
    });
});
