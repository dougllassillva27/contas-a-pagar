<?php
header('Content-Type: application/json');
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false, 'dados' => ['valor' => '']];
$mes_ano = $_GET['mes'] ?? null;
$tipo_valor = $_GET['tipo_valor'] ?? null;
$usuario_id = $_SESSION['usuario_id'];

if ($mes_ano && $tipo_valor) {
    try {
        $stmt = $pdo->prepare(
            "SELECT valor FROM valores_conferencia 
             WHERE usuario_id = ? AND mes_ano_referencia = ? AND tipo_valor = ?"
        );
        $stmt->execute([$usuario_id, $mes_ano, $tipo_valor]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resultado) {
            $resposta['dados']['valor'] = $resultado['valor'];
        }
        $resposta['sucesso'] = true;

    } catch (PDOException $e) {
        $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
        error_log("API obter_valor_conferencia - ERRO: " . $e->getMessage());
    }
} else {
    $resposta['erro'] = 'Parâmetros ausentes.';
}

echo json_encode($resposta);
?>