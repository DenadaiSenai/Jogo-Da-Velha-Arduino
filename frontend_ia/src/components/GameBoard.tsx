import React from 'react';
import { RefreshCw, Play, AlertCircle, Sparkles } from 'lucide-react';

interface GameBoardProps {
  boardString: string; // Length 9 like "010200010"
  onCellClick: (row: number, col: number) => void;
  jogadorDaVez: number;
  haVencedor: boolean;
  velha: number;
  msg: string;
  erro: string;
  onRestart: () => void;
  isSimulator: boolean;
  isConnected: boolean;
}

export default function GameBoard({
  boardString,
  onCellClick,
  jogadorDaVez,
  haVencedor,
  velha,
  msg,
  erro,
  onRestart,
  isSimulator,
  isConnected
}: GameBoardProps) {
  
  // Parse state
  const cells = boardString.split(''); // Array of "0", "1", "2"
  const isDraw = viejaDetectada(cells, haVencedor, velha);
  const isGameOver = haVencedor || isDraw || msg.includes("venceu") || msg.includes("VELHA");

  function viejaDetectada(cellsArr: string[], hasWin: boolean, velhaCount: number) {
    if (hasWin) return false;
    if (velhaCount >= 9) return true;
    if (!cellsArr.includes('0')) return true;
    return false;
  }

  const getCellCoords = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return [row, col];
  };

  const currentStatusNode = () => {
    if (haVencedor) {
      return (
        <div className="inline-flex items-center px-4 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-md gap-2 font-mono text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{msg || 'VITÓRIA DETECTADA!'}</span>
        </div>
      );
    }
    if (isDraw) {
      return (
        <div className="inline-flex items-center px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md gap-2 font-mono text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-zinc-650"></span>
          <span>{msg || 'EMPATE (VELHA)'}</span>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center px-4 py-1.5 border rounded-md gap-2 font-mono text-xs font-semibold transition-all ${
        jogadorDaVez === 1 
          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-amber-950/30 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
      }`}>
        <span className={`w-2 h-2 rounded-full animate-pulse ${jogadorDaVez === 1 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
        <span>{msg || `Aguardando jogador ${jogadorDaVez}...`}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full text-zinc-300">
      {/* Dynamic Header Turn/Status Indicator */}
      <div className="mb-6 text-center select-none">
        <h1 className="text-xl font-bold tracking-widest text-zinc-400 mb-2 uppercase select-none font-mono">
          // MAIN_PROCESS_MONITOR
        </h1>
        {currentStatusNode()}
      </div>

      {/* Grid Container */}
      <div className="relative p-6 bg-zinc-950/70 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[420px] aspect-square flex flex-col justify-between">
        {/* Subtle background overlay grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-digital-grid rounded-xl"></div>
        
        {/* Device Lock overlay if not ready */}
        {!isSimulator && !isConnected && (
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-[1px] rounded-xl z-20 flex flex-col items-center justify-center p-6 text-center select-none border border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-amber-950/30 text-amber-500 flex items-center justify-center border border-amber-500/30 mb-3 animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="font-mono text-xs text-amber-400 font-bold uppercase tracking-widest mb-2">MÓDULO SERIAL OFFLINE</p>
            <p className="text-zinc-500 text-xs font-sans leading-relaxed max-w-[280px]">
              Altere para o <span className="text-emerald-400 font-medium hover:underline cursor-pointer font-mono" onClick={() => {}}>Modo Simulador</span> ou conecte o dispositivo via Web Serial.
            </p>
          </div>
        )}

        {/* 3x3 grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full flex-1 relative z-10">
          {cells.map((cell, index) => {
            const [row, col] = getCellCoords(index);
            const isOccupied = cell !== '0';
            
            return (
              <button
                id={`cell-${row}-${col}`}
                key={index}
                disabled={isGameOver || (!isSimulator && !isConnected)}
                onClick={() => onCellClick(row, col)}
                className={`group relative aspect-square transition-all cursor-pointer select-none outline-none rounded-lg border-2 ${
                  isGameOver 
                    ? 'opacity-80' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  cell === '1' 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                    : cell === '2' 
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-zinc-900 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                {/* Cell content symbol */}
                {cell === '1' && (
                  <span className="text-emerald-500 font-black text-4xl font-mono select-none">
                    X
                  </span>
                )}
                {cell === '2' && (
                  <span className="text-amber-500 font-black text-4xl font-mono select-none">
                    O
                  </span>
                )}
                {cell === '0' && (
                  <span className="text-[10px] text-zinc-700/80 group-hover:text-zinc-550 transition-all font-mono select-none">
                    [{row},{col}]
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message banner */}
      <div className="h-6 mt-4 flex items-center justify-center">
        {erro && (
          <p className="text-xs text-amber-500 font-mono flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-550"></span>
            {erro}
          </p>
        )}
      </div>

      {/* Deploy / Reset Solution Panel */}
      <div className="mt-2 flex flex-col gap-2 w-full max-w-[420px] items-center">
        {isGameOver ? (
          <button
            onClick={onRestart}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all text-xs tracking-widest font-mono uppercase"
          >
            <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            REINICIAR TABULEIRO
          </button>
        ) : (
          <button
            onClick={onRestart}
            className="text-zinc-500 hover:text-amber-400 flex items-center justify-center gap-1 text-[11px] font-mono mt-1 transition-colors select-none"
            title="Reset Game State"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            FORÇAR REINÍCIO DO HARDWARE
          </button>
        )}
      </div>
    </div>
  );
}
