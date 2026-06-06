document.getElementById('recruitForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';

    const phone = formData.get('phone');
    if (!/^[\d\s\-+()]{7,20}$/.test(phone)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '电话格式不正确';
        messageDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('../server/api/recruitment.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '谢谢';
            messageDiv.style.display = 'block';
            this.reset();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message || '预期之外的错误，请重试';
            messageDiv.style.display = 'block';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '网络异常';
        messageDiv.style.display = 'block';
    }
});
