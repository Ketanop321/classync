import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { fetchTableRows, upsertRow } from '../services/supabaseMvpApi';
import { useAuth } from '../context/authContext/authContext';

function AcademicPerformance() {
  const { profile } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    semester: '',
    subject: '',
    assignments: '',
    midterm: '',
    final: '',
  });

  const loadRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchTableRows('marks_records', {
        orderBy: 'semester',
        orderConfig: { ascending: true },
      });
      setRecords(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load marks data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const semesters = useMemo(() => {
    const unique = Array.from(new Set(records.map((row) => row.semester))).filter(Boolean);
    return ['All', ...unique];
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (selectedSemester === 'All') {
      return records;
    }
    return records.filter((row) => row.semester === selectedSemester);
  }, [records, selectedSemester]);

  const performanceTrend = useMemo(() => {
    const grouped = records.reduce((acc, row) => {
      if (!acc[row.semester]) {
        acc[row.semester] = [];
      }
      acc[row.semester].push(Number(row.total || 0));
      return acc;
    }, {});

    return Object.entries(grouped).map(([semester, totals]) => {
      const avg = totals.reduce((sum, value) => sum + value, 0) / Math.max(totals.length, 1);
      const gpa = Math.min(4, Number((avg / 25).toFixed(2)));
      return { semester, gpa };
    });
  }, [records]);

  const overall = useMemo(() => {
    const totalMax = filteredRecords.length * 100;
    const obtained = filteredRecords.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const percentage = totalMax > 0 ? (obtained / totalMax) * 100 : 0;

    return {
      totalMax,
      obtained,
      percentage: Number(percentage.toFixed(2)),
      grade:
        percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D',
    };
  }, [filteredRecords]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async (event) => {
    event.preventDefault();

    const assignments = Number(formState.assignments || 0);
    const midterm = Number(formState.midterm || 0);
    const final = Number(formState.final || 0);
    const total = Number((assignments + midterm + final).toFixed(2));

    try {
      await upsertRow(
        'marks_records',
        {
          semester: formState.semester,
          subject: formState.subject,
          assignments,
          midterm,
          final,
          total,
        },
        'user_id,semester,subject'
      );

      setFormState({ semester: '', subject: '', assignments: '', midterm: '', final: '' });
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Could not save record.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 md:p-6">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-4 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mb-6 shadow-lg"
      >
        <h1 className="text-xl md:text-2xl font-bold">Marks & Academic Performance</h1>
      </motion.header>

      <div className="max-w-5xl mx-auto space-y-6">
        {error && <p className="text-red-600">{error}</p>}

        <motion.section className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Student Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm md:text-base">
            <p><span className="font-medium">Name:</span> {profile?.full_name || 'Not set'}</p>
            <p><span className="font-medium">Student ID:</span> {profile?.student_id || 'Not set'}</p>
            <p><span className="font-medium">Class:</span> {profile?.course || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {profile?.email || 'Not set'}</p>
          </div>
        </motion.section>

        <motion.section className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Add or Update Subject Marks</h2>
          <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              name="semester"
              placeholder="Semester"
              value={formState.semester}
              onChange={handleFormChange}
              required
              className="p-2 border rounded"
            />
            <input
              name="subject"
              placeholder="Subject"
              value={formState.subject}
              onChange={handleFormChange}
              required
              className="p-2 border rounded"
            />
            <input
              name="assignments"
              type="number"
              placeholder="Assignments"
              value={formState.assignments}
              onChange={handleFormChange}
              required
              className="p-2 border rounded"
            />
            <input
              name="midterm"
              type="number"
              placeholder="Midterm"
              value={formState.midterm}
              onChange={handleFormChange}
              required
              className="p-2 border rounded"
            />
            <input
              name="final"
              type="number"
              placeholder="Final"
              value={formState.final}
              onChange={handleFormChange}
              required
              className="p-2 border rounded"
            />
            <button type="submit" className="md:col-span-5 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Save Record
            </button>
          </form>
        </motion.section>

        <motion.section className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Subject Marks</h2>
          <div className="mb-4">
            <label htmlFor="semester" className="mr-2">Select Semester:</label>
            <select
              id="semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="p-2 border rounded w-full md:w-auto"
            >
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p>Loading marks...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-gray-600">No marks found for selected semester.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse text-sm md:text-base">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="p-2 md:p-3 border">Subject</th>
                    <th className="p-2 md:p-3 border">Assignments (30)</th>
                    <th className="p-2 md:p-3 border">Midterm (40)</th>
                    <th className="p-2 md:p-3 border">Final (30)</th>
                    <th className="p-2 md:p-3 border">Total (100)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((subject) => (
                    <tr key={`${subject.semester}-${subject.subject}`}>
                      <td className="p-2 md:p-3 border">{subject.subject}</td>
                      <td className="p-2 md:p-3 border">{subject.assignments}</td>
                      <td className="p-2 md:p-3 border">{subject.midterm}</td>
                      <td className="p-2 md:p-3 border">{subject.final}</td>
                      <td className="p-2 md:p-3 border">{subject.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        <motion.section className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Performance Trend</h2>
          {performanceTrend.length === 0 ? (
            <p className="text-gray-600">Add marks to see GPA trend.</p>
          ) : (
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semester" />
                  <YAxis domain={[0, 4]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gpa" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>

        <motion.section className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Overall Performance</h2>
          <div className="text-sm md:text-lg">
            <p><span className="font-medium">Total Marks:</span> {overall.totalMax}</p>
            <p><span className="font-medium">Marks Obtained:</span> {overall.obtained}</p>
            <p><span className="font-medium">Percentage:</span> {overall.percentage}%</p>
            <p><span className="font-medium">Grade:</span> {overall.grade}</p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default AcademicPerformance;
