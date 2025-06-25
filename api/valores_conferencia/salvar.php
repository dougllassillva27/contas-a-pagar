<?php
header('Content-Type: application/json');
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];
$dados = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($dados)) {
    $valor = filter_var($dados['valor'], FILTER_SANITIZE_SPECIAL_CHARS);
    $mes_ano = $dados['mes_ano_referencia'] ?? null;
    $tipo_valor = $dados['tipo_valor'] ?? null;
    $usuario_id = $_SESSION['usuario_id'];

    if ($mes_ano && $tipo_valor) {
        try {
            // "INSERT ... ON DUPLICATE KEY UPDATE" é um "upsert": insere se não existir, ou atualiza se já existir.
            $sql = "INSERT INTO valores_conferencia (usuario_id, mes_ano_referencia, tipo_valor, valor) 
                    VALUES (:usuario_id, :mes_ano, :tipo_valor, :valor)
                    ON DUPLICATE KEY UPDATE valor = :valor";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':usuario_id' => $usuario_id,
                ':mes_ano' => $mes_ano,
                ':tipo_valor' => $tipo_valor,
                ':valor' => $valor
            ]);
            $resposta['sucesso'] = true;
        } catch (PDOException $e) {
            $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
            error_log("API salvar_valor_conferencia - ERRO: " . $e->getMessage());
        }
    } else {
        $resposta['erro'] = 'Dados inválidos.';
    }
}
echo json_encode($resposta);
?>