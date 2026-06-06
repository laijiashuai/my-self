<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$host = '106.13.191.103';
$user = 'jiashuai';
$pass = 'Jiashuai@1006';
$dbname = 'myself';

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => '数据库连接失败']);
    exit;
}

$data = [
    'company_name'        => $_POST['company_name'] ?? '',
    'contact_person'      => $_POST['contact_person'] ?? '',
    'phone'               => $_POST['phone'] ?? '',
    'position'            => $_POST['position'] ?? '',
    'min_salary'          => $_POST['min_salary'] ?? 0,
    'max_salary'          => $_POST['max_salary'] ?? 0,
    'email'               => $_POST['email'] ?? null,
    'description'         => $_POST['description'] ?? null,
    'job_responsibilities' => $_POST['job_responsibilities'] ?? null,
    'job_requirements'    => $_POST['job_requirements'] ?? null,
];

$stmt = $conn->prepare("
    INSERT INTO recruitment_info 
    (company_name, contact_person, phone, min_salary, max_salary, position, email, description, job_responsibilities, job_requirements) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sssiiissss",
    $data['company_name'],
    $data['contact_person'],
    $data['phone'],
    $data['min_salary'],
    $data['max_salary'],
    $data['position'],
    $data['email'],
    $data['description'],
    $data['job_responsibilities'],
    $data['job_requirements']
);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    if ($stmt->errno == 1062) {
        echo json_encode(['success' => false, 'code' => 1062, 'message' => '您已经提交过啦，请勿重复操作']);
    } else {
        echo json_encode(['success' => false, 'message' => '预期之外的错误，请重试']);
    }
}

$stmt->close();
$conn->close();
