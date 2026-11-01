import React, { useState } from 'react';
import {
  Star,
  Check,
  X,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Slash
} from 'lucide-react';
import ExplanationCard from './ExplanationCard.jsx';
import AnnotatableText from './AnnotatableText.jsx';
import AnnotationCanvas from './AnnotationCanvas.jsx';

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'];

function renderFormattedStem({
  stem,
  selectedOptionText,
  status,
  wordMarks,
  activeTool,
  activeColorId,
  onApplyWordMark,
}) {
  const parts = stem.split(/(----+|____+)/g);
  const selectedParts = selectedOptionText
    ? selectedOptionText.split(/\s*\/\s*/)
    : [];
  let blankCounter = 0;

  return parts.map((part, idx) => {
    if (/^(----+|____+)$/.test(part)) {
      const fillWord = selectedParts[blankCounter] || selectedOptionText;
      blankCounter += 1;

      if (fillWord) {
        let colorStyle =
          'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40';
        if (status === 'correct') {
          colorStyle =
            'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
        } else if (status === 'incorrect') {
          colorStyle =
            'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 line-through decoration-rose-500/70';
        }
        return (
          <span
            key={idx}
            className={`inline-flex items-center px-2 py-0.5 mx-1 rounded-md border font-semibold text-[0.95em] transition-all ${colorStyle}`}
          >
            {fillWord}
          </span>
        );
      }

      return (
        <span
          key={idx}
          className="inline-block min-w-[72px] border-b-2 border-indigo-500/60 dark:border-indigo-400/60 mx-1.5 text-center font-mono text-xs text-zinc-400 select-none"
        >
          &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      );
    }

    return (
      <AnnotatableText
        key={idx}
        text={part}
        segmentPrefix={`stem_${idx}`}
        wordMarks={wordMarks}
        activeTool={activeTool}
        activeColorId={activeColorId}
        onApplyWordMark={onApplyWordMark}
      />
    );
  });
}

export default function GrammarQuestionCard({
  question,
  selectedOption,
  onSelectOption,
  onClearAnswer,
  isBookmarked,
  onToggleBookmark,
  mode,
  examSubmitted,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  // Annotation props
  activeTool,
  activeColorId,
  wordMarks = {},
  onApplyWordMark,
  strokes = [],
  onChangeStrokes,
  eliminatedOptions = [],
  onToggleEliminateOption,
}) {
  const [peekExplanation, setPeekExplanation] = useState(false);

  const isRevealed =
    (mode === 'practice' && Boolean(selectedOption)) ||
    (mode === 'practice' && peekExplanation) ||
    examSubmitted;

  const isCorrect = selectedOption === question.correctAnswer;

  let stemStatus = 'neutral';
  if (selectedOption) {
    if (mode === 'practice' || examSubmitted) {
      stemStatus = isCorrect ? 'correct' : 'incorrect';
    } else {
      stemStatus = 'exam-selected';
    }
  }

  return (
    <article className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-elevated p-5 sm:p-7 transition-all">
      {/* Metadata Header */}
      <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900">
            Q{String(question.number).padStart(2, '0')}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <Tag className="w-3 h-3" />
            {question.topic}
          </span>
          {question.subtopic && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
              · {question.subtopic}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeTool !== 'pointer' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
              Tool: {activeTool}
            </span>
          )}

          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {question.difficulty || 'Hard'}
          </span>

          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            className={`p-1.5 rounded-lg border transition-all ${
              isBookmarked
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
            title={isBookmarked ? 'Remove Bookmark (S)' : 'Bookmark Question (S)'}
          >
            <Star
              className={`w-4 h-4 ${
                isBookmarked ? 'fill-amber-500 text-amber-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Annotatable Question Stem & Options Area */}
      <div className="relative">
        <AnnotationCanvas
          strokes={strokes}
          onChangeStrokes={onChangeStrokes}
          activeTool={activeTool}
          activeColorId={activeColorId}
        />

        {/* Question Stem with Word-Level Highlight & Underline Support */}
        <div className="text-base sm:text-[17px] leading-[1.85] font-medium text-zinc-900 dark:text-zinc-100 mb-6 tracking-[-0.01em]">
          {renderFormattedStem({
            stem: question.stem,
            selectedOptionText: selectedOption ? question.options[selectedOption] : null,
            status: stemStatus,
            wordMarks,
            activeTool,
            activeColorId,
            onApplyWordMark,
          })}
        </div>

        {/* Options List (A - E) with Distractor Strikethrough / Elimination */}
        <div className="space-y-2.5" role="radiogroup" aria-label={`Question ${question.number} options`}>
        {OPTION_KEYS.map((key) => {
          const optionText = question.options[key];
          const isSelected = selectedOption === key;
          const isOptionCorrect = question.correctAnswer === key;
          const isEliminated = eliminatedOptions.includes(key) && !isSelected;

          let containerStyle =
            'bg-zinc-50/60 dark:bg-zinc-950/50 border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200';
          let badgeStyle =
            'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300';
          let rightIcon = null;

          if (isRevealed) {
            if (isOptionCorrect) {
              containerStyle =
                'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/60 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30';
              badgeStyle = 'bg-emerald-600 border-emerald-600 text-white';
              rightIcon = (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Correct</span>
                </span>
              );
            } else if (isSelected && !isOptionCorrect) {
              containerStyle =
                'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/60 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/30';
              badgeStyle = 'bg-rose-600 border-rose-600 text-white';
              rightIcon = (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Your Choice</span>
                </span>
              );
            } else {
              containerStyle =
                'bg-zinc-50/40 dark:bg-zinc-950/30 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-500 opacity-80';
            }
          } else if (isSelected) {
            containerStyle =
              'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-500/30';
            badgeStyle = 'bg-indigo-600 border-indigo-600 text-white';
            rightIcon = (
              <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
                Selected
              </span>
            );
          } else if (isEliminated) {
            containerStyle =
              'bg-zinc-100/40 dark:bg-zinc-950/30 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 opacity-55';
          }

          return (
            <div
              key={key}
              onContextMenu={(e) => {
                e.preventDefault();
                onToggleEliminateOption(key);
              }}
              className={`w-full rounded-xl border flex items-center justify-between gap-2 pr-2.5 transition-all duration-150 ${containerStyle}`}
            >
              <button
                type="button"
                disabled={examSubmitted}
                onClick={() => onSelectOption(question.id, key)}
                className="flex-1 p-3.5 text-left flex items-center gap-3.5 min-w-0"
              >
                <span
                  className={`w-7 h-7 rounded-lg border font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}
                >
                  {key}
                </span>
                <span
                  className={`text-sm sm:text-[15px] font-medium leading-snug break-words ${
                    isEliminated ? 'line-through decoration-rose-500/70 decoration-2' : ''
                  }`}
                >
                  {optionText}
                </span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                {rightIcon}
                {!examSubmitted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEliminateOption(key);
                    }}
                    title={
                      isEliminated
                        ? `Restore option ${key} (or right-click)`
                        : `Cross out / eliminate distractor ${key} (or right-click)`
                    }
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isEliminated
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Slash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedOption && !examSubmitted && (
            <button
              type="button"
              onClick={() => {
                onClearAnswer(question.id);
                setPeekExplanation(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Choice</span>
            </button>
          )}

          {mode === 'practice' && !selectedOption && (
            <button
              type="button"
              onClick={() => setPeekExplanation((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{peekExplanation ? 'Hide Rule Analysis' : 'Peek Explanation'}</span>
            </button>
          )}

          <span className="hidden md:inline text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
            Keys: [A–E] Answer · [H] Highlight · [U] Underline · [P] Pen · [X] Eraser
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explanation & Rule Analysis Card (Practice Mode or Post-Exam Review) */}
      {isRevealed && (
        <ExplanationCard
          key={question.id}
          question={question}
          selectedOption={selectedOption}
          defaultExpanded={true}
        />
      )}
    </article>
  );
}
