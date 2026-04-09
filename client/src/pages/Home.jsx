import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Load recent searches on mount
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
      
      const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE_URL}/api/profile/${username}`);
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      // Save successful search
      const updatedSearches = [username, ...recentSearches.filter(user => user !== username)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('github_recent_searches', JSON.stringify(updatedSearches));

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
    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
      
      {/* Sleek Hero Header */}
      <h1 style={{ fontSize: '2.8rem', color: 'var(--text-main)', marginBottom: '10px', fontWeight: '800', letterSpacing: '-0.5px' }}>
        Analyze Any Developer
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px' }}>
        Generate a comprehensive, data-driven portfolio scorecard in seconds.
      </p>
      
      {/* The Main Search Box (Now inside a sleek card!) */}
      <div className="dashboard-card">
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            className="modern-input"
            placeholder="e.g., torvalds" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.2rem', padding: '16px' }}
          />
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !username.trim()}
            style={{ 
              padding: '16px', 
              fontSize: '1.1rem', 
              width: '100%',
              backgroundColor: loading ? 'var(--border)' : 'var(--primary)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Evaluating Profile...' : 'Generate Scorecard'}
          </button>
        </form>
      </div>

      {/* Modern Error Display */}
      {error && (
        <div style={{ 
          marginTop: '20px', padding: '16px', backgroundColor: '#fee2e2', 
          color: '#b91c1c', borderRadius: '8px', border: '1px solid #f87171', fontWeight: '500' 
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Upgraded Recent Searches UI */}
      {recentSearches.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Recent Searches
            </h3>
            <button type="button" onClick={clearHistory} style={{ 
              background: 'none', border: 'none', color: 'var(--primary)', 
              cursor: 'pointer', fontSize: '0.85em', textDecoration: 'underline' 
            }}>
              Clear
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {recentSearches.map((user, index) => (
              <Link 
                key={index} 
                to={`/report/${user}`}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '20px', 
                  textDecoration: 'none', 
                  color: 'var(--primary)',
                  fontSize: '0.95em',
                  fontWeight: '500',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {user}
              </Link>
            ))}
          </div>
        </div>
      )}
    
    </div>
  );
}