import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend 
} from 'recharts';
import { GitHubCalendar } from 'react-github-calendar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function Report() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState('All');
  const [sortType, setSortType] = useState('stars');

  const reportRef = useRef();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
        const response = await fetch(`${API_BASE_URL}/api/profile/${username}`);
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
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ color: 'var(--text-main)', textAlign: 'center' }}>Generating Scorecard...</h2>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="dashboard-card" style={{ display: 'inline-block', maxWidth: '500px', borderColor: '#f87171' }}>
          <h2 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ Oops! Something went wrong.</h2>
          <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{error}</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
            ← Try Another Search
          </Link>
        </div>
      </div>
    );
  }
  
  if (!data) return null;

  // Chart Data
  const chartData = [
    { subject: 'Activity', score: (data.scores.activity / 25) * 100, fullMark: 100 },
    { subject: 'Code Quality', score: (data.scores.codeQuality / 20) * 100, fullMark: 100 },
    { subject: 'Diversity', score: (data.scores.diversity / 20) * 100, fullMark: 100 },
    { subject: 'Community', score: (data.scores.community / 20) * 100, fullMark: 100 },
    { subject: 'Hiring Ready', score: (data.scores.hiringReady / 15) * 100, fullMark: 100 },
  ];

  const languageData = data.languages 
    ? Object.entries(data.languages).map(([key, value]) => ({ name: key, value })).sort((a, b) => b.value - a.value)
    : [];
  const PIE_COLORS = ['#f1e05a', '#3b82f6', '#e34c26', '#8b5cf6', '#14b8a6', '#f59e0b', '#10b981', '#f97316'];
  
  // Badges Logic
  const badges = [];
  if (data && data.scores) {
    if (data.scores.overall >= 80) badges.push({ icon: '🏆', title: 'Elite Coder', desc: 'Achieved an overall score of 80+' });
    if (data.followers >= 50) badges.push({ icon: '🌟', title: 'Community Pillar', desc: 'Has 50+ GitHub followers' });
    if (Object.keys(data.languages || {}).length >= 5) badges.push({ icon: '🌍', title: 'Polyglot', desc: 'Writes code in 5+ different languages' });
    if (data.scores.activity >= 20) badges.push({ icon: '🔥', title: 'Relentless', desc: 'Extremely high recent commit activity' });
    if (data.publicRepos >= 30) badges.push({ icon: '📦', title: 'Prolific', desc: 'Maintains 30+ public repositories' });
  }

  // Filtering & Sorting Logic
  const availableLanguages = data && data.topRepos 
    ? ['All', ...new Set(data.topRepos.map(r => r.language).filter(l => l !== 'Unknown'))]
    : ['All'];

  const displayedRepos = data && data.topRepos 
    ? data.topRepos
        .filter(repo => {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = repo.name.toLowerCase().includes(searchLower) || 
                                (repo.description && repo.description.toLowerCase().includes(searchLower));
          const matchesLang = filterLang === 'All' || repo.language === filterLang;
          return matchesSearch && matchesLang;
        })
        .sort((a, b) => {
          if (sortType === 'stars') return b.stars - a.stars;
          if (sortType === 'forks') return b.forks - a.forks;
          if (sortType === 'name') return a.name.localeCompare(b.name);
          return 0;
        })
    : [];

  // Actions
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

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard!', { icon: '🔗' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Action Buttons Container */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleShareProfile} className="btn-primary" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          🔗 Share Link
        </button>
        <button onClick={handleDownloadPdf} className="btn-primary" style={{ backgroundColor: '#10b981' }}>
          📄 Export PDF
        </button>
      </div>
      
      {/* PDF CAPTURE AREA */}
      <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Header Card */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: 0 }}>
          <img src={data.avatarUrl} alt="Avatar" style={{ width: '120px', borderRadius: '50%', border: '4px solid var(--border)' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--text-main)' }}>{data.name || data.username}</h1>
            <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{data.bio}</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                👥 {data.followers} Followers
              </span>
              <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                📦 {data.publicRepos} Repos
              </span>
            </div>
          </div>
        </div>
        
        {/* Badges Section */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {badges.map((badge, idx) => (
              <div key={idx} title={badge.desc} className="dashboard-card" style={{ 
                margin: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', 
                flex: '1 1 auto', justifyContent: 'center', cursor: 'help' 
              }}>
                <span style={{ fontSize: '1.4rem' }}>{badge.icon}</span>
                <strong style={{ color: 'var(--text-main)' }}>{badge.title}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Scorecard & Radar Chart Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ marginTop: 0, fontSize: '3rem', color: 'var(--text-main)', textAlign: 'center', marginBottom: '5px' }}>
              {data.scores.overall} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '24px', fontSize: '0.9rem' }}>OVERALL SCORE</p>
            
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}><span>📈 Activity</span> <strong>{data.scores.activity}/25</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}><span>💻 Code Quality</span> <strong>{data.scores.codeQuality}/20</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}><span>🌐 Diversity</span> <strong>{data.scores.diversity}/20</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}><span>🤝 Community</span> <strong>{data.scores.community}/20</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>🎯 Hiring Ready</span> <strong>{data.scores.hiringReady}/15</strong></li>
            </ul>
          </div>

          <div className="dashboard-card" style={{ margin: 0, height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 13 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Language Pie Chart */}
        {languageData.length > 0 && (
          <div className="dashboard-card" style={{ margin: 0 }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-main)', textAlign: 'center', marginBottom: '20px' }}>Language Proficiency</h3>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={languageData} cx="50%" cy="50%" innerRadius={90} outerRadius={130} paddingAngle={4} dataKey="value">
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
                  <Legend wrapperStyle={{ color: 'var(--text-main)', paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GitHub Calendar */}
        <div className="dashboard-card" style={{ margin: 0, overflowX: 'auto' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)', textAlign: 'center', marginBottom: '20px' }}>Contribution History</h3>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-main)', minWidth: '750px', padding: '10px 0' }}>
            <GitHubCalendar 
              username={username} 
              blockSize={14} 
              blockMargin={6} 
              fontSize={14} 
              colorScheme={document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'} 
            />
          </div>
        </div>

        {/* Interactive Repositories Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              Repositories 
              <span style={{ fontSize: '1rem', backgroundColor: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px' }}>
                {displayedRepos.length}
              </span>
            </h2>
            
            {/* Filter / Sort Controls */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input type="text" className="modern-input" placeholder="Search repos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 'auto' }} />
              <select className="modern-input" value={filterLang} onChange={(e) => setFilterLang(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <select className="modern-input" value={sortType} onChange={(e) => setSortType(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
                <option value="stars">⭐ Sort by Stars</option>
                <option value="forks">🍴 Sort by Forks</option>
                <option value="name">🔤 Sort by Name</option>
              </select>
            </div>
          </div>
          
          {/* THE FIXED REPOSITORY GRID */}
          {displayedRepos.length > 0 ? (
            <div className="repo-grid">
              {displayedRepos.map((repo, index) => (
                <a key={index} href={repo.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div className="dashboard-card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📦 <span style={{ wordBreak: 'break-word' }}>{repo.name}</span>
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
                      {repo.description 
                        ? (repo.description.length > 120 ? repo.description.substring(0, 120) + '...' : repo.description) 
                        : 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: 'auto' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#f1e05a', borderRadius: '50%' }}></span>
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
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No repositories match your search criteria.</p>
            </div>
          )}
        </div>

      </div> 
    </div>
  );
}