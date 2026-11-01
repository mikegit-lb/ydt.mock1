import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ALL_QUESTIONS,
  CLOZE_PASSAGES
} from './data/questionsData.js';
import { useLocalStorageState } from './hooks/useLocalStorageState.js';
import HeaderBar from './components/HeaderBar.jsx';
import FilterNavBar from './components/FilterNavBar.jsx';
import QuestionMatrix from './components/QuestionMatrix.jsx';
import AnnotationToolbar from './components/AnnotationToolbar.jsx';
import GrammarQuestionCard from './components/GrammarQuestionCard.jsx';
import ClozePassageWorkspace from './components/ClozePassageWorkspace.jsx';
import ScorecardModal from './components/ScorecardModal.jsx';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // Persistent state in LocalStorage
  const [darkMode, setDarkMode] = useLocalStorageState('ydt_prep_theme_v1', true);
  const [mode, setMode] = useLocalStorageState('ydt_prep_mode_v1', 'practice'); // 'practice' | 'exam'
  const [answers, setAnswers] = useLocalStorageState('ydt_prep_answers_v1', {});
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorageState('ydt_prep_bookmarks_v1', []);
  const [examSubmitted, setExamSubmitted] = useLocalStorageState('ydt_prep_exam_submitted_v1', false);
  const [elapsedSeconds, setElapsedSeconds] = useLocalStorageState('ydt_prep_exam_timer_v1', 0);
  const [scoreHistory, setScoreHistory] = useLocalStorageState('ydt_prep_score_history_v1', []);

  // Built-in Annotation & Study Tools state (persisted in LocalStorage)
  const [activeTool, setActiveTool] = useState('pointer'); // 'pointer' | 'text-highlight' | 'text-underline' | 'pen' | 'line' | 'marker' | 'eraser'
  const [activeColorId, setActiveColorId] = useLocalStorageState('ydt_prep_tool_color_v1', 'amber');
  const [wordMarksByTarget, setWordMarksByTarget] = useLocalStorageState('ydt_prep_word_marks_v1', {});
  const [strokesByTarget, setStrokesByTarget] = useLocalStorageState('ydt_prep_strokes_v1', {});
  const [eliminatedByQuestion, setEliminatedByQuestion] = useLocalStorageState('ydt_prep_eliminated_v1', {});

  // Navigation & Filter state
  const [activeTopicFilter, setActiveTopicFilter] = useLocalStorageState('ydt_prep_topic_filter_v1', 'ALL');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'bookmarked' | 'unanswered' | 'incorrect'
  const [currentQuestionId, setCurrentQuestionId] = useLocalStorageState('ydt_prep_current_qid_v1', 'G01');
  const [showMatrix, setShowMatrix] = useState(false);
  const [modalState, setModalState] = useState({ open: false, tab: 'scorecard' });

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Live timer in Mock Exam mode
  useEffect(() => {
    if (mode !== 'exam' || examSubmitted) return undefined;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, examSubmitted, setElapsedSeconds]);

  // Topic-filtered base list
  const topicFilteredQuestions = useMemo(() => {
    if (activeTopicFilter === 'ALL') return ALL_QUESTIONS;
    if (activeTopicFilter === 'ALL_GRAMMAR') {
      return ALL_QUESTIONS.filter((q) => q.section === 'grammar');
    }
    if (activeTopicFilter === 'ALL_CLOZE') {
      return ALL_QUESTIONS.filter((q) => q.section === 'cloze');
    }
    if (activeTopicFilter.startsWith('TOPIC:')) {
      const topicName = activeTopicFilter.replace('TOPIC:', '');
      return ALL_QUESTIONS.filter((q) => q.topic === topicName);
    }
    if (activeTopicFilter.startsWith('CLOZE:')) {
      const passageId = activeTopicFilter.replace('CLOZE:', '');
      return ALL_QUESTIONS.filter((q) => q.passageId === passageId);
    }
    return ALL_QUESTIONS;
  }, [activeTopicFilter]);

  // Apply secondary status filter (bookmarked, unanswered, incorrect)
  const filteredQuestions = useMemo(() => {
    return topicFilteredQuestions.filter((q) => {
      if (statusFilter === 'bookmarked') {
        return bookmarkedIds.includes(q.id);
      }
      if (statusFilter === 'unanswered') {
        return !answers[q.id];
      }
      if (statusFilter === 'incorrect') {
        return Boolean(answers[q.id]) && answers[q.id] !== q.correctAnswer;
      }
      return true;
    });
  }, [topicFilteredQuestions, statusFilter, bookmarkedIds, answers]);

  // Current index within filteredQuestions
  const currentIndex = useMemo(() => {
    const idx = filteredQuestions.findIndex((q) => q.id === currentQuestionId);
    return idx >= 0 ? idx : 0;
  }, [filteredQuestions, currentQuestionId]);

  const activeQuestion = filteredQuestions[currentIndex] || null;

  // Target key for word marks & canvas strokes (questionId for Grammar, passageId for Cloze)
  const annotationTargetId = activeQuestion
    ? activeQuestion.section === 'cloze'
      ? activeQuestion.passageId
      : activeQuestion.id
    : null;

  // Keep currentQuestionId synced when filter changes
  useEffect(() => {
    if (filteredQuestions.length > 0 && !filteredQuestions.some((q) => q.id === currentQuestionId)) {
      setCurrentQuestionId(filteredQuestions[0].id);
    }
  }, [filteredQuestions, currentQuestionId, setCurrentQuestionId]);

  // Compute live stats for the active topic filter
  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let incorrect = 0;
    topicFilteredQuestions.forEach((q) => {
      const chosen = answers[q.id];
      if (chosen) {
        answered += 1;
        if (chosen === q.correctAnswer) correct += 1;
        else incorrect += 1;
      }
    });
    const net = correct - incorrect / 4;
    return {
      answered,
      correct,
      incorrect,
      empty: topicFilteredQuestions.length - answered,
      net,
    };
  }, [topicFilteredQuestions, answers]);

  // Annotation handlers
  const handleApplyWordMark = useCallback(
    (targetId, tokenId, markObj) => {
      if (!targetId) return;
      setWordMarksByTarget((prev) => {
        const currentTargetMarks = { ...(prev[targetId] || {}) };
        if (!markObj) {
          delete currentTargetMarks[tokenId];
        } else {
          currentTargetMarks[tokenId] = markObj;
        }
        return {
          ...prev,
          [targetId]: currentTargetMarks,
        };
      });
    },
    [setWordMarksByTarget]
  );

  const handleChangeStrokes = useCallback(
    (targetId, nextStrokes) => {
      if (!targetId) return;
      setStrokesByTarget((prev) => ({
        ...prev,
        [targetId]: nextStrokes,
      }));
    },
    [setStrokesByTarget]
  );

  const handleUndoStroke = useCallback(() => {
    if (!annotationTargetId) return;
    setStrokesByTarget((prev) => {
      const list = prev[annotationTargetId] || [];
      if (list.length === 0) return prev;
      return {
        ...prev,
        [annotationTargetId]: list.slice(0, -1),
      };
    });
  }, [annotationTargetId, setStrokesByTarget]);

  const handleToggleEliminateOption = useCallback(
    (questionId, optionKey) => {
      setEliminatedByQuestion((prev) => {
        const current = prev[questionId] || [];
        const next = current.includes(optionKey)
          ? current.filter((k) => k !== optionKey)
          : [...current, optionKey];
        return {
          ...prev,
          [questionId]: next,
        };
      });
    },
    [setEliminatedByQuestion]
  );

  const handleClearMarksForCurrent = useCallback(() => {
    if (!activeQuestion || !annotationTargetId) return;
    setWordMarksByTarget((prev) => {
      const next = { ...prev };
      delete next[annotationTargetId];
      return next;
    });
    setStrokesByTarget((prev) => {
      const next = { ...prev };
      delete next[annotationTargetId];
      return next;
    });
    if (activeQuestion.section === 'cloze') {
      const passage = CLOZE_PASSAGES.find((p) => p.id === activeQuestion.passageId);
      if (passage) {
        setEliminatedByQuestion((prev) => {
          const next = { ...prev };
          passage.questions.forEach((q) => delete next[q.id]);
          return next;
        });
      }
    } else {
      setEliminatedByQuestion((prev) => {
        const next = { ...prev };
        delete next[activeQuestion.id];
        return next;
      });
    }
  }, [activeQuestion, annotationTargetId, setWordMarksByTarget, setStrokesByTarget, setEliminatedByQuestion]);

  // Support highlighting/underlining native browser text selections when clicking tool or pressing H/U
  const applyMarkToSelectionIfPresent = useCallback(
    (markType) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !annotationTargetId) return false;

      const range = sel.getRangeAt(0);
      const tokenSpans = Array.from(document.querySelectorAll('[data-token-id]')).filter((el) =>
        range.intersectsNode(el)
      );

      if (tokenSpans.length === 0) return false;

      setWordMarksByTarget((prev) => {
        const current = { ...(prev[annotationTargetId] || {}) };
        tokenSpans.forEach((el) => {
          const tid = el.getAttribute('data-token-id');
          if (tid) {
            current[tid] = { type: markType, colorId: activeColorId };
          }
        });
        return {
          ...prev,
          [annotationTargetId]: current,
        };
      });

      sel.removeAllRanges();
      return true;
    },
    [annotationTargetId, activeColorId, setWordMarksByTarget]
  );

  const handleSelectTool = useCallback(
    (nextTool) => {
      if (nextTool === 'text-highlight' && applyMarkToSelectionIfPresent('highlight')) {
        return;
      }
      if (nextTool === 'text-underline' && applyMarkToSelectionIfPresent('underline')) {
        return;
      }
      setActiveTool(nextTool);
    },
    [applyMarkToSelectionIfPresent]
  );

  // Question / Exam Handlers
  const handleSelectOption = useCallback(
    (questionId, optionKey) => {
      if (examSubmitted && mode === 'exam') return;
      setAnswers((prev) => ({
        ...prev,
        [questionId]: optionKey,
      }));
    },
    [examSubmitted, mode, setAnswers]
  );

  const handleClearAnswer = useCallback(
    (questionId) => {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    },
    [setAnswers]
  );

  const handleToggleBookmark = useCallback(
    (questionId) => {
      setBookmarkedIds((prev) =>
        prev.includes(questionId)
          ? prev.filter((id) => id !== questionId)
          : [...prev, questionId]
      );
    },
    [setBookmarkedIds]
  );

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentQuestionId(filteredQuestions[currentIndex - 1].id);
    }
  }, [currentIndex, filteredQuestions, setCurrentQuestionId]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentQuestionId(filteredQuestions[currentIndex + 1].id);
    }
  }, [currentIndex, filteredQuestions, setCurrentQuestionId]);

  const handleSelectMatrixIndex = useCallback(
    (idx) => {
      if (filteredQuestions[idx]) {
        setCurrentQuestionId(filteredQuestions[idx].id);
      }
    },
    [filteredQuestions, setCurrentQuestionId]
  );

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
  };

  const getScopeLabel = () => {
    if (activeTopicFilter === 'ALL') return 'Full YDT Set (100 Qs)';
    if (activeTopicFilter === 'ALL_GRAMMAR') return 'Standalone Grammar (50 Qs)';
    if (activeTopicFilter === 'ALL_CLOZE') return 'All Cloze Tests (50 Qs)';
    if (activeTopicFilter.startsWith('TOPIC:')) return activeTopicFilter.replace('TOPIC:', '');
    if (activeTopicFilter.startsWith('CLOZE:')) {
      const p = CLOZE_PASSAGES.find((x) => x.id === activeTopicFilter.replace('CLOZE:', ''));
      return p ? `Cloze Test ${p.passageNumber}: ${p.title}` : 'Cloze Passage';
    }
    return 'Custom Set';
  };

  const handleFinishExam = () => {
    setExamSubmitted(true);
    const entry = {
      id: `attempt_${Date.now()}`,
      timestamp: Date.now(),
      scopeLabel: getScopeLabel(),
      total: topicFilteredQuestions.length,
      correct: stats.correct,
      incorrect: stats.incorrect,
      empty: stats.empty,
      net: stats.net,
      durationSeconds: elapsedSeconds,
    };
    setScoreHistory((prev) => [entry, ...prev].slice(0, 30));
    setModalState({ open: true, tab: 'scorecard' });
  };

  const handleStartNewExam = () => {
    const idsToClear = new Set(topicFilteredQuestions.map((q) => q.id));
    setAnswers((prev) => {
      const next = { ...prev };
      idsToClear.forEach((id) => delete next[id]);
      return next;
    });
    setExamSubmitted(false);
    setElapsedSeconds(0);
    setStatusFilter('all');
    if (topicFilteredQuestions[0]) {
      setCurrentQuestionId(topicFilteredQuestions[0].id);
    }
  };

  const handleResetProgress = () => {
    setAnswers({});
    setExamSubmitted(false);
    setElapsedSeconds(0);
    setStatusFilter('all');
  };

  // Keyboard shortcuts: A-E / 1-5 to select option, Left/Right arrows, S to star, V/H/U/P/L/M/X for study tools
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalState.open) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (!activeQuestion) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndoStroke();
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        e.preventDefault();
        handleSelectOption(activeQuestion.id, key);
      } else if (['1', '2', '3', '4', '5'].includes(key)) {
        e.preventDefault();
        const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' };
        handleSelectOption(activeQuestion.id, map[key]);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (key === 'S') {
        e.preventDefault();
        handleToggleBookmark(activeQuestion.id);
      } else if (key === 'V' || e.key === 'Escape') {
        setActiveTool('pointer');
      } else if (key === 'H') {
        e.preventDefault();
        handleSelectTool(activeTool === 'text-highlight' ? 'pointer' : 'text-highlight');
      } else if (key === 'U') {
        e.preventDefault();
        handleSelectTool(activeTool === 'text-underline' ? 'pointer' : 'text-underline');
      } else if (key === 'P') {
        e.preventDefault();
        setActiveTool((prev) => (prev === 'pen' ? 'pointer' : 'pen'));
      } else if (key === 'L') {
        e.preventDefault();
        setActiveTool((prev) => (prev === 'line' ? 'pointer' : 'line'));
      } else if (key === 'M') {
        e.preventDefault();
        setActiveTool((prev) => (prev === 'marker' ? 'pointer' : 'marker'));
      } else if (key === 'X') {
        e.preventDefault();
        setActiveTool((prev) => (prev === 'eraser' ? 'pointer' : 'eraser'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeQuestion,
    activeTool,
    modalState.open,
    handleSelectOption,
    handleNext,
    handlePrev,
    handleToggleBookmark,
    handleSelectTool,
    handleUndoStroke,
  ]);

  const currentWordMarks = annotationTargetId ? wordMarksByTarget[annotationTargetId] || {} : {};
  const currentStrokes = annotationTargetId ? strokesByTarget[annotationTargetId] || [] : [];
  const currentEliminated = activeQuestion ? eliminatedByQuestion[activeQuestion.id] || [] : [];
  const hasAnyMarksOnCurrent =
    Object.keys(currentWordMarks).length > 0 ||
    currentStrokes.length > 0 ||
    currentEliminated.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Header */}
      <HeaderBar
        mode={mode}
        onModeChange={handleModeChange}
        examSubmitted={examSubmitted}
        onFinishExam={handleFinishExam}
        onStartNewExam={handleStartNewExam}
        elapsedSeconds={elapsedSeconds}
        answeredCount={stats.answered}
        totalFilteredCount={topicFilteredQuestions.length}
        scoreHistoryCount={scoreHistory.length}
        onOpenScorecard={() => setModalState({ open: true, tab: 'scorecard' })}
        onOpenHistory={() => setModalState({ open: true, tab: 'history' })}
        onResetProgress={handleResetProgress}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Expanded Wide Container (max-w-[1380px]) */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
        {/* Filter & Navigation Bar */}
        <FilterNavBar
          activeTopicFilter={activeTopicFilter}
          onTopicFilterChange={(nextTopic) => {
            setActiveTopicFilter(nextTopic);
            setStatusFilter('all');
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          bookmarkedIds={bookmarkedIds}
          showMatrix={showMatrix}
          onToggleMatrix={() => setShowMatrix((prev) => !prev)}
          currentIndex={currentIndex}
          totalFiltered={filteredQuestions.length}
          onPrev={handlePrev}
          onNext={handleNext}
          stats={stats}
          mode={mode}
          examSubmitted={examSubmitted}
        />

        {/* Built-In Interactive Annotation & Study Toolkit Bar */}
        <AnnotationToolbar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          activeColorId={activeColorId}
          onSelectColorId={setActiveColorId}
          onUndoStroke={handleUndoStroke}
          onClearAllForCurrent={handleClearMarksForCurrent}
          hasStrokes={currentStrokes.length > 0}
          hasAnyMarks={hasAnyMarksOnCurrent}
        />

        {/* Expandable Question Matrix (1..50 / 1..100) */}
        {showMatrix && filteredQuestions.length > 0 && (
          <QuestionMatrix
            questions={filteredQuestions}
            currentIndex={currentIndex}
            onSelectIndex={handleSelectMatrixIndex}
            answers={answers}
            bookmarkedIds={bookmarkedIds}
            mode={mode}
            examSubmitted={examSubmitted}
            onClose={() => setShowMatrix(false)}
          />
        )}

        {/* Active Question Workspace */}
        {!activeQuestion ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-10 text-center space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No questions match your current status filter (<strong>{statusFilter}</strong>).
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Questions in Topic</span>
            </button>
          </div>
        ) : activeQuestion.section === 'grammar' ? (
          <GrammarQuestionCard
            question={activeQuestion}
            selectedOption={answers[activeQuestion.id]}
            onSelectOption={handleSelectOption}
            onClearAnswer={handleClearAnswer}
            isBookmarked={bookmarkedIds.includes(activeQuestion.id)}
            onToggleBookmark={handleToggleBookmark}
            mode={mode}
            examSubmitted={examSubmitted}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < filteredQuestions.length - 1}
            activeTool={activeTool}
            activeColorId={activeColorId}
            wordMarks={currentWordMarks}
            onApplyWordMark={(tokenId, markObj) =>
              handleApplyWordMark(annotationTargetId, tokenId, markObj)
            }
            strokes={currentStrokes}
            onChangeStrokes={(nextStrokes) =>
              handleChangeStrokes(annotationTargetId, nextStrokes)
            }
            eliminatedOptions={currentEliminated}
            onToggleEliminateOption={(optKey) =>
              handleToggleEliminateOption(activeQuestion.id, optKey)
            }
          />
        ) : (
          <ClozePassageWorkspace
            activeQuestion={activeQuestion}
            onJumpToQuestionId={(qid) => setCurrentQuestionId(qid)}
            answers={answers}
            onSelectOption={handleSelectOption}
            onClearAnswer={handleClearAnswer}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            mode={mode}
            examSubmitted={examSubmitted}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < filteredQuestions.length - 1}
            activeTool={activeTool}
            activeColorId={activeColorId}
            passageWordMarks={currentWordMarks}
            onApplyPassageWordMark={(tokenId, markObj) =>
              handleApplyWordMark(annotationTargetId, tokenId, markObj)
            }
            passageStrokes={currentStrokes}
            onChangePassageStrokes={(nextStrokes) =>
              handleChangeStrokes(annotationTargetId, nextStrokes)
            }
            eliminatedByQuestion={eliminatedByQuestion}
            onToggleEliminateQuestionOption={handleToggleEliminateOption}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 text-center text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
        YDT Master · 100 High-Difficulty ÖSYM Grammar & Cloze Questions · Progress & Annotations Auto-Saved to LocalStorage
      </footer>

      {/* ÖSYM Scorecard & History Modal */}
      <ScorecardModal
        isOpen={modalState.open}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
        initialTab={modalState.tab}
        activeQuestions={topicFilteredQuestions}
        answers={answers}
        elapsedSeconds={elapsedSeconds}
        scoreHistory={scoreHistory}
        onClearHistory={() => setScoreHistory([])}
        onStartNewExam={handleStartNewExam}
        onFilterIncorrect={() => setStatusFilter('incorrect')}
      />
    </div>
  );
}
