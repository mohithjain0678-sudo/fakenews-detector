# Fake News & Deepfake Detector 🔍

An AI-powered web application that analyzes news articles and images for credibility, detecting misinformation and potential manipulation in real time.

**Live Demo:** [fakenews-detector-phi.vercel.app](https://fakenews-detector-phi.vercel.app/)

---

## What It Does

- **News URL Analysis** — Paste any news article URL. The app scrapes the content and uses LLaMA 3.3 70B to assess credibility, returning a score from 0–100 with a detailed analysis and specific red flags.
- **Image Deepfake Detection** — Upload any image. The app runs Error Level Analysis (ELA) and EXIF metadata inspection to detect signs of manipulation or editing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| AI Model | LLaMA 3.3 70B via Groq API |
| Image Analysis | Pillow, OpenCV, NumPy |
| Web Scraping | BeautifulSoup4, Requests |
| Deployment | Vercel (frontend), Render (backend) |

---

## How It Works

### Text Analysis
1. User pastes a news article URL
2. Backend scrapes up to 3000 characters of article text using BeautifulSoup
3. Text is sent to LLaMA 3.3 70B with a fact-checking prompt
4. Model returns a credibility score, analysis summary, and red flags

### Image Analysis
1. User uploads an image
2. Backend runs Error Level Analysis (ELA) — re-saves the image at 90% JPEG quality and computes pixel-level differences
3. High ELA scores indicate possible manipulation
4. EXIF metadata is checked for signs of editing
5. Findings are passed to LLaMA 3.3 70B for a final credibility assessment

---

## Running Locally

### Prerequisites
- Node.js v18+
- Python 3.10+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
fakenews-detector/
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main UI component
│   │   └── index.css      # Tailwind import
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── main.py            # FastAPI app, routes, analysis logic
│   ├── requirements.txt
│   └── .env               # Not committed — store your API key here
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze/text` | Analyze a news article URL |
| POST | `/analyze/image` | Analyze an uploaded image |

Full interactive API docs available at `/docs` on the backend.

---

## Results Format

```json
{
  "score": 78,
  "analysis": "The article appears credible with specific sourced claims...",
  "red_flags": ["No author mentioned", "Sensational headline language"]
}
```

---

## Why This Matters

Over 500 million people consume misinformation daily. Existing fact-checking tools are either manual, paywalled, or handle only text or images — not both. This project combines NLP-based credibility analysis with computer vision-based image forensics in a single free, open-source tool.

---

## Author

**Mohith Jain**
B.Tech ECE — VIT Chennai (2025–2029)

- GitHub: [github.com/mohithjain0678-sudo](https://github.com/mohithjain0678-sudo)
- LinkedIn: [linkedin.com/in/mohith-jain-302076397](https://linkedin.com/in/mohith-jain-302076397)
