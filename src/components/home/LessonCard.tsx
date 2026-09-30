import React from 'react';
import type { LessonHistoryItem } from '../../types/lesson';
import { useTeaching } from '../../state/teachingStore';
import { Play, Clock, Calendar, CheckCircle, FileText } from 'lucide-react';

interface LessonCardProps {
  lesson: LessonHistoryItem;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const { startOrContinueLesson, openNotesModal } = useTeaching();

  const isCompleted = lesson.progress >= 100;

  return (
    <div 
      className="glass-card"
      style={{
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Tag & Subject */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: '#a5b4fc',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {lesson.subject}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {lesson.lastAccessed}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          lineHeight: 1.35,
          marginBottom: '0.5rem'
        }}>
          {lesson.title}
        </h3>

        {/* Description snippet */}
        {lesson.description && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {lesson.description}
          </p>
        )}
      </div>

      {/* Progress & Meta Footer */}
      <div>
        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>{isCompleted ? 'Completed' : `${lesson.completedSlides}/${lesson.totalSlides} slides`}</span>
            <span style={{ fontWeight: 600, color: isCompleted ? '#10b981' : '#ffffff' }}>{lesson.progress}%</span>
          </div>
          <div style={{ width: '100%', height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              width: `${lesson.progress}%`,
              height: '100%',
              borderRadius: '999px',
              background: isCompleted 
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #6366f1, #38bdf8)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Meta badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} />
            <span>{lesson.durationMinutes} mins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} />
            <span>{lesson.date}</span>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => startOrContinueLesson(lesson.id)}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              background: isCompleted ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.15)',
              border: isCompleted ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.3)',
              color: isCompleted ? '#f1f5f9' : '#a5b4fc',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isCompleted ? <CheckCircle size={15} color="#10b981" /> : <Play size={14} fill="currentColor" />}
            {isCompleted ? 'Review Classroom' : 'Continue Lesson'}
          </button>

          <button
            onClick={() => openNotesModal(lesson.id)}
            title="View & download study notes"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <FileText size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
