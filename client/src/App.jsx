import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Home from './pages/Home';
import Report from './pages/Report';
import Compare from './pages/Compare';

function App() {
  const [isDark, setIsDark] = useState(false);

  // Check local storage when the app first loads
  useEffect(() => {
    const savedTheme = localStorage.getItem('github_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Function to flip the theme
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('github_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('github_theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <Router>
      
      {/* Global Toaster Notification Container */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
          }
        }} 
      />

      {/* 🚀 THE PROFESSIONAL NAVBAR */}
      {/* Notice how it is INSIDE the Router, but OUTSIDE the Routes! */}
      <nav style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-color, #e5e7eb)',
        padding: '15px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Logo/Brand */}
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🚀 Developer Portfolio Evaluator
        </h2>

        {/* Navigation Links & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Search</Link>
          <Link to="/compare" style={{ textDecoration: 'none', color: 'var(--primary-color, #2563eb)', fontWeight: '600' }}>Compare Users</Link>
          
          {/* Integrated Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{ 
              padding: '6px 12px', 
              cursor: 'pointer', 
              borderRadius: '20px', 
              border: '1px solid var(--border-color, #e5e7eb)', 
              backgroundColor: 'transparent', 
              color: 'var(--text-main)',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </nav>

      {/* The Page Content */}
      <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/:username" element={<Report />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;