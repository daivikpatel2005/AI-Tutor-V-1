import React, { useMemo } from 'react';
import katex from 'katex';
import type { MathParameterDefinition } from '../../../types/script5';

export interface ChalkFormulaRendererProps {
  /** LaTeX formula string, e.g. "B = C - A = \\int (c(z) - a(z)) \\, dA" */
  formula: string;
  /** Optional academic label / heading, e.g. "Governing State Equation" */
  label?: string;
  /** Whether to render in standalone display mode (centered, larger) or inline */
  displayMode?: boolean;
  /** Responsive font size or CSS clamp */
  fontSize?: string;
  /** Optional structured parameter definitions for mixed teaching */
  whereDefinitions?: MathParameterDefinition[];
  /** Optional custom CSS class */
  className?: string;
  /** Optional container style */
  style?: React.CSSProperties;
}

/**
 * ChalkFormulaRenderer
 * ──────────────────────────────────────────────────────────────────
 * Professional University Mathematical Typesetting Engine using KaTeX.
 * Renders mathematical expressions with textbook precision, including:
 *   - Fractions, powers, subscripts, and superscripts
 *   - Greek letters, vectors (\mathbf, \vec), and nabla (\nabla)
 *   - Integrals (\int, \iint, \oint) and summations (\sum)
 *   - Matrices (\begin{bmatrix}) and systems of equations
 *   - Total and partial derivatives (\frac{d}{dt}, \frac{\partial}{\partial x})
 *   - Limits (\lim), scientific notation (\times 10^n), inequalities (\ge, \le)
 *   - Physical and scientific units (\text{m w.e./yr}, \text{kg}\cdot\text{m/s}^2)
 *
 * Supports mixed pedagogical chalkboard teaching:
 *   Displays the primary equation followed by structured 'where:' parameter legends.
 */
export const ChalkFormulaRenderer: React.FC<ChalkFormulaRendererProps> = ({
  formula,
  label,
  displayMode = true,
  fontSize = 'clamp(1.2rem, 1.65vw, 1.85rem)',
  whereDefinitions,
  className = '',
  style = {}
}) => {
  if (!formula || typeof formula !== 'string' || !formula.trim()) {
    return null;
  }

  // Pre-process and normalize mathematical string
  const cleanLatex = useMemo(() => {
    let clean = formula.trim();
    // Strip redundant leading/trailing $$ or $
    if (clean.startsWith('$$') && clean.endsWith('$$')) {
      clean = clean.slice(2, -2).trim();
    } else if (clean.startsWith('$') && clean.endsWith('$')) {
      clean = clean.slice(1, -1).trim();
    }
    return clean;
  }, [formula]);

  // Render primary formula to HTML using KaTeX
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(cleanLatex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'htmlAndMathml'
      });
    } catch (err) {
      console.warn('KaTeX rendering fallback:', err);
      return `<span class="katex-fallback">${cleanLatex}</span>`;
    }
  }, [cleanLatex, displayMode]);

  return (
    <div
      className={`chalk-formula-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '12px 16px',
        border: '1.5px dashed rgba(253, 224, 71, 0.75)',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.45)',
        boxShadow:
          '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 16px rgba(0, 0, 0, 0.7), 0 0 10px rgba(253, 224, 71, 0.15)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
        overflowY: 'hidden',
        ...style
      }}
    >
      {/* ── Formula Academic Label ── */}
      {label && (
        <div
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#7dd3fc',
            fontFamily: 'var(--font-chalk-clean)',
            letterSpacing: '0.07em',
            marginBottom: '8px',
            textTransform: 'uppercase',
            textShadow: '0 0 3px rgba(125, 211, 252, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ color: '#fde047' }}>∑</span>
          <span>{label}</span>
        </div>
      )}

      {/* ── High-Resolution KaTeX Equation Display ── */}
      <div
        className="chalk-math-display"
        style={{
          fontSize,
          color: '#fef08a',
          textShadow: '0 0 2px rgba(254, 240, 138, 0.9), 0 0 8px rgba(253, 224, 71, 0.35)',
          padding: '6px 4px',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          justifyContent: displayMode ? 'center' : 'flex-start',
          alignItems: 'center'
        }}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      {/* ── Mixed Teaching: Structured 'where:' Parameter Explanations ── */}
      {whereDefinitions && whereDefinitions.length > 0 && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-chalk-clean)',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '2px'
            }}
          >
            where:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '6px',
              fontFamily: 'var(--font-chalk-clean)',
              fontSize: '0.8rem'
            }}
          >
            {whereDefinitions.map((def, idx) => {
              // Render individual symbol in inline KaTeX
              let symbolHtml = def.symbol;
              try {
                symbolHtml = katex.renderToString(def.symbol, {
                  displayMode: false,
                  throwOnError: false
                });
              } catch {
                symbolHtml = def.symbol;
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    padding: '3px 8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.07)'
                  }}
                >
                  <span
                    style={{
                      color: idx === 0 ? '#fde047' : idx === 1 ? '#38bdf8' : idx === 2 ? '#f472b6' : '#86efac',
                      fontWeight: 700
                    }}
                    dangerouslySetInnerHTML={{ __html: symbolHtml }}
                  />
                  <span style={{ color: '#cbd5e1' }}>=</span>
                  <span style={{ color: '#e2e8f0', flex: 1 }}>{def.meaning}</span>
                  {def.unit && (
                    <span
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontStyle: 'italic'
                      }}
                    >
                      ({def.unit})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
