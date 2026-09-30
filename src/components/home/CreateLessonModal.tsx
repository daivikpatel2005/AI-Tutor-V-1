import React, { useState } from 'react';
import { useTeaching } from '../../state/teachingStore';
import type { StudentLevel, TeachingStyle, Difficulty, CreateLessonPayload } from '../../types/lesson';
import { X, Sparkles, BookOpen, Clock, Brain, Gauge, Compass } from 'lucide-react';

const STUDENT_LEVELS: StudentLevel[] = [
  'Elementary',
  'Middle School',
  'High School',
  'Undergraduate',
  'Professional',
  'Lifelong Learner'
];

const TEACHING_STYLES: TeachingStyle[] = [
  'Conceptual & Visual',
  'Socratic & Inquiring',
  'Step-by-Step Practical',
  'Fast-Paced & Intensive',
  'Analogy & Storytelling'
];

const DIFFICULTIES: Difficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

const POPULAR_TOPICS = [
  'Quantum Superposition & Qubits',
  'Transformer Attention Mechanisms',
  'Photosynthesis & Light Reactions',
  'Calculus: The Fundamental Theorem',
  'CRISPR Gene Editing'
];

export const CreateLessonModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, createNewLesson, isLoadingLessons } = useTeaching();

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState<StudentLevel>('Undergraduate');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [teachingStyle, setTeachingStyle] = useState<TeachingStyle>('Conceptual & Visual');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [formError, setFormError] = useState('');

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setFormError('Please enter a lesson topic or concept to teach.');
      return;
    }

    setFormError('');
    const payload: CreateLessonPayload = {
      topic: topic.trim(),
      subject: subject.trim() || 'General Science',
      level,
      durationMinutes,
      teachingStyle,
      difficulty
    };

    await createNewLesson(payload);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={closeCreateModal}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Create New AI Lesson
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Configure curriculum parameters for your interactive 3D classroom.
              </p>
            </div>
          </div>
          <button
            onClick={closeCreateModal}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Topic Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Lesson Topic / Concept *
            </label>
            <input
              type="text"
              placeholder="e.g. Quantum Superposition, Neural Networks, Mitosis..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              autoFocus
            />

            {/* Quick Topic Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {POPULAR_TOPICS.map((popTopic) => (
                <button
                  key={popTopic}
                  type="button"
                  onClick={() => setTopic(popTopic)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  + {popTopic}
                </button>
              ))}
            </div>
          </div>

          {/* Subject & Level Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <BookOpen size={14} color="#818cf8" /> Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Physics, AI, Biology"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <Brain size={14} color="#06b6d4" /> Student Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as StudentLevel)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                {STUDENT_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} style={{ background: '#0d0f17' }}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Teaching Style & Difficulty Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <Compass size={14} color="#c084fc" /> Teaching Style
              </label>
              <select
                value={teachingStyle}
                onChange={(e) => setTeachingStyle(e.target.value as TeachingStyle)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                {TEACHING_STYLES.map((style) => (
                  <option key={style} value={style} style={{ background: '#0d0f17' }}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <Gauge size={14} color="#10b981" /> Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff} style={{ background: '#0d0f17' }}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Lesson Duration */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Clock size={14} color="#f59e0b" /> Preferred Duration
              </label>
              <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 600 }}>
                {durationMinutes} minutes ({Math.round(durationMinutes * 0.7)} slides)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    background: durationMinutes === mins ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: durationMinutes === mins ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                    color: durationMinutes === mins ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={closeCreateModal}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoadingLessons}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: 'none',
                cursor: isLoadingLessons ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                opacity: isLoadingLessons ? 0.7 : 1
              }}
            >
              <Sparkles size={16} />
              {isLoadingLessons ? 'Synthesizing Curriculum...' : 'Start Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
