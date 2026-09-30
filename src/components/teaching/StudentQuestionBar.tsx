import React, { useState, useRef } from 'react';
import {
  Send,
  MessageCircleQuestion,
  Loader2,
  Paperclip,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';
import { uploadBookToStorage, attachSessionPdf } from '../../services/script5Service';

const PRESET_STUDENT_QUESTIONS = [
  'Explain glacier mass balance',
  'Why do glaciers retreat rapidly even if it still snows every winter?',
  'How does the Equilibrium Line Altitude (ELA) shift with +2°C warming?',
  'Can you derive the mass conservation balance equation on the chalkboard?',
  'How does porous firn snow compress into dense glacial blue ice?',
];

const ACADEMIC_LEVELS = [
  'Undergraduate',
  'Graduate',
  'Research Student',
  'PhD / Research Scholar',
] as const;

export interface AttachedFileState {
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

export const StudentQuestionBar: React.FC = () => {
  const master = useOptionalMasterClassroom();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [customInput, setCustomInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('PhD / Research Scholar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(
    master?.resolvedState?.pedagogy?.studentQuestionPrompt ||
    'Explain glacier mass balance'
  );

  // File attachment state (Stored in database/books/ and given Priority 1 retrieval)
  const [attachment, setAttachment] = useState<AttachedFileState | null>(null);

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
      // 1. Upload directly into existing database/books/ and index into RAG vector store
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

      // 2. Register with active classroom session for immediate Tier-1 Priority recognition
      const sessionId = master?.lessonPlan?.lesson_id || 'active_classroom_session';
      await attachSessionPdf(sessionId, finalSavedPath, finalDocName);
    } catch (err: any) {
      setAttachment((prev) =>
        prev
          ? {
              ...prev,
              uploadStatus: 'error',
              errorMessage: err.message || 'Failed to upload and index PDF into books database.',
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

  const handleAsk = async (q: string) => {
    if (!q.trim() || isSubmitting) return;
    const trimmed = q.trim();
    setActiveQuestion(trimmed);
    setIsSubmitting(true);

    // Notify Graph Engine & Visual Learning Area immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('student:question_asked', {
          detail: {
            question: trimmed,
            level: selectedLevel,
            attachedPdf: attachment?.fileName || null,
          },
        })
      );
    }

    try {
      if (master?.loadLessonByTopic) {
        const attachedPdfPath = attachment?.savedPath || attachment?.fileName;
        const attachedPdfName = attachment?.fileName;
        const sessionId = master?.lessonPlan?.lesson_id || 'active_classroom_session';

        await master.loadLessonByTopic(
          trimmed,
          selectedLevel,
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
      // Graceful fallback to existing lesson timeline
      master?.seekTo(0);
      master?.play();
    } finally {
      setIsSubmitting(false);
      setCustomInput('');
    }
  };

  const currentPhase = master?.resolvedState?.pedagogy?.currentPhase;
  const isQuestionPhase = currentPhase === 'STUDENT_QUESTION' || currentPhase === 'PROFESSOR_UNDERSTANDING';
  const isLoading = isSubmitting || (master?.isLoading ?? false);
  const isResearchMode = selectedLevel === 'PhD / Research Scholar' || selectedLevel === 'Research Student';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1420px',
        margin: '0 auto',
        padding: '0.95rem 1.35rem',
        borderRadius: '16px',
        background: isResearchMode
          ? 'linear-gradient(135deg, rgba(16, 28, 48, 0.98) 0%, rgba(10, 18, 32, 0.99) 100%)'
          : 'linear-gradient(135deg, rgba(20, 24, 38, 0.96) 0%, rgba(12, 16, 26, 0.99) 100%)',
        border: isResearchMode
          ? '1px solid rgba(56, 189, 248, 0.55)'
          : isQuestionPhase
          ? '1px solid rgba(253, 224, 71, 0.6)'
          : '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: isResearchMode
          ? '0 0 28px rgba(56, 189, 248, 0.22)'
          : isQuestionPhase
          ? '0 0 25px rgba(253, 224, 71, 0.2)'
          : '0 8px 24px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Hidden PDF Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Top Banner: Student Inquiry Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: isResearchMode ? 'rgba(56, 189, 248, 0.25)' : 'rgba(99, 102, 241, 0.2)',
              border: isResearchMode ? '1px solid rgba(56, 189, 248, 0.55)' : '1px solid rgba(99, 102, 241, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isResearchMode ? '#38bdf8' : '#818cf8',
            }}
          >
            <MessageCircleQuestion size={16} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isResearchMode ? '#38bdf8' : '#c7d2fe', letterSpacing: '0.04em' }}>
            {isResearchMode ? 'RESEARCH SUPERVISOR COLLOQUIUM' : 'ASK THE PROFESSOR'}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: isResearchMode ? '#7dd3fc' : '#94a3b8',
              background: isResearchMode ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: isResearchMode ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
            }}
          >
            {isResearchMode ? '🔬 Research Scholar Mode: Active' : 'Interactive Classroom Inquiry'}
          </span>
          {attachment && attachment.uploadStatus === 'indexed' && (
            <span
              style={{
                fontSize: '0.7rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={11} /> Priority 1: Attached PDF
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: '2px' }}>Academic Level:</span>
          {ACADEMIC_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            const isResLvl = lvl === 'PhD / Research Scholar';
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: isSelected ? 700 : 500,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: isSelected
                    ? isResLvl
                      ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(99, 102, 241, 0.35))'
                      : 'rgba(99, 102, 241, 0.3)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? (isResLvl ? '#38bdf8' : '#c7d2fe') : '#94a3b8',
                  border: isSelected
                    ? isResLvl
                      ? '1px solid #38bdf8'
                      : '1px solid rgba(99, 102, 241, 0.65)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected && isResLvl ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
                }}
              >
                {isResLvl ? `🔬 ${lvl}` : lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Bar & Free-form Chat Input Form with Paperclip Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (customInput.trim()) {
            handleAsk(customInput);
          } else {
            handleAsk(activeQuestion);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: attachment
            ? '1px solid rgba(56, 189, 248, 0.55)'
            : '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: attachment ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: '1.2rem', paddingLeft: '4px' }}>🙋</span>

        {/* Paperclip Attach Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Attach PDF Document (Priority 1 Grounding)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: attachment
              ? 'rgba(56, 189, 248, 0.2)'
              : 'rgba(255, 255, 255, 0.06)',
            border: attachment
              ? '1px solid #38bdf8'
              : '1px solid rgba(255, 255, 255, 0.15)',
            color: attachment ? '#38bdf8' : '#cbd5e1',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <Paperclip size={15} />
          <span>{attachment ? 'PDF Attached' : 'Attach PDF'}</span>
        </button>

        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={
            attachment
              ? `Ask a question grounded in ${attachment.fileName}...`
              : `Ask any question (e.g. "${activeQuestion}")`
          }
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            color: '#f8fafc',
            fontSize: '0.94rem',
            fontFamily: 'Inter, system-ui, sans-serif',
            outline: 'none',
            padding: '4px 6px',
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isLoading
              ? 'rgba(99, 102, 241, 0.25)'
              : attachment
              ? 'linear-gradient(135deg, #0284c7, #2563eb)'
              : 'linear-gradient(135deg, #4f46e5, #6366f1)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '7px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: isLoading ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.35)',
            flexShrink: 0,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Synthesizing Lesson…</span>
            </>
          ) : (
            <>
              <span>Ask Professor</span>
              <Send size={13} />
            </>
          )}
        </button>
      </form>

      {/* ── ATTACHED FILE METADATA CARD (Name, Type, Upload Status, Replace/Remove) ── */}
      {attachment && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border:
              attachment.uploadStatus === 'error'
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '10px',
            padding: '8px 14px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* File Icon & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171',
                flexShrink: 0,
              }}
            >
              <FileText size={18} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={attachment.fileName}
              >
                {attachment.fileName}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{attachment.fileType}</span>
                <span>&bull;</span>
                <span>{attachment.fileSizeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Upload & Indexing Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {attachment.uploadStatus === 'uploading' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Loader2 size={13} className="animate-spin" />
                <span>Storing in Books & Indexing Vector Store…</span>
              </div>
            )}

            {attachment.uploadStatus === 'indexed' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={13} color="#10b981" />
                <span>
                  Saved in Books Database &bull; Priority 1
                  {attachment.chunks ? ` (${attachment.chunks} chunks)` : ''}
                </span>
              </div>
            )}

            {attachment.uploadStatus === 'error' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.12)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <AlertCircle size={13} color="#ef4444" />
                <span>{attachment.errorMessage || 'Upload failed'}</span>
              </div>
            )}

            {/* Replace Button */}
            <button
              type="button"
              onClick={handleReplaceAttachment}
              title="Replace with another PDF"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#cbd5e1',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={11} />
              <span>Replace</span>
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemoveAttachment}
              title="Remove attached PDF (revert to books catalog)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#fca5a5',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={12} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Preset Suggested Inquiries */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Suggested Inquiries:</span>
        {PRESET_STUDENT_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(q)}
            disabled={isLoading}
            style={{
              background: activeQuestion === q ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              border: activeQuestion === q ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              color: activeQuestion === q ? '#a5b4fc' : '#cbd5e1',
              cursor: isLoading ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {q.length > 42 ? q.substring(0, 42) + '…' : q}
          </button>
        ))}
      </div>
    </div>
  );
};
