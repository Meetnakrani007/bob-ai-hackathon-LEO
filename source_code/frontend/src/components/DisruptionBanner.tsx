import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Ship,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface DisruptionBannerProps {
  disruption: any;
  onCompareScenarios: () => void;
  onRunSimulation: () => void;
  onOpenCopilot: () => void;
}

export const DisruptionBanner: React.FC<DisruptionBannerProps> = ({
  disruption,
  onCompareScenarios,
  onRunSimulation,
  onOpenCopilot,
}) => {
  if (!disruption) return null;

  return (
    <div className="w-full bg-[#111827] border border-slate-800 p-4 sm:p-5 mb-5 rounded-xl relative overflow-hidden shadow-sm">
      {/* Top row: Status indicators + Quick KPIs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 font-bold text-xs uppercase tracking-wider border border-rose-500/30">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            Critical Active Disruption
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified • 94% Confidence
          </span>

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            14h ago • Port of Mumbai (INBOM)
          </span>
        </div>

        {/* Concise metrics */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-white/5">
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Queued:</span>
            <span className="text-white font-bold">18 Vessels</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-white/5">
            <span className="text-slate-400">Exposed:</span>
            <span className="text-rose-400 font-bold">$2.75M USD</span>
          </div>
        </div>
      </div>

      {/* Main Content + Actions Row */}
      <div className="pt-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Clean, concise text */}
        <div className="space-y-1 max-w-2xl">
          <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
            Mumbai Port Dockworkers & Crane Operators Strike
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Wildcat strike over crane automation. Berths 1–10 halted with 18 container vessels delayed in outer anchorage.
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
            <span className="text-slate-500">Corroborated:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">Port Authority #BOM-2026-04</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">Reuters Bulletin</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">AIS Anomaly (14 Idle)</span>
          </div>
        </div>

        {/* Right: Uncramped, clean action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-2 lg:pt-0">
          <button
            onClick={onCompareScenarios}
            className="btn-primary text-xs px-3.5 py-2 whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" />
            <span>Compare Scenarios</span>
          </button>

          <button
            onClick={onRunSimulation}
            className="btn-outline text-xs px-3.5 py-2 whitespace-nowrap flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
            <span>72h Simulation</span>
          </button>

          <button
            onClick={onOpenCopilot}
            className="p-2 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-cyan-300 hover:bg-indigo-600/50 transition flex-shrink-0"
            title="Launch AI reasoning assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
