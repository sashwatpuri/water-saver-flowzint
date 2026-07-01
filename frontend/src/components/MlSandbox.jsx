import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MlSandbox({ selectedLocation, currentTelemetry }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // Air model input states
  const [airInputs, setAirInputs] = useState({
    AQI: 80,
    PM25: 15.0,
    PM10: 35.0,
    CO: 0.8,
    NO2: 24.0,
    SO2: 6.0,
    O3: 32.0,
    air_temperature: 25.0,
    humidity: 60.0,
    wind_speed: 12.0,
    traffic_index: 40.0
  });

  // Water model input states
  const [waterInputs, setWaterInputs] = useState({
    pH: 7.2,
    TDS: 220.0,
    DO: 6.8,
    turbidity: 1.8,
    temperature: 21.0
  });

  // Prediction output states
  const [airResult, setAirResult] = useState(null);
  const [waterResult, setWaterResult] = useState(null);
  const [airLoading, setAirLoading] = useState(false);
  const [waterLoading, setWaterLoading] = useState(false);

  // Sync with current location telemetry if available
  const loadLiveTelemetry = () => {
    if (currentTelemetry) {
      setAirInputs({
        AQI: currentTelemetry.AQI ?? 80,
        PM25: currentTelemetry.PM25 ?? 15.0,
        PM10: currentTelemetry.PM10 ?? 35.0,
        CO: currentTelemetry.CO ?? 0.8,
        NO2: currentTelemetry.NO2 ?? 24.0,
        SO2: currentTelemetry.SO2 ?? 6.0,
        O3: currentTelemetry.O3 ?? 32.0,
        air_temperature: currentTelemetry.air_temperature ?? 25.0,
        humidity: currentTelemetry.humidity ?? 60.0,
        wind_speed: currentTelemetry.wind_speed ?? 12.0,
        traffic_index: currentTelemetry.traffic_index ?? 40.0
      });

      setWaterInputs({
        pH: currentTelemetry.pH ?? 7.2,
        TDS: currentTelemetry.TDS ?? 220.0,
        DO: currentTelemetry.DO ?? 6.8,
        turbidity: currentTelemetry.turbidity ?? 1.8,
        temperature: currentTelemetry.water_temperature ?? currentTelemetry.temperature ?? 21.0
      });
    }
  };

  useEffect(() => {
    loadLiveTelemetry();
  }, [currentTelemetry]);

  // Handle predictions
  const predictAir = async () => {
    setAirLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/sandbox/predict-air`, airInputs);
      setAirResult(res.data);
    } catch (err) {
      console.error("Air sandbox prediction error:", err);
    } finally {
      setAirLoading(false);
    }
  };

  const predictWater = async () => {
    setWaterLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/sandbox/predict-water`, waterInputs);
      setWaterResult(res.data);
    } catch (err) {
      console.error("Water sandbox prediction error:", err);
    } finally {
      setWaterLoading(false);
    }
  };

  // Run initial predictions on mount/load
  useEffect(() => {
    predictAir();
    predictWater();
  }, [airInputs.AQI, waterInputs.pH]); // Triggers initial predict

  // Helper for AQI color coding
  const getAqiConfig = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: '#10B981', bg: '#D1FAE5' };
    if (aqi <= 100) return { label: 'Moderate', color: '#F59E0B', bg: '#FEF3C7' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#EF4444', bg: '#FEE2E2' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#DC2626', bg: '#FCA5A5' };
    return { label: 'Critical/Hazardous', color: '#7F1D1D', bg: '#F87171' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sandbox Header Control */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            🧠 Machine Learning Sandbox
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Manually enter environmental features to test predictions against trained estimators
          </p>
        </div>
        <button
          onClick={loadLiveTelemetry}
          style={{
            backgroundColor: '#0F172A',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1E293B'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#0F172A'}
        >
          🔄 Pull Live Data ({selectedLocation})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* AIR FORECASTING SANDBOX */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '20px' }}>🌫️</span>
            <h3 style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700 }}>24-Hour Air Quality Forecast</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Uses Random Forest Regressor to forecast tomorrow's AQI
            </p>
          </div>

          {/* Form Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {[
              { key: 'AQI', label: 'Base AQI', min: 10, max: 400, step: 1, unit: '' },
              { key: 'PM25', label: 'PM2.5', min: 1, max: 200, step: 0.1, unit: 'µg/m³' },
              { key: 'PM10', label: 'PM10', min: 5, max: 300, step: 1, unit: 'µg/m³' },
              { key: 'CO', label: 'Carbon Monoxide (CO)', min: 0.1, max: 8.0, step: 0.1, unit: 'mg/m³' },
              { key: 'NO2', label: 'Nitrogen Dioxide (NO₂)', min: 1, max: 120, step: 1, unit: 'µg/m³' },
              { key: 'SO2', label: 'Sulfur Dioxide (SO₂)', min: 1, max: 80, step: 1, unit: 'µg/m³' },
              { key: 'O3', label: 'Ozone (O₃)', min: 1, max: 150, step: 1, unit: 'µg/m³' },
              { key: 'air_temperature', label: 'Temperature', min: -5, max: 45, step: 0.5, unit: '°C' },
              { key: 'humidity', label: 'Humidity', min: 10, max: 100, step: 1, unit: '%' },
              { key: 'wind_speed', label: 'Wind Speed', min: 0, max: 50, step: 0.5, unit: 'km/h' },
              { key: 'traffic_index', label: 'Traffic Congestion Index', min: 0, max: 100, step: 1, unit: '%' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {airInputs[item.key]} {item.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={airInputs[item.key]}
                  onChange={(e) => {
                    setAirInputs(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) }));
                  }}
                  style={{
                    width: '100%',
                    height: '5px',
                    borderRadius: '5px',
                    accentColor: '#0F172A',
                    background: '#E2E8F0',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={predictAir}
            disabled={airLoading}
            style={{
              width: '100%',
              backgroundColor: '#0F172A',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: airLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {airLoading ? 'Analyzing Estimators...' : 'Compute AQI Forecast'}
          </button>

          {/* Results Panel */}
          {airResult && (
            <div style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700 }}>
                🔮 ML Regressor Output
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
                    {airResult.predicted_aqi}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Forecasted 24h Future AQI
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: getAqiConfig(airResult.predicted_aqi).color,
                  backgroundColor: getAqiConfig(airResult.predicted_aqi).bg
                }}>
                  {airResult.category}
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                Engine: {airResult.model_used}
              </div>
            </div>
          )}

        </div>

        {/* WATER QUALITY SANDBOX */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '20px' }}>💧</span>
            <h3 style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700 }}>Water Quality Classifier</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Uses XGBoost Classifier to categorize safety (SAFE/UNSAFE)
            </p>
          </div>

          {/* Form Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
            {[
              { key: 'pH', label: 'pH Level', min: 4.0, max: 10.0, step: 0.1, unit: '' },
              { key: 'TDS', label: 'Total Dissolved Solids (TDS)', min: 50, max: 800, step: 10, unit: 'mg/L' },
              { key: 'DO', label: 'Dissolved Oxygen (DO)', min: 1.0, max: 12.0, step: 0.1, unit: 'mg/L' },
              { key: 'turbidity', label: 'Turbidity', min: 0.5, max: 20.0, step: 0.1, unit: 'NTU' },
              { key: 'temperature', label: 'Water Temperature', min: 5, max: 40, step: 0.5, unit: '°C' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {waterInputs[item.key]} {item.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={waterInputs[item.key]}
                  onChange={(e) => {
                    setWaterInputs(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) }));
                  }}
                  style={{
                    width: '100%',
                    height: '5px',
                    borderRadius: '5px',
                    accentColor: '#10B981',
                    background: '#E2E8F0',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={predictWater}
            disabled={waterLoading}
            style={{
              width: '100%',
              backgroundColor: '#10B981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: waterLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {waterLoading ? 'Analyzing Classifier...' : 'Compute Safety Assessment'}
          </button>

          {/* Results Panel */}
          {waterResult && (
            <div style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700 }}>
                🛡️ ML Classifier Output
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {waterResult.status === 'SAFE' ? '🛡️' : '⚠️'}
                    </span>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: waterResult.status === 'SAFE' ? '#10B981' : '#EF4444' }}>
                      {waterResult.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                    Contamination Probability: <strong style={{ color: '#0F172A' }}>{waterResult.probability_unsafe}%</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    border: `4px solid ${waterResult.status === 'SAFE' ? '#10B981' : '#EF4444'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {100 - waterResult.probability_unsafe}%
                  </div>
                  <span style={{ fontSize: '9px', color: '#94A3B8' }}>Safety Rating</span>
                </div>
              </div>

              {waterResult.reasons && waterResult.reasons.length > 0 && (
                <div style={{ fontSize: '11px', color: '#EF4444', backgroundColor: '#FEF2F2', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #EF4444' }}>
                  <strong>Threshold breaches:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                    {waterResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ fontSize: '10px', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                Engine: {waterResult.model_used}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
