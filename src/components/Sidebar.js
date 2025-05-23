import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faClipboardCheck,
  faGraduationCap,
  faWallet,
  faCalendarAlt,
  faBookOpen,
  faUser,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/authContext/authContext'; // 🔹 Importing AuthContext to access authentication state
import Logo from '../assets/logo/logo.png';
import Avatar from 'react-avatar';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth(); // 🔹 Accessing the logged-in user's data

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 z-10 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center mb-8">
          <img src={Logo} alt="Logo" className="rounded-full w-8 h-8 ml-1" />
          <h3 className="ml-2 text-xl font-semibold text-gray-800">ClassSync</h3>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul>
            <li className="mb-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/attendance"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
                <span>Attendance Management</span>
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/marks&academic"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                <span>Marks & Academic</span>
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/fees"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faWallet} className="mr-2" />
                <span>Fees Management</span>
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/ScheduleDashboard"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                <span>Schedules</span>
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/register-courses"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
                <span>Course Registration</span>
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/user-profile"
                className={({ isActive }) =>
                  `flex items-center px-4 ${isActive ? 'text-blue-500' : 'text-gray-600'}`
                }
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span>User Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Profile Footer Section */}
        <div className="absolute bottom-4 left-4 flex items-center">
          {/* 🔹 Avatar for user profile picture */}
          <div className="w-12 h-12 p-1 flex items-center justify-center">
            <Avatar
              name={currentUser?.name || "Guest"} // 🔹 Display user's name if available, otherwise "Guest"
              size="40"
              round={true}
            />
          </div>
          <div className="ml-2 max-w-[200px]">
            <p className="font-bold">{currentUser?.name || "Guest"}</p> {/* 🔹 Display user's name or "Guest" */}
            <p className="text-gray-600 text-sm">{currentUser?.email || "Not logged in"}</p> {/* 🔹 Display user's email or "Not logged in" */}
          </div>
        </div>
      </div>

      {/* Overlay for mobile view */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 p-4 overflow-auto">
        {/* Place your main content here */}
      </div>
      
      {/* Hamburger Button for mobile view */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 text-gray-600 lg:hidden"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="2x" />
      </button>
    </div>
  );
};

export default Sidebar;
