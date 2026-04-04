import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList } from 'react-icons/fa';

function ScheduleDashboard({ selectedTab, setSelectedTab }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Class Schedule Box */}
        <Link
          to="/ClassSchedule"
          onClick={() => setSelectedTab('ClassSchedule')}
          className="stagger-in glass-card flex flex-col items-center justify-center w-full min-h-48 md:min-h-56 p-4 rounded-xl border transition-transform transform hover:-translate-y-1 hover:scale-[1.02] text-center"
          style={{ animationDelay: '100ms' }}
        >
          <FaCalendarAlt className="text-[var(--accent)] text-4xl md:text-5xl mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-[var(--text)] font-display">Class Schedule</h3>
          <p className="text-[var(--muted)] text-sm md:text-base">View your daily schedule</p>
        </Link>

        {/* Exam Schedule Box */}
        <Link
          to="/ExamAssignmentSchedule"
          onClick={() => setSelectedTab('ExamAssignmentSchedule')}
          className="stagger-in glass-card flex flex-col items-center justify-center w-full min-h-48 md:min-h-56 p-4 rounded-xl border transition-transform transform hover:-translate-y-1 hover:scale-[1.02] text-center"
          style={{ animationDelay: '220ms' }}
        >
          <FaClipboardList className="text-[var(--accent-2)] text-4xl md:text-5xl mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-[var(--text)] font-display">Exam Schedule</h3>
          <p className="text-[var(--muted)] text-sm md:text-base">Check assignments & exams</p>
        </Link>
      </div>
    </div>
  );
}

export default ScheduleDashboard;
