import React, { useRef } from 'react';
import { ANNOTATION_COLORS } from './AnnotationToolbar.jsx';

const COLOR_MAP = Object.fromEntries(ANNOTATION_COLORS.map((c) => [c.id, c]));

/**
 * Renders a string segment as interactive word tokens that can be highlighted,
 * underlined, or erased by clicking or dragging across words.
 */
export default function AnnotatableText({
  text,
  segmentPrefix = 'seg',
  wordMarks = {},
  activeTool,
  activeColorId,
  onApplyWordMark,
}) {
  const isPaintingRef = useRef(false);
  const paintActionRef = useRef(null); // { type: 'highlight'|'underline'|null, colorId }

  const isWordTool =
    activeTool === 'text-highlight' ||
    activeTool === 'text-underline' ||
    activeTool === 'eraser';

  // Split text into words and whitespace tokens so spacing is 100% preserved
  const tokens = text.split(/(\s+)/);

  const handleTokenDown = (e, tokenId) => {
    if (!isWordTool) return;
    e.preventDefault();
    isPaintingRef.current = true;

    const currentMark = wordMarks[tokenId];
    const targetType =
      activeTool === 'text-highlight'
        ? 'highlight'
        : activeTool === 'text-underline'
        ? 'underline'
        : null;

    if (activeTool === 'eraser') {
      paintActionRef.current = null;
      onApplyWordMark(tokenId, null);
    } else if (
      currentMark &&
      currentMark.type === targetType &&
      currentMark.colorId === activeColorId
    ) {
      // Clicking an identically marked word toggles it off
      paintActionRef.current = null;
      onApplyWordMark(tokenId, null);
    } else {
      const nextMark = { type: targetType, colorId: activeColorId };
      paintActionRef.current = nextMark;
      onApplyWordMark(tokenId, nextMark);
    }

    const handleGlobalUp = () => {
      isPaintingRef.current = false;
      window.removeEventListener('pointerup', handleGlobalUp);
    };
    window.addEventListener('pointerup', handleGlobalUp);
  };

  const handleTokenEnter = (tokenId) => {
    if (!isPaintingRef.current || !isWordTool) return;
    onApplyWordMark(tokenId, paintActionRef.current);
  };

  return (
    <>
      {tokens.map((token, idx) => {
        if (/^\s+$/.test(token)) {
          return <React.Fragment key={idx}>{token}</React.Fragment>;
        }
        const tokenId = `${segmentPrefix}_${idx}`;
        const mark = wordMarks[tokenId];
        const colorObj = mark ? COLOR_MAP[mark.colorId] || ANNOTATION_COLORS[0] : null;

        let markClass = '';
        if (mark && colorObj) {
          if (mark.type === 'highlight') {
            markClass = colorObj.bgClass;
          } else if (mark.type === 'underline') {
            markClass = colorObj.underlineClass;
          }
        }

        const interactiveCursor =
          activeTool === 'text-highlight' || activeTool === 'text-underline'
            ? 'cursor-text hover:bg-indigo-500/10 rounded transition-colors select-none'
            : activeTool === 'eraser' && mark
            ? 'cursor-pointer hover:opacity-50 select-none'
            : '';

        return (
          <span
            key={tokenId}
            data-token-id={tokenId}
            onPointerDown={(e) => handleTokenDown(e, tokenId)}
            onPointerEnter={() => handleTokenEnter(tokenId)}
            className={`${markClass} ${interactiveCursor}`}
          >
            {token}
          </span>
        );
      })}
    </>
  );
}
