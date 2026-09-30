/**
 * TeachingCanvas — Script5-driven blackboard host
 * -------------------------------------------------
 * Wraps DigitalBlackboard and provides:
 * - TutorCanvas (3D avatar) reacting to boardState
 * - WhiteboardCanvas (freehand drawing overlay)
 * - WhiteboardToolbar (quick tools for the student)
 *
 * The DigitalBlackboard is the source of truth.
 * It loads its content from the script5 backend.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { DigitalBlackboard } from './blackboard/DigitalBlackboard';
import { TutorCanvas } from '../tutor/TutorCanvas';
import { WhiteboardCanvas } from '../whiteboard/WhiteboardCanvas';
import { WhiteboardToolbar } from '../whiteboard/WhiteboardToolbar';
import type { WhiteboardTool } from '../../types/whiteboard';
import type { BoardLiveState, ClassroomLessonPlan } from '../../types/script5';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';

interface TeachingCanvasProps {
  /** Optional pre-set topic to auto-load (from Create Lesson modal) */
  initialTopic?: string;
  /** Academic level */
  initialLevel?: string;
  /** Callback when blackboard state changes */
  onBoardStateChange?: (state: BoardLiveState) => void;
  /** Callback when active lesson plan changes */
  onLessonPlanChange?: (plan: ClassroomLessonPlan | null) => void;
}

export const TeachingCanvas: React.FC<TeachingCanvasProps> = ({
  initialTopic,
  initialLevel = 'Undergraduate',
  onBoardStateChange,
  onLessonPlanChange,
}) => {
  const master = useOptionalMasterClassroom();

  // Whiteboard drawing state
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('select');
  const [activeColor, setActiveColor] = useState<string>('#fbbf24');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Mirror boardState
  const [boardState, setBoardState] = useState<BoardLiveState | null>(null);

  const effectiveBoardState = master?.boardLiveState || boardState;

  useEffect(() => {
    if (master?.boardLiveState) {
      onBoardStateChange?.(master.boardLiveState);
    }
  }, [master?.boardLiveState, onBoardStateChange]);

  useEffect(() => {
    if (master?.lessonPlan) {
      onLessonPlanChange?.(master.lessonPlan);
    }
  }, [master?.lessonPlan, onLessonPlanChange]);

  const handleBoardStateChange = useCallback((state: BoardLiveState) => {
    setBoardState(state);
    onBoardStateChange?.(state);
  }, [onBoardStateChange]);

  // Map script5 TeacherState → TutorCanvas mood prop
  const tutorMood = (() => {
    if (!effectiveBoardState) return 'neutral';
    switch (effectiveBoardState.avatarState) {
      case 'SPEAKING':
      case 'EXPLAINING':
        return 'explaining';
      case 'WAITING':
        return 'neutral';
      case 'THINKING':
        return 'thoughtful';
      case 'DOUBT_ANSWERING':
        return 'encouraging';
      case 'LISTENING':
        return 'thoughtful';
      default:
        return 'neutral';
    }
  })();

  const avatarGaze = master?.resolvedState?.avatar?.gaze || effectiveBoardState?.avatarGaze || 'CAMERA';
  const avatarGesture = master?.resolvedState?.avatar?.gesture || effectiveBoardState?.avatarGesture || 'OPEN_PALM';

  return (
    <DigitalBlackboard
      initialTopic={initialTopic}
      initialLevel={initialLevel}
      onBoardStateChange={handleBoardStateChange}
      onLessonPlanChange={onLessonPlanChange}
      masterBoardState={master?.boardLiveState}
      masterLessonPlan={master?.lessonPlan}
      masterIsPlaying={master?.isPlaying}
      masterIsPaused={master?.isPaused}
      masterIsLoading={master?.isLoading}
      masterEventIndex={master?.activeEventIndex}
      onMasterPlay={master?.play}
      onMasterPause={master?.pause}
      onMasterNext={master?.nextStep}
      onMasterPrev={master?.prevStep}
      onMasterSeek={master?.seekTo}
      onMasterLoadTopic={master?.loadLessonByTopic}
    >
      {/* LAYER: 3D AI Tutor Avatar standing by the blackboard */}
      <div
        style={{
          position: 'absolute',
          bottom: '1%',
          right: '2%',
          width: '26%',
          height: '60%',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <TutorCanvas
          mood={tutorMood as any}
          gaze={avatarGaze}
          gesture={avatarGesture}
          isPlaying={master?.isPlaying}
          tutorState={master?.isPlaying ? 'speaking' : 'idle'}
        />
      </div>

      {/* LAYER: Freehand interactive drawing overlay on blackboard */}
      <WhiteboardCanvas
        activeTool={activeTool}
        activeColor={activeColor}
        strokeWidth={strokeWidth}
      />

      {/* Floating Whiteboard Quick Tools (Top-Right of Blackboard) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          zIndex: 30,
        }}
      >
        <WhiteboardToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
        />
      </div>
    </DigitalBlackboard>
  );
};
