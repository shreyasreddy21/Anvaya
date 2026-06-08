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
    try {
      const response = await axios.get(`http://localhost:4000/api/sessions?username=${username}`);
      setSelectedChildSessions(response.data);
      setShowSessionDetails(true);
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
          <h3>Game Sessions for {filteredChildren.find(c => c.username === selectedChildSessions[0]?.username)?.name}</h3>
          {sessionError && <p className="error-msg">{sessionError}</p>}

          {selectedChildSessions.map((session, index) => (
  <div key={session._id} className="session-block">
    <h3>Session {index + 1}: {session.gameName} ({session.difficulty})</h3>
    <p><strong>Start:</strong> {new Date(session.startTime).toLocaleString()}</p>
    <p><strong>End:</strong> {new Date(session.endTime).toLocaleString()}</p>
    <p><strong>Score:</strong> {session.score}</p>

    {/* Timeline chart */}
    <EmotionTimelineChart expressions={session.expressions} />

    {/* Bar chart summarizing emotions */}
    <EmotionBarChart expressions={session.expressions} />
    <EmotionPercentageList expressions={session.expressions} />
  </div>
))}

        </div>
      )}
    </div>
    
  );
};

export default TherapistDashboard;
