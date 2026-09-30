import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { LessonHistory } from '../../components/home/LessonHistory';
import { CreateLessonModal } from '../../components/home/CreateLessonModal';
import { NotesModal } from '../../components/home/NotesModal';

export const HomePage: React.FC = () => {
  return (
    <div className="container-custom animate-fade-in">
      <HeroSection />
      <LessonHistory />
      <CreateLessonModal />
      <NotesModal />
    </div>
  );
};
