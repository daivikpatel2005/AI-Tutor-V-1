import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';

export const SocraticCheckQuestionModal: React.FC = () => {
  const master = useOptionalMasterClassroom();
  const checkQuestion = master?.resolvedState?.pedagogy?.checkQuestion;
  const isCheckActive = master?.resolvedState?.pedagogy?.isCheckQuestionActive;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (!checkQuestion || !isCheckActive || isDismissed) {
    return null;
  }

  const selectedOption = checkQuestion.options.find(o => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleSelect = (optId: string) => {
    if (submitted && isCorrect) return;
    setSelectedOptionId(optId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setSubmitted(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.99) 100%)',
          border: isCorrect && submitted
            ? '2px solid rgba(34, 197, 94, 0.8)'
            : '2px solid rgba(129, 140, 248, 0.6)',
          boxShadow: isCorrect && submitted
            ? '0 0 45px rgba(34, 197, 94, 0.35)'
            : '0 20px 50px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          position: 'relative',
        }}
      >
        {/* Header Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(129, 140, 248, 0.2)',
                border: '1px solid rgba(129, 140, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', fontWeight: 700 }}>
                STAGE 12 &bull; PROFESSOR CHECK QUESTION
              </span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600 }}>
                {checkQuestion.context || 'Socratic Concept Mastery'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Professor Speaking Prompt */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.12)',
            borderLeft: '4px solid #818cf8',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>👨‍🏫</span>
          <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.5, color: '#e0e7ff', fontWeight: 500 }}>
            &ldquo;Now, before we conclude, let me verify your understanding of how shifting elevation alters the mass budget:&rdquo;
          </p>
        </div>

        {/* Question Text */}
        <div style={{ padding: '0 4px' }}>
          <p style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.55, color: '#fde047', fontWeight: 600 }}>
            {checkQuestion.questionText}
          </p>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {checkQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let borderStyle = '1px solid rgba(255, 255, 255, 0.12)';
            let bgStyle = 'rgba(255, 255, 255, 0.03)';
            let labelColor = '#94a3b8';

            if (submitted) {
              if (opt.isCorrect) {
                borderStyle = '2px solid #22c55e';
                bgStyle = 'rgba(34, 197, 94, 0.15)';
                labelColor = '#22c55e';
              } else if (isSelected && !opt.isCorrect) {
                borderStyle = '2px solid #ef4444';
                bgStyle = 'rgba(239, 68, 68, 0.15)';
                labelColor = '#ef4444';
              }
            } else if (isSelected) {
              borderStyle = '2px solid #818cf8';
              bgStyle = 'rgba(129, 140, 248, 0.18)';
              labelColor = '#818cf8';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: borderStyle,
                  background: bgStyle,
                  cursor: submitted && isCorrect ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isSelected ? labelColor : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {opt.label}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.45 }}>
                    {opt.text}
                  </div>
                  {submitted && (isSelected || opt.isCorrect) && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.8rem',
                        color: opt.isCorrect ? '#86efac' : '#fca5a5',
                        lineHeight: 1.4,
                      }}
                    >
                      {opt.explanation}
                    </div>
                  )}
                </div>
                {submitted && opt.isCorrect && <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0 }} />}
                {submitted && isSelected && !opt.isCorrect && <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Pedagogical Feedback Banner */}
        {submitted && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{isCorrect ? '🌟' : '💡'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isCorrect ? '#4ade80' : '#f87171', marginBottom: '2px' }}>
                {isCorrect ? 'PROFESSOR FEEDBACK: EXCELLENT MASTERY' : 'PROFESSOR HINT: PHYSICAL MECHANISM'}
              </div>
              <div style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                {isCorrect ? checkQuestion.correctFeedback : checkQuestion.incorrectFeedback}
              </div>
            </div>
          </div>
        )}

        {/* Actions Bottom Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
          {submitted && !isCorrect && (
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: selectedOptionId
                  ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                  : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: selectedOptionId ? 'pointer' : 'not-allowed',
                opacity: selectedOptionId ? 1 : 0.4,
              }}
            >
              <span>Submit Answer to Professor</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setIsDismissed(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isCorrect ? '#16a34a' : '#475569',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>{isCorrect ? 'Complete Lecture & Return to Board' : 'Close Checkpoint'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
