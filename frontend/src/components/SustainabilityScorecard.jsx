import React from 'react';

export default function SustainabilityScorecard() {
  const sdgs = [
    { num: '3', name: 'Good Health & Well-being', desc: 'Air pollution monitoring saves lives', color: '#4C9F38' },
    { num: '6', name: 'Clean Water & Sanitation', desc: 'Real-time monitoring guarantees safe reservoirs', color: '#26BDE2' },
    { num: '11', name: 'Sustainable Cities', desc: 'Smart sensors build carbon-neutral urban zones', color: '#FD9D24' },
    { num: '13', name: 'Climate Action', desc: 'Predictive analytics mitigate heatwaves & floods', color: '#3F7E44' }
  ];

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
            Sustainability & SDG Scorecard
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Corporate ESG Alignment & Resource Indices
          </div>
        </div>
        {/* Overall Score Monogram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Overall Score</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#10B981', fontFamily: 'var(--font-mono)' }}>78/100</div>
          </div>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '50%',
            border: '3px solid #10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '800', color: '#10B981',
            backgroundColor: '#ECFDF5'
          }}>
            A
          </div>
        </div>
      </div>

      {/* Grid of Key Footprint Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        {[
          { label: 'Carbon Footprint', val: '412 tCO2e', desc: '↓ 12% vs last month', ok: true },
          { label: 'Energy Load', val: '84.2 MWh', desc: '62% Renewable Share', ok: true },
          { label: 'Water Consumed', val: '12,400 L', desc: 'Recycled: 42%', ok: true },
          { label: 'Waste Recycling', val: '88.5%', desc: 'Target: 95.0%', ok: false }
        ].map(m => (
          <div key={m.label} style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
              {m.val}
            </div>
            <div style={{ fontSize: '10px', color: m.ok ? '#10B981' : '#F59E0B', fontWeight: '600' }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ESG Compliance bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed #E2E8F0', paddingTop: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          ESG Compliance Status
        </div>
        {[
          { label: 'Environmental Score (E)', val: 82, color: '#10B981' },
          { label: 'Carbon Reduction Progress', val: 68, color: '#0EA5E9' }
        ].map(bar => (
          <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-text-primary)' }}>{bar.label}</span>
              <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{bar.val}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${bar.val}%`, height: '100%', backgroundColor: bar.color, borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* UN Sustainable Development Goals (SDG) List */}
      <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
          UN SDG Goals Alignment
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {sdgs.map(goal => (
            <div key={goal.num} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                width: '26px', height: '26px',
                borderRadius: '4px',
                backgroundColor: goal.color,
                color: '#fff',
                fontSize: '13px', fontWeight: '900',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {goal.num}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {goal.name}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {goal.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
