import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../auth/login/login';
import ProtectedRoute from '../route/ProtectedRoute';
import Dashboard from '../components/DashboardStats';
import AcademicPerformance from '../components/marks&academic';
import AttendanceManagement from '../attendancemanagement/AttendanceManagement';
import ExamAssignmentSchedule from '../components/ExamAssignmentSchedule';
import ClassSchedule from '../components/ClassSchedule';
import FeesManagement from '../pages/FeesManagement';
import CourseRegistration from '../pages/CourseRegistration';
import UserProfile from '../pages/UserProfile';
import StudentDetails from '../pages/StudentDetails';
import NoticePage from '../pages/NoticePage';
import ReplyPage from '../Replypage';
import AttendanceRecord from '../attendancemanagement/AttendanceRecord';
import AttendanceOverview from '../attendancemanagement/AttendanceOverview';
import AttendanceCalendar from '../attendancemanagement/AttendanceCalendar';
import LibraryPage from '../library/LibraryPage';
import StudentSupport from '../pages/StudentSupport';
import ScheduleDashboard from '../components/ScheduleDashboard';

const AppRoutes = () => {
  const [selectedTab, setSelectedTab] = useState(null);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/marks&academic" element={<ProtectedRoute><AcademicPerformance /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendanceManagement /></ProtectedRoute>} />
      <Route path="/ExamAssignmentSchedule" element={<ProtectedRoute><ExamAssignmentSchedule /></ProtectedRoute>} />
      <Route path="/ClassSchedule" element={<ProtectedRoute><ClassSchedule /></ProtectedRoute>} />
      <Route
        path="/ScheduleDashboard"
        element={<ProtectedRoute><ScheduleDashboard selectedTab={selectedTab} setSelectedTab={setSelectedTab} /></ProtectedRoute>}
      />
      <Route path="/fees" element={<ProtectedRoute><FeesManagement /></ProtectedRoute>} />
      <Route path="/register-courses" element={<ProtectedRoute><CourseRegistration /></ProtectedRoute>} />
      <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/student-details" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><NoticePage /></ProtectedRoute>} />
      <Route path="/reply" element={<ProtectedRoute><ReplyPage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
      <Route path="/student-support" element={<ProtectedRoute><StudentSupport /></ProtectedRoute>} />
      <Route path="/attendance-record" element={<ProtectedRoute><AttendanceRecord /></ProtectedRoute>} />
      <Route path="/attendance-calendar" element={<ProtectedRoute><AttendanceCalendar /></ProtectedRoute>} />
      <Route path="/attendance-overview" element={<ProtectedRoute><AttendanceOverview /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
