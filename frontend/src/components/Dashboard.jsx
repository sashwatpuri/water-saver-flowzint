import React, { useState, useEffect } from 'react';
import Header from './Header';
import MetricCard from './MetricCard';
import Chart from './Chart';
import GisMap from './GisMap';
import SourceAnalysis from './SourceAnalysis';
import RecommendationsList from './RecommendationsList';
import SustainabilityScorecard from './SustainabilityScorecard';
import SensorHealthMonitor from './SensorHealthMonitor';
import AdminPanel from './AdminPanel';
import ChatWidget from './ChatWidget';
import MlSandbox from './MlSandbox';
import axios from 'axios';
import {
  fetchLocations,
  fetchLatestReadings,
  fetchSummary,
  fetchForecast,
  fetchSourceAnalysis,
  fetchRecommendations,
  fetchSensorHealth,
  fetchAiInsights,
  sendChatMessage
} from '../data/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sandbox' | 'analytics' | 'telemetry' | 'safety'
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Sector A');
  const [readings, setReadings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [sourceData, setSourceData] = useState({ sources: [], explanation: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [sensorHealth, setSensorHealth] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Embedding ChatWidget state in the dashboard grid
  const [embeddedChat, setEmbeddedChat] = useState([
    { role: 'assistant', text: 'Ask me anything about EcoSphere\'s monitored sectors, AI forecasts, or active alerts.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const loadNetworkData = async () => {
    try {
      const locRes = await fetchLocations();
      setLocations(locRes.locations);
      
      const healthRes = await fetchSensorHealth();
      setSensorHealth(healthRes);
      
      const insightsRes = await fetchAiInsights();
      setAiInsights(insightsRes);
    } catch (err) {
      console.error("Error fetching network metadata:", err);
      setError('Cannot connect to the backend server. Please verify FastAPI is running on port 8000.');
    }
  };

  const loadLocationSpecificData = async (loc) => {
    try {
      const [latestReadings, dataSummary, forecastData, sourceAnalysis, recsList] = await Promise.all([
        fetchLatestReadings(loc),
        fetchSummary(loc),
        fetchForecast(loc),
        fetchSourceAnalysis(loc),
        fetchRecommendations(loc)
      ]);
      
      setReadings(latestReadings);
      setSummary(dataSummary);
      setForecast(forecastData);
      setSourceData(sourceAnalysis);
      setRecommendations(recsList);
    } catch (err) {
      console.error(`Error loading details for location ${loc}:`, err);
    }
  };

  const initLoad = async () => {
    setLoading(true);
    await loadNetworkData();
    await loadLocationSpecificData(selectedLocation);
    setLoading(false);
  };

  useEffect(() => {
    initLoad();
    // Poll updates every 8 seconds
    const interval = setInterval(() => {
      loadNetworkData();
      loadLocationSpecificData(selectedLocation);
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
  };

  const handleConfigChange = () => {
    // Admin config toggled, reload location details immediately
    loadNetworkData();
    loadLocationSpecificData(selectedLocation);
  };

  const handleEmbeddedChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    
    setEmbeddedChat(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const reply = await sendChatMessage(text, selectedLocation);
      setEmbeddedChat(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setEmbeddedChat(prev => [...prev, { role: 'assistant', text: 'Error communicating with Gemini Core.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReportDownload = (reportType, format) => {
    // Triggers report download directly from FastAPI endpoint
    const url = `${API_BASE}/api/reports/generate?type=${reportType}&format=${format}&location=${encodeURIComponent(selectedLocation)}`;
    window.open(url, '_blank');
  };

  // Compile active alerts checklist dynamically from monitored locations
  const activeAlerts = [];
  locations.forEach(loc => {
    if (loc.aqi_color === 'red') {
      activeAlerts.push({
        id: `aqi-crit-${loc.name}`,
        type: 'Critical',
        msg: `Critical AQI exceeded 200 (${loc.current_aqi}) at ${loc.name}.`
      });
    } else if (loc.aqi_color === 'orange') {
      activeAlerts.push({
        id: `aqi-warn-${loc.name}`,
        type: 'Warning',
        msg: `PM2.5 / PM10 above WHO limits at ${loc.name}.`
      });
    }
    if (loc.water_status === 'Unsafe/Contaminated') {
      activeAlerts.push({
        id: `wqi-crit-${loc.name}`,
        type: 'Critical',
        msg: `Reservoir contamination detected at ${loc.name} WQI (${loc.current_wqi}).`
      });
    }
    if (loc.sensor_status === 'OFFLINE') {
      activeAlerts.push({
        id: `sen-off-${loc.name}`,
        type: 'Warning',
        msg: `IoT Sensor Core offline at ${loc.name}.`
      });
    }
  });

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{
          width: '42px', height: '42px',
          border: '3px solid #1E293B',
          borderTopColor: '#38BDF8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ fontSize: '15px', fontWeight: '600' }}>Booting EcoSphere AI Platform…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        maxWidth: '480px', margin: '120px auto',
        padding: '24px',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderLeft: '4px solid #EF4444',
        borderRadius: '12px',
        fontFamily: 'var(--font-sans)',
        color: '#F8FAFC'
      }}>
        <div style={{ fontWeight: '700', color: '#EF4444', marginBottom: '8px', fontSize: '16px' }}>
          ⚠️ Core API Connection Error
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
          {error}
        </p>
        <button
          onClick={initLoad}
          style={{
            padding: '8px 16px', fontSize: '13px', fontWeight: '700',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            backgroundColor: '#38BDF8', color: '#0F172A',
            transition: 'background-color 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0ea5e9'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#38BDF8'}
        >
          Re-Establish Link
        </button>
      </div>
    );
  }

  const latestReading = readings[readings.length - 1] ?? null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F5F9', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Panel */}
      <Header 
        lastUpdated={latestReading?.timestamp}
        selectedLocation={selectedLocation}
        onSelectLocation={handleLocationChange}
        locations={locations}
        activeAlertsCount={activeAlerts.length}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Left Sidebar */}
        <aside style={{
          width: '240px',
          backgroundColor: '#0F172A',
          color: '#fff',
          borderRight: '1px solid #1E293B',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', paddingLeft: '8px', marginBottom: '8px', letterSpacing: '0.05em' }}>
            Workspaces
          </div>
          {[
            { id: 'overview', label: '🌍 Overview & GIS Map' },
            { id: 'sandbox', label: '🧠 ML Model Sandbox' },
            { id: 'analytics', label: '📊 Telemetry Analytics' },
            { id: 'telemetry', label: '🎛️ Sensor Database' },
            { id: 'safety', label: '🚨 Safety & Controls' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.15s',
                backgroundColor: activeTab === tab.id ? '#1E293B' : 'transparent',
                color: activeTab === tab.id ? '#38BDF8' : '#94A3B8',
              }}
              onMouseOver={e => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = '#1E293B';
                  e.target.style.color = '#F8FAFC';
                }
              }}
              onMouseOut={e => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#94A3B8';
                }
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Collateral system health summary in sidebar */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid #1E293B', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>SYSTEM STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10B981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              API: 127.0.0.1 (Live)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: activeAlerts.length > 0 ? '#EF4444' : '#10B981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeAlerts.length > 0 ? '#EF4444' : '#10B981', display: 'inline-block' }} />
              {activeAlerts.length > 0 ? `${activeAlerts.length} Active Alert(s)` : 'Systems Nominal'}
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          
          {/* KPI TOP METRICS CARDS (Always visible at the top of every tab, providing continuous situational awareness) */}
          {latestReading && summary && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              <MetricCard
                label="Overall Eco Score"
                value={summary.environmental_score}
                unit="/100"
                status={summary.environmental_score >= 75 ? 'SAFE' : 'UNSAFE'}
                min={75}
              />
              <MetricCard
                label="Air Quality (AQI)"
                value={latestReading.AQI}
                unit=""
                status={latestReading.AQI <= 100 ? 'SAFE' : 'UNSAFE'}
                max={100}
              />
              <MetricCard
                label="Water Quality"
                value={latestReading.WQI}
                unit=""
                status={latestReading.water_status === 'SAFE' ? 'SAFE' : 'UNSAFE'}
                min={70}
              />
              <MetricCard
                label="Air Temp"
                value={latestReading.air_temperature}
                unit="°C"
                status="SAFE"
              />
              <MetricCard
                label="Humidity"
                value={latestReading.humidity}
                unit="%"
                status="SAFE"
              />
              <MetricCard
                label="Active Alerts"
                value={activeAlerts.length}
                unit="logs"
                status={activeAlerts.length === 0 ? 'SAFE' : 'UNSAFE'}
                max={0}
              />
            </div>
          )}

          {/* RENDER ACTIVE TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px', flexWrap: 'wrap' }}>
              {/* Interactive GIS map */}
              <GisMap 
                locations={locations} 
                selectedLocation={selectedLocation} 
                onSelectLocation={handleLocationChange} 
              />

              {/* Embedded AI Assistant Chat Panel */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '520px',
              }}>
                <div style={{ backgroundColor: '#0F172A', color: '#fff', padding: '14px 16px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🤖</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>AI assistant console</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>Inquiry desk for {selectedLocation}</div>
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {embeddedChat.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        backgroundColor: msg.role === 'user' ? '#0F172A' : '#fff',
                        color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        lineHeight: '1.5',
                        border: msg.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: 'flex', gap: '4px', alignSelf: 'flex-start', backgroundColor: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#64748B', display: 'inline-block', animation: 'dot-bounce 1.2s infinite' }} />
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#64748B', display: 'inline-block', animation: 'dot-bounce 1.2s infinite 0.2s' }} />
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#64748B', display: 'inline-block', animation: 'dot-bounce 1.2s infinite 0.4s' }} />
                    </div>
                  )}
                </div>

                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px', backgroundColor: '#fff' }}>
                  <input
                    type="text"
                    placeholder="Ask about AQI, WQI, or forecasts..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmbeddedChatSend()}
                    style={{
                      flex: 1,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleEmbeddedChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                      backgroundColor: chatInput.trim() ? '#0F172A' : '#94A3B8',
                      color: '#fff',
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <MlSandbox 
              selectedLocation={selectedLocation} 
              currentTelemetry={latestReading} 
            />
          )}

          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* LINE TRENDS & PREDICTIVE FORECASTS ROW */}
              {readings.length > 0 && forecast.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  <Chart defaultTab="air" historicalData={readings} locationName={selectedLocation} />
                  <Chart defaultTab="water" historicalData={readings} locationName={selectedLocation} />
                  <Chart defaultTab="forecast" forecastData={forecast} locationName={selectedLocation} />
                </div>
              )}

              {/* SOURCE ANALYSIS & MITIGATION ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <SourceAnalysis data={sourceData.sources} explanation={sourceData.explanation} />
                <RecommendationsList recommendations={recommendations} />
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Report Exporter Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Reports Console */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '340px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      🖨 Environmental Reports Console
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Auto-generate compliance reporting audits
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => handleReportDownload('weekly', 'csv')}
                        style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px', fontWeight: '600' }}
                      >
                        📥 Export CSV
                      </button>
                      <button
                        onClick={() => handleReportDownload('csr', 'pdf')}
                        style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px', fontWeight: '600' }}
                      >
                        📄 Download PDF
                      </button>
                    </div>

                    {[
                      { type: 'weekly', title: 'Weekly Operational Audit', desc: 'Summary of 24h average thresholds' },
                      { type: 'monthly', title: 'Monthly ESG Scorecard', desc: 'Targeting SDG carbon footprint rates' },
                      { type: 'compliance', title: 'EPA Regulatory Compliance', desc: 'Verification of pH, TDS & PM boundaries' }
                    ].map(rep => (
                      <div
                        key={rep.type}
                        onClick={() => handleReportDownload(rep.type, 'pdf')}
                        style={{
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          padding: '10px',
                          cursor: 'pointer',
                          backgroundColor: '#FAFAFA',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{rep.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{rep.desc}</div>
                        </div>
                        <span style={{ fontSize: '16px' }}>⚡</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sensor Health Monitoring */}
                {sensorHealth && (
                  <SensorHealthMonitor data={sensorHealth} />
                )}
              </div>

              {/* Raw / Synthetic Telemetry Database Table */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>📊 Historical Telemetry Logger</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      Raw synthetic telemetry logs for all monitored indicators
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    Total: {readings.length} records loaded
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>Timestamp</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>AQI</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>PM2.5</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>PM10</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>WQI</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>pH</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>TDS</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>DO</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>Turbidity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.slice(-15).reverse().map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < 14 ? '1px solid #F1F5F9' : 'none' }}>
                          <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748B' }}>
                            {new Date(r.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: r.AQI > 100 ? '#EF4444' : 'inherit' }}>{r.AQI}</td>
                          <td style={{ padding: '10px 12px' }}>{r.PM25}</td>
                          <td style={{ padding: '10px 12px' }}>{r.PM10}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: r.water_status === 'UNSAFE' ? '#EF4444' : 'inherit' }}>{r.WQI}</td>
                          <td style={{ padding: '10px 12px' }}>{r.pH}</td>
                          <td style={{ padding: '10px 12px' }}>{r.TDS}</td>
                          <td style={{ padding: '10px 12px' }}>{r.DO}</td>
                          <td style={{ padding: '10px 12px' }}>{r.turbidity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Active Alerts Logs */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '340px'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      🚨 Active Alerts Center
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Real-time critical incidents across all arrays
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '230px' }}>
                    {activeAlerts.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '50px 0', fontSize: '13px' }}>
                        ✓ All systems operating within normal parameters.
                      </div>
                    ) : (
                      activeAlerts.map(alert => (
                        <div key={alert.id} style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: alert.type === 'Critical' ? '#FEF2F2' : '#FFFBEB',
                          borderLeft: `4px solid ${alert.type === 'Critical' ? '#EF4444' : '#F59E0B'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                            <span style={{ color: alert.type === 'Critical' ? '#EF4444' : '#B45309' }}>{alert.type} Alert</span>
                            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>Live</span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                            {alert.msg}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sustainability ESG Scorecard */}
                <SustainabilityScorecard />
              </div>

              {/* Admin Panel Simulation Controls */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>⚙️ Hackathon Overrides & Simulation Panel</h3>
                <AdminPanel onConfigChange={handleConfigChange} />
              </div>

              {/* AI observations feed */}
              {aiInsights.length > 0 && (
                <div style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', color: '#38BDF8', textTransform: 'uppercase' }}>
                    ✦ AI Insights Timeline & Activity Feed
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '13px', borderBottom: idx < aiInsights.length - 1 ? '1px dashed #334155' : 'none', paddingBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#64748B', fontWeight: '700', flexShrink: 0 }}>
                          {insight.time}
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          backgroundColor: insight.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : (insight.severity === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)'),
                          color: insight.severity === 'CRITICAL' ? '#EF4444' : (insight.severity === 'WARNING' ? '#F59E0B' : '#38BDF8'),
                          textTransform: 'uppercase',
                          flexShrink: 0
                        }}>
                          {insight.severity}
                        </span>
                        <span style={{ fontWeight: '600', color: '#94A3B8', flexShrink: 0 }}>
                          [{insight.location}]
                        </span>
                        <span style={{ color: '#F8FAFC' }}>
                          {insight.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Floating assistant bot */}
      <ChatWidget selectedLocation={selectedLocation} />
    </div>
  );
}
