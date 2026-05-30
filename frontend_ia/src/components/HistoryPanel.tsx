import React from 'react';
import { History, Award, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { MatchHistoryEntry } from '../types';

interface HistoryPanelProps {
  history: MatchHistoryEntry[];
  onClearHistory: () => void;
}

export default function HistoryPanel({ history, onClearHistory }: HistoryPanelProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-500" />
          <h2 className="font-mono text-xs tracking-wider text-zinc-350 font-bold">// HISTORICO_REGISTROS</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[10px] uppercase font-mono text-amber-500 hover:text-amber-400 font-bold px-2 py-0.5 rounded hover:bg-amber-550/10 transition-all cursor-pointer"
          >
            Limpar_Histórico
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="p-4 overflow-y-auto flex-1 max-h-[300px] space-y-2 bg-zinc-950">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-8 h-8 text-zinc-800 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-zinc-650 font-mono">// Nenhuma partida registrada para esta sessão serial.</p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="border border-zinc-900 bg-zinc-900/40 p-3 rounded flex items-center justify-between hover:border-zinc-800 transition-all select-none font-mono text-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {entry.winner === 'Draw' ? (
                    <span className="bg-zinc-800 text-zinc-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                      VELHA (TIE)
                    </span>
                  ) : (
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      entry.winner.includes('1') || entry.winner.includes('X')
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                    }`}>
                      Vitória {entry.winner.includes('1') || entry.winner.includes('X') ? 'X' : 'O'}
                    </span>
                  )}

                  <span className="text-[10px] text-zinc-550 font-mono truncate">
                    [{entry.timestamp}]
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-zinc-600" />
                    {entry.mode}
                  </span>
                  <span className="text-zinc-800 font-normal">|</span>
                  <span>
                    {entry.moves} transações
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center p-1.5 rounded bg-zinc-900 border border-zinc-850">
                {entry.winner === 'Draw' ? (
                  <ShieldAlert className="w-4 h-4 text-zinc-600" />
                ) : (
                  <Award className={`w-4 h-4 ${
                    entry.winner.includes('1') || entry.winner.includes('X') ? 'text-emerald-500' : 'text-amber-500'
                  }`} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
