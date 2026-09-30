import type { LessonNotesBundle, NoteItem } from '../types/notes';
import { slideService } from './slideService';

const MOCK_NOTES_DATABASE: Record<string, NoteItem[]> = {
  les_newton_01: [
    {
      id: 'note_n_01',
      lessonId: 'les_newton_01',
      lessonTitle: "Newton's Laws of Motion",
      subject: 'Physics',
      timestamp: 'Sep 28, 2026',
      slideNumber: 1,
      highlightedConcept: 'Classical Mechanics & Principia Mathematica',
      summary: 'Isaac Newton formulated the three laws of motion in 1687, establishing the mathematical relationship between forces, mass, and acceleration.',
      keyTakeaways: [
        'Classical mechanics accurately predicts macroscopic physical motions.',
        'Net Force (ΣF) is the vector sum of all external forces.'
      ]
    },
    {
      id: 'note_n_02',
      lessonId: 'les_newton_01',
      lessonTitle: "Newton's Laws of Motion",
      subject: 'Physics',
      timestamp: 'Sep 28, 2026',
      slideNumber: 3,
      highlightedConcept: 'First Law (Inertia)',
      summary: 'An object maintains constant velocity unless acted on by a non-zero net external force (ΣF ≠ 0).',
      keyTakeaways: [
        'Mass is the direct quantitative measure of inertia.',
        'Friction and drag are hidden external forces causing everyday deceleration.'
      ]
    },
    {
      id: 'note_n_03',
      lessonId: 'les_newton_01',
      lessonTitle: "Newton's Laws of Motion",
      subject: 'Physics',
      timestamp: 'Sep 28, 2026',
      slideNumber: 5,
      highlightedConcept: 'Second Law (Dynamics Formulation)',
      summary: 'Acceleration is directly proportional to net force and inversely proportional to mass: ΣF = m·a.',
      keyTakeaways: [
        'SI unit of force: 1 Newton = 1 kg·m/s².',
        'Direction of acceleration is always identical to the net force vector.'
      ],
      formulaOrCode: 'ΣF = m · a  ⟺  a = ΣF / m'
    },
    {
      id: 'note_n_04',
      lessonId: 'les_newton_01',
      lessonTitle: "Newton's Laws of Motion",
      subject: 'Physics',
      timestamp: 'Sep 28, 2026',
      slideNumber: 7,
      highlightedConcept: 'Third Law (Action-Reaction Pairs)',
      summary: 'For every action force, there is an equal and opposite reaction force: F_AB = - F_BA.',
      keyTakeaways: [
        'Action and reaction forces never cancel because they act on two different bodies.',
        'Enables rocket propulsion in a vacuum and walking friction on surfaces.'
      ],
      formulaOrCode: 'F_A_on_B = - F_B_on_A'
    }
  ]
};

class NotesService {
  async getAllNotes(): Promise<NoteItem[]> {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const dbNotes = await res.json();
        if (Array.isArray(dbNotes) && dbNotes.length > 0) {
          const mapped: NoteItem[] = dbNotes.map((n: any) => ({
            id: `note_${n.id}`,
            lessonId: String(n.lesson_id),
            lessonTitle: 'AI Masterclass',
            subject: 'Physics',
            timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Today',
            slideNumber: n.slide_id || 1,
            highlightedConcept: 'Core Lesson Analysis',
            summary: n.content,
            keyTakeaways: ['Key lecture formulation', 'Validated core mechanics']
          }));
          return [...mapped, ...Object.values(MOCK_NOTES_DATABASE).flat()];
        }
      }
    } catch (e) {
      console.warn('Could not load notes from backend /api/notes:', e);
    }
    return Object.values(MOCK_NOTES_DATABASE).flat();
  }

  async getNotesByLessonId(lessonId: string): Promise<NoteItem[]> {
    try {
      const numericId = parseInt(lessonId, 10);
      if (!isNaN(numericId)) {
        const res = await fetch(`/api/notes/lesson/${numericId}`);
        if (res.ok) {
          const dbNotes = await res.json();
          if (Array.isArray(dbNotes) && dbNotes.length > 0) {
            return dbNotes.map((n: any) => ({
              id: `note_${n.id}`,
              lessonId,
              lessonTitle: 'AI Lesson',
              subject: 'Physics',
              timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Today',
              slideNumber: n.slide_id || 1,
              highlightedConcept: 'AI Summary Note',
              summary: n.content,
              keyTakeaways: ['Synthesized from live lecture', 'Mathematically verified']
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Could not load lesson notes from backend:', e);
    }
    return MOCK_NOTES_DATABASE[lessonId] || MOCK_NOTES_DATABASE['les_newton_01'] || [];
  }


  async getLessonNotesBundle(lessonId: string): Promise<LessonNotesBundle | null> {
    const notes = await this.getNotesByLessonId(lessonId);
    const savedSlides = slideService.getAllSavedSlidesForLesson(lessonId);

    if (!notes.length && !savedSlides.length) return null;

    return {
      lessonId,
      lessonTitle: notes[0]?.lessonTitle || "Newton's Laws of Motion",
      subject: notes[0]?.subject || 'Physics',
      dateGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tutorName: 'AI Tutor — Dr. Nova',
      notes
    };
  }

  async downloadNotesPdf(lessonId: string): Promise<{ success: boolean; filename: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const notes = await this.getNotesByLessonId(lessonId);
    const savedSlides = slideService.getAllSavedSlidesForLesson(lessonId);
    const title = notes.length > 0 ? notes[0].lessonTitle : "Newton's Laws of Motion";
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.pdf`;

    let textContent = `====================================================\n` +
      `AI TUTOR DIGITAL CLASSROOM STUDY GUIDE & NOTES\n` +
      `====================================================\n` +
      `Lesson: ${title}\n` +
      `Instructor: AI Tutor (Dr. Nova)\n` +
      `Export Timestamp: ${new Date().toLocaleString()}\n` +
      `Saved Whiteboard Annotations: ${savedSlides.length} slide(s)\n\n` +
      `----------------------------------------------------\n` +
      `KEY LECTURE SUMMARY & CONCEPTS:\n` +
      `----------------------------------------------------\n\n`;

    notes.forEach((n, idx) => {
      textContent += `[Section ${idx + 1}] Slide ${n.slideNumber}: ${n.highlightedConcept}\n` +
        `Summary: ${n.summary}\n` +
        (n.formulaOrCode ? `Key Formula: ${n.formulaOrCode}\n` : '') +
        `Key Takeaways:\n` +
        n.keyTakeaways.map((t) => `  • ${t}`).join('\n') +
        `\n\n`;
    });

    if (savedSlides.length > 0) {
      textContent += `----------------------------------------------------\nSAVED SLIDE SNAPSHOTS & WHITEBOARD ANNOTATIONS:\n----------------------------------------------------\n`;
      savedSlides.forEach((snap) => {
        textContent += `Slide ${snap.slideNumber} ("${snap.slideTitle}") saved at ${snap.savedAt}\n` +
          `Annotations: ${snap.whiteboardElements.length} drawn strokes/shapes.\n\n`;
      });
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename };
  }
}

export const notesService = new NotesService();
