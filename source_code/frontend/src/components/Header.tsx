import React from 'react';
import {
  AlertOctagon,
  RefreshCw,
  FileCheck,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Lock,
  Menu,
} from 'lucide-react';
import { type UserRole, type UserProfile } from '../services/api';

interface HeaderProps {
  currentRole: UserRole;
  user: UserProfile | null;
  onOpenCopilot: () => void;
  onOpenAudit: () => void;
  onOpenApproval: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isRerouted: boolean;
  activeThreatsCount?: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  user,
  onOpenCopilot,
  onOpenAudit,
  onOpenApproval,
  onRefresh,
  isRefreshing,
  isRerouted,
  activeThreatsCount = 1,
  onToggleMobileMenu,
}) => {
  const hasActiveThreats = activeThreatsCount > 0;

  return (
    <header className="h-14 bg-[#0e1424] border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Trigger + Dynamic Threat Alert */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {hasActiveThreats ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
            <span className="font-bold text-[10.5px] uppercase tracking-wider text-rose-400 shrink-0 hidden xs:inline">
              Threat Alert:
            </span>
            <span className="truncate max-w-[110px] sm:max-w-xs md:max-w-md">
              {activeThreatsCount} Active Threat Mission{activeThreatsCount > 1 ? 's' : ''} Pending Action
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-xs md:max-w-md">
              All Maritime Corridors Mitigated & Secured
            </span>
          </div>
        )}

        <div className="simulated-data-badge hidden 2xl:inline-flex">
          Simulated
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Refresh Live State */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh real-time data"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="hidden md:inline">Sync</span>
        </button>

        {/* Audit Trail Drawer Trigger */}
        <button
          onClick={onOpenAudit}
          className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-medium"
        >
          <FileCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Audit Trail</span>
        </button>
      </div>
    </header>
  );
};
