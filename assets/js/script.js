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
      alert('Erro: ' + resultado.erro);
    }
  } catch (erro) {
    console.error('Erro ao adicionar item:', erro);
    alert('Ocorreu um erro de comunicação ao tentar adicionar.');
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
  ajustarLayoutDesktop();

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
    modal.addEventListener('click', (evento) => {
      if (evento.target.id === modal.id) {
        fecharModal(evento.target.id);
      }
    });
  });

  // Listener delegado para ações de linha (editar, excluir, mover) e acordeões
  document.body.addEventListener('click', (evento) => {
    const gatilhoAcao = evento.target.closest('.botao-acao-linha');
    const cabecalhoAcordeao = evento.target.closest('.acordeao-cabecalho');
    if (gatilhoAcao) {
      evento.stopPropagation(); // Impede que o clique no botão acione o acordeão
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
      } else if (acao === 'mover') {
        reordenarItem(gatilhoAcao);
      }
    } else if (cabecalhoAcordeao) {
      alternarVisibilidadeAcordeao(cabecalhoAcordeao);
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
// FUNÇÕES DE CONTROLE DE UI (MODAIS, ACORDEÃO, ETC.)
// ===================================================================================

/**
 * Torna um modal visível.
 * @param {string} seletor O ID do modal a ser aberto.
 */
function abrirModal(seletor) {
  const modal = document.getElementById(seletor);
  if (modal) modal.style.display = 'flex';
}

/**
 * Esconde um modal.
 * @param {string} seletor O ID do modal a ser fechado.
 */
function fecharModal(seletor) {
  const modal = document.getElementById(seletor);
  if (modal) modal.style.display = 'none';
}

/**
 * Alterna a visibilidade do corpo de um acordeão ao clicar em seu cabeçalho.
 * @param {HTMLElement} cabecalho O elemento do cabeçalho do acordeão que foi clicado.
 */
function alternarVisibilidadeAcordeao(cabecalho) {
  cabecalho.classList.toggle('ativo');
  const corpo = cabecalho.nextElementSibling;
  corpo.classList.toggle('visivel');
}

/**
 * Abre todos os acordeões por padrão em telas maiores (desktop).
 */
function ajustarLayoutDesktop() {
  const larguraDaTela = window.innerWidth;
  if (larguraDaTela > 768) {
    const todosOsAcordeoes = document.querySelectorAll('.acordeao-cabecalho');
    todosOsAcordeoes.forEach((cabecalho) => {
      if (!cabecalho.classList.contains('ativo')) {
        alternarVisibilidadeAcordeao(cabecalho);
      }
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
  const seletor = evento.target;
  const formulario = seletor.closest('form');
  const campoInfoParcela = formulario.querySelector('[name="parcela_info"]');
  const grupoFormulario = formulario.querySelector('#grupo-editar-info-parcela');
  const deveExibir = seletor.value === 'PARCELADA';

  if (campoInfoParcela) campoInfoParcela.style.display = deveExibir ? 'block' : 'none';
  if (grupoFormulario) grupoFormulario.style.display = deveExibir ? 'block' : 'none';
}

/**
 * Garante que um acordeão específico seja reaberto após uma ação (como reordenar).
 * @param {string} nome O nome do terceiro no cabeçalho do acordeão a ser reaberto.
 */
function reabrirAcordeao(nome) {
  const todosCabecalhos = document.querySelectorAll('.acordeao-cabecalho');
  for (const cabecalho of todosCabecalhos) {
    const nomeElemento = cabecalho.querySelector('.nome-terceiro');
    if (nomeElemento && nomeElemento.textContent === nome) {
      if (!cabecalho.classList.contains('ativo')) {
        alternarVisibilidadeAcordeao(cabecalho);
      }
      break;
    }
  }
}

// ===================================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DADOS (API)
// ===================================================================================

/**
 * Função central que busca todos os dados de rendas e contas da API para o mês atual.
 */
async function carregarDadosDoPainel() {
  // Flag para evitar carregamentos múltiplos e concorrentes.
  if (window.skipCarregarDados) {
    console.log('carregarDadosDoPainel bloqueado por skipCarregarDados');
    return;
  }
  try {
    const [respostaRendas, respostaContas] = await Promise.all([fetch(`${BASE_URL}/api/rendas/listar.php?mes=${MES_ANO_ATUAL}`), fetch(`${BASE_URL}/api/contas/listar.php?mes=${MES_ANO_ATUAL}`)]);
    const rendas = await respostaRendas.json();
    const todasAsContas = await respostaContas.json();
    if (!rendas.sucesso || !todasAsContas.sucesso) {
      throw new Error(`Rendas: ${rendas.erro || 'OK'} | Contas: ${todasAsContas.erro || 'OK'}`);
    }

    // A função de processamento de regras foi removida para simplificar.
    renderizarPainel(rendas.dados, todasAsContas.dados);
    carregarValorAppDoBanco();
    carregarAnotacao();
  } catch (erro) {
    console.error('Erro ao carregar dados do painel:', erro);
    alert('Não foi possível carregar os dados do mês.');
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
      alert('Erro ao salvar alterações: ' + resultado.erro);
    }
  } catch (erro) {
    alert('Erro de comunicação ao salvar alterações.');
  }
}

/**
 * Abre o modal de confirmação genérico com textos customizados.
 * @param {object} config Objeto de configuração.
 * @param {string} config.titulo Título do modal.
 * @param {string} config.mensagem Mensagem de confirmação.
 * @param {number|null} config.id ID do item a ser afetado.
 * @param {string} config.tipo Tipo da ação a ser executada ('mes', 'copiar-mes', 'conta', 'renda').
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

  // Lógica para deletar o mês inteiro
  if (tipo === 'mes') {
    try {
      const resposta = await fetch(`${BASE_URL}/api/deletar_mes.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mes_ano: MES_ANO_ATUAL }) });
      const resultado = await resposta.json();
      if (resultado.sucesso) {
        window.location.reload();
      } else {
        alert(`Erro ao deletar o mês: ${resultado.mensagem || 'Erro desconhecido'}`);
        fecharModal('modal-confirmacao');
      }
    } catch (erro) {
      console.error('Erro de comunicação ao deletar mês:', erro);
      alert('Ocorreu um erro de comunicação ao tentar deletar o mês.');
      fecharModal('modal-confirmacao');
    }
    return;
  }

  // Lógica para copiar o mês
  if (tipo === 'copiar-mes') {
    const dadosDoFormulario = new FormData();
    dadosDoFormulario.append('mes_ano_origem', MES_ANO_ATUAL);
    try {
      const resposta = await fetch(`${BASE_URL}/api/contas/copiar_mes.php`, { method: 'POST', body: dadosDoFormulario });
      const resultado = await resposta.json();
      if (resultado.sucesso) {
        const totalItens = (resultado.dados.contas_copiadas || 0) + (resultado.dados.rendas_copiadas || 0);
        fecharModal('modal-confirmacao');
        const toast = document.createElement('div');
        toast.className = 'notificacao';
        toast.textContent = `${totalItens} itens foram copiados.`;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.remove();
          window.location.href = `?mes=${resultado.dados.proximo_mes}`;
        }, 3000);
      } else {
        alert('Erro ao copiar: ' + resultado.erro);
        fecharModal('modal-confirmacao');
      }
    } catch (erro) {
      console.error('Erro ao copiar contas e rendas:', erro);
      alert('Ocorreu um erro de comunicação.');
      fecharModal('modal-confirmacao');
    }
    return;
  }

  // Lógica para excluir um item individual
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
      alert('Erro ao excluir: ' + resultado.erro);
    }
  } catch (erro) {
    console.error('Erro na requisição de exclusão:', erro);
    alert('Ocorreu um erro de comunicação ao tentar excluir.');
  }
}

/**
 * Inicia o fluxo para exclusão do mês, abrindo o modal de confirmação.
 */
function iniciarExclusaoDeMes() {
  abrirModalDeConfirmacao({ titulo: 'Deletar Mês', mensagem: `Tem certeza que deseja deletar todas as rendas e contas de ${MES_ANO_ATUAL}? Esta ação não pode ser desfeita.`, id: null, tipo: 'mes' });
}

/**
 * Troca a ordem de dois itens adjacentes (renda ou conta) na lista.
 * @param {HTMLElement} elementoBotao O botão de mover (para cima ou para baixo) que foi clicado.
 */
async function reordenarItem(elementoBotao) {
  const direcao = elementoBotao.dataset.direcao;
  const linhaMovida = elementoBotao.closest('tr, li');
  const nomeTerceiroAcordeaoAberto = linhaMovida.closest('.acordeao-item')?.querySelector('.nome-terceiro')?.textContent || null;
  const itemAlvo = direcao === 'cima' ? linhaMovida.previousElementSibling : linhaMovida.nextElementSibling;

  if (!itemAlvo) return;

  const tipo = elementoBotao.dataset.tipo;
  const idMovido = elementoBotao.dataset.id;
  const ordemMovida = elementoBotao.dataset.ordem;
  const botaoAlvo = itemAlvo.querySelector(`.botao-acao-linha[data-acao='mover']`);

  if (!botaoAlvo) return;

  const idAlvo = botaoAlvo.dataset.id;
  const ordemAlvo = botaoAlvo.dataset.ordem;

  const url = `${BASE_URL}/api/lancamentos/reordenar.php`;
  const dadosDoFormulario = new FormData();
  dadosDoFormulario.append('tipo', tipo);
  dadosDoFormulario.append('id_movido', idMovido);
  dadosDoFormulario.append('ordem_movido', ordemMovida);
  dadosDoFormulario.append('id_alvo', idAlvo);
  dadosDoFormulario.append('ordem_alvo', ordemAlvo);

  try {
    const resposta = await fetch(url, { method: 'POST', body: dadosDoFormulario });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      await carregarDadosDoPainel();
      if (nomeTerceiroAcordeaoAberto) {
        requestAnimationFrame(() => {
          reabrirAcordeao(nomeTerceiroAcordeaoAberto);
        });
      }
    } else {
      alert('Erro ao reordenar: ' + resultado.erro);
    }
  } catch (erro) {
    console.error('Erro na requisição de reordenação:', erro);
    alert('Ocorreu um erro de comunicação ao tentar reordenar.');
  }
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
      alert('Erro ao atualizar status: ' + resultado.erro);
      checkbox.checked = !checkbox.checked;
    }
  } catch (erro) {
    console.error('Erro ao atualizar status:', erro);
    alert('Ocorreu um erro de comunicação ao tentar atualizar.');
  }
}

/**
 * Inicia o fluxo para copiar os dados do mês atual para o próximo, abrindo o modal de confirmação.
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
      alert('Erro ao buscar dados para edição: ' + resultado.erro);
    }
  } catch (erro) {
    alert('Erro de comunicação.');
  }
}

// ===================================================================================
// FUNÇÕES DE RENDERIZAÇÃO NA TELA (DOM)
// ===================================================================================

/**
 * Função principal de renderização. Organiza todos os dados e chama as funções auxiliares para exibir no DOM.
 * @param {Array} listaDeRendas Array com os objetos de rendas.
 * @param {Array} listaDeTodasAsContas Array com todos os objetos de contas.
 */
function renderizarPainel(listaDeRendas, listaDeTodasAsContas) {
  const tiposExclusivos = ['MORR', 'MAE', 'VO'];

  const contasPessoaisPadrao = listaDeTodasAsContas.filter((c) => !c.nome_terceiro && !tiposExclusivos.includes(c.tipo));
  const contasPessoaisFixas = contasPessoaisPadrao.filter((c) => c.tipo === 'FIXA');
  const contasPessoaisVariaveis = contasPessoaisPadrao.filter((c) => c.tipo !== 'FIXA');

  const contasTipoMorr = listaDeTodasAsContas.filter((c) => c.tipo === 'MORR' && !c.nome_terceiro);
  const contasTipoMae = listaDeTodasAsContas.filter((c) => c.tipo === 'MAE' && !c.nome_terceiro);
  const contasTipoVo = listaDeTodasAsContas.filter((c) => c.tipo === 'VO' && !c.nome_terceiro);

  const contasDeTerceiros = listaDeTodasAsContas.filter((c) => c.nome_terceiro);

  const gastosDeTerceirosAgrupados = agruparGastosDeTerceiros(contasDeTerceiros);
  const totalContasVariaveis = contasPessoaisVariaveis.reduce((s, c) => s + parseFloat(c.valor), 0);
  const grupoDodo = { total: totalContasVariaveis, itens: contasPessoaisVariaveis };
  const gastosParaCartaoDeCredito = { Dodo: grupoDodo, ...gastosDeTerceirosAgrupados };

  preencherTabelaDeRendas(listaDeRendas);
  preencherTabelaDeContasPessoais(document.querySelector('#tabela-contas-fixas tbody'), contasPessoaisFixas);
  preencherTabelaDeContasPessoais(document.querySelector('#tabela-contas-variaveis tbody'), contasPessoaisVariaveis);
  preencherCartoesDeTerceiros(gastosParaCartaoDeCredito);

  renderizarCardExclusivo('morr', contasTipoMorr, gastosDeTerceirosAgrupados['Morr']);
  renderizarCardExclusivo('mae', contasTipoMae, gastosDeTerceirosAgrupados['Mãe']);
  renderizarCardExclusivo('vo', contasTipoVo, gastosDeTerceirosAgrupados['Vô']);

  const totalRendas = listaDeRendas.reduce((s, r) => s + parseFloat(r.valor), 0);
  const totalContasPessoais = contasPessoaisPadrao.reduce((s, c) => s + parseFloat(c.valor || 0), 0);
  const totalContasFixas = contasPessoaisFixas.reduce((s, c) => s + parseFloat(c.valor), 0);
  const totalCartaoDeCredito = Object.values(gastosParaCartaoDeCredito).reduce((s, g) => s + g.total, 0);

  const totalFinalMorr = contasTipoMorr.reduce((s, c) => s + parseFloat(c.valor), 0) + (gastosDeTerceirosAgrupados['Morr']?.total || 0);
  const totalFinalMae = contasTipoMae.reduce((s, c) => s + parseFloat(c.valor), 0) + (gastosDeTerceirosAgrupados['Mãe']?.total || 0);
  const totalFinalVo = contasTipoVo.reduce((s, c) => s + parseFloat(c.valor), 0) + (gastosDeTerceirosAgrupados['Vô']?.total || 0);

  atualizarResumoGeral(totalRendas, totalContasPessoais);
  atualizarTitulosDosCards(totalContasFixas, totalContasVariaveis, totalCartaoDeCredito, totalFinalMorr, totalFinalMae, totalFinalVo);
  vincularListenersDeStatusDasContas();
}

/**
 * Agrupa as contas de terceiros pelo nome do terceiro e calcula o total para cada um.
 * @param {Array} contasDeTerceiros A lista de contas que possuem um 'nome_terceiro'.
 * @returns {object} Um objeto onde cada chave é um nome de terceiro e o valor é um objeto com {total, itens}.
 */
function agruparGastosDeTerceiros(contasDeTerceiros) {
  const agrupador = contasDeTerceiros.reduce((acc, conta) => {
    if (!acc[conta.nome_terceiro]) {
      acc[conta.nome_terceiro] = { total: 0, itens: [] };
    }
    acc[conta.nome_terceiro].total += parseFloat(conta.valor);
    acc[conta.nome_terceiro].itens.push(conta);
    return acc;
  }, {});
  return agrupador;
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
    const infoParcela = conta.parcela_info ? ` (${escaparHtml(conta.parcela_info)})` : '';
    linha.innerHTML = `<td><input type="checkbox" class="status-conta" data-id="${conta.id}" ${conta.status === 'PAGA' ? 'checked' : ''}></td><td>${escaparHtml(conta.descricao)}${infoParcela}</td><td class="celula-com-acoes"><span>${formatarParaMoeda(conta.valor)}</span><div class="acoes-linha"><button class="botao-acao-linha" title="Mover para Cima" data-acao="mover" data-direcao="cima" data-tipo="conta" data-id="${conta.id}" data-ordem="${
      conta.ordem
    }">🔼</button><button class="botao-acao-linha" title="Mover para Baixo" data-acao="mover" data-direcao="baixo" data-tipo="conta" data-id="${conta.id}" data-ordem="${conta.ordem}">🔽</button><button class="botao-acao-linha" title="Editar" data-acao="editar" data-tipo="conta" data-id="${conta.id}">✏️</button><button class="botao-acao-linha" title="Excluir" data-acao="excluir" data-tipo="conta" data-id="${conta.id}">🗑️</button></div></td>`;
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
    linha.innerHTML = `<td>${escaparHtml(renda.descricao)}</td><td class="celula-com-acoes"><span>${formatarParaMoeda(renda.valor)}</span><div class="acoes-linha"><button class="botao-acao-linha" title="Mover para Cima" data-acao="mover" data-direcao="cima" data-tipo="renda" data-id="${renda.id}" data-ordem="${renda.ordem}">🔼</button><button class="botao-acao-linha" title="Mover para Baixo" data-acao="mover" data-direcao="baixo" data-tipo="renda" data-id="${
      renda.ordem
    }">🔽</button><button class="botao-acao-linha" title="Editar" data-acao="editar" data-tipo="renda" data-id="${renda.id}">✏️</button><button class="botao-acao-linha" title="Excluir" data-acao="excluir" data-tipo="renda" data-id="${renda.id}">🗑️</button></div></td>`;
  });
}

/**
 * Preenche o container de "Cartão de Crédito" com os acordeões dos gastos de terceiros.
 * @param {object} gastos Objeto com os gastos de terceiros agrupados.
 * @param {HTMLElement|null} container O elemento container onde os acordeões serão inseridos.
 * @param {boolean} limparContainer Flag para limpar o container antes de inserir.
 */
function preencherCartoesDeTerceiros(gastos, container = null, limparContainer = true) {
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
    const htmlDosItens = dados.itens
      .map(
        (item) =>
          `<li data-id="${item.id}" data-ordem="${item.ordem}"><span>${escaparHtml(item.descricao)}${item.parcela_info ? ` (${escaparHtml(item.parcela_info)})` : ''}: <strong>${formatarParaMoeda(item.valor)}</strong></span><div class="acoes-linha"><button class="botao-acao-linha" title="Mover para Cima" data-acao="mover" data-direcao="cima" data-tipo="conta" data-id="${item.id}" data-ordem="${
            item.ordem
          }">🔼</button><button class="botao-acao-linha" title="Mover para Baixo" data-acao="mover" data-direcao="baixo" data-tipo="conta" data-id="${item.id}" data-ordem="${item.ordem}">🔽</button><button class="botao-acao-linha" title="Editar" data-acao="editar" data-tipo="conta" data-id="${item.id}">✏️</button><button class="botao-acao-linha" title="Excluir" data-acao="excluir" data-tipo="conta" data-id="${item.id}">🗑️</button></div></li>`
      )
      .join('');
    const itemAcordeao = document.createElement('div');
    itemAcordeao.className = 'acordeao-item';
    itemAcordeao.innerHTML = `<button class="acordeao-cabecalho"><span class="nome-terceiro">${escaparHtml(nome)}</span><strong class="total-terceiro">${formatarParaMoeda(dados.total)}</strong></button><div class="acordeao-corpo"><div class="acordeao-corpo-conteudo"><ul>${htmlDosItens}</ul></div></div>`;
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
 * @param {number} totalFixas Total das contas fixas.
 * @param {number} totalVariaveis Total das contas variáveis.
 * @param {number} totalCartaoDeCredito Total geral do cartão de crédito.
 * @param {number} totalMorr Total do card "Morr".
 * @param {number} totalMae Total do card "Mãe".
 * @param {number} totalVo Total do card "Vô".
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
