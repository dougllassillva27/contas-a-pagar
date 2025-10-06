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

// 1. VALIDAÇÃO DE MÉTODO HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $resposta['erro'] = 'Método não permitido. Use POST.';
    echo json_encode($resposta);
    exit();
}

// 2. LEITURA E VALIDAÇÃO DO INPUT JSON
$input = file_get_contents('php://input');
$dados = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    $resposta['erro'] = 'JSON inválido no corpo da requisição.';
    echo json_encode($resposta);
    exit();
}

// 3. VALIDAÇÃO DOS PARÂMETROS OBRIGATÓRIOS
if (!isset($dados['ids']) || !is_array($dados['ids']) || empty($dados['ids'])) {
    http_response_code(400);
    $resposta['erro'] = 'Parâmetro "ids" é obrigatório e deve ser um array não vazio.';
    echo json_encode($resposta);
    exit();
}

if (!isset($dados['status']) || !in_array($dados['status'], ['PAGA', 'PENDENTE'])) {
    http_response_code(400);
    $resposta['erro'] = 'Parâmetro "status" é obrigatório e deve ser "PAGA" ou "PENDENTE".';
    echo json_encode($resposta);
    exit();
}

$ids = array_map('intval', $dados['ids']); // Sanitiza IDs para inteiros
$status = $dados['status'];
$id_do_usuario = $_SESSION['usuario_id'];

// Remove valores inválidos (0 ou negativos)
$ids = array_filter($ids, function($id) {
    return $id > 0;
});

if (empty($ids)) {
    http_response_code(400);
    $resposta['erro'] = 'Nenhum ID válido foi fornecido.';
    echo json_encode($resposta);
    exit();
}

try {
    // 4. INICIA TRANSAÇÃO ATÔMICA
    $pdo->beginTransaction();

    // 5. CONSTRÓI QUERY DINÂMICA COM PLACEHOLDERS
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = "UPDATE contas 
            SET status = ? 
            WHERE id IN ($placeholders) 
            AND usuario_id = ?";

    $comando = $pdo->prepare($sql);

    // 6. VINCULA PARÂMETROS: status + ids + usuario_id
    $parametros = array_merge([$status], $ids, [$id_do_usuario]);
    $comando->execute($parametros);

    // 7. VERIFICA QUANTOS REGISTROS FORAM AFETADOS
    $registros_afetados = $comando->rowCount();

    // 8. COMMIT DA TRANSAÇÃO
    $pdo->commit();

    // 9. RESPOSTA DE SUCESSO
    $resposta['sucesso'] = true;
    $resposta['dados'] = [
        'registros_atualizados' => $registros_afetados,
        'ids_solicitados' => count($ids),
        'status_aplicado' => $status
    ];

    // Log de auditoria (opcional)
    error_log("ATUALIZAÇÃO EM LOTE: Usuário {$id_do_usuario} atualizou {$registros_afetados} contas para status '{$status}'");

} catch (PDOException $e) {
    // 10. ROLLBACK EM CASO DE ERRO
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    $resposta['erro'] = 'Erro de servidor ao atualizar contas em lote.';
    
    // Log do erro técnico (não expõe ao cliente por segurança)
    error_log("ERRO API LOTE: " . $e->getMessage());
}

echo json_encode($resposta);
