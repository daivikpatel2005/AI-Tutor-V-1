import React from 'react';
import { useTeaching } from '../../state/teachingStore';
import { Sparkles, Plus, Play, Flame, CheckCircle2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { student, openCreateModal, startOrContinueLesson, activeLesson } = useTeaching();

  return (
    <section style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        {/* Subtle pill tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#a5b4fc',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          letterSpacing: '0.01em'
        }}>
          <Sparkles size={14} />
          <span>Interactive 3D AI Digital Classroom</span>
        </div>

        {/* Welcome Headline */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          marginBottom: '1.25rem'
        }}>
          Master Any Subject with Your <br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Synchronized 3D AI Tutor
          </span>
        </h1>

        {/* Subtitle / Explanation */}
        <p style={{
          fontSize: '1.1rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          maxWidth: '660px',
          margin: '0 auto 2.25rem auto',
          fontWeight: 400
        }}>
          Experience cinematic lectures with live animated slides, real-time lip-synced 3D teacher, interactive whiteboard notes, and immediate doubt resolution.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.45)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Lesson
          </button>

          {activeLesson && (
            <button
              onClick={() => startOrContinueLesson(activeLesson.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '1px solid var(--border-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Play size={16} fill="currentColor" />
              Resume: {activeLesson.title.length > 25 ? activeLesson.title.slice(0, 25) + '...' : activeLesson.title}
            </button>
          )}
        </div>

        {/* Quick Student Stats Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} color="#f59e0b" />
            <span><strong style={{ color: 'var(--text-primary)' }}>{student.streakDays}-day</strong> learning streak</span>
          </div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-medium)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span><strong style={{ color: 'var(--text-primary)' }}>{student.totalLessonsCompleted}</strong> topics mastered</span>
          </div>
        </div>
      </div>
    </section>
  );
};
