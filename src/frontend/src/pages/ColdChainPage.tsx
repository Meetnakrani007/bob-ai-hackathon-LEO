import React from 'react';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  BatteryCharging,
  Zap,
  TrendingUp,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ColdChainPageProps {
  shipments: any[];
  isRerouted: boolean;
  onOpenApproval: () => void;
}

export const ColdChainPage: React.FC<ColdChainPageProps> = ({
  shipments,
  isRerouted,
  onOpenApproval,
}) => {
  const currentTemp = isRerouted ? 4.2 : 7.84;
  const bufferHours = isRerouted ? 48.0 : 4.2;

  const telemetryHistory = [
    { time: '12h ago', temp: 4.0, status: 'safe' },
    { time: '10h ago', temp: 4.6, status: 'safe' },
    { time: '8h ago', temp: 5.2, status: 'safe' },
    { time: '6h ago', temp: 5.9, status: 'warning' },
    { time: '4h ago', temp: 6.6, status: 'warning' },
    { time: '2h ago', temp: 7.2, status: 'critical' },
    { time: 'Now', temp: isRerouted ? 4.2 : 7.84, status: isRerouted ? 'safe' : 'critical' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`glass-panel p-6 rounded-2xl border transition-all ${
        isRerouted
          ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/90 to-slate-950'
          : 'border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900/90 to-slate-950'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              isRerouted
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
            }`}>
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">
                  Active Cold-Chain Telemetry Guard
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  Live IoT Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <span className="text-white font-mono font-bold">CONT-REEFER-9042</span> • High-Value Insulin & Pediatric Vaccines ($1.25M USD)
              </p>
            </div>
          </div>

          <div>
            {!isRerouted ? (
              <button
                onClick={onOpenApproval}
                className="btn-danger text-xs py-2 px-4 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Authorize Reefer Truck Intercept</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Thermal Equilibrium Restored (4.2°C Safe)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Large Clean Non-Overlapping Metric Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Core Reefer Temp</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-black mono ${isRerouted ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentTemp.toFixed(2)}°C
            </span>
            <span className="text-xs text-slate-500">Threshold: 8.00°C</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                isRerouted ? 'bg-emerald-500 w-[45%]' : 'bg-rose-500 w-[95%]'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isRerouted ? 'Normal thermal equilibrium' : 'Approaching excursion limit'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Thermal Buffer Window</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-black mono flex items-center gap-2 ${
              isRerouted ? 'text-cyan-400' : 'text-amber-400'
            }`}>
              <Clock className="w-5 h-5" />
              {bufferHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500">Remaining</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            {isRerouted ? 'Shore power connected' : 'Velocity: +0.32°C/hr degradation'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Genset Fuel Level</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black mono text-white flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-amber-400" />
              {isRerouted ? '98%' : '26%'}
            </span>
            <span className="text-xs text-slate-500">Diesel aux</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            {isRerouted ? 'Full shore line support' : 'Critical generator reserve (< 6h)'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Allocated Fleet Asset</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-black text-cyan-300 mono flex items-center gap-1.5 truncate">
              <Truck className="w-5 h-5 flex-shrink-0" />
              TRK-REEFER-01
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            ThermoKing Arctic (8km from JNPT)
          </p>
        </div>
      </div>

      {/* 12-Hour Thermal Progression Curve Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              12-Hour Thermal Progression Profile vs Safe Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Envelope: +2.0°C (Min) to +8.0°C (Max). Above +8.0°C leads to irreversible insulin protein denaturation.
            </p>
          </div>
          <span className="text-xs mono font-bold text-rose-400 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-500/30">
            Current Rate: +0.32°C / hr
          </span>
        </div>

        {/* SVG Chart */}
        <div className="relative h-64 w-full bg-slate-950/80 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
          <div className="absolute top-8 left-4 right-4 border-b border-dashed border-rose-500/40 flex justify-between text-[10px] text-rose-400 font-mono">
            <span>Critical Excursion Ceiling (+8.00°C)</span>
            <span>IRREVERSIBLE SPOILAGE</span>
          </div>
          <div className="absolute bottom-8 left-4 right-4 border-b border-dashed border-cyan-500/40 flex justify-between text-[10px] text-cyan-400 font-mono">
            <span>Minimum Operating Floor (+2.00°C)</span>
            <span>OPTIMAL STORAGE</span>
          </div>

          <div className="flex-1 flex items-end justify-between px-6 pt-12 pb-6">
            {telemetryHistory.map((pt, idx) => {
              const heightPercent = Math.min(100, Math.max(10, ((pt.temp - 2) / 7) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-2 z-10">
                  <span className={`text-xs font-mono font-bold ${
                    pt.temp >= 7.0 ? 'text-rose-400' : pt.temp >= 5.5 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {pt.temp.toFixed(1)}°C
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-8 rounded-t-lg transition-all duration-500 ${
                      pt.temp >= 7.0
                        ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-lg shadow-rose-500/30'
                        : pt.temp >= 5.5
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1">
                    {pt.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
