import React from 'react';
import type { TeachingSlide, ContentElement } from '../../types/teaching';
import { BookOpen, AlertCircle, Cpu, FileText } from 'lucide-react';

interface ContentLayerProps {
  slide: TeachingSlide | null;
  currentTime: number;
}

export const ContentLayer: React.FC<ContentLayerProps> = ({ slide, currentTime }) => {
  if (!slide) return null;

  const renderElement = (el: ContentElement) => {
    // Visibility based on slide timeline timestamp
    const isVisible = currentTime >= el.animationDelay;
    const opacity = isVisible ? 1 : 0.04;
    const translateY = isVisible ? 0 : 12;
    const scale = isVisible ? 1 : 0.96;

    const transitionStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${el.position.x}%`,
      top: `${el.position.y}%`,
      width: `${el.dimensions.width}%`,
      height: `${el.dimensions.height}%`,
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: isVisible ? 'auto' : 'none'
    };

    switch (el.componentType) {
      case 'heading':
        return (
          <div key={el.id} style={transitionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#818cf8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                {el.title || 'Concept Focus'}
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {el.content}
            </h2>
          </div>
        );

      case 'definition':
        return (
          <div
            key={el.id}
            style={{
              ...transitionStyle,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(13, 15, 23, 0.75) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {el.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                <BookOpen size={14} />
                {el.title}
              </div>
            )}
            <p style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1.05rem)', color: '#f1f5f9', lineHeight: 1.55 }}>
              {el.content}
            </p>
          </div>
        );

      case 'formula':
        return (
          <div
            key={el.id}
            style={{
              ...transitionStyle,
              background: 'rgba(6, 7, 12, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {el.title && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                {el.title}
              </span>
            )}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(1rem, 1.4vw, 1.35rem)',
              fontWeight: 600,
              color: '#38bdf8',
              letterSpacing: '0.03em',
              whiteSpace: 'pre-wrap'
            }}>
              {el.content}
            </div>
          </div>
        );

      case 'diagram':
      case 'flowchart':
        return (
          <div
            key={el.id}
            style={{
              ...transitionStyle,
              background: 'rgba(13, 15, 23, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '14px',
              padding: '1.25rem',
              overflowY: 'auto'
            }}
          >
            {el.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                <Cpu size={14} />
                {el.title}
              </div>
            )}
            <div style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.92rem)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {el.content}
            </div>
          </div>
        );

      case 'note-box':
        return (
          <div
            key={el.id}
            style={{
              ...transitionStyle,
              background: 'rgba(245, 158, 11, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '14px',
              padding: '1.25rem',
              overflowY: 'auto'
            }}
          >
            {el.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                <AlertCircle size={14} />
                {el.title}
              </div>
            )}
            <p style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.9rem)', color: '#fef3c7', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
              {el.content}
            </p>
          </div>
        );

      case 'explanation':
      default:
        return (
          <div
            key={el.id}
            style={{
              ...transitionStyle,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '1.25rem',
              overflowY: 'auto'
            }}
          >
            {el.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                <FileText size={14} />
                {el.title}
              </div>
            )}
            <p style={{ fontSize: 'clamp(0.82rem, 1vw, 0.95rem)', color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
              {el.content}
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
      {/* Slide Subtitle / Header bar */}
      <div style={{ position: 'absolute', top: '2.5%', left: '4%', zIndex: 5 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Slide {slide.slideNumber} • {slide.title}
        </span>
      </div>

      {/* Render Slide Elements */}
      {slide.elements.map((el) => renderElement(el))}
    </div>
  );
};
