import React from 'react';
import { useTeaching } from '../../state/teachingStore';
import { ArrowLeft, FileText, HelpCircle, GraduationCap } from 'lucide-react';

export const TeachingTopBar: React.FC = () => {
  const {
    navigateTo,
    activeLesson,
    currentSlideIndex,
    totalSlides,
    student,
    openNotesModal,
    openDoubt,
    openProfessorBoard,
    tutorState
  } = useTeaching();

  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'rgba(7, 8, 12, 0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 40
      }}
    >
      {/* Left: Navigation & Lesson Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => navigateTo('home')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>

        <div style={{ height: '18px', width: '1px', background: 'var(--border-subtle)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
              {activeLesson ? activeLesson.title : "Newton's Laws of Motion"}
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {activeLesson ? activeLesson.subject : 'PHYSICS'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Status & Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Tutor Live Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            background:
              tutorState === 'speaking'
                ? 'rgba(16, 185, 129, 0.12)'
                : tutorState === 'listening'
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${
              tutorState === 'speaking'
                ? 'rgba(16, 185, 129, 0.3)'
                : tutorState === 'listening'
                ? 'rgba(245, 158, 11, 0.3)'
                : 'rgba(99, 102, 241, 0.3)'
            }`,
            fontSize: '0.75rem',
            fontWeight: 600,
            color:
              tutorState === 'speaking'
                ? '#10b981'
                : tutorState === 'listening'
                ? '#f59e0b'
                : '#818cf8'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background:
                tutorState === 'speaking'
                  ? '#10b981'
                  : tutorState === 'listening'
                  ? '#f59e0b'
                  : '#818cf8',
              boxShadow: `0 0 8px currentColor`
            }}
          />
          <span>
            {tutorState === 'speaking'
              ? 'AI Tutor Lecturing'
              : tutorState === 'listening'
              ? 'AI Tutor Listening'
              : tutorState === 'paused'
              ? 'AI Tutor Paused'
              : 'AI Tutor Online'}
          </span>
        </div>

        {/* Slide Progress */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Slide</span>
          <strong style={{ color: '#ffffff' }}>{currentSlideIndex + 1}</strong>
          <span>of</span>
          <strong style={{ color: '#ffffff' }}>{totalSlides}</strong>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Professor Digital Board Button */}
        <button
          onClick={openProfessorBoard}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(56, 189, 248, 0.2) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
          }}
          title="Open Professor Digital Teaching Board with Visual Learning"
        >
          <GraduationCap size={16} />
          Professor Board
        </button>

        {/* Prominent Ask a Doubt Button */}
        <button
          onClick={openDoubt}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)'
          }}
          title="Pause lecture and ask AI tutor a question"
        >
          <HelpCircle size={15} />
          Ask a Doubt
        </button>

        {/* Study Notes Button */}
        <button
          onClick={() => openNotesModal(activeLesson?.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
          title="Open study notes & export PDF"
        >
          <FileText size={14} />
          Notes
        </button>

        {/* Student Avatar */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {student.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};
