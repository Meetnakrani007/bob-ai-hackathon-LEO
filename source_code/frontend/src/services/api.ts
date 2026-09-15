/**
 * SupplyGuard AI — API Client & Role Management
 * Connects frontend directly to the Node/Express backend on port 5001.
 */

const API_BASE = 'http://localhost:5001/api';

export type UserRole = 'Admin' | 'Logistics Manager' | 'Supply Chain Analyst' | 'Auditor' | 'Normal User';

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

// Runtime exports for bundler and browser ESM compatibility
export const UserRole = {} as any;
export const UserProfile = {} as any;

export const ROLE_CREDENTIALS: Record<UserRole, { email: string; pass: string; title: string; desc: string }> = {
  'Admin': {
    email: 'admin@supplyguard.io',
    pass: 'Password123!',
    title: 'Capt. Vikramaditya Singhania (Director General & Admin)',
    desc: 'Full administrative & final executive sign-off authority: platform governance and emergency orders',
  },
  'Logistics Manager': {
    email: 'manager@supplyguard.io',
    pass: 'Password123!',
    title: 'Rajesh Nair (Logistics Director)',
    desc: 'Operational authority: sign and authorize port diversions, dispatch fleet assets',
  },
  'Supply Chain Analyst': {
    email: 'analyst@supplyguard.io',
    pass: 'Password123!',
    title: 'Priya Patel (Operations Analyst)',
    desc: 'Analytical authority: query AI Copilot, run 72h cascades, view all metrics (cannot sign)',
  },
  'Auditor': {
    email: 'auditor@supplyguard.io',
    pass: 'Password123!',
    title: 'Vikram Mehta (Compliance Auditor)',
    desc: 'Oversight authority: inspect cryptographic SHA-256 audit logs and compliance trails',
  },
  'Normal User': {
    email: 'user@supplyguard.io',
    pass: 'Password123!',
    title: 'Kavita Rao (Guest Viewer)',
    desc: 'Read-only access: can view operational map and telemetry, cannot execute any action',
  },
};

let currentToken: string | null = null;
let currentRole: UserRole = 'Logistics Manager';

export async function loginAsRole(role: UserRole): Promise<{ token: string; user: UserProfile }> {
  currentRole = role;
  const creds = ROLE_CREDENTIALS[role];

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.pass }),
  });

  if (!res.ok) {
    throw new Error(`Login failed for ${role}`);
  }

  const json = await res.json();
  currentToken = json.data.accessToken;
  localStorage.setItem('sg_token', currentToken!);
  localStorage.setItem('sg_role', role);
  localStorage.setItem('sg_user', JSON.stringify(json.data.user));
  return { token: currentToken!, user: json.data.user };
}

export function getCurrentToken(): string | null {
  return currentToken || localStorage.getItem('sg_token');
}

export function getCurrentRole(): UserRole {
  return (localStorage.getItem('sg_role') as UserRole) || currentRole;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getCurrentToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// ==============================
// Domain API Calls
// ==============================

export async function fetchHealth(): Promise<any> {
  return request('/health');
}

export async function fetchShipments(params: Record<string, any> = {}): Promise<any> {
  const query = new URLSearchParams(params).toString();
  return request(`/shipments${query ? `?${query}` : ''}`);
}

export async function fetchShipmentById(id: string): Promise<any> {
  return request(`/shipments/${id}`);
}

export async function fetchShipmentRisk(id: string): Promise<any> {
  return request(`/shipments/${id}/risk`);
}

export async function fetchPorts(): Promise<any> {
  return request('/ports');
}

export async function fetchPortStatus(id: string): Promise<any> {
  return request(`/ports/${id}/status`);
}

export async function fetchActiveDisruptions(): Promise<any> {
  return request('/disruptions/active');
}

export async function fetchAvailableFleet(params: Record<string, any> = {}): Promise<any> {
  const query = new URLSearchParams(params).toString();
  return request(`/fleet/available${query ? `?${query}` : ''}`);
}

export async function fetchAuditLogs(): Promise<any> {
  return request('/audit-logs');
}

export async function fetchNotifications(): Promise<any> {
  return request('/notifications');
}

export async function fetchMCPTools(): Promise<any> {
  return request('/mcp/tools');
}

export async function postCopilotQuery(query: string, disruption_id?: string, shipment_id?: string): Promise<any> {
  return request('/copilot/query', {
    method: 'POST',
    body: JSON.stringify({ query, disruption_id, shipment_id }),
  });
}

export async function approveAction(
  actionId: string,
  payload: {
    action_type: string;
    target_id: string;
    target_type: string;
    new_route_id?: string;
    assigned_vehicle_id?: string;
    reason: string;
  }
): Promise<any> {
  return request(`/actions/${actionId}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Full Auth APIs (Sign In & Sign Up)
export async function loginWithCredentials(email: string, pass: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: pass }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Login failed');
  }

  currentToken = json.data.accessToken;
  currentRole = json.data.user.role;
  localStorage.setItem('sg_token', currentToken!);
  localStorage.setItem('sg_role', currentRole);
  return { token: currentToken!, user: json.data.user };
}

export async function registerWithCredentials(payload: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Registration failed');
  }

  currentToken = json.data.accessToken;
  currentRole = json.data.user.role;
  localStorage.setItem('sg_token', currentToken!);
  localStorage.setItem('sg_role', currentRole);
  localStorage.setItem('sg_user', JSON.stringify(json.data.user));
  return { token: currentToken!, user: json.data.user };
}

export function logoutUser(): void {
  currentToken = null;
  localStorage.removeItem('sg_token');
  localStorage.removeItem('sg_role');
  localStorage.removeItem('sg_user');
}

// Admin User Management APIs (Admin Role Only)
export async function fetchAdminUsers(): Promise<any> {
  return request('/users');
}

export async function createAdminUser(payload: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}): Promise<any> {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserRole(userId: string, role: UserRole): Promise<any> {
  return request(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deleteAdminUser(userId: string): Promise<any> {
  return request(`/users/${userId}`, {
    method: 'DELETE',
  });
}
