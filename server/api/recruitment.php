<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$config = require __DIR__ . '/../config/database.php';

$conn = new mysqli(
    $config['host'],
    $config['username'],
    $config['password'],
    $config['dbname']
);
$conn->set_charset($config['charset']);

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

if (empty($data['phone'])) {
    echo json_encode(['success' => false, 'message' => '请填写手机号']);
    $conn->close();
    exit;
}


$stmt = $conn->prepare("
    INSERT INTO recruitment_info 
    (company_name, contact_person, phone, min_salary, max_salary, position, email, description, job_responsibilities, job_requirements) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sssiisssss",
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

try {
    if (!$stmt->execute()) {
        if ($stmt->errno == 1062) {
            echo json_encode(['success' => false, 'message' => '您已提交过 请勿填写重复电话']);
        } else {
            echo json_encode(['success' => false, 'message' => '数据库错误：' . $stmt->error]);
        }
    } else {
        echo json_encode(['success' => true]);
    }
} catch (mysqli_sql_exception $e) {
    if ($stmt->errno == 1062) {
        echo json_encode(['success' => false, 'message' => '您已提交过 请勿填写重复电话']);
    } else {
        echo json_encode(['success' => false, 'message' => '数据库错误：' . $e->getMessage()]);
    }
}


$stmt->close();
$conn->close();
