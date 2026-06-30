# AquaGuard AI – Parallel Development Tracks

You can work on these **simultaneously** (different people or time-blocks).

---

## **TRACK A: Data Layer & API Setup**
**Owner:** Backend developer (or you, first 2 hours)  
**Duration:** 2–4 hours  
**Deliverable:** JSON file + local API endpoints

### Tasks

1. **Generate organic randomized dataset**
   ```bash
   python aquaguard_organic_data_generator.py
   ```
   Output: `aquaguard_data.json` (720 readings, 75% SAFE, 25% UNSAFE)

2. **Set up FastAPI backend skeleton**
   ```bash
   mkdir backend
   cd backend
   pip install fastapi uvicorn python-dotenv
   ```

3. **Create `main.py` with data loading**
   ```python
   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   import json
   
   app = FastAPI()
   
   # Enable CORS (for frontend)
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   
   # Load synthetic data
   with open('../aquaguard_data.json', 'r') as f:
       ALL_DATA = json.load(f)
   
   @app.get("/")
   def root():
       return {"status": "AquaGuard API running"}
   
   @app.get("/api/readings/latest")
   def get_latest():
       """Get last 24 readings (24 hours)"""
       return {"readings": ALL_DATA[-24:]}
   
   @app.get("/api/readings/all")
   def get_all():
       """Get all readings"""
       return {"readings": ALL_DATA}
   
   @app.get("/api/readings/summary")
   def get_summary():
       """Get statistical summary"""
       latest = ALL_DATA[-24:]
       
       def avg(key):
           values = [r[key] for r in latest if isinstance(r[key], (int, float))]
           return round(sum(values) / len(values), 2) if values else None
       
       safe_count = sum(1 for r in latest if r['quality_status'] == 'SAFE')
       
       return {
           "summary": {
               "pH_avg": avg('pH'),
               "TDS_avg": avg('TDS'),
               "DO_avg": avg('DO'),
               "turbidity_avg": avg('turbidity'),
               "temperature_avg": avg('temperature'),
               "safe_readings": safe_count,
               "unsafe_readings": len(latest) - safe_count,
               "overall_status": "SAFE" if safe_count >= 20 else "UNSAFE"
           }
       }
   
   if __name__ == "__main__":
       import uvicorn
       uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

4. **Test endpoints**
   ```bash
   python main.py
   # In another terminal:
   curl http://localhost:8000/
   curl http://localhost:8000/api/readings/latest
   curl http://localhost:8000/api/readings/summary
   ```

### ✅ Success Criteria
- [ ] Data file exists with 720 readings
- [ ] API runs without errors
- [ ] `curl http://localhost:8000/api/readings/summary` returns valid JSON
- [ ] CORS headers present (no frontend errors)

### Code Checklist
- [ ] `.gitignore` includes `__pycache__`, `.env`, `*.pyc`
- [ ] No hardcoded secrets
- [ ] JSON responses are valid

---

## **TRACK B: Frontend Structure & Components**
**Owner:** Frontend developer (or you in parallel)  
**Duration:** 3–5 hours  
**Deliverable:** React app with components, no API calls yet (mock data)

### Tasks

1. **Bootstrap React project**
   ```bash
   npm create vite@latest aquaguard-frontend -- --template react
   cd aquaguard-frontend
   npm install
   ```

2. **Install dependencies**
   ```bash
   npm install recharts axios tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Create folder structure**
   ```
   src/
   ├── components/
   │   ├── Dashboard.jsx
   │   ├── MetricCard.jsx
   │   ├── AlertBanner.jsx
   │   ├── Chart.jsx
   │   ├── ChatWidget.jsx
   │   └── Header.jsx
   ├── styles/
   │   └── index.css
   ├── data/
   │   └── mockData.js
   ├── App.jsx
   └── main.jsx
   ```

4. **Create `src/styles/index.css`** (Design System Variables)
   ```css
   :root {
     /* Colors */
     --color-ocean-deep: #0F3B6F;
     --color-teal: #1B9B8A;
     --color-slate: #2C3E50;
     --color-light-gray: #F5F7FA;
     
     --color-text-primary: #1F2937;
     --color-text-secondary: #6B7280;
     --color-border: #E5E7EB;
     --color-bg: #FFFFFF;
     
     --color-safe: #059669;
     --color-monitor: #D97706;
     --color-risk: #DC2626;
     
     /* Spacing */
     --space-xs: 8px;
     --space-sm: 12px;
     --space-md: 16px;
     --space-lg: 20px;
     --space-xl: 24px;
     
     /* Typography */
     --font-size-sm: 14px;
     --font-size-base: 16px;
     --font-size-lg: 18px;
     --font-size-xl: 24px;
     --font-size-2xl: 32px;
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
     line-height: 1.6;
   }
   
   .card {
     background: var(--color-bg);
     border: 1px solid var(--color-border);
     border-radius: 8px;
     padding: var(--space-lg);
     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
   }
   
   .button {
     padding: var(--space-sm) var(--space-lg);
     border: none;
     border-radius: 6px;
     cursor: pointer;
     font-size: var(--font-size-base);
     font-weight: 600;
     transition: background-color 0.2s;
   }
   
   .button-primary {
     background-color: var(--color-ocean-deep);
     color: white;
   }
   
   .button-primary:hover {
     background-color: #0a2d52;
   }
   ```

5. **Create `src/data/mockData.js`**
   ```javascript
   // Mock data for frontend (before API is ready)
   export const mockLatestReadings = [
     {
       timestamp: new Date().toISOString(),
       pH: 7.1,
       TDS: 215,
       DO: 6.8,
       turbidity: 0.9,
       temperature: 24.5,
       quality_status: 'SAFE'
     },
     {
       timestamp: new Date(Date.now() - 3600000).toISOString(),
       pH: 7.0,
       TDS: 220,
       DO: 6.5,
       turbidity: 1.1,
       temperature: 23.8,
       quality_status: 'SAFE'
     }
   ];
   
   export const mockChartData = Array.from({ length: 24 }, (_, i) => ({
     hour: `${i}:00`,
     DO: 5.5 + Math.random() * 2,
     safe_min: 5.0
   }));
   
   export const mockSummary = {
     pH_avg: 7.1,
     TDS_avg: 218,
     DO_avg: 6.8,
     turbidity_avg: 0.95,
     temperature_avg: 24.2,
     safe_readings: 22,
     unsafe_readings: 2,
     overall_status: 'SAFE'
   };
   ```

6. **Create `src/components/Header.jsx`**
   ```jsx
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
           <h1 style={{ fontSize: 'var(--font-size-xl)', margin: 0 }}>
             AquaGuard AI
           </h1>
           <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, margin: 0 }}>
             Water Quality Intelligence
           </p>
         </div>
         <div style={{ textAlign: 'right' }}>
           <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
             Monitoring Point A
           </p>
           <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', opacity: 0.8 }}>
             Last update: Just now
           </p>
         </div>
       </header>
     );
   }
   ```

7. **Create `src/components/MetricCard.jsx`**
   ```jsx
   export default function MetricCard({ label, value, unit, status, min, max }) {
     const getStatusColor = (status) => {
       if (status === 'SAFE') return 'var(--color-safe)';
       if (status === 'MONITOR') return 'var(--color-monitor)';
       return 'var(--color-risk)';
     };
     
     return (
       <div className="card" style={{ textAlign: 'center' }}>
         <label style={{
           fontSize: 'var(--font-size-sm)',
           color: 'var(--color-text-secondary)',
           display: 'block',
           marginBottom: 'var(--space-xs)'
         }}>
           {label}
         </label>
         
         <div style={{
           fontSize: 'var(--font-size-2xl)',
           fontWeight: '600',
           fontFamily: "'Menlo', 'Monaco', monospace",
           color: 'var(--color-text-primary)',
           margin: 'var(--space-md) 0'
         }}>
           {value} {unit}
         </div>
         
         <div style={{
           fontSize: 'var(--font-size-sm)',
           color: getStatusColor(status)
         }}>
           ✓ {status}
           {min && max && ` (${min}–${max})`}
         </div>
       </div>
     );
   }
   ```

8. **Create `src/components/AlertBanner.jsx`**
   ```jsx
   export default function AlertBanner({ show, title, message }) {
     if (!show) return null;
     
     return (
       <div style={{
         background: '#FEF2F2',
         borderLeft: '4px solid var(--color-risk)',
         padding: 'var(--space-md)',
         marginBottom: 'var(--space-lg)',
         display: 'flex',
         gap: 'var(--space-md)',
         alignItems: 'flex-start'
       }}>
         <span style={{ fontSize: '20px' }}>⚠️</span>
         <div>
           <div style={{
             fontWeight: '600',
             color: 'var(--color-risk)'
           }}>
             {title}
           </div>
           <div style={{
             fontSize: 'var(--font-size-sm)',
             color: 'var(--color-text-secondary)',
             marginTop: 'var(--space-xs)'
           }}>
             {message}
           </div>
         </div>
       </div>
     );
   }
   ```

9. **Create `src/components/Chart.jsx`** (using Recharts)
   ```jsx
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
   
   export default function Chart({ data }) {
     return (
       <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
         <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>
           24-Hour Trend
         </h2>
         <ResponsiveContainer width="100%" height={300}>
           <LineChart data={data}>
             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
             <XAxis dataKey="hour" />
             <YAxis label={{ value: 'DO (mg/L)', angle: -90, position: 'insideLeft' }} />
             <Tooltip 
               contentStyle={{
                 background: 'var(--color-bg)',
                 border: '1px solid var(--color-border)'
               }}
             />
             <ReferenceLine 
               y={5.0} 
               stroke="var(--color-risk)" 
               strokeDasharray="5 5"
               label="Safe Min"
             />
             <Line 
               type="monotone" 
               dataKey="DO" 
               stroke="var(--color-teal)" 
               dot={false}
               strokeWidth={2}
             />
           </LineChart>
         </ResponsiveContainer>
       </div>
     );
   }
   ```

10. **Create `src/components/ChatWidget.jsx`**
    ```jsx
    import { useState } from 'react';
    
    export default function ChatWidget() {
      const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! Ask me about water quality. "Is the water safe?" "What\'s the forecast?"' }
      ]);
      const [input, setInput] = useState('');
      
      const handleSend = async () => {
        if (!input.trim()) return;
        
        setMessages([...messages, { role: 'user', text: input }]);
        setInput('');
        
        // TODO: Replace with real API call
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: 'This would be Claude\'s response. Currently using mock API.'
          }]);
        }, 500);
      };
      
      return (
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>
            AquaGuard Assistant
          </h2>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 'var(--space-md)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-md)'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 'var(--space-md)',
                textAlign: msg.role === 'user' ? 'right' : 'left'
              }}>
                <div style={{
                  display: 'inline-block',
                  maxWidth: '80%',
                  background: msg.role === 'user' 
                    ? 'var(--color-ocean-deep)' 
                    : 'var(--color-light-gray)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: '6px',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {msg.text}
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
                borderRadius: '6px',
                fontSize: 'var(--font-size-sm)'
              }}
            />
            <button 
              onClick={handleSend}
              className="button button-primary"
            >
              Send
            </button>
          </div>
        </div>
      );
    }
    ```

11. **Create `src/components/Dashboard.jsx`**
    ```jsx
    import Header from './Header';
    import AlertBanner from './AlertBanner';
    import MetricCard from './MetricCard';
    import Chart from './Chart';
    import ChatWidget from './ChatWidget';
    import { mockLatestReadings, mockChartData, mockSummary } from '../data/mockData';
    
    export default function Dashboard() {
      const latest = mockLatestReadings[0];
      const summary = mockSummary;
      
      // Determine alert state
      const hasAlert = latest.DO < 5.0 || latest.TDS > 400;
      
      return (
        <div>
          <Header />
          
          <div style={{ padding: 'var(--space-lg)', maxWidth: '1200px', margin: '0 auto' }}>
            <AlertBanner 
              show={hasAlert}
              title="⚠️ Water Quality Alert"
              message="One or more parameters are outside safe ranges. Review details below."
            />
            
            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-lg)'
            }}>
              <MetricCard 
                label="pH Level"
                value={latest.pH}
                unit=""
                status={latest.pH >= 6.5 && latest.pH <= 8.5 ? 'SAFE' : 'UNSAFE'}
                min="6.5"
                max="8.5"
              />
              <MetricCard 
                label="TDS"
                value={latest.TDS}
                unit="mg/L"
                status={latest.TDS < 400 ? 'SAFE' : 'UNSAFE'}
                min="0"
                max="400"
              />
              <MetricCard 
                label="Dissolved Oxygen"
                value={latest.DO}
                unit="mg/L"
                status={latest.DO >= 5.0 ? 'SAFE' : 'UNSAFE'}
                min="5.0"
              />
              <MetricCard 
                label="Turbidity"
                value={latest.turbidity}
                unit="NTU"
                status={latest.turbidity < 5 ? 'SAFE' : 'UNSAFE'}
                max="5"
              />
            </div>
            
            {/* Chart */}
            <Chart data={mockChartData} />
            
            {/* Chat Widget */}
            <ChatWidget />
          </div>
        </div>
      );
    }
    ```

12. **Create `src/App.jsx`**
    ```jsx
    import Dashboard from './components/Dashboard';
    import './styles/index.css';
    
    function App() {
      return <Dashboard />;
    }
    
    export default App;
    ```

13. **Update `index.html`** (make sure it has proper head)
    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AquaGuard AI – Water Quality Intelligence</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.jsx"></script>
      </body>
    </html>
    ```

14. **Start dev server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173`

### ✅ Success Criteria
- [ ] Frontend loads without errors
- [ ] All metric cards display
- [ ] Chart renders 24h trend
- [ ] Chat widget accepts input
- [ ] No console errors
- [ ] Mobile responsive (test at 375px width)

### Code Checklist
- [ ] Uses design system CSS variables
- [ ] No hardcoded colors
- [ ] Component hierarchy is clear
- [ ] Mock data clearly labeled
- [ ] No API calls yet (ready for Track C)

---

## **TRACK C: API Integration**
**Owner:** Backend/Full-stack developer (you, hours 4–6)  
**Duration:** 2–3 hours  
**Deliverable:** Frontend + Backend connected, end-to-end working

### Tasks

1. **Update `src/data/api.js`** (new file)
   ```javascript
   const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   
   export const fetchLatestReadings = async () => {
     try {
       const res = await fetch(`${API_BASE}/api/readings/latest`);
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       return data.readings;
     } catch (err) {
       console.error('Failed to fetch readings:', err);
       return [];
     }
   };
   
   export const fetchSummary = async () => {
     try {
       const res = await fetch(`${API_BASE}/api/readings/summary`);
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       return data.summary;
     } catch (err) {
       console.error('Failed to fetch summary:', err);
       return null;
     }
   };
   
   export const fetchAllReadings = async () => {
     try {
       const res = await fetch(`${API_BASE}/api/readings/all`);
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       return data.readings;
     } catch (err) {
       console.error('Failed to fetch all readings:', err);
       return [];
     }
   };
   
   export const sendChatMessage = async (message) => {
     try {
       const res = await fetch(`${API_BASE}/api/chat`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message })
       });
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       return data.response;
     } catch (err) {
       console.error('Failed to send chat message:', err);
       return 'Unable to reach the assistant.';
     }
   };
   ```

2. **Update `src/components/Dashboard.jsx`** to use real API
   ```jsx
   import { useState, useEffect } from 'react';
   import Header from './Header';
   import AlertBanner from './AlertBanner';
   import MetricCard from './MetricCard';
   import Chart from './Chart';
   import ChatWidget from './ChatWidget';
   import { fetchLatestReadings, fetchSummary, fetchAllReadings } from '../data/api';
   
   export default function Dashboard() {
     const [latest, setLatest] = useState(null);
     const [summary, setSummary] = useState(null);
     const [chartData, setChartData] = useState([]);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       const loadData = async () => {
         const [readings, summaryData, allReadings] = await Promise.all([
           fetchLatestReadings(),
           fetchSummary(),
           fetchAllReadings()
         ]);
         
         setLatest(readings?.[readings.length - 1] || null);
         setSummary(summaryData);
         
         // Format for chart (last 24h)
         const chartData = allReadings.slice(-24).map((r, i) => ({
           hour: `${i}:00`,
           DO: r.DO,
           safe_min: 5.0
         }));
         setChartData(chartData);
         setLoading(false);
       };
       
       loadData();
       // Refresh every 10 seconds
       const interval = setInterval(loadData, 10000);
       return () => clearInterval(interval);
     }, []);
     
     if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
     if (!latest) return <div style={{ padding: '20px' }}>No data available</div>;
     
     const hasAlert = latest.DO < 5.0 || latest.TDS > 400;
     
     return (
       <div>
         <Header />
         
         <div style={{ padding: 'var(--space-lg)', maxWidth: '1200px', margin: '0 auto' }}>
           <AlertBanner 
             show={hasAlert}
             title="⚠️ Water Quality Alert"
             message={`One or more parameters are outside safe ranges.`}
           />
           
           {/* Metrics Grid */}
           <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
             gap: 'var(--space-lg)',
             marginBottom: 'var(--space-lg)'
           }}>
             <MetricCard 
               label="pH Level"
               value={latest.pH}
               unit=""
               status={latest.pH >= 6.5 && latest.pH <= 8.5 ? 'SAFE' : 'UNSAFE'}
             />
             <MetricCard 
               label="TDS"
               value={latest.TDS}
               unit="mg/L"
               status={latest.TDS < 400 ? 'SAFE' : 'UNSAFE'}
             />
             <MetricCard 
               label="Dissolved Oxygen"
               value={latest.DO}
               unit="mg/L"
               status={latest.DO >= 5.0 ? 'SAFE' : 'UNSAFE'}
             />
             <MetricCard 
               label="Turbidity"
               value={latest.turbidity}
               unit="NTU"
               status={latest.turbidity < 5 ? 'SAFE' : 'UNSAFE'}
             />
           </div>
           
           {/* Chart */}
           <Chart data={chartData} />
           
           {/* Chat Widget */}
           <ChatWidget />
         </div>
       </div>
     );
   }
   ```

3. **Update Chat Widget to use API**
   ```jsx
   import { useState } from 'react';
   import { sendChatMessage } from '../data/api';
   
   export default function ChatWidget() {
     const [messages, setMessages] = useState([
       { role: 'assistant', text: 'Hi! Ask me about water quality. "Is the water safe?" or "What\'s the forecast?"' }
     ]);
     const [input, setInput] = useState('');
     const [loading, setLoading] = useState(false);
     
     const handleSend = async () => {
       if (!input.trim()) return;
       
       setMessages([...messages, { role: 'user', text: input }]);
       setInput('');
       setLoading(true);
       
       const response = await sendChatMessage(input);
       setMessages(prev => [...prev, { role: 'assistant', text: response }]);
       setLoading(false);
     };
     
     return (
       <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
         <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>
           AquaGuard Assistant
         </h2>
         
         <div style={{
           flex: 1,
           overflowY: 'auto',
           marginBottom: 'var(--space-md)',
           borderBottom: '1px solid var(--color-border)',
           paddingBottom: 'var(--space-md)'
         }}>
           {messages.map((msg, i) => (
             <div key={i} style={{
               marginBottom: 'var(--space-md)',
               textAlign: msg.role === 'user' ? 'right' : 'left'
             }}>
               <div style={{
                 display: 'inline-block',
                 maxWidth: '80%',
                 background: msg.role === 'user' 
                   ? 'var(--color-ocean-deep)' 
                   : 'var(--color-light-gray)',
                 color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                 padding: 'var(--space-sm) var(--space-md)',
                 borderRadius: '6px',
                 fontSize: 'var(--font-size-sm)'
               }}>
                 {msg.text}
               </div>
             </div>
           ))}
           {loading && <div style={{ color: 'var(--color-text-secondary)' }}>Typing...</div>}
         </div>
         
         <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Ask about water quality..."
             disabled={loading}
             style={{
               flex: 1,
               padding: 'var(--space-sm)',
               border: '1px solid var(--color-border)',
               borderRadius: '6px',
               fontSize: 'var(--font-size-sm)'
             }}
           />
           <button 
             onClick={handleSend}
             disabled={loading}
             className="button button-primary"
             style={{ opacity: loading ? 0.6 : 1 }}
           >
             Send
           </button>
         </div>
       </div>
     );
   }
   ```

4. **Create `.env.local` in frontend folder**
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

5. **Test end-to-end**
   ```bash
   # Terminal 1: Backend
   cd backend
   python main.py
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   
   # Open browser: http://localhost:5173
   # Should see real data from API
   ```

### ✅ Success Criteria
- [ ] Dashboard loads data from backend
- [ ] Metrics update in real-time
- [ ] Chart shows actual readings
- [ ] Chat sends messages to (mock) API
- [ ] No CORS errors
- [ ] Refresh button works

---

## **Execution Timeline**

### Hours 1–2: Track A (Backend Data)
```bash
python aquaguard_organic_data_generator.py
# → aquaguard_data.json created
```

### Hours 1–4: Track B (Frontend Components) — *in parallel with Track A*
```bash
npm create vite aquaguard-frontend -- --template react
npm install
# → Components created, mockData.js in place
npm run dev
# → Dashboard renders with mock data
```

### Hours 4–6: Track C (API Integration)
```bash
# Connect frontend to backend
# Add fetch calls
# Deploy & test
```

### Hours 6–7: Polish + Video
- Add ML predictions (optional)
- Polish UI (responsive, mobile)
- Record demo video

---

## **To Start Right Now**

### Step 1 (5 min)
```bash
cd /home/claude
python aquaguard_organic_data_generator.py
# → Check output: aquaguard_data.json
```

### Step 2 (30 min)
Copy the FastAPI code from Track A and save as `backend/main.py`

### Step 3 (1 hour)
Follow Track B steps to create React project and components

### Step 4 (1 hour)
Connect them in Track C

**You should have a working dashboard by Hour 3. ✅**

---

## **Questions Before You Start?**

1. Do you want to start all 3 tracks, or pick one to finish first?
2. Need help scaffolding the React project structure?
3. Want me to create a Git repo structure as well?

Let's go! 🚀
