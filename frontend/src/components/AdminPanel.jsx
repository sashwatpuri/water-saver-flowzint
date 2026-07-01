import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ onConfigChange }) {
  const [config, setConfig] = useState({
    chemical_spill: false,
    traffic_jam: false,
    industrial_spike: false,
    sensor_offline_count: 0,
    aqi_threshold: 150,
    wqi_threshold: 70
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/config`);
        if (res.data.config) {
          setConfig(res.data.config);
        }
      } catch (err) {
        console.error("Error loading admin configurations:", err);
      }
    };
    loadConfig();
  }, [API_BASE]);

  const handleToggle = async (key) => {
    const updatedConfig = { ...config, [key]: !config[key] };
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const handleSliderChange = async (key, val) => {
    const updatedConfig = { ...config, [key]: parseInt(val) };
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const saveConfig = async (cfg) => {
    try {
      await axios.post(`${API_BASE}/api/admin/config`, cfg);
      if (onConfigChange) onConfigChange();
    } catch (err) {
      console.error("Error saving admin configurations:", err);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '340px',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
          🛠 Admin Control Deck & Event Simulator
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Simulate incidents to test real-time AI warnings & map alerts
        </div>
      </div>

      {/* Simulators Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { key: 'chemical_spill', label: 'Simulate Chemical Spill Anomaly', desc: 'Drops pH & DO levels at River Stations', emoji: '🧪' },
          { key: 'traffic_jam', label: 'Simulate Heavy Gridlock Traffic', desc: 'Spikes PM2.5, CO & AQI at City Center/Highways', emoji: '🚗' },
          { key: 'industrial_spike', label: 'Simulate Industrial Emission Surge', desc: 'Increases SO2 & PM10 at Industrial Zones', emoji: '🏭' }
        ].map(item => (
          <div
            key={item.key}
            onClick={() => handleToggle(item.key)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: config[item.key] ? 'rgba(56, 189, 248, 0.08)' : '#FAFAFA',
              borderColor: config[item.key] ? '#38BDF8' : 'var(--color-border)',
              transition: 'all 0.15s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {item.desc}
              </div>
            </div>

            {/* Toggle Switch */}
            <div style={{
              width: '40px', height: '20px',
              borderRadius: '10px',
              backgroundColor: config[item.key] ? '#38BDF8' : '#cbd5e1',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}>
              <div style={{
                width: '16px', height: '16px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '2px',
                left: config[item.key] ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Threshold Configuration Sliders */}
      <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          Alert Threshold Configuration
        </div>

        {/* AQI Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-primary)' }}>
            <span>Critical AQI Limit</span>
            <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{config.aqi_threshold}</span>
          </div>
          <input
            type="range" min="80" max="300" step="10"
            value={config.aqi_threshold}
            onChange={(e) => handleSliderChange('aqi_threshold', e.target.value)}
            style={{ width: '100%', accentColor: 'var(--color-ocean-deep)' }}
          />
        </div>

        {/* WQI Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-primary)' }}>
            <span>Critical WQI Limit</span>
            <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{config.wqi_threshold}</span>
          </div>
          <input
            type="range" min="50" max="90" step="5"
            value={config.wqi_threshold}
            onChange={(e) => handleSliderChange('wqi_threshold', e.target.value)}
            style={{ width: '100%', accentColor: 'var(--color-ocean-deep)' }}
          />
        </div>
      </div>
    </div>
  );
}
