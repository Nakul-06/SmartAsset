import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  User, 
  Settings, 
  Mail, 
  CalendarDays,
  Plus
} from 'lucide-react';

export default function Alerts({ alerts, navigateToTab }) {
  const activeAlerts = alerts?.alerts || [];
  const activeAnomalies = alerts?.anomalies || [];

  // Group alerts & anomalies by severity
  const criticalCount = activeAlerts.filter(a => a.type === 'CRITICAL').length + 
                        activeAnomalies.filter(a => a.severity === 'Critical').length;
  
  const warningCount = activeAlerts.filter(a => a.type === 'WARNING').length + 
                       activeAnomalies.filter(a => a.severity === 'Warning').length;

  const healthyCount = 47 - (criticalCount + warningCount); // Out of 47 total assets

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. ANOMALY CENTER HEADER SUMMARY (User Specification #7) */}
      <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
        <h3 className="font-extrabold text-cat-text text-sm uppercase tracking-wider">SMART ANOMALY CENTER</h3>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-xl">
            <span className="text-sm font-extrabold text-red-500 block">{criticalCount}</span>
            <span className="text-[10px] text-cat-gray uppercase font-semibold">Critical</span>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/60 p-4 rounded-xl">
            <span className="text-sm font-extrabold text-amber-500 block">{warningCount}</span>
            <span className="text-[10px] text-cat-gray uppercase font-semibold">Warning</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/60 p-4 rounded-xl">
            <span className="text-sm font-extrabold text-emerald-400 block">{healthyCount}</span>
            <span className="text-[10px] text-cat-gray uppercase font-semibold">Healthy Fleet</span>
          </div>
        </div>
      </div>

      {/* 2. ALERTS LIST (User Specification #6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEASE EXPIRY & RETURN ALERTS */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-cat-gray uppercase tracking-widest flex items-center gap-2">
            <CalendarDays size={14} className="text-cat-yellow" />
            Lease Status & Return Alerts
          </h4>

          <div className="space-y-4">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert, idx) => {
                const isCritical = alert.type === 'CRITICAL';
                return (
                  <div 
                    key={idx}
                    className={`border p-5 rounded-xl space-y-4 transition-all duration-150 ${
                      isCritical 
                        ? 'bg-red-950/20 border-red-900/60' 
                        : 'bg-amber-950/20 border-amber-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-cat-dark'
                        }`}>
                          {alert.type}
                        </span>
                        <h4 className="font-extrabold text-sm text-cat-text mt-1">{alert.title}</h4>
                        <p className="text-xs font-bold text-cat-yellow">{alert.equipmentId} — {alert.type}</p>
                      </div>

                      <span className="text-xs text-cat-gray font-bold">Site: {alert.siteId}</span>
                    </div>

                    <p className="text-xs text-cat-text leading-relaxed">{alert.message}</p>
                    
                    {alert.recommendation && (
                      <div className="bg-cat-dark/50 border border-cat-border p-3 rounded-lg text-xs">
                        <span className="font-bold text-amber-500 uppercase text-[9px] tracking-wider block mb-0.5">Recommendation:</span>
                        <span className="text-cat-text">{alert.recommendation}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-cat-border/40">
                      {isCritical ? (
                        <>
                          <button 
                            onClick={() => alert(`Initiating contact with Site Supervisor for ${alert.equipmentId}...`)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-[10px] uppercase transition-colors flex items-center gap-1.5"
                          >
                            <Mail size={12} /> Contact Site
                          </button>
                          <button 
                            onClick={() => navigateToTab('checkout', alert.equipmentId, 'checkout')}
                            className="bg-cat-dark border border-cat-border hover:border-cat-yellow text-cat-text font-bold py-2 px-4 rounded-lg text-[10px] uppercase transition-all flex items-center gap-1.5"
                          >
                            <Plus size={12} /> Extend Lease
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => navigateToTab('checkout', alert.equipmentId, 'checkout')}
                          className="bg-amber-500 hover:bg-amber-600 text-cat-dark font-extrabold py-2 px-4 rounded-lg text-[10px] uppercase transition-colors"
                        >
                          Review Extension
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-cat-gray bg-cat-card border border-cat-border p-6 rounded-xl text-center">
                No active return or lease alerts.
              </p>
            )}
          </div>
        </div>

        {/* RULE-BASED TELEMATICS ANOMALIES (User Specification #7) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-cat-gray uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-cat-yellow" />
            Telematics Rule Anomalies
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activeAnomalies.length > 0 ? (
              activeAnomalies.map((anom, idx) => {
                const isCritical = anom.severity === 'Critical';
                return (
                  <div 
                    key={idx}
                    onClick={() => navigateToTab('equipment', anom.equipmentId)}
                    className="bg-cat-card border border-cat-border p-4 rounded-xl hover:border-cat-yellow transition-all duration-150 cursor-pointer flex justify-between items-start group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="font-extrabold text-xs text-cat-yellow group-hover:underline">{anom.equipmentId}</span>
                        <span className="text-[10px] text-cat-gray font-medium">({anom.type})</span>
                      </div>
                      <p className="text-xs text-cat-text">{anom.message}</p>

                      {anom.code === 'POSSIBLE_MISUSE' && (
                        <div className="text-[10px] bg-red-950/20 text-red-400 p-2 rounded border border-red-900/30">
                          Possible rental misuse detected. Verification recommended.
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-1.5 shrink-0 ml-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        isCritical ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-amber-950/50 text-amber-500 border border-amber-900/50'
                      }`}>
                        {anom.severity}
                      </span>
                      <p className="text-[10px] text-cat-gray">
                        {anom.siteId ? `Site: ${anom.siteId}` : 'Yard'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-cat-gray bg-cat-card border border-cat-border p-6 rounded-xl text-center">
                All telemetry lines running within normal bounds.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
