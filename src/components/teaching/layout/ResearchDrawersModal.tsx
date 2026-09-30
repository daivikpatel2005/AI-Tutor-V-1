import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Microscope,
  History as HistoryIcon,
  Search
} from 'lucide-react';
import { REAL_RESEARCH_BOOKS, REAL_RESEARCH_PAPERS } from '../../../data/researchLibraryData';
import { useTeaching } from '../../../state/teachingStore';

interface ResearchDrawersModalProps {
  type: 'books' | 'research' | 'history' | null;
  onClose: () => void;
}

export const ResearchDrawersModal: React.FC<ResearchDrawersModalProps> = ({ type, onClose }) => {
  const { lessons, startOrContinueLesson } = useTeaching();
  const [searchQuery, setSearchQuery] = useState('');

  if (!type) return null;

  const filteredBooks = REAL_RESEARCH_BOOKS.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.keyTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '85vh',
          background: 'linear-gradient(135deg, rgba(13, 18, 32, 0.98) 0%, rgba(8, 12, 22, 0.99) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(5, 8, 16, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background:
                  type === 'books'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : type === 'research'
                    ? 'rgba(56, 189, 248, 0.2)'
                    : 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color:
                  type === 'books' ? '#34d399' : type === 'research' ? '#38bdf8' : '#c084fc'
              }}
            >
              {type === 'books' && <BookOpen size={18} />}
              {type === 'research' && <Microscope size={18} />}
              {type === 'history' && <HistoryIcon size={18} />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                {type === 'books' && 'Research Textbook & PDF Corpus (55 Indexed Books)'}
                {type === 'research' && 'Peer-Reviewed Research Papers & Field Data'}
                {type === 'history' && 'Lecture History & Prior Sessions'}
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {type === 'books' && 'Sourced directly from database/metadata/books_manifest.json'}
                {type === 'research' && 'RAG dense indexed scientific literature supporting blackboard derivations'}
                {type === 'history' && 'Recent student classroom interactions and topics'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar for Books */}
        {type === 'books' && (
          <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}
            >
              <Search size={14} color="#64748b" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 55 indexed glaciology textbooks, monographs, and authors..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Content Scroll Area */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* ── 1. BOOKS LIST ────────────────────────────────────────── */}
          {type === 'books' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                        {book.title}
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '2px' }}>
                        {book.author} &bull; {book.year} &bull; {book.subject}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {book.chunks} Chunks ({book.pages} pp)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {book.keyTopics.map((top, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#cbd5e1',
                          padding: '1px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 2. RESEARCH LIST ─────────────────────────────────────── */}
          {type === 'research' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {REAL_RESEARCH_PAPERS.map((paper) => (
                <div
                  key={paper.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                    {paper.title}
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>
                    {paper.journal} ({paper.year}) &bull; DOI: {paper.doi}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {paper.abstract}
                  </p>
                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      color: '#a5b4fc',
                      marginTop: '4px'
                    }}
                  >
                    <strong>Pedagogical Link:</strong> {paper.relevanceToLecture}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 3. HISTORY LIST ──────────────────────────────────────── */}
          {type === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => {
                    startOrContinueLesson(lesson.id);
                    onClose();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                      {lesson.title}
                    </h4>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                      {lesson.subject} &bull; {lesson.durationMinutes} mins &bull; {lesson.lastAccessed}
                    </div>
                  </div>
                  <button
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#818cf8',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Load Lesson
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
