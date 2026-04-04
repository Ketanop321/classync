import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#22C55E'];

const AttendanceRecord = () => {
  const [records, setRecords] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    date: '',
    subject: '',
    status: 'Present',
    semester: '',
  });

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchTableRows('attendance_records', {
        orderBy: 'date',
        orderConfig: { ascending: false },
      });
      setRecords(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const semesterOk = semesterFilter === 'All Semesters' || record.semester === semesterFilter;
      const monthOk =
        monthFilter === 'All Months' || new Date(record.date).getMonth() === Number(monthFilter);
      return semesterOk && monthOk;
    });
  }, [records, semesterFilter, monthFilter]);

  const attendanceSummary = useMemo(() => {
    const grouped = filteredRecords.reduce((acc, record) => {
      if (!acc[record.subject]) {
        acc[record.subject] = { totalClasses: 0, present: 0, absent: 0, leave: 0, late: 0 };
      }

      acc[record.subject].totalClasses += 1;
      if (record.status === 'Present') acc[record.subject].present += 1;
      if (record.status === 'Absent') acc[record.subject].absent += 1;
      if (record.status === 'Leave') acc[record.subject].leave += 1;
      if (record.status === 'Late') acc[record.subject].late += 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([subject, values]) => ({ subject, ...values }));
  }, [filteredRecords]);

  const groupedAttendanceDetails = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = { date: record.date, entries: [] };
      }
      acc[record.date].entries.push({ subject: record.subject, status: record.status });
      return acc;
    }, {});
  }, [filteredRecords]);

  const attendanceDetailArray = Object.values(groupedAttendanceDetails);

  const semesters = useMemo(() => {
    const unique = Array.from(new Set(records.map((record) => record.semester))).filter(Boolean);
    return ['All Semesters', ...unique];
  }, [records]);

  const chartData = [
    {
      name: 'Present',
      value: attendanceSummary.reduce((acc, curr) => acc + curr.present, 0),
    },
    {
      name: 'Absent',
      value: attendanceSummary.reduce((acc, curr) => acc + curr.absent, 0),
    },
    {
      name: 'Leave',
      value: attendanceSummary.reduce((acc, curr) => acc + curr.leave, 0),
    },
    {
      name: 'Late',
      value: attendanceSummary.reduce((acc, curr) => acc + curr.late, 0),
    },
  ];

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('attendance_records', {
        date: formState.date,
        subject: formState.subject,
        status: formState.status,
        semester: formState.semester,
      });
      setFormState({ date: '', subject: '', status: 'Present', semester: '' });
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Failed to save attendance record.');
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col gap-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add Attendance Record</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleFormChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formState.subject}
            onChange={handleFormChange}
            required
            className="border p-2 rounded"
          />
          <select
            name="status"
            value={formState.status}
            onChange={handleFormChange}
            className="border p-2 rounded"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
            <option value="Late">Late</option>
          </select>
          <input
            type="text"
            name="semester"
            placeholder="Semester"
            value={formState.semester}
            onChange={handleFormChange}
            required
            className="border p-2 rounded"
          />
          <button type="submit" className="md:col-span-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Save Attendance
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:space-x-4">
        <div className="flex-1 mb-4">
          <h2 className="text-xl font-semibold mb-4">Attendance Record</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}

          <div className="mb-4">
            <label htmlFor="semesterFilter" className="mr-2">Select Semester:</label>
            <select
              id="semesterFilter"
              className="border p-2 rounded"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="monthFilter" className="mr-2">Select Month:</label>
            <select
              id="monthFilter"
              className="border p-2 rounded"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="All Months">All Months</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {new Date(0, index).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading records...</p>
          ) : (
            <div className="space-y-2">
              {attendanceSummary.map(({ subject, totalClasses, present, absent, leave, late }) => (
                <div key={subject} className="border p-4 rounded-lg flex justify-between items-center">
                  <h3 className="text-lg font-bold">{subject}</h3>
                  <p className="text-sm md:text-base font-semibold text-right">
                    Total: {totalClasses}, Present: {present}, Absent: {absent}, Leave: {leave}, Late: {late}
                  </p>
                </div>
              ))}
              {attendanceSummary.length === 0 && <p className="text-gray-600">No records found.</p>}
            </div>
          )}
        </div>

        <div className="flex-1 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Attendance Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {attendanceDetailArray.length > 0 && (
        <div className="w-full mt-4">
          <h2 className="text-lg font-semibold mb-4">Detailed Attendance</h2>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Entries</th>
              </tr>
            </thead>
            <tbody>
              {attendanceDetailArray.map(({ date, entries }) => (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{date}</td>
                  <td className="border border-gray-300 p-2 space-y-1">
                    {entries.map((entry, idx) => (
                      <div key={`${entry.subject}-${idx}`} className="flex items-center gap-2">
                        <span>{entry.subject}</span>
                        <span className={entry.status === 'Present' ? 'text-green-600' : 'text-red-600'}>
                          {entry.status}
                        </span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecord;
