import React, { useState } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Cpu,
  Layers,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Thermometer,
  Anchor,
  Truck,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { postCopilotQuery } from '../services/api';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApproval: () => void;
  isRerouted: boolean;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  onOpenApproval,
  isRerouted,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: any }>>([
    {
      sender: 'assistant',
      text: `Hello! I am SupplyGuard AI Copilot, your autonomous supply-chain operations assistant.

I am connected to the Model Context Protocol (MCP) server with live telemetry across 18 vessels and $2.75M USD in cargo.

Ask me any specific question about the Mumbai strike, cold-chain temperature buffer, alternative diversion ports, or fleet dispatch!`,
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
  const [showPromptGuide, setShowPromptGuide] = useState<boolean>(false);

  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lIdx} className="h-1.5" />;
      }

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const cleanLine = isBullet ? trimmed.substring(2) : trimmed;

      // Parse bold tags **...** into strong tags and strip raw asterisks
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={lIdx} className={`${isBullet ? 'flex items-start gap-2 ml-1 my-1' : 'my-1'}`}>
          {isBullet && <span className="text-cyan-400 mt-1 text-[8px] flex-shrink-0">•</span>}
          <div className="flex-1">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                const inner = part.slice(2, -2).replace(/\*/g, '');
                return (
                  <strong key={pIdx} className="font-bold text-white">
                    {inner}
                  </strong>
                );
              }
              // Remove any stray unclosed or lone asterisks
              const cleanPart = part.replace(/\*/g, '');
              return <span key={pIdx}>{cleanPart}</span>;
            })}
          </div>
        </div>
      );
    });
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-slate-950 border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  SupplyGuard Autonomous Copilot
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  MCP Spine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Context-Aware Intent Engine • Real-Time Telemetry Relays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptGuide(!showPromptGuide)}
              className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showPromptGuide
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Prompt</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prompt Guide Slide-down Banner */}
        {showPromptGuide && (
          <div className="my-3 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-slate-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-amber-300 pb-1 border-b border-amber-500/20">
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Prompting Guide: How to Get Precise Answers
              </span>
              <button
                onClick={() => setShowPromptGuide(false)}
                className="text-slate-400 hover:text-white text-[11px]"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              For fastest results, mention an <strong>asset ID, port name, or specific operational metric</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div
                onClick={() => {
                  handleSend('Check temperature and buffer time for shipment SHP-PHARMA-1001');
                  setShowPromptGuide(false);
                }}
                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <strong className="text-cyan-300 block">Cold Chain Query</strong>
                  <span className="text-slate-400">"Check temperature for SHP-PHARMA-1001"</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300" />
              </div>

              <div
                onClick={() => {
                  handleSend('Compare Nhava Sheva (JNPT) vs Mundra for diversion');
                  setShowPromptGuide(false);
                }}
                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <strong className="text-emerald-300 block">Port Comparison</strong>
                  <span className="text-slate-400">"Compare JNPT vs Mundra for diversion"</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300" />
              </div>

              <div
                onClick={() => {
                  handleSend('Find nearest available refrigerated trucks with battery > 80%');
                  setShowPromptGuide(false);
                }}
                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <strong className="text-indigo-300 block">Fleet Dispatch</strong>
                  <span className="text-slate-400">"Find available reefer trucks at JNPT"</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300" />
              </div>

              <div
                onClick={() => {
                  handleSend('Simulate 72-hour financial demurrage cascade');
                  setShowPromptGuide(false);
                }}
                className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <strong className="text-rose-300 block">Demurrage Risk</strong>
                  <span className="text-slate-400">"Simulate 72h financial demurrage cascade"</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-300" />
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md shadow-indigo-600/30 font-medium'
                    : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none shadow-xl'
                }`}
              >
                <div className="leading-relaxed text-slate-200">
                  {renderFormattedMessage(m.text)}
                </div>

                {/* Clickable Follow-Up Suggestions returned by Copilot */}
                {m.sender === 'assistant' && m.data?.suggested_prompts && m.data.suggested_prompts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Suggested Follow-Up Prompts:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {m.data.suggested_prompts.map((p: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(p)}
                          disabled={isLoading}
                          className="text-left text-[11px] p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 transition flex items-center justify-between group"
                        >
                          <span>💡 {p}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Button inside Copilot */}
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
            <div className="flex items-center gap-2 text-xs text-cyan-400 py-3 px-2 bg-slate-900/50 rounded-xl border border-white/5 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing query against real-time MCP toolchain...</span>
            </div>
          )}
        </div>

        {/* Quick Category Chips Bar */}
        <div className="pt-2 pb-3 border-t border-white/10">
          <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Quick Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(cat.query)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/40 transition"
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
            placeholder="Ask Copilot (e.g. 'check insulin buffer', 'compare ports', 'help')..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputQuery.trim()}
            className="btn-primary text-xs px-4 py-2.5 disabled:opacity-50 flex items-center gap-1.5 font-bold"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
