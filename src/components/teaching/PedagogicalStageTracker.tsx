import React from 'react';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';
import type { TeachingPhase } from '../../types/masterTimeline';
import {
  MessageSquare,
  Brain,
  Lightbulb,
  PenTool,
  Navigation,
  Image as ImageIcon,
  LineChart,
  Compass,
  FileCode,
  Calculator,
  ListChecks,
  HelpCircle,
} from 'lucide-react';

interface StageDef {
  phase: TeachingPhase;
  num: number;
  label: string;
  shortLabel: string;
  timeSec: number;
  icon: React.ReactNode;
}

const STAGES: StageDef[] = [
  { phase: 'STUDENT_QUESTION', num: 1, label: 'Student Asks Question', shortLabel: 'Question', timeSec: 0.0, icon: <MessageSquare size={13} /> },
  { phase: 'PROFESSOR_UNDERSTANDING', num: 2, label: 'Professor Understands Question', shortLabel: 'Understands', timeSec: 0.5, icon: <Brain size={13} /> },
  { phase: 'CONCEPT_EXPLANATION', num: 3, label: 'Professor Explains Concept', shortLabel: 'Explains', timeSec: 3.0, icon: <Lightbulb size={13} /> },
  { phase: 'BLACKBOARD_WRITING', num: 4, label: 'Professor Writes on Blackboard', shortLabel: 'Blackboard', timeSec: 4.0, icon: <PenTool size={13} /> },
  { phase: 'POINTING_EXPLAINING', num: 5, label: 'Professor Points / Explains', shortLabel: 'Points', timeSec: 10.0, icon: <Navigation size={13} /> },
  { phase: 'VISUAL_REVEAL', num: 6, label: 'Visual Appears Exactly on Cue', shortLabel: 'Visual', timeSec: 6.0, icon: <ImageIcon size={13} /> },
  { phase: 'GRAPH_EXPLANATION', num: 7, label: 'Graph is Explained & Animated', shortLabel: 'Graph', timeSec: 15.0, icon: <LineChart size={13} /> },
  { phase: 'WORKED_EXAMPLE', num: 8, label: 'Professor Gives Real-World Example', shortLabel: 'Example', timeSec: 22.0, icon: <Compass size={13} /> },
  { phase: 'FORMULA_WRITING', num: 9, label: 'Professor Writes Governing Formula', shortLabel: 'Formula', timeSec: 25.0, icon: <FileCode size={13} /> },
  { phase: 'DERIVATION_CALCULATION', num: 10, label: 'Professor Derives & Calculates', shortLabel: 'Derives', timeSec: 27.0, icon: <Calculator size={13} /> },
  { phase: 'SUMMARY', num: 11, label: 'Professor Summarizes Takeaways', shortLabel: 'Summary', timeSec: 31.0, icon: <ListChecks size={13} /> },
  { phase: 'SOCRATIC_CHECK_QUESTION', num: 12, label: 'Professor Asks Check Question', shortLabel: 'Check Q', timeSec: 34.0, icon: <HelpCircle size={13} /> },
];

export const PedagogicalStageTracker: React.FC = () => {
  const master = useOptionalMasterClassroom();
  const currentPhase = master?.resolvedState?.pedagogy?.currentPhase;
  const currentTimeSec = master?.currentTime ?? 0;

  // Determine current active stage index
  const activeStageIndex = STAGES.findIndex(s => s.phase === currentPhase);
  const currentStageDef = activeStageIndex >= 0 ? STAGES[activeStageIndex] : STAGES[0];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1420px',
        margin: '0 auto',
        padding: '0.65rem 1.15rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 28, 0.98) 100%)',
        border: '1px solid rgba(129, 140, 248, 0.25)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Title & Active Intent Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            12-STAGE PROFESSOR PEDAGOGY LOOP
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#fde047',
              background: 'rgba(253, 224, 71, 0.12)',
              border: '1px solid rgba(253, 224, 71, 0.3)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            Stage {currentStageDef.num} of 12: {currentStageDef.label}
          </span>
        </div>

        {/* Pedagogical Intent */}
        {master?.resolvedState?.pedagogy?.pedagogicalIntent && (
          <span
            style={{
              fontSize: '0.74rem',
              color: '#94a3b8',
              fontStyle: 'italic',
              maxWidth: '520px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={master.resolvedState.pedagogy.pedagogicalIntent}
          >
            &ldquo;{master.resolvedState.pedagogy.pedagogicalIntent}&rdquo;
          </span>
        )}
      </div>

      {/* 12 Horizontal Stage Nodes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '4px',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {STAGES.map((stage) => {
          const isActive = stage.phase === currentPhase;
          const isPassed = currentTimeSec >= stage.timeSec;

          return (
            <button
              key={stage.phase}
              onClick={() => master?.seekTo(stage.timeSec)}
              title={`${stage.num}. ${stage.label} (Click to jump to ${stage.timeSec}s)`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '5px 2px',
                borderRadius: '6px',
                background: isActive
                  ? 'rgba(99, 102, 241, 0.3)'
                  : isPassed
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.01)',
                border: isActive
                  ? '1px solid #818cf8'
                  : isPassed
                  ? '1px solid rgba(255, 255, 255, 0.12)'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: '60px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: isActive ? '#fde047' : isPassed ? '#818cf8' : '#64748b',
                }}
              >
                {stage.icon}
                <span style={{ fontSize: '0.66rem', fontWeight: 700 }}>{stage.num}</span>
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  color: isActive ? '#ffffff' : isPassed ? '#cbd5e1' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {stage.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
