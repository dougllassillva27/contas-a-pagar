<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';
$base = '/contas';
$mes_ano_get = $_GET['mes'] ?? date('Y-m');
$data_base = new DateTime($mes_ano_get . '-01');
$mes_ano_atual = $data_base->format('Y-m');
$mes_ano_anterior = (clone $data_base)->modify('-1 month')->format('Y-m');
$mes_ano_seguinte = (clone $data_base)->modify('+1 month')->format('Y-m');
setlocale(LC_TIME, 'pt_BR.utf-8', 'pt_BR', 'portuguese');
$nome_mes_atual = strftime('%B/%Y', $data_base->getTimestamp());

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Controle suas contas pessoais de forma simples e eficaz.">
    <meta name="keywords" content="contas, valores, organizacao, dinheiro" />
    <meta name="author" content="Douglas Silva" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

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
    <title>Painel Financeiro - <?= htmlspecialchars($nome_mes_atual) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= versao("$base/assets/css/style.css") ?>">
</head>
<body>
    <header class="cabecalho-principal">
        <div class="container-cabecalho">
            <div class="cabecalho-esquerda">
                <h1>Painel de <?= htmlspecialchars($nome_mes_atual) ?></h1>
                <nav class="navegacao-mes">
                    <a href="?mes=<?= $mes_ano_anterior ?>">‹ Anterior</a>
                    <a href="?mes=<?= date('Y-m') ?>" class="botao-mes-atual">Mês Atual</a>
                    <a href="?mes=<?= $mes_ano_seguinte ?>">Próximo ›</a>
                    <button id="btn-copiar-mes" class="botao-copiar-mes">Copiar Contas</button>
                    <button id="btn-deletar-mes" class="botao-deletar-mes">Deletar Mês</button>
                </nav>
                <div class="menu-acoes-mobile">
                    <button id="botao-menu-acoes" class="botao-menu-acoes" aria-label="Mais ações">⋮</button>
                    <div id="dropdown-menu-acoes" class="dropdown-menu-acoes">
                        <a href="#" id="link-copiar-mobile">Copiar Contas</a>
                        <a href="#" id="link-deletar-mobile">Deletar Mês</a>
                        <a href="#" id="link-tema-mobile">Alterar Tema</a>
                    </div>
                </div>
            </div>
            <button id="alternar-tema" class="botao-tema">🎨 Tema</button>
        </div>
    </header>

     <main class="container-principal">
        <section id="resumo-geral" class="linha-resumo">
            <div id="card-total-rendas" class="card-resumo card-interativo"><h3>Total de Rendas</h3><p id="total-rendas">R$ 0,00</p></div>
            <div class="card-resumo"><h3>Suas Contas</h3><p id="total-contas">R$ 0,00</p></div>
            <div class="card-resumo"><h3>Seu Saldo</h3><p id="saldo-mes">R$ 0,00</p></div>
        </section>

        <div class="container-acoes-principais">
            <button id="botao-abrir-modal-lancamento" class="botao-acao-principal">+ Adicionar Lançamento</button>
        </div>

        <div class="grid-lancamentos">
            <section class="card-painel">
                <h2 class="card-titulo">Anotações</h2>
                <textarea id="area-anotacoes" class="area-anotacoes" placeholder="Digite suas anotações para este mês..."></textarea>
            </section>
            
            <section class="card-painel acordeao-item abrir-em-desktop">
                <div class="acordeao-cabecalho card-titulo" data-acao="alternar-acordeao">
                    <span class="nome-terceiro">Suas Contas Fixas</span>
                    <div class="cabecalho-direita">
                        <strong id="total-contas-fixas" class="total-terceiro"></strong>
                        <span class="icone-expandir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
                        </span>
                    </div>
                </div>
                <div class="acordeao-corpo">
                    <div class="acordeao-corpo-conteudo" style="padding: 0;">
                        <table id="tabela-contas-fixas" class="tabela-lancamentos" style="margin-top: 0;">
                            <thead><tr><th>Status</th><th>Descrição</th><th class="coluna-valor">Valor</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section class="card-painel acordeao-item abrir-em-desktop">
                <div class="acordeao-cabecalho card-titulo" data-acao="alternar-acordeao">
                    <span class="nome-terceiro" >Suas Contas Cartão de Crédito</span>
                    <div class="cabecalho-direita">
                        <strong id="total-contas-variaveis" class="total-terceiro"></strong>
                        <span class="icone-expandir">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
                        </span>
                    </div>
                </div>
                 <div class="acordeao-corpo">
                    <div class="acordeao-corpo-conteudo" style="padding: 0;">
                        <table id="tabela-contas-variaveis" class="tabela-lancamentos" style="margin-top: 0;">
                            <thead><tr><th>Status</th><th>Descrição</th><th class="coluna-valor">Valor</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section class="card-painel">
                 <h2 class="card-titulo" id="titulo-contas-terceiros">Cartão de Crédito</h2>
                <div class="linha-comparacao-app">
                    <label for="valor-app-cartao">Cartão de Crédito - APP:</label>
                    <input type="text" id="valor-app-cartao" name="valor-app-cartao" placeholder="Digite o valor do APP">
                </div>
                <div id="cards-terceiros-container"></div>
            </section>
        </div>

        <div class="grid-lancamentos">
            <section class="card-painel acordeao-item abrir-em-desktop">
                <div class="acordeao-cabecalho card-titulo" data-acao="alternar-acordeao">
                     <span class="nome-terceiro">Morr total mês <?= strftime('%B', $data_base->getTimestamp()) ?></span>
                    <div class="cabecalho-direita">
                        <strong id="total-contas-morr" class="total-terceiro"></strong>
                        <span class="icone-expandir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
                        </span>
                    </div>
                </div>
                 <div class="acordeao-corpo">
                    <div id="container-contas-morr" class="acordeao-corpo-conteudo" style="padding: 0 1rem 1rem 1rem;">
                        <div id="acordeao-terceiro-morr-container"></div>
                        <h3 class="subtitulo-card">Lançamentos Diretos</h3>
                         <table id="tabela-contas-morr" class="tabela-lancamentos">
                            <thead><tr><th>Status</th><th>Descrição</th><th class="coluna-valor">Valor</th></tr></thead>
                            <tbody></tbody>
                         </table>
                    </div>
                </div>
            </section>
            <section class="card-painel acordeao-item abrir-em-desktop">
                <div class="acordeao-cabecalho card-titulo" data-acao="alternar-acordeao">
                     <span class="nome-terceiro">Mãe total mês <?= strftime('%B', $data_base->getTimestamp()) ?></span>
                    <div class="cabecalho-direita">
                        <strong id="total-contas-mae" class="total-terceiro"></strong>
                        <span class="icone-expandir">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
                        </span>
                    </div>
                </div>
                 <div class="acordeao-corpo">
                    <div id="container-contas-mae" class="acordeao-corpo-conteudo" style="padding: 0 1rem 1rem 1rem;">
                        <div id="acordeao-terceiro-mae-container"></div>
                        <h3 class="subtitulo-card">Lançamentos Diretos</h3>
                         <table id="tabela-contas-mae" class="tabela-lancamentos">
                            <thead><tr><th>Status</th><th>Descrição</th><th class="coluna-valor">Valor</th></tr></thead>
                            <tbody></tbody>
                         </table>
                    </div>
                </div>
            </section>
            <section class="card-painel acordeao-item abrir-em-desktop">
                <div class="acordeao-cabecalho card-titulo" data-acao="alternar-acordeao">
                     <span class="nome-terceiro">Vô total mês <?= strftime('%B', $data_base->getTimestamp()) ?></span>
                    <div class="cabecalho-direita">
                        <strong id="total-contas-vo" class="total-terceiro"></strong>
                        <span class="icone-expandir">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
                        </span>
                    </div>
                </div>
                <div class="acordeao-corpo">
                    <div id="container-contas-vo" class="acordeao-corpo-conteudo" style="padding: 0 1rem 1rem 1rem;">
                        <div id="acordeao-terceiro-vo-container"></div>
                        <h3 class="subtitulo-card">Lançamentos Diretos</h3>
                         <table id="tabela-contas-vo" class="tabela-lancamentos">
                            <thead><tr><th>Status</th><th>Descrição</th><th class="coluna-valor">Valor</th></tr></thead>
                            <tbody></tbody>
                         </table>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <footer class="rodape-principal">
        <p>
            Desenvolvido por
            <a href="https://www.linkedin.com/in/dougllassillva27/" target="_blank" rel="noopener noreferrer">Douglas Silva</a>
        </p>
    </footer>

    <div id="modal-rendas" class="modal-camada-externa" style="display:none;">
        <div class="modal-conteudo">
            <header class="modal-cabecalho">
                <h2 class="modal-titulo">Rendas de <?= htmlspecialchars($nome_mes_atual) ?></h2>
                <button class="modal-botao-fechar">×</button>
            </header>
            <div class="modal-corpo">
                <table id="tabela-rendas" class="tabela-lancamentos">
                    <thead><tr><th>Descrição</th><th class="coluna-valor">Valor</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
    <div id="modal-lancamento" class="modal-camada-externa" style="display:none;">
        <div class="modal-conteudo">
            <header class="modal-cabecalho">
                <h2 class="modal-titulo">Adicionar Lançamento</h2>
                <button class="modal-botao-fechar">×</button>
            </header>
            <div class="modal-corpo">
                 <div class="container-formularios">
                    <form id="form-nova-renda" class="formulario-lancamento">
                        <h3>Nova Renda</h3>
                        <input type="text" name="descricao" placeholder="Ex: Salário" required>
                         <input type="number" step="0.01" name="valor" placeholder="Valor" required>
                        <select name="tipo">
                            <option value="SALARIO">Salário</option>
                            <option value="EXTRA">Extra</option>
                        </select>
                        <button type="submit">+ Adicionar Renda</button>
                    </form>
                    <form id="form-nova-conta" class="formulario-lancamento">
                         <h3>Nova Conta</h3>
                        <input type="text" name="descricao" placeholder="Descrição" required>
                        <input type="number" step="0.01" name="valor" placeholder="Valor" required>
                         <select name="tipo" id="tipo-conta">
                            <option value="UNICA">Única</option>
                            <option value="PARCELADA">Parcelada</option>
                            <option value="FIXA">Fixa</option>
                            <option value="MORR">Morr</option>
                            <option value="MAE">Mãe</option>
                            <option value="VO">Vô</option>
                         </select>
                        <input type="text" name="parcela_info" id="parcela-info" placeholder="Ex: 1/12" style="display:none;">
                        <input type="text" name="nome_terceiro" placeholder="Nome do Terceiro (Opcional)">
                        <button type="submit">+ Adicionar Conta</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div id="modal-edicao" class="modal-camada-externa" style="display:none;">
        <div class="modal-conteudo">
            <header class="modal-cabecalho">
                <h2 id="modal-titulo-edicao">Editar Lançamento</h2>
                 <button class="modal-botao-fechar">×</button>
            </header>
            <div class="modal-corpo">
                <form id="formulario-edicao">
                    <input type="hidden" name="id" id="campo-editar-id">
                    <input type="hidden" name="tipo_item" id="campo-editar-tipo-item">
                    <div class="grupo-formulario">
                        <label for="campo-editar-descricao">Descrição:</label>
                        <input type="text" id="campo-editar-descricao" name="descricao" required>
                    </div>
                     <div class="grupo-formulario">
                        <label for="campo-editar-valor">Valor:</label>
                        <input type="number" step="0.01" id="campo-editar-valor" name="valor" required>
                    </div>
                     <div id="campos-conta-edicao">
                        <div class="grupo-formulario">
                            <label for="select-editar-tipo-conta">Tipo:</label>
                            <select id="select-editar-tipo-conta" name="tipo">
                                 <option value="UNICA">Única</option>
                                <option value="PARCELADA">Parcelada</option>
                                <option value="FIXA">Fixa</option>
                                 <option value="MORR">Morr</option>
                                <option value="MAE">Mãe</option>
                                <option value="VO">Vô</option>
                             </select>
                        </div>
                        <div class="grupo-formulario" id="grupo-editar-info-parcela" style="display:none;">
                            <label for="campo-editar-info-parcela">Info Parcela:</label>
                            <input type="text" id="campo-editar-info-parcela" name="parcela_info">
                        </div>
                        <div class="grupo-formulario">
                             <label for="campo-editar-nome-terceiro">Terceiro (opcional):</label>
                            <input type="text" id="campo-editar-nome-terceiro" name="nome_terceiro">
                        </div>
                    </div>
                     <div id="campos-renda-edicao" style="display:none;">
                        <div class="grupo-formulario">
                            <label for="select-editar-tipo-renda">Tipo:</label>
                            <select id="select-editar-tipo-renda" name="tipo_renda">
                                 <option value="SALARIO">Salário</option>
                                <option value="EXTRA">Extra</option>
                            </select>
                         </div>
                    </div>
                    <button type="submit">Salvar Alterações</button>
                </form>
            </div>
        </div>
    </div>
    <div id="modal-confirmacao" class="modal-camada-externa" style="display:none;">
         <div class="modal-conteudo modal-pequeno">
            <header class="modal-cabecalho">
                <h2 id="modal-confirmacao-titulo">Confirmar Ação</h2>
                <button class="modal-botao-fechar">×</button>
            </header>
            <div class="modal-corpo">
                <p id="modal-confirmacao-mensagem">Tem certeza?</p>
                <div class="container-botoes-confirmacao">
                    <button id="botao-cancelar-confirmacao" class="botao-secundario">Cancelar</button>
                    <button id="botao-executar-confirmacao" class="botao-perigo">Confirmar</button>
                </div>
            </div>
        </div>
     </div>

  <div id="modal-detalhes-cartao" class="modal-camada-externa" style="display:none;">
    <div class="modal-conteudo modal-grande">
      <header class="modal-cabecalho">
        <h2 id="modal-detalhes-titulo">
          Detalhes de Lançamentos – Dodo – <?= htmlspecialchars($mes_ano_atual) ?>
        </h2>
        <button class="modal-botao-fechar">×</button>
      </header>
      <div class="modal-corpo">
        <div id="modal-detalhes-lista"></div>
      </div>
      <footer class="modal-rodape">
         <div id="modal-detalhes-total" class="total-grande">
          Total: R$ 0,00
        </div>
      </footer>
    </div>
  </div>

  <script>
    const MES_ANO_ATUAL = '<?= $mes_ano_atual ?>';
    const BASE_URL = '<?= $base ?>';
  </script>
    <script src="https://unpkg.com/feather-icons"></script>
    <script src="<?= versao("$base/assets/js/script.js") ?>"></script>
</body>
</html>