import React, { useState, useEffect, useMemo, useRef } from "react";
import "./ScientificGraphRenderer.css";
import {
  TrendingUp, BarChart3, RotateCcw, ScatterChart,
  GitCommit, Clock, Layers, BarChart2, PieChart, FlaskConical,
  AlertTriangle, Database, BookOpen, Cpu, FileText
} from "lucide-react";
import type { ScientificGraphVisual, GraphType } from "../../../types/script5";

interface Props {
  graph: ScientificGraphVisual;
  className?: string;
  speechText?: string;
  stageOverride?: "axes_only"|"plotting_curve"|"highlighting_region"|"moving_point"|"complete";
  trackedPointOverride?: { x: number; y: number; label?: string } | null;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
const SERIES_COLORS = ["#38bdf8","#fb7185","#fbbf24","#34d399","#a78bfa","#fb923c","#2dd4bf","#f472b6"];

function fmtNum(v: number): string {
  if (Math.abs(v) >= 1_000_000) return (v/1_000_000).toFixed(1)+"M";
  if (Math.abs(v) >= 1_000)     return (v/1_000).toFixed(1)+"k";
  const abs = Math.abs(v);
  if (abs < 0.001) return v.toExponential(2);
  if (abs < 1)     return v.toFixed(3);
  if (abs < 100)   return v.toFixed(2);
  return v.toFixed(0);
}

// ─── Graph type icon ──────────────────────────────────────────────────────────
function GraphIcon({ type }: { type: GraphType }) {
  const sz = 13;
  switch (type) {
    case "bar": case "comparison": return <BarChart3 size={sz}/>;
    case "scatter":                return <ScatterChart size={sz}/>;
    case "function":               return <GitCommit size={sz}/>;
    case "multi_line": case "training_curve": return <Layers size={sz}/>;
    case "time_series":            return <Clock size={sz}/>;
    case "distribution":           return <BarChart2 size={sz}/>;
    case "statistical":            return <PieChart size={sz}/>;
    case "research":               return <FlaskConical size={sz}/>;
    case "optimization_path":      return <TrendingUp size={sz}/>;
    case "loss_curve":             return <TrendingUp size={sz}/>;
    case "parameter_movement":     return <GitCommit size={sz}/>;
    default:                       return <TrendingUp size={sz}/>;
  }
}

function dataSourceBadge(graph: ScientificGraphVisual) {
  const isIll = graph.is_illustrative !== undefined ? graph.is_illustrative : (graph.isIllustrative || graph.dataSource === "illustrative");
  if (isIll) {
    return (
      <span className="sgr-badge sgr-badge-illustrative">
        <AlertTriangle size={10}/> ILLUSTRATIVE MODEL
      </span>
    );
  }
  if (graph.graphType === "function" || graph.graph_type === "function") {
    return (
      <span className="sgr-badge sgr-badge-exact" style={{ background: "rgba(52, 211, 153, 0.12)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.3)" }}>
        <GitCommit size={10}/> EXACT MATHEMATICAL FUNCTION
      </span>
    );
  }
  if (graph.graphType === "optimization_path" || graph.graph_type === "optimization_path") {
    return (
      <span className="sgr-badge sgr-badge-exact" style={{ background: "rgba(244, 63, 94, 0.12)", color: "#fb7185", border: "1px solid rgba(244, 63, 94, 0.3)" }}>
        <TrendingUp size={10}/> NUMERICAL OPTIMIZER SIMULATION
      </span>
    );
  }
  if (graph.dataSource === "research_paper") {
    return <span className="sgr-badge sgr-badge-research"><BookOpen size={10}/> RESEARCH DATA</span>;
  }
  if (graph.dataSource === "teacher_engine") {
    return <span className="sgr-badge sgr-badge-engine"><Cpu size={10}/> TEACHER ENGINE</span>;
  }
  if (graph.dataSource === "database") {
    return <span className="sgr-badge sgr-badge-db"><Database size={10}/> DATABASE</span>;
  }
  return (
    <span className="sgr-badge sgr-badge-exact" style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
      <Cpu size={10}/> PROGRAMMATIC EXACT
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const ScientificGraphRenderer: React.FC<Props> = ({
  graph, className = "", speechText = "", stageOverride,
}) => {
  const svgW = 500, svgH = 280;
  const pad = { top: 34, right: 40, bottom: 52, left: 68 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(-1);

  // Reset sub-spec selection when graph changes
  useEffect(() => {
    setSelectedSubIndex(-1);
  }, [graph.id, graph.title]);

  const activeGraph: ScientificGraphVisual = useMemo(() => {
    if (selectedSubIndex >= 0 && graph.sub_specs && graph.sub_specs[selectedSubIndex]) {
      const sub = graph.sub_specs[selectedSubIndex];
      const isMulti = sub.graph_type === "multi_line" || sub.graph_type === "training_curve";
      return {
        ...graph,
        title: sub.title,
        scientificPurpose: sub.title,
        graphType: sub.graph_type as GraphType,
        graph_type: sub.graph_type,
        xLabel: sub.x_axis,
        yLabel: sub.y_axis,
        x_axis: sub.x_axis,
        y_axis: sub.y_axis,
        unit: sub.units,
        units: sub.units,
        formula: sub.equation,
        equation: sub.equation,
        labels: sub.labels,
        series: isMulti ? sub.data : undefined,
        dataPoints: !isMulti ? sub.data : undefined,
        data: sub.data,
        isIllustrative: sub.is_illustrative,
        is_illustrative: sub.is_illustrative,
        referenceSource: sub.source,
        source: sub.source,
        imageUrl: sub.image_url,
      };
    }
    return graph;
  }, [graph, selectedSubIndex]);

  const graphType: GraphType = (activeGraph.graph_type as GraphType) || activeGraph.graphType ||
    (activeGraph.bars?.length ? "bar" : activeGraph.series?.length ? "multi_line" : activeGraph.histogramBins?.length ? "distribution" : "scientific");

  const [tooltip, setTooltip] = useState<{x:number;y:number;text:string;sub?:string}|null>(null);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [plotProgress, setPlotProgress] = useState(1);
  const [activeStage, setActiveStage] = useState<"axes_only"|"plotting_curve"|"highlighting_region"|"moving_point"|"complete">("complete");
  const pathRef = useRef<SVGPathElement|null>(null);
  const [pathLength, setPathLength] = useState(1500);

  // ── Stage sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stageOverride)                { setActiveStage(stageOverride); return; }
    if (activeGraph.animationStage)   { setActiveStage(activeGraph.animationStage); return; }
    const s = speechText.toLowerCase();
    if (s.includes("notice") || s.includes("negative") || s.includes("deficit")) {
      setActiveStage("highlighting_region"); setPlotProgress(1);
    } else if (s.includes("curve") || s.includes("decreases") || s.includes("rate of")) {
      setActiveStage("plotting_curve"); setPlotProgress(0);
      const t = setTimeout(() => setPlotProgress(1), 100);
      return () => clearTimeout(t);
    } else if (s.includes("axis") || s.includes("first")) {
      setActiveStage("axes_only"); setPlotProgress(0.1);
    } else {
      setActiveStage("complete"); setPlotProgress(1);
    }
  }, [speechText, stageOverride, activeGraph.animationStage]);

  useEffect(() => { if (pathRef.current) setPathLength(pathRef.current.getTotalLength() || 1500); }, []);

  // ── Data for line / scatter / function types ────────────────────────────────
  const rawPoints = useMemo(() => {
    if (activeGraph.dataPoints?.length) return activeGraph.dataPoints;
    if ((graphType === "function" || activeGraph.formula || activeGraph.equation) && !activeGraph.bars && !activeGraph.histogramBins) {
      const mn = activeGraph.xDomain?.[0] ?? -4;
      const mx = activeGraph.xDomain?.[1] ?? 4;
      const n = 60;
      return Array.from({length: n+1}, (_, i) => {
        const x = mn + (i/n)*(mx-mn);
        return { x: parseFloat(x.toFixed(3)), y: parseFloat((x*x).toFixed(4)) };
      });
    }
    return [];
  }, [activeGraph.dataPoints, activeGraph.bars, activeGraph.histogramBins, graphType, activeGraph.formula, activeGraph.equation, activeGraph.xDomain]);

  // All points across series + single series
  const allPoints = useMemo(() => {
    let pts = [...rawPoints];
    activeGraph.series?.forEach(s => pts = pts.concat(s.dataPoints));
    return pts;
  }, [rawPoints, activeGraph.series]);

  // Domain bounds
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (activeGraph.bars?.length) {
      const vals = activeGraph.bars.map(b=>b.value);
      const mn = Math.min(0,...vals);
      const mx = Math.max(10,...vals);
      return { minX:0, maxX:activeGraph.bars.length, minY:mn, maxY:mx*1.18 };
    }
    if (activeGraph.histogramBins?.length) {
      const bins = activeGraph.histogramBins;
      return { minX:bins[0].rangeStart, maxX:bins[bins.length-1].rangeEnd, minY:0, maxY:Math.max(...bins.map(b=>b.count))*1.15 };
    }
    if (!allPoints.length) return { minX:-1, maxX:1, minY:-1, maxY:1 };
    const xs = allPoints.map(p=>p.x);
    const ys = allPoints.map(p=>p.y);
    let mnX = activeGraph.xDomain?.[0] ?? Math.min(...xs);
    let mxX = activeGraph.xDomain?.[1] ?? Math.max(...xs);
    let mnY = activeGraph.yDomain?.[0] ?? Math.min(...ys);
    let mxY = activeGraph.yDomain?.[1] ?? Math.max(...ys);
    const padX = (mxX-mnX)*0.04; const padY = (mxY-mnY)*0.1;
    if (mnX===mxX){mnX-=1;mxX+=1;} if (mnY===mxY){mnY-=1;mxY+=1;}
    return { minX: mnX - padX, maxX: mxX + padX, minY: mnY - padY, maxY: mxY + padY };
  }, [allPoints, activeGraph.bars, activeGraph.histogramBins, activeGraph.xDomain, activeGraph.yDomain]);

  const rX = maxX - minX || 1;
  const rY = maxY - minY || 1;

  const px = (x:number) => pad.left + ((x-minX)/rX)*plotW;
  const py = (y:number) => pad.top + plotH - ((y-minY)/rY)*plotH;

  const pyZero = (0>=minY && 0<=maxY) ? py(0) : null;

  // Projected line points
  type ProjPoint = { x: number; y: number; label?: string; note?: string; px: number; py: number };
  const proj: ProjPoint[] = useMemo(() => rawPoints.map(p=>({...p, px:px(p.x), py:py(p.y)})), [rawPoints, minX, minY, rX, rY]);
  const projSeries = useMemo(() => graph.series?.map(s => ({...s, pts:s.dataPoints.map(p=>({...p,px:px(p.x),py:py(p.y)}))})) ?? [], [graph.series, minX, minY, rX, rY]);

  // SVG path generators
  function catmullRomPath(points:{px:number;py:number}[]): string {
    if (points.length < 2) return "";
    let d = `M ${points[0].px} ${points[0].py}`;
    for (let i=0;i<points.length-1;i++){
      const p0=points[Math.max(0,i-1)], p1=points[i], p2=points[i+1], p3=points[Math.min(points.length-1,i+2)];
      const cp1x=p1.px+(p2.px-p0.px)/6, cp1y=p1.py+(p2.py-p0.py)/6;
      const cp2x=p2.px-(p3.px-p1.px)/6, cp2y=p2.py-(p3.py-p1.py)/6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.px} ${p2.py}`;
    }
    return d;
  }

  const mainCurveD = useMemo(() => catmullRomPath(proj), [proj]);
  const filledAreaD = useMemo(() => {
    if (!mainCurveD) return "";
    const base = pyZero ?? pad.top+plotH;
    return `${mainCurveD} L ${proj[proj.length-1]?.px} ${base} L ${proj[0]?.px} ${base} Z`;
  }, [mainCurveD, pyZero, proj, pad.top, plotH]);

  // (series paths computed inline during render)

  // Ticks
  const xTicks = useMemo(() => {
    const n=6;
    return Array.from({length:n+1},(_,i)=>({ val:minX+(i/n)*rX, px:pad.left+(i/n)*plotW }));
  }, [minX, rX, pad.left, plotW]);
  const yTicks = useMemo(() => {
    const n=5;
    return Array.from({length:n+1},(_,i)=>({ val:minY+(i/n)*rY, py:pad.top+plotH-(i/n)*plotH }));
  }, [minY, rY, pad.top, plotH]);

  const isCurveVisible = activeStage !== "axes_only";
  const strokeOffset = pathLength * (1 - (isCurveVisible ? plotProgress : 0));

  const gradId = `sgGrad-${graph.id ?? "g"}`;
  const negHatch = `sgHatch-${graph.id ?? "g"}`;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={`scientific-graph-root ${className}`}>
      {/* Top header */}
      <div className="graph-top-controls">
        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
          <span className="graph-badge-pill">
            <GraphIcon type={graphType}/>
            <span>{graphType.replace("_"," ").toUpperCase()} GRAPH</span>
          </span>
          <span style={{fontSize:"0.81rem",fontWeight:700,color:"#f8fafc"}}>{graph.title}</span>
          {dataSourceBadge(activeGraph)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
          {(graphType==="line"||graphType==="function"||graphType==="scientific"||graphType==="multi_line"||graphType==="time_series"||graphType==="research"||graphType==="loss_curve"||graphType==="parameter_movement"||graphType==="optimization_path"||graphType==="training_curve") && (
            <>
              <button type="button" className={`graph-stage-btn ${activeStage==="axes_only"?"active":""}`}
                onClick={()=>{setActiveStage("axes_only");setPlotProgress(0);}} title="Show axes only">1. Axes</button>
              <button type="button" className={`graph-stage-btn ${activeStage==="plotting_curve"?"active":""}`}
                onClick={()=>{setActiveStage("plotting_curve");setPlotProgress(1);}} title="Plot the curve">2. Plot</button>
              <button type="button" className={`graph-stage-btn ${activeStage==="highlighting_region"?"active":""}`}
                onClick={()=>{setActiveStage("highlighting_region");setPlotProgress(1);}} title="Highlight region">3. Highlight</button>
            </>
          )}
          <button type="button" className="graph-stage-btn" title="Replay animation"
            onClick={()=>{setPlotProgress(0);setTimeout(()=>setPlotProgress(1),60);}}>
            <RotateCcw size={12}/>
          </button>
        </div>
      </div>

      {/* Sub-specs switch bar when multiple graphs or perspectives exist */}
      {graph.sub_specs && graph.sub_specs.length > 0 && (
        <div className="sgr-subspecs-bar">
          <button
            type="button"
            className={`sgr-subspec-btn ${selectedSubIndex === -1 ? 'active' : ''}`}
            onClick={() => setSelectedSubIndex(-1)}
          >
            Overview: {graph.title.length > 25 ? graph.title.slice(0, 24) + '…' : graph.title}
          </button>
          {graph.sub_specs.map((sub, idx) => (
            <button
              key={idx}
              type="button"
              className={`sgr-subspec-btn ${selectedSubIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedSubIndex(idx)}
            >
              {sub.graph_type.replace('_', ' ').toUpperCase()}: {sub.title.length > 22 ? sub.title.slice(0, 21) + '…' : sub.title}
            </button>
          ))}
        </div>
      )}

      {/* Governing Equation Banner */}
      {(activeGraph.equation || activeGraph.formula) && (
        <div className="sgr-equation-banner">
          <span className="sgr-eq-label">Governing Equation:</span>
          <code>{activeGraph.equation || activeGraph.formula}</code>
        </div>
      )}

      {/* SVG Canvas */}
      <div style={{position:"relative",width:"100%",overflow:"hidden"}}>
        <svg className="graph-svg-canvas" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45"/>
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0"/>
            </linearGradient>
            <pattern id={negHatch} width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(244,63,94,0.45)" strokeWidth="1.5"/>
            </pattern>
            <marker id={`arrowX-${graph.id}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#94a3b8"/>
            </marker>
            <marker id={`arrowY-${graph.id}`} markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
              <path d="M 0 6 L 3 0 L 6 6 Z" fill="#94a3b8"/>
            </marker>
            <marker id={`arrowStep-${graph.id}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M 0 1 L 6 3.5 L 0 6 Z" fill="#fb7185"/>
            </marker>
          </defs>

          {/* Grid */}
          {isGridVisible && (
            <g>
              {yTicks.map((t,i)=>(
                <line key={`gy${i}`} x1={pad.left} y1={t.py} x2={svgW-pad.right} y2={t.py} className="sg-grid-line"/>
              ))}
              {xTicks.map((t,i)=>(
                <line key={`gx${i}`} x1={t.px} y1={pad.top} x2={t.px} y2={pad.top+plotH} className="sg-grid-line"/>
              ))}
            </g>
          )}

          {/* Zero datum */}
          {pyZero !== null && (
            <line x1={pad.left} y1={pyZero} x2={svgW-pad.right} y2={pyZero} className="sg-axis-zero"/>
          )}

          {/* ── Highlight Region ── */}
          {pyZero!==null && (activeStage==="highlighting_region"||activeStage==="complete") && (
            <g>
              <rect x={pad.left} y={pyZero} width={plotW} height={Math.max(0,pad.top+plotH-pyZero)}
                className="sg-highlight-region"/>
              <rect x={pad.left} y={pyZero} width={plotW} height={Math.max(0,pad.top+plotH-pyZero)}
                fill={`url(#${negHatch})`} opacity="0.5"/>
            </g>
          )}

          {/* ── AXES ── */}
          <line x1={pad.left} y1={pad.top+plotH} x2={svgW-pad.right+12} y2={pad.top+plotH}
            className="sg-axis" markerEnd={`url(#arrowX-${graph.id})`}/>
          <text x={pad.left+plotW/2} y={svgH-8} className="sg-axis-title" textAnchor="middle">
            {activeGraph.x_axis || activeGraph.xLabel}{activeGraph.xUnit ? ` (${activeGraph.xUnit})` : (activeGraph.unit ? ` (${activeGraph.unit})` : "")}
          </text>
          <line x1={pad.left} y1={pad.top+plotH} x2={pad.left} y2={pad.top-12}
            className="sg-axis" markerEnd={`url(#arrowY-${graph.id})`}/>
          <text x={-(pad.top+plotH/2)} y={14} className="sg-axis-title" textAnchor="middle" transform="rotate(-90)">
            {activeGraph.y_axis || activeGraph.yLabel}{activeGraph.yUnit ? ` (${activeGraph.yUnit})` : (activeGraph.unit ? ` (${activeGraph.unit})` : "")}
          </text>

          {/* Tick labels */}
          {xTicks.map((t,i)=>{
            // For bar/comparison/distribution, show category labels
            if ((graphType==="bar"||graphType==="comparison") && graph.bars) {
              const barIdx = Math.round((t.val - minX) / (rX/graph.bars.length)) - 1;
              const label = barIdx>=0 && barIdx<graph.bars.length ? graph.bars[barIdx].label : "";
              if (i===0 || barIdx<0) return null;
              const bx = pad.left + (barIdx+0.5)*(plotW/graph.bars.length);
              return (
                <text key={`tx${i}`} x={bx} y={pad.top+plotH+22} className="sg-tick-text" textAnchor="middle" fontSize="8.5">
                  {label.length>12 ? label.slice(0,11)+"\u2026" : label}
                </text>
              );
            }
            if (graphType==="distribution" && graph.histogramBins) {
              const bins = graph.histogramBins;
              const binIdx = Math.round(i * (bins.length/xTicks.length));
              const b = bins[Math.min(binIdx,bins.length-1)];
              return (
                <text key={`tx${i}`} x={t.px} y={pad.top+plotH+22} className="sg-tick-text" textAnchor="middle" fontSize="8.5">
                  {b?.label ?? fmtNum(t.val)}
                </text>
              );
            }
            return (
              <text key={`tx${i}`} x={t.px} y={pad.top+plotH+16} className="sg-tick-text" textAnchor="middle">
                {fmtNum(t.val)}
              </text>
            );
          })}
          {yTicks.map((t,i)=>(
            <text key={`ty${i}`} x={pad.left-8} y={t.py+3.5} className="sg-tick-text" textAnchor="end">
              {fmtNum(t.val)}
            </text>
          ))}

          {/* ════════════════════════════════════════════════════════
              GRAPH TYPE RENDERERS
              ════════════════════════════════════════════════════════ */}

          {/* ── BAR / COMPARISON ── */}
          {(graphType==="bar"||graphType==="comparison") && graph.bars && (
            <g>
              {graph.bars.map((bar,idx)=>{
                const n = graph.bars!.length;
                const bw = Math.max(14,(plotW/n)*0.68);
                const bx = pad.left + (idx+0.5)*(plotW/n) - bw/2;
                const basePy = pyZero ?? pad.top+plotH;
                const topPy = py(bar.value);
                const h = Math.abs(basePy-topPy);
                const rectY = Math.min(basePy,topPy);
                return (
                  <g key={idx}>
                    <rect x={bx} y={rectY} width={bw} height={h} rx="4"
                      fill={bar.color||SERIES_COLORS[idx%SERIES_COLORS.length]}
                      className="sg-bar-rect"
                      onMouseEnter={()=>setTooltip({x:bx+bw/2,y:rectY,text:`${bar.label}: ${fmtNum(bar.value)} ${graph.unit||graph.yUnit||""}`,sub:bar.category})}
                      onMouseLeave={()=>setTooltip(null)}
                    />
                    <text x={bx+bw/2} y={rectY-5} fill="#fde047" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {fmtNum(bar.value)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ── DISTRIBUTION HISTOGRAM ── */}
          {graphType==="distribution" && graph.histogramBins && (
            <g>
              {graph.histogramBins.map((bin,idx)=>{
                const bx = px(bin.rangeStart);
                const bx2 = px(bin.rangeEnd);
                const bw = Math.max(1,bx2-bx-2);
                const topPy = py(bin.count);
                const basePy = py(0);
                return (
                  <g key={idx}>
                    <rect x={bx} y={topPy} width={bw} height={Math.max(0,basePy-topPy)} rx="3"
                      fill={SERIES_COLORS[idx%SERIES_COLORS.length]}
                      className="sg-bar-rect"
                      onMouseEnter={()=>setTooltip({x:bx+bw/2,y:topPy,text:`${bin.label||`${bin.rangeStart}-${bin.rangeEnd}`}: ${bin.count}`,sub:"frequency"})}
                      onMouseLeave={()=>setTooltip(null)}
                    />
                    <text x={bx+bw/2} y={topPy-4} fill="#fde047" fontSize="8.5" fontWeight="bold" textAnchor="middle">{bin.count}</text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ── SCATTER PLOT ── */}
          {graphType==="scatter" && (
            <g>
              {proj.map((pt,i)=>(
                <circle key={i} cx={pt.px} cy={pt.py} r={5} fill="#38bdf8" opacity="0.85"
                  stroke="#0f172a" strokeWidth="1.5" className="sg-point"
                  onMouseEnter={()=>setTooltip({x:pt.px,y:pt.py,text:`(${fmtNum(pt.x)}, ${fmtNum(pt.y)})`,sub:pt.label})}
                  onMouseLeave={()=>setTooltip(null)}
                />
              ))}
              {/* regression line hint */}
              {proj.length>=2 && (() => {
                const n=proj.length;
                const sx=proj.reduce((a,p)=>a+p.x,0)/n, sy=proj.reduce((a,p)=>a+p.y,0)/n;
                const num=proj.reduce((a,p)=>a+(p.x-sx)*(p.y-sy),0);
                const den=proj.reduce((a,p)=>a+(p.x-sx)**2,0);
                if(den===0) return null;
                const slope=num/den, intercept=sy-slope*sx;
                const x1=minX, y1=slope*x1+intercept;
                const x2=maxX, y2=slope*x2+intercept;
                return (
                  <line x1={px(x1)} y1={py(y1)} x2={px(x2)} y2={py(y2)}
                    stroke="rgba(251,191,36,0.6)" strokeWidth="1.8" strokeDasharray="5 3"/>
                );
              })()}
            </g>
          )}

          {/* ── OPTIMIZATION PATH (GRADIENT DESCENT) ── */}
          {graphType === "optimization_path" && (
            <g>
              {/* Underlying loss surface curve L(θ) = (θ - 2)² + 1 */}
              {(() => {
                const surfacePts: { px: number; py: number }[] = [];
                const mn = minX - 0.2;
                const mx = maxX + 0.2;
                for (let i = 0; i <= 60; i++) {
                  const theta = mn + (i / 60) * (mx - mn);
                  const l = (theta - 2.0) ** 2 + 1.0;
                  surfacePts.push({ px: px(theta), py: py(l) });
                }
                return (
                  <path d={catmullRomPath(surfacePts)} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5 3"/>
                );
              })()}

              {/* Trajectory step transition arrows */}
              {proj.map((pt, i) => {
                if (i >= proj.length - 1) return null;
                const nextPt = proj[i + 1];
                return (
                  <line
                    key={`step-arrow-${i}`}
                    x1={pt.px}
                    y1={pt.py}
                    x2={nextPt.px}
                    y2={nextPt.py}
                    stroke="#fb7185"
                    strokeWidth="2.2"
                    markerEnd={`url(#arrowStep-${graph.id})`}
                  />
                );
              })}

              {/* Step nodes */}
              {proj.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.px}
                    cy={pt.py}
                    r={5.5}
                    fill="#fbbf24"
                    stroke="#0f172a"
                    strokeWidth="1.8"
                    className="sg-point"
                    onMouseEnter={() => setTooltip({
                      x: pt.px,
                      y: pt.py,
                      text: `Step ${i}: θ=${fmtNum(pt.x)}, Loss=${fmtNum(pt.y)}`,
                      sub: i === 0 ? "Starting Parameter θ₀" : i === proj.length - 1 ? "Minimum point reached" : `Step displacement -α∇L`
                    })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text x={pt.px + 7} y={pt.py - 6} fill="#fbbf24" fontSize="8.5" fontWeight="bold">
                    θ{i}
                  </text>
                </g>
              ))}

              {/* Global minimum marker θ* = 2.0, L* = 1.0 */}
              <circle cx={px(2.0)} cy={py(1.0)} r={7} fill="none" stroke="#34d399" strokeWidth="2"/>
              <text x={px(2.0)} y={py(1.0) + 16} fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">
                θ* = 2.0 (L* = 1.0)
              </text>
            </g>
          )}

          {/* ── LINE / FUNCTION / SCIENTIFIC / TIME_SERIES / RESEARCH / LOSS_CURVE / PARAMETER_MOVEMENT ── */}
          {(graphType==="line"||graphType==="function"||graphType==="scientific"||graphType==="time_series"||graphType==="research"||graphType==="loss_curve"||graphType==="parameter_movement") && proj.length>=2 && (
            <g>
              {isCurveVisible && <path d={filledAreaD} fill={`url(#${gradId})`} opacity="0.25"/>}
              <path ref={pathRef} d={mainCurveD} className="sg-curve-main"
                style={{strokeDasharray:pathLength, strokeDashoffset:strokeOffset}}/>
              {isCurveVisible && proj.map((pt,i)=>(
                <circle key={i} cx={pt.px} cy={pt.py} r={4.5} className="sg-point"
                  onMouseEnter={()=>setTooltip({x:pt.px,y:pt.py,text:`${pt.label||`(${fmtNum(pt.x)}, ${fmtNum(pt.y)})`}`,sub:pt.note})}
                  onMouseLeave={()=>setTooltip(null)}/>
              ))}
            </g>
          )}

          {/* ── MULTI-LINE / TRAINING_CURVE ── */}
          {(graphType==="multi_line"||graphType==="training_curve") && projSeries.map((s,si)=>(
            <g key={si}>
              {isCurveVisible && (
                <path d={catmullRomPath(s.pts)}
                  fill="none" stroke={s.color||SERIES_COLORS[si%SERIES_COLORS.length]}
                  strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
                  style={{filter:`drop-shadow(0 0 5px ${s.color||SERIES_COLORS[si]}44)`}}/>
              )}
              {isCurveVisible && s.pts.map((pt,i)=>(
                <circle key={i} cx={pt.px} cy={pt.py} r={3.5}
                  fill={s.color||SERIES_COLORS[si%SERIES_COLORS.length]}
                  stroke="#0f172a" strokeWidth="1.5" className="sg-point"
                  onMouseEnter={()=>setTooltip({x:pt.px,y:pt.py,text:`${s.name}: (${fmtNum(pt.x)}, ${fmtNum(pt.y)})`,sub:pt.label})}
                  onMouseLeave={()=>setTooltip(null)}/>
              ))}
            </g>
          ))}

          {/* ── THRESHOLD LINE ── */}
          {activeGraph.threshold && (() => {
            const val = activeGraph.threshold.value;
            const axis = activeGraph.threshold.axis ?? "y";
            const x1 = axis==="y" ? pad.left : px(val);
            const y1 = axis==="y" ? py(val) : pad.top;
            const x2 = axis==="y" ? svgW-pad.right : px(val);
            const y2 = axis==="y" ? py(val) : pad.top+plotH;
            const col = activeGraph.threshold.color || "#f43f5e";
            return (
              <g>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="1.8" strokeDasharray="6 3" className="sg-threshold-line"/>
                <text x={axis==="y"?x2-4:px(val)+4} y={axis==="y"?y2-6:pad.top+14}
                  fill={col} fontSize="8.5" fontWeight="700" textAnchor={axis==="y"?"end":"start"}>
                  {activeGraph.threshold.label}
                </text>
              </g>
            );
          })()}

          {/* ── ANNOTATIONS ── */}
          {activeGraph.annotations?.map((ann,i)=>(
            <g key={i}>
              <circle cx={px(ann.x)} cy={py(ann.y)} r={5} fill={ann.color||"#f59e0b"} stroke="#0f172a" strokeWidth="1.5"/>
              <text x={px(ann.x)+8} y={py(ann.y)-6} fill={ann.color||"#f59e0b"} fontSize="9" fontWeight="700">{ann.text}</text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{position:"absolute",left:`${tooltip.x}px`,top:`${tooltip.y-44}px`,transform:"translateX(-50%)",
            background:"rgba(15,23,42,0.97)",border:"1px solid #38bdf8",borderRadius:"6px",padding:"4px 9px",
            fontSize:"0.71rem",color:"#f8fafc",pointerEvents:"none",whiteSpace:"nowrap",
            boxShadow:"0 4px 16px rgba(0,0,0,0.8)",zIndex:30}}>
            <div style={{fontWeight:700,color:"#fde047"}}>{tooltip.text}</div>
            {tooltip.sub && <div style={{fontSize:"0.65rem",color:"#94a3b8"}}>{tooltip.sub}</div>}
          </div>
        )}
      </div>

      {/* Legend + controls */}
      <div className="graph-legends-container">
        {/* Single series */}
        {(graphType==="line"||graphType==="function"||graphType==="scientific"||graphType==="time_series"||graphType==="research"||graphType==="loss_curve"||graphType==="parameter_movement") && (
          <div className="graph-legend-item">
            <span className="graph-legend-swatch" style={{background: graphType==="loss_curve" ? "#fb7185" : "#38bdf8"}}/>
            <span>{activeGraph.y_axis || activeGraph.yLabel || "Data"}</span>
          </div>
        )}
        {/* Optimization path series */}
        {graphType === "optimization_path" && (
          <>
            <div className="graph-legend-item">
              <span className="graph-legend-swatch" style={{background:"#fbbf24"}}/>
              <span>Parameter Steps (θk)</span>
            </div>
            <div className="graph-legend-item">
              <span className="graph-legend-swatch" style={{background:"transparent", borderTop:"2px dashed #475569"}}/>
              <span>Loss Surface L(θ)</span>
            </div>
          </>
        )}
        {/* Multi-series */}
        {projSeries.map((s,i)=>(
          <div key={i} className="graph-legend-item">
            <span className="graph-legend-swatch" style={{background:s.color||SERIES_COLORS[i%SERIES_COLORS.length]}}/>
            <span>{s.name}</span>
          </div>
        ))}
        {/* Threshold */}
        {activeGraph.threshold && (
          <div className="graph-legend-item">
            <span className="graph-legend-swatch" style={{background:"transparent",height:"2px",borderTop:`2px dashed ${activeGraph.threshold.color||"#f43f5e"}`}}/>
            <span>{activeGraph.threshold.label}</span>
          </div>
        )}

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px"}}>
          <button type="button"
            onClick={()=>setIsGridVisible(!isGridVisible)}
            style={{background:"transparent",border:"none",color:isGridVisible?"#38bdf8":"#64748b",
              fontSize:"0.7rem",cursor:"pointer",fontWeight:600}}>
            {isGridVisible?"Grid: ON":"Grid: OFF"}
          </button>
        </div>
      </div>

      {/* ── Key Milestone Labels / Feature Chips ── */}
      {activeGraph.labels && activeGraph.labels.length > 0 && (
        <div className="sgr-labels-container">
          {activeGraph.labels.map((lbl, idx) => (
            <span key={idx} className="sgr-label-chip">
              <GitCommit size={10} style={{ color: "#38bdf8" }}/> {lbl}
            </span>
          ))}
        </div>
      )}

      {/* ── Programmatic Exact Matplotlib Render / Empirical Figure Image ── */}
      {(activeGraph.imageUrl || activeGraph.image_url) && (
        <div style={{ marginTop: "8px", padding: "8px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
            <Database size={11} style={{ color: "#38bdf8" }} />
            <span>Programmatic Matplotlib Render (High-Resolution Exact Output)</span>
          </div>
          <img
            src={activeGraph.imageUrl || activeGraph.image_url}
            alt={activeGraph.title}
            style={{
              maxWidth: "100%",
              maxHeight: "190px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "#050811"
            }}
          />
        </div>
      )}

      {/* ── Authentic Research Paper Source Metadata Card ── */}
      {graph.paperMetadata ? (
        <div className="sgr-paper-card">
          <div className="sgr-paper-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={13} style={{ color: "#34d399" }} />
              <span className="sgr-paper-title">{graph.paperMetadata.paperTitle}</span>
            </div>
            {graph.paperMetadata.figureNumber && (
              <span className="sgr-paper-fig-badge">{graph.paperMetadata.figureNumber}</span>
            )}
          </div>

          {graph.paperMetadata.caption && (
            <p className="sgr-paper-caption">
              <span style={{ color: "#94a3b8", fontWeight: 700 }}>Caption: </span>
              {graph.paperMetadata.caption}
            </p>
          )}

          <div className="sgr-paper-meta-row">
            <div className="sgr-paper-meta-item">
              <span className="sgr-meta-label">Source:</span>
              <span className="sgr-meta-val">{graph.paperMetadata.source}</span>
            </div>
            {(graph.paperMetadata.page !== undefined || graph.paperMetadata.section) && (
              <div className="sgr-paper-meta-item">
                <span className="sgr-meta-label">Location:</span>
                <span className="sgr-meta-val">
                  {graph.paperMetadata.page ? `Page ${graph.paperMetadata.page}` : ''}
                  {graph.paperMetadata.page && graph.paperMetadata.section ? ' • ' : ''}
                  {graph.paperMetadata.section || ''}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : graph.referenceSource ? (
        <div className="sgr-reference-bar">
          <BookOpen size={10}/> {graph.referenceSource}
        </div>
      ) : null}
    </div>
  );
};

