import React, { useState, useEffect, useMemo, useRef } from 'react';
import type {
  VisualLearningData,
  SupportedVisualType,
  GraphPoint,
  GraphKeyPoint
} from '../../../types/teacherContract';
import {
  Compass,
  LineChart as LineChartIcon,
  GitCommit,
  Layers,
  Network,
  Table as TableIcon,
  Workflow,
  Cpu,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Maximize2,
  Info,
  Sparkles,
  Database,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface ProfessorVisualRendererProps {
  visual: VisualLearningData;
  className?: string;
  onStepChange?: (stepIndex: number) => void;
}

export const ProfessorVisualRenderer: React.FC<ProfessorVisualRendererProps> = ({
  visual,
  className = '',
  onStepChange
}) => {
  const visualType = (visual.visual_type || 'diagram').toLowerCase() as SupportedVisualType;

  return (
    <div
      className={`professor-visual-board ${className}`}
      style={{
        borderRadius: '16px',
        background: 'radial-gradient(ellipse at 50% 0%, #0d1527 0%, #070a14 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.75), inset 0 0 20px rgba(56, 189, 248, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Board Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}
          >
            {getVisualIcon(visualType)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.02em'
                }}
              >
                {visual.title || 'Digital Board Visual Model'}
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#7dd3fc',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {visualType.replace(/_/g, ' ')}
              </span>
            </div>
            {visual.purpose && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Pedagogical Target: {visual.purpose}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              color: '#34d399',
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#34d399',
                display: 'inline-block'
              }}
            />
            Dynamic Render
          </span>
        </div>
      </div>

      {/* Main Visual Board Content */}
      <div style={{ padding: '16px', position: 'relative', minHeight: '260px' }}>
        {renderVisualByType(visualType, visual, onStepChange)}
      </div>

      {/* Pedagogical Description Footer */}
      {visual.description && (
        <div
          style={{
            padding: '10px 18px',
            background: 'rgba(2, 6, 23, 0.65)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <Info size={14} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p
            style={{
              margin: 0,
              fontSize: '0.78rem',
              color: '#cbd5e1',
              lineHeight: 1.5,
              fontStyle: 'italic'
            }}
          >
            {visual.description}
          </p>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------------
// Helper: Icon selector
// -------------------------------------------------------------------------
function getVisualIcon(type: SupportedVisualType | string) {
  switch (type) {
    case 'function_graph':
    case 'chart':
      return <LineChartIcon size={16} />;
    case 'flowchart':
      return <Workflow size={16} />;
    case 'architecture':
      return <Layers size={16} />;
    case 'concept_map':
      return <Compass size={16} />;
    case 'algorithm_visualization':
      return <Cpu size={16} />;
    case 'network_graph':
      return <Network size={16} />;
    case 'table':
      return <TableIcon size={16} />;
    case 'step_by_step_visual':
      return <GitCommit size={16} />;
    default:
      return <Sparkles size={16} />;
  }
}

// -------------------------------------------------------------------------
// Dispatcher
// -------------------------------------------------------------------------
function renderVisualByType(
  type: SupportedVisualType | string,
  visual: VisualLearningData,
  onStepChange?: (idx: number) => void
) {
  switch (type) {
    case 'function_graph':
      return <FunctionGraphVisual graph={visual.graph} visual={visual} />;
    case 'chart':
      return <ChartVisual chart={visual.chart} visual={visual} />;
    case 'step_by_step_visual':
    case 'algorithm_visualization':
      return (
        <StepByStepScrubberVisual
          steps={visual.steps}
          elements={visual.elements}
          title={visual.title}
          visualType={type}
          onStepChange={onStepChange}
        />
      );
    case 'flowchart':
      return <FlowchartVisual diagram={visual.diagram} elements={visual.elements} />;
    case 'concept_map':
      return <ConceptMapVisual diagram={visual.diagram} elements={visual.elements} title={visual.title} />;
    case 'architecture':
      return <ArchitectureVisual diagram={visual.diagram} elements={visual.elements} />;
    case 'network_graph':
      return <NetworkGraphVisual diagram={visual.diagram} elements={visual.elements} />;
    case 'table':
      return <TableVisual diagram={visual.diagram} elements={visual.elements} />;
    case 'scientific_diagram':
      return <ScientificDiagramVisual visual={visual} />;
    case 'educational_image':
      return <EducationalImageVisual visual={visual} />;
    case 'diagram':
    default:
      return <GenericDiagramVisual diagram={visual.diagram} elements={visual.elements} visual={visual} />;
  }
}

// =========================================================================
// 1. FUNCTION GRAPH VISUAL (Interactive SVG Curve + Key Extrema & Matplotlib toggle)
// =========================================================================
const FunctionGraphVisual: React.FC<{ graph?: any; visual: VisualLearningData }> = ({
  graph = {},
  visual
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'matplotlib'>('interactive');
  const [hoverPoint, setHoverPoint] = useState<GraphPoint | null>(null);

  const equation = graph?.equation || visual.description?.match(/y\s*=\s*[^,\n]+/i)?.[0] || 'y = f(x)';
  const points: GraphPoint[] = useMemo(() => {
    if (Array.isArray(graph?.points) && graph.points.length > 2) {
      return graph.points;
    }
    const fallback: GraphPoint[] = [];
    const minX = graph?.x_range?.[0] ?? -5;
    const maxX = graph?.x_range?.[1] ?? 5;
    const step = (maxX - minX) / 50;
    for (let x = minX; x <= maxX; x += step) {
      let y = x * x;
      if (equation.includes('sin')) y = Math.sin(x) * 3;
      else if (equation.includes('cos')) y = Math.cos(x) * 3;
      else if (equation.includes('exp')) y = Math.exp(x * 0.5);
      fallback.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    }
    return fallback;
  }, [graph, equation]);

  const keyPoints: GraphKeyPoint[] = graph?.key_points || [];

  const width = 640;
  const height = 280;
  const padding = 40;

  const minX = Math.min(...points.map((p) => p.x), -1);
  const maxX = Math.max(...points.map((p) => p.x), 1);
  const minY = Math.min(...points.map((p) => p.y), 0);
  const maxY = Math.max(...points.map((p) => p.y), 1);

  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      const sx = scaleX(pt.x);
      const sy = scaleY(pt.y);
      return i === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
    }, '');
  }, [points, minX, maxX, minY, maxY]);

  const originX = scaleX(0);
  const originY = scaleY(0);

  const imageUrl = visual.image_url || graph.image_url;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '4px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>f(x):</span>
          <strong style={{ color: '#ffffff' }}>{equation}</strong>
        </div>

        {imageUrl && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              style={{
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: viewMode === 'interactive' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                color: viewMode === 'interactive' ? '#040711' : '#cbd5e1',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Interactive Curve
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matplotlib')}
              style={{
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: viewMode === 'matplotlib' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                color: viewMode === 'matplotlib' ? '#040711' : '#cbd5e1',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Exact Matplotlib Render
            </button>
          </div>
        )}
      </div>

      {viewMode === 'matplotlib' && imageUrl ? (
        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#040711',
            textAlign: 'center',
            padding: '8px'
          }}
        >
          <img
            src={imageUrl}
            alt="Exact Mathematical Graph"
            style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '8px', margin: '0 auto' }}
          />
        </div>
      ) : (
        /* Interactive SVG Graph */
        <div
          style={{
            position: 'relative',
            background: '#050914',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px',
            overflow: 'hidden'
          }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = (e.clientX - rect.left) / rect.width;
              const targetX = minX + relX * (maxX - minX);
              const closest = points.reduce((prev, curr) =>
                Math.abs(curr.x - targetX) < Math.abs(prev.x - targetX) ? curr : prev,
                points[0]
              );
              if (closest) setHoverPoint(closest);
            }}
            onMouseLeave={() => setHoverPoint(null)}
          >
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid Lines */}
            {[0.25, 0.5, 0.75].map((factor, idx) => (
              <g key={idx} opacity={0.15}>
                <line
                  x1={padding}
                  y1={padding + factor * (height - 2 * padding)}
                  x2={width - padding}
                  y2={padding + factor * (height - 2 * padding)}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                />
                <line
                  x1={padding + factor * (width - 2 * padding)}
                  y1={padding}
                  x2={padding + factor * (width - 2 * padding)}
                  y2={height - padding}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                />
              </g>
            ))}

            {/* Axes */}
            <line
              x1={padding}
              y1={Math.max(padding, Math.min(height - padding, originY))}
              x2={width - padding}
              y2={Math.max(padding, Math.min(height - padding, originY))}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1={Math.max(padding, Math.min(width - padding, originX))}
              y1={padding}
              x2={Math.max(padding, Math.min(width - padding, originX))}
              y2={height - padding}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* Curve Path */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="3.2"
              filter="url(#neonGlow)"
            />

            {/* Key Extrema / Roots */}
            {keyPoints.map((kp, idx) => {
              const cx = scaleX(kp.x);
              const cy = scaleY(kp.y);
              return (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={cx + 8}
                    y={cy - 8}
                    fill="#fda4af"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fontWeight="700"
                  >
                    {kp.label}
                  </text>
                </g>
              );
            })}

            {/* Interactive hover indicator */}
            {hoverPoint && (
              <g>
                <circle
                  cx={scaleX(hoverPoint.x)}
                  cy={scaleY(hoverPoint.y)}
                  r="5"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={scaleX(hoverPoint.x) + 8}
                  y={scaleY(hoverPoint.y) - 6}
                  fill="#7dd3fc"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ({hoverPoint.x}, {hoverPoint.y})
                </text>
              </g>
            )}
          </svg>

          {/* Extrema Callout Summary */}
          {keyPoints.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {keyPoints.map((kp, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.72rem',
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '6px',
                    padding: '2px 8px'
                  }}
                >
                  <strong>{kp.type?.toUpperCase() || 'POINT'}:</strong> {kp.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. CHART VISUAL (Bar Chart / Line Chart)
// =========================================================================
const ChartVisual: React.FC<{ chart?: any; visual: VisualLearningData }> = ({
  chart = {},
  visual
}) => {
  const chartType = chart?.chart_type || 'bar';
  const series: Array<{ label: string; value: number }> = useMemo(() => {
    if (Array.isArray(chart?.series) && chart.series.length > 0) {
      return chart.series;
    }
    if (Array.isArray(chart?.categories) && Array.isArray(chart?.values)) {
      return chart.categories.map((cat: string, i: number) => ({
        label: cat,
        value: Number(chart.values[i] ?? 0)
      }));
    }
    if (Array.isArray(visual.elements) && visual.elements.length > 0) {
      return visual.elements.slice(0, 6).map((el: any, i: number) => ({
        label: typeof el === 'string' ? el : el.name || el.label || `Metric ${i + 1}`,
        value: typeof el === 'object' && el.value ? Number(el.value) : (i + 1) * 20
      }));
    }
    return [
      { label: 'Layer 1', value: 85 },
      { label: 'Layer 2', value: 62 },
      { label: 'Layer 3', value: 94 },
      { label: 'Layer 4', value: 78 }
    ];
  }, [chart, visual]);

  const maxValue = Math.max(...series.map((s) => s.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0' }}>
            {chart?.title || 'Data Distribution & Quantitative Metric'}
          </span>
          <span
            style={{
              fontSize: '0.66rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '1px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}
          >
            {chartType}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          Scale: Max {maxValue.toLocaleString()} {chart?.y_label || 'Units'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          height: '200px',
          background: '#040711',
          borderRadius: '12px',
          padding: '16px 12px 10px 12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {series.map((item, idx) => {
          const heightPercent = Math.max(10, (item.value / maxValue) * 100);
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                justifyContent: 'flex-end',
                flex: 1,
                maxWidth: '65px'
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  color: '#7dd3fc',
                  fontWeight: 700
                }}
              >
                {item.value}
              </span>
              <div
                style={{
                  width: '75%',
                  height: `${heightPercent}%`,
                  borderRadius: '6px 6px 2px 2px',
                  background: 'linear-gradient(to top, #4f46e5 0%, #38bdf8 100%)',
                  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                  transition: 'height 0.4s ease'
                }}
              />
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  width: '100%'
                }}
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// 3. STEP-BY-STEP & ALGORITHM VISUAL PROGRESSION (Interactive Scrubber)
// =========================================================================
interface StepByStepVisualProps {
  steps: any[];
  elements?: any[];
  title?: string;
  visualType: string;
  onStepChange?: (idx: number) => void;
}

interface NormalizedStep {
  step: number;
  title: string;
  description: string;
  state?: any;
  highlight?: any;
}

const StepByStepScrubberVisual: React.FC<StepByStepVisualProps> = ({
  steps = [],
  elements = [],
  title,
  visualType,
  onStepChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<any>(null);

  const normalizedSteps: NormalizedStep[] = useMemo(() => {
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.map((st, i) => {
        if (typeof st === 'string') {
          return { step: i + 1, title: `Phase ${i + 1}`, description: st };
        }
        return {
          step: st.step ?? i + 1,
          title: st.title || `Phase ${i + 1}`,
          description: st.description || JSON.stringify(st),
          state: st.state,
          highlight: st.highlight
        };
      });
    }
    if (Array.isArray(elements) && elements.length > 0) {
      return elements.map((el, i) => ({
        step: i + 1,
        title: typeof el === 'string' ? el : el.name || `Stage ${i + 1}`,
        description: typeof el === 'object' && el.role ? el.role : `Transition state ${i + 1}`
      }));
    }
    return [
      { step: 1, title: 'Initialization', description: 'Declare state variables and allocate pointers.' },
      { step: 2, title: 'Processing & Invariant', description: 'Evaluate loop condition and execute kernel operation.' },
      { step: 3, title: 'State Mutation', description: 'Update memory references and propagate forward.' },
      { step: 4, title: 'Termination & Result', description: 'Verify boundary condition and yield optimal solution.' }
    ];
  }, [steps, elements]);

  const totalSteps = normalizedSteps.length;
  const activeStepObj = normalizedSteps[currentStep] || normalizedSteps[0];

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2400);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalSteps]);

  const handlePrev = () => setCurrentStep((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Scrubber Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: currentStep === 0 ? '#475569' : '#ffffff',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
            title="Previous Step"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              background: isPlaying ? '#ef4444' : '#10b981',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play Progression'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep >= totalSteps - 1}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: currentStep >= totalSteps - 1 ? '#475569' : '#ffffff',
              cursor: currentStep >= totalSteps - 1 ? 'not-allowed' : 'pointer'
            }}
            title="Next Step"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            title="Reset Scrubber"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {title || visualType.replace(/_/g, ' ')}:
          </span>
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
            Step <strong style={{ color: '#38bdf8' }}>{currentStep + 1}</strong> / {totalSteps}
          </span>
        </div>
      </div>

      {/* Step Pills Timeline */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {normalizedSteps.map((st, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(idx);
              }}
              style={{
                flex: 1,
                minWidth: '70px',
                padding: '6px 8px',
                borderRadius: '8px',
                background: isActive
                  ? 'rgba(56, 189, 248, 0.25)'
                  : isDone
                  ? 'rgba(52, 211, 153, 0.15)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isActive
                  ? '1px solid #38bdf8'
                  : isDone
                  ? '1px solid rgba(52, 211, 153, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#38bdf8' : isDone ? '#6ee7b7' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              #{idx + 1} {st.title?.slice(0, 14)}
            </button>
          );
        })}
      </div>

      {/* Active Step Canvas & State Card */}
      <div
        style={{
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#38bdf8',
                color: '#040711',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}
            >
              STEP {activeStepObj.step}
            </span>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#ffffff', fontWeight: 700 }}>
              {activeStepObj.title}
            </h4>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Active Invariant
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.6 }}>
          {activeStepObj.description}
        </p>

        {activeStepObj.state && (
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#040711',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginTop: '4px'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Memory / Register State:
            </span>
            <pre
              style={{
                margin: '4px 0 0 0',
                color: '#a5b4fc',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}
            >
              {typeof activeStepObj.state === 'string'
                ? activeStepObj.state
                : JSON.stringify(activeStepObj.state, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 4. FLOWCHART VISUAL (Process Nodes & Directed Paths)
// =========================================================================
const FlowchartVisual: React.FC<{ diagram?: any; elements?: any[] }> = ({
  diagram = {},
  elements = []
}) => {
  const nodes = useMemo(() => {
    if (Array.isArray(diagram?.nodes) && diagram.nodes.length > 0) return diagram.nodes;
    if (Array.isArray(elements) && elements.length > 0) {
      return elements.map((el, i) => ({
        id: `node_${i}`,
        label: typeof el === 'string' ? el : el.name || el.label || `Step ${i + 1}`,
        type: i === 0 ? 'start' : i === elements.length - 1 ? 'end' : 'process'
      }));
    }
    return [
      { id: '1', label: 'Start / Input', type: 'start' },
      { id: '2', label: 'Validate Conditions', type: 'decision' },
      { id: '3', label: 'Execute Transformation', type: 'process' },
      { id: '4', label: 'Optimal Convergence', type: 'end' }
    ];
  }, [diagram, elements]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {nodes.map((node: any, idx: number) => {
        const isStart = node.type === 'start' || idx === 0;
        const isEnd = node.type === 'end' || idx === nodes.length - 1;
        const isDecision = node.type === 'decision';

        return (
          <React.Fragment key={node.id || idx}>
            <div
              style={{
                padding: isDecision ? '10px 24px' : '10px 18px',
                borderRadius: isStart || isEnd ? '24px' : isDecision ? '8px' : '12px',
                background: isStart
                  ? 'rgba(16, 185, 129, 0.2)'
                  : isEnd
                  ? 'rgba(99, 102, 241, 0.25)'
                  : isDecision
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(30, 41, 59, 0.75)',
                border: isStart
                  ? '1px solid #10b981'
                  : isEnd
                  ? '1px solid #818cf8'
                  : isDecision
                  ? '1px solid #f59e0b'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                textAlign: 'center',
                minWidth: '180px',
                maxWidth: '320px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
            >
              {isDecision ? `⟨ ? ⟩ ${node.label}` : node.label}
            </div>

            {idx < nodes.length - 1 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#38bdf8'
                }}
              >
                <div style={{ width: '2px', height: '14px', background: 'rgba(56, 189, 248, 0.4)' }} />
                <ArrowRight size={14} style={{ transform: 'rotate(90deg)' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// =========================================================================
// 5. CONCEPT MAP VISUAL (Radial / Hierarchical Nodes)
// =========================================================================
const ConceptMapVisual: React.FC<{ diagram?: any; elements?: any[]; title?: string }> = ({
  diagram = {},
  elements = [],
  title
}) => {
  const branches = useMemo(() => {
    if (Array.isArray(diagram?.nodes) && diagram.nodes.length > 0) return diagram.nodes;
    if (Array.isArray(elements) && elements.length > 0) {
      return elements.map((el, i) => ({
        id: `branch_${i}`,
        label: typeof el === 'string' ? el : el.name || el.label || `Concept ${i + 1}`,
        desc: typeof el === 'object' && el.role ? el.role : 'Core attribute'
      }));
    }
    return [
      { id: '1', label: 'Mathematical Axiom', desc: 'Formal definition & boundary rules' },
      { id: '2', label: 'Physical Analogy', desc: 'Real-world mechanical translation' },
      { id: '3', label: 'Computational Invariant', desc: 'Algorithm time & space profile' },
      { id: '4', label: 'Practical Edge Cases', desc: 'Singularities and divergence points' }
    ];
  }, [diagram, elements]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div
        style={{
          padding: '12px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.96rem',
          letterSpacing: '0.03em',
          boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
          textAlign: 'center'
        }}
      >
        {title || 'Central Pedagogical Anchor'}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          width: '100%'
        }}
      >
        {branches.map((b: any, idx: number) => (
          <div
            key={b.id || idx}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              Branch #{idx + 1}
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
              {b.label}
            </span>
            {b.desc && (
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {b.desc}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 6. ARCHITECTURE VISUAL (Multi-Tier Distributed Pipelines)
// =========================================================================
const ArchitectureVisual: React.FC<{ diagram?: any; elements?: any[] }> = ({
  diagram = {},
  elements = []
}) => {
  const tiers = useMemo(() => {
    if (Array.isArray(elements) && elements.length >= 3) {
      return [
        { name: 'Client & Interface', items: [elements[0]] },
        { name: 'Orchestration & Logic', items: [elements[1]] },
        { name: 'Data & Persistence', items: elements.slice(2) }
      ];
    }
    if (Array.isArray(diagram?.nodes) && diagram.nodes.length > 0) {
      return [
        { name: 'Component Tiers', items: diagram.nodes.map((n: any) => n.label || n.id) }
      ];
    }
    return [
      { name: '1. Presentation Tier', items: ['Interactive Canvas', 'Audio Engine', 'Speech Recognition'] },
      { name: '2. Reasoning & Engine Tier', items: ['Professor Teaching Planner', 'Math Reasoning Layer', 'Visual Planner'] },
      { name: '3. Knowledge & Persistence Tier', items: ['Vector Store (Polar Books)', 'Document Ingestion DB', 'Response Cache'] }
    ];
  }, [elements, diagram]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {tiers.map((tier, idx) => (
        <div
          key={idx}
          style={{
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Database size={14} color="#818cf8" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase' }}>
              {tier.name}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tier.items.map((item: any, itmIdx: number) => {
              const label = typeof item === 'string' ? item : item.name || item.label || `Service ${itmIdx + 1}`;
              return (
                <div
                  key={itmIdx}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// =========================================================================
// 7. NETWORK GRAPH VISUAL (Weighted / Directed Nodes & Edges)
// =========================================================================
const NetworkGraphVisual: React.FC<{ diagram?: any; elements?: any[] }> = ({
  diagram = {},
  elements = []
}) => {
  const nodes = diagram?.nodes || [
    { id: 'A', label: elements[0] ? (typeof elements[0] === 'string' ? elements[0] : elements[0].name) : 'Node A (Source)', x: 60, y: 70 },
    { id: 'B', label: elements[1] ? (typeof elements[1] === 'string' ? elements[1] : elements[1].name) : 'Node B', x: 220, y: 40 },
    { id: 'C', label: elements[2] ? (typeof elements[2] === 'string' ? elements[2] : elements[2].name) : 'Node C', x: 220, y: 130 },
    { id: 'D', label: elements[3] ? (typeof elements[3] === 'string' ? elements[3] : elements[3].name) : 'Node D (Target)', x: 380, y: 80 }
  ];

  const edges = diagram?.edges || [
    { from: 'A', to: 'B', weight: 'w=4' },
    { from: 'A', to: 'C', weight: 'w=2' },
    { from: 'C', to: 'B', weight: 'w=1' },
    { from: 'B', to: 'D', weight: 'w=5' },
    { from: 'C', to: 'D', weight: 'w=8' }
  ];

  return (
    <div
      style={{
        position: 'relative',
        background: '#030712',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px'
      }}
    >
      <svg viewBox="0 0 460 170" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {edges.map((e: any, idx: number) => {
          const fromNode = nodes.find((n: any) => n.id === e.from) || nodes[0];
          const toNode = nodes.find((n: any) => n.id === e.to) || nodes[nodes.length - 1];
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          return (
            <g key={idx}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray={e.weight ? undefined : '3 3'}
              />
              {e.weight && (
                <text
                  x={midX}
                  y={midY - 4}
                  fill="#a5b4fc"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n: any, idx: number) => (
          <g key={n.id || idx}>
            <circle cx={n.x} cy={n.y} r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
            <text
              x={n.x}
              y={n.y + 4}
              fill="#ffffff"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {n.id}
            </text>
            <text
              x={n.x}
              y={n.y + 30}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="middle"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// =========================================================================
// 8. TABLE VISUAL (Relational Tables / Normalization / Comparisons)
// =========================================================================
const TableVisual: React.FC<{ diagram?: any; elements?: any[] }> = ({
  diagram = {},
  elements = []
}) => {
  const headers = diagram?.headers || ['Entity / Feature', 'Mathematical Property', 'Computational Complexity', 'Application'];
  const rows = diagram?.rows || (elements.length > 0
    ? elements.map((el: any, i: number) => [
        typeof el === 'string' ? el : el.name || `Feature ${i + 1}`,
        typeof el === 'object' && el.role ? el.role : 'Conservation Invariant',
        'O(1) Evaluation',
        'Physical Dynamics'
      ])
    : [
        ['Newton 1st Law', 'ΣF = 0 ⟹ v = const', 'O(1) Evaluation', 'Inertial reference frames'],
        ['Newton 2nd Law', 'F_net = m·a = dp/dt', 'O(N) Particle dynamics', 'Propulsion & trajectory'],
        ['Newton 3rd Law', 'F_AB = - F_BA', 'O(1) Pairwise conservation', 'Rocket thrust in vacuum']
      ]);

  return (
    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(56, 189, 248, 0.3)' }}>
            {headers.map((h: string, idx: number) => (
              <th key={idx} style={{ padding: '10px 12px', color: '#38bdf8', fontWeight: 700 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any[], rIdx: number) => (
            <tr
              key={rIdx}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: rIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(2, 6, 23, 0.6)'
              }}
            >
              {row.map((cell: any, cIdx: number) => (
                <td key={cIdx} style={{ padding: '9px 12px', color: cIdx === 0 ? '#ffffff' : '#cbd5e1' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// =========================================================================
// 9. SCIENTIFIC DIAGRAM VISUAL
// =========================================================================
const ScientificDiagramVisual: React.FC<{ visual: VisualLearningData }> = ({ visual }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {visual.image_url ? (
        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            background: '#040711',
            textAlign: 'center'
          }}
        >
          <img
            src={visual.image_url}
            alt={visual.title}
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', margin: '0 auto' }}
          />
        </div>
      ) : (
        <GenericDiagramVisual diagram={visual.diagram} elements={visual.elements} visual={visual} />
      )}
    </div>
  );
};

// =========================================================================
// 10. EDUCATIONAL IMAGE VISUAL
// =========================================================================
const EducationalImageVisual: React.FC<{ visual: VisualLearningData }> = ({ visual }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {visual.image_url ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#020617',
            textAlign: 'center'
          }}
        >
          <img
            src={visual.image_url}
            alt={visual.title || 'Educational Illustration'}
            style={{ maxWidth: '100%', maxHeight: isFullscreen ? '480px' : '320px', objectFit: 'contain', margin: '0 auto' }}
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      ) : (
        <GenericDiagramVisual diagram={visual.diagram} elements={visual.elements} visual={visual} />
      )}
    </div>
  );
};

// =========================================================================
// 11. GENERIC DIAGRAM VISUAL (Fallback for structured elements)
// =========================================================================
const GenericDiagramVisual: React.FC<{ diagram?: any; elements?: any[]; visual: VisualLearningData }> = ({
  diagram = {},
  elements = [],
  visual
}) => {
  const activeNodes = diagram?.nodes || (elements.length > 0 ? elements : ['Component 1', 'Component 2', 'Component 3']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {visual.title && (
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
          {visual.title}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}
      >
        {activeNodes.map((el: any, idx: number) => {
          const name = typeof el === 'string' ? el : el.name || el.label || `Element ${idx + 1}`;
          const role = typeof el === 'object' && el.role ? el.role : 'Active physical / logical entity';

          return (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#38bdf8',
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                  {name}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {role}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
