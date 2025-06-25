<?php
// Este script deve ser incluído em todas as páginas que só podem ser acessadas por usuários logados.
// É importante que ele venha DEPOIS do include do 'conexao.php', pois a sessão é iniciada lá.

// Verifica se a variável de sessão 'usuario_id' NÃO está definida.
// Esta variável só é definida no script de login, após o sucesso da autenticação.
if (!isset($_SESSION['usuario_id'])) {
    
    // Se o usuário não estiver logado, ele é redirecionado para a página de login.
    // O caminho '/contas/login.php' está fixo para garantir que sempre funcione.
    header("Location: /contas/login.php");
    
    // exit() é crucial para garantir que nenhum código abaixo desta linha seja executado após o redirecionamento.
    exit();
}