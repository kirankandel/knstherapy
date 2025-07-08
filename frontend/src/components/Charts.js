'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Rating Distribution Chart
export const RatingDistributionChart = ({ data }) => {
  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Ratings',
        data: [
          data['1'] || 0,
          data['2'] || 0,
          data['3'] || 0,
          data['4'] || 0,
          data['5'] || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red for 1 star
          'rgba(245, 158, 11, 0.8)',  // Orange for 2 stars
          'rgba(234, 179, 8, 0.8)',   // Yellow for 3 stars
          'rgba(34, 197, 94, 0.8)',   // Green for 4 stars
          'rgba(16, 185, 129, 0.8)',  // Emerald for 5 stars
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Rating Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// Session Type Chart
export const SessionTypeChart = ({ data }) => {
  const labels = Object.keys(data);
  const counts = labels.map(type => data[type]?.count || 0);
  const colors = {
    text: 'rgba(59, 130, 246, 0.8)',   // Blue
    audio: 'rgba(16, 185, 129, 0.8)',  // Green
    video: 'rgba(139, 92, 246, 0.8)',  // Purple
  };

  const chartData = {
    labels: labels.map(type => 
      type === 'text' ? '💬 Text Chat' :
      type === 'audio' ? '🎤 Voice Call' :
      type === 'video' ? '📹 Video Call' : type
    ),
    datasets: [
      {
        data: counts,
        backgroundColor: labels.map(type => colors[type] || 'rgba(107, 114, 128, 0.8)'),
        borderColor: labels.map(type => colors[type]?.replace('0.8', '1') || 'rgba(107, 114, 128, 1)'),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Session Types',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

// Ratings Over Time Chart
export const RatingsOverTimeChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => `Week ${item._id.week}`),
    datasets: [
      {
        label: 'Sessions',
        data: data.map(item => item.count),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Average Rating',
        data: data.map(item => item.averageRating),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Performance Over Time',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Sessions',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Average Rating',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 5,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

// Daily Activity Chart
export const DailyActivityChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => `${item._id.month}/${item._id.day}`),
    datasets: [
      {
        label: 'Sessions',
        data: data.map(item => item.sessionsCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Daily Activity (Last 7 Days)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
