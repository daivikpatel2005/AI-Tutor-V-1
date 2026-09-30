export type ContentElementType =
  | 'heading'
  | 'title'
  | 'text'
  | 'definition'
  | 'diagram'
  | 'formula'
  | 'flowchart'
  | 'explanation'
  | 'note-box';

export type AnimationType = 'fade-in' | 'slide-up' | 'scale-in' | 'typewriter' | 'glow-pulse';

export interface ContentElement {
  id: string;
  componentType: ContentElementType;
  position: {
    x: number; // percentage or px within standard 16:9 canvas (1920x1080)
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  animationDelay: number; // in seconds from slide start
  animationType: AnimationType;
  title?: string;
  content: string;
  highlightWords?: string[];
  metadata?: Record<string, unknown>;
}

export interface TranscriptSegment {
  id: string;
  startTime: number; // seconds
  endTime: number;
  speaker: 'tutor' | 'student';
  text: string;
  highlightConcept?: string;
}

export interface TeachingSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  audioDuration: number; // in seconds
  elements: ContentElement[];
  transcript: TranscriptSegment[];
  tutorMood?: 'neutral' | 'explaining' | 'encouraging' | 'thoughtful' | 'celebrating';
  visemeKeyframes?: Array<{ time: number; viseme: string }>;
}

export interface TeachingSession {
  id: string;
  lessonId: string;
  title: string;
  subject: string;
  currentSlideIndex: number;
  totalSlides: number;
  slides: TeachingSlide[];
  speed: number;
  isPlaying: boolean;
  isPaused: boolean;
  isAudioLoading: boolean;
  isDoubtActive: boolean;
  savedSlides: Record<number, boolean>;
}
