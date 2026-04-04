import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '../components/DashboardStats';
import AcademicPerformance from '../components/marks&academic';
import AttendanceManagement from '../attendancemanagement/AttendanceManagement';
import ExamAssignmentSchedule from '../components/ExamAssignmentSchedule';
import ClassSchedule from '../components/ClassSchedule';
import FeesManagement from '../pages/FeesManagement';
import CourseRegistration from '../pages/CourseRegistration';
import UserProfile from '../pages/UserProfile';
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
      <Route path="/" element={<Dashboard />} />
      <Route path="/marks&academic" element={<AcademicPerformance />} />
      <Route path="/attendance" element={<AttendanceManagement />} />
      <Route path="/ExamAssignmentSchedule" element={<ExamAssignmentSchedule />} />
      <Route path="/ClassSchedule" element={<ClassSchedule />} />
      <Route
        path="/ScheduleDashboard"
        element={<ScheduleDashboard selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
      />
      <Route path="/fees" element={<FeesManagement />} />
      <Route path="/register-courses" element={<CourseRegistration />} />
      <Route path="/user-profile" element={<UserProfile />} />
      <Route path="/reply" element={<ReplyPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/student-support" element={<StudentSupport />} />
      <Route path="/attendance-record" element={<AttendanceRecord />} />
      <Route path="/attendance-calendar" element={<AttendanceCalendar />} />
      <Route path="/attendance-overview" element={<AttendanceOverview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
