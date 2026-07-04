"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  Menu, Plus, Bell, LogOut, Sparkles, 
  Settings2, History, LayoutDashboard, Database, Shield, Cpu,
  Upload, Key, Info, X, Palette, Volume2,
  Sun, Moon, Monitor
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

interface AuthenticatedHeaderProps {
  loginEmail: string;
  isPro: boolean;
  onLogout: () => Promise<void>;
  onTriggerPricing: () => void;
  onUploadClick: () => void;
  activeTab: "dashboard" | "settings" | "audit";
  setActiveTab: (t: "dashboard" | "settings" | "audit") => void;
  isWorkspaceActive: boolean;
  setIsWorkspaceActive: (a: boolean) => void;
  onSearch: (term: string) => void;
  onMockLogNotification: (action: string, type: string) => void;
  sessionLogsCount: number;
  theme: "emerald" | "cyberpunk" | "sapphire" | "crimson";
  setTheme: (t: "emerald" | "cyberpunk" | "sapphire" | "crimson") => void;
  appearance: "light" | "dark" | "system";
  setAppearance: (a: "light" | "dark" | "system") => void;
}

export function AuthenticatedHeader({
  loginEmail,
  isPro,
  onLogout,
  onTriggerPricing,
  onUploadClick,
  activeTab,
  setActiveTab,
  isWorkspaceActive,
  setIsWorkspaceActive,
  onSearch,
  onMockLogNotification,
  sessionLogsCount,
  theme,
  setTheme,
  appearance,
  setAppearance
}: AuthenticatedHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceWave, setVoiceWave] = useState(false);
  const [voiceText, setVoiceText] = useState("Listening for sub-vocal document command...");
  const [menuDrawerOpen, setMenuDrawerOpen ] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const startVoiceCapture = () => {
    setIsVoiceOpen(true);
    setVoiceWave(true);
    setVoiceText("Listening for sub-vocal document command...");
    setTimeout(() => {
      setVoiceText('Voice parsed: "Analyze core financial vectors"');
      setVoiceWave(false);
      onSearch("financial vectors");
      setTimeout(() => {
        setIsVoiceOpen(false);
      }, 1500);
    }, 2800);
  };
  const systemNotifications = [
    { id: 1, title: "PG Log Auditing Active", time: "Just now", unread: true, desc: "Cloud SQL ledger is writing immutable traces." },
    { id: 2, title: isPro ? "Pro Subscription Valid" : "Sandbox Limit Notice", time: "12 mins ago", unread: false, desc: isPro ? "Advanced model quotas active." : "Pro upgrade is available." },
    { id: 3, title: "Firebase Token Hydrated", time: "1 hour ago", unread: false, desc: "Google Federated handshake completed successfully." }
  ];

  return (
    <header className="w-full bg-[#0f0f0f] border-b border-white/[0.08] sticky top-0 z-50 text-slate-100 select-none">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setMenuDrawerOpen(true)}
            className="p-2 hover:bg-white/[0.08] rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            id="nav-hamburger"
          >
            <Menu size={18} />
          </button>
          
          {/* Logo with YouTube play-button styling translated for PDFPRO */}
          <div 
            onClick={() => setIsWorkspaceActive(false)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-lg font-display font-bold tracking-tight text-white flex items-center">
              Pdf<span className="text-emerald-500 font-normal">pro</span>
            </span>
          </div>
        </div>

        {/* CENTER SECTION - YouTube style search bar */}
        <div className="flex-1 max-w-[640px] hidden md:flex items-center gap-3">
          
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Theme Selector Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2.5 hover:bg-white/[0.08] rounded-full text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Change Workspace Appearance & Accent"
            >
              <Palette size={16} className={
                theme === "emerald" ? "text-emerald-400" :
                theme === "sapphire" ? "text-blue-400" :
                theme === "cyberpunk" ? "text-pink-400" :
                "text-rose-400"
              } />
            </button>

            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 text-left font-sans text-xs"
                >
                  {/* Section 1: Appearance Mode */}
                  <div className="px-3.5 py-2 border-b border-white/5 font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Appearance
                  </div>
                  <div className="p-1 flex flex-col gap-0.5 border-b border-white/5">
                    {[
                      { value: "light", label: "Light Theme", icon: Sun },
                      { value: "dark", label: "Dark Theme", icon: Moon },
                      { value: "system", label: "System Default", icon: Monitor }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAppearance(opt.value as any)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          appearance === opt.value ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <opt.icon size={13} className={appearance === opt.value ? "text-emerald-400" : "text-slate-500"} />
                          <span>{opt.label}</span>
                        </div>
                        {appearance === opt.value && (
                          <span className="text-[9px] text-emerald-400 font-mono">ACTIVE</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Section 2: Color Accent */}
                  <div className="px-3.5 py-2 border-b border-white/5 font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Color Accent
                  </div>
                  <div className="p-1 flex flex-col gap-0.5">
                    {[
                      { value: "emerald", label: "Emerald", colorClass: "bg-emerald-500" },
                      { value: "sapphire", label: "Sapphire", colorClass: "bg-blue-500" },
                      { value: "cyberpunk", label: "Cyberpunk", colorClass: "bg-pink-500" },
                      { value: "crimson", label: "Crimson", colorClass: "bg-rose-500" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setTheme(opt.value as any);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          theme === opt.value ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${opt.colorClass}`} />
                          <span>{opt.label}</span>
                        </div>
                        {theme === opt.value && (
                          <span className="text-[9px] text-emerald-400 font-mono">ACTIVE</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 bg-[#212121] hover:bg-[#303030] active:scale-[0.98] border border-white/[0.06] text-xs text-white px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer font-sans"
          >
            <Plus size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Notifications bell */}
          <div className="relative" ref={notifyRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 hover:bg-white/[0.08] rounded-full text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-emerald-400 rounded-full" />
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-[#1f1f1f] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-1 z-50 text-left font-sans"
                >
                  <div className="px-4 py-2.5 border-b border-white/5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Audit Notifications</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">System Clear</span>
                  </div>
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {systemNotifications.map((notif) => (
                      <div key={notif.id} className="p-3.5 hover:bg-white/[0.02] flex flex-col gap-1 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">{notif.title}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border border-white/20 text-slate-950 flex items-center justify-center font-bold text-xs tracking-tight shadow-lg shadow-emerald-500/5 cursor-pointer hover:opacity-90 select-none transition-opacity shrink-0"
            >
              {loginEmail ? loginEmail.substring(0, 2).toUpperCase() : "US"}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-[#1f1f1f] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 text-left font-sans text-xs"
                >
                  <div className="p-4 border-b border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Active Partner Handshake</span>
                    <div className="text-xs text-white font-semibold truncate font-mono">{loginEmail}</div>
                    <div className="text-[10px] text-slate-400 italic">Enterprise account active</div>
                  </div>

                  <div className="p-1.5 flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsWorkspaceActive(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <LayoutDashboard size={14} className="text-emerald-400" />
                      <span>Security Workspace Hub</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onTriggerPricing();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Enterprise Model Scaling</span>
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors flex items-center gap-2 text-slate-300 cursor-pointer mt-1.5 pt-2 border-t border-white/5"
                    >
                      <LogOut size={14} className="text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      {/* PERSISTENT DRAWER SIDE NAVIGATION */}
      <AnimatePresence>
        {menuDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 cursor-pointer"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-72 h-full bg-[#0f0f0f] border-r border-white/10 flex flex-col z-50 p-6 text-left shrink-0 select-none shadow-2xl"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6 font-display font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-white text-base font-bold">Pdfpro Console</span>
                </div>
                <button 
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-1 hover:bg-white/15 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Navigation list */}
              <div className="flex flex-col gap-2 flex-grow">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setIsWorkspaceActive(false);
                    setMenuDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider text-left transition-all ${
                    activeTab === "dashboard" && !isWorkspaceActive
                      ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/10" 
                      : "bg-white/5 hover:bg-white/10 text-slate-400"
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>HOME</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setIsWorkspaceActive(false);
                    setMenuDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider text-left transition-all ${
                    activeTab === "settings" && !isWorkspaceActive
                      ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/10" 
                      : "bg-white/5 hover:bg-white/10 text-slate-400"
                  }`}
                >
                  <Settings2 size={14} />
                  <span>DEFAULT MODEL</span>
                </button>
                <button
                  onClick={() => {
                    setIsWorkspaceActive(true);
                    setMenuDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wider text-left transition-all mt-4 ${
                    isWorkspaceActive
                      ? "bg-emerald-600 text-white font-semibold shadow-lg" 
                      : "bg-white/[0.02] border border-white/5 hover:bg-white/10 text-slate-300"
                  }`}
                >
                  <Volume2 size={14} className="text-emerald-400 animate-pulse" />
                  <span>ACTIVE CONVERSATION</span>
                </button>
              </div>

              {/* Drawer footer info */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2 font-mono text-[9px] text-slate-500 uppercase font-semibold">
                <div className="flex items-center justify-between">
                  <span>Cloud SQL Instance</span>
                  <span className="text-emerald-400">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Firebase Handshake</span>
                  <span className="text-emerald-400">Synchronized</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
