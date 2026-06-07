const API_BASE = 'http://localhost:3001/api/douyin/';

const ACCOUNTS = [
    {
        id: 'MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM',
        cardIndex: 0
    },
    {
        id: 'MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL',
        cardIndex: 1
    }
];

async function fetchDouyinData(userId) {
    try {
        const res = await fetch(`${API_BASE}${userId}`);
        const data = await res.json();

        if (data.success && data.data) {
            return {
                fans: data.data.fans,
                likes: data.data.likes
            };
        }
        return null;
    } catch (err) {
        console.error('获取数据失败:', err);
        return null;
    }
}

async function updateCardData(account) {
    const card = document.querySelectorAll('.card')[account.cardIndex];
    const fansEl = card.querySelector('.fans-count');
    const likesEl = card.querySelector('.likes-count');

    const data = await fetchDouyinData(account.id);

    if (data) {
        fansEl.textContent = data.fans;
        likesEl.textContent = data.likes;
    } else {
        fansEl.textContent = '--';
        likesEl.textContent = '--';
    }
}

window.addEventListener('load', async () => {
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

    updateCardData(ACCOUNTS[0]);
    updateCardData(ACCOUNTS[1]);
});

// 点击卡片时的点击波纹效果（可选增强）
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function (e) {
        // 只在点击非按钮区域时触发
        if (!e.target.classList.contains('btn')) {
            this.style.transition = 'transform 0.15s';
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }
    });
});

// 页面加载动画
window.addEventListener('load', () => {
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
});
