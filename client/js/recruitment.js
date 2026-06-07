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

    const minSalary = parseInt(formData.get('min_salary'), 10);
    const maxSalary = parseInt(formData.get('max_salary'), 10);

    if (maxSalary <= minSalary) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '最高薪资必须大于最低薪资';
        messageDiv.style.display = 'block';
        return;
    }

    try {
        // 1. 查手机号是否存在
        const checkResponse = await fetch('/server/api/check_phone.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `phone=${encodeURIComponent(phone)}`
        });
        const checkResult = await checkResponse.json();

        if (!checkResult.success) {
            throw new Error(checkResult.message || '查询失败');
        }

        if (checkResult.exists) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '您已提交过 请勿填写重复电话';
            messageDiv.style.display = 'block';
            return;
        }

        // 2. 插入数据库
        const response = await fetch('/server/api/recruitment.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (!result.success) {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message || '提交失败 请重试';
            messageDiv.style.display = 'block';
            return;
        }

        // 3. 插入成功，才发邮件
        const formDataForEmail = new FormData(this);
        const mailResponse = await fetch('/server/api/hire_email.php', {
            method: 'POST',
            body: formDataForEmail
        });

        if (mailResponse.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '提交成功，已发送邮件通知我';
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = '提交成功，但邮件发送失败';
        }
        messageDiv.style.display = 'block';
        this.reset();

    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = error.message || '网络异常 请重试';
        messageDiv.style.display = 'block';
    }
});

