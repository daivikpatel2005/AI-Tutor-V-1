import React, { useState, useEffect } from 'react';
import { useTeaching } from '../../state/teachingStore';
import { sttService } from '../../services/sttService';
import type { TeacherEngineContract } from '../../types/teacherContract';
import { ProfessorBoardView } from './ProfessorBoardView';
import {
  X,
  GraduationCap,
  Send,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ProfessorBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const ProfessorBoardModal: React.FC<ProfessorBoardModalProps> = ({
  isOpen,
  onClose,
  initialTopic
}) => {
  const { currentSlide, activeLesson } = useTeaching();
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Research/PhD'>('Intermediate');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<TeacherEngineContract | null>(null);
  const [isWide, setIsWide] = useState(false);

  const defaultTopic = initialTopic || currentSlide?.title || activeLesson?.title || "Newton's Laws of Motion";

  useEffect(() => {
    if (isOpen) {
      loadLesson(defaultTopic, level);
    }
  }, [isOpen, defaultTopic, level]);

  const loadLesson = async (topicToTeach: string, currentLevel: string) => {
    setIsLoading(true);
    try {
      // 1. Try to fetch from backend direct endpoint
      const result = await sttService.fetchProfessorLesson(
        `Explain and visually illustrate ${topicToTeach}`,
        topicToTeach,
        currentLevel
      );

      if (result && result.success && result.teacher_response && result.visual_learning) {
        setContract(result);
        return;
      }

      // 2. Fallback to doubt resolution engine contract
      const doubtResp = await sttService.resolveDoubt({
        lessonId: activeLesson?.id || 'lesson_current',
        slideNumber: currentSlide?.slideNumber || 1,
        slideTitle: topicToTeach,
        question: `Teach me ${topicToTeach} with full equations, examples, and visuals`,
        contextTimestamp: 0,
        level: currentLevel
      });

      if (doubtResp.teacherEngineContract) {
        setContract(doubtResp.teacherEngineContract);
      }
    } catch (err) {
      console.error('Failed to load professor lesson:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    loadLesson(query.trim(), level);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
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
          maxWidth: isWide ? '1300px' : '960px',
          maxHeight: '92vh',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.95), 0 0 30px rgba(56, 189, 248, 0.1)',
          background: 'radial-gradient(ellipse at 50% 0%, #0d1527 0%, #060913 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          overflow: 'hidden',
          transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                University Chair Professor • Digital Board
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Deep Technical Pedagogical Mode with Interactive Visual Learning
              </span>
            </div>
          </div>

          {/* Level Switcher & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(['Beginner', 'Intermediate', 'Advanced', 'Research/PhD'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: level === lvl ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: level === lvl ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: level === lvl ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsWide(!isWide)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
              title={isWide ? 'Compact Width' : 'Wide Board'}
            >
              {isWide ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              title="Close Board"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search / Inquire Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'rgba(2, 6, 23, 0.5)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask professor to teach any topic or formula (e.g. "${defaultTopic}")...`}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
            }}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>{isLoading ? 'Synthesizing...' : 'Teach on Board'}</span>
          </button>
        </form>

        {/* Board Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
              <Loader2 size={36} color="#38bdf8" className="animate-spin" style={{ margin: '0 auto 14px auto' }} />
              <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Prof. Arvind Sharma is Structuring the Lecture
              </h4>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                Executing Visual Planner, calculating mathematical derivations, and rendering digital board models...
              </p>
            </div>
          ) : contract ? (
            <ProfessorBoardView contract={contract} />
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
              <p>Type a topic above to initiate a Professor Digital Board session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
