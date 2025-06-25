<?php
header('Content-Type: application/json; charset=utf-8');
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $descricao = trim(filter_input(INPUT_POST, 'descricao', FILTER_SANITIZE_SPECIAL_CHARS));
    $valor = filter_input(INPUT_POST, 'valor', FILTER_VALIDATE_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    
    // Validação explícita do tipo recebido
    $tipo_recebido = filter_input(INPUT_POST, 'tipo', FILTER_SANITIZE_SPECIAL_CHARS);
    $tipos_permitidos = ['UNICA', 'PARCELADA', 'FIXA', 'MORR', 'MAE', 'VO'];
    $tipo = in_array($tipo_recebido, $tipos_permitidos) ? $tipo_recebido : null;

    $info_parcela = ($tipo === 'PARCELADA') ? trim(filter_input(INPUT_POST, 'parcela_info', FILTER_SANITIZE_SPECIAL_CHARS)) : null;
    $nome_terceiro = trim(filter_input(INPUT_POST, 'nome_terceiro', FILTER_SANITIZE_SPECIAL_CHARS));
    $nome_terceiro = !empty($nome_terceiro) ? $nome_terceiro : null;
    $mes_ano = filter_input(INPUT_POST, 'mes_ano_referencia', FILTER_SANITIZE_SPECIAL_CHARS);
    $id_do_usuario = $_SESSION['usuario_id'];

    if (!empty($descricao) && $valor !== false && $tipo && $mes_ano) {
        try {
            $pdo->beginTransaction();

            $comando_ordem = $pdo->prepare("SELECT IFNULL(MAX(ordem), 0) + 1 FROM contas WHERE usuario_id = :id_usuario AND mes_ano_referencia = :mes_ano");
            $comando_ordem->execute([':id_usuario' => $id_do_usuario, ':mes_ano' => $mes_ano]);
            $nova_ordem = $comando_ordem->fetchColumn();

            $sql = "INSERT INTO contas (usuario_id, descricao, valor, tipo, parcela_info, nome_terceiro, mes_ano_referencia, ordem) VALUES (:id_usuario, :descricao, :valor, :tipo, :info_parcela, :nome_terceiro, :mes_ano, :ordem)";
            $comando = $pdo->prepare($sql);
            
            $comando->execute([
                ':id_usuario' => $id_do_usuario,
                ':descricao' => $descricao,
                ':valor' => $valor,
                ':tipo' => $tipo,
                ':info_parcela' => $info_parcela,
                ':nome_terceiro' => $nome_terceiro,
                ':mes_ano' => $mes_ano,
                ':ordem' => $nova_ordem
            ]);
            
            $pdo->commit();
            $resposta['sucesso'] = true;
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
            error_log("API CONTAS/CRIAR - ERRO PDO: " . $e->getMessage());
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