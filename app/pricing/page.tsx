"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, ArrowLeft, Zap, CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="text-sm font-mono text-slate-500 animate-pulse">Initializing Pricing Plans Sandbox...</div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    // Save Pro mode in local storage and navigate back
    if (typeof window !== "undefined") {
      localStorage.setItem("pdfpro_is_pro", "true");
    }
    // Go back to the applet landing view
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-4xl w-full flex flex-col gap-8 z-10">
        {/* Back navigation */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors self-start cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>BACK TO HOME PAGE</span>
        </button>

        <div className="text-center">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold mb-2">Platform Upgrades</p>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mb-2">
            Pricing Plans & Tokens
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Upgrade your sandbox credentials to unlock advanced multi-format context windows and high-priority Gemini models.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mt-4">
          {/* Base Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">SANDBOX BASIC</span>
                <span className="text-xs bg-slate-900 border border-white/5 px-2.5 py-1 rounded-full text-slate-400">Current</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl md:text-4xl font-display font-bold text-white">Rs.0</span>
                <span className="text-xs text-slate-500">/ user</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2.5">
                  <Check className="text-emerald-500 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-350 font-sans">Access to Gemini 3.5 Flash Model</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="text-emerald-500 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-350 font-sans">Real-time database authorization firewall</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="text-emerald-500 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-350 font-sans">Basic PostgreSQL (Cloud SQL) audit ledger</span>
                </div>
              </div>
            </div>

            <button
              disabled
              className="py-3.5 px-6 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider mt-8 border border-white/5 block text-center"
            >
              Default Sandbox Active
            </button>
          </motion.div>

          {/* Pro Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl bg-white/[0.04] border border-emerald-500/30 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/5"
          >
            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20">
              POPULAR
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">SANDBOX PRO</span>
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 flex items-center gap-1">
                  <Zap size={10} />
                  <span>PREMIUM</span>
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl md:text-4xl font-display font-bold text-white">Rs.5900</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-200 font-sans font-medium">Access to Gemini 3.5 Pro Ultra Model</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-200 font-sans font-medium">Unlimited Context tokens (1.04M limit)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-200 font-sans font-medium">Deep-dive structural text insights</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={15} />
                  <span className="text-xs text-slate-200 font-sans font-medium">Dedicated high-speed SQL proxy pipelines</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              className="py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold uppercase tracking-wider mt-8 block text-center transition-all shadow-xl shadow-emerald-500/15 cursor-pointer hover:scale-[1.01]"
            >
              Sign-On with Pro sandbox
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
