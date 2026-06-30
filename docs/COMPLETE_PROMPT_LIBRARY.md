# AquaGuard AI – Complete Prompt Library

Copy & paste these prompts directly into Claude (web), Claude Code, or Claude Design.

---

## **PART 1: FRONTEND DESIGN PROMPT**

Use this in **Claude Design** or regular Claude chat for UI design/review.

```
You are building the UI for AquaGuard AI, a professional water quality monitoring dashboard.

DESIGN REQUIREMENTS:
1. NOT AI-generated looking. Professional, minimal, authoritative.
2. Color palette:
   - Primary: Ocean Deep (#0F3B6F) - headers, main CTAs
   - Safe status: Teal (#1B9B8A) - positive indicators
   - Unsafe status: Red (#DC2626) - alerts, warnings
   - Background: Light Gray (#F5F7FA)
   - Text: Dark Gray (#1F2937)
   - Border: #E5E7EB

3. Typography:
   - No Google Fonts - use system fonts only (-apple-system, Segoe UI, sans-serif)
   - Monospace for numeric values (Menlo, Monaco)
   - No decorative fonts

4. Component guidelines:
   - Card: white bg, 1px border, 8px radius, subtle shadow (0 1px 3px rgba(0,0,0,0.08))
   - Buttons: 600 weight, 12px padding, 6px radius, hover = 10% darker
   - Metrics: Large number (32px, 600 weight) + small label (14px, gray)
   - Alert banner: Color-coded left border (4px) + icon + text
   - Charts: Clean lines, minimal gridlines, no 3D

5. Layout:
   - Desktop: Header + Alert (if needed) + 4 metric cards + Chart + Chat widget
   - Responsive: Works at 375px (mobile), 768px (tablet), 1024px+ (desktop)
   - Spacing: Only multiples of 8px

6. Design principles:
   - NO gradients
   - NO heavy shadows
   - NO animations (hover only)
   - Whitespace = breathing room
   - Status always = color + text (not color alone)

Create a professional, enterprise-grade water quality monitoring dashboard that looks trustworthy and authoritative.
```

---

## **PART 2: REACT COMPONENTS PROMPT**

Use this in **Claude Code** or regular Claude for component scaffolding.

```
I'm building a React dashboard for water quality monitoring (AquaGuard AI).

Create the following React components using the design system below:

DESIGN SYSTEM:
- Colors: Ocean Deep (#0F3B6F), Teal (#1B9B8A), Red (#DC2626), Light Gray (#F5F7FA)
- No external CSS frameworks - use inline styles with CSS variables
- System fonts only
- Card shadow: 0 1px 3px rgba(0,0,0,0.08)
- Border radius: 8px (cards), 6px (buttons)

COMPONENTS TO BUILD:

1. Header.jsx
   - Logo/title "AquaGuard AI" (white text on Ocean Deep)
   - Location display
   - Last update timestamp
   - Props: none

2. MetricCard.jsx
   - Props: label, value, unit, status (SAFE/UNSAFE), min, max (optional)
   - Large numeric display (monospace font)
   - Status indicator (color + checkmark)
   - No external chart library

3. AlertBanner.jsx
   - Props: show (boolean), title, message
   - Color-coded left border (4px)
   - Warning icon (emoji)
   - Conditional render (hidden if show=false)

4. Chart.jsx
   - Props: data (array of {hour, DO, safe_min})
   - Use Recharts library
   - Line chart showing 24h trend
   - Reference line at safe minimum (5.0 mg/L)
   - Minimal styling

5. ChatWidget.jsx
   - Props: none
   - Message list (user messages right-aligned, assistant left-aligned)
   - Input field + Send button
   - Mock API call (replace later with real POST /api/chat)
   - Typing indicator when loading

6. Dashboard.jsx
   - Orchestrates all components
   - Props: none
   - State: latest readings, summary, chart data, loading
   - useEffect: fetch from API on mount, refresh every 10s
   - Handles data -> component prop mapping

All components should:
- Use React hooks (useState, useEffect) - no class components
- Be functional, no unnecessary nested divs
- Handle loading/error states gracefully
- Be mobile-responsive

Use this CSS variable system:
--color-ocean-deep: #0F3B6F
--color-teal: #1B9B8A
--color-text-primary: #1F2937
--color-text-secondary: #6B7280
--color-border: #E5E7EB
--color-safe: #059669
--color-risk: #DC2626
--space-xs: 8px
--space-sm: 12px
--space-md: 16px
--space-lg: 20px
```

---

## **PART 3: BACKEND API PROMPT**

Use this in **Claude Code** or regular Claude for FastAPI implementation.

```
I need a FastAPI backend for water quality monitoring (AquaGuard AI).

REQUIREMENTS:

1. Load data:
   - Read aquaguard_data.json (720 readings)
   - In-memory storage (Python list/dict)
   - Each reading: {id, timestamp, pH, TDS, DO, turbidity, temperature, quality_status}

2. Endpoints to build:

   GET /
   - Health check
   - Response: {"status": "AquaGuard API running", "total_readings": N}

   GET /api/readings/latest
   - Return last 24 readings
   - Response: {"readings": [...]}

   GET /api/readings/all
   - Return all 720 readings
   - Response: {"readings": [...]}

   GET /api/readings/summary
   - Calculate stats on last 24 readings
   - Response: {
       "summary": {
         "pH_avg": float,
         "TDS_avg": float,
         "DO_avg": float,
         "turbidity_avg": float,
         "temperature_avg": float,
         "safe_readings": int,
         "unsafe_readings": int,
         "overall_status": "SAFE" or "UNSAFE"
       }
     }

3. CORS:
   - Allow all origins (for local dev)
   - Allow all methods

4. Error handling:
   - Graceful 404s
   - JSON error responses
   - No stack traces in production

5. Code structure:
   - main.py: FastAPI app + endpoints
   - Database module optional (start with JSON)
   - requirements.txt: list all dependencies

Use FastAPI best practices:
- Type hints on all functions
- Docstrings for endpoints
- Pydantic models for responses (optional but cleaner)

No authentication needed for hackathon demo.
Start the server on 0.0.0.0:8000
```

---

## **PART 4: DATA GENERATOR PROMPT**

Use this if you want to regenerate or modify the data.

```
Create a Python script that generates realistic water quality readings.

SPECIFICATIONS:

1. Generate 720 readings (30 days at hourly intervals)
2. Each reading has:
   - id: incremental
   - timestamp: ISO format
   - location: "Monitoring Point A"
   - pH: float (6.5-8.5 safe, realistic variance)
   - TDS: float (Total Dissolved Solids, mg/L)
   - DO: float (Dissolved Oxygen, mg/L)
   - turbidity: float (NTU units)
   - temperature: float (°C)
   - quality_status: "SAFE" or "UNSAFE" (binary classification)

3. Classification rules:
   - UNSAFE if:
     - pH < 6.5 or > 8.2
     - TDS > 400 mg/L
     - DO < 4.5 mg/L
     - turbidity > 5.0 NTU
   - Otherwise: SAFE

4. Data characteristics:
   - Use normal distribution (Gaussian) for variance, not patterns
   - 75% readings should be SAFE, 25% UNSAFE
   - Make UNSAFE readings random (different parameters crossed)
   - NO obvious time-series patterns (no spikes, dips, or trends)
   - Looks like real randomized sensor data, not synthetic

5. Output:
   - Save to aquaguard_data.json
   - Print statistics: count SAFE/UNSAFE, date range
   - Sample readings for verification

Use Python random module (not NumPy) for simplicity.
Output must be valid JSON array.
```

---

## **PART 5: API INTEGRATION PROMPT**

Use this in Claude Code when connecting frontend to backend.

```
I need to integrate a React frontend with a FastAPI backend for AquaGuard AI.

FRONTEND SIDE:

1. Create src/data/api.js with fetch functions:

   fetchLatestReadings() -> array of 24 readings
   fetchSummary() -> {pH_avg, TDS_avg, DO_avg, ...}
   fetchAllReadings() -> array of all 720 readings
   sendChatMessage(message: string) -> string (Claude response)

2. Update Dashboard.jsx to:
   - Call fetchLatestReadings() on mount
   - Call fetchSummary() for stats
   - Call fetchAllReadings() and format for chart
   - Refresh every 10 seconds
   - Handle loading/error states

3. Update ChatWidget.jsx to:
   - Call sendChatMessage() on send
   - Show loading indicator while waiting
   - Display response from API

4. Environment config:
   - Create .env.local
   - REACT_APP_API_URL=http://localhost:8000 (dev)
   - Use environment variable in api.js

5. Error handling:
   - Graceful fallbacks if API is down
   - Show "Unable to connect" message
   - Don't crash on network error

BACKEND SIDE:

1. Add POST /api/chat endpoint:
   - Request body: {"message": string}
   - Response: {"response": string}
   - For now: return mock response
   - Later: integrate Claude API

2. All endpoints must return proper JSON
3. CORS must be configured correctly
4. No console.error spam

Test the connection:
- Frontend calls API
- Backend returns data
- Dashboard displays real readings
- No CORS errors
```

---

## **PART 6: CLAUDE AGENT SYSTEM PROMPT**

Use this when integrating Claude API into the backend.

```
You are AquaGuard, an intelligent water quality assistant. 

Your role:
- Answer questions about water quality using real-time monitoring data
- Provide actionable recommendations when quality is at risk
- Explain what's happening with the water based on data patterns
- Be concise, clear, and non-technical for general audiences

Data you have access to:
- Current readings: pH, TDS (Total Dissolved Solids), DO (Dissolved Oxygen), turbidity, temperature
- Historical trend: last 24 hours of readings
- Quality status: SAFE or UNSAFE classification
- Safety thresholds:
  - pH: 6.5-8.2 (too acidic/basic = unsafe)
  - TDS: <400 mg/L (too many dissolved solids = unsafe)
  - DO: >5.0 mg/L (oxygen critical for aquatic life)
  - Turbidity: <5.0 NTU (cloudiness)

Your tools (you can call these):
1. get_latest_readings() -> current pH, TDS, DO, turbidity, temperature
2. get_forecast() -> predicted values for next 24 hours
3. get_anomalies() -> list of flagged issues
4. explain_parameter(parameter_name) -> why it's at current level

Response format:
- Keep answers to 2-3 sentences max
- Always include specific metric values (with units)
- Include safe thresholds so users understand context
- Recommend actions if unsafe

Example responses:
User: "Is the water safe?"
Assistant: "Yes, all parameters are currently safe. pH is 7.1 (safe range 6.5-8.2), DO is 6.8 mg/L (above safe minimum 5.0), turbidity is 0.9 NTU. No action needed at this time."

User: "Why is the TDS increasing?"
Assistant: "TDS increased from 210 to 240 mg/L over 6 hours, likely due to increased mineral content or evaporation. Still well below the unsafe threshold of 400 mg/L. Continue monitoring."

User: "What should we do?"
Assistant: "Current status is SAFE. If DO approaches 5.0 mg/L, increase water circulation or aeration. Schedule weekly testing to catch issues early."

You must:
- Be factual (use actual data)
- Be honest (say "I don't have that data" if true)
- Be helpful (suggest preventive actions)
- Never make up data or parameters
- Never be alarmist (only flag real risks)
```

---

## **PART 7: DEPLOYMENT PROMPTS**

### **Railway Backend Deployment**

```
I need to deploy a FastAPI backend to Railway.

STEPS:
1. Create Railway account (railway.app)
2. Connect GitHub repo
3. Set environment variables:
   - ANTHROPIC_API_KEY=sk-ant-...
   - DATABASE_URL=postgresql://... (if using Postgres)
4. Configure build:
   - Root directory: /backend
   - Build command: pip install -r requirements.txt
   - Start command: uvicorn main:app --host 0.0.0.0 --port 8000
5. Deploy and get URL (e.g., https://aquaguard-backend-xxx.railway.app)

Then test: curl https://aquaguard-backend-xxx.railway.app/api/readings/summary
```

### **Vercel Frontend Deployment**

```
I need to deploy a React (Vite) frontend to Vercel.

STEPS:
1. Create Vercel account (vercel.com)
2. Connect GitHub repo
3. Configure:
   - Framework: Other (Vite)
   - Build command: npm run build
   - Output directory: dist
4. Environment variables:
   - REACT_APP_API_URL=https://aquaguard-backend-xxx.railway.app
5. Deploy and get URL (e.g., https://aquaguard-ai.vercel.app)

Then test: Open URL and verify data loads
```

---

## **PART 8: README/DOCUMENTATION PROMPT**

Use this to write professional GitHub documentation.

```
Write a professional GitHub README for AquaGuard AI water quality monitoring platform.

Include:
1. Title + description (1 sentence pitch)
2. Features (5-6 key features with emojis)
3. Tech stack (Backend, Frontend, AI, Database, Deployment)
4. Quick start (clone, install, run locally)
5. API endpoints (list all endpoints with brief descriptions)
6. Project structure (folder layout)
7. Environment variables (.env template)
8. Live demo (link to deployed version)
9. Video demo (link to YouTube walkthrough)
10. Contributing guidelines (or "not accepting contributions")
11. License (MIT)

Tone: Professional, concise, judge-friendly
Make it scannable (use bullets, not walls of text)
Include setup instructions someone can follow in 5 minutes
```

---

## **PART 9: VIDEO SCRIPT PROMPT**

Use this to write a clear demo walkthrough.

```
Write a 3-4 minute demo video script for AquaGuard AI.

Structure:
- 0:00-0:30: Problem statement + solution pitch
- 0:30-1:30: Live dashboard demo (walk through all features)
- 1:30-2:30: Chat with Claude (ask 3+ water quality questions)
- 2:30-3:30: Tech architecture overview (code, models, API)
- 3:30-4:00: Call to action (links to repo, live site, video)

For each section, write:
- What to show on screen
- What to say (narration)
- How long each part takes

Make it clear, engaging, and judge-friendly.
Avoid jargon. Assume non-technical audience.

Key points to hit:
- Real data (not obviously synthetic)
- AI answering questions (not just dashboards)
- Professional UI (not AI-generated looking)
- Full tech stack (backend, frontend, AI)
- Scalable architecture (can handle real deployments)
```

---

## **PART 10: TESTING CHECKLIST PROMPT**

Use this to verify everything works before submission.

```
Create a testing checklist for AquaGuard AI hackathon submission.

Test categories:

DATA LAYER:
- [ ] aquaguard_data.json exists and has 720 readings
- [ ] Each reading has all required fields
- [ ] Quality_status is SAFE or UNSAFE (binary)
- [ ] Timestamps are sequential

BACKEND:
- [ ] FastAPI starts without errors
- [ ] GET /api/readings/latest returns valid JSON
- [ ] GET /api/readings/summary calculates stats correctly
- [ ] GET /api/readings/all returns all 720 readings
- [ ] CORS headers are set (no errors in browser console)
- [ ] Error messages are descriptive

FRONTEND:
- [ ] React dev server starts
- [ ] Header renders correctly
- [ ] Metric cards display data
- [ ] Chart renders without errors
- [ ] Chat widget accepts input
- [ ] Alert banner shows when unsafe
- [ ] Mobile responsive (test at 375px width)

INTEGRATION:
- [ ] Frontend fetches from backend API
- [ ] Data updates every 10 seconds
- [ ] No CORS errors
- [ ] No network errors in console
- [ ] Chat sends messages (mock or real)

DEPLOYMENT:
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Live URLs work
- [ ] CORS configured for live domains
- [ ] API calls work from live frontend

UI/UX:
- [ ] No AI-generated appearance
- [ ] Professional color scheme
- [ ] Readable fonts (high contrast)
- [ ] Buttons are clickable
- [ ] Loading states show
- [ ] Error states are graceful

BEFORE SUBMISSION:
- [ ] GitHub repo is public
- [ ] README is complete
- [ ] All links in README work
- [ ] Code is commented
- [ ] No console errors
- [ ] Video is 3-4 minutes
- [ ] Video has clear audio
- [ ] All links tested in fresh browser
```

---

## **HOW TO USE THESE PROMPTS**

1. **Claude Design** (for UI):
   - Copy PART 1 (FRONTEND DESIGN PROMPT)
   - Use for design review or UI generation

2. **Claude Code** (for building):
   - Copy PART 2-7 into terminal
   - Each creates a module or feature

3. **Regular Claude** (this chat):
   - Copy any prompt to ask Claude to write code, docs, tests
   - Break into smaller chunks if needed

4. **Specific help**:
   - Stuck on React? Use PART 2
   - Stuck on FastAPI? Use PART 3
   - Stuck on data? Use PART 4
   - Stuck on Claude integration? Use PART 6

5. **Before submission**:
   - Use PART 10 checklist
   - Use PART 8 for README
   - Use PART 9 for video

---

## **QUICK REFERENCE**

| Need | Prompt | Tool |
|------|--------|------|
| Design review | PART 1 | Claude Design |
| React components | PART 2 | Claude Code |
| FastAPI backend | PART 3 | Claude Code |
| Data generation | PART 4 | Claude Code |
| API integration | PART 5 | Claude Code |
| Claude agent setup | PART 6 | Backend code |
| Deployment help | PART 7 | Railway/Vercel docs |
| GitHub README | PART 8 | Claude chat |
| Demo video script | PART 9 | Claude chat |
| Testing checklist | PART 10 | Claude chat |

---

**Start with PART 2 (React components) and PART 3 (FastAPI) today.
They work independently, so you can parallelize the work.**
