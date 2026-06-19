import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

/**
 * AIProgressSummary — on-demand, LLM-written progress note for a child.
 *
 * Feature-flagged. The feature is OFF unless REACT_APP_ENABLE_AI_SUMMARIES is
 * exactly 'true' at build time. When off, this renders a calm placeholder and
 * makes NO network request — so a missing API key can never produce errors,
 * failed requests, or a broken experience. (The backend is independently gated
 * by ENABLE_AI_SUMMARIES + ANTHROPIC_API_KEY and returns a graceful disabled
 * payload, so even a flag mismatch degrades gracefully rather than erroring.)
 *
 * When enabled, the note is generated only when the therapist clicks (it costs
 * an API call). The numbers come from the child's own data (the backend grounds
 * the model on a structured snapshot), not from the model's imagination.
 */
const AI_ENABLED = import.meta.env.REACT_APP_ENABLE_AI_SUMMARIES === 'true';

export default function AIProgressSummary({ childUsername }) {
  const [state, setState]     = useState('idle'); // idle | loading | done | notice | error
  const [summary, setSummary] = useState('');
  const [message, setMessage] = useState('');

  // Feature disabled at build time → placeholder only, no request ever fires.
  if (!AI_ENABLED) {
    return (
      <section className="report-section">
        <h2 className="report-section-title">AI Progress Summary</h2>
        <p style={{ color: '#6b7280', fontSize: '0.92rem', margin: 0 }}>
          AI progress summaries are currently turned off.
        </p>
      </section>
    );
  }

  const generate = async () => {
    setState('loading');
    setMessage('');
    try {
      const r = await axios.get(`${API_BASE}/api/progress-summary/${encodeURIComponent(childUsername)}`);
      if (r.data?.summary) {
        setSummary(r.data.summary);
        setState('done');
      } else {
        // disabled on the server, or not enough data — a neutral notice, not an error.
        setMessage(r.data?.message || 'Not enough activity yet to summarise.');
        setState('notice');
      }
    } catch (e) {
      setMessage(e.response?.data?.error || 'Could not generate the summary right now.');
      setState('error');
    }
  };

  return (
    <section className="report-section">
      <h2 className="report-section-title">AI Progress Summary</h2>

      {state === 'idle' && (
        <button className="report-btn--print" onClick={generate}>✨ Generate summary</button>
      )}

      {state === 'loading' && (
        <p style={{ color: '#6b7280' }}>Generating… this can take a few seconds.</p>
      )}

      {state === 'notice' && (
        <p style={{ color: '#6b7280', margin: 0 }}>{message}</p>
      )}

      {state === 'error' && (
        <>
          <p style={{ color: '#991b1b', marginBottom: 8 }}>{message}</p>
          <button className="report-btn--print" onClick={generate}>Try again</button>
        </>
      )}

      {state === 'done' && (
        <>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem', color: '#1f2937' }}>
            {summary}
          </div>
          <p style={{ marginTop: 12, fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
            AI-generated from this child's gameplay data to support — not replace — your clinical judgment.
            Always verify against the metrics in this report.
          </p>
        </>
      )}
    </section>
  );
}
