import React from 'react';
import {
  Filter,
  Grid,
  Star,
  AlertCircle,
  CircleDashed,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GRAMMAR_TOPICS, CLOZE_PASSAGES } from '../data/questionsData.js';

export default function FilterNavBar({
  activeTopicFilter,
  onTopicFilterChange,
  statusFilter,
  onStatusFilterChange,
  bookmarkedIds,
  showMatrix,
  onToggleMatrix,
  currentIndex,
  totalFiltered,
  onPrev,
  onNext,
  stats,
  mode,
  examSubmitted,
}) {
  const showInstantColors = mode === 'practice' || examSubmitted;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-subtle p-3.5 sm:p-4 space-y-3">
      {/* Top Row: Topic Selector Dropdown + Status Filters + Matrix Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[230px]">
          <div className="relative flex-1 max-w-sm">
            <Filter className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="topic-filter-select"
              name="topicFilter"
              aria-label="Filter questions by topic"
              value={activeTopicFilter}
              onChange={(e) => onTopicFilterChange(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            >
              <optgroup label="Overview Sets">
                <option value="ALL">All Questions (100)</option>
                <option value="ALL_GRAMMAR">All Standalone Grammar (50)</option>
                <option value="ALL_CLOZE">All Cloze Tests 1–10 (50)</option>
              </optgroup>
              <optgroup label="Standalone Grammar Topics (50)">
                {GRAMMAR_TOPICS.map((t) => (
                  <option key={t.id} value={`TOPIC:${t.id}`}>
                    {t.label} ({t.count})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cloze Test Passages (10 × 5 Blanks)">
                {CLOZE_PASSAGES.map((p) => (
                  <option key={p.id} value={`CLOZE:${p.id}`}>
                    Cloze Test {p.passageNumber}: {p.title} (5)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Status Pills (Starred, Unanswered, Incorrect) + Matrix Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() =>
              onStatusFilterChange(statusFilter === 'bookmarked' ? 'all' : 'bookmarked')
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              statusFilter === 'bookmarked'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                statusFilter === 'bookmarked' || bookmarkedIds.length > 0
                  ? 'text-amber-500 fill-amber-500'
                  : ''
              }`}
            />
            <span>Starred</span>
            <span className="font-mono text-[11px] opacity-80">({bookmarkedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onStatusFilterChange(statusFilter === 'unanswered' ? 'all' : 'unanswered')
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              statusFilter === 'unanswered'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CircleDashed className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unanswered</span>
          </button>

          {showInstantColors && (
            <button
              type="button"
              onClick={() =>
                onStatusFilterChange(statusFilter === 'incorrect' ? 'all' : 'incorrect')
              }
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === 'incorrect'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Incorrect</span>
              <span className="font-mono text-[11px] opacity-80">({stats.incorrect})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMatrix}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showMatrix
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Matrix</span>
          </button>
        </div>
      </div>

      {/* Quick Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {[
          { id: 'ALL', label: 'All (100)' },
          { id: 'ALL_GRAMMAR', label: 'Grammar (50)' },
          { id: 'ALL_CLOZE', label: 'Cloze Tests (50)' },
          ...GRAMMAR_TOPICS.map((t) => ({
            id: `TOPIC:${t.id}`,
            label: `${t.shortLabel} (${t.count})`,
          })),
        ].map((pill) => {
          const active = activeTopicFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onTopicFilterChange(pill.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Bottom Row: Live Stats + Prev/Next Controls */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-zinc-500 dark:text-zinc-400">
            Showing{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {totalFiltered > 0 ? currentIndex + 1 : 0}
            </strong>{' '}
            of <strong className="text-zinc-900 dark:text-zinc-100">{totalFiltered}</strong>
          </span>

          {showInstantColors ? (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                ✓ {stats.correct}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                ✗ {stats.incorrect}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                Net: {stats.net.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              Answered: {stats.answered} / {totalFiltered}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex <= 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex >= totalFiltered - 1}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
