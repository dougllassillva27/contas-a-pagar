<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];
$dados = json_decode(file_get_contents('php://input'), true);

$conteudo = $dados['conteudo'] ?? null;
$mes_ano = $dados['mes_ano_referencia'] ?? null;
$usuario_id = $_SESSION['usuario_id'];

if (isset($conteudo) && $mes_ano && $usuario_id) {
    try {
        $sql = "INSERT INTO anotacoes (usuario_id, mes_ano_referencia, conteudo) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE conteudo = VALUES(conteudo)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario_id, $mes_ano, $conteudo]);
        $resposta['sucesso'] = true;

    } catch (PDOException $e) {
        http_response_code(500);
        $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
    }
} else {
    http_response_code(400);
    $resposta['erro'] = 'Dados inválidos.';
}
echo json_encode($resposta);
?>