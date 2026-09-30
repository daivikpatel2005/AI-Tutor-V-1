/**
 * script5 API Types
 * ---------------------------------------------------
 * These types exactly match the Pydantic models defined in:
 *   script5/SCRIPT/research_ai_tutor/app/models/classroom_models.py
 *
 * DO NOT invent new types here.
 * These must mirror the backend contract 1-to-1.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TeacherState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'EXPLAINING'
  | 'WAITING'
  | 'INTERRUPTED'
  | 'DOUBT_ANSWERING';

export type GazeDirection = 'CAMERA' | 'TOWARDS_BOARD' | 'DOWN_REFLECTIVE';

export type TeacherGesture =
  | 'NONE'
  | 'POINT_RIGHT'
  | 'POINT_LEFT'
  | 'OPEN_PALM'
  | 'SUBTLE_NOD'
  | 'EMPHASIS_HAND';

export type BlackboardActionType =
  | 'WRITE_TITLE'
  | 'WRITE_TEXT'
  | 'WRITE_LATEX'
  | 'DRAW_ARRAY'
  | 'HIGHLIGHT_ELEMENT'
  | 'DRAW_ARROW'
  | 'DRAW_GRAPH'
  | 'DRAW_DIAGRAM'
  | 'DRAW_BOX'
  | 'PULSE_ELEMENT'
  | 'CLEAR_SECTION'
  | 'CLEAR_BOARD'
  | 'ERASE_ELEMENT';

// ─── Nested Models ────────────────────────────────────────────────────────────

export interface VisemeFrame {
  time_ms: number;
  viseme: string;
  weight: number;
}

export interface TeachingSpeechFrame {
  text: string;
  audio_base64?: string | null;
  audio_url?: string | null;
  visemes: VisemeFrame[];
}

export interface AvatarInstruction {
  state: TeacherState;
  gaze: GazeDirection;
  gesture: TeacherGesture;
  expression: string;
  head_nod?: string | null;
}

export interface BlackboardAction {
  action_type: BlackboardActionType;
  target_id?: string | null;
  /** Payload key→value depends on action_type:
   *  WRITE_TITLE  → { title: string }
   *  WRITE_TEXT   → { text: string }
   *  WRITE_LATEX  → { latex: string, label?: string }
   *  DRAW_ARRAY   → { elements: any[], pointers: {low?:n, mid?:n, high?:n}, dimmed?: number[] }
   *  HIGHLIGHT_ELEMENT → { color: string }
   *  DRAW_DIAGRAM → { image_url?: string, caption?: string, visual_type?: string, spec?: object }
   *  PULSE_ELEMENT → { color: string }
   *  DRAW_GRAPH   → { graph: object }
   *  CLEAR_BOARD  → {}
   */
  payload: Record<string, any>;
  animation_duration_ms: number;
  /** Milliseconds from start of parent TeachingEvent before this action fires.
   *  This is what drives progressive synchronized blackboard writing. */
  delay_ms?: number;
}

export interface EducationalImageVisual {
  id?: string;
  title: string;
  caption?: string;
  imageUrl?: string;
  svgMarkup?: string;
  educationalPurpose: string;
  keyElements?: Array<{ label: string; description: string; tag?: string }>;
  tags?: string[];
  referenceSource?: string;
  stage?: string;
}

export type GraphType =
  | 'line'        // Simple line graph (2D x-y)
  | 'bar'         // Vertical / Horizontal bar chart
  | 'scatter'     // Scatter plot with optional regression line
  | 'function'    // Mathematical function curve y=f(x)
  | 'scientific'  // Scientific research graph (general)
  | 'time_series' // Time on x-axis, measured quantity on y-axis
  | 'comparison'  // Side-by-side multi-group bars
  | 'multi_line'  // Multiple series on same x-y axes
  | 'distribution'// Histogram / frequency distribution
  | 'statistical' // Box plot / error bars / confidence intervals
  | 'research'    // Extracted or referenced from research paper/book
  | 'optimization_path'   // Optimization trajectory on loss surface with step vectors
  | 'loss_curve'          // Objective loss L(k) vs iteration step
  | 'parameter_movement'  // Parameter position θ vs iteration step
  | 'training_curve';     // Machine learning training & validation accuracy over epochs

export interface GraphBarData {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

export interface GraphSeriesData {
  name: string;
  color: string;
  dataPoints: Array<{ x: number; y: number; label?: string; note?: string }>;
}

export interface GraphHighlightRegion {
  type: 'negative_y' | 'positive_y' | 'x_range' | 'y_range';
  label?: string;
  color?: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface GraphTrackedPoint {
  x: number;
  y: number;
  label?: string;
  subtext?: string;
  color?: string;
  showTrail?: boolean;
}

export interface GraphLegendItem {
  label: string;
  color: string;
  type?: 'line' | 'bar' | 'scatter' | 'threshold' | 'region';
}

export type GraphDataSource =
  | 'research_paper'    // Extracted from uploaded book/paper
  | 'teacher_engine'    // Structured data from Teacher Engine / lesson plan
  | 'database'          // From existing graph/data database
  | 'illustrative'      // Programmatically generated illustrative example
  | 'unknown';

export interface ResearchPaperSourceMetadata {
  paperTitle: string;
  figureNumber?: string;
  caption?: string;
  source: string;
  page?: number | string;
  section?: string;
  doi?: string;
}

/**
 * Structured Graph Specification Contract:
 * {
 *   graph_type,
 *   title,
 *   x_axis,
 *   y_axis,
 *   units,
 *   data,
 *   equation,
 *   labels,
 *   source,
 *   is_illustrative
 * }
 */
export interface StructuredGraphSpec {
  graph_type: string;
  title: string;
  x_axis: string;
  y_axis: string;
  units: string;
  data: any[];
  equation?: string;
  labels: string[];
  source: string;
  is_illustrative: boolean;
  // Optional extensions
  image_url?: string;
  insights?: string[];
  sub_specs?: StructuredGraphSpec[];
}

export type MultiGraphLayout = 'none' | 'single' | 'two_column' | 'three_cards' | 'gallery';

export interface MultiGraphDecision {
  count: number;
  layout: MultiGraphLayout;
  rationale: string;
  graphs: ScientificGraphVisual[];
  specs?: StructuredGraphSpec[];
}

export interface ScientificGraphVisual {
  id?: string;
  title: string;
  scientificPurpose: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;  // e.g. '°C', 'years', 'Hz'
  yUnit?: string;  // e.g. 'Gt/yr', 'Pa', 'mol/L'
  formula?: string;
  graphType?: GraphType;
  curveType?: 'linear' | 'gradient' | 'quadratic' | 'exponential' | 'sigmoid' | 'glacier_gradient';
  dataPoints?: Array<{ x: number; y: number; label?: string; note?: string; step?: number }>;
  bars?: GraphBarData[];
  series?: GraphSeriesData[];          // multi-series (multi_line / comparison)
  histogramBins?: Array<{ rangeStart: number; rangeEnd: number; count: number; label?: string }>; // distribution
  errorBars?: Array<{ x: number; y: number; yMin: number; yMax: number; label?: string }>;        // statistical
  functionExpr?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  threshold?: { label: string; value: number; color?: string; note?: string; axis?: 'x' | 'y' };
  annotations?: Array<{ text: string; x: number; y: number; color?: string }>;
  highlightRegion?: GraphHighlightRegion;
  trackedPoint?: GraphTrackedPoint;
  legends?: GraphLegendItem[];
  unit?: string;
  insights?: string[];
  stage?: string;
  animationStage?: 'axes_only' | 'plotting_curve' | 'highlighting_region' | 'moving_point' | 'complete';
  // Data provenance & Authentic Paper Source Metadata
  dataSource?: GraphDataSource;
  isIllustrative?: boolean;   // If true, render 'Illustrative Example' badge
  referenceSource?: string;   // Book title / paper DOI / database name
  paperMetadata?: ResearchPaperSourceMetadata; // Non-invented research paper source info
  relevanceScore?: number;    // Ranking score (0.0 to 1.0)
  imageUrl?: string;          // Direct extracted scientific figure image if available
  topic?: string;             // Subject domain this graph belongs to
  // Structured Specification Contract compatibility fields
  graph_type?: string;
  x_axis?: string;
  y_axis?: string;
  units?: string;
  data?: any[];
  equation?: string;
  labels?: string[];
  source?: string;
  is_illustrative?: boolean;
  sub_specs?: StructuredGraphSpec[];
  image_url?: string;
}

export type VisualNecessityDecisionType =
  | 'NO IMAGE'
  | 'ONE IMAGE'
  | 'MULTIPLE IMAGES'
  | 'GENERATED IMAGE'
  | 'DATABASE IMAGE'
  | 'DATABASE + GENERATED IMAGE';

export type VisualNecessityImageType =
  | 'diagram'
  | 'photographic_observation'
  | 'comparative_morphology'
  | 'schematic_workflow'
  | 'historical_archive'
  | 'none';

export type VisualNecessitySource =
  | 'NONE'
  | 'DATABASE'
  | 'GENERATED'
  | 'DATABASE_AND_GENERATED';

export interface VisualNecessityDecision {
  image_needed: boolean;
  decision: VisualNecessityDecisionType;
  image_reason: string;
  image_type: VisualNecessityImageType;
  image_count: number;
  image_source: VisualNecessitySource;
  display_duration: number; // in milliseconds
  pedagogical_focus?: string;
  recommended_query?: string | null;
}

export interface EducationalVisualLearning {
  image?: EducationalImageVisual | null;
  images?: EducationalImageVisual[];
  graph?: ScientificGraphVisual | null;
  graphs?: ScientificGraphVisual[];
  layout?: MultiGraphLayout;
  activeTarget?: 'image' | 'graph' | 'both';
  stepNote?: string;
  conceptHeading?: string;
  activeImageId?: string;
  activeGraphId?: string;
  visual_necessity?: VisualNecessityDecision | null;
}

export interface TeachingEvent {
  event_id: string;
  timestamp_offset_ms: number;
  duration_ms: number;
  speech: TeachingSpeechFrame;
  avatar: AvatarInstruction;
  blackboard: BlackboardAction[];
  visual_learning?: EducationalVisualLearning | null;
}

// ─── Top-Level Lesson Plan ─────────────────────────────────────────────────────

export interface ClassroomLessonPlan {
  lesson_id: string;
  title: string;
  topic: string;
  teacher_name: string;
  total_duration_ms: number;
  events: TeachingEvent[];
  images?: EducationalImageVisual[];
  sources?: AttachedPDFSource[] | Record<string, any>[];
  metadata: Record<string, any>;
}

// ─── Doubt Request / Response ─────────────────────────────────────────────────

export interface StudentDoubtRequest {
  session_id: string;
  lesson_id: string;
  current_timestamp_ms: number;
  student_transcript: string;
  student_audio_base64?: string | null;
  blackboard_snapshot?: Record<string, any>;
  level?: string;
  attached_pdf_path?: string | null;
  attached_pdf_name?: string | null;
  attached_pdf_content?: string | null;
}

export interface ProfessorTeachRequest {
  question: string;
  topic?: string | null;
  student_level?: string;
  level?: string | null;
  use_llm?: boolean;
  attached_pdf_path?: string | null;
  attached_pdf_name?: string | null;
  attached_pdf_content?: string | null;
  session_id?: string | null;
}

export interface AttachedPDFSource {
  document_name: string;
  page?: number | null;
  chapter?: string | null;
  section?: string | null;
  source_type: 'attached_pdf' | 'book';
  priority_rank: number;
  is_attached_pdf: boolean;
  content_snippet?: string;
  score?: number;
}

export interface StudentDoubtResponse {
  session_id: string;
  interrupt_acknowledged: boolean;
  teacher_state: TeacherState;
  resolution_events: TeachingEvent[];
  resume_timestamp_ms: number;
  professor_teaching?: Record<string, any> | null;
  visual_learning?: Record<string, any> | null;
  teacher_engine_contract?: Record<string, any> | null;
  sources?: AttachedPDFSource[];
}

// ─── Chalk Board Section (Progressive Teaching on Real Blackboard) ────────────

export interface ChalkDiagramData {
  diagram_type?: 'box_flow' | 'glacier' | 'ascii' | 'svg' | 'architecture';
  title?: string;
  ascii?: string;
  nodes?: Array<{ id: string; label: string; subtext?: string }>;
  arrows?: Array<{ from?: string; to?: string; label?: string; direction?: 'down' | 'up' | 'right' | 'left' }>;
  svgMarkup?: string;
}

export interface ChalkGraphData {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  curveType?: 'linear' | 'quadratic' | 'exponential' | 'sigmoid' | 'glacier_gradient';
  points?: Array<{ x: number; y: number }>;
  annotations?: Array<{ text: string; x: number; y: number; color?: string }>;
}

export interface MathParameterDefinition {
  symbol: string;
  meaning: string;
  unit?: string;
  category?: 'constant' | 'variable' | 'parameter' | 'operator';
}

export interface ChalkSection {
  id: string;
  title?: string;
  subtitle?: string;
  notes?: string[];
  latexFormula?: string | null;
  formulaLabel?: string | null;
  whereDefinitions?: MathParameterDefinition[] | null;
  diagram?: ChalkDiagramData | null;
  graph?: ChalkGraphData | null;
  boxData?: { label: string; subtext?: string; topAnnotation?: string; bottomAnnotation?: string } | null;
  arrayData?: {
    elements: any[];
    pointers: { low?: number; mid?: number; high?: number };
    dimmed?: number[];
  } | null;
  imageUrl?: string | null;
  imageCaption?: string | null;
  workedCalculation?: any | null;
  workedExample?: { title: string; location: string; observations: string[] } | null;
  isHighlighted?: boolean;
  highlightColor?: string | null;
  isErasing?: boolean;
  timestamp: number;
}

/**
 * The full resolved state of the blackboard at any point in time.
 * Built by the ScriptPlayer by applying blackboard actions sequentially.
 */
export interface BoardLiveState {
  /** Current lesson title / event title on the board */
  boardTitle: string;
  /** LaTeX formula currently displayed */
  latexFormula: string | null;
  /** Formula title or label */
  formulaLabel?: string | null;
  /** Structured 'where:' definitions for symbols */
  whereDefinitions?: MathParameterDefinition[] | null;
  /** Raw text note on the board (legacy slot) */
  chalkNote: string | null;
  /** Array visualization data */
  arrayData: {
    elements: any[];
    pointers: { low?: number; mid?: number; high?: number };
    dimmed?: number[];
  } | null;
  /** Diagram / visual learning data */
  diagramData: Record<string, any> | null;
  /** Whether a pulse glow is active on the board */
  isPulsing: boolean;
  /** Color of the current highlight if any */
  highlightColor: string | null;
  /** Which event index is currently active */
  activeEventIndex: number;
  /** The speech text being spoken right now */
  currentSpeech: string;
  /** Avatar state */
  avatarState: TeacherState;
  /** Avatar gaze */
  avatarGaze: GazeDirection;
  /** Avatar gesture */
  avatarGesture: TeacherGesture;

  /**
   * REAL PROFESSOR'S BLACKBOARD:
   * Multi-section persistent board state.
   * Content accumulates across steps instead of being wiped like slides!
   */
  sections: ChalkSection[];
  activeSectionId?: string | null;
  erasingSectionId?: string | null;

  /**
   * VISUAL LEARNING AREA (Synchronized with Teaching Timeline):
   * Separate educational images and scientific data graphs.
   */
  currentVisualImage?: EducationalImageVisual | null;
  currentVisualGraph?: ScientificGraphVisual | null;
  currentVisualLearning?: EducationalVisualLearning | null;
}

