import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScenarioComparator, ThreatScenarioGroup } from '../components/ScenarioComparator';

interface ScenariosPageProps {
  onOpenApproval: () => void;
  isRerouted: boolean;
  resolvedThreatIds?: string[];
  onResolveThreat?: (threatId: string, planId?: string) => void;
  onReviveThreat?: (threatId: string) => void;
  chosenPlans?: Record<string, string>;
  onSetChosenPlan?: (threatId: string, planId: string) => void;
}

export const ScenariosPage: React.FC<ScenariosPageProps> = ({
  onOpenApproval,
  isRerouted,
  resolvedThreatIds = [],
  onResolveThreat,
  onReviveThreat,
  chosenPlans = { 'DIS-2026-BOM-001': 'PLAN-A', 'DIS-2026-RED-002': 'PLAN-A' },
  onSetChosenPlan,
}) => {
  const isMissionResolved = (id: string) => {
    return resolvedThreatIds.includes(id);
  };

  // 2 Distinct Threat Scenarios Data
  const THREAT_GROUPS: ThreatScenarioGroup[] = [
    {
      threatId: 'DIS-2026-BOM-001',
      threatTitle: 'Mumbai Port Unannounced Dockworkers & Crane Operators Strike',
      portCode: 'INBOM',
      severityLabel: 'Critical Level 5',
      exposureUsd: '$14,500,000 USD',
      isResolved: isMissionResolved('DIS-2026-BOM-001'),
      plans: [
        {
          id: 'PLAN-A',
          title: 'Plan A: Nhava Sheva Diversion + Atal Setu Reefer Shuttle',
          tag: 'AI Recommended',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          destination: 'Nhava Sheva (JNPT) Port',
          transport: 'Sea Diversion -> Atal Setu MTHL Road Bypass',
          costDelta: '+$1,450 USD',
          timeDelta: '+4.5 Hours',
          postRiskScore: 18,
          riskLevel: 'Low Risk',
          statusSummary: 'Preserved (2°C - 8°C)',
          feasibility: '96%',
          pros: [
            'Dedicated reefer truck (TRK-REEFER-01) 8km away at JNPT hub',
            'Direct berth clearance available at Terminal 2',
            'Pre-deadline arrival beats 36h insulin threshold with 31h to spare',
          ],
          cons: ['Minor toll tariff via Atal Setu bridge corridor'],
          isRecommended: true,
        },
        {
          id: 'PLAN-B',
          title: 'Plan B: Mundra Deepwater Reroute + Western DFC Rail',
          tag: 'Alternative Viable',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          destination: 'Mundra Port (Adani)',
          transport: 'Sea Deviation -> Western DFC Fast Rail',
          costDelta: '+$2,850 USD',
          timeDelta: '+26.0 Hours',
          postRiskScore: 34,
          riskLevel: 'Medium Risk',
          statusSummary: 'Preserved with high genset strain',
          feasibility: '84%',
          pros: [
            'Zero labor union disputes in Gujarat zone (28% congestion)',
            'Direct automated rail link to North/West distribution centers',
          ],
          cons: [
            '26h delay consumes 72% of safe cold-chain buffer',
            'Higher transit tariff for coastal deviation',
          ],
          isRecommended: false,
        },
        {
          id: 'PLAN-C',
          title: 'Plan C: Hold Anchorage at Mumbai Port Outer Roads',
          tag: 'Status Quo / High Risk',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          destination: 'Port of Mumbai (INBOM)',
          transport: 'Stationary Moored Anchor',
          costDelta: '+$8,500+ USD',
          timeDelta: '+72.0 Hours',
          postRiskScore: 96,
          riskLevel: 'Catastrophic Risk',
          statusSummary: 'SPOILAGE FAILURE PREDICTED (<4.5h)',
          feasibility: '12%',
          pros: ['No vessel course alteration coordination required'],
          cons: [
            'Total spoilage loss of $1,250,000 USD vaccines predicted',
            'Demurrage penalty accrual of $35,000 USD/day',
            'Deadlines breached across healthcare network',
          ],
          isRecommended: false,
        },
      ],
      comparisonParameters: [
        {
          param: 'Port Diversion Distance',
          planA: '8 km (Across harbor via MTHL)',
          planB: '310 nautical miles (North Gujarat)',
          planC: '0 km (Idling in outer roads)',
        },
        {
          param: 'Reefer Plug Capacity Available',
          planA: '1,450 Plugs (High availability)',
          planB: '820 Plugs (Moderate availability)',
          planC: '0 Plugs (Off-berth offshore anchorage)',
        },
        {
          param: 'Dedicated Fleet Mobilization',
          planA: 'TRK-REEFER-01 Dispatched immediately',
          planB: 'Rail freight booking required (12h wait)',
          planC: 'None (Passive delay and queuing)',
        },
        {
          param: 'Cold-Chain Spoilage Risk',
          planA: '0% (Safe arrival in 4.5 hours)',
          planB: '15% (72% thermal buffer consumed)',
          planC: '100% ($1,250,000 USD Total Loss)',
        },
        {
          param: 'Post-Action Risk Score',
          planA: '18 / 100 (Low Risk - Safe)',
          planB: '34 / 100 (Moderate Risk)',
          planC: '96 / 100 (Severe / Catastrophic)',
        },
      ],
    },
    {
      threatId: 'DIS-2026-RED-002',
      threatTitle: 'Southern Red Sea Maritime Security Advisory (Bab-el-Mandeb)',
      portCode: 'AEJEA',
      severityLabel: 'High Threat Level 4',
      exposureUsd: '$85,000,000 USD',
      isResolved: isMissionResolved('DIS-2026-RED-002'),
      plans: [
        {
          id: 'PLAN-A',
          title: 'Plan A: Cape of Good Hope Oceanic Bypass & Colombo Hub',
          tag: 'AI Recommended',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          destination: 'Port of Colombo (LKCMB) / Cape Bypass',
          transport: 'Trans-South Africa Oceanic Bypass + Colombo Feeder Trunk',
          costDelta: 'Save $3,850,000 USD (War Risk Avoided)',
          timeDelta: '+11.0 Days',
          postRiskScore: 16,
          riskLevel: 'Low Risk',
          statusSummary: '100% Hazard Avoided',
          feasibility: '94%',
          pros: [
            'Zero probability of drone/missile interception or vessel seizure',
            'Saves up to $3.85M USD in war-risk insurance surcharges',
            'Secures priority transshipment and bunkering at Colombo CICT',
          ],
          cons: [
            'Voyage extended by 11 to 14 days around South Africa',
            'Additional marine heavy fuel oil (Bunker C) consumption',
          ],
          isRecommended: true,
        },
        {
          id: 'PLAN-B',
          title: 'Plan B: Jebel Ali Sea-Air Intermodal Bridge',
          tag: 'Alternative Fast-Track',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          destination: 'Jebel Ali Port (AEJEA) + Air Cargo Hub',
          transport: 'Arabian Sea Discharge -> Emirates SkyCargo Air Bridge',
          costDelta: '+$1,450,000 USD (Air Premium)',
          timeDelta: '+2.0 Days (Fastest)',
          postRiskScore: 28,
          riskLevel: 'Moderate Risk',
          statusSummary: 'Rapid Delivery Secured',
          feasibility: '82%',
          pros: [
            'Arrives at European destinations within 48 hours of offload',
            'Completely circumvents both Red Sea and Cape of Good Hope',
            'High reliability for critical high-value pharmaceutical cargo',
          ],
          cons: [
            'High air-freight surcharge per TEU compared to ocean routing',
            'Requires bonded customs transit clearance in UAE',
          ],
          isRecommended: false,
        },
        {
          id: 'PLAN-C',
          title: 'Plan C: Wait for Multinational Naval Escort Convoy',
          tag: 'High Risk / Status Quo',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          destination: 'Bab-el-Mandeb Transit Corridor',
          transport: 'Queue in Gulf of Aden for Armed Naval Escort',
          costDelta: '+$650,000 USD (War Insurance)',
          timeDelta: '+6.0 Days (Convoy Queue)',
          postRiskScore: 78,
          riskLevel: 'High Risk',
          statusSummary: 'SECURITY THREAT ACTIVE',
          feasibility: '29%',
          pros: ['Maintains shortest geographic nautical route through Suez'],
          cons: [
            '45% risk of projectile or drone harassment during transit',
            'Incurs mandatory war-risk insurance premiums of $45k/day',
            'Unscheduled convoy delays often extend beyond 7-10 days',
          ],
          isRecommended: false,
        },
      ],
      comparisonParameters: [
        {
          param: 'Corridor Security Interception Risk',
          planA: '0% (100% bypassed via South Africa)',
          planB: '0% (Discharged in Gulf of Oman prior to strait)',
          planC: '45% (High armed drone/missile threat)',
        },
        {
          param: 'War-Risk Insurance Impact',
          planA: 'Save $3,850,000 USD (Underwriter waived)',
          planB: 'Standard cargo tariff ($0 war premium)',
          planC: '+$650,000 USD mandatory war surcharge',
        },
        {
          param: 'Intermediate Bunkering Hub Allocation',
          planA: 'Colombo CICT & Durban (Confirmed slots)',
          planB: 'Jebel Ali DP World (Direct berth)',
          planC: 'Djibouti Anchorage (Severe congestion)',
        },
        {
          param: 'Total Delivery Timeline Impact',
          planA: '+11.0 Days (Oceanic slow steam)',
          planB: '+2.0 Days (Intermodal air-bridge)',
          planC: '+6.0 to +10.0 Days (Escort staging queue)',
        },
        {
          param: 'Post-Action Risk Score',
          planA: '16 / 100 (Low Risk - Safe)',
          planB: '28 / 100 (Low-Moderate Risk)',
          planC: '78 / 100 (High Risk)',
        },
      ],
    },
  ];

  const [searchParams] = useSearchParams();
  const queryThreat = searchParams.get('threat');

  const [selectedThreatId, setSelectedThreatId] = useState<string>(() => {
    try {
      const target = queryThreat || localStorage.getItem('sg_selected_threat');
      if (target && THREAT_GROUPS.some((g) => g.threatId === target)) {
        return target;
      }
      return THREAT_GROUPS[0].threatId;
    } catch {
      return THREAT_GROUPS[0].threatId;
    }
  });

  useEffect(() => {
    const target = queryThreat || localStorage.getItem('sg_selected_threat');
    if (target && THREAT_GROUPS.some((g) => g.threatId === target) && target !== selectedThreatId) {
      setSelectedThreatId(target);
      localStorage.setItem('sg_selected_threat', target);
    }
  }, [queryThreat]);
  const currentGroup =
    THREAT_GROUPS.find((g) => g.threatId === selectedThreatId) || THREAT_GROUPS[0];

  const handleSelectThreat = (threatId: string) => {
    setSelectedThreatId(threatId);
    localStorage.setItem('sg_selected_threat', threatId);
  };

  const handleSetChosenPlan = (threatId: string, planId: string) => {
    if (onSetChosenPlan) {
      onSetChosenPlan(threatId, planId);
    }
    if (onResolveThreat) {
      onResolveThreat(threatId, planId);
    }
    if (threatId === 'DIS-2026-BOM-001' && planId === 'PLAN-A' && onOpenApproval) {
      onOpenApproval();
    }
  };

  const handleRevive = (threatId: string) => {
    if (onReviveThreat) {
      onReviveThreat(threatId);
    }
    setSelectedThreatId(threatId);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Autonomous Tradeoff Scenario Matrix */}
      <ScenarioComparator
        threatGroups={THREAT_GROUPS}
        selectedThreatId={selectedThreatId}
        onSelectThreatId={handleSelectThreat}
        onSetChosenPlan={handleSetChosenPlan}
        onReviveThreat={handleRevive}
        chosenPlans={chosenPlans}
      />
    </div>
  );
};
