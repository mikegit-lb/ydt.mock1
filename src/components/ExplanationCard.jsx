import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Languages,
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'];

export default function ExplanationCard({
  question,
  selectedOption,
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [langTab, setLangTab] = useState('both'); // 'both' | 'tr' | 'en'

  const isCorrect = selectedOption === question.correctAnswer;
  const hasAnswered = Boolean(selectedOption);

  return (
    <div className="mt-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 overflow-hidden transition-all">
      {/* Header Banner */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left border-b border-zinc-200/70 dark:border-zinc-800/80 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {hasAnswered ? (
            isCorrect ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Correct ({question.correctAnswer})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                <XCircle className="w-3.5 h-3.5" />
                Incorrect (Your choice: {selectedOption} · Correct: {question.correctAnswer})
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              <Info className="w-3.5 h-3.5" />
              Answer Key: {question.correctAnswer}
            </span>
          )}

          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Explanation & Rule Analysis
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-sm">
          {/* Grammar Cues / Triggers */}
          {question.cues && question.cues.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Grammar Cues & Structural Triggers</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {question.cues.map((cue, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                  >
                    {cue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Language Switcher & Rule Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Rule Breakdown
              </span>
              <div className="inline-flex rounded-md bg-zinc-200/70 dark:bg-zinc-800 p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setLangTab('both')}
                  className={`px-2 py-0.5 rounded ${
                    langTab === 'both'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  TR + EN
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('tr')}
                  className={`px-2 py-0.5 rounded ${
                    langTab === 'tr'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`px-2 py-0.5 rounded ${
                    langTab === 'en'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div
              className={
                langTab === 'both'
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-3.5'
                  : 'space-y-3'
              }
            >
              {(langTab === 'both' || langTab === 'tr') && (
                <div className="p-4 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/90">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">
                    <span className="font-mono px-1.5 py-0.2 bg-indigo-500/10 rounded">TR</span>
                    <span>Türkçe Çözüm & Kural Analizi</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {question.explanationTR}
                  </p>
                </div>
              )}

              {(langTab === 'both' || langTab === 'en') && (
                <div className="p-4 rounded-lg bg-white dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/90">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                    <span className="font-mono px-1.5 py-0.2 bg-emerald-500/10 rounded">EN</span>
                    <span>English Grammatical Analysis</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {question.explanationEN}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Turkish Sentence Translation */}
          {question.translationTR && (
            <div className="p-3.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <Languages className="w-3.5 h-3.5 text-indigo-500" />
                <span>Cümle Çevirisi (Sentence Translation)</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                “{question.translationTR}”
              </p>
            </div>
          )}

          {/* Option-by-Option Distractor Breakdown */}
          {question.distractorAnalysis && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Option-by-Option Distractor Breakdown
              </div>
              <div className="space-y-1.5">
                {OPTION_KEYS.map((key) => {
                  const isRight = key === question.correctAnswer;
                  const isUserWrongChoice = key === selectedOption && !isRight;
                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                        isRight
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-zinc-800 dark:text-zinc-200'
                          : isUserWrongChoice
                          ? 'bg-rose-500/5 border-rose-500/30 text-zinc-800 dark:text-zinc-200'
                          : 'bg-white/70 dark:bg-zinc-950/50 border-zinc-200/60 dark:border-zinc-800/70 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 ${
                          isRight
                            ? 'bg-emerald-600 text-white'
                            : isUserWrongChoice
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {key}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1.5">
                          {question.options[key]}:
                        </span>
                        <span>{question.distractorAnalysis[key]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
