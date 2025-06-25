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