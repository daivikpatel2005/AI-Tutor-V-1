import type { WhiteboardElement } from '../types/whiteboard';
import type { ContentElement } from '../types/teaching';

export interface SavedSlideSnapshot {
  id: string;
  lessonId: string;
  slideNumber: number;
  slideTitle: string;
  savedAt: string;
  whiteboardElements: WhiteboardElement[];
  contentElements: ContentElement[];
}

class SlideService {
  private savedSnapshots: Record<string, SavedSlideSnapshot> = {};

  async saveSlide(snapshot: Omit<SavedSlideSnapshot, 'id' | 'savedAt'>): Promise<SavedSlideSnapshot> {
    const id = `snap_${snapshot.lessonId}_slide_${snapshot.slideNumber}_${Date.now()}`;
    const fullSnapshot: SavedSlideSnapshot = {
      ...snapshot,
      id,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    this.savedSnapshots[`${snapshot.lessonId}_${snapshot.slideNumber}`] = fullSnapshot;
    
    try {
      await fetch('/api/slides/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullSnapshot)
      });
    } catch (e) {
      console.warn('Could not persist slide to backend DB:', e);
    }
    return fullSnapshot;
  }


  getSavedSlide(lessonId: string, slideNumber: number): SavedSlideSnapshot | null {
    return this.savedSnapshots[`${lessonId}_${slideNumber}`] || null;
  }

  getAllSavedSlidesForLesson(lessonId: string): SavedSlideSnapshot[] {
    return Object.values(this.savedSnapshots).filter((s) => s.lessonId === lessonId);
  }
}

export const slideService = new SlideService();
