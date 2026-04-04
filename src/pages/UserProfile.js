import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/authContext/authContext';

const DEFAULT_SKILLS = [];
const DEFAULT_CERTIFICATES = [];
const DEFAULT_ACADEMIC_HISTORY = [];
const DEFAULT_COURSE_DISTRIBUTION = [];

const UserProfile = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    full_name: '',
    student_id: '',
    email: '',
    phone: '',
    address: '',
    course: '',
    parent_name: '',
    parent_phone: '',
    parent_whatsapp: '',
  });

  useEffect(() => {
    setFormState({
      full_name: profile?.full_name || '',
      student_id: profile?.student_id || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      course: profile?.course || '',
      parent_name: profile?.parent_name || '',
      parent_phone: profile?.parent_phone || '',
      parent_whatsapp: profile?.parent_whatsapp || '',
    });
  }, [profile, user]);

  const skills = useMemo(() => {
    const value = profile?.skills;
    return Array.isArray(value) ? value : DEFAULT_SKILLS;
  }, [profile]);

  const certificates = useMemo(() => {
    const value = profile?.certificates;
    return Array.isArray(value) ? value : DEFAULT_CERTIFICATES;
  }, [profile]);

  const academicHistory = useMemo(() => {
    const value = profile?.academic_history;
    return Array.isArray(value) ? value : DEFAULT_ACADEMIC_HISTORY;
  }, [profile]);

  const courseDistribution = useMemo(() => {
    const value = profile?.course_distribution;
    return Array.isArray(value) ? value : DEFAULT_COURSE_DISTRIBUTION;
  }, [profile]);

  const handleEditToggle = async () => {
    if (!editable) {
      setEditable(true);
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formState);
      await refreshProfile();
      setEditable(false);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-r from-green-200 to-blue-200 min-h-screen">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">User Profile</h1>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-700">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['full_name', 'Full Name'],
            ['student_id', 'Student ID'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['address', 'Address'],
            ['course', 'Course'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block font-medium text-gray-600 mb-2">{label}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formState[field]}
                disabled={!editable || field === 'email'}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm mt-1 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleEditToggle}
          disabled={saving}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? 'Saving...' : editable ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-700">Skills</h2>
        {skills.length === 0 ? (
          <p className="text-gray-600">No skills added yet.</p>
        ) : (
          <ul className="list-disc pl-6">
            {skills.map((skill, index) => (
              <li key={index} className="text-gray-600">
                <span className="font-semibold">{skill.name}:</span> {skill.level}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-700">Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-gray-600">No certificates added yet.</p>
        ) : (
          <ul className="list-disc pl-6">
            {certificates.map((certificate, index) => (
              <li key={index} className="text-gray-600">{certificate}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-700">Parent Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['parent_name', "Parent's Name"],
            ['parent_phone', "Parent's Phone"],
            ['parent_whatsapp', "Parent's WhatsApp"],
          ].map(([field, label]) => (
            <div key={field} className={field === 'parent_whatsapp' ? 'md:col-span-2' : ''}>
              <label className="block font-medium text-gray-600 mb-2">{label}</label>
              <input
                type="text"
                name={field}
                value={formState[field]}
                readOnly={!editable}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg shadow-sm mt-1 ${!editable ? 'bg-gray-100' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Academic Performance</h2>
          {academicHistory.length === 0 ? (
            <p className="text-gray-600">No academic history available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={academicHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Line type="monotone" dataKey="GPA" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Enrolled Course Distribution</h2>
          {courseDistribution.length === 0 ? (
            <p className="text-gray-600">No course distribution data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
