import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';

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
      {/* Floating Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          padding: '8px 16px', 
          cursor: 'pointer', 
          borderRadius: '20px', 
          border: '1px solid var(--border)', 
          backgroundColor: 'var(--bg-card)', 
          color: 'var(--text-main)',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report/:username" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;