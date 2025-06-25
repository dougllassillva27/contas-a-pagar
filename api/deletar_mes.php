<?php
header('Content-Type: application/json; charset=utf-8');
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

ob_start();
$resposta = ['sucesso' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $mes_ano = $input['mes_ano'] ?? '';
    $usuario_id = $_SESSION['usuario_id'];

    if (preg_match('/^\d{4}-\d{2}$/', $mes_ano)) {
        try {
            $pdo->beginTransaction();

            // Deletar rendas
            $stmt_rendas = $pdo->prepare("DELETE FROM rendas WHERE usuario_id = ? AND mes_ano_referencia = ?");
            $stmt_rendas->execute([$usuario_id, $mes_ano]);

            // Deletar contas
            $stmt_contas = $pdo->prepare("DELETE FROM contas WHERE usuario_id = ? AND mes_ano_referencia = ?");
            $stmt_contas->execute([$usuario_id, $mes_ano]);

            $pdo->commit();
            $resposta['sucesso'] = true;
            http_response_code(200);
        } catch (Exception $e) {
            $pdo->rollBack();
            $resposta['mensagem'] = 'Erro ao deletar mês: ' . $e->getMessage();
            http_response_code(500);
        }
    } else {
        $resposta['mensagem'] = 'Mês inválido.';
        http_response_code(400);
    }
}

ob_end_clean();
echo json_encode($resposta);
?>