import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { CreateLessonPayload, LessonHistoryItem, StudentProfile } from '../types/lesson';
import type { TeachingSlide, TranscriptSegment } from '../types/teaching';
import type { WhiteboardElement } from '../types/whiteboard';
import { lessonService, MOCK_STUDENT, MOCK_LESSONS, NEWTON_LESSON_SLIDES } from '../services/lessonService';
import { slideService } from '../services/slideService';
import { ttsService } from '../services/ttsService';

export type AppPage = 'home' | 'teaching';
export type TutorState = 'idle' | 'speaking' | 'paused' | 'listening' | 'answering';

interface TeachingContextType {
  // Navigation
  currentPage: AppPage;
  navigateTo: (page: AppPage) => void;

  // Student Profile
  student: StudentProfile;

  // Previous & Active Lessons
  lessons: LessonHistoryItem[];
  activeLesson: LessonHistoryItem | null;
  activeSlides: TeachingSlide[];
  isLoadingLessons: boolean;

  // Modal Controls
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;

  isNotesModalOpen: boolean;
  selectedNotesLessonId: string | null;
  openNotesModal: (lessonId?: string) => void;
  closeNotesModal: () => void;

  isProfessorBoardOpen: boolean;
  openProfessorBoard: () => void;
  closeProfessorBoard: () => void;

  // Teaching Room State Machine
  currentSlideIndex: number;
  currentSlide: TeachingSlide | null;
  totalSlides: number;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  lectureSpeed: number;
  tutorState: TutorState;
  currentTranscriptSegment: TranscriptSegment | null;
  currentTranscriptIndex: number;
  isDoubtOpen: boolean;
  doubtPausedTimestamp: number | null;
  whiteboardElements: WhiteboardElement[];
  savedSlidesMap: Record<number, boolean>;
  isFullscreen: boolean;

  // Teaching Room Actions
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  seekToTime: (timeSeconds: number) => void;
  setSpeed: (speed: number) => void;
  openDoubt: () => void;
  closeDoubt: () => void;
  resumeFromDoubt: () => void;
  saveCurrentSlide: () => Promise<void>;
  updateCurrentSlideWhiteboard: (elements: WhiteboardElement[]) => void;
  clearCurrentSlideWhiteboard: () => void;
  toggleFullscreen: (containerElement?: HTMLElement | null) => void;

  // Dashboard Actions
  createNewLesson: (payload: CreateLessonPayload) => Promise<void>;
  startOrContinueLesson: (lessonId: string) => void;
  toggleMockEmptyState: () => void;
  isMockEmpty: boolean;
}

const TeachingContext = createContext<TeachingContextType | undefined>(undefined);

export const TeachingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [student] = useState<StudentProfile>(MOCK_STUDENT);
  const [lessons, setLessons] = useState<LessonHistoryItem[]>(MOCK_LESSONS);
  const [activeLesson, setActiveLesson] = useState<LessonHistoryItem | null>(MOCK_LESSONS[0]);
  const [activeSlides, setActiveSlides] = useState<TeachingSlide[]>(NEWTON_LESSON_SLIDES);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isMockEmpty, setIsMockEmpty] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedNotesLessonId, setSelectedNotesLessonId] = useState<string | null>(null);
  const [isProfessorBoardOpen, setIsProfessorBoardOpen] = useState(false);

  const openProfessorBoard = useCallback(() => setIsProfessorBoardOpen(true), []);
  const closeProfessorBoard = useCallback(() => setIsProfessorBoardOpen(false), []);

  // Teaching Room Playback State Machine
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [lectureSpeed, setLectureSpeed] = useState<number>(1.0);
  const [tutorState, setTutorState] = useState<TutorState>('idle');
  const [isDoubtOpen, setIsDoubtOpen] = useState<boolean>(false);
  const [doubtPausedTimestamp, setDoubtPausedTimestamp] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Whiteboard & Saved state per slide
  const [whiteboardStore, setWhiteboardStore] = useState<Record<string, WhiteboardElement[]>>({});
  const [savedSlidesMap, setSavedSlidesMap] = useState<Record<number, boolean>>({});

  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0] || null;
  const currentSlideId = currentSlide ? currentSlide.id : 'slide-0';
  const whiteboardElements = whiteboardStore[currentSlideId] || [];

  // Active transcript calculation
  const currentTranscriptIndex = currentSlide?.transcript
    ? currentSlide.transcript.findIndex(
        (seg) => currentTime >= seg.startTime && currentTime <= seg.endTime
      )
    : -1;

  const currentTranscriptSegment =
    currentSlide && currentTranscriptIndex !== -1
      ? currentSlide.transcript[currentTranscriptIndex]
      : null;

  // Timeline ticker
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || isDoubtOpen || isPaused) {
      if (isDoubtOpen) setTutorState('listening');
      else if (isPaused) setTutorState('paused');
      else setTutorState('idle');
      return;
    }

    setTutorState('speaking');
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = ((now - lastTickRef.current) / 1000) * lectureSpeed;
      lastTickRef.current = now;

      setCurrentTime((prev) => {
        const slideMaxDuration = currentSlide ? currentSlide.audioDuration : 15;
        const nextTime = prev + deltaSeconds;

        if (nextTime >= slideMaxDuration) {
          // Slide completed! Auto advance if not last slide
          if (currentSlideIndex < activeSlides.length - 1) {
            setCurrentSlideIndex((s) => s + 1);
            return 0;
          } else {
            setIsPlaying(false);
            setTutorState('idle');
            return slideMaxDuration;
          }
        }
        return nextTime;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isDoubtOpen, lectureSpeed, currentSlide, currentSlideIndex, activeSlides.length]);

  const refreshLessons = useCallback(async () => {
    setIsLoadingLessons(true);
    try {
      const items = await lessonService.getLessons();
      if (!isMockEmpty) {
        setLessons(items);
      } else {
        setLessons([]);
      }
    } finally {
      setIsLoadingLessons(false);
    }
  }, [isMockEmpty]);

  useEffect(() => {
    refreshLessons();
  }, [refreshLessons]);

  const navigateTo = (page: AppPage) => {
    if (page === 'home' && isPlaying) {
      setIsPlaying(false);
      ttsService.stopNative();
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openNotesModal = (lessonId?: string) => {
    setSelectedNotesLessonId(lessonId || (activeLesson ? activeLesson.id : lessons[0]?.id) || null);
    setIsNotesModalOpen(true);
  };
  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedNotesLessonId(null);
  };

  // Lecture Actions
  const play = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setTutorState('speaking');
    if (currentTranscriptSegment) {
      ttsService.speakNative(currentTranscriptSegment.text, lectureSpeed);
    }
  };

  const pause = () => {
    setIsPlaying(false);
    setIsPaused(true);
    setTutorState('paused');
    ttsService.stopNative();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < activeSlides.length - 1) {
      ttsService.stopNative();
      setCurrentSlideIndex((prev) => prev + 1);
      setCurrentTime(0);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      ttsService.stopNative();
      setCurrentSlideIndex((prev) => prev - 1);
      setCurrentTime(0);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < activeSlides.length) {
      ttsService.stopNative();
      setCurrentSlideIndex(index);
      setCurrentTime(0);
    }
  };

  const seekToTime = (timeSeconds: number) => {
    const maxDur = currentSlide ? currentSlide.audioDuration : 15;
    setCurrentTime(Math.min(maxDur, Math.max(0, timeSeconds)));
  };

  const setSpeed = (speed: number) => {
    setLectureSpeed(speed);
  };

  // Doubt Interruption Flow
  const openDoubt = () => {
    setDoubtPausedTimestamp(currentTime);
    setIsPlaying(false);
    setIsPaused(true);
    setTutorState('listening');
    ttsService.stopNative();
    setIsDoubtOpen(true);
  };

  const closeDoubt = () => {
    setIsDoubtOpen(false);
  };

  const resumeFromDoubt = () => {
    setIsDoubtOpen(false);
    setIsPaused(false);
    setIsPlaying(true);
    setTutorState('speaking');
  };

  // Whiteboard & Snapshot Save
  const updateCurrentSlideWhiteboard = (elements: WhiteboardElement[]) => {
    setWhiteboardStore((prev) => ({
      ...prev,
      [currentSlideId]: elements
    }));
  };

  const clearCurrentSlideWhiteboard = () => {
    setWhiteboardStore((prev) => ({
      ...prev,
      [currentSlideId]: []
    }));
  };

  const saveCurrentSlide = async () => {
    if (!currentSlide || !activeLesson) return;
    await slideService.saveSlide({
      lessonId: activeLesson.id,
      slideNumber: currentSlide.slideNumber,
      slideTitle: currentSlide.title,
      whiteboardElements,
      contentElements: currentSlide.elements
    });
    setSavedSlidesMap((prev) => ({
      ...prev,
      [currentSlide.slideNumber]: true
    }));
  };

  const toggleFullscreen = (containerElement?: HTMLElement | null) => {
    if (!document.fullscreenElement) {
      const target = containerElement || document.documentElement;
      target.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Home Dashboard Actions
  const createNewLesson = async (payload: CreateLessonPayload) => {
    setIsLoadingLessons(true);
    try {
      const newLesson = await lessonService.createLesson(payload);
      setLessons((prev) => [newLesson, ...prev]);
      setActiveLesson(newLesson);
      setIsMockEmpty(false);
      setIsCreateModalOpen(false);

      const slides = await lessonService.getTeachingSlidesForLesson(newLesson.id);
      setActiveSlides(slides);
      setCurrentSlideIndex(0);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsPaused(false);

      setCurrentPage('teaching');
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const startOrContinueLesson = async (lessonId: string) => {
    const found = lessons.find((l) => l.id === lessonId) || (await lessonService.getLessonById(lessonId));
    if (found) {
      setActiveLesson(found);
      const slides = await lessonService.getTeachingSlidesForLesson(found.id);
      setActiveSlides(slides);
      setCurrentSlideIndex(0);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPage('teaching');
    }
  };

  const toggleMockEmptyState = () => {
    setIsMockEmpty((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        setLessons([]);
      } else {
        setLessons(MOCK_LESSONS);
      }
      return nextVal;
    });
  };

  return (
    <TeachingContext.Provider
      value={{
        currentPage,
        navigateTo,
        student,
        lessons,
        activeLesson,
        activeSlides,
        isLoadingLessons,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        isNotesModalOpen,
        selectedNotesLessonId,
        openNotesModal,
        closeNotesModal,
        isProfessorBoardOpen,
        openProfessorBoard,
        closeProfessorBoard,

        // Playback state
        currentSlideIndex,
        currentSlide,
        totalSlides: activeSlides.length,
        isPlaying,
        isPaused,
        currentTime,
        lectureSpeed,
        tutorState,
        currentTranscriptSegment,
        currentTranscriptIndex,
        isDoubtOpen,
        doubtPausedTimestamp,
        whiteboardElements,
        savedSlidesMap,
        isFullscreen,

        // Playback actions
        togglePlayPause,
        play,
        pause,
        nextSlide,
        prevSlide,
        goToSlide,
        seekToTime,
        setSpeed,
        openDoubt,
        closeDoubt,
        resumeFromDoubt,
        saveCurrentSlide,
        updateCurrentSlideWhiteboard,
        clearCurrentSlideWhiteboard,
        toggleFullscreen,

        // Dashboard actions
        createNewLesson,
        startOrContinueLesson,
        toggleMockEmptyState,
        isMockEmpty
      }}
    >
      {children}
    </TeachingContext.Provider>
  );
};

export const useTeaching = () => {
  const context = useContext(TeachingContext);
  if (!context) {
    throw new Error('useTeaching must be used within a TeachingProvider');
  }
  return context;
};
