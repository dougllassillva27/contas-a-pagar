<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
$base = '/contas';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        header("Location: $base/login.php?erro=Preencha todos os campos.");
        exit();
    }

    $stmt = $pdo->prepare("SELECT id, senha_hash FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();

    if ($usuario && password_verify($senha, $usuario['senha_hash'])) {
        // SUCESSO! A variável de sessão é definida.
        $_SESSION['usuario_id'] = $usuario['id'];

        // A SOLUÇÃO: Força o salvamento de todos os dados da sessão no disco ANTES de continuar.
        // Isso resolve a 'condição de corrida' entre o salvamento da sessão e o redirecionamento.
        session_write_close();

        // Agora o redirecionamento pode ocorrer com segurança.
        header("Location: $base/index.php");
        exit();
        
    } else {
        // FALHA
        header("Location: $base/login.php?erro=Email ou senha inválidos.");
        exit();
    }
}