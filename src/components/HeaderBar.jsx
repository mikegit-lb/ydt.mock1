import React from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Clock,
  History,
  Moon,
  RotateCcw,
  Sun,
  Trophy,
  CheckCircle2
} from 'lucide-react';

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function HeaderBar({
  mode,
  onModeChange,
  examSubmitted,
  onFinishExam,
  onStartNewExam,
  elapsedSeconds,
  answeredCount,
  totalFilteredCount,
  scoreHistoryCount,
  onOpenScorecard,
  onOpenHistory,
  onResetProgress,
  darkMode,
  onToggleDarkMode,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center font-mono font-bold text-xs tracking-tighter shadow-sm shrink-0">
            YDT
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                YDT Master
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                ÖSYM C1/C2
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block truncate">
              50 Grammar MCQs · 10 Cloze Passages (100 Qs)
            </p>
          </div>
        </div>

        {/* Mode Switcher (Practice vs Mock Exam) */}
        <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-300/60 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onModeChange('practice')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'practice'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Practice</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('exam')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'exam'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mock Exam</span>
          </button>
        </div>

        {/* Right Controls: Exam Timer / Finish Button / History / Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {mode === 'exam' && (
            <div className="flex items-center gap-1.5">
              <div
                className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300"
                title="Elapsed Exam Time"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{formatDuration(elapsedSeconds)}</span>
              </div>

              {!examSubmitted ? (
                <button
                  type="button"
                  onClick={onFinishExam}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finish Test</span>
                  <span className="hidden sm:inline font-mono opacity-85">
                    ({answeredCount}/{totalFilteredCount})
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenScorecard}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Score Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStartNewExam}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300/70 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                    title="Start a fresh mock attempt"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Retake</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Score History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 transition-colors"
            title="ÖSYM Score History & Analytics"
          >
            <History className="w-4 h-4" />
            {scoreHistoryCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white font-mono text-[10px] flex items-center justify-center">
                {scoreHistoryCount}
              </span>
            )}
          </button>

          {/* Reset Answers Button */}
          <button
            type="button"
            onClick={onResetProgress}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 transition-colors"
            title="Reset current answers"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 transition-colors"
            aria-label="Toggle Dark Mode"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
