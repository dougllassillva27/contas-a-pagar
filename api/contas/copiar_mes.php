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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mes_ano_origem = $_POST['mes_ano_origem'] ?? '';
    $usuario_id = $_SESSION['usuario_id'];

    if (preg_match('/^\d{4}-\d{2}$/', $mes_ano_origem)) {
        try {
            $data_origem = new DateTime($mes_ano_origem . '-01');
            $proximo_mes = (clone $data_origem)->modify('+1 month')->format('Y-m');

            $pdo->beginTransaction();

            // 1. Copiar rendas
            $stmt_rendas = $pdo->prepare(
                "SELECT usuario_id, descricao, valor, tipo, ordem 
                 FROM rendas 
                 WHERE usuario_id = ? AND mes_ano_referencia = ?"
            );
            $stmt_rendas->execute([$usuario_id, $mes_ano_origem]);
            $rendas_para_copiar = $stmt_rendas->fetchAll(PDO::FETCH_ASSOC);

            $rendas_copiadas = 0;
            $insert_renda_stmt = $pdo->prepare(
                "INSERT INTO rendas (usuario_id, descricao, valor, tipo, mes_ano_referencia, ordem) 
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            foreach ($rendas_para_copiar as $renda) {
                $insert_renda_stmt->execute([
                    $usuario_id,
                    $renda['descricao'],
                    $renda['valor'],
                    $renda['tipo'],
                    $proximo_mes,
                    $renda['ordem']
                ]);
                $rendas_copiadas++;
            }

            // 2. Copiar contas
            $stmt_contas = $pdo->prepare(
                "SELECT usuario_id, descricao, valor, tipo, parcela_info, nome_terceiro, ordem 
                 FROM contas 
                 WHERE usuario_id = ? AND mes_ano_referencia = ? 
                 AND (
                     tipo = 'FIXA' OR 
                     tipo = 'PARCELADA' OR 
                     (tipo IN ('MORR', 'MAE', 'VO') AND nome_terceiro IS NULL)
                 )"
            );
            $stmt_contas->execute([$usuario_id, $mes_ano_origem]);
            $contas_para_copiar = $stmt_contas->fetchAll(PDO::FETCH_ASSOC);

            $contas_copiadas = 0;
            $insert_conta_stmt = $pdo->prepare(
                "INSERT INTO contas (usuario_id, descricao, valor, tipo, parcela_info, nome_terceiro, mes_ano_referencia, status, ordem) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDENTE', ?)"
            );
            foreach ($contas_para_copiar as $conta) {
                $nova_parcela_info = $conta['parcela_info'];
                
                if ($conta['tipo'] === 'PARCELADA') {
                    if (preg_match('/(\d+)\/(\d+)/', $conta['parcela_info'], $matches)) {
                        $parcela_atual = (int)$matches[1];
                        $parcela_total = (int)$matches[2];
                        if ($parcela_atual >= $parcela_total) continue; // Pula se for a última parcela
                        $nova_parcela_info = ($parcela_atual + 1) . '/' . $parcela_total;
                    }
                }

                $insert_conta_stmt->execute([
                    $usuario_id,
                    $conta['descricao'],
                    $conta['valor'],
                    $conta['tipo'],
                    $nova_parcela_info,
                    $conta['nome_terceiro'],
                    $proximo_mes,
                    $conta['ordem']
                ]);
                $contas_copiadas++;
            }

            $pdo->commit();
            $resposta['sucesso'] = true;
            $resposta['dados'] = [
                'contas_copiadas' => $contas_copiadas,
                'rendas_copiadas' => $rendas_copiadas,
                'proximo_mes' => $proximo_mes
            ];

        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Erro ao copiar contas/rendas de $mes_ano_origem para $proximo_mes (usuário $usuario_id): " . $e->getMessage());
            $resposta['erro'] = 'Erro ao copiar contas e rendas: ' . $e->getMessage();
        }
    } else {
        $resposta['erro'] = 'Mês de origem inválido.';
    }
}
echo json_encode($resposta);
?>