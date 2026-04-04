import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTableRows } from '../services/supabaseMvpApi';

const SectionCard = ({ title, border, children }) => (
  <div className={`glass-card p-4 sm:p-6 rounded-lg transition-shadow duration-300 border-t-4 ${border}`}>
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[var(--text)] font-display">{title}</h2>
    {children}
  </div>
);

const EmptyState = ({ text }) => <p className="text-[var(--muted)]">{text}</p>;

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
       <div className="p-4 sm:p-6 min-h-screen">
        <p className="text-[var(--muted)]">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-4 sm:p-6 min-h-screen">
        <p className="text-[var(--danger)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen relative">
      <h1 className="stagger-in text-2xl sm:text-3xl font-semibold mb-6 text-[var(--text)] text-center sm:text-left font-display">Dashboard Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Student Announcements" border="border-indigo-500">
          {announcements.length === 0 ? (
            <EmptyState text="No announcements yet. Add one in Supabase table dashboard_announcements." />
          ) : (
            <ul className="space-y-4 text-[var(--text)]">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="border-b border-[var(--border)] pb-2 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
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
            <ul className="space-y-4 text-[var(--text)]">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex flex-col md:flex-row justify-between border-b border-[var(--border)] pb-2 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
                  <span>{activity.activity}</span>
                  <span className="text-sm text-[var(--muted)]">{new Date(activity.happened_at).toLocaleString()}</span>
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
          <ul className="space-y-4 text-[var(--text)]">
            {upcomingExams.map((exam) => (
              <li key={exam.id} className="flex flex-col md:flex-row justify-between border-b border-[var(--border)] pb-2 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold">{exam.subject}</h3>
                  <p className="text-sm text-[var(--muted)]">{new Date(exam.exam_date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-[var(--muted)]">{exam.start_time || '--'} - {exam.end_time || '--'}</span>
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
            <ul className="space-y-4 text-[var(--text)]">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-center space-x-4 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
                  <div className="bg-[rgba(255,178,92,0.2)] p-2 rounded-full">
                    <span role="img" aria-label="notification" className="text-[var(--accent-2)]">🔔</span>
                  </div>
                  <span>{notification.message}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="glass-card mt-6 p-6 rounded-lg transition-shadow duration-300 border-t-4 border-purple-500">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--accent)] mb-4 font-display">Quick Links</h2>
        <ul className="space-y-4 text-[var(--text)]">
          <li className="flex items-center space-x-4 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-[var(--accent)]">📚</span>
            <Link to="/library" className="text-[var(--accent)] hover:underline">Library Resources</Link>
          </li>
          <li className="flex items-center space-x-4 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-[var(--accent-2)]">📝</span>
            <Link to="/register-courses" className="text-[var(--accent)] hover:underline">Course Registration</Link>
          </li>
          <li className="flex items-center space-x-4 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-[var(--danger)]">📅</span>
            <Link to="/ClassSchedule" className="text-[var(--accent)] hover:underline">Academic Calendar</Link>
          </li>
          <li className="flex items-center space-x-4 hover:bg-[rgba(255,255,255,0.06)] rounded-md px-2 transition-colors duration-200">
            <span role="img" aria-label="link" className="text-[var(--muted)]">👥</span>
            <Link to="/student-support" className="text-[var(--accent)] hover:underline">Student Support</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
