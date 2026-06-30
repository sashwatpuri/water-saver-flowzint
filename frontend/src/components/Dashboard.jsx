import React, { useState, useEffect } from 'react';
import Header from './Header';
import AlertBanner from './AlertBanner';
import MetricCard from './MetricCard';
import Chart from './Chart';
import ChatWidget from './ChatWidget';
import { fetchLatestReadings, fetchSummary } from '../data/api';

/**
 * Dashboard
 * Root orchestrator. Fetches data on mount, refreshes every 10s.
 * Maps API data → component props.
 */
export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = async () => {
    try {
      const [latest, sum] = await Promise.all([
        fetchLatestReadings(),
        fetchSummary(),
      ]);
      setReadings(latest);
      setSummary(sum);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Cannot reach the backend. Make sure the server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 'var(--space-md)',
        fontFamily: 'var(--font-sans)',
        backgroundColor: 'var(--color-light-gray)',
        color: 'var(--color-text-secondary)',
      }}>
        <div style={{
          width: '36px', height: '36px',
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-ocean-deep)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ fontSize: '14px' }}>Loading dashboard…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        maxWidth: '480px', margin: '80px auto',
        padding: 'var(--space-xl)',
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
        borderLeft: '4px solid var(--color-risk)',
        borderRadius: '8px',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ fontWeight: '600', color: 'var(--color-risk)', marginBottom: '8px' }}>
          ⚠ Connection Error
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
          {error}
        </p>
        <button
          onClick={load}
          style={{
            padding: '10px 18px', fontSize: '14px', fontWeight: '600',
            fontFamily: 'var(--font-sans)',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            backgroundColor: 'var(--color-ocean-deep)', color: '#fff',
            transition: 'background-color 0.12s',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0a2d52'}
          onMouseOut={e  => e.currentTarget.style.backgroundColor = 'var(--color-ocean-deep)'}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  /* ── Derived state ── */
  const latest = readings.at(-1) ?? null;

  const violations = [];
  if (latest) {
    if (latest.pH < 6.5 || latest.pH > 8.2) violations.push(`pH ${latest.pH.toFixed(2)} (range 6.5–8.2)`);
    if (latest.TDS > 400)                    violations.push(`TDS ${latest.TDS.toFixed(0)} mg/L (max 400)`);
    if (latest.DO < 4.5)                     violations.push(`DO ${latest.DO.toFixed(2)} mg/L (min 4.5)`);
    if (latest.turbidity > 5.0)              violations.push(`Turbidity ${latest.turbidity.toFixed(2)} NTU (max 5.0)`);
  }
  const isUnsafe = violations.length > 0;
  const alertMsg = violations.join('; ') + (violations.length ? '. Immediate review recommended.' : '');

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', fontFamily: 'var(--font-sans)' }}>

      <Header lastUpdated={latest?.timestamp} />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-xl)',

        /* Responsive padding on small screens */
        paddingLeft: 'clamp(16px, 4vw, 24px)',
        paddingRight: 'clamp(16px, 4vw, 24px)',
      }}>

        {/* ── Alert banner ── */}
        <AlertBanner
          show={isUnsafe}
          title="Water Quality Alert — Immediate Action Recommended"
          message={alertMsg}
        />

        {/* ── Status summary bar ── */}
        {summary && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '10px var(--space-lg)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xl)',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
          }}>
            {/* Overall status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '9px', height: '9px',
                borderRadius: '50%',
                backgroundColor: isUnsafe ? 'var(--color-risk)' : 'var(--color-safe)',
                display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{
                fontSize: '14px', fontWeight: '600',
                color: isUnsafe ? 'var(--color-risk)' : 'var(--color-safe)',
              }}>
                {isUnsafe ? 'Parameters Out of Range' : 'All Parameters Safe'}
              </span>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
              {[
                { label: 'Safe (24h)',   val: summary.safe_readings,   color: 'var(--color-safe)' },
                { label: 'Unsafe (24h)', val: summary.unsafe_readings, color: 'var(--color-risk)' },
                { label: 'Avg Temp',     val: `${Number(summary.temperature_avg).toFixed(1)}°C`, color: 'var(--color-text-primary)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '16px', fontWeight: '600',
                    fontFamily: 'var(--font-mono)',
                    color: s.color, lineHeight: 1,
                  }}>
                    {s.val}
                  </div>
                  <div style={{
                    fontSize: '11px', color: 'var(--color-text-secondary)',
                    marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Metric cards (4-column responsive grid) ── */}
        {latest && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
          }}>
            <MetricCard
              label="pH Level"
              value={latest.pH}
              unit=""
              status={latest.pH >= 6.5 && latest.pH <= 8.2 ? 'SAFE' : 'UNSAFE'}
              min={6.5} max={8.2}
            />
            <MetricCard
              label="Total Dissolved Solids"
              value={latest.TDS}
              unit="mg/L"
              status={latest.TDS <= 400 ? 'SAFE' : 'UNSAFE'}
              max={400}
            />
            <MetricCard
              label="Dissolved Oxygen"
              value={latest.DO}
              unit="mg/L"
              status={latest.DO >= 4.5 ? 'SAFE' : 'UNSAFE'}
              min={4.5}
            />
            <MetricCard
              label="Turbidity"
              value={latest.turbidity}
              unit="NTU"
              status={latest.turbidity <= 5.0 ? 'SAFE' : 'UNSAFE'}
              max={5.0}
            />
          </div>
        )}

        {/* ── Trend chart ── */}
        {readings.length > 0 && (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <Chart data={readings} />
          </div>
        )}

        {/* ── 24-hour averages table ── */}
        {summary && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: 'var(--space-lg)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflowX: 'auto',
          }}>
            <div style={{
              fontSize: '15px', fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-md)',
            }}>
              24-Hour Parameter Averages
            </div>

            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: '14px', fontFamily: 'var(--font-sans)',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Parameter', 'Average', 'Safe Range', 'Status'].map(col => (
                    <th key={col} style={{
                      textAlign: 'left',
                      padding: '8px var(--space-xs)',
                      fontSize: '11px', fontWeight: '600',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { param: 'pH',              avg: summary.pH_avg,          unit: '',     range: '6.5 – 8.2',  ok: summary.pH_avg >= 6.5 && summary.pH_avg <= 8.2 },
                  { param: 'TDS',             avg: summary.TDS_avg,         unit: 'mg/L', range: '≤ 400',      ok: summary.TDS_avg <= 400 },
                  { param: 'Dissolved Oxygen',avg: summary.DO_avg,          unit: 'mg/L', range: '≥ 4.5',      ok: summary.DO_avg >= 4.5 },
                  { param: 'Turbidity',       avg: summary.turbidity_avg,   unit: 'NTU',  range: '≤ 5.0',      ok: summary.turbidity_avg <= 5.0 },
                  { param: 'Temperature',     avg: summary.temperature_avg, unit: '°C',   range: '—',          ok: null },
                ].map((row, i, arr) => (
                  <tr key={row.param} style={{
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <td style={{ padding: '10px var(--space-xs)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                      {row.param}
                    </td>
                    <td style={{ padding: '10px var(--space-xs)', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {typeof row.avg === 'number' ? row.avg.toFixed(2) : '—'} {row.unit}
                    </td>
                    <td style={{ padding: '10px var(--space-xs)', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {row.range}
                    </td>
                    <td style={{ padding: '10px var(--space-xs)' }}>
                      {row.ok === null ? (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>—</span>
                      ) : (
                        <span style={{
                          fontSize: '12px', fontWeight: '600',
                          color: row.ok ? 'var(--color-safe)' : 'var(--color-risk)',
                        }}>
                          {row.ok ? '✓ Within range' : '⚠ Out of range'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Floating chat – outside main so it overlays everything */}
      <ChatWidget />
    </div>
  );
}
