import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Report() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call your Express backend!
        const response = await fetch(`http://localhost:5000/api/profile/${username}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch profile');
        }

        // The backend wraps the payload in "data" (from Day 4 caching logic)
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Analyzing GitHub Data...</h2>;
  if (error) return <h2 style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>Error: {error}</h2>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <Link to="/">← Back to Search</Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
        <img src={data.avatarUrl} alt="Avatar" style={{ width: '100px', borderRadius: '50%' }} />
        <div>
          <h1 style={{ margin: 0 }}>{data.name || data.username}</h1>
          <p style={{ margin: '5px 0', color: '#555' }}>{data.bio}</p>
          <p style={{ margin: 0 }}>Followers: {data.followers} | Public Repos: {data.publicRepos}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
        <h2>Overall Score: {data.scores.overall} / 100</h2>
        <hr />
        <ul style={{ listStyleType: 'none', padding: 0, fontSize: '18px' }}>
          <li>📈 Activity: {data.scores.activity} / 25</li>
          <li>💻 Code Quality: {data.scores.codeQuality} / 20</li>
          <li>🌐 Diversity: {data.scores.diversity} / 20</li>
          <li>🤝 Community: {data.scores.community} / 20</li>
          <li>🎯 Hiring Ready: {data.scores.hiringReady} / 15</li>
        </ul>
      </div>
    </div>
  );
}