
export type View = 'home' | 'doubt' | 'notes' | 'summarizer' | 'flashcards' | 'tutor' | 'timer' | 'quiz' | 'voice' | 'saved' | 'essay' | 'planner' | 'code' | 'eli5' | 'math' | 'homework' | 'diagram' | 'formula' | 'tracker' | 'ocr' | 'citation' | 'whiteboard';

export interface User {
  name: string;
  email: string;
}

export interface SavedItem {
  id: string;
  type: 'note' | 'flashcard_set' | 'quiz' | 'essay_feedback' | 'plan' | 'code_explanation' | 'eli5' | 'doubt_solution' | 'math_solution' | 'genie_chat' | 'homework_solution' | 'diagram' | 'formula_sheet' | 'ocr_note' | 'citation' | 'whiteboard_analysis' | 'chat_history';
  title: string;
  content: any; // Can be string or object depending on type
  timestamp: number;
}

// Keeping legacy types for compatibility, though SavedItem supersedes them for storage
export interface Note {
  id: string;
  topic: string;
  summary: string;
  details: string;
  examples: string;
  timestamp: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  learned: boolean;
}

export interface FlashcardSet {
  id: string;
  topic: string;
  cards: Flashcard[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface TutorPersona {
  id: string;
  name: string;
  role: string;
  emoji: string;
  systemInstruction: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  explanation: string;
}

export interface StudySession {
    subject: string;
    duration: number; // minutes
    timestamp: number;
}

export interface SubjectProgress {
    subject: string;
    totalHours: number;
    chaptersCompleted: number;
    totalChapters: number;
    weakAreas: string[];
}