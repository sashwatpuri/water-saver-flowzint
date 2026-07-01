import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'];

export default function SourceAnalysis({ data, explanation }) {
  // Format data for Recharts
  const chartData = data ? data.map(item => ({
    name: item.source,
    value: item.percentage
  })) : [];

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
      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
        Pollution Source Analysis (AI Agent Core)
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Pie Chart container */}
        <div style={{ flex: 1.2, minWidth: '180px', height: '180px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          {/* Monogram in middle */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Source</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>AI</div>
          </div>
        </div>

        {/* Custom Legend */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
          {chartData.map((item, idx) => (
            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}</span>
              </div>
              <span style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Explanation Box */}
      <div style={{
        backgroundColor: '#F8FAFC',
        borderLeft: '4px solid #38BDF8',
        borderRadius: '0 8px 8px 0',
        padding: '12px var(--space-md)',
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'var(--color-text-secondary)',
        fontStyle: 'italic',
      }}>
        <div style={{ fontWeight: '700', fontSize: '11px', color: 'var(--color-ocean-deep)', textTransform: 'uppercase', marginBottom: '4px', fontStyle: 'normal' }}>
          ✦ Agentic Observation Core
        </div>
        "{explanation || 'Analyzing local pollutant variables...'}"
      </div>
    </div>
  );
}
