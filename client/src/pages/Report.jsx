import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

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
        
        const response = await fetch(`http://localhost:5000/api/profile/${username}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch profile');
        }

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

  // Format data specifically for the Radar Chart
  // We calculate a percentage (out of 100) for each category to make the chart balanced
  const chartData = [
    { subject: 'Activity', score: (data.scores.activity / 25) * 100, fullMark: 100 },
    { subject: 'Code Quality', score: (data.scores.codeQuality / 20) * 100, fullMark: 100 },
    { subject: 'Diversity', score: (data.scores.diversity / 20) * 100, fullMark: 100 },
    { subject: 'Community', score: (data.scores.community / 20) * 100, fullMark: 100 },
    { subject: 'Hiring Ready', score: (data.scores.hiringReady / 15) * 100, fullMark: 100 },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#0366d6', fontWeight: 'bold' }}>← Back to Search</Link>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px', paddingBottom: '20px', borderBottom: '1px solid #eaecef' }}>
        <img src={data.avatarUrl} alt="Avatar" style={{ width: '120px', borderRadius: '50%', border: '4px solid #f4f4f4' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '2em' }}>{data.name || data.username}</h1>
          <p style={{ margin: '8px 0', color: '#586069', fontSize: '1.1em' }}>{data.bio}</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <span style={{ backgroundColor: '#f1f8ff', color: '#0366d6', padding: '5px 10px', borderRadius: '12px', fontSize: '0.9em', fontWeight: 'bold' }}>
              👥 {data.followers} Followers
            </span>
            <span style={{ backgroundColor: '#f1f8ff', color: '#0366d6', padding: '5px 10px', borderRadius: '12px', fontSize: '0.9em', fontWeight: 'bold' }}>
              📦 {data.publicRepos} Repos
            </span>
          </div>
        </div>
      </div>

      {/* Scorecard & Chart Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '30px', gap: '20px' }}>
        
        {/* Left Column: Number Breakdown */}
        <div style={{ flex: '1 1 300px', padding: '25px', backgroundColor: '#f6f8fa', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, fontSize: '2.5em', color: '#24292e', textAlign: 'center' }}>
            {data.scores.overall} <span style={{ fontSize: '0.4em', color: '#6a737d' }}>/ 100</span>
          </h2>
          <p style={{ textAlign: 'center', color: '#586069', fontWeight: 'bold', marginBottom: '20px' }}>OVERALL SCORE</p>
          <hr style={{ border: 'none', borderTop: '1px solid #eaecef', marginBottom: '20px' }} />
          
          <ul style={{ listStyleType: 'none', padding: 0, fontSize: '1.1em', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>📈 Activity</span> <strong>{data.scores.activity}/25</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>💻 Code Quality</span> <strong>{data.scores.codeQuality}/20</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🌐 Diversity</span> <strong>{data.scores.diversity}/20</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🤝 Community</span> <strong>{data.scores.community}/20</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🎯 Hiring Ready</span> <strong>{data.scores.hiringReady}/15</strong></li>
          </ul>
        </div>

        {/* Right Column: Radar Chart */}
        <div style={{ flex: '1 1 400px', height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e1e4e8" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#586069', fontSize: 14 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="score" stroke="#0366d6" fill="#0366d6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>
      {/* Top Repositories Section */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ color: '#24292e', borderBottom: '2px solid #eaecef', paddingBottom: '10px' }}>
          Top Repositories
        </h2>
        
        {data.topRepos && data.topRepos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {data.topRepos.map((repo, index) => (
              <a 
                key={index} 
                href={repo.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e1e4e8', borderRadius: '6px', height: '100%', transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#0366d6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📦 {repo.name}
                  </h3>
                  <p style={{ color: '#586069', fontSize: '0.9em', marginBottom: '15px', lineHeight: '1.4' }}>
                    {repo.description.length > 100 ? repo.description.substring(0, 100) + '...' : repo.description}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.85em', color: '#586069' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: '#f1e05a', borderRadius: '50%' }}></span>
                      {repo.language}
                    </span>
                    <span>⭐ {repo.stars}</span>
                    <span>🍴 {repo.forks}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p style={{ color: '#586069' }}>No public repositories found.</p>
        )}
      </div>
    </div>
  );
}