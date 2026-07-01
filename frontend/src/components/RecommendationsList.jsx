import React from 'react';

export default function RecommendationsList({ recommendations }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' };
      case 'High':
        return { backgroundColor: '#FFEDD5', color: '#9A3412', border: '1px solid #FDBA74' };
      case 'Medium':
        return { backgroundColor: '#FEF9C3', color: '#854D0E', border: '1px solid #FDE047' };
      default:
        return { backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' };
    }
  };

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
      <div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
          AI Recommendations Engine
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Autonomous actions determined from real-time values & forecasts
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        maxHeight: '260px',
        paddingRight: '4px'
      }}>
        {(!recommendations || recommendations.length === 0) ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', padding: '40px 0' }}>
            No active recommendations. Environment stable.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: '#FAFAFA',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top Row: Priority Badge & Action */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: '700',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  ...getPriorityStyle(rec.priority)
                }}>
                  {rec.priority}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                  {rec.action}
                </span>
              </div>

              {/* Bottom Row: Impact and Department */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                borderTop: '1px dashed #E2E8F0',
                paddingTop: '6px',
                marginTop: '2px',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                <div>
                  <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>Impact:</span> {rec.impact}
                </div>
                <div style={{ fontStyle: 'italic', fontWeight: '500' }}>
                  🏢 {rec.department}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
