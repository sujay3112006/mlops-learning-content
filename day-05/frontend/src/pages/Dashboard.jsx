import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, UploadCloud, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({ empty: true });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);

        const dataRes = await axios.get('http://localhost:5000/api/data/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(dataRes.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:5000/api/data/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refetch data
      const dataRes = await axios.get('http://localhost:5000/api/data/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(dataRes.data);
    } catch (err) {
      alert('Error uploading file. Make sure it is a valid CSV.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return <div className="auth-wrapper"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-controls">
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.name}</span>
          <button className="btn-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>Marketing & Sales Performance</h2>
            <p className="subtitle" style={{ margin: 0 }}>Analyze your campaign metrics</p>
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn-primary" 
            onClick={triggerFileInput} 
            disabled={uploading}
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UploadCloud size={18} /> {uploading ? 'Processing...' : 'Upload Data (CSV)'}
          </button>
        </div>

        {dashboardData.empty ? (
          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div className="empty-state">
              <BarChart3 />
              <h3>No Data Available</h3>
              <p>Your dashboard is empty. Upload a CSV file with columns (Date, Campaign, Revenue, Leads, Cost) to see your metrics.</p>
              <button className="btn-outline" onClick={triggerFileInput} style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={18} /> Browse Files
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Revenue</p>
                    <h3 style={{ fontSize: '1.875rem', marginTop: '0.5rem' }}>${dashboardData.kpis?.totalRevenue?.toLocaleString()}</h3>
                  </div>
                  <div style={{ backgroundColor: '#e0e7ff', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary-color)' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Leads</p>
                    <h3 style={{ fontSize: '1.875rem', marginTop: '0.5rem' }}>{dashboardData.kpis?.totalLeads?.toLocaleString()}</h3>
                  </div>
                  <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.5rem', color: '#16a34a' }}>
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Cost</p>
                    <h3 style={{ fontSize: '1.875rem', marginTop: '0.5rem' }}>${dashboardData.kpis?.totalCost?.toLocaleString()}</h3>
                  </div>
                  <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', color: '#ef4444' }}>
                    <Activity size={24} />
                  </div>
                </div>
              </div>

              <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Overall ROI</p>
                    <h3 style={{ fontSize: '1.875rem', marginTop: '0.5rem' }}>{dashboardData.kpis?.roi?.toFixed(2)}%</h3>
                  </div>
                  <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', color: '#d97706' }}>
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
              <div className="dashboard-card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Revenue & Leads Trend</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dx={-10} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dx={10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '1rem' }}/>
                      <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Top Campaigns by Revenue</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.campaignData} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontWeight: 500}} />
                      <Tooltip 
                        cursor={{fill: '#f3f4f6'}}
                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="revenue" name="Revenue ($)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
