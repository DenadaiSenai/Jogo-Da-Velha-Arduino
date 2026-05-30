import React, { useState } from 'react';
import { Copy, Check, FileCode, Cpu, Terminal, ExternalLink } from 'lucide-react';
import { ARDUINO_INO_CODE } from '../utils/arduinoCode';

export default function SetupInstructions() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_INO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="setup-instructions-panel" className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-500" />
          <h2 className="font-mono text-xs tracking-wider text-zinc-300 font-bold">// GUIA_COMPILACAO_ARDUINO</h2>
        </div>
        <button
          onClick={handleCopy}
          className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-all outline-none border border-zinc-700 cursor-pointer font-mono"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-bold">COPIADO!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>COPIAR .INO</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 overflow-y-auto space-y-5 flex-1 max-h-[500px] bg-zinc-950">
        {/* Step 1 */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded bg-emerald-950/50 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/20 font-mono">
            1
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-zinc-300 font-mono">// INSTALAR BIBLIOTECA</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              No Arduino IDE, acesse <strong className="text-emerald-400">Gerenciador de Bibliotecas</strong> (Ctrl+Shift+I) e instale a dependência <strong className="text-emerald-400 font-mono">ArduinoJson</strong> (Benoit Blanchon, versão 6 ou 7).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded bg-emerald-950/50 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/20 font-mono">
            2
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-zinc-300 font-mono">// CARREGAR SKU CODE</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Salve o sketch com o nome <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-400">JogoDaVelha.ino</code>, cole o código fonte gerado e compile diretamente na placa Arduino.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded bg-emerald-950/50 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/20 font-mono">
            3
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-zinc-300 font-mono">// CONEXÃO DE PORTA</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Deixe o cabo conectado na serial USB, feche o monitor nativo do Arduino IDE para liberar o barramento, retorne aqui e use a conexão serial direta do navegador!
            </p>
          </div>
        </div>

        {/* C++ Code Highlight View */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
            <span>Visualização de Firmware (.ino)</span>
            <span className="text-emerald-500/60 border border-zinc-850 px-1.5 py-0.5 rounded bg-zinc-900/40">C++ / Arduino Sketch</span>
          </div>
          <div className="rounded border border-zinc-850 bg-zinc-950 overflow-hidden text-xs max-h-[220px] overflow-y-auto font-mono text-emerald-400/80 p-3 select-all leading-relaxed">
            <pre className="text-[10px] whitespace-pre font-mono leading-relaxed">{ARDUINO_INO_CODE}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
