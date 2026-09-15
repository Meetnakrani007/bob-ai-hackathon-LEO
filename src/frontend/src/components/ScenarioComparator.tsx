import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertOctagon,
  ArrowRight,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  Star,
  Compass,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export interface ThreatScenarioGroup {
  threatId: string;
  threatTitle: string;
  portCode: string;
  severityLabel: string;
  exposureUsd: string;
  isResolved: boolean;
  plans: Array<{
    id: string;
    title: string;
    tag: string;
    badgeColor: string;
    destination: string;
    transport: string;
    costDelta: string;
    timeDelta: string;
    postRiskScore: number;
    riskLevel: string;
    statusSummary: string;
    feasibility: string;
    pros: string[];
    cons: string[];
    isRecommended: boolean;
  }>;
  comparisonParameters?: Array<{
    param: string;
    planA: string;
    planB: string;
    planC: string;
  }>;
}

interface ScenarioComparatorProps {
  threatGroups: ThreatScenarioGroup[];
  selectedThreatId: string;
  onSelectThreatId: (threatId: string) => void;
  onSetChosenPlan: (threatId: string, planId: string) => void;
  onReviveThreat: (threatId: string) => void;
  chosenPlans: Record<string, string>;
}

export const ScenarioComparator: React.FC<ScenarioComparatorProps> = ({
  threatGroups,
  selectedThreatId,
  onSelectThreatId,
  onSetChosenPlan,
  onReviveThreat,
  chosenPlans,
}) => {
  const currentGroup =
    threatGroups.find((g) => g.threatId === selectedThreatId) || threatGroups[0];

  const currentChosenPlanId = chosenPlans[currentGroup.threatId] || currentGroup.plans[0].id;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentChosenPlanId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync selected plan when threat changes
  const handleThreatChange = (tId: string) => {
    onSelectThreatId(tId);
    const g = threatGroups.find((t) => t.threatId === tId);
    if (g) {
      const activeForGroup = chosenPlans[tId] || g.plans[0].id;
      setSelectedPlanId(activeForGroup);
    }
  };

  const handleActivatePlan = (planId: string) => {
    setSelectedPlanId(planId);
    onSetChosenPlan(currentGroup.threatId, planId);
    const plan = currentGroup.plans.find((p) => p.id === planId);
    setToastMessage(`✅ Successfully activated ${plan?.title || planId} as the chosen operational route!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReviveAction = (threatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onReviveThreat(threatId);
    setToastMessage(`🔄 Threat retrieved and returned to Active status! You can now choose Plan A, B, or C.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedPlan =
    currentGroup.plans.find((p) => p.id === selectedPlanId) || currentGroup.plans[0];

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 shadow-2xl space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs font-bold shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-xl sm:text-2xl text-white tracking-tight">
                Autonomous Tradeoff Scenario Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select a threat corridor below to inspect alternative plans and designate your preferred operational resolution
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-mono">
            {threatGroups.length} Corridors Monitored
          </span>
        </div>
      </div>

      {/* Corridor Selection Cards (Dual Clean Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {threatGroups.map((group) => {
          const isCurrent = group.threatId === currentGroup.threatId;
          const activePlanForThis = chosenPlans[group.threatId] || group.plans[0].id;

          return (
            <div
              key={group.threatId}
              onClick={() => handleThreatChange(group.threatId)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 ${
                isCurrent
                  ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-indigo-500/80 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/60'
                  : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-white/15">
                      {group.portCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        group.isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {group.isResolved ? `Resolved (${activePlanForThis})` : group.severityLabel}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-black text-rose-400">
                    {group.exposureUsd}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white leading-snug">
                  {group.threatTitle}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="text-slate-400 font-medium">
                  {group.plans.length} Candidate Plans Modeled
                </span>

                {group.isResolved ? (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Plan {activePlanForThis}
                    </span>
                    <button
                      onClick={(e) => handleReviveAction(group.threatId, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-white/10 font-bold text-[11px] flex items-center gap-1 transition"
                      title="Revive threat into active state"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Revive</span>
                    </button>
                  </div>
                ) : (
                  <span className={`font-bold flex items-center gap-1 ${isCurrent ? 'text-cyan-300' : 'text-slate-500'}`}>
                    <span>{isCurrent ? 'Viewing Plans' : 'Inspect Plans'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Corridor Notice Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
        <div className="flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            Currently inspecting corridor <strong className="text-white">{currentGroup.portCode}</strong> — {currentGroup.threatTitle}
          </span>
        </div>

        {currentGroup.isResolved ? (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              Corridor Mitigated via {currentChosenPlanId}
            </span>
            <button
              onClick={(e) => handleReviveAction(currentGroup.threatId, e)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retrieve / Revive</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-amber-400 font-semibold">
            Choose any operational plan below to switch active routing
          </span>
        )}
      </div>

      {/* 3 Scenario Plan Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {currentGroup.plans.map((p) => {
          const isSelected = selectedPlanId === p.id;
          const isCurrentActivePlan = currentGroup.isResolved && currentChosenPlanId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isCurrentActivePlan
                  ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-950/50'
                  : isSelected
                  ? 'border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-950/50'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/20 hover:bg-slate-900/50'
              }`}
            >
              {/* Header & Title */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${p.badgeColor}`}>
                      {p.tag}
                    </span>
                    {isCurrentActivePlan && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono text-slate-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5">
                    Feasibility: <strong className="text-cyan-300">{p.feasibility}</strong>
                  </span>
                </div>

                <h3 className="font-extrabold text-base sm:text-lg text-white mb-2 leading-snug">
                  {p.title}
                </h3>

                {/* Routing info - unclipped, readable */}
                <div className="text-xs text-slate-300 flex items-start gap-2 mb-4 leading-relaxed p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
                  <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Routing Corridor</span>
                    <span className="font-medium text-slate-200">{p.transport}</span>
                  </div>
                </div>

                {/* Key Metrics Section - Spacious & Unclipped */}
                <div className="space-y-2 mb-5">
                  {/* Two Stats Columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Cost Impact
                      </span>
                      <span className="font-black text-sm font-mono text-white block">
                        {p.costDelta}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Transit Delta
                      </span>
                      <span className="font-black text-sm font-mono text-cyan-300 block">
                        {p.timeDelta}
                      </span>
                    </div>
                  </div>

                  {/* Risk & Cargo Status Full Strip */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Post-Action Risk
                      </span>
                      <span
                        className={`font-black font-mono text-sm ${
                          p.postRiskScore < 30
                            ? 'text-emerald-400'
                            : p.postRiskScore < 55
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {p.postRiskScore} / 100
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 font-medium">({p.riskLevel})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Cargo Status
                      </span>
                      <span
                        className={`font-extrabold text-xs px-2 py-0.5 rounded-md inline-block border ${
                          p.statusSummary.toLowerCase().includes('preserved') ||
                          p.statusSummary.toLowerCase().includes('safe') ||
                          p.statusSummary.toLowerCase().includes('avoided') ||
                          p.statusSummary.toLowerCase().includes('secured')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {p.statusSummary}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Advantages (Pros) */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Advantages
                  </span>
                  <div className="space-y-2">
                    {p.pros.map((pro, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tradeoff Considerations (Cons) */}
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tradeoff Considerations
                  </span>
                  <div className="space-y-2">
                    {p.cons.map((con, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-rose-200/90">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Set as Active Plan directly */}
              <div className="pt-4 border-t border-white/10">
                {isCurrentActivePlan ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-xs flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Active Executed Plan</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivatePlan(p.id);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>Set as Active Plan & Execute</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Inspection & Deployment Bar (Generously Padded, Cleared from Quick Copilot) */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mr-0 sm:mr-36">
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Selected for Inspection:</span>
            <span className="text-cyan-300 font-mono font-bold">{selectedPlan.id} — {selectedPlan.title}</span>
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {currentGroup.isResolved
              ? `Currently executed on ${currentChosenPlanId}. Click "Set as Active Plan & Execute" on any alternative to switch operational routing.`
              : `Click "Set as Active Plan & Execute" on your chosen plan card above to switch and deploy.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
          {currentGroup.isResolved ? (
            <button
              onClick={(e) => handleReviveAction(currentGroup.threatId, e)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retrieve / Revive Threat</span>
            </button>
          ) : (
            <button
              onClick={() => handleActivatePlan(selectedPlanId)}
              className="btn-primary text-xs w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 font-black shadow-lg shadow-indigo-500/30 cursor-pointer"
            >
              <span>Authorize & Execute {selectedPlan.id}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
