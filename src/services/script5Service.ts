/**
 * script5 Service Layer
 * ---------------------------------------------------
 * Calls the script5 FastAPI backend and normalizes responses.
 * Mirrors exactly the API routes in:
 *   app/api/classroom_routes.py
 *   app/api/routes.py     (prefix: /api/research)
 *   app/main.py           (prefix: /api for classroom_routes)
 *
 * Two route prefixes registered:
 *   - /api/research/classroom/lesson/generate  (GET)
 *   - /api/research/classroom/interrupt/doubt  (POST)
 *   - /api/classroom/professor/teach           (POST)
 */

import type {
  ClassroomLessonPlan,
  StudentDoubtRequest,
  StudentDoubtResponse,
} from '../types/script5';

const RESEARCH_API = '/api/research/classroom';
const CLASSROOM_API = '/api/classroom';

export interface BookUploadResponse {
  status: string;
  message: string;
  book_details?: {
    file_name: string;
    status: string;
    pages: number;
    chunks: number;
    saved_path: string;
    book_name: string;
    is_personal?: boolean;
  };
}

// ─── Lesson Generation ────────────────────────────────────────────────────────

/**
 * Calls GET /api/research/classroom/lesson/generate?topic=...&level=...
 * Prioritizes attached PDF (Priority 1) with automatic fallback to existing curriculum books.
 * Returns a full ClassroomLessonPlan with timed TeachingEvent[] timeline.
 */
export async function generateLessonTimeline(
  topic: string,
  level: string = 'Undergraduate',
  attachedPdfPath?: string,
  attachedPdfName?: string,
  sessionId?: string
): Promise<ClassroomLessonPlan> {
  const params = new URLSearchParams({ topic, level });
  if (attachedPdfPath) params.set('attached_pdf_path', attachedPdfPath);
  if (attachedPdfName) params.set('attached_pdf_name', attachedPdfName);
  if (sessionId) params.set('session_id', sessionId);

  const res = await fetch(`${RESEARCH_API}/lesson/generate?${params.toString()}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[script5] lesson/generate failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<ClassroomLessonPlan>;
}

/**
 * Uploads a PDF into the existing Books/database storage.
 * Runs PyMuPDF extraction, chunking, LSA/dense embeddings, and indexes it into the vector store.
 */
export async function uploadBookToStorage(file: File): Promise<BookUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  let res = await fetch('/api/books/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    // Fallback to /api/research/books/upload
    res = await fetch('/api/research/books/upload', {
      method: 'POST',
      body: formData,
    });
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to upload book to storage (${res.status}): ${body}`);
  }

  return res.json() as Promise<BookUploadResponse>;
}

/**
 * Registers an attached PDF with the active session in the backend.
 */
export async function attachSessionPdf(
  sessionId: string,
  filePathOrContent: string,
  documentName: string
): Promise<Record<string, any>> {
  const res = await fetch(`${RESEARCH_API}/session/attach_pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      file_path: filePathOrContent,
      document_name: documentName,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to register session PDF (${res.status}): ${body}`);
  }
  return res.json();
}

// ─── Student Doubt Resolution ─────────────────────────────────────────────────

/**
 * Calls POST /api/research/classroom/interrupt/doubt
 * Returns StudentDoubtResponse with resolution_events TeachingEvent[]
 */
export async function resolveStudentDoubt(
  request: StudentDoubtRequest
): Promise<StudentDoubtResponse> {
  const res = await fetch(`${RESEARCH_API}/interrupt/doubt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[script5] interrupt/doubt failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<StudentDoubtResponse>;
}

// ─── Professor-Level Conceptual Teaching ─────────────────────────────────────

/**
 * Calls POST /api/classroom/professor/teach
 * Returns the standardized Teacher Engine JSON contract.
 */
export async function professorTeach(
  question: string,
  topic: string = '',
  student_level: string = 'Intermediate',
  use_llm: boolean = true
): Promise<Record<string, any>> {
  const res = await fetch(`${CLASSROOM_API}/professor/teach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, topic: topic || question, student_level, use_llm }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[script5] professor/teach failed (${res.status}): ${body}`);
  }
  return res.json();
}
