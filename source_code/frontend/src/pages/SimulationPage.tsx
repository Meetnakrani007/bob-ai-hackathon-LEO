import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Building,
  Ship,
  DollarSign,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface SimulationPageProps {
  onOpenApproval: () => void;
  isRerouted: boolean;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  onOpenApproval,
  isRerouted,
}) => {
  const [horizon, setHorizon] = useState<24 | 48 | 72>(72);

  const chartData = [
    { time: '0h', cost: 0.15, prevented: 0.15 },
    { time: '12h', cost: 0.45, prevented: 0.30 },
    { time: '24h', cost: 0.63, prevented: 0.48 },
    { time: '36h', cost: 0.95, prevented: 0.60 },
    { time: '48h', cost: 1.26, prevented: 0.75 },
    { time: '60h', cost: 1.85, prevented: 0.90 },
    { time: '72h', cost: 2.52, prevented: 1.10 },
  ];

  const simulationData = {
    24: {
      totalDemurrage: '$630,000',
      vesselsDelayed: 18,
      cargoAtRisk: '$1,250,000',
      carrierDisputes: 4,
      jnptLoad: '32%',
      mundraLoad: '28%',
    },
    48: {
      totalDemurrage: '$1,260,000',
      vesselsDelayed: 26,
      cargoAtRisk: '$3,850,000',
      carrierDisputes: 12,
      jnptLoad: '58%',
      mundraLoad: '45%',
    },
    72: {
      totalDemurrage: '$2,520,000',
      vesselsDelayed: 38,
      cargoAtRisk: '$8,400,000',
      carrierDisputes: 29,
      jnptLoad: '84%',
      mundraLoad: '68%',
    },
  };

  const active = simulationData[horizon];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Disruption Simulator
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Financial Demurrage & Cargo Risk Model
          </h1>
        </div>

        <button
          onClick={onOpenApproval}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm w-fit"
        >
          <span>{isRerouted ? 'Plan A Active (JNPT)' : 'Authorize Reroute'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizon Switcher */}
      <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 p-1.5 rounded-xl w-fit">
        {[24, 48, 72].map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              horizon === h
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            +{h} Hours
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-300">Cost Trajectory ($ Millions)</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-rose-500" /> Demurrage Cost
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Saved via Reroute
            </span>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}M`} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`$${Number(val).toFixed(2)}M`]}
              />
              <Area type="monotone" dataKey="cost" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="prevented" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">Demurrage Loss</span>
          <div className="text-2xl font-bold text-rose-400">{active.totalDemurrage}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Contract penalties</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">Queued Vessels</span>
          <div className="text-2xl font-bold text-white">{active.vesselsDelayed}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Stranded in roads</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">Cargo at Risk</span>
          <div className="text-2xl font-bold text-amber-400">{active.cargoAtRisk}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Includes cold chain</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">Carrier Disputes</span>
          <div className="text-2xl font-bold text-white">{active.carrierDisputes}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Legal claims</span>
        </div>
      </div>

      {/* 2 Clean Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Nhava Sheva (JNPT)</span>
            <span className="text-[11px] text-slate-400">Alternate Cold-Chain Berth</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            {active.jnptLoad} Load
          </span>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Mundra Port (INMUN)</span>
            <span className="text-[11px] text-slate-400">Dry Cargo & Rail Corridor</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
            {active.mundraLoad} Load
          </span>
        </div>
      </div>
    </div>
  );
};
