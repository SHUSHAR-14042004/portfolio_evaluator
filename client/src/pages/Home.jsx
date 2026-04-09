import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';


export default function Home() {
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  
  // ✅ FIX: Added the missing loading and error states!
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // 1. Load recent searches from local storage when the page loads
  useEffect(() => {
    const savedSearches = localStorage.getItem('github_recent_searches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // PRODUCTION CHECK: Uses localhost in dev, and relative path in production
      const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE_URL}/api/profile/${username}`);
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      // ✅ Added logic to save successful searches to your history!
      const updatedSearches = [username, ...recentSearches.filter(user => user !== username)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('github_recent_searches', JSON.stringify(updatedSearches));

      // If successful, navigate to the report page
      navigate(`/report/${username}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('github_recent_searches');
    setRecentSearches([]);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ fontSize: '2.5em', color: 'var(--text-main)', marginBottom: '10px' }}>GitHub Portfolio Evaluator</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2em', marginBottom: '40px' }}>Enter a GitHub username to generate a comprehensive scorecard.</p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="e.g., torvalds" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '12px 20px', fontSize: '16px', width: '300px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={loading || !username.trim()}
          style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: loading ? 'var(--border)' : '#0366d6', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Evaluating...' : 'Evaluate'}
        </button>
      </form>

      {/* ✅ Added Error Display UI */}
      {error && (
        <div style={{ maxWidth: '400px', margin: '0 auto 40px auto', padding: '15px', backgroundColor: '#ffeef0', color: '#d73a49', borderRadius: '8px', border: '1px solid #ffdce0' }}>
          {error}
        </div>
      )}

      {/* Recent Searches UI */}
      {recentSearches.length > 0 && (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1em' }}>🕒 Recent Searches</h3>
            <button type="button" onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#d73a49', cursor: 'pointer', fontSize: '0.85em' }}>Clear</button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {recentSearches.map((user, index) => (
              <Link 
                key={index} 
                to={`/report/${user}`}
                style={{ 
                  padding: '6px 12px', 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '15px', 
                  textDecoration: 'none', 
                  color: '#0366d6',
                  fontSize: '0.9em',
                  transition: 'background-color 0.2s'
                }}
              >
                {user}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
  <Link to="/compare" style={{ textDecoration: 'none', color: '#0366d6', fontWeight: 'bold' }}>
    ✨ Try Compare Mode (Bonus)
  </Link>
</div>
    </div>
  );
}