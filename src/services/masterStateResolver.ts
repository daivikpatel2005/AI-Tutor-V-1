/**
 * Master State Resolver
 * -------------------------------------------------------------
 * Pure deterministic state calculator for the Master Teaching Timeline.
 * Given any time T (in seconds), evaluates all 6 tracks and returns
 * the exact instantaneous classroom snapshot.
 */

import type { MasterTimeline, ResolvedMasterClassroomState } from '../types/masterTimeline';
import type {
  BoardLiveState,
  ChalkSection,
  TeacherState,
  GazeDirection,
  TeacherGesture,
  EducationalImageVisual,
  ScientificGraphVisual,
} from '../types/script5';

export function resolveMasterStateAt(
  timeline: MasterTimeline,
  timeSec: number
): ResolvedMasterClassroomState {
  const clampedTime = Math.max(0, Math.min(timeSec, timeline.totalDurationSec));

  // 1. Locate active event boundary
  const activeBoundary =
    timeline.eventBoundaries.find(b => clampedTime >= b.startSec && clampedTime <= b.endSec) ||
    timeline.eventBoundaries[timeline.eventBoundaries.length - 1] ||
    null;

  const activeEventIndex = activeBoundary ? activeBoundary.eventIndex : 0;
  const progressInEvent = activeBoundary && activeBoundary.durationSec > 0
    ? Math.min(1.0, Math.max(0, (clampedTime - activeBoundary.startSec) / activeBoundary.durationSec))
    : 0;

  // 2. Filter cues that have fired up to clampedTime
  const pastCues = timeline.cues.filter(c => c.timeSec <= clampedTime);

  // --- Narration Track ---
  let speechText = activeBoundary ? activeBoundary.speechText : '';
  let audioUrl: string | null = null;
  let audioBase64: string | null = null;
  const narrationCues = pastCues.filter(c => c.track === 'narration');
  if (narrationCues.length > 0) {
    const latestNarration = narrationCues[narrationCues.length - 1];
    speechText = latestNarration.payload?.text || speechText;
    audioUrl = latestNarration.payload?.speechFrame?.audio_url || null;
    audioBase64 = latestNarration.payload?.speechFrame?.audio_base64 || null;
  }

  // --- Avatar Track ---
  let avatarState: TeacherState = 'SPEAKING';
  let avatarGaze: GazeDirection = 'CAMERA';
  let avatarGesture: TeacherGesture = 'OPEN_PALM';
  const avatarCues = pastCues.filter(c => c.track === 'avatar');
  for (const c of avatarCues) {
    if (c.payload?.state) avatarState = c.payload.state;
    if (c.payload?.gaze) avatarGaze = c.payload.gaze;
    if (c.payload?.gesture) avatarGesture = c.payload.gesture;
  }

  // --- Blackboard Track ---
  let boardTitle = timeline.title;
  let activeSectionId: string | null = null;
  let erasingSectionId: string | null = null;
  let latestAction: any = null;
  let chalkNote: string | null = null;
  let latexFormula: string | null = null;
  const sectionsMap = new Map<string, ChalkSection>();

  const getOrCreateSection = (id: string, defaultTitle?: string): ChalkSection => {
    let sec = sectionsMap.get(id);
    if (!sec) {
      sec = {
        id,
        title: defaultTitle || '',
        notes: [],
        timestamp: Date.now(),
      };
      sectionsMap.set(id, sec);
    }
    return sec;
  };

  const blackboardCues = pastCues.filter(c => c.track === 'blackboard');
  for (const c of blackboardCues) {
    latestAction = { action_type: c.action.toUpperCase(), payload: c.payload, target_id: c.targetId };
    const secId = c.targetId || `sec_${c.eventIndex}`;

    switch (c.action) {
      case 'write_title': {
        const title = c.payload?.title || boardTitle;
        boardTitle = title;
        const sec = getOrCreateSection(secId, title);
        sec.title = title;
        activeSectionId = secId;
        break;
      }
      case 'write_text': {
        const txt = c.payload?.text;
        chalkNote = txt || null;
        if (txt) {
          const sec = getOrCreateSection(secId);
          sec.notes = [...(sec.notes || [])];
          if (!sec.notes.includes(txt)) {
            sec.notes.push(txt);
          }
          activeSectionId = secId;
        }
        break;
      }
      case 'write_latex': {
        const formula = c.payload?.latex || null;
        const label = c.payload?.label || null;
        const where = c.payload?.where || c.payload?.whereDefinitions || null;
        latexFormula = formula;
        if (formula) {
          const sec = getOrCreateSection(secId);
          sec.latexFormula = formula;
          sec.formulaLabel = label;
          sec.whereDefinitions = where;
          activeSectionId = secId;
        }
        break;
      }
      case 'draw_box': {
        const sec = getOrCreateSection(secId);
        sec.boxData = {
          label: c.payload?.label || 'NODE',
          subtext: c.payload?.subtext,
          topAnnotation: c.payload?.topAnnotation,
          bottomAnnotation: c.payload?.bottomAnnotation,
        };
        activeSectionId = secId;
        break;
      }
      case 'draw_array': {
        const sec = getOrCreateSection(secId);
        sec.arrayData = {
          elements: c.payload?.elements || [],
          pointers: c.payload?.pointers || {},
          dimmed: c.payload?.dimmed || [],
        };
        activeSectionId = secId;
        break;
      }
      case 'draw_arrow': {
        const sec = getOrCreateSection(secId);
        if (!sec.diagram) sec.diagram = {};
        sec.diagram.arrows = [...(sec.diagram.arrows || []), c.payload];
        break;
      }
      case 'draw_diagram': {
        const sec = getOrCreateSection(secId);
        sec.diagram = { ...(sec.diagram || {}), ...c.payload };
        break;
      }
      case 'highlight_element': {
        const sec = getOrCreateSection(secId);
        sec.isHighlighted = true;
        sec.highlightColor = c.payload?.color || '#fde047';
        break;
      }
      case 'erase_element': {
        const sec = sectionsMap.get(secId);
        if (sec) {
          sec.notes = [];
          sec.latexFormula = null;
          sec.boxData = null;
        }
        break;
      }
      case 'clear_section': {
        sectionsMap.delete(secId);
        break;
      }
      case 'clear_board': {
        sectionsMap.clear();
        chalkNote = null;
        latexFormula = null;
        break;
      }
    }
  }

  // --- Image Track ---
  let imageVisible = false;
  let activeImageData: EducationalImageVisual | null = null;
  let activeImageId: string | null = null;
  const activeImagesMap = new Map<string, EducationalImageVisual>();
  let highlightedElementIndex: number | null = null;

  const imageCues = pastCues.filter(c => c.track === 'image');
  for (const c of imageCues) {
    if (c.action === 'show_image') {
      imageVisible = true;
      if (c.payload?.image) {
        activeImageData = c.payload.image;
        const imgId = c.payload.image.id || c.targetId || `img_${activeImagesMap.size + 1}`;
        activeImageId = imgId;
        activeImagesMap.set(imgId, { ...c.payload.image, id: imgId });
      }
      if (c.payload?.images && Array.isArray(c.payload.images)) {
        for (const item of c.payload.images) {
          const itemId = item.id || `img_${activeImagesMap.size + 1}`;
          activeImagesMap.set(itemId, { ...item, id: itemId });
        }
      }
      if (c.payload?.highlightedElementIndex !== undefined) {
        highlightedElementIndex = c.payload.highlightedElementIndex;
      }
    } else if (c.action === 'highlight_element') {
      highlightedElementIndex = c.payload?.highlightedElementIndex ?? null;
    }
  }
  const activeImagesList = Array.from(activeImagesMap.values());

  // --- Graph Track ---
  let graphVisible = false;
  let activeGraphData: ScientificGraphVisual | null = null;
  let activeGraphId: string | null = null;
  const activeGraphsMap = new Map<string, ScientificGraphVisual>();
  let graphStage: 'axes_only' | 'plotting_curve' | 'highlighting_region' | 'moving_point' | 'complete' = 'axes_only';
  let trackedPointOverride: { x: number; y: number; label?: string } | null = null;

  const graphCues = pastCues.filter(c => c.track === 'graph');
  for (const c of graphCues) {
    if (c.action === 'show_graph') {
      graphVisible = true;
      if (c.payload?.graph) {
        activeGraphData = c.payload.graph;
        const gId = c.payload.graph.id || c.targetId || `graph_${activeGraphsMap.size + 1}`;
        activeGraphId = gId;
        activeGraphsMap.set(gId, { ...c.payload.graph, id: gId });
      }
      if (c.payload?.graphs && Array.isArray(c.payload.graphs)) {
        for (const g of c.payload.graphs) {
          const gId = g.id || `graph_${activeGraphsMap.size + 1}`;
          activeGraphsMap.set(gId, { ...g, id: gId });
        }
      }
      graphStage = c.payload?.stage || 'axes_only';
    } else if (c.action === 'plot_curve') {
      graphStage = 'plotting_curve';
    } else if (c.action === 'highlight_negative_region') {
      graphStage = 'highlighting_region';
    } else if (c.action === 'track_point') {
      graphStage = 'moving_point';
      if (c.payload?.trackedPoint) {
        trackedPointOverride = c.payload.trackedPoint;
      }
    }
  }
  const activeGraphsList = Array.from(activeGraphsMap.values());

  // --- Highlight Track ---
  // Active highlight is considered active if fired within the last 1.2 seconds
  let activeHighlightTarget: string | null = null;
  let pulseColor: string | null = null;
  let isPulsing = false;
  const recentHighlightCues = pastCues.filter(
    c => c.track === 'highlight' && clampedTime - c.timeSec <= 1.2
  );
  if (recentHighlightCues.length > 0) {
    const latest = recentHighlightCues[recentHighlightCues.length - 1];
    activeHighlightTarget = latest.targetId || null;
    pulseColor = latest.payload?.color || '#38bdf8';
    isPulsing = true;
  }

  // --- Pedagogy Track (12-Stage Real Professor Loop) ---
  let currentPhase: any = 'PROFESSOR_UNDERSTANDING';
  let pedagogicalIntent: string = 'Professor acknowledges question and grounds the lecture in physical conservation laws';
  let studentQuestionPrompt: string | null = 'Why do glaciers retreat rapidly even if it snows every winter?';
  let workedCalculation: any | null = null;
  let checkQuestion: any | null = null;

  for (const c of pastCues) {
    if (c.action === 'set_pedagogy_phase') {
      if (c.payload?.phase) currentPhase = c.payload.phase;
      if (c.payload?.intent) pedagogicalIntent = c.payload.intent;
      if (c.payload?.workedCalculation) {
        workedCalculation = c.payload.workedCalculation;
        const targetSec = sectionsMap.get(c.targetId || 'sec_calculation') || sectionsMap.get(activeSectionId || '');
        if (targetSec) {
          targetSec.workedCalculation = c.payload.workedCalculation;
        }
      }
      if (c.payload?.checkQuestion) checkQuestion = c.payload.checkQuestion;
      if (c.payload?.studentQuestionPrompt) studentQuestionPrompt = c.payload.studentQuestionPrompt;
    }
  }

  const phaseLabels: Record<string, string> = {
    STUDENT_QUESTION: '1. Student Question',
    PROFESSOR_UNDERSTANDING: '2. Professor Understanding',
    CONCEPT_EXPLANATION: '3. Intuitive Concept Explanation',
    BLACKBOARD_WRITING: '4. Blackboard Demonstration',
    POINTING_EXPLAINING: '5. Pointing & Mechanical Breakdown',
    VISUAL_REVEAL: '6. Real-World Scientific Visual',
    GRAPH_EXPLANATION: '7. Dynamic Coordinate Analysis',
    WORKED_EXAMPLE: '8. Field Observation & Example',
    FORMULA_WRITING: '9. Governing Physical Equation',
    DERIVATION_CALCULATION: '10. Step-by-Step Derivation',
    SUMMARY: '11. Synthesis & Core Principles',
    SOCRATIC_CHECK_QUESTION: '12. Professor Check Question',
  };

  const isCheckQuestionActive =
    currentPhase === 'SOCRATIC_CHECK_QUESTION' || (checkQuestion !== null && clampedTime >= 34.0);

  const sections = Array.from(sectionsMap.values()).map(sec => ({
    ...sec,
    isHighlighted: activeHighlightTarget === sec.id && isPulsing,
    highlightColor: activeHighlightTarget === sec.id ? pulseColor : null,
    workedCalculation: sec.workedCalculation || (sec.id === 'sec_calculation' ? workedCalculation : null),
  }));

  // 3. Construct legacy BoardLiveState mirror
  const boardLiveState: BoardLiveState = {
    boardTitle,
    latexFormula,
    chalkNote,
    arrayData: null,
    diagramData: null,
    isPulsing,
    highlightColor: pulseColor,
    activeEventIndex,
    currentSpeech: speechText,
    avatarState,
    avatarGaze,
    avatarGesture,
    sections,
    activeSectionId,
    erasingSectionId,
    currentVisualImage: imageVisible ? activeImageData : null,
    currentVisualGraph: graphVisible ? activeGraphData : null,
    currentVisualLearning: {
      image: imageVisible ? activeImageData : null,
      images: activeImagesList.length > 0 ? activeImagesList : (activeImageData ? [activeImageData] : []),
      activeImageId: activeImageId || (activeImageData?.id ?? undefined),
      graph: graphVisible ? activeGraphData : null,
      graphs: activeGraphsList.length > 0 ? activeGraphsList : (activeGraphData ? [activeGraphData] : []),
      activeGraphId: activeGraphId || (activeGraphData?.id ?? undefined),
      layout: activeGraphsList.length >= 2 ? 'two_column' : (activeGraphsList.length === 1 ? 'single' : 'none'),
      activeTarget: imageVisible && graphVisible ? 'both' : (graphVisible ? 'graph' : 'image'),
      conceptHeading: activeBoundary?.title || boardTitle,
    },
  };

  return {
    currentTimeSec: clampedTime,
    totalDurationSec: timeline.totalDurationSec,
    activeEventIndex,
    activeEventBoundary: activeBoundary,
    narration: {
      speechText,
      isSpeaking: avatarState === 'SPEAKING' || avatarState === 'EXPLAINING',
      audioUrl,
      audioBase64,
      progressInEvent,
    },
    blackboard: {
      boardTitle,
      sections,
      activeSectionId,
      erasingSectionId,
      latestAction,
      chalkNote,
      latexFormula,
    },
    image: {
      visible: imageVisible,
      data: activeImageData,
      activeImageId,
      images: activeImagesList,
      highlightedElementIndex,
    },
    graph: {
      visible: graphVisible,
      data: activeGraphData,
      activeGraphId,
      graphs: activeGraphsList,
      stage: graphStage,
      trackedPointOverride,
    },
    avatar: {
      state: avatarState,
      gaze: avatarGaze,
      gesture: avatarGesture,
      expression: 'FOCUSED_FRIENDLY',
    },
    highlight: {
      activeTarget: activeHighlightTarget,
      pulseColor,
      isPulsing,
    },
    pedagogy: {
      currentPhase,
      phaseLabel: phaseLabels[currentPhase] || 'Professor Teaching',
      pedagogicalIntent,
      studentQuestionPrompt,
      workedCalculation,
      checkQuestion,
      isCheckQuestionActive,
    },
    boardLiveState,
  };
}
