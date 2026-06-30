# Quick Reference: Which Prompt to Use When

## **TODAY: Build MVP (3 Hours)**

### **Hour 1: Generate Data + Backend API**

**STEP 1A: Generate data (5 min)**
```bash
python aquaguard_organic_data_generator.py
```
✅ Done. No prompt needed (already have script).

**STEP 1B: Build FastAPI backend (1 hour)**

Copy **PART 3: BACKEND API PROMPT** from COMPLETE_PROMPT_LIBRARY.md and paste into Claude Code or this chat:

```
I need a FastAPI backend for water quality monitoring (AquaGuard AI).
REQUIREMENTS: [see PART 3]
```

Claude will generate:
- main.py (complete FastAPI app)
- requirements.txt
- Just copy & paste into your project

**STEP 1C: Test it**
```bash
cd backend
pip install -r requirements.txt
python main.py
# In another terminal:
curl http://localhost:8000/api/readings/summary
```

---

### **Hour 2: Frontend Components**

**STEP 2A: Build React components (1 hour)**

Copy **PART 2: REACT COMPONENTS PROMPT** from COMPLETE_PROMPT_LIBRARY.md and paste into Claude Code:

```
I'm building a React dashboard for water quality monitoring (AquaGuard AI).
[see PART 2]
```

Claude will generate:
- Header.jsx
- MetricCard.jsx
- AlertBanner.jsx
- Chart.jsx
- ChatWidget.jsx
- Dashboard.jsx
- CSS variables

Copy each component into your `src/components/` folder.

**STEP 2B: Test it**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

### **Hour 3: Connect Frontend to Backend**

**STEP 3: API Integration**

Copy **PART 5: API INTEGRATION PROMPT** from COMPLETE_PROMPT_LIBRARY.md and paste into Claude Code:

```
I need to integrate a React frontend with a FastAPI backend for AquaGuard AI.
[see PART 5]
```

Claude will generate:
- src/data/api.js (fetch functions)
- .env.local configuration
- Updated Dashboard.jsx
- Updated ChatWidget.jsx

Apply changes and test:
```bash
# Both should be running:
# Backend: http://localhost:8000/api/readings/summary ✅
# Frontend: http://localhost:5173 ✅
```

---

## **DAYS 2-3: Add Polish & Testing**

### **Fix Styling (if needed)**

Use **PART 1: FRONTEND DESIGN PROMPT** to review/refine:

```
Review this React dashboard against the AquaGuard AI design system:
[Copy your Dashboard.jsx or describe what you built]

Does it match the design? Any issues?
```

Claude will identify:
- Color mismatches
- Spacing issues
- Responsive problems
- Typography fixes

---

### **Test Everything**

Use **PART 10: TESTING CHECKLIST PROMPT**:

```
[Copy PART 10 testing checklist]
Go through each item and mark completed
```

Create a test document:
```
DATA LAYER:
- [x] aquaguard_data.json exists
- [x] 720 readings with all fields
- [ ] ... (continue checking)
```

---

## **DAYS 4-5: Add Claude AI Agent**

### **Set up Claude API Integration**

Use **PART 6: CLAUDE AGENT SYSTEM PROMPT**:

In your `backend/main.py`, add:

```python
from anthropic import Anthropic

# Copy PART 6 as system prompt
SYSTEM_PROMPT = """You are AquaGuard, an intelligent water quality assistant..."""

@app.post("/api/chat")
async def chat(message: str):
    client = Anthropic()
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=200,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": message}]
    )
    return {"response": response.content[0].text}
```

Test it:
```bash
curl -X POST http://localhost:8000/api/chat \
  -d '{"message": "Is water safe?"}' \
  -H "Content-Type: application/json"
```

---

## **DAY 6: Deploy Live**

### **Deploy Backend**

Use **PART 7: Railway Backend Deployment**:

```
Follow the Railway deployment steps from PART 7
Get live URL: https://aquaguard-backend-xxx.railway.app
```

### **Deploy Frontend**

Use **PART 7: Vercel Frontend Deployment**:

```
Follow the Vercel deployment steps from PART 7
Get live URL: https://aquaguard-ai.vercel.app
```

---

## **DAY 7: Documentation & Video**

### **Write GitHub README**

Use **PART 8: README/DOCUMENTATION PROMPT**:

```
Write a professional GitHub README for AquaGuard AI...
[Copy PART 8]
```

Paste result into `README.md`

### **Write Video Script**

Use **PART 9: VIDEO SCRIPT PROMPT**:

```
Write a 3-4 minute demo video script for AquaGuard AI...
[Copy PART 9]
```

Use output to guide your screen recording.

---

## **Special Cases: Need Help With Specific Things?**

| Problem | Solution | Prompt to Use |
|---------|----------|---------------|
| Chart isn't rendering | "My Recharts component isn't showing" | PART 2 (ask in chat) |
| API endpoint timing out | "My FastAPI endpoint is slow" | PART 3 (ask Claude Code) |
| CORS errors | "Frontend can't reach backend" | PART 5 (check .env config) |
| Claude isn't responding | "Chat endpoint returns error" | PART 6 (check system prompt) |
| Styling looks off | "Dashboard doesn't match design" | PART 1 (design review) |
| Deployment failing | "Railway build is failing" | PART 7 (check build command) |
| Tests failing | "Some tests don't pass" | PART 10 (checklist) |

---

## **Master Prompt Order (If Starting Fresh)**

Execute prompts in this order:

1. **PART 4** → Generate data ✅ Done (already have script)
2. **PART 3** → FastAPI backend
3. **PART 2** → React components
4. **PART 5** → API integration
5. **PART 1** → Design review (optional)
6. **PART 10** → Testing checklist
7. **PART 6** → Claude API (Day 4)
8. **PART 7** → Deployment (Day 6)
9. **PART 8** → README (Day 7)
10. **PART 9** → Video script (Day 7)

---

## **Copy-Paste Templates (Ready to Use Right Now)**

### **Template 1: Building React Components**

```
I'm building a React component for AquaGuard AI water quality dashboard.

Component name: [MetricCard / AlertBanner / etc]
Props needed: [list props]
Visual requirements: [describe how it should look]
Data it displays: [what data goes in]

Use these colors:
- Ocean Deep: #0F3B6F
- Teal: #1B9B8A
- Red: #DC2626
- Light Gray: #F5F7FA
- Text: #1F2937

No external CSS libraries (inline styles only).
Use system fonts (-apple-system, Segoe UI, sans-serif).
Make it responsive (mobile-first).

Write the complete JSX component code.
```

### **Template 2: Asking Claude for Help**

```
I'm building AquaGuard AI and stuck on [specific problem].

Current code:
[Paste your code]

Expected behavior:
[What it should do]

Actual behavior:
[What's happening instead]

Error message:
[If applicable, paste error]

Using PART [N] from the prompt library - can you help?
```

### **Template 3: Code Review**

```
I built this component/endpoint using [PART N] from the AquaGuard prompt library.

Code:
[Paste your code]

Does it match the requirements from PART N?
Any issues or improvements?
```

---

## **All Files You Have**

In `/home/claude/`:

1. ✅ **COMPLETE_PROMPT_LIBRARY.md** ← You are here
2. **PART 1** = FRONTEND DESIGN PROMPT
3. **PART 2** = REACT COMPONENTS PROMPT
4. **PART 3** = BACKEND API PROMPT
5. **PART 4** = DATA GENERATOR PROMPT
6. **PART 5** = API INTEGRATION PROMPT
7. **PART 6** = CLAUDE AGENT SYSTEM PROMPT
8. **PART 7** = DEPLOYMENT PROMPTS
9. **PART 8** = README/DOCUMENTATION PROMPT
10. **PART 9** = VIDEO SCRIPT PROMPT
11. **PART 10** = TESTING CHECKLIST PROMPT

---

## **Right Now: Start Here**

1. Copy **PART 3** (FastAPI)
2. Paste into Claude Code or this chat
3. Build backend
4. Copy **PART 2** (React)
5. Build frontend
6. Copy **PART 5** (Integration)
7. Connect them
8. Test with **PART 10** checklist

**That's your 3-hour MVP. Then Days 2-7: Polish, AI agent, deploy, video.**

---

## **Need More Help?**

- **Stuck on prompt wording?** Copy the template above and fill in blanks
- **Want me to refine a prompt?** Paste your code + ask for prompt
- **Need variations?** Just modify PART N as needed
- **Want a new prompt?** Describe what you need, I'll create it

Go get 'em! 🚀
