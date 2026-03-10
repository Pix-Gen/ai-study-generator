import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Type definitions
interface Flashcard {
    question: string;
    answer: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface StudyMaterial {
    reviewer: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
}

interface GenerateStudyRequest {
    material: string;
}

interface ErrorResponse {
    error: string;
}

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "../public")));

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validate API key exists
 */
function validateApiKey(): boolean {
    if (!process.env.OPENAI_API_KEY) {
        console.error("ERROR: OPENAI_API_KEY environment variable is not set");
        return false;
    }
    return true;
}

/**
 * Parse study material from AI response
 */
function parseStudyMaterial(content: string): StudyMaterial {
    const sections = content.split(/\n(?=##\s)/);

    let reviewer = "";
    let flashcardsText = "";
    let quizText = "";

    sections.forEach((section) => {
        if (section.toLowerCase().includes("reviewer") || section.toLowerCase().includes("summary")) {
            reviewer = section
                .replace(/^##\s+Reviewer.*?\n/i, "")
                .replace(/^##\s+Summary.*?\n/i, "")
                .trim();
        } else if (section.toLowerCase().includes("flashcard")) {
            flashcardsText = section.replace(/^##\s+Flashcards?\n/i, "").trim();
        } else if (section.toLowerCase().includes("quiz")) {
            quizText = section.replace(/^##\s+Quiz\n/i, "").trim();
        }
    });

    const flashcards = parseFlashcards(flashcardsText);
    const quiz = parseQuiz(quizText);

    return { reviewer, flashcards, quiz };
}

/**
 * Parse flashcards from text
 */
function parseFlashcards(text: string): Flashcard[] {
    const flashcards: Flashcard[] = [];
    const lines = text.split("\n").filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const qMatch = line.match(/(?:\d+\.\s*)?Q(?:uestion)?:\s*(.*)/i);

        if (qMatch) {
            const question = qMatch[1].trim();
            let answer = "";

            for (let j = i + 1; j < lines.length; j++) {
                const aMatch = lines[j].match(/(?:\d+\.\s*)?A(?:nswer)?:\s*(.*)/i);
                if (aMatch) {
                    answer = aMatch[1].trim();
                    i = j;
                    break;
                }
            }

            if (answer) {
                flashcards.push({ question, answer });
            }
        }
    }

    return flashcards.slice(0, 10);
}

/**
 * Parse quiz from text
 */
function parseQuiz(text: string): QuizQuestion[] {
    const quiz: QuizQuestion[] = [];
    const lines = text.split("\n").filter((line) => line.trim());

    let currentQuestion: Partial<QuizQuestion> | null = null;
    let currentOptions: string[] = [];

    lines.forEach((line) => {
        const qMatch = line.match(/^\d+\.\s*(.+?)(?:\?|$)/);
        if (qMatch) {
            if (currentQuestion && currentOptions.length > 0) {
                quiz.push({
                    question: currentQuestion.question || "",
                    options: currentOptions,
                    correctAnswer: currentQuestion.correctAnswer || "A",
                });
            }

            currentQuestion = { question: qMatch[1].trim() };
            currentOptions = [];
        }

        const optMatch = line.match(/^([A-D])[).\s]+(.+?)(?:\s*[\*✓].*)?$/i);
        if (optMatch && currentQuestion) {
            const letter = optMatch[1].toUpperCase();
            const text = optMatch[2].trim();
            currentOptions.push(text);

            if (line.includes("*") || line.includes("✓") || line.includes("correct")) {
                currentQuestion.correctAnswer = letter;
            }
        }
    });

    if (currentQuestion && currentOptions.length > 0) {
        quiz.push({
            question: currentQuestion.question || "",
            options: currentOptions,
            correctAnswer: currentQuestion.correctAnswer || "A",
        });
    }

    return quiz.slice(0, 20);
}

/**
 * Error handling middleware
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({
        error: "Internal server error. Please try again.",
    } as ErrorResponse);
});

/**
 * Generate study materials via OpenAI
 */
app.post("/api/generate-study", async (req: Request, res: Response) => {
    try {
        if (!validateApiKey()) {
            return res.status(500).json({
                error: "Server configuration error: OpenAI API key not set",
            } as ErrorResponse);
        }

        const { material } = req.body as GenerateStudyRequest;

        if (!material || !material.trim()) {
            return res.status(400).json({ error: "Study material is required" } as ErrorResponse);
        }

        if (material.length > 100000) {
            return res.status(400).json({
                error: "Study material is too long (max 100,000 characters)",
            } as ErrorResponse);
        }

        const prompt = `You are an expert educator. Read the following study material and produce:

1. **Reviewer Summary**: A concise overview of the key concepts (300-500 words)
2. **10 Flashcards**: Format each as "Q: [question]" followed by "A: [answer]"
3. **20 Quiz Questions**: Multiple choice with 4 options (A-D) each. Mark correct answer with (*)

Format your response EXACTLY like this:

## Reviewer Summary
[summary here]

## Flashcards
Q: What is the definition of X?
A: X is defined as...
Q: How does Y work?
A: Y works by...
(continue until 10 total)

## Quiz
1. What is the main concept?
A) Option A (*)
B) Option B
C) Option C
D) Option D

2. Which of the following is true?
A) Option 1
B) Option 2 (*)
C) Option 3
D) Option 4

(continue until 20 total)

Study Material:
${material.substring(0, 50000)}`;

        const message = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
        });

        const content = message.choices[0].message.content || "";
        const parsed = parseStudyMaterial(content);

        res.json(parsed as StudyMaterial);
    } catch (error) {
        console.error("Error generating study materials:", error);

        if (error instanceof Error) {
            if (error.message.includes("API key") || error.message.includes("401")) {
                return res.status(401).json({ error: "Invalid OpenAI API key" } as ErrorResponse);
            }
            if (error.message.includes("rate")) {
                return res.status(429).json({ error: "API rate limit exceeded. Please try again later." } as ErrorResponse);
            }
            return res.status(500).json({ error: `Error: ${error.message}` } as ErrorResponse);
        }

        res.status(500).json({
            error: "Failed to generate study materials. Please try again.",
        } as ErrorResponse);
    }
});

/**
 * Health check endpoint
 */
app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log(`🎓 AI Study Generator running on http://localhost:${PORT}`);
    if (validateApiKey()) {
        console.log("✓ OpenAI API configured");
    } else {
        console.log("⚠ WARNING: OpenAI API key not configured");
    }
});
