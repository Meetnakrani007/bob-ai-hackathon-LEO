import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Thermometer,
  GitFork,
  Navigation,
  Package,
  Activity,
  ShieldCheck,
  Bot,
  Layers,
  ChevronDown,
  UserCheck,
  Users,
  LogOut,
  Lock,
  X,
  BookOpen,
} from 'lucide-react';
import { type UserRole, type UserProfile, ROLE_CREDENTIALS } from '../services/api';

interface SidebarProps {
  currentRole: UserRole;
  user: UserProfile | null;
  disruptionsCount: number;
  atRiskCount: number;
  isRerouted: boolean;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  user,
  disruptionsCount,
  atRiskCount,
  isRerouted,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      to: '/',
      label: 'Mission Control',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      to: '/disruptions',
      label: 'Threat Intel & Ports',
      icon: AlertTriangle,
      badge: disruptionsCount > 0 ? `${disruptionsCount} Active` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    },
    {
      to: '/cold-chain',
      label: 'Cold-Chain Guard',
      icon: Thermometer,
      badge: isRerouted ? 'Stabilized' : 'Critical',
      badgeColor: isRerouted
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse',
    },
    {
      to: '/scenarios',
      label: 'Scenario Matrix',
      icon: GitFork,
      badge: 'All Threat Plans',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      to: '/map',
      label: 'Tactical Maritime Map',
      icon: Navigation,
      badge: 'Live AIS',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      to: '/shipments',
      label: 'Fleet & Cargo Manifest',
      icon: Package,
      badge: atRiskCount > 0 && !isRerouted ? `${atRiskCount} at risk` : '60 Live',
      badgeColor: atRiskCount > 0 && !isRerouted
        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        : 'bg-slate-800 text-slate-400 border border-white/10',
    },
    {
      to: '/simulation',
      label: '72h Cascade Simulator',
      icon: Activity,
      badge: 'Demurrage',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      to: '/audit',
      label: 'Governance & Audit Trail',
      icon: ShieldCheck,
      badge: 'RBAC',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      to: '/copilot',
      label: 'AI Operations Copilot',
      icon: Bot,
      badge: 'MCP 10 Tools',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      to: '/guide',
      label: 'Operations & RBAC Guide',
      icon: BookOpen,
      badge: 'Guide',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    ...(currentRole === 'Admin'
      ? [
          {
            to: '/admin/users',
            label: 'Admin Personnel Console',
            icon: Users,
            badge: 'Admin Only',
            badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
          },
        ]
      : []),
  ];

  const sidebarInnerContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Top Section: Logo & System Health */}
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight text-white font-sans">
                  SupplyGuard<span className="text-indigo-400">.AI</span>
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                  L2
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium">
                Autonomous Disruption Copilot
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Micro System Status Pill */}
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>MCP Spine Online</span>
            </div>
            <span className="mono text-slate-500">5001 • 8000</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-270px)]">
          <p className="px-2.5 py-1 text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
            Operational Workspaces
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Authenticated Session & RBAC Badge */}
      <div className="p-3 border-t border-slate-800 bg-[#0b101d]">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentRole === 'Admin'
                  ? 'Capt. Vikramaditya Singhania'
                  : user?.name?.includes('Aditi')
                  ? 'Capt. Vikramaditya Singhania'
                  : user?.name || 'Supply Chain Officer'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {currentRole}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of current account"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Clearance Level Label */}
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="mono text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            {currentRole === 'Admin'
              ? 'LEVEL 5 // ROOT GOVERNANCE'
              : currentRole === 'Logistics Manager'
              ? 'LEVEL 4 // SIGN-OFF'
              : currentRole === 'Supply Chain Analyst'
              ? 'LEVEL 3 // COPILOT ANALYST'
              : currentRole === 'Auditor'
              ? 'LEVEL 2 // AUDIT & COMPLIANCE'
              : 'LEVEL 1 // VIEW-ONLY'}
          </span>

          <span className="text-[10px] text-slate-400 font-medium">
            {currentRole === 'Normal User' ? 'Read-Only' : 'Authorized'}
          </span>
        </div>

        {/* Normal User Read-Only Banner */}
        {currentRole === 'Normal User' && (
          <div className="mt-2 p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Read-Only Viewer</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Docked Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0e1424] border-r border-slate-800 flex-col justify-between h-screen sticky top-0 flex-shrink-0 select-none z-30">
        {sidebarInnerContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#0e1424] border-r border-slate-800 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarInnerContent}
          </div>
        </div>
      )}
    </>
  );
};
