"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, Key, LayoutDashboard, Settings2, 
  Sparkles, ArrowRight, LogOut, CheckCircle,
  Cpu, Database, Activity, HardDrive, History
} from "lucide-react";

interface LandingViewProps {
  isLoggedIn: boolean;
  isPro: boolean;
  loginEmail: string; // Kept in interface to prevent breaking parent component
  onLogout: () => Promise<void>;
  onTriggerPricing: () => void;
  sessionLogs: { id: number; type: string; action: string; status: string; createdAt: string }[];
  authMethod: string; // Kept in interface to prevent breaking parent component
  theme: 'emerald' | 'cyberpunk' | 'sapphire' | 'crimson' ;
  setTheme: (t: 'emerald' | 'cyberpunk' | 'sapphire' | 'crimson') => void;
  activeModel: string;
  setActiveModel: (m: string) => void;
  customApiKey: string;
  setCustomApiKey: (k: string) => void;
  onStartWorkspace: () => void;
  activeTab: "dashboard" | "settings" | "audit";
  setActiveTab: (t: "dashboard" | "settings" | "audit") => void;
}

export function LandingView({
  isLoggedIn,
  isPro,
  onLogout,
  onTriggerPricing,
  sessionLogs,
  theme,
  setTheme,
  activeModel,
  setActiveModel,
  customApiKey,
  setCustomApiKey,
  onStartWorkspace,
  activeTab,
  setActiveTab,
}: LandingViewProps) {
  const themes = [
    { key: "emerald" as const, label: "Emerald Slate", color: "bg-emerald-500" },
    { key: "sapphire" as const, label: "Sapphire Midnight", color: "bg-blue-500" },
    { key: "cyberpunk" as const, label: "Neon Cyberpunk", color: "bg-pink-500" },
    { key: "crimson" as const, label: "Crimson Eclipse", color: "bg-red-500" },
  ];

  let geminiKey = "";
  let openrouterKey = "";
  let xaiKey = "";
  try {
    const keys = JSON.parse(customApiKey || "{}");
    geminiKey = keys.gemini || "";
    openrouterKey = keys.openrouter || "";
    xaiKey = keys.xai || "";
  } catch (e) {
    geminiKey = customApiKey || "";
  }

  const updateKey = (type: "gemini" | "openrouter" | "xai", val: string) => {
    const updated = {
      gemini: type === "gemini" ? val : geminiKey,
      openrouter: type === "openrouter" ? val : openrouterKey,
      xai: type === "xai" ? val : xaiKey,
    };
    setCustomApiKey(JSON.stringify(updated));
  };

  const models = [
    { key: "gemini-3.5-flash", label: "Gemini 3.5 Flash", desc: "Optimal speed & prompt cost efficiency" },
    { key: "gemini-3.5-pro", label: "Gemini 3.5 Pro", desc: "Top tier intelligence for extreme research workflows" },
    { key: "openrouter-gemma-4", label: "Gemma 4 (26b)", desc: "Google's lightweight instruction-tuned model via OpenRouter" },
    { key: "openrouter-gpt-oss-120b", label: "GPT-OSS (120b)", desc: "OpenAI's open-weights 120B parameter model via OpenRouter" },
    { key: "openrouter-nemotron-3", label: "Nemotron-3 Ultra (550b)", desc: "NVIDIA's massive 550B parameter reasoning model via OpenRouter" },
  ];

  const themeStyles = {
    emerald: {
      text: "text-emerald-400",
      border: "border-emerald-500/20 data-[active=true]:border-emerald-500/50 focus:border-emerald-500/40",
      button: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/15",
      tabActive: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",
      glow: "bg-emerald-500/5",
      iconBg: "bg-emerald-500/10"
    },
    sapphire: {
      text: "text-blue-400",
      border: "border-blue-500/20 data-[active=true]:border-blue-500/50 focus:border-blue-500/40",
      button: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/15",
      tabActive: "bg-blue-600 text-white shadow-lg shadow-blue-600/20",
      glow: "bg-blue-500/5",
      iconBg: "bg-blue-500/10"
    },
    cyberpunk: {
      text: "text-pink-400",
      border: "border-pink-500/20 data-[active=true]:border-pink-500/50 focus:border-pink-500/40",
      button: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/15",
      tabActive: "bg-pink-600 text-white shadow-lg shadow-pink-600/20",
      glow: "bg-pink-500/5",
      iconBg: "bg-pink-500/10"
    },
    crimson: {
      text: "text-red-400",
      border: "border-red-500/20 data-[active=true]:border-red-500/50 focus:border-red-500/40",
      button: "bg-red-600 hover:bg-red-500 text-white shadow-red-600/15",
      tabActive: "bg-red-600 text-white shadow-lg shadow-red-600/20",
      glow: "bg-red-500/5",
      iconBg: "bg-red-500/10"
    }
  };

  const activeStyle = themeStyles[theme] || themeStyles.emerald;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-10 font-sans select-none text-slate-200">
      
      {/* Header & Hero Area */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 backdrop-blur-sm"
      >
        <div className={`absolute top-0 right-0 w-96 h-96 ${activeStyle.glow} rounded-full blur-3xl pointer-events-none transition-all duration-700 -mr-20 -mt-20`} />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Pdfpro Workspace</h1>
            {isPro ? (
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider">
                PRO ACTIVE
              </span>
            ) : (
              <button 
                onClick={onTriggerPricing}
                className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10 hover:border-white/20"
              >
                UPGRADE PLAN
              </button>
            )}
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Your centralized intelligence hub. Process documents, manage vector embeddings, and orchestrate multi-model AI workflows with enterprise-grade security.
          </p>
        </div>
        
        <div className="relative z-10 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartWorkspace}
            className={`px-8 py-4 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-3 w-full md:w-auto cursor-pointer ${activeStyle.button}`}
          >
            <span>Get Started</span>
            <Sparkles size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Interface */}
      <div className="flex flex-col gap-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2.5 py-2.5 px-5 rounded-xl text-xs font-mono tracking-wider transition-all ${
                activeTab === "dashboard" ? activeStyle.tabActive : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>OVERVIEW</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2.5 py-2.5 px-5 rounded-xl text-xs font-mono tracking-wider transition-all ${
                activeTab === "settings" ? activeStyle.tabActive : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings2 size={16} />
              <span>CONFIGURATION</span>
            </button>
          </div>
          {isLoggedIn && (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all text-xs font-mono tracking-wider"
            >
              <LogOut size={14} />
              <span>DISCONNECT</span>
            </button>
          )}
        </div>
        {/* Dynamic Content Panel */}
        <div className="w-full relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                    <div className={`w-10 h-10 rounded-lg ${activeStyle.iconBg} flex items-center justify-center`}>
                      <Activity className={activeStyle.text} size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">System Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-lg font-semibold text-white">Online & Stable</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                    <div className={`w-10 h-10 rounded-lg ${activeStyle.iconBg} flex items-center justify-center`}>
                      <Cpu className={activeStyle.text} size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">Active Engine</span>
                      <div className="mt-1">
                        <span className="text-lg font-semibold text-white">{models.find(m => m.key === activeModel)?.label || "None"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                    <div className={`w-10 h-10 rounded-lg ${activeStyle.iconBg} flex items-center justify-center`}>
                      <HardDrive className={activeStyle.text} size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">Context Window</span>
                      <div className="mt-1">
                        <span className="text-lg font-semibold text-white">1.04M Tokens</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                  <div className={`absolute right-0 bottom-0 w-64 h-64 ${activeStyle.glow} rounded-full blur-3xl pointer-events-none`} />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-2">Ready to orchestrate data?</h3>
                    <p className="text-sm text-slate-400 max-w-md">
                      Initialize your workspace to begin querying documents, extracting schemas, and leveraging large language models in a secure sandbox.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartWorkspace}
                    className={`shrink-0 px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer ${activeStyle.button}`}
                  >
                    <span>Open Workspace</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8 p-8 rounded-3xl bg-white/[0.02] border border-white/5"
              >
                {/* Visual Theme Settings */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Interface Aesthetics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {themes.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTheme(t.key)}
                        className={`flex flex-col items-start gap-3 p-4 rounded-xl transition-all border ${
                          theme === t.key 
                            ? `bg-white/5 text-slate-100 ${activeStyle.border} shadow-sm` 
                            : "bg-transparent border-white/5 hover:bg-white/5 text-slate-400"
                        }`}
                        data-active={theme === t.key}
                      >
                        <span className={`h-4 w-4 rounded-full shadow-inner ${t.color}`} />
                        <span className="text-xs font-mono font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine Routing Settings */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Default Routing Engine
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {models.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setActiveModel(m.key)}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          activeModel === m.key
                            ? `bg-white/5 text-white ${activeStyle.border}`
                            : "bg-transparent border-white/10 text-slate-400 hover:bg-white/5"
                        }`}
                        data-active={activeModel === m.key}
                      >
                        <span className="text-sm font-semibold block mb-1.5 flex items-center gap-2">
                          {activeModel === m.key && <CheckCircle size={14} className={activeStyle.text} />}
                          {m.label}
                        </span>
                        <span className="text-xs block opacity-80 leading-relaxed text-slate-400">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "audit" && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        <Database size={16} className={activeStyle.text} />
                        Ledger Transactions
                      </h2>
                      <p className="text-slate-400 text-xs">
                        Immutable historical records of system operations and routing queries.
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                      Total Entries: {sessionLogs.length}
                    </div>
                  </div>

                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <div className="bg-white/5 px-6 py-3.5 text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold grid grid-cols-12 gap-4 items-center border-b border-white/10">
                      <span className="col-span-2">Origin</span>
                      <span className="col-span-8">Payload Description</span>
                      <span className="col-span-2 text-right">Result Code</span>
                    </div>

                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                      {sessionLogs.length === 0 ? (
                        <div className="p-12 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                          <History size={32} className="opacity-20" />
                          <span>The transaction ledger is currently empty.</span>
                        </div>
                      ) : (
                        sessionLogs.map((log) => (
                          <div key={log.id} className="px-6 py-4 text-xs font-mono grid grid-cols-12 gap-4 items-center hover:bg-white/[0.03] transition-colors">
                            <span className={`col-span-2 font-bold ${
                              log.type === "AI" ? "text-amber-400" :
                              log.type === "AUTH" ? "text-blue-400" : activeStyle.text
                            }`}>
                              [{log.type}]
                            </span>
                            <span className="col-span-8 text-slate-300 truncate pr-4">{log.action}</span>
                            <span className={`col-span-2 font-bold text-right flex items-center justify-end gap-1.5 ${
                              log.status === "ERROR" ? "text-rose-400" : "text-emerald-400"
                            }`}>
                              {log.status === "ERROR" ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              )}
                              {log.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default LandingView;