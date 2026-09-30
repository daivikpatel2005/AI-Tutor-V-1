import React, { useEffect, useRef } from 'react';
import type { TeachingSlide } from '../../types/teaching';
import { useTeaching } from '../../state/teachingStore';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';
import { Volume2, Clock } from 'lucide-react';

interface TranscriptViewerProps {
  slide: TeachingSlide | null;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ slide }) => {
  const master = useOptionalMasterClassroom();
  const teaching = useTeaching();

  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const isMasterActive = !!(master && master.timeline && master.timeline.eventBoundaries?.length);

  const activeIndex = isMasterActive ? master.activeEventIndex : teaching.currentTranscriptIndex;

  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  // Master Teaching Timeline Event List
  if (isMasterActive && master.timeline) {
    return (
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '140px',
          overflowY: 'auto',
          paddingRight: '6px',
        }}
      >
        {master.timeline.eventBoundaries.map((b, idx) => {
          const isCurrent = idx === master.activeEventIndex;
          const isSpoken = master.currentTime > b.endSec;

          return (
            <div
              key={b.eventId || idx}
              ref={isCurrent ? activeItemRef : null}
              onClick={() => master.seekTo(b.startSec)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: isCurrent
                  ? 'rgba(99, 102, 241, 0.22)'
                  : isSpoken
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'transparent',
                border: isCurrent
                  ? '1px solid rgba(129, 140, 248, 0.6)'
                  : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: isCurrent ? '#38bdf8' : 'var(--text-muted)',
                  minWidth: '55px',
                  marginTop: '2px',
                }}
              >
                {isCurrent && master.isPlaying ? (
                  <Volume2 size={13} className="animate-pulse" color="#38bdf8" />
                ) : (
                  <Clock size={12} />
                )}
                <span>{b.startSec.toFixed(1)}s</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: isCurrent ? '#fde047' : '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>
                  {b.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.86rem',
                    lineHeight: 1.45,
                    color: isCurrent
                      ? '#ffffff'
                      : isSpoken
                      ? 'var(--text-secondary)'
                      : 'var(--text-muted)',
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {b.speechText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Legacy Fallback
  if (!slide || !slide.transcript || slide.transcript.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
        No audio transcript available for this lecture.
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '130px',
        overflowY: 'auto',
        paddingRight: '6px',
      }}
    >
      {slide.transcript.map((seg, idx) => {
        const isSpoken = teaching.currentTime > seg.endTime;
        const isCurrent = idx === teaching.currentTranscriptIndex;

        return (
          <div
            key={seg.id}
            ref={isCurrent ? activeItemRef : null}
            onClick={() => teaching.seekToTime(seg.startTime)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: isCurrent
                ? 'rgba(99, 102, 241, 0.16)'
                : isSpoken
                ? 'rgba(255, 255, 255, 0.02)'
                : 'transparent',
              border: isCurrent
                ? '1px solid rgba(99, 102, 241, 0.4)'
                : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isCurrent ? '#818cf8' : 'var(--text-muted)',
                minWidth: '55px',
                marginTop: '2px',
              }}
            >
              {isCurrent && teaching.tutorState === 'speaking' ? (
                <Volume2 size={13} className="animate-pulse" color="#818cf8" />
              ) : (
                <Clock size={12} />
              )}
              <span>{seg.startTime.toFixed(1)}s</span>
            </div>

            <p
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: isCurrent
                  ? '#ffffff'
                  : isSpoken
                  ? 'var(--text-secondary)'
                  : 'var(--text-muted)',
                fontWeight: isCurrent ? 600 : 400,
                flex: 1,
              }}
            >
              {seg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};
