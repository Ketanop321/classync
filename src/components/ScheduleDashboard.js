import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList } from 'react-icons/fa';

function ScheduleDashboard({ selectedTab, setSelectedTab }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Class Schedule Box */}
        <Link
          to="/ClassSchedule"
          onClick={() => setSelectedTab('ClassSchedule')}
          className="flex flex-col items-center justify-center w-full min-h-48 md:min-h-56 p-4 bg-white rounded-xl shadow-lg border border-blue-200 transition-transform transform hover:scale-105 hover:shadow-2xl text-center"
        >
          <FaCalendarAlt className="text-blue-600 text-4xl md:text-5xl mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-blue-800">Class Schedule</h3>
          <p className="text-gray-500 text-sm md:text-base">View your daily schedule</p>
        </Link>

        {/* Exam Schedule Box */}
        <Link
          to="/ExamAssignmentSchedule"
          onClick={() => setSelectedTab('ExamAssignmentSchedule')}
          className="flex flex-col items-center justify-center w-full min-h-48 md:min-h-56 p-4 bg-white rounded-xl shadow-lg border border-blue-200 transition-transform transform hover:scale-105 hover:shadow-2xl text-center"
        >
          <FaClipboardList className="text-blue-600 text-4xl md:text-5xl mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-blue-800">Exam Schedule</h3>
          <p className="text-gray-500 text-sm md:text-base">Check assignments & exams</p>
        </Link>
      </div>
    </div>
  );
}

export default ScheduleDashboard;
