import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function Compare() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE_URL}/api/profile/compare?u1=${user1}&u2=${user2}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format data for Recharts
  const radarData = data ? [
    { subject: 'Activity', A: data.user1.scores.activity, B: data.user2.scores.activity },
    { subject: 'Code Quality', A: data.user1.scores.codeQuality, B: data.user2.scores.codeQuality },
    { subject: 'Diversity', A: data.user1.scores.diversity, B: data.user2.scores.diversity },
    { subject: 'Community', A: data.user1.scores.community, B: data.user2.scores.community },
    { subject: 'Hiring Ready', A: data.user1.scores.hiringReady, B: data.user2.scores.hiringReady },
  ] : [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* 1. The Search Card */}
      <div className="dashboard-card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Compare Developers</h2>
        
        <form onSubmit={handleCompare} style={{ 
          display: 'flex', gap: '20px', flexWrap: 'wrap', 
          justifyContent: 'center', alignItems: 'center' 
        }}>
          <div style={{ flex: '1 1 250px' }}>
            <input className="modern-input" type="text" placeholder="Username 1" value={user1} onChange={(e) => setUser1(e.target.value)} required />
          </div>
          
          <span style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--text-muted)' }}>VS</span>
          
          <div style={{ flex: '1 1 250px' }}>
            <input className="modern-input" type="text" placeholder="Username 2" value={user2} onChange={(e) => setUser2(e.target.value)} required />
          </div>
          
          <button type="submit" disabled={loading} style={{ 
            backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', 
            borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
            flex: '1 1 100%', maxWidth: '200px'
          }}>
            {loading ? 'Analyzing...' : 'Compare'}
          </button>
        </form>
      </div>

      {/* 2. Modern Error Display */}
      {error && (
        <div style={{ 
          marginTop: '20px', padding: '16px', backgroundColor: '#fee2e2', 
          color: '#b91c1c', borderRadius: '8px', border: '1px solid #f87171', fontWeight: '500' 
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 3. The Results (Only shows if data exists) */}
      {data && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Radar Chart Card */}
          <div className="dashboard-card">
            <h3 style={{ marginTop: 0, color: 'var(--text-main)', textAlign: 'center' }}>Performance Overlay</h3>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 25]} tick={{ fill: 'var(--text-muted)' }} />
                  
                  {/* User 1 uses your Primary blue color */}
                  <Radar name={data.user1.username} dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                  
                  {/* User 2 uses an Amber/Gold color for contrast */}
                  <Radar name={data.user2.username} dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                  
                  {/* Tooltip styled to match dark/light mode */}
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winner Highlight Table Card */}
          <div className="dashboard-card" style={{ overflowX: 'auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-main)', textAlign: 'center', marginBottom: '20px' }}>Category Winners</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>{data.user1.username}</th>
                  <th style={{ padding: '12px' }}>{data.user2.username}</th>
                </tr>
              </thead>
              <tbody>
                {radarData.map((row) => (
                  <tr key={row.subject} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{row.subject}</td>
                    
                    {/* Highlight User 1 if they win */}
                    <td style={{ 
                      padding: '12px', 
                      color: row.A > row.B ? 'var(--success-color, #10b981)' : 'inherit', 
                      fontWeight: row.A > row.B ? 'bold' : 'normal' 
                    }}>
                      {row.A} {row.A > row.B && '🏆'}
                    </td>

                    {/* Highlight User 2 if they win */}
                    <td style={{ 
                      padding: '12px', 
                      color: row.B > row.A ? 'var(--success-color, #10b981)' : 'inherit', 
                      fontWeight: row.B > row.A ? 'bold' : 'normal' 
                    }}>
                      {row.B} {row.B > row.A && '🏆'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}