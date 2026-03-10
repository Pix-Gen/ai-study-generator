/**
 * Flashcard structure with question and answer
 */
export interface Flashcard {
    question: string;
    answer: string;
}

/**
 * Quiz question with multiple choice options
 */
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

/**
 * Complete study material including all generated content
 */
export interface StudyMaterial {
    reviewer: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
}

/**
 * API request payload for generating study materials
 */
export interface GenerateStudyRequest {
    material: string;
}

/**
 * API response containing parsed study materials
 */
export type GenerateStudyResponse = StudyMaterial;

/**
 * Error response from API
 */
export interface ErrorResponse {
    error: string;
}
