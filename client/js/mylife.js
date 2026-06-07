//const config = fetch('/server/config/node_conf.json');
//const API_BASE = `http://${config.host}:${config.port}/api/douyin/`;
const API_BASE = `http://localhost:3000/api/douyin/`;


const ACCOUNTS = [
    { id: 'MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM', cardIndex: 0 },
    { id: 'MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL', cardIndex: 1 }
];

async function fetchAccountsData() {
    try {
        const res = await fetch(`${API_BASE}accounts`);
        return await res.json();
    } catch (err) {
        console.error(`获取配置失败:${API_BASE}accounts`, err);
        return {};
    }
}

async function updateCardData() {
    const data = await fetchAccountsData();

    for (const account of ACCOUNTS) {
        const card = document.querySelectorAll('.card')[account.cardIndex];
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
