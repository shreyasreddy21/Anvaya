import React from 'react';

const EmotionPercentageList = ({ expressions }) => {
  if (!expressions || expressions.length === 0) return <p>No emotion data available.</p>;

  // Sort expressions by timestamp
  const sorted = [...expressions].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Calculate durations between timestamps
  const durations = sorted.map((exp, idx) => {
    const currentTime = new Date(exp.timestamp).getTime();
    const nextTime = idx + 1 < sorted.length
      ? new Date(sorted[idx + 1].timestamp).getTime()
      : currentTime + 1000; // add 1 second if last

    return {
      expression: exp.expression,
      duration: nextTime - currentTime,
    };
  });

  // Aggregate durations by emotion
  const durationByEmotion = {};
  durations.forEach(({ expression, duration }) => {
    durationByEmotion[expression] = (durationByEmotion[expression] || 0) + duration;
  });

  // Total duration
  const totalDuration = durations.reduce((sum, d) => sum + d.duration, 0);

  // Prepare percentages
  const percentages = Object.entries(durationByEmotion).map(([emotion, dur]) => ({
    emotion,
    percentage: ((dur / totalDuration) * 100).toFixed(1), // one decimal place
  }));

  return (
    <div>
      <h4>Emotion Duration Percentages:</h4>
      <ul>
        {percentages.map(({ emotion, percentage }) => (
          <li key={emotion}>
            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}: {percentage}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmotionPercentageList;
