export type StudentLevel = 'Elementary' | 'Middle School' | 'High School' | 'Undergraduate' | 'Professional' | 'Lifelong Learner';

export type TeachingStyle = 'Socratic & Inquiring' | 'Conceptual & Visual' | 'Step-by-Step Practical' | 'Fast-Paced & Intensive' | 'Analogy & Storytelling';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CreateLessonPayload {
  topic: string;
  subject: string;
  level: StudentLevel;
  durationMinutes: number;
  teachingStyle: TeachingStyle;
  difficulty: Difficulty;
}

export interface LessonHistoryItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  durationMinutes: number;
  progress: number; // 0 to 100
  lastAccessed: string;
  totalSlides: number;
  completedSlides: number;
  description?: string;
  thumbnailGradient?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  streakDays: number;
  totalLessonsCompleted: number;
}
