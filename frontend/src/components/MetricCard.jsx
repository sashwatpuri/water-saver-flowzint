import React from 'react';

/**
 * MetricCard
 * Props:
 *   label    {string}  – parameter name
 *   value    {number}  – current reading
 *   unit     {string}  – e.g. "mg/L", "NTU", ""
 *   status   {string}  – "SAFE" | "UNSAFE"
 *   min      {number}  – optional safe minimum
 *   max      {number}  – optional safe maximum
 */
export default function MetricCard({ label, value, unit, status, min, max }) {
  const isSafe = status === 'SAFE';

  // Build safe range label from min/max
  let rangeText = null;
  if (min !== undefined && max !== undefined) rangeText = `${min} – ${max}`;
  else if (min !== undefined)                 rangeText = `≥ ${min}`;
  else if (max !== undefined)                 rangeText = `≤ ${max}`;

  const displayValue = value !== undefined && value !== null
    ? (typeof value === 'number' ? value.toFixed(1) : value)
    : '—';

  const accentColor = isSafe ? 'var(--color-safe)' : 'var(--color-risk)';

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid var(--color-border)',
      borderTop: `3px solid ${accentColor}`,
      borderRadius: '10px',
      padding: 'var(--space-lg)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      minHeight: '132px',
      transition: 'transform 0.2s ease, box-shadow 0.25s ease',
    }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >

      {/* Label */}
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        lineHeight: 1,
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '30px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.1,
        letterSpacing: '-0.5px',
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
      }}>
        {displayValue}
        {unit && (
          <span style={{
            fontSize: '13px',
            fontWeight: '400',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}>
            {unit}
          </span>
        )}
      </div>

      {/* Status row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: accentColor, display: 'inline-block',
          }} />
          {isSafe ? 'Safe' : 'Unsafe'}
        </span>

        {rangeText && (
          <span style={{
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            Safe: {rangeText}
          </span>
        )}
      </div>
    </div>
  );
}
