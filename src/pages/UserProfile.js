import React, { useState } from 'react';
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
import { mockUserDetails, mockUserSummary } from '../mocks/userData';

const UserProfile = () => {
  const [editable, setEditable] = useState(false);
  const [profile, setProfile] = useState(mockUserSummary);
  const userDetails = mockUserDetails;

  const handleEditToggle = () => setEditable(!editable);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-6 bg-gradient-to-r from-green-200 to-blue-200 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">User Profile</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-700">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(profile).slice(0, 5).map(([key, value]) => (
            <div key={key}>
              <label className="block font-medium text-gray-600 mb-2">
                {key.replace(/([A-Z])/g, ' $1').toUpperCase()}:
              </label>
              <input
                type={key === 'email' ? 'email' : 'text'}
                name={key}
                value={value}
                disabled={!editable}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm mt-1 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              />
            </div>
          ))}
          <div>
            <label className="block font-medium text-gray-600 mb-2">Course</label>
            <input
              type="text"
              name="course"
              value={userDetails.course}
              disabled
              className="w-full p-3 border rounded-lg shadow-sm mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={handleEditToggle}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
        >
          {editable ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-700">Skills</h2>
        <ul className="list-disc pl-6">
          {userDetails.skills.map((skill, index) => (
            <li key={index} className="text-gray-600">
              <span className="font-semibold">{skill.name}:</span> {skill.level}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-700">Certificates</h2>
        <ul className="list-disc pl-6">
          {userDetails.certificates.map((certificate, index) => (
            <li key={index} className="text-gray-600">{certificate}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-700">Parent Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-600 mb-2">Parent's Name:</label>
            <input
              type="text"
              value={userDetails.parentsName}
              readOnly
              className="w-full p-3 border rounded-lg shadow-sm mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600 mb-2">Parent's Phone:</label>
            <input
              type="text"
              value={userDetails.parentsPhone}
              readOnly
              className="w-full p-3 border rounded-lg shadow-sm mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium text-gray-600 mb-2">Parent's WhatsApp:</label>
            <input
              type="text"
              value={userDetails.whatsappNo}
              readOnly
              className="w-full p-3 border rounded-lg shadow-sm mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Academic Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userDetails.academicHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semester" />
              <YAxis domain={[3.0, 4.0]} />
              <Tooltip />
              <Line type="monotone" dataKey="GPA" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Enrolled Course Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDetails.courseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDetails.courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
