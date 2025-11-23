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
    <nav className="navbar">
      <Link to="/" className="logo">
        RecruitPro
      </Link>
      <ul>
        {user ? (
          <>
            {user.role === 'candidate' && (
              <>
                <li><Link to="/candidate">Dashboard</Link></li>
                <li><Link to="/jobs">Jobs</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </>
            )}
            {user.role === 'company' && (
              <>
                <li><Link to="/company">Dashboard</Link></li>
                <li><Link to="/company/jobs">My Jobs</Link></li>
                <li><Link to="/company/applications">Applications</Link></li>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <li><Link to="/admin">Admin</Link></li>
              </>
            )}
            <li><span>Welcome, {user.name}</span></li>
            <li><button onClick={handleLogout} className="btn btn-danger">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
        <li>
          <button
            onClick={toggleDarkMode}
            className="btn btn-primary"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </li>
      </ul>
    </nav>
  );
}
