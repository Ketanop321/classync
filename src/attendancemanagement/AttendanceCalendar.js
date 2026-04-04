import React, { useEffect, useMemo, useState } from 'react';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

const CATEGORY_LABELS = {
  semester: 'Semester Dates',
  deadline: 'Important Deadlines',
  exam: 'Exam Dates',
  holiday: 'Holidays and Observances',
  event: 'Events and Activities',
  result: 'Grading and Result Dates',
  internship: 'Internship and Placement Drives',
  faculty_development: 'Faculty Development Days',
};

const Section = ({ title, items }) => (
  <div className="p-4 bg-white shadow rounded-lg">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {items.length === 0 ? (
      <p className="text-gray-500">No events in this category yet.</p>
    ) : (
      <ul className="list-disc pl-5 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="text-gray-700">
            <span className="font-medium">{item.name}:</span>{' '}
            {item.end_date && item.end_date !== item.start_date
              ? `${item.start_date} - ${item.end_date}`
              : item.start_date}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const AcademicCalendar = () => {
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    category: 'deadline',
    name: '',
    start_date: '',
    end_date: '',
    semester: 'All',
    details: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchTableRows('academic_calendar_events', {
        orderBy: 'start_date',
        orderConfig: { ascending: true },
      });
      setEvents(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load calendar events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const semesterOptions = useMemo(() => {
    const unique = Array.from(new Set(events.map((event) => event.semester))).filter(Boolean);
    return ['All', ...unique];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) => selectedSemester === 'All' || event.semester === selectedSemester || event.semester === 'All'
    );
  }, [events, selectedSemester]);

  const groupedByCategory = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = [];
      }
      acc[event.category].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('academic_calendar_events', {
        category: formState.category,
        name: formState.name,
        start_date: formState.start_date,
        end_date: formState.end_date || null,
        semester: formState.semester,
        details: formState.details || null,
      });

      setFormState({
        category: 'deadline',
        name: '',
        start_date: '',
        end_date: '',
        semester: 'All',
        details: '',
      });

      await loadEvents();
    } catch (err) {
      setError(err.message || 'Could not add calendar event.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Academic Calendar</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="p-4 bg-white rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Calendar Event</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select name="category" value={formState.category} onChange={handleFormChange} className="p-2 border rounded">
            {Object.keys(CATEGORY_LABELS).map((key) => (
              <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
            ))}
          </select>
          <input
            type="text"
            name="name"
            placeholder="Event name"
            value={formState.name}
            onChange={handleFormChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="semester"
            placeholder="Semester (e.g. Semester 1)"
            value={formState.semester}
            onChange={handleFormChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="start_date"
            value={formState.start_date}
            onChange={handleFormChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="end_date"
            value={formState.end_date}
            onChange={handleFormChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="details"
            placeholder="Details (optional)"
            value={formState.details}
            onChange={handleFormChange}
            className="p-2 border rounded"
          />
          <button type="submit" className="md:col-span-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add Event
          </button>
        </form>
      </div>

      <div className="text-center mb-6">
        <label className="mr-3 font-medium text-lg">Filter by Semester:</label>
        <select
          className="p-2 rounded border border-gray-300"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          {semesterOptions.map((semester) => (
            <option key={semester} value={semester}>{semester}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading calendar...</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <Section key={category} title={label} items={groupedByCategory[category] || []} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
