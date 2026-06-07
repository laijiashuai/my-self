<?php
require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// 读取 .env 文件
$env = parse_ini_file(__DIR__ . '/../.env');

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

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $env['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $env['SMTP_USER'];
    $mail->Password   = $env['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = $env['SMTP_PORT'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('laijiashuai@163.com', '招聘平台通知');
    $mail->addAddress('laijiashuai@163.com');
    $mail->isHTML(true);
    $mail->Subject = '【新招聘信息】' . $data['position'] . ' - ' . $data['company_name'];

    $salary_text = $data['min_salary'] && $data['max_salary'] 
        ? $data['min_salary'] . 'K - ' . $data['max_salary'] . 'K' 
        : '面议';

    $mail->Body = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: "Microsoft YaHei", Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .info-item { background: #f8f9fa; padding: 14px; border-radius: 6px; border-left: 4px solid #667eea; }
            .info-item label { font-size: 12px; color: #888; display: block; margin-bottom: 4px; }
            .info-item span { font-size: 15px; color: #333; font-weight: 600; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 16px; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 6px; margin-bottom: 12px; font-weight: 700; }
            .section-content { font-size: 14px; color: #555; line-height: 1.8; white-space: pre-wrap; }
            .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 新招聘信息</h1>
                <p>收到一条新的招聘投稿，请查收</p>
            </div>
            <div class="content">
                <div class="info-grid">
                    <div class="info-item">
                        <label>公司名称</label>
                        <span>' . htmlspecialchars($data['company_name']) . '</span>
                    </div>
                    <div class="info-item">
                        <label>招聘职位</label>
                        <span>' . htmlspecialchars($data['position']) . '</span>
                    </div>
                    <div class="info-item">
                        <label>薪资范围</label>
                        <span>' . htmlspecialchars($salary_text) . '</span>
                    </div>
                    <div class="info-item">
                        <label>联系人</label>
                        <span>' . htmlspecialchars($data['contact_person']) . '</span>
                    </div>
                    <div class="info-item">
                        <label>联系电话</label>
                        <span>' . htmlspecialchars($data['phone']) . '</span>
                    </div>
                    <div class="info-item">
                        <label>联系邮箱</label>
                        <span>' . htmlspecialchars($data['email']) . '</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">📌 公司简介</div>
                    <div class="section-content">' . nl2br(htmlspecialchars($data['description'])) . '</div>
                </div>

                <div class="section">
                    <div class="section-title">💼 岗位职责</div>
                    <div class="section-content">' . nl2br(htmlspecialchars($data['job_responsibilities'])) . '</div>
                </div>

                <div class="section">
                    <div class="section-title">✅ 任职要求</div>
                    <div class="section-content">' . nl2br(htmlspecialchars($data['job_requirements'])) . '</div>
                </div>
            </div>
            <div class="footer">
                此邮件由招聘平台自动发送 · 请勿直接回复
            </div>
        </div>
    </body>
    </html>
    ';

    $mail->send();
    echo json_encode(['status' => 'success', 'msg' => '邮件发送成功']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'msg' => $mail->ErrorInfo]);
}

