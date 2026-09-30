import React, { useState } from 'react';
import { useTeaching } from '../../state/teachingStore';
import { LessonCard } from './LessonCard';
import { BookOpen, Search, Plus, RefreshCw } from 'lucide-react';

export const LessonHistory: React.FC = () => {
  const { lessons, openCreateModal, toggleMockEmptyState, isMockEmpty } = useTeaching();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const subjects = ['All', ...Array.from(new Set(lessons.map((l) => l.subject)))];

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || lesson.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <section style={{ paddingBottom: '4rem' }}>
      {/* Section Header with Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Previous Learning Sessions
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}>
              {lessons.length}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Pick up right where your AI tutor left off with synchronized slide memory.
          </p>
        </div>

        {/* Search, Filter & Empty State Demo Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Mock Empty-State Toggle for Evaluation */}
          <button
            onClick={toggleMockEmptyState}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: isMockEmpty ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: isMockEmpty ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
              color: isMockEmpty ? '#fca5a5' : 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
            title="Toggle between populated list and new-student empty state"
          >
            <RefreshCw size={12} />
            {isMockEmpty ? 'Empty State Active (Click to Reset)' : 'Test Empty State'}
          </button>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '6px 12px',
            minWidth: '220px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      {subjects.length > 2 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              style={{
                fontSize: '0.8rem',
                padding: '5px 12px',
                borderRadius: '999px',
                background: selectedSubject === sub ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedSubject === sub ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                color: selectedSubject === sub ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Grid or Empty State */}
      {filteredLessons.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      ) : (
        /* Empty State UI */
        <div 
          className="glass-panel"
          style={{
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '2rem auto'
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: '#818cf8'
          }}>
            <BookOpen size={28} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            {searchTerm ? 'No matching lessons found' : 'No lessons yet'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            {searchTerm
              ? `We couldn't find any lessons matching "${searchTerm}". Try searching for another topic or clear the filter.`
              : 'You have not attended any AI classroom lectures yet. Start your first interactive lesson to experience 3D AI instruction.'}
          </p>

          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Plus size={16} />
            Create Your First Lesson
          </button>
        </div>
      )}
    </section>
  );
};
