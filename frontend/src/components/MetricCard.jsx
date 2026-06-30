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
    ? (typeof value === 'number' ? value.toFixed(2) : value)
    : '—';

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: 'var(--space-lg)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-xs)',
      minHeight: '132px',
    }}>

      {/* Label */}
      <div style={{
        fontSize: '12px',
        fontWeight: '500',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        lineHeight: 1,
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '32px',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.1,
        letterSpacing: '-0.5px',
        display: 'flex',
        alignItems: 'baseline',
        gap: '5px',
      }}>
        {displayValue}
        {unit && (
          <span style={{
            fontSize: '14px',
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
        paddingTop: 'var(--space-xs)',
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: isSafe ? 'var(--color-safe)' : 'var(--color-risk)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {isSafe ? '✓' : '⚠'} {isSafe ? 'Safe' : 'Unsafe'}
        </span>

        {rangeText && (
          <span style={{
            fontSize: '11px',
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
