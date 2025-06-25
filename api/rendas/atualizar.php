<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_da_renda = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $descricao = trim(filter_input(INPUT_POST, 'descricao', FILTER_SANITIZE_SPECIAL_CHARS));
    $valor = filter_input(INPUT_POST, 'valor', FILTER_VALIDATE_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $tipo = filter_input(INPUT_POST, 'tipo_renda', FILTER_SANITIZE_SPECIAL_CHARS);
    $id_do_usuario = $_SESSION['usuario_id'];

    if ($id_da_renda && !empty($descricao) && $valor && !empty($tipo)) {
        try {
            $sql = "UPDATE rendas SET descricao = :descricao, valor = :valor, tipo = :tipo WHERE id = :id AND usuario_id = :id_usuario";
            $comando = $pdo->prepare($sql);
            $comando->execute([
                ':descricao' => $descricao,
                ':valor' => $valor,
                ':tipo' => $tipo,
                ':id' => $id_da_renda,
                ':id_usuario' => $id_do_usuario
            ]);
            $resposta['sucesso'] = true;
        } catch (PDOException $e) {
            http_response_code(500);
            $resposta['erro'] = 'Erro do servidor: ' . $e->getMessage();
        }
    } else {
        http_response_code(400);
        $resposta['erro'] = 'Dados inválidos ou faltando.';
    }
} else {
    http_response_code(405);
    $resposta['erro'] = 'Método não permitido.';
}

echo json_encode($resposta);