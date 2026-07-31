import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  MapPin, 
  QrCode, 
  BarChart3, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Server,
  LogOut
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import LiveTracking from './pages/LiveTracking';
import CheckInOut from './pages/CheckInOut';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import AIInsights from './pages/AIInsights';
import OperatorPortal from './pages/OperatorPortal';
import Login from './components/Login';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [equipment, setEquipment] = useState([]);
  const [sites, setSites] = useState([]);
  const [operators, setOperators] = useState([]);
  const [alerts, setAlerts] = useState({ alerts: [], anomalies: [] });
  const [analytics, setAnalytics] = useState(null);
  const [reallocations, setReallocations] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [forcedActionType, setForcedActionType] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_rental_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const [equipRes, sitesRes, opsRes, alertsRes, analyticRes, reallocRes] = await Promise.all([
        fetch(`${BACKEND_URL}/equipment`),
        fetch(`${BACKEND_URL}/sites`),
        fetch(`${BACKEND_URL}/operators`),
        fetch(`${BACKEND_URL}/alerts`),
        fetch(`${BACKEND_URL}/analytics`),
        fetch(`${BACKEND_URL}/reallocations`)
      ]);

      const [equipData, sitesData, opsData, alertsData, analyticData, reallocData] = await Promise.all([
        equipRes.json(),
        sitesRes.json(),
        opsRes.json(),
        alertsRes.json(),
        analyticRes.json(),
        reallocRes.json()
      ]);

      setEquipment(equipData);
      setSites(sitesData);
      setOperators(opsData);
      setAlerts(alertsData);
      setAnalytics(analyticData);
      setReallocations(reallocData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  };

  const handleLogin = (userProfile) => {
    setUser(userProfile);
    localStorage.setItem('smart_rental_user', JSON.stringify(userProfile));
    fetchData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smart_rental_user');
    fetchData();
  };

  // Poll for real-time telemetry updates every 3 seconds
  useEffect(() => {
    fetchData(); // initial fetch
    const interval = setInterval(() => {
      fetchData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper to change tab and reset selected asset details
  const navigateToTab = (tab, assetId = null, forcedAction = null) => {
    setActiveTab(tab);
    if (assetId) {
      setSelectedAssetId(assetId);
    } else {
      setSelectedAssetId(null);
    }
    setForcedActionType(forcedAction);
    fetchData();
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            equipment={equipment} 
            analytics={analytics} 
            alerts={alerts}
            navigateToTab={navigateToTab} 
          />
        );
      case 'equipment':
        return (
          <EquipmentList 
            equipment={equipment} 
            sites={sites} 
            operators={operators} 
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
            reallocations={reallocations}
            fetchData={fetchData}
            navigateToTab={navigateToTab}
          />
        );
      case 'map':
        return (
          <LiveTracking 
            equipment={equipment} 
            sites={sites} 
            navigateToTab={navigateToTab} 
          />
        );
      case 'checkout':
        return (
          <CheckInOut 
            equipment={equipment} 
            sites={sites} 
            operators={operators} 
            fetchData={fetchData}
            initialAssetId={selectedAssetId}
            forcedActionType={forcedActionType}
            clearParentAssetId={() => {
              setSelectedAssetId(null);
              setForcedActionType(null);
            }}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            analytics={analytics} 
            equipment={equipment} 
          />
        );
      case 'alerts':
        return (
          <Alerts 
            alerts={alerts} 
            navigateToTab={navigateToTab} 
          />
        );
      case 'ai-insights':
        return (
          <AIInsights 
            reallocations={reallocations} 
            sites={sites}
            equipment={equipment}
            navigateToTab={navigateToTab}
          />
        );
      default:
        return <Dashboard equipment={equipment} analytics={analytics} alerts={alerts} navigateToTab={navigateToTab} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} operators={operators} equipment={equipment} />;
  }

  if (user.role === 'operator') {
    return (
      <OperatorPortal 
        user={user} 
        equipment={equipment} 
        sites={sites} 
        fetchData={fetchData} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-cat-dark font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-cat-card border-r border-cat-border flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-cat-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cat-yellow flex items-center justify-center font-extrabold text-cat-dark text-lg">
              CAT
            </div>
            <div>
              <h1 className="font-bold text-cat-text text-sm tracking-wide">SMART RENTAL</h1>
              <span className="text-[10px] text-cat-yellow font-bold uppercase tracking-widest">Fleet Intelligence</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => navigateToTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => navigateToTab('equipment')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'equipment' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <Truck size={18} />
              <span>Equipment</span>
            </button>
            <button 
              onClick={() => navigateToTab('map')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'map' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <MapPin size={18} />
              <span>Live Tracking</span>
            </button>
            <button 
              onClick={() => navigateToTab('checkout')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'checkout' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <QrCode size={18} />
              <span>Check In / Out</span>
            </button>
            <button 
              onClick={() => navigateToTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'analytics' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => navigateToTab('alerts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'alerts' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} />
                  <span>Alerts</span>
                </div>
                {(alerts.alerts?.length + alerts.anomalies?.length) > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-full">
                    {alerts.alerts.length + alerts.anomalies.length}
                  </span>
                )}
              </div>
            </button>
            <button 
              onClick={() => navigateToTab('ai-insights')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'ai-insights' 
                  ? 'bg-cat-yellow text-cat-dark font-semibold' 
                  : 'text-cat-gray hover:bg-cat-hover hover:text-cat-text'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} />
                  <span>AI Insights</span>
                </div>
                {reallocations.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-cat-dark rounded-full animate-pulse">
                    {reallocations.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-cat-border space-y-3">
          <div className="flex items-center justify-between bg-cat-hover p-3 rounded-lg border border-cat-border">
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-500 animate-pulse" size={14} />
              <span className="text-xs text-cat-text font-medium">Telematics</span>
            </div>
            <span className="text-[10px] text-cat-gray uppercase font-bold">Simulated</span>
          </div>

          <div className="flex items-center justify-between text-xs text-cat-gray px-2">
            <span className="flex items-center gap-1.5">
              <Server size={10} />
              <span>Status: Live</span>
            </span>
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-1 bg-cat-dark hover:bg-cat-border border border-cat-border text-cat-gray hover:text-cat-text py-2 rounded-lg text-[10px] font-bold uppercase transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            <LogOut size={12} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-cat-dark">
        {/* Header Bar */}
        <header className="h-16 border-b border-cat-border bg-cat-card px-8 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold uppercase tracking-wider text-cat-text">
            {activeTab === 'dashboard' && 'Operations Dashboard'}
            {activeTab === 'equipment' && 'Fleet Equipment List'}
            {activeTab === 'map' && 'Live Telematics Tracking'}
            {activeTab === 'checkout' && 'QR Check In & Check Out'}
            {activeTab === 'analytics' && 'Performance & Utilization Analytics'}
            {activeTab === 'alerts' && 'Anomaly & Alert Center'}
            {activeTab === 'ai-insights' && 'Smart Reallocation Engine'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-cat-gray">Active Location</p>
              <p className="text-xs font-semibold text-cat-text">VisionLink Gateway (South)</p>
            </div>
            <div className="w-1.5 h-10 bg-cat-yellow rounded-full"></div>
          </div>
        </header>

        {/* Scrollable Sub-Page container */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
}

export default App;
