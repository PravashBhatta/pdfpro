"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BrainCircuit, FileText, Sparkles, ArrowRight, CheckCircle2, 
  ShieldCheck, Terminal, Cpu, Shield, Key, AlertCircle, Lock, 
  ChevronRight, Database, Eye, Search, Layers,
  ChevronDown, GraduationCap, Briefcase, ShieldAlert, FolderSync, HelpCircle,
  Palette, Sun, Moon, Monitor
} from "lucide-react";

interface PublicLandingViewProps {
  loginEmail: string;
  setLoginEmail: (e: string) => void;
  loginPassword: string;
  setLoginPassword: (p: string) => void;
  authError: string;
  isAuthenticating: boolean;
  onLocalSubmit: (e: React.FormEvent) => void;
  onOAuthReal: () => Promise<void>;
  onTriggerPricing: () => void;
  onBypassLogin: () => void;
  theme: "emerald" | "cyberpunk" | "sapphire" | "crimson";
  setTheme: (t: "emerald" | "cyberpunk" | "sapphire" | "crimson") => void;
  appearance: "light" | "dark" | "system";
  setAppearance: (a: "light" | "dark" | "system") => void;
}

export function PublicLandingView({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  authError,
  isAuthenticating,
  onLocalSubmit,
  onOAuthReal,
  onTriggerPricing,
  onBypassLogin,
  theme,
  setTheme,
  appearance,
  setAppearance
}: PublicLandingViewProps) {
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"students" | "researchers" | "professionals">("students");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeStyles = {
    emerald: {
      text: "text-emerald-400",
      text500: "text-emerald-500",
      borderDirect: "border-emerald-500/20",
      borderHover: "hover:border-emerald-500/20",
      borderFocus: "focus:border-emerald-500/30",
      button: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10",
      glow: "bg-emerald-500/5",
      glowBg: "bg-emerald-500/10",
      shadow: "shadow-emerald-500/5",
      gradient: "from-emerald-500 via-teal-400 to-emerald-600",
      textGradient: "from-emerald-400 to-teal-300"
    },
    sapphire: {
      text: "text-blue-400",
      text500: "text-blue-500",
      borderDirect: "border-blue-500/20",
      borderHover: "hover:border-blue-500/20",
      borderFocus: "focus:border-blue-500/30",
      button: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/15",
      glow: "bg-blue-500/5",
      glowBg: "bg-blue-500/10",
      shadow: "shadow-blue-600/5",
      gradient: "from-blue-600 via-indigo-500 to-blue-700",
      textGradient: "from-blue-400 to-indigo-300"
    },
    cyberpunk: {
      text: "text-pink-400",
      text500: "text-pink-500",
      borderDirect: "border-pink-500/20",
      borderHover: "hover:border-pink-500/20",
      borderFocus: "focus:border-pink-500/30",
      button: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/15",
      glow: "bg-pink-500/5",
      glowBg: "bg-pink-500/10",
      shadow: "shadow-pink-600/5",
      gradient: "from-pink-600 via-purple-500 to-pink-700",
      textGradient: "from-pink-400 to-purple-300"
    },
    crimson: {
      text: "text-rose-400",
      text500: "text-rose-500",
      borderDirect: "border-rose-500/20",
      borderHover: "hover:border-rose-500/20",
      borderFocus: "focus:border-rose-500/30",
      button: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/15",
      glow: "bg-rose-500/5",
      glowBg: "bg-rose-500/10",
      shadow: "shadow-rose-600/5",
      gradient: "from-rose-600 via-red-500 to-rose-700",
      textGradient: "from-rose-400 to-red-300"
    }
  };

  const activeStyle = themeStyles[theme || "emerald"] || themeStyles.emerald;

  const stats = [
    { label: "Token Limit", value: "1.04M", desc: "Native context capacity" },
    { label: "Processing", value: "<150ms", desc: "Document parsing speed" },
    { label: "Retrieval", value: "<50ms", desc: "Semantic vector search" }
  ];

  const useCases = {
    students: {
      title: "Accelerate Your Academic Preparation",
      desc: "Upload heavy syllabi, textbooks, or notes. Instantly extract study blueprints, cross-reference complex subjects, or solve specific numerical queries with step-by-step logic tracking.",
      points: ["Generate isolated summaries", "Trace answers to source page references", "Extract practice challenges from lecture content"]
    },
    researchers: {
      title: "Synthesize Literature Reviews Instantly",
      desc: "Converse directly with complex academic papers. Isolate structural methodologies, map background theories, and surface hidden dependencies across extensive multi-page documents.",
      points: ["Map technical definitions across chapters", "Audit baseline data structures", "Cross-verify citation bibliographies"]
    },
    professionals: {
      title: "Audit Executive Reports and Frameworks",
      desc: "Drill down into financial statements, legal contracts, or dense engineering specs. Extract precise metrics and operational milestones without running risk of data leakage.",
      points: ["Isolate hidden clauses instantly", "Reconcile structural line items", "Zero-data retention pipelines for complete security"]
    }
  };

  const faqs = [
    {
      q: "How does the PDF Chatbot answer questions accurately?",
      a: "We utilize Retrieval-Augmented Generation (RAG). Your files are converted into mathematical chunks, indexed in a vector DB, and only the exact matching text segments are routed to the LLM to format a verified, hallucination-free answer."
    },
    {
      q: "Are my uploaded data or documents private?",
      a: "Absolutely. We enforce an isolated ingestion pipeline. Your documents are strictly used for your active chat session, encrypted at rest, and never exposed to public LLM training datasets."
    },
    {
      q: "What file configurations and size caps are supported?",
      a: "We natively parse standard digital PDFs up to 50MB. Complex multi-column layouts, tables, and dense reference material are cleanly broken down via our structural context-aware parsing algorithms."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div id="welcome-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className={`absolute top-[-250px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] ${activeStyle.glowBg} rounded-full blur-[160px] pointer-events-none`} />
      <div className="absolute bottom-[-150px] right-[10%] w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* PERSISTENT BLURRED NAVIGATION BAR */}
      <header id="welcome-navbar" className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg ${activeStyle.shadow}`}>
              <BrainCircuit className={activeStyle.text} size={18} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-white">
              Pdf<span className={`${activeStyle.text500} font-normal`}>pro</span>
            </span>
          </div>

          {/* Quick-links Section */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-full text-xs text-slate-400 font-mono">
            <button 
              onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-1.5 rounded-full hover:text-white transition-colors"
            >
              FEATURES
            </button>
            <button 
              onClick={() => document.getElementById("use-cases-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-1.5 rounded-full hover:text-white transition-colors"
            >
              USE CASES
            </button>
            <button 
              onClick={() => document.getElementById("privacy-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-1.5 rounded-full hover:text-white transition-colors"
            >
              PRIVACY
            </button>
            <button 
              onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-1.5 rounded-full hover:text-white transition-colors"
            >
              FAQ
            </button>
            <button 
              onClick={onTriggerPricing}
              className="px-4 py-1.5 rounded-full hover:text-white transition-colors flex items-center gap-1 text-amber-400/90 hover:text-amber-300"
            >
              <Sparkles size={11} className="animate-pulse" />
              PRICING PLANS
            </button>
          </nav>

          {/* Authentication Gateway Button & Theme Changer */}
          <div className="flex items-center gap-3">
            {/* Theme Selector Dropdown */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="p-2.5 hover:bg-white/[0.08] rounded-full text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                title="Change Workspace Appearance & Accent"
              >
                <Palette size={16} className={activeStyle.text} />
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
                            <opt.icon size={13} className={appearance === opt.value ? activeStyle.text : "text-slate-500"} />
                            <span>{opt.label}</span>
                          </div>
                          {appearance === opt.value && (
                            <span className={`text-[9px] ${activeStyle.text} font-mono`}>ACTIVE</span>
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
                            <span className={`text-[9px] ${activeStyle.text} font-mono`}>ACTIVE</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsAuthOpen(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all hover:scale-[1.01] shadow-lg cursor-pointer ${activeStyle.button}`}
            >
            Get Started
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow">
        <section id="hero-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest mb-6"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Pdfpro is live and ready
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white max-w-4xl leading-tight"
          >
            Chat with your documents in seconds. Unleash <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Deep Analytical Intelligence</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-slate-400 text-sm sm:text-base max-w-2xl mt-6 leading-relaxed"
          >
            Instantly upload your architecture files, textbooks, or complex guidelines. Pdfpro automatically processes contexts, performs lightning-fast vector mappings, and yields grounded responses accompanied by real-time citations.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-wrap justify-center items-center gap-4 mt-10"
          >
            <button
              onClick={() => setIsAuthOpen(true)}
              className="group flex items-center justify-center gap-2 py-3.5 px-7 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider font-mono transition-all cursor-pointer hover:border-emerald-500/20"
            >
              <span>Get Started Now</span>
              <ArrowRight size={13} className="text-emerald-400 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => document.getElementById("use-cases-section")?.scrollIntoView({ behavior: "smooth" })}
              className="py-3.5 px-6 rounded-xl border border-transparent hover:border-white/5 text-slate-400 hover:text-slate-200 text-xs font-semibold lowercase tracking-wide transition-all"
            >
              View targeted use cases
            </button>
          </motion.div>

          {/* Interactive Document Drop Mockup Graphic */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl mt-16 p-2 rounded-3xl bg-white/[0.01] border border-white/15 backdrop-blur-3xl shadow-2xl relative"
          >
            <div className="absolute -top-12 -left-12 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Window chrome header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                <span className="ml-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <Terminal size={10} className="text-emerald-400" />
                  WORKSPACE CONSOLE
                </span>
              </div>
              <div className="text-[10px]">VECTOR INDEX ACTIVE</div>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-950/40 rounded-b-2xl overflow-hidden min-h-[300px]">
              <div className="border-r border-white/[0.05] p-4 text-left flex flex-col gap-3">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Loaded Contexts</div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                  <FileText size={13} className="text-emerald-400" />
                  literature_review_v2.pdf
                </div>
                <div className="p-3 rounded-xl border border-white/[0.02] text-[11px] font-mono text-slate-500 flex items-center gap-2 opacity-50">
                  <FileText size={13} />
                  project-bibliography.pdf
                </div>
              </div>

              <div className="col-span-2 p-6 text-left flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 font-mono leading-relaxed">
                  <span className="text-[10px] font-semibold text-emerald-400 block mb-1">SYSTEM READY:</span>
                  Document parsed. 142 distinct chunks mapped to vector index spaces. The pipeline is isolated and optimized for strict semantic accuracy.
                </div>
                
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                    <Database size={11} className="text-emerald-400" />
                    Vector DB: [Connected]
                  </div>
                  <div className="h-10 rounded-xl bg-white/5 border border-white/5 flex items-center px-4 justify-between text-xs text-slate-500 font-mono">
                    <span>Summarize the main core methodology analyzed inside this text...</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* METRICS STATS */}
        <section className="border-t border-white/5 bg-white/[0.01] py-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/[0.02] hover:border-white/5 transition-all text-center">
                <span className="text-2xl font-bold text-white font-mono block">{s.value}</span>
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 mt-1 block">{s.label}</span>
                <span className="text-xs text-slate-500 mt-1 block">{s.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-3">Core Technical Architecture</h2>
            <p className="text-slate-400 text-xs">
              Built specifically to streamline engineering and academic file lookups without missing semantic structural linkages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Cpu className="text-emerald-400" size={18} />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Multi-Model Pipelines</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Seamless switching between high-efficiency engines for brief summarization and deeper reasoning frameworks for heavy analytical tasks.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Layers className="text-blue-400" size={18} />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Intelligent Chunking</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Documents are split dynamically based on layout hierarchy rather than plain text sizes, keeping continuous definitions unbroken.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Search className="text-purple-400" size={18} />
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Grounded Retrieval</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Queries target custom embedded spaces to limit out-of-context assumptions, ensuring responses match uploaded source material.
              </p>
            </div>
          </div>
        </section>

        {/* NEW ADDITION: INTERACTIVE ROLE-BASED USE CASES */}
        <section id="use-cases-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase">Versatility Spec</span>
            <h2 className="text-2xl font-display font-bold text-white mt-2">Targeted Workflow Adaptation</h2>
          </div>

          {/* Tab Selection Row */}
          <div className="flex justify-center mb-10">
            <div className="bg-white/[0.02] border border-white/10 p-1 rounded-2xl flex gap-2">
              {(["students", "researchers", "professionals"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                    activeTab === tab 
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab === "students" && <GraduationCap size={14} />}
                  {tab === "researchers" && <Search size={14} />}
                  {tab === "professionals" && <Briefcase size={14} />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Panel */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white">{useCases[activeTab].title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{useCases[activeTab].desc}</p>
              
              <div className="flex flex-col gap-2.5 mt-2">
                {useCases[activeTab].points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2 bg-slate-950 p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[180px]">
              <FolderSync className="text-emerald-400 mb-3 animate-spin" style={{ animationDuration: "6s" }} size={28} />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Workspace Engine Ready</span>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Click start chatting to explore customized file tracking parameters.</p>
            </div>
          </div>
        </section>

        {/* NEW ADDITION: DATA PRIVACY & COMPLIANCE GRID */}
        <section id="privacy-section" className="bg-slate-900/10 border-t border-b border-white/5 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase">Security Framework</span>
              <h2 className="text-2xl font-display font-bold text-white mt-2">Isolated Pipeline Guarantee</h2>
              <p className="text-xs text-slate-400 mt-2">Your analytical assets stay securely in your possession. We never expose text arrays or metadata profiles to public networks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="p-6 bg-slate-950 border border-white/5 rounded-2xl flex flex-col gap-3">
                <ShieldAlert className="text-emerald-400 font-bold" size={20} />
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wide">Zero External Training</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">No ingested files or fine-tuning arrays are shared with commercial models or foundational public networks.</p>
              </div>
              <div className="p-6 bg-slate-950 border border-white/5 rounded-2xl flex flex-col gap-3">
                <Lock className="text-emerald-400" size={20} />
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wide">Encrypted Indexes</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Vector vectorization metrics use end-to-end sandbox storage partitions, preventing information overlaps.</p>
              </div>
              <div className="p-6 bg-slate-950 border border-white/5 rounded-2xl flex flex-col gap-3">
                <Eye className="text-emerald-400" size={20} />
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wide">Volatile Session Logs</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Temporary system memory indices automatically clear out cleanly upon session timeouts or user account disconnects.</p>
              </div>
            </div>
          </div>
        </section>

        {/* NEW ADDITION: FLUID FAQ ACCORDION SECTION */}
        <section id="faq-section" className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <HelpCircle className="text-emerald-400 mx-auto mb-2" size={22} />
            <h2 className="text-2xl font-display font-bold text-white">System Architecture FAQ</h2>
            <p className="text-slate-400 text-xs mt-1">Immediate clear resolutions on indexing configurations and processing rules.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/5 rounded-2xl bg-white/[0.01] overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-mono text-xs text-white hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold tracking-wide uppercase">{faq.q}</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-emerald-400" : ""}`} 
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/[0.02] bg-slate-950/40">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* RAG PIPELINE TERMINAL BRIEF */}
        <section id="how-it-works-section" className="bg-slate-900/20 border-t border-b border-white/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase">Under the Hood</span>
              <h2 className="text-2xl font-display font-bold text-white">Retrieval-Augmented Generation</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you hand over files to the platform, we execute structured layout mapping. Your content is split cleanly into overlapping context blocks to lock down consistency across complex pages.
              </p>
              <div className="flex flex-col gap-3 font-mono text-xs text-slate-300 mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>1. File upload and text extraction.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>2. Context-aware text vectorization.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>3. Semantic similarity search query.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>4. LLM response generation with references.</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 shadow-inner flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">RAG Pipeline Terminal</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="text-slate-500">[INFO] Initializing document parsing sequence...</div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5 opacity-80">
                  <span className="text-[10.5px] font-bold text-emerald-400">[SYSTEM] VECTORIZATION COMPLETE</span>
                  <span className="text-slate-300">File mapped to 384-dimensional vector space</span>
                  <span className="text-[9px] text-zinc-500">2026-06-16T00:15:22.012Z</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5 opacity-80">
                  <span className="text-[10.5px] font-bold text-amber-400">[AI_QUERY] CONTEXT RETRIEVED</span>
                  <span className="text-slate-400">Top 4 relevant document chunks injected into prompt</span>
                  <span className="text-[9px] text-zinc-600">2026-06-16T00:14:10.540Z</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer id="welcome-footer" className="border-t border-white/5 py-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Pdfpro Workspace. Intelligent Document Analysis.</p>
        </div>
      </footer>

      {/* COMPREHENSIVE OVERLAY AUTHENTICATION GLASS MODAL */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="relative max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-xl flex flex-col gap-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-1.5">
                    <Lock className="text-emerald-400" size={16} />
                    Secure Login
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Authenticate to access your personal document workspace.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAuthOpen(false)}
                  className="font-mono text-slate-500 hover:text-white transition-colors text-xs border border-white/10 px-2 py-1 rounded-lg"
                >
                  ESC
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={onLocalSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold font-mono tracking-wider text-slate-400 uppercase">Account Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9.5px] font-bold font-mono tracking-wider text-slate-400 uppercase">Password</label>
                    <span className="text-[9px] text-slate-500 italic">Auto-registers if new</span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 font-semibold"
                  />
                </div>

                {authError && (
                  <div className="text-xs text-rose-400 flex items-center gap-1.5 font-semibold font-mono">
                    <AlertCircle size={12} />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
                >
                  {isAuthenticating ? "Authenticating..." : "Access Workspace"}
                </button>
              </form>

              {/* Federated Single Sign-On */}
              <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">OR SSO</span>
                <button
                  type="button"
                  onClick={async () => {
                    await onOAuthReal();
                    setIsAuthOpen(false);
                  }}
                  disabled={isAuthenticating}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-200 text-xs font-semibold tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Google Sign-In</span>
                </button>
              </div>

              {/* Developer Sandbox Bypass */}
             
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}