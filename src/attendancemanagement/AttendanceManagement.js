import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { fetchTableRows } from '../services/supabaseMvpApi';

const MotionLink = motion(Link);

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await fetchTableRows('attendance_records', {
          orderBy: 'date',
          orderConfig: { ascending: false },
        });
        setRecords(rows || []);
      } catch (err) {
        setError(err.message || 'Failed to load attendance records.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthly = records.filter((record) => {
      const date = new Date(record.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const presentCount = monthly.filter((record) => record.status === 'Present').length;
    const absentCount = monthly.filter((record) => record.status === 'Absent').length;
    const leaveCount = monthly.filter((record) => record.status === 'Leave').length;

    const total = monthly.length || 1;

    return {
      presentCount,
      absentCount,
      leaveCount,
      presentPercentage: ((presentCount / total) * 100).toFixed(1),
      absentPercentage: ((absentCount / total) * 100).toFixed(1),
      leavePercentage: ((leaveCount / total) * 100).toFixed(1),
    };
  }, [records]);

  const attendanceData = {
    labels: ['Present', 'Absent', 'Leave'],
    datasets: [
      {
        label: 'Attendance',
        data: [summary.presentCount, summary.absentCount, summary.leaveCount],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
        hoverBackgroundColor: ['#45A049', '#E53935', '#FFB300'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 md:p-6">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-4 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mb-4 md:mb-6 shadow-lg"
      >
        <h1 className="text-2xl md:text-3xl font-bold">Attendance Management</h1>
      </motion.header>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <nav className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 mb-4 md:mb-6">
        {['/attendance-record', '/attendance-calendar'].map((link, index) => (
          <MotionLink
            to={link}
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-center"
          >
            {link.split('/').pop().replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </MotionLink>
        ))}
      </nav>

      {loading ? (
        <p className="text-gray-600 text-center">Loading attendance summary...</p>
      ) : (
        <div className="flex flex-col md:flex-row justify-center items-center mt-6 md:mt-8 space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
            <h2 className="text-lg md:text-xl font-semibold text-center mb-4">Current Month Attendance Summary</h2>
            <Doughnut data={attendanceData} />
          </div>

          <div className="text-center md:text-left text-lg font-medium space-y-2 md:space-y-3">
            <p className="underline">
              <span className="font-semibold text-purple-600">Total 100%:</span>
            </p>
            <p>
              <span className="font-semibold text-green-600">Present:</span> {summary.presentPercentage}%
            </p>
            <p>
              <span className="font-semibold text-red-600">Absent:</span> {summary.absentPercentage}%
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Leave:</span> {summary.leavePercentage}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
