import React, { useState } from 'react';
import {
  Navigation,
  Anchor,
  Ship,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Maximize2,
  Filter,
  Train,
  Wind,
  Thermometer,
  ShieldCheck,
  Compass,
  Radio,
  ExternalLink,
  Package,
} from 'lucide-react';
import { OperationsMap } from '../components/OperationsMap';
import { INDIA_PORTS, PortData, LIVE_VESSELS, VesselTraffic } from '../data/indiaPortsData';

interface MapPageProps {
  shipments?: any[];
  isRerouted: boolean;
  onOpenApproval: () => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  shipments = [],
  isRerouted,
  onOpenApproval,
}) => {
  const [selectedPortId, setSelectedPortId] = useState<string | null>('INBOM');
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vessels' | 'ports' | 'cargo'>('vessels');

  const [approvedVesselIds, setApprovedVesselIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_approved_vessels');
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (isRerouted && !list.includes('VESSEL-001')) list.push('VESSEL-001');
      return list;
    } catch {
      return isRerouted ? ['VESSEL-001'] : [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApproveVessel = (vesselId: string) => {
    if (!approvedVesselIds.includes(vesselId)) {
      const next = [...approvedVesselIds, vesselId];
      setApprovedVesselIds(next);
      localStorage.setItem('sg_approved_vessels', JSON.stringify(next));
    }
    const vessel = LIVE_VESSELS.find((v) => v.id === vesselId);
    setToastMessage(`✅ Contingency Plan for ${vessel?.name || 'Vessel'} Approved! Reroute & Priority Berth Secured.`);
    setTimeout(() => setToastMessage(null), 3500);

    if (vesselId === 'VESSEL-001' && onOpenApproval) {
      onOpenApproval();
    }
  };

  const handleLocateVessel = (vesselId: string) => {
    setSelectedVesselId(vesselId);
    setSelectedPortId(null);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Tactical Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                Live All-India Maritime & Inland AIS Matrix
              </span>
              <span className="text-xs text-slate-400">
                Theater: Arabian Sea, Bay of Bengal & Western/Eastern DFC Rail
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Tactical Peninsular Ports & Ocean Fleet Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Full-scale interactive geography across 18 major Indian maritime hubs, transshipment routes, and {LIVE_VESSELS.length} active ocean vessels with unique cargo profiles and one-click contingency approvals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenApproval}
              className={`text-xs py-2.5 px-5 font-bold rounded-xl transition shadow-lg flex items-center gap-2 ${
                isRerouted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                  : 'btn-danger'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isRerouted ? '✅ Diversion Routing Active' : 'Authorize Port Diversion'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map (Full India, Zoom/Pan, Vessel & Port Click Pop-Up Card) */}
      <OperationsMap
        selectedPortId={selectedPortId}
        onSelectPort={(id) => {
          setSelectedPortId(id);
          setSelectedVesselId(null);
        }}
        onSelectHeroShipment={onOpenApproval}
        onOpenApproval={onOpenApproval}
        isRerouted={isRerouted}
        selectedVesselId={selectedVesselId}
        onSelectVessel={(id) => {
          setSelectedVesselId(id);
          setSelectedPortId(null);
        }}
        approvedVesselIds={approvedVesselIds}
        onApproveVessel={handleApproveVessel}
      />

      {/* Interactive Operational Directory: Toggle between Ocean Fleet & Port Matrix */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={() => setActiveTab('vessels')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                  activeTab === 'vessels'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Ship className="w-3.5 h-3.5 text-cyan-300" />
                <span>Ocean Fleet & Contingency Matrix ({LIVE_VESSELS.length} Vessels)</span>
              </button>

              <button
                onClick={() => setActiveTab('ports')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                  activeTab === 'ports'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Anchor className="w-3.5 h-3.5 text-indigo-300" />
                <span>Port Infrastructure Matrix ({INDIA_PORTS.length} Ports)</span>
              </button>

              <button
                onClick={() => setActiveTab('cargo')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                  activeTab === 'cargo'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-300" />
                <span>Port Cargo Manifest ({shipments.length} Loads)</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {activeTab === 'vessels'
                ? 'Review unique cargo, special conditions, and approve contingency rerouting plans across Indian Ocean waters'
                : activeTab === 'ports'
                ? 'Live capacity metrics, port cargo volume, cold-chain reefer availability, and sailing distances'
                : 'Correlated cargo containers docked or in transit to Indian peninsular maritime hubs'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              {approvedVesselIds.length}/{LIVE_VESSELS.length} Vessels Protected
            </span>
          </div>
        </div>

        {/* Tab 1: Live Ocean Fleet Matrix */}
        {activeTab === 'vessels' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Vessel & Call Sign</th>
                  <th className="pb-3 px-3">Cargo & Value</th>
                  <th className="pb-3 px-3">Destination & ETA</th>
                  <th className="pb-3 px-3">Unique Critical Factor</th>
                  <th className="pb-3 px-3">Recommended Contingency Action</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Approve & Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {LIVE_VESSELS.map((vessel) => {
                  const isApproved = approvedVesselIds.includes(vessel.id);
                  const isSelected = selectedVesselId === vessel.id;

                  return (
                    <tr
                      key={vessel.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-500/15' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                            {vessel.callSign}
                          </span>
                          <div>
                            <div className="font-bold text-white text-xs">{vessel.name}</div>
                            <div className="text-[10px] text-slate-400">{vessel.type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 min-w-[180px]">
                        <div className="font-semibold text-emerald-400 font-mono text-xs">{vessel.cargoValueUSD}</div>
                        <div className="text-[11px] text-slate-300 truncate max-w-[170px]">{vessel.cargo}</div>
                      </td>

                      <td className="py-3.5 px-3 min-w-[160px]">
                        <div className="font-semibold text-white text-xs">{vessel.destinationName}</div>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          ETA: {vessel.eta} • {vessel.speedKnots} kts
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[220px]">
                        <span className="text-xs text-rose-300 font-medium block leading-snug">
                          {vessel.uniqueFeature}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[220px]">
                        <span className="text-xs text-cyan-200 font-medium block leading-snug">
                          {vessel.contingencyPlan}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[130px]">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : vessel.riskLevel === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isApproved ? '✅ Protected' : `${vessel.riskLevel.toUpperCase()} RISK`}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[170px] text-right space-x-1.5">
                        {isApproved ? (
                          <button
                            onClick={() => handleLocateVessel(vessel.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 transition"
                          >
                            Locate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveVessel(vessel.id)}
                            className="px-3 py-1 rounded-lg text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-md transition"
                          >
                            Approve Plan
                          </button>
                        )}

                        <button
                          onClick={() => handleLocateVessel(vessel.id)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition"
                          title="Center ship on map"
                        >
                          Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Commercial Port Infrastructure Matrix */}
        {activeTab === 'ports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Port & Code</th>
                  <th className="pb-3 px-3">Coast / State</th>
                  <th className="pb-3 px-3">Operational Status</th>
                  <th className="pb-3 px-3">Berths / TEU</th>
                  <th className="pb-3 px-3">Port Cargo Manifest</th>
                  <th className="pb-3 px-3">Reefer Plugs</th>
                  <th className="pb-3 px-3">Congestion / Dwell</th>
                  <th className="pb-3 px-3">Dist. from Mumbai</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {INDIA_PORTS.map((port) => {
                  const isSelected = selectedPortId === port.id;
                  const portShipments = shipments.filter(
                    (s) => s.origin_port_id === port.id || s.destination_port_id === port.id
                  );
                  const portCargoVal = portShipments.reduce((acc, s) => acc + (s.value_usd || 0), 0);
                  const portAtRisk = portShipments.filter(
                    (s) => s.risk_score >= 70 && s.status !== 'mitigated' && s.status !== 'rerouted'
                  ).length;
                  const portDelivered = portShipments.filter((s) => s.status === 'delivered').length;

                  return (
                    <tr
                      key={port.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                            {port.code}
                          </span>
                          <div>
                            <div className="font-bold text-white text-xs">{port.shortName}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{port.name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 min-w-[120px] text-slate-300">
                        <div className="font-medium text-xs text-white">{port.state}</div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                          {port.coast} coast
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[170px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            port.status === 'disrupted'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : port.status === 'recommended'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}
                        >
                          {port.statusLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[140px] text-xs font-semibold text-slate-200">
                        <div>{port.berths} Deep Berths</div>
                        <span className="text-[10px] text-slate-400">{port.capacityTEU} TEU</span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[160px]">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{portShipments.length} Consignments</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          ${(portCargoVal / 1e6).toFixed(1)}M USD
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {portAtRisk > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              {portAtRisk} At Risk
                            </span>
                          )}
                          {portDelivered > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              {portDelivered} Delivered
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 min-w-[140px]">
                        <span className="text-xs font-bold text-emerald-400">
                          {port.reeferAvailable}
                        </span>
                        <span className="text-[10px] text-slate-400"> / {port.reeferPlugs} plugs</span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[150px]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                port.congestion > 70
                                  ? 'bg-rose-500'
                                  : port.congestion > 45
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${port.congestion}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white">{port.congestion}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {port.avgDwellHours}h avg dwell
                        </span>
                      </td>

                      <td className="py-3.5 px-3 min-w-[160px] text-xs text-slate-300">
                        {port.distanceFromMumbaiNM === 0 ? (
                          <span className="text-rose-400 font-bold">0 NM (Disrupted epicenter)</span>
                        ) : (
                          <div>
                            <span className="font-bold text-white">{port.distanceFromMumbaiNM} NM</span>{' '}
                            <span className="text-slate-400">({port.transitTimeHours}h transit)</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 min-w-[120px] text-right">
                        <button
                          onClick={() => {
                            setSelectedPortId(port.id);
                            setSelectedVesselId(null);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Inspecting' : 'Locate on Map'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: All-Port Cargo Inventory Breakdown */}
        {activeTab === 'cargo' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">Shipment / Cargo</th>
                    <th className="pb-3 px-3">Origin & Destination</th>
                    <th className="pb-3 px-3">Container ID</th>
                    <th className="pb-3 px-3">Cargo Value</th>
                    <th className="pb-3 px-3">Risk Score</th>
                    <th className="pb-3 px-3">Manifest Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shipments.map((s) => {
                    const isDelivered = s.status === 'delivered';
                    const isAtRisk = s.risk_score >= 70 && !isDelivered;

                    return (
                      <tr key={s.shipment_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs">{s.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{s.shipment_id}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                          {s.origin_port_id} &rarr; {s.destination_port_id}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                          {s.container_id}
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          ${s.value_usd?.toLocaleString()} USD
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold ${
                              s.risk_score >= 70
                                ? 'text-rose-400'
                                : s.risk_score >= 40
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {s.risk_score}/100
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isAtRisk
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : isDelivered
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Floating Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 font-bold text-xs shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
