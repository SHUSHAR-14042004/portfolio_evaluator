import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend // <-- Day 13 Imports Added
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Report() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const reportRef = useRef();
  
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

 if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '0 20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#0366d6', fontWeight: 'bold' }}>← Back to Search</Link>
        
        /* Skeleton Profile Header */
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%' }}></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '15px' }}></div>
            <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '15px' }}></div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="skeleton" style={{ width: '100px', height: '30px', borderRadius: '12px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '30px', borderRadius: '12px' }}></div>
            </div>
          </div>
        </div>

        /* Skeleton Scorecard & Charts Area */
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '30px', gap: '20px' }}>
          <div className="skeleton" style={{ flex: '1 1 300px', height: '350px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ flex: '1 1 400px', height: '350px', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', padding: '0 20px' }}>
        <div style={{ display: 'inline-block', padding: '40px', backgroundColor: '#ffeef0', border: '1px solid #ffdce0', borderRadius: '8px', maxWidth: '500px' }}>
          <h2 style={{ color: '#d73a49', marginTop: 0 }}>⚠️ Oops! Something went wrong.</h2>
          <p style={{ color: '#24292e', fontSize: '18px', lineHeight: '1.5' }}>{error}</p>
          
          <Link to="/" style={{ 
            display: 'inline-block', 
            marginTop: '25px', 
            padding: '12px 24px', 
            backgroundColor: '#0366d6', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px',
            fontWeight: 'bold'
          }}>
            ← Try Another Search
          </Link>
        </div>
      </div>
    );
  }
  
  if (!data) return null;

  // Radar Chart Data
  const chartData = [
    { subject: 'Activity', score: (data.scores.activity / 25) * 100, fullMark: 100 },
    { subject: 'Code Quality', score: (data.scores.codeQuality / 20) * 100, fullMark: 100 },
    { subject: 'Diversity', score: (data.scores.diversity / 20) * 100, fullMark: 100 },
    { subject: 'Community', score: (data.scores.community / 20) * 100, fullMark: 100 },
    { subject: 'Hiring Ready', score: (data.scores.hiringReady / 15) * 100, fullMark: 100 },
  ];

  // Day 13: Pie Chart Data Formatting
  const languageData = data.languages 
    ? Object.entries(data.languages)
        .map(([key, value]) => ({ name: key, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const PIE_COLORS = ['#f1e05a', '#3178c6', '#e34c26', '#563d7c', '#2b7489', '#b07219', '#89e051', '#f18e33'];
  
  // PDF Download Logic
  const handleDownloadPdf = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.username || 'github'}_scorecard.pdf`);
  };
   console.log("Backend Data:", data.scores);
   
  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#0366d6', fontWeight: 'bold' }}>← Back to Search</Link>
        <button 
          onClick={handleDownloadPdf}
          style={{ padding: '8px 16px', backgroundColor: '#2ea44f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📄 Export as PDF
        </button>
      </div>
      
      {/* PDF CAPTURE AREA */}
      <div ref={reportRef} style={{ backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '8px' }}>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          <img src={data.avatarUrl} alt="Avatar" style={{ width: '120px', borderRadius: '50%', border: '4px solid var(--bg-card)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '2em', color: 'var(--text-main)' }}>{data.name || data.username}</h1>
            <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontSize: '1.1em' }}>{data.bio}</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <span style={{ backgroundColor: 'var(--bg-card)', color: '#0366d6', padding: '5px 10px', borderRadius: '12px', fontSize: '0.9em', fontWeight: 'bold', border: '1px solid var(--border)' }}>
                👥 {data.followers} Followers
              </span>
              <span style={{ backgroundColor: 'var(--bg-card)', color: '#0366d6', padding: '5px 10px', borderRadius: '12px', fontSize: '0.9em', fontWeight: 'bold', border: '1px solid var(--border)' }}>
                📦 {data.publicRepos} Repos
              </span>
            </div>
          </div>
        </div>

        {/* Scorecard & Radar Chart Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '30px', gap: '20px' }}>
          <div style={{ flex: '1 1 300px', padding: '25px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <h2 style={{ marginTop: 0, fontSize: '2.5em', color: 'var(--text-main)', textAlign: 'center' }}>
              {data.scores.overall} <span style={{ fontSize: '0.4em', color: 'var(--text-muted)' }}>/ 100</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '20px' }}>OVERALL SCORE</p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '20px' }} />
            
            <ul style={{ listStyleType: 'none', padding: 0, fontSize: '1.1em', display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>📈 Activity</span> <strong>{data.scores.activity}/25</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>💻 Code Quality</span> <strong>{data.scores.codeQuality}/20</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🌐 Diversity</span> <strong>{data.scores.diversity}/20</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🤝 Community</span> <strong>{data.scores.community}/20</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🎯 Hiring Ready</span> <strong>{data.scores.hiringReady}/15</strong></li>
            </ul>
          </div>

          <div style={{ flex: '1 1 400px', height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 14 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#0366d6" fill="#0366d6" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day 13: Language Proficiency Pie Chart Section */}
        {languageData.length > 0 && (
          <div style={{ marginTop: '40px', padding: '25px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <h2 style={{ marginTop: 0, color: 'var(--text-main)', textAlign: 'center', marginBottom: '20px' }}>
              Language Proficiency
            </h2>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-main)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Repositories Section */}
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>
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
                  <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', height: '100%', transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#0366d6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📦 {repo.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9em', marginBottom: '15px', lineHeight: '1.4' }}>
                      {repo.description.length > 100 ? repo.description.substring(0, 100) + '...' : repo.description}
                    </p>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85em', color: 'var(--text-muted)' }}>
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
            <p style={{ color: 'var(--text-muted)' }}>No public repositories found.</p>
          )}
        </div>

      </div> 
      {/* END OF PDF CAPTURE AREA */}
    </div>
  );
}