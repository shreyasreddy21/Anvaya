import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import './TherapistDashboard.css';
import EmotionBarChart from '../components/EmotionBarChart';
import EmotionPercentageList from '../components/EmotionPercentageList';


const EmotionTimelineChart = ({ expressions }) => {
  const series = expressions.map((exp, idx) => ({
    x: exp.expression,
    y: [
      new Date(exp.timestamp).getTime(),
      new Date(exp.timestamp).getTime() + 1000 // 1 second duration
    ]
  }));

  const options = {
    chart: {
      type: 'rangeBar',
      height: 150,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: { datetimeFormatter: { second: 'HH:mm:ss' } }
    },
    title: {
      text: 'Emotion Timeline',
      align: 'left',
      style: { fontSize: '14px' }
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <ReactApexChart options={options} series={[{ data: series }]} type="rangeBar" height={150} />
    </div>
  );
};

const TherapistDashboard = () => {
  const [children, setChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [child, setChild] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedChildSessions, setSelectedChildSessions] = useState([]);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [phonemeTapSessions,     setPhonemeTapSessions]     = useState([]);
  const [letterSoundSessions,    setLetterSoundSessions]    = useState([]);
  const [confusableSessions,     setConfusableSessions]     = useState([]);
  const [ranSessions,            setRANSessions]            = useState([]);
  const [verbalMemorySessions,   setVerbalMemorySessions]   = useState([]);
  const [selectedUsername,       setSelectedUsername]       = useState('');

  const therapistId = localStorage.getItem("therapistId");
 useEffect(() => {
    // Enable scrolling when this page is open
    document.body.style.overflow = "auto";
  
    // When leaving this page, disable scrolling again
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);
  useEffect(() => {
    const fetchChildren = async () => {
      if (!therapistId) {
        setError('Therapist ID is missing');
        return;
      }
      try {
        const response = await axios.get("http://localhost:4000/api/children", {
          headers: { 'therapist-id': therapistId }
        });
        setChildren(response.data);
      } catch (err) {
        setError('Failed to fetch children');
      }
    };

    fetchChildren();
  }, [therapistId]);

  const handleViewDetails = async (username) => {
    setSelectedUsername(username);
    setShowSessionDetails(true);
    setSessionError('');
    try {
      const [sessionsRes, ptRes, lsRes, clRes, ranRes, vmRes] = await Promise.all([
        axios.get(`http://localhost:4000/api/sessions?username=${username}`),
        axios.get(`http://localhost:4000/api/phoneme-tap?username=${username}`),
        axios.get(`http://localhost:4000/api/letter-sound?username=${username}`),
        axios.get(`http://localhost:4000/api/confusable-letter?username=${username}`),
        axios.get(`http://localhost:4000/api/ran?username=${username}`),
        axios.get(`http://localhost:4000/api/verbal-memory?username=${username}`),
      ]);
      setSelectedChildSessions(sessionsRes.data);
      setPhonemeTapSessions(ptRes.data);
      setLetterSoundSessions(lsRes.data);
      setConfusableSessions(clRes.data);
      setRANSessions(ranRes.data);
      setVerbalMemorySessions(vmRes.data);
    } catch (err) {
      setSessionError('Failed to fetch game sessions');
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Reset success message

    if (!child.name || !child.username || !child.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/children", {
        ...child,
        therapistId,
      });

      setChildren(prev => [...prev, response.data]);

      setChild({ name: "", username: "", password: "" });
      setShowAddChildForm(false);
      setSuccessMessage("Child added successfully!"); // Show success message

      // Hide success message after 3 seconds
      setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to add child.");
  }
  };

  const filteredChildren = children.filter(child =>
    (child.username && child.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (child.name && child.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <div className="dashboard-container">
      <h2 className="welcome-therapist">Welcome back, Therapist!</h2>
      <h2 className="dashboard-title">Logged-in Children</h2>

      <input
        type="text"
        placeholder="Search by Name or Username..."
        className="search-bar"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={() => setShowAddChildForm(!showAddChildForm)}
        className="add-child-btn"
      >
        {showAddChildForm ? 'Cancel' : 'Add Child'}
      </button>

      {showAddChildForm && (
        <div className="add-child-form-container">
          <h3>Add Child</h3>
          <form className="add-child-form" onSubmit={handleAddChild}>
            <input
              type="text"
              name="name"
              placeholder="Child's Name"
              className="form-input"
              value={child.name}
              onChange={(e) => setChild({ ...child, name: e.target.value })}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-input"
              value={child.username}
              onChange={(e) => setChild({ ...child, username: e.target.value })}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-input"
              value={child.password}
              onChange={(e) => setChild({ ...child, password: e.target.value })}
            />
            <button type="submit" className="submit-btn">Add Child</button>
          </form>
          {error && <p className="error-msg">{error}</p>}
          {successMessage && <p className="success-msg">{successMessage}</p>}
        </div>
      )}

      <table className="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredChildren.map((child, index) => (
            <tr key={child._id}>
              <td>{index + 1}</td>
              <td>{child.name}</td>
              <td>{child.username}</td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => handleViewDetails(child.username)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showSessionDetails && (
        <div className="session-details">
          <h3>Game Sessions for {filteredChildren.find(c => c.username === selectedUsername)?.name}</h3>
          {sessionError && <p className="error-msg">{sessionError}</p>}

          {selectedChildSessions.map((session, index) => (
            <div key={session._id} className="session-block">
              <h3>Session {index + 1}: {session.gameName} ({session.difficulty})</h3>
              <p><strong>Start:</strong> {new Date(session.startTime).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(session.endTime).toLocaleString()}</p>
              <p><strong>Score:</strong> {session.score}</p>
              {session.moodAtStart && (
                <p>
                  <strong>Mood at start:</strong>{' '}
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#4a5568', background: '#eef0ff', borderRadius: '8px', padding: '2px 10px' }}>
                    {session.moodAtStart}
                  </span>
                </p>
              )}
              {session.phonicsLevel && (
                <p>
                  <strong>Phonics level:</strong>{' '}
                  <span style={{ fontWeight: 600, color: '#1a4731', background: '#d1fae5', borderRadius: '8px', padding: '2px 10px' }}>
                    {session.phonicsLevel}
                  </span>
                </p>
              )}
              <EmotionTimelineChart expressions={session.expressions} />
              <EmotionBarChart expressions={session.expressions} />
              <EmotionPercentageList expressions={session.expressions} />
            </div>
          ))}

          {/* ── Phoneme Tap Analytics ─────────────────────────────── */}
          {phonemeTapSessions.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#3730a3', borderBottom: '2px solid #e0e7ff', paddingBottom: '6px' }}>
                👂 Phoneme Tap Sessions ({phonemeTapSessions.length})
              </h3>
              {phonemeTapSessions.map((pt, i) => (
                <div key={pt._id} className="session-block" style={{ borderLeft: '4px solid #6366f1' }}>
                  <h4 style={{ margin: '0 0 8px' }}>Phoneme Tap #{i + 1} — {pt.phonicsLevel} / {pt.difficulty}</h4>
                  <p><strong>Date:</strong> {new Date(pt.createdAt || pt.startTime).toLocaleString()}</p>
                  <p><strong>Score:</strong> {pt.score} &nbsp;|&nbsp; <strong>Accuracy:</strong>{' '}
                    <span style={{ fontWeight: 700, color: pt.overallAccuracy >= 70 ? '#166534' : '#991b1b' }}>
                      {pt.overallAccuracy}%
                    </span>
                  </p>
                  {pt.moodAtStart && (
                    <p><strong>Mood at start:</strong>{' '}
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#4a5568', background: '#eef0ff', borderRadius: '8px', padding: '2px 10px' }}>
                        {pt.moodAtStart}
                      </span>
                    </p>
                  )}
                  {pt.wordResults && pt.wordResults.length > 0 && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Word-by-word results</summary>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: '#e0e7ff' }}>
                            <th style={{ padding: '4px 10px', textAlign: 'left' }}>Word</th>
                            <th style={{ padding: '4px 10px' }}>Expected</th>
                            <th style={{ padding: '4px 10px' }}>Taps</th>
                            <th style={{ padding: '4px 10px' }}>Accuracy</th>
                            <th style={{ padding: '4px 10px' }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pt.wordResults.map((wr, j) => (
                            <tr key={j} style={{ background: wr.correct ? '#dcfce7' : '#fee2e2' }}>
                              <td style={{ padding: '4px 10px', fontWeight: 600 }}>{wr.word}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{wr.expectedPhonemes}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{wr.actualTaps}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{wr.accuracy}%</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{wr.correct ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Letter Sound Analytics ────────────────────────────── */}
          {letterSoundSessions.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#065f46', borderBottom: '2px solid #d1fae5', paddingBottom: '6px' }}>
                🔤 Letter Sound Sessions ({letterSoundSessions.length})
              </h3>
              {letterSoundSessions.map((ls, i) => (
                <div key={ls._id} className="session-block" style={{ borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: '0 0 8px' }}>Letter Sound #{i + 1} — {ls.phonicsLevel} / {ls.difficulty}</h4>
                  <p><strong>Date:</strong> {new Date(ls.createdAt || ls.startTime).toLocaleString()}</p>
                  <p>
                    <strong>Score:</strong> {ls.score} &nbsp;|&nbsp;
                    <strong>Accuracy:</strong>{' '}
                    <span style={{ fontWeight: 700, color: ls.overallAccuracy >= 70 ? '#166534' : '#991b1b' }}>
                      {ls.overallAccuracy}%
                    </span>
                    &nbsp;|&nbsp;
                    <strong>Avg reaction:</strong> {ls.avgReactionTimeMs ? `${(ls.avgReactionTimeMs / 1000).toFixed(1)}s` : '—'}
                  </p>
                  {ls.moodAtStart && (
                    <p><strong>Mood at start:</strong>{' '}
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#4a5568', background: '#eef0ff', borderRadius: '8px', padding: '2px 10px' }}>
                        {ls.moodAtStart}
                      </span>
                    </p>
                  )}
                  {ls.questionResults && ls.questionResults.length > 0 && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Question-by-question results</summary>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: '#d1fae5' }}>
                            <th style={{ padding: '4px 10px', textAlign: 'left' }}>Letter/Pattern</th>
                            <th style={{ padding: '4px 10px' }}>Selected</th>
                            <th style={{ padding: '4px 10px' }}>Reaction</th>
                            <th style={{ padding: '4px 10px' }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ls.questionResults.map((qr, j) => (
                            <tr key={j} style={{ background: qr.correct ? '#dcfce7' : '#fee2e2' }}>
                              <td style={{ padding: '4px 10px', fontWeight: 700, fontSize: '1.1rem' }}>{qr.letter}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{qr.selectedOption}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                                {qr.reactionTimeMs ? `${(qr.reactionTimeMs / 1000).toFixed(1)}s` : '—'}
                              </td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{qr.correct ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Confusable Letter Analytics ───────────────────── */}
          {confusableSessions.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#3730a3', borderBottom: '2px solid #e0e7ff', paddingBottom: '6px' }}>
                🔡 Letter Trainer Sessions ({confusableSessions.length})
              </h3>
              {confusableSessions.map((cs, i) => {
                const pairAcc = cs.pairAccuracy
                  ? (cs.pairAccuracy instanceof Map
                      ? Object.fromEntries(cs.pairAccuracy)
                      : cs.pairAccuracy)
                  : {};
                const PAIR_LABELS = { bd: 'b/d', pq: 'p/q', mw: 'm/w', nu: 'n/u' };
                const PAIR_COLORS = { bd: '#e0e7ff', pq: '#fce7f3', mw: '#d1fae5', nu: '#fef3c7' };
                const worstPair = Object.entries(pairAcc).sort((a, b) => a[1] - b[1])[0];
                return (
                  <div key={cs._id} className="session-block" style={{ borderLeft: '4px solid #6366f1' }}>
                    <h4 style={{ margin: '0 0 8px' }}>
                      Letter Trainer #{i + 1} — {cs.difficulty}
                      {cs.focusPairs && cs.focusPairs.length < 4 && (
                        <span style={{ marginLeft: 8, fontSize: '0.85rem', fontWeight: 400 }}>
                          Pairs: {cs.focusPairs.map(p => PAIR_LABELS[p]).join(', ')}
                        </span>
                      )}
                    </h4>
                    <p><strong>Date:</strong> {new Date(cs.createdAt || cs.startTime).toLocaleString()}</p>
                    <p>
                      <strong>Score:</strong> {cs.score} &nbsp;|&nbsp;
                      <strong>Accuracy:</strong>{' '}
                      <span style={{ fontWeight: 700, color: cs.overallAccuracy >= 70 ? '#166534' : '#991b1b' }}>
                        {cs.overallAccuracy}%
                      </span>
                    </p>
                    {Object.keys(pairAcc).length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
                        {Object.entries(pairAcc).map(([pair, pct]) => (
                          <span key={pair} style={{
                            background: PAIR_COLORS[pair] || '#eee',
                            border: `2px solid ${pct < 70 ? '#ef4444' : '#22c55e'}`,
                            borderRadius: 10,
                            padding: '3px 12px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}>
                            {PAIR_LABELS[pair]}: <span style={{ color: pct < 70 ? '#991b1b' : '#166534' }}>{pct}%</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {worstPair && worstPair[1] < 80 && (
                      <p style={{ fontSize: '0.85rem', color: '#7c3aed', background: '#ede9fe', borderRadius: 8, padding: '4px 12px', display: 'inline-block' }}>
                        Needs practice: {PAIR_LABELS[worstPair[0]]} ({worstPair[1]}%)
                      </p>
                    )}
                    {cs.moodAtStart && (
                      <p><strong>Mood at start:</strong>{' '}
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#4a5568', background: '#eef0ff', borderRadius: '8px', padding: '2px 10px' }}>
                          {cs.moodAtStart}
                        </span>
                      </p>
                    )}
                    {cs.events && cs.events.length > 0 && (
                      <details style={{ marginTop: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Question-by-question results ({cs.events.length})</summary>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ background: '#e0e7ff' }}>
                              <th style={{ padding: '4px 10px', textAlign: 'left' }}>Question</th>
                              <th style={{ padding: '4px 10px' }}>Pair</th>
                              <th style={{ padding: '4px 10px' }}>Selected</th>
                              <th style={{ padding: '4px 10px' }}>Reaction</th>
                              <th style={{ padding: '4px 10px' }}>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cs.events.map((ev, j) => (
                              <tr key={j} style={{ background: ev.correct ? '#dcfce7' : '#fee2e2' }}>
                                <td style={{ padding: '4px 10px', fontWeight: 700, fontSize: '1.1rem' }}>{ev.question}</td>
                                <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                                  <span style={{ background: PAIR_COLORS[ev.pair] || '#eee', borderRadius: 6, padding: '1px 8px', fontSize: '0.8rem' }}>
                                    {PAIR_LABELS[ev.pair] || ev.pair}
                                  </span>
                                </td>
                                <td style={{ padding: '4px 10px', textAlign: 'center', fontWeight: 700 }}>{ev.selected}</td>
                                <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                                  {ev.reactionTimeMs ? `${(ev.reactionTimeMs / 1000).toFixed(1)}s` : '—'}
                                </td>
                                <td style={{ padding: '4px 10px', textAlign: 'center' }}>{ev.correct ? '✅' : '❌'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── RAN Analytics ─────────────────────────────────── */}
          {ranSessions.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#065f46', borderBottom: '2px solid #a7f3d0', paddingBottom: '6px' }}>
                ⚡ Rapid Naming Sessions ({ranSessions.length})
              </h3>
              {ranSessions.map((rs, i) => (
                <div key={rs._id} className="session-block" style={{ borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: '0 0 8px' }}>
                    RAN #{i + 1} — {rs.category} / {rs.difficulty}
                  </h4>
                  <p><strong>Date:</strong> {new Date(rs.createdAt || rs.startTime).toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '4px 0' }}>
                    <span><strong>Time:</strong> {rs.totalTimeMs ? `${(rs.totalTimeMs / 1000).toFixed(1)}s` : '—'}</span>
                    <span><strong>Items/min:</strong>{' '}
                      <span style={{ fontWeight: 700, color: '#065f46' }}>{rs.itemsPerMinute ?? '—'}</span>
                    </span>
                    <span><strong>Accuracy:</strong>{' '}
                      <span style={{ fontWeight: 700, color: (rs.accuracy ?? 0) >= 70 ? '#166534' : '#991b1b' }}>
                        {rs.accuracy ?? 0}%
                      </span>
                    </span>
                    <span><strong>Score:</strong> {rs.score ?? rs.correctItems * 10}</span>
                  </div>
                  {rs.moodAtStart && (
                    <p><strong>Mood at start:</strong>{' '}
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#4a5568', background: '#eef0ff', borderRadius: '8px', padding: '2px 10px' }}>
                        {rs.moodAtStart}
                      </span>
                    </p>
                  )}
                  {rs.items && rs.items.length > 0 && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Item-by-item results ({rs.items.length})</summary>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: '#a7f3d0' }}>
                            <th style={{ padding: '4px 10px', textAlign: 'left' }}>Item</th>
                            <th style={{ padding: '4px 10px' }}>Selected</th>
                            <th style={{ padding: '4px 10px' }}>Time</th>
                            <th style={{ padding: '4px 10px' }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rs.items.map((it, j) => (
                            <tr key={j} style={{ background: it.correct ? '#dcfce7' : '#fee2e2' }}>
                              <td style={{ padding: '4px 10px', fontWeight: 800, fontSize: '1.1rem' }}>{it.item}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{it.selected}</td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                                {it.timeMs ? `${(it.timeMs / 1000).toFixed(2)}s` : '—'}
                              </td>
                              <td style={{ padding: '4px 10px', textAlign: 'center' }}>{it.correct ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Verbal Memory Analytics ────────────────────────── */}
          {verbalMemorySessions.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#312e81', borderBottom: '2px solid #c7d2fe', paddingBottom: '6px' }}>
                🧠 Verbal Sequence Memory Sessions ({verbalMemorySessions.length})
              </h3>
              {verbalMemorySessions.map((vm, i) => (
                <div key={vm._id} className="session-block" style={{ borderLeft: '4px solid #6366f1' }}>
                  <h4 style={{ margin: '0 0 8px' }}>
                    Sequence Memory #{i + 1} — {vm.mode} / {vm.difficulty}
                  </h4>
                  <p><strong>Date:</strong> {new Date(vm.createdAt || vm.startTime).toLocaleString()}</p>

                  {/* Key metrics row */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '8px 0', alignItems: 'stretch' }}>
                    <div style={{ background: 'linear-gradient(135deg,#e0e7ff,#ede9fe)', borderRadius: 12, padding: '10px 18px', border: '2px solid #6366f1', textAlign: 'center', minWidth: 100 }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4338ca', lineHeight: 1 }}>
                        {vm.workingMemoryScore ?? '—'}
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 3 }}>WM Score</div>
                    </div>
                    <div style={{ background: '#f0f4ff', borderRadius: 12, padding: '10px 14px', textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#312e81' }}>{vm.maxSequenceLength ?? '—'}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 3 }}>Max Length</div>
                    </div>
                    <div style={{ background: '#f0f4ff', borderRadius: 12, padding: '10px 14px', textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (vm.overallAccuracy ?? 0) >= 70 ? '#166534' : '#991b1b' }}>
                        {vm.overallAccuracy ?? 0}%
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 3 }}>Accuracy</div>
                    </div>
                    <div style={{ background: '#f0f4ff', borderRadius: 12, padding: '10px 14px', textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#312e81' }}>
                        {vm.rounds ? vm.rounds.filter(r => r.correct).length : '—'}/{vm.rounds ? vm.rounds.length : '—'}
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 3 }}>Perfect Rounds</div>
                    </div>
                  </div>

                  {vm.moodAtStart && (
                    <p><strong>Mood at start:</strong>{' '}
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#4a5568', background: '#eef0ff', borderRadius: '8px', padding: '2px 10px' }}>
                        {vm.moodAtStart}
                      </span>
                    </p>
                  )}

                  {vm.rounds && vm.rounds.length > 0 && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                        Round-by-round results ({vm.rounds.length} rounds)
                      </summary>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.87rem' }}>
                        <thead>
                          <tr style={{ background: '#e0e7ff' }}>
                            <th style={{ padding: '4px 8px' }}>Round</th>
                            <th style={{ padding: '4px 8px' }}>Length</th>
                            <th style={{ padding: '4px 8px', textAlign: 'left' }}>Presented</th>
                            <th style={{ padding: '4px 8px', textAlign: 'left' }}>Recalled</th>
                            <th style={{ padding: '4px 8px' }}>Accuracy</th>
                            <th style={{ padding: '4px 8px' }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vm.rounds.map((r, j) => (
                            <tr key={j} style={{ background: r.correct ? '#dcfce7' : '#fee2e2' }}>
                              <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700 }}>#{r.round}</td>
                              <td style={{ padding: '4px 8px', textAlign: 'center' }}>{r.sequenceLength}</td>
                              <td style={{ padding: '4px 8px', fontStyle: 'italic' }}>
                                {r.presented ? r.presented.join(' → ') : '—'}
                              </td>
                              <td style={{ padding: '4px 8px' }}>
                                {r.recalled ? r.recalled.map((item, k) => (
                                  <span key={k} style={{
                                    color: r.presented && r.presented[k] === item ? '#166534' : '#991b1b',
                                    fontWeight: 700,
                                    marginRight: 4,
                                  }}>{item}</span>
                                )) : '—'}
                              </td>
                              <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700 }}>
                                {r.positionAccuracy}%
                              </td>
                              <td style={{ padding: '4px 8px', textAlign: 'center' }}>{r.correct ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

  );
};

export default TherapistDashboard;
