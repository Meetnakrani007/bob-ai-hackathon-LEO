import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  BatteryCharging,
  Zap,
  TrendingUp,
  Truck,
  ArrowRight,
  Sparkles,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Send,
  CheckCircle2,
  Radio,
  X,
  Flame,
  Activity,
  Navigation,
  Check,
  MapPin,
} from 'lucide-react';

interface FleetCandidate {
  id: string;
  name: string;
  model: string;
  carrier: string;
  distanceKm: number;
  etaMins: number;
  coreTemp: number; // Resulting container temperature with this asset
  bufferHours: number; // Remaining buffer window
  gensetFuelPct: number; // Genset fuel %
  tempSubtitle: string;
  bufferSubtitle: string;
  fuelSubtitle: string;
  city: string;
  driverName: string;
  driverContact: string;
  rank: number;
  status: 'recommended' | 'standby' | 'warning' | 'breached';
}

const CANDIDATE_FLEET: FleetCandidate[] = [
  {
    id: 'TRK-REEFER-01',
    name: 'ThermoKing Arctic Express #01',
    model: 'Volvo FM 420 Reefer (Active GenSet)',
    carrier: 'Blue Dart Cold Chain Express',
    distanceKm: 8.2,
    etaMins: 12,
    coreTemp: 4.0,
    bufferHours: 12.5,
    gensetFuelPct: 94,
    tempSubtitle: 'Optimal thermal equilibrium (12m ETA via MTHL)',
    bufferSubtitle: 'Safe operating corridor (+0.32°C/hr buffer)',
    fuelSubtitle: 'Full operational auxiliary fuel (60h range)',
    city: 'Nhava Sheva Logistic Park (JNPT Gate 3)',
    driverName: 'Suresh R.',
    driverContact: '+91 98201 44521',
    rank: 1,
    status: 'recommended',
  },
  {
    id: 'TRK-REEFER-02',
    name: 'ThermoKing Arctic Express #02',
    model: 'Tata Prima 2830.K Reefer',
    carrier: 'Blue Dart Cold Chain Express',
    distanceKm: 14.5,
    etaMins: 18,
    coreTemp: 4.85,
    bufferHours: 9.8,
    gensetFuelPct: 86,
    tempSubtitle: 'Normal thermal equilibrium (18m ETA)',
    bufferSubtitle: 'Stable container climate (JNPT CFS Area)',
    fuelSubtitle: 'Auxiliary power active (48h range)',
    city: 'JNPT CFS Area (Uran Corridor)',
    driverName: 'Vikram Patil',
    driverContact: '+91 98202 88412',
    rank: 2,
    status: 'standby',
  },
  {
    id: 'TRK-REEFER-04',
    name: 'ThermoKing ColdMaster #04',
    model: 'BharatBenz 2823R Deep Freeze',
    carrier: 'Blue Dart Cold Chain Express',
    distanceKm: 32.0,
    etaMins: 35,
    coreTemp: 7.45,
    bufferHours: 1.7,
    gensetFuelPct: 52,
    tempSubtitle: '⚠️ Approaching thermal degradation limit (35m ETA)',
    bufferSubtitle: 'Narrow buffer window (< 2h to excursion)',
    fuelSubtitle: 'Moderate auxiliary fuel reserve (12h range)',
    city: 'Thane Warehousing Hub (Eastern Express)',
    driverName: 'Manoj Shinde',
    driverContact: '+91 98205 11983',
    rank: 3,
    status: 'warning',
  },
  {
    id: 'TRK-REEFER-03',
    name: 'Carrier Transicold SuperHauler #03',
    model: 'Scania G410 Heavy Reefer',
    carrier: 'VRL Logistics Express Fleet',
    distanceKm: 128.0,
    etaMins: 110,
    coreTemp: 9.25, // Critical: breaches 8.00°C limit!
    bufferHours: 0.0,
    gensetFuelPct: 14,
    tempSubtitle: '🚨 EXCURSION THRESHOLD BREACHED (110m ETA - Too far!)',
    bufferSubtitle: 'Protective thermal buffer completely exhausted',
    fuelSubtitle: 'Critical generator depletion (< 2h aux reserve)',
    city: 'Pune Pimpri Industrial Hub',
    driverName: 'Rajesh Kulkarni',
    driverContact: '+91 98209 77210',
    rank: 4,
    status: 'breached',
  },
];

interface ColdChainPageProps {
  shipments: any[];
  isRerouted: boolean;
  onOpenApproval: () => void;
}

export const ColdChainPage: React.FC<ColdChainPageProps> = ({
  shipments,
  isRerouted,
  onOpenApproval,
}) => {
  const [selectedFleetId, setSelectedFleetId] = useState<string>(() => {
    try {
      return localStorage.getItem('sg_selected_fleet_asset') || 'TRK-REEFER-01';
    } catch {
      return 'TRK-REEFER-01';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);

  // Match currently selected asset
  const allocatedAsset =
    CANDIDATE_FLEET.find((f) => f.id === selectedFleetId) || CANDIDATE_FLEET[0];

  // Dynamic values linked directly to the selected fleet asset
  const currentTemp = allocatedAsset.coreTemp;
  const currentBuffer = allocatedAsset.bufferHours;
  const currentFuel = allocatedAsset.gensetFuelPct;

  const isExcursion = currentTemp > 8.00;
  const isWarning = currentTemp >= 7.00 && currentTemp <= 8.00;

  // Persist asset choice in localStorage so other views reflect it
  const handleSelectAsset = (assetId: string) => {
    setSelectedFleetId(assetId);
    try {
      localStorage.setItem('sg_selected_fleet_asset', assetId);
    } catch {
      // Ignore storage error
    }
  };

  // Audio tone synthesizer for excursion alert
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // Browser audio restriction fallback
    }
  };

  // Play alert tone when user selects an asset that triggers an excursion (TRK-REEFER-03)
  useEffect(() => {
    if (isExcursion) {
      playAlertSound();
      setLastAlertTime(new Date().toLocaleTimeString());
    }
  }, [selectedFleetId]);

  // Dynamic 12-hour telemetry history based on the selected asset
  const telemetryHistory = [
    { time: '12h ago', temp: 4.0, status: 'safe' },
    { time: '10h ago', temp: 4.6, status: 'safe' },
    { time: '8h ago', temp: 5.2, status: 'safe' },
    { time: '6h ago', temp: 5.9, status: 'warning' },
    { time: '4h ago', temp: 6.6, status: 'warning' },
    { time: '2h ago', temp: 7.2, status: 'critical' },
    {
      time: 'Now (Live)',
      temp: currentTemp,
      status: isExcursion ? 'critical' : isWarning ? 'warning' : 'safe',
    },
  ];

  return (
    <div className="space-y-6">
      {/* CRITICAL EXCURSION ALERT BANNER (ACTIVATED WHEN AN OVER-DISTANCE ASSET IS SELECTED) */}
      {isExcursion && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-500 bg-gradient-to-r from-rose-950 via-rose-900/90 to-slate-950 p-5 shadow-2xl shadow-rose-900/50 animate-pulse">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/50 flex-shrink-0 animate-bounce">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs uppercase tracking-wider animate-pulse">
                    🚨 CRITICAL THERMAL EXCURSION BREACH
                  </span>
                  <span className="text-xs text-rose-200 font-mono">
                    Core Temp: {currentTemp.toFixed(2)}°C &gt; Threshold: +8.00°C
                  </span>
                  {lastAlertTime && (
                    <span className="text-[10px] bg-rose-950/80 px-2 py-0.5 rounded text-rose-300 border border-rose-700/50">
                      Triggered at {lastAlertTime}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  $1,250,000 USD Pediatric Vaccines at Critical Risk (CONT-REEFER-9042)
                </h2>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  Selected asset <strong className="text-white underline">{allocatedAsset.id}</strong> is {allocatedAsset.distanceKm}km away with an ETA of {allocatedAsset.etaMins}m, exceeding the safe thermal window!
                </p>

                {/* Live Channel Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SMS to Duty Officer (+91 98765 43210)
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PagerDuty P1 (#INC-9042)
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct Radio: {allocatedAsset.id} ({allocatedAsset.driverName})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowDispatchModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>View Dispatch Payload</span>
              </button>
              <button
                onClick={onOpenApproval}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/40 flex items-center gap-2 transition"
              >
                <span>Authorize Plan A Reroute</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER CARD */}
      <div
        className={`glass-panel p-6 rounded-2xl border transition-all ${
          isExcursion
            ? 'border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-950'
            : isRerouted
            ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/90 to-slate-950'
            : isWarning
            ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-950'
            : 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900/90 to-slate-950'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border ${
                isExcursion
                  ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                  : isRerouted
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : isWarning
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">
                  Autonomous Cold-Chain Telemetry Guard
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live BLE IoT Stream
                </span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1 rounded text-xs border ${
                    soundEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title={soundEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <span className="text-white font-mono font-bold">CONT-REEFER-9042</span> • High-Value Insulin & Pediatric Vaccines ($1.25M USD)
              </p>
            </div>
          </div>

          <div>
            {!isRerouted ? (
              <button
                onClick={onOpenApproval}
                className="btn-danger text-xs py-2 px-4 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Authorize Reefer Truck Intercept</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Thermal Equilibrium Restored (4.2°C Safe)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-ASSET FLEET PROXIMITY & DISPATCH MATCHER (INTERACTIVE 4 OPTIONS) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white">
                Multi-Asset Fleet Proximity & Dispatch Matcher
              </h3>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                Click any asset to simulate impact
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select candidate refrigerated vehicles to preview resulting core temperatures, remaining buffer windows, and alert triggers.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30 w-fit">
            Destination Hub: JNPT Berth 2 (INNSA)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CANDIDATE_FLEET.map((asset) => {
            const isSelected = asset.id === selectedFleetId;
            const isAssetBreached = asset.coreTemp > 8.00;
            const isAssetWarning = asset.coreTemp >= 7.00 && asset.coreTemp <= 8.00;

            return (
              <div
                key={asset.id}
                onClick={() => handleSelectAsset(asset.id)}
                className={`p-4 rounded-xl border transition cursor-pointer relative ${
                  isSelected
                    ? isAssetBreached
                      ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50 ring-2 ring-rose-500'
                      : isAssetWarning
                      ? 'bg-amber-950/30 border-amber-400 shadow-lg ring-1 ring-amber-400'
                      : 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {asset.rank === 1 && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                    Optimal Match
                  </div>
                )}
                {isAssetBreached && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                    Breaches Limit
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black mono text-white flex items-center gap-1.5">
                    <Truck className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {asset.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {asset.distanceKm} km
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-200 text-[11px] truncate">
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{asset.model}</p>
                  <p className="text-[10px] text-slate-500 truncate">Carrier: {asset.carrier}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">
                    Core Temp:{' '}
                    <strong
                      className={
                        isAssetBreached
                          ? 'text-rose-400 font-black'
                          : isAssetWarning
                          ? 'text-amber-400 font-bold'
                          : 'text-emerald-400 font-bold'
                      }
                    >
                      {asset.coreTemp}°C
                    </strong>
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">
                    ETA: {asset.etaMins}m
                  </span>
                </div>

                <div className="mt-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAsset(asset.id);
                    }}
                    className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? isAssetBreached
                          ? 'bg-rose-600 text-white'
                          : 'bg-cyan-500 text-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active for Alert</span>
                      </>
                    ) : (
                      <span>Select Asset</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 LARGE CLEAN METRIC PANELS (DYNAMICALLY UPDATED BY SELECTED FLEET ASSET) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Core Reefer Temp */}
        <div
          className={`glass-panel p-5 rounded-xl border transition-all ${
            isExcursion
              ? 'border-rose-500/70 bg-rose-950/20'
              : isWarning
              ? 'border-amber-500/40'
              : 'border-slate-800'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400">Core Reefer Temp</span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-3xl font-black mono ${
                isExcursion
                  ? 'text-rose-400 animate-pulse'
                  : isWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {currentTemp.toFixed(2)}°C
            </span>
            <span className="text-xs text-slate-500">Threshold: 8.00°C</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isExcursion
                  ? 'bg-rose-500 w-[100%]'
                  : isWarning
                  ? 'bg-amber-500 w-[85%]'
                  : 'bg-emerald-500 w-[45%]'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {allocatedAsset.tempSubtitle}
          </p>
        </div>

        {/* Metric 2: Thermal Buffer Window */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Thermal Buffer Window</span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-3xl font-black mono flex items-center gap-2 ${
                isExcursion
                  ? 'text-rose-400'
                  : isWarning
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              <Clock className="w-5 h-5" />
              {isExcursion ? '0.0h (Breached)' : `${currentBuffer.toFixed(1)}h`}
            </span>
            <span className="text-xs text-slate-500">Remaining</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            {allocatedAsset.bufferSubtitle}
          </p>
        </div>

        {/* Metric 3: Genset Fuel Level */}
        <div className="glass-panel p-5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400">Genset Fuel Level</span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-3xl font-black mono flex items-center gap-2 ${
                currentFuel < 20 ? 'text-rose-400' : 'text-white'
              }`}
            >
              <BatteryCharging
                className={`w-5 h-5 ${
                  currentFuel < 20 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              {currentFuel}%
            </span>
            <span className="text-xs text-slate-500">Diesel aux</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            {allocatedAsset.fuelSubtitle}
          </p>
        </div>

        {/* Metric 4: Allocated Fleet Asset (Dynamic) */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Allocated Fleet Asset</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              Rank #{allocatedAsset.rank}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-black text-cyan-300 mono flex items-center gap-1.5 truncate">
              <Truck className="w-5 h-5 flex-shrink-0" />
              {allocatedAsset.id}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              ETA: {allocatedAsset.etaMins}m
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 font-medium truncate">
            {allocatedAsset.name}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            📍 {allocatedAsset.distanceKm}km away • {allocatedAsset.city}
          </p>
        </div>
      </div>

      {/* 12-HOUR THERMAL PROGRESSION PROFILE (REFLECTS SELECTED ASSET RESULT) */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              12-Hour Thermal Progression Profile vs Safe Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Envelope: +2.0°C (Min) to +8.0°C (Max). Core temp adapts to intercept velocity of {allocatedAsset.id}.
            </p>
          </div>
          <span
            className={`text-xs mono font-bold px-3 py-1 rounded-lg border ${
              isExcursion
                ? 'text-rose-300 bg-rose-950/80 border-rose-500 animate-pulse'
                : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
            }`}
          >
            Degradation Velocity: +0.32°C / hr
          </span>
        </div>

        {/* SVG Chart */}
        <div className="relative h-64 w-full bg-slate-950/80 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
          <div className="absolute top-8 left-4 right-4 border-b border-dashed border-rose-500/40 flex justify-between text-[10px] text-rose-400 font-mono">
            <span>Critical Excursion Ceiling (+8.00°C)</span>
            <span>IRREVERSIBLE SPOILAGE</span>
          </div>
          <div className="absolute bottom-8 left-4 right-4 border-b border-dashed border-cyan-500/40 flex justify-between text-[10px] text-cyan-400 font-mono">
            <span>Minimum Operating Floor (+2.00°C)</span>
            <span>OPTIMAL STORAGE</span>
          </div>

          <div className="flex-1 flex items-end justify-between px-6 pt-12 pb-6">
            {telemetryHistory.map((pt, idx) => {
              const heightPercent = Math.min(100, Math.max(10, ((pt.temp - 2) / 8.5) * 100));
              const isCurrent = idx === telemetryHistory.length - 1;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 z-10">
                  <span
                    className={`text-xs font-mono font-bold ${
                      pt.temp >= 8.0
                        ? 'text-rose-400 font-black animate-pulse scale-110'
                        : pt.temp >= 7.0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {pt.temp.toFixed(2)}°C
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-8 rounded-t-lg transition-all duration-300 ${
                      pt.temp >= 8.0
                        ? 'bg-gradient-to-t from-rose-700 to-rose-400 shadow-xl shadow-rose-500/50'
                        : pt.temp >= 7.0
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    } ${isCurrent ? 'ring-2 ring-white/60' : ''}`}
                  />
                  <span
                    className={`text-[10px] font-mono mt-1 ${
                      isCurrent ? 'text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    {pt.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MULTI-CHANNEL DISPATCH DETAILS MODAL */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Emergency Incident Dispatch Payloads
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated webhooks, SMS broadcasts, and PagerDuty escalations triggered by sensor breach.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Channel 1: Twilio SMS */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 1. Twilio SMS Gateway (Delivered)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Recipient: +91 98765 43210 (Duty Operations Lead)
                  </span>
                </div>
                <div className="p-2.5 bg-black/60 rounded-lg font-mono text-[11px] text-slate-300 border border-white/5">
                  &quot;🚨 ALERT [SupplyGuard AI]: CONT-REEFER-9042 exceeded +8.00°C limit ({currentTemp.toFixed(2)}°C). Immediate intervention required to prevent $1.25M insulin write-off. Dedicated asset {allocatedAsset.id} mobilized to JNPT Terminal 2.&quot;
                </div>
              </div>

              {/* Channel 2: PagerDuty */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. PagerDuty Incident API (P1 Critical)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Incident ID: #INC-9042</span>
                </div>
                <div className="p-2.5 bg-black/60 rounded-lg font-mono text-[11px] text-slate-300 border border-white/5">
                  {`{\n  "service_key": "supplyguard-pharma-coldchain",\n  "event_type": "trigger",\n  "description": "CRITICAL: Thermal runaway detected (+${currentTemp.toFixed(2)}°C > 8.00°C)",\n  "urgency": "high",\n  "assigned_asset": "${allocatedAsset.id}",\n  "driver": "${allocatedAsset.driverName} (${allocatedAsset.driverContact})",\n  "eta_minutes": ${allocatedAsset.etaMins}\n}`}
                </div>
              </div>

              {/* Channel 3: Fleet Dispatch Radio */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3. Intermodal Fleet Direct Radio
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Driver: {allocatedAsset.driverName} ({allocatedAsset.driverContact})
                  </span>
                </div>
                <div className="p-2.5 bg-black/60 rounded-lg font-mono text-[11px] text-slate-300 border border-white/5">
                  &quot;Dispatch Directive to {allocatedAsset.id}: Stand by at {allocatedAsset.city}. Emergency cold-chain transfer clearance code: #SG-MED-994. Pre-cool verified at {allocatedAsset.coreTemp}°C.&quot;
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDispatchModal(false);
                  onOpenApproval();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <span>Proceed to Authorize Plan A</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


