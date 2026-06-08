<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: no-cache, must-revalidate');

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // JSON 配置
    $configFile = __DIR__ . '/../config/node_conf.json';
    if (!file_exists($configFile)) {
        throw new Exception('配置文件不存在');
    }

    $config = json_decode(file_get_contents($configFile), true);

    if (empty($config['host']) || empty($config['port'])) {
        throw new Exception('配置缺少 host 或 port');
    }

    echo json_encode([
        'code' => 0,
        'data' => $config,
        'message' => 'success'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'code' => -1,
        'data' => null,
        'message' => $e->getMessage()
    ]);
}
