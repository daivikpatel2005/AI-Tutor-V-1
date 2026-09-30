import React, { useState } from 'react';
import { useTeaching } from '../../state/teachingStore';
import { useOptionalMasterClassroom } from '../../context/MasterClassroomContext';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Bookmark,
  Maximize,
  Minimize
} from 'lucide-react';

interface LectureControlsProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const LectureControls: React.FC<LectureControlsProps> = ({ containerRef }) => {
  const master = useOptionalMasterClassroom();
  const teaching = useTeaching();

  const isMasterActive = !!(master && master.timeline);

  const currentSlideIndex = isMasterActive ? master.activeEventIndex : teaching.currentSlideIndex;
  const totalSlides = isMasterActive ? master.timeline!.eventBoundaries.length : teaching.totalSlides;
  const currentSlide = teaching.currentSlide;
  const isPlaying = isMasterActive ? master.isPlaying : teaching.isPlaying;
  const currentTime = isMasterActive ? master.currentTime : teaching.currentTime;
  const lectureSpeed = isMasterActive ? master.playbackSpeed : teaching.lectureSpeed;
  const togglePlayPause = isMasterActive ? master.togglePlayPause : teaching.togglePlayPause;
  const prevSlide = isMasterActive ? master.prevStep : teaching.prevSlide;
  const nextSlide = isMasterActive ? master.nextStep : teaching.nextSlide;
  const seekToTime = isMasterActive ? master.seekTo : teaching.seekToTime;
  const setSpeed = isMasterActive ? master.setSpeed : teaching.setSpeed;

  const {
    saveCurrentSlide,
    savedSlidesMap,
    toggleFullscreen,
    isFullscreen
  } = teaching;

  const [isSaving, setIsSaving] = useState(false);
  const isCurrentSlideSaved = currentSlide ? !!savedSlidesMap[currentSlide.slideNumber] : false;
  const maxDuration = isMasterActive ? master.totalDuration : (currentSlide ? currentSlide.audioDuration : 15);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCurrentSlide();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekToTime(parseFloat(e.target.value));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '16px',
        background: 'rgba(13, 15, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Timeline Scrubber Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '34px' }}>
          {currentTime.toFixed(1)}s
        </span>

        <input
          type="range"
          min="0"
          max={maxDuration}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            height: '4px',
            accentColor: '#6366f1',
            cursor: 'pointer'
          }}
        />

        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '34px' }}>
          {maxDuration.toFixed(1)}s
        </span>
      </div>

      {/* Main Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Left: Slide Number & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: currentSlideIndex === 0 ? 'var(--text-muted)' : '#ffffff',
              cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer'
            }}
            title="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Slide 01 / 09 Counter */}
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)'
          }}>
            {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === totalSlides - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: currentSlideIndex === totalSlides - 1 ? 'var(--text-muted)' : '#ffffff',
              cursor: currentSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer'
            }}
            title="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Center: Prominent Play / Pause Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={togglePlayPause}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '999px',
              background: isPlaying
                ? 'rgba(239, 68, 68, 0.15)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: isPlaying ? '1px solid #ef4444' : 'none',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isPlaying ? 'none' : '0 4px 16px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            {isPlaying ? <Pause size={16} fill="#ffffff" /> : <Play size={16} fill="#ffffff" />}
            <span>{isPlaying ? 'Pause Lecture' : 'Play Lecture'}</span>
          </button>
        </div>

        {/* Right: Save Slide, Speed Selector & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Save This Slide */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: isCurrentSlideSaved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: isCurrentSlideSaved ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              color: isCurrentSlideSaved ? '#10b981' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Save slide annotations & snapshot"
          >
            {isCurrentSlideSaved ? <BookmarkCheck size={14} color="#10b981" /> : <Bookmark size={14} />}
            <span>{isSaving ? 'Saving...' : isCurrentSlideSaved ? 'Slide Saved' : 'Save Slide'}</span>
          </button>

          {/* Speed Selector (0.75x, 1x, 1.25x, 1.5x, 2x) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '3px 6px',
                  borderRadius: '5px',
                  background: lectureSpeed === s ? '#6366f1' : 'transparent',
                  border: 'none',
                  color: lectureSpeed === s ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => toggleFullscreen(containerRef?.current)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
