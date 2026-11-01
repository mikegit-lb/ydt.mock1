import React, { useState } from 'react';
import {
  Trophy,
  X,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Calculator,
  History,
  BarChart3,
  Trash2,
  RotateCcw,
  Eye
} from 'lucide-react';
import { GRAMMAR_TOPICS, ALL_QUESTIONS } from '../data/questionsData.js';
import { formatDuration } from './HeaderBar.jsx';

export default function ScorecardModal({
  isOpen,
  onClose,
  initialTab = 'scorecard', // 'scorecard' | 'history'
  activeQuestions,
  answers,
  elapsedSeconds,
  scoreHistory,
  onClearHistory,
  onStartNewExam,
  onFilterIncorrect,
}) {
  const [tab, setTab] = useState(initialTab);

  if (!isOpen) return null;

  // Compute current metrics across activeQuestions
  let correct = 0;
  let incorrect = 0;
  let empty = 0;

  activeQuestions.forEach((q) => {
    const ans = answers[q.id];
    if (!ans) {
      empty += 1;
    } else if (ans === q.correctAnswer) {
      correct += 1;
    } else {
      incorrect += 1;
    }
  });

  const netScore = correct - incorrect / 4;
  const accuracy =
    correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

  // Compute breakdown across Grammar Topics + Cloze Section
  const breakdownGroups = [
    ...GRAMMAR_TOPICS.map((t) => ({
      id: t.id,
      label: t.label,
      questions: ALL_QUESTIONS.filter((q) => q.topic === t.id),
    })),
    {
      id: 'CLOZE_ALL',
      label: 'Cloze Tests 1–10 (All 50 Blanks)',
      questions: ALL_QUESTIONS.filter((q) => q.section === 'cloze'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ÖSYM YDT Performance & Score Card
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Formula: Net = Correct − (Incorrect ÷ 4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setTab('scorecard')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                  tab === 'scorecard'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Score Card</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('history')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                  tab === 'history'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({scoreHistory.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {tab === 'scorecard' ? (
            <>
              {/* 4 Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct (Doğru)</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {correct}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 mb-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect (Yanlış)</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-rose-700 dark:text-rose-300">
                    {incorrect}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    <CircleDashed className="w-3.5 h-3.5" />
                    <span>Empty (Boş)</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {empty}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>ÖSYM Net Score</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-indigo-700 dark:text-indigo-300">
                    {netScore.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-mono text-indigo-600/80 dark:text-indigo-400/80">
                    {accuracy}% Accuracy · {formatDuration(elapsedSeconds)}
                  </div>
                </div>
              </div>

              {/* Topic-by-Topic Breakdown */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                  Topic Breakdown Across All 100 Questions
                </h3>
                <div className="space-y-2">
                  {breakdownGroups.map((grp) => {
                    let gCorrect = 0;
                    let gWrong = 0;
                    grp.questions.forEach((q) => {
                      if (answers[q.id] === q.correctAnswer) gCorrect += 1;
                      else if (answers[q.id]) gWrong += 1;
                    });
                    const gNet = gCorrect - gWrong / 4;
                    const pct = Math.round((gCorrect / grp.questions.length) * 100);

                    return (
                      <div
                        key={grp.id}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {grp.label}
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {gCorrect}D
                            </span>
                            <span className="text-rose-600 dark:text-rose-400">
                              {gWrong}Y
                            </span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {gNet.toFixed(2)} Net / {grp.questions.length}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Score History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Saved Mock Exam Attempts ({scoreHistory.length})
                </h3>
                {scoreHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {scoreHistory.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                  No completed Mock Exam attempts yet. Switch to <strong>Mock Exam</strong> mode and click <strong>Finish Test</strong> to record your ÖSYM Net score.
                </div>
              ) : (
                <div className="space-y-2">
                  {scoreHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.scopeLabel} ({item.total} Qs)
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                          {new Date(item.timestamp).toLocaleString()} · Duration:{' '}
                          {formatDuration(item.durationSeconds || 0)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          {item.correct} D
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300">
                          {item.incorrect} Y
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.empty} B
                        </span>
                        <span className="px-2.5 py-0.5 rounded font-bold bg-indigo-600 text-white">
                          {Number(item.net).toFixed(2)} Net
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {incorrect > 0 && (
              <button
                type="button"
                onClick={() => {
                  onFilterIncorrect();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Review {incorrect} Incorrect Only</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onStartNewExam();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300/80 dark:hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Fresh Exam</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Review Detailed Solutions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
