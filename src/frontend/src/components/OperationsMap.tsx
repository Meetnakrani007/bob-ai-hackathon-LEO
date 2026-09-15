import React, { useState, useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  Anchor,
  Compass,
  Ship,
  Truck,
  AlertTriangle,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Navigation,
  Wind,
  Train,
  ArrowRight,
  ExternalLink,
  X,
  CheckCircle2,
  Radio,
  Eye,
  Activity,
  Thermometer,
  ShieldCheck,
  Clock,
  Waves,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { INDIA_PORTS, PortData, LIVE_VESSELS, VesselTraffic } from '../data/indiaPortsData';

interface OperationsMapProps {
  selectedPortId: string | null;
  onSelectPort: (portId: string) => void;
  onSelectHeroShipment: () => void;
  onOpenApproval?: () => void;
  isRerouted: boolean;
  className?: string;
  selectedVesselId?: string | null;
  onSelectVessel?: (vesselId: string) => void;
  approvedVesselIds?: string[];
  onApproveVessel?: (vesselId: string) => void;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  selectedPortId,
  onSelectPort,
  onSelectHeroShipment,
  onOpenApproval,
  isRerouted,
  className = '',
  selectedVesselId,
  onSelectVessel,
  approvedVesselIds,
  onApproveVessel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const layersGroupRef = useRef<{
    lanes?: L.LayerGroup;
    dfc?: L.LayerGroup;
    vessels?: L.LayerGroup;
  }>({});

  // Local approval state fallback
  const [localApprovedIds, setLocalApprovedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_approved_vessels');
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (isRerouted && !list.includes('VESSEL-001')) list.push('VESSEL-001');
      return list;
    } catch {
      return isRerouted ? ['VESSEL-001'] : [];
    }
  });

  const effectiveApprovedIds = approvedVesselIds || localApprovedIds;
  const [vesselToast, setVesselToast] = useState<string | null>(null);

  const handleApprove = (vesselId: string) => {
    if (onApproveVessel) {
      onApproveVessel(vesselId);
    } else {
      if (!localApprovedIds.includes(vesselId)) {
        const next = [...localApprovedIds, vesselId];
        setLocalApprovedIds(next);
        localStorage.setItem('sg_approved_vessels', JSON.stringify(next));
      }
    }
    const vessel = LIVE_VESSELS.find((v) => v.id === vesselId);
    setVesselToast(`✅ Contingency Plan for ${vessel?.name || 'Vessel'} Approved & Saved!`);
    setTimeout(() => setVesselToast(null), 3500);

    if (vessel?.isHeroVessel && onOpenApproval) {
      onOpenApproval();
    }
  };

  // Active state
  const [activePort, setActivePort] = useState<PortData | null>(
    INDIA_PORTS.find((p) => p.id === (selectedPortId || 'INBOM')) || INDIA_PORTS[0]
  );
  const [activeVessel, setActiveVessel] = useState<VesselTraffic | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [coastFilter, setCoastFilter] = useState<'all' | 'west' | 'east' | 'disrupted' | 'recommended'>('all');

  // Handle selectedVesselId flyTo
  useEffect(() => {
    if (selectedVesselId) {
      const v = LIVE_VESSELS.find((ves) => ves.id === selectedVesselId);
      if (v) {
        setActiveVessel(v);
        setActivePort(null);
        mapInstanceRef.current?.flyTo([v.lat, v.lng], 7, { duration: 1.2 });
      }
    }
  }, [selectedVesselId]);

  // Layer Toggles
  const [layers, setLayers] = useState({
    shippingLanes: true,
    dfcRail: true,
    vessels: true,
  });

  // Filtered Ports
  const filteredPorts = useMemo(() => {
    return INDIA_PORTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (coastFilter === 'west') return p.coast === 'west';
      if (coastFilter === 'east') return p.coast === 'east';
      if (coastFilter === 'disrupted') return p.status === 'disrupted';
      if (coastFilter === 'recommended') return p.status === 'recommended';
      return true;
    });
  }, [searchQuery, coastFilter]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map centered on Indian Subcontinent & Arabian Sea
    const map = L.map(mapContainerRef.current, {
      center: [18.5, 78.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Esri World Dark Gray Base (No API Key Required, Zero Watermarks, Clean Maritime Base)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    // Initialize layer groups
    layersGroupRef.current.lanes = L.layerGroup().addTo(map);
    layersGroupRef.current.dfc = L.layerGroup().addTo(map);
    layersGroupRef.current.vessels = L.layerGroup().addTo(map);

    // Render Polylines
    renderCorridors(map);

    // Invalidate size to ensure tiles render immediately without gray areas
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Shipping Lanes & DFC Corridor Polylines
  const renderCorridors = (map: L.Map) => {
    const lanesGroup = layersGroupRef.current.lanes;
    const dfcGroup = layersGroupRef.current.dfc;
    if (!lanesGroup || !dfcGroup) return;

    lanesGroup.clearLayers();
    dfcGroup.clearLayers();

    // 1. Primary International Maritime Shipping Lane (Singapore -> Malacca -> Colombo -> JNPT)
    const primaryLaneCoords: [number, number][] = [
      [1.3521, 103.8198], // Singapore
      [5.5, 95.3],        // Malacca Choke-point
      [5.9, 82.0],        // South Sri Lanka
      [6.95, 79.85],      // Colombo
      [9.9667, 76.2667],  // Cochin
      [15.4167, 73.8],    // Goa
      [18.95, 72.95],     // Nhava Sheva (JNPT)
    ];

    L.polyline(primaryLaneCoords, {
      color: '#10b981',
      weight: 3,
      opacity: 0.85,
      dashArray: '8, 8',
    })
      .bindTooltip('Primary Trans-Indian Ocean Freight Route (Active to JNPT)', {
        className: 'bg-slate-950 text-emerald-300 font-mono text-xs border border-emerald-500/40 px-2 py-1 rounded shadow-xl',
      })
      .addTo(lanesGroup);

    // 2. Disrupted Segment: Diversion Point to Mumbai Port (INBOM)
    const disruptedBranch: [number, number][] = [
      [17.5, 72.5],
      [18.9438, 72.8636], // Mumbai Port
    ];

    L.polyline(disruptedBranch, {
      color: '#f43f5e',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 6',
    })
      .bindTooltip('⛔ BLOCKED: Mumbai Port Approach (Strike Inoperative)', {
        className: 'bg-rose-950 text-rose-300 font-mono text-xs border border-rose-500/40 px-2 py-1 rounded shadow-xl',
      })
      .addTo(lanesGroup);

    // 3. Western Dedicated Freight Corridor (DFC Rail - JNPT to Dadri/NCR)
    const dfcRailCoords: [number, number][] = [
      [18.95, 72.95],   // JNPT Nhava Sheva
      [21.17, 72.83],   // Surat
      [22.3, 73.18],    // Vadodara
      [23.02, 72.57],   // Ahmedabad
      [24.17, 72.43],   // Palanpur
      [26.91, 75.78],   // Jaipur
      [28.18, 76.62],   // Rewari
      [28.55, 77.55],   // Dadri Multi-Modal Logistic Park (NCR)
    ];

    L.polyline(dfcRailCoords, {
      color: '#a855f7',
      weight: 3.5,
      opacity: 0.9,
      dashArray: '6, 6',
    })
      .bindTooltip('🚆 Western Dedicated Freight Corridor (DFC Double-Stack Rail)', {
        className: 'bg-purple-950 text-purple-300 font-mono text-xs border border-purple-500/40 px-2 py-1 rounded shadow-xl',
      })
      .addTo(dfcGroup);
  };

  // Synchronize Markers on Ports
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing port markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    filteredPorts.forEach((port) => {
      const isSelected = activePort?.id === port.id;
      const isDisrupted = port.status === 'disrupted';
      const isRecommended = port.status === 'recommended';

      // Custom HTML Marker Element
      let markerHtml = '';

      if (isDisrupted) {
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="marker-pulse-red"></div>
            <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-lg shadow-rose-600/50 relative z-10 transition-transform hover:scale-125">
              <span class="text-white text-xs font-black">!</span>
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/50 text-[10px] font-mono font-bold text-rose-200 pointer-events-none shadow-md">
              ${port.code} STRIKE
            </div>
          </div>
        `;
      } else if (isRecommended) {
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="marker-pulse-emerald"></div>
            <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/50 relative z-10 transition-transform hover:scale-125">
              <span class="text-slate-950 text-xs font-black">★</span>
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-200 pointer-events-none shadow-md">
              ${port.code} ${port.id === 'INNSA' ? 'PLAN A' : 'PLAN B'}
            </div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-5 h-5 rounded-full ${
              isSelected ? 'bg-cyan-400 border-2 border-white' : 'bg-slate-800/90 border border-cyan-500/50'
            } flex items-center justify-center shadow-md transition-transform hover:scale-125">
              <div class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-cyan-400'}"></div>
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.2 rounded bg-slate-900/80 border border-white/10 text-[9px] font-mono text-slate-300 pointer-events-none">
              ${port.code}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-port-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([port.lat, port.lng], { icon: customIcon }).addTo(map);

      // Interactive Popup Card
      const popupContent = `
        <div class="p-3.5 w-80 text-slate-100 font-sans">
          <div class="flex items-center justify-between gap-2 mb-2 pr-6">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider ${
                isDisrupted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : isRecommended
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }">
                ${port.code}
              </span>
              <span class="text-xs text-slate-400 font-medium">
                ${port.state}
              </span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
              isDisrupted ? 'bg-rose-600 text-white' : isRecommended ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border border-white/10'
            }">
              ${port.congestion}% Load
            </span>
          </div>

          <h3 class="font-bold text-base text-white mb-1 leading-snug">${port.shortName}</h3>

          <p class="text-xs text-slate-300 mb-3 leading-relaxed">${port.description}</p>

          <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs mb-3">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-semibold">Reefer Plugs</span>
              <span class="text-cyan-300 font-bold">${port.reeferAvailable} / ${port.reeferPlugs}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-semibold">Avg Dwell Time</span>
              <span class="text-white font-bold">${port.avgDwellHours} hrs</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-semibold">Active Berths</span>
              <span class="text-white font-bold">${port.berths} Deepwater</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-semibold">Sea Swell</span>
              <span class="text-amber-300 font-bold">${port.weather.swell}</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2 font-medium">
            <span>Lat: ${port.lat.toFixed(2)}°N</span>
            <span>Lng: ${port.lng.toFixed(2)}°E</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 360 });

      marker.on('click', () => {
        setActivePort(port);
        onSelectPort(port.id);
      });

      markersRef.current[port.id] = marker;
    });
  }, [filteredPorts]);

  // Synchronize Live Vessels
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vesselsGroup = layersGroupRef.current.vessels;
    if (!map || !vesselsGroup) return;

    vesselsGroup.clearLayers();

    if (!layers.vessels) return;

    LIVE_VESSELS.forEach((vessel) => {
      const isHero = vessel.isHeroVessel;
      const isApproved = effectiveApprovedIds.includes(vessel.id);

      const vesselHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-xl ${
            isApproved
              ? 'bg-emerald-600 border-2 border-emerald-300 shadow-lg shadow-emerald-500/50'
              : isHero
              ? 'bg-indigo-600 border-2 border-cyan-400 animate-pulse'
              : vessel.riskLevel === 'critical'
              ? 'bg-rose-700 border-2 border-rose-300 shadow-lg shadow-rose-600/40'
              : 'bg-slate-900 border border-white/20'
          } flex items-center justify-center shadow-lg transition-transform hover:scale-125">
            <span class="text-xs">${isApproved ? '🛡️' : isHero ? '🚢' : '⛵'}</span>
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.2 rounded ${
            isApproved
              ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 font-bold'
              : 'bg-slate-950/90 border border-white/10 text-cyan-300'
          } text-[9px] font-mono pointer-events-none shadow-md">
            ${isApproved ? 'SAVED • ' : ''}${vessel.name.split(' ')[1] || vessel.name}
          </div>
        </div>
      `;

      const vesselIcon = L.divIcon({
        html: vesselHtml,
        className: 'custom-vessel-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const vMarker = L.marker([vessel.lat, vessel.lng], { icon: vesselIcon }).addTo(vesselsGroup);

      const popupHtml = `
        <div class="p-3.5 w-72 text-slate-100 font-sans">
          <div class="flex items-center justify-between mb-1.5 pr-4">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ${vessel.callSign} • ${vessel.speedKnots} kts
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isApproved
                ? 'bg-emerald-600 text-white'
                : vessel.riskLevel === 'critical'
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-600/90 text-white'
            }">
              ${isApproved ? 'Protected' : vessel.riskLevel.toUpperCase() + ' RISK'}
            </span>
          </div>
          <h4 class="font-extrabold text-sm text-white leading-tight">${vessel.name}</h4>
          <p class="text-xs text-slate-300 mt-1">${vessel.cargo}</p>

          <div class="mt-2.5 p-2 rounded-lg bg-slate-900 border border-white/10 text-[11px] space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-400">Cargo Value:</span>
              <strong class="text-emerald-400 font-mono font-bold">${vessel.cargoValueUSD}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Destination:</span>
              <strong class="text-white">${vessel.destinationName}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">ETA:</span>
              <strong class="text-cyan-300 font-mono">${vessel.eta}</strong>
            </div>
          </div>

          <div class="mt-2 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[10.5px]">
            <span class="text-rose-300 font-bold block mb-0.5">Critical Condition:</span>
            <span class="text-slate-300">${vessel.uniqueFeature}</span>
          </div>

          <div class="mt-2 p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[10.5px]">
            <span class="text-cyan-300 font-bold block mb-0.5">Contingency Plan:</span>
            <span class="text-slate-300">${vessel.contingencyPlan}</span>
          </div>

          <div class="mt-2.5">
            ${
              isApproved
                ? `<div class="w-full py-1.5 px-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold text-center">
                    ✅ Contingency Plan Approved & Berth Reserved
                   </div>`
                : `<button id="popup-approve-${vessel.id}" class="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
                    ⚡ Approve & Save Plan (${vessel.cargoValueUSD})
                   </button>`
            }
          </div>
        </div>
      `;

      vMarker.bindPopup(popupHtml, { maxWidth: 320 });

      vMarker.on('popupopen', () => {
        const btn = document.getElementById(`popup-approve-${vessel.id}`);
        if (btn) {
          btn.onclick = () => {
            handleApprove(vessel.id);
            vMarker.closePopup();
          };
        }
      });

      vMarker.on('click', () => {
        setActiveVessel(vessel);
        setActivePort(null);
        if (onSelectVessel) onSelectVessel(vessel.id);
        if (isHero) onSelectHeroShipment();
      });
    });
  }, [layers.vessels, effectiveApprovedIds]);

  // Handle Layer Toggle Effects
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersGroupRef.current.lanes) {
      if (layers.shippingLanes) map.addLayer(layersGroupRef.current.lanes);
      else map.removeLayer(layersGroupRef.current.lanes);
    }

    if (layersGroupRef.current.dfc) {
      if (layers.dfcRail) map.addLayer(layersGroupRef.current.dfc);
      else map.removeLayer(layersGroupRef.current.dfc);
    }
  }, [layers]);

  // Actions
  const handleFlyToMumbaiHero = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([18.95, 72.90], 10, { duration: 1.5 });
    const jnpt = INDIA_PORTS.find((p) => p.id === 'INNSA');
    if (jnpt) {
      setActivePort(jnpt);
      onSelectPort('INNSA');
    }
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([18.5, 78.0], 5, { duration: 1.2 });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handlePortSelectCard = (port: PortData) => {
    setActivePort(port);
    onSelectPort(port.id);
    mapInstanceRef.current?.flyTo([port.lat, port.lng], 8, { duration: 1.2 });
    markersRef.current[port.id]?.openPopup();
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white/10 bg-[#050811] shadow-2xl flex flex-col ${className}`}>
      
      {/* Top Interactive Tactical HUD Bar */}
      <div className="relative z-10 p-3 sm:p-4 bg-slate-900/90 border-b border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search & Location Finder */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 18 Ports (e.g. JNPT, Mundra, Mumbai, Chennai)..."
              className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Focus Hero Incident Button */}
          <button
            onClick={handleFlyToMumbaiHero}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20 shrink-0"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden md:inline">Focus Incident</span>
            <span className="md:hidden">Strike</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All (18)' },
              { id: 'west', label: 'West Coast (9)' },
              { id: 'east', label: 'East Coast (7)' },
              { id: 'disrupted', label: '🚨 Disrupted (1)' },
              { id: 'recommended', label: '⭐ Recommended (2)' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCoastFilter(filter.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                coastFilter === filter.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setLayers((prev) => ({ ...prev, shippingLanes: !prev.shippingLanes }))}
            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border flex items-center gap-1 transition ${
              layers.shippingLanes
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950 text-slate-500 border-white/5 line-through'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden sm:inline">Lanes</span>
          </button>
          <button
            onClick={() => setLayers((prev) => ({ ...prev, dfcRail: !prev.dfcRail }))}
            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border flex items-center gap-1 transition ${
              layers.dfcRail
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-slate-950 text-slate-500 border-white/5 line-through'
            }`}
          >
            <Train className="w-3 h-3" />
            <span className="hidden sm:inline">DFC Rail</span>
          </button>
          <button
            onClick={() => setLayers((prev) => ({ ...prev, vessels: !prev.vessels }))}
            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border flex items-center gap-1 transition ${
              layers.vessels
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-950 text-slate-500 border-white/5 line-through'
            }`}
          >
            <Ship className="w-3 h-3" />
            <span className="hidden sm:inline">Vessels</span>
          </button>
        </div>
      </div>

      {/* Map Container Area */}
      <div className="relative flex-1 w-full min-h-[580px] lg:min-h-[640px]">
        {/* Leaflet Mount Element */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Floating Zoom & Orientation Controls (Top-Right) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-xl flex items-center justify-center transition backdrop-blur-md"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-xl flex items-center justify-center transition backdrop-blur-md"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Reset All-India View"
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-white/20 shadow-xl flex items-center justify-center transition backdrop-blur-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Legend Overlay (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-xl shadow-2xl text-[10.5px] max-w-xs hidden sm:block">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10 font-bold text-slate-200">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIS Maritime Intelligence Grid</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-slate-300">Mumbai Port (CRITICAL STRIKE)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Nhava Sheva JNPT (Plan A Alternative)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400" />
              <span className="text-slate-400">Deepwater International Shipping Lanes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-purple-400" />
              <span className="text-slate-400">Western Dedicated Freight Rail Corridor</span>
            </div>
          </div>
        </div>

        {/* Selected Port Detailed Inspector HUD Card (Bottom-Right) */}
        {activePort && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 z-10 sm:w-96 p-4 rounded-2xl bg-slate-950/95 border border-white/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {activePort.code}
                  </span>
                  <span className="text-xs text-slate-400">{activePort.state}</span>
                </div>
                <h3 className="text-sm font-extrabold text-white mt-1">{activePort.name}</h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  activePort.status === 'disrupted'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : activePort.status === 'recommended'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {activePort.statusLabel}
                </span>
                <button
                  onClick={() => setActivePort(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  aria-label="Close port card"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
              {activePort.description}
            </p>

            {/* Micro Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-center mb-3">
              <div>
                <span className="text-[9.5px] text-slate-400 block">Congestion</span>
                <span className={`font-sans text-xs font-bold ${
                  activePort.congestion > 75 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {activePort.congestion}%
                </span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-400 block">Reefer Plugs</span>
                <span className="font-sans text-xs font-bold text-cyan-300">
                  {activePort.reeferAvailable} Avail
                </span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-400 block">Avg Dwell</span>
                <span className="font-sans text-xs font-bold text-white">
                  {activePort.avgDwellHours} hrs
                </span>
              </div>
            </div>

            {/* Hinterland & Roadway */}
            <div className="text-[10.5px] text-slate-400 space-y-1 mb-3">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{activePort.expressway}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Waves className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Swell: {activePort.weather.swell} • Wind: {activePort.weather.wind}</span>
              </div>
            </div>

            {/* Action CTA */}
            {activePort.id === 'INNSA' && !isRerouted && onOpenApproval && (
              <button
                onClick={onOpenApproval}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/25"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize Diversion to {activePort.shortName}</span>
              </button>
            )}
          </div>
        )}

        {/* Selected Vessel Detailed Inspector HUD Card (Bottom-Right) */}
        {activeVessel && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 z-10 sm:w-96 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] animate-fade-in">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {activeVessel.callSign}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                    {activeVessel.type}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white mt-1">{activeVessel.name}</h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  effectiveApprovedIds.includes(activeVessel.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : activeVessel.riskLevel === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {effectiveApprovedIds.includes(activeVessel.id) ? '✅ Plan Saved' : `${activeVessel.riskLevel.toUpperCase()} RISK`}
                </span>
                <button
                  onClick={() => setActiveVessel(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  aria-label="Close vessel card"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cargo Manifest & Value */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 mb-2.5">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-medium">Declared Cargo:</span>
                <span className="font-mono font-extrabold text-emerald-400">{activeVessel.cargoValueUSD}</span>
              </div>
              <p className="text-xs font-semibold text-white leading-snug">{activeVessel.cargo}</p>
            </div>

            {/* Unique Risk Factor Box */}
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 mb-2">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wide block mb-0.5">
                Critical Condition / Unique Factor:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{activeVessel.uniqueFeature}</p>
            </div>

            {/* Recommended Contingency Plan Box */}
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 mb-2.5">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wide block mb-0.5">
                Recommended Contingency Action:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{activeVessel.contingencyPlan}</p>
            </div>

            {/* Telemetry Footer */}
            <div className="flex items-center justify-between text-[10.5px] text-slate-400 mb-3 pt-1 border-t border-white/10 font-mono">
              <span>{activeVessel.speedKnots} kts • Hdg {activeVessel.headingDeg}°</span>
              <span>ETA: {activeVessel.eta}</span>
              <span>Dest: {activeVessel.destinationId}</span>
            </div>

            {/* Interactive Approve & Save Button */}
            {effectiveApprovedIds.includes(activeVessel.id) ? (
              <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mitigation Approved • Berth & Rake Secured</span>
              </div>
            ) : (
              <button
                onClick={() => handleApprove(activeVessel.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve & Save Plan ({activeVessel.cargoValueUSD})</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Vessel Toast Alert */}
        {vesselToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 font-bold text-xs shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{vesselToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
