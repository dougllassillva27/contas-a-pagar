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
    $descricao = trim(filter_input(INPUT_POST, 'descricao', FILTER_SANITIZE_SPECIAL_CHARS));
    $valor = filter_input(INPUT_POST, 'valor', FILTER_VALIDATE_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $tipo = filter_input(INPUT_POST, 'tipo', FILTER_SANITIZE_SPECIAL_CHARS);
    $mes_ano = filter_input(INPUT_POST, 'mes_ano_referencia', FILTER_SANITIZE_SPECIAL_CHARS);
    $id_do_usuario = $_SESSION['usuario_id'];

    if (!empty($descricao) && $valor && $tipo && $mes_ano) {
        try {
            $pdo->beginTransaction();

            $comando_ordem = $pdo->prepare("SELECT IFNULL(MAX(ordem), 0) + 1 FROM rendas WHERE usuario_id = :id_usuario AND mes_ano_referencia = :mes_ano");
            $comando_ordem->execute([':id_usuario' => $id_do_usuario, ':mes_ano' => $mes_ano]);
            $nova_ordem = $comando_ordem->fetchColumn();

            $sql = "INSERT INTO rendas (usuario_id, descricao, valor, tipo, mes_ano_referencia, ordem) VALUES (:id_usuario, :descricao, :valor, :tipo, :mes_ano, :ordem)";
            $comando = $pdo->prepare($sql);
            $comando->execute([
                ':id_usuario' => $id_do_usuario,
                ':descricao' => $descricao,
                ':valor' => $valor,
                ':tipo' => $tipo,
                ':mes_ano' => $mes_ano,
                ':ordem' => $nova_ordem
            ]);
            
            $pdo->commit();
            $resposta['sucesso'] = true;
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            $resposta['erro'] = 'Erro de Servidor: ' . $e->getMessage();
        }
    } else {
        http_response_code(400);
        $resposta['erro'] = 'Dados inválidos ou faltando.';
    }
} else {
    http_response_code(405);
    $resposta['erro'] = 'Método não permitido.';
}

echo json_encode($resposta);