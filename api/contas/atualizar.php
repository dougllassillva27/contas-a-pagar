<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_da_conta = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $descricao = trim(filter_input(INPUT_POST, 'descricao', FILTER_SANITIZE_SPECIAL_CHARS));
    $valor = filter_input(INPUT_POST, 'valor', FILTER_VALIDATE_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $tipo = filter_input(INPUT_POST, 'tipo', FILTER_SANITIZE_SPECIAL_CHARS);
    $info_parcela = ($tipo === 'PARCELADA') ? trim(filter_input(INPUT_POST, 'parcela_info', FILTER_SANITIZE_SPECIAL_CHARS)) : null;
    $nome_terceiro = trim(filter_input(INPUT_POST, 'nome_terceiro', FILTER_SANITIZE_SPECIAL_CHARS));
    $nome_terceiro = !empty($nome_terceiro) ? $nome_terceiro : null;
    $id_do_usuario = $_SESSION['usuario_id'];

    if ($id_da_conta && !empty($descricao) && $valor && !empty($tipo)) {
        try {
            $sql = "UPDATE contas SET descricao = :descricao, valor = :valor, tipo = :tipo, parcela_info = :info_parcela, nome_terceiro = :nome_terceiro WHERE id = :id AND usuario_id = :id_usuario";
            $comando = $pdo->prepare($sql);
            $comando->execute([
                ':descricao' => $descricao,
                ':valor' => $valor,
                ':tipo' => $tipo,
                ':info_parcela' => $info_parcela,
                ':nome_terceiro' => $nome_terceiro,
                ':id' => $id_da_conta,
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