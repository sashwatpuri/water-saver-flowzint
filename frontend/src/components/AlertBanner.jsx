import React from 'react';

/**
 * AlertBanner
 * Props:
 *   show     {boolean} – mount/unmount the banner
 *   title    {string}  – bold headline
 *   message  {string}  – supporting detail text
 */
export default function AlertBanner({ show, title, message }) {
  if (!show) return null;

  return (
    <div role="alert" style={{
      backgroundColor: '#FEF2F2',
      borderLeft: '4px solid var(--color-risk)',
      padding: 'var(--space-md) var(--space-lg)',
      display: 'flex',
      gap: 'var(--space-sm)',
      alignItems: 'flex-start',
      marginBottom: 'var(--space-xl)',
      /* Spec: no border-radius on alerts */
      borderRadius: 0,
    }}>
      <span style={{ fontSize: '18px', lineHeight: 1.4, flexShrink: 0 }} aria-hidden="true">
        ⚠️
      </span>
      <div>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--color-risk)',
          lineHeight: 1.4,
        }}>
          {title || 'Water Quality Warning'}
        </div>
        {message && (
          <div style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginTop: '4px',
            lineHeight: 1.55,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
