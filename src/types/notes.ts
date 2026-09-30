export interface NoteItem {
  id: string;
  lessonId: string;
  lessonTitle: string;
  subject: string;
  timestamp: string;
  slideNumber: number;
  highlightedConcept: string;
  summary: string;
  keyTakeaways: string[];
  formulaOrCode?: string;
}

export interface LessonNotesBundle {
  lessonId: string;
  lessonTitle: string;
  subject: string;
  dateGenerated: string;
  tutorName: string;
  notes: NoteItem[];
}
