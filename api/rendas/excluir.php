<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_da_renda = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $id_do_usuario = $_SESSION['usuario_id'];

    if ($id_da_renda) {
        try {
            $sql = "DELETE FROM rendas WHERE id = :id AND usuario_id = :id_usuario";
            $comando = $pdo->prepare($sql);
            $comando->bindParam(':id', $id_da_renda, PDO::PARAM_INT);
            $comando->bindParam(':id_usuario', $id_do_usuario, PDO::PARAM_INT);
            $comando->execute();

            if ($comando->rowCount() > 0) {
                $resposta['sucesso'] = true;
            } else {
                $resposta['erro'] = 'Renda não encontrada ou permissão negada para excluir.';
            }
        } catch (PDOException $e) {
            http_response_code(500);
            $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
        }
    } else {
        http_response_code(400);
        $resposta['erro'] = 'ID da renda inválido.';
    }
} else {
    http_response_code(405);
    $resposta['erro'] = 'Método não permitido.';
}

echo json_encode($resposta);