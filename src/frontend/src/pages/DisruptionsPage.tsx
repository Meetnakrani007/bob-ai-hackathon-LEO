import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldCheck,
  Radio,
  Anchor,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Check,
  CheckCircle,
  ExternalLink,
  GitFork,
  Sparkles,
  Package,
  Thermometer,
  Zap,
} from 'lucide-react';

interface DisruptionsPageProps {
  disruptions: any[];
  shipments?: any[];
  onOpenApproval: () => void;
  onOpenSimulation: () => void;
  isRerouted: boolean;
  resolvedThreatIds?: string[];
  onResolveThreat?: (threatId: string) => void;
  onReviveThreat?: (threatId: string) => void;
}

export const DisruptionsPage: React.FC<DisruptionsPageProps> = ({
  disruptions,
  shipments = [],
  onOpenApproval,
  onOpenSimulation,
  isRerouted,
  resolvedThreatIds = [],
  onResolveThreat,
  onReviveThreat,
}) => {
  const navigate = useNavigate();

  // 2 Distinct Threat Missions with dedicated solving plans in Scenario Matrix
  const THREAT_MISSIONS = [
    {
      disruption_id: 'DIS-2026-BOM-001',
      port_id: 'INBOM',
      port_name: 'Port of Mumbai (INBOM)',
      severity: 'critical',
      severity_label: 'Critical Threat Level 5',
      type: 'port_strike',
      title: 'Mumbai Port Unannounced Dockworkers & Crane Operators Strike',
      description:
        'Sudden wildcat strike called by the Mumbai Port Labor Federation over crane automation and overtime disputes. All berths 1 through 10 are non-operational. Over 18 container vessels currently queued in outer anchorage with tug operations suspended.',
      confidence_score: 94,
      verification_status: 'verified',
      impact_usd: '$14,500,000 USD',
      queued_vessels: 18,
      affected_label: 'Affected Terminal Berths (10 Berths Halted)',
      affected_items: [
        'Berth 1', 'Berth 2', 'Berth 3', 'Berth 4', 'Berth 5',
        'Berth 6', 'Berth 7', 'Berth 8', 'Berth 9', 'Berth 10'
      ],
      evidence_sources: [
        {
          source: 'Mumbai Port Authority Emergency Bulletin',
          date: '2026-09-14 04:30 UTC',
          excerpt: 'Notice #BOM-2026-04: All container cargo offloading suspended indefinitely pending union negotiations.',
        },
        {
          source: 'Reuters Maritime News Wire',
          date: '2026-09-14 05:15 UTC',
          excerpt: 'Strike at India’s key western terminal threatens cold chain pharmaceutical exports and automotive parts.',
        },
        {
          source: 'AIS Satellite Telemetry Cross-Validation',
          date: '2026-09-14 06:00 UTC',
          excerpt: '14 containerships confirmed stationary at anchorage coordinates 18.92°N, 72.83°E with speed < 0.2 knots.',
        },
      ],
      solution_summary: {
        plansCount: 3,
        recommendedPlan: 'Plan A: Nhava Sheva (JNPT) Diversion + Atal Setu Reefer Shuttle',
        net_savings: '$1,248,550 USD',
        transit_delta: '+4.5 Hours',
      },
    },
    {
      disruption_id: 'DIS-2026-RED-002',
      port_id: 'AEJEA',
      port_name: 'Bab-el-Mandeb Strait / Red Sea Approach (AEJEA Corridor)',
      severity: 'high',
      severity_label: 'High Threat Level 4',
      type: 'geopolitical_chokepoint',
      title: 'Southern Red Sea Maritime Security Advisory (Bab-el-Mandeb)',
      description:
        'Heightened security threat in Bab-el-Mandeb Strait prompting commercial container liners to avoid the Suez Canal and reroute around the Cape of Good Hope, adding 10-14 days to Europe-Asia voyages and triggering war-risk insurance premiums.',
      confidence_score: 98,
      verification_status: 'verified',
      impact_usd: '$85,000,000 USD',
      queued_vessels: 36,
      affected_label: 'Affected Maritime Corridor & Transit Sectors',
      affected_items: [
        'Bab-el-Mandeb Choke-Point', 'Red Sea Inbound Sea-Lane', 'Gulf of Aden Transit Corridor',
        'Suez Northbound Passage', 'Mandeb West Shoal', 'Hanish Islands Sector'
      ],
      evidence_sources: [
        {
          source: 'UKMTO Maritime Trade Operations Advisory',
          date: '2026-09-14 02:15 UTC',
          excerpt: 'Advisory Notice #UKMTO-2026-11: Commercial vessels urged to exercise extreme caution or reroute via Cape of Good Hope.',
        },
        {
          source: 'Lloyd’s List Intelligence Global Bulletin',
          date: '2026-09-14 03:45 UTC',
          excerpt: 'Major shipping alliances (Maersk, MSC, CMA CGM) activate oceanic diversion protocol away from Bab-el-Mandeb.',
        },
        {
          source: 'Satellite AIS Telemetry Tracking',
          date: '2026-09-14 05:00 UTC',
          excerpt: '36 container vessels confirmed executing 180° turnarounds in the Gulf of Aden toward South Africa route.',
        },
      ],
      solution_summary: {
        plansCount: 3,
        recommendedPlan: 'Plan A: Cape of Good Hope Oceanic Bypass & Colombo Transshipment Hub',
        net_savings: '$3,850,000 USD',
        transit_delta: '+11.0 Days',
      },
    },
  ];

  // Tab View: 'active' or 'resolved'
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(THREAT_MISSIONS[0].disruption_id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isMissionResolved = (id: string) => {
    return resolvedThreatIds.includes(id);
  };

  const activeMissions = THREAT_MISSIONS.filter((m) => !isMissionResolved(m.disruption_id));
  const resolvedMissions = THREAT_MISSIONS.filter((m) => isMissionResolved(m.disruption_id));

  // Determine current active mission
  const currentMission =
    THREAT_MISSIONS.find((m) => m.disruption_id === selectedMissionId) ||
    (activeTab === 'active' ? activeMissions[0] : resolvedMissions[0]) ||
    THREAT_MISSIONS[0];

  const isCurrentResolved = isMissionResolved(currentMission.disruption_id);

  // Dynamic shipment reflection from Live Manifest Registry
  const missionShipments = (shipments || []).filter((s) => {
    if (currentMission.port_id === 'INBOM') {
      return s.origin_port_id === 'INBOM' || s.destination_port_id === 'INBOM';
    }
    if (currentMission.port_id === 'AEJEA') {
      return (
        s.origin_port_id === 'AEJEA' ||
        s.destination_port_id === 'AEJEA' ||
        (s.current_route_id && (s.current_route_id.includes('RED') || s.current_route_id.includes('JEA')))
      );
    }
    return s.origin_port_id === currentMission.port_id || s.destination_port_id === currentMission.port_id;
  });

  const missionCargoValue = missionShipments.reduce((acc, s) => acc + (s.value_usd || 0), 0);
  const missionAtRiskCount = missionShipments.filter(
    (s) => s.risk_score >= 70 && s.status !== 'mitigated' && s.status !== 'rerouted'
  ).length;
  const missionDeliveredCount = missionShipments.filter((s) => s.status === 'delivered').length;
  const missionInTransitCount = missionShipments.filter(
    (s) => s.status === 'in_transit' || s.status === 'rerouted' || s.status === 'mitigated'
  ).length;

  const handleGoToScenarioMatrix = (threatId: string) => {
    localStorage.setItem('sg_selected_threat', threatId);
    navigate(`/scenarios?threat=${threatId}`);
  };

  const handleRevive = (mission: typeof THREAT_MISSIONS[0]) => {
    if (onReviveThreat) {
      onReviveThreat(mission.disruption_id);
    }
    setSelectedMissionId(mission.disruption_id);
    setActiveTab('active');
    setToastMessage(`🔄 Threat "${mission.title}" revived and returned to Active Missions.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Threat Missions Navigation & View Tabs */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="font-black text-lg text-white tracking-tight">
                Autonomous Threat Missions Center
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Pre-computed operational mitigation plans to isolate, reroute, and resolve maritime threats
            </p>
          </div>

          {/* Clean Top Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950/80 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveTab('active');
                if (activeMissions.length > 0 && !activeMissions.some((m) => m.disruption_id === selectedMissionId)) {
                  setSelectedMissionId(activeMissions[0].disruption_id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition ${
                activeTab === 'active'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Active Threats ({activeMissions.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('resolved');
                if (resolvedMissions.length > 0 && !resolvedMissions.some((m) => m.disruption_id === selectedMissionId)) {
                  setSelectedMissionId(resolvedMissions[0].disruption_id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition ${
                activeTab === 'resolved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Resolved Archive ({resolvedMissions.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: ACTIVE THREATS ONLY */}
        {activeTab === 'active' && (
          <div>
            {activeMissions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">All Maritime Threats Successfully Mitigated</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
                  Zero critical disruption events pending action. Rerouting interventions executed and cargo is safely secured.
                </p>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
                >
                  View Resolved Archive ({resolvedMissions.length})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMissions.map((mission) => {
                  const isSelected = currentMission.disruption_id === mission.disruption_id;

                  return (
                    <div
                      key={mission.disruption_id}
                      onClick={() => setSelectedMissionId(mission.disruption_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500/50'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                              mission.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {mission.severity_label}
                          </span>
                          <span className="text-xs font-mono font-black text-rose-400">
                            {mission.impact_usd}
                          </span>
                        </div>

                        {/* Readable Full Title without mid-word cutoffs */}
                        <h3 className="font-bold text-sm text-white leading-snug">
                          {mission.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          {mission.port_name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                        <span className="text-slate-400">
                          Corroborated <strong className="text-emerald-400 font-mono">{mission.confidence_score}%</strong> ({mission.evidence_sources.length} sources)
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToScenarioMatrix(mission.disruption_id);
                          }}
                          className="text-cyan-300 hover:text-white font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 transition cursor-pointer group shadow-sm active:scale-95"
                          title={`Open Scenario Matrix for ${mission.port_name}`}
                        >
                          <span>Inspect Problem Matrix</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: RESOLVED ARCHIVE */}
        {activeTab === 'resolved' && (
          <div>
            {resolvedMissions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-white/10">
                <AlertTriangle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No resolved threats yet. Active threats are listed in the Active tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedMissions.map((mission) => {
                  const isSelected = currentMission.disruption_id === mission.disruption_id;

                  return (
                    <div
                      key={mission.disruption_id}
                      onClick={() => setSelectedMissionId(mission.disruption_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                          : 'bg-slate-900/50 border-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Threat Resolved & Mitigated
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            Secured
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white leading-snug">
                          {mission.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {mission.port_name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                        <span className="text-slate-400">
                          Savings: <strong className="text-emerald-300 font-mono">{mission.solution_summary.net_savings}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoToScenarioMatrix(mission.disruption_id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs transition"
                          >
                            Problem Matrix
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevive(mission);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 font-bold flex items-center gap-1.5 transition"
                            title="Restore threat to active list for re-simulation"
                          >
                            <RotateCcw className="w-3 h-3 text-cyan-400" />
                            <span>Revive</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Threat Overview Banner */}
      <div
        className={`glass-panel p-6 rounded-2xl border transition-all duration-300 ${
          isCurrentResolved
            ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-950'
            : 'border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-950'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                  isCurrentResolved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {isCurrentResolved ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isCurrentResolved ? 'Threat Mitigated & Closed' : currentMission.severity_label}
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Corroborated {currentMission.confidence_score}% Confidence
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Cargo Exposure: <strong className="text-rose-400">${(missionCargoValue > 0 ? missionCargoValue / 1e6 : 14.5).toFixed(1)}M USD</strong> • {missionShipments.length} Tracked Consignments ({missionAtRiskCount} At-Risk, {missionDeliveredCount} Completed)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {currentMission.title}
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {currentMission.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSimulation}
              className="btn-outline text-xs py-2 px-4 whitespace-nowrap"
            >
              Run 72h Financial Cascade
            </button>

            {isCurrentResolved ? (
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Mitigation Active & Signed</span>
                </div>
                <button
                  onClick={() => handleGoToScenarioMatrix(currentMission.disruption_id)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>View Problem Matrix</span>
                </button>
                <button
                  onClick={() => handleRevive(currentMission)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Revive</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleGoToScenarioMatrix(currentMission.disruption_id)}
                className="btn-danger text-xs py-2.5 px-4 font-extrabold flex items-center gap-2 shadow-lg shadow-rose-500/25 cursor-pointer whitespace-nowrap"
              >
                <span>Authorize in Scenario Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clean Incident Intelligence & Launchpad Grid (Direct to Problem Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scenario Problem Matrix Launchpad & Multi-Source Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Autonomous Problem Matrix Direct Launch Card */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-slate-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-cyan-300 border border-cyan-500/30">
                    <GitFork className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-base text-white">
                    Autonomous Problem Matrix Ready for {currentMission.port_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Trade-off modeling has computed 3 candidate plans (Plan A, Plan B, Plan C) to resolve this incident. Compare net financial savings ({currentMission.solution_summary.net_savings}), transit deltas, and risk reduction before execution.
                </p>
              </div>

              <button
                onClick={() => handleGoToScenarioMatrix(currentMission.disruption_id)}
                className="btn-primary text-xs py-2.5 px-5 font-black flex items-center gap-2 shadow-lg shadow-indigo-500/30 shrink-0 self-start sm:self-auto"
              >
                <span>Open Problem Matrix & Choose Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Evidence Feed */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <h3 className="font-black text-sm text-white flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              Multi-Source Incident Corroboration Feed
            </h3>

            <div className="space-y-3">
              {currentMission.evidence_sources.map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
                    <span className="font-bold text-cyan-300">{ev.source}</span>
                    <span className="font-mono text-[10px]">{ev.date}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic text-[11px]">
                    "{ev.excerpt}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Affected Infrastructure & Berth Status */}
        <div className="space-y-5">
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <h3 className="font-black text-sm text-white flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <Anchor className="w-4 h-4 text-cyan-400" />
              {currentMission.affected_label}
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {currentMission.affected_items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-200">{item}</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Affected Cargo Consignments Manifest Section */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white">
                Live Affected Cargo Manifest ({missionShipments.length} Correlated Consignments)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Active and delivered shipments mapped to {currentMission.port_name} transit corridor
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
              {missionAtRiskCount} At Risk
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              {missionInTransitCount} In Transit
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {missionDeliveredCount} Completed
            </span>
            <button
              onClick={() => navigate('/shipments')}
              className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1 transition"
            >
              <span>View All in Registry</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {missionShipments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No specific container consignments currently mapped to this transit node.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                <tr>
                  <th className="pb-2.5 px-2">Shipment / Cargo</th>
                  <th className="pb-2.5 px-2">Corridor</th>
                  <th className="pb-2.5 px-2">Container</th>
                  <th className="pb-2.5 px-2">Cargo Value</th>
                  <th className="pb-2.5 px-2">Risk Index</th>
                  <th className="pb-2.5 px-2">Status</th>
                  <th className="pb-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {missionShipments.slice(0, 10).map((s) => {
                  const isHero = s.shipment_id === 'SHP-PHARMA-1001';
                  const isAtRisk = s.risk_score >= 70 && s.status !== 'mitigated' && s.status !== 'rerouted';
                  const isDelivered = s.status === 'delivered';

                  return (
                    <tr
                      key={s.shipment_id}
                      className={`hover:bg-slate-800/40 transition ${
                        isHero ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          {s.requires_refrigeration ? (
                            <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              <Thermometer className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="p-1 rounded bg-slate-800 text-slate-400">
                              <Package className="w-3 h-3" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{s.title}</span>
                              {isHero && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                                  Hero Load
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {s.shipment_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 font-mono text-[11px] text-white">
                        {s.origin_port_id} &rarr; {s.destination_port_id}
                      </td>

                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-400">
                        {s.container_id}
                      </td>

                      <td className="py-2.5 px-2 font-bold text-emerald-400">
                        ${s.value_usd?.toLocaleString()} USD
                      </td>

                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold text-xs ${
                              s.risk_score >= 75
                                ? 'text-rose-400'
                                : s.risk_score >= 40
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {s.risk_score}/100
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${
                            isAtRisk
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : isDelivered
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {isDelivered && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {s.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-2 text-right">
                        {isAtRisk ? (
                          <button
                            onClick={() => {
                              if (isHero && onOpenApproval) {
                                onOpenApproval();
                              } else {
                                handleGoToScenarioMatrix(currentMission.disruption_id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 ml-auto shadow-sm"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Solve Risk</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 font-bold text-xs shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
