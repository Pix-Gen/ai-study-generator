# AI Study Generator

An intelligent study material generator that transforms documents (PDF/TXT) into:
- 📋 Concise reviewer summaries
- 🔄 10 interactive flashcards
- ❓ 20-question multiple choice quiz

Powered by **OpenAI GPT-4o-mini** with a secure backend and modern frontend.

## ✨ Features

✅ **PDF & Text Support** - Upload PDF or TXT files  
✅ **Smart Parsing** - Extracts structured flashcards & quizzes from AI response  
✅ **Secure Backend** - API key never exposed to frontend  
✅ **TypeScript** - Full type safety across frontend & backend  
✅ **Error Handling** - Comprehensive error messages and validation  
✅ **Responsive UI** - Works on desktop and mobile  
✅ **Accessible** - ARIA labels and keyboard navigation  
✅ **Beautiful Design** - Modern gradient UI with smooth animations  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm or yarn
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone repository**
```bash
git clone https://github.com/Pix-Gen/ai-study-generator.git
cd ai-study-generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp .env.example .env
```

4. **Add your OpenAI API key to `.env`**
```env
OPENAI_API_KEY=sk-your_actual_key_here
PORT=3000
```

5. **Start development server**
```bash
npm run dev
```

6. **Open browser**
Navigate to `http://localhost:3000`

## 📖 Usage

1. **Upload a file** (PDF or TXT with study material)
2. **Click "Generate Reviewer + Quiz"**
3. **Review the summary** - Key concepts overview
4. **Study flashcards** - Click each card to flip between Q&A
5. **Take the quiz** - Answer 20 multiple choice questions
6. **See results** - Get instant score and percentage
7. **Download** - Save the reviewer as a text file

## 📁 Project Structure

```
ai-study-generator/
├── public/
��   ├── index.html          # Frontend HTML (beautiful UI)
│   └── app.js              # Frontend JavaScript (parsing logic)
│
├── src/
│   ├── server.ts           # Express backend + OpenAI integration
│   └── types.ts            # TypeScript type definitions
│
├── dist/                    # Compiled JavaScript (generated)
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔌 API Endpoints

### `POST /api/generate-study`
Generates study materials from provided text.

**Request:**
```json
{
  "material": "Study material text here..."
}
```

**Response:**
```json
{
  "reviewer": "Comprehensive summary of key concepts...",
  "flashcards": [
    {
      "question": "What is photosynthesis?",
      "answer": "Photosynthesis is the process by which plants..."
    }
  ],
  "quiz": [
    {
      "question": "Which organelle is responsible for photosynthesis?",
      "options": ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
      "correctAnswer": "Chloroplast"
    }
  ]
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## 🏗️ Build & Deploy

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment (optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Then:
```bash
docker build -t ai-study-generator .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... ai-study-generator
```

## 🛡️ Security Features

🔒 **API Key Protection**
- OpenAI API key stored server-side only
- Never exposed to frontend
- Environment variables for configuration

🔒 **Input Validation**
- File size limits (max 100KB text)
- File type validation (PDF/TXT only)
- Content sanitization
- XSS protection

🔒 **Error Handling**
- Graceful error messages
- No sensitive information exposure
- Rate limit awareness

## ⚠️ Error Handling

The app handles:
- ✓ Missing/invalid API key
- ✓ File parsing errors
- ✓ Network errors
- ✓ Empty files
- ✓ Unsupported file types
- ✓ API rate limits
- ✓ Malformed responses

## 🛠️ Technologies

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, Vanilla JavaScript, PDF.js |
| **Backend** | Node.js, Express.js |
| **Language** | TypeScript |
| **AI** | OpenAI GPT-4o-mini API |
| **Type Safety** | Full TypeScript support |

## 📊 Customization

### Change Model
Edit `src/server.ts` line with `model:`:
```typescript
model: "gpt-4",  // Change to gpt-4, gpt-3.5-turbo, etc.
```

### Adjust Number of Questions
Edit `src/server.ts`:
```typescript
// Change from 20 to your desired number
return quiz.slice(0, 20);
```

### Modify UI Colors
Edit `public/index.html` CSS `--primary` color variables

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 💬 Support

- 📧 Email: [your-email@example.com]
- 🐛 Report Issues: [GitHub Issues](https://github.com/Pix-Gen/ai-study-generator/issues)
- 💭 Discussions: [GitHub Discussions](https://github.com/Pix-Gen/ai-study-generator/discussions)

## 🚧 Roadmap

- [ ] User accounts & history
- [ ] Anki deck export
- [ ] DOCX & EPUB support
- [ ] Image OCR support
- [ ] Study recommendations
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced spaced repetition
- [ ] Voice narration for flashcards

## 🎯 Tips for Best Results

1. **Upload clear, well-structured documents**
2. **Use PDFs with extractable text** (not scanned images)
3. **Start with 2-5 page materials** for best results
4. **Review the flashcards** - edit if needed
5. **Retake the quiz** to improve scores

---

Made with ❤️ by Pix-Gen
