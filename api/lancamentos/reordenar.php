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
$dados = json_decode(file_get_contents('php://input'), true);

$id_do_usuario = $_SESSION['usuario_id'];
$tipo_tabela = $dados['tipo'] ?? null;
$ordem_ids = $dados['ordem_ids'] ?? null;

// Validação dos dados recebidos
if (in_array($tipo_tabela, ['contas', 'rendas']) && is_array($ordem_ids) && !empty($ordem_ids)) {
    try {
        $pdo->beginTransaction();

        $sql = "UPDATE {$tipo_tabela} SET ordem = :ordem WHERE id = :id AND usuario_id = :id_usuario";
        $comando = $pdo->prepare($sql);

        // Itera sobre o array de IDs recebido e atualiza a ordem de cada um
        foreach ($ordem_ids as $indice => $id) {
            $nova_ordem = $indice + 1; // A ordem começa em 1
            $comando->execute([
                ':ordem' => $nova_ordem,
                ':id' => filter_var($id, FILTER_VALIDATE_INT),
                ':id_usuario' => $id_do_usuario
            ]);
        }

        $pdo->commit();
        $resposta['sucesso'] = true;

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        $resposta['erro'] = 'Erro de Servidor ao reordenar: ' . $e->getMessage();
        error_log("API REORDENAR (drag-drop) - ERRO PDO: " . $e->getMessage());
    }
} else {
    http_response_code(400);
    $resposta['erro'] = 'Dados inválidos para reordenação.';
}

echo json_encode($resposta);
?>