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

$resposta = ['sucesso' => false, 'dados' => 0.00];

// 1. VALIDAÇÃO DE ENTRADA: O mês/ano de referência é obrigatório
$mes_ano = filter_input(INPUT_GET, 'mes', FILTER_SANITIZE_SPECIAL_CHARS);
$id_do_usuario = $_SESSION['usuario_id'];

if (!$mes_ano) {
    http_response_code(400);
    $resposta['erro'] = 'Parâmetro "mes" é obrigatório.';
    echo json_encode($resposta);
    exit();
}

try {
    /**
     * 2. QUERY SEGURA (PDO): Soma apenas contas PENDENTES das seções pessoais
     * 
     * Regras de Negócio aplicadas:
     * - status != 'PAGA': Exclui contas já pagas
     * - nome_terceiro IS NULL: Filtra apenas contas pessoais (exclui Morr, Mãe, Vô)
     * - tipo NOT IN ('MORR', 'MAE', 'VO'): Segurança adicional para excluir tipos especiais
     * 
     * Escopo: Contas Fixas + Contas Cartão de Crédito (variáveis) do usuário principal
     */
    $sql = "SELECT SUM(valor) AS total_pendente
            FROM contas
            WHERE usuario_id = :id_usuario
              AND mes_ano_referencia = :mes_ano
              AND status != 'PAGA'
              AND nome_terceiro IS NULL
              AND tipo NOT IN ('MORR', 'MAE', 'VO')";

    $comando = $pdo->prepare($sql);
    $comando->bindParam(':id_usuario', $id_do_usuario, PDO::PARAM_INT);
    $comando->bindParam(':mes_ano', $mes_ano, PDO::PARAM_STR);
    $comando->execute();
    
    // 3. TRATAMENTO DO RESULTADO: Converte NULL para 0.0 (caso não haja contas pendentes)
    $resultado = $comando->fetch(PDO::FETCH_ASSOC);
    $total_pendente = (float) ($resultado['total_pendente'] ?? 0.0);
    
    $resposta['sucesso'] = true;
    $resposta['dados'] = $total_pendente;

} catch (PDOException $e) {
    // 4. TRATAMENTO DE ERRO: Observabilidade e feedback controlado
    http_response_code(500);
    $resposta['erro'] = 'Erro de servidor ao buscar o total pendente.';
    error_log("API CONTAS/TOTAL_PENDENTE: " . $e->getMessage()); 
}

echo json_encode($resposta);
