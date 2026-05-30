import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, Cpu, Terminal, History, Activity, Radio, AlertTriangle, 
  HelpCircle, RefreshCw, FileText, Settings, Sparkles, CheckCircle2,
  Trash2, Copy, FileCode, Award, ShieldAlert, Wifi, WifiOff
} from 'lucide-react';
import { ArduinoGameState, MatchHistoryEntry, SerialLogEntry } from './types';
import { getInitialSimulatorState, processSimulatorMove } from './utils/arduinoSimulator';
import { ARDUINO_INO_CODE } from './utils/arduinoCode';
import SerialMonitor from './components/SerialMonitor';
import GameBoard from './components/GameBoard';
import SetupInstructions from './components/SetupInstructions';
import HistoryPanel from './components/HistoryPanel';
import DeviceDebugInfo from './components/DeviceDebugInfo';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'match' | 'history' | 'code'>('match');

  // Arduino connection state
  const [isSimulator, setIsSimulator] = useState<boolean>(true);
  const [port, setPort] = useState<any>(null);
  const [portName, setPortName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Game states (sourced from active mode)
  const [gameState, setGameState] = useState<ArduinoGameState>(getInitialSimulatorState());
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [logs, setLogs] = useState<SerialLogEntry[]>([]);
  
  // Counters for debug and analytics
  const [packetsCount, setPacketsCount] = useState<number>(0);
  const [bytesCount, setBytesCount] = useState<number>(0);

  // References for Web Serial loop control
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(true);
  const loggedMatchesRef = useRef<Set<string>>(new Set());

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('arduino_ttt_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (_) {}

    // Initialize logs with greeting
    addLog('SYS', 'Sistema iniciado. JogoDaVelha integrado v1.0.4.');
    addLog('SYS', 'Modo Simulador habilitado por padrão. Conecte pelo painel serial se desejar usar Arduino Real.');
  }, []);

  // Sync history to localStorage
  const saveHistory = (newHistory: MatchHistoryEntry[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('arduino_ttt_history', JSON.stringify(newHistory));
    } catch (_) {}
  };

  // Helper to add logs to visual terminal
  const addLog = (direction: 'IN' | 'OUT' | 'SYS' | 'ERR', text: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [...prev, { timestamp, direction, text }]);
    
    // Increment bytes count based on text length
    setBytesCount(prev => prev + text.length + 12); // estimative overhead
  };

  // Connect to physical serial port via Web Serial API
  const handleConnectPort = async () => {
    if (!('serial' in navigator)) {
      addLog('ERR', 'API Web Serial não suportada neste browser.');
      return;
    }

    try {
      addLog('SYS', 'Solicitando seleção de porta serial...');
      const requestedPort = await (navigator as any).serial.requestPort();
      
      addLog('SYS', 'Abrindo conexão USB a 115200 bps...');
      await requestedPort.open({ baudRate: 115200 });
      
      setPort(requestedPort);
      setIsConnected(true);
      setIsSimulator(false);
      setPortName('USB Serial Port');
      addLog('SYS', 'Conexão estabelecida com sucesso!');

      // Start reading loop
      keepReadingRef.current = true;
      startReadingLoop(requestedPort);
    } catch (err: any) {
      addLog('ERR', `Falha ao conectar: ${err.message || err}`);
    }
  };

  // Disconnect from physical serial port
  const handleDisconnectPort = async () => {
    keepReadingRef.current = false;
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (_) {}
    }

    try {
      if (port) {
        await port.close();
      }
    } catch (err: any) {
      addLog('ERR', `Erro ao fechar porta: ${err.message}`);
    }

    setPort(null);
    setIsConnected(false);
    setPortName(null);
    addLog('SYS', 'Porta serial desconectada.');
  };

  // Async loop to read incoming serial line stream
  const startReadingLoop = async (activePort: any) => {
    try {
      const decoder = new TextDecoder();
      let buffer = '';

      while (activePort.readable && keepReadingRef.current) {
        const reader = activePort.readable.getReader();
        readerRef.current = reader;

        try {
          while (keepReadingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;

            if (value) {
              const decodedChunk = decoder.decode(value);
              buffer += decodedChunk;
              
              // Process complete lines
              let lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep the incomplete line segment

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                addLog('IN', trimmed);
                setPacketsCount(prev => prev + 1);

                try {
                  const cleanedJson = trimmed.substring(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
                  if (cleanedJson) {
                    const parsed: ArduinoGameState = JSON.parse(cleanedJson);
                    setGameState(parsed);
                    verifyFinishedMatch(parsed, 'Physical Arduino');
                  }
                } catch (parseError) {
                  addLog('ERR', `JSON Inválido recebido: ${trimmed}`);
                }
              }
            }
          }
        } catch (innerErr: any) {
          addLog('ERR', `Erro durante leitura ativa: ${innerErr.message || innerErr}`);
        } finally {
          reader.releaseLock();
        }
      }
    } catch (err: any) {
      addLog('ERR', `Erro no loop principal: ${err.message || err}`);
    }
  };

  // Send textual string over physical serial
  const sendSerialText = async (data: string) => {
    const formatted = data.trim() + '\n';
    
    if (isSimulator) {
      // Simulate serial transaction
      addLog('OUT', formatted.trim());
      setPacketsCount(prev => prev + 1);
      
      const { nextState, outputJson } = processSimulatorMove(gameState, data);
      
      // Artificial slight delay for hardware reality response feel!
      setTimeout(() => {
        setGameState(nextState);
        addLog('IN', outputJson);
        setPacketsCount(prev => prev + 1);
        verifyFinishedMatch(nextState, 'Simulator');
      }, 100);
      return;
    }

    if (!port || !isConnected) {
      addLog('ERR', 'Nenhuma porta serial ativa para envio.');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const writer = port.writable.getWriter();
      addLog('OUT', formatted.trim());
      setPacketsCount(prev => prev + 1);
      
      await writer.write(encoder.encode(formatted));
      writer.releaseLock();
    } catch (err: any) {
      addLog('ERR', `Erro ao enviar dados pela serial: ${err.message || err}`);
    }
  };

  // Cell click controller
  const handleCellClick = (row: number, col: number) => {
    // Arduino validators require: first char: row, third: col, length 3.
    // We send formated as "row,col" which matches perfectly!
    sendSerialText(`${row},${col}`);
  };

  // Restart match controller (serial signal newline)
  const handleRestartMatch = () => {
    addLog('SYS', 'Enviando sinal de reinício (newline) para o Arduino...');
    
    // Clear list of logged matches to allow new game telemetry logs
    loggedMatchesRef.current.clear();

    if (isSimulator) {
      sendSerialText('\n');
      setGameState(getInitialSimulatorState());
    } else {
      sendSerialText('\n');
      // Set to loading/initial until next serial JSON reports back
      setGameState(prev => ({
        ...prev,
        velha: 0,
        tabuleiro: "000000000",
        HaVencedor: false,
        msg: "Partida Iniciada",
        erro: ""
      }));
    }
  };

  // Check if a match state is finalized, and save to Match History
  const verifyFinishedMatch = (state: ArduinoGameState, modeStr: 'Physical Arduino' | 'Simulator') => {
    const isWin = state.HaVencedor;
    const isVelha = state.velha >= 9 && !isWin;
    const hasGameOverKeywords = state.msg.includes("venceu") || state.msg.includes("VELHA");

    if (isWin || isVelha || hasGameOverKeywords) {
      // Build unique signature using board configuration to avoid duplicates
      const signature = `${state.tabuleiro}-${state.velha}`;
      if (loggedMatchesRef.current.has(signature)) return;

      loggedMatchesRef.current.add(signature);

      let winnerLabel = 'Draw';
      if (isWin) {
        winnerLabel = `Jogador ${state.jogadorDaVez}`;
      } else if (state.msg.includes("Jogador 1")) {
        winnerLabel = 'Jogador 1';
      } else if (state.msg.includes("Jogador 2")) {
        winnerLabel = 'Jogador 2';
      }

      const newEntry: MatchHistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }) + ' ' + new Date().toLocaleDateString('pt-BR'),
        winner: winnerLabel,
        moves: state.velha,
        mode: modeStr
      };

      const updatedHistory = [newEntry, ...history];
      saveHistory(updatedHistory);
      
      addLog('SYS', `Resultado registrado: ${winnerLabel === 'Draw' ? 'Empate/Velha' : winnerLabel + ' venceu'}!`);
    }
  };

  // Toggle between local virtual simulation and real device attachment
  const handleToggleSimulator = (targetSimulator: boolean) => {
    if (!targetSimulator) {
      // Real serial requested
      setIsSimulator(false);
      setGameState(getInitialSimulatorState());
      addLog('SYS', 'Modo Arduino Serial ativado. Conecte sua porta USB.');
    } else {
      // Simulator requested
      if (isConnected) {
        handleDisconnectPort();
      }
      setIsSimulator(true);
      setGameState(getInitialSimulatorState());
      addLog('SYS', 'Modo Simulador de Arduino de volta ao ar.');
    }
  };

  // Clear log logs
  const handleClearLogs = () => {
    setLogs([]);
    setBytesCount(0);
    setPacketsCount(0);
  };

  // Clear matching session history
  const handleClearHistory = () => {
    saveHistory([]);
    addLog('SYS', 'Histórico de partidas deletado.');
  };

  return (
    <div className="bg-zinc-950 text-zinc-300 font-sans min-h-screen flex flex-col bg-digital-grid selection:bg-emerald-950 selection:text-emerald-400">
      {/* Dynamic Header */}
      <header className="bg-zinc-900 border-b border-zinc-850 flex justify-between items-center px-6 md:px-10 h-16 w-full z-50 shadow-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Cpu className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <span className="font-mono text-xs tracking-wider text-emerald-500 font-bold uppercase block">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
              SYS_DEV // TIC-TAC-TOE_ARDUINO
            </span>
            <p className="text-[10px] text-zinc-500 font-mono">Módulo de Integração Serial v1.0.4 | PORT: 115200</p>
          </div>
        </div>

        {/* Global Connection Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {isSimulator ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 text-emerald-400 rounded border border-emerald-800/30 text-[10px] font-mono font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              EMULADOR_SINAL_ATIVO
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              ARDUINO_ONLINE_LINK
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/20 text-amber-500 rounded border border-amber-800/30 text-[10px] font-mono font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-450"></span>
              HARDWARE_OFFLINE
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row bg-zinc-950">
        {/* Navigation / Control Sidebar */}
        <aside className="w-full md:w-64 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-850 p-4 flex flex-col gap-4 justify-between shrink-0">
          
          <div className="space-y-4">
            {/* Developer profile block */}
            <div className="px-3 py-2.5 bg-zinc-950/80 rounded-lg border border-zinc-850 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-950/50 text-emerald-500 flex items-center justify-center border border-emerald-500/20 font-bold font-mono text-xs">
                RT
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs text-zinc-300 font-bold uppercase tracking-tight truncate">ROOT_USER</p>
                <p className="text-[9px] font-mono text-zinc-500">LEVEL_03_DEVELOPER</p>
              </div>
            </div>

            {/* Menu Buttons */}
            <div className="space-y-1.5 select-none font-mono">
              <button
                onClick={() => setActiveTab('match')}
                className={`w-full text-left px-3.5 py-2.5 rounded font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'match'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'text-zinc-400 bg-transparent hover:bg-zinc-950 border-transparent hover:border-zinc-850'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Matriz de Conexão
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-3.5 py-2.5 rounded font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'history'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'text-zinc-400 bg-transparent hover:bg-zinc-950 border-transparent hover:border-zinc-850'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                REGISTROS LOCK ({history.length})
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`w-full text-left px-3.5 py-2.5 rounded font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'code'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'text-zinc-400 bg-transparent hover:bg-zinc-950 border-transparent hover:border-zinc-850'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                DOCK INO SKETCH
              </button>
            </div>
          </div>

          {/* Quick Stats sidebar banner */}
          <div className="pt-4 border-t border-zinc-850 hidden md:block">
            <DeviceDebugInfo 
              baudRate={115200}
              packetsReceived={packetsCount}
              bytesReceived={bytesCount}
              isConnected={isConnected}
              portName={portName}
              mode={isSimulator ? 'Simulator' : 'Physical Arduino'}
            />
          </div>
        </aside>

        {/* Central / Active Tab Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          
          {activeTab === 'match' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Gameboard block (Cols 7) */}
              <div className="lg:col-span-7 flex flex-col justify-center items-center bg-zinc-950/40 border border-zinc-850 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-digital-grid opacity-5 pointer-events-none"></div>
                <GameBoard
                  boardString={gameState.tabuleiro}
                  onCellClick={handleCellClick}
                  jogadorDaVez={gameState.jogadorDaVez}
                  haVencedor={gameState.HaVencedor}
                  velha={gameState.velha}
                  msg={gameState.msg}
                  erro={gameState.erro}
                  onRestart={handleRestartMatch}
                  isSimulator={isSimulator}
                  isConnected={isConnected}
                />
              </div>

              {/* Serial Monitor block (Cols 5) */}
              <div className="lg:col-span-5">
                <SerialMonitor
                  logs={logs}
                  isSimulator={isSimulator}
                  onToggleSimulator={handleToggleSimulator}
                  isConnected={isConnected}
                  onConnect={handleConnectPort}
                  onDisconnect={handleDisconnectPort}
                  onSendManualText={sendSerialText}
                  onClearLogs={handleClearLogs}
                  portName={portName}
                />
              </div>

            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <HistoryPanel 
                  history={history} 
                  onClearHistory={handleClearHistory} 
                />
              </div>
              <div className="lg:col-span-4 bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 shadow-xl font-mono">
                <h3 className="font-bold text-xs tracking-wider uppercase text-zinc-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
                  // STATS_REPORT_CONSOLE
                </h3>
                <p className="text-zinc-550 text-xs leading-relaxed font-sans">
                  Aqui você acompanha as partidas validadas e transmitidas pelo firmware do Arduino através da porta serial em formato JSON puro.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
                  <div className="bg-zinc-900 border border-zinc-850 p-3 rounded text-center">
                    <p className="text-[9px] text-zinc-550">MATCHES_PLAYED</p>
                    <p className="text-xl font-bold text-emerald-400">{history.length}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-850 p-3 rounded text-center">
                    <p className="text-[9px] text-zinc-550">TOTAL_PACKETS</p>
                    <p className="text-xl font-bold text-amber-500">{packetsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="grid grid-cols-1 gap-6">
              <SetupInstructions />
            </div>
          )}

        </main>
      </div>

      {/* Footer bar */}
      <footer className="bg-zinc-900 border-t border-zinc-850 flex flex-[#3f414a] sm:flex-row justify-between items-center px-6 md:px-10 py-4 w-full text-center shrink-0 gap-3 text-xs font-mono text-zinc-550 border-t border-zinc-850">
        <p className="text-[10px]">
          © 2026 SENAI-SP SYSTEM_DEV_LAB v1.0.4 | DIRECT_ARDUINO_SERIAL_LINK
        </p>
        <div className="flex gap-4 items-center">
          <a href="https://github.com/DenadaiSenai/Jogo-Da-Velha-Arduino" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-opacity underline">
            Repositório .INO
          </a>
          <span>|</span>
          <span className="text-emerald-950 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            ACTIVE_SESSION
          </span>
        </div>
      </footer>
    </div>
  );
}
