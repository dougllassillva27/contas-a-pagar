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