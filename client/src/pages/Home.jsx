import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const [username, setUsername] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  // 1. Load recent searches from local storage when the page loads
  useEffect(() => {
    const savedSearches = localStorage.getItem('github_recent_searches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      const term = username.trim().toLowerCase();

      // 2. Update the recent searches array
      // Filter out the term if it already exists (so we don't get duplicates), 
      // put the new term at the front, and only keep the top 5.
      const updatedSearches = [term, ...recentSearches.filter(user => user !== term)].slice(0, 5);
      
      // 3. Save the new array back to local storage
      localStorage.setItem('github_recent_searches', JSON.stringify(updatedSearches));
      
      // Navigate to the report
      navigate(`/report/${term}`);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('github_recent_searches');
    setRecentSearches([]);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ fontSize: '2.5em', color: '#24292e', marginBottom: '10px' }}>GitHub Portfolio Evaluator</h1>
      <p style={{ color: '#586069', fontSize: '1.2em', marginBottom: '40px' }}>Enter a GitHub username to generate a comprehensive scorecard.</p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="e.g., torvalds" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '12px 20px', fontSize: '16px', width: '300px', borderRadius: '6px', border: '1px solid #e1e4e8', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#0366d6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Evaluate
        </button>
      </form>

      {/* Recent Searches UI */}
      {recentSearches.length > 0 && (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', backgroundColor: '#f6f8fa', padding: '20px', borderRadius: '8px', border: '1px solid #eaecef' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#24292e', fontSize: '1em' }}>🕒 Recent Searches</h3>
            <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#d73a49', cursor: 'pointer', fontSize: '0.85em' }}>Clear</button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {recentSearches.map((user, index) => (
              <Link 
                key={index} 
                to={`/report/${user}`}
                style={{ 
                  padding: '6px 12px', 
                  backgroundColor: '#fff', 
                  border: '1px solid #e1e4e8', 
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
    </div>
  );
}