# AquaGuard AI – Quick Start (Copy & Paste)

**Goal:** Working dashboard in 3 hours with real data + mock frontend  
**No dependencies on the other tracks** – they run in parallel

---

## **BEFORE YOU START**

Install these globally (if not already):
```bash
# Node.js (for frontend)
node -v  # should be 16+
npm -v

# Python (for backend)
python3 --version  # should be 3.8+
pip3 --version
```

---

## **STEP 1: Generate Data (5 min) — TRACK A START**

```bash
cd /tmp
mkdir aquaguard && cd aquaguard

# Copy the data generator code and run it
python3 aquaguard_organic_data_generator.py
```

**Expected output:**
```
Generated 720 readings
  SAFE: 540 (75.0%)
  UNSAFE: 180 (25.0%)
  Date range: 2026-06-04T00:00:00 to 2026-07-03T23:00:00
  Saved to: aquaguard_data.json

Sample SAFE reading:
  {'id': 1, 'pH': 7.05, 'TDS': 198.2, 'DO': 7.12, ...}

Sample UNSAFE reading:
  {'id': 542, 'pH': 6.21, 'TDS': 195.3, 'DO': 3.45, ...}
```

✅ **You now have real-looking data**

---

## **STEP 2: Backend API (15 min) — TRACK A COMPLETE**

```bash
mkdir backend && cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-dotenv

# Create main.py with this code:
cat > main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import statistics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('../aquaguard_data.json', 'r') as f:
    ALL_DATA = json.load(f)

@app.get("/")
def root():
    return {"status": "AquaGuard API running", "total_readings": len(ALL_DATA)}

@app.get("/api/readings/latest")
def get_latest():
    return {"readings": ALL_DATA[-24:]}

@app.get("/api/readings/all")
def get_all():
    return {"readings": ALL_DATA}

@app.get("/api/readings/summary")
def get_summary():
    latest = ALL_DATA[-24:]
    
    def safe_avg(key):
        vals = [r[key] for r in latest if isinstance(r[key], (int, float))]
        return round(statistics.mean(vals), 2) if vals else 0
    
    safe_count = sum(1 for r in latest if r['quality_status'] == 'SAFE')
    
    return {
        "summary": {
            "pH_avg": safe_avg('pH'),
            "TDS_avg": safe_avg('TDS'),
            "DO_avg": safe_avg('DO'),
            "turbidity_avg": safe_avg('turbidity'),
            "temperature_avg": safe_avg('temperature'),
            "safe_readings": safe_count,
            "unsafe_readings": len(latest) - safe_count,
            "overall_status": "SAFE" if safe_count >= 20 else "UNSAFE"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Start server
python main.py
```

**In another terminal, test it:**
```bash
curl http://localhost:8000/
curl http://localhost:8000/api/readings/summary
```

✅ **Backend is running**

---

## **STEP 3: Frontend (1 hour) — TRACK B**

**In a new terminal:**

```bash
cd /tmp/aquaguard
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Install Recharts for charts
npm install recharts axios

# Create src/styles/index.css with design system
cat > src/styles/index.css << 'EOF'
:root {
  --color-ocean-deep: #0F3B6F;
  --color-teal: #1B9B8A;
  --color-light-gray: #F5F7FA;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
  --color-safe: #059669;
  --color-risk: #DC2626;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 20px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--color-light-gray);
  color: var(--color-text-primary);
}

.card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-lg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.button {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  background: var(--color-ocean-deep);
  color: white;
  transition: background 0.2s;
}

.button:hover {
  background: #0a2d52;
}
EOF

# Create Header component
cat > src/components/Header.jsx << 'EOF'
export default function Header() {
  return (
    <header style={{
      background: 'var(--color-ocean-deep)',
      color: 'white',
      padding: 'var(--space-lg)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '24px', margin: 0 }}>AquaGuard AI</h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Water Quality Intelligence</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>Monitoring Point A</p>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Live Updates</p>
      </div>
    </header>
  );
}
EOF

# Create MetricCard component
mkdir -p src/components
cat > src/components/MetricCard.jsx << 'EOF'
export default function MetricCard({ label, value, unit, status }) {
  const getColor = (s) => s === 'SAFE' ? 'var(--color-safe)' : 'var(--color-risk)';
  
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)', display: 'block' }}>
        {label}
      </label>
      <div style={{
        fontSize: '32px',
        fontWeight: '600',
        fontFamily: "'Menlo', monospace",
        margin: 'var(--space-md) 0'
      }}>
        {value} {unit}
      </div>
      <div style={{ fontSize: '12px', color: getColor(status) }}>
        ✓ {status}
      </div>
    </div>
  );
}
EOF

# Create AlertBanner
cat > src/components/AlertBanner.jsx << 'EOF'
export default function AlertBanner({ show, message }) {
  if (!show) return null;
  return (
    <div style={{
      background: '#FEF2F2',
      borderLeft: '4px solid var(--color-risk)',
      padding: 'var(--space-md)',
      marginBottom: 'var(--space-lg)',
      display: 'flex',
      gap: 'var(--space-md)'
    }}>
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <div style={{ color: 'var(--color-risk)', fontWeight: '600' }}>{message}</div>
    </div>
  );
}
EOF

# Create Chart
cat > src/components/Chart.jsx << 'EOF'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function Chart({ data }) {
  return (
    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-md)' }}>24-Hour Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <ReferenceLine y={5.0} stroke="var(--color-risk)" strokeDasharray="5 5" label="Safe Min" />
          <Line type="monotone" dataKey="DO" stroke="var(--color-teal)" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
EOF

# Create ChatWidget
cat > src/components/ChatWidget.jsx << 'EOF'
import { useState } from 'react';

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me about water quality.' }
  ]);
  const [input, setInput] = useState('');
  
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'This would be Claude\'s response (API coming soon)'
      }]);
    }, 500);
  };
  
  return (
    <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-md)' }}>AquaGuard Assistant</h2>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: 'var(--space-md)',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 'var(--space-md)'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 'var(--space-md)',
            textAlign: m.role === 'user' ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              maxWidth: '80%',
              background: m.role === 'user' ? 'var(--color-ocean-deep)' : 'var(--color-light-gray)',
              color: m.role === 'user' ? 'white' : 'var(--color-text-primary)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about water quality..."
          style={{
            flex: 1,
            padding: 'var(--space-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px'
          }}
        />
        <button onClick={handleSend} className="button">Send</button>
      </div>
    </div>
  );
}
EOF

# Create Dashboard
cat > src/components/Dashboard.jsx << 'EOF'
import { useState, useEffect } from 'react';
import Header from './Header';
import AlertBanner from './AlertBanner';
import MetricCard from './MetricCard';
import Chart from './Chart';
import ChatWidget from './ChatWidget';

export default function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/readings/latest');
        const data = await res.json();
        const readings = data.readings;
        
        if (readings.length > 0) {
          setLatest(readings[readings.length - 1]);
          
          const chart = readings.map((r, i) => ({
            hour: `${i}:00`,
            DO: r.DO
          }));
          setChartData(chart);
        }
      } catch (e) {
        console.log('Using mock data (backend not running)');
        setLatest({
          pH: 7.1,
          TDS: 215,
          DO: 6.8,
          turbidity: 0.9,
          quality_status: 'SAFE'
        });
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  if (!latest) return <div style={{ padding: '20px' }}>Loading...</div>;
  
  const hasAlert = latest.DO < 5.0 || latest.TDS > 400;
  
  return (
    <div>
      <Header />
      <div style={{ padding: 'var(--space-lg)', maxWidth: '1200px', margin: '0 auto' }}>
        <AlertBanner show={hasAlert} message="Water quality alert - Review details below" />
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)'
        }}>
          <MetricCard label="pH" value={latest.pH} unit="" status={latest.pH >= 6.5 && latest.pH <= 8.5 ? 'SAFE' : 'UNSAFE'} />
          <MetricCard label="TDS" value={latest.TDS} unit="mg/L" status={latest.TDS < 400 ? 'SAFE' : 'UNSAFE'} />
          <MetricCard label="DO" value={latest.DO} unit="mg/L" status={latest.DO >= 5.0 ? 'SAFE' : 'UNSAFE'} />
          <MetricCard label="Turbidity" value={latest.turbidity} unit="NTU" status={latest.turbidity < 5 ? 'SAFE' : 'UNSAFE'} />
        </div>
        
        {chartData.length > 0 && <Chart data={chartData} />}
        <ChatWidget />
      </div>
    </div>
  );
}
EOF

# Update App.jsx
cat > src/App.jsx << 'EOF'
import Dashboard from './components/Dashboard';
import './styles/index.css';

export default function App() {
  return <Dashboard />;
}
EOF

# Start frontend
npm run dev
```

✅ **Frontend running at `http://localhost:5173`**

---

## **STEP 4: Connect Them (5 min) — TRACK C**

Frontend is already set up to fetch from `http://localhost:8000`

Both should be running:
- **Backend:** http://localhost:8000/api/readings/summary
- **Frontend:** http://localhost:5173

If you see real data in the dashboard → **You're done! 🎉**

---

## **What You Now Have**

✅ 720 realistic water quality readings (SAFE/UNSAFE binary)  
✅ FastAPI backend with 3 endpoints  
✅ Professional React dashboard with:
   - Header (Ocean Deep theme)
   - 4 metric cards (pH, TDS, DO, Turbidity)
   - 24h trend chart (Recharts)
   - Alert banner when unsafe
   - Chat widget (placeholder)

**Total build time: ~3 hours**

---

## **Next Steps (Hours 3–7)**

### Hour 3: Polish
- Make responsive (mobile test at 375px)
- Add refresh button
- Improve error handling

### Hour 4: Add ML (optional but impressive)
- Train quick Random Forest on the data
- Add forecast endpoint
- Show predictions in UI

### Hour 5: Chat Integration
- Add Claude API call (`/api/chat`)
- Connect ChatWidget to real responses

### Hour 6: Reports
- Add report generation
- Download button

### Hour 7: Deploy + Video
- Push to GitHub
- Deploy backend (Railway)
- Deploy frontend (Vercel)
- Record 3–4 min demo

---

## **Troubleshooting**

**Frontend shows "Loading..." forever**
- Check if backend is running: `curl http://localhost:8000/`
- Check browser console for CORS errors
- Make sure ports 8000 and 5173 are free

**Backend won't start**
- Is Python installed? `python3 --version`
- Did you activate venv? `source venv/bin/activate`
- Is port 8000 free? `lsof -i :8000`

**No data showing**
- Check `aquaguard_data.json` exists
- Check path in `main.py` is correct
- Print `len(ALL_DATA)` in backend to verify load

---

## **You're Ready!**

Paste the commands above, hit Enter, and you'll have a working platform.

Any blockers? Let me know. 🚀
