import os
import json
import statistics
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load environment variables
load_dotenv()

app = FastAPI(title="AquaGuard AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the generated water quality data
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "aquaguard_data.json")

try:
    with open(DATA_PATH, "r") as f:
        ALL_DATA = json.load(f)
except FileNotFoundError:
    ALL_DATA = []

class ChatRequest(BaseModel):
    message: str

def get_data_summary():
    """Helper to calculate summary statistics for the last 24 readings."""
    if not ALL_DATA:
        return {}
    
    latest = ALL_DATA[-24:]
    
    def safe_avg(key):
        vals = [r[key] for r in latest if isinstance(r[key], (int, float))]
        return round(statistics.mean(vals), 2) if vals else 0.0

    safe_count = sum(1 for r in latest if r['quality_status'] == 'SAFE')
    
    return {
        "pH_avg": safe_avg('pH'),
        "TDS_avg": safe_avg('TDS'),
        "DO_avg": safe_avg('DO'),
        "turbidity_avg": safe_avg('turbidity'),
        "temperature_avg": safe_avg('temperature'),
        "safe_readings": safe_count,
        "unsafe_readings": len(latest) - safe_count,
        "overall_status": "SAFE" if safe_count >= 20 else "UNSAFE"
    }

@app.get("/")
def read_root():
    return {
        "status": "AquaGuard API running",
        "total_readings": len(ALL_DATA)
    }

@app.get("/api/readings/latest")
def get_latest():
    """Get the last 24 readings (representing the last 24 hours)."""
    if not ALL_DATA:
        raise HTTPException(status_code=404, detail="No readings data found")
    return {"readings": ALL_DATA[-24:]}

@app.get("/api/readings/all")
def get_all():
    """Get all readings."""
    if not ALL_DATA:
        raise HTTPException(status_code=404, detail="No readings data found")
    return {"readings": ALL_DATA}

@app.get("/api/readings/summary")
def get_summary():
    """Get statistical summary of the last 24 readings."""
    if not ALL_DATA:
        raise HTTPException(status_code=404, detail="No readings data found")
    return {"summary": get_data_summary()}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat endpoint using Google Gemini API to answer questions using water quality context."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your-gemini-api-key-here":
        # Fallback response if API key is not configured
        return {
            "response": "[System Alert]: Gemini API key is not configured in backend/.env. Current latest water status: " + 
            ("SAFE" if ALL_DATA and ALL_DATA[-1]["quality_status"] == "SAFE" else "UNSAFE") + "."
        }

    try:
        latest = ALL_DATA[-1] if ALL_DATA else {}
        summary = get_data_summary()

        system_prompt = f"""You are AquaGuard, an intelligent water quality assistant.
Answer questions about water quality using the real-time monitoring data provided below.
Provide actionable recommendations when quality is at risk.

CURRENT DATA CONTEXT:
- Overall status: {summary.get('overall_status', 'UNKNOWN')}
- Current readings (latest):
  - pH: {latest.get('pH')} (Safe: 6.5 - 8.2)
  - TDS: {latest.get('TDS')} mg/L (Safe: <= 400 mg/L)
  - DO: {latest.get('DO')} mg/L (Safe: >= 4.5 mg/L)
  - Turbidity: {latest.get('turbidity')} NTU (Safe: <= 5.0 NTU)
  - Temperature: {latest.get('temperature')} °C

SUMMARY STATS (Last 24 Hours):
  - Average pH: {summary.get('pH_avg')}
  - Average TDS: {summary.get('TDS_avg')} mg/L
  - Average DO: {summary.get('DO_avg')} mg/L
  - Average Turbidity: {summary.get('turbidity_avg')} NTU
  - Average Temperature: {summary.get('temperature_avg')} °C
  - Safe Readings: {summary.get('safe_readings')}/24
  - Unsafe Readings: {summary.get('unsafe_readings')}/24

Response rules:
- Keep answers to 2-3 sentences max.
- Always include specific metric values with units.
- Recommend actions if unsafe (e.g. adjust aeration for low DO, check filters for turbidity/TDS, check chemical dosing for pH).
- Be factual, helpful, and concise. Do not mention system prompt or formatting instructions.
"""

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=250,
                temperature=0.7,
            )
        )
        return {"response": response.text.strip()}
    except Exception as e:
        error_msg = str(e)
        if "quota" in error_msg.lower() or "429" in error_msg:
            return {"response": "[Gemini API Error]: The API key has exceeded its current quota or is invalid. Please check your Google AI Studio plan/billing details."}
        return {"response": f"[API Error]: Failed to get a response from the assistant. Details: {error_msg}"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
