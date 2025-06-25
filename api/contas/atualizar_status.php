<?php
/**
 * MIT License
 *
 * Copyright (c) 2025 Douglas Silva
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
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