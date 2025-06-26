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

// PASSO 1: Definir um caminho privado e PORTÁTIL para as sessões.
// Usamos um nome de pasta dedicado para este projeto.
$caminho_sessoes = $_SERVER['DOCUMENT_ROOT'] . '/../sessions_contas';

// Garante que o diretório exista.
if (!is_dir($caminho_sessoes)) {
    mkdir($caminho_sessoes, 0700, true);
}
session_save_path($caminho_sessoes);


// PASSO 2: Definir o tempo de vida da sessão
$tempo_de_vida_da_sessao = 28800; // 8 horas

// Configura o tempo que a sessão fica ativa no servidor (Garbage Collector)
ini_set('session.gc_maxlifetime', $tempo_de_vida_da_sessao);

// Configura o tempo que o cookie da sessão fica ativo no navegador do usuário
ini_set('session.cookie_lifetime', $tempo_de_vida_da_sessao);


// PASSO 3: Iniciar a sessão com as novas configurações aplicadas
session_start();


// PASSO 4: Conexão com o Banco de Dados (código existente)
$env_caminho = '/home/dougl951/configs/contas-a-pagar/.env';

if (file_exists($env_caminho)) {
    $env = parse_ini_file($env_caminho);
    $db_host = $env['DB_HOST'];
    $db_port = $env['DB_PORT'];
    $db_name = $env['DB_NAME'];
    $db_user = $env['DB_USER'];
    $db_pass = $env['DB_PASS'];
} else {
    die("Erro crítico: Arquivo de configuração .env não encontrado em '" . htmlspecialchars($env_caminho) . "'.");
}

try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    die("Erro de conexão com o banco de dados: " . $e->getMessage());
}