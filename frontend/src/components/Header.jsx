import React from 'react';

/**
 * Header
 * Site-wide navigation bar.
 * Background: Ocean Deep · White text · Sticky
 */
export default function Header({ lastUpdated, location = 'Monitoring Point A' }) {
  const time = lastUpdated
    ? new Date(lastUpdated).toLocaleString([], {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })
    : '—';

  return (
    <header style={{
      backgroundColor: 'var(--color-ocean-deep)',
      color: '#fff',
      height: '56px',
      padding: '0 var(--space-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700',
          fontFamily: 'var(--font-mono)',
          color: '#fff',
          letterSpacing: '-0.5px',
          flexShrink: 0,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}>
          AQ
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
            AquaGuard AI
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
            Water Quality Intelligence Platform
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>{location}</div>
          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-mono)', marginTop: '2px',
          }}>
            Updated: {time}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#34d399', display: 'inline-block',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: '600',
            color: 'rgba(255,255,255,0.65)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
