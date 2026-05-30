import React from 'react';
import { ToggleLeft, CircleDot, Activity, ShieldCheck, Database, HardDrive, Cpu } from 'lucide-react';

interface DeviceDebugInfoProps {
  baudRate: number;
  packetsReceived: number;
  bytesReceived: number;
  isConnected: boolean;
  portName: string | null;
  mode: 'Physical Arduino' | 'Simulator';
}

export default function DeviceDebugInfo({
  baudRate,
  packetsReceived,
  bytesReceived,
  isConnected,
  portName,
  mode
}: DeviceDebugInfoProps) {
  return (
    <div id="system-stats-panel" className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl select-none">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-850 px-4 py-2">
        <p className="font-mono text-xs text-zinc-300 flex items-center gap-2 font-bold">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          // SYSTEM_STATS_METRICS
        </p>
      </div>

      {/* Metrics Rows */}
      <div className="p-4 space-y-3 font-mono text-xs text-zinc-400 bg-zinc-950">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <span className="flex items-center gap-1.5 text-zinc-550">
            <Cpu className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            OPERATIONAL_MODE:
          </span>
          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
            mode === 'Simulator' 
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/20' 
              : 'bg-emerald-500 text-black animate-pulse'
          }`}>
            {mode === 'Simulator' ? 'JS_EMULATOR' : 'HARDWARE_LINK'}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <span className="flex items-center gap-1.5 text-zinc-550">
            <HardDrive className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            DEVICE_PORT:
          </span>
          <span className="font-bold text-zinc-300 truncate max-w-[130px]" title={portName || "Nenhuma conectada"}>
            {mode === 'Simulator' ? 'VIRTUAL_COM1' : (portName || 'N/A')}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <span className="flex items-center gap-1.5 text-zinc-550">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            SERIAL_BAUDRATE:
          </span>
          <span className="font-bold text-zinc-300 text-right">
            {baudRate} bps
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <span className="flex items-center gap-1.5 text-zinc-550">
            <Database className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            JSON_PACKETS_REG:
          </span>
          <span className="font-bold text-emerald-400 text-right font-mono">
            [ {String(packetsReceived).padStart(4, '0')} ]
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-zinc-550">
            <CircleDot className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            ACCUMULATED_SIZE:
          </span>
          <span className="font-bold text-amber-500 text-right">
            {bytesReceived} B
          </span>
        </div>
      </div>
    </div>
  );
}
