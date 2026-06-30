import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../data/api';

/**
 * ChatWidget
 * Floating chat assistant powered by the backend /api/chat endpoint.
 * - Bubble button fixed at bottom-right
 * - Slide-up popup panel with Ocean Deep header
 * - User messages right-aligned, assistant messages left-aligned
 * - Animated typing indicator while loading
 * - Unread badge when panel is closed
 */
export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMsgs]   = useState([{
    role: 'assistant',
    text: 'Hello. I am AquaGuard AI. Ask me about current water quality metrics, safety status, or recommended actions.',
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(0);

  const endRef   = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMsgs(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChatMessage(text);
      setMsgs(prev => [...prev, { role: 'assistant', text: reply }]);
      if (!open) setUnread(c => c + 1);
    } catch {
      setMsgs(prev => [...prev, {
        role: 'assistant',
        text: 'Unable to reach the assistant. Please check that the backend server is running.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Shared style tokens ─── */
  const PANEL_W = 356;
  const MSG_RADIUS_USER = '12px 12px 3px 12px';
  const MSG_RADIUS_BOT  = '12px 12px 12px 3px';

  return (
    <>
      {/* ══════════════════════════════════════
          Chat panel (popup)
      ══════════════════════════════════════ */}
      <div
        role="dialog"
        aria-label="AquaGuard AI assistant"
        aria-modal="true"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: `${PANEL_W}px`,
          height: '472px',
          backgroundColor: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000,
          /* Animation */
          transformOrigin: 'bottom right',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'transform 0.18s ease, opacity 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--color-ocean-deep)',
          height: '48px',
          padding: '0 var(--space-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            {/* AQ monogram */}
            <div style={{
              width: '26px', height: '26px',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              color: '#fff', flexShrink: 0,
            }}>
              AQ
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>
                AquaGuard AI
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
                Water Quality Assistant
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '22px', lineHeight: 1,
              cursor: 'pointer', padding: '4px 6px',
              borderRadius: '4px',
              transition: 'color 0.1s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e  => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: 'var(--space-md)',
          backgroundColor: '#f7f9fb',
          display: 'flex', flexDirection: 'column',
          gap: 'var(--space-xs)',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '82%',
                backgroundColor: msg.role === 'user' ? 'var(--color-ocean-deep)' : '#fff',
                color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                padding: '9px 12px',
                borderRadius: msg.role === 'user' ? MSG_RADIUS_USER : MSG_RADIUS_BOT,
                fontSize: '13px',
                lineHeight: 1.55,
                whiteSpace: 'pre-line',
                border: msg.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex' }}>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: MSG_RADIUS_BOT,
                padding: '10px 14px',
                display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '5px', height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-text-secondary)',
                    display: 'inline-block',
                    animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input row */}
        <div style={{
          padding: 'var(--space-sm) var(--space-md)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#fff',
          display: 'flex', gap: 'var(--space-xs)',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about water quality…"
            disabled={loading}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-text-primary)',
              backgroundColor: '#f7f9fb',
              outline: 'none',
              transition: 'border-color 0.12s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-ocean-deep)'}
            onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
          />
          <button
            id="chat-send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-sans)',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              backgroundColor: loading || !input.trim() ? '#8eacc5' : 'var(--color-ocean-deep)',
              color: '#fff',
              flexShrink: 0,
              transition: 'background-color 0.12s',
            }}
            onMouseOver={e => { if (!loading && input.trim()) e.currentTarget.style.backgroundColor = '#0a2d52'; }}
            onMouseOut={e  => { if (!loading && input.trim()) e.currentTarget.style.backgroundColor = 'var(--color-ocean-deep)'; }}
          >
            Send
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Floating bubble trigger button
      ══════════════════════════════════════ */}
      <button
        id="chat-bubble-btn"
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        aria-label="Open AquaGuard AI assistant"
        style={{
          position: 'fixed',
          bottom: '24px', right: '24px',
          width: '52px', height: '52px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'var(--color-ocean-deep)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(15,59,111,0.38)',
          zIndex: 1001,
          transition: 'background-color 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#0a2d52'}
        onMouseOut={e  => e.currentTarget.style.backgroundColor = 'var(--color-ocean-deep)'}
      >
        {open ? (
          <span style={{ fontSize: '22px', lineHeight: 1 }}>×</span>
        ) : (
          <span style={{
            fontSize: '13px', fontWeight: '700',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.5px',
          }}>
            AQ
          </span>
        )}

        {/* Unread badge */}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '16px', height: '16px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-risk)',
            color: '#fff',
            fontSize: '9px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)',
            border: '2px solid #fff',
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Keyframe for typing dots */}
      <style>{`
        @keyframes dot-bounce {
          0%, 60%, 100% { transform: scale(0.7); opacity: 0.4; }
          30%            { transform: scale(1.0); opacity: 1.0; }
        }
      `}</style>
    </>
  );
}
