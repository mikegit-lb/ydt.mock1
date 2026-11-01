import React, { useState } from 'react';
import {
  BookOpen,
  Star,
  Check,
  X,
  Languages,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  Slash
} from 'lucide-react';
import { CLOZE_PASSAGES, CLOZE_BLANK_TYPES } from '../data/questionsData.js';
import ExplanationCard from './ExplanationCard.jsx';
import AnnotatableText from './AnnotatableText.jsx';
import AnnotationCanvas from './AnnotationCanvas.jsx';

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'];

export default function ClozePassageWorkspace({
  activeQuestion,
  onJumpToQuestionId,
  answers,
  onSelectOption,
  onClearAnswer,
  bookmarkedIds,
  onToggleBookmark,
  mode,
  examSubmitted,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  // Annotation props (stored by passageId for passage text/strokes and questionId for options)
  activeTool,
  activeColorId,
  passageWordMarks = {},
  onApplyPassageWordMark,
  passageStrokes = [],
  onChangePassageStrokes,
  eliminatedByQuestion = {},
  onToggleEliminateQuestionOption,
}) {
  const [viewAllBlanks, setViewAllBlanks] = useState(false);
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
  const [peekBlankIds, setPeekBlankIds] = useState({});

  const passage =
    CLOZE_PASSAGES.find((p) => p.id === activeQuestion.passageId) || CLOZE_PASSAGES[0];

  const showInstantColors = mode === 'practice' || examSubmitted;

  const renderPassageWithBlanks = () => {
    const tokens = passage.text.split(/(\(\d\)\s*____+)/g);

    return tokens.map((token, idx) => {
      const match = token.match(/^\((\d)\)\s*____+$/);
      if (!match) {
        return (
          <AnnotatableText
            key={idx}
            text={token}
            segmentPrefix={`${passage.id}_seg_${idx}`}
            wordMarks={passageWordMarks}
            activeTool={activeTool}
            activeColorId={activeColorId}
            onApplyWordMark={onApplyPassageWordMark}
          />
        );
      }

      const blankNum = Number(match[1]);
      const blankQuestion = passage.questions.find((q) => q.blankNumber === blankNum);
      if (!blankQuestion) return <React.Fragment key={idx}>{token}</React.Fragment>;

      const chosenKey = answers[blankQuestion.id];
      const chosenText = chosenKey ? blankQuestion.options[chosenKey] : null;
      const isFocused = activeQuestion.id === blankQuestion.id;
      const isCorrect = chosenKey === blankQuestion.correctAnswer;

      let chipStyle =
        'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-indigo-500';

      if (chosenKey) {
        if (showInstantColors) {
          chipStyle = isCorrect
            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/50 font-semibold'
            : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/50 font-semibold';
        } else {
          chipStyle =
            'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/50 font-semibold';
        }
      }

      return (
        <button
          key={blankQuestion.id}
          type="button"
          onClick={() => onJumpToQuestionId(blankQuestion.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1 my-0.5 rounded-md border text-sm transition-all ${chipStyle} ${
            isFocused
              ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-zinc-900 shadow-sm'
              : ''
          }`}
          title={`Blank (${blankNum}) — ${CLOZE_BLANK_TYPES[blankNum]}`}
        >
          <span className="font-mono text-xs font-bold px-1 rounded bg-black/5 dark:bg-white/10">
            ({blankNum})
          </span>
          <span>{chosenText || '________'}</span>
        </button>
      );
    });
  };

  const questionsToRender = viewAllBlanks ? passage.questions : [activeQuestion];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Passage Reading Card (Left 6 Columns on Desktop) */}
      <section className="lg:col-span-6 lg:sticky lg:top-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-elevated p-5 sm:p-7">
        {/* Passage Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-indigo-600 text-white">
              <BookOpen className="w-3.5 h-3.5" />
              CLOZE PASSAGE {passage.passageNumber} / 10
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {passage.theme}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Q{passage.questions[0].number}–Q{passage.questions[4].number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showInstantColors && (
              <button
                type="button"
                onClick={() => setShowPassageTranslation((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  showPassageTranslation
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{showPassageTranslation ? 'Hide TR Passage' : 'TR Translation'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewAllBlanks((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                viewAllBlanks
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{viewAllBlanks ? 'Single Blank View' : 'Show All 5 Blanks'}</span>
            </button>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          {passage.title}
        </h2>

        {/* Academic Passage Body with Scoped Vector Canvas Overlay */}
        <div className="relative text-[15px] sm:text-base leading-[1.9] text-zinc-800 dark:text-zinc-200 font-normal bg-zinc-50/70 dark:bg-zinc-950/60 p-4 sm:p-5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80">
          <AnnotationCanvas
            strokes={passageStrokes}
            onChangeStrokes={onChangePassageStrokes}
            activeTool={activeTool}
            activeColorId={activeColorId}
          />
          {renderPassageWithBlanks()}
        </div>

        {/* Optional Full Turkish Passage Translation */}
        {showInstantColors && showPassageTranslation && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>Parça Çevirisi (Full Passage Turkish Translation)</span>
            </div>
            <p className="italic">{passage.translationTR}</p>
          </div>
        )}

        {/* 5 Blank Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {passage.questions.map((bq) => {
              const bChosen = answers[bq.id];
              const bActive = activeQuestion.id === bq.id;
              const bCorrect = bChosen === bq.correctAnswer;

              let tabStyle =
                'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-200';
              if (bChosen) {
                if (showInstantColors) {
                  tabStyle = bCorrect
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
                } else {
                  tabStyle =
                    'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
                }
              }

              return (
                <button
                  key={bq.id}
                  type="button"
                  onClick={() => onJumpToQuestionId(bq.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 ${tabStyle} ${
                    bActive
                      ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-zinc-900'
                      : ''
                  }`}
                >
                  <span>Blank ({bq.blankNumber})</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">
                    · {CLOZE_BLANK_TYPES[bq.blankNumber].split('/')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blank Question Card(s) (Right 6 Columns on Desktop) */}
      <div className="lg:col-span-6 space-y-4">
        {questionsToRender.map((q) => {
          const selectedOption = answers[q.id];
          const isBookmarked = bookmarkedIds.includes(q.id);
          const peek = Boolean(peekBlankIds[q.id]);
          const isRevealed =
            (mode === 'practice' && Boolean(selectedOption)) ||
            (mode === 'practice' && peek) ||
            examSubmitted;
          const eliminatedOptions = eliminatedByQuestion[q.id] || [];

          return (
            <article
              key={q.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-elevated p-5 sm:p-6 transition-all"
            >
              <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900">
                    Q{q.number} · Blank ({q.blankNumber})
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    {CLOZE_BLANK_TYPES[q.blankNumber]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleBookmark(q.id)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isBookmarked
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                  title="Bookmark Blank"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Context excerpt stem */}
              <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-400 mb-4 font-medium leading-relaxed">
                {q.stem}
              </p>

              {/* 5 Options with Eliminate / Strikethrough button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OPTION_KEYS.map((key) => {
                  const optionText = q.options[key];
                  const isSelected = selectedOption === key;
                  const isOptionCorrect = q.correctAnswer === key;
                  const isEliminated = eliminatedOptions.includes(key) && !isSelected;

                  let containerStyle =
                    'bg-zinc-50/60 dark:bg-zinc-950/50 border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200';
                  let badgeStyle =
                    'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300';
                  let rightIcon = null;

                  if (isRevealed) {
                    if (isOptionCorrect) {
                      containerStyle =
                        'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/60 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30';
                      badgeStyle = 'bg-emerald-600 border-emerald-600 text-white';
                      rightIcon = (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                      );
                    } else if (isSelected && !isOptionCorrect) {
                      containerStyle =
                        'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/60 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/30';
                      badgeStyle = 'bg-rose-600 border-rose-600 text-white';
                      rightIcon = (
                        <X className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
                      );
                    } else {
                      containerStyle =
                        'bg-zinc-50/40 dark:bg-zinc-950/30 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-500 opacity-80';
                    }
                  } else if (isSelected) {
                    containerStyle =
                      'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-500/30';
                    badgeStyle = 'bg-indigo-600 border-indigo-600 text-white';
                  } else if (isEliminated) {
                    containerStyle =
                      'bg-zinc-100/40 dark:bg-zinc-950/30 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 opacity-55';
                  }

                  return (
                    <div
                      key={key}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onToggleEliminateQuestionOption(q.id, key);
                      }}
                      className={`rounded-xl border flex items-center justify-between gap-1.5 pr-2 transition-all ${containerStyle}`}
                    >
                      <button
                        type="button"
                        disabled={examSubmitted}
                        onClick={() => onSelectOption(q.id, key)}
                        className="flex-1 p-3 text-left flex items-center gap-3 min-w-0"
                      >
                        <span
                          className={`w-6 h-6 rounded-md border font-mono text-xs font-bold flex items-center justify-center shrink-0 ${badgeStyle}`}
                        >
                          {key}
                        </span>
                        <span
                          className={`text-sm font-medium truncate ${
                            isEliminated ? 'line-through decoration-rose-500/70 decoration-2' : ''
                          }`}
                        >
                          {optionText}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {rightIcon}
                        {!examSubmitted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleEliminateQuestionOption(q.id, key);
                            }}
                            title={
                              isEliminated
                                ? `Restore option ${key}`
                                : `Eliminate / strike option ${key}`
                            }
                            className={`p-1 rounded-md border transition-colors ${
                              isEliminated
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <Slash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Controls */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedOption && !examSubmitted && (
                    <button
                      type="button"
                      onClick={() => onClearAnswer(q.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}

                  {mode === 'practice' && !selectedOption && (
                    <button
                      type="button"
                      onClick={() =>
                        setPeekBlankIds((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{peek ? 'Hide Analysis' : 'Peek Explanation'}</span>
                    </button>
                  )}
                </div>

                {!viewAllBlanks && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onPrev}
                      disabled={!hasPrev}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      disabled={!hasNext}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40"
                    >
                      <span>Next Blank</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {isRevealed && (
                <ExplanationCard
                  key={q.id}
                  question={q}
                  selectedOption={selectedOption}
                  defaultExpanded={!viewAllBlanks}
                />
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
