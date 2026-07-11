import React, { useState } from 'react';

/**
 * Header
 * Site-wide navigation bar for EcoSphere AI.
 */
export default function Header({ 
  lastUpdated, 
  selectedLocation, 
  onSelectLocation, 
  locations = [], 
  activeAlertsCount = 0 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const time = lastUpdated
    ? new Date(lastUpdated).toLocaleString([], {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })
    : '—';

  // Filter locations list for dropdown
  const filteredLocs = locations.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header style={{
      background: 'var(--gradient-header)',
      color: '#fff',
      height: '62px',
      padding: '0 var(--space-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>

      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px', height: '34px',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--gradient-accent)',
          boxShadow: '0 2px 10px rgba(13, 148, 136, 0.3)',
          flexShrink: 0,
        }}>
          {/* Leaf SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14" />
            <path d="M2 12s4-3 8-3 8 3 8 3" style={{ opacity: 0 }} />
            <path d="M20.59 5.41a2 2 0 0 0-2.83 0L12 11.17l-1.41-1.42" style={{ opacity: 0 }} />
            <path d="M17 8c.74-3.54 2.8-5.12 5-6-1.12 2.2-2.46 4.46-6 5" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.2, letterSpacing: '-0.3px', color: '#F8FAFC' }}>
            EcoSphere
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px', letterSpacing: '0.03em' }}>
            Environmental Monitoring
          </div>
        </div>
      </div>

      {/* Center Search & Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, maxWidth: '480px', margin: '0 24px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '7px 12px 7px 34px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
            onFocus={e => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.12)';
              e.target.style.borderColor = 'rgba(13, 148, 136, 0.4)';
            }}
            onBlur={e => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.07)';
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          />
          {/* Search icon */}
          <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          
          {/* Dropdown of search matches */}
          {searchQuery && (
            <div style={{
              position: 'absolute',
              top: '42px', left: 0, right: 0,
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '10px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
            }}>
              {filteredLocs.length === 0 ? (
                <div style={{ padding: '10px 14px', fontSize: '12px', color: '#64748B' }}>No sectors found</div>
              ) : (
                filteredLocs.map(l => (
                  <div
                    key={l.name}
                    onClick={() => {
                      onSelectLocation(l.name);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '9px 14px',
                      fontSize: '12px',
                      color: '#F8FAFC',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: selectedLocation === l.name ? 'rgba(13, 148, 136, 0.12)' : 'transparent',
                      transition: 'background-color 0.12s',
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = selectedLocation === l.name ? 'rgba(13, 148, 136, 0.12)' : 'transparent'}
                  >
                    {l.name} <span style={{ color: '#64748B' }}>· {l.sector_type}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dropdown Selector */}
        <select
          value={selectedLocation}
          onChange={(e) => onSelectLocation(e.target.value)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '7px 12px',
            fontSize: '13px',
            color: '#fff',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          {locations.map(l => (
            <option key={l.name} value={l.name} style={{ color: '#0F172A' }}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
              width: '34px', height: '34px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {activeAlertsCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                backgroundColor: '#EF4444', color: '#fff',
                fontSize: '9px', fontWeight: 'bold',
                borderRadius: '50%', width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
                border: '2px solid #0F172A',
              }}>
                {activeAlertsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '38px', right: '-10px',
              width: '280px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
              zIndex: 1000,
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                Notifications
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {activeAlertsCount === 0 ? (
                  <div style={{ fontSize: '11px', color: '#94A3B8', padding: '6px 0' }}>All systems clear. No active alerts.</div>
                ) : (
                  locations.filter(l => l.aqi_color === 'red' || l.aqi_color === 'orange' || l.water_status !== 'Safe').map(l => (
                    <div key={l.name} style={{ fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                      <span style={{ color: l.aqi_color === 'red' ? '#EF4444' : '#F97316', fontWeight: 'bold' }}>
                        {l.aqi_color === 'red' ? 'CRITICAL' : 'WARNING'}
                      </span> at {l.name}: AQI is {l.current_aqi} ({l.aqi_category}), Water status: {l.water_status}.
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#10B981', display: 'inline-block',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: '600',
            color: '#64748B',
            letterSpacing: '0.04em',
          }}>
            Live
          </span>
        </div>

        {/* Profile */}
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: 'var(--gradient-accent)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
        }}>
          EP
        </div>
      </div>
    </header>
  );
}
