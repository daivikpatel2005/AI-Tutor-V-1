/**
 * DigitalBlackboard — Authentic Professor Digital Chalkboard
 * ──────────────────────────────────────────────────────────────────
 * Behaves like a real professor's classroom blackboard:
 *   - Progressive teaching: content accumulates across sections instead of wiping like slides!
 *   - Chalk handwriting animation (typewriter with glowing chalk cursor)
 *   - Chalk diagrams & box flow (e.g. Snowfall ↓ [GLACIER] ↑ Mass gained)
 *   - Chalk arrows with SVG stroke draw animation
 *   - Chalk mathematical formulas with hand-drawn frames
 *   - Chalk coordinate graphs with animated curves & equilibrium annotations
 *   - Realistic felt eraser animation with chalk dust smudge trails
 *   - Section clearing & targeted highlight pulses
 *   - Pinned reference images from the Visual Learning Engine
 *   - Strict 16:9 responsive aspect ratio on walnut chalkboard frame
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import './DigitalBlackboard.css';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  Zap,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useScriptPlayer } from '../../../hooks/useScriptPlayer';
import { generateLessonTimeline, resolveStudentDoubt } from '../../../services/script5Service';
import type { BoardLiveState, ChalkSection, ClassroomLessonPlan } from '../../../types/script5';
import type { WorkedCalculationData } from '../../../types/masterTimeline';
import { useOptionalMasterClassroom } from '../../../context/MasterClassroomContext';
import { UniversityChalkboardSurface } from './UniversityChalkboardSurface';

// ─── ChalkTypewriter ─────────────────────────────────────────────────────────
/**
 * Character-by-character chalk handwriting animation with realistic chalk tip cursor.
 */
export const ChalkTypewriter: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
  charDelay?: number;
  onDone?: () => void;
}> = ({ text, className, style, charDelay = 20, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const prevTextRef = useRef('');

  useEffect(() => {
    if (!text) {
      setDisplayed('');
      setDone(false);
      return;
    }
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      setDisplayed('');
      setDone(false);
    }
  }, [text]);

  useEffect(() => {
    if (!text || done) return;
    if (displayed.length >= text.length) {
      setDone(true);
      onDone?.();
      return;
    }
    const timer = setTimeout(() => {
      setDisplayed(text.substring(0, displayed.length + 1));
    }, charDelay);
    return () => clearTimeout(timer);
  }, [text, displayed, done, charDelay, onDone]);

  return (
    <span className={className} style={{ position: 'relative', display: 'inline', ...style }}>
      {displayed}
      {!done && (
        <span
          className="chalk-hand-piece"
          title="Writing with chalk"
          style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '3px' }}
        >
          <svg width="18" height="22" viewBox="0 0 18 22" style={{ overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(253,224,71,0.9))' }}>
            {/* Angled chalk stick cylinder */}
            <rect x="5" y="1" width="6.5" height="15" rx="1.5" transform="rotate(-30 8 9)" fill="#fde047" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            {/* Chalk tip point touching the board */}
            <circle cx="3" cy="18" r="2.2" fill="#ffffff" />
            {/* Subtle dust particles */}
            <circle cx="1" cy="20" r="0.8" fill="#fde047" className="chalk-dust-spark" />
            <circle cx="4.5" cy="21" r="0.6" fill="#ffffff" className="chalk-dust-spark" />
          </svg>
        </span>
      )}
    </span>
  );
};

// ─── ChalkArrow ──────────────────────────────────────────────────────────────
/**
 * Chalk-drawn SVG arrow with rough edges and progressive stroke animation.
 */
export const ChalkArrow: React.FC<{
  direction?: 'down' | 'up' | 'right' | 'left';
  color?: string;
  label?: string;
  height?: number;
}> = ({ direction = 'down', color = '#fde047', label, height = 36 }) => {
  const isVertical = direction === 'down' || direction === 'up';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        margin: '2px 0',
      }}
    >
      {label && (
        <span
          className="chalk-text"
          style={{
            fontSize: '0.72rem',
            color: color,
            fontFamily: 'var(--font-chalk-hand)',
            opacity: 0.9,
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
      )}
      <svg
        width={isVertical ? 22 : height}
        height={isVertical ? height : 22}
        style={{ overflow: 'visible', filter: 'url(#chalk-roughness)' }}
      >
        {direction === 'down' && (
          <path
            d={`M 11 2 L 11 ${height - 6}`}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            className="chalk-stroke-draw"
            markerEnd="url(#chalk-arrowhead)"
          />
        )}
        {direction === 'up' && (
          <path
            d={`M 11 ${height - 2} L 11 6`}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            className="chalk-stroke-draw"
            markerEnd="url(#chalk-arrowhead)"
          />
        )}
        {direction === 'right' && (
          <path
            d={`M 2 11 L ${height - 6} 11`}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            className="chalk-stroke-draw"
            markerEnd="url(#chalk-arrowhead)"
          />
        )}
        {direction === 'left' && (
          <path
            d={`M ${height - 2} 11 L 6 11`}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            className="chalk-stroke-draw"
            markerEnd="url(#chalk-arrowhead)"
          />
        )}
      </svg>
    </div>
  );
};

// ─── ChalkBoxDiagram ─────────────────────────────────────────────────────────
/**
 * Renders an educational diagram with top annotations, arrows, framed chalk box, and bottom labels.
 * Example:
 *     Snowfall
 *        ↓
 *    ┌─────────┐
 *    │ GLACIER │
 *    └─────────┘
 *        ↑
 *   Mass gained
 */
export const ChalkBoxDiagram: React.FC<{
  boxData?: {
    label: string;
    subtext?: string;
    topAnnotation?: string;
    bottomAnnotation?: string;
  } | null;
  ascii?: string;
}> = ({ boxData, ascii }) => {
  if (ascii) {
    return (
      <div style={{ margin: '8px 0', padding: '2px 0', background: 'transparent' }}>
        <pre
          className="chalk-ascii-board"
          style={{
            color: '#fde047',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            lineHeight: 1.35,
            fontSize: 'clamp(0.85rem, 1.1vw, 1.05rem)',
            textShadow: '0 0 2px rgba(253,224,71,0.8), 0 0 10px rgba(253,224,71,0.4)',
            filter: 'url(#chalk-roughness)',
          }}
        >
          {ascii}
        </pre>
      </div>
    );
  }

  if (!boxData) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 0',
        margin: '6px 0',
        background: 'transparent',
      }}
    >
      {/* Top Annotation & Down Arrow */}
      {boxData.topAnnotation && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            className="chalk-text-cyan"
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'var(--font-chalk-hand)',
              textShadow: '0 0 4px rgba(125,211,252,0.7)',
            }}
          >
            {boxData.topAnnotation}
          </span>
          <ChalkArrow direction="down" height={26} color="#7dd3fc" />
        </div>
      )}

      {/* Main Chalk Box: pure chalkboard box drawing */}
      <div
        style={{
          border: '2px solid #fde047',
          padding: '6px 16px',
          margin: '2px 0',
          filter: 'url(#chalk-roughness)',
          boxShadow: '0 0 12px rgba(253,224,71,0.4)',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span
          className="chalk-text-yellow"
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            fontFamily: 'var(--font-chalk-display)',
            textShadow: '0 0 6px rgba(253, 224, 71, 0.9)',
          }}
        >
          {boxData.label}
        </span>
        {boxData.subtext && (
          <span
            className="chalk-text"
            style={{ fontSize: '0.76rem', opacity: 0.85, fontFamily: 'var(--font-chalk-hand)' }}
          >
            {boxData.subtext}
          </span>
        )}
      </div>

      {/* Up Arrow & Bottom Annotation */}
      {boxData.bottomAnnotation && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ChalkArrow direction="up" height={26} color="#86efac" />
          <span
            className="chalk-text-mint"
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'var(--font-chalk-hand)',
              textShadow: '0 0 4px rgba(134,239,172,0.7)',
            }}
          >
            {boxData.bottomAnnotation}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── ChalkGraphViz ───────────────────────────────────────────────────────────
/**
 * Renders a chalkboard coordinate graph with axes, labels, and animated curves.
 */
export const ChalkGraphViz: React.FC<{
  graphData?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
    curveType?: string;
  } | null;
}> = ({ graphData }) => {
  if (!graphData) return null;

  return (
    <div
      style={{
        margin: '8px 0',
        padding: '10px 12px',
        borderRadius: '6px',
        background: 'rgba(0, 0, 0, 0.32)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {graphData.title && (
        <div
          className="chalk-text-yellow"
          style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-chalk-display)',
            fontWeight: 700,
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          📈 {graphData.title}
        </div>
      )}

      <svg
        viewBox="0 0 260 140"
        style={{ width: '100%', maxWidth: '280px', height: '130px', overflow: 'visible', filter: 'url(#chalk-roughness)' }}
      >
        {/* Y Axis */}
        <line x1="130" y1="125" x2="130" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" markerEnd="url(#chalk-arrowhead)" />
        {/* X Axis */}
        <line x1="20" y1="70" x2="245" y2="70" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" markerEnd="url(#chalk-arrowhead)" />

        {/* Axis Labels */}
        <text x="135" y="16" fill="#86efac" fontSize="9" fontFamily="var(--font-chalk-hand)" fontWeight="bold">
          {graphData.yLabel || 'Altitude (z)'}
        </text>
        <text x="195" y="65" fill="#7dd3fc" fontSize="9" fontFamily="var(--font-chalk-hand)" fontWeight="bold">
          {graphData.xLabel || 'b(z) > 0'}
        </text>
        <text x="25" y="65" fill="#f472b6" fontSize="9" fontFamily="var(--font-chalk-hand)" fontWeight="bold">
          b(z) &lt; 0
        </text>

        {/* ELA Dashed Line (Altitude where balance is 0) */}
        <line x1="30" y1="70" x2="230" y2="70" stroke="#fde047" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.6" />
        <circle cx="130" cy="70" r="3.5" fill="#fde047" />
        <text x="136" y="82" fill="#fde047" fontSize="9" fontFamily="var(--font-chalk-hand)" fontWeight="bold">
          ELA (b = 0)
        </text>

        {/* Mass Balance Curve crossing ELA */}
        <path
          d="M 50 120 Q 90 95, 130 70 T 210 25"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="chalk-stroke-draw"
        />

        {/* Zones labels */}
        <text x="145" y="42" fill="#86efac" fontSize="8" fontFamily="var(--font-chalk-hand)">
          ▲ Accumulation (b &gt; 0)
        </text>
        <text x="45" y="105" fill="#f87171" fontSize="8" fontFamily="var(--font-chalk-hand)">
          ▼ Ablation (b &lt; 0)
        </text>
      </svg>
    </div>
  );
};

// ─── ChalkArrayViz ────────────────────────────────────────────────────────────
export const ChalkArrayViz: React.FC<{ data: BoardLiveState['arrayData'] }> = ({ data }) => {
  if (!data || !data.elements?.length) return null;
  const { elements, pointers, dimmed = [] } = data;

  return (
    <div style={{ marginTop: '8px' }}>
      <span className="chalk-text" style={{ fontSize: '0.74rem', opacity: 0.7, letterSpacing: '0.08em' }}>
        ARRAY STATE:
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', paddingBottom: '22px' }}>
        {elements.map((val: any, idx: number) => {
          const isLow = pointers?.low === idx;
          const isMid = pointers?.mid === idx;
          const isHigh = pointers?.high === idx;
          const isDimmed = dimmed.includes(idx);

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: '46px',
                height: '52px',
                border: `2px solid ${isMid ? '#fde047' : isDimmed ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)'}`,
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isMid ? 'rgba(253,224,71,0.15)' : isDimmed ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.03)',
                opacity: isDimmed ? 0.28 : 1,
                transform: isMid ? 'scale(1.08)' : 'none',
                transition: 'all 0.3s ease',
                boxShadow: isMid ? '0 0 14px rgba(253,224,71,0.5)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontFamily: 'var(--font-chalk-hand)' }}>
                [{idx}]
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-chalk-hand)',
                  color: isMid ? '#fde047' : '#f8fafc',
                }}
              >
                {val}
              </span>

              <div style={{ position: 'absolute', top: '104%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                {isLow && <span style={{ fontSize: '0.55rem', color: '#60a5fa', fontFamily: 'var(--font-chalk-hand)' }}>▲ low</span>}
                {isMid && <span style={{ fontSize: '0.55rem', color: '#fde047', fontFamily: 'var(--font-chalk-hand)' }}>▲ mid</span>}
                {isHigh && <span style={{ fontSize: '0.55rem', color: '#f87171', fontFamily: 'var(--font-chalk-hand)' }}>▲ high</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── ChalkImage ──────────────────────────────────────────────────────────────
export const ChalkImage: React.FC<{ data: BoardLiveState['diagramData'] }> = ({ data }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [data?.image_url]);

  if (!data || !data.image_url) return null;

  return (
    <div
      style={{
        marginTop: '8px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px dashed rgba(125,211,252,0.4)',
        background: 'rgba(0,0,0,0.3)',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.6s ease',
        maxHeight: '190px',
      }}
    >
      <img
        src={data.image_url}
        alt={data.caption || 'Visual diagram'}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '185px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {data.caption && (
        <div
          className="chalk-text"
          style={{
            fontSize: '0.72rem',
            padding: '4px 8px',
            color: '#94a3b8',
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            fontStyle: 'italic',
          }}
        >
          {data.caption}
        </div>
      )}
    </div>
  );
};

// ─── ChalkWorkedCalculation Component ──────────────────────────────────────
/**
 * Renders a professor's authentic step-by-step arithmetic chalkboard derivation box.
 */
export const ChalkWorkedCalculation: React.FC<{ data?: WorkedCalculationData | null }> = ({ data }) => {
  if (!data) return null;
  return (
    <div
      style={{
        margin: '8px 0',
        padding: '10px 14px',
        border: '2px solid rgba(253, 224, 71, 0.75)',
        borderRadius: '4px',
        background: 'rgba(0, 0, 0, 0.4)',
        boxShadow: '0 0 16px rgba(253, 224, 71, 0.25)',
        filter: 'url(#chalk-roughness)',
      }}
    >
      <div
        className="chalk-text-yellow"
        style={{
          fontSize: '0.88rem',
          fontFamily: 'var(--font-chalk-display)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>📐</span>
        <span>{data.title || 'STEP-BY-STEP DERIVATION'}</span>
      </div>

      {data.governingEquation && (
        <div
          style={{
            fontFamily: 'var(--font-chalk-math)',
            fontSize: '1rem',
            color: '#7dd3fc',
            padding: '3px 8px',
            marginBottom: '8px',
            background: 'rgba(56, 189, 248, 0.1)',
            borderLeft: '3px solid #38bdf8',
          }}
        >
          {data.governingEquation}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.steps?.map((step) => (
          <div
            key={step.stepNumber}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '4px 8px',
              borderRadius: '3px',
              background: step.isResult ? 'rgba(253, 224, 71, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: step.isResult ? '1px solid #fde047' : '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-chalk-hand)',
                  color: step.isResult ? '#fde047' : '#94a3b8',
                  fontWeight: 600,
                }}
              >
                Step {step.stepNumber}: {step.label}
              </span>
              <span
                className={step.isResult ? 'chalk-text-yellow' : 'chalk-text'}
                style={{
                  fontFamily: 'var(--font-chalk-math)',
                  fontSize: step.isResult ? '1.05rem' : '0.92rem',
                  fontWeight: step.isResult ? 700 : 500,
                }}
              >
                {step.math}
              </span>
            </div>
            {step.explanation && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-chalk-hand)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontStyle: 'italic',
                  marginTop: '2px',
                }}
              >
                {step.explanation}
              </span>
            )}
          </div>
        ))}
      </div>

      {data.physicalConclusion && (
        <div
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            background: 'rgba(244, 63, 94, 0.15)',
            borderLeft: '3px solid #f43f5e',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-chalk-hand)',
            color: '#fca5a5',
            fontWeight: 600,
          }}
        >
          {data.physicalConclusion}
        </div>
      )}
    </div>
  );
};

// ─── ChalkboardZone Component ──────────────────────────────────────────────
/**
 * Renders a chalkboard zone directly on the slate (ACCUMULATION, ABLATION, ELA, etc.)
 * NO web cards, NO PowerPoint slides — pure chalkboard teaching.
 */
export const ChalkboardZone: React.FC<{
  section: ChalkSection;
  isActive?: boolean;
}> = ({ section }) => {
  return (
    <div
      className={`chalkboard-zone ${section.isHighlighted ? 'chalk-highlight-oval' : ''}`}
    >
      {/* Section Title with Underline */}
      {section.title && (
        <div style={{ position: 'relative', paddingBottom: '4px' }}>
          <h2
            className="chalk-heading"
            style={{
              fontSize: 'clamp(1.1rem, 1.4vw, 1.35rem)',
              margin: 0,
              color: section.isHighlighted ? '#fde047' : '#f8fafc',
              textShadow: '0 0 6px rgba(255,255,255,0.7)',
            }}
          >
            <ChalkTypewriter text={section.title} charDelay={16} />
          </h2>
          <svg style={{ width: '100%', height: '7px', overflow: 'visible' }} preserveAspectRatio="none" viewBox="0 0 200 7">
            <path
              d="M 1 4 Q 50 1, 100 5 T 198 4"
              fill="none"
              stroke={section.highlightColor || '#fde047'}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
              style={{ filter: 'url(#chalk-roughness)' }}
            />
          </svg>
        </div>
      )}

      {/* Box Flow / Concept Diagram */}
      {section.boxData && <ChalkBoxDiagram boxData={section.boxData} />}
      {section.diagram?.ascii && <ChalkBoxDiagram ascii={section.diagram.ascii} />}

      {/* LaTeX Formula Frame: Hand-drawn chalk box */}
      {section.latexFormula && (
        <div
          style={{
            padding: '6px 12px',
            border: '2px solid rgba(125,211,252,0.7)',
            margin: '4px 0',
            filter: 'url(#chalk-roughness)',
            boxShadow: '0 0 10px rgba(125,211,252,0.3)',
          }}
        >
          {section.formulaLabel && (
            <div style={{ fontSize: '0.68rem', color: '#7dd3fc', fontFamily: 'var(--font-chalk-hand)', marginBottom: '2px' }}>
              {section.formulaLabel}
            </div>
          )}
          <div className="chalk-formula" style={{ fontSize: 'clamp(1rem, 1.3vw, 1.35rem)' }}>
            <ChalkTypewriter
              text={section.latexFormula}
              charDelay={24}
              className="chalk-text-yellow"
              style={{ fontFamily: 'var(--font-chalk-math)' }}
            />
          </div>
        </div>
      )}

      {/* Coordinate Graph */}
      {section.graph && <ChalkGraphViz graphData={section.graph} />}

      {/* Notes / Bullet points written in chalk */}
      {section.notes && section.notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
          {section.notes.map((note, idx) => (
            <div
              key={idx}
              className="chalk-text"
              style={{
                fontSize: '0.92rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-line',
                fontFamily: 'var(--font-chalk-hand)',
                textShadow: '0 0 1px rgba(255,255,255,0.7)',
              }}
            >
              <ChalkTypewriter text={note} charDelay={14} />
            </div>
          ))}
        </div>
      )}

      {/* Step-by-Step Worked Derivation Calculation */}
      {section.workedCalculation && <ChalkWorkedCalculation data={section.workedCalculation} />}

      {/* Array Visualization */}
      {section.arrayData && <ChalkArrayViz data={section.arrayData} />}

      {/* Pinned Diagram Image */}
      {section.imageUrl && (
        <ChalkImage
          data={{
            image_url: section.imageUrl,
            caption: section.imageCaption || '',
            visual_type: 'diagram',
          }}
        />
      )}
    </div>
  );
};

// ─── Main DigitalBlackboard Component ─────────────────────────────────────────

export interface DigitalBlackboardProps {
  initialTopic?: string;
  initialLevel?: string;
  children?: React.ReactNode;
  onBoardStateChange?: (state: BoardLiveState) => void;
  onLessonPlanChange?: (plan: ClassroomLessonPlan | null) => void;
  // Master Teaching Timeline inputs
  masterBoardState?: BoardLiveState | null;
  masterLessonPlan?: ClassroomLessonPlan | null;
  masterIsPlaying?: boolean;
  masterIsPaused?: boolean;
  masterIsLoading?: boolean;
  masterEventIndex?: number;
  onMasterPlay?: () => void;
  onMasterPause?: () => void;
  onMasterNext?: () => void;
  onMasterPrev?: () => void;
  onMasterSeek?: (timeSec: number) => void;
  onMasterLoadTopic?: (topic: string, level?: string) => Promise<void>;
}

export const DigitalBlackboard: React.FC<DigitalBlackboardProps> = ({
  initialTopic,
  initialLevel = 'Undergraduate',
  children,
  onBoardStateChange,
  onLessonPlanChange,
  masterBoardState,
  masterLessonPlan,
  masterIsPlaying,
  masterIsPaused,
  masterIsLoading,
  masterEventIndex,
  onMasterPlay,
  onMasterPause,
  onMasterNext,
  onMasterPrev,
  onMasterSeek,
  onMasterLoadTopic,
}) => {
  const [topicInput, setTopicInput] = useState(initialTopic ?? '');
  const [levelInput, setLevelInput] = useState(initialLevel);
  const [isWiping, setIsWiping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId] = useState(`sess_${Date.now()}`);
  const [lessonIdRef, setLessonIdRef] = useState('startup');
  const [doubtInput, setDoubtInput] = useState('');
  const [isDoubtOpen, setIsDoubtOpen] = useState(false);

  // Fallback internal player if not running under master orchestrator
  const internalPlayer = useScriptPlayer({
    onStateChange: onBoardStateChange,
    speed: 1.0,
  });

  const masterClassroom = useOptionalMasterClassroom();

  // Effective unified state: Master Teaching Timeline is primary source of truth
  const boardState = masterBoardState || masterClassroom?.boardLiveState || internalPlayer.boardState;
  const lessonPlan = masterLessonPlan !== undefined ? masterLessonPlan : (masterClassroom?.lessonPlan || internalPlayer.lessonPlan);
  const isPlaying = masterIsPlaying !== undefined ? masterIsPlaying : (masterClassroom?.isPlaying ?? internalPlayer.isPlaying);
  const isPaused = masterIsPaused !== undefined ? masterIsPaused : (masterClassroom?.isPaused ?? internalPlayer.isPaused);
  const isLoading = masterIsLoading !== undefined ? masterIsLoading : (masterClassroom?.isLoading ?? internalPlayer.isLoading);
  const error = masterClassroom?.error || internalPlayer.error;
  const eventIndex = masterEventIndex !== undefined ? masterEventIndex : (masterClassroom?.activeEventIndex ?? internalPlayer.eventIndex);
  const currentTime = masterClassroom?.currentTime ?? 38.0;

  const {
    setIsLoading,
    setError,
    loadAndPlay,
    playDoubtEvents,
    pause,
    resume,
    seekTo,
    stop,
  } = internalPlayer;

  useEffect(() => {
    onLessonPlanChange?.(lessonPlan);
  }, [lessonPlan, onLessonPlanChange]);

  // ── Fetch lesson from script5 backend ────────────────────────────────────
  const fetchAndPlay = useCallback(
    async (topic: string, level: string) => {
      if (!topic.trim()) return;
      setIsLoading(true);
      setError(null);
      stop();

      try {
        const plan = await generateLessonTimeline(topic.trim(), level);
        setLessonIdRef(plan.lesson_id);
        loadAndPlay(plan);
      } catch (e: any) {
        setError(e.message ?? 'Failed to generate lesson from script5');
      } finally {
        setIsLoading(false);
      }
    },
    [loadAndPlay, setIsLoading, setError, stop]
  );

  // Auto-load initial topic
  useEffect(() => {
    if (initialTopic) fetchAndPlay(initialTopic, initialLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handle student doubt ──────────────────────────────────────────────────
  const handleDoubt = useCallback(async () => {
    if (!doubtInput.trim()) return;
    setIsDoubtOpen(false);
    pause();

    try {
      const res = await resolveStudentDoubt({
        session_id: sessionId,
        lesson_id: lessonIdRef,
        current_timestamp_ms: eventIndex * 5000,
        student_transcript: doubtInput.trim(),
        blackboard_snapshot: {},
        level: levelInput,
      });

      if (res.resolution_events?.length) {
        playDoubtEvents(res.resolution_events, () => {
          if (lessonPlan) resume();
        });
      } else {
        resume();
      }
    } catch (e: any) {
      console.error('[Blackboard] Doubt resolution error:', e);
      resume();
    }
    setDoubtInput('');
  }, [doubtInput, pause, resume, sessionId, lessonIdRef, eventIndex, levelInput, lessonPlan, playDoubtEvents]);

  // ── Realistic Eraser Animation ────────────────────────────────────────────
  const handleErase = () => {
    setIsWiping(true);
    stop();
    setTimeout(() => setIsWiping(false), 900);
  };

  const totalEvents = lessonPlan?.events.length ?? 0;

  return (
    <div className={`blackboard-outer-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {/* SVG Roughness Filter & Arrowhead Definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="chalk-roughness" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <marker id="chalk-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#fde047" opacity="0.9" />
          </marker>
        </defs>
      </svg>

      {/* Walnut Chalkboard Frame */}
      <div className="blackboard-wood-frame">
        <div className="blackboard-corner-screw screw-tl" />
        <div className="blackboard-corner-screw screw-tr" />
        <div className="blackboard-corner-screw screw-bl" />
        <div className="blackboard-corner-screw screw-br" />

        {/* ── Slate Blackboard Surface ── */}
        <div className="blackboard-slate-surface">
          <div className="blackboard-dust-overlay" />

          {/* Realistic Felt Chalk Eraser Tool Animation on Wipe */}
          {isWiping && (
            <>
              <div className="chalk-felt-eraser-tool chalk-eraser-sweeping">
                CHALK ERASER
              </div>
              <div className="chalk-dust-smudge-trail" />
            </>
          )}

          {/* Pulse Glow Overlay */}
          {boardState.isPulsing && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `inset 0 0 60px ${boardState.highlightColor ?? '#38bdf8'}44`,
                pointerEvents: 'none',
                zIndex: 3,
                borderRadius: '4px',
                animation: 'pulseGlow 0.9s ease both',
              }}
            />
          )}

          {/* ══ CONTENT CANVAS AREA ══════════════════════════════════════════ */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '16px 22px 38px 22px',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* ── TOP CONTROL BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
              <input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAndPlay(topicInput, levelInput)}
                placeholder="Enter topic (e.g. Glacier Mass Balance, Gradient Descent, Dijkstra…)"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  background: 'rgba(0,0,0,0.38)',
                  border: '1px dashed rgba(253,224,71,0.5)',
                  borderRadius: '5px',
                  color: '#fde047',
                  fontFamily: 'var(--font-chalk-hand)',
                  fontSize: '0.92rem',
                  padding: '4px 10px',
                  outline: 'none',
                }}
              />

              <select
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                style={{
                  background: '#12211c',
                  color: '#86efac',
                  border: '1px dashed rgba(134,239,172,0.5)',
                  borderRadius: '5px',
                  fontFamily: 'var(--font-chalk-hand)',
                  fontSize: '0.85rem',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Advanced">Advanced</option>
                <option value="Research/PhD">Research/PhD</option>
              </select>

              <button
                onClick={() => onMasterLoadTopic ? onMasterLoadTopic(topicInput, levelInput) : fetchAndPlay(topicInput, levelInput)}
                disabled={isLoading || !topicInput.trim()}
                style={{
                  background: isLoading ? 'rgba(253,224,71,0.08)' : 'rgba(253,224,71,0.22)',
                  border: '1px solid rgba(253,224,71,0.6)',
                  borderRadius: '5px',
                  color: '#fde047',
                  cursor: isLoading ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-chalk-hand)',
                  fontSize: '0.88rem',
                  padding: '4px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  opacity: isLoading || !topicInput.trim() ? 0.55 : 1,
                }}
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                {isLoading ? 'Generating…' : 'Teach'}
              </button>

              <button
                onClick={() => setIsDoubtOpen(true)}
                disabled={!lessonPlan}
                style={{
                  background: 'rgba(244,114,182,0.12)',
                  border: '1px dashed rgba(244,114,182,0.5)',
                  borderRadius: '5px',
                  color: '#f472b6',
                  cursor: lessonPlan ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-chalk-hand)',
                  fontSize: '0.85rem',
                  padding: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: lessonPlan ? 1 : 0.35,
                }}
              >
                <BookOpen size={12} /> Ask Doubt
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '5px' }}>
                <AlertCircle size={13} color="#f87171" />
                <span style={{ color: '#f87171', fontFamily: 'var(--font-chalk-hand)', fontSize: '0.88rem' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px' }}>
                <Loader2 size={32} color="#fde047" className="animate-spin" />
                <span className="chalk-text-yellow" style={{ fontSize: '1.05rem', textAlign: 'center' }}>
                  Professor is preparing the blackboard lesson…
                </span>
                <span className="chalk-text" style={{ fontSize: '0.82rem', opacity: 0.7 }}>
                  Grounding scientific knowledge · Structuring progressive chalk sections
                </span>
              </div>
            )}

            {/* ══ PROFESSOR'S PROGRESSIVE UNIVERSITY CHALKBOARD SURFACE ══ */}
            {!isLoading && (
              <UniversityChalkboardSurface
                boardState={boardState}
                topic={topicInput || lessonPlan?.topic || 'Glacier Mass Balance'}
                level={levelInput}
                currentTime={currentTime}
                isPlaying={isPlaying}
              />
            )}
          </div>

          {/* Children: 3D Avatar overlay */}
          {children}
        </div>

        {/* ── CHALK TRAY (At base of wooden chalkboard frame) ── */}
        <div className="blackboard-chalk-tray">
          <div className="chalk-tray-dust" />

          {/* Chalk sticks */}
          <div className="chalk-sticks-collection" title="Chalk sticks collection">
            <div className="chalk-stick stick-white" title="White chalk" />
            <div className="chalk-stick stick-yellow" title="Yellow chalk" />
            <div className="chalk-stick stick-cyan" title="Cyan chalk" />
            <div className="chalk-stick stick-pink" title="Pink chalk" />
            <div className="chalk-stick stick-mint" title="Mint chalk" />
          </div>

          {/* Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 5 }}>
            <button
              onClick={() => {
                if (onMasterPrev) onMasterPrev();
                else if (lessonPlan) seekTo(Math.max(0, eventIndex - 1));
              }}
              disabled={!lessonPlan || eventIndex === 0}
              style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', opacity: eventIndex === 0 ? 0.3 : 0.8, padding: '2px' }}
              title="Previous step"
            >
              <ChevronLeft size={13} />
            </button>

            <button
              onClick={() => {
                if (!lessonPlan) return;
                if (isPlaying && !isPaused) {
                  onMasterPause ? onMasterPause() : pause();
                } else {
                  onMasterPlay ? onMasterPlay() : (isPaused ? resume() : loadAndPlay(lessonPlan));
                }
              }}
              disabled={!lessonPlan}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '3px',
                color: isPlaying && !isPaused ? '#fde047' : '#f8fafc',
                cursor: lessonPlan ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '1px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-chalk-hand)',
                opacity: lessonPlan ? 1 : 0.35,
              }}
            >
              {isPlaying && !isPaused ? <Pause size={10} /> : <Play size={10} />}
              {isPlaying && !isPaused ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={() => {
                if (onMasterNext) onMasterNext();
                else if (lessonPlan) seekTo(Math.min(totalEvents - 1, eventIndex + 1));
              }}
              disabled={!lessonPlan || eventIndex >= totalEvents - 1}
              style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', opacity: eventIndex >= totalEvents - 1 ? 0.3 : 0.8, padding: '2px' }}
              title="Next step"
            >
              <ChevronRight size={13} />
            </button>

            {/* Step progress dots */}
            {lessonPlan && (
              <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                {lessonPlan.events.map((_: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (onMasterSeek && i * 6) onMasterSeek(i * 6);
                      else seekTo(i);
                    }}
                    title={`Step ${i + 1}`}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: i === eventIndex ? '#fde047' : i < eventIndex ? '#86efac' : 'rgba(255,255,255,0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: i === eventIndex ? '1px solid rgba(253,224,71,0.9)' : '1px solid transparent',
                      boxShadow: i === eventIndex ? '0 0 6px rgba(253,224,71,0.7)' : 'none',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Chalk Felt Eraser & Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 5 }}>
            <div
              className="chalk-eraser"
              onClick={handleErase}
              title="Erase chalkboard with felt eraser"
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <RotateCcw size={9} style={{ marginRight: '3px' }} />
              ERASER
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: '2px' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── STUDENT DOUBT MODAL ── */}
      {isDoubtOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#12211c',
              border: '2px dashed rgba(244,114,182,0.6)',
              borderRadius: '8px',
              padding: '16px 20px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 12px 36px rgba(0,0,0,0.9)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={16} color="#f472b6" />
              <span className="chalk-heading" style={{ fontSize: '1.05rem', color: '#f472b6', margin: 0 }}>
                Ask Professor a Doubt
              </span>
            </div>
            <p className="chalk-text" style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '10px' }}>
              The lecture will pause while the professor answers your doubt on the blackboard.
            </p>
            <textarea
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder="Ask anything (e.g. Why does accumulation decrease at lower altitudes?)"
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(244,114,182,0.4)',
                borderRadius: '5px',
                color: '#f8fafc',
                fontFamily: 'var(--font-chalk-hand)',
                fontSize: '0.9rem',
                padding: '8px',
                outline: 'none',
                resize: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => setIsDoubtOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  color: '#94a3b8',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-chalk-hand)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDoubt}
                disabled={!doubtInput.trim()}
                style={{
                  background: 'rgba(244,114,182,0.2)',
                  border: '1px solid rgba(244,114,182,0.7)',
                  borderRadius: '4px',
                  color: '#f472b6',
                  padding: '4px 14px',
                  fontFamily: 'var(--font-chalk-hand)',
                  cursor: doubtInput.trim() ? 'pointer' : 'not-allowed',
                  opacity: doubtInput.trim() ? 1 : 0.4,
                }}
              >
                Ask Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
