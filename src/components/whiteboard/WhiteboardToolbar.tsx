import React from 'react';
import type { WhiteboardTool } from '../../types/whiteboard';
import { useTeaching } from '../../state/teachingStore';
import {
  MousePointer,
  PenTool,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle,
  ArrowUpRight,
  Trash2
} from 'lucide-react';

interface WhiteboardToolbarProps {
  activeTool: WhiteboardTool;
  setActiveTool: (tool: WhiteboardTool) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
}

const COLORS = [
  '#ffffff', // Clean White
  '#fbbf24', // Amber/Yellow
  '#38bdf8', // Cyan
  '#f43f5e', // Rose Red
  '#10b981', // Emerald Green
  '#c084fc'  // Purple/Violet
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  strokeWidth,
  setStrokeWidth
}) => {
  const { clearCurrentSlideWhiteboard, whiteboardElements } = useTeaching();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '12px',
        background: 'rgba(13, 15, 23, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        flexWrap: 'wrap'
      }}
    >
      {/* Tool Selector Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <button
          onClick={() => setActiveTool('select')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'select' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'select' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'select' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Select / Interact Mode"
        >
          <MousePointer size={15} />
        </button>

        <button
          onClick={() => setActiveTool('pen')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'pen' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'pen' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'pen' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Pen (Draw)"
        >
          <PenTool size={15} />
        </button>

        <button
          onClick={() => setActiveTool('highlighter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'highlighter' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'highlighter' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'highlighter' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Highlighter"
        >
          <Highlighter size={15} />
        </button>

        <button
          onClick={() => setActiveTool('eraser')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'eraser' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
            border: activeTool === 'eraser' ? '1px solid #ef4444' : '1px solid transparent',
            color: activeTool === 'eraser' ? '#fca5a5' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Eraser"
        >
          <Eraser size={15} />
        </button>

        <button
          onClick={() => setActiveTool('line')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'line' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'line' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'line' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Straight Line"
        >
          <Minus size={15} />
        </button>

        <button
          onClick={() => setActiveTool('arrow')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'arrow' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'arrow' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'arrow' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Arrow"
        >
          <ArrowUpRight size={15} />
        </button>

        <button
          onClick={() => setActiveTool('rectangle')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'rectangle' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'rectangle' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'rectangle' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Rectangle"
        >
          <Square size={14} />
        </button>

        <button
          onClick={() => setActiveTool('circle')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: activeTool === 'circle' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTool === 'circle' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTool === 'circle' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Circle"
        >
          <Circle size={14} />
        </button>
      </div>

      <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

      {/* Color Palette */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: c,
              border: activeColor === c ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.5)',
              boxShadow: activeColor === c ? `0 0 8px ${c}` : 'none',
              cursor: 'pointer',
              padding: 0
            }}
            title={c}
          />
        ))}
      </div>

      <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

      {/* Stroke Width Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[2, 4, 6].map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: strokeWidth === w ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: `${w * 2}px`,
                height: `${w * 2}px`,
                borderRadius: '50%',
                background: strokeWidth === w ? '#ffffff' : 'var(--text-muted)'
              }}
            />
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

      {/* Clear All Tool */}
      <button
        onClick={clearCurrentSlideWhiteboard}
        disabled={whiteboardElements.length === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: whiteboardElements.length > 0 ? '#fca5a5' : 'var(--text-muted)',
          fontSize: '0.75rem',
          cursor: whiteboardElements.length > 0 ? 'pointer' : 'not-allowed'
        }}
        title="Clear all drawings on this slide"
      >
        <Trash2 size={13} />
        Clear
      </button>
    </div>
  );
};
