import React, { useEffect, useState } from 'react';
import Navbar from './ScheduleDashboard';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

function ExamAssignmentSchedule() {
  const [selectedTab, setSelectedTab] = useState('exams');
  const [examEvents, setExamEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [examForm, setExamForm] = useState({
    subject: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    room: '',
    semester: '',
    course: '',
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    due_date: '',
    details_url: '',
    semester: '',
    course: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [exams, assignmentRows] = await Promise.all([
        fetchTableRows('exam_events', { orderBy: 'exam_date', orderConfig: { ascending: true } }),
        fetchTableRows('assignment_items', { orderBy: 'due_date', orderConfig: { ascending: true } }),
      ]);

      setExamEvents(exams || []);
      setAssignments(assignmentRows || []);
    } catch (err) {
      setError(err.message || 'Failed to load schedule data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExamChange = (event) => {
    const { name, value } = event.target;
    setExamForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;
    setAssignmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitExam = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('exam_events', examForm);
      setExamForm({ subject: '', exam_date: '', start_time: '', end_time: '', room: '', semester: '', course: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not create exam event.');
    }
  };

  const submitAssignment = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('assignment_items', assignmentForm);
      setAssignmentForm({ title: '', due_date: '', details_url: '', semester: '', course: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not create assignment.');
    }
  };

  return (
    <div>
      <Navbar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <h2 className="text-2xl font-semibold mb-4">Exam & Assignment Schedule</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setSelectedTab('exams')}
          className={`py-2 px-4 ${selectedTab === 'exams' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Upcoming Exams
        </button>
        <button
          onClick={() => setSelectedTab('assignments')}
          className={`py-2 px-4 ${selectedTab === 'assignments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Assignments
        </button>
      </div>

      {selectedTab === 'exams' && (
        <>
          <form onSubmit={submitExam} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input name="subject" value={examForm.subject} onChange={handleExamChange} placeholder="Subject" required className="border p-2 rounded" />
            <input type="date" name="exam_date" value={examForm.exam_date} onChange={handleExamChange} required className="border p-2 rounded" />
            <input type="time" name="start_time" value={examForm.start_time} onChange={handleExamChange} className="border p-2 rounded" />
            <input type="time" name="end_time" value={examForm.end_time} onChange={handleExamChange} className="border p-2 rounded" />
            <input name="room" value={examForm.room} onChange={handleExamChange} placeholder="Room" className="border p-2 rounded" />
            <input name="semester" value={examForm.semester} onChange={handleExamChange} placeholder="Semester" className="border p-2 rounded" />
            <input name="course" value={examForm.course} onChange={handleExamChange} placeholder="Course" className="border p-2 rounded" />
            <button type="submit" className="bg-blue-600 text-white rounded p-2">Add Exam</button>
          </form>

          {loading ? (
            <p className="text-gray-600">Loading exams...</p>
          ) : examEvents.length === 0 ? (
            <p className="text-gray-600">No upcoming exams found.</p>
          ) : (
            <div className="bg-white p-4 shadow rounded">
              <h3 className="text-xl font-medium mb-2">Upcoming Exams</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b p-2">Subject</th>
                    <th className="border-b p-2">Date</th>
                    <th className="border-b p-2">Start</th>
                    <th className="border-b p-2">End</th>
                    <th className="border-b p-2">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {examEvents.map((exam) => (
                    <tr key={exam.id}>
                      <td className="border-b p-2">{exam.subject}</td>
                      <td className="border-b p-2">{exam.exam_date}</td>
                      <td className="border-b p-2">{exam.start_time || '--'}</td>
                      <td className="border-b p-2">{exam.end_time || '--'}</td>
                      <td className="border-b p-2">{exam.room || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedTab === 'assignments' && (
        <>
          <form onSubmit={submitAssignment} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input name="title" value={assignmentForm.title} onChange={handleAssignmentChange} placeholder="Title" required className="border p-2 rounded" />
            <input type="date" name="due_date" value={assignmentForm.due_date} onChange={handleAssignmentChange} required className="border p-2 rounded" />
            <input name="details_url" value={assignmentForm.details_url} onChange={handleAssignmentChange} placeholder="Details URL" className="border p-2 rounded" />
            <input name="semester" value={assignmentForm.semester} onChange={handleAssignmentChange} placeholder="Semester" className="border p-2 rounded" />
            <input name="course" value={assignmentForm.course} onChange={handleAssignmentChange} placeholder="Course" className="border p-2 rounded" />
            <button type="submit" className="bg-blue-600 text-white rounded p-2">Add Assignment</button>
          </form>

          {loading ? (
            <p className="text-gray-600">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-600">No assignments found.</p>
          ) : (
            <div className="bg-white p-4 shadow rounded">
              <h3 className="text-xl font-medium mb-2">Assignments</h3>
              <ul>
                {assignments.map((assignment) => (
                  <li key={assignment.id} className="flex justify-between py-2 border-b">
                    <span>{assignment.title}</span>
                    <span>Due: {assignment.due_date}</span>
                    <a href={assignment.details_url || '#'} className="text-blue-500 underline">
                      Details
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExamAssignmentSchedule;
