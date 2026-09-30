import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import './VisualLearningArea.css';
import { ScientificGraphRenderer } from './ScientificGraphRenderer';
import {
  Image as ImageIcon,
  LineChart,
  Target,
  Maximize2,
  Info,
  Layers,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  Check,
  X,
  HelpCircle,
  EyeOff,
  BookOpen
} from 'lucide-react';
import type {
  BoardLiveState,
  ClassroomLessonPlan,
  ScientificGraphVisual,
  MultiGraphLayout,
  MultiGraphDecision,
  VisualNecessityDecision
} from '../../../types/script5';
import { VisualNecessityAnalyzer } from '../../../services/visualNecessityAnalyzer';
import { useOptionalMasterClassroom } from '../../../context/MasterClassroomContext';
import {
  MULTI_IMAGES_CATALOG,
  type MultiImageItem,
} from '../../../data/researchLibraryData';
import {
  searchGraphsForQuestion,
  fetchGraphsFromBackend,
  fetchProgrammaticGraphFromBackend,
  fetchGraphDecisionFromBackend,
  decideTeacherEngineGraphs,
  specToVisual,
  type EducationalDomain,
  type GraphPipelineResult
} from '../../../data/GraphSearchEngine';

interface VisualLearningAreaProps {
  boardState: BoardLiveState | null;
  lessonPlan?: ClassroomLessonPlan | null;
  onOpenSources?: () => void;
}

export const VisualLearningArea: React.FC<VisualLearningAreaProps> = ({
  boardState: propBoardState,
  lessonPlan,
  onOpenSources
}) => {
  const master = useOptionalMasterClassroom();
  const boardState = master?.boardLiveState || propBoardState;

  const [activeImageId, setActiveImageId] = useState<string>('img-1');
  // Active Graph
  const [activeGraphId, setActiveGraphId] = useState<string>('');
  // Graph search query (separate from image search)
  const [graphSearchQuery, setGraphSearchQuery] = useState<string>('');
  const [graphSearchInput, setGraphSearchInput] = useState<string>('');
  const graphSearchRef = useRef<HTMLInputElement>(null);

  // Dynamic Image Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchedImages, setSearchedImages] = useState<MultiImageItem[] | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeConcepts, setActiveConcepts] = useState<string[]>([]);

  // Dynamic Graph Search State (Backend API fetch)
  const [backendGraphs, setBackendGraphs] = useState<ScientificGraphVisual[] | null>(null);
  const [backendDecision, setBackendDecision] = useState<MultiGraphDecision | null>(null);

  // Multi-Graph Layout & Inspection States
  const [expandedGraph, setExpandedGraph] = useState<ScientificGraphVisual | null>(null);
  const [galleryViewMode, setGalleryViewMode] = useState<'horizontal' | 'vertical'>('horizontal');

  const [isZoomImageOpen, setIsZoomImageOpen] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Synchronized active target from master timeline or boardState
  const activeTarget = master?.resolvedState?.highlight?.isPulsing ? 'both' : (boardState?.currentVisualLearning?.activeTarget || 'both');

  // Perform dynamic 9-stage image search
  const performImageSearch = useCallback(async (query: string) => {
    if (!query || !query.trim()) return;
    setIsSearching(true);
    try {
      const encoded = encodeURIComponent(query.trim());
      const res = await fetch(`/api/classroom/images/search?question=${encoded}&top_k=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.images) && data.images.length > 0) {
          const mapped: MultiImageItem[] = data.images.map((img: any, idx: number) => ({
            id: img.id || `dyn-img-${idx}`,
            tabLabel: `Figure ${idx + 1} (${Math.round((img.relevanceScore || 1.0) * 100)}%)`,
            title: img.title || `Scientific Figure ${idx + 1}`,
            subtitle: img.subtitle || img.referenceSource || 'Textbook Archive Figure',
            purpose: img.educationalPurpose || img.description || 'Observed scientific evidence for topic understanding.',
            imageUrl: img.imageUrl,
            keyPoints: (img.keyElements || img.keyPoints || []).map((k: any) => ({
              label: k.label || 'Feature',
              description: k.description || ''
            })),
            source: img.referenceSource || 'Research Archive Database'
          }));
          setSearchedImages(mapped);
          setActiveDomain(data.domain || null);
          setActiveConcepts(data.concepts || []);
          setActiveImageId(mapped[0].id);
        } else {
          setSearchedImages([]);
          setActiveDomain(data.domain || 'Algorithmic / Mathematical Model');
          setActiveConcepts(data.concepts || []);
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve educational images:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Listen to student questions asked anywhere across the classroom UI
  useEffect(() => {
    const handleStudentQuestion = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.question) {
        const q = customEvt.detail.question;
        setGraphSearchQuery(q);
        setGraphSearchInput(q);
        performImageSearch(q);
      }
    };
    window.addEventListener('student:question_asked', handleStudentQuestion);
    return () => window.removeEventListener('student:question_asked', handleStudentQuestion);
  }, [performImageSearch]);

  // ── 7-Stage Dynamic Graph Pipeline ──────────────────────────────────────────
  // Derive topic or question from search query → student question → lesson plan → boardState → fallback
  const graphTopic = useMemo(() => {
    if (graphSearchQuery.trim()) return graphSearchQuery.trim();
    if (master?.resolvedState?.pedagogy?.studentQuestionPrompt) {
      return master.resolvedState.pedagogy.studentQuestionPrompt;
    }
    if (lessonPlan?.topic) return lessonPlan.topic;
    if (boardState?.boardTitle) return boardState.boardTitle;
    return 'glaciology';
  }, [graphSearchQuery, master?.resolvedState?.pedagogy?.studentQuestionPrompt, lessonPlan?.topic, boardState?.boardTitle]);

  // Teacher Engine may provide explicit graphs via boardState
  const teacherEngineGraphs: ScientificGraphVisual[] | undefined = useMemo(() => {
    const g = boardState?.currentVisualLearning?.graph;
    const gs = boardState?.currentVisualLearning?.graphs;
    if (gs && gs.length > 0) return gs;
    if (g) return [g];
    return undefined;
  }, [boardState?.currentVisualLearning]);

  // Execute full 7-stage Graph Engine pipeline
  const pipelineResult: GraphPipelineResult = useMemo(() => {
    return searchGraphsForQuestion(graphTopic, teacherEngineGraphs);
  }, [graphTopic, teacherEngineGraphs]);

  // Query backend Teacher Engine decision and graphs asynchronously
  useEffect(() => {
    let active = true;
    fetchGraphDecisionFromBackend(graphTopic).then((dec) => {
      if (active && dec) {
        setBackendDecision(dec);
      }
    });

    if (pipelineResult.sourceUsed === "programmatic") {
      fetchProgrammaticGraphFromBackend(graphTopic).then((specs) => {
        if (active && specs && specs.length > 0) {
          const visuals = specs.map(specToVisual);
          setBackendGraphs(visuals);
        }
      });
    } else {
      fetchGraphsFromBackend(graphTopic).then((fetched) => {
        if (active && fetched && fetched.length > 0) {
          setBackendGraphs(fetched);
        }
      });
    }
    return () => { active = false; };
  }, [graphTopic, pipelineResult.sourceUsed]);

  // Unified Multi-Graph Decision & Layout Determination
  const effectiveDecision = useMemo<MultiGraphDecision>(() => {
    if (backendDecision) return backendDecision;
    if (pipelineResult.multiGraphDecision) return pipelineResult.multiGraphDecision;
    const fallbackDec = decideTeacherEngineGraphs(graphTopic, teacherEngineGraphs);
    return fallbackDec;
  }, [backendDecision, pipelineResult.multiGraphDecision, graphTopic, teacherEngineGraphs]);

  const effectiveLayout: MultiGraphLayout = useMemo(() => {
    if (boardState?.currentVisualLearning?.layout) {
      return boardState.currentVisualLearning.layout;
    }
    return effectiveDecision.layout;
  }, [boardState?.currentVisualLearning?.layout, effectiveDecision.layout]);

  const availableGraphs: ScientificGraphVisual[] = useMemo(() => {
    // If master timeline is actively driving progressive graphs, prefer the master's revealed graphs
    const masterRevealedGraphs = master?.resolvedState?.graph?.graphs;
    if (masterRevealedGraphs && masterRevealedGraphs.length > 0) {
      return masterRevealedGraphs;
    }
    if (teacherEngineGraphs && teacherEngineGraphs.length > 0) {
      return teacherEngineGraphs;
    }
    if (effectiveLayout === 'none') {
      return [];
    }
    if (backendDecision && backendDecision.graphs.length > 0) {
      return backendDecision.graphs;
    }
    if (backendGraphs && backendGraphs.length > 0) {
      return backendGraphs;
    }
    if (effectiveDecision.graphs && effectiveDecision.graphs.length > 0) {
      return effectiveDecision.graphs;
    }
    return pipelineResult.graphs;
  }, [master?.resolvedState?.graph?.graphs, teacherEngineGraphs, effectiveLayout, backendDecision, backendGraphs, effectiveDecision.graphs, pipelineResult.graphs]);

  const graphDomain: EducationalDomain = pipelineResult.domain;
  const isDatabasePreferred = pipelineResult.hasDatabaseMatch || (availableGraphs.length > 0 && !availableGraphs[0].isIllustrative);

  // Sync activeGraphId from Master Timeline
  useEffect(() => {
    if (master?.resolvedState?.graph?.activeGraphId) {
      setActiveGraphId(master.resolvedState.graph.activeGraphId);
    } else if (availableGraphs.length > 0) {
      const exists = availableGraphs.some(g => (g.id || '') === activeGraphId);
      if (!exists) setActiveGraphId(availableGraphs[0].id || 'graph-0');
    }
  }, [master?.resolvedState?.graph?.activeGraphId, availableGraphs, activeGraphId]);

  const activeGraph: ScientificGraphVisual = useMemo(() => {
    const found = availableGraphs.find(g => (g.id || '') === activeGraphId);
    return found || availableGraphs[0] || { id:'fallback', title:'No graph', scientificPurpose:'', xLabel:'x', yLabel:'y' };
  }, [availableGraphs, activeGraphId]);

  // Dynamic Pedagogical Image Decision (VisualNecessityAnalyzer)
  const visualNecessity: VisualNecessityDecision | null = useMemo(() => {
    if (boardState?.currentVisualLearning?.visual_necessity) {
      return boardState.currentVisualLearning.visual_necessity;
    }
    // Calculate dynamically via VisualNecessityAnalyzer client engine
    const activeSection = boardState?.sections?.find(s => s.id === boardState.activeSectionId);
    const title = activeSection?.title || boardState?.boardTitle || graphTopic;
    const hasFormula = Boolean(activeSection?.latexFormula || boardState?.latexFormula);
    const hasGraph = Boolean(activeSection?.graph || availableGraphs.length > 0);
    return VisualNecessityAnalyzer.analyzeSection({
      sectionType: title,
      sectionTitle: title,
      topic: graphTopic,
      speechText: boardState?.currentSpeech || '',
      hasFormula,
      hasGraph,
      dbCandidatesCount: searchedImages?.length || (lessonPlan?.images?.length ?? 0)
    });
  }, [boardState?.currentVisualLearning?.visual_necessity, boardState?.sections, boardState?.activeSectionId, boardState?.boardTitle, boardState?.latexFormula, boardState?.currentSpeech, graphTopic, availableGraphs.length, searchedImages, lessonPlan?.images]);

  // Compute available list of images
  const availableImages: MultiImageItem[] = useMemo(() => {
    // If the pedagogical analyzer explicitly decided NO IMAGE, do NOT force catalog images!
    if (visualNecessity && !visualNecessity.image_needed && searchedImages === null) {
      return [];
    }

    // If master timeline is actively driving progressive images, prefer the master's revealed images
    const masterRevealedImages = master?.resolvedState?.image?.images;
    if (masterRevealedImages && masterRevealedImages.length > 0) {
      return masterRevealedImages.map((img, idx) => ({
        id: img.id || `live-img-${idx}`,
        tabLabel: `Figure ${idx + 1}`,
        title: img.title,
        subtitle: img.caption || (img as any).subtitle || img.referenceSource || 'Textbook Archive Figure',
        purpose: img.educationalPurpose || (img as any).purpose || (img as any).description || 'Observed scientific evidence for topic understanding.',
        imageUrl: img.imageUrl,
        keyPoints: (img.keyElements || (img as any).keyPoints || []).map((k: any) => ({ label: k.label, description: k.description })),
        source: img.referenceSource || (img as any).source || 'Textbook Database'
      }));
    }
    if (searchedImages !== null) return searchedImages;
    const liveImages = boardState?.currentVisualLearning?.images;
    if (liveImages && liveImages.length > 0) {
      return liveImages.map((img, idx) => ({
        id: img.id || `live-img-${idx}`,
        tabLabel: `Figure ${idx + 1}`,
        title: img.title,
        subtitle: img.caption || (img as any).subtitle || img.referenceSource || 'Textbook Archive Figure',
        purpose: img.educationalPurpose || (img as any).purpose || (img as any).description || 'Observed scientific evidence for topic understanding.',
        imageUrl: img.imageUrl,
        keyPoints: (img.keyElements || (img as any).keyPoints || []).map((k: any) => ({ label: k.label, description: k.description })),
        source: img.referenceSource || (img as any).source || 'Textbook Database'
      }));
    }
    const singleImage = boardState?.currentVisualLearning?.image;
    if (singleImage) {
      return [{
        id: singleImage.id || 'live-img-0',
        tabLabel: 'Figure 1',
        title: singleImage.title,
        subtitle: singleImage.caption || 'Textbook Archive Figure',
        purpose: singleImage.educationalPurpose || 'Observed scientific evidence for topic understanding.',
        imageUrl: singleImage.imageUrl,
        keyPoints: (singleImage.keyElements || []).map((k: any) => ({ label: k.label, description: k.description })),
        source: singleImage.referenceSource || 'Textbook Database'
      }];
    }
    // If the step has visual_learning with image explicitly null or missing, respect NO IMAGE
    if (boardState?.currentVisualLearning && boardState.currentVisualLearning.image === null && (!boardState.currentVisualLearning.images || boardState.currentVisualLearning.images.length === 0)) {
      return [];
    }
    if (lessonPlan?.images && lessonPlan.images.length > 0 && (!visualNecessity || visualNecessity.image_needed)) {
      return lessonPlan.images.map((img, idx) => ({
        id: img.id || `plan-img-${idx}`,
        tabLabel: `Figure ${idx + 1}`,
        title: img.title,
        subtitle: img.caption || (img as any).subtitle || img.referenceSource || 'Textbook Archive Figure',
        purpose: img.educationalPurpose || (img as any).purpose || (img as any).description || 'Observed scientific evidence for topic understanding.',
        imageUrl: img.imageUrl,
        keyPoints: (img.keyElements || (img as any).keyPoints || []).map((k: any) => ({ label: k.label, description: k.description })),
        source: img.referenceSource || (img as any).source || 'Textbook Database'
      }));
    }
    // Only return MULTI_IMAGES_CATALOG if not in a lesson and image is warranted
    if (!lessonPlan && !boardState && (!visualNecessity || visualNecessity.image_needed)) {
      return MULTI_IMAGES_CATALOG;
    }
    return [];
  }, [visualNecessity, master?.resolvedState?.image?.images, searchedImages, boardState?.currentVisualLearning, lessonPlan]);

  // Sync activeImageId from Master Timeline
  useEffect(() => {
    if (master?.resolvedState?.image?.activeImageId) {
      setActiveImageId(master.resolvedState.image.activeImageId);
    } else if (availableImages.length > 0) {
      const exists = availableImages.some(img => img.id === activeImageId);
      if (!exists) setActiveImageId(availableImages[0].id);
    }
  }, [master?.resolvedState?.image?.activeImageId, availableImages, activeImageId]);

  const activeImageItem: MultiImageItem | null = useMemo(() => {
    if (availableImages.length === 0) return null;
    return availableImages.find(img => img.id === activeImageId) || availableImages[0];
  }, [availableImages, activeImageId]);

  // Timeline-synchronized visibility states
  const isImageRevealed = master?.timeline ? (master.resolvedState?.image?.visible ?? true) : true;
  const isGraphRevealed = master?.timeline ? (master.resolvedState?.graph?.visible ?? true) : true;

  // Render individual educational graph card matching requirements:
  // title, explanation, source, units, controls when useful, independently selectable and expandable.
  const renderEducationalGraphCard = (graph: ScientificGraphVisual, idx: number, isHero: boolean = false) => {
    const isSelected = (graph.id || String(idx)) === activeGraphId;
    const isDb = !graph.isIllustrative && (graph.dataSource === 'research_paper' || graph.dataSource === 'database');
    const unitsText = graph.unit || graph.units || (graph.xUnit && graph.yUnit ? `${graph.xUnit} vs ${graph.yUnit}` : (graph.xLabel && graph.yLabel ? `${graph.xLabel} / ${graph.yLabel}` : 'Normalized'));
    const sourceText = graph.source || graph.referenceSource || (graph.paperMetadata?.source) || (isDb ? 'Research Database Archive' : 'Programmatic Simulation');
    const explanationText = graph.scientificPurpose || graph.insights?.[0] || 'Quantitative model of physical or mathematical parameter interactions.';

    return (
      <div
        key={graph.id || idx}
        className={`educational-graph-card ${isSelected ? 'is-selected' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: isHero ? '440px' : '340px',
        }}
        onClick={() => setActiveGraphId(graph.id || String(idx))}
      >
        {/* 1. Header: Title, Badges */}
        <div className="graph-card-header">
          <div className="graph-card-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                background: isSelected ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)',
                color: isSelected ? '#c084fc' : '#94a3b8',
                letterSpacing: '0.04em'
              }}>
                GRAPH {idx + 1}
              </span>
              <h4 className="graph-card-title" title={graph.title}>
                {graph.title.length > 40 ? `${graph.title.slice(0, 38)}...` : graph.title}
              </h4>
            </div>
            {isSelected && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                <Check size={11} /> Focused
              </span>
            )}
          </div>
          <div className="graph-card-badges-row">
            <span className="graph-badge-units" title={`Units: ${unitsText}`}>
              Units: {unitsText.length > 24 ? `${unitsText.slice(0, 22)}...` : unitsText}
            </span>
            <span className="graph-badge-source" title={`Source: ${sourceText}`}>
              {isDb ? 'DB: ' : 'SRC: '}{sourceText.length > 28 ? `${sourceText.slice(0, 26)}...` : sourceText}
            </span>
            {graph.isIllustrative && (
              <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 600 }}>
                Illustrative
              </span>
            )}
          </div>
        </div>

        {/* 2. Explanation */}
        <div className="graph-card-explanation-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <TrendingDown size={13} style={{ color: '#a855f7', marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.73rem', color: '#cbd5e1' }}>{explanationText}</span>
          </div>
        </div>

        {/* 3. Canvas */}
        <div className="graph-card-canvas-area" style={{ minHeight: isHero ? '320px' : '230px' }}>
          <ScientificGraphRenderer
            graph={{
              ...graph,
              animationStage: isSelected && master?.resolvedState?.graph?.stage ? master.resolvedState.graph.stage : (graph.animationStage || (graph as any).stage),
              trackedPoint: isSelected && master?.resolvedState?.graph?.trackedPointOverride ? (master.resolvedState.graph.trackedPointOverride as any) : graph.trackedPoint,
            }}
          />
        </div>

        {/* 4. Formula Bar if present */}
        {graph.formula && (
          <div style={{ padding: '4px 10px', background: 'rgba(168,85,247,0.06)', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem', color: '#c084fc', fontFamily: 'monospace', overflowX: 'auto' }}>
            <span style={{ fontWeight: 700, opacity: 0.8 }}>Eq: </span>{graph.formula}
          </div>
        )}

        {/* 5. Controls when useful (Focus & Expand) */}
        <div className="graph-card-footer">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGraphId(graph.id || String(idx));
            }}
            className={`graph-action-btn ${isSelected ? 'active' : 'primary'}`}
            title="Focus this graph independently"
          >
            {isSelected ? <Check size={12} /> : null}
            <span>{isSelected ? 'Active Visual' : 'Focus Graph'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedGraph(graph);
            }}
            className="graph-action-btn"
            title="Expand to high-resolution modal inspection"
          >
            <Maximize2 size={12} />
            <span>Expand</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="visual-learning-container"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Visual Learning Area Title Bar */}
      <div className="visual-learning-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Layers size={16} />
          </div>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            VISUAL LEARNING &bull; MULTIMODAL SCIENTIFIC EVIDENCE
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            Dual Evidence Workspace
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Synchronized with Professor's Lecture &amp; Blackboard
          </span>
        </div>
      </div>

      {/* Two Separate Visual Sections: IMAGES on Left | GRAPHS on Right */}
      <div className="visual-columns-grid">
        {/* ═══════════════════════════════════════════════════════════════
            LEFT COLUMN: IMAGES SECTION (Multiple Relevant Images)
            ═══════════════════════════════════════════════════════════════ */}
        <section
          className={`visual-learning-card ${activeTarget === 'image' || activeTarget === 'both' ? 'is-active-target' : ''}`}
          aria-label="Scientific Diagrams & Illustrations"
        >
          {/* Card Topbar */}
          <div className="visual-card-topbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <ImageIcon size={15} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.04em' }}>
                IMAGES &bull; EDUCATIONAL ILLUSTRATIONS
              </span>
              {/* Visual Decision System Status Badge */}
              {visualNecessity && (
                <span
                  style={{
                    fontSize: '0.64rem',
                    color: visualNecessity.image_needed ? '#38bdf8' : '#94a3b8',
                    background: visualNecessity.image_needed ? 'rgba(56, 189, 248, 0.14)' : 'rgba(148, 163, 184, 0.1)',
                    border: `1px solid ${visualNecessity.image_needed ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.25)'}`,
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontWeight: 700,
                    letterSpacing: '0.03em'
                  }}
                  title={visualNecessity.image_reason}
                >
                  {visualNecessity.decision}
                </span>
              )}
              {activeDomain && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {activeDomain.replace('_', ' ')}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeImageItem?.imageUrl && (
                <button
                  type="button"
                  onClick={() => setIsZoomImageOpen(!isZoomImageOpen)}
                  title="Expand illustration"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.7rem'
                  }}
                >
                  <Maximize2 size={12} />
                  <span>Zoom</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time Dynamic Academic Image Search Bar */}
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search 779+ textbook figures (e.g., 'Glacier mass balance', 'Sea ice floes', 'Cell differentiation')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      performImageSearch(searchQuery);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '5px 10px 5px 30px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.74rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(56, 189, 248, 0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
              <button
                type="button"
                onClick={() => performImageSearch(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: isSearching ? 'rgba(56, 189, 248, 0.2)' : '#0284c7',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isSearching ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isSearching ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>{isSearching ? 'Retrieving...' : 'Retrieve'}</span>
              </button>
            </div>

            {/* Quick Academic Subject Concept Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>Quick Topics:</span>
              {[
                { label: 'Glacier Mass Balance', query: 'What is glacier mass balance?' },
                { label: 'Sea Ice Formation', query: 'Explain sea ice formation and ice floes in the polar ocean' },
                { label: 'Cell Differentiation', query: 'How does cell differentiation work in Arabidopsis plant tissues?' },
                { label: 'Ocean Circulation', query: 'What is ocean thermohaline circulation and deep water mass formation?' },
                { label: 'Argonaute Proteins', query: 'What are Argonaute proteins in molecular biology?' },
                { label: 'Dijkstra Path', query: 'What is Dijkstra shortest path algorithm?' }
              ].map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchQuery(qp.query);
                    performImageSearch(qp.query);
                  }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    fontSize: '0.66rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#38bdf8';
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Extracted Concepts Indicator */}
            {activeConcepts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Extracted Concepts:</span>
                {activeConcepts.slice(0, 6).map((c, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      color: '#7dd3fc',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    #{c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Image Selector Bar (Figure 1, Figure 2, Figure 3...) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              overflowX: 'auto'
            }}
          >
            {availableImages.length > 0 ? (
              availableImages.map((img) => {
                const isSelected = img.id === activeImageId;
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageId(img.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: isSelected
                        ? '1px solid rgba(56, 189, 248, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.18)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isSelected && <CheckCircle2 size={11} />}
                    <span>{img.tabLabel}</span>
                  </button>
                );
              })
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '2px 4px' }}>
                Algorithmic Topic &bull; Interactive Computational Model Active
              </div>
            )}
          </div>

          <div className="visual-card-body">
            {!isImageRevealed ? (
              <div
                style={{
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(ellipse at center, rgba(192, 132, 252, 0.08) 0%, rgba(10, 15, 28, 0.95) 100%)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(192, 132, 252, 0.3)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(192, 132, 252, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                    border: '1px solid rgba(192, 132, 252, 0.4)'
                  }}
                >
                  <ImageIcon size={22} className="animate-pulse" />
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  Visual Image Scheduled on Master Timeline
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '340px', lineHeight: 1.45 }}>
                  Professor Arvind Sharma will reveal <span style={{ color: '#c084fc', fontWeight: 700 }}>Image 1 (Firn Stratification)</span> at <span style={{ color: '#c084fc', fontWeight: 700 }}>00:09</span> during the accumulation breakdown.
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#c084fc',
                    background: 'rgba(192, 132, 252, 0.12)',
                    padding: '4px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(192, 132, 252, 0.35)'
                  }}
                >
                  Master Clock: {Math.floor(master?.currentTime || 0)}s &bull; Cue at 00:09
                </div>
              </div>
            ) : activeImageItem ? (
              <>
                {/* Visual Title & Subtitle */}
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                    }}
                  >
                    {activeImageItem.title}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {activeImageItem.subtitle}
                  </div>
                </div>

                {/* Educational Purpose Box */}
                <div className="educational-purpose-box">
                  <div className="purpose-badge" style={{ color: '#38bdf8' }}>
                    <Target size={13} />
                    <span>Educational Purpose</span>
                  </div>
                  <p className="purpose-text">{activeImageItem.purpose}</p>
                </div>

                {/* Active Illustration Stage */}
                <div className="visual-canvas-stage">
                  {activeImageItem.imageUrl ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={activeImageItem.imageUrl}
                        alt={activeImageItem.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '230px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                          background: '#090d16'
                        }}
                        onError={(e) => {
                          // Fallback if local image file cannot be loaded directly
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    /* Dynamic SVG Glacier Cross-Section Diagram */
                    <svg
                      width="100%"
                      height="220"
                      viewBox="0 0 460 220"
                      style={{ overflow: 'visible', maxWidth: '460px' }}
                    >
                      <defs>
                        <linearGradient id="snowGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="firnGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.75" />
                        </linearGradient>
                        <linearGradient id="iceGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
                        </linearGradient>
                        <marker id="arrowSnow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                        </marker>
                        <marker id="arrowMelt2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                        </marker>
                      </defs>

                      {/* Bedrock Ridge */}
                      <path d="M 20 200 L 80 180 L 160 160 L 260 120 L 360 70 L 440 30 L 440 215 L 20 215 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

                      {/* Glacial Blue Ice Body */}
                      <path d="M 50 180 Q 150 140 250 100 Q 350 60 420 25 L 420 50 Q 340 85 240 125 Q 140 165 50 195 Z" fill="url(#iceGrad2)" opacity="0.9" />

                      {/* Firn Transition Layer */}
                      <path d="M 220 105 Q 320 65 415 26 L 418 35 Q 325 73 225 112 Z" fill="url(#firnGrad2)" opacity="0.85" />

                      {/* Fresh Snow Layer (Accumulation Crest) */}
                      <path d="M 260 90 Q 340 55 412 28 L 416 33 Q 342 60 264 95 Z" fill="url(#snowGrad2)" />

                      {/* ELA Boundary Dashed Line */}
                      <line x1="230" y1="20" x2="230" y2="190" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
                      <rect x="180" y="16" width="100" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#22c55e" strokeWidth="1" />
                      <text x="230" y="30" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">
                        ELA (3000m)
                      </text>

                      {/* Left Label: Ablation Area */}
                      <rect x="40" y="90" width="125" height="38" rx="6" fill="rgba(15,23,42,0.85)" stroke="rgba(244,63,94,0.6)" strokeWidth="1" />
                      <text x="102" y="105" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="bold">
                        ABLATION ZONE
                      </text>
                      <text x="102" y="120" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                        Net Loss: b(z) &lt; 0
                      </text>

                      {/* Right Label: Accumulation Area */}
                      <rect x="310" y="140" width="125" height="38" rx="6" fill="rgba(15,23,42,0.85)" stroke="rgba(56,189,248,0.6)" strokeWidth="1" />
                      <text x="372" y="155" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                        ACCUMULATION ZONE
                      </text>
                      <text x="372" y="170" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                        Net Gain: b(z) &gt; 0
                      </text>

                      {/* Snowfall Input Arrows in Accumulation Zone */}
                      <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9">
                        <line x1="330" y1="20" x2="330" y2="40" markerEnd="url(#arrowSnow2)" />
                        <line x1="370" y1="10" x2="370" y2="30" markerEnd="url(#arrowSnow2)" />
                        <line x1="410" y1="5" x2="410" y2="25" markerEnd="url(#arrowSnow2)" />
                      </g>
                      <text x="370" y="8" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="600">
                        Snowfall (+C)
                      </text>

                      {/* Melt Runoff Arrow in Ablation Zone */}
                      <g stroke="#f43f5e" strokeWidth="2" strokeLinecap="round">
                        <path d="M 100 150 Q 80 170 50 185" fill="none" markerEnd="url(#arrowMelt2)" />
                      </g>
                      <text x="85" y="175" fill="#f43f5e" fontSize="9" fontWeight="600">
                        Runoff (-A)
                      </text>
                    </svg>
                  )}
                </div>

                {/* Key Elements Breakdown */}
                {activeImageItem.keyPoints && activeImageItem.keyPoints.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                      KEY PEDAGOGICAL COMPONENTS:
                    </div>
                    <div className="key-elements-grid">
                      {activeImageItem.keyPoints.map((el, i) => (
                        <div
                          key={i}
                          className="key-element-chip"
                          onClick={() => setSelectedElementId(el.label)}
                          style={{
                            borderColor: selectedElementId === el.label ? '#38bdf8' : undefined,
                            background: selectedElementId === el.label ? 'rgba(56, 189, 248, 0.15)' : undefined,
                          }}
                        >
                          <span className="key-element-title">{el.label}</span>
                          <span className="key-element-desc">{el.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Source */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={12} />
                    <span>Source: {activeImageItem.source}</span>
                  </div>
                  {onOpenSources && (
                    <button
                      onClick={onOpenSources}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        textDecoration: 'underline'
                      }}
                    >
                      View Book
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Visual Decision System: NO IMAGE warranted for this teaching section */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', background: 'rgba(15, 23, 42, 0.55)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(148, 163, 184, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <EyeOff size={15} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', display: 'block' }}>
                        Pedagogical Decision: DO NOT SHOW IMAGE
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        VisualNecessityAnalyzer &bull; Section Cognitive Focus
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.66rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {visualNecessity?.decision || 'NO IMAGE'}
                  </span>
                </div>

                <div style={{ padding: '10px 12px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Educational Principle: &ldquo;Does this image improve learning?&rdquo;
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                    {visualNecessity?.image_reason || 'An image is not warranted here. Pedagogical priority is dedicated to chalkboard notation, formal definitions, and analytical formula derivation to avoid cognitive distraction.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.64rem' }}>Pedagogical Focus:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {visualNecessity?.pedagogical_focus === 'mathematical_derivation' ? 'Blackboard LaTeX Derivation' : visualNecessity?.pedagogical_focus === 'blackboard_chalk' ? 'Verbal Nomenclature & Chalkboard' : 'Analytical Coordinate Plane'}
                    </span>
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.64rem' }}>Decision Rule:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Zero Gratuity &bull; Anti-Clutter Enforced</span>
                  </div>
                </div>

                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.12)' }}>
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.74rem', maxWidth: '320px', padding: '0 12px' }}>
                    <BookOpen size={28} style={{ color: '#38bdf8', margin: '0 auto 8px auto', display: 'block', opacity: 0.8 }} />
                    Focus student attention on the central blackboard and the quantitative graph panel to the right.
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT COLUMN: GRAPHS SECTION — Educational Graph Engine
            ═══════════════════════════════════════════════════════════════ */}
        <section
          className={`visual-learning-card ${activeTarget === 'graph' || activeTarget === 'both' ? 'is-active-target' : ''}`}
          aria-label="Scientific Data Graphs"
        >
          {/* Card Topbar */}
          <div className="visual-card-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <BarChart3 size={15} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.04em' }}>
                GRAPHS &bull; EDUCATIONAL GRAPH ENGINE
              </span>
              {/* Database preferred badge vs Programmatic badge */}
              {isDatabasePreferred ? (
                <span style={{ fontSize: '0.64rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', padding: '2px 7px', borderRadius: '5px', fontWeight: 700 }}>
                  DATABASE PREFERRED
                </span>
              ) : (
                <span style={{ fontSize: '0.64rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '2px 7px', borderRadius: '5px', fontWeight: 700 }}>
                  PROGRAMMATIC FALLBACK
                </span>
              )}
              {pipelineResult.requirements?.recommendedGraphType && (
                <span style={{ fontSize: '0.64rem', color: '#a78bfa', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', padding: '2px 7px', borderRadius: '5px', fontWeight: 600 }}>
                  {pipelineResult.requirements.recommendedGraphType}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', padding: '2px 7px', borderRadius: '5px', fontWeight: 600, textTransform: 'uppercase' }}>
              {graphDomain.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Graph Subject Search Bar */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.5)' }}>
            <form onSubmit={(e) => { e.preventDefault(); setGraphSearchQuery(graphSearchInput.trim()); }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  ref={graphSearchRef}
                  value={graphSearchInput}
                  onChange={e => setGraphSearchInput(e.target.value)}
                  placeholder="Ask a question or topic: 'glacier retreat', 'ELA shift', 'machine learning', 'physics'..."
                  style={{ width: '100%', padding: '6px 10px 6px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8fafc', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" style={{ padding: '6px 14px', background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: '6px', color: '#c084fc', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer' }}>
                Search
              </button>
              {graphSearchQuery && (
                <button type="button" onClick={() => { setGraphSearchQuery(''); setGraphSearchInput(''); }}
                  style={{ padding: '6px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#64748b', fontSize: '0.73rem', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </form>
            <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
              {[
                'Explain glacier mass balance',
                'What is glacier ablation?',
                'Explain y = x²',
                'Compare Arctic and Antarctic sea ice',
                'Explain gradient descent',
                'Compare algorithmic complexities',
                'What is a glacier? (0 graphs)',
                'Explain CNN accuracy over epochs'
              ].map(t => (
                <button key={t} type="button" onClick={() => { setGraphSearchQuery(t); setGraphSearchInput(t); }}
                  style={{ padding: '2px 9px', borderRadius: '10px', fontSize: '0.67rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                    background: graphTopic.toLowerCase().includes(t.toLowerCase().replace(' (0 graphs)', '')) ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.04)',
                    border: graphTopic.toLowerCase().includes(t.toLowerCase().replace(' (0 graphs)', '')) ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.09)',
                    color: graphTopic.toLowerCase().includes(t.toLowerCase().replace(' (0 graphs)', '')) ? '#c084fc' : '#94a3b8' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Engine Decision & Multi-Graph Layout Engine */}
          <div className="multi-graph-section" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Multi-Graph Meta Banner */}
            <div className="multi-graph-meta-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`graph-decision-pill ${effectiveLayout}`}>
                  {effectiveLayout === 'none' && '0 GRAPHS DECIDED'}
                  {effectiveLayout === 'single' && '1 GRAPH DECIDED (LARGE DISPLAY)'}
                  {effectiveLayout === 'two_column' && '2 GRAPHS DECIDED (2-COLUMN COMPARATIVE)'}
                  {effectiveLayout === 'three_cards' && '3 GRAPHS DECIDED (RESPONSIVE CARDS)'}
                  {effectiveLayout === 'gallery' && `${availableGraphs.length} GRAPHS DECIDED (EDUCATIONAL GALLERY)`}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '0.73rem', fontWeight: 500 }}>
                  {effectiveDecision.rationale}
                </span>
              </div>

              {effectiveLayout === 'gallery' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode('horizontal')}
                    style={{
                      padding: '3px 8px', borderRadius: '5px', fontSize: '0.68rem', cursor: 'pointer',
                      border: galleryViewMode === 'horizontal' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                      background: galleryViewMode === 'horizontal' ? 'rgba(245,158,11,0.2)' : 'transparent',
                      color: galleryViewMode === 'horizontal' ? '#fbbf24' : '#94a3b8'
                    }}
                  >
                    Horizontal Carousel
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode('vertical')}
                    style={{
                      padding: '3px 8px', borderRadius: '5px', fontSize: '0.68rem', cursor: 'pointer',
                      border: galleryViewMode === 'vertical' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                      background: galleryViewMode === 'vertical' ? 'rgba(245,158,11,0.2)' : 'transparent',
                      color: galleryViewMode === 'vertical' ? '#fbbf24' : '#94a3b8'
                    }}
                  >
                    Vertical Grid
                  </button>
                </div>
              )}
            </div>

            {/* Multi-Graph Quick Focus Tab Bar (When multiple graphs exist) */}
            {availableGraphs.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px', whiteSpace: 'nowrap' }}>
                  Views:
                </span>
                {availableGraphs.map((g, i) => {
                  const isSelected = (g.id || String(i)) === activeGraphId;
                  const isDb = !g.isIllustrative && (g.dataSource === 'research_paper' || g.dataSource === 'database');
                  return (
                    <button
                      key={g.id || i}
                      onClick={() => setActiveGraphId(g.id || String(i))}
                      style={{
                        padding: '3px 9px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease',
                        border: isSelected ? '1px solid rgba(168,85,247,0.8)' : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.03)',
                        color: isSelected ? '#c084fc' : '#94a3b8', fontSize: '0.7rem', fontWeight: isSelected ? 700 : 500,
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      {isSelected && <CheckCircle2 size={11} />}
                      <span>Graph {i+1}: {g.title.length > 20 ? `${g.title.slice(0, 20)}...` : g.title}</span>
                      {isDb ? (
                        <span style={{ fontSize: '0.55rem', padding: '1px 3px', borderRadius: '2px', background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', fontWeight: 700 }}>
                          DB
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.55rem', padding: '1px 3px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 600 }}>
                          SIM
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dynamic Layout Delivery */}
            {!isGraphRevealed ? (
              <div
                style={{
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.08) 0%, rgba(10, 15, 28, 0.95) 100%)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(56, 189, 248, 0.3)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  gap: '12px',
                  margin: '12px'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)'
                  }}
                >
                  <LineChart size={22} className="animate-pulse" />
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  Scientific Graph Scheduled on Master Timeline
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '340px', lineHeight: 1.45 }}>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>Graph 1 (Mass Deficit vs Temp)</span> will appear at <span style={{ color: '#38bdf8', fontWeight: 700 }}>00:20</span>, followed by <span style={{ color: '#34d399', fontWeight: 700 }}>Graph 2</span> at <span style={{ color: '#34d399', fontWeight: 700 }}>00:30</span>.
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '4px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.35)'
                  }}
                >
                  Master Clock: {Math.floor(master?.currentTime || 0)}s &bull; Cue at 00:20
                </div>
              </div>
            ) : effectiveLayout === 'none' || availableGraphs.length === 0 ? (
              <div className="zero-graphs-container">
                <div className="zero-graphs-icon">
                  <HelpCircle size={24} />
                </div>
                <h3 className="zero-graphs-title">Teacher Engine Decision: 0 Graphs Needed</h3>
                <p className="zero-graphs-desc">
                  {effectiveDecision.rationale || 'Direct conceptual explanation provides complete clarity. Quantitative curves are unnecessary and would add cognitive clutter.'}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setGraphSearchQuery('Explain glacier mass balance'); setGraphSearchInput('Explain glacier mass balance'); }}
                    style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Try: "Explain glacier mass balance" (3 graphs)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setGraphSearchQuery('What is glacier ablation?'); setGraphSearchInput('What is glacier ablation?'); }}
                    style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Try: "What is glacier ablation?" (1 graph)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setGraphSearchQuery('Compare Arctic and Antarctic sea ice'); setGraphSearchInput('Compare Arctic and Antarctic sea ice'); }}
                    style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', color: '#34d399', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Try: "Compare Arctic and Antarctic sea ice" (2 graphs)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setGraphSearchQuery('Compare algorithmic complexities'); setGraphSearchInput('Compare algorithmic complexities'); }}
                    style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Try: "Compare algorithmic complexities" (5-graph gallery)
                  </button>
                </div>
              </div>
            ) : effectiveLayout === 'single' || availableGraphs.length === 1 ? (
              <div className="graphs-single-layout">
                {renderEducationalGraphCard(availableGraphs[0] || activeGraph, 0, true)}
              </div>
            ) : effectiveLayout === 'two_column' || availableGraphs.length === 2 ? (
              <div className="graphs-two-column-grid">
                {availableGraphs.slice(0, 2).map((g, i) => renderEducationalGraphCard(g, i))}
              </div>
            ) : effectiveLayout === 'three_cards' || availableGraphs.length === 3 ? (
              <div className="graphs-three-cards-grid">
                {availableGraphs.slice(0, 3).map((g, i) => renderEducationalGraphCard(g, i))}
              </div>
            ) : (
              <div className="graphs-gallery-container">
                {galleryViewMode === 'horizontal' ? (
                  <div className="gallery-filmstrip">
                    {availableGraphs.map((g, i) => renderEducationalGraphCard(g, i))}
                  </div>
                ) : (
                  <div className="gallery-vertical-grid">
                    {availableGraphs.map((g, i) => renderEducationalGraphCard(g, i))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Expanded Fullscreen High-Resolution Inspection Modal */}
      {expandedGraph && (
        <div
          className="expanded-graph-modal-backdrop animate-fade-in"
          onClick={() => setExpandedGraph(null)}
        >
          <div
            className="expanded-graph-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="expanded-graph-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <LineChart size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 700 }}>{expandedGraph.title}</h3>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Source: {expandedGraph.source || expandedGraph.referenceSource || 'Peer-Reviewed Scientific Dataset'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpandedGraph(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={14} /> Close
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {expandedGraph.scientificPurpose && (
                <div className="scientific-purpose-box">
                  <div className="purpose-badge" style={{ color: '#a855f7' }}>
                    <TrendingDown size={14} />
                    <span>Scientific Purpose</span>
                  </div>
                  <p className="purpose-text">{expandedGraph.scientificPurpose}</p>
                </div>
              )}

              <div style={{ width: '100%', minHeight: '380px', background: '#030712', borderRadius: '12px', padding: '12px', boxSizing: 'border-box' }}>
                <ScientificGraphRenderer graph={expandedGraph} />
              </div>

              {expandedGraph.formula && (
                <div style={{ padding: '8px 14px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '8px', fontSize: '0.82rem', color: '#c084fc', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>Governing Equation: </span>{expandedGraph.formula}
                </div>
              )}

              {expandedGraph.insights && expandedGraph.insights.length > 0 && (
                <div className="graph-insights-panel">
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>KEY SCIENTIFIC INSIGHTS:</div>
                  <ul className="insights-list">
                    {expandedGraph.insights.map((ins, i) => (
                      <li key={i} className="insight-item"><span className="bullet">&bull;</span><span>{ins}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for High-Res Diagram Inspection */}
      {isZoomImageOpen && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => setIsZoomImageOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              width: '100%',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: '#0a0f1d'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem' }}>{activeImageItem?.title || 'Figure Inspection'}</h3>
              <button
                onClick={() => setIsZoomImageOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            {activeImageItem?.purpose && (
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>{activeImageItem.purpose}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', background: '#040711', borderRadius: '12px' }}>
              {activeImageItem?.imageUrl ? (
                <img
                  src={activeImageItem.imageUrl}
                  alt={activeImageItem.title}
                  style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  {/* SVG rendered large */}
                  <svg width="100%" height="300" viewBox="0 0 460 220">
                    <use href="#snowGrad2" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
