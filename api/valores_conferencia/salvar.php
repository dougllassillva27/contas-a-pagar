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