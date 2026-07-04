"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit, Sparkles, AlertCircle, CheckCircle2,
  XCircle, RotateCcw, RefreshCw, Trophy, ChevronRight, 
  ChevronLeft, Zap, Activity, Cpu
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MCQQuizViewProps {
  activeDocName: string;
  activeDocId?: string;
  isGenerating: boolean;
  questions: MCQQuestion[] | null;
  answers: { [qIdx: number]: number };
  isSubmitted: boolean;
  error: string;
  onGenerate: () => void;
  onSelectAnswer: (qIdx: number, optIdx: number) => void;
  onSubmit: () => void;
  onRetake: () => void;
  onRegenerate: () => void;
  themeAccent?: "emerald" | "sapphire" | "cyberpunk" | "crimson";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

// ==========================================
// COMPONENT 1: MCQ QUIZ VIEW
// ==========================================
export function MCQQuizView({
  activeDocName,
  isGenerating,
  questions,
  answers,
  isSubmitted,
  error,
  onGenerate,
  onSelectAnswer,
  onSubmit,
  onRetake,
  onRegenerate,
  themeAccent = "emerald",
}: MCQQuizViewProps) {
  const [prevQuestions, setPrevQuestions] = useState(questions);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showExplanation, setShowExplanation] = useState<{ [k: number]: boolean }>({});

  if (questions !== prevQuestions) {
    setPrevQuestions(questions);
    setActiveQuestion(0);
    setShowExplanation({});
  }

  const totalQ = questions?.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQ && totalQ > 0;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isGenerating || isSubmitted || !questions) return;

    if (e.key === "ArrowRight" && activeQuestion < totalQ - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else if (e.key === "ArrowLeft" && activeQuestion > 0) {
      setActiveQuestion((prev) => prev - 1);
    }

    const optionIndex = ["1", "2", "3", "4"].indexOf(e.key);
    if (optionIndex !== -1 && optionIndex < questions[activeQuestion].options.length) {
      onSelectAnswer(activeQuestion, optionIndex);
    }
  }, [isGenerating, isSubmitted, questions, activeQuestion, totalQ, onSelectAnswer]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const score = questions
    ? questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0), 0)
    : 0;
  const scorePercent = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;

  if (isGenerating) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: mcqStyles }} />
        <div className={`mcq-container theme-${themeAccent} mcq-loading-state`}>
          <motion.div 
            animate={{ scale: [0.9, 1.1, 0.9] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="mcq-loading-orb"
          >
            <BrainCircuit size={48} className="mcq-spin-icon" />
          </motion.div>
          <div className="mcq-loading-text">
            <h3>Generating Your Quiz</h3>
            <p>Analyzing document context and crafting targeted questions...</p>
          </div>
        </div>
      </>
    );
  }

  if (!questions) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: mcqStyles }} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mcq-container theme-${themeAccent} mcq-empty-state`}
        >
          <div className="mcq-empty-icon">
            <Sparkles size={32} />
          </div>
          <div className="mcq-empty-text">
            <h3>Knowledge Check</h3>
            <p>
              Generate <strong>5 interactive questions</strong> based on{" "}
              <em className="mcq-doc-name">{activeDocName}</em> to validate your understanding.
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mcq-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="mcq-features-grid">
            {[
              { icon: "🎯", label: "Targeted", desc: "Sourced directly from text" },
              { icon: "⚡", label: "Instant Feedback", desc: "Real-time grading" },
              { icon: "💡", label: "Deep Dives", desc: "Detailed explanations" },
            ].map((f, i) => (
              <div key={i} className="mcq-feature-card">
                <span className="mcq-feature-icon">{f.icon}</span>
                <span className="mcq-feature-label">{f.label}</span>
                <span className="mcq-feature-desc">{f.desc}</span>
              </div>
            ))}
          </div>

          <button onClick={onGenerate} className="mcq-generate-btn">
            <Zap size={18} /> Generate Quiz
          </button>
        </motion.div>
      </>
    );
  }

  if (isSubmitted) {
    const grade =
      scorePercent >= 80 ? { label: "Excellent!", cls: "success", emoji: "🏆" } :
      scorePercent >= 60 ? { label: "Good Job!", cls: "warning", emoji: "⭐" } :
      { label: "Keep Practicing", cls: "danger", emoji: "📚" };

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: mcqStyles }} />
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mcq-container theme-${themeAccent} mcq-results-wrapper`}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className={`mcq-score-card grade-${grade.cls}`}>
            <div className="mcq-score-left">
              <span className="mcq-score-emoji">{grade.emoji}</span>
              <div>
                <div className="mcq-score-grade">{grade.label}</div>
                <div className="mcq-score-detail">{score} out of {totalQ} correct</div>
              </div>
            </div>
            <div className="mcq-score-ring-wrap">
              <svg className="mcq-ring-svg" viewBox="0 0 64 64">
                <circle className="mcq-ring-track" cx="32" cy="32" r="26" />
                <circle className="mcq-ring-fill" cx="32" cy="32" r="26" style={{ strokeDashoffset: `${163 - (163 * scorePercent) / 100}` }} />
              </svg>
              <span className="mcq-ring-label">{scorePercent}%</span>
            </div>
          </motion.div>

          <div className="mcq-review-list">
            {questions.map((q, qIdx) => {
              const sel = answers[qIdx];
              const correct = sel === q.correctIndex;
              const show = showExplanation[qIdx] ?? false;

              return (
                <motion.div key={qIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qIdx * 0.05 }} className={`mcq-review-card ${correct ? "review-correct" : "review-wrong"}`}>
                  <div className="mcq-review-header">
                    <div className="mcq-review-status">
                      {correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      <span className="mcq-review-qnum">Q{qIdx + 1}</span>
                    </div>
                    <p className="mcq-review-question">{q.question}</p>
                  </div>

                  <div className="mcq-review-options">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = oIdx === q.correctIndex;
                      const isSelectedOpt = sel === oIdx;
                      return (
                        <div key={oIdx} className={`mcq-review-opt ${isCorrectOpt ? "opt-correct" : isSelectedOpt ? "opt-wrong" : "opt-neutral"}`}>
                          <span className="mcq-opt-label">{OPTION_LABELS[oIdx]}</span>
                          <span>{opt}</span>
                          {isCorrectOpt && <CheckCircle2 size={16} className="ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  <button className="mcq-explain-toggle" onClick={() => setShowExplanation(prev => ({ ...prev, [qIdx]: !show }))}>
                    {show ? "Hide" : "Show"} Explanation
                  </button>

                  <AnimatePresence>
                    {show && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mcq-explanation">
                        <span className="mcq-explanation-label">💡 Explanation</span>
                        <p>{q.explanation}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="mcq-footer">
            <button onClick={onRetake} className="mcq-btn-secondary"><RotateCcw size={16} /> Retake Quiz</button>
            <button onClick={onRegenerate} className="mcq-btn-outline"><RefreshCw size={16} /> New Questions</button>
          </div>
        </motion.div>
      </>
    );
  }

  const currentQ = questions[activeQuestion];
  const currentAnswer = answers[activeQuestion];
  const progressPct = (answeredCount / totalQ) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mcqStyles }} />
      <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mcq-container theme-${themeAccent} mcq-quiz-wrapper`}>
        <div className="mcq-progress-header">
          <div className="mcq-progress-meta">
            <span className="mcq-progress-label">Question {activeQuestion + 1} of {totalQ}</span>
            <span className="mcq-answered-badge">{answeredCount}/{totalQ} answered</span>
          </div>
          <div className="mcq-progress-track">
            <motion.div className="mcq-progress-fill" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="mcq-question-dots">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setActiveQuestion(i)} className={`mcq-dot ${answers[i] !== undefined ? "mcq-dot-answered" : ""} ${activeQuestion === i ? "mcq-dot-active" : ""}`} title={`Question ${i + 1}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="mcq-question-card">
            <div className="mcq-question-header">
              <h4 className="mcq-question-text">{currentQ.question}</h4>
            </div>

            <div className="mcq-options-list">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = currentAnswer === oIdx;
                return (
                  <motion.button key={oIdx} whileTap={{ scale: 0.99 }} onClick={() => onSelectAnswer(activeQuestion, oIdx)} className={`mcq-option-btn ${isSelected ? "selected" : "idle"}`}>
                    <span className={`mcq-option-circle ${isSelected ? "circle-selected" : ""}`}>{OPTION_LABELS[oIdx]}</span>
                    <span className="mcq-option-text">{opt}</span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mcq-option-check">
                        <CheckCircle2 size={18} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mcq-nav-footer">
          <button disabled={activeQuestion === 0} onClick={() => setActiveQuestion(q => q - 1)} className="mcq-nav-btn">
            <ChevronLeft size={16} /> Previous
          </button>
          {activeQuestion < totalQ - 1 ? (
            <button onClick={() => setActiveQuestion(q => q + 1)} className="mcq-nav-btn mcq-nav-next">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={onSubmit} disabled={!allAnswered} className={`mcq-submit-btn ${allAnswered ? "active" : "disabled"}`}>
              <Trophy size={16} /> Submit Quiz
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}


// ==========================================
// EMBEDDED STYLES WITH MEDIA QUERIES
// ==========================================
const mcqStyles = `
.mcq-container {
  --primary: #00E58F; 
  --primary-light: rgba(0, 229, 143, 0.08);
  --bg-color: #0A0E17;
  --text-main: #E2E8F0;
  --text-muted: #94A3B8;
  --border-color: #1E293B;
  
  width: 100%;
  margin: 0 auto;
  font-family: inherit;
  color: var(--text-main);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.7);
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .mcq-container {
    padding: 16px;
    border-radius: 12px;
  }
}

.theme-sapphire { --primary: #3b82f6; --primary-light: rgba(59, 130, 246, 0.1); }
.theme-cyberpunk { --primary: #ec4899; --primary-light: rgba(236, 72, 153, 0.1); }
.theme-crimson { --primary: #f43f5e; --primary-light: rgba(244, 63, 94, 0.1); }

.mcq-container button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.mcq-container button:disabled { cursor: not-allowed; opacity: 0.4; }

.mcq-loading-state, .mcq-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 48px 16px;
}
.mcq-loading-orb { color: var(--primary); }
.mcq-empty-icon {
  background: var(--primary-light);
  color: var(--primary);
  padding: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 229, 143, 0.15);
}
.mcq-empty-text h3 { margin: 0 0 8px; font-size: 1.3rem; font-weight: 700; color: #fff; }
.mcq-empty-text p { margin: 0; color: var(--text-muted); line-height: 1.6; font-size: 0.95rem; }
.mcq-doc-name { color: var(--primary); font-weight: 600; font-style: normal; }

.mcq-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  width: 100%;
  margin-top: 12px;
}
@media (max-width: 480px) {
  .mcq-features-grid {
    grid-template-columns: 1fr;
  }
}
.mcq-feature-card {
  background: #0D1524;
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.mcq-feature-label { font-weight: 600; font-size: 0.9rem; color: #fff; }
.mcq-feature-desc { font-size: 0.8rem; color: var(--text-muted); text-align: center; }

.mcq-generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: #030508;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  margin-top: 16px;
  box-shadow: 0 4px 14px rgba(0, 229, 143, 0.2);
}
.mcq-generate-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

.mcq-progress-header { margin-bottom: 24px; }
.mcq-progress-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}
.mcq-answered-badge { color: var(--text-muted); }
.mcq-progress-track {
  height: 6px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}
.mcq-progress-fill { height: 100%; background: var(--primary); border-radius: 4px; }
.mcq-question-dots { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.mcq-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-color); padding: 0; }
.mcq-dot-answered { background: rgba(0, 229, 143, 0.4); }
.mcq-dot-active { background: var(--primary); transform: scale(1.25); }

.mcq-question-card { margin-bottom: 24px; }
.mcq-question-text { font-size: 1.15rem; font-weight: 600; line-height: 1.5; margin: 0; color: #fff; }

.mcq-options-list { display: flex; flex-direction: column; gap: 12px; }
.mcq-option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #0D1524;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  text-align: left;
  width: 100%;
}
.mcq-option-btn:hover:not(.selected) { border-color: #334155; background: #121B2C; }
.mcq-option-btn.selected { border-color: var(--primary); background: var(--primary-light); }
.mcq-option-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #1E293B;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-muted);
  flex-shrink: 0;
}
.circle-selected { background: var(--primary); color: #030508; }
.mcq-option-text { flex: 1; font-size: 0.95rem; color: var(--text-main); line-height: 1.4; }
.mcq-option-check { color: var(--primary); flex-shrink: 0; }

.mcq-nav-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 18px;
  gap: 12px;
}
.mcq-nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
}
.mcq-nav-btn:hover:not(:disabled) { background: #1E293B; color: #fff; }
.mcq-nav-next { color: #fff; background: #1E293B; }

.mcq-submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
}
.mcq-submit-btn.active { background: var(--primary); color: #030508; }
.mcq-submit-btn.disabled { background: #1E293B; color: #475569; }

.mcq-score-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  color: white;
  gap: 16px;
}
@media (max-width: 480px) {
  .mcq-score-card {
    flex-direction: column;
    text-align: center;
  }
  .mcq-score-left {
    flex-direction: column;
  }
}
.mcq-score-card.grade-success { background: linear-gradient(135deg, #059669, #047857); }
.mcq-score-card.grade-warning { background: linear-gradient(135deg, #d97706, #b45309); }
.mcq-score-card.grade-danger { background: linear-gradient(135deg, #e11d48, #be123c); }

.mcq-score-left { display: flex; align-items: center; gap: 16px; }
.mcq-score-emoji { font-size: 2.2rem; }
.mcq-score-grade { font-size: 1.35rem; font-weight: 700; }
.mcq-score-detail { font-size: 0.9rem; opacity: 0.85; margin-top: 2px; }

.mcq-score-ring-wrap { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
.mcq-ring-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
.mcq-ring-track { fill: transparent; stroke: rgba(255,255,255,0.15); stroke-width: 5; }
.mcq-ring-fill {
  fill: transparent; stroke: white; stroke-width: 5;
  stroke-dasharray: 163; stroke-linecap: round;
  transition: stroke-dashoffset 1s ease-out;
}
.mcq-ring-label {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
}

.mcq-review-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.mcq-review-card { border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; background: #070B12; }
.mcq-review-header { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.mcq-review-status { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.9rem; }
.review-correct .mcq-review-status { color: #10b981; }
.review-wrong .mcq-review-status { color: #f43f5e; }
.mcq-review-question { margin: 0; font-weight: 600; line-height: 1.5; font-size: 1rem; color: #fff; }

.mcq-review-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.mcq-review-opt { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; font-size: 0.9rem; }
.opt-correct { background: rgba(16, 185, 129, 0.06); color: #a7f3d0; border: 1px solid rgba(16, 185, 129, 0.3); }
.opt-wrong { background: rgba(244, 63, 94, 0.06); color: #fecdd3; border: 1px dashed rgba(244, 63, 94, 0.3); }
.opt-neutral { background: #0D1524; color: var(--text-muted); border: 1px solid transparent; }
.mcq-opt-label { font-weight: 700; color: #fff; }

.mcq-explain-toggle { background: transparent; color: var(--primary); font-size: 0.85rem; font-weight: 600; padding: 0; text-align: left; }
.mcq-explain-toggle:hover { text-decoration: underline; }
.mcq-explanation { margin-top: 12px; padding: 12px; background: #121B2C; border-radius: 8px; font-size: 0.85rem; color: var(--text-main); line-height: 1.5; border-left: 3px solid var(--primary); }
.mcq-explanation-label { display: block; font-weight: 700; margin-bottom: 2px; color: var(--text-muted); }

.mcq-footer { display: flex; gap: 12px; justify-content: flex-end; }
.mcq-btn-secondary, .mcq-btn-outline { display: flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }
.mcq-btn-secondary { background: #1E293B; color: white; }
.mcq-btn-secondary:hover { background: #334155; }
.mcq-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); }
.mcq-btn-outline:hover { background: #0D1524; color: #fff; }

.mcq-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  color: #fda4af;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
}
`;