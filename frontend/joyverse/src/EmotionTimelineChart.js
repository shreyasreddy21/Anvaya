// EmotionTimelineChart.js
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const EmotionTimelineChart = ({ expressions }) => {
  // Map expressions to the format required by ApexCharts
  const series = expressions.map((exp, index) => ({
    x: exp.expression,
    y: [
      new Date(exp.timestamp).getTime(),
      new Date(exp.timestamp).getTime() + 1000, // Assuming each emotion lasts 1 second
    ],
  }));

  const options = {
    chart: {
      type: 'rangeBar',
      height: 100,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
      },
    },
    xaxis: {
      type: 'datetime',
    },
    title: {
      text: 'Emotion Timeline',
      align: 'left',
    },
  };

  return (
    <div>
      <ReactApexChart options={options} series={[{ data: series }]} type="rangeBar" height={100} />
    </div>
  );
};

export default EmotionTimelineChart;
