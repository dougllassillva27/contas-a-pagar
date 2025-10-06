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

// ===================================================================================
// VARIÁVEIS GLOBAIS DE ESTADO
// ===================================================================================
let dadosAgrupadosCartao = {};

// ===================================================================================
// FUNÇÕES DE MODAL DE NOTIFICAÇÃO (SUBSTITUI ALERT)
// ===================================================================================

/**
 * Exibe um modal de notificação personalizado (substitui alert()).
 * @param {string} mensagem A mensagem a ser exibida.
 * @param {string} [titulo='Aviso'] O título do modal.
 */
function mostrarNotificacao(mensagem, titulo = 'Aviso') {
  const modal = document.getElementById('modal-notificacao');
  const modalTitulo = document.getElementById('modal-notificacao-titulo');
  const modalMensagem = document.getElementById('modal-notificacao-mensagem');
  const botaoOk = document.getElementById('modal-notificacao-ok');

  modalTitulo.textContent = titulo;
  modalMensagem.textContent = mensagem;

  abrirModal('modal-notificacao');

  // Remove listeners anteriores
  const novoElemento = botaoOk.cloneNode(true);
  botaoOk.parentNode.replaceChild(novoElemento, botaoOk);

  // Adiciona novo listener
  document.getElementById('modal-notificacao-ok').addEventListener('click', () => {
    fecharModal('modal-notificacao');
  });
}

/**
 * Exibe um modal de confirmação personalizado (substitui confirm()).
 * @param {string} mensagem A mensagem de confirmação.
 * @param {Function} callbackConfirmar Função executada ao confirmar.
 * @param {string} [titulo='Confirmar'] O título do modal.
 */
function mostrarConfirmacao(mensagem, callbackConfirmar, titulo = 'Confirmar') {
  abrirModalDeConfirmacao({
    titulo: titulo,
    mensagem: mensagem,
    id: null,
    tipo: 'custom',
  });

  const botaoConfirmar = document.getElementById('botao-executar-confirmacao');
  const botaoCancelar = document.getElementById('botao-cancelar-confirmacao');

  // Remove listeners anteriores
  const novoConfirmar = botaoConfirmar.cloneNode(true);
  const novoCancelar = botaoCancelar.cloneNode(true);
  botaoConfirmar.parentNode.replaceChild(novoConfirmar, botaoConfirmar);
  botaoCancelar.parentNode.replaceChild(novoCancelar, botaoCancelar);

  // Adiciona novos listeners
  document.getElementById('botao-executar-confirmacao').addEventListener('click', () => {
    fecharModal('modal-confirmacao');
    callbackConfirmar();
  });

  document.getElementById('botao-cancelar-confirmacao').addEventListener('click', () => {
    fecharModal('modal-confirmacao');
  });
}

// ===================================================================================
// FUNÇÕES DE MANIPULAÇÃO DE FORMULÁRIOS
// ===================================================================================

/**
 * Manipula a submissão dos formulários de criação de novas rendas e contas.
 * Envia os dados para a API correspondente e atualiza o painel em caso de sucesso.
 * @param {SubmitEvent} evento O evento de submissão do formulário.
 */
async function manipularSubmissaoDeNovoItem(evento) {
  evento.preventDefault();
  const formulario = evento.target;
  const url = formulario.id === 'form-nova-renda' ? `${BASE_URL}/api/rendas/criar.php` : `${BASE_URL}/api/contas/criar.php`;
  const dadosDoFormulario = new FormData(formulario);
  dadosDoFormulario.append('mes_ano_referencia', MES_ANO_ATUAL);
  try {
    const resposta = await fetch(url, {
      method: 'POST',
      body: dadosDoFormulario,
    });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      formulario.reset();
      fecharModal('modal-lancamento');
      carregarDadosDoPainel();
    } else {
      mostrarNotificacao('Erro: ' + resultado.erro, 'Erro ao Adicionar');
    }
  } catch (erro) {
    console.error('Erro ao adicionar item:', erro);
    mostrarNotificacao('Ocorreu um erro de comunicação ao tentar adicionar.', 'Erro');
  }
}

// ===================================================================================
// FUNÇÕES DE ANOTAÇÕES
// ===================================================================================

/**
 * Carrega o conteúdo da anotação do mês atual da API e a exibe na textarea.
 */
async function carregarAnotacao() {
  try {
    const resposta = await fetch(`${BASE_URL}/api/anotacoes/obter.php?mes=${MES_ANO_ATUAL}`);
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      document.getElementById('area-anotacoes').value = resultado.dados.conteudo;
    } else {
      console.error('Erro ao carregar anotação:', resultado.erro);
    }
  } catch (erro) {
    console.error('Falha de comunicação ao carregar anotação:', erro);
  }
}

/**
 * Salva o conteúdo da anotação na API.
 * @param {string} conteudo O texto a ser salvo.
 */
async function salvarAnotacao(conteudo) {
  try {
    await fetch(`${BASE_URL}/api/anotacoes/salvar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conteudo: conteudo,
        mes_ano_referencia: MES_ANO_ATUAL,
      }),
    });
  } catch (erro) {
    console.error('Falha de comunicação ao salvar anotação:', erro);
  }
}

/**
 * Versão "debounced" da função salvarAnotacao para evitar requisições excessivas à API.
 * @type {function(string): void}
 */
const salvarAnotacaoDebounced = debounce(salvarAnotacao, 750);

// ===================================================================================
// LÓGICA PRINCIPAL E MODO DARK
// ===================================================================================

// Listener global para fechar o menu de ações mobile se o clique for fora dele.
document.addEventListener('click', (evento) => {
  const dropdown = document.getElementById('dropdown-menu-acoes');
  const botaoMenu = document.getElementById('botao-menu-acoes');
  if (dropdown && !dropdown.contains(evento.target) && !botaoMenu.contains(evento.target)) {
    dropdown.classList.remove('visivel');
  }
});

// Ponto de entrada principal do script após o carregamento do DOM.
document.addEventListener('DOMContentLoaded', () => {
  vincularListenersDeEventosGlobais();
  carregarDadosDoPainel();

  // Lógica para alternância e persistência do tema (claro/escuro).
  const corpo = document.body;
  const botaoTema = document.getElementById('alternar-tema');
  const temaSalvo = localStorage.getItem('modo-tema');
  if (temaSalvo === 'dark') corpo.classList.add('modo-dark');
  botaoTema?.addEventListener('click', () => {
    corpo.classList.toggle('modo-dark');
    localStorage.setItem('modo-tema', corpo.classList.contains('modo-dark') ? 'dark' : 'light');
  });
});

// ===================================================================================
// FUNÇÕES DE SETUP E MANIPULAÇÃO DE EVENTOS
// ===================================================================================

/**
 * Centraliza a vinculação de todos os listeners de eventos da aplicação.
 * Isso organiza o código e facilita a manutenção.
 */
function vincularListenersDeEventosGlobais() {
  const adicionarListenerSeguro = (seletor, tipoDeEvento, funcaoDeCallback) => {
    const elemento = document.getElementById(seletor);
    if (elemento) {
      elemento.addEventListener(tipoDeEvento, funcaoDeCallback);
    } else {
      console.warn(`Aviso de Arquitetura: Elemento com ID '${seletor}' não foi encontrado no HTML.`);
    }
  };

  // Formulários principais
  adicionarListenerSeguro('form-nova-renda', 'submit', manipularSubmissaoDeNovoItem);
  adicionarListenerSeguro('form-nova-conta', 'submit', manipularSubmissaoDeNovoItem);
  adicionarListenerSeguro('formulario-edicao', 'submit', salvarAlteracoes);
  // Botões de ação do cabeçalho
  adicionarListenerSeguro('btn-copiar-mes', 'click', copiarContasParaProximoMes);
  adicionarListenerSeguro('btn-deletar-mes', 'click', iniciarExclusaoDeMes);
  adicionarListenerSeguro('btn-imprimir-relatorio', 'click', imprimirRelatorioCartao);
  // Abertura de modais
  adicionarListenerSeguro('botao-abrir-modal-lancamento', 'click', () => abrirModal('modal-lancamento'));
  adicionarListenerSeguro('card-total-rendas', 'click', () => abrirModal('modal-rendas'));
  // Campos de formulário com comportamento especial
  adicionarListenerSeguro('tipo-conta', 'change', alternarVisibilidadeInfoParcela);
  adicionarListenerSeguro('select-editar-tipo-conta', 'change', alternarVisibilidadeInfoParcela);
  adicionarListenerSeguro('parcela-info', 'input', formatarInputDeParcela);
  adicionarListenerSeguro('campo-editar-info-parcela', 'input', formatarInputDeParcela);
  // Modal de confirmação
  adicionarListenerSeguro('botao-cancelar-confirmacao', 'click', () => fecharModal('modal-confirmacao'));
  adicionarListenerSeguro('botao-executar-confirmacao', 'click', executarExclusao);
  // Anotações
  adicionarListenerSeguro('area-anotacoes', 'input', (evento) => {
    salvarAnotacaoDebounced(evento.target.value);
  });
  // Campo de conferência do valor do App do Cartão
  const campoValorApp = document.getElementById('valor-app-cartao');
  if (campoValorApp) {
    campoValorApp.addEventListener('input', (evento) => {
      const valorNumerico = limparFormatoMoeda(evento.target.value);
      evento.target.dataset.valorBruto = valorNumerico;
      salvarValorAppDebounced(valorNumerico);
    });
    campoValorApp.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        const valorBruto = evento.target.dataset.valorBruto || limparFormatoMoeda(evento.target.value);
        salvarValorAppNoBanco(valorBruto);
        evento.target.blur();
      }
    });
    campoValorApp.addEventListener('blur', (evento) => {
      const valorBruto = evento.target.dataset.valorBruto || limparFormatoMoeda(evento.target.value);
      if (valorBruto && !isNaN(parseFloat(valorBruto))) {
        evento.target.value = formatarParaMoeda(valorBruto);
      }
    });
    campoValorApp.addEventListener('focus', (evento) => {
      const valorBruto = evento.target.dataset.valorBruto;
      if (valorBruto) {
        evento.target.value = valorBruto;
      }
    });
  }

  // Lógica do Menu de Ações Mobile
  adicionarListenerSeguro('botao-menu-acoes', 'click', (evento) => {
    evento.stopPropagation();
    document.getElementById('dropdown-menu-acoes').classList.toggle('visivel');
  });
  adicionarListenerSeguro('link-copiar-mobile', 'click', (evento) => {
    evento.preventDefault();
    copiarContasParaProximoMes();
    document.getElementById('dropdown-menu-acoes').classList.remove('visivel');
  });
  adicionarListenerSeguro('link-deletar-mobile', 'click', (evento) => {
    evento.preventDefault();
    iniciarExclusaoDeMes();
    document.getElementById('dropdown-menu-acoes').classList.remove('visivel');
  });
  adicionarListenerSeguro('link-imprimir-mobile', 'click', (evento) => {
    evento.preventDefault();
    imprimirRelatorioCartao();
    document.getElementById('dropdown-menu-acoes').classList.remove('visivel');
  });
  adicionarListenerSeguro('link-tema-mobile', 'click', (evento) => {
    evento.preventDefault();
    const corpo = document.body;
    corpo.classList.toggle('modo-dark');
    localStorage.setItem('modo-tema', corpo.classList.contains('modo-dark') ? 'dark' : 'light');
    document.getElementById('dropdown-menu-acoes').classList.remove('visivel');
  });
  // Listeners para fechar modais
  document.querySelectorAll('.modal-botao-fechar').forEach((botao) => {
    botao.addEventListener('click', (evento) => {
      const modal = evento.target.closest('.modal-camada-externa');
      if (modal) fecharModal(modal.id);
    });
  });
  document.querySelectorAll('.modal-camada-externa').forEach((modal) => {
    // Previne scroll ao tocar no overlay em dispositivos móveis
    modal.addEventListener(
      'touchmove',
      (evento) => {
        if (evento.target.id === modal.id) {
          evento.preventDefault();
        }
      },
      { passive: false }
    );

    modal.addEventListener('click', (evento) => {
      if (evento.target.id === modal.id) {
        fecharModal(evento.target.id);
      }
    });
  });
  // Listener delegado para ações de linha (editar, excluir) e acordeões
  document.body.addEventListener('click', (evento) => {
    const gatilhoAcao = evento.target.closest('.botao-acao-linha');
    const alvoAcordeao = evento.target.closest('[data-acao]');

    if (gatilhoAcao) {
      evento.stopPropagation();
      const { acao, tipo, id } = gatilhoAcao.dataset;
      if (acao === 'editar') {
        abrirJanelaDeEdicao(tipo, id);
      } else if (acao === 'excluir') {
        abrirModalDeConfirmacao({
          titulo: `Excluir ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
          mensagem: `Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.`,
          id: id,
          tipo: tipo,
        });
      }
    } else if (alvoAcordeao) {
      const acao = alvoAcordeao.dataset.acao;
      if (acao === 'alternar-acordeao') {
        const cabecalho = alvoAcordeao.closest('.acordeao-cabecalho');
        if (cabecalho) alternarVisibilidadeAcordeao(cabecalho);
      } else if (acao === 'ver-detalhes') {
        const nome = alvoAcordeao.dataset.nomeTerceiro;
        if (nome) abrirModalDetalhesCartao(nome);
      }
    }
  });
}

// ===================================================================================
// FUNÇÕES DE PERSISTÊNCIA (BANCO DE DADOS)
// ===================================================================================

/**
 * Função de alta ordem que cria uma versão "debounced" de uma função.
 * Isso atrasa a execução da função até que um certo tempo tenha passado sem ela ser chamada.
 * Útil para inputs de texto, para não enviar uma requisição a cada tecla pressionada.
 * @param {Function} func A função a ser "debounced".
 * @param {number} [delay=500] O tempo de espera em milissegundos.
 * @returns {Function} A nova função "debounced".
 */
function debounce(func, delay = 500) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Salva o valor de conferência do App do Cartão no banco de dados.
 * @param {number|string} valor O valor a ser salvo.
 */
function salvarValorAppNoBanco(valor) {
  fetch(`${BASE_URL}/api/valores_conferencia/salvar.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      valor: valor,
      mes_ano_referencia: MES_ANO_ATUAL,
      tipo_valor: 'VALOR_APP_CARTAO',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.sucesso) {
        console.error('Erro ao salvar valor de conferência:', data.erro);
      }
    })
    .catch((error) => console.error('Falha na comunicação ao salvar valor:', error));
}

/**
 * Versão debounced da função de salvar o valor do app.
 * @type {function(string): void}
 */
const salvarValorAppDebounced = debounce(salvarValorAppNoBanco, 500);

/**
 * Carrega o valor de conferência do App do Cartão do banco e o exibe no campo correspondente.
 */
async function carregarValorAppDoBanco() {
  const campoInput = document.getElementById('valor-app-cartao');
  if (!campoInput) return;
  try {
    const response = await fetch(`${BASE_URL}/api/valores_conferencia/obter.php?mes=${MES_ANO_ATUAL}&tipo_valor=VALOR_APP_CARTAO`);
    const data = await response.json();
    if (data.sucesso && data.dados.valor) {
      const valorNumerico = limparFormatoMoeda(data.dados.valor);
      campoInput.dataset.valorBruto = valorNumerico;
      campoInput.value = formatarParaMoeda(valorNumerico);
    }
  } catch (error) {
    console.error('Falha ao buscar valor de conferência:', error);
  }
}

// ===================================================================================
// FUNÇÕES DE CONTROLE DE UI (MODAIS, ACORDEÃO, DRAG-DROP, ETC.)
// ===================================================================================

/**
 * Envia a nova ordem dos itens para a API após o usuário arrastar e soltar.
 * @param {string} tipo 'conta' ou 'renda'.
 * @param {Array<string>} ordemDosIds Um array com os IDs dos itens na nova ordem.
 */
async function enviarNovaOrdemParaAPI(tipo, ordemDosIds) {
  const tipoTabela = tipo === 'conta' ? 'contas' : 'rendas';
  try {
    const resposta = await fetch(`${BASE_URL}/api/lancamentos/reordenar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: tipoTabela,
        ordem_ids: ordemDosIds,
      }),
    });
    const resultado = await resposta.json();
    if (!resultado.sucesso) {
      mostrarNotificacao('Erro ao salvar a nova ordem: ' + resultado.erro, 'Erro');
      carregarDadosDoPainel();
    }
  } catch (erro) {
    console.error('Erro na comunicação ao reordenar:', erro);
    mostrarNotificacao('Ocorreu um erro de comunicação ao tentar salvar a nova ordem.', 'Erro');
    carregarDadosDoPainel();
  }
}

/**
 * Inicializa a funcionalidade de arrastar e soltar em um container de lista (tbody ou ul).
 * @param {HTMLElement} containerElement O elemento que contém os itens arrastáveis.
 * @param {string} tipoItem 'conta' ou 'renda', para enviar à API.
 */
function inicializarArrastarESoltar(containerElement, tipoItem) {
  if (containerElement && typeof Sortable !== 'undefined') {
    new Sortable(containerElement, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        const itens = Array.from(evt.target.children);
        const ordemDosIds = itens.map((item) => item.dataset.id);
        enviarNovaOrdemParaAPI(tipoItem, ordemDosIds);
      },
    });
  }
}

/**
 * Torna um modal visível e executa ações de limpeza se necessário.
 * @param {string} seletor O ID do modal a ser aberto.
 */
function abrirModal(seletor) {
  const modal = document.getElementById(seletor);
  if (modal) {
    if (seletor === 'modal-lancamento') {
      const formRenda = document.getElementById('form-nova-renda');
      const formConta = document.getElementById('form-nova-conta');
      const campoParcela = document.getElementById('parcela-info');

      if (formRenda) formRenda.reset();
      if (formConta) formConta.reset();
      if (campoParcela) campoParcela.style.display = 'none';
    }

    modal.style.display = 'flex';

    // IMPORTANTE: Trava o scroll da página de fundo
    document.body.classList.add('travamento-rolagem-modal');
    document.documentElement.classList.add('travamento-rolagem-modal');
  }
}

/**
 * Esconde um modal.
 * @param {string} seletor O ID do modal a ser fechado.
 */
function fecharModal(seletor) {
  const modal = document.getElementById(seletor);
  if (modal) {
    modal.style.display = 'none';

    // IMPORTANTE: Libera o scroll da página de fundo
    document.body.classList.remove('travamento-rolagem-modal');
    document.documentElement.classList.remove('travamento-rolagem-modal');
  }
}

/**
 * Alterna a visibilidade do corpo de um acordeão ao clicar em seu cabeçalho.
 * @param {HTMLElement} cabecalho O elemento do cabeçalho do acordeão que foi clicado.
 */
function alternarVisibilidadeAcordeao(cabecalho) {
  cabecalho.classList.toggle('ativo');
  const corpo = cabecalho.closest('.acordeao-item').querySelector('.acordeao-corpo');
  if (corpo) {
    corpo.classList.toggle('visivel');
  }
}

/**
 * Garante que um acordeão seja aberto, adicionando as classes necessarias.
 * @param {HTMLElement} cabecalho O elemento do cabeçalho do acordeão.
 */
function abrirAcordeao(cabecalho) {
  if (!cabecalho.classList.contains('ativo')) {
    cabecalho.classList.add('ativo');
    const corpo = cabecalho.closest('.acordeao-item').querySelector('.acordeao-corpo');
    if (corpo) {
      corpo.classList.add('visivel');
    }
  }
}

/**
 * Abre os acordeões de primeiro nível marcados por padrão em telas maiores (desktop).
 */
function ajustarLayoutDesktop() {
  const larguraDaTela = window.innerWidth;
  if (larguraDaTela > 768) {
    document.querySelectorAll('.abrir-em-desktop > .acordeao-cabecalho').forEach((cabecalho) => {
      abrirAcordeao(cabecalho);
    });
  }
}

/**
 * Formata o input de parcelas (ex: "1/12") enquanto o usuário digita.
 * @param {InputEvent} evento O evento de input.
 */
function formatarInputDeParcela(evento) {
  let valor = evento.target.value.replace(/\D/g, '');
  if (valor.length > 4) valor = valor.slice(0, 4);
  if (valor.length > 2) {
    valor = valor.slice(0, 2) + '/' + valor.slice(2);
  }
  evento.target.value = valor;
}

/**
 * Mostra ou esconde o campo de informação de parcela baseado no tipo de conta selecionado.
 * @param {Event} evento O evento (normalmente 'change') do elemento select.
 */
function alternarVisibilidadeInfoParcela(evento) {
  const seletorTipo = evento.target;
  const formularioPai = seletorTipo.closest('form');
  if (!formularioPai) return;
  const campoParcela = formularioPai.querySelector('[name="parcela_info"]');
  if (!campoParcela) return;
  const deveExibir = seletorTipo.value === 'PARCELADA';
  const elementoParaAlternar = campoParcela.closest('.grupo-formulario') || campoParcela;

  if (deveExibir) {
    elementoParaAlternar.style.display = elementoParaAlternar.classList.contains('grupo-formulario') ? 'flex' : 'block';
  } else {
    elementoParaAlternar.style.display = 'none';
  }
}

/**
 * Abre um modal grande e dinâmico para exibir os detalhes de uma categoria do cartão.
 * @param {string} nomeTerceiro O nome da categoria a ser exibida.
 */
function abrirModalDetalhesCartao(nomeTerceiro) {
  const chaveDeDados = nomeTerceiro.replace(' cartão', '');
  const dados = dadosAgrupadosCartao[chaveDeDados];
  if (!dados) return;

  const modalTitulo = document.getElementById('modal-detalhes-titulo');
  const modalLista = document.getElementById('modal-detalhes-lista');
  const modalTotal = document.getElementById('modal-detalhes-total');

  const [ano, mes] = MES_ANO_ATUAL.split('-');
  const dataTitulo = new Date(ano, mes - 1);
  const mesFormatado = dataTitulo.toLocaleString('pt-BR', { month: 'long' });
  const tituloMesAno = `${mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1)}/${ano}`;
  modalTitulo.textContent = `Lançamentos cartão de crédito - ${nomeTerceiro} - ${tituloMesAno}`;
  modalTotal.textContent = `Total: ${formatarParaMoeda(dados.total)}`;
  modalLista.innerHTML = '';

  const LIMITE_PARA_DUAS_COLUNAS = 20;
  const totalItens = dados.itens.length;

  if (totalItens > LIMITE_PARA_DUAS_COLUNAS) {
    modalLista.classList.add('layout-duas-colunas-flex');
    const metade = Math.ceil(totalItens / 2);
    const [coluna1, coluna2] = [document.createElement('div'), document.createElement('div')];
    coluna1.className = 'coluna-detalhes';
    coluna2.className = 'coluna-detalhes';
    modalLista.append(coluna1, coluna2);

    dados.itens.forEach((item, indice) => {
      const infoParcela = item.parcela_info ? ` (${escaparHtml(item.parcela_info)})` : '';
      const itemDiv = document.createElement('div');
      itemDiv.className = 'detalhe-item';
      itemDiv.innerHTML = `<span>${escaparHtml(item.descricao)}${infoParcela}</span><strong>${formatarParaMoeda(item.valor)}</strong>`;
      (indice < metade ? coluna1 : coluna2).appendChild(itemDiv);
    });
  } else {
    modalLista.classList.remove('layout-duas-colunas-flex');
    dados.itens.forEach((item) => {
      const infoParcela = item.parcela_info ? ` (${escaparHtml(item.parcela_info)})` : '';
      const itemDiv = document.createElement('div');
      itemDiv.className = 'detalhe-item';
      itemDiv.innerHTML = `<span>${escaparHtml(item.descricao)}${infoParcela}</span><strong>${formatarParaMoeda(item.valor)}</strong>`;
      modalLista.appendChild(itemDiv);
    });
  }

  abrirModal('modal-detalhes-cartao');
}

// ===================================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DADOS (API)
// ===================================================================================

/**
 * Função central que busca todos os dados de rendas e contas da API para o mês atual.
 */
async function carregarDadosDoPainel() {
  if (window.skipCarregarDados) {
    return;
  }

  try {
    const [respostaRendas, respostaContas] = await Promise.all([fetch(`${BASE_URL}/api/rendas/listar.php?mes=${MES_ANO_ATUAL}`), fetch(`${BASE_URL}/api/contas/listar.php?mes=${MES_ANO_ATUAL}`)]);

    const rendas = await respostaRendas.json();
    const todasAsContas = await respostaContas.json();

    if (!rendas.sucesso || !todasAsContas.sucesso) {
      throw new Error(`Rendas: ${rendas.erro || 'OK'} | Contas: ${todasAsContas.erro || 'OK'}`);
    }

    renderizarPainel(rendas.dados, todasAsContas.dados);
    carregarValorAppDoBanco();
    carregarAnotacao();

    // Carrega o valor das contas pendentes
    await carregarValorPendente();
  } catch (erro) {
    console.error('Erro ao carregar dados do painel:', erro);
    mostrarNotificacao('Não foi possível carregar os dados do mês.', 'Erro');
  }
}

/**
 * Renderiza o conteúdo do card especial para "Morr", "Mãe" ou "Vô".
 * @param {string} nomeCard O nome do card (ex: 'morr').
 * @param {Array} contasPessoais A lista de contas de lançamento direto para este card.
 * @param {object} dadosTerceiro O objeto contendo os gastos de cartão deste terceiro.
 */
function renderizarCardExclusivo(nomeCard, contasPessoais, dadosTerceiro) {
  const nomeCardLower = nomeCard.toLowerCase();
  const containerTabela = document.querySelector(`#tabela-contas-${nomeCardLower}`);
  const containerAcordeao = document.getElementById(`acordeao-terceiro-${nomeCardLower}-container`);
  if (!containerTabela || !containerAcordeao) return;

  preencherTabelaDeContasPessoais(containerTabela.querySelector('tbody'), contasPessoais);
  containerAcordeao.innerHTML = '';
  if (dadosTerceiro && dadosTerceiro.itens.length > 0) {
    const nomeCapitalizado = nomeCard.charAt(0).toUpperCase() + nomeCard.slice(1);
    const tituloAcordeao = `${nomeCapitalizado} cartão`;
    const dadosParaRenderizar = { [tituloAcordeao]: dadosTerceiro };
    preencherCartoesDeTerceiros(dadosParaRenderizar, containerAcordeao, false);
  }
}

/**
 * Salva as alterações de um item (renda ou conta) após a edição no modal.
 * @param {SubmitEvent} evento O evento de submissão do formulário de edição.
 */
async function salvarAlteracoes(evento) {
  evento.preventDefault();
  const formulario = evento.target;
  const tipo = document.getElementById('campo-editar-tipo-item').value;
  const url = `${BASE_URL}/api/${tipo}s/atualizar.php`;
  const dadosDoFormulario = new FormData(formulario);
  if (tipo === 'renda') {
    dadosDoFormulario.set('tipo', document.getElementById('select-editar-tipo-renda').value);
  }
  try {
    const resposta = await fetch(url, { method: 'POST', body: dadosDoFormulario });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      fecharModal('modal-edicao');
      carregarDadosDoPainel();
    } else {
      mostrarNotificacao('Erro ao salvar alterações: ' + resultado.erro, 'Erro');
    }
  } catch (erro) {
    mostrarNotificacao('Erro de comunicação ao salvar alterações.', 'Erro');
  }
}

/**
 * Abre o modal de confirmação genérico com textos customizados.
 * @param {object} config Objeto de configuração.
 */
function abrirModalDeConfirmacao({ titulo, mensagem, id, tipo }) {
  document.getElementById('modal-confirmacao-titulo').textContent = titulo;
  document.getElementById('modal-confirmacao-mensagem').textContent = mensagem;
  const botaoConfirmar = document.getElementById('botao-executar-confirmacao');
  botaoConfirmar.dataset.idParaExcluir = id || '';
  botaoConfirmar.dataset.tipoParaExcluir = tipo;
  abrirModal('modal-confirmacao');
}

/**
 * Executa a ação de exclusão ou cópia confirmada no modal.
 */
async function executarExclusao() {
  const botaoConfirmar = document.getElementById('botao-executar-confirmacao');
  const id = botaoConfirmar.dataset.idParaExcluir;
  const tipo = botaoConfirmar.dataset.tipoParaExcluir;

  if (tipo === 'mes') {
    try {
      const resposta = await fetch(`${BASE_URL}/api/deletar_mes.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mes_ano: MES_ANO_ATUAL }) });
      const resultado = await resposta.json();
      if (resultado.sucesso) {
        window.location.reload();
      } else {
        mostrarNotificacao(`Erro ao deletar o mês: ${resultado.mensagem || 'Erro desconhecido'}`, 'Erro');
        fecharModal('modal-confirmacao');
      }
    } catch (erro) {
      mostrarNotificacao('Ocorreu um erro de comunicação ao tentar deletar o mês.', 'Erro');
      fecharModal('modal-confirmacao');
    }
    return;
  }

  if (tipo === 'copiar-mes') {
    const dadosDoFormulario = new FormData();
    dadosDoFormulario.append('mes_ano_origem', MES_ANO_ATUAL);
    try {
      const resposta = await fetch(`${BASE_URL}/api/contas/copiar_mes.php`, { method: 'POST', body: dadosDoFormulario });
      const resultado = await resposta.json();
      if (resultado.sucesso) {
        fecharModal('modal-confirmacao');
        window.location.href = `?mes=${resultado.dados.proximo_mes}`;
      } else {
        mostrarNotificacao('Erro ao copiar: ' + resultado.erro, 'Erro');
        fecharModal('modal-confirmacao');
      }
    } catch (erro) {
      mostrarNotificacao('Ocorreu um erro de comunicação.', 'Erro');
      fecharModal('modal-confirmacao');
    }
    return;
  }

  if (!id || !tipo) return;
  const url = `${BASE_URL}/api/${tipo}s/excluir.php`;
  const dadosDoFormulario = new FormData();
  dadosDoFormulario.append('id', id);
  try {
    const resposta = await fetch(url, { method: 'POST', body: dadosDoFormulario });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      fecharModal('modal-confirmacao');
      carregarDadosDoPainel();
    } else {
      mostrarNotificacao('Erro ao excluir: ' + resultado.erro, 'Erro');
    }
  } catch (erro) {
    mostrarNotificacao('Ocorreu um erro de comunicação ao tentar excluir.', 'Erro');
  }
}

/**
 * Inicia o fluxo para exclusão do mês, abrindo o modal de confirmação.
 */
function iniciarExclusaoDeMes() {
  abrirModalDeConfirmacao({ titulo: 'Deletar Mês', mensagem: `Tem certeza que deseja deletar todas as rendas e contas de ${MES_ANO_ATUAL}? Esta ação não pode ser desfeita.`, id: null, tipo: 'mes' });
}

/**
 * Atualiza o status de uma conta (PAGA/PENDENTE) quando o checkbox é alterado.
 * @param {Event} evento O evento de 'change' do checkbox.
 */
async function atualizarStatusDeConta(evento) {
  const checkbox = evento.target;
  const dadosDoFormulario = new FormData();
  dadosDoFormulario.append('id', checkbox.dataset.id);
  dadosDoFormulario.append('status', checkbox.checked ? 'PAGA' : 'PENDENTE');
  try {
    const resposta = await fetch(`${BASE_URL}/api/contas/atualizar_status.php`, { method: 'POST', body: dadosDoFormulario });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      carregarDadosDoPainel();
    } else {
      mostrarNotificacao('Erro ao atualizar status: ' + resultado.erro, 'Erro');
      checkbox.checked = !checkbox.checked;
    }
  } catch (erro) {
    mostrarNotificacao('Ocorreu um erro de comunicação ao tentar atualizar.', 'Erro');
  }
}

/**
 * Inicia o fluxo para copiar os dados do mês atual para o próximo.
 */
async function copiarContasParaProximoMes() {
  abrirModalDeConfirmacao({ titulo: 'Copiar Mês', mensagem: 'Deseja realmente copiar as contas fixas, parceladas, rendas e lançamentos Morr, Mãe e Vô para o próximo mês?', id: null, tipo: 'copiar-mes' });
}

/**
 * Busca os dados de um item específico (renda ou conta) e preenche o modal de edição.
 * @param {string} tipo O tipo do item ('conta' ou 'renda').
 * @param {number} id O ID do item.
 */
async function abrirJanelaDeEdicao(tipo, id) {
  const url = `${BASE_URL}/api/${tipo}s/obter.php?id=${id}`;
  try {
    const resposta = await fetch(url);
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      const item = resultado.dados;
      document.getElementById('campo-editar-id').value = item.id;
      document.getElementById('campo-editar-tipo-item').value = tipo;
      document.getElementById('campo-editar-descricao').value = item.descricao;
      document.getElementById('campo-editar-valor').value = item.valor;

      const camposConta = document.getElementById('campos-conta-edicao');
      const camposRenda = document.getElementById('campos-renda-edicao');
      if (tipo === 'conta') {
        camposConta.style.display = 'block';
        camposRenda.style.display = 'none';
        document.getElementById('select-editar-tipo-conta').value = item.tipo;
        document.getElementById('campo-editar-info-parcela').value = item.parcela_info || '';
        document.getElementById('campo-editar-nome-terceiro').value = item.nome_terceiro || '';
        alternarVisibilidadeInfoParcela({ target: document.getElementById('select-editar-tipo-conta') });
      } else {
        camposConta.style.display = 'none';
        camposRenda.style.display = 'block';
        document.getElementById('select-editar-tipo-renda').value = item.tipo;
      }
      abrirModal('modal-edicao');
    } else {
      mostrarNotificacao('Erro ao buscar dados para edição: ' + resultado.erro, 'Erro');
    }
  } catch (erro) {
    mostrarNotificacao('Erro de comunicação.', 'Erro');
  }
}

// ===================================================================================
// FUNÇÕES DE CARREGAMENTO E RESUMO
// ===================================================================================

/**
 * Busca o valor total das contas PENDENTES (status != 'PAGA')
 * e atualiza o card 'Falta Pagar'.
 */
async function carregarValorPendente() {
  const elementoValorPendente = document.getElementById('valor-pendente');

  if (!elementoValorPendente) return;

  // Feedback visual durante o carregamento
  elementoValorPendente.textContent = '...';

  try {
    const urlBusca = `${BASE_URL}/api/total_pendente.php?mes=${MES_ANO_ATUAL}`;
    const response = await fetch(urlBusca);
    const data = await response.json();

    if (data.sucesso) {
      elementoValorPendente.textContent = formatarParaMoeda(data.dados);
    } else {
      console.error('Erro ao carregar valor pendente:', data.erro);
      elementoValorPendente.textContent = 'ERRO';
    }
  } catch (erro) {
    console.error('Falha de rede na requisição do valor pendente:', erro);
    elementoValorPendente.textContent = 'FALHA';
  }
}

// ===================================================================================
// FUNÇÕES DE RENDERIZAÇÃO NA TELA (DOM)
// ===================================================================================

/**
 * Função principal de renderização.
 * Organiza todos os dados e chama as funções auxiliares para exibir no DOM.
 * @param {Array} listaDeRendas Array com os objetos de rendas.
 * @param {Array} listaDeTodasAsContas Array com todos os objetos de contas.
 */
function renderizarPainel(listaDeRendas, listaDeTodasAsContas) {
  const tiposExclusivos = ['MORR', 'MAE', 'VO'];

  // Separa contas pessoais (sem terceiro e sem tipo exclusivo)
  const contasPessoaisPadrao = listaDeTodasAsContas.filter((c) => !c.nome_terceiro && !tiposExclusivos.includes(c.tipo));
  const contasPessoaisFixas = contasPessoaisPadrao.filter((c) => c.tipo === 'FIXA');
  const contasPessoaisVariaveis = contasPessoaisPadrao.filter((c) => c.tipo !== 'FIXA');

  // Separa contas especiais (Morr, Mãe, Vô) sem terceiro
  const contasTipoMorr = listaDeTodasAsContas.filter((c) => c.tipo === 'MORR' && !c.nome_terceiro);
  const contasTipoMae = listaDeTodasAsContas.filter((c) => c.tipo === 'MAE' && !c.nome_terceiro);
  const contasTipoVo = listaDeTodasAsContas.filter((c) => c.tipo === 'VO' && !c.nome_terceiro);

  // Calcula totais GERAL e A PAGAR para contas fixas
  const totalGeralFixas = contasPessoaisFixas.reduce((s, c) => s + parseFloat(c.valor), 0);
  const totalAPagarFixas = contasPessoaisFixas.filter((c) => c.status !== 'PAGA').reduce((s, c) => s + parseFloat(c.valor), 0);

  // Calcula totais GERAL e A PAGAR para contas variáveis
  const totalGeralVariaveis = contasPessoaisVariaveis.reduce((s, c) => s + parseFloat(c.valor), 0);
  const totalAPagarVariaveis = contasPessoaisVariaveis.filter((c) => c.status !== 'PAGA').reduce((s, c) => s + parseFloat(c.valor), 0);

  // Calcula totais GERAL e A PAGAR para Morr (lançamentos diretos)
  const totalGeralMorr = contasTipoMorr.reduce((s, c) => s + parseFloat(c.valor), 0);
  const totalAPagarMorr = contasTipoMorr.filter((c) => c.status !== 'PAGA').reduce((s, c) => s + parseFloat(c.valor), 0);

  // Calcula totais GERAL e A PAGAR para Mãe (lançamentos diretos)
  const totalGeralMae = contasTipoMae.reduce((s, c) => s + parseFloat(c.valor), 0);
  const totalAPagarMae = contasTipoMae.filter((c) => c.status !== 'PAGA').reduce((s, c) => s + parseFloat(c.valor), 0);

  // Calcula totais GERAL e A PAGAR para Vô (lançamentos diretos)
  const totalGeralVo = contasTipoVo.reduce((s, c) => s + parseFloat(c.valor), 0);
  const totalAPagarVo = contasTipoVo.filter((c) => c.status !== 'PAGA').reduce((s, c) => s + parseFloat(c.valor), 0);

  // Agrupa gastos de cartão de terceiros
  const contasDeTerceiros = listaDeTodasAsContas.filter((c) => c.nome_terceiro);
  const gastosDeTerceirosAgrupados = agruparGastosDeTerceiros(contasDeTerceiros);

  // Monta estrutura de dados para o cartão (Dodo + terceiros)
  const grupoDodo = {
    total: totalGeralVariaveis,
    totalAPagar: totalAPagarVariaveis,
    itens: contasPessoaisVariaveis,
  };
  dadosAgrupadosCartao = { Dodo: grupoDodo, ...gastosDeTerceirosAgrupados };

  // Preenche tabelas e cards
  preencherTabelaDeRendas(listaDeRendas);
  preencherTabelaDeContasPessoais(document.querySelector('#tabela-contas-fixas tbody'), contasPessoaisFixas);
  preencherTabelaDeContasPessoais(document.querySelector('#tabela-contas-variaveis tbody'), contasPessoaisVariaveis);
  preencherCartoesDeTerceiros(dadosAgrupadosCartao, document.getElementById('cards-terceiros-container'), true, true);

  // Gastos de cartão dos terceiros (Morr, Mãe, Vô)
  const gastosCartaoMorr = gastosDeTerceirosAgrupados['Morr'] || { total: 0, totalAPagar: 0, itens: [] };
  const gastosCartaoMae = gastosDeTerceirosAgrupados['Mãe'] || { total: 0, totalAPagar: 0, itens: [] };
  const gastosCartaoVo = gastosDeTerceirosAgrupados['Vô'] || { total: 0, totalAPagar: 0, itens: [] };

  renderizarCardExclusivo('morr', contasTipoMorr, gastosCartaoMorr);
  renderizarCardExclusivo('mae', contasTipoMae, gastosCartaoMae);
  renderizarCardExclusivo('vo', contasTipoVo, gastosCartaoVo);

  // Calcula totais finais
  const totalRendas = listaDeRendas.reduce((s, r) => s + parseFloat(r.valor), 0);
  const totalContasPessoais = contasPessoaisPadrao.reduce((s, c) => s + parseFloat(c.valor || 0), 0);
  const totalCartaoDeCredito = Object.values(dadosAgrupadosCartao).reduce((s, g) => s + g.total, 0);

  // Soma os totais finais (lançamentos diretos + cartão)
  const totalFinalMorr = totalGeralMorr + gastosCartaoMorr.total;
  const totalFinalAPagarMorr = totalAPagarMorr + gastosCartaoMorr.totalAPagar;

  const totalFinalMae = totalGeralMae + gastosCartaoMae.total;
  const totalFinalAPagarMae = totalAPagarMae + gastosCartaoMae.totalAPagar;

  const totalFinalVo = totalGeralVo + gastosCartaoVo.total;
  const totalFinalAPagarVo = totalAPagarVo + gastosCartaoVo.totalAPagar;

  // Atualiza resumo e títulos dos cards
  atualizarResumoGeral(totalRendas, totalContasPessoais);

  // Passa apenas os valores A PAGAR para os cards
  atualizarTitulosDosCards(totalAPagarFixas, totalAPagarVariaveis, totalCartaoDeCredito, totalFinalAPagarMorr, totalFinalAPagarMae, totalFinalAPagarVo);

  vincularListenersDeStatusDasContas();
  ajustarLayoutDesktop();

  // INICIALIZA o drag-and-drop nos containers
  document.querySelectorAll('.tabela-lancamentos tbody').forEach((tbody) => {
    inicializarArrastarESoltar(tbody, 'conta');
  });
  document.querySelectorAll('.acordeao-corpo ul').forEach((ul) => {
    inicializarArrastarESoltar(ul, 'conta');
  });
  inicializarArrastarESoltar(document.querySelector('#tabela-rendas tbody'), 'renda');

  feather.replace();

  // ⚠️ NOVO: Vincula listeners e atualiza estado dos checkboxes mestres de terceiros
  vincularListenersCheckboxesMestresTerceiros();
  atualizarTodosCheckboxesMestresTerceiros();
}

/**
 * Agrupa as contas de terceiros pelo nome do terceiro.
 * Agora também calcula totalAPagar (apenas contas pendentes).
 * @param {Array} contasDeTerceiros A lista de contas que possuem um 'nome_terceiro'.
 * @returns {object} Um objeto onde cada chave é um nome de terceiro e o valor é um objeto com {total, totalAPagar, itens}.
 */
function agruparGastosDeTerceiros(contasDeTerceiros) {
  return contasDeTerceiros.reduce((acc, conta) => {
    if (!acc[conta.nome_terceiro]) {
      acc[conta.nome_terceiro] = { total: 0, totalAPagar: 0, itens: [] };
    }

    const valorConta = parseFloat(conta.valor);
    acc[conta.nome_terceiro].total += valorConta;

    // Verifica se a conta NÃO está paga
    if (conta.status !== 'PAGA') {
      acc[conta.nome_terceiro].totalAPagar += valorConta;
    }

    acc[conta.nome_terceiro].itens.push(conta);
    return acc;
  }, {});
}

/**
 * Preenche uma tabela HTML com a lista de contas pessoais fornecida.
 * @param {HTMLElement} corpoDaTabela O elemento `<tbody>` da tabela a ser preenchida.
 * @param {Array} listaDeContas A lista de contas a serem exibidas.
 */
function preencherTabelaDeContasPessoais(corpoDaTabela, listaDeContas) {
  if (!corpoDaTabela) return;
  corpoDaTabela.innerHTML = '';
  listaDeContas.forEach((conta) => {
    const linha = corpoDaTabela.insertRow();
    linha.className = conta.status === 'PAGA' ? 'paga' : '';
    linha.dataset.id = conta.id;
    const infoParcela = conta.parcela_info ? ` (${escaparHtml(conta.parcela_info)})` : '';
    linha.innerHTML = `
        <td><input type="checkbox" class="status-conta" data-id="${conta.id}" ${conta.status === 'PAGA' ? 'checked' : ''}></td>
        <td>${escaparHtml(conta.descricao)}${infoParcela}</td>
        <td class="celula-com-acoes">
            <span>${formatarParaMoeda(conta.valor)}</span>
            <div class="acoes-linha">
                <i data-feather="move" class="drag-handle"></i>
                <button class="botao-acao-linha" title="Editar" data-acao="editar" data-tipo="conta" data-id="${conta.id}">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="botao-acao-linha" title="Excluir" data-acao="excluir" data-tipo="conta" data-id="${conta.id}">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        </td>`;
  });
}

/**
 * Preenche a tabela de rendas dentro do modal de rendas.
 * @param {Array} dadosDasRendas A lista de rendas a serem exibidas.
 */
function preencherTabelaDeRendas(dadosDasRendas) {
  const corpoDaTabela = document.querySelector('#modal-rendas #tabela-rendas tbody');
  if (!corpoDaTabela) return;
  corpoDaTabela.innerHTML = '';
  dadosDasRendas.forEach((renda) => {
    const linha = corpoDaTabela.insertRow();
    linha.dataset.id = renda.id;
    linha.innerHTML = `
        <td>${escaparHtml(renda.descricao)}</td>
        <td class="celula-com-acoes">
            <span>${formatarParaMoeda(renda.valor)}</span>
            <div class="acoes-linha">
                <i data-feather="move" class="drag-handle"></i>
                <button class="botao-acao-linha" title="Editar" data-acao="editar" data-tipo="renda" data-id="${renda.id}">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="botao-acao-linha" title="Excluir" data-acao="excluir" data-tipo="renda" data-id="${renda.id}">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        </td>`;
  });
}

/**
 * Preenche o container com os acordeões dos gastos de terceiros.
 * ⚠️ ATUALIZADO: Agora cada acordeão possui um checkbox mestre individual.
 * @param {object} gastos Objeto com os gastos de terceiros agrupados.
 * @param {HTMLElement|null} container O elemento container onde os acordeões serão inseridos.
 * @param {boolean} limparContainer Flag para limpar o container antes de inserir.
 * @param {boolean} comBotaoDetalhes Flag para renderizar o botão de ver detalhes.
 */
function preencherCartoesDeTerceiros(gastos, container = null, limparContainer = true, comBotaoDetalhes = false) {
  container = container || document.getElementById('cards-terceiros-container');
  if (!container) return;

  if (limparContainer) {
    container.innerHTML = '';
  }

  if (Object.keys(gastos).length === 0 && limparContainer) {
    container.innerHTML = '<p>Nenhum gasto de outro terceiro este mês.</p>';
    return;
  }

  for (const nome in gastos) {
    if (!gastos[nome] || gastos[nome].itens.length === 0) continue;

    const dados = gastos[nome];

    // Gera um ID único para o checkbox mestre desta pessoa
    const idCheckboxMestre = `checkbox-marcar-todas-${nome.toLowerCase().replace(/\s+/g, '-')}`;

    const htmlDosItens = dados.itens
      .map(
        (item) =>
          `<li data-id="${item.id}" class="${item.status === 'PAGA' ? 'paga' : ''}">
            <div class="conteudo-item-lista">
                <input type="checkbox" class="status-conta status-conta-terceiro" data-id="${item.id}" data-nome-terceiro="${escaparHtml(nome)}" ${item.status === 'PAGA' ? 'checked' : ''}>
                <span>${escaparHtml(item.descricao)}${item.parcela_info ? ` (${escaparHtml(item.parcela_info)})` : ''}: <strong>${formatarParaMoeda(item.valor)}</strong></span>
                <div class="acoes-linha">
                    <i data-feather="move" class="drag-handle"></i>
                    <button class="botao-acao-linha" title="Editar" data-acao="editar" data-tipo="conta" data-id="${item.id}">
                        <i data-feather="edit-2"></i>
                    </button>
                    <button class="botao-acao-linha" title="Excluir" data-acao="excluir" data-tipo="conta" data-id="${item.id}">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
          </li>`
      )
      .join('');

    const iconeHtml = comBotaoDetalhes
      ? `<button class="icone-expandir icone-detalhes" title="Ver todos os detalhes" data-acao="ver-detalhes" data-nome-terceiro="${escaparHtml(nome)}">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
         </button>`
      : '';

    const itemAcordeao = document.createElement('div');
    itemAcordeao.className = 'acordeao-item';
    itemAcordeao.innerHTML = `
      <div class="acordeao-cabecalho" data-acao="alternar-acordeao">
        <span class="icone-expandir">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>
        </span>
        ${iconeHtml}
        <span class="nome-terceiro">${escaparHtml(nome)}</span>
        <div class="cabecalho-direita">
          <label class="checkbox-marcar-terceiro" title="Marcar/Desmarcar todas as contas de ${escaparHtml(nome)}">
            <input type="checkbox" id="${idCheckboxMestre}" class="checkbox-mestre-terceiro" data-nome-terceiro="${escaparHtml(nome)}">
            <span class="label-marcar-todas">Marcar todas</span>
          </label>
          <strong class="total-terceiro">${formatarParaMoeda(dados.total)}</strong>
        </div>
      </div>
      <div class="acordeao-corpo">
        <div class="acordeao-corpo-conteudo"><ul>${htmlDosItens}</ul></div>
      </div>`;

    container.appendChild(itemAcordeao);
  }
}

/**
 * Vincula o evento 'change' a todos os checkboxes de status de conta.
 */
function vincularListenersDeStatusDasContas() {
  document.querySelectorAll('.status-conta').forEach((e) => {
    e.addEventListener('change', atualizarStatusDeConta);
  });
}

/**
 * Atualiza os valores nos cards de resumo do topo da página.
 * @param {number} totalRendas Soma de todas as rendas.
 * @param {number} totalContasPessoais Soma de todas as contas pessoais.
 */
function atualizarResumoGeral(totalRendas, totalContasPessoais) {
  const saldo = totalRendas - totalContasPessoais;
  document.getElementById('total-rendas').textContent = formatarParaMoeda(totalRendas);
  document.getElementById('total-contas').textContent = formatarParaMoeda(totalContasPessoais);
  document.getElementById('saldo-mes').textContent = formatarParaMoeda(saldo);
  document.getElementById('saldo-mes').style.color = saldo >= 0 ? 'var(--cor-sucesso)' : 'var(--cor-perigo)';
}

/**
 * Atualiza os totais nos títulos dos cards do painel.
 * Agora recebe apenas os valores A PAGAR (pendentes).
 */
function atualizarTitulosDosCards(totalContasFixas, totalContasVariaveis, totalCartaoDeCredito, totalMorr, totalMae, totalVo) {
  document.getElementById('total-contas-fixas').textContent = formatarParaMoeda(totalContasFixas);
  document.getElementById('total-contas-variaveis').textContent = formatarParaMoeda(totalContasVariaveis);
  document.getElementById('titulo-contas-terceiros').innerHTML = `Cartão de Crédito <span class="card-titulo-total">${formatarParaMoeda(totalCartaoDeCredito)}</span>`;
  document.getElementById('total-contas-morr').textContent = formatarParaMoeda(totalMorr);
  document.getElementById('total-contas-mae').textContent = formatarParaMoeda(totalMae);
  document.getElementById('total-contas-vo').textContent = formatarParaMoeda(totalVo);
}

// ===================================================================================
// FUNÇÕES DE CHECKBOX MESTRE DE TERCEIROS (INDIVIDUAL)
// ===================================================================================

/**
 * Atualiza o estado de um checkbox mestre de terceiro específico.
 * @param {string} nomeTerceiro O nome do terceiro (ex: "Dodo", "Sogra").
 */
function atualizarEstadoCheckboxMestreTerceiro(nomeTerceiro) {
  const idCheckbox = `checkbox-marcar-todas-${nomeTerceiro.toLowerCase().replace(/\s+/g, '-')}`;
  const checkboxMestre = document.getElementById(idCheckbox);

  if (!checkboxMestre) return;

  // Busca checkboxes deste terceiro específico
  const checkboxesDaTerceira = document.querySelectorAll(`.status-conta-terceiro[data-nome-terceiro="${nomeTerceiro}"]`);

  if (checkboxesDaTerceira.length === 0) {
    checkboxMestre.checked = false;
    checkboxMestre.indeterminate = false;
    checkboxMestre.disabled = true;
    return;
  }

  checkboxMestre.disabled = false;

  const todasMarcadas = Array.from(checkboxesDaTerceira).every((cb) => cb.checked);
  const algumasMarcadas = Array.from(checkboxesDaTerceira).some((cb) => cb.checked);

  if (todasMarcadas) {
    checkboxMestre.checked = true;
    checkboxMestre.indeterminate = false;
  } else if (algumasMarcadas) {
    checkboxMestre.checked = false;
    checkboxMestre.indeterminate = true;
  } else {
    checkboxMestre.checked = false;
    checkboxMestre.indeterminate = false;
  }
}

/**
 * Atualiza o estado de TODOS os checkboxes mestres de terceiros.
 */
function atualizarTodosCheckboxesMestresTerceiros() {
  const checkboxesMestres = document.querySelectorAll('.checkbox-mestre-terceiro');
  checkboxesMestres.forEach((checkbox) => {
    const nomeTerceiro = checkbox.dataset.nomeTerceiro;
    if (nomeTerceiro) {
      atualizarEstadoCheckboxMestreTerceiro(nomeTerceiro);
    }
  });
}

/**
 * Marca ou desmarca todas as contas de um terceiro específico em lote.
 * @param {Event} evento O evento de 'change' do checkbox mestre.
 */
async function marcarTodasContasDeTerceiro(evento) {
  const checkboxMestre = evento.target;
  const nomeTerceiro = checkboxMestre.dataset.nomeTerceiro;
  const novoStatus = checkboxMestre.checked ? 'PAGA' : 'PENDENTE';

  // Obtém checkboxes deste terceiro específico
  const checkboxesDaTerceira = document.querySelectorAll(`.status-conta-terceiro[data-nome-terceiro="${nomeTerceiro}"]`);

  if (checkboxesDaTerceira.length === 0) {
    mostrarNotificacao(`Não há contas de ${nomeTerceiro} para marcar.`, 'Aviso');
    checkboxMestre.checked = false;
    return;
  }

  // Extrai os IDs das contas
  const ids = Array.from(checkboxesDaTerceira).map((cb) => parseInt(cb.dataset.id));

  // Confirmação para o usuário
  const acao = checkboxMestre.checked ? 'marcar como PAGAS' : 'desmarcar (voltar para PENDENTE)';
  const mensagem = `Deseja realmente ${acao} TODAS as ${ids.length} contas de ${nomeTerceiro}?`;

  // Usa função de confirmação customizada
  mostrarConfirmacao(
    mensagem,
    async () => {
      // Feedback visual
      checkboxMestre.disabled = true;
      const labelElement = checkboxMestre.parentElement.querySelector('.label-marcar-todas');
      const labelOriginal = labelElement ? labelElement.textContent : '';
      if (labelElement) labelElement.textContent = 'Processando...';

      try {
        // Chama a API em lote
        const resposta = await fetch(`${BASE_URL}/api/contas/atualizar_status_lote.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: ids,
            status: novoStatus,
          }),
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
          // Sucesso: Recarrega o painel
          await carregarDadosDoPainel();
          console.log(`✅ ${resultado.dados.registros_atualizados} conta(s) de ${nomeTerceiro} atualizada(s)`);
        } else {
          mostrarNotificacao('Erro ao atualizar contas: ' + resultado.erro, 'Erro');
          checkboxMestre.checked = !checkboxMestre.checked;
        }
      } catch (erro) {
        console.error('Erro ao processar atualização em lote:', erro);
        mostrarNotificacao('Ocorreu um erro de comunicação. Verifique sua conexão e tente novamente.', 'Erro');
        checkboxMestre.checked = !checkboxMestre.checked;
      } finally {
        checkboxMestre.disabled = false;
        if (labelElement) labelElement.textContent = labelOriginal;
      }
    },
    'Confirmar Ação'
  );

  // Reverte o checkbox caso o usuário cancele
  checkboxMestre.checked = !checkboxMestre.checked;
}

/**
 * Vincula listeners aos checkboxes mestres de terceiros após renderização.
 */
function vincularListenersCheckboxesMestresTerceiros() {
  document.querySelectorAll('.checkbox-mestre-terceiro').forEach((checkbox) => {
    // Remove listener anterior para evitar duplicação
    checkbox.removeEventListener('change', marcarTodasContasDeTerceiro);
    // Adiciona novo listener
    checkbox.addEventListener('change', marcarTodasContasDeTerceiro);
  });
}

// ===================================================================================
// IMPRESSÃO DE RELATÓRIOS
// ===================================================================================

/**
 * Abre o relatório de cartão de crédito em PDF em uma nova guia.
 */
function imprimirRelatorioCartao() {
  const url = `${BASE_URL}/api/relatorios/imprimir_cartao.php?mes=${MES_ANO_ATUAL}`;
  window.open(url, '_blank');
}

// ===================================================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================================================

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (BRL).
 * @param {number|string} valor O valor a ser formatado.
 * @returns {string} O valor formatado como string, ex: "R$ 1.234,56".
 */
function formatarParaMoeda(valor) {
  if (isNaN(parseFloat(valor))) return 'R$ 0,00';
  return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Escapa caracteres HTML para prevenir XSS ao inserir texto no DOM.
 * @param {string} texto O texto a ser escapado.
 * @returns {string} O texto seguro para inserção no HTML.
 */
function escaparHtml(texto) {
  if (texto === null || texto === undefined) return '';
  const mapaDeCaracteres = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(texto).replace(/[&<>"']/g, (m) => mapaDeCaracteres[m]);
}

/**
 * Converte uma string formatada como moeda para um formato numérico.
 * @param {string} valorString A string a ser convertida (ex: "R$ 1.234,56").
 * @returns {string} O valor como string numérica (ex: "1234.56").
 */
function limparFormatoMoeda(valorString) {
  if (typeof valorString !== 'string') {
    return String(valorString);
  }
  let valorLimpo = valorString.replace('R$', '').trim();
  const usaVirgulaComoDecimal = valorLimpo.includes(',');
  if (usaVirgulaComoDecimal) {
    valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
  }
  return valorLimpo.replace(/[^\d.]/g, '');
}
