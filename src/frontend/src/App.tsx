import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ApprovalModal } from './components/ApprovalModal';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import { CopilotDrawer } from './components/CopilotDrawer';
import { SimulationModal } from './components/SimulationModal';

import { DashboardPage } from './pages/DashboardPage';
import { DisruptionsPage } from './pages/DisruptionsPage';
import { ColdChainPage } from './pages/ColdChainPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { MapPage } from './pages/MapPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { SimulationPage } from './pages/SimulationPage';
import { AuditPage } from './pages/AuditPage';
import { CopilotPage } from './pages/CopilotPage';
import { AuthPage } from './pages/AuthPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { GuidePage } from './pages/GuidePage';

import {
  type UserRole,
  type UserProfile,
  loginAsRole,
  fetchShipments,
  fetchPorts,
  fetchActiveDisruptions,
  fetchAvailableFleet,
  fetchAuditLogs,
  logoutUser,
} from './services/api';

import { ShieldCheck, Bot } from 'lucide-react';

export function App() {
  const savedToken = typeof window !== 'undefined' ? localStorage.getItem('sg_token') : null;
  const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('sg_user') : null;
  const savedRole = (typeof window !== 'undefined' ? localStorage.getItem('sg_role') : null) as UserRole | null;
  let initialUser: UserProfile | null = null;
  try {
    if (savedUserStr) {
      initialUser = JSON.parse(savedUserStr);
      if (initialUser && initialUser.name && initialUser.name.includes('Aditi')) {
        initialUser.name = 'Capt. Vikramaditya Singhania (Director General & Admin)';
        localStorage.setItem('sg_user', JSON.stringify(initialUser));
      }
    }
  } catch (e) {
    initialUser = null;
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!savedToken);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUser);
  const [currentRole, setCurrentRole] = useState<UserRole>(savedRole || initialUser?.role || 'Logistics Manager');

  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [resolvedThreatIds, setResolvedThreatIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_resolved_threats');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const isRerouted = resolvedThreatIds.includes('DIS-2026-BOM-001');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Global Modals & Drawers
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState<boolean>(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const bannerTimeoutRef = useRef<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Load live data from backend & microservice
  const loadData = async (role = currentRole) => {
    setIsRefreshing(true);
    try {
      if (!savedToken && !userProfile) {
        const auth = await loginAsRole(role);
        setUserProfile(auth.user);
      }

      const [disrRes, shipRes, portRes, fleetRes, auditRes] = await Promise.all([
        fetchActiveDisruptions().catch(() => ({ data: [] })),
        fetchShipments({ limit: 60 }).catch(() => ({ data: [] })),
        fetchPorts().catch(() => ({ data: [] })),
        fetchAvailableFleet().catch(() => ({ data: [] })),
        fetchAuditLogs().catch(() => ({ data: [] })),
      ]);

      setDisruptions(disrRes.data || []);
      setShipments(shipRes.data || []);
      setPorts(portRes.data || []);
      setFleet(fleetRes.data || []);
      setAuditLogs(auditRes.data || []);

    } catch (err) {
      console.error('Failed to load live data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData(currentRole);
    }
  }, [currentRole, isAuthenticated]);

  const handleLoginSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    loadData(user.role);
    navigate('/');
  };

  const handleLogout = () => {
    logoutUser();
    setUserProfile(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const [chosenPlans, setChosenPlans] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sg_chosen_plans');
      return saved ? JSON.parse(saved) : { 'DIS-2026-BOM-001': 'PLAN-A', 'DIS-2026-RED-002': 'PLAN-A' };
    } catch {
      return { 'DIS-2026-BOM-001': 'PLAN-A', 'DIS-2026-RED-002': 'PLAN-A' };
    }
  });

  const handleSetChosenPlan = (threatId: string, planId: string) => {
    const next = { ...chosenPlans, [threatId]: planId };
    setChosenPlans(next);
    localStorage.setItem('sg_chosen_plans', JSON.stringify(next));
  };

  const handleResolveThreat = (threatId: string, planId?: string) => {
    if (planId) {
      handleSetChosenPlan(threatId, planId);
    }
    if (!resolvedThreatIds.includes(threatId)) {
      const next = [...resolvedThreatIds, threatId];
      setResolvedThreatIds(next);
      localStorage.setItem('sg_resolved_threats', JSON.stringify(next));
    }
  };

  const handleReviveThreat = (threatId: string) => {
    const next = resolvedThreatIds.filter((id) => id !== threatId);
    setResolvedThreatIds(next);
    localStorage.setItem('sg_resolved_threats', JSON.stringify(next));
  };

  const handleApprovalSuccess = (result?: any) => {
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    handleResolveThreat('DIS-2026-BOM-001');
    setSuccessBanner(
      `✅ Intervention Approved by ${userProfile?.name || 'Logistics Manager'}! Shipment diverted to Nhava Sheva (JNPT). TRK-REEFER-01 dispatched. SHA-256 Audit Log recorded.`
    );
    loadData(currentRole);
    bannerTimeoutRef.current = setTimeout(() => {
      setSuccessBanner(null);
    }, 3500);
  };

  const [mitigatedShipments, setMitigatedShipments] = useState<Record<string, { risk_score: number; status: string; applied_solution: string }>>(() => {
    try {
      const saved = localStorage.getItem('sg_mitigated_shipments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleMitigateShipment = (shipmentId: string, solution: { risk_score: number; status: string; applied_solution: string }) => {
    const next = { ...mitigatedShipments, [shipmentId]: solution };
    setMitigatedShipments(next);
    localStorage.setItem('sg_mitigated_shipments', JSON.stringify(next));
  };

  const handleResetShipmentMitigation = (shipmentId: string) => {
    const next = { ...mitigatedShipments };
    delete next[shipmentId];
    setMitigatedShipments(next);
    localStorage.setItem('sg_mitigated_shipments', JSON.stringify(next));
  };

  const effectiveShipments = shipments.map((s) => {
    const mit = mitigatedShipments[s.shipment_id];
    if (mit) {
      return { ...s, risk_score: mit.risk_score, status: mit.status, applied_solution: mit.applied_solution };
    }
    if (s.shipment_id === 'SHP-PHARMA-1001' && isRerouted) {
      return { ...s, risk_score: 18, status: 'rerouted' };
    }
    return s;
  });

  const activeDisruptionsCount = Math.max(0, 2 - resolvedThreatIds.length);
  const atRiskCount = effectiveShipments.filter((s) => s.risk_score >= 70 && s.status !== 'rerouted' && s.status !== 'mitigated').length;

  // Unauthenticated or on Auth route
  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/signup') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#060913] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Modern Sidebar Navigation with Admin link & Logout */}
      <Sidebar
        currentRole={currentRole}
        user={userProfile}
        disruptionsCount={activeDisruptionsCount}
        atRiskCount={atRiskCount}
        isRerouted={isRerouted}
        onLogout={handleLogout}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Header */}
        <Header
          currentRole={currentRole}
          user={userProfile}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenApproval={() => setIsApprovalOpen(true)}
          onRefresh={() => loadData(currentRole)}
          isRefreshing={isRefreshing}
          isRerouted={isRerouted}
          activeThreatsCount={activeDisruptionsCount}
          onToggleMobileMenu={() => setIsMobileNavOpen((prev) => !prev)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          {/* Global Success Banner */}
          {successBanner && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-fade-in">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{successBanner}</span>
              </div>
              <button
                onClick={() => setSuccessBanner(null)}
                className="text-emerald-400 hover:text-white text-xs underline font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Application Routes */}
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  disruptions={disruptions}
                  shipments={effectiveShipments}
                  isRerouted={isRerouted}
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  onOpenSimulation={() => setIsSimulationOpen(true)}
                  onOpenCopilot={() => setIsCopilotOpen(true)}
                />
              }
            />
            <Route
              path="/disruptions"
              element={
                <DisruptionsPage
                  disruptions={disruptions}
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  onOpenSimulation={() => setIsSimulationOpen(true)}
                  isRerouted={isRerouted}
                  resolvedThreatIds={resolvedThreatIds}
                  onResolveThreat={handleResolveThreat}
                  onReviveThreat={handleReviveThreat}
                />
              }
            />
            <Route
              path="/cold-chain"
              element={
                <ColdChainPage
                  shipments={effectiveShipments}
                  isRerouted={isRerouted}
                  onOpenApproval={() => setIsApprovalOpen(true)}
                />
              }
            />
            <Route
              path="/scenarios"
              element={
                <ScenariosPage
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  isRerouted={isRerouted}
                  resolvedThreatIds={resolvedThreatIds}
                  onResolveThreat={handleResolveThreat}
                  onReviveThreat={handleReviveThreat}
                  chosenPlans={chosenPlans}
                  onSetChosenPlan={handleSetChosenPlan}
                />
              }
            />
            <Route
              path="/map"
              element={
                <MapPage
                  isRerouted={isRerouted}
                  onOpenApproval={() => setIsApprovalOpen(true)}
                />
              }
            />
            <Route
              path="/shipments"
              element={
                <ShipmentsPage
                  shipments={effectiveShipments}
                  fleet={fleet}
                  isRerouted={isRerouted}
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  mitigatedShipments={mitigatedShipments}
                  onMitigateShipment={handleMitigateShipment}
                  onResetShipment={handleResetShipmentMitigation}
                />
              }
            />
            <Route
              path="/simulation"
              element={
                <SimulationPage
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  isRerouted={isRerouted}
                />
              }
            />
            <Route
              path="/audit"
              element={<AuditPage logs={auditLogs} />}
            />
            <Route
              path="/copilot"
              element={
                <CopilotPage
                  onOpenApproval={() => setIsApprovalOpen(true)}
                  isRerouted={isRerouted}
                />
              }
            />
            {/* Admin Personnel Management Route */}
            <Route
              path="/admin/users"
              element={<AdminUsersPage currentUser={userProfile} />}
            />
            {/* User & Operations Guide Route */}
            <Route path="/guide" element={<GuidePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Floating Quick Copilot Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-2xl shadow-indigo-500/50 hover:scale-110 active:scale-95 transition flex items-center gap-2 group border border-white/20"
        >
          <Bot className="w-5 h-5 text-white animate-pulse" />
          <span className="font-bold text-xs pr-1">Quick Copilot</span>
          {!isRerouted && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-ping" />
          )}
        </button>
      </div>

      {/* Human Approval Gate Modal */}
      <ApprovalModal
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        currentRole={currentRole}
        onSuccess={handleApprovalSuccess}
        isRerouted={isRerouted}
        onRequestLogin={() => {
          setIsApprovalOpen(false);
          handleLogout();
        }}
      />

      {/* 24h / 72h Cascade Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onOpenApproval={() => setIsApprovalOpen(true)}
        isRerouted={isRerouted}
      />

      {/* Audit Trail Drawer */}
      <AuditTrailDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        logs={auditLogs}
      />

      {/* Autonomous AI Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onOpenApproval={() => {
          setIsCopilotOpen(false);
          setIsApprovalOpen(true);
        }}
        isRerouted={isRerouted}
      />
    </div>
  );
}

export default App;
