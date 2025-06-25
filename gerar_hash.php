<?php
// Defina aqui a senha que você deseja usar para o login
$senha_pura = '';

// Este código irá gerar o hash seguro
$hash = password_hash($senha_pura, PASSWORD_DEFAULT);

// Exibe o hash na tela. É este o valor que você vai copiar.
echo "Seu hash de senha é: <br><br>";
echo "<textarea rows='3' cols='70' readonly>" . htmlspecialchars($hash) . "</textarea>";
?>