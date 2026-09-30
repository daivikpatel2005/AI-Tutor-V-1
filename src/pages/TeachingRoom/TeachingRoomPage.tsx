import React, { useRef, useState } from 'react';
import { useTeaching } from '../../state/teachingStore';
import { ClassroomHeader } from '../../components/teaching/layout/ClassroomHeader';
import { ClassroomSidebar, type SidebarTab } from '../../components/teaching/layout/ClassroomSidebar';
import { ClassroomDockTabs } from '../../components/teaching/layout/ClassroomDockTabs';
import { ResearchDrawersModal } from '../../components/teaching/layout/ResearchDrawersModal';
import { TeachingCanvas } from '../../components/teaching/TeachingCanvas';
import { TeacherExplanationBar } from '../../components/teaching/TeacherExplanationBar';
import { VisualLearningArea } from '../../components/teaching/visuals/VisualLearningArea';
import { MasterTimelineBar } from '../../components/teaching/MasterTimelineBar';
import { DoubtPanel } from '../../components/teaching/DoubtPanel';
import { NotesModal } from '../../components/home/NotesModal';
import { ProfessorBoardModal } from '../../components/teaching/ProfessorBoardModal';
import { MasterClassroomProvider } from '../../context/MasterClassroomContext';
import { SocraticCheckQuestionModal } from '../../components/teaching/SocraticCheckQuestionModal';
import { StudentQuestionBar } from '../../components/teaching/StudentQuestionBar';
import type { BoardLiveState, ClassroomLessonPlan } from '../../types/script5';

export const TeachingRoomPage: React.FC = () => {
  const { currentSlide, isProfessorBoardOpen, closeProfessorBoard, openDoubt, openNotesModal, activeLesson } = useTeaching();
  const classroomContainerRef = useRef<HTMLDivElement | null>(null);

  // Synchronized state from script5 DigitalBlackboard
  const [boardLiveState, setBoardLiveState] = useState<BoardLiveState | null>(null);
  const [lessonPlan, setLessonPlan] = useState<ClassroomLessonPlan | null>(null);

  // Sidebar navigation & Modal drawer state
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('learn');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [modalDrawerType, setModalDrawerType] = useState<'books' | 'research' | 'history' | null>(null);

  return (
    <MasterClassroomProvider initialTopic={currentSlide?.title || 'Glacier Mass Balance'}>
      <div
        ref={classroomContainerRef}
        className="animate-fade-in"
        style={{
          minHeight: '100vh',
          background: '#04060d',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
          position: 'relative',
          overflowX: 'hidden'
        }}
      >
        {/* ── 1. TOP HEADER: Logo | Topic | Sources | Progress | Settings ── */}
        <ClassroomHeader
          onOpenBooks={() => setModalDrawerType('books')}
          onOpenResearch={() => setModalDrawerType('research')}
          onOpenNotes={() => openNotesModal(activeLesson?.id)}
        />

        {/* Master Timeline Scrubber & Live Track Status Strip */}
        <div style={{ padding: '0.65rem 1.25rem 0 1.25rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <MasterTimelineBar />
        </div>

        {/* ── 2. MAIN HORIZONTAL SECTION: SIDEBAR + PROFESSOR AREA ────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '0.75rem 1.25rem',
            gap: '1rem',
            alignItems: 'stretch'
          }}
        >
          {/* SIDEBAR: Ask | Learn | Books | Research | Library | History */}
          <ClassroomSidebar
            activeTab={activeSidebarTab}
            onSelectTab={(tab) => {
              setActiveSidebarTab(tab);
              if (tab === 'books' || tab === 'research' || tab === 'history') {
                setModalDrawerType(tab);
              }
            }}
            isExpanded={isSidebarExpanded}
            onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
            onOpenDoubt={openDoubt}
            onOpenNotes={() => openNotesModal(activeLesson?.id)}
          />

          {/* PROFESSOR AREA: Large Central Teaching Area */}
          <section
            aria-label="Professor Area"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: 0
            }}
          >
            {/* Primary Teaching Surface: 16:9 Digital Blackboard with 3D Avatar */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <TeachingCanvas
                onBoardStateChange={setBoardLiveState}
                onLessonPlanChange={setLessonPlan}
              />
            </div>

            {/* Professor Narration & Speech Bar */}
            <div style={{ width: '100%' }}>
              <TeacherExplanationBar
                boardState={boardLiveState}
                lessonPlan={lessonPlan}
              />
            </div>

            {/* Student Inquiry & File Attachment Bar */}
            <div style={{ width: '100%' }}>
              <StudentQuestionBar />
            </div>
          </section>
        </div>

        {/* ── 3. VISUAL LEARNING AREA (IMAGES & GRAPHS) ───────────────── */}
        <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 1.25rem 1.25rem 1.25rem' }}>
          <VisualLearningArea
            boardState={boardLiveState}
            lessonPlan={lessonPlan}
            onOpenSources={() => setModalDrawerType('books')}
          />
        </div>

        {/* ── 4. CLASSROOM DOCK TABS: Explanation | Formula | Example | Sources | Ask Professor ── */}
        <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 1.25rem 2.5rem 1.25rem' }}>
          <ClassroomDockTabs
            onOpenBooksModal={() => setModalDrawerType('books')}
            onOpenResearchModal={() => setModalDrawerType('research')}
          />
        </div>

        {/* ── Modals & Drawers ────────────────────────────────────────── */}
        <ResearchDrawersModal
          type={modalDrawerType}
          onClose={() => setModalDrawerType(null)}
        />
        <DoubtPanel />
        <NotesModal />
        <SocraticCheckQuestionModal />
        <ProfessorBoardModal
          isOpen={isProfessorBoardOpen}
          onClose={closeProfessorBoard}
          initialTopic={currentSlide?.title}
        />
      </div>
    </MasterClassroomProvider>
  );
};

