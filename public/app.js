// Type definitions (JSDoc)
/** @typedef {Object} Flashcard
 * @property {string} question
 * @property {string} answer
 */

/** @typedef {Object} QuizQuestion
 * @property {string} question
 * @property {string[]} options
 * @property {string} correctAnswer
 */

/** @typedef {Object} StudyMaterial
 * @property {string} reviewer
 * @property {Flashcard[]} flashcards
 * @property {QuizQuestion[]} quiz
 */

let quizAnswers = [];
let currentMaterial = null;

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorEl = document.getElementById("errorMessage");
    errorEl.textContent = message;
    errorEl.classList.add("show");
    setTimeout(() => errorEl.classList.remove("show"), 5000);
}

/**
 * Show/hide loading spinner
 * @param {boolean} show - Whether to show the loading indicator
 */
function setLoading(show) {
    const loading = document.getElementById("loading");
    const btn = document.getElementById("generateBtn");
    if (show) {
        loading.classList.add("show");
        btn.disabled = true;
    } else {
        loading.classList.remove("show");
        btn.disabled = false;
    }
}

/**
 * Read uploaded file (PDF or text)
 */
async function readFile() {
    try {
        const file = document.getElementById("fileInput").files[0];

        if (!file) {
            showError("❌ Please upload a file first");
            return;
        }

        setLoading(true);
        let text = "";

        if (file.type === "application/pdf") {
            text = await readPDF(file);
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            text = await file.text();
        } else {
            showError("❌ Unsupported file type. Please use PDF or TXT.");
            setLoading(false);
            return;
        }

        if (!text.trim()) {
            showError("❌ File is empty. Please upload a file with content.");
            setLoading(false);
            return;
        }

        await generateStudy(text);
    } catch (error) {
        showError(`❌ Error reading file: ${error.message}`);
        console.error(error);
    } finally {
        setLoading(false);
    }
}

/**
 * Read text content from PDF file
 * @param {File} file - PDF file
 * @returns {Promise<string>} Extracted text from PDF
 */
async function readPDF(file) {
    try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            content.items.forEach((item) => {
                text += item.str + " ";
            });
        }

        return text;
    } catch (error) {
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
}

/**
 * Generate study materials via backend API
 * @param {string} text - Study material text
 */
async function generateStudy(text) {
    try {
        const response = await fetch("/api/generate-study", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ material: text }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to generate study materials");
        }

        const data = await response.json();
        currentMaterial = data;
        displayOutput(data);
    } catch (error) {
        showError(`❌ API Error: ${error.message}`);
        console.error(error);
    }
}

/**
 * Display generated study materials
 * @param {StudyMaterial} material - Parsed study material
 */
function displayOutput(material) {
    // Display reviewer
    const reviewerEl = document.getElementById("reviewer");
    const reviewerText = material.reviewer || "No reviewer generated";
    reviewerEl.innerHTML = `<p>${escapeHtml(reviewerText)}</p>`;
    document.getElementById("reviewerButtons").style.display = "flex";

    // Create flashcards
    createFlashcards(material.flashcards || []);

    // Create quiz
    createQuiz(material.quiz || []);
    document.getElementById("quizButtons").style.display = "flex";
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Create and display flashcards
 * @param {Flashcard[]} flashcards - Array of flashcard objects
 */
function createFlashcards(flashcards) {
    const container = document.getElementById("flashcards");
    container.innerHTML = "";

    if (!flashcards || flashcards.length === 0) {
        container.innerHTML = "<p>⚠️ No flashcards generated.</p>";
        return;
    }

    flashcards.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.className = "flashcard";
        cardEl.setAttribute("aria-label", `Flashcard ${index + 1}`);
        cardEl.setAttribute("role", "button");
        cardEl.setAttribute("tabindex", "0");

        const contentEl = document.createElement("div");
        contentEl.className = "flashcard-content";
        contentEl.textContent = `Q: ${card.question}`;

        cardEl.appendChild(contentEl);

        let isFlipped = false;
        const toggleFlip = () => {
            isFlipped = !isFlipped;
            if (isFlipped) {
                contentEl.textContent = `A: ${card.answer}`;
                cardEl.classList.add("flipped");
            } else {
                contentEl.textContent = `Q: ${card.question}`;
                cardEl.classList.remove("flipped");
            }
        };

        cardEl.addEventListener("click", toggleFlip);
        cardEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFlip();
            }
        });

        container.appendChild(cardEl);
    });
}

/**
 * Create and display quiz questions
 * @param {QuizQuestion[]} quizQuestions - Array of quiz questions
 */
function createQuiz(quizQuestions) {
    const quizEl = document.getElementById("quiz");
    quizEl.innerHTML = "";

    if (!quizQuestions || quizQuestions.length === 0) {
        quizEl.innerHTML = "<p>⚠️ No quiz questions generated.</p>";
        return;
    }

    quizAnswers = [];

    quizQuestions.forEach((q, index) => {
        const qEl = document.createElement("div");
        qEl.className = "quiz-question";

        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${q.question}`;
        qEl.appendChild(questionText);

        // Shuffle options for variety
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach((option) => {
            const optionEl = document.createElement("div");
            optionEl.className = "quiz-option";

            const radioId = `q${index}_${option}`;
            const label = document.createElement("label");

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `q${index}`;
            radio.value = option;
            radio.id = radioId;

            const labelText = document.createElement("span");
            labelText.textContent = option;

            label.appendChild(radio);
            label.appendChild(labelText);
            optionEl.appendChild(label);
            qEl.appendChild(optionEl);
        });

        quizEl.appendChild(qEl);
        quizAnswers.push(q.correctAnswer);
    });
}

/**
 * Submit quiz and calculate score
 */
function submitQuiz() {
    if (quizAnswers.length === 0) {
        showError("❌ No quiz available to submit");
        return;
    }

    let score = 0;

    for (let i = 0; i < quizAnswers.length; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === quizAnswers[i]) {
            score++;
        }
    }

    const percentage = Math.round((score / quizAnswers.length) * 100);
    const scoreEl = document.getElementById("score");
    
    let message = "🎉 Excellent!";
    if (percentage < 50) message = "📚 Keep studying!";
    else if (percentage < 70) message = "👍 Good effort!";
    else if (percentage < 90) message = "⭐ Great job!";

    scoreEl.innerHTML = `
        <div>
            <p>${message}</p>
            <p>Score: ${score}/${quizAnswers.length} (${percentage}%)</p>
        </div>
    `;
    scoreEl.classList.add("show");

    // Scroll to score
    scoreEl.scrollIntoView({ behavior: "smooth" });
}

/**
 * Download reviewer as text file
 */
function downloadReviewer() {
    if (!currentMaterial || !currentMaterial.reviewer) {
        showError("❌ No reviewer content to download");
        return;
    }

    const text = currentMaterial.reviewer;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `reviewer-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();

    URL.revokeObjectURL(link.href);
}
