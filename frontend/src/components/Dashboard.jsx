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

/* ── Inline SVG icons for sidebar tabs ── */
const SidebarIcon = ({ type, active }) => {
  const color = active ? '#0D9488' : '#64748B';
  const size = 16;
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', style: { flexShrink: 0 } };

  switch (type) {
    case 'overview':
      return (<svg {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>);
    case 'sandbox':
      return (<svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
    case 'analytics':
      return (<svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
    case 'telemetry':
      return (<svg {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>);
    case 'safety':
      return (<svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
    default:
      return null;
  }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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
      setEmbeddedChat(prev => [...prev, { role: 'assistant', text: 'Error communicating with the server.' }]);
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
        msg: `Sensor offline at ${loc.name}.`
      });
    }
  });

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '20px',
        background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)',
        color: '#94A3B8',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid rgba(255,255,255,0.08)',
          borderTopColor: 'var(--color-teal, #0D9488)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#CBD5E1' }}>Loading dashboard…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        maxWidth: '440px', margin: '120px auto',
        padding: '28px',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderLeft: '4px solid #EF4444',
        borderRadius: '12px',
        fontFamily: 'var(--font-sans)',
        color: '#F8FAFC'
      }}>
        <div style={{ fontWeight: '700', color: '#EF4444', marginBottom: '8px', fontSize: '16px' }}>
          Connection Error
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.6 }}>
          {error}
        </p>
        <button
          onClick={initLoad}
          style={{
            padding: '9px 20px', fontSize: '13px', fontWeight: '600',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: 'var(--gradient-accent)',
            color: '#fff',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          Retry
        </button>
      </div>
    );
  }

  const latestReading = readings[readings.length - 1] ?? null;

  const sidebarTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sandbox', label: 'Predictions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'telemetry', label: 'Sensors' },
    { id: 'safety', label: 'Controls' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F1F5F9 0%, #E8EEF4 40%, #F1F5F9 100%)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
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
          width: '220px',
          background: 'var(--gradient-sidebar)',
          color: '#fff',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#475569', paddingLeft: '12px', marginBottom: '8px', letterSpacing: '0.06em' }}>
            Navigation
          </div>
          {sidebarTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  borderLeft: isActive ? '3px solid #0D9488' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.15s',
                  backgroundColor: isActive ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                  color: isActive ? '#5EEAD4' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#CBD5E1';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <SidebarIcon type={tab.id} active={isActive} />
                {tab.label}
              </button>
            );
          })}

          {/* System status in sidebar */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10B981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              API Connected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: activeAlerts.length > 0 ? '#EF4444' : '#10B981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeAlerts.length > 0 ? '#EF4444' : '#10B981', display: 'inline-block' }} />
              {activeAlerts.length > 0 ? `${activeAlerts.length} Alert${activeAlerts.length > 1 ? 's' : ''}` : 'All Clear'}
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 62px)' }}>
          
          {/* KPI TOP METRICS CARDS */}
          {latestReading && summary && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              <MetricCard
                label="Eco Score"
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
                unit=""
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

              {/* Embedded Chat Panel */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '520px',
              }}>
                <div style={{ background: 'var(--gradient-header)', color: '#fff', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Chat icon */}
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>Ask EcoSphere</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Sector: {selectedLocation}</div>
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {embeddedChat.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        backgroundColor: msg.role === 'user' ? '#0F172A' : '#fff',
                        color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                        padding: '9px 13px',
                        borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                        fontSize: '12.5px',
                        lineHeight: '1.5',
                        border: msg.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
                        boxShadow: msg.role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
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
                      padding: '6px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                      background: chatInput.trim() ? 'var(--gradient-accent)' : '#CBD5E1',
                      color: '#fff',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseOver={e => { if (chatInput.trim()) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
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
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '340px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      Reports
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Generate compliance and audit reports
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => handleReportDownload('weekly', 'csv')}
                        style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.color = '#0D9488'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'inherit'; }}
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => handleReportDownload('csr', 'pdf')}
                        style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.color = '#0D9488'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'inherit'; }}
                      >
                        Download PDF
                      </button>
                    </div>

                    {[
                      { type: 'weekly', title: 'Weekly Operational Audit', desc: 'Summary of 24h average thresholds' },
                      { type: 'monthly', title: 'Monthly ESG Scorecard', desc: 'Carbon footprint and SDG targets' },
                      { type: 'compliance', title: 'Regulatory Compliance', desc: 'pH, TDS & PM boundary checks' }
                    ].map(rep => (
                      <div
                        key={rep.type}
                        onClick={() => handleReportDownload(rep.type, 'pdf')}
                        style={{
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: '#FAFAFA',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{rep.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{rep.desc}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sensor Health Monitoring */}
                {sensorHealth && (
                  <SensorHealthMonitor data={sensorHealth} />
                )}
              </div>

              {/* Raw Telemetry Database Table */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Telemetry Log</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      Raw sensor readings across monitored indicators
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
                    {readings.length} records
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
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
                        <tr key={idx} style={{ borderBottom: idx < 14 ? '1px solid #F1F5F9' : 'none', transition: 'background-color 0.1s' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
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
                {/* Active Alerts */}
                <div style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '340px'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      Active Alerts
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Real-time incidents across all sectors
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '230px' }}>
                    {activeAlerts.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '50px 0', fontSize: '13px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', marginRight: '6px' }} />
                        All systems operating normally.
                      </div>
                    ) : (
                      activeAlerts.map(alert => (
                        <div key={alert.id} style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: alert.type === 'Critical' ? '#FEF2F2' : '#FFFBEB',
                          borderLeft: `3px solid ${alert.type === 'Critical' ? '#EF4444' : '#F59E0B'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                            <span style={{ color: alert.type === 'Critical' ? '#EF4444' : '#B45309' }}>{alert.type}</span>
                            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: '500' }}>Live</span>
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

              {/* Simulation Controls */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Simulation Controls</h3>
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
                  <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', color: '#5EEAD4', textTransform: 'uppercase' }}>
                    AI Insights
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '13px', borderBottom: idx < aiInsights.length - 1 ? '1px dashed #334155' : 'none', paddingBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#64748B', fontWeight: '600', flexShrink: 0, fontSize: '11px' }}>
                          {insight.time}
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          backgroundColor: insight.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : (insight.severity === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(94, 234, 212, 0.15)'),
                          color: insight.severity === 'CRITICAL' ? '#EF4444' : (insight.severity === 'WARNING' ? '#F59E0B' : '#5EEAD4'),
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
