import React, { useRef, useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Radio, RefreshCw, Trash2, Cpu, FileDown, Copy } from 'lucide-react';
import { SerialLogEntry } from '../types';

interface SerialMonitorProps {
  logs: SerialLogEntry[];
  isSimulator: boolean;
  onToggleSimulator: (val: boolean) => void;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendManualText: (text: string) => void;
  onClearLogs: () => void;
  portName: string | null;
}

export default function SerialMonitor({
  logs,
  isSimulator,
  onToggleSimulator,
  isConnected,
  onConnect,
  onDisconnect,
  onSendManualText,
  onClearLogs,
  portName
}: SerialMonitorProps) {
  const [manualInput, setManualInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onSendManualText(manualInput);
    setManualInput('');
  };

  const getLogColor = (direction: string) => {
    switch (direction) {
      case 'IN': return 'text-emerald-400 font-mono';
      case 'OUT': return 'text-cyan-400 font-mono';
      case 'ERR': return 'text-rose-400 font-mono font-medium';
      default: return 'text-zinc-400 font-mono italic';
    }
  };

  return (
    <div id="serial-monitor-panel" className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[380px]">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-500 animate-pulse" />
          <h2 className="font-mono text-xs tracking-wider text-zinc-300 font-bold">// SERIAL_PORT_CONTROLLER</h2>
        </div>
        
        {/* Simulator vs Real Arduino Toggle */}
        <div className="flex items-center gap-2 select-none">
          <span className="font-mono text-[10px] text-zinc-500">SIM</span>
          <button
            onClick={() => onToggleSimulator(!isSimulator)}
            className="text-zinc-350 hover:text-white transition-all transform active:scale-95"
            title={isSimulator ? "Switch to real USB Serial API" : "Switch to Simulator Mode"}
          >
            {isSimulator ? (
              <ToggleLeft className="w-10 h-6 text-zinc-700 hover:text-zinc-650 cursor-pointer" />
            ) : (
              <ToggleRight className="w-10 h-6 text-emerald-500 cursor-pointer" />
            )}
          </button>
          <span className="font-mono text-[10px] text-zinc-400">HARDWARE</span>
        </div>
      </div>

      {/* Control Box */}
      <div className="bg-zinc-900/50 p-4 border-b border-zinc-850 flex flex-col gap-3">
        {isSimulator ? (
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-850 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <p className="font-mono text-[11px] text-zinc-200 font-bold">Simulador de Arduino Ativo</p>
                <p className="font-mono text-[9px] text-zinc-500">JogoDaVelha.ino compilado em Sandbox JS</p>
              </div>
            </div>
            <div className="bg-emerald-950/40 text-emerald-400 px-2.5 py-1 rounded text-[9px] font-mono border border-emerald-800/40 font-bold uppercase">
              EMULAÇÃO
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">Status da Porta:</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                <span className="font-mono text-xs font-bold text-zinc-300">
                  {isConnected ? 'CONECTADO USB' : 'DESCONECTADO'}
                </span>
              </div>
            </div>

            {portName && (
              <div className="text-[10px] font-mono text-zinc-500 bg-zinc-950 p-2 rounded border border-zinc-850">
                Porta: <span className="text-emerald-400 font-bold">{portName}</span> @ 115200 bps
              </div>
            )}

            <div className="flex gap-2 mt-1">
              {!isConnected ? (
                <button
                  onClick={onConnect}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Conectar Arduino
                </button>
              ) : (
                <button
                  onClick={onDisconnect}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 py-2 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                >
                  Desconectar USB
                </button>
              )}
            </div>

            {/* Incompatibility Notice Helper */}
            {!('serial' in navigator) && !isSimulator && (
              <p className="text-[10px] text-amber-500/80 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded font-mono leading-relaxed mt-1">
                ⚠️ WEB_SERIAL_UNAVAILABLE: Use Chrome/Edge/Opera para se conectar diretamente ou alterne para modo simulador.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Terminal View */}
      <div className="flex-1 min-h-[180px] p-4 flex flex-col bg-zinc-950 overflow-hidden relative">
        <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-2 border-b border-zinc-900 pb-2">
          <span className="font-mono font-bold tracking-wider">// LOCAL_TRANSACTION_LOGGER</span>
          <button
            onClick={onClearLogs}
            className="hover:text-zinc-300 transition-colors flex items-center gap-1 font-mono hover:bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] border border-transparent hover:border-zinc-800 cursor-pointer"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3 text-zinc-655" />
            LIMPAR_LOGGER
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs select-text terminal-scroll max-h-[300px]">
          {logs.length === 0 ? (
            <p className="text-zinc-700 font-mono text-[10px] italic mt-2">// Nenhuma transação de sinal ainda.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-1 text-[11px] border-b border-zinc-900 border-dashed pb-1 last:border-0 font-mono">
                <span className="text-zinc-650 shrink-0 font-mono text-[10px] select-none">
                  [{log.timestamp}]
                </span>
                <span className={`shrink-0 font-mono text-[10px] font-bold select-none ${
                  log.direction === 'IN' ? 'text-emerald-500' :
                  log.direction === 'OUT' ? 'text-cyan-400' :
                  log.direction === 'ERR' ? 'text-amber-500 animate-pulse' : 'text-zinc-500'
                }`}>
                  [{log.direction}]
                </span>
                <span className={`break-all ${getLogColor(log.direction)}`}>
                  {log.text}
                </span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Manual Input Bar */}
      <form onSubmit={handleSubmitManual} className="bg-zinc-950 border-t border-zinc-850 p-2 flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder={isSimulator ? "Ex: 1,1 (Fazer Jogada Simulado)" : "Ex: 1,1 (Enviar via Serial)"}
          className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 font-mono outline-none focus:border-emerald-500/50 transition-all font-mono"
        />
        <button
          type="submit"
          className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 hover:text-emerald-400 px-4 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all transform active:scale-95 border border-[#1e2025] cursor-pointer"
        >
          ENVIAR
        </button>
      </form>
    </div>
  );
}
