import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  ArrowRight,
  FileSignature,
  Lock,
} from 'lucide-react';
import { type UserRole, approveAction } from '../services/api';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSuccess: (result: any) => void;
  onRequestLogin?: () => void;
  isRerouted?: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSuccess,
  onRequestLogin,
  isRerouted = false,
}) => {
  const [reason, setReason] = useState<string>(
    'Urgent diversion to Nhava Sheva (JNPT) and refrigerated truck dispatch to preserve insulin cold-chain integrity amid Mumbai Port strike.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const canApprove = currentRole === 'Logistics Manager' || currentRole === 'Admin';

  const handleApprove = async () => {
    if (isRerouted) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await approveAction('ACT-REROUTE-001', {
        action_type: 'REROUTE_SHIPMENT',
        target_id: 'SHP-PHARMA-1001',
        target_type: 'shipment',
        new_route_id: 'RTE-SIN-NSA-SEA',
        assigned_vehicle_id: 'TRK-REEFER-01',
        reason,
      });

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval rejected by server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-white/20 bg-slate-900 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-xl border ${
            isRerouted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
          }`}>
            {isRerouted ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <FileSignature className="w-6 h-6 text-cyan-300" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              {isRerouted ? 'Intervention Active & Verified' : 'Operational Intervention Approval Gate'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRerouted ? 'Immutable SHA-256 Ledger Record Committed' : 'Corporate Governance & Audit Trail Verification Step'}
            </p>
          </div>
        </div>

        {/* Action Summary Card */}
        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 mb-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Target Shipment:</span>
            <span className="mono text-white font-bold">SHP-PHARMA-1001 ($1.25M USD Insulin)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Execution Status:</span>
            <span className={`font-bold ${isRerouted ? 'text-emerald-400' : 'text-cyan-300'}`}>
              {isRerouted ? 'Diverted & Active at Nhava Sheva (JNPT)' : 'Port of Mumbai → Nhava Sheva (JNPT)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Fleet Asset Mobilization:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              TRK-REEFER-01 (Pre-cooled 4.0°C)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Autonomous Impact:</span>
            <span className="text-cyan-300 font-bold">Prevents $1.25M spoilage • Saves $1.248M net</span>
          </div>
        </div>

        {/* Justification Box or Active Status */}
        {!isRerouted ? (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Operational Justification (Mandatory for Audit Trail):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition resize-none font-sans"
              placeholder="Provide reason for port diversion..."
            />
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 mb-4 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Intervention Already Authorized & Committed</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This reroute action has been digitally signed and sealed into the tamper-evident SHA-256 audit ledger. Further duplicate approvals are restricted to maintain cryptographic integrity.
            </p>
          </div>
        )}

        {/* RBAC Verification Alert */}
        {!isRerouted && (!canApprove ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 mb-5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Role Permission Check Failed</p>
              <p className="text-[11.5px] text-rose-200/80 mt-0.5">
                Current session role: <strong>{currentRole}</strong>. Corporate security mandates that port diversion signatures and fleet dispatches must be authorized by a <strong>Logistics Manager</strong> or <strong>Admin</strong>.
              </p>
              {onRequestLogin && (
                <button
                  onClick={onRequestLogin}
                  className="mt-2 text-[11px] font-bold text-cyan-300 underline hover:text-cyan-200 block"
                >
                  Sign in with an authorized account &rarr;
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 mb-5 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block">
                {currentRole === 'Admin'
                  ? 'Executive Authority: Capt. Vikramaditya Singhania (Director General & Admin)'
                  : 'Operational Authority: Rajesh Nair (Logistics Director)'}
              </span>
              <span className="text-[11px] text-emerald-200/80">
                {currentRole === 'Admin'
                  ? 'Direct executive final sign-off authorized. Approving will immediately commit the diversion order and seal the cryptographic ledger.'
                  : 'Operational verification confirmed. Signing will divert shipment to Nhava Sheva (JNPT) and mobilize TRK-REEFER-01.'}
              </span>
            </div>
          </div>
        ))}

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium mb-3">
            Error: {errorMsg}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            {isRerouted ? 'Close' : 'Cancel'}
          </button>

          {!isRerouted && canApprove && (
            <button
              onClick={handleApprove}
              disabled={isSubmitting || !reason.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <span>Executing & Logging...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                  <span>
                    {currentRole === 'Admin'
                      ? 'Direct Executive Final Sign-Off'
                      : 'Authorize & Sign Reroute'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
