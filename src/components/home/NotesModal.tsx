import React, { useEffect, useState } from 'react';
import { useTeaching } from '../../state/teachingStore';
import { notesService } from '../../services/notesService';
import type { LessonNotesBundle } from '../../types/notes';
import { X, Download, FileText, CheckCircle2, Bookmark } from 'lucide-react';

export const NotesModal: React.FC = () => {
  const { isNotesModalOpen, closeNotesModal, selectedNotesLessonId, lessons } = useTeaching();
  const [selectedTabLessonId, setSelectedTabLessonId] = useState<string | null>(null);
  const activeLessonId = selectedTabLessonId || selectedNotesLessonId || lessons[0]?.id || '';
  const [bundle, setBundle] = useState<LessonNotesBundle | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!activeLessonId) return;
    let isMounted = true;
    notesService.getLessonNotesBundle(activeLessonId).then((data) => {
      if (isMounted) setBundle(data);
    });
    return () => {
      isMounted = false;
    };
  }, [activeLessonId]);

  if (!isNotesModalOpen) return null;

  const handleDownload = async () => {
    if (!activeLessonId) return;
    setIsDownloading(true);
    try {
      await notesService.downloadNotesPdf(activeLessonId);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={closeNotesModal}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8)',
          background: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <FileText size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                AI Student Classroom Notes
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Auto-extracted formulas, key definitions, and concept takeaways.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !bundle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: downloadSuccess ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: downloadSuccess ? '1px solid #10b981' : 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: !bundle ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {downloadSuccess ? <CheckCircle2 size={15} color="#10b981" /> : <Download size={15} />}
              {downloadSuccess ? 'Downloaded Document' : isDownloading ? 'Generating...' : 'Download PDF Bundle'}
            </button>

            <button
              onClick={closeNotesModal}
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
        </div>

        {/* Body Layout (Lesson Tabs + Notes Feed) */}
        <div style={{ display: 'flex', flex: 1, minHeight: '400px', overflow: 'hidden' }}>
          {/* Left Column: Lesson Selector */}
          <div style={{
            width: '260px',
            borderRight: '1px solid var(--border-subtle)',
            padding: '1rem',
            overflowY: 'auto',
            background: 'rgba(0, 0, 0, 0.15)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Select Lesson
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lessons.map((les) => (
                <button
                  key={les.id}
                  onClick={() => setSelectedTabLessonId(les.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: activeLessonId === les.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: activeLessonId === les.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    color: activeLessonId === les.id ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: activeLessonId === les.id ? 600 : 400,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {les.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {les.subject}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Note Content Viewer */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            {bundle && bundle.notes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                    {bundle.subject}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                    {bundle.lessonTitle}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Generated by {bundle.tutorName} • {bundle.dateGenerated}
                  </p>
                </div>

                {bundle.notes.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bookmark size={13} />
                        Slide {item.slideNumber}: {item.highlightedConcept}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '10px' }}>
                      {item.summary}
                    </p>

                    {item.formulaOrCode && (
                      <div style={{
                        padding: '8px 12px',
                        background: '#040508',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: '#38bdf8',
                        marginBottom: '10px'
                      }}>
                        {item.formulaOrCode}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Key Takeaways:</strong>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {item.keyTakeaways.map((takeaway, tIdx) => (
                          <li key={tIdx} style={{ marginBottom: '3px' }}>{takeaway}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No study notes generated yet for this session.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Notes are automatically captured as the 3D AI tutor presents key formulas and slides.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
