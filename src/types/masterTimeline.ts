/**
 * Master Teaching Timeline Types
 * -------------------------------------------------------------
 * ONE authoritative teaching timeline that orchestrates all 6 tracks:
 *   1. Narration (Speech text, TTS, and sentence segments)
 *   2. Blackboard Actions (Progressive chalk writing, latex, boxes, erase)
 *   3. Image Actions (Educational diagrams, key element spotlights)
 *   4. Graph Actions (Axes reveal, progressive curve plot, negative highlight, tracked point)
 *   5. Avatar Actions (State, gaze, gesture, and lip-sync visemes)
 *   6. Highlight Actions (Board section pulse, formula glow, card spotlight)
 */

import type {
  BoardLiveState,
  ChalkSection,
  TeacherState,
  GazeDirection,
  TeacherGesture,
  EducationalImageVisual,
  ScientificGraphVisual,
  BlackboardAction,
  ClassroomLessonPlan,
} from './script5';

export type MasterTrackType =
  | 'narration'
  | 'blackboard'
  | 'image'
  | 'graph'
  | 'avatar'
  | 'highlight';

export interface MasterTimelineCue {
  /** Unique cue identifier */
  id: string;
  /** Global continuous timeline timestamp in seconds */
  timeSec: number;
  /** Global continuous timeline timestamp in milliseconds */
  timeMs: number;
  /** Duration of this specific cue action in milliseconds (if applicable) */
  durationMs?: number;
  /** Which sub-system channel this cue belongs to */
  track: MasterTrackType;
  /** Specific action name */
  action: string;
  /** Parent event index in the teaching script (0-based) */
  eventIndex: number;
  /** Target container or element ID (e.g. 'sec_accumulation', 'formula_box', 'vle_graph') */
  targetId?: string;
  /** Action payload */
  payload: any;
  /** Human-readable description for scrubber tooltips and lecture transcript */
  description: string;
}

export interface MasterEventBoundary {
  eventIndex: number;
  eventId: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  speechText: string;
  title: string;
}

export interface MasterTimeline {
  lessonId: string;
  title: string;
  topic: string;
  totalDurationSec: number;
  totalDurationMs: number;
  cues: MasterTimelineCue[];
  eventBoundaries: MasterEventBoundary[];
  rawPlan: ClassroomLessonPlan;
}

/**
 * Resolved instantaneous classroom state at any timestamp T.
 * Everything across avatar, narration, blackboard, images, and graphs
 * is deterministically computed from this single state snapshot.
 */
export interface ResolvedMasterClassroomState {
  /** Current continuous timestamp in seconds */
  currentTimeSec: number;
  /** Total lesson duration in seconds */
  totalDurationSec: number;
  /** Active teaching step index (0-based) */
  activeEventIndex: number;
  /** Active event boundary */
  activeEventBoundary: MasterEventBoundary | null;

  // 1. Narration Track
  narration: {
    speechText: string;
    isSpeaking: boolean;
    audioUrl?: string | null;
    audioBase64?: string | null;
    progressInEvent: number; // 0.0 to 1.0
  };

  // 2. Blackboard Track
  blackboard: {
    boardTitle: string;
    sections: ChalkSection[];
    activeSectionId: string | null;
    erasingSectionId: string | null;
    latestAction?: BlackboardAction | null;
    chalkNote: string | null;
    latexFormula: string | null;
  };

  // 3. Image Track
  image: {
    visible: boolean;
    data: EducationalImageVisual | null;
    activeImageId?: string | null;
    images?: EducationalImageVisual[];
    highlightedElementIndex: number | null;
  };

  // 4. Graph Track
  graph: {
    visible: boolean;
    data: ScientificGraphVisual | null;
    activeGraphId?: string | null;
    graphs?: ScientificGraphVisual[];
    stage: 'axes_only' | 'plotting_curve' | 'highlighting_region' | 'moving_point' | 'complete';
    trackedPointOverride?: { x: number; y: number; label?: string } | null;
  };

  // 5. Avatar Track
  avatar: {
    state: TeacherState;
    gaze: GazeDirection;
    gesture: TeacherGesture;
    expression: string;
    currentViseme?: string;
  };

  // 6. Highlight Track
  highlight: {
    activeTarget: string | null;
    pulseColor: string | null;
    isPulsing: boolean;
  };

  // 7. Real Professor Pedagogical Loop
  pedagogy: {
    currentPhase: TeachingPhase;
    phaseLabel: string;
    pedagogicalIntent: string;
    studentQuestionPrompt?: string | null;
    workedCalculation?: WorkedCalculationData | null;
    checkQuestion?: SocraticCheckQuestion | null;
    isCheckQuestionActive: boolean;
  };

  // Legacy BoardLiveState compatibility mirror
  boardLiveState: BoardLiveState;
}

export type TeachingPhase =
  | 'STUDENT_QUESTION'        // Student asks question
  | 'PROFESSOR_UNDERSTANDING' // Professor reflects, frames problem conceptually
  | 'CONCEPT_EXPLANATION'     // Intuitive real-world analogy (e.g. bank account)
  | 'BLACKBOARD_WRITING'      // Writing on chalkboard
  | 'POINTING_EXPLAINING'     // Pointing to diagram box / physical flow
  | 'VISUAL_REVEAL'           // Scientific image appears at relevant moment
  | 'GRAPH_EXPLANATION'       // Temperature vs loss curve + negative region + point tracking
  | 'WORKED_EXAMPLE'          // Real-world example (Mer de Glace / Himalayan glaciers)
  | 'FORMULA_WRITING'         // Mathematical equation framed on board
  | 'DERIVATION_CALCULATION'  // Step-by-step arithmetic derivation on board
  | 'SUMMARY'                 // Core takeaway synthesis
  | 'SOCRATIC_CHECK_QUESTION';// Interactive check question to student

export interface WorkedCalculationStep {
  stepNumber: number;
  label: string;
  math: string;
  explanation: string;
  isResult?: boolean;
}

export interface WorkedCalculationData {
  title: string;
  governingEquation: string;
  steps: WorkedCalculationStep[];
  physicalConclusion: string;
}

export interface SocraticOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SocraticCheckQuestion {
  questionId: string;
  questionText: string;
  context: string;
  options: SocraticOption[];
  correctFeedback: string;
  incorrectFeedback: string;
}
