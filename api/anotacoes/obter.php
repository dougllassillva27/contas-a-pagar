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

$resposta = ['sucesso' => false, 'dados' => ['conteudo' => '']];
$mes_ano = $_GET['mes'] ?? date('Y-m');
$usuario_id = $_SESSION['usuario_id'];

if ($mes_ano && $usuario_id) {
    try {
        $stmt = $pdo->prepare("SELECT conteudo FROM anotacoes WHERE usuario_id = ? AND mes_ano_referencia = ?");
        $stmt->execute([$usuario_id, $mes_ano]);
        $anotacao = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($anotacao) {
            $resposta['dados']['conteudo'] = $anotacao['conteudo'];
        }
        
        $resposta['sucesso'] = true;
    } catch (PDOException $e) {
        http_response_code(500);
        $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
    }
} else {
    http_response_code(400);
    $resposta['erro'] = 'Dados inválidos.';
}
echo json_encode($resposta);
?>