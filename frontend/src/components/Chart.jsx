import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  AreaChart, Area
} from 'recharts';

const AIR_METRICS = [
  { key: 'AQI',        label: 'Air Quality Index', unit: '',      color: '#0F3B6F', safeMax: 100 },
  { key: 'PM25',       label: 'PM2.5',            unit: 'µg/m³',  color: '#38BDF8', safeMax: 35.4 },
  { key: 'PM10',       label: 'PM10',             unit: 'µg/m³',  color: '#818CF8', safeMax: 154 },
  { key: 'CO',         label: 'Carbon Monoxide',  unit: 'mg/m³',  color: '#A78BFA', safeMax: 9.0 },
  { key: 'NO2',        label: 'Nitrogen Dioxide', unit: 'µg/m³',  color: '#F472B6', safeMax: 100 },
  { key: 'SO2',        label: 'Sulfur Dioxide',   unit: 'µg/m³',  color: '#FB7185', safeMax: 75 }
];

const WATER_METRICS = [
  { key: 'WQI',        label: 'Water Quality Index', unit: '',     color: '#10B981', safeMin: 70 },
  { key: 'pH',         label: 'pH Level',            unit: '',     color: '#059669', safeMin: 6.5, safeMax: 8.5 },
  { key: 'turbidity',  label: 'Turbidity',           unit: 'NTU',  color: '#D97706', safeMax: 5.0 },
  { key: 'DO',         label: 'Dissolved Oxygen',    unit: 'mg/L', color: '#0369A1', safeMin: 4.5 },
  { key: 'TDS',        label: 'TDS',                 unit: 'mg/L', color: '#64748B', safeMax: 400 }
];

const fmtTime = (ts) => {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ''; }
};

export default function Chart({ historicalData, forecastData, locationName, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'air'); // 'air' | 'water' | 'forecast'
  const [activeAirMetric, setActiveAirMetric] = useState('AQI');
  const [activeWaterMetric, setActiveWaterMetric] = useState('WQI');

  const airMetric = AIR_METRICS.find(m => m.key === activeAirMetric);
  const waterMetric = WATER_METRICS.find(m => m.key === activeWaterMetric);

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Environmental Telemetry & AI Forecasts
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Location: {locationName} · {activeTab === 'forecast' ? '7-day ML Projection' : '24-hour sensor stream'}
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          {[
            { id: 'air', label: 'Air Telemetry' },
            { id: 'water', label: 'Water Telemetry' },
            { id: 'forecast', label: 'AI Predictor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#0F172A' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selectors depending on active tab */}
      {activeTab === 'air' && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {AIR_METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveAirMetric(m.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: activeAirMetric === m.key ? 'var(--color-ocean-deep)' : 'var(--color-border)',
                backgroundColor: activeAirMetric === m.key ? 'var(--color-ocean-deep)' : 'transparent',
                color: activeAirMetric === m.key ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.1s',
              }}
            >
              {m.key}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'water' && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {WATER_METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveWaterMetric(m.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: activeWaterMetric === m.key ? 'var(--color-ocean-deep)' : 'var(--color-border)',
                backgroundColor: activeWaterMetric === m.key ? 'var(--color-ocean-deep)' : 'transparent',
                color: activeWaterMetric === m.key ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.1s',
              }}
            >
              {m.key}
            </button>
          ))}
        </div>
      )}

      {/* Render Chart */}
      <div style={{ width: '100%', height: 260 }}>
        {activeTab === 'air' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={fmtTime}
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={38}
              />
              <Tooltip formatter={(value) => [`${value} ${airMetric.unit}`, airMetric.label]} />
              
              {airMetric.safeMax && (
                <ReferenceLine
                  y={airMetric.safeMax}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: `Max Safe ${airMetric.safeMax}`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              
              <Line
                type="monotone"
                dataKey={activeAirMetric}
                stroke={airMetric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'water' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={fmtTime}
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={38}
              />
              <Tooltip formatter={(value) => [`${value} ${waterMetric.unit}`, waterMetric.label]} />
              
              {waterMetric.safeMin && (
                <ReferenceLine
                  y={waterMetric.safeMin}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: `Min Safe ${waterMetric.safeMin}`, fill: '#EF4444', fontSize: 10, position: 'insideBottomRight' }}
                />
              )}
              {waterMetric.safeMax && (
                <ReferenceLine
                  y={waterMetric.safeMax}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: `Max Safe ${waterMetric.safeMax}`, fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              
              <Line
                type="monotone"
                dataKey={activeWaterMetric}
                stroke={waterMetric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'forecast' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={38}
              />
              <Tooltip formatter={(value, name) => {
                if (name === "aqi") return [value, "Predicted AQI"];
                if (name === "aqi_max") return [value, "Confidence Upper Bound"];
                if (name === "aqi_min") return [value, "Confidence Lower Bound"];
                return [value, name];
              }} />
              
              {/* Confidence Interval Shaded Band */}
              <Area 
                type="monotone" 
                dataKey="aqi_max" 
                stroke="none" 
                fill="rgba(56, 189, 248, 0.15)" 
                name="Confidence Interval Bounds"
              />
              
              <Area 
                type="monotone" 
                dataKey="aqi_min" 
                stroke="none" 
                fill="#fff"  /* mask/cover below lower bound */
                name="Lower Bound Mask"
              />
              
              {/* Predicted Target Line */}
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="#0284C7"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                name="Predicted AQI"
              />
              
              {/* Reference Limit Line */}
              <ReferenceLine
                y={100}
                stroke="#F97316"
                strokeDasharray="3 3"
                label={{ value: "Action Threshold (100)", fill: "#F97316", fontSize: 10, position: "insideTopRight" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
