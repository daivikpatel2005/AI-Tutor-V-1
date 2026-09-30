import React, { useState } from 'react';
import type { TeacherEngineContract } from '../../types/teacherContract';
import { ProfessorVisualRenderer } from './visuals/ProfessorVisualRenderer';
import { ttsService } from '../../services/ttsService';
import {
  GraduationCap,
  Volume2,
  Lightbulb,
  BookOpen,
  Code2,
  Calculator,
  Compass,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Target,
  X
} from 'lucide-react';

interface ProfessorBoardViewProps {
  contract: TeacherEngineContract;
  onClose?: () => void;
  className?: string;
}

export const ProfessorBoardView: React.FC<ProfessorBoardViewProps> = ({
  contract,
  onClose,
  className = ''
}) => {
  const [showDerivation, setShowDerivation] = useState(true);
  const [showCheckAnswer, setShowCheckAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const teacher = contract.teacher_response;
  const visual = contract.visual_learning;
  const metadata = contract.teaching_metadata || {
    student_level: 'Intermediate',
    difficulty: 'Standard',
    topic: teacher.title || 'Advanced Concept',
    concepts: [],
    estimated_learning_time: '5 mins'
  };

  const handleListen = () => {
    if (isSpeaking) {
      ttsService.stopNative();
      setIsSpeaking(false);
    } else {
      const speechText = `${teacher.title}. ${teacher.short_answer}. ${teacher.explanation}. ${teacher.summary}`;
      ttsService.speakNative(speechText, 1.0);
      setIsSpeaking(true);
    }
  };

  return (
    <div
      className={`professor-digital-board ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '24px',
        borderRadius: '20px',
        background: 'radial-gradient(ellipse at 50% 0%, #0a1124 0%, #040711 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.9), inset 0 0 30px rgba(56, 189, 248, 0.05)',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* =========================================================================
          DIGITAL CHALKBOARD TOP BAR: PROFESSOR MODE
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(56, 189, 248, 0.3) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.25)'
            }}
          >
            <GraduationCap size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: '#34d399',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase'
                }}
              >
                PROFESSOR MODE
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#a5b4fc',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                Level: {metadata.student_level}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#facc15',
                  background: 'rgba(250, 204, 21, 0.12)',
                  border: '1px solid rgba(250, 204, 21, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                Difficulty: {metadata.difficulty}
              </span>
            </div>

            <span
              style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                marginTop: '4px',
                display: 'block'
              }}
            >
              Prof. Arvind Sharma • Chair of Multimodal Scientific Pedagogy
            </span>
          </div>
        </div>

        {/* Audio Lecture & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleListen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: isSpeaking ? '#ef4444' : 'rgba(56, 189, 248, 0.15)',
              border: isSpeaking ? '1px solid #ef4444' : '1px solid rgba(56, 189, 248, 0.4)',
              color: isSpeaking ? '#ffffff' : '#7dd3fc',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Volume2 size={15} />
            <span>{isSpeaking ? 'Stop Spoken Lecture' : 'Listen to Spoken Lecture'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              title="Close Board"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: TOPIC
         ========================================================================= */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '16px 20px',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Academic Topic & Objective
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.25
          }}
        >
          {teacher.title || metadata.topic}
        </h2>

        {/* Short Executive Answer */}
        {teacher.short_answer && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#d1fae5',
              fontSize: '0.88rem',
              fontWeight: 600,
              lineHeight: 1.55
            }}
          >
            <strong>Core Insight:</strong> {teacher.short_answer}
          </div>
        )}

        {/* Learning Objective & Prerequisites */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {teacher.learning_objective && (
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <strong style={{ color: '#93c5fd' }}>Objective:</strong> {teacher.learning_objective}
            </p>
          )}

          {teacher.prerequisites && teacher.prerequisites.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>Prerequisites:</span>
              {teacher.prerequisites.map((p, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0'
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: EXPLANATION (Intuition, Core, Deep, Steps)
         ========================================================================= */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          padding: '18px 20px',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Pedagogical Explanation
          </span>
        </div>

        {/* Pedagogical Intuition */}
        {teacher.intuition && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <Lightbulb size={18} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                Intuition & Physical Mental Model:
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#fef3c7', lineHeight: 1.55 }}>
                {teacher.intuition}
              </p>
            </div>
          </div>
        )}

        {/* Core Explanation */}
        {teacher.explanation && (
          <div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.65 }}>
              {teacher.explanation}
            </p>
          </div>
        )}

        {/* Deep Technical Explanation */}
        {teacher.deep_explanation && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.07)',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Deep Technical Dive & Governing Principles:
            </span>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#e0e7ff', lineHeight: 1.6 }}>
              {teacher.deep_explanation}
            </p>
          </div>
        )}

        {/* Step-by-Step Breakdown */}
        {teacher.steps && teacher.steps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Logical Deductive Steps:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {teacher.steps.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 3: VISUAL EXPLANATION (Appears close to Explanation!)
         ========================================================================= */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Visual Explanation & Digital Board Visual Model
          </span>
        </div>

        {/* Master Visual Learning Renderer */}
        <ProfessorVisualRenderer visual={visual} />
      </section>

      {/* =========================================================================
          SECTION 4: FORMULA / DERIVATION
         ========================================================================= */}
      {((teacher.formulas && teacher.formulas.length > 0) || (teacher.derivation && teacher.derivation.length > 0)) && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '18px 20px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.35)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} color="#818cf8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Mathematical Formulations & Derivations
              </span>
            </div>

            {teacher.derivation && teacher.derivation.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDerivation(!showDerivation)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <span>{showDerivation ? 'Collapse Derivation' : 'Expand Derivation'}</span>
                {showDerivation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Formulas Code/Math Block */}
          {teacher.formulas && teacher.formulas.length > 0 && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: '#040711',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {teacher.formulas.map((form, idx) => (
                <div
                  key={idx}
                  style={{
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.88rem',
                    color: '#67e8f9',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ color: '#818cf8', fontWeight: 800 }}>[{idx + 1}]</span>
                  <span>{form}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step-by-Step Derivation Ladder */}
          {showDerivation && teacher.derivation && teacher.derivation.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                Step-by-Step Derivation Ladder:
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingLeft: '8px',
                  borderLeft: '2px solid rgba(99, 102, 241, 0.4)'
                }}
              >
                {teacher.derivation.map((der, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      color: '#cbd5e1',
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px'
                    }}
                  >
                    <strong>Step {idx + 1}:</strong> {der}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          SECTION 5: WORKED EXAMPLE
         ========================================================================= */}
      {teacher.example && Object.keys(teacher.example).length > 0 && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '18px 20px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(52, 211, 153, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={16} color="#34d399" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Worked Numerical / Applied Example
            </span>
          </div>

          {teacher.example.problem && (
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#f8fafc', fontWeight: 600 }}>
              <strong>Problem:</strong> {teacher.example.problem}
            </p>
          )}

          {teacher.example.steps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>Execution Steps:</span>
              {(Array.isArray(teacher.example.steps) ? teacher.example.steps : [teacher.example.steps]).map(
                (step: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                      padding: '6px 10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '6px'
                    }}
                  >
                    ➔ {typeof step === 'string' ? step : JSON.stringify(step)}
                  </div>
                )
              )}
            </div>
          )}

          {teacher.example.final_answer && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>Final Calculated Solution:</strong> {teacher.example.final_answer}</span>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          SECTION 6: APPLICATION
         ========================================================================= */}
      {teacher.applications && teacher.applications.length > 0 && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Real-World & Industrial Applications
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {teacher.applications.map((app, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {app}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 7: COMMON MISTAKES
         ========================================================================= */}
      {teacher.common_mistakes && teacher.common_mistakes.length > 0 && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#f87171" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Common Misconceptions & Pitfalls to Avoid
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {teacher.common_mistakes.map((mistake, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#fecaca',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <span style={{ color: '#ef4444', fontWeight: 800 }}>✖</span>
                <span>{mistake}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 8: SUMMARY & SOURCES
         ========================================================================= */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '16px 20px',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={16} color="#10b981" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Lecture Synthesis & Summary
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.86rem', color: '#f1f5f9', lineHeight: 1.6 }}>
          {teacher.summary}
        </p>

        {contract.sources && contract.sources.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>Primary Sources:</span>
            {contract.sources.map((src, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.7rem',
                  color: '#93c5fd',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                {src}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 9: CHECK YOUR UNDERSTANDING (Interactive Quiz)
         ========================================================================= */}
      {teacher.check_question && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '18px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.35)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="#c084fc" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Check Your Understanding (Professor Oral Exam Question)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowCheckAnswer(!showCheckAnswer)}
              style={{
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: showCheckAnswer ? '#a855f7' : 'rgba(168, 85, 247, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              {showCheckAnswer ? 'Hide Solution' : 'Reveal Professor Hint / Solution'}
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.55 }}>
            {teacher.check_question}
          </p>

          {showCheckAnswer && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#e9d5ff',
                fontSize: '0.82rem',
                lineHeight: 1.55
              }}
            >
              <strong style={{ color: '#d8b4fe' }}>Professor Solution / Reasoning:</strong>
              <p style={{ margin: '4px 0 0 0' }}>
                Evaluate the governing conservation laws and boundary parameters: check whether external net forces exist and how acceleration scales inversely with total system mass.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
