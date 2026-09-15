import React, { useState } from 'react';
import {
  Package,
  Truck,
  Thermometer,
  AlertTriangle,
  Search,
  CheckCircle2,
  ExternalLink,
  Filter,
  X,
  ShieldAlert,
  DollarSign,
  Navigation,
  ArrowRight,
  Zap,
  RotateCcw,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ShipmentsGridProps {
  shipments: any[];
  fleet: any[];
  onSelectShipment: (s: any) => void;
  isRerouted: boolean;
  mitigatedShipments?: Record<string, any>;
  onMitigateShipment?: (shipmentId: string, solution: any) => void;
  onResetShipment?: (shipmentId: string) => void;
}

export const ShipmentsGrid: React.FC<ShipmentsGridProps> = ({
  shipments,
  fleet,
  onSelectShipment,
  isRerouted,
  mitigatedShipments = {},
  onMitigateShipment,
  onResetShipment,
}) => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'fleet'>('shipments');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'reefer' | 'high_risk'>('all');
  const [selectedDetailShipment, setSelectedDetailShipment] = useState<any | null>(null);
  const [solvingShipment, setSolvingShipment] = useState<any | null>(null);
  const [selectedSolutionPlanId, setSelectedSolutionPlanId] = useState<string>('PLAN-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getEffectiveShipment = (s: any) => {
    const mit = mitigatedShipments[s.shipment_id];
    if (mit) {
      return {
        ...s,
        risk_score: mit.risk_score,
        status: mit.status,
        applied_solution: mit.applied_solution,
      };
    }
    if (s.shipment_id === 'SHP-PHARMA-1001' && isRerouted) {
      return { ...s, risk_score: 18, status: 'rerouted' };
    }
    return s;
  };

  const effectiveShipmentList = shipments.map(getEffectiveShipment);

  const filteredShipments = effectiveShipmentList.filter((s) => {
    const matchesSearch =
      s.shipment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.container_id?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'reefer') return s.requires_refrigeration;
    if (filterMode === 'high_risk') return s.risk_score >= 70 && s.status !== 'mitigated' && s.status !== 'rerouted';
    return true;
  });

  const highRiskCount = effectiveShipmentList.filter(
    (s) => s.risk_score >= 70 && s.status !== 'mitigated' && s.status !== 'rerouted'
  ).length;

  // 3 Concrete Solution Plan Options per shipment
  const getSolutionPlans = (shipment: any) => [
    {
      id: 'PLAN-1',
      title: 'Plan 1: Priority Quay Offload & Reefer Fast-Track Corridor',
      desc: 'Divert container to Nhava Sheva (JNPT) Terminal 2 with pre-cleared green customs corridor and dedicated reefer truck dispatch.',
      recalculatedRisk: 16,
      riskDropPts: shipment ? Math.max(1, shipment.risk_score - 16) : 80,
      feasibility: '96% Feasible',
      costDelta: '+$850 USD',
      transitDelta: '+2.5 Hours',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      tag: 'Optimal Fast-Track',
    },
    {
      id: 'PLAN-2',
      title: 'Plan 2: Western DFC Intermodal Dedicated Freight Rail',
      desc: 'Offload container onto double-stack electrified rail wagon at JNPT rail head bypassing highway toll corridors directly to destination.',
      recalculatedRisk: 28,
      riskDropPts: shipment ? Math.max(1, shipment.risk_score - 28) : 68,
      feasibility: '89% Feasible',
      costDelta: '+$1,450 USD',
      transitDelta: '+12.0 Hours',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      tag: 'High Reliability Rail',
    },
    {
      id: 'PLAN-3',
      title: 'Plan 3: Emergency Quay Shore-Power & Mobile Genset Battery Swap',
      desc: 'Connect auxiliary mobile lithium-diesel power pack on-quay to guarantee cold-chain temperature buffer without rerouting vessel.',
      recalculatedRisk: 12,
      riskDropPts: shipment ? Math.max(1, shipment.risk_score - 12) : 84,
      feasibility: '98% Feasible',
      costDelta: '+$450 USD',
      transitDelta: '+45 Minutes',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
      tag: 'Immediate Shore Power',
    },
  ];

  const handleApplySolution = (shipment: any, planId: string) => {
    const plans = getSolutionPlans(shipment);
    const chosenPlan = plans.find((p) => p.id === planId) || plans[0];

    if (onMitigateShipment) {
      onMitigateShipment(shipment.shipment_id, {
        risk_score: chosenPlan.recalculatedRisk,
        status: 'mitigated',
        applied_solution: chosenPlan.title,
      });
    }

    if (shipment.shipment_id === 'SHP-PHARMA-1001' && onSelectShipment) {
      onSelectShipment(shipment);
    }

    setToastMessage(
      `✅ Applied ${chosenPlan.title}! Risk recalculated from ${shipment.risk_score}/100 down to ${chosenPlan.recalculatedRisk}/100.`
    );
    setTimeout(() => setToastMessage(null), 4000);
    setSolvingShipment(null);
    setSelectedDetailShipment(null);
  };

  const handleAutoMitigateAll = () => {
    const atRiskShipments = effectiveShipmentList.filter(
      (s) => s.risk_score >= 70 && s.status !== 'mitigated' && s.status !== 'rerouted'
    );
    atRiskShipments.forEach((s) => {
      if (onMitigateShipment) {
        onMitigateShipment(s.shipment_id, {
          risk_score: 16,
          status: 'mitigated',
          applied_solution: 'Plan 1: Priority Quay Offload & Reefer Fast-Track Corridor',
        });
      }
    });

    setToastMessage(`⚡ Bulk Mitigation Complete! Recalculated and secured all ${atRiskShipments.length} at-risk consignments.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl mb-6 shadow-xl">
      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Tab Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'shipments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Active Shipments ({effectiveShipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'fleet'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Available Fleet ({fleet.length})</span>
          </button>
        </div>

        {/* Search, Filter pills, and Bulk Auto-Mitigate */}
        {activeTab === 'shipments' && (
          <div className="flex flex-wrap items-center gap-2">
            {highRiskCount > 0 && (
              <button
                onClick={handleAutoMitigateAll}
                className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-md shadow-rose-600/25"
                title="Automatically deploy mitigation plans across all at-risk shipments"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Resolve All ({highRiskCount})</span>
              </button>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shipment / container..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 font-sans"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('reefer')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                  filterMode === 'reefer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Thermometer className="w-3 h-3" />
                <span>Cold-Chain</span>
              </button>
              <button
                onClick={() => setFilterMode('high_risk')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                  filterMode === 'high_risk' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Risk ≥70 ({highRiskCount})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shipments Table View */}
      {activeTab === 'shipments' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Shipment / Cargo</th>
                <th className="py-3 px-3">Origin → Destination</th>
                <th className="py-3 px-3">Type / Value</th>
                <th className="py-3 px-3">Risk Index</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredShipments.map((s) => {
                const isHero = s.shipment_id === 'SHP-PHARMA-1001';
                const currentStatus = s.status;
                const currentRisk = s.risk_score;
                const isAtRisk = currentRisk >= 70 && currentStatus !== 'mitigated' && currentStatus !== 'rerouted';
                const isMitigated = currentStatus === 'mitigated' || currentStatus === 'rerouted';

                return (
                  <tr
                    key={s.shipment_id}
                    className={`hover:bg-slate-800/40 transition ${
                      isHero ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {s.requires_refrigeration ? (
                          <div
                            className="p-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            title="Refrigerated Pharma Cargo"
                          >
                            <Thermometer className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded bg-slate-800 text-slate-400">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{s.title}</span>
                            {isHero && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                                Hero Cargo
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mono">
                            {s.shipment_id} • {s.container_id}
                            {s.applied_solution && (
                              <span className="text-emerald-400 ml-1 font-semibold">
                                • {s.applied_solution.split(':')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">
                        {s.origin_port_id} &rarr; {isHero && isRerouted ? 'INNSA' : s.destination_port_id}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {isHero && isRerouted
                          ? 'Nhava Sheva (JNPT) Diversion Yard'
                          : s.destination_name || s.destination_port_id}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200 capitalize">
                        {s.cargo_type}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold">
                        ${s.value_usd?.toLocaleString()} USD
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs ${
                            currentRisk >= 75
                              ? 'text-rose-400'
                              : currentRisk >= 40
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {currentRisk}/100
                        </span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${currentRisk}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              currentRisk >= 75
                                ? 'bg-rose-500'
                                : currentRisk >= 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isAtRisk
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : isMitigated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isMitigated ? 'MITIGATED' : currentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAtRisk ? (
                          <button
                            onClick={() => {
                              setSolvingShipment(s);
                              setSelectedSolutionPlanId('PLAN-1');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 flex items-center gap-1 transition"
                            title="View and apply resolution plan options to decrease risk"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Solve Risk</span>
                          </button>
                        ) : isMitigated ? (
                          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                            Secured
                          </span>
                        ) : null}

                        <button
                          onClick={() => setSelectedDetailShipment(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Fleet View */}
      {activeTab === 'fleet' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Asset ID & Name</th>
                <th className="py-3 px-3">Asset Type</th>
                <th className="py-3 px-3">Operating Carrier</th>
                <th className="py-3 px-3">Current Location</th>
                <th className="py-3 px-3">Refrigeration Capability</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Cost Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {fleet.map((f) => (
                <tr key={f.asset_id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{f.name}</span>
                  </td>
                  <td className="py-3 px-3 capitalize">{f.type}</td>
                  <td className="py-3 px-3">{f.carrier}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{f.current_location_port}</div>
                    <div className="text-[10px] text-slate-500">
                      ETA: {f.eta_hours ? `${f.eta_hours} hrs` : 'Immediate Quay'}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {f.reefer_equipped ? (
                      <span className="text-cyan-300 font-semibold flex items-center gap-1 text-[11px]">
                        <Thermometer className="w-3.5 h-3.5" />
                        Reefer Ready ({f.current_temp || 4.0}°C)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium text-[11px]">
                        Standard Dry
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-300">
                    ${f.hourly_cost_usd}/hr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DEDICATED RISK RESOLUTION MODAL (Plan Type Options & Recalculation) */}
      {solvingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSolvingShipment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    Risk Reduction Studio
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Current Risk: <strong className="text-rose-400 font-bold">{solvingShipment.risk_score}/100</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {solvingShipment.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Container: <strong className="text-slate-200 font-mono">{solvingShipment.container_id}</strong> • Value: <strong className="text-emerald-400 font-mono">${solvingShipment.value_usd?.toLocaleString()} USD</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Select one of the autonomous operational mitigation plans below to resolve exposure, bypass bottlenecks, and dynamically recalculate risk score:
            </p>

            {/* 3 Mitigation Plan Options */}
            <div className="space-y-3 mb-5">
              {getSolutionPlans(solvingShipment).map((plan) => {
                const isSelected = selectedSolutionPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedSolutionPlanId(plan.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500/80 ring-2 ring-indigo-500/40 shadow-lg'
                        : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                          {plan.tag}
                        </span>
                        <h4 className="font-bold text-xs text-white">{plan.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-400">
                        {plan.costDelta}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {plan.desc}
                    </p>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recalculated Risk</span>
                        <span className="font-black text-emerald-400 font-mono text-xs">
                          {plan.recalculatedRisk}/100 (-{plan.riskDropPts} pts)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transit Impact</span>
                        <span className="font-bold text-white font-mono text-xs">
                          {plan.transitDelta}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Feasibility</span>
                        <span className="font-bold text-cyan-300 font-mono text-xs">
                          {plan.feasibility}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setSolvingShipment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApplySolution(solvingShipment, selectedSolutionPlanId)}
                className="btn-primary text-xs py-2.5 px-5 font-black flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Apply Solution & Recalculate Risk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Details Telemetry Modal */}
      {selectedDetailShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDetailShipment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {selectedDetailShipment.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Container ID: <span className="text-slate-200 font-mono">{selectedDetailShipment.container_id}</span> • {selectedDetailShipment.shipment_id}
                </p>
              </div>
            </div>

            {/* Status & Risk Badges */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Operational Risk Score
                </span>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xl font-bold ${
                      selectedDetailShipment.risk_score >= 70
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedDetailShipment.risk_score}/100
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedDetailShipment.risk_score >= 70
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {selectedDetailShipment.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Declared Value
                </span>
                <span className="text-xl font-bold text-white">
                  ${selectedDetailShipment.value_usd?.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Routing Spec */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Origin Port:</span>
                <span className="font-semibold text-white">{selectedDetailShipment.origin_port_id} (Singapore Terminals)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Destination:</span>
                <span className="font-semibold text-white">
                  {selectedDetailShipment.destination_name || selectedDetailShipment.destination_port_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cargo Classification:</span>
                <span className="font-semibold text-cyan-300 capitalize">{selectedDetailShipment.cargo_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cold-Chain Guard:</span>
                <span className={`font-semibold ${
                  selectedDetailShipment.requires_refrigeration ? 'text-cyan-400' : 'text-slate-400'
                }`}>
                  {selectedDetailShipment.requires_refrigeration ? 'Active Reefer (Target 2°C – 8°C)' : 'Ambient Cargo'}
                </span>
              </div>
              {selectedDetailShipment.applied_solution && (
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-slate-400">Applied Mitigation:</span>
                  <span className="font-bold text-emerald-300">{selectedDetailShipment.applied_solution}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {selectedDetailShipment.applied_solution && onResetShipment ? (
                <button
                  onClick={() => {
                    onResetShipment(selectedDetailShipment.shipment_id);
                    setSelectedDetailShipment(null);
                    setToastMessage(`Reset mitigation for ${selectedDetailShipment.shipment_id}.`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Risk</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDetailShipment(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Close Details
                </button>

                {selectedDetailShipment.risk_score >= 70 && (
                  <button
                    onClick={() => {
                      const s = selectedDetailShipment;
                      setSelectedDetailShipment(null);
                      setSolvingShipment(s);
                      setSelectedSolutionPlanId('PLAN-1');
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Mitigate & Reduce Risk</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
