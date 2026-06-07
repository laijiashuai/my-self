<?php
$data = [
    'company_name'        => isset($_POST['company_name']) ? $_POST['company_name'] : '',
    'contact_person'      => isset($_POST['contact_person']) ? $_POST['contact_person'] : '',
    'phone'               => isset($_POST['phone']) ? $_POST['phone'] : '',
    'position'            => isset($_POST['position']) ? $_POST['position'] : '',
    'min_salary'          => isset($_POST['min_salary']) ? $_POST['min_salary'] : 0,
    'max_salary'          => isset($_POST['max_salary']) ? $_POST['max_salary'] : 0,
    'email'               => isset($_POST['email']) ? $_POST['email'] : '',
    'description'         => isset($_POST['description']) ? $_POST['description'] : '',
    'job_responsibilities' => isset($_POST['job_responsibilities']) ? $_POST['job_responsibilities'] : '',
    'job_requirements'    => isset($_POST['job_requirements']) ? $_POST['job_requirements'] : '',
];

$to_email   = 'laijiashuai@163.com';
$to_name    = '嘉帅';
$from_email = 'laijiashuai@163.com';
$from_name  = 'myWeb';

$salary_text = ($data['min_salary'] && $data['max_salary'])
    ? number_format($data['min_salary']) . ' - ' . number_format($data['max_salary']) . ' 元/月'
    : '面议';

$html = '
<html>
<head>
<meta charset="UTF-8">
<style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #4A90D9; color: #fff; padding: 24px; }
    .header h2 { margin: 0 0 8px; font-size: 22px; }
    .header p { margin: 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    td { padding: 10px 12px; border: 1px solid #e0e0e0; }
    td:first-child { background: #f8f9fa; font-weight: bold; width: 90px; }
    .salary { color: #e74c3c; font-weight: bold; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #4A90D9; border-bottom: 2px solid #4A90D9; padding-bottom: 6px; margin: 0 0 10px; font-size: 16px; }
    .section p, .section div { line-height: 1.8; color: #555; white-space: pre-wrap; }
    .footer { text-align: center; padding: 16px; color: #999; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>' . $data['position'] . '</h2>
        <p>' . $data['company_name'] . '</p>
    </div>
    <div class="content">
        <table>
            <tr><td>联系人</td><td>' . $data['contact_person'] . '</td></tr>
            <tr><td>电话</td><td>' . $data['phone'] . '</td></tr>
            <tr><td>薪资</td><td class="salary">' . $salary_text . '</td></tr>
            <tr><td>邮箱</td><td>' . $data['email'] . '</td></tr>
        </table>
';

if ($data['description']) {
    $html .= '
        <div class="section">
            <h3>职位描述</h3>
            <p>' . $data['description'] . '</p>
        </div>';
}

if ($data['job_responsibilities']) {
    $html .= '
        <div class="section">
            <h3>岗位职责</h3>
            <div>' . $data['job_responsibilities'] . '</div>
        </div>';
}

if ($data['job_requirements']) {
    $html .= '
        <div class="section">
            <h3>任职要求</h3>
            <div>' . $data['job_requirements'] . '</div>
        </div>';
}

$html .= '
    </div>
    <div class="footer">此邮件由招聘系统自动发送</div>
</div>
</body>
</html>
';

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . $from_name . " <" . $from_email . ">\r\n";
$headers .= "Reply-To: " . $from_email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$subject = "【新招聘信息】" . $data['position'] . " - " . $data['company_name'];
//$result  = mail($to_email, $subject, $html, $headers);

$message = "Hello! 这是邮件的内容。";  // 邮件正文
$result = mail($to_email, $subject, $message, $headers);

echo $result ? '邮件发送成功！' : '邮件发送失败，请检查服务器 mail 配置';
