import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Fuel, 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  X,
  AlertTriangle,
  RefreshCw,
  Truck
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function EquipmentList({ 
  equipment, 
  sites, 
  operators, 
  selectedAssetId, 
  setSelectedAssetId,
  reallocations,
  fetchData,
  navigateToTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Find the selected asset details
  const selectedAsset = equipment.find(e => e.equipmentId === selectedAssetId);

  // Filter equipment list
  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || e.type === typeFilter;
    
    // Status filters
    let matchesStatus = true;
    if (statusFilter === 'Active') {
      matchesStatus = e.status === 'Active';
    } else if (statusFilter === 'Unassigned') {
      matchesStatus = e.status === 'Unassigned';
    } else if (statusFilter === 'Overdue') {
      // Overdue is active and due date < today (July 30, 2026)
      const today = new Date('2026-07-30');
      matchesStatus = e.status === 'Active' && e.checkOutDate && new Date(e.checkOutDate) < today;
    } else if (statusFilter === 'Low Usage') {
      matchesStatus = e.status === 'Active' && e.utilization < 20;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle equipment return (check in)
  const handleCheckIn = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/equipment/${id}/checkin`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchData();
        alert(`Equipment ${id} checked in successfully!`);
      } else {
        alert('Failed to check in equipment');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Find if selected asset has a reallocation recommendation
  const reallocationRec = reallocations.find(r => r.equipmentId === selectedAssetId);

  return (
    <div className="h-full flex gap-6 overflow-hidden animate-fadeIn">
      {/* LEFT: Equipment List Panel */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedAsset ? 'w-2/3' : 'w-full'}`}>
        
        {/* Search & Filters Header */}
        <div className="bg-cat-card border border-cat-border p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cat-gray pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by ID or Model..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-cat-dark border border-cat-border rounded-lg pl-9 pr-4 py-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow placeholder-cat-gray"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end">
            {/* Filter by Type */}
            <div className="flex items-center gap-1.5 bg-cat-dark border border-cat-border px-3 py-1.5 rounded-lg">
              <Filter size={12} className="text-cat-gray" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-cat-text focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-cat-card text-cat-text">All Categories</option>
                <option value="Excavator" className="bg-cat-card text-cat-text">Excavators</option>
                <option value="Bulldozer" className="bg-cat-card text-cat-text">Bulldozers</option>
                <option value="Crane" className="bg-cat-card text-cat-text">Cranes</option>
                <option value="Grader" className="bg-cat-card text-cat-text">Graders</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 bg-cat-dark border border-cat-border px-3 py-1.5 rounded-lg">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-cat-text focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-cat-card text-cat-text">All Statuses</option>
                <option value="Active" className="bg-cat-card text-cat-text">Active Rentals</option>
                <option value="Unassigned" className="bg-cat-card text-cat-text">Unassigned</option>
                <option value="Overdue" className="bg-cat-card text-cat-text">Overdue</option>
                <option value="Low Usage" className="bg-cat-card text-cat-text">Low Usage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map((asset) => {
                const isSelected = selectedAssetId === asset.equipmentId;
                const isOverdue = asset.status === 'Active' && asset.checkOutDate && new Date(asset.checkOutDate) < new Date('2026-07-30');
                const isLowUtil = asset.status === 'Active' && asset.utilization < 20;

                return (
                  <div
                    key={asset.equipmentId}
                    onClick={() => setSelectedAssetId(asset.equipmentId)}
                    className={`bg-cat-card border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-cat-yellow ring-1 ring-cat-yellow' 
                        : isOverdue
                          ? 'border-red-900 hover:border-red-500'
                          : 'border-cat-border hover:border-cat-yellow'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cat-gray tracking-wider">{asset.type}</span>
                        <h4 className="font-bold text-sm text-cat-text mt-0.5">{asset.name}</h4>
                        <p className="font-semibold text-cat-yellow text-xs mt-0.5">{asset.equipmentId}</p>
                      </div>

                      {/* Status Tag */}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        asset.status === 'Unassigned'
                          ? 'bg-red-950 text-red-400 border border-red-900'
                          : isOverdue
                            ? 'bg-red-600 text-white animate-pulse'
                            : isLowUtil
                              ? 'bg-amber-950 text-amber-500 border border-amber-900'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}>
                        {isOverdue ? 'Overdue' : isLowUtil ? 'Low Usage' : asset.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-cat-border/60 grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-[10px] text-cat-gray">Assignment</p>
                        <p className="font-semibold text-cat-text truncate">
                          {asset.siteId ? `Site ${asset.siteId}` : 'Unassigned'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-cat-gray">Utilization</p>
                        <p className={`font-semibold ${
                          asset.status === 'Active' 
                            ? asset.utilization >= 75 
                              ? 'text-emerald-400' 
                              : asset.utilization < 20 
                                ? 'text-red-400' 
                                : 'text-amber-400'
                            : 'text-cat-gray'
                        }`}>
                          {asset.status === 'Active' ? `${asset.utilization}%` : '0%'}
                        </p>
                      </div>

                      <div className="space-y-1 col-span-2 flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1.5 text-cat-gray">
                          <Fuel size={12} className="text-amber-500" />
                          <span>{Math.round(asset.fuelLevel)}%</span>
                        </div>

                        <div className="flex items-center gap-1 text-cat-gray">
                          <Clock size={12} />
                          <span>{(asset.engineHoursPerDay + asset.idleHoursPerDay).toFixed(1)}h/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-cat-card border border-cat-border p-12 rounded-xl text-center">
                <p className="text-cat-gray text-sm">No equipment found matching criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Selected Equipment Details Panel (User Specification #2) */}
      {selectedAsset && (
        <div className="w-80 bg-cat-card border border-cat-border rounded-xl p-6 flex flex-col justify-between shrink-0 overflow-y-auto animate-slideIn">
          <div className="space-y-6">
            
            {/* Header: Detail Title */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-cat-yellow">{selectedAsset.type} DETAILS</span>
                <h3 className="font-extrabold text-lg text-cat-text mt-0.5">{selectedAsset.equipmentId}</h3>
              </div>
              <button 
                onClick={() => setSelectedAssetId(null)}
                className="text-cat-gray hover:text-cat-text p-1 hover:bg-cat-hover rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* General Specs */}
            <div className="bg-cat-dark border border-cat-border p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-cat-gray flex items-center gap-1.5"><Truck size={12} /> Model</span>
                <span className="font-bold text-cat-text">{selectedAsset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-gray flex items-center gap-1.5"><MapPin size={12} /> Job Site</span>
                <span className="font-bold text-cat-text">{selectedAsset.siteId ? `Site ${selectedAsset.siteId}` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-gray flex items-center gap-1.5"><User size={12} /> Operator</span>
                <span className="font-bold text-cat-text">{selectedAsset.operatorId ? selectedAsset.operatorId : '—'}</span>
              </div>
            </div>

            {/* Check In / Out Dates */}
            <div className="bg-cat-dark border border-cat-border p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-cat-gray flex items-center gap-1.5"><Calendar size={12} /> Check Out Date</span>
                <span className="font-medium text-cat-text">
                  {selectedAsset.checkInDate ? new Date(selectedAsset.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-gray flex items-center gap-1.5"><Calendar size={12} /> Expected Return</span>
                <span className={`font-semibold ${selectedAsset.alert?.type === 'CRITICAL' ? 'text-red-500' : 'text-cat-text'}`}>
                  {selectedAsset.checkOutDate ? new Date(selectedAsset.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>

            {/* Telematics Metrics */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-cat-gray uppercase tracking-widest">Real-time Telematics</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cat-dark border border-cat-border p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-cat-gray">Engine Hours/Day</span>
                  <p className="text-sm font-extrabold text-cat-text">{selectedAsset.engineHoursPerDay.toFixed(1)} hrs</p>
                </div>
                <div className="bg-cat-dark border border-cat-border p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-cat-gray">Idle Hours/Day</span>
                  <p className="text-sm font-extrabold text-cat-text">{selectedAsset.idleHoursPerDay.toFixed(1)} hrs</p>
                </div>
              </div>

              {/* Fuel Level */}
              <div className="space-y-1 bg-cat-dark border border-cat-border p-4 rounded-xl">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-cat-gray flex items-center gap-1"><Fuel size={12} className="text-amber-500" /> Fuel Level</span>
                  <span>{Math.round(selectedAsset.fuelLevel)}%</span>
                </div>
                <div className="h-2 w-full bg-cat-card rounded-full overflow-hidden border border-cat-border">
                  <div 
                    style={{ width: `${selectedAsset.fuelLevel}%` }}
                    className={`h-full ${selectedAsset.fuelLevel < 20 ? 'bg-red-500' : 'bg-cat-yellow'}`}
                  />
                </div>
              </div>

              {/* Utilization dial/card */}
              <div className="bg-cat-dark border border-cat-border p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cat-gray uppercase font-semibold">Asset Utilization</span>
                  <h3 className="text-2xl font-extrabold text-cat-text mt-1">{selectedAsset.utilization}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-cat-border flex items-center justify-center relative">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-cat-yellow border-t-transparent border-l-transparent transition-transform duration-300"
                    style={{ transform: `rotate(${Math.round(selectedAsset.utilization * 3.6)}deg)` }}
                  />
                  <span className="text-[10px] font-bold">{selectedAsset.utilization}%</span>
                </div>
              </div>
            </div>

            {/* Smart Insight Box (User Specification #2) */}
            <div className="bg-amber-950/30 border border-amber-900/60 p-4 rounded-xl space-y-2 text-xs">
              <h5 className="font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500 animate-pulse" /> Smart Insight
              </h5>
              
              {selectedAsset.status === 'Unassigned' ? (
                <div className="space-y-1 text-cat-text">
                  <p>Equipment is idle and unassigned.</p>
                  <p className="text-cat-gray text-[10px]">Recommendation: Deploy to an active job site to start generating rental revenue.</p>
                </div>
              ) : selectedAsset.utilization < 20 ? (
                <div className="space-y-1 text-cat-text">
                  <p>This asset has excessive idle time ({selectedAsset.idleHoursPerDay.toFixed(1)} hrs/day).</p>
                  <p className="font-bold text-amber-500 mt-1">Recommendation:</p>
                  {reallocationRec ? (
                    <p className="text-amber-400 font-semibold bg-amber-950/50 p-2 rounded border border-amber-900/40">
                      Reallocate to {reallocationRec.targetSiteName} to boost utilization to {reallocationRec.expectedUtilization}%.
                    </p>
                  ) : (
                    <p className="text-cat-gray text-[10px]">Consider returning this asset or reallocating to another active site.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1 text-cat-text">
                  <p>Asset is running efficiently with {selectedAsset.utilization}% utilization.</p>
                  <p className="text-cat-gray text-[10px]">Recommendation: Maintenance team should log normal running hours.</p>
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 mt-6 border-t border-cat-border/60 flex gap-3">
            {selectedAsset.status === 'Active' ? (
              <button
                onClick={() => handleCheckIn(selectedAsset.equipmentId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              >
                Check In (Return)
              </button>
            ) : (
              <button
                onClick={() => navigateToTab('checkout', selectedAsset.equipmentId)} // Redirects to Check In/Out tab with this asset selected
                className="flex-1 bg-cat-yellow hover:bg-yellow-500 text-cat-dark font-extrabold py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Check Out (Deploy)</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
