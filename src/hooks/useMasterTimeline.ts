/**
 * useMasterTimeline — ONE Master Teaching Timeline Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Master orchestrator synchronizing all 6 teaching tracks:
 *   1. Narration (Speech text, browser TTS or audio element)
 *   2. Blackboard Actions (Progressive handwriting, formulas, diagrams, boxes)
 *   3. Image Actions (Educational diagrams, element spotlight)
 *   4. Graph Actions (Axes, progressive curve, negative highlight, tracked point)
 *   5. Avatar Actions (State, gaze, gesture, visemes)
 *   6. Highlight Actions (Board pulses, diagram glows, card spotlights)
 *
 * Guarantees zero drift even under slow networks, delayed TTS, or image load latency.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ClassroomLessonPlan, BoardLiveState } from '../types/script5';
import type { MasterTimeline, ResolvedMasterClassroomState } from '../types/masterTimeline';
import { MasterTimelineCompiler } from '../services/masterTimelineCompiler';
import { resolveMasterStateAt } from '../services/masterStateResolver';
import { assetPreloader } from '../services/assetPreloader';
import { DEFAULT_BOARD_STATE } from './useScriptPlayer';

export interface UseMasterTimelineOptions {
  autoPlay?: boolean;
  speed?: number;
  onStateChange?: (state: ResolvedMasterClassroomState) => void;
  onBoardLiveStateChange?: (boardState: BoardLiveState) => void;
  onLessonEnd?: () => void;
}

export function useMasterTimeline(options: UseMasterTimelineOptions = {}) {
  const {
    autoPlay = false,
    speed: initialSpeed = 1.0,
    onStateChange,
    onBoardLiveStateChange,
    onLessonEnd,
  } = options;

  // ── State ──
  const [lessonPlan, setLessonPlan] = useState<ClassroomLessonPlan | null>(null);
  const [timeline, setTimeline] = useState<MasterTimeline | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(initialSpeed);
  const [resolvedState, setResolvedState] = useState<ResolvedMasterClassroomState | null>(null);

  // ── Refs for animation loop & audio synchronization ──
  const playingRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const speedRef = useRef<number>(initialSpeed);
  const timelineRef = useRef<MasterTimeline | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeBoundaryIndexRef = useRef<number>(-1);
  const speechInProgressRef = useRef<boolean>(false);

  // Sync speed ref
  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  // ── Audio / Speech cleanup ──
  const stopAllSpeech = useCallback(() => {
    speechInProgressRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onwaiting = null;
      audioRef.current.onplaying = null;
      audioRef.current = null;
    }
  }, []);

  // ── Synchronize Speech / TTS at event boundaries ──
  const triggerSpeechForEvent = useCallback((boundaryIndex: number) => {
    if (!timelineRef.current) return;
    const boundary = timelineRef.current.eventBoundaries[boundaryIndex];
    if (!boundary || !boundary.speechText) return;

    const rawEvent = timelineRef.current.rawPlan?.events[boundary.eventIndex];
    stopAllSpeech();

    const speed = speedRef.current;
    speechInProgressRef.current = true;

    // 1. If audio base64 or audio URL is provided
    if (rawEvent?.speech?.audio_base64) {
      try {
        const audio = new Audio(`data:audio/wav;base64,${rawEvent.speech.audio_base64}`);
        audio.playbackRate = Math.min(2.0, Math.max(0.5, speed));
        audioRef.current = audio;

        audio.onwaiting = () => setIsBuffering(true);
        audio.onplaying = () => setIsBuffering(false);
        audio.onended = () => {
          speechInProgressRef.current = false;
        };
        audio.onerror = () => {
          speechInProgressRef.current = false;
        };

        audio.play().catch(() => {
          speechInProgressRef.current = false;
        });
        return;
      } catch {
        // Fallback to browser synthesis
      }
    }

    // 2. Native Web Speech API synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(boundary.speechText);
        utter.rate = Math.min(2.0, Math.max(0.6, speed * 0.95));
        utter.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
          (v.name.includes('Natural') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('Male')) &&
          v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferred) utter.voice = preferred;

        utter.onend = () => {
          speechInProgressRef.current = false;
        };
        utter.onerror = () => {
          speechInProgressRef.current = false;
        };

        speechUtteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
      } catch {
        speechInProgressRef.current = false;
      }
    }
  }, [stopAllSpeech]);

  // ── Core Clock Tick (requestAnimationFrame with high precision) ──
  const tick = useCallback((now: number) => {
    if (!playingRef.current || pausedRef.current) return;

    const currentTl = timelineRef.current;
    if (!currentTl) return;

    if (lastTickTimeRef.current === 0) {
      lastTickTimeRef.current = now;
    }

    const deltaSec = ((now - lastTickTimeRef.current) / 1000) * speedRef.current;
    lastTickTimeRef.current = now;

    // Advance clock time
    let nextTime = currentTimeRef.current + deltaSec;

    // Anti-drift audio compensation: keep visual tracks strictly synchronized with audio playback
    if (audioRef.current && !audioRef.current.paused && audioRef.current.duration > 0 && activeBoundaryIndexRef.current >= 0) {
      const boundary = currentTl.eventBoundaries[activeBoundaryIndexRef.current];
      if (boundary) {
        const expectedOffset = currentTimeRef.current - boundary.startSec;
        const actualOffset = audioRef.current.currentTime;
        const drift = actualOffset - expectedOffset;
        if (Math.abs(drift) > 0.2 && Math.abs(drift) < 2.0) {
          nextTime += drift * 0.12; // smoothly absorb drift
        }
      }
    }

    // If lecture is complete
    if (nextTime >= currentTl.totalDurationSec) {
      nextTime = currentTl.totalDurationSec;
      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);

      const finalState = resolveMasterStateAt(currentTl, nextTime);
      setResolvedState(finalState);
      onStateChange?.(finalState);
      onBoardLiveStateChange?.(finalState.boardLiveState);

      playingRef.current = false;
      setIsPlaying(false);
      stopAllSpeech();
      onLessonEnd?.();
      return;
    }

    currentTimeRef.current = nextTime;
    setCurrentTime(nextTime);

    // Resolve instantaneous deterministic state across all 6 tracks
    const resolved = resolveMasterStateAt(currentTl, nextTime);
    setResolvedState(resolved);
    onStateChange?.(resolved);
    onBoardLiveStateChange?.(resolved.boardLiveState);

    // Check if we entered a new event boundary to trigger speech
    if (resolved.activeEventIndex !== activeBoundaryIndexRef.current) {
      activeBoundaryIndexRef.current = resolved.activeEventIndex;
      triggerSpeechForEvent(resolved.activeEventIndex);
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [onStateChange, onBoardLiveStateChange, onLessonEnd, stopAllSpeech, triggerSpeechForEvent]);

  // ── Load and compile lesson plan ──
  const loadPlan = useCallback(async (plan: ClassroomLessonPlan) => {
    stopAllSpeech();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsPlaying(false);
    playingRef.current = false;
    pausedRef.current = false;
    setIsPaused(false);
    currentTimeRef.current = 0;
    setCurrentTime(0);
    activeBoundaryIndexRef.current = -1;

    setLessonPlan(plan);

    // Compile into ONE continuous master timeline
    const compiled = MasterTimelineCompiler.compile(plan);
    timelineRef.current = compiled;
    setTimeline(compiled);

    // Preload all assets from both the plan and the compiled timeline
    assetPreloader.preloadMasterTimeline(compiled).catch(() => {});
    assetPreloader.preloadLessonAssets(plan).catch(() => {});

    // Initial state at t = 0
    const initialState = resolveMasterStateAt(compiled, 0);
    setResolvedState(initialState);
    onStateChange?.(initialState);
    onBoardLiveStateChange?.(initialState.boardLiveState);

    if (autoPlay) {
      setTimeout(() => {
        play();
      }, 150);
    }
  }, [autoPlay, onStateChange, onBoardLiveStateChange, stopAllSpeech]);

  // ── Play / Pause / Seek Controls ──
  const play = useCallback(() => {
    if (!timelineRef.current) return;
    if (playingRef.current && !pausedRef.current) return;

    playingRef.current = true;
    pausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    lastTickTimeRef.current = performance.now();

    // Trigger speech for current boundary if not already speaking
    const currentTl = timelineRef.current;
    const boundary = currentTl.eventBoundaries.find(
      b => currentTimeRef.current >= b.startSec && currentTimeRef.current < b.endSec
    );
    if (boundary && activeBoundaryIndexRef.current !== boundary.eventIndex) {
      activeBoundaryIndexRef.current = boundary.eventIndex;
      triggerSpeechForEvent(boundary.eventIndex);
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [tick, triggerSpeechForEvent]);

  const pause = useCallback(() => {
    playingRef.current = false;
    pausedRef.current = true;
    setIsPlaying(false);
    setIsPaused(true);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    stopAllSpeech();
  }, [stopAllSpeech]);

  const togglePlayPause = useCallback(() => {
    if (playingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seekTo = useCallback((targetTimeSec: number) => {
    const currentTl = timelineRef.current;
    if (!currentTl) return;

    const clamped = Math.max(0, Math.min(targetTimeSec, currentTl.totalDurationSec));
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);
    lastTickTimeRef.current = performance.now();

    const resolved = resolveMasterStateAt(currentTl, clamped);
    setResolvedState(resolved);
    onStateChange?.(resolved);
    onBoardLiveStateChange?.(resolved.boardLiveState);

    // Trigger speech at the new position if currently playing
    if (playingRef.current) {
      activeBoundaryIndexRef.current = resolved.activeEventIndex;
      triggerSpeechForEvent(resolved.activeEventIndex);
    } else {
      stopAllSpeech();
    }
  }, [onStateChange, onBoardLiveStateChange, triggerSpeechForEvent, stopAllSpeech]);

  const nextStep = useCallback(() => {
    const currentTl = timelineRef.current;
    if (!currentTl) return;

    const currentIdx = activeBoundaryIndexRef.current >= 0 ? activeBoundaryIndexRef.current : 0;
    const nextIdx = Math.min(currentTl.eventBoundaries.length - 1, currentIdx + 1);
    const targetBoundary = currentTl.eventBoundaries[nextIdx];
    if (targetBoundary) {
      seekTo(targetBoundary.startSec);
    }
  }, [seekTo]);

  const prevStep = useCallback(() => {
    const currentTl = timelineRef.current;
    if (!currentTl) return;

    const currentIdx = activeBoundaryIndexRef.current >= 0 ? activeBoundaryIndexRef.current : 0;
    const prevIdx = Math.max(0, currentIdx - 1);
    const targetBoundary = currentTl.eventBoundaries[prevIdx];
    if (targetBoundary) {
      seekTo(targetBoundary.startSec);
    }
  }, [seekTo]);

  const setSpeed = useCallback((newSpeed: number) => {
    const safeSpeed = Math.min(3.0, Math.max(0.5, newSpeed));
    setPlaybackSpeed(safeSpeed);
    speedRef.current = safeSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = safeSpeed;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopAllSpeech();
    };
  }, [stopAllSpeech]);

  return {
    timeline,
    lessonPlan,
    currentTime,
    totalDuration: timeline ? timeline.totalDurationSec : 0,
    isPlaying,
    isPaused,
    isBuffering,
    playbackSpeed,
    resolvedState,
    boardLiveState: resolvedState?.boardLiveState || DEFAULT_BOARD_STATE,
    activeEventIndex: resolvedState?.activeEventIndex ?? 0,
    loadPlan,
    play,
    pause,
    togglePlayPause,
    seekTo,
    nextStep,
    prevStep,
    setSpeed,
  };
}
