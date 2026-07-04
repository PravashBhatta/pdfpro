"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleAuthProvider } from "@/src/lib/firebase-client";
import { LandingView } from "@/components/LandingView";
import { PublicLandingView } from "@/components/PublicLandingView";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { MCQQuizView } from "@/components/MCQQuizView";
import { 
  FileText, Upload, BrainCircuit, Terminal, ArrowLeft,
  Download, Trash2, Send
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // AUTH STATE
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings" | "audit">("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<string>("Demo JWT Sandbox");
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // WORKSPACE CONFIG
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [theme, setTheme] = useState<'emerald' | 'cyberpunk' | 'sapphire' | 'crimson'>("emerald");
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('dark');
  const [activeModel, setActiveModel] = useState<string>("gemini-3.5-flash");
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [isPro, setIsPro] = useState<boolean>(false);

  // DOCS STATE
  const [documents, setDocuments] = useState<{ id: string; name: string; content: string; size: string }[]>([
    {
      id: "doc-sample-1",
      name: "enterprise-architecture-brief.txt",
      content: "Pdfpro Enterprise Sandbox Environment.\nThis multi-tenant infrastructure enables secure isolated model access, validated by relational database logs and real-time Firebase Auth tokens.",
      size: "2.4 KB"
    },
    {
      id: "doc-sample-2",
      name: "compliance-checklist.txt",
      content: "Compliance Mandate details:\n- Encrypt all PII data sets.\n- Maintain an auditable query trace in Cloud SQL (PostgreSQL).\n- Validate custom credentials via federated single sign-on constraints.",
      size: "1.8 KB"
    }
  ]);
  const [activeDocId, setActiveDocId] = useState<string>("doc-sample-1");
  const [activePage, setActivePage] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // CHAT STATE
  const [chatHistory, setChatHistory] = useState<{ [docId: string]: { sender: "user" | "ai"; text: string; time: string }[] }>({
    "doc-sample-1": [
      { sender: "ai", text: "Enterprise context synced successfully. Ask me any analytical queries about **enterprise-architecture-brief.txt**.", time: "10:14 AM" }
    ],
    "doc-sample-2": [
      { sender: "ai", text: "Compliance constraints audited. Ask me any validation checks on **compliance-checklist.txt**.", time: "10:15 AM" }
    ]
  });
  const [chatInput, setChatInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState<boolean>(false);

  // LEDGER AUDITS
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
 
  // MCQ QUIZ STATE
  const [activeSubView, setActiveSubView] = useState<"document" | "mcq">("document");
  const [isGeneratingMcq, setIsGeneratingMcq] = useState<boolean>(false);
  const [mcqs, setMcqs] = useState<{ [docId: string]: any[] }>({});
  const [mcqAnswers, setMcqAnswers] = useState<{ [docId: string]: { [questionIndex: number]: number } }>({});
  const [mcqSubmitted, setMcqSubmitted] = useState<{ [docId: string]: boolean }>({});
  const [mcqError, setMcqError] = useState<string>("");

  // DOM Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-Sync Preference modifications to PG
  const updatePreferencesOnServer = async (pref: any) => {
    try {
      const token = auth.currentUser 
        ? await auth.currentUser.getIdToken() 
        : localStorage.getItem("pdfpro_bypass_active") === "true"
        ? "mock-bypass-token"
        : null;
      if (!token) return;

      await fetch("/api/auth/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(pref),
      });
    } catch (err) {
      console.warn("Preference auto-sync postponed: ", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && (auth.currentUser || localStorage.getItem("pdfpro_bypass_active") === "true")) {
      const timer = setTimeout(() => {
        updatePreferencesOnServer({
          theme,
          activeModel,
          customApiKey,
          isPro
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [theme, activeModel, customApiKey, isPro, isLoggedIn]);

  // Load appearance on mount
  useEffect(() => {
    const saved = localStorage.getItem("pdfpro_appearance");
    if (saved === "light" || saved === "dark" || saved === "system") {
      setAppearance(saved);
    }
  }, []);

  // Update appearance in localStorage and documentElement classes
  useEffect(() => {
    localStorage.setItem("pdfpro_appearance", appearance);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (appearance === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(appearance);
    }
  }, [appearance]);

  // Auth observer
  useEffect(() => {
    if (localStorage.getItem("pdfpro_bypass_active") === "true") {
      setIsLoggedIn(true);
      setLoginEmail(localStorage.getItem("pdfpro_bypass_email") || "pravashbhatta20@gmail.com");
      setAuthMethod("Developer Bypass Sandbox");
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setLoginEmail(firebaseUser.email || "pravashbhatta20@gmail.com");
        setAuthMethod("Google Federated Auth");
        localStorage.setItem("pdfpro_logged_in", "true");
        localStorage.removeItem("pdfpro_bypass_active");

        // Sync with Postgres & load saved configurations
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success && data.user) {
            if (data.user.theme) {
              setTheme(data.user.theme === "light" ? "emerald" : data.user.theme);
            }
            if (data.user.activeModel) {
              setActiveModel(data.user.activeModel);
            }
            if (data.user.customApiKey) {
              setCustomApiKey(data.user.customApiKey);
            }
            setIsPro(data.user.isPro);
          }
        } catch (err) {
          console.error("Cloud SQL state synchronization deferred: ", err);
        }

        // Write audit entry
        logSessionAction("Secure authentication handshake mapped successfully", "AUTH", "SUCCESS");
      } else {
        if (localStorage.getItem("pdfpro_bypass_active") === "true") {
          return;
        }
        setIsLoggedIn(false);
        setAuthMethod("Demo JWT Sandbox");
        localStorage.removeItem("pdfpro_logged_in");
        setTheme("emerald");
        setActiveModel("gemini-3.5-flash");
        setCustomApiKey("");
        setIsPro(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch session audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        const data = await response.json();
        if (data.success && data.logs) {
          setSessionLogs(data.logs);
        }
      } catch (err) {
        console.warn("Ledger refresh deferred.");
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll logs every 5 seconds
    return () => clearInterval(interval);
  }, [isWorkspaceActive]);

  // Handle client-side logs writer
  async function logSessionAction(action: string, type: string, status: string) {
    try {
      const token = auth.currentUser 
        ? await auth.currentUser.getIdToken() 
        : localStorage.getItem("pdfpro_bypass_active") === "true"
        ? "mock-bypass-token"
        : null;
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ type, action, status }),
      });
    } catch (err) {
      console.warn("Ledger transaction deferred.");
    }
  }

  // MCQ quiz generation dispatcher
  const triggerMcqGeneration = async () => {
    setIsGeneratingMcq(true);
    setMcqError("");
    logSessionAction(`Dispatched MCQ generation request for ${activeDoc.name}`, "AI", "SUCCESS");

    try {
      const response = await fetch("/api/gemini/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: activeDoc.content,
          model: activeModel,
          customApiKey
        })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setMcqs(prev => ({
        ...prev,
        [activeDocId]: data.questions
      }));
      setMcqAnswers(prev => ({
        ...prev,
        [activeDocId]: {}
      }));
      setMcqSubmitted(prev => ({
        ...prev,
        [activeDocId]: false
      }));

      logSessionAction(`Generated 5 structured MCQs successfully for ${activeDoc.name}`, "AI", "SUCCESS");
    } catch (err: any) {
      console.error("MCQ generation failed: ", err);
      setMcqError(err.message || "Failed to generate quiz. Please check API credentials.");
      logSessionAction(`MCQ generation failed for ${activeDoc.name}: ${err.message}`, "AI", "ERROR");
    } finally {
      setIsGeneratingMcq(false);
    }
  };


  // Handle manual login
  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.includes("@") || loginEmail.length < 5) {
      setAuthError("Please present a valid enterprise email credential.");
      return;
    }
    if (loginPassword.length < 6) {
      setAuthError("Password must contain at least 6 characters.");
      return;
    }
    setIsAuthenticating(true);
    setAuthError("");

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-email") {
        try {
          await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
          logSessionAction(`Platform user registered: ${loginEmail}`, "AUTH", "SUCCESS");
        } catch (regErr: any) {
          if (regErr.code === "auth/unauthorized-domain") {
            setAuthError("Unauthorized Domain: Please access via 'http://localhost:3000' (not '127.0.0.1'), authorize this domain in Firebase Console, or use 'Bypass Auth (Dev Sandbox)'.");
          } else {
            setAuthError(regErr.message || "Credential validation failed. Please try again.");
          }
        }
      } else if (err.code === "auth/unauthorized-domain") {
        setAuthError("Unauthorized Domain: Please access via 'http://localhost:3000' (not '127.0.0.1'), authorize this domain in Firebase Console, or use 'Bypass Auth (Dev Sandbox)'.");
      } else {
        setAuthError(err.message || "Enterprise credential handshake failed.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Google SS0
  const handleOAuthReal = async () => {
    setIsAuthenticating(true);
    setAuthError("");
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error("Federated Google sign-in failed:", err);
      if (err.code === "auth/unauthorized-domain") {
        setAuthError("Unauthorized Domain: Please access via 'http://localhost:3000' (not '127.0.0.1'), authorize this domain in Firebase Console, or use 'Bypass Auth (Dev Sandbox)'.");
      } else {
        setAuthError(err.message || "Google Federated authentication failed.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Get active documents details
  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0]!;

  // Download Chat History Handler
  const handleDownloadChat = (format: "markdown" | "json") => {
    const history = chatHistory[activeDocId] || [];
    if (history.length === 0) {
      logSessionAction(`Empty chat history download attempt for ${activeDoc.name}`, "SYSTEM", "SUCCESS");
      return;
    }

    let fileContent = "";
    let mimeType = "";
    let fileExtension = "";

    if (format === "markdown") {
      fileContent = `# Chat History: ${activeDoc.name}\n\nGenerated by Pdfpro on ${new Date().toLocaleString()}\n\n`;
      history.forEach((msg) => {
        const senderLabel = msg.sender === "user" ? "USER" : "PDFPRO AI";
        fileContent += `### [${msg.time}] **${senderLabel}**\n${msg.text}\n\n---\n\n`;
      });
      mimeType = "text/markdown;charset=utf-8;";
      fileExtension = "md";
    } else {
      fileContent = JSON.stringify(history, null, 2);
      mimeType = "application/json;charset=utf-8;";
      fileExtension = "json";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `chat_${activeDoc.name.replace(/\.[^/.]+$/, "")}.${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logSessionAction(`Downloaded chat history for ${activeDoc.name} as ${format.toUpperCase()}`, "USER", "SUCCESS");
    setIsDownloadDropdownOpen(false);
  };

  // Clear Chat History Handler
  const handleClearChat = () => {
    setChatHistory(prev => ({
      ...prev,
      [activeDocId]: [
        { sender: "ai", text: `Analytical chat session restarted for **${activeDoc.name}**. History wiped.`, time: "Just now" }
      ]
    }));
    logSessionAction(`Cleared conversation history for ${activeDoc.name}`, "USER", "SUCCESS");
  };

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const docSizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    const newDocId = `doc-${Date.now()}`;

    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/pdf/parse", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to extract PDF text from server.");
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const text = data.text || "No text content found in PDF.";

        setDocuments(prev => [...prev, {
          id: newDocId,
          name: file.name,
          content: text,
          size: docSizeStr
        }]);

        setChatHistory(prev => ({
          ...prev,
          [newDocId]: [
            { sender: "ai", text: `Active intelligence node established: **${file.name}** (${data.pages} pages). What insights can I run for you?`, time: "Just now" }
          ]
        }));

        setActiveDocId(newDocId);
        logSessionAction(`Uploaded and parsed PDF intelligence node: ${file.name} (${docSizeStr})`, "SYSTEM", "SUCCESS");
      } catch (err: any) {
        console.error("PDF parsing failed: ", err);
        logSessionAction(`Failed to parse PDF document: ${file.name}. ${err.message || ""}`, "SYSTEM", "SUCCESS");
      } finally {
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || "";

        setDocuments(prev => [...prev, {
          id: newDocId,
          name: file.name,
          content: text,
          size: docSizeStr
        }]);

        setChatHistory(prev => ({
          ...prev,
          [newDocId]: [
            { sender: "ai", text: `Active intelligence node established: **${file.name}**. What insights can I run for you?`, time: "Just now" }
          ]
        }));

        setActiveDocId(newDocId);
        setIsUploading(false);
        logSessionAction(`Uploaded active intelligence node: ${file.name} (${docSizeStr})`, "SYSTEM", "SUCCESS");
      };

      reader.readAsText(file);
    }
  };

  // Dispatch questions
  const dispatchQuestion = async (presetText?: string, mode: "chat" | "mcq" = "chat", mcqCount = 5) => {
    const query = presetText || chatInput;
    if (!query.trim()) return;

    if (!presetText) setChatInput("");

    // Append to conversation history
    const conversation = chatHistory[activeDocId] || [];
    const updatedConversation = [...conversation, { sender: "user" as const, text: query, time: "Just now" }];
    
    setChatHistory(prev => ({
      ...prev,
      [activeDocId]: updatedConversation
    }));

    setIsGenerating(true);
    logSessionAction(
      mode === "mcq"
        ? `Dispatched MCQ generation request: "${query.substring(0, 45)}..."`
        : `Dispatched query: "${query.substring(0, 45)}..."`,
      "AI",
      "SUCCESS"
    );

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          model: activeModel,
          customApiKey,
          context: activeDoc.content,
          mode,
          questionCount: mcqCount,
        })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setChatHistory(prev => ({
        ...prev,
        [activeDocId]: [...updatedConversation, { sender: "ai" as const, text: data.text, time: "Just now" }]
      }));
    } catch (err: any) {
      setChatHistory(prev => ({
        ...prev,
        [activeDocId]: [...updatedConversation, { sender: "ai" as const, text: `⚠️ Generation postponed: ${err.message}`, time: "Just now" }]
      }));
      logSessionAction(`Generation failure: ${err.message}`, "AI", "ERROR");
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Client hydration check to prevent SSR context mismatches during next build
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="text-sm font-mono text-slate-500 animate-pulse">Initializing Workspace Security Sandbox...</div>
      </div>
    );
  }

  // Auth gate page
  if (!isLoggedIn) {
    return (
      <PublicLandingView
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        authError={authError}
        isAuthenticating={isAuthenticating}
        onLocalSubmit={handleLocalSubmit}
        onOAuthReal={handleOAuthReal}
        onTriggerPricing={() => router.push("/pricing")}
        onBypassLogin={async () => {
          localStorage.setItem("pdfpro_bypass_active", "true");
          localStorage.setItem("pdfpro_bypass_email", "pravashbhatta20@gmail.com");
          setIsLoggedIn(true);
          setLoginEmail("pravashbhatta20@gmail.com");
          setAuthMethod("Developer Bypass Sandbox");
          try {
            const response = await fetch("/api/auth/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer mock-bypass-token`
              }
            });
            const data = await response.json();
            if (data.success && data.user) {
              if (data.user.theme) setTheme(data.user.theme === "light" ? "emerald" : data.user.theme);
              if (data.user.activeModel) setActiveModel(data.user.activeModel);
              if (data.user.customApiKey) setCustomApiKey(data.user.customApiKey);
              setIsPro(data.user.isPro);
            }
          } catch (err) {
            console.error("Cloud SQL state synchronization deferred: ", err);
          }
          logSessionAction("Bypass developer handshake successful", "AUTH", "SUCCESS");
        }}
        theme={theme}
        setTheme={setTheme}
        appearance={appearance}
        setAppearance={setAppearance}
      />
    );
  }

  // Define search filtrations
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = sessionLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active Workspace layout with global persistent header
  const themeBorderGlow = 
    theme === "emerald" ? "border-emerald-500/20" :
    theme === "sapphire" ? "border-blue-500/20" :
    theme === "cyberpunk" ? "border-pink-500/20" :
    "border-red-500/20";

  const textAccent =
    theme === "emerald" ? "text-emerald-400" :
    theme === "sapphire" ? "text-blue-400" :
    theme === "cyberpunk" ? "text-pink-400" :
    "text-rose-400";

  const bgAccent =
    theme === "emerald" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" :
    theme === "sapphire" ? "bg-blue-500/10 text-blue-400 border-blue-500/25" :
    theme === "cyberpunk" ? "bg-pink-500/10 text-pink-400 border-pink-500/25" :
    "bg-rose-500/10 text-rose-400 border-rose-500/25";

  return (
    <div className={`min-h-screen ${isWorkspaceActive ? "h-screen overflow-hidden" : ""} bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden`}>
      <AuthenticatedHeader
        loginEmail={loginEmail}
        isPro={isPro}
        onLogout={async () => {
          try {
            await signOut(auth);
            setIsLoggedIn(false);
            setIsWorkspaceActive(false);
            localStorage.removeItem("pdfpro_logged_in");
            localStorage.removeItem("pdfpro_bypass_active");
            localStorage.removeItem("pdfpro_bypass_email");
          } catch (err) {
            console.error("Sign out error: ", err);
          }
        }}
        onTriggerPricing={() => router.push("/pricing")}
        onUploadClick={() => {
          setIsWorkspaceActive(true);
          setTimeout(() => {
            fileInputRef.current?.click();
          }, 100);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWorkspaceActive={isWorkspaceActive}
        setIsWorkspaceActive={setIsWorkspaceActive}
        onSearch={(term) => setSearchQuery(term)}
        onMockLogNotification={(action, type) => logSessionAction(action, type, "SUCCESS")}
        sessionLogsCount={sessionLogs.length}
        theme={theme}
        setTheme={setTheme as any}
        appearance={appearance}
        setAppearance={setAppearance}
      />

      <div className={`flex-1 flex flex-col ${isWorkspaceActive ? "overflow-hidden" : ""}`}>
        {isWorkspaceActive ? (
          <div id="active-space" className="flex-1 flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Document rail */}
            <div id="document-rail" className="w-full md:w-80 border-r border-white/10 bg-white/[0.01] flex flex-col shrink-0">
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setIsWorkspaceActive(false)}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>LEAVE HUB</span>
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase truncate max-w-[120px]">
                  {activeModel}
                </span>
              </div>

              <div className="p-4 border-b border-white/10 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Conversation</span>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Upload size={12} />
                    <span>UPLOAD</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.pdf" 
                  className="hidden" 
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {filteredDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setActiveDocId(doc.id);
                      logSessionAction(`Flipped context focus: ${doc.name}`, "SYSTEM", "SUCCESS");
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      activeDocId === doc.id
                        ? "bg-white/5 border-emerald-500/30"
                        : "bg-transparent border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs text-white font-semibold truncate block flex items-center gap-1.5">
                      <FileText size={13} className={activeDocId === doc.id ? "text-emerald-400" : "text-slate-500"} />
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono italic">{doc.size}</span>
                  </button>
                ))}
                {filteredDocuments.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500 italic font-mono mt-4">No matching documents found.</div>
                )}
              </div>
            </div>

            {/* Analytical Workspace */}
            <div id="dashboard-core" className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar Workspace */}
              <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-white/[0.01] shrink-0">
                <div className="flex items-center gap-3">
                  <BrainCircuit size={16} className="text-emerald-400" />
                  <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 truncate max-w-[200px] md:max-w-none">
                    file name: <span className="text-white hover:underline">{activeDoc.name}</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Download Chat Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase transition-colors hover:text-white cursor-pointer"
                      title="Download chat history"
                    >
                      <Download size={11} className="text-emerald-400" />
                      <span>Download Chat</span>
                    </button>

                    <AnimatePresence>
                      {isDownloadDropdownOpen && (
                        <>
                          {/* Invisible Clickable Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setIsDownloadDropdownOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute right-0 mt-1.5 w-40 bg-[#121212] border border-white/10 rounded-lg shadow-xl overflow-hidden py-1 z-40 text-left font-mono text-[10px]"
                          >
                            <button
                              onClick={() => handleDownloadChat("markdown")}
                              className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              Markdown (.md)
                            </button>
                            <button
                              onClick={() => handleDownloadChat("json")}
                              className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 hover:text-white transition-colors border-t border-white/5 cursor-pointer"
                            >
                              JSON (.json)
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clear Chat Button */}
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] text-rose-400 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase transition-all cursor-pointer"
                    title="Clear current workspace chat"
                  >
                    <Trash2 size={11} />
                    <span>Clear Chat</span>
                  </button>

                  {(() => {
                    if (!customApiKey) return false;
                    try {
                      const keys = JSON.parse(customApiKey);
                      return !!(keys.gemini || keys.openrouter || keys.xai);
                    } catch (e) {
                      return !!customApiKey;
                    }
                  })() && (
                    <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] text-emerald-400 font-mono">
                      <Terminal size={11} />
                      <span>Custom API Key Active</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Body Container */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Context/Document Content Viewer / MCQ Panel */}
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto flex flex-col gap-4">
                  {/* Tab Selector Header */}
                  <div className="flex items-center justify-between shrink-0 border-b border-white/10 pb-2.5">
                    <div className="flex gap-4">
                     
                      <button
                        onClick={() => setActiveSubView("mcq")}
                        className={`text-[10px] font-mono font-bold uppercase tracking-widest pb-1 transition-all cursor-pointer border-b flex items-center gap-1.5 ${
                          activeSubView === "mcq"
                            ? "text-emerald-400 border-emerald-500"
                            : "text-slate-500 border-transparent hover:text-slate-300"
                        }`}
                      >
                        <BrainCircuit size={11} />
                        MCQ Quiz
                      </button>
                    </div>

                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                      {activeSubView === "document" ? "Context Map" : "Assessments Engine"}
                    </span>
                  </div>

                  {activeSubView === "document" ? (
                    <div className="flex-1 bg-white/[0.02] border border-white/5 p-6 rounded-2xl overflow-y-auto text-xs font-mono leading-relaxed text-slate-300">
                      {activeDoc.content.split("\n").map((line, idx) => (
                        <p key={idx} className="mb-2">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                      <MCQQuizView
                        activeDocName={activeDoc.name}
                        activeDocId={activeDocId}
                        isGenerating={isGeneratingMcq}
                        questions={mcqs[activeDocId] ?? null}
                        answers={mcqAnswers[activeDocId] ?? {}}
                        isSubmitted={mcqSubmitted[activeDocId] ?? false}
                        error={mcqError}
                        onGenerate={triggerMcqGeneration}
                        onSelectAnswer={(qIdx, optIdx) => {
                          setMcqAnswers(prev => ({
                            ...prev,
                            [activeDocId]: { ...prev[activeDocId], [qIdx]: optIdx }
                          }));
                        }}
                        onSubmit={() => {
                          const docMcqs = mcqs[activeDocId] || [];
                          const docAnswers = mcqAnswers[activeDocId] || {};
                          const score = docMcqs.reduce((acc: number, q: any, idx: number) =>
                            acc + (docAnswers[idx] === q.correctIndex ? 1 : 0), 0
                          );
                          setMcqSubmitted(prev => ({ ...prev, [activeDocId]: true }));
                          logSessionAction(`MCQ quiz submitted for ${activeDoc.name}: ${score}/${docMcqs.length}`, "USER", "SUCCESS");
                        }}
                        onRetake={() => {
                          setMcqAnswers(prev => ({ ...prev, [activeDocId]: {} }));
                          setMcqSubmitted(prev => ({ ...prev, [activeDocId]: false }));
                        }}
                        onRegenerate={triggerMcqGeneration}
                        themeAccent={theme}
                      />
                    </div>
                  )}
                </div>

                {/* Conversation Window */}
                <div className="w-full md:w-[480px] flex flex-col shrink-0 bg-white/[0.005] overflow-hidden">
                  {/* Message History flow */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {(chatHistory[activeDocId] || []).map((msg, idx) => (
                      <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
                        <span className="text-[9px] font-mono text-slate-500 mb-1">{msg.time}</span>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? `${bgAccent} font-semibold font-sans`
                            : "bg-white/5 border border-white/10 text-slate-200"
                        }`}>
                          {msg.sender === "ai" ? (
                            <MarkdownRenderer content={msg.text} />
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex flex-col items-start max-w-[85%]">
                        <span className="text-[9px] font-mono text-slate-500 mb-1">Executing query...</span>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 italic text-xs animate-pulse font-mono flex items-center gap-2">
                          <Terminal size={12} className="animate-spin" />
                          <span>Pdfpro is generating intelligence response...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input controls */}
                  <div className="p-4 border-t border-white/10 shrink-0 bg-slate-950 flex flex-col gap-2.5">
                    {/* Suggestions block */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => dispatchQuestion("Summarize context insights")}
                        className="py-1 px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-400 font-semibold cursor-pointer transition-colors"
                      >
                        Summarize Assets
                      </button>
                      
                      
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") dispatchQuestion();
                        }}
                        placeholder="Perform analytical queries on context..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/30"
                      />
                      <button
                        onClick={() => dispatchQuestion()}
                        disabled={isGenerating || !chatInput.trim()}
                        className="absolute right-2 top-1.5 p-2 rounded-lg text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 disabled:hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <LandingView
            isLoggedIn={isLoggedIn}
            isPro={isPro}
            loginEmail={loginEmail}
            onLogout={async () => {
              try {
                await signOut(auth);
                setIsLoggedIn(false);
                setIsWorkspaceActive(false);
                localStorage.removeItem("pdfpro_logged_in");
              } catch (err) {
                console.error("Sign out error: ", err);
              }
            }}
            onTriggerPricing={() => router.push("/pricing")}
            sessionLogs={filteredLogs}
            authMethod={authMethod}
            theme={theme}
            setTheme={setTheme}
            activeModel={activeModel}
            setActiveModel={setActiveModel}
            customApiKey={customApiKey}
            setCustomApiKey={setCustomApiKey}
            onStartWorkspace={() => setIsWorkspaceActive(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
}
