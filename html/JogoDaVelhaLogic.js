// --- (A Classe JogoDaVelhaLogic permanece exatamente a mesma aqui acima) ---
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


// --- Lógica de Interação com a UI (Otimizada) ---

document.addEventListener('DOMContentLoaded', () => {
  // Referências do DOM (mantidas para clareza)
  const tabuleiroDiv = document.getElementById('tabuleiro');
  const mensagemStatusDiv = document.getElementById('mensagem-status');
  const botaoReiniciar = document.getElementById('botao-reiniciar');
  const celulas = Array.from(tabuleiroDiv.querySelectorAll('.celula')); // Converte NodeList para Array

  // Instância da lógica do jogo
  const jogo = new JogoDaVelhaLogic();

  // --- Mapeamentos para reduzir condicionais ---
  const InfoJogador = {
    [JogoDaVelhaLogic.Jogador.NENHUM]: { simbolo: '', classe: null },
    [JogoDaVelhaLogic.Jogador.UM]: { simbolo: 'X', classe: 'jogador1' },
    [JogoDaVelhaLogic.Jogador.DOIS]: { simbolo: 'O', classe: 'jogador2' },
  };

  const MensagensStatus = {
    [JogoDaVelhaLogic.StatusJogo.VITORIA_JOGADOR_UM]: "Jogador 1 (X) venceu!",
    [JogoDaVelhaLogic.StatusJogo.VITORIA_JOGADOR_DOIS]: "Jogador 2 (O) venceu!",
    [JogoDaVelhaLogic.StatusJogo.EMPATE]: "Deu Velha (Empate)!"
    // EM_ANDAMENTO é tratado separadamente devido à dinâmica do jogador da vez
  };

  // --- Funções da UI ---

  function atualizarUI() {
    const tabuleiroAtual = jogo.getTabuleiro();
    const statusJogo = jogo.getStatus();
    const jogadorVez = jogo.getJogadorDaVez();
    const jogoEmAndamento = (statusJogo === JogoDaVelhaLogic.StatusJogo.EM_ANDAMENTO);

    // Atualizar Células
    celulas.forEach((celula, index) => {
      const valor = tabuleiroAtual[index];
      const { simbolo, classe } = InfoJogador[valor]; // Usa o mapeamento

      celula.textContent = simbolo;
      celula.className = 'celula'; // Reseta classes, mantendo apenas 'celula'
      if (classe) {
        celula.classList.add(classe); // Adiciona classe do jogador, se houver
      }
      // Habilita/Desabilita clique
      celula.style.pointerEvents = (valor === JogoDaVelhaLogic.Jogador.NENHUM && jogoEmAndamento) ? 'auto' : 'none';
    });
    // Mensagem de qdo o jogo está em andamento ou finalizado
    mensagemStatusDiv.textContent = jogoEmAndamento ? 
      `Vez do Jogador ${jogadorVez} (${InfoJogador[jogadorVez].simbolo})` : 
      MensagensStatus[statusJogo] || "Jogo Terminado";
  }

  function handleCelulaClick(event) {
    // Garante que o clique foi numa célula válida e pega os dados
    const celulaClicada = event.target.closest('.celula'); // Mais robusto que event.target
    if (!celulaClicada || !celulaClicada.dataset.linha) return;

    const linha = parseInt(celulaClicada.dataset.linha);
    const coluna = parseInt(celulaClicada.dataset.coluna);

    // Tenta fazer a jogada e atualiza a UI apenas se for bem-sucedida
    if (jogo.fazerJogada(linha, coluna) === JogoDaVelhaLogic.StatusJogada.SUCESSO) {
      atualizarUI();
    }
    // Não precisa de feedback para outros casos aqui, a UI já impede cliques inválidos
  }

  function handleReiniciarClick() {
    jogo.reset();
    atualizarUI();
  }

  // --- Configuração Inicial ---
  tabuleiroDiv.addEventListener('click', handleCelulaClick);
  botaoReiniciar.addEventListener('click', handleReiniciarClick);
  atualizarUI(); // Estado inicial
});