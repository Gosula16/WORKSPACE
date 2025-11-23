import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = localStorage.getItem('theme');
    if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const body = document.body;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      html.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 bg-white dark:bg-gray-900 shadow-md z-50 transition-all duration-500">
      <Link to="/" className="text-xl font-semibold text-blue-600 dark:text-blue-400 transition-colors flex-shrink-0">
        RecruitPro
      </Link>
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-wrap justify-end">
        {user ? (
          <>
            {user.role === 'candidate' && (
              <>
                <Link to="/candidate" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Dashboard</Link>
                <Link to="/jobs" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Jobs</Link>
                <Link to="/profile" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Profile</Link>
              </>
            )}
            {user.role === 'company' && (
              <>
                <Link to="/company" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Dashboard</Link>
                <Link to="/company/jobs" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">My Jobs</Link>
                <Link to="/company/applications" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Applications</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Admin</Link>
              </>
            )}
            <span className="text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap hidden sm:inline">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-300 text-sm whitespace-nowrap">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Login</Link>
            <Link to="/register" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors whitespace-nowrap">Register</Link>
          </>
        )}
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex-shrink-0"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
