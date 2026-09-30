import React, { useState, useRef } from 'react';
import {
  BookOpen,
  FileCode,
  Compass,
  MessageSquareQuote,
  MessageCircleQuestion,
  Send,
  Loader2,
  Paperclip,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useOptionalMasterClassroom } from '../../../context/MasterClassroomContext';
import { REAL_RESEARCH_PAPERS } from '../../../data/researchLibraryData';
import { uploadBookToStorage, attachSessionPdf } from '../../../services/script5Service';

export type DockTabType = 'explanation' | 'formula' | 'example' | 'sources' | 'ask';

interface ClassroomDockTabsProps {
  onOpenBooksModal?: () => void;
  onOpenResearchModal?: () => void;
}

interface DockAttachedFile {
  file: File;
  fileName: string;
  fileSizeFormatted: string;
  fileType: string;
  uploadStatus: 'uploading' | 'indexed' | 'error';
  errorMessage?: string;
  savedPath?: string;
  pages?: number;
  chunks?: number;
}

export const ClassroomDockTabs: React.FC<ClassroomDockTabsProps> = ({
  onOpenBooksModal
}) => {
  const master = useOptionalMasterClassroom();
  const [activeTab, setActiveTab] = useState<DockTabType>('explanation');

  // Student inquiry state
  const [customQuery, setCustomQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File attachment state (Stored in database/books/ and given Priority 1 retrieval)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachment, setAttachment] = useState<DockAttachedFile | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    setAttachment({
      file,
      fileName: file.name,
      fileSizeFormatted: sizeFormatted,
      fileType: 'PDF Document (application/pdf)',
      uploadStatus: 'uploading',
    });

    try {
      const uploadResult = await uploadBookToStorage(file);
      const details = uploadResult.book_details;
      const finalSavedPath = details?.saved_path || details?.file_name || file.name;
      const finalDocName = details?.file_name || file.name;

      setAttachment({
        file,
        fileName: finalDocName,
        fileSizeFormatted: sizeFormatted,
        fileType: 'PDF Document (application/pdf)',
        uploadStatus: 'indexed',
        savedPath: finalSavedPath,
        pages: details?.pages,
        chunks: details?.chunks,
      });

      const sessionId = master?.lessonPlan?.lesson_id || 'active_classroom_session';
      await attachSessionPdf(sessionId, finalSavedPath, finalDocName);
    } catch (err: any) {
      setAttachment((prev) =>
        prev
          ? {
              ...prev,
              uploadStatus: 'error',
              errorMessage: err.message || 'Failed to upload and index PDF.',
            }
          : null
      );
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (master?.loadLessonByTopic) {
        const attachedPdfPath = attachment?.savedPath || attachment?.fileName;
        const attachedPdfName = attachment?.fileName;
        const sessionId = master?.lessonPlan?.lesson_id || 'active_classroom_session';

        await master.loadLessonByTopic(
          queryText.trim(),
          'Undergraduate',
          attachedPdfPath,
          attachedPdfName,
          sessionId
        );
        master.play();
      } else if (master) {
        master.seekTo(0);
        master.play();
      }
    } catch {
      master?.play();
    } finally {
      setIsSubmitting(false);
      setCustomQuery('');
    }
  };

  const tabs: { id: DockTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'explanation', label: 'Explanation', icon: <MessageSquareQuote size={15} /> },
    { id: 'formula', label: 'Formula', icon: <FileCode size={15} /> },
    { id: 'example', label: 'Example', icon: <Compass size={15} /> },
    { id: 'sources', label: 'Sources', icon: <BookOpen size={15} /> },
    { id: 'ask', label: 'Ask Professor', icon: <MessageCircleQuestion size={15} /> }
  ];

  const currentSpeech = master?.resolvedState?.narration?.speechText ||
    'Glacier mass balance is governed by the equilibrium between snow accumulation at high altitudes and ablation runoff at low altitudes.';

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(12, 17, 30, 0.95) 0%, rgba(7, 10, 20, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Tab Navigation Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(5, 8, 16, 0.7)',
          padding: '0 1rem',
          flexWrap: 'wrap',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
          Interactive Pedagogical Workspace
        </div>
      </div>

      {/* Tab Content Body */}
      <div style={{ padding: '1.25rem 1.5rem', minHeight: '130px' }}>
        {/* ── TAB 1: EXPLANATION ──────────────────────────────────── */}
        {activeTab === 'explanation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                CURRENT PROFESSOR EXPLANATION &bull; ACTIVE THESIS
              </span>
              <span style={{ fontSize: '0.72rem', color: '#fde047', background: 'rgba(253, 224, 71, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                Synchronized
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.96rem',
                lineHeight: 1.6,
                color: '#f8fafc',
                fontWeight: 500,
                letterSpacing: '0.01em'
              }}
            >
              &ldquo;{currentSpeech}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>&bull; Concept: Glacier Mass Conservation</span>
              <span>&bull; ELA Elevation: 3,000 meters a.s.l.</span>
              <span>&bull; Primary Balance Equation: $B = C - A$</span>
            </div>
          </div>
        )}

        {/* ── TAB 2: FORMULA ──────────────────────────────────────── */}
        {activeTab === 'formula' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase' }}>
              GOVERNING MATHEMATICAL &amp; PHYSICAL EQUATIONS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {/* Formula Card 1 */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700 }}>
                  1. Mass Balance Conservation
                </div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '1.05rem', color: '#ffffff', margin: '6px 0', fontWeight: 700 }}>
                  B = C - A = ∫ (c(z) - a(z)) dA
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  $B$ = Net annual balance, $C$ = Total accumulation input, $A$ = Total ablation loss.
                </div>
              </div>

              {/* Formula Card 2 */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                  2. Vertical Specific Balance Gradient
                </div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '1.05rem', color: '#ffffff', margin: '6px 0', fontWeight: 700 }}>
                  b(z) = (∂b / ∂z) &bull; (z - z_ELA)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  z_ELA = Equilibrium line altitude (3000m). Above z_ELA, b(z) &gt; 0; below, b(z) &lt; 0.
                </div>
              </div>

              {/* Formula Card 3 */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700 }}>
                  3. Nonlinear Thermal Melt Acceleration
                </div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '1.05rem', color: '#ffffff', margin: '6px 0', fontWeight: 700 }}>
                  dM/dt = -α &bull; (ΔT)^1.4 - β_calving
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Shows accelerated mass loss rate per degree anomaly above historical baseline.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: EXAMPLE ──────────────────────────────────────── */}
        {activeTab === 'example' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              WORKED REAL-WORLD NUMERICAL CALCULATION
            </div>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fef08a' }}>
                Scenario: Alpine Valley Glacier (Area = 85 km², Altitude 2,200m to 3,800m)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                Given: Mean winter accumulation C = +1.65 m w.e. over accumulation area (45 km²).
                Summer ablation loss A = -2.85 m w.e. over terminus area (40 km²).
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  color: '#38bdf8'
                }}
              >
                Net Mass Balance B = (45 × 10⁶ m² × 1.65 m) - (40 × 10⁶ m² × 2.85 m)<br />
                B = 7.425 × 10⁷ m³ - 11.40 × 10⁷ m³ = <strong>-3.975 × 10⁷ m³ w.e./yr (-39.8 Megatons/yr)</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#f87171' }}>
                Conclusion: Net negative mass balance (-39.8 Mt/yr). Terminus retreats approximately 28 meters per annum.
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: SOURCES ──────────────────────────────────────── */}
        {activeTab === 'sources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                PEER-REVIEWED RESEARCH CITATIONS &amp; TEXTBOOK CORPUS
              </span>
              <button
                onClick={onOpenBooksModal}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Browse All 55 Books
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
              {REAL_RESEARCH_PAPERS.map((paper) => (
                <div
                  key={paper.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                    {paper.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>
                    {paper.journal} ({paper.year}) &bull; DOI: {paper.doi}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    {paper.relevanceToLecture}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: ASK PROFESSOR ────────────────────────────────── */}
        {activeTab === 'ask' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                DIRECT THE PROFESSOR &bull; SOCRATIC INQUIRY
              </div>
              {attachment && attachment.uploadStatus === 'indexed' && (
                <div style={{ fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Sparkles size={11} /> Priority 1: Attached PDF
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(customQuery);
              }}
              style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}
            >
              {/* Paperclip Attach Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                title="Attach PDF Document (Priority 1 Grounding)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: attachment ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: attachment ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: attachment ? '#38bdf8' : '#cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <Paperclip size={15} />
                <span>{attachment ? 'PDF Attached' : 'Attach PDF'}</span>
              </button>

              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={
                  attachment
                    ? `Ask a question grounded in ${attachment.fileName}...`
                    : "Ask the professor to derive an equation, explain a graph, or discuss a cryosphere concept..."
                }
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: attachment ? '1px solid rgba(56, 189, 248, 0.55)' : '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxShadow: attachment ? '0 0 10px rgba(56, 189, 248, 0.15)' : 'none'
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting || !customQuery.trim()}
                style={{
                  background: attachment
                    ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 20px',
                  height: '42px',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: isSubmitting || !customQuery.trim() ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isSubmitting || !customQuery.trim() ? 0.6 : 1,
                  flexShrink: 0
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Ask</span>
              </button>
            </form>

            {/* Attached PDF Metadata Card */}
            {attachment && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                  border: attachment.uploadStatus === 'error'
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f87171',
                      flexShrink: 0
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attachment.fileName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {attachment.fileType} &bull; {attachment.fileSizeFormatted}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {attachment.uploadStatus === 'uploading' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#38bdf8' }}>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Storing & Indexing in Books...</span>
                    </div>
                  )}
                  {attachment.uploadStatus === 'indexed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#34d399' }}>
                      <CheckCircle2 size={12} color="#10b981" />
                      <span>Stored in Books &bull; Priority 1 ({attachment.chunks || 0} chunks)</span>
                    </div>
                  )}
                  {attachment.uploadStatus === 'error' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#f87171' }}>
                      <AlertCircle size={12} color="#ef4444" />
                      <span>{attachment.errorMessage || 'Failed'}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReplaceAttachment}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px',
                      padding: '3px 7px',
                      color: '#cbd5e1',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <RefreshCw size={10} />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '5px',
                      padding: '3px 7px',
                      color: '#fca5a5',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <X size={10} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Suggested:</span>
              {[
                'Derive specific balance b(z) on the blackboard',
                'Explain how firn compresses into blue ice',
                'Why does warming lift the ELA elevation?'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAsk(suggestion)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    color: '#c7d2fe',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
