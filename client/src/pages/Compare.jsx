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
    <div style={{ maxWidth: '800px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Compare Profiles</h2>
      
      {/* Side-by-Side Inputs */}
      <form onSubmit={handleCompare} style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <input type="text" placeholder="Username 1" value={user1} onChange={(e) => setUser1(e.target.value)} required />
        <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>VS</span>
        <input type="text" placeholder="Username 2" value={user2} onChange={(e) => setUser2(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Vs...' : 'Compare'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
          
          {/* Overlaid Radar Chart */}
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 25]} />
                <Radar name={data.user1.username} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name={data.user2.username} dataKey="B" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Winner Highlight Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th>Category</th>
                <th>{data.user1.username}</th>
                <th>{data.user2.username}</th>
              </tr>
            </thead>
            <tbody>
              {radarData.map((row) => (
                <tr key={row.subject} style={{ borderBottom: '1px solid #eee', height: '40px' }}>
                  <td><strong>{row.subject}</strong></td>
                  <td style={{ color: row.A > row.B ? '#2ea44f' : 'inherit', fontWeight: row.A > row.B ? 'bold' : 'normal' }}>
                    {row.A}
                  </td>
                  <td style={{ color: row.B > row.A ? '#2ea44f' : 'inherit', fontWeight: row.B > row.A ? 'bold' : 'normal' }}>
                    {row.B}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
      )}
    </div>
  );
}