/**
 * Master Classroom Context
 * -------------------------------------------------------------
 * Provides ONE authoritative master teaching timeline across the entire classroom.
 * Synchronizes:
 *   1. Narration (Speech text, TTS, and audio playback)
 *   2. Blackboard Actions (Progressive writing, formulas, diagrams, boxes)
 *   3. Image Actions (Educational diagrams, element spotlight)
 *   4. Graph Actions (Axes, progressive curve, negative highlight, tracked point)
 *   5. Avatar Actions (State, gaze, gesture, visemes)
 *   6. Highlight Actions (Board pulses, diagram glows, card spotlights)
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ClassroomLessonPlan, BoardLiveState } from '../types/script5';
import type { MasterTimeline, ResolvedMasterClassroomState } from '../types/masterTimeline';
import { useMasterTimeline } from '../hooks/useMasterTimeline';
import { generateLessonTimeline } from '../services/script5Service';
import { DEFAULT_BOARD_STATE } from '../hooks/useScriptPlayer';

export interface MasterClassroomContextType {
  timeline: MasterTimeline | null;
  lessonPlan: ClassroomLessonPlan | null;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  playbackSpeed: number;
  resolvedState: ResolvedMasterClassroomState | null;
  boardLiveState: BoardLiveState;
  activeEventIndex: number;
  isLoading: boolean;
  error: string | null;

  // Controls
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (timeSec: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSpeed: (speed: number) => void;
  loadLessonByTopic: (
    topic: string,
    level?: string,
    attachedPdfPath?: string,
    attachedPdfName?: string,
    sessionId?: string
  ) => Promise<void>;
  loadPlan: (plan: ClassroomLessonPlan) => Promise<void>;
}

const MasterClassroomContext = createContext<MasterClassroomContextType | null>(null);

export const MasterClassroomProvider: React.FC<{
  initialTopic?: string;
  initialLevel?: string;
  children: React.ReactNode;
}> = ({ initialTopic = 'Glacier Mass Balance', initialLevel = 'Undergraduate', children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const master = useMasterTimeline({
    autoPlay: false,
    speed: 1.0,
  });

  const loadLessonByTopic = useCallback(
    async (
      topic: string,
      level: string = 'Undergraduate',
      attachedPdfPath?: string,
      attachedPdfName?: string,
      sessionId?: string
    ) => {
      if (!topic.trim()) return;
      setIsLoading(true);
      setError(null);

      try {
        const plan = await generateLessonTimeline(topic.trim(), level, attachedPdfPath, attachedPdfName, sessionId);
        await master.loadPlan(plan);
      } catch (err: any) {
        setError(err.message || 'Failed to load lesson from script5 backend');
      } finally {
        setIsLoading(false);
      }
    },
    [master]
  );

  // Auto-load initial topic on mount
  useEffect(() => {
    if (initialTopic) {
      loadLessonByTopic(initialTopic, initialLevel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: MasterClassroomContextType = {
    timeline: master.timeline,
    lessonPlan: master.lessonPlan,
    currentTime: master.currentTime,
    totalDuration: master.totalDuration,
    isPlaying: master.isPlaying,
    isPaused: master.isPaused,
    isBuffering: master.isBuffering,
    playbackSpeed: master.playbackSpeed,
    resolvedState: master.resolvedState,
    boardLiveState: master.boardLiveState || DEFAULT_BOARD_STATE,
    activeEventIndex: master.activeEventIndex,
    isLoading,
    error,

    play: master.play,
    pause: master.pause,
    togglePlayPause: master.togglePlayPause,
    seekTo: master.seekTo,
    nextStep: master.nextStep,
    prevStep: master.prevStep,
    setSpeed: master.setSpeed,
    loadLessonByTopic,
    loadPlan: master.loadPlan,
  };

  return (
    <MasterClassroomContext.Provider value={value}>
      {children}
    </MasterClassroomContext.Provider>
  );
};

export function useOptionalMasterClassroom(): MasterClassroomContextType | null {
  return useContext(MasterClassroomContext);
}

export function useMasterClassroom(): MasterClassroomContextType {
  const ctx = useContext(MasterClassroomContext);
  if (!ctx) {
    throw new Error('useMasterClassroom must be used within a MasterClassroomProvider');
  }
  return ctx;
}
