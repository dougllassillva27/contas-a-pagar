<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_do_usuario = $_SESSION['usuario_id'];
    $tipo_tabela = filter_input(INPUT_POST, 'tipo', FILTER_SANITIZE_SPECIAL_CHARS) === 'conta' ? 'contas' : 'rendas';
    
    $id_item_movido = filter_input(INPUT_POST, 'id_movido', FILTER_VALIDATE_INT);
    $ordem_item_movido = filter_input(INPUT_POST, 'ordem_movido', FILTER_VALIDATE_INT);
    
    $id_item_alvo = filter_input(INPUT_POST, 'id_alvo', FILTER_VALIDATE_INT);
    $ordem_item_alvo = filter_input(INPUT_POST, 'ordem_alvo', FILTER_VALIDATE_INT);

    if (in_array($tipo_tabela, ['contas', 'rendas']) && $id_item_movido && isset($ordem_item_movido) && $id_item_alvo && isset($ordem_item_alvo)) {
        try {
            $pdo->beginTransaction();

            $sql1 = "UPDATE {$tipo_tabela} SET ordem = :ordem_nova WHERE id = :id AND usuario_id = :id_usuario";
            $comando1 = $pdo->prepare($sql1);
            $comando1->execute([':ordem_nova' => $ordem_item_movido, ':id' => $id_item_alvo, ':id_usuario' => $id_do_usuario]);

            $sql2 = "UPDATE {$tipo_tabela} SET ordem = :ordem_nova WHERE id = :id AND usuario_id = :id_usuario";
            $comando2 = $pdo->prepare($sql2);
            $comando2->execute([':ordem_nova' => $ordem_item_alvo, ':id' => $id_item_movido, ':id_usuario' => $id_do_usuario]);
            
            $pdo->commit();
            $resposta['sucesso'] = true;

        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            $resposta['erro'] = 'Erro de Servidor ao reordenar: ' . $e->getMessage();
        }
    } else {
        http_response_code(400);
        $resposta['erro'] = 'Dados inválidos para reordenação.';
    }
} else {
    http_response_code(405);
    $resposta['erro'] = 'Método não permitido.';
}

echo json_encode($resposta);