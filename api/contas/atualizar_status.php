<?php
header('Content-Type: application/json');
// CORREÇÃO: Ajustando o caminho para os includes específicos do projeto.
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';

$resposta = ['sucesso' => false];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;
    $status = $_POST['status'] ?? '';
    $usuario_id = $_SESSION['usuario_id'];

    if ($id > 0 && ($status === 'PAGA' || $status === 'PENDENTE')) {
        try {
            $stmt = $pdo->prepare("UPDATE contas SET status = ? WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$status, $id, $usuario_id]);
            $resposta['sucesso'] = $stmt->rowCount() > 0;
            if (!$resposta['sucesso']) $resposta['erro'] = 'Conta não encontrada ou permissão negada.';
        } catch (PDOException $e) {
            $resposta['erro'] = $e->getMessage();
        }
    } else {
        $resposta['erro'] = 'Dados inválidos.';
    }
}
echo json_encode($resposta);