import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  RefreshCw,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Layers,
  Terminal,
  Code,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { postCopilotQuery } from '../services/api';

interface CopilotPageProps {
  onOpenApproval: () => void;
  isRerouted: boolean;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({
  onOpenApproval,
  isRerouted,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: any }>>([
    {
      sender: 'assistant',
      text: `Hello! I am SupplyGuard AI Copilot, your autonomous supply-chain operations assistant.

I am connected to the Model Context Protocol (MCP) server, giving me real-time situational access across 18 vessels and $2.75M USD in at-risk cargo.

Ask me any specific question about the Mumbai strike, cold-chain temperature buffer, alternative diversion ports, or available reefer trucks!`,
      data: {
        suggested_prompts: [
          'Check insulin container temperature & buffer',
          'Compare Plan A (JNPT) vs Plan B (Mundra)',
          'How do I write effective prompts for Copilot?',
        ],
      },
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools'>('chat');
  const [showPromptGuide, setShowPromptGuide] = useState<boolean>(false);

  const handleSend = async (customText?: string) => {
    const q = customText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg = { sender: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await postCopilotQuery(q, 'DIS-2026-BOM-001', 'SHP-PHARMA-1001');
      const assistantMsg = {
        sender: 'assistant' as const,
        text: res.data.answer,
        data: res.data,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ Error communicating with Copilot: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickCategories = [
    { label: '🚨 Strike Status', query: 'What is the current status of the Mumbai Port strike?' },
    { label: '❄️ Cold-Chain Buffer', query: 'What is the temperature and thermal buffer for container CONT-REEFER-9042?' },
    { label: '⚓ Compare Ports', query: 'Compare Nhava Sheva (JNPT) vs Mundra for diversion' },
    { label: '🚛 Reefer Trucks', query: 'Find available refrigerated trucks near JNPT quay' },
    { label: '💰 Demurrage Cost', query: 'Simulate 72-hour financial demurrage cascade' },
    { label: '💡 Prompt Guide', query: 'How do I write effective prompts for Copilot?' },
  ];

  const mcpToolsList = [
    { name: 'verify_disruption', desc: 'Corroborate port disruptions across notices, news, and AIS' },
    { name: 'assess_cold_chain_risk', desc: 'Predict thermal excursion velocity and spoilage window' },
    { name: 'get_alternative_ports', desc: 'Rank regional ports by congestion, distance, and reefer capacity' },
    { name: 'check_fleet_availability', desc: 'Locate available refrigerated trucks and rail wagons' },
    { name: 'simulate_demurrage_cascade', desc: 'Model financial liability over 24h, 48h, and 72h horizons' },
    { name: 'generate_action_plan', desc: 'Synthesize optimal multi-modal reroute plan with justification' },
    { name: 'execute_reroute_action', desc: 'Sign and dispatch operational intervention with audit hash' },
    { name: 'get_shipment_telemetry', desc: 'Stream real-time IoT temperature and GPS coordinates' },
    { name: 'evaluate_port_congestion', desc: 'Query active vessel queues and berth wait times' },
    { name: 'verify_compliance_audit', desc: 'Validate RBAC permissions and integrity signatures' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  Autonomous AI Operations Copilot Studio
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Model Context Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Context-Aware Intent Engine • 10 MCP Tools and 9 Operational Resources across Ports 5001 & 8000.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptGuide(!showPromptGuide)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                showPromptGuide
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border border-white/10 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Prompt</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 border border-white/10'
              }`}
            >
              Interactive Chat
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'tools'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 border border-white/10'
              }`}
            >
              MCP Tool Registry (10)
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Guide Slide-down Banner */}
      {showPromptGuide && activeTab === 'chat' && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-slate-300 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-amber-300 pb-2 border-b border-amber-500/20">
            <span className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Prompt Engineering Guide for SupplyGuard Copilot
            </span>
            <button
              onClick={() => setShowPromptGuide(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            SupplyGuard Copilot uses dynamic intent routing. Mention an <strong>asset ID (e.g. SHP-PHARMA-1001, CONT-REEFER-9042)</strong>, <strong>port code (INBOM, JNPT)</strong>, or <strong>specific metric</strong> to get exact operational answers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div
              onClick={() => {
                handleSend('Check temperature and buffer time for shipment SHP-PHARMA-1001');
                setShowPromptGuide(false);
              }}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-cyan-300 block mb-0.5">Cold Chain Query</strong>
                <span className="text-slate-400 text-[11px]">"Check temperature for SHP-PHARMA-1001"</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 shrink-0" />
            </div>

            <div
              onClick={() => {
                handleSend('Compare Nhava Sheva (JNPT) vs Mundra for diversion');
                setShowPromptGuide(false);
              }}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-emerald-300 block mb-0.5">Port Comparison</strong>
                <span className="text-slate-400 text-[11px]">"Compare JNPT vs Mundra for diversion"</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 shrink-0" />
            </div>

            <div
              onClick={() => {
                handleSend('Find nearest available refrigerated trucks with battery > 80%');
                setShowPromptGuide(false);
              }}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-indigo-300 block mb-0.5">Fleet Dispatch</strong>
                <span className="text-slate-400 text-[11px]">"Find available reefer trucks at JNPT"</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 shrink-0" />
            </div>

            <div
              onClick={() => {
                handleSend('Simulate 72-hour financial demurrage cascade');
                setShowPromptGuide(false);
              }}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-rose-300 block mb-0.5">Demurrage Risk</strong>
                <span className="text-slate-400 text-[11px]">"Simulate 72h demurrage cascade"</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-300 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' ? (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[650px]">
          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-lg shadow-indigo-600/30 font-medium'
                      : 'bg-slate-950/90 text-slate-200 border border-white/10 rounded-bl-none shadow-xl'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.text.replace(/\*\*/g, '').replace(/\*/g, '')}
                  </div>

                  {/* Clickable Follow-Up Suggestions returned by Copilot */}
                  {m.sender === 'assistant' && m.data?.suggested_prompts && m.data.suggested_prompts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        Suggested Follow-Up Inquiries:
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {m.data.suggested_prompts.map((p: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(p)}
                            disabled={isLoading}
                            className="text-left text-[11.5px] p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 transition flex items-center justify-between group"
                          >
                            <span>💡 {p}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct action button inside Copilot */}
                  {m.sender === 'assistant' && !isRerouted && m.data?.approval_gating && (
                    <button
                      onClick={onOpenApproval}
                      className="mt-3 w-full btn-danger text-xs py-2 px-3 flex items-center justify-center gap-2 font-bold shadow-lg shadow-rose-500/20"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      <span>Authorize Diversion to Nhava Sheva (JNPT)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 py-3 px-3 bg-slate-950/60 rounded-xl border border-white/5 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Orchestrating MCP toolchain and evaluating situational telemetry...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="pt-3 pb-2 border-t border-white/10">
            <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Quick Operations Inquiries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(cat.query)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/40 transition"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot (e.g. 'check insulin buffer', 'compare diversion ports', 'help')..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputQuery.trim()}
              className="btn-primary text-xs py-3 px-5 disabled:opacity-50 flex items-center gap-1.5 font-bold"
            >
              <span>Ask Copilot</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* MCP Tool Registry Tab */
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Active Model Context Protocol (MCP) Tool Server Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mcpToolsList.map((tool, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="mono text-xs font-bold text-cyan-300">mcp_tool:{tool.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
