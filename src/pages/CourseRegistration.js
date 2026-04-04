import React, { useEffect, useMemo, useState } from 'react';
import { fetchTableRows, insertRow } from '../services/supabaseMvpApi';

const CourseRegistration = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    title: '',
    department: '',
    faculty: '',
    availability: 'Available',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [courseRows, registrationRows] = await Promise.all([
        fetchTableRows('courses', { orderBy: 'title', orderConfig: { ascending: true } }),
        fetchTableRows('course_registrations', { orderBy: 'registered_at', orderConfig: { ascending: false } }),
      ]);

      setCourses(courseRows || []);
      setRegistrations(registrationRows || []);
    } catch (err) {
      setError(err.message || 'Failed to load registration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departmentOptions = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.department))).filter(Boolean);
  }, [courses]);

  const facultyOptions = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.faculty))).filter(Boolean);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const departmentOk = !selectedDepartment || course.department === selectedDepartment;
      const facultyOk = !selectedFaculty || course.faculty === selectedFaculty;
      const availabilityOk = !selectedAvailability || course.availability === selectedAvailability;
      return departmentOk && facultyOk && availabilityOk;
    });
  }, [courses, selectedDepartment, selectedFaculty, selectedAvailability]);

  const registeredCourseIds = useMemo(() => {
    return new Set(registrations.map((registration) => registration.course_id));
  }, [registrations]);

  const handleCourseSelection = (course) => {
    setSelectedCourses((prev) =>
      prev.find((item) => item.id === course.id)
        ? prev.filter((item) => item.id !== course.id)
        : [...prev, course]
    );
  };

  const handleCourseFormChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await insertRow('courses', courseForm);
      setCourseForm({ title: '', department: '', faculty: '', availability: 'Available' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not create course.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await Promise.all(
        selectedCourses.map((course) =>
          insertRow('course_registrations', {
            course_id: course.id,
          })
        )
      );

      setSelectedCourses([]);
      await loadData();
      alert('Selected courses registered successfully.');
    } catch (err) {
      setError(err.message || 'Could not register selected courses.');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-200 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6">Course Registration</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <select
          className="p-2 border rounded-lg shadow-sm w-full md:w-1/3 transition duration-200 ease-in-out hover:shadow-lg"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded-lg shadow-sm w-full md:w-1/3 transition duration-200 ease-in-out hover:shadow-lg"
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
        >
          <option value="">All Faculty</option>
          {facultyOptions.map((faculty) => (
            <option key={faculty} value={faculty}>{faculty}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded-lg shadow-sm w-full md:w-1/3 transition duration-200 ease-in-out hover:shadow-lg"
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
        >
          <option value="">All Availability</option>
          <option value="Available">Available</option>
          <option value="Full">Full</option>
        </select>
      </div>

      <form onSubmit={handleCreateCourse} className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          name="title"
          value={courseForm.title}
          onChange={handleCourseFormChange}
          placeholder="Course title"
          required
          className="border p-2 rounded"
        />
        <input
          name="department"
          value={courseForm.department}
          onChange={handleCourseFormChange}
          placeholder="Department"
          required
          className="border p-2 rounded"
        />
        <input
          name="faculty"
          value={courseForm.faculty}
          onChange={handleCourseFormChange}
          placeholder="Faculty"
          required
          className="border p-2 rounded"
        />
        <select
          name="availability"
          value={courseForm.availability}
          onChange={handleCourseFormChange}
          className="border p-2 rounded"
        >
          <option value="Available">Available</option>
          <option value="Full">Full</option>
        </select>
        <button type="submit" className="md:col-span-4 bg-blue-700 text-white py-2 rounded hover:bg-blue-800">
          Add Course
        </button>
      </form>

      {loading ? (
        <p className="text-gray-600">Loading courses...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const selected = selectedCourses.some((item) => item.id === course.id);
            const alreadyRegistered = registeredCourseIds.has(course.id);

            return (
              <div
                key={course.id}
                className={`p-4 border rounded-lg shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105 ${selected ? 'bg-blue-200' : 'bg-white'}`}
                onClick={() => !alreadyRegistered && handleCourseSelection(course)}
              >
                <h2 className="text-xl font-bold">{course.title}</h2>
                <p className="text-gray-700">Department: {course.department}</p>
                <p className="text-gray-700">Faculty: {course.faculty}</p>
                <p className="text-gray-700">Availability: {course.availability}</p>
                {alreadyRegistered && <p className="text-green-700 mt-2 font-semibold">Already Registered</p>}
              </div>
            );
          })}

          {filteredCourses.length === 0 && <p className="text-gray-600">No courses found for selected filters.</p>}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selectedCourses.length === 0}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ease-in-out disabled:opacity-60"
      >
        Register Selected Courses
      </button>
    </div>
  );
};

export default CourseRegistration;
