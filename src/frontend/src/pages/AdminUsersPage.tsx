import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import {
  type UserRole,
  type UserProfile,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
} from '../services/api';

interface AdminUsersPageProps {
  currentUser: UserProfile | null;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New user form modal state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('Password123!');
  const [newRole, setNewRole] = useState<UserRole>('Supply Chain Analyst');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminUsers();
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load user directory. (Requires Admin role)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createAdminUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      });
      setSuccess(`✅ User ${newEmail} successfully registered as ${newRole}!`);
      setIsAddOpen(false);
      setNewName('');
      setNewEmail('');
      loadUsers();
      setTimeout(() => setSuccess(null), 8000);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateAdminUserRole(userId, role);
      setSuccess(`Updated user role to ${role}`);
      loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this user account?')) return;
    try {
      await deleteAdminUser(userId);
      setSuccess('User deactivated successfully');
      loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate user');
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="glass-panel p-8 rounded-2xl border-rose-500/30 text-center max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">Administrative Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The User Management Console requires the <strong className="text-rose-300">Admin</strong> role.
          Your current session is authorized as <strong className="text-cyan-300">{currentUser?.role || 'Guest'}</strong>.
        </p>
        <p className="text-xs text-slate-500 mt-3">
          To manage users and assign roles, switch your role to Admin using the sidebar role switcher or sign in as an Administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900/90 to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  Enterprise User & Role Management Console
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Provision new operators, assign operational privileges, and govern corporate RBAC access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Registered Corporate Personnel ({users.length} Active)
          </h3>
          <span className="text-xs text-slate-400">Deterministic MongoDB User Directory</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Name & ID</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Assigned Role (RBAC)</th>
                <th className="pb-3">Permissions Scope</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {users.map((u) => {
                const isSelf = u.user_id === currentUser?.user_id;

                return (
                  <tr key={u.user_id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-cyan-300">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="mono text-[10px] text-slate-500">{u.user_id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-300 mono text-xs">
                      {u.email}
                    </td>

                    <td className="py-3.5">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value as UserRole)}
                        className="bg-slate-950 border border-white/15 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60"
                      >
                        <option value="Admin">Admin (Full Control)</option>
                        <option value="Logistics Manager">Logistics Manager (Sign-off)</option>
                        <option value="Supply Chain Analyst">Supply Chain Analyst (Simulate)</option>
                        <option value="Auditor">Compliance Auditor (Audit)</option>
                        <option value="Normal User">Normal User (Read-Only)</option>
                      </select>
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.permissions?.slice(0, 3).map((p: string, idx: number) => (
                          <span
                            key={idx}
                            className="mono text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10"
                          >
                            {p}
                          </span>
                        ))}
                        {u.permissions?.length > 3 && (
                          <span className="mono text-[9px] text-slate-500">
                            +{u.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(u.user_id)}
                          title="Deactivate account"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isSelf && (
                        <span className="text-[10px] text-slate-500 italic">Current User</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border-white/10 shadow-2xl relative">
            <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              Provision New Team Member
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new user and assign operational access rights.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="suresh@supplyguard.io"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Normal User">Normal User (Read-Only Viewer — Cannot execute actions)</option>
                  <option value="Logistics Manager">Logistics Manager (Authorized to approve reroutes)</option>
                  <option value="Supply Chain Analyst">Supply Chain Analyst (Run simulations & copilot)</option>
                  <option value="Auditor">Compliance Auditor (Read audit trails & logs)</option>
                  <option value="Admin">Administrator (Full authority & user management)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {isSubmitting ? 'Creating...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
