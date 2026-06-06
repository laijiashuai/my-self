<?php
header('Content-Type: application/json');

$config = require __DIR__ . '/../config/database.php';

$conn = new mysqli(
    $config['host'],
    $config['username'],
    $config['password'],
    $config['dbname']
);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => '数据库连接失败']);
    exit;
}

$phone = trim($_POST['phone'] ?? '');

if (empty($phone)) {
    echo json_encode(['success' => false, 'message' => '手机号不能为空']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM recruitment_info WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => true, 'exists' => true]);
} else {
    echo json_encode(['success' => true, 'exists' => false]);
}

$stmt->close();
$conn->close();
