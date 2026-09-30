import React, { useState, useEffect, useRef } from 'react';
import { useTeaching } from '../../state/teachingStore';
import { sttService } from '../../services/sttService';
import type { DoubtResolutionResponse } from '../../services/sttService';
import type { TeacherEngineContract } from '../../types/teacherContract';
import { ProfessorBoardView } from './ProfessorBoardView';
import { ttsService } from '../../services/ttsService';
import {
  X,
  Mic,
  MicOff,
  Send,
  Play,
  AlertCircle,
  GraduationCap,
  Paperclip,
  FileText,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { uploadBookToStorage, attachSessionPdf } from '../../services/script5Service';

function synthesizeContract(resolution: DoubtResolutionResponse, defaultTopic: string = 'Scientific Concept'): TeacherEngineContract {
  const prof = resolution.professorTeaching;
  const vis = resolution.visualLearning || prof?.visual_learning;
  const sections = prof?.sections || {};

  return {
    success: true,
    teacher_response: {
      title: prof?.topic || defaultTopic,
      short_answer: sections.short_answer || resolution.keyTakeaway || resolution.answerText.slice(0, 160),
      learning_objective: sections.learning_objective || 'Understand the governing dynamics, foundational principles, and equations.',
      prerequisites: sections.prerequisites ? [sections.prerequisites] : ['Dimensional Analysis', 'Coordinate Systems'],
      intuition: sections.intuition || 'Mental model: Evaluate net force gradients and energy minimization pathways.',
      explanation: sections.explanation || resolution.answerText,
      deep_explanation: sections.deep_explanation || sections.formal_definition || '',
      steps: sections.step_by_step_explanation ? [sections.step_by_step_explanation] : [],
      formulas: sections.formula ? [sections.formula] : [],
      derivation: sections.derivation ? [sections.derivation] : [],
      example: sections.worked_example ? { problem: sections.worked_example } : {},
      applications: sections.real_world_application ? [sections.real_world_application] : [],
      common_mistakes: sections.common_mistakes ? [sections.common_mistakes] : [],
      advanced_perspective: sections.advanced_perspective || '',
      research_perspective: sections.research_perspective || '',
      summary: sections.summary || resolution.keyTakeaway || resolution.answerText,
      check_question: sections.check_your_understanding || ''
    },
    visual_learning: vis || {
      required: true,
      visual_type: 'diagram',
      title: 'Conceptual Framework',
      description: 'Structural schematic of active elements and interactions.',
      purpose: 'Illustrate governing principles',
      elements: ['System Boundary', 'Core Invariant', 'Equilibrium'],
      steps: [],
      diagram: {},
      graph: {},
      chart: {},
      image_prompt: ''
    },
    sources: ['Advanced University Textbooks', 'Scientific Literature'],
    teaching_metadata: {
      student_level: prof?.level || 'Intermediate',
      difficulty: 'Standard',
      topic: prof?.topic || defaultTopic,
      concepts: ['Mechanics', 'Kinematics', 'Dynamics'],
      estimated_learning_time: '5 mins'
    }
  };
}

export const DoubtPanel: React.FC = () => {
  const {
    isDoubtOpen,
    closeDoubt,
    resumeFromDoubt,
    currentSlide,
    activeLesson,
    currentTime,
    pause
  } = useTeaching();

  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [resolution, setResolution] = useState<DoubtResolutionResponse | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<{ start: () => void; stop: () => void } | null>(null);
  const [teachingLevel, setTeachingLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Research/PhD'>('Intermediate');

  // File attachment state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachment, setAttachment] = useState<{
    file: File;
    fileName: string;
    fileSizeFormatted: string;
    fileType: string;
    uploadStatus: 'uploading' | 'indexed' | 'error';
    errorMessage?: string;
    savedPath?: string;
    pages?: number;
    chunks?: number;
  } | null>(null);

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

      const sessId = `session_${activeLesson?.id || 'live_doubt_session'}`;
      await attachSessionPdf(sessId, finalSavedPath, finalDocName);
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

  // Critical: Whenever doubt panel is opened or user interacts, pause the lecture immediately
  useEffect(() => {
    if (isDoubtOpen) {
      pause();
    }
  }, [isDoubtOpen, pause]);

  // Handle Voice Input
  const toggleListening = () => {
    pause(); // ensure lecture is paused
    setMicError('');

    if (isListening) {
      if (recognitionInstance) recognitionInstance.stop();
      setIsListening(false);
      return;
    }

    const instance = sttService.initSpeechRecognition(
      (transcribedText) => {
        setQuestion(transcribedText);
      },
      (errorMsg) => {
        setMicError(errorMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    setRecognitionInstance(instance);
    setIsListening(true);
    instance.start();
  };

  const handleSubmitQuestion = async (qText?: string, overrideLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research/PhD') => {
    const finalQ = qText || question;
    if (!finalQ.trim()) return;

    pause();
    setIsLoadingAnswer(true);
    setMicError('');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student:question_asked', { detail: { question: finalQ.trim() } }));
    }

    const targetLevel = overrideLevel || teachingLevel;

    try {
      const response = await sttService.resolveDoubt({
        lessonId: activeLesson?.id || 'les_newton_01',
        slideNumber: currentSlide?.slideNumber || 1,
        slideTitle: currentSlide?.title || 'Newtonian Dynamics',
        question: finalQ.trim(),
        contextTimestamp: currentTime,
        level: targetLevel,
        attachedPdfPath: attachment?.savedPath || attachment?.fileName || null,
        attachedPdfName: attachment?.fileName || null
      });

      setResolution(response);
      // Speak AI tutor answer
      ttsService.speakNative(response.answerText, 1.0);
    } finally {
      setIsLoadingAnswer(false);
    }
  };


  const handleResume = () => {
    ttsService.stopNative();
    resumeFromDoubt();
  };

  if (!isDoubtOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={closeDoubt}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          borderRadius: '20px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
          background: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Pause Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Professor Teaching Engine
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    letterSpacing: '0.04em'
                  }}
                >
                  ⏸ LECTURE PAUSED
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Slide {currentSlide?.slideNumber}: {currentSlide?.title} (at {currentTime.toFixed(1)}s) • Dynamic 18-Section University Pedagogy
              </p>
            </div>
          </div>

          <button
            onClick={closeDoubt}
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

        {/* Academic Depth Level Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Academic Depth:
          </span>
          {(['Beginner', 'Intermediate', 'Advanced', 'Research/PhD'] as const).map((lvl) => {
            const isActive = teachingLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setTeachingLevel(lvl);
                  if (resolution && question.trim()) {
                    handleSubmitQuestion(question, lvl);
                  }
                }}
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl} {lvl === 'Beginner' ? '(8 Sec)' : lvl === 'Intermediate' ? '(12 Sec)' : '(15 Sec)'}
              </button>
            );
          })}
        </div>

        {/* Question Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              rows={2}
              placeholder="Ask anything (e.g. 'What is gradient descent?', 'Explain Dijkstra', 'Derive Newton second law')..."
              value={question}
              onChange={(e) => {
                pause(); // pause lecture when typing
                setQuestion(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitQuestion();
                }
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
              autoFocus
            />

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {/* Quick Submit, Mic, and Paperclip inside Input */}
            <div style={{ position: 'absolute', bottom: '8px', right: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Paperclip Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoadingAnswer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: attachment ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: attachment ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                  color: attachment ? '#38bdf8' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Attach PDF (Priority 1 Grounding)"
              >
                <Paperclip size={14} />
                <span>{attachment ? 'PDF' : 'Attach'}</span>
              </button>

              <button
                type="button"
                onClick={toggleListening}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isListening ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                  color: isListening ? '#fca5a5' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Ask by Voice (Microphone)"
              >
                {isListening ? <MicOff size={14} color="#ef4444" /> : <Mic size={14} />}
                <span>{isListening ? 'Listening...' : 'Voice'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmitQuestion()}
                disabled={isLoadingAnswer || !question.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: !question.trim() || isLoadingAnswer ? 'not-allowed' : 'pointer',
                  opacity: !question.trim() || isLoadingAnswer ? 0.6 : 1
                }}
              >
                <Send size={13} />
                <span>{isLoadingAnswer ? 'Teaching...' : 'Ask Professor'}</span>
              </button>
            </div>
          </div>

          {/* Attached PDF Metadata Badge */}
          {attachment && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 23, 42, 0.8)',
                border: attachment.uploadStatus === 'error' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <FileText size={14} color="#f87171" />
                <span style={{ fontWeight: 600, color: '#f8fafc', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                  {attachment.fileName}
                </span>
                <span style={{ color: '#94a3b8' }}>({attachment.fileSizeFormatted})</span>
                {attachment.uploadStatus === 'uploading' && (
                  <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Loader2 size={11} className="animate-spin" /> Indexing into Books...
                  </span>
                )}
                {attachment.uploadStatus === 'indexed' && (
                  <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle2 size={11} color="#10b981" /> Stored in Books (Priority 1)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {micError && (
            <div style={{ fontSize: '0.75rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} />
              {micError}
            </div>
          )}
        </div>

        {/* AI Tutor Answer Area */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '4px' }}>
          {resolution ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {/* Professor Digital Board (Full PROFESSOR MODE Structure & Dynamic Visual Renderer) */}
              <ProfessorBoardView
                contract={
                  resolution.teacherEngineContract ||
                  synthesizeContract(resolution, currentSlide?.title || 'Scientific Concept')
                }
              />

              {/* Suggested Follow-Ups */}
              {resolution.suggestedFollowUp && resolution.suggestedFollowUp.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Suggested Professor Inquiries:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {resolution.suggestedFollowUp.map((fu, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuestion(fu);
                          handleSubmitQuestion(fu);
                        }}
                        style={{
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          color: '#c084fc',
                          cursor: 'pointer'
                        }}
                      >
                        ➔ {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <GraduationCap size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5, color: '#818cf8' }} />
              <p style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>Ask the University Chair Professor</p>
              <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Select an academic depth (Beginner, Intermediate, Advanced, Research/PhD) to receive a dynamic structured response with mathematical formulations and visual models.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Resume Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Resume time: {currentTime.toFixed(1)}s on Slide {currentSlide?.slideNumber}
          </span>

          <button
            onClick={handleResume}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Play size={16} fill="currentColor" />
            Resume Lecture
          </button>
        </div>
      </div>
    </div>
  );
};
