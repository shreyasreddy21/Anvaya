import React from "react";
import ReactApexChart from "react-apexcharts";

const EmotionBarChart = ({ expressions }) => {
  // Count occurrences of each emotion
  const emotionCounts = expressions.reduce((acc, { expression }) => {
    acc[expression] = (acc[expression] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(emotionCounts);
  const seriesData = Object.values(emotionCounts);

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      title: { text: "Emotions" },
    },
    yaxis: {
      title: { text: "Occurrences" },
      min: 0,
      forceNiceScale: true,
    },
    colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"],
    title: {
      text: "Emotion Summary (Counts)",
      align: "center",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    dataLabels: {
      enabled: true,
    },
  };

  return (
    <div style={{ maxWidth: 600, margin: "1rem auto" }}>
      <ReactApexChart options={options} series={[{ name: "Count", data: seriesData }]} type="bar" height={300} />
    </div>
  );
};

export default EmotionBarChart;
