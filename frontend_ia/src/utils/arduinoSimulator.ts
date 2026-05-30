import { ArduinoGameState } from '../types';

export function getInitialSimulatorState(): ArduinoGameState {
  return {
    velha: 0,
    linha: 0,
    coluna: 0,
    HaVencedor: false,
    tabuleiro: "000000000",
    msg: "Partida Iniciada",
    erro: "",
    jogadorDaVez: 1
  };
}

export function validateMoveString(entrada: string): boolean {
  if (entrada.length !== 3) return false;
  const first = entrada[0];
  const third = entrada[2];
  if (first !== '0' && first !== '1' && first !== '2') return false;
  if (third !== '0' && third !== '1' && third !== '2') return false;
  return true;
}

export function processSimulatorMove(
  currentState: ArduinoGameState,
  moveStr: string
): { nextState: ArduinoGameState; outputJson: string } {
  // Deep copy of state
  const nextState: ArduinoGameState = { ...currentState };
  
  if (!validateMoveString(moveStr)) {
    nextState.erro = "Jogada inválida";
    nextState.msg = `Digite sua jogada jogador ${nextState.jogadorDaVez}`;
    const outputJson = JSON.stringify(nextState);
    return { nextState, outputJson };
  }

  const row = parseInt(moveStr[0]);
  const col = parseInt(moveStr[2]);
  const index = 3 * row + col;

  const currentBoard = nextState.tabuleiro.split('');
  
  if (currentBoard[index] !== '0') {
    nextState.erro = "Casa ocupada ...";
    nextState.msg = `Digite sua jogada jogador ${nextState.jogadorDaVez}`;
    nextState.linha = row;
    nextState.coluna = col;
    const outputJson = JSON.stringify(nextState);
    return { nextState, outputJson };
  }

  // Set the cell
  currentBoard[index] = String(nextState.jogadorDaVez);
  nextState.tabuleiro = currentBoard.join('');
  nextState.linha = row;
  nextState.coluna = col;
  nextState.erro = "";

  const p = String(nextState.jogadorDaVez);
  const b = currentBoard;

  // Check matching lines, columns, diagonals
  const won =
    (b[0] === p && b[3] === p && b[6] === p) ||
    (b[1] === p && b[4] === p && b[7] === p) ||
    (b[2] === p && b[5] === p && b[8] === p) ||
    (b[0] === p && b[1] === p && b[2] === p) ||
    (b[3] === p && b[4] === p && b[5] === p) ||
    (b[6] === p && b[7] === p && b[8] === p) ||
    (b[0] === p && b[4] === p && b[8] === p) ||
    (b[2] === p && b[4] === p && b[6] === p);

  if (won) {
    nextState.HaVencedor = true;
    nextState.msg = `Jogador ${nextState.jogadorDaVez} venceu!!! Reiniciar !!!`;
  } else {
    nextState.velha += 1;
    if (nextState.velha >= 9) {
      nextState.msg = "VELHA!!! Reiniciar !!!";
    } else {
      // Toggle player
      nextState.jogadorDaVez = nextState.jogadorDaVez === 1 ? 2 : 1;
      nextState.msg = `Digite sua jogada jogador ${nextState.jogadorDaVez}`;
    }
  }

  const outputJson = JSON.stringify(nextState);
  return { nextState, outputJson };
}
