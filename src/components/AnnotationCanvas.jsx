import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ANNOTATION_COLORS } from './AnnotationToolbar.jsx';

const COLOR_HEX_MAP = Object.fromEntries(ANNOTATION_COLORS.map((c) => [c.id, c.hex]));

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export default function AnnotationCanvas({
  strokes = [],
  onChangeStrokes,
  activeTool,
  activeColorId,
}) {
  const canvasRef = useRef(null);
  const [currentStroke, setCurrentStroke] = useState(null);

  const isCanvasInteractive =
    activeTool === 'pen' ||
    activeTool === 'line' ||
    activeTool === 'marker' ||
    (activeTool === 'eraser' && strokes.length > 0);

  const drawSingleStroke = useCallback((ctx, stroke, width, height) => {
    if (!stroke || !stroke.points || stroke.points.length === 0) return;

    ctx.save();
    const hex = COLOR_HEX_MAP[stroke.colorId] || '#f59e0b';
    ctx.strokeStyle = hex;
    ctx.fillStyle = hex;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'marker') {
      ctx.globalAlpha = 0.32;
      ctx.lineWidth = 18;
    } else if (stroke.tool === 'line') {
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = 2.75;
    } else {
      // Freehand pen
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = 2.25;
    }

    const pts = stroke.points.map((p) => ({
      x: p.nx * width,
      y: p.ny * height,
    }));

    ctx.beginPath();
    if (pts.length === 1) {
      ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (stroke.tool === 'line') {
      const first = pts[0];
      const last = pts[pts.length - 1];
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    } else {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const renderAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if (
      canvas.width !== Math.floor(rect.width * dpr) ||
      canvas.height !== Math.floor(rect.height * dpr)
    ) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    strokes.forEach((s) => drawSingleStroke(ctx, s, rect.width, rect.height));
    if (currentStroke) {
      drawSingleStroke(ctx, currentStroke, rect.width, rect.height);
    }
  }, [strokes, currentStroke, drawSingleStroke]);

  useEffect(() => {
    renderAll();
  }, [renderAll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return undefined;

    const ro = new ResizeObserver(() => {
      renderAll();
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [renderAll]);

  const getNormalizedPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    return {
      x,
      y,
      nx: rect.width > 0 ? x / rect.width : 0,
      ny: rect.height > 0 ? y / rect.height : 0,
      width: rect.width,
      height: rect.height,
    };
  };

  const eraseStrokeAt = (pt) => {
    if (!strokes.length) return;
    const threshold = 14;
    const remaining = strokes.filter((s) => {
      const pts = s.points.map((p) => ({
        x: p.nx * pt.width,
        y: p.ny * pt.height,
      }));
      if (pts.length === 1) {
        return Math.hypot(pt.x - pts[0].x, pt.y - pts[0].y) > threshold;
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const d = distToSegment(
          pt.x,
          pt.y,
          pts[i].x,
          pts[i].y,
          pts[i + 1].x,
          pts[i + 1].y
        );
        if (d <= threshold) return false;
      }
      return true;
    });
    if (remaining.length !== strokes.length) {
      onChangeStrokes(remaining);
    }
  };

  const handlePointerDown = (e) => {
    if (!isCanvasInteractive) return;
    if (e.button !== 0) return;

    const pt = getNormalizedPoint(e);

    if (activeTool === 'eraser') {
      eraseStrokeAt(pt);
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const effectiveTool = e.shiftKey ? 'line' : activeTool;
    setCurrentStroke({
      tool: effectiveTool,
      colorId: activeColorId,
      points: [{ nx: pt.nx, ny: pt.ny }],
    });
  };

  const handlePointerMove = (e) => {
    if (!isCanvasInteractive) return;
    if (activeTool === 'eraser' && e.buttons === 1) {
      eraseStrokeAt(getNormalizedPoint(e));
      return;
    }
    if (!currentStroke) return;

    const pt = getNormalizedPoint(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      if (prev.tool === 'line') {
        const start = prev.points[0];
        // Snap nearly horizontal lines (< 6 degrees) to straight horizontal underline
        const dx = Math.abs(pt.nx - start.nx) * pt.width;
        const dy = Math.abs(pt.ny - start.ny) * pt.height;
        const snappedNy = dx > 12 && dy / dx < 0.12 ? start.ny : pt.ny;
        return {
          ...prev,
          points: [start, { nx: pt.nx, ny: snappedNy }],
        };
      }
      return {
        ...prev,
        points: [...prev.points, { nx: pt.nx, ny: pt.ny }],
      };
    });
  };

  const handlePointerUp = () => {
    if (!currentStroke) return;
    onChangeStrokes([...strokes, currentStroke]);
    setCurrentStroke(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute inset-0 w-full h-full z-20 rounded-2xl ${
        activeTool === 'pen' || activeTool === 'line' || activeTool === 'marker'
          ? 'pointer-events-auto cursor-crosshair touch-none'
          : activeTool === 'eraser' && strokes.length > 0
          ? 'pointer-events-auto cursor-pointer touch-none'
          : 'pointer-events-none'
      }`}
    />
  );
}
