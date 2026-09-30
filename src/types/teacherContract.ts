/**
 * Full JSON Response Contract for the Professor-Level Teacher Engine.
 * Matches backend `teacher_contract_serializer.py` and `teacher_engine_config.json`.
 */

export type SupportedVisualType =
  | 'diagram'
  | 'flowchart'
  | 'concept_map'
  | 'function_graph'
  | 'chart'
  | 'scientific_diagram'
  | 'architecture'
  | 'algorithm_visualization'
  | 'network_graph'
  | 'table'
  | 'educational_image'
  | 'step_by_step_visual';

export interface TeacherResponseData {
  title: string;
  short_answer: string;
  learning_objective: string;
  prerequisites: string[];
  intuition: string;
  explanation: string;
  deep_explanation: string;
  steps: string[];
  formulas: string[];
  derivation: string[];
  example: {
    problem?: string;
    given?: Record<string, any> | string[];
    steps?: string[];
    solution?: string;
    final_answer?: string;
    [key: string]: any;
  };
  applications: string[];
  common_mistakes: string[];
  advanced_perspective: string;
  research_perspective: string;
  summary: string;
  check_question: string;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphKeyPoint {
  label: string;
  x: number;
  y: number;
  type?: 'root' | 'extremum' | 'inflection' | string;
}

export interface VisualGraphData {
  equation?: string;
  x_range?: [number, number];
  points?: GraphPoint[];
  key_points?: GraphKeyPoint[];
  x_label?: string;
  y_label?: string;
  image_url?: string;
  [key: string]: any;
}

export interface ChartSeriesItem {
  label: string;
  value: number;
  color?: string;
}

export interface VisualChartData {
  chart_type?: 'bar' | 'line';
  title?: string;
  x_label?: string;
  y_label?: string;
  categories?: string[];
  values?: number[];
  series?: ChartSeriesItem[];
  [key: string]: any;
}

export interface DiagramNode {
  id: string;
  label: string;
  role?: string;
  type?: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  weight?: string | number;
  bidirectional?: boolean;
}

export interface VisualDiagramData {
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  connections?: Array<{ from: string; to: string; label?: string }>;
  headers?: string[];
  rows?: any[][];
  [key: string]: any;
}

export interface VisualStepItem {
  step: number;
  title?: string;
  description: string;
  state?: any;
  highlight?: string | number | number[];
  annotation?: string;
}

export interface VisualLearningData {
  required: boolean;
  visual_type: SupportedVisualType | string;
  title: string;
  description: string;
  purpose: string;
  elements: any[];
  steps: VisualStepItem[] | string[] | any[];
  diagram: VisualDiagramData;
  graph: VisualGraphData;
  graphs?: VisualGraphData[];
  multi_graph_layout?: 'none' | 'single' | 'two_column' | 'three_cards' | 'gallery';
  multi_graph_decision?: any;
  chart: VisualChartData;
  image_prompt: string;
  image_url?: string;
}

export interface TeachingMetadata {
  student_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research/PhD' | string;
  difficulty: 'Introductory' | 'Standard' | 'Advanced' | 'Rigorous' | string;
  topic: string;
  concepts: string[];
  estimated_learning_time: string;
}

export interface TeacherEngineContract {
  success: boolean;
  teacher_response: TeacherResponseData;
  visual_learning: VisualLearningData;
  sources: string[];
  teaching_metadata: TeachingMetadata;
}
