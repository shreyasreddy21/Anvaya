import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import axios from 'axios';
import './AchievementDashboard.css';

const BADGE_DEFS = [
  { id: 'first_steps',   icon: '🌱', name: 'First Steps',        desc: 'Complete your first game',            check: s => s.totalSessions >= 1        },
  { id: 'word_wizard',   icon: '✨', name: 'Word Wizard',         desc: 'Master 25 sight words',               check: s => s.sightWordsMastered >= 25   },
  { id: 'bookworm',      icon: '📚', name: 'Book Worm',           desc: 'Complete 5 fluency sessions',         check: s => s.fluencySessions >= 5       },
  { id: 'speed_reader',  icon: '⚡', name: 'Speed Reader',        desc: 'Reach 60 WPM in fluency',             check: s => s.bestWPM >= 60              },
  { id: 'perfectionist', icon: '💯', name: 'Perfect Score',       desc: 'Get 100% accuracy in any game',       check: s => s.bestAccuracy >= 100        },
  { id: 'morpho_master', icon: '🧩', name: 'Word Builder',        desc: 'Complete 10 morphology rounds',       check: s => s.morphologySessions >= 10   },
  { id: 'dedicated',     icon: '🔥', name: 'Dedicated Learner',   desc: 'Play 10 sessions total',              check: s => s.totalSessions >= 10        },
  { id: 'champion',      icon: '🏆', name: 'Champion',            desc: 'Get 90%+ accuracy 3 times',           check: s => s.highAccuracyCount >= 3     },
];

function computeStats(analytics, sightStats, fluencyList, morphologyList) {
  const gameSessions = analytics?.sessions ?? [];
  const totalSessions = gameSessions.length + (fluencyList?.length ?? 0) + (morphologyList?.length ?? 0);

  const allAccuracies = [
    ...gameSessions.map(s => s.score ?? 0),
    ...(fluencyList ?? []).map(s => s.accuracy ?? 0),
    ...(morphologyList ?? []).map(s => s.accuracy ?? 0),
  ];
  const bestAccuracy = allAccuracies.length ? Math.max(...allAccuracies) : 0;
  const highAccuracyCount = allAccuracies.filter(a => a >= 90).length;

  const bestWPM = (fluencyList ?? []).reduce((max, s) => Math.max(max, s.wpm ?? 0), 0);

  return {
    totalSessions,
    sightWordsMastered: sightStats?.mastered ?? 0,
    fluencySessions: fluencyList?.length ?? 0,
    morphologySessions: morphologyList?.length ?? 0,
    bestWPM,
    bestAccuracy,
    highAccuracyCount,
  };
}

export default function AchievementDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Guest';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username || username === 'Guest') {
      setLoading(false);
      setError('Please log in to see your achievements.');
      return;
    }

    const fetchAll = async () => {
      try {
        const [analyticsRes, sightRes, fluencyRes, morphRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/analytics?username=${username}`),
          axios.get(`${API_BASE}/api/sight-words/stats?username=${username}`),
          axios.get(`${API_BASE}/api/fluency?username=${username}`),
          axios.get(`${API_BASE}/api/morphology?username=${username}`),
        ]);

        const analytics   = analyticsRes.status   === 'fulfilled' ? analyticsRes.value.data   : null;
        const sightStats  = sightRes.status        === 'fulfilled' ? sightRes.value.data        : null;
        const fluencyList = fluencyRes.status      === 'fulfilled' ? fluencyRes.value.data      : [];
        const morphList   = morphRes.status        === 'fulfilled' ? morphRes.value.data        : [];

        setStats(computeStats(analytics, sightStats, fluencyList, morphList));

        // Build a unified recent-activity list from all session types
        const recent = [
          ...(analytics?.sessions ?? []).slice(0, 3).map(s => ({
            label: s.gameKey ?? 'Game',
            icon: '🎮',
            detail: `Score ${s.score ?? '—'}`,
            date: s.createdAt,
          })),
          ...(fluencyList ?? []).slice(0, 2).map(s => ({
            label: s.passageTitle || 'Reading',
            icon: '📖',
            detail: `${s.wpm ?? 0} WPM · ${s.accuracy ?? 0}%`,
            date: s.createdAt,
          })),
          ...(morphList ?? []).slice(0, 2).map(s => ({
            label: 'Word Builder',
            icon: '🧩',
            detail: `Score ${s.score ?? 0} · ${s.accuracy ?? 0}%`,
            date: s.createdAt,
          })),
        ]
          .filter(s => s.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);

        setRecentSessions(recent);
      } catch {
        setError('Could not load achievement data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  if (loading) {
    return (
      <div className="ach-page">
        <div className="ach-header">
          <button className="ach-back-btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
          <h1>🌟 My Learning Journey</h1>
        </div>
        <div className="ach-loading">Loading your achievements…</div>
      </div>
    );
  }

  const badgeStats = stats ?? { totalSessions: 0, sightWordsMastered: 0, fluencySessions: 0, morphologySessions: 0, bestWPM: 0, bestAccuracy: 0, highAccuracyCount: 0 };
  const earnedCount = BADGE_DEFS.filter(b => b.check(badgeStats)).length;

  return (
    <div className="ach-page">
      {/* Header */}
      <div className="ach-header">
        <button className="ach-back-btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
        <h1>🌟 My Learning Journey</h1>
        <p className="ach-username">@{username}</p>
      </div>

      {error && <div className="ach-error">{error}</div>}

      {/* Stats strip */}
      {stats && (
        <div className="ach-stats-strip">
          <div className="ach-stat-box">
            <span className="ach-stat-num">{stats.totalSessions}</span>
            <span className="ach-stat-label">Total Sessions</span>
          </div>
          <div className="ach-stat-box">
            <span className="ach-stat-num">{stats.bestWPM > 0 ? stats.bestWPM : '—'}</span>
            <span className="ach-stat-label">Best WPM</span>
          </div>
          <div className="ach-stat-box">
            <span className="ach-stat-num">{stats.sightWordsMastered}</span>
            <span className="ach-stat-label">Words Mastered</span>
          </div>
          <div className="ach-stat-box">
            <span className="ach-stat-num">{earnedCount} / {BADGE_DEFS.length}</span>
            <span className="ach-stat-label">Badges</span>
          </div>
        </div>
      )}

      {/* Badges */}
      <section className="ach-badges-section">
        <h2>🏅 Badges</h2>
        <div className="ach-badges-grid">
          {BADGE_DEFS.map(badge => {
            const earned = badge.check(badgeStats);
            return (
              <div
                key={badge.id}
                className={`ach-badge ${earned ? 'ach-badge--earned' : 'ach-badge--locked'}`}
                aria-label={`${badge.name}: ${badge.desc}${earned ? ' (earned)' : ' (locked)'}`}
              >
                <span className="ach-badge-icon" role="img" aria-hidden="true">
                  {earned ? badge.icon : '🔒'}
                </span>
                <span className="ach-badge-name">{badge.name}</span>
                <span className="ach-badge-desc">{badge.desc}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      {recentSessions.length > 0 && (
        <section className="ach-activity-section">
          <h2>📅 Recent Sessions</h2>
          <div className="ach-activity-list">
            {recentSessions.map((s, i) => (
              <div key={i} className="ach-activity-row">
                <span className="ach-activity-icon" aria-hidden="true">{s.icon}</span>
                <div className="ach-activity-info">
                  <span className="ach-activity-label">{s.label}</span>
                  <span className="ach-activity-detail">{s.detail}</span>
                </div>
                <span className="ach-activity-date">
                  {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
