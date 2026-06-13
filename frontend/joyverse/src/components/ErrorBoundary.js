import React from 'react';

/**
 * ErrorBoundary — catches render/runtime errors in the component tree so a
 * single crashing game never white-screens the whole app for a child.
 *
 * React requires error boundaries to be class components (no hook equivalent
 * for getDerivedStateFromError / componentDidCatch).
 *
 * Props:
 *   resetKey {any}    — when this value changes, the boundary auto-resets
 *                       (pass the route path so navigating away clears errors)
 *   homeHref {string} — where the "Back to safety" button sends the child
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log for debugging — never include user/session data.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', error?.message, info?.componentStack?.split('\n')[1]?.trim());
  }

  componentDidUpdate(prevProps) {
    // Auto-recover when the child navigates to a different route.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    const { homeHref = '/games' } = this.props;
    return (
      <div role="alert" style={styles.wrap}>
        <span style={styles.emoji} aria-hidden="true">🤖</span>
        <h1 style={styles.title}>Oops! Something hiccuped.</h1>
        <p style={styles.text}>Don't worry — it's not your fault. Let's try again!</p>
        <div style={styles.row}>
          <button style={{ ...styles.btn, ...styles.primary }} onClick={this.handleRetry}>
            🔄 Try Again
          </button>
          <a style={{ ...styles.btn, ...styles.ghost }} href={homeHref}>
            🏠 Back to Games
          </a>
        </div>
      </div>
    );
  }
}

const styles = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '80vh', gap: '18px', textAlign: 'center', padding: '24px',
    fontFamily: 'var(--font-opendyslexic, system-ui, sans-serif)',
  },
  emoji: { fontSize: '4.5rem' },
  title: { fontSize: '1.8rem', margin: 0, color: 'var(--text-primary, #1f2937)' },
  text: { fontSize: '1.05rem', margin: 0, color: 'var(--text-secondary, #6b7280)', maxWidth: '420px' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' },
  btn: {
    padding: '12px 26px', borderRadius: '14px', fontWeight: 700, fontSize: '1rem',
    cursor: 'pointer', border: 'none', textDecoration: 'none', fontFamily: 'inherit',
  },
  primary: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' },
  ghost: { background: 'rgba(255,255,255,0.7)', color: '#4f46e5', border: '2px solid rgba(99,102,241,0.35)' },
};

export default ErrorBoundary;
