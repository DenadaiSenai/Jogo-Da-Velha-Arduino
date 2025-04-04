/**
 * Classe que gerencia a lógica do Jogo da Velha.
 * É independente da interface do usuário (UI).
 */
class JogoDaVelhaLogic {
  // Constantes para clareza
  static Jogador = {
    NENHUM: 0,
    UM: 1,
    DOIS: 2,
  };

  static StatusJogo = {
    EM_ANDAMENTO: 'EM_ANDAMENTO',
    VITORIA_JOGADOR_UM: 'VITORIA_JOGADOR_UM',
    VITORIA_JOGADOR_DOIS: 'VITORIA_JOGADOR_DOIS',
    EMPATE: 'EMPATE', // Velha
  };

  static StatusJogada = {
    SUCESSO: 'SUCESSO',
    POSICAO_INVALIDA: 'POSICAO_INVALIDA',
    POSICAO_OCUPADA: 'POSICAO_OCUPADA',
    JOGO_TERMINADO: 'JOGO_TERMINADO',
  };

  constructor() {
    this.reset();
  }

  reset() {
    this.tabuleiro = Array(9).fill(JogoDaVelhaLogic.Jogador.NENHUM);
    this.jogadorDaVez = JogoDaVelhaLogic.Jogador.UM;
    this.jogadasFeitas = 0;
    this.status = JogoDaVelhaLogic.StatusJogo.EM_ANDAMENTO;
    this.vencedor = JogoDaVelhaLogic.Jogador.NENHUM;
    // console.log("Jogo (Lógica) Reiniciado."); // Log interno, pode remover
  }

  getTabuleiro() {
    return [...this.tabuleiro];
  }

  getJogadorDaVez() {
    return this.jogadorDaVez;
  }

  getStatus() {
    return this.status;
  }

  getVencedor() {
    return this.vencedor;
  }

  isPosicaoValida(linha, coluna) {
    return (
        linha >= 0 && linha <= 2 &&
        coluna >= 0 && coluna <= 2
    );
  }

  fazerJogada(linha, coluna) {
    if (this.status !== JogoDaVelhaLogic.StatusJogo.EM_ANDAMENTO) {
      return JogoDaVelhaLogic.StatusJogada.JOGO_TERMINADO;
    }
    if (!this.isPosicaoValida(linha, coluna)) {
      return JogoDaVelhaLogic.StatusJogada.POSICAO_INVALIDA;
    }
    const index = 3 * linha + coluna;
    if (this.tabuleiro[index] !== JogoDaVelhaLogic.Jogador.NENHUM) {
      return JogoDaVelhaLogic.StatusJogada.POSICAO_OCUPADA;
    }

    this.tabuleiro[index] = this.jogadorDaVez;
    this.jogadasFeitas++;

    if (this._verificarVitoria(this.jogadorDaVez)) {
      this.status = (this.jogadorDaVez === JogoDaVelhaLogic.Jogador.UM)
        ? JogoDaVelhaLogic.StatusJogo.VITORIA_JOGADOR_UM
        : JogoDaVelhaLogic.StatusJogo.VITORIA_JOGADOR_DOIS;
      this.vencedor = this.jogadorDaVez;
    } else if (this.jogadasFeitas === 9) {
      this.status = JogoDaVelhaLogic.StatusJogo.EMPATE;
    } else {
      this._trocarJogador();
    }

    return JogoDaVelhaLogic.StatusJogada.SUCESSO;
  }

  _verificarVitoria(jogador) {
    const t = this.tabuleiro;
    const j = jogador;
    // Linhas
    for (let i = 0; i < 3; i++) {
      if (t[3 * i] === j && t[3 * i + 1] === j && t[3 * i + 2] === j) return true;
    }
    // Colunas
    for (let i = 0; i < 3; i++) {
      if (t[i] === j && t[i + 3] === j && t[i + 6] === j) return true;
    }
    // Diagonais
    if (t[0] === j && t[4] === j && t[8] === j) return true;
    if (t[2] === j && t[4] === j && t[6] === j) return true;
    return false;
  }

  _trocarJogador() {
    this.jogadorDaVez = (this.jogadorDaVez === JogoDaVelhaLogic.Jogador.UM)
      ? JogoDaVelhaLogic.Jogador.DOIS
      : JogoDaVelhaLogic.Jogador.UM;
  }
}


// --- Lógica de Interação com a UI ---

document.addEventListener('DOMContentLoaded', () => {
    // Pega as referências dos elementos do DOM
    const tabuleiroDiv = document.getElementById('tabuleiro');
    const mensagemStatusDiv = document.getElementById('mensagem-status');
    const mensagemAvisoDiv = document.getElementById('mensagem-aviso');
    const botaoReiniciar = document.getElementById('botao-reiniciar');
    // Pega todas as células (NodeList)
    const celulas = tabuleiroDiv.querySelectorAll('.celula');

    // Cria a instância da lógica do jogo
    const jogo = new JogoDaVelhaLogic();

    // Função para atualizar a interface (HTML) com base no estado do jogo
    function atualizarUI() {
        const tabuleiroAtual = jogo.getTabuleiro();
        const jogadorVez = jogo.getJogadorDaVez();
        const statusJogo = jogo.getStatus();

        // Atualizar as células do tabuleiro no HTML
        celulas.forEach((celula, index) => {
            const valor = tabuleiroAtual[index];
            let simbolo = '';
            // Define o símbolo e a classe CSS
            celula.classList.remove('jogador1', 'jogador2'); // Limpa classes antigas
            if (valor === JogoDaVelhaLogic.Jogador.UM) {
                simbolo = 'X';
                celula.classList.add('jogador1');
            } else if (valor === JogoDaVelhaLogic.Jogador.DOIS) {
                simbolo = 'O';
                celula.classList.add('jogador2');
            }
            celula.textContent = simbolo;

            // Habilita/Desabilita clique na célula
            // Célula clicável se estiver vazia E o jogo estiver em andamento
            const clicavel = (valor === JogoDaVelhaLogic.Jogador.NENHUM && statusJogo === JogoDaVelhaLogic.StatusJogo.EM_ANDAMENTO);
            celula.style.pointerEvents = clicavel ? 'auto' : 'none';
        });

        // Atualizar mensagem de status/jogador da vez
        switch (statusJogo) {
            case JogoDaVelhaLogic.StatusJogo.EM_ANDAMENTO:
                mensagemStatusDiv.textContent = `Vez do Jogador ${jogadorVez} (${jogadorVez === 1 ? 'X' : 'O'})`;
                break;
            case JogoDaVelhaLogic.StatusJogo.VITORIA_JOGADOR_UM:
                mensagemStatusDiv.textContent = "Jogador 1 (X) venceu!";
                break;
            case JogoDaVelhaLogic.StatusJogo.VITORIA_JOGADOR_DOIS:
                mensagemStatusDiv.textContent = "Jogador 2 (O) venceu!";
                break;
            case JogoDaVelhaLogic.StatusJogo.EMPATE:
                mensagemStatusDiv.textContent = "Deu Velha (Empate)!";
                break;
        }
    }

    // Função para lidar com o clique em uma célula
    function handleCelulaClick(event) {
        // Pega o elemento que foi clicado
        const celulaClicada = event.target;

        // Verifica se o clique foi realmente em uma célula (não no gap entre elas)
        if (!celulaClicada.classList.contains('celula')) {
            return;
        }

        // Obtém linha e coluna do data attribute
        const linha = parseInt(celulaClicada.dataset.linha);
        const coluna = parseInt(celulaClicada.dataset.coluna);

        // Tenta fazer a jogada na lógica do jogo
        const resultadoJogada = jogo.fazerJogada(linha, coluna);

        // Se a jogada foi um sucesso (registrada na lógica), atualiza a UI
        if (resultadoJogada === JogoDaVelhaLogic.StatusJogada.SUCESSO) {
            atualizarUI();            
        } else if (resultadoJogada === JogoDaVelhaLogic.StatusJogada.POSICAO_OCUPADA) {
            console.warn("Tentativa de jogar em posição ocupada.");
            // mensagemAvisoDiv.textContent = "Tentativa de jogar em posição ocupada";
            // Poderia adicionar um feedback visual rápido aqui, se desejado
        }
        // Outros status (INVALIDA, JOGO_TERMINADO) são prevenidos pela lógica da UI
        // que desabilita o clique, mas poderiam ser logados para debug se necessário.
    }

    // Função para o botão de reiniciar
    function handleReiniciarClick() {
        jogo.reset(); // Reseta a lógica do jogo
        atualizarUI(); // Atualiza a interface para o estado inicial
    }

    // Adicionar Event Listeners
    // Event listener no container do tabuleiro (event delegation)
    tabuleiroDiv.addEventListener('click', handleCelulaClick);

    // Event listener no botão de reiniciar
    botaoReiniciar.addEventListener('click', handleReiniciarClick);

    // Atualizar a UI inicial ao carregar a página
    atualizarUI();
});