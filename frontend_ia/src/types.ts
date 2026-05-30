export interface ArduinoGameState {
  velha: number;
  linha: number;
  coluna: number;
  HaVencedor: boolean;
  tabuleiro: string; // "000000000"
  msg: string;
  erro: string;
  jogadorDaVez: number; // 1 or 2
}

export interface MatchHistoryEntry {
  id: string;
  timestamp: string;
  winner: string | 'Draw' | 'None';
  moves: number;
  mode: 'Physical Arduino' | 'Simulator';
}

export interface SerialLogEntry {
  timestamp: string;
  direction: 'IN' | 'OUT' | 'SYS' | 'ERR';
  text: string;
}
