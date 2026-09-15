import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingDown,
  ArrowUpRight,
  TrendingUp,
  Ship,
  Sparkles,
  GitFork,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Layers,
  Thermometer,
  Anchor,
  FileText,
  Activity,
  Truck,
} from 'lucide-react';
import { DisruptionBanner } from '../components/DisruptionBanner';
import { ColdChainMonitor } from '../components/ColdChainMonitor';

interface DashboardPageProps {
  disruptions: any[];
  shipments: any[];
  isRerouted: boolean;
  onOpenApproval: () => void;
  onOpenSimulation: () => void;
  onOpenCopilot: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  disruptions,
  shipments,
  isRerouted,
  onOpenApproval,
  onOpenSimulation,
  onOpenCopilot,
}) => {
  const navigate = useNavigate();
  const primaryDisruption = disruptions.find((d) => d.disruption_id === 'DIS-2026-BOM-001') || disruptions[0];
  const heroShipment = shipments.find((s) => s.shipment_id === 'SHP-PHARMA-1001') || {
    shipment_id: 'SHP-PHARMA-1001',
    title: 'High-Value Insulin & Temperature-Critical Vaccines Batch A-7',
    value_usd: 1250000,
    status: isRerouted ? 'rerouted' : 'at_risk',
    risk_score: isRerouted ? 18 : 94,
    container_id: 'CONT-REEFER-9042',
    requires_refrigeration: true,
  };

  const kpis = [
    {
      title: 'Active Disruptions',
      value: '1 Critical',
      subtitle: 'Port of Mumbai (Berths 1-10 Struck)',
      icon: AlertTriangle,
      color: 'rose',
      badge: '94% Corroborated',
    },
    {
      title: 'Total Cargo Exposed',
      value: '$2,750,000',
      subtitle: '18 Container Vessels Queued',
      icon: DollarSign,
      color: 'amber',
      badge: 'At Risk',
    },
    {
      title: 'Cold-Chain Buffer',
      value: isRerouted ? '48+ Hours' : '4.2 Hours',
      subtitle: isRerouted ? 'Reefer power connected at JNPT' : 'Until 8.00°C thermal breach',
      icon: Clock,
      color: isRerouted ? 'emerald' : 'rose',
      badge: isRerouted ? 'Stabilized' : 'Critical Excursion',
    },
    {
      title: 'Projected Value Saved',
      value: isRerouted ? '$1,250,000' : '$1,248,550',
      subtitle: 'Plan A: Nhava Sheva Diversion',
      icon: ShieldCheck,
      color: 'cyan',
      badge: '96% Feasible',
    },
  ];

  const [selectedPortId, setSelectedPortId] = useState<string>('INBOM');

  const workspaceModules = [
    {
      title: 'Threat Intel & Ports',
      route: '/disruptions',
      tagline: 'Strike bulletins & anchorage radar',
      icon: AlertTriangle,
      color: 'rose',
      badge: '2 Active',
    },
    {
      title: 'Cold-Chain Guard Studio',
      route: '/cold-chain',
      tagline: 'Real-time IoT container sensors',
      icon: Thermometer,
      color: 'emerald',
      badge: isRerouted ? 'Secured' : 'Alert',
    },
    {
      title: 'Scenario Matrix',
      route: '/scenarios',
      tagline: 'Trade-off comparison & cost simulation',
      icon: GitFork,
      color: 'cyan',
      badge: '3 Plans',
    },
    {
      title: 'Tactical Maritime Map',
      route: '/map',
      tagline: '18 peninsular ports & AIS fleet',
      icon: Navigation,
      color: 'indigo',
      badge: '18 Hubs',
    },
    {
      title: 'Fleet & Cargo Manifest',
      route: '/shipments',
      tagline: '60 commercial priority consignments',
      icon: Ship,
      color: 'sky',
      badge: '60 Live',
    },
    {
      title: '72h Demurrage Simulator',
      route: '/simulation',
      tagline: 'Financial holding cost & spoilage',
      icon: Activity,
      color: 'purple',
      badge: 'Cascade',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Core KPIs Grid (Enterprise Clean Look) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.color === 'emerald' || kpi.color === 'cyan';
          const isWarning = kpi.color === 'amber';
          const isDanger = kpi.color === 'rose';

          return (
            <div
              key={idx}
              className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      isDanger
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : isWarning
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDanger
                          ? 'bg-rose-400 animate-pulse'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    {kpi.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                    {kpi.value}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isDanger
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : isPositive && kpi.color === 'emerald'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{kpi.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Disruption Hero Banner */}
      <DisruptionBanner
        disruption={primaryDisruption}
        onCompareScenarios={() => navigate('/scenarios')}
        onRunSimulation={onOpenSimulation}
        onOpenCopilot={onOpenCopilot}
      />


      {/* Priority Cold-Chain Sensor Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">
              Priority Cold-Chain Sensor Telemetry & IoT Excursion Monitor
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Reefer CONT-REEFER-9042
            </span>
          </div>
          <button
            onClick={() => navigate('/cold-chain')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline transition"
          >
            <span>Full Sensor Deep Dive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ColdChainMonitor
          shipment={heroShipment}
          onRerouteTrigger={onOpenApproval}
          isRerouted={isRerouted}
        />
      </div>

      {/* Operational Modules: Sleek, Compact Launchpad */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Operational Modules & Workspaces
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">6 Workspaces</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {workspaceModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(mod.route)}
                className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-150 cursor-pointer group flex items-center justify-between gap-3 shadow-sm hover:translate-y-[-1px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 group-hover:text-white group-hover:bg-indigo-600 transition shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition truncate">
                      {mod.title}
                    </h4>
                    <p className="text-[10.5px] text-slate-400 truncate mt-0.5">
                      {mod.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10">
                    {mod.badge}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
