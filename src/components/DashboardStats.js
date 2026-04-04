import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTableRows } from '../services/supabaseMvpApi';

const SectionCard = ({ title, border, children }) => (
  <div className={`bg-white p-6 rounded-lg shadow-lg transition-shadow duration-300 border-t-4 ${border}`}>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const EmptyState = ({ text }) => <p className="text-gray-500">{text}</p>;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [announcementsRows, activitiesRows, examsRows, notificationsRows] = await Promise.all([
          fetchTableRows('dashboard_announcements', { limit: 5 }),
          fetchTableRows('user_activities', { limit: 5, orderBy: 'happened_at' }),
          fetchTableRows('exam_events', {
            limit: 5,
            orderBy: 'exam_date',
            orderConfig: { ascending: true },
          }),
          fetchTableRows('dashboard_notifications', { limit: 5 }),
        ]);

        setAnnouncements(announcementsRows || []);
        setRecentActivities(activitiesRows || []);
        setUpcomingExams(examsRows || []);
        setNotifications(notificationsRows || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 relative">
      <h1 className="text-3xl font-semibold mb-6 text-indigo-700 text-center sm:text-left">Dashboard Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Student Announcements" border="border-indigo-500">
          {announcements.length === 0 ? (
            <EmptyState text="No announcements yet. Add one in Supabase table dashboard_announcements." />
          ) : (
            <ul className="space-y-4 text-gray-700">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="border-b pb-2 hover:bg-indigo-50 rounded-md px-2 transition-colors duration-200">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <p>{announcement.content}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Activities" border="border-blue-500">
          {recentActivities.length === 0 ? (
            <EmptyState text="No activities yet. User actions can populate user_activities." />
          ) : (
            <ul className="space-y-4 text-gray-700">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex flex-col md:flex-row justify-between border-b pb-2 hover:bg-blue-50 rounded-md px-2 transition-colors duration-200">
                  <span>{activity.activity}</span>
                  <span className="text-sm text-gray-500">{new Date(activity.happened_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Upcoming Exams" border="border-green-500">
        {upcomingExams.length === 0 ? (
          <EmptyState text="No upcoming exams yet. Add rows to exam_events." />
        ) : (
          <ul className="space-y-4 text-gray-700">
            {upcomingExams.map((exam) => (
              <li key={exam.id} className="flex flex-col md:flex-row justify-between border-b pb-2 hover:bg-green-50 rounded-md px-2 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold">{exam.subject}</h3>
                  <p className="text-sm text-gray-500">{new Date(exam.exam_date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-gray-500">{exam.start_time || '--'} - {exam.end_time || '--'}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Important Notifications" border="border-yellow-500">
          {notifications.length === 0 ? (
            <EmptyState text="No notifications yet. Add rows to dashboard_notifications." />
          ) : (
            <ul className="space-y-4 text-gray-700">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-center space-x-4 hover:bg-yellow-50 rounded-md px-2 transition-colors duration-200">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <span role="img" aria-label="notification" className="text-yellow-500">🔔</span>
                  </div>
                  <span>{notification.message}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg transition-shadow duration-300 border-t-4 border-purple-500">
        <h2 className="text-2xl font-semibold text-purple-600 mb-4">Quick Links</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-center space-x-4 hover:bg-purple-50 rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-green-500">📚</span>
            <Link to="/library" className="text-blue-500 hover:underline">Library Resources</Link>
          </li>
          <li className="flex items-center space-x-4 hover:bg-purple-50 rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-yellow-500">📝</span>
            <Link to="/register-courses" className="text-blue-500 hover:underline">Course Registration</Link>
          </li>
          <li className="flex items-center space-x-4 hover:bg-purple-50 rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-red-500">📅</span>
            <Link to="/ClassSchedule" className="text-blue-500 hover:underline">Academic Calendar</Link>
          </li>
          <li className="flex items-center space-x-4 hover:bg-purple-50 rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-purple-500">👥</span>
            <Link to="/student-support" className="text-blue-500 hover:underline">Student Support</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
