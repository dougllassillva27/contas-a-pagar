<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false, 'dados' => ['conteudo' => '']];
$mes_ano = $_GET['mes'] ?? date('Y-m');
$usuario_id = $_SESSION['usuario_id'];

if ($mes_ano && $usuario_id) {
    try {
        $stmt = $pdo->prepare("SELECT conteudo FROM anotacoes WHERE usuario_id = ? AND mes_ano_referencia = ?");
        $stmt->execute([$usuario_id, $mes_ano]);
        $anotacao = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($anotacao) {
            $resposta['dados']['conteudo'] = $anotacao['conteudo'];
        }
        
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