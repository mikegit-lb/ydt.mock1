import React from 'react';
import {
  MousePointer,
  Highlighter,
  Underline,
  PenTool,
  Brush,
  Eraser,
  Undo2,
  Trash2,
  Minus
} from 'lucide-react';

export const ANNOTATION_COLORS = [
  {
    id: 'amber',
    label: 'Amber Yellow',
    hex: '#f59e0b',
    bgClass: 'bg-amber-400/35 dark:bg-amber-400/30 text-zinc-900 dark:text-zinc-100 rounded px-0.5',
    underlineClass: 'underline decoration-amber-500 decoration-[2.5px] underline-offset-4',
    swatchClass: 'bg-amber-400',
  },
  {
    id: 'indigo',
    label: 'Indigo Cue',
    hex: '#6366f1',
    bgClass: 'bg-indigo-500/25 dark:bg-indigo-500/30 text-zinc-900 dark:text-zinc-100 rounded px-0.5',
    underlineClass: 'underline decoration-indigo-500 decoration-[2.5px] underline-offset-4',
    swatchClass: 'bg-indigo-500',
  },
  {
    id: 'emerald',
    label: 'Emerald Positive',
    hex: '#10b981',
    bgClass: 'bg-emerald-500/25 dark:bg-emerald-500/30 text-zinc-900 dark:text-zinc-100 rounded px-0.5',
    underlineClass: 'underline decoration-emerald-500 decoration-[2.5px] underline-offset-4',
    swatchClass: 'bg-emerald-500',
  },
  {
    id: 'rose',
    label: 'Rose Contrast / Trap',
    hex: '#f43f5e',
    bgClass: 'bg-rose-500/25 dark:bg-rose-500/30 text-zinc-900 dark:text-zinc-100 rounded px-0.5',
    underlineClass: 'underline decoration-rose-500 decoration-[2.5px] underline-offset-4',
    swatchClass: 'bg-rose-500',
  },
  {
    id: 'cyan',
    label: 'Cyan Time / Prep',
    hex: '#06b6d4',
    bgClass: 'bg-cyan-400/30 dark:bg-cyan-400/30 text-zinc-900 dark:text-zinc-100 rounded px-0.5',
    underlineClass: 'underline decoration-cyan-500 decoration-[2.5px] underline-offset-4',
    swatchClass: 'bg-cyan-400',
  },
];

export const TOOLS = [
  {
    id: 'pointer',
    label: 'Select',
    shortcut: 'V',
    icon: MousePointer,
    description: 'Normal cursor to answer options & click blanks',
  },
  {
    id: 'text-highlight',
    label: 'Highlight Text',
    shortcut: 'H',
    icon: Highlighter,
    description: 'Click or drag across words to highlight key cues',
  },
  {
    id: 'text-underline',
    label: 'Underline Text',
    shortcut: 'U',
    icon: Underline,
    description: 'Click or drag across words to underline grammar triggers',
  },
  {
    id: 'pen',
    label: 'Freehand Pen',
    shortcut: 'P',
    icon: PenTool,
    description: 'Draw freehand notes, circles & arrows over the question',
  },
  {
    id: 'line',
    label: 'Rule Line',
    shortcut: 'L',
    icon: Minus,
    description: 'Draw crisp straight underlines & connectors',
  },
  {
    id: 'marker',
    label: 'Freehand Marker',
    shortcut: 'M',
    icon: Brush,
    description: 'Freehand translucent marker brush over any area',
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'X',
    icon: Eraser,
    description: 'Click or swipe over any highlight, underline, or pen stroke to erase',
  },
];

export default function AnnotationToolbar({
  activeTool,
  onSelectTool,
  activeColorId,
  onSelectColorId,
  onUndoStroke,
  onClearAllForCurrent,
  hasStrokes,
  hasAnyMarks,
}) {
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-subtle px-3 py-2 flex flex-wrap items-center justify-between gap-2.5">
      {/* Left: Tool Buttons */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1.5 hidden sm:inline">
          Study Tools
        </span>

        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(isActive && tool.id !== 'pointer' ? 'pointer' : tool.id)}
              title={`${tool.description} (${tool.shortcut})`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Color Swatches + Undo / Clear */}
      <div className="flex items-center gap-2.5">
        {/* Color Palette */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60"
          role="radiogroup"
          aria-label="Annotation color"
        >
          {ANNOTATION_COLORS.map((c) => {
            const selected = activeColorId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColorId(c.id)}
                title={c.label}
                aria-label={c.label}
                className={`w-4 h-4 rounded-full transition-transform ${c.swatchClass} ${
                  selected
                    ? 'scale-125 ring-2 ring-zinc-900 dark:ring-white ring-offset-1 dark:ring-offset-zinc-900'
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>

        {/* Undo & Clear */}
        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
          <button
            type="button"
            onClick={onUndoStroke}
            disabled={!hasStrokes}
            title="Undo last pen/marker stroke"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClearAllForCurrent}
            disabled={!hasAnyMarks}
            title="Clear all highlights, underlines, drawings & eliminated options on this question"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Marks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
