<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
$base = '/contas';
$erro = $_GET['erro'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <meta name="description" content="Controle suas contas pessoais de forma simples e eficaz.">
    <meta name="keywords" content="contas, valores, organizacao, dinheiro" />
    <meta name="author" content="Douglas Silva" />

    <meta property="og:title" content="Painel de Controle Financeiro">
    <meta property="og:description" content="Controle suas contas pessoais de forma simples e eficaz.">
    <meta property="og:url" content="https://douglassilva27.com.br/contas/">
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://dougllassillva27.com.br/<?= versao("$base/assets/img/logo-social-share.webp") ?>">
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />

    <meta name="twitter:title" content="Painel de Controle Financeiro">
    <meta name="twitter:description" content="Controle suas contas pessoais de forma simples e eficaz.">
    <meta name="twitter:image" content="https://dougllassillva27.com.br/<?= versao("$base/assets/img/logo-social-share.webp") ?>">
    
    <title>Login - Painel Financeiro</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="<?= versao("$base/assets/css/login.css") ?>">
</head>
<body>
    <form class="formulario-container" action="<?= $base ?>/api/auth/login.php" method="POST">
        <div class="logo-login">💰 Painel Financeiro</div>

        <div class="flex-coluna">
            <label for="email">E-mail</label>
            <div class="input-container">
                <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path></g></svg>
                <input id="email" type="email" name="email" class="input-campo" placeholder="Digite seu e-mail" required autocomplete="email">
            </div>
        </div>

        <div class="flex-coluna">
            <label for="senha">Senha</label>
            <div class="input-container">
                <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path></svg>
                <input id="senha" type="password" name="senha" class="input-campo" placeholder="Digite sua senha" required autocomplete="current-password">
            </div>
        </div>

        <button type="submit" class="botao-submeter">Entrar</button>

        <?php if ($erro): ?>
            <p class="mensagem-erro"><?= htmlspecialchars($erro) ?></p>
        <?php endif; ?>
    </form>

    <div id="modal-carregando" class="modal-carregando-overlay">
        <div class="spinner-domino">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>

    <script>
        const formLogin = document.querySelector('.formulario-container');
        const modalCarregando = document.getElementById('modal-carregando');

        if (formLogin && modalCarregando) {
            formLogin.addEventListener('submit', (event) => {
                // 1. Impede o envio padrão e imediato do formulário
                event.preventDefault();

                // 2. Mostra o modal com o efeito de fade-in
                modalCarregando.classList.add('visivel');

                // 3. Define um atraso de 5 segundos
                setTimeout(() => {
                    // 4. Após 5 segundos, envia o formulário
                    formLogin.submit();
                }, 3000); 
            });
            
            // Garante que o modal seja escondido se o usuário voltar à página
            window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                    modalCarregando.classList.remove('visivel');
                }
            });
        }
    </script>
</body>
</html>