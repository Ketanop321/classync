import React, { useEffect, useMemo, useState } from 'react';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

function ClassSchedule() {
  const [view, setView] = useState('weekly');
  const [term, setTerm] = useState('All Terms');
  const [course, setCourse] = useState('All Courses');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    term: '',
    course: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    subject: '',
    room: '',
  });

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchTableRows('class_sessions', {
        orderBy: 'term',
        orderConfig: { ascending: true },
      });
      setSessions(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load class sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const terms = useMemo(() => {
    const unique = Array.from(new Set(sessions.map((item) => item.term))).filter(Boolean);
    return ['All Terms', ...unique];
  }, [sessions]);

  const courses = useMemo(() => {
    const unique = Array.from(new Set(sessions.map((item) => item.course))).filter(Boolean);
    return ['All Courses', ...unique];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((item) => {
      const termOk = term === 'All Terms' || item.term === term;
      const courseOk = course === 'All Courses' || item.course === course;
      return termOk && courseOk;
    });
  }, [sessions, term, course]);

  const monthlySummary = useMemo(() => {
    const grouped = filteredSessions.reduce((acc, item) => {
      if (!acc[item.day_of_week]) {
        acc[item.day_of_week] = [];
      }
      acc[item.day_of_week].push(item.subject);
      return acc;
    }, {});

    return Object.entries(grouped).map(([day, subjects]) => ({
      day,
      subjects: Array.from(new Set(subjects)).join(', '),
    }));
  }, [filteredSessions]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('class_sessions', formState);
      setFormState({
        term: '',
        course: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        subject: '',
        room: '',
      });
      await loadSessions();
    } catch (err) {
      setError(err.message || 'Could not save class session.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Class Schedule</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Add Class Session</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input name="term" value={formState.term} onChange={handleFormChange} placeholder="Term" required className="border p-2 rounded" />
          <input name="course" value={formState.course} onChange={handleFormChange} placeholder="Course" required className="border p-2 rounded" />
          <input name="day_of_week" value={formState.day_of_week} onChange={handleFormChange} placeholder="Day" required className="border p-2 rounded" />
          <input name="subject" value={formState.subject} onChange={handleFormChange} placeholder="Subject" required className="border p-2 rounded" />
          <input type="time" name="start_time" value={formState.start_time} onChange={handleFormChange} required className="border p-2 rounded" />
          <input type="time" name="end_time" value={formState.end_time} onChange={handleFormChange} required className="border p-2 rounded" />
          <input name="room" value={formState.room} onChange={handleFormChange} placeholder="Room" className="border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Session</button>
        </form>
      </div>

      <div className="mb-4">
        <label htmlFor="term" className="mr-2 font-medium">Select Term:</label>
        <select
          id="term"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto"
        >
          {terms.map((termOption) => (
            <option key={termOption}>{termOption}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="course" className="mr-2 font-medium">Select Course:</label>
        <select
          id="course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto"
        >
          {courses.map((courseOption) => (
            <option key={courseOption}>{courseOption}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap space-x-4 mb-6">
        <button
          onClick={() => setView('weekly')}
          className={`px-4 py-2 rounded ${view === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 rounded ${view === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Monthly
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 shadow rounded-lg overflow-x-auto">
        {loading ? (
          <p className="text-gray-600">Loading sessions...</p>
        ) : view === 'weekly' ? (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Weekly Schedule</h3>
            {filteredSessions.length === 0 ? (
              <p className="text-gray-600">No sessions found for selected filters.</p>
            ) : (
              <table className="min-w-full border border-gray-300 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 sm:px-4 py-2">Day</th>
                    <th className="border px-2 sm:px-4 py-2">Class Start Time</th>
                    <th className="border px-2 sm:px-4 py-2">Class End Time</th>
                    <th className="border px-2 sm:px-4 py-2">Subject</th>
                    <th className="border px-2 sm:px-4 py-2">Room No.</th>
                    <th className="border px-2 sm:px-4 py-2">Course</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b">
                      <td className="border px-2 sm:px-4 py-2">{session.day_of_week}</td>
                      <td className="border px-2 sm:px-4 py-2">{session.start_time}</td>
                      <td className="border px-2 sm:px-4 py-2">{session.end_time}</td>
                      <td className="border px-2 sm:px-4 py-2">{session.subject}</td>
                      <td className="border px-2 sm:px-4 py-2">{session.room || '--'}</td>
                      <td className="border px-2 sm:px-4 py-2">{session.course}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Monthly Summary</h3>
            {monthlySummary.length === 0 ? (
              <p className="text-gray-600">No monthly summary available.</p>
            ) : (
              <table className="min-w-full border border-gray-300 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 sm:px-4 py-2">Day</th>
                    <th className="border px-2 sm:px-4 py-2">Subjects</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map((item) => (
                    <tr key={item.day} className="border-b">
                      <td className="border px-2 sm:px-4 py-2">{item.day}</td>
                      <td className="border px-2 sm:px-4 py-2">{item.subjects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassSchedule;
