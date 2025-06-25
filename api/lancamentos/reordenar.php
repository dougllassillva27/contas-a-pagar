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