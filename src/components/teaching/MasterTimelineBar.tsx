/**
 * MasterTimelineBar — Unified Master Teaching Timeline Inspector & Scrubber
 * --------------------------------------------------------------------------
 * Visual representation of the ONE authoritative timeline driving:
 *   1. Narration
 *   2. Blackboard Actions
 *   3. Image Actions
 *   4. Graph Actions
 *   5. Avatar Actions
 *   6. Highlight Actions
 */

import React from 'react';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';
import {
  Radio,
  Sparkles,
  Volume2,
  Edit3,
  Image as ImageIcon,
  LineChart,
  UserCheck,
} from 'lucide-react';

const formatClockTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return '0:00';
  const totalSecs = Math.floor(sec);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const remainingSecs = totalSecs % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSecs.toString().padStart(2, '0')}`;
};

export const MasterTimelineBar: React.FC = () => {
  const master = useOptionalMasterClassroom();
  if (!master || !master.timeline) return null;

  const {
    currentTime,
    totalDuration,
    isPlaying,
    resolvedState,
    seekTo,
    timeline,
  } = master;

  const meta = (timeline.rawPlan?.metadata as any) || {};
  const targetDurationMin = meta.target_duration_minutes;
  const complexityTier = meta.complexity_tier;
  const studentLevel = meta.student_level;
  const isResearchScholar = Boolean(meta.is_research_mode || meta.teaching_mode === 'research_scholar' || complexityTier === 'research_scholar');


  const currentCue = timeline.cues
    .slice()
    .reverse()
    .find((c) => currentTime >= c.timeSec);

  // Active track indicators
  const isSpeaking = resolvedState?.narration?.isSpeaking;
  const activeSection = resolvedState?.blackboard?.activeSectionId || 'Title';
  const hasImage = resolvedState?.image?.visible;
  const graphStage = resolvedState?.graph?.stage || 'idle';
  const avatarGaze = resolvedState?.avatar?.gaze || 'CAMERA';
  const isPulsing = resolvedState?.highlight?.isPulsing;

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '1420px',
        margin: '0 auto',
        padding: '10px 16px',
        borderRadius: '14px',
        background: 'rgba(8, 12, 22, 0.94)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Top Row: Track Indicators & Master Clock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Left: Master Timeline Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              color: '#a5b4fc',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Radio size={12} className={isPlaying ? 'animate-pulse' : ''} color="#818cf8" />
            <span>Master Teaching Timeline</span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
            {currentCue?.description || 'Classroom timeline synchronized'}
          </span>
        </div>

        {/* Right: 6-Track Status Pill Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Track 1: Narration */}
          <div
            title="Narration Track"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: isSpeaking ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: isSpeaking ? '#38bdf8' : '#64748b',
              border: `1px solid ${isSpeaking ? 'rgba(56, 189, 248, 0.5)' : 'transparent'}`,
            }}
          >
            <Volume2 size={11} />
            <span>Narration</span>
          </div>

          {/* Track 2: Blackboard */}
          <div
            title={`Blackboard: ${activeSection}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(253, 224, 71, 0.15)',
              color: '#fde047',
              border: '1px solid rgba(253, 224, 71, 0.4)',
            }}
          >
            <Edit3 size={11} />
            <span>Chalkboard</span>
          </div>

          {/* Track 3: Image */}
          <div
            title="Image Track"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: hasImage ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: hasImage ? '#c084fc' : '#64748b',
              border: `1px solid ${hasImage ? 'rgba(192, 132, 252, 0.5)' : 'transparent'}`,
            }}
          >
            <ImageIcon size={11} />
            <span>Visual</span>
          </div>

          {/* Track 4: Graph */}
          <div
            title={`Graph Track (Stage: ${graphStage})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: graphStage !== 'idle' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: graphStage !== 'idle' ? '#4ade80' : '#64748b',
              border: `1px solid ${graphStage !== 'idle' ? 'rgba(34, 197, 94, 0.5)' : 'transparent'}`,
            }}
          >
            <LineChart size={11} />
            <span>Graph: {graphStage}</span>
          </div>

          {/* Track 5: Avatar */}
          <div
            title={`Avatar Gaze: ${avatarGaze}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.16)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            }}
          >
            <UserCheck size={11} />
            <span>Avatar {avatarGaze === 'TOWARDS_BOARD' ? '→ Board' : '• Center'}</span>
          </div>

          {/* Track 6: Highlight Pulse */}
          {isPulsing && (
            <div
              title="Highlight Pulse Active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.2)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.5)',
              }}
            >
              <Sparkles size={11} className="animate-spin" />
              <span>Spotlight</span>
            </div>
          )}

          {/* Dynamic Planned Duration & Complexity Tier Badge */}
          {targetDurationMin && (
            <div
              title={`Planned Dynamic Duration: ${targetDurationMin} minutes for ${studentLevel || 'Academic'} Level`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: isResearchScholar ? 'rgba(56, 189, 248, 0.18)' : 'rgba(168, 85, 247, 0.16)',
                color: isResearchScholar ? '#38bdf8' : '#c084fc',
                border: isResearchScholar ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(168, 85, 247, 0.45)',
              }}
            >
              <span>Planned: {targetDurationMin}m</span>
              {complexityTier && (
                <span style={{ color: isResearchScholar ? '#bae6fd' : '#e9d5ff', opacity: 0.85 }}>
                  • {complexityTier.replace(/_/g, ' ').toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* Research Scholar Supervisor Badge */}
          {isResearchScholar && (
            <div
              title={`University Research Supervisor Colloquium: ${meta.supervisor_persona || 'Mentoring PhD Candidate'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25))',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.6)',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
              }}
            >
              <span>🔬 RESEARCH SUPERVISOR</span>
              <span style={{ color: '#bae6fd', opacity: 0.85 }}>• DOCTORAL RIGOR</span>
            </div>
          )}

          {/* Master Clock */}
          <div
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#38bdf8',
              marginLeft: '4px',
              background: 'rgba(56, 189, 248, 0.12)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{formatClockTime(currentTime)}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>{formatClockTime(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Continuous Multi-Track Scrubber with Cue Milestones */}
      <div style={{ position: 'relative', width: '100%', height: '22px', display: 'flex', alignItems: 'center' }}>
        {/* Background Track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.12)',
          }}
        />

        {/* Filled Progress Track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)',
            transition: isPlaying ? 'none' : 'width 0.1s ease',
          }}
        />

        {/* Milestone Cue Pins on Timeline */}
        {timeline.cues.map((cue) => {
          const leftPercent = totalDuration > 0 ? (cue.timeSec / totalDuration) * 100 : 0;
          const isPassed = currentTime >= cue.timeSec;

          return (
            <div
              key={cue.id}
              onClick={() => seekTo(cue.timeSec)}
              title={`${cue.timeSec}s: ${cue.description}`}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isPassed ? '#38bdf8' : 'rgba(255, 255, 255, 0.3)',
                border: '1.5px solid #0f172a',
                cursor: 'pointer',
                zIndex: 4,
                boxShadow: isPassed ? '0 0 6px #38bdf8' : 'none',
              }}
            />
          );
        })}

        {/* Interactive Scrub Range Input */}
        <input
          type="range"
          min="0"
          max={totalDuration || 42}
          step="0.1"
          value={currentTime}
          onChange={(e) => seekTo(parseFloat(e.target.value))}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10,
            margin: 0,
          }}
        />
      </div>
    </div>
  );
};
