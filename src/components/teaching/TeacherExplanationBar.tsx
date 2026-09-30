import React from 'react';
import { Volume2, Sparkles, Brain, Radio } from 'lucide-react';
import type { BoardLiveState, ClassroomLessonPlan } from '../../types/script5';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';

interface TeacherExplanationBarProps {
  boardState: BoardLiveState | null;
  lessonPlan: ClassroomLessonPlan | null;
}

export const TeacherExplanationBar: React.FC<TeacherExplanationBarProps> = ({
  boardState: propBoardState,
}) => {
  const master = useOptionalMasterClassroom();
  const boardState = master?.boardLiveState || propBoardState;

  const currentSpeech = master?.resolvedState?.narration?.speechText || boardState?.currentSpeech || 'The professor will begin speaking shortly...';

  const avatarState = master?.resolvedState?.avatar?.state || boardState?.avatarState || 'IDLE';
  const isSpeaking = master?.isPlaying || avatarState === 'SPEAKING' || avatarState === 'EXPLAINING';

  return (
    <section
      aria-label="Teacher Narration & Speech"
      className="glass-panel"
      style={{
        width: '100%',
        borderRadius: '16px',
        padding: '1.1rem 1.6rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(10, 15, 28, 0.96) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.28)',
        boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Meta Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Avatar / Speaking Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: isSpeaking ? 'rgba(56, 189, 248, 0.18)' : 'rgba(148, 163, 184, 0.12)',
              border: `1px solid ${isSpeaking ? 'rgba(56, 189, 248, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
              color: isSpeaking ? '#38bdf8' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {isSpeaking ? (
              <>
                <Radio size={13} className="animate-pulse" />
                <span>Prof. Arvind Sharma &bull; Speaking</span>
              </>
            ) : (
              <>
                <Brain size={13} />
                <span>Professor {avatarState.toLowerCase()}</span>
              </>
            )}
          </div>

          {/* Current Step Index & Pedagogical Phase */}
          {master?.resolvedState?.pedagogy?.phaseLabel && (
            <span
              style={{
                fontSize: '0.76rem',
                color: '#fde047',
                fontWeight: 700,
                background: 'rgba(253, 224, 71, 0.12)',
                border: '1px solid rgba(253, 224, 71, 0.3)',
                padding: '3px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>🎓</span>
              <span>{master.resolvedState.pedagogy.phaseLabel}</span>
            </span>
          )}

          {/* Avatar Gaze & Gesture Badge */}
          {master?.resolvedState?.avatar && (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#a5b4fc',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '3px 8px',
                borderRadius: '8px',
              }}
            >
              Gaze: {master.resolvedState.avatar.gaze === 'TOWARDS_BOARD' ? 'Towards Board 📐' : 'Facing Student 👁️'} &bull; {master.resolvedState.avatar.gesture.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Sync & Pedagogical Principle Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontWeight: 600,
            }}
          >
            Interactive Professor Mode &bull; Concept Explanation
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#10b981',
              fontWeight: 600,
            }}
          >
            <Sparkles size={13} />
            <span>Master Synchronized</span>
          </div>
        </div>
      </div>

      {/* Main Teacher Narration Text Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          padding: '2px 4px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(129, 140, 248, 0.25))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <Volume2 size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: '1.05rem',
              lineHeight: 1.55,
              color: '#f8fafc',
              fontWeight: 500,
              letterSpacing: '0.01em',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            &ldquo;{currentSpeech}&rdquo;
          </p>
        </div>

        {/* Dynamic Voice Bars indicator */}
        {isSpeaking && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '3px',
              height: '24px',
              paddingRight: '6px',
            }}
            title="Professor audio output active"
          >
            <span style={{ width: '3px', height: '18px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.7s infinite alternate' }} />
            <span style={{ width: '3px', height: '24px', background: '#818cf8', borderRadius: '2px', animation: 'pulse 0.9s infinite alternate 0.2s' }} />
            <span style={{ width: '3px', height: '14px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.6s infinite alternate 0.4s' }} />
            <span style={{ width: '3px', height: '20px', background: '#fde047', borderRadius: '2px', animation: 'pulse 0.8s infinite alternate 0.1s' }} />
          </div>
        )}
      </div>
    </section>
  );
};
