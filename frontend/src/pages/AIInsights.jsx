import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  BrainCircuit,
  Settings
} from 'lucide-react';

export default function AIInsights({ reallocations, sites, equipment, navigateToTab }) {
  const [selectedSite, setSelectedSite] = useState('S003');
  const [selectedType, setSelectedType] = useState('Excavator');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);

  // Call the forecasting API
  const runForecast = async () => {
    setForecastLoading(true);
    setForecastResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: selectedSite,
          equipmentType: selectedType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setForecastResult(data);
      } else {
        alert('Forecasting service failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to forecasting service.');
    } finally {
      setForecastLoading(false);
    }
  };

  // Execute Reallocation (moves the machine in the DB)
  const executeReallocation = async (rec) => {
    const confirmMove = window.confirm(`Confirm reallocation: Move ${rec.equipmentId} from ${rec.currentSiteName} to ${rec.targetSiteName}?`);
    if (!confirmMove) return;

    try {
      const response = await fetch(`http://localhost:5001/api/equipment/${rec.equipmentId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: rec.targetSiteId,
          operatorId: 'OP101', // assign default operator on transfer
          checkOutDate: '2026-08-30'
        })
      });

      if (response.ok) {
        alert(`✓ Reallocation successful! ${rec.equipmentId} is now en route to ${rec.targetSiteName}.`);
        window.location.reload(); // Force full reload to update all contexts
      } else {
        alert('Failed to execute reallocation.');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. OPTIMIZATION ENGINE SECTION (User Specification #9) */}
      <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-cat-text text-sm uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="text-cat-yellow" size={18} />
              Smart Reallocation Engine
            </h3>
            <p className="text-xs text-cat-gray mt-1">AI-identified opportunities to reallocate under-utilized assets to high-demand zones.</p>
          </div>
          <span className="text-[10px] bg-amber-950 text-amber-500 border border-amber-900 px-2 py-0.5 rounded-full font-bold">
            ACTIVE OPTIMIZATION
          </span>
        </div>

        <div className="space-y-6">
          {reallocations.length > 0 ? (
            reallocations.map((rec, idx) => (
              <div 
                key={idx} 
                className="bg-cat-dark border border-cat-border p-6 rounded-xl space-y-4 shadow-lg"
              >
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-cat-text">OPTIMIZATION OPPORTUNITY</h4>
                    </div>
                    <p className="text-xs text-cat-gray">Machine: <span className="text-cat-yellow font-bold">{rec.equipmentId} ({rec.name})</span></p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-2.5 py-0.5 rounded-full font-bold">
                      Expected Util: {rec.currentUtilization}% &rarr; {rec.expectedUtilization}%
                    </span>
                  </div>
                </div>

                {/* Transfer Diagram */}
                <div className="bg-cat-card border border-cat-border p-4 rounded-lg flex items-center justify-around text-xs relative overflow-hidden">
                  <div className="text-center space-y-1 z-10">
                    <span className="text-[9px] text-cat-gray uppercase font-semibold">Current Site</span>
                    <p className="font-bold text-red-400">{rec.currentSiteName}</p>
                    <p className="text-[10px] text-cat-gray font-semibold">Util: {rec.currentUtilization}%</p>
                  </div>

                  <div className="flex flex-col items-center justify-center w-1/3 z-10">
                    <div className="w-full flex items-center gap-1">
                      <div className="h-0.5 flex-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
                      <ArrowRight size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[9px] text-cat-yellow uppercase font-extrabold tracking-wider mt-1.5 animate-pulse">MOVE ASSET</span>
                  </div>

                  <div className="text-center space-y-1 z-10">
                    <span className="text-[9px] text-cat-gray uppercase font-semibold">Target Site</span>
                    <p className="font-bold text-emerald-400">{rec.targetSiteName}</p>
                    <p className="text-[10px] text-cat-gray font-semibold">Demand: {rec.predictedDemand}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-cat-text leading-relaxed bg-cat-card/50 p-4 rounded-lg border border-cat-border/60">
                  <p><b>Analysis:</b> {rec.reason}</p>
                  <p><b>Impact:</b> <span className="text-emerald-400 font-bold">{rec.savings}</span></p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    onClick={() => navigateToTab('equipment', rec.equipmentId)}
                    className="bg-cat-card border border-cat-border hover:border-cat-yellow text-cat-text font-bold py-2 px-4 rounded-lg text-xs transition-all"
                  >
                    Inspect Asset
                  </button>
                  <button 
                    onClick={() => executeReallocation(rec)}
                    className="bg-cat-yellow hover:bg-yellow-500 text-cat-dark font-extrabold py-2 px-5 rounded-lg text-xs uppercase tracking-wider transition-all duration-200"
                  >
                    Execute Reallocation
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-cat-gray bg-cat-dark border border-cat-border p-6 rounded-xl text-center">
              All active assets are running within normal utilization ranges. No reallocation optimizations needed today.
            </p>
          )}
        </div>
      </div>

      {/* 2. DEMAND FORECASTING SERVICE (User Specification #8) */}
      <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-6">
        <div>
          <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-cat-yellow" />
            AI Demand Forecasting
          </h3>
          <p className="text-xs text-cat-gray mt-1">Train a Random Forest model on historical rentals to forecast demand trends by site and machine type.</p>
        </div>

        {/* Control Box */}
        <div className="bg-cat-dark border border-cat-border p-5 rounded-xl flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] text-cat-gray font-bold uppercase">Select Job Site</label>
            <select
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              className="bg-cat-card border border-cat-border rounded-lg px-3 py-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-cat-gray font-bold uppercase">Equipment Category</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-cat-card border border-cat-border rounded-lg px-3 py-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
            >
              <option value="Excavator">Excavators</option>
              <option value="Bulldozer">Bulldozers</option>
              <option value="Crane">Cranes</option>
              <option value="Grader">Graders</option>
            </select>
          </div>

          <button
            onClick={runForecast}
            disabled={forecastLoading}
            className="bg-cat-yellow hover:bg-yellow-500 disabled:bg-cat-border text-cat-dark font-extrabold px-6 py-2 rounded-lg text-xs uppercase tracking-wider transition-all duration-150 flex items-center gap-2"
          >
            {forecastLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Computing ML Model...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Run AI Forecast</span>
              </>
            )}
          </button>
        </div>

        {/* Forecast Display */}
        {forecastResult && (
          <div className="space-y-4 animate-slideIn bg-cat-dark border border-cat-border p-6 rounded-xl">
            <div className="flex justify-between items-center border-b border-cat-border pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-cat-text uppercase">AI DEMAND FORECAST</h4>
                <p className="text-[10px] text-cat-gray mt-0.5">Category: {forecastResult.equipmentType} | Site: {forecastResult.siteId}</p>
              </div>
              <span className="text-[10px] bg-cat-yellow/10 text-cat-yellow border border-cat-yellow/30 px-2 py-0.5 rounded font-bold uppercase">
                {forecastResult.source}
              </span>
            </div>

            {/* 7 Day Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecastResult.forecast.map((f, i) => {
                const dateObj = new Date(f.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

                return (
                  <div key={i} className="bg-cat-card border border-cat-border p-3.5 rounded-lg text-center space-y-1">
                    <p className="text-[10px] text-cat-gray font-bold uppercase">{dayName}</p>
                    <p className="text-[10px] font-semibold text-cat-text">{dateStr}</p>
                    
                    <div className="pt-2">
                      <span className="text-lg font-extrabold text-cat-yellow">{f.predictedRentals}</span>
                      <span className="text-[9px] text-cat-gray block">Predicted demand</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Smart Insight from Forecast */}
            <div className="bg-amber-950/20 border border-amber-900/60 p-4 rounded-lg text-xs space-y-1">
              <h5 className="font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500 animate-pulse" /> AI Forecast recommendation
              </h5>
              
              {forecastResult.equipmentType === 'Excavator' && forecastResult.siteId === 'S003' ? (
                <div className="text-cat-text">
                  <p>⚡ <b>High excavator demand</b> predicted at Harbor Expansion Site (Site S003) over the next 7 days.</p>
                  <p className="text-cat-gray text-[10px] mt-1 font-semibold">Recommended Action: Move EQX1004 from Highway Bypass (Site S004) to Site S003 to absorb demand and maximize utilization.</p>
                </div>
              ) : (
                <p className="text-cat-text">
                  Demand remains stable. Continue regular deployment schedule. No reallocation actions needed for {forecastResult.equipmentType}s at Site {forecastResult.siteId}.
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
