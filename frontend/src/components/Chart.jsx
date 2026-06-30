import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/**
 * Chart
 * Props:
 *   data {Array} – array of reading objects from the API:
 *     { timestamp, pH, TDS, DO, turbidity, quality_status, … }
 *
 * Renders a tabbed 24-hour trend chart for DO, pH, Turbidity, TDS.
 * Reference lines mark safe thresholds.
 */

const METRICS = [
  { key: 'DO',        label: 'Dissolved Oxygen', unit: 'mg/L', color: '#0F3B6F', safeMin: 4.5 },
  { key: 'pH',        label: 'pH',               unit: '',     color: '#1B9B8A', safeMin: 6.5, safeMax: 8.2 },
  { key: 'turbidity', label: 'Turbidity',         unit: 'NTU',  color: '#D97706', safeMax: 5.0 },
  { key: 'TDS',       label: 'TDS',               unit: 'mg/L', color: '#6B7280', safeMax: 400 },
];

const fmtTime = (ts) => {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ''; }
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const m = METRICS.find(x => x.key === payload[0].dataKey);
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '6px',
      padding: '10px 12px',
      fontSize: '12px',
      fontFamily: 'var(--font-sans)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      minWidth: '160px',
    }}>
      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
        {new Date(d.timestamp).toLocaleString([], {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false,
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', color: 'var(--color-text-secondary)' }}>
        <span>{m?.label || payload[0].dataKey}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: payload[0].color }}>
          {typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value}
          {m?.unit ? ` ${m.unit}` : ''}
        </span>
      </div>
      <div style={{
        marginTop: '6px',
        paddingTop: '6px',
        borderTop: '1px solid var(--color-border)',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: d.quality_status === 'SAFE' ? 'var(--color-safe)' : 'var(--color-risk)',
      }}>
        {d.quality_status === 'SAFE' ? '✓ Safe' : '⚠ Unsafe'}
      </div>
    </div>
  );
}

export default function Chart({ data }) {
  const [active, setActive] = useState('DO');
  const metric = METRICS.find(m => m.key === active);

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: 'var(--space-lg)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>

      {/* Section header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-md)',
        flexWrap: 'wrap',
        gap: 'var(--space-xs)',
      }}>
        <div>
          <div style={{
            fontSize: '15px', fontWeight: '600',
            color: 'var(--color-text-primary)',
          }}>
            24-Hour Trend — {metric.label}
          </div>
          <div style={{
            fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px',
          }}>
            Last {data.length} hourly readings · Monitoring Point A
          </div>
        </div>

        {/* Metric tabs */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              style={{
                padding: '5px 11px',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'var(--font-sans)',
                border: '1px solid',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.12s',
                borderColor: active === m.key ? 'var(--color-ocean-deep)' : 'var(--color-border)',
                backgroundColor: active === m.key ? 'var(--color-ocean-deep)' : 'transparent',
                color: active === m.key ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {m.key}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={fmtTime}
              tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Menlo, Monaco, monospace' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              dy={6}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Menlo, Monaco, monospace' }}
              axisLine={false}
              tickLine={false}
              width={38}
              dx={-4}
            />
            <Tooltip content={<ChartTooltip />} />

            {metric.safeMin !== undefined && (
              <ReferenceLine
                y={metric.safeMin}
                stroke="#DC2626"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: `Min ${metric.safeMin}`, fill: '#DC2626', fontSize: 10, fontFamily: 'Menlo, Monaco, monospace', position: 'insideBottomRight' }}
              />
            )}
            {metric.safeMax !== undefined && (
              <ReferenceLine
                y={metric.safeMax}
                stroke="#DC2626"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: `Max ${metric.safeMax}`, fill: '#DC2626', fontSize: 10, fontFamily: 'Menlo, Monaco, monospace', position: 'insideTopRight' }}
              />
            )}

            <Line
              type="monotone"
              dataKey={active}
              stroke={metric.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: metric.color, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
