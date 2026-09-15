import React from 'react';
import {
  FileCheck2,
  X,
  ShieldCheck,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: any[];
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-slate-950 border-l border-white/10 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <FileCheck2 className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  Compliance Audit Trail & Governance Record
                </h2>
                <p className="text-xs text-slate-400">
                  Cryptographically indexed immutable ledger of approvals & actions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audit Logs Stream */}
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No audit entries recorded yet.
              </p>
            ) : (
              logs.map((log: any) => (
                <div
                  key={log.log_id}
                  className="bg-slate-900/90 border border-white/10 rounded-xl p-4 text-xs space-y-2 hover:border-indigo-500/40 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                      {log.log_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.approval_status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {log.approval_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 font-bold text-sm">
                    <span>{log.action}</span>
                    <span className="text-slate-400 font-normal text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11.5px] bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    "{log.reason}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        Actor: <strong className="text-slate-200">{log.actor?.name || 'Authorized User'}</strong> ({log.actor?.role || log.actor?.email})
                      </span>
                    </div>

                    <div className="mono text-cyan-400 font-medium">
                      Target: {log.target_type?.toUpperCase()} #{log.target_id}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-500">
            Immutable Audit Trail • Exportable for Customs & Insurance Compliance
          </p>
        </div>
      </div>
    </div>
  );
};
