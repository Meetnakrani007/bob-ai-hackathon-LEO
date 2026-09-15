import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Navigation,
  Activity,
  AlertTriangle,
  Anchor,
} from 'lucide-react';
import {
  type UserRole,
  type UserProfile,
  ROLE_CREDENTIALS,
  loginWithCredentials,
} from '../services/api';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>(ROLE_CREDENTIALS['Logistics Manager'].email);
  const [password, setPassword] = useState<string>(ROLE_CREDENTIALS['Logistics Manager'].pass);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeQuickRole, setActiveQuickRole] = useState<UserRole>('Logistics Manager');

  const handleQuickFill = (role: UserRole) => {
    setActiveQuickRole(role);
    setEmail(ROLE_CREDENTIALS[role].email);
    setPassword(ROLE_CREDENTIALS[role].pass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts: { label: string; role: UserRole }[] = [
    { label: 'Logistics Manager', role: 'Logistics Manager' },
    { label: 'Admin', role: 'Admin' },
    { label: 'Analyst', role: 'Supply Chain Analyst' },
    { label: 'Auditor', role: 'Auditor' },
    { label: 'Observer', role: 'Normal User' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-600/5 rounded-full blur-[140px]" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        
        {/* Left Side: System Context & Features */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-cyan-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Private Enterprise Network • Authorized Only</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                SupplyGuard<span className="text-cyan-400">.AI</span>
              </h1>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              Autonomous Supply Chain Disruption Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-md">
              Mission Control for predictive maritime rerouting, cold-chain temperature preservation, and automated multi-modal port governance.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#111827]/70 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Live AIS Maritime Radar & 18 Ports</h4>
                <p className="text-[11px] text-slate-400">Peninsular India digital twin tracking container ships and Dedicated Freight Corridors.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#111827]/70 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">72-Hour Demurrage Prediction</h4>
                <p className="text-[11px] text-slate-400">Discrete-event cascade modeling of container dwell costs and spoilage risks.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#111827]/70 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Cryptographic Audit Ledger</h4>
                <p className="text-[11px] text-slate-400">SHA-256 tamper-evident logs for every reroute decision and regulatory sign-off.</p>
              </div>
            </div>
          </div>

          {/* Active Alert Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-white block">Active Incident: Mumbai Port Stoppage</span>
                <span className="text-[10px] text-slate-400">18 Vessels Queued • Plan A (JNPT) Ready</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold">
              Critical
            </span>
          </div>
        </div>

        {/* Right Side: Clean Sign In Form */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Sign In to Mission Control
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your authorized corporate credentials
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@supplyguard.io"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Security Password
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Default: Password123!
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Mission Control</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Profiles */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">
                  Quick Demo Profiles:
                </span>
                <span className="text-[10px] text-slate-500">
                  Click to pre-fill
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {demoAccounts.map((item) => {
                  const isSelected = activeQuickRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleQuickFill(item.role)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private Access • New accounts provisioned by System Administrator</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
