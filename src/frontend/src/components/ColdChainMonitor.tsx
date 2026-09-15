import React from 'react';
import {
  Thermometer,
  AlertTriangle,
  Clock,
  BatteryCharging,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface ColdChainMonitorProps {
  shipment: any;
  onRerouteTrigger: () => void;
  isRerouted: boolean;
}

export const ColdChainMonitor: React.FC<ColdChainMonitorProps> = ({
  shipment,
  onRerouteTrigger,
  isRerouted,
}) => {
  const telemetryHistory = [
    { hour: '-12h', temp: 4.0 },
    { hour: '-10h', temp: 4.6 },
    { hour: '-8h', temp: 5.2 },
    { hour: '-6h', temp: 5.9 },
    { hour: '-4h', temp: 6.6 },
    { hour: '-2h', temp: 7.2 },
    { hour: 'Now', temp: isRerouted ? 4.2 : 7.84 },
  ];

  const currentTemp = isRerouted ? 4.2 : 7.84;
  const maxTemp = 8.0;
  const minTemp = 2.0;

  return (
    <div
      className={`glass-panel p-4 sm:p-5 rounded-2xl relative overflow-hidden transition-all duration-300 ${
        !isRerouted
          ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-950'
          : 'border-slate-800'
      }`}
    >
      {/* Header: Clean & Compact */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isRerouted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <Thermometer className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">
                Active Cold-Chain Telemetry Guard
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                IoT Sensor
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Container: <span className="font-mono text-slate-200 font-semibold">CONT-REEFER-9042</span> • Batch A-7
            </p>
          </div>
        </div>

        <div>
          {isRerouted ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Stable (4.2°C)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Critical (+0.32°C/hr)
            </span>
          )}
        </div>
      </div>

      {/* 4 Core Metrics Grid: Clean, focused, high contrast */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {/* Metric 1 */}
        <div className="bg-slate-950/70 border border-white/5 p-3 rounded-xl">
          <p className="text-[10.5px] text-slate-400 font-medium">Core Temperature</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-xl sm:text-2xl font-black font-mono ${
                isRerouted ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentTemp.toFixed(2)}°C
            </span>
            <span className="text-[10px] text-slate-400">Safe: 2°–8°C</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isRerouted ? 'bg-emerald-500 w-[45%]' : 'bg-rose-500 w-[95%]'
              }`}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950/70 border border-white/5 p-3 rounded-xl">
          <p className="text-[10.5px] text-slate-400 font-medium">Thermal Buffer Time</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-xl sm:text-2xl font-black font-mono flex items-center gap-1 ${
                isRerouted ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              {isRerouted ? '48+ Hrs' : '4.2 Hrs'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {isRerouted ? 'Shore power connected' : 'Excursion to 8.0°C'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950/70 border border-white/5 p-3 rounded-xl">
          <p className="text-[10.5px] text-slate-400 font-medium">Cargo Value</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">$1.25M</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Critical Insulin Vaccines</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-950/70 border border-white/5 p-3 rounded-xl">
          <p className="text-[10.5px] text-slate-400 font-medium">Reefer Genset Power</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-200 font-mono flex items-center gap-1">
              <BatteryCharging className="w-4 h-4 text-amber-400 shrink-0" />
              {isRerouted ? '98%' : '26%'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {isRerouted ? 'Grid connected at JNPT' : 'Aux fuel level low'}
          </p>
        </div>
      </div>

      {/* 12-Hour Thermal Timeline: Sleek & Proportional */}
      <div className="bg-slate-950/50 border border-white/5 p-3 rounded-xl mb-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            12-Hour Thermal Progression
          </span>
          <span className="font-mono text-rose-400 text-[10.5px] font-semibold">
            Velocity: +0.32°C / hr
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 items-end h-14 pt-1">
          {telemetryHistory.map((item, idx) => {
            const heightPct = Math.min(100, Math.max(25, (item.temp / 8.5) * 100));
            const isLatest = idx === telemetryHistory.length - 1;

            return (
              <div key={item.hour} className="flex flex-col items-center gap-1 h-full justify-end">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded transition-all duration-300 ${
                    item.temp >= 7.5
                      ? 'bg-rose-500 shadow-sm shadow-rose-500/40'
                      : item.temp >= 6.0
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className={`text-[9px] font-mono ${isLatest ? 'text-white font-bold' : 'text-slate-400'}`}>
                  {item.temp}°
                </span>
                <span className="text-[8.5px] text-slate-500">{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Prompt (only when not rerouted) */}
      {!isRerouted && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Immediate diversion to JNPT recommended before thermal breach.</span>
          </div>
          <button
            onClick={onRerouteTrigger}
            className="btn-danger text-xs py-1.5 px-3 whitespace-nowrap font-bold shrink-0 shadow"
          >
            Authorize
          </button>
        </div>
      )}
    </div>
  );
};
