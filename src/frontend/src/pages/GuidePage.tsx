import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Lock,
  Bot,
  Layers,
  Thermometer,
  Activity,
  Anchor,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
} from 'lucide-react';

export const GuidePage: React.FC = () => {
  const roles = [
    {
      title: 'Logistics Manager',
      subtitle: 'Full Sign-off Authority',
      color: 'emerald',
      allowed: [
        'Authorize port diversions (JNPT / Mundra)',
        'Dispatch auxiliary reefer fleet assets',
        'Approve financial holding thresholds',
        'Sign SHA-256 tamper-evident logs',
      ],
      blocked: ['User provisioning and database deletion'],
    },
    {
      title: 'Admin (CSO)',
      subtitle: 'Root Governance',
      color: 'purple',
      allowed: [
        'Full platform & user account management',
        'Provision role credentials & access grants',
        'Server health & FastAPI telemetry monitoring',
        'Inspect raw cryptographic audit trails',
      ],
      blocked: [],
    },
    {
      title: 'Supply Chain Analyst',
      subtitle: 'Predictive Modeling',
      color: 'cyan',
      allowed: [
        'Run 24h/72h discrete-event cascade models',
        'Query AI Copilot MCP tool repository',
        'Compare port congestion & dwell metrics',
        'Evaluate multi-modal scenario trade-offs',
      ],
      blocked: ['Reroute execution & fleet mobilization'],
    },
    {
      title: 'Compliance Auditor',
      subtitle: 'Read-Only Oversight',
      color: 'amber',
      allowed: [
        'Inspect immutable cryptographic ledger',
        'Verify SHA-256 digital signatures',
        'Export compliance reports',
        'Audit regulatory temperature excursion records',
      ],
      blocked: ['Operational intervention actions'],
    },
    {
      title: 'Normal User / Guest',
      subtitle: 'Observer View',
      color: 'slate',
      allowed: [
        'Live AIS map telemetry inspection',
        'View cargo and container manifests',
        'Monitor port statuses and congestion',
      ],
      blocked: ['All administrative and execution actions'],
    },
  ];

  const workflows = [
    {
      step: '01',
      title: 'Disruption Detection & Verification',
      desc: 'System aggregates port bulletins, AIS anchorage drift data, and live labor dispute feeds to compute a confidence score (e.g. 94% Mumbai strike).',
      icon: AlertTriangle,
    },
    {
      step: '02',
      title: 'Discrete-Event Cascade Simulation',
      desc: 'Python analytics engine simulates cumulative demurrage costs ($35K/day/vessel), delayed container TEUs, and downstream rail shortages.',
      icon: Activity,
    },
    {
      step: '03',
      title: 'Autonomous Scenario Evaluation',
      desc: 'Analyzes trade-offs across Plan A (JNPT 8km diversion), Plan B (Mundra deepsea reroute), and Plan C (holding pattern in roads).',
      icon: Layers,
    },
    {
      step: '04',
      title: 'Authorized Executive Sign-Off',
      desc: 'Logistics Manager or Admin approves diversion. The action is cryptographically hashed with SHA-256 and committed to the audit ledger.',
      icon: ShieldCheck,
    },
    {
      step: '05',
      title: 'Fleet Dispatch & Cold Preservation',
      desc: 'Reefer trucks are mobilized to meet the diverted vessel at quay-side, ensuring pharmaceutical temperature thresholds are never breached.',
      icon: Truck,
    },
  ];

  const promptExamples = [
    {
      category: 'Strike & Threat Intelligence',
      prompt: 'What is the current verification status of the Mumbai Port strike?',
    },
    {
      category: 'Cold-Chain Telemetry',
      prompt: 'What is the temperature and remaining battery buffer for container CONT-REEFER-9042?',
    },
    {
      category: 'Diversion & Capacity',
      prompt: 'Compare available reefer plugs and dwell times between JNPT and Mundra.',
    },
    {
      category: 'Financial Cascade',
      prompt: 'Simulate 72-hour financial demurrage loss if the vessel remains at outer anchorage.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              System Documentation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            User & Operational Architecture Guide
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Reference manual for role authorizations, autonomous disruption mitigation workflows, and AI Copilot interaction protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Enterprise RBAC Enforced</span>
        </div>
      </div>

      {/* Enterprise Role-Based Access Control (RBAC) Permissions Matrix */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Enterprise Role-Based Access Control (RBAC) Permissions Matrix
              </h2>
              <p className="text-[11px] text-slate-400">
                Functional authorities and execution gating for each operational user role
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {roles.map((r, idx) => (
            <div
              key={idx}
              className="bg-[#090d16] border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-white block mb-0.5">{r.title}</span>
                <span
                  className={`text-[11px] font-semibold block mb-3 ${
                    r.color === 'emerald'
                      ? 'text-emerald-400'
                      : r.color === 'purple'
                      ? 'text-purple-400'
                      : r.color === 'cyan'
                      ? 'text-cyan-400'
                      : r.color === 'amber'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {r.subtitle}
                </span>

                <div className="space-y-1.5 text-[11px] text-slate-300 mb-3">
                  {r.allowed.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {r.blocked.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-snug text-slate-500">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disruption Mitigation Workflow SOP */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Standard Operating Procedure (SOP) — 5-Phase Disruption Lifecycle
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            How SupplyGuard autonomously detects, simulates, and mitigates maritime choke-points
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {workflows.map((wf) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.step}
                className="bg-[#090d16] border border-slate-800/80 p-4 rounded-xl relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-400 mono">{wf.step}</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-white mb-1.5">{wf.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{wf.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prompt Engineering & AI Copilot Guidelines */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            AI Operations Copilot Prompt Guide
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sample prompts that trigger specialized MCP tools for rapid decision support
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {promptExamples.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#090d16] border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  {item.category}
                </span>
                <span className="text-xs text-cyan-300 font-medium font-mono">
                  "{item.prompt}"
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
