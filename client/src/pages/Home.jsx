import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Redirect to the report page for this user
      navigate(`/report/${username}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>GitHub Portfolio Evaluator</h1>
      <p>Enter a GitHub username to generate a scorecard.</p>
      
      <form onSubmit={handleSearch} style={{ marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="e.g., torvalds" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', width: '250px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
          Evaluate
        </button>
      </form>
    </div>
  );
}