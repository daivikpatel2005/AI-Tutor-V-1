import React, { useState } from 'react';
import { useTeaching } from '../../../state/teachingStore';
import { useOptionalMasterClassroom } from '../../../context/MasterClassroomContext';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';

interface ClassroomHeaderProps {
  onOpenBooks: () => void;
  onOpenResearch?: () => void;
  onOpenNotes: () => void;
  onOpenSettings?: () => void;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  onOpenBooks,
  onOpenNotes
}) => {
  const {
    student,
    toggleFullscreen,
    currentSlideIndex,
    totalSlides,
    activeLesson
  } = useTeaching();

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const master = useOptionalMasterClassroom();
  const currentTime = master?.currentTime ?? 0;
  const totalDuration = master?.totalDuration ?? 38.0;
  const isPlaying = master?.isPlaying ?? false;
  const progressPct = Math.min(100, Math.max(0, (currentTime / (totalDuration || 1)) * 100));

  const topicTitle = master?.lessonPlan?.topic || activeLesson?.title || 'Glacier Mass Balance & Cryospheric Dynamics';
  const topicSubject = activeLesson?.subject || 'PHYSICAL GLACIOLOGY';

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header
      style={{
        height: '62px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(90deg, rgba(6, 9, 18, 0.98) 0%, rgba(10, 14, 26, 0.96) 50%, rgba(6, 9, 18, 0.98) 100%)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 50,
        position: 'sticky',
        top: 0,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* ── 1. LOGO & BRAND ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(79, 70, 229, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                AI PROFESSOR
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                CLASSROOM
              </span>
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
              Multimodal Socratic Teaching System
            </div>
          </div>
        </div>

        <div style={{ height: '26px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* ── 2. TOPIC ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
              {topicTitle}
            </span>
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: '#a5b4fc',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}
            >
              {topicSubject}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Authoritative Lesson Plan &bull; 16:9 Digital Blackboard Lecture
          </span>
        </div>
      </div>

      {/* ── 3. SOURCES BADGE ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onOpenBooks}
          title="Inspect 55 Connected Research Textbooks & Papers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 12px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen size={13} />
          <span>55 Research Sources</span>
        </button>

        {/* ── 4. PROGRESS & TIMELINE ───────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '5px 12px',
            borderRadius: '20px'
          }}
        >
          {/* Play/Pause Mini Toggle */}
          <button
            onClick={() => (isPlaying ? master?.pause() : master?.play())}
            style={{
              background: 'transparent',
              border: 'none',
              color: isPlaying ? '#38bdf8' : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              padding: 0
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Time Clock */}
          <div
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#38bdf8'
            }}
          >
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>

          {/* Mini progress bar */}
          <div
            style={{
              width: '54px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                transition: 'width 0.2s linear'
              }}
            />
          </div>

          {/* Slide Progress */}
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Slide {currentSlideIndex + 1}/{totalSlides}
          </span>
        </div>

        {/* ── 5. SETTINGS & UTILITIES ──────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            title="Lecture Speed"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>

          {/* Study Notes */}
          <button
            onClick={onOpenNotes}
            title="Study Notes & PDF Export"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FileText size={13} />
            <span>Notes</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => toggleFullscreen()}
            title="Fullscreen Mode"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <Maximize2 size={14} />
          </button>

          {/* Student Profile Pill */}
          <div
            title={`Logged in as ${student.name}`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              marginLeft: '2px'
            }}
          >
            {student.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
