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
      backgroundColor: '#0F172A', // Dark Slate
      color: '#fff',
      height: '60px',
      padding: '0 var(--space-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1E293B',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>

      {/* Brand & Monogram Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px', height: '34px',
          border: '1.5px solid #38BDF8',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '800',
          fontFamily: 'var(--font-mono)',
          color: '#38BDF8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
          flexShrink: 0,
        }}>
          🌍
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-0.3px', color: '#F8FAFC' }}>
            EcoSphere AI
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Environmental Intelligence Core
          </div>
        </div>
      </div>

      {/* Center Search & Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, maxWidth: '500px', margin: '0 20px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search monitoring sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '6px 12px 6px 30px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '14px' }}>🔍</span>
          
          {/* Dropdown of search matches */}
          {searchQuery && (
            <div style={{
              position: 'absolute',
              top: '40px', left: 0, right: 0,
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
            }}>
              {filteredLocs.length === 0 ? (
                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>No sectors found</div>
              ) : (
                filteredLocs.map(l => (
                  <div
                    key={l.name}
                    onClick={() => {
                      onSelectLocation(l.name);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#F8FAFC',
                      cursor: 'pointer',
                      borderBottom: '1px solid #334155',
                      backgroundColor: selectedLocation === l.name ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = selectedLocation === l.name ? 'rgba(56, 189, 248, 0.1)' : 'transparent'}
                  >
                    {l.name} ({l.sector_type})
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
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '13px',
            color: '#fff',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          {locations.map(l => (
            <option key={l.name} value={l.name}>
              📍 {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', position: 'relative'
            }}
          >
            🔔
            {activeAlertsCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                backgroundColor: '#EF4444', color: '#fff',
                fontSize: '9px', fontWeight: 'bold',
                borderRadius: '50%', width: '15px', height: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 5px #EF4444'
              }}>
                {activeAlertsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '30px', right: '-10px',
              width: '280px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              zIndex: 1000,
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                Active System Notifications
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {activeAlertsCount === 0 ? (
                  <div style={{ fontSize: '11px', color: '#94A3B8', padding: '6px 0' }}>All sensor grids clear. No active alerts.</div>
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
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#10B981', display: 'inline-block',
            boxShadow: '0 0 8px #10B981'
          }} />
          <span style={{
            fontSize: '11px', fontWeight: '700',
            color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Live
          </span>
        </div>

        {/* Profile */}
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          backgroundColor: '#38BDF8',
          color: '#0F172A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '800',
          cursor: 'pointer'
        }}>
          EP
        </div>
      </div>
    </header>
  );
}
