import React from 'react';

export default function SensorHealthMonitor({ data }) {
  // Extract summaries
  const onlineCount = data?.online_sensors ?? 0;
  const offlineCount = data?.offline_sensors ?? 0;
  const totalCount = data?.total_sensors ?? 0;
  const sensors = data?.sensors ?? [];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            IoT Sensor Diagnostics
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Real-time health telemetry across 18 active nodes
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{onlineCount} Online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{offlineCount} Offline</span>
          </div>
        </div>
      </div>

      {/* Sensor grid list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflowY: 'auto',
        maxHeight: '230px',
        paddingRight: '4px'
      }}>
        {sensors.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', padding: '40px 0' }}>
            Loading sensor arrays...
          </div>
        ) : (
          sensors.map((sensor) => (
            <div
              key={sensor.id}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: sensor.status === 'OFFLINE' ? '#FEF2F2' : '#FAFAFA',
                fontSize: '13px'
              }}
            >
              {/* Left Column: ID & Location */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    backgroundColor: sensor.status === 'ONLINE' ? '#10B981' : '#EF4444'
                  }} />
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {sensor.id}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', backgroundColor: '#E2E8F0', padding: '1px 5px', borderRadius: '4px' }}>
                    {sensor.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-primary)', marginTop: '3px' }}>
                  {sensor.location}
                </div>
              </div>

              {/* Middle Column: Battery & Signal */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {/* Battery */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Battery</div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-mono)',
                    color: sensor.battery < 20.0 ? '#EF4444' : 'var(--color-text-primary)'
                  }}>
                    {sensor.battery.toFixed(0)}%
                  </div>
                </div>

                {/* Signal */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Signal</div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-mono)',
                    color: sensor.signal < 40 ? '#F59E0B' : 'var(--color-text-primary)'
                  }}>
                    {sensor.signal}%
                  </div>
                </div>
              </div>

              {/* Right Column: Maintenance Alert */}
              <div style={{ textAlign: 'right', minWidth: '90px' }}>
                {sensor.maintenance_required ? (
                  <div style={{ color: '#EF4444', fontWeight: '700', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span>⚠ Maintenance</span>
                    <span style={{ fontSize: '9px', fontWeight: '500', color: '#B91C1C', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                      {sensor.maintenance_reason}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: '#10B981', fontWeight: '600', fontSize: '11px' }}>
                    ✓ Operational
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
