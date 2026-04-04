import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

Chart.register(ArcElement, Tooltip, Legend);

const AttendanceOverview = ({ attendanceData = { labels: [], datasets: [] } }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [attendanceData]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
      <Doughnut ref={chartRef} data={attendanceData} />
    </div>
  );
};

export default AttendanceOverview;
