<?php
// Inicia a sessão para que possamos usar variáveis de login em toda a aplicação.
session_start();

// AJUSTE: O caminho para o arquivo .env foi atualizado para a localização absoluta e dedicada que você especificou.
// Este é um método mais seguro e explícito.
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