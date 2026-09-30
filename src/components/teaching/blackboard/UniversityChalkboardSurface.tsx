import React from 'react';
import { ChalkTypewriter } from './DigitalBlackboard';
import { ChalkFormulaRenderer } from './ChalkFormulaRenderer';
import { ChalkBoxDiagram, ChalkArrow } from './DigitalBlackboard';
import { ChalkArrayViz } from './DigitalBlackboard';
import { ChalkWorkedCalculation } from './DigitalBlackboard';
import type { BoardLiveState, ChalkSection } from '../../../types/script5';
import { GraduationCap } from 'lucide-react';

interface UniversityChalkboardSurfaceProps {
  boardState: BoardLiveState;
  topic?: string;
  level?: string;
  currentTime?: number;
  isPlaying?: boolean;
}

/**
 * Animated SVG Hand-Drawn Chalk Underline
 */
const ChalkUnderlineSvg: React.FC<{ color?: string }> = ({ color = '#fde047' }) => (
  <svg
    style={{ width: '100%', height: '8px', overflow: 'visible', marginTop: '2px' }}
    preserveAspectRatio="none"
    viewBox="0 0 300 8"
  >
    <path
      d="M 2 5 Q 75 1, 150 6 T 298 4"
      fill="none"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      className="chalk-underline-path"
      style={{ filter: 'url(#chalk-roughness)' }}
    />
  </svg>
);

/**
 * Animated SVG Hand-Drawn Chalk Circle / Oval Annotation
 */
const ChalkCircleAnnotation: React.FC<{ color?: string }> = ({ color = '#fde047' }) => (
  <svg
    style={{
      position: 'absolute',
      inset: '-8px -12px',
      width: 'calc(100% + 24px)',
      height: 'calc(100% + 16px)',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: 6
    }}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <ellipse
      cx="50"
      cy="50"
      rx="48"
      ry="46"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeDasharray="450"
      strokeDashoffset="450"
      className="chalk-circle-drawn"
      style={{ filter: 'url(#chalk-roughness)', opacity: 0.95 }}
    />
  </svg>
);

/**
 * Individual Chalkboard Zone / Section
 * Renders what the professor writes in this section:
 * - Title with animated underline
 * - KaTeX formula with sharp framing & optional 'where:' parameter definitions
 * - Progressive typewriter notes
 * - Diagrams, box flows, and arrows
 * - CS / Algorithm array pointer visualizations
 * - Hand-drawn chalk circle & highlight oval
 * - Felt eraser animation when clearing
 */
const UniversityChalkZone: React.FC<{
  section: ChalkSection;
  isActive: boolean;
  isErasing: boolean;
}> = ({ section, isActive, isErasing }) => {
  const isCircled = section.isHighlighted || isActive;
  const chalkColor = section.highlightColor || (isActive ? '#fde047' : '#ffffff');

  return (
    <div
      className={`chalkboard-zone ${isCircled ? 'chalk-highlight-oval' : ''} ${
        isErasing || section.isErasing ? 'chalk-section-erasing' : 'animate-fade-in'
      }`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        padding: '10px 14px',
        borderRadius: '6px',
        background: isCircled ? 'rgba(253, 224, 71, 0.035)' : 'rgba(0, 0, 0, 0.28)',
        border: isCircled
          ? '1.5px dashed rgba(253, 224, 71, 0.7)'
          : '1px dashed rgba(255, 255, 255, 0.18)',
        boxShadow: isCircled
          ? '0 0 12px rgba(253, 224, 71, 0.15), inset 0 0 8px rgba(0, 0, 0, 0.5)'
          : 'inset 0 0 8px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        minWidth: 0,
      }}
    >
      {/* ── Active Chalk Circle Annotation ── */}
      {isCircled && <ChalkCircleAnnotation color={chalkColor} />}

      {/* ── 1. Section Title ── */}
      {section.title && (
        <div style={{ position: 'relative', paddingBottom: '2px', flexShrink: 0 }}>
          <h2
            className="chalk-heading"
            style={{
              fontSize: 'clamp(1.05rem, 1.35vw, 1.35rem)',
              margin: 0,
              color: isCircled ? '#fde047' : '#ffffff',
              letterSpacing: '0.02em',
              textShadow: '0 0 2px rgba(255, 255, 255, 0.95), 0 0 6px rgba(255, 255, 255, 0.4)',
              lineHeight: 1.3
            }}
          >
            <ChalkTypewriter text={section.title} charDelay={16} />
          </h2>
          <ChalkUnderlineSvg color={chalkColor} />
        </div>
      )}

      {/* ── 2. Mathematical Formula (KaTeX Typesetting) ── */}
      {section.latexFormula && (
        <div style={{ margin: '4px 0', width: '100%', boxSizing: 'border-box' }}>
          <ChalkFormulaRenderer
            formula={section.latexFormula}
            label={section.formulaLabel || undefined}
            whereDefinitions={section.whereDefinitions || undefined}
            fontSize="clamp(1.15rem, 1.5vw, 1.55rem)"
          />
        </div>
      )}

      {/* ── 3. Diagrams: Box Flow / Architecture / System Nodes ── */}
      {section.boxData && (
        <div style={{ margin: '4px 0' }}>
          <ChalkBoxDiagram boxData={section.boxData} />
        </div>
      )}

      {section.diagram?.ascii && (
        <div style={{ margin: '4px 0' }}>
          <ChalkBoxDiagram ascii={section.diagram.ascii} />
        </div>
      )}

      {/* ── 4. Arrows ── */}
      {section.diagram?.arrows && section.diagram.arrows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
          {section.diagram.arrows.map((arr, aIdx) => (
            <ChalkArrow
              key={aIdx}
              direction={arr.direction || 'down'}
              height={20}
              color={(arr as any).color || '#7dd3fc'}
              label={arr.label}
            />
          ))}
        </div>
      )}

      {/* ── 5. Algorithm Array Visualization (Low, Mid, High Pointers) ── */}
      {section.arrayData && (
        <div style={{ margin: '6px 0' }}>
          <ChalkArrayViz data={section.arrayData} />
        </div>
      )}

      {/* ── 6. Step-by-Step Worked Derivation Calculation ── */}
      {section.workedCalculation && (
        <div style={{ margin: '4px 0' }}>
          <ChalkWorkedCalculation data={section.workedCalculation} />
        </div>
      )}

      {/* ── 7. Progressive Chalk Notes / Explanations ── */}
      {section.notes && section.notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '2px 0' }}>
          {section.notes.map((note, nIdx) => {
            // Check if note is multi-line (e.g. "C = Accumulation\nA = Ablation")
            const lines = note.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

            if (lines.length > 1) {
              return (
                <div key={nIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {lines.map((line, lIdx) => (
                    <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span
                        style={{
                          color: lIdx === 0 ? '#38bdf8' : lIdx === 1 ? '#f472b6' : '#86efac',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          userSelect: 'none'
                        }}
                      >
                        &bull;
                      </span>
                      <div
                        className="chalk-text"
                        style={{
                          fontSize: 'clamp(0.92rem, 1.1vw, 1.05rem)',
                          lineHeight: 1.58,
                          color: '#f8fafc'
                        }}
                      >
                        <ChalkTypewriter text={line} charDelay={14} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={nIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: '#7dd3fc', fontSize: '0.9rem', lineHeight: 1.5, userSelect: 'none' }}>
                  &bull;
                </span>
                <div
                  className="chalk-text"
                  style={{
                    fontSize: 'clamp(0.92rem, 1.1vw, 1.05rem)',
                    lineHeight: 1.58,
                    color: '#f8fafc'
                  }}
                >
                  <ChalkTypewriter text={note} charDelay={14} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * UniversityChalkboardSurface
 * ──────────────────────────────────────────────────────────────────
 * Master script5-driven chalkboard surface.
 * Behave like a real professor writing on a classroom board:
 *   - Follows script5 master timeline strictly.
 *   - NEVER dumps the entire lesson instantly.
 *   - Progressive text writing, formula writing, underline drawing,
 *     circle animations, arrow drawing, diagram drawing, and erasing.
 *   - Zero hardcoded topics. Works universally for:
 *     Mathematics, Physics, Chemistry, Biology, Programming,
 *     Algorithms, DBMS, Machine Learning, Research Papers.
 */
export const UniversityChalkboardSurface: React.FC<UniversityChalkboardSurfaceProps> = ({
  boardState,
  topic = 'General Science',
  level = 'Undergraduate',
}) => {
  const sections = boardState.sections || [];
  const title = boardState.boardTitle || topic;
  const isBoardEmpty = sections.length === 0 && !boardState.boardTitle;

  return (
    <div
      className="university-chalkboard-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px 20px 22px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 5,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(253, 224, 71, 0.4) transparent'
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          1. CHALKBOARD HEADER: Written dynamically via WRITE_TITLE
          ══════════════════════════════════════════════════════════════ */}
      {(boardState.boardTitle || sections.length > 0) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '2px solid rgba(253, 224, 71, 0.75)',
            paddingBottom: '6px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fde047', fontSize: '1.2rem', userSelect: 'none' }}>✎</span>
              <h1
                className="chalk-heading"
                style={{
                  fontSize: 'clamp(1.2rem, 1.8vw, 1.75rem)',
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  textShadow: '0 0 2px rgba(255, 255, 255, 0.95), 0 0 8px rgba(255, 255, 255, 0.35)',
                  lineHeight: 1.25
                }}
              >
                <ChalkTypewriter text={title} charDelay={16} />
              </h1>
            </div>
          </div>

          {/* Academic Level & Professor Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-chalk-clean)',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#7dd3fc',
                letterSpacing: '0.06em',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '2px 10px',
                borderRadius: '5px'
              }}
            >
              {level.toUpperCase()} LECTURE
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2. EMPTY / WAITING STATE: Real Classroom Slate Ready
          Shown ONLY when no actions have written to the board yet
          ══════════════════════════════════════════════════════════════ */}
      {isBoardEmpty && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: 0.85,
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(253, 224, 71, 0.08)',
              border: '1.5px dashed rgba(253, 224, 71, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(253, 224, 71, 0.15)'
            }}
          >
            <GraduationCap size={32} color="#fde047" />
          </div>

          <div
            className="chalk-heading"
            style={{
              fontSize: 'clamp(1.15rem, 1.6vw, 1.5rem)',
              color: '#fde047',
              margin: 0
            }}
          >
            {topic || 'Classroom Blackboard Ready'}
          </div>

          <p
            className="chalk-text"
            style={{
              maxWidth: '460px',
              margin: 0,
              fontSize: '0.92rem',
              color: 'rgba(248, 250, 252, 0.75)',
              lineHeight: 1.55
            }}
          >
            The blackboard writes progressively as the professor lectures.
            Press <strong>Play</strong> or enter a topic to begin synchronous chalkboard writing.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-chalk-clean)',
                fontSize: '0.78rem',
                color: '#86efac',
                border: '1px solid rgba(134, 239, 172, 0.4)',
                background: 'rgba(134, 239, 172, 0.08)',
                padding: '2px 10px',
                borderRadius: '4px'
              }}
            >
              Theory &bull; Formula &bull; Derivation
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. ACTIVE SCRIPT5 BLACKBOARD SURFACE: Progressive Sections
          Renders what has been written up to the current timeline step!
          ══════════════════════════════════════════════════════════════ */}
      {!isBoardEmpty && sections.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              sections.length === 1
                ? 'minmax(0, 1fr)'
                : 'minmax(0, 1.15fr) minmax(0, 1fr)',
            gap: '14px',
            flex: 1,
            alignItems: 'start',
            paddingRight: '22%' /* Reserved clearance for 3D Professor Avatar on bottom-right */
          }}
        >
          {sections.map((sec) => (
            <UniversityChalkZone
              key={sec.id}
              section={sec}
              isActive={sec.id === boardState.activeSectionId}
              isErasing={sec.id === boardState.erasingSectionId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
