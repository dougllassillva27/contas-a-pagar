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
// Define o tempo de vida da sessão para 8 horas (28800 segundos)
// Esta configuração deve vir ANTES de session_start()
$tempo_de_vida_da_sessao = 28800;

// Configura o tempo que a sessão fica ativa no servidor (Garbage Collector)
ini_set('session.gc_maxlifetime', $tempo_de_vida_da_sessao);

// Configura o tempo que o cookie da sessão fica ativo no navegador do usuário
ini_set('session.cookie_lifetime', $tempo_de_vida_da_sessao);

// Inicia a sessão para que possamos usar variáveis de login em toda a aplicação.
session_start();

// O caminho para o arquivo .env foi atualizado para a localização absoluta e dedicada.
$env_caminho = '/home/dougl951/configs/contas-a-pagar/.env';

if (file_exists($env_caminho)) {
    // Carrega as variáveis de ambiente do arquivo .env.
    $env = parse_ini_file($env_caminho);
    $db_host = $env['DB_HOST'];
    $db_port = $env['DB_PORT'];
    $db_name = $env['DB_NAME'];
    $db_user = $env['DB_USER'];
    $db_pass = $env['DB_PASS'];
} else {
    // Se o arquivo .env não for encontrado no caminho especificado, interrompe a execução com um erro claro.
    die("Erro crítico: Arquivo de configuração .env não encontrado em '" . htmlspecialchars($env_caminho) . "'.");
}

try {
    // Cria a conexão com o banco de dados usando PDO (PHP Data Objects).
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            // Configura o PDO para lançar exceções em caso de erro.
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            // Define o modo de busca padrão para retornar arrays associativos.
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    // Se a conexão falhar, interrompe a execução e exibe a mensagem de erro.
    die("Erro de conexão com o banco de dados: " . $e->getMessage());
}