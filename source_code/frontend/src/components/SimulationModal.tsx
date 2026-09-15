import React, { useState } from 'react';
import {
  TrendingUp,
  X,
  Clock,
  DollarSign,
  Ship,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  Train,
  Anchor,
  ThermometerSnowflake,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApproval: () => void;
  isRerouted: boolean;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onOpenApproval,
  isRerouted,
}) => {
  const [horizon, setHorizon] = useState<24 | 72>(72);

  if (!isOpen) return null;

  // Discrete-event cascade chart data (in millions USD)
  const chartData24 = [
    { time: '0h', unmitigated: 0.15, mitigated: 0.15, delayedTeu: 12 },
    { time: '6h', unmitigated: 0.35, mitigated: 0.28, delayedTeu: 28 },
    { time: '12h', unmitigated: 0.58, mitigated: 0.38, delayedTeu: 45 },
    { time: '18h', unmitigated: 0.82, mitigated: 0.42, delayedTeu: 66 },
    { time: '24h', unmitigated: 1.02, mitigated: 0.48, delayedTeu: 84 },
  ];

  const chartData72 = [
    { time: '0h', unmitigated: 0.15, mitigated: 0.15, delayedTeu: 12 },
    { time: '12h', unmitigated: 0.58, mitigated: 0.38, delayedTeu: 45 },
    { time: '24h', unmitigated: 1.02, mitigated: 0.48, delayedTeu: 84 },
    { time: '36h', unmitigated: 1.85, mitigated: 0.65, delayedTeu: 102 },
    { time: '48h', unmitigated: 2.75, mitigated: 0.82, delayedTeu: 121 },
    { time: '60h', unmitigated: 3.65, mitigated: 0.95, delayedTeu: 135 },
    { time: '72h', unmitigated: 4.56, mitigated: 1.10, delayedTeu: 143 },
  ];

  const chartData = horizon === 24 ? chartData24 : chartData72;

  const currentMetrics =
    horizon === 24
      ? {
          queuedVessels: 20,
          delayedTeus: '84,000',
          demurrageUsd: '$700K',
          spoilageRisk: 15,
          totalExposure: '$1,024,750',
          savedExposure: '$544,000',
        }
      : {
          queuedVessels: 34,
          delayedTeus: '142,800',
          demurrageUsd: '$3.57M',
          spoilageRisk: 68,
          totalExposure: '$4,557,250',
          savedExposure: '$1,250,000',
        };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Cascading Network Disruption Simulator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Discrete-Event Model
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monte Carlo propagation model for Port of Mumbai (INBOM) Berth Labor Stoppage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Horizon Toggle & Scenario Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300 font-medium">Projection Horizon:</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setHorizon(24)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  horizon === 24
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                24-Hour Fast Shock
              </button>
              <button
                onClick={() => setHorizon(72)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  horizon === 72
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                72-Hour Full Cascade
              </button>
            </div>
          </div>

          {/* Interactive Cascade Chart */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Financial Loss Trajectory & Mitigation Potential
                </h4>
                <p className="text-[11px] text-slate-400">
                  Comparing unmitigated port congestion versus SupplyGuard autonomous JNPT reroute
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Unmitigated
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> With Plan A Reroute
                </span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="unmitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="mitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${v}M`}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value: any, name: any) => [
                      `$${Number(value).toFixed(2)}M`,
                      name === 'unmitigated' ? 'Unmitigated Loss' : 'Mitigated Loss',
                    ]}
                    labelFormatter={(label) => `Timeline Horizon: +${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="unmitigated"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#unmitigatedGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="mitigated"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mitigatedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 Key Numerical Metrics Grid with Clean Typography */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Queued Vessels</span>
                <Ship className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {currentMetrics.queuedVessels}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Off Mumbai Outer Anchorage</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Delayed TEUs</span>
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {currentMetrics.delayedTeus}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Containerized Cargo Stalled</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Vessel Demurrage</span>
                <DollarSign className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 tracking-tight">
                {currentMetrics.demurrageUsd}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">$1,250/hr contractual penalty</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Spoilage Risk</span>
                <ThermometerSnowflake className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 tracking-tight">
                {currentMetrics.spoilageRisk}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentMetrics.spoilageRisk}%` }}
                />
              </div>
            </div>
          </div>

          {/* Financial Exposure & Mitigation Value Card */}
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-emerald-950/30 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
                Total Projected Financial Exposure
              </span>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {currentMetrics.totalExposure}{' '}
                <span className="text-xs text-slate-400 font-normal">USD</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                  Mitigation Feasibility
                </span>
                <span className="text-xs text-slate-300">
                  Saves <strong className="text-emerald-400">{currentMetrics.savedExposure}</strong> via JNPT
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Visual Spillover Impact Vector Nodes (Replacing Dense Paragraphs) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
              Cascading Multi-Modal Spillover Vectors
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Vector 1 */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-3 rounded-xl transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Train className="w-3.5 h-3.5 text-purple-400" />
                    <span>Western Rail DFC</span>
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    +18h Choke
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Flat-wagon shortage across Maharashtra-Gujarat rail corridor.
                </p>
              </div>

              {/* Vector 2 */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-3 rounded-xl transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mundra Port Hub</span>
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    82% Berth Cap
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Overflow diversion queue reaching physical berth saturation limits.
                </p>
              </div>

              {/* Vector 3 */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-3 rounded-xl transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cold-Chain Buffer</span>
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Protected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Active reefer power connected at JNPT prevents vaccine batch spoilage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Close Simulation
          </button>

          {!isRerouted ? (
            <button
              onClick={() => {
                onClose();
                onOpenApproval();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition flex items-center gap-2 shadow-lg shadow-rose-900/30"
            >
              <span>Authorize Plan A Mitigation (${currentMetrics.savedExposure} Saved)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mitigation Active (Cascade Halted)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
