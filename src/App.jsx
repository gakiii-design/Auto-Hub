import React, { useState, useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Maintenance from './pages/Maintenance';
import Notifications from './pages/Notifications';
import Diagnostics from './pages/Diagnostics';
import Upgrades from './pages/Upgrades';
import Emergency from './pages/Emergency';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import logo from './assets/logo.jpeg';
import { API_BASE_URL } from './config/api';

import ServiceBooking from './pages/ServiceBooking';

const NAV_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'maintenance', label: 'Maintenance', icon: '🛠️' },
  { key: 'diagnostics', label: 'Diagnostics', icon: '🔍' },
  { key: 'upgrades', label: 'Upgrades', icon: '⬆️' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'emergency', label: 'Emergency', icon: '🚨' },
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'servicebooking', label: 'Service Booking', icon: '📅' },
  { key: 'admin', label: 'Admin', icon: '🧑‍🔧', adminOnly: true },
];

function App() {
  const [page, setPage] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [userName, setUserName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [saveMsg, setSaveMsg] = useState('');
  const [theme, setTheme] = useState('dark');
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handles successful login by saving userId and showing dashboard
  const handleLogin = (id) => {
    setUserId(id);
    setPage('dashboard');
  };

  // Handles logout: clears userId and returns to login page
  const handleLogout = () => {
    setUserId(null);
    setPage('login');
    setStats(null);
    setStatsError('');
  };

  // Save profile/settings to backend (simulate)
  const handleSaveSettings = () => {
    setSaveMsg('');
    fetch('http://127.0.0.1:5000/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        vehicle: {
          model: vehicleModel,
          manufacture_year: stats?.vehicleYear,
          mileage: stats?.mileage,
        },
        display_name: displayName
      })
    })
      .then(res => res.json())
      .then(() => setSaveMsg('Changes saved!'))
      .catch(() => setSaveMsg('Failed to save changes.'));
  };

  // Fetch dashboard stats and notifications from backend
  useEffect(() => {
    if (userId && page === 'dashboard') {
      setLoadingStats(true);
      setStatsError('');
      setLoadingNotifications(true);
      // Fetch vehicle info, maintenance, and notifications
      Promise.all([
        fetch('http://127.0.0.1:5000/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        }).then(res => res.json()),
        fetch('http://127.0.0.1:5000/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, vehicle: {} })
        }).then(res => res.json()),
        fetch('http://127.0.0.1:5000/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        }).then(res => res.json())
      ]).then(([maintenance, profile, notif]) => {
        setStats({
          lastService: profile.vehicle?.last_service_date || 'N/A',
          nextMaintenance: maintenance.next_service_date || 'N/A',
          carStatus: profile.vehicle?.current_performance || 'N/A',
          mileage: profile.vehicle?.mileage || 'N/A',
        });
        setUserName(profile.user?.name || '');
        setVehicleModel(profile.vehicle?.model || '');
        setNotifications(notif.notifications || []);
        setLoadingStats(false);
        setLoadingNotifications(false);
      }).catch(err => {
        setStatsError('Could not load dashboard info.');
        setLoadingStats(false);
        setLoadingNotifications(false);
      });
    }
  }, [userId, page]);

  // Dashboard cards for quick access
  const DashboardCards = () => (
    <div className="dashboard-cards">
      <div className="dashboard-card" onClick={() => setPage('maintenance')}>
        <span className="icon">🛠️</span>
        <h3>Maintenance</h3>
        <p>Next: <strong>{stats?.nextMaintenance || '...'}</strong><br />Track and schedule your car's maintenance.</p>
      </div>
      <div className="dashboard-card" onClick={() => setPage('diagnostics')}>
        <span className="icon">🔍</span>
        <h3>Diagnostics</h3>
        <p>Describe a problem and get instant preliminary diagnostics.</p>
      </div>
      <div className="dashboard-card" onClick={() => setPage('upgrades')}>
        <span className="icon">⬆️</span>
        <h3>Upgrades</h3>
        <p>See recommended upgrades based on your car’s data.</p>
      </div>
      <div className="dashboard-card" onClick={() => setPage('notifications')}>
        <span className="icon">🔔</span>
        <h3>Notifications {notifications.length > 0 && <span style={{ background: '#ff9800', color: '#111', borderRadius: 8, fontSize: '0.8em', fontWeight: 700, marginLeft: 4, padding: '0 6px', minWidth: 18 }}>{notifications.length}</span>}</h3>
        <p>Stay updated on maintenance and upgrades.</p>
      </div>
      <div className="dashboard-card" onClick={() => setPage('emergency')}>
        <span className="icon">🚨</span>
        <h3>Emergency</h3>
        <p>24/7 helpline for urgent car issues and roadside assistance.</p>
      </div>
      <div className="dashboard-card" onClick={() => setPage('profile')}>
        <span className="icon">👤</span>
        <h3>Profile</h3>
        <p>Vehicle: <strong>{stats?.mileage || '...'}</strong> km<br />Status: <strong>{stats?.carStatus || '...'}</strong></p>
      </div>
      {userId === 1 && (
        <div className="dashboard-card" onClick={() => setPage('admin')}>
          <span className="icon">🧑‍🔧</span>
          <h3>Admin Dashboard</h3>
          <p>Mechanics: View service requests and offer remote advice.</p>
        </div>
      )}
    </div>
  );

  // Settings/Profile Modal
  const SettingsModal = () => (
    <div className="settings-modal" onClick={() => setShowSettings(false)}>
      <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
        <button className="settings-close" onClick={() => setShowSettings(false)}>&times;</button>
        <h2>Profile & Settings</h2>
        <div style={{ margin: '18px 0 8px 0', color: '#ff9800', fontWeight: 600 }}>
          <span style={{ fontSize: 18 }}>👤</span> {displayName || userName || 'User'}
        </div>
        <div style={{ color: '#ccc', fontSize: '1rem', marginBottom: 12 }}>
          <div><span style={{ color: '#ff9800' }}>Email:</span> (not shown for demo)</div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#ff9800', fontWeight: 600, marginBottom: 6 }}>Display Name</div>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff', fontSize: '1rem', marginBottom: 8 }}
            placeholder="Enter your name"
          />
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
        <div style={{ color: '#ff9800', fontWeight: 600, marginBottom: 6 }}>Vehicle Details</div>
        <div style={{ color: '#ccc', fontSize: '1rem', marginBottom: 12 }}>
          <div>Model: <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} style={{ width: '70%', padding: 6, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff', fontSize: '1rem', marginLeft: 6 }} /></div>
          <div>Year: <input type="number" value={stats?.vehicleYear || ''} onChange={e => setStats(s => ({ ...s, vehicleYear: e.target.value }))} style={{ width: '70%', padding: 6, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff', fontSize: '1rem', marginLeft: 6 }} /></div>
          <div>Mileage: <input type="number" value={stats?.mileage || ''} onChange={e => setStats(s => ({ ...s, mileage: e.target.value }))} style={{ width: '70%', padding: 6, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff', fontSize: '1rem', marginLeft: 6 }} /> km</div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
        <div style={{ color: '#ff9800', fontWeight: 600, marginBottom: 6 }}>App Settings</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ flex: 1 }}>Theme</span>
          <select value={theme} onChange={e => setTheme(e.target.value)} style={{ background: '#181818', color: '#fff', border: '1px solid #444', borderRadius: 6, padding: 4 }}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ flex: 1 }}>Notifications</span>
          <input type="checkbox" checked={notifEnabled} onChange={e => setNotifEnabled(e.target.checked)} />
        </div>
        <button
          style={{ width: '100%', background: '#ff9800', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '1.1rem', marginTop: 10 }}
          onClick={handleSaveSettings}
        >Save Changes</button>
        {saveMsg && <div style={{ color: '#ff9800', marginTop: 10, textAlign: 'center' }}>{saveMsg}</div>}
      </div>
    </div>
  );

  // Main content router
  const renderPage = () => {
    if (!userId) {
      if (page === 'register') return <div className="centered-page"><Register onGoLogin={() => setPage('login')} /></div>;
      return <div className="centered-page"><Login onLogin={handleLogin} onGoRegister={() => setPage('register')} /></div>;
    }
    if (page === 'dashboard') return (
      <div className="app-main" style={{ overflowY: 'hidden' }}>
        {/* Real-time alerts */}
        {stats && (
          <>
            {stats.nextMaintenance !== 'N/A' && new Date(stats.nextMaintenance) < new Date() && (
              <div className="alert">
                <strong>Alert:</strong> Maintenance overdue! Please schedule service.
              </div>
            )}
            {stats.carStatus && stats.carStatus.toLowerCase() !== 'good' && (
              <div className="alert">
                <strong>Alert:</strong> Car status: {stats.carStatus}
              </div>
            )}
          </>
        )}
        {/* Notifications preview */}
        {loadingNotifications ? (
          <div style={{ textAlign: 'center', color: '#ff9800', marginBottom: 10 }}>Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <span style={{ color: '#ff9800', fontWeight: 600 }}>{notifications.length} Notification(s):</span> {notifications[0].message}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 10, color: '#888' }}>No new notifications.</div>
        )}
        {loadingStats && <div style={{ textAlign: 'center', color: '#ff9800', marginBottom: 12 }}>Loading your car info...</div>}
        {statsError && <div style={{ textAlign: 'center', color: '#f44336', marginBottom: 12 }}>{statsError}</div>}
        {stats && (
          <div style={{ textAlign: 'center', marginBottom: 18, fontSize: '1.1rem', color: '#ff9800' }}>
            <div>Last Service: <strong>{stats.lastService}</strong> | Next Maintenance: <strong>{stats.nextMaintenance}</strong></div>
            <div>Current Mileage: <strong>{stats.mileage} km</strong> | Car Status: <strong>{stats.carStatus}</strong></div>
          </div>
        )}
        <DashboardCards />
        <div style={{ textAlign: 'center', marginTop: 24, color: '#fff', fontSize: '1rem' }}>
          <p>AutoHub helps you keep your car healthy, safe, and up-to-date.<br />Access all your car’s info, schedule services, and get help—anytime, anywhere.</p>
        </div>
      </div>
    );
    // Center all other pages
    if (page === 'maintenance') return <div className="centered-page"><Maintenance userId={userId} /></div>;
    if (page === 'diagnostics') return <div className="centered-page"><Diagnostics /></div>;
    if (page === 'upgrades') return <div className="centered-page"><Upgrades /></div>;
    if (page === 'notifications') return <div className="centered-page"><Notifications /></div>;
    if (page === 'emergency') return <div className="centered-page"><Emergency /></div>;
    if (page === 'profile') return <div className="centered-page"><Profile userId={userId} /></div>;
    if (page === 'servicebooking') return <div className="centered-page"><ServiceBooking onBookingSuccess={(booking) => { setBookingInfo(booking); setBookingSuccessMessage(booking.message || 'Booking successful!'); setPage('dashboard'); }} /></div>;
    if (page === 'admin' && userId === 1) return <div className="centered-page"><AdminDashboard /></div>;
    return <div className="centered-page"><div className="section-title">Page Not Found</div></div>;
  };

  // Splash screen
  const Splash = () => (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={logo} alt="AutoHub Logo" style={{ width: 96, height: 'auto', marginBottom: 12, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }} />
        <h1 style={{ color: '#ff9800', margin: '16px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>AutoHub</h1>
        <div className="splash-spinner"></div>
      </div>
    </div>
  );

  // App shell
  return (
    <div className="app-shell">
      {showSplash ? <Splash /> : null}
      <div style={{ minHeight: '100vh', display: showSplash ? 'none' : undefined, marginLeft: 0, transition: 'margin-left 0.3s ease' }}>
        {/* Dashboard header with logo/name on left, welcome on right */}
        {userId && page === 'dashboard' && (
          <div className="dashboard-header-flex" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div className="dashboard-brand" style={{ flexShrink: 0 }}>
              <img src={logo} alt="AutoHub Logo" style={{ height: 44, verticalAlign: 'middle', marginRight: 10, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
              <span style={{ color: '#ff9800', fontWeight: 700, fontSize: '1.3rem', letterSpacing: 1 }}>AutoHub</span>
            </div>
            <div className="dashboard-header-main" style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#ff9800', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Welcome, {userName || 'Driver'}{vehicleModel ? ` (${vehicleModel})` : ''}!
                <button className="settings-gear" onClick={() => setShowSettings(true)} title="Settings" style={{ marginLeft: 8 }}>
                  <span role="img" aria-label="settings" style={{ fontSize: 22, color: '#ff9800' }}>⚙️</span>
                </button>
              </h1>
              <p style={{ color: '#ccc', margin: 0, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Your car’s health at a glance. Stay on top of maintenance, upgrades, and more.</p>
              <button
                onClick={() => setPage('servicebooking')}
                style={{
                  marginTop: 12,
                  backgroundColor: '#ff6f00',
                  color: '#fff',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 20px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 8px rgba(255, 105, 0, 0.4)',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ff8f00'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ff6f00'}
              >
                Make a Booking
              </button>
            </div>
          </div>
        )}
        {renderPage()}
      </div>
      {showSettings && <SettingsModal />}
    </div>
  );
}

export default App;
