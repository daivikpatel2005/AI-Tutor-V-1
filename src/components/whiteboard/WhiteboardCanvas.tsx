import React, { useRef, useEffect, useState } from 'react';
import type { WhiteboardElement, WhiteboardTool, Point } from '../../types/whiteboard';
import { useTeaching } from '../../state/teachingStore';

interface WhiteboardCanvasProps {
  activeTool: WhiteboardTool;
  activeColor: string;
  strokeWidth: number;
}

const drawElement = (
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  width: number,
  height: number
) => {
  ctx.save();
  ctx.strokeStyle = el.color;
  ctx.fillStyle = el.color;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = el.opacity || (el.tool === 'highlighter' ? 0.35 : 1.0);

  if (el.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = el.strokeWidth * 3;
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  if ((el.tool === 'pen' || el.tool === 'highlighter' || el.tool === 'eraser') && el.points && el.points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(el.points[0].x * width, el.points[0].y * height);
    for (let i = 1; i < el.points.length; i++) {
      ctx.lineTo(el.points[i].x * width, el.points[i].y * height);
    }
    ctx.stroke();
  } else if (el.tool === 'line' && el.startPoint && el.endPoint) {
    ctx.beginPath();
    ctx.moveTo(el.startPoint.x * width, el.startPoint.y * height);
    ctx.lineTo(el.endPoint.x * width, el.endPoint.y * height);
    ctx.stroke();
  } else if (el.tool === 'rectangle' && el.startPoint && el.endPoint) {
    const x = Math.min(el.startPoint.x, el.endPoint.x) * width;
    const y = Math.min(el.startPoint.y, el.endPoint.y) * height;
    const w = Math.abs(el.endPoint.x - el.startPoint.x) * width;
    const h = Math.abs(el.endPoint.y - el.startPoint.y) * height;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
  } else if (el.tool === 'circle' && el.startPoint && el.endPoint) {
    const x1 = el.startPoint.x * width;
    const y1 = el.startPoint.y * height;
    const x2 = el.endPoint.x * width;
    const y2 = el.endPoint.y * height;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (el.tool === 'arrow' && el.startPoint && el.endPoint) {
    const fromX = el.startPoint.x * width;
    const fromY = el.startPoint.y * height;
    const toX = el.endPoint.x * width;
    const toY = el.endPoint.y * height;
    const headlen = 14;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  ctx.restore();
};

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  activeTool,
  activeColor,
  strokeWidth
}) => {
  const { whiteboardElements, updateCurrentSlideWhiteboard } = useTeaching();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Redraw all elements whenever whiteboardElements or canvas size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas pixel resolution to client bounding rect
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved elements
    whiteboardElements.forEach((el) => {
      drawElement(ctx, el, canvas.width, canvas.height);
    });
  }, [whiteboardElements]);

  const getNormalizedPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    setIsDrawing(true);
    const pt = getNormalizedPoint(e);
    setStartPoint(pt);
    setCurrentPoints([pt]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getNormalizedPoint(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      const updated = [...currentPoints, pt];
      setCurrentPoints(updated);

      // Fast preview stroke
      ctx.save();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = activeTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : 1.0;
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = strokeWidth * 4;
      }
      ctx.beginPath();
      const prev = currentPoints[currentPoints.length - 1];
      ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height);
      ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'select') return;
    setIsDrawing(false);
    const endPoint = getNormalizedPoint(e);

    const newElement: WhiteboardElement = {
      id: `wb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tool: activeTool,
      color: activeColor,
      strokeWidth: activeTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth,
      opacity: activeTool === 'highlighter' ? 0.35 : 1.0,
      points: currentPoints.length > 1 ? [...currentPoints, endPoint] : undefined,
      startPoint: startPoint || undefined,
      endPoint
    };

    updateCurrentSlideWhiteboard([...whiteboardElements, newElement]);
    setCurrentPoints([]);
    setStartPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDrawing(false)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 20,
        cursor:
          activeTool === 'select'
            ? 'default'
            : activeTool === 'eraser'
            ? 'crosshair'
            : 'crosshair',
        pointerEvents: activeTool === 'select' ? 'none' : 'auto'
      }}
    />
  );
};
