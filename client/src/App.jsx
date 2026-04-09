import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Home from './pages/Home';
import Report from './pages/Report';
import Compare from './pages/Compare';

// Main Layout Component (Handles Navbar, Footer, and full-screen spacing)
function MainLayout({ toggleTheme, isDark }) {
  const location = useLocation(); // Knows what page we are on

  // Helper for active button styles
  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    backgroundColor: location.pathname === path ? 'var(--primary)' : 'transparent',
    color: location.pathname === path ? '#ffffff' : 'var(--text-muted)'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* PROFESSIONAL NAVBAR */}
      <nav style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border)',
        padding: '15px 5%', /* 5% padding allows full width but keeps it off the very edges */
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--card-shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>
          Developer Portfolio Evaluator
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <Link to="/" style={navLinkStyle('/')}>Search</Link>
          <Link to="/compare" style={navLinkStyle('/compare')}>Compare Users</Link>
          
          <button onClick={toggleTheme} style={{ 
            padding: '8px 16px', cursor: 'pointer', borderRadius: '20px', 
            border: '1px solid var(--border)', backgroundColor: 'transparent', 
            color: 'var(--text-main)', fontWeight: 'bold'
          }}>
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </nav>

      {/* PAGE CONTENT (FULL SCREEN FLUID) */}
      <main style={{ flex: 1, padding: '40px 5%', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/:username" element={<Report />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer style={{
        padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)', color: 'var(--text-muted)', marginTop: 'auto'
      }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Developer Portfolio Evaluator. Built for the modern web.</p>
      </footer>

    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('github_theme') === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('github_theme', newTheme);
    setIsDark(!isDark);
  };

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' } }} />
      <MainLayout toggleTheme={toggleTheme} isDark={isDark} />
    </Router>
  );
}