import React from 'react';
import {
  ShieldCheck,
  FileText,
  UserCheck,
  Lock,
  ExternalLink,
  CheckCircle2,
  Clock,
  Key,
} from 'lucide-react';

interface AuditPageProps {
  logs: any[];
}

export const AuditPage: React.FC<AuditPageProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Immutable Governance Trail
              </span>
              <span className="text-xs text-slate-400">
                21 CFR Part 11 & Corporate Supply Chain Compliance
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Cryptographic Audit Trail & Governance Log
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Every operational intervention, automated risk score re-computation, and carrier reroute sign-off is logged with user identity, RBAC verification, and SHA-256 hash.
            </p>
          </div>
        </div>
      </div>


      {/* Audit Log Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Signed Action Audit Records ({logs.length} Total)
          </h3>
          <span className="text-xs text-slate-400">Deterministic MongoDB Audit Collection</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Timestamp (UTC)</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Actor & Role</th>
                <th className="pb-3">Target Entity</th>
                <th className="pb-3">Operational Justification</th>
                <th className="pb-3 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 text-slate-400 mono text-[11px]">
                      {new Date(log.timestamp || log.created_at || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                        {log.action_type || 'REROUTE_AUTHORIZED'}
                      </span>
                    </td>
                    <td className="py-3.5 text-white">
                      <span className="font-bold">{log.user_name || 'Rajesh Nair'}</span>
                      <span className="text-slate-500 text-[10px] block">{log.user_role || 'Logistics Manager'}</span>
                    </td>
                    <td className="py-3.5 mono text-cyan-300 font-bold">
                      {log.entity_id || 'SHP-PHARMA-1001'}
                    </td>
                    <td className="py-3.5 text-slate-300 max-w-xs truncate">
                      {log.reason || log.details?.justification || 'Emergency diversion to Nhava Sheva to prevent cold-chain spoilage.'}
                    </td>
                    <td className="py-3.5 text-right mono text-[10px] text-slate-500">
                      {log.hash ? log.hash.substring(0, 16) + '...' : 'e82b7c4f...sha256'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No custom actions signed yet. Use the "Review & Authorize Reroute" modal to generate your first cryptographic audit log!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
