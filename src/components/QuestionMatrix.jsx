import React from 'react';
import { Star, X } from 'lucide-react';

export default function QuestionMatrix({
  questions,
  currentIndex,
  onSelectIndex,
  answers,
  bookmarkedIds,
  mode,
  examSubmitted,
  onClose,
}) {
  const showInstantColors = mode === 'practice' || examSubmitted;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-subtle p-4 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300">
            Fast Jump Matrix ({questions.length} Questions)
          </h3>
          <div className="flex items-center gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {showInstantColors ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Incorrect
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Answered
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Starred
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close Matrix"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const chosen = answers[q.id];
          const isCurrent = idx === currentIndex;
          const isStarred = bookmarkedIds.includes(q.id);
          const isCorrect = chosen && chosen === q.correctAnswer;

          let tileClasses =
            'bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-500';

          if (chosen) {
            if (showInstantColors) {
              tileClasses = isCorrect
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 font-semibold';
            } else {
              tileClasses =
                'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-semibold';
            }
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-8 rounded-md border font-mono text-xs flex items-center justify-center transition-all ${tileClasses} ${
                isCurrent
                  ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-zinc-900 z-10'
                  : ''
              }`}
              title={`Q${q.number}: ${q.topic} — ${q.subtopic}`}
            >
              <span>{q.number}</span>
              {isStarred && (
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 absolute top-0.5 right-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
