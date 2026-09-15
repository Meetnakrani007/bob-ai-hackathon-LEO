import React from 'react';
import {
  ShieldAlert,
  Bot,
  FileCheck2,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { type UserRole, type UserProfile, ROLE_CREDENTIALS } from '../services/api';

interface NavbarProps {
  currentRole: UserRole;
  user: UserProfile | null;
  onRoleChange: (role: UserRole) => void;
  onOpenCopilot: () => void;
  onOpenAudit: () => void;
  unreadAlertsCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  user,
  onRoleChange,
  onOpenCopilot,
  onOpenAudit,
  unreadAlertsCount,
  onRefresh,
  isRefreshing,
}) => {
  const roles: UserRole[] = [
    'Logistics Manager',
    'Supply Chain Analyst',
    'Admin',
    'Auditor',
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 ping-indicator" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                SupplyGuard<span className="text-cyan-400">.AI</span>
              </span>
              <span className="simulated-data-badge">
                Simulated Data
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Autonomous Disruption Copilot • Track L2
            </p>
          </div>
        </div>

        {/* Live Disruption Marquee */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 max-w-md">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">Active Alert:</span>
          <span className="truncate">Mumbai Port Strike • 18 Liners Delayed • Pharma at Risk</span>
        </div>

        {/* Right Actions: RBAC Role Switcher + Copilot + Audit */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Role Switcher Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-lg shadow-inner">
            <span className="text-xs font-semibold text-slate-400">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-100">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Refresh live data"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Audit Logs button */}
          <button
            onClick={onOpenAudit}
            className="btn-outline text-xs hidden sm:inline-flex"
            title="Inspect compliance audit trail"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audit Trail</span>
          </button>

          {/* Copilot Drawer Trigger */}
          <button
            onClick={onOpenCopilot}
            className="btn-primary text-xs relative"
          >
            <Bot className="w-4 h-4 text-cyan-200" />
            <span>AI Copilot</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-950">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
