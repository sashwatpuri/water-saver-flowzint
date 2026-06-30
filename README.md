# AquaGuard AI

> Real-time water quality monitoring with AI-powered analysis — built for municipalities, campuses, and industrial facilities that treat water safety as non-negotiable.

---

## Features

- 🔬 **Live Parameter Monitoring** — pH, TDS, Dissolved Oxygen, and Turbidity updated every 10 seconds
- 🚨 **Instant Alerts** — Automatic safety threshold detection with clear violation messages
- 📈 **24-Hour Trend Charts** — Switchable time-series visualization for all four parameters
- 🤖 **AI Q&A Assistant** — Ask natural-language questions and get context-aware answers powered by Google Gemini
- 📊 **Statistical Dashboard** — 24-hour averages table with safe/unsafe classification for every parameter
- 🌐 **Responsive Design** — Works at 375px (mobile), 768px (tablet), and 1024px+ (desktop)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.13 · FastAPI · Uvicorn |
| **Frontend** | React 18 · Vite · Recharts |
| **AI** | Google Gemini 2.5 Flash (`google-genai` SDK) |
| **Data** | JSON flat-file (7,200 synthetic readings — 30 days × hourly) |
| **Styling** | Vanilla CSS variables · System fonts only · No external UI framework |
| **Dev** | python-dotenv · CORS middleware |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com) API key (free tier works)

### 1 · Clone the repo

```bash
git clone https://github.com/your-username/water-saver-flowzint.git
cd water-saver-flowzint
```

### 2 · Set up the backend

```bash
# Install Python dependencies
py -m pip install -r backend/requirements.txt

# Create the environment file
cp backend/.env.example backend/.env
# → Open backend/.env and paste your GEMINI_API_KEY
```

### 3 · Generate water quality data *(first time only)*

```bash
py data-generation.py
```

This creates `aquaguard_data.json` and `aquaguard_data.csv` with 7,200 realistic sensor readings.

### 4 · Start the backend

```bash
py backend/main.py
# → API running at http://localhost:8000
```

### 5 · Start the frontend

```bash
cd frontend
npm install
npm run dev
# → Dashboard at http://localhost:5173
```

Open `http://localhost:5173` in your browser. The dashboard will load live data immediately.

---

## API Endpoints

All endpoints return JSON. Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns API status and total reading count |
| `GET` | `/api/readings/latest` | Last 24 readings (past 24 hours of hourly data) |
| `GET` | `/api/readings/all` | All 7,200 historical readings |
| `GET` | `/api/readings/summary` | Statistical summary of the last 24 readings (averages, safe/unsafe counts) |
| `POST` | `/api/chat` | AI Q&A — send `{ "message": "..." }`, receive a context-aware Gemini response |

### Example requests

```bash
# Health check
curl http://localhost:8000/

# Latest readings
curl http://localhost:8000/api/readings/latest

# Ask the AI assistant
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Is the water currently safe to drink?"}'
```

---

## Project Structure

```
water-saver-flowzint/
│
├── backend/
│   ├── main.py              # FastAPI application — all routes + Gemini integration
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not committed)
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Header.jsx       # Sticky nav bar with location + live timestamp
│       │   ├── AlertBanner.jsx  # Conditional safety alert (red left-border)
│       │   ├── MetricCard.jsx   # Single-parameter card (value + status)
│       │   ├── Chart.jsx        # 24h trend line chart (Recharts, 4-metric tabs)
│       │   ├── ChatWidget.jsx   # Floating AI chat popup
│       │   └── Dashboard.jsx    # Root orchestrator — fetches data, maps props
│       ├── data/
│       │   └── api.js           # Axios API client (fetchLatestReadings, sendChatMessage)
│       └── styles/
│           └── index.css        # CSS custom properties (design tokens)
│
├── docs/
│   ├── SUMMARY.md               # Project overview
│   ├── QUICK_START.md           # Extended setup guide
│   ├── TRACKS_A_B_C.md          # Hackathon track breakdown
│   ├── AQUAGUARD_DESIGN_SYSTEM.md
│   ├── COMPLETE_PROMPT_LIBRARY.md
│   └── PROMPT_QUICK_REFERENCE.md
│
├── data-generation.py       # Generates aquaguard_data.json + .csv (7,200 rows)
├── aquaguard_data.json      # Generated sensor dataset (not committed — run script)
├── aquaguard_data.csv       # CSV version of the same dataset
└── README.md
```

---

## Environment Variables

Create `backend/.env` using this template:

```env
# backend/.env

# Google AI Studio API key
# Get yours free at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here
```

> **No other environment variables are required.** The frontend connects to the backend via `http://localhost:8000` by default (configurable in `frontend/src/data/api.js`).

---

## Data Generation

The dataset is synthetic but statistically realistic — generated using Gaussian distributions, not time-series patterns.

```bash
py data-generation.py
```

**Output:**
- `aquaguard_data.json` — 7,200 readings, 30 days at hourly intervals
- `aquaguard_data.csv` — same data in CSV format for analysis

**Classification rules (applied during generation):**

| Parameter | Safe Range |
|---|---|
| pH | 6.5 – 8.2 |
| TDS | ≤ 400 mg/L |
| Dissolved Oxygen | ≥ 4.5 mg/L |
| Turbidity | ≤ 5.0 NTU |

75% of readings are SAFE, 25% are UNSAFE (randomized parameter violations).

---

## Live Demo

🔗 **[Coming Soon]** — Deploy instructions below.

To deploy:
1. Backend → [Railway](https://railway.app) or [Render](https://render.com) (free tier)
2. Frontend → [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (free tier)
3. Update `VITE_API_URL` in `frontend/.env.local` to point to the deployed backend

---

## Video Demo

📹 **[Coming Soon]** — Walkthrough video covering dashboard, alerts, chart switching, and the Gemini AI assistant.

---

## Contributing

This project was built for a hackathon and is not currently accepting external contributions.

If you find a bug or have a suggestion, feel free to open an issue.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with FastAPI · React · Google Gemini · Recharts</sub>
</div>
