/**
 * useScriptPlayer — Synchronized Teaching Timeline Engine
 * ─────────────────────────────────────────────────────────────────────
 * Drives DigitalBlackboard with EXACT synchronization between:
 *   1. Teacher narration (speech text + TTS)
 *   2. Avatar state (SPEAKING / EXPLAINING / THINKING / WAITING)
 *   3. Blackboard writing (each action fires at its delay_ms offset)
 *   4. Progressive text reveal (typewriter timing built in)
 *   5. Images / diagrams (appear at their scheduled delay_ms)
 *   6. Graphs / arrays (fire at exact millisecond offsets)
 *
 * Timeline contract for every TeachingEvent:
 *   t = 0ms             → TTS starts + immediate blackboard actions
 *   t = action.delay_ms → each blackboard action fires with setTimeout
 *   t = speech_end      → advance to next event
 *
 * The key mechanism: BlackboardAction.delay_ms from script5 backend
 * tells us EXACTLY when each piece of content should appear on the board
 * relative to when the professor starts speaking that event.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  ClassroomLessonPlan,
  TeachingEvent,
  BlackboardAction,
  BoardLiveState,
  TeacherState,
  ChalkSection,
} from '../types/script5';

// ─── Default board state ──────────────────────────────────────────────────────

export const DEFAULT_BOARD_STATE: BoardLiveState = {
  boardTitle: '',
  latexFormula: null,
  chalkNote: null,
  arrayData: null,
  diagramData: null,
  isPulsing: false,
  highlightColor: null,
  activeEventIndex: -1,
  currentSpeech: '',
  avatarState: 'IDLE',
  avatarGaze: 'CAMERA',
  avatarGesture: 'OPEN_PALM',
  sections: [],
  activeSectionId: null,
  erasingSectionId: null,
  currentVisualImage: null,
  currentVisualGraph: null,
  currentVisualLearning: null,
};


// ─── Options ──────────────────────────────────────────────────────────────────

interface UseScriptPlayerOptions {
  /** Called when board state changes — use this to drive the avatar component */
  onStateChange?: (state: BoardLiveState) => void;
  /** Called when a new event's speech starts */
  onSpeechStart?: (text: string, eventIndex: number) => void;
  /** Called when a event's speech ends */
  onSpeechEnd?: (eventIndex: number) => void;
  /** Called when all events in the lesson are done */
  onLessonEnd?: () => void;
  /** Playback speed multiplier (default 1.0). Scales TTS rate AND action delays. */
  speed?: number;
}

// ─── Single action application — pure function ───────────────────────────────

/**
 * Applies a single BlackboardAction to the current BoardLiveState
 * and returns the updated state.
 * This is called both immediately (delay_ms=0) and via setTimeout.
 */
function applyAction(
  action: BlackboardAction,
  prev: BoardLiveState,
  eventIdx: number
): BoardLiveState {
  const next: BoardLiveState = { ...prev, isPulsing: false };
  let currentSections: ChalkSection[] = [...(prev.sections || [])];
  const sectionId = action.target_id || `sec_${eventIdx}`;

  // Helper to get or create section on the chalkboard
  const getOrCreateSection = (id: string, defaultTitle?: string): ChalkSection => {
    let sec = currentSections.find((s) => s.id === id);
    if (!sec) {
      sec = {
        id,
        title: defaultTitle || '',
        notes: [],
        timestamp: Date.now(),
      };
      currentSections.push(sec);
    }
    return sec;
  };

  switch (action.action_type) {
    case 'WRITE_TITLE': {
      const title = action.payload.title ?? prev.boardTitle;
      next.boardTitle = title;
      const sec = getOrCreateSection(sectionId, title);
      sec.title = title;
      next.activeSectionId = sectionId;
      break;
    }

    case 'WRITE_TEXT': {
      const text = action.payload.text;
      next.chalkNote = text ?? null;
      if (text) {
        const sec =
          currentSections.length > 0
            ? currentSections.find((s) => s.id === sectionId) ||
              currentSections[currentSections.length - 1]
            : getOrCreateSection(sectionId);
        sec.notes = [...(sec.notes || [])];
        if (!sec.notes.includes(text)) {
          sec.notes.push(text);
        }
        next.activeSectionId = sec.id;
      }
      break;
    }

    case 'WRITE_LATEX': {
      const latex = action.payload.latex ?? null;
      const label = action.payload.label ?? null;
      const where = action.payload.where ?? action.payload.whereDefinitions ?? null;
      next.latexFormula = latex;
      next.formulaLabel = label;
      next.whereDefinitions = where;
      if (label) {
        next.chalkNote = next.chalkNote ? next.chalkNote + '\n' + label : label;
      }
      if (latex) {
        const sec =
          currentSections.length > 0
            ? currentSections.find((s) => s.id === sectionId) ||
              currentSections[currentSections.length - 1]
            : getOrCreateSection(sectionId);
        sec.latexFormula = latex;
        sec.formulaLabel = label;
        sec.whereDefinitions = where;
        next.activeSectionId = sec.id;
      }
      break;
    }

    case 'DRAW_BOX': {
      const sec =
        currentSections.length > 0
          ? currentSections.find((s) => s.id === sectionId) ||
            currentSections[currentSections.length - 1]
          : getOrCreateSection(sectionId);
      sec.boxData = {
        label: action.payload.label || 'NODE',
        subtext: action.payload.subtext,
        topAnnotation: action.payload.topAnnotation,
        bottomAnnotation: action.payload.bottomAnnotation,
      };
      next.activeSectionId = sec.id;
      break;
    }

    case 'DRAW_ARRAY': {
      const arr = {
        elements: action.payload.elements ?? [],
        pointers: action.payload.pointers ?? {},
        dimmed: action.payload.dimmed ?? [],
      };
      next.arrayData = arr;
      const sec =
        currentSections.length > 0
          ? currentSections.find((s) => s.id === sectionId) ||
            currentSections[currentSections.length - 1]
          : getOrCreateSection(sectionId);
      sec.arrayData = arr;
      next.activeSectionId = sec.id;
      break;
    }

    case 'HIGHLIGHT_ELEMENT': {
      const color = action.payload.color ?? '#fde047';
      next.highlightColor = color;
      next.isPulsing = true;
      currentSections = currentSections.map((s) => {
        if (!action.target_id || s.id === action.target_id) {
          return { ...s, isHighlighted: true, highlightColor: color };
        }
        return s;
      });
      break;
    }

    case 'PULSE_ELEMENT': {
      next.isPulsing = true;
      next.highlightColor = action.payload.color ?? '#38bdf8';
      break;
    }

    case 'DRAW_DIAGRAM':
    case 'DRAW_GRAPH': {
      const imageUrl = action.payload.image_url;
      const spec = action.payload.spec;
      const diag = {
        image_url: imageUrl ?? null,
        caption: action.payload.caption ?? '',
        visual_type: action.payload.visual_type ?? 'diagram',
        spec: spec ?? null,
        ...(action.payload.visual_learning ?? {}),
        ...(action.payload.graph ?? {}),
      };
      next.diagramData = diag;
      const sec =
        currentSections.length > 0
          ? currentSections.find((s) => s.id === sectionId) ||
            currentSections[currentSections.length - 1]
          : getOrCreateSection(sectionId);
      if (imageUrl) {
        sec.imageUrl = imageUrl;
        sec.imageCaption = action.payload.caption ?? '';
      }
      if (action.action_type === 'DRAW_GRAPH' || action.payload.graph) {
        sec.graph = action.payload.graph || action.payload;
        // Also update separate Scientific Graph panel
        if (action.payload.graph_visual) {
          next.currentVisualGraph = action.payload.graph_visual;
        } else if (action.payload.title || action.payload.curveType) {
          next.currentVisualGraph = {
            title: action.payload.title || 'Scientific Data Graph',
            scientificPurpose: action.payload.scientificPurpose || action.payload.caption || 'Empirical scientific measurement.',
            xLabel: action.payload.xLabel || 'X Axis',
            yLabel: action.payload.yLabel || 'Y Axis',
            curveType: action.payload.curveType || 'glacier_gradient',
            dataPoints: action.payload.points || action.payload.dataPoints || [],
            threshold: action.payload.threshold,
            formula: action.payload.formula,
            unit: action.payload.unit,
            insights: action.payload.insights
          };
        }
      } else {
        sec.diagram = diag;
        // Also update separate Educational Images panel
        if (action.payload.image_visual) {
          next.currentVisualImage = action.payload.image_visual;
        } else if (imageUrl || action.payload.title) {
          next.currentVisualImage = {
            title: action.payload.title || action.payload.caption || 'Educational Illustration',
            imageUrl: imageUrl,
            svgMarkup: action.payload.svgMarkup,
            caption: action.payload.caption,
            educationalPurpose: action.payload.educationalPurpose || action.payload.caption || 'Pedagogical illustration for student comprehension.',
            keyElements: action.payload.keyElements,
            tags: action.payload.tags
          };
        }
      }
      next.activeSectionId = sec.id;
      break;
    }

    case 'DRAW_ARROW': {
      next.diagramData = { arrow: action.payload, ...next.diagramData };
      const sec =
        currentSections.length > 0
          ? currentSections.find((s) => s.id === sectionId) ||
            currentSections[currentSections.length - 1]
          : getOrCreateSection(sectionId);
      if (!sec.diagram) sec.diagram = {};
      sec.diagram.arrows = [...(sec.diagram.arrows || []), action.payload];
      break;
    }

    case 'CLEAR_SECTION': {
      const targetSecId = action.target_id || sectionId;
      next.erasingSectionId = targetSecId;
      currentSections = currentSections.filter((s) => s.id !== targetSecId);
      break;
    }

    case 'ERASE_ELEMENT': {
      const targetSecId = action.target_id || sectionId;
      currentSections = currentSections.map((s) => {
        if (s.id === targetSecId) {
          return { ...s, notes: [], latexFormula: null, boxData: null };
        }
        return s;
      });
      break;
    }

    case 'CLEAR_BOARD':
      return {
        ...DEFAULT_BOARD_STATE,
        boardTitle: next.boardTitle,
        activeEventIndex: eventIdx,
        currentSpeech: next.currentSpeech,
        avatarState: next.avatarState,
        avatarGaze: next.avatarGaze,
        avatarGesture: next.avatarGesture,
        sections: [],
      };

    default:
      break;
  }

  next.sections = currentSections;
  return next;
}

// ─── The Hook ─────────────────────────────────────────────────────────────────

export function useScriptPlayer(options: UseScriptPlayerOptions = {}) {
  const {
    onStateChange,
    onSpeechStart,
    onSpeechEnd,
    onLessonEnd,
    speed = 1.0,
  } = options;

  // ── State ──
  const [lessonPlan, setLessonPlan] = useState<ClassroomLessonPlan | null>(null);
  const [boardState, setBoardState] = useState<BoardLiveState>(DEFAULT_BOARD_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventIndex, setEventIndex] = useState(0);

  // ── Internal refs (never trigger re-render) ──
  const playingRef = useRef(false);
  const pausedRef = useRef(false);
  const eventIndexRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** All pending setTimeout handles for delayed blackboard actions */
  const actionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Pulse auto-clear timer */
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Callback ref so runFromIndex doesn't become stale */
  const onLessonEndRef = useRef(onLessonEnd);
  useEffect(() => { onLessonEndRef.current = onLessonEnd; }, [onLessonEnd]);

  // ── Cancel all pending action timers ──────────────────────────────────────

  const clearActionTimers = useCallback(() => {
    actionTimersRef.current.forEach(clearTimeout);
    actionTimersRef.current = [];
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
  }, []);

  // ── Cancel all speech ────────────────────────────────────────────────────

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // ── Schedule one blackboard action at its delay_ms offset ────────────────

  const scheduleAction = useCallback(
    (action: BlackboardAction, delayMs: number, eventIdx: number) => {
      const effectiveDelay = Math.max(0, delayMs / (speed || 1.0));

      const timerId = setTimeout(() => {
        if (!playingRef.current && !pausedRef.current) return;

        setBoardState((prev) => {
          const next = applyAction(action, prev, eventIdx);
          onStateChange?.(next);

          // Auto-clear pulse glow after animation
          if (action.action_type === 'PULSE_ELEMENT' || action.action_type === 'HIGHLIGHT_ELEMENT') {
            if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
            pulseTimerRef.current = setTimeout(() => {
              setBoardState((p) => {
                const cleared = { ...p, isPulsing: false };
                onStateChange?.(cleared);
                return cleared;
              });
            }, 900);
          }

          return next;
        });
      }, effectiveDelay);

      actionTimersRef.current.push(timerId);
    },
    [speed, onStateChange]
  );

  // ── Play a single TeachingEvent ──────────────────────────────────────────

  const playEvent = useCallback(
    (plan: ClassroomLessonPlan, idx: number, onComplete: () => void) => {
      if (idx >= plan.events.length) {
        setIsPlaying(false);
        playingRef.current = false;
        onLessonEndRef.current?.();
        return;
      }

      const event = plan.events[idx];
      const effectiveSpeed = speed || 1.0;

      // ── 1. Cancel previous step's pending actions ──
      clearActionTimers();

      // ── 2. Set avatar + speech immediately + synchronize visual learning ──
      setBoardState((prev) => {
        const next: BoardLiveState = {
          ...prev,
          activeEventIndex: idx,
          currentSpeech: event.speech.text,
          avatarState: event.avatar.state as TeacherState,
          avatarGaze: event.avatar.gaze,
          avatarGesture: event.avatar.gesture,
        };

        // Synchronize visual learning area with this teaching event
        if (event.visual_learning) {
          next.currentVisualLearning = event.visual_learning;
          if (event.visual_learning.image) {
            next.currentVisualImage = event.visual_learning.image;
          }
          if (event.visual_learning.graph) {
            next.currentVisualGraph = event.visual_learning.graph;
          }
        }

        onStateChange?.(next);
        return next;
      });

      setEventIndex(idx);
      eventIndexRef.current = idx;

      // ── 3. Schedule all blackboard actions with their delay_ms ──────────
      //
      // CRITICAL: This is where the synchronization happens.
      // action.delay_ms from script5 tells us exactly when during the speech
      // each piece of content should appear on the board.
      //
      // Example for "Glacier Mass Balance" lesson:
      //   delay_ms=0    → CLEAR_BOARD
      //   delay_ms=200  → WRITE_TITLE "Glacier Mass Balance"
      //   delay_ms=2200 → WRITE_LATEX "B = C - A"  ← appears as prof says it
      //   delay_ms=4800 → WRITE_TEXT "C = Accumulation, A = Ablation"
      //   delay_ms=7000 → DRAW_DIAGRAM (matplotlib image from VLE)
      //
      for (const action of (event.blackboard ?? [])) {
        scheduleAction(action, action.delay_ms ?? 0, idx);
      }

      // ── 4. Schedule visemes for lip-sync ─────────────────────────────────
      for (const v of (event.speech.visemes ?? [])) {
        const vTimer = setTimeout(() => {
          // Viseme state update for avatar mouth
          // (avatar component reads avatarGaze/avatarGesture already, visemes go directly)
        }, v.time_ms / effectiveSpeed);
        actionTimersRef.current.push(vTimer);
      }

      // ── 5. Start TTS / audio ─────────────────────────────────────────────
      onSpeechStart?.(event.speech.text, idx);

      const speechDone = () => {
        if (!playingRef.current) return;
        onSpeechEnd?.(idx);
        onComplete();
      };

      if (event.speech.audio_base64) {
        // Server-provided audio (WAV/MP3 base64)
        const audio = new Audio(`data:audio/wav;base64,${event.speech.audio_base64}`);
        audio.playbackRate = Math.min(2.0, Math.max(0.5, effectiveSpeed));
        audioRef.current = audio;
        audio.onended = speechDone;
        audio.onerror = speechDone;
        audio.play().catch(speechDone);
      } else if ('speechSynthesis' in window) {
        // Browser TTS fallback
        window.speechSynthesis.cancel(); // clear queue first
        const utter = new SpeechSynthesisUtterance(event.speech.text);
        utter.rate = Math.min(2.0, Math.max(0.5, effectiveSpeed));
        utter.pitch = 1.0;
        utter.volume = 1.0;
        utteranceRef.current = utter;

        utter.onend = speechDone;
        utter.onerror = () => {
          // Some browsers fire onerror on cancel() — only complete if still playing
          if (playingRef.current) speechDone();
        };
        window.speechSynthesis.speak(utter);
      } else {
        // Pure timer fallback using event's duration_ms from script5
        const durMs = (event.duration_ms ?? 5000) / effectiveSpeed;
        const fallbackTimer = setTimeout(speechDone, durMs);
        actionTimersRef.current.push(fallbackTimer);
      }
    },
    [speed, clearActionTimers, scheduleAction, onStateChange, onSpeechStart, onSpeechEnd]
  );

  // ── Sequential event runner ───────────────────────────────────────────────

  const runFromIndex = useCallback(
    (plan: ClassroomLessonPlan, startIdx: number) => {
      if (!playingRef.current) return;
      if (startIdx >= plan.events.length) {
        setIsPlaying(false);
        playingRef.current = false;
        onLessonEndRef.current?.();
        return;
      }

      playEvent(plan, startIdx, () => {
        if (!playingRef.current || pausedRef.current) return;
        runFromIndex(plan, startIdx + 1);
      });
    },
    [playEvent]
  );

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Load a ClassroomLessonPlan from script5 and start playing immediately.
   * This is the main entry point — called after generateLessonTimeline().
   */
  const loadAndPlay = useCallback(
    (plan: ClassroomLessonPlan) => {
      // Stop everything first
      playingRef.current = false;
      pausedRef.current = false;
      clearActionTimers();
      stopSpeech();

      setLessonPlan(plan);
      setEventIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);

      // Reset board to show lesson title
      const initialState: BoardLiveState = {
        ...DEFAULT_BOARD_STATE,
        boardTitle: plan.title,
      };
      setBoardState(initialState);
      onStateChange?.(initialState);

      playingRef.current = true;
      pausedRef.current = false;
      eventIndexRef.current = 0;

      // Brief delay to let React render before starting playback
      setTimeout(() => {
        if (playingRef.current) runFromIndex(plan, 0);
      }, 120);
    },
    [clearActionTimers, stopSpeech, onStateChange, runFromIndex]
  );

  /**
   * Inject doubt-resolution events from script5 into the board.
   * Main lesson is paused; when doubt events finish, `onDone` is called.
   */
  const playDoubtEvents = useCallback(
    (events: TeachingEvent[], onDone?: () => void) => {
      if (!events.length) { onDone?.(); return; }

      const tempPlan: ClassroomLessonPlan = {
        lesson_id: 'doubt_resolution',
        title: 'Doubt Resolution',
        topic: '',
        teacher_name: 'Prof.',
        total_duration_ms: events.reduce((s, e) => s + e.duration_ms, 0),
        events,
        metadata: {},
      };

      const wasPlaying = playingRef.current;
      clearActionTimers();
      stopSpeech();
      playingRef.current = true;

      let dIdx = 0;
      const nextDoubt = () => {
        if (!playingRef.current || dIdx >= events.length) {
          playingRef.current = wasPlaying;
          onDone?.();
          return;
        }
        playEvent(tempPlan, dIdx, () => {
          dIdx++;
          nextDoubt();
        });
      };
      nextDoubt();
    },
    [clearActionTimers, stopSpeech, playEvent]
  );

  /** Pause: stop speech, keep timer refs, remember position */
  const pause = useCallback(() => {
    if (!playingRef.current) return;
    pausedRef.current = true;
    setIsPaused(true);
    clearActionTimers();
    stopSpeech();
    setBoardState((prev) => {
      const next = { ...prev, avatarState: 'WAITING' as TeacherState };
      onStateChange?.(next);
      return next;
    });
  }, [clearActionTimers, stopSpeech, onStateChange]);

  /** Resume from the current event index */
  const resume = useCallback(() => {
    if (!lessonPlan) return;
    pausedRef.current = false;
    playingRef.current = true;
    setIsPaused(false);
    runFromIndex(lessonPlan, eventIndexRef.current);
  }, [lessonPlan, runFromIndex]);

  /** Jump to a specific event index and resume playback from there */
  const seekTo = useCallback(
    (idx: number) => {
      if (!lessonPlan) return;
      clearActionTimers();
      stopSpeech();
      eventIndexRef.current = idx;
      setEventIndex(idx);
      playingRef.current = true;
      pausedRef.current = false;
      setIsPlaying(true);
      setIsPaused(false);
      runFromIndex(lessonPlan, idx);
    },
    [lessonPlan, clearActionTimers, stopSpeech, runFromIndex]
  );

  /** Full stop — board resets */
  const stop = useCallback(() => {
    playingRef.current = false;
    pausedRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    clearActionTimers();
    stopSpeech();
    const reset = { ...DEFAULT_BOARD_STATE };
    setBoardState(reset);
    onStateChange?.(reset);
  }, [clearActionTimers, stopSpeech, onStateChange]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      playingRef.current = false;
      clearActionTimers();
      stopSpeech();
    };
  }, [clearActionTimers, stopSpeech]);

  return {
    // State
    lessonPlan,
    boardState,
    isPlaying,
    isPaused,
    isLoading,
    error,
    eventIndex,

    // Setters (for loading state management in DigitalBlackboard)
    setLessonPlan,
    setIsLoading,
    setError,

    // Playback controls
    loadAndPlay,
    playDoubtEvents,
    pause,
    resume,
    seekTo,
    stop,
  };
}
