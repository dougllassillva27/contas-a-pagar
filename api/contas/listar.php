<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false, 'dados' => []];
$mes_ano = $_GET['mes'] ?? date('Y-m');
$id_do_usuario = $_SESSION['usuario_id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM contas WHERE usuario_id = ? AND mes_ano_referencia = ? ORDER BY ordem ASC, id ASC");
    $stmt->execute([$id_do_usuario, $mes_ano]);
    $resposta['dados'] = $stmt->fetchAll();
    $resposta['sucesso'] = true;
} catch (PDOException $e) {
    http_response_code(500);
    $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
}
echo json_encode($resposta);