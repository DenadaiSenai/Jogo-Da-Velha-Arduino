class JogoDaVelha {
  // O construtor inicializa o estado do jogo
  constructor() {
    // 0: Posição vazia
    // 1: jogada na Posição do jogador 1
    // 2: jogada na Posição do jogador 2
    this.tabuleiro = Array(9).fill(0); // Maneira mais concisa de inicializar com zeros
    this.jogadorDaVez = 1; // Jogador 1 começa
    this.haVencedor = false;
    this.jogadasFeitas = 0; // Contador de jogadas para verificar empate (velha)
    this.jogador1 = "Jogador 1";
    this.jogador2 = "Jogador 2";
    this.gameOver = false; // Flag para indicar se o jogo terminou
  }

  // Método para exibir o tabuleiro no console
  exibirTabuleiro() {
    console.log("\n--- Tabuleiro Atual ---");
    // Mapeia os números para símbolos para melhor visualização
    const MapeamentoSimbolos = { 0: " ", 1: "X", 2: "O" };
    let boardString = "";
    for (let i = 0; i < 9; i++) {
        boardString += ` ${MapeamentoSimbolos[this.tabuleiro[i]] || ' '} `;
        if ((i + 1) % 3 === 0) {
            console.log(boardString);
            if (i < 8) console.log("-----------"); // Linha separadora
            boardString = "";
        } else {
            boardString += "|"; // Separador de coluna
        }
    }
    console.log("---------------------\n");
  }

  // Método para validar o formato da entrada (ex: "0,0", "1,2")
  validaFormatoPosicao(entrada) {
    if (typeof entrada !== 'string' || entrada.length !== 3) {
      return false;
    }
    const linha = entrada.charAt(0);
    const separador = entrada.charAt(1); // Espera-se uma vírgula ou espaço, por exemplo
    const coluna = entrada.charAt(2);

    // Verifica se linha e coluna são '0', '1' ou '2'
    const posicoesValidas = ['0', '1', '2'];
    if (!posicoesValidas.includes(linha) || !posicoesValidas.includes(coluna)) {
      return false;
    }

    // Poderia adicionar verificação do separador se quisesse ser mais estrito
    // if (separador !== ',' && separador !== ' ') return false;

    return true;
  }

  // Método para verificar se a posição escolhida está vazia
  validaPosicaoLivre(linha, coluna) {
     const index = 3 * linha + coluna;
     return this.tabuleiro[index] === 0;
  }

  // Método para processar uma jogada
  fazerJogada(jogadaStr) {
    if (!this.validaFormatoPosicao(jogadaStr)) {
      console.log("Formato de jogada inválido! Use linha,coluna (ex: '1,2').");
      return false; // Indica que a jogada falhou
    }

    const linha = parseInt(jogadaStr.charAt(0));
    const coluna = parseInt(jogadaStr.charAt(2));
    const index = 3 * linha + coluna; // Calcula o índice no array do tabuleiro

     console.log(`Tentando jogar na Linha: ${linha}, Coluna: ${coluna} (Índice: ${index})`);

    if (!this.validaPosicaoLivre(linha, coluna)) {
       console.log("Posição ocupada, jogue novamente!");
       return false; // Indica que a jogada falhou
    }

    // Registra a jogada
    this.tabuleiro[index] = this.jogadorDaVez;
    this.jogadasFeitas++;

    // Verifica se houve vencedor após a jogada
    if (this.verificarVencedor()) {
      this.haVencedor = true;
      this.gameOver = true;
      return true; // Jogada bem-sucedida, jogo terminou com vitória
    }

    // Verifica se deu velha (empate)
    if (this.jogadasFeitas === 9) {
        this.gameOver = true;
        return true; // Jogada bem-sucedida, jogo terminou com empate
    }

    // Se não houve vencedor nem empate, troca o jogador
    this.trocarJogador();
    return true; // Jogada bem-sucedida, jogo continua
  }

  // Método para verificar todas as condições de vitória
  verificarVencedor() {
    const j = this.jogadorDaVez;
    const t = this.tabuleiro;

    // Checar linhas
    for (let i = 0; i < 3; i++) {
      if (t[3 * i] === j && t[3 * i + 1] === j && t[3 * i + 2] === j) return true;
    }

    // Checar colunas
    for (let i = 0; i < 3; i++) {
      if (t[i] === j && t[i + 3] === j && t[i + 6] === j) return true;
    }

    // Checar diagonais
    if (t[0] === j && t[4] === j && t[8] === j) return true;
    if (t[2] === j && t[4] === j && t[6] === j) return true;

    return false; // Ninguém venceu ainda
  }

  // Método para trocar o jogador da vez
  trocarJogador() {
    this.jogadorDaVez = this.jogadorDaVez === 1 ? 2 : 1;
  }

  // Método para exibir o resultado final do jogo
  exibirResultado() {
    this.exibirTabuleiro(); // Mostra o tabuleiro final
    if (this.haVencedor) {
      const nomeVencedor = this.jogadorDaVez === 1 ? this.jogador1 : this.jogador2;
      console.log(`Parabéns pela vitória, ${nomeVencedor} (Jogador ${this.jogadorDaVez})!`);
    } else if (this.jogadasFeitas === 9) {
      console.log("Deu VELHA!!! O jogo empatou.");
    } else {
        // Isso não deveria acontecer se o loop principal estiver correto
        console.log("O jogo terminou de forma inesperada.");
    }
  }

  // Método principal que controla o fluxo do jogo
  iniciarJogo() {
    console.log("--- Bem-vindo ao Jogo da Velha ---");

    while (!this.gameOver) {
      this.exibirTabuleiro();
      const nomeJogadorAtual = this.jogadorDaVez === 1 ? this.jogador1 : this.jogador2;
      let jogadaOk = false;

      // Continua pedindo a jogada até que seja válida
      while(!jogadaOk) {
        const jogadaInput = window.prompt(`(${nomeJogadorAtual} - ${this.jogadorDaVez === 1 ? 'X' : 'O'}) Digite a posição (linha,coluna - ex: 0,0 ou 1,2):`);
        if (jogadaInput === null) { // Usuário cancelou o prompt
             console.log("Jogo cancelado pelo usuário.");
             this.gameOver = true; // Força o fim do jogo
             return; // Sai do método iniciarJogo
        }
        jogadaOk = this.fazerJogada(jogadaInput);
      }
    }

    // Exibe o resultado final quando o loop termina
    this.exibirResultado();
  }
}

// --- Como usar a classe ---

// 1. Crie uma instância do jogo
const meuJogo = new JogoDaVelha();

// 2. Inicie o jogo (isso vai começar o loop e pedir as jogadas)
meuJogo.iniciarJogo();