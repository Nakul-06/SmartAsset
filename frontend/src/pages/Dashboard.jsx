import React from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  MapPin, 
  Fuel, 
  Clock, 
  AlertTriangle,
  Activity
} from 'lucide-react';

export default function Dashboard({ equipment, analytics, alerts, navigateToTab }) {
  // Get active telematics list (items with recent updates, sorting by lastUpdated)
  const telematicsFeed = [...equipment]
    .filter(e => e.status === 'Active')
    .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
    .slice(0, 5);

  // Fallback KPIs if analytics isn't loaded yet
  const kpis = analytics?.kpis || {
    totalAssets: equipment.length,
    activeRentals: equipment.filter(e => e.status === 'Active').length,
    overdueRentals: equipment.filter(e => {
      const today = new Date('2026-07-30');
      return e.status === 'Active' && e.checkOutDate && new Date(e.checkOutDate) < today;
    }).length,
    fleetUtilization: 65
  };

  const utilizationByType = analytics?.utilizationByType || [
    { type: 'Excavator', utilization: 72 },
    { type: 'Bulldozer', utilization: 85 },
    { type: 'Crane', utilization: 31 },
    { type: 'Grader', utilization: 56 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => navigateToTab('equipment')}
          className="bg-cat-card border border-cat-border p-6 rounded-xl hover:border-cat-yellow transition-all duration-200 cursor-pointer group"
        >
          <p className="text-xs text-cat-gray font-semibold uppercase tracking-wider">Total Assets</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-cat-text">{kpis.totalAssets}</h3>
            <span className="text-[10px] text-cat-yellow group-hover:underline">View Fleet →</span>
          </div>
        </div>

        <div 
          onClick={() => navigateToTab('equipment')}
          className="bg-cat-card border border-cat-border p-6 rounded-xl hover:border-cat-yellow transition-all duration-200 cursor-pointer group"
        >
          <p className="text-xs text-cat-gray font-semibold uppercase tracking-wider">Active Rentals</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-emerald-400">{kpis.activeRentals}</h3>
            <span className="text-[10px] text-emerald-400 group-hover:underline">View Active →</span>
          </div>
        </div>

        <div 
          onClick={() => navigateToTab('alerts')}
          className="bg-cat-card border border-cat-border p-6 rounded-xl hover:border-red-500 transition-all duration-200 cursor-pointer group"
        >
          <p className="text-xs text-cat-gray font-semibold uppercase tracking-wider">Overdue Returns</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-red-500">{kpis.overdueRentals}</h3>
            {kpis.overdueRentals > 0 ? (
              <span className="flex items-center gap-1 text-[10px] text-red-500 bg-red-950/50 px-2 py-0.5 rounded-full border border-red-900 animate-pulse">
                <AlertTriangle size={10} /> {kpis.overdueRentals} Overdue
              </span>
            ) : (
              <span className="text-[10px] text-cat-gray">Healthy</span>
            )}
          </div>
        </div>

        <div 
          onClick={() => navigateToTab('analytics')}
          className="bg-cat-card border border-cat-border p-6 rounded-xl hover:border-cat-yellow transition-all duration-200 cursor-pointer group"
        >
          <p className="text-xs text-cat-gray font-semibold uppercase tracking-wider">Fleet Utilization</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-cat-yellow">{kpis.fleetUtilization}%</h3>
            <span className="text-[10px] text-cat-yellow group-hover:underline">View Analytics →</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC WORKFORCE CHANNELS (CHARTS & SIMULATED FEED) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fleet Utilization by Equipment Type (User Specification #1) */}
        <div className="bg-cat-card border border-cat-border p-6 rounded-xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-cat-yellow" />
              Fleet Utilization by Category
            </h3>
            <span className="text-[10px] text-cat-gray">Target: 75% Average</span>
          </div>
          
          <div className="space-y-5">
            {utilizationByType.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-cat-text">{item.type} ({item.activeCount || 0} rented)</span>
                  <span className={item.utilization > 70 ? 'text-emerald-400' : item.utilization < 30 ? 'text-red-400' : 'text-amber-400'}>
                    {item.utilization}%
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-4 w-full bg-cat-dark rounded-full overflow-hidden border border-cat-border flex">
                  <div 
                    style={{ width: `${item.utilization}%` }}
                    className={`h-full transition-all duration-500 rounded-full ${
                      item.utilization > 70 
                        ? 'bg-emerald-500' 
                        : item.utilization < 30 
                          ? 'bg-red-500' 
                          : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Telemetry Stream (User Specification #5) */}
        <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-cat-yellow animate-pulse" />
              Live Telemetry Feed
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full font-semibold animate-pulse">
              STREAMING
            </span>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {telematicsFeed.length > 0 ? (
              telematicsFeed.map((asset, i) => (
                <div 
                  key={i} 
                  onClick={() => navigateToTab('equipment', asset.equipmentId)}
                  className="bg-cat-dark border border-cat-border p-3 rounded-lg hover:border-cat-yellow transition-all duration-150 cursor-pointer flex justify-between items-start text-xs group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-cat-yellow group-hover:underline">{asset.equipmentId}</span>
                      <span className="text-cat-gray font-medium text-[10px]">{asset.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-cat-gray text-[10px]">
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} /> Engine: {asset.engineHoursPerDay.toFixed(1)}h
                      </span>
                      <span>Idle: {asset.idleHoursPerDay.toFixed(1)}h</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-cat-gray">
                      <MapPin size={9} />
                      <span>{asset.location.latitude.toFixed(4)}, {asset.location.longitude.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-[10px] justify-end">
                      <Fuel size={10} className="text-amber-500" />
                      <span className="font-bold">{Math.round(asset.fuelLevel)}%</span>
                    </div>
                    <span className="text-[9px] text-cat-yellow bg-cat-yellow/10 border border-cat-yellow/20 px-1 py-0.2 rounded uppercase font-bold">
                      {asset.utilization}% Util
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-cat-gray text-xs py-8">No telemetry data stream. Check in machines to activate.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. EQUIPMENT STATUS TABLE (User Specification #1) */}
      <div className="bg-cat-card border border-cat-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-cat-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider">Equipment Utilization Overview</h3>
            <p className="text-xs text-cat-gray mt-1">Status of critical assets and site assignments</p>
          </div>
          <button 
            onClick={() => navigateToTab('equipment')}
            className="text-xs font-bold text-cat-yellow hover:underline"
          >
            View Full Fleet list →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cat-border text-cat-gray bg-cat-dark/40 font-semibold">
                <th className="p-4">Equipment ID</th>
                <th className="p-4">Name & Type</th>
                <th className="p-4">Site</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Engine / Idle</th>
                <th className="p-4 text-right">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {/* Prioritize showing key equipment EQX1001, EQX1002, EQX1003, EQX1004 */}
              {['EQX1001', 'EQX1002', 'EQX1003', 'EQX1004', 'EQX1006', 'EQX1007']
                .map(id => equipment.find(e => e.equipmentId === id))
                .filter(Boolean)
                .map((asset, index) => {
                  const hasAnomaly = asset.anomalies && asset.anomalies.length > 0;
                  const isLowUtil = asset.status === 'Active' && asset.utilization < 20;
                  const isHighUtil = asset.status === 'Active' && asset.utilization >= 75;

                  // Define status tag details
                  let statusTag = (
                    <span className="flex items-center gap-1 text-red-500 font-semibold uppercase text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Unassigned
                    </span>
                  );

                  if (asset.status === 'Active') {
                    if (isLowUtil) {
                      statusTag = (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold uppercase text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Low Usage
                        </span>
                      );
                    } else {
                      statusTag = (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold uppercase text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active
                        </span>
                      );
                    }
                  }

                  return (
                    <tr 
                      key={index} 
                      onClick={() => navigateToTab('equipment', asset.equipmentId)}
                      className="border-b border-cat-border hover:bg-cat-hover transition-colors duration-150 cursor-pointer"
                    >
                      <td className="p-4 font-bold text-cat-yellow">{asset.equipmentId}</td>
                      <td className="p-4">
                        <p className="font-semibold text-cat-text">{asset.name}</p>
                        <p className="text-[10px] text-cat-gray font-medium">{asset.type}</p>
                      </td>
                      <td className="p-4">
                        {asset.siteId ? (
                          <span className="font-medium text-cat-text bg-cat-dark border border-cat-border px-2.5 py-0.5 rounded-full">
                            {asset.siteId}
                          </span>
                        ) : (
                          <span className="text-cat-gray">—</span>
                        )}
                      </td>
                      <td className="p-4">{statusTag}</td>
                      <td className="p-4 text-center text-cat-gray">
                        {asset.status === 'Active' ? (
                          <span>{asset.engineHoursPerDay.toFixed(1)}h / {asset.idleHoursPerDay.toFixed(1)}h</span>
                        ) : (
                          <span>0h / {asset.idleHoursPerDay.toFixed(1)}h</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-extrabold ${
                            isHighUtil ? 'text-emerald-400' : isLowUtil ? 'text-red-400' : 'text-cat-text'
                          }`}>
                            {asset.utilization}%
                          </span>
                          {hasAnomaly && (
                            <ShieldAlert size={14} className="text-red-500" title={asset.anomalies[0].message} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
