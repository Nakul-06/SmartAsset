import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Fuel, 
  Clock, 
  MapPin, 
  Calendar, 
  HardHat, 
  AlertTriangle,
  CheckCircle,
  QrCode,
  LogOut,
  Sparkles,
  ArrowRight,
  Truck,
  Activity
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function OperatorPortal({ user, equipment, sites, fetchData, onLogout }) {
  const [destinationSite, setDestinationSite] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('2026-08-15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [operatorTab, setOperatorTab] = useState('lease');
  const [gallerySearchTerm, setGallerySearchTerm] = useState('');

  // Map refs
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markerRef = useRef(null);

  // Find the operator's current active equipment
  // It could be active and assigned to their operatorId
  const myAsset = equipment.find(e => e.operatorId === user.id && e.status === 'Active');

  // Filter unassigned machines by search term
  const filteredUnassigned = equipment
    .filter(e => e.status === 'Unassigned')
    .filter(e => 
      e.equipmentId.toLowerCase().includes(gallerySearchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(gallerySearchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(gallerySearchTerm.toLowerCase())
    );

  // Load Map when asset exists and coordinates are available
  useEffect(() => {
    if (myAsset && myAsset.location && mapRef.current) {
      const { latitude, longitude } = myAsset.location;

      if (!leafletMapInstance.current) {
        leafletMapInstance.current = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 14,
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(leafletMapInstance.current);

        markerRef.current = L.marker([latitude, longitude]).addTo(leafletMapInstance.current);
      } else {
        leafletMapInstance.current.setView([latitude, longitude], 14);
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }

    // Cleanup map instance if asset is checked in
    if (!myAsset && leafletMapInstance.current) {
      leafletMapInstance.current.remove();
      leafletMapInstance.current = null;
      markerRef.current = null;
    }
  }, [myAsset]);

  // Handle return check-in
  const handleCheckIn = async () => {
    if (!myAsset) return;
    const confirmReturn = window.confirm(`Confirm check-in return for ${myAsset.equipmentId}?`);
    if (!confirmReturn) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/equipment/${myAsset.equipmentId}/checkin`, {
        method: 'POST'
      });
      if (response.ok) {
        setSuccessMsg(`✓ ${myAsset.equipmentId} successfully returned to the fleet yard.`);
        setSelectedAssetId('');
        setDestinationSite('');
        await fetchData();
      } else {
        alert('Check-in failed');
      }
    } catch (e) {
      console.error(e);
      alert('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new checkout deployment request
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !destinationSite || !expectedReturn) {
      alert('Please fill out all request fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/equipment/${selectedAssetId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: destinationSite,
          operatorId: user.id,
          checkOutDate: expectedReturn
        })
      });

      if (response.ok) {
        setSuccessMsg(`✓ Equipment ${selectedAssetId} checked out. Welcome to your new active duty!`);
        await fetchData();
      } else {
        alert('Checkout deployment request failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = myAsset && myAsset.status === 'Active' && myAsset.checkOutDate 
    ? new Date(myAsset.checkOutDate) < new Date('2026-07-30') 
    : false;
  const isLowUtil = myAsset && myAsset.status === 'Active' 
    ? myAsset.utilization < 20 
    : false;

  return (
    <div className="min-h-screen bg-cat-dark font-sans text-cat-text flex flex-col">
      {/* 1. TOP PORTAL HEADER */}
      <header className="h-16 border-b border-cat-border bg-cat-card px-6 md:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cat-yellow flex items-center justify-center font-black text-cat-dark text-sm">
            OP
          </div>
          <div>
            <h1 className="font-extrabold text-sm uppercase tracking-wide text-cat-text">SmartRent Operator Portal</h1>
            <span className="text-[10px] text-cat-gray font-semibold">User Profile: {user.name} ({user.id})</span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="bg-cat-hover hover:bg-cat-border border border-cat-border text-cat-gray hover:text-cat-text px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </header>

      {/* Tabs Navigation */}
      <div className="flex bg-cat-card border-b border-cat-border px-6 md:px-12 py-1 gap-4 shrink-0">
        <button
          onClick={() => setOperatorTab('lease')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            operatorTab === 'lease'
              ? 'border-cat-yellow text-cat-yellow'
              : 'border-transparent text-cat-gray hover:text-cat-text'
          }`}
        >
          {myAsset ? 'My Active Lease' : 'Deploy Equipment'}
        </button>
        <button
          onClick={() => setOperatorTab('gallery')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            operatorTab === 'gallery'
              ? 'border-cat-yellow text-cat-yellow'
              : 'border-transparent text-cat-gray hover:text-cat-text'
          }`}
        >
          Available Fleet ({equipment.filter(e => e.status === 'Unassigned').length})
        </button>
      </div>

      {/* 2. SUB-PORTAL MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 overflow-y-auto">
        {successMsg && (
          <div className="mb-6 bg-emerald-950/20 border border-emerald-900/60 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-400 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-cat-gray hover:text-cat-text font-bold">Dismiss</button>
          </div>
        )}

        {operatorTab === 'gallery' ? (
          /* AVAILABLE FLEET GALLERY */
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-cat-text uppercase">Available Fleet Gallery</h3>
                <p className="text-xs text-cat-gray">Browse unassigned heavy equipment in the yard ready for lease deployment.</p>
              </div>
              
              {/* Search input in gallery view */}
              <input
                type="text"
                placeholder="🔍 Search available machines..."
                value={gallerySearchTerm}
                onChange={e => setGallerySearchTerm(e.target.value)}
                className="w-full md:w-80 bg-cat-card border border-cat-border rounded-xl px-4 py-2.5 text-xs text-cat-text focus:outline-none focus:border-cat-yellow"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnassigned.length > 0 ? (
                filteredUnassigned
                  .map(asset => {
                    let MachineIcon = HardHat;
                    if (asset.type === 'Excavator') MachineIcon = Truck;
                    if (asset.type === 'Crane') MachineIcon = Activity;
                    if (asset.type === 'Bulldozer') MachineIcon = HardHat;

                    return (
                      <div key={asset.equipmentId} className="bg-cat-card border border-cat-border p-5 rounded-xl space-y-4 flex flex-col justify-between hover:border-cat-yellow/60 transition-colors">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] bg-cat-dark border border-cat-border px-2.5 py-0.5 rounded-full text-cat-gray font-bold uppercase tracking-wider">
                                {asset.type}
                              </span>
                              <h4 className="font-extrabold text-cat-text mt-1.5 text-sm">{asset.name}</h4>
                              <p className="text-[10px] text-cat-gray font-bold uppercase">{asset.equipmentId}</p>
                            </div>
                            <div className="p-2 bg-cat-dark border border-cat-border rounded-lg text-cat-yellow">
                              <MachineIcon size={16} />
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 text-xs">
                            <div className="flex justify-between text-cat-gray">
                              <span>Fuel Level</span>
                              <span className="font-bold text-cat-text">{Math.round(asset.fuelLevel)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-cat-dark rounded-full overflow-hidden border border-cat-border">
                              <div style={{ width: `${asset.fuelLevel}%` }} className="h-full bg-amber-500" />
                            </div>
                          </div>

                          <div className="pt-2 text-[10px] text-cat-gray border-t border-cat-border/60 flex justify-between">
                            <span>Status: READY</span>
                            <span>Yard Chennai</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (myAsset) {
                              alert(`Active lease exists: You are currently operating ${myAsset.equipmentId}. Please return it before deploying another machine.`);
                              return;
                            }
                            setSelectedAssetId(asset.equipmentId);
                            setOperatorTab('lease');
                          }}
                          className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            myAsset 
                              ? 'bg-cat-dark border border-cat-border text-cat-gray cursor-not-allowed' 
                              : 'bg-cat-yellow hover:bg-yellow-500 text-cat-dark'
                          }`}
                        >
                          {myAsset ? 'Lease Locked' : 'Deploy Machine'}
                        </button>
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-full bg-cat-card border border-cat-border p-10 rounded-xl text-center text-cat-gray text-xs">
                  No unassigned machinery currently available in the fleet yard.
                </div>
              )}
            </div>
          </div>
        ) : myAsset ? (
          /* ACTIVE EQUIPMENT VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2 COLUMNS: Machinery Telematics Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Overdue/Expiration Alert Banner */}
              {isOverdue && (
                <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-xl flex items-start gap-3 text-xs text-red-400 animate-pulse">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase">Return Overdue Alert</p>
                    <p className="text-[10px] text-cat-gray mt-0.5">Lease for {myAsset.equipmentId} expired on {new Date(myAsset.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}. Return or extend lease.</p>
                  </div>
                </div>
              )}

              {isLowUtil && !isOverdue && (
                <div className="bg-amber-950/20 border border-amber-900/60 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-500">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase">Low Utilization Detected</p>
                    <p className="text-[10px] text-cat-gray mt-0.5">Your machine has high idle hours ({myAsset.idleHoursPerDay.toFixed(1)}h/day) vs running hours ({myAsset.engineHoursPerDay.toFixed(1)}h/day). Ensure correct operating status.</p>
                  </div>
                </div>
              )}

              {/* Asset Card Info */}
              <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-cat-dark border border-cat-border px-2.5 py-0.5 rounded-full text-cat-gray font-bold uppercase tracking-wider">
                      {myAsset.type}
                    </span>
                    <h3 className="text-xl font-extrabold text-cat-text mt-2 uppercase">{myAsset.name}</h3>
                    <p className="text-xs text-cat-gray font-bold uppercase">{myAsset.equipmentId}</p>
                  </div>

                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    🟢 DEPLOYED ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-b border-cat-border/60 py-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] text-cat-gray uppercase font-semibold">Active Job Site</p>
                    <p className="font-bold text-cat-text flex items-center gap-1">
                      <MapPin size={12} className="text-cat-yellow" />
                      Site {myAsset.siteId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-cat-gray uppercase font-semibold">Certification Requirement</p>
                    <p className="font-bold text-cat-text flex items-center gap-1">
                      <HardHat size={12} className="text-cat-yellow" />
                      {user.cert}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[10px] text-cat-gray uppercase font-semibold">Return Due Date</p>
                    <p className={`font-bold ${isOverdue ? 'text-red-500' : 'text-cat-text'} flex items-center gap-1`}>
                      <Calendar size={12} className="text-cat-yellow" />
                      {new Date(myAsset.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Telematics Metrics */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[10px] text-cat-gray font-bold uppercase tracking-wider">Telemetry Statistics</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-cat-dark border border-cat-border p-4 rounded-xl space-y-1">
                      <Clock size={16} className="mx-auto text-cat-yellow" />
                      <span className="text-[9px] text-cat-gray block">Engine Hours/Day</span>
                      <p className="text-sm font-extrabold text-cat-text">{myAsset.engineHoursPerDay.toFixed(1)} hrs</p>
                    </div>

                    <div className="bg-cat-dark border border-cat-border p-4 rounded-xl space-y-1">
                      <Clock size={16} className="mx-auto text-cat-yellow" />
                      <span className="text-[9px] text-cat-gray block">Idle Hours/Day</span>
                      <p className="text-sm font-extrabold text-cat-text">{myAsset.idleHoursPerDay.toFixed(1)} hrs</p>
                    </div>

                    <div className="bg-cat-dark border border-cat-border p-4 rounded-xl space-y-1">
                      <Fuel size={16} className="mx-auto text-amber-500 animate-pulse" />
                      <span className="text-[9px] text-cat-gray block">Fuel Level</span>
                      <p className="text-sm font-extrabold text-cat-text">{Math.round(myAsset.fuelLevel)}%</p>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="space-y-1.5 bg-cat-dark border border-cat-border p-4 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-cat-gray uppercase text-[10px]">Machine Running Efficiency (Utilization)</span>
                      <span className={isLowUtil ? 'text-red-400' : 'text-emerald-400'}>{myAsset.utilization}%</span>
                    </div>
                    <div className="h-3 w-full bg-cat-card rounded-full overflow-hidden border border-cat-border">
                      <div 
                        style={{ width: `${myAsset.utilization}%` }}
                        className={`h-full ${isLowUtil ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Leaflet Map: Where Is My Machine */}
              <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={16} className="text-cat-yellow" /> Live GPS Tracking Node
                  </h3>
                  <span className="text-[9px] text-cat-gray font-medium">Node updates every 3 seconds</span>
                </div>
                <div className="h-64 border border-cat-border rounded-lg overflow-hidden relative">
                  <div ref={mapRef} className="absolute inset-0 z-10" />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: QR Check-In Console */}
            <div className="space-y-6">
              
              {/* QR Mock Display */}
              <div className="bg-cat-card border border-cat-border p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-cat-yellow flex flex-col items-center">
                  <svg className="w-32 h-32" viewBox="0 0 100 100" shapeRendering="crispEdges">
                    <path fill="#ffffff" d="M0,0 h100 v100 H0 z" />
                    <path fill="#1c1c1e" d="M0,0 h30 v30 H0 z M70,0 h30 v30 H70 z M0,70 h30 v30 H0 z" />
                    <path fill="#ffffff" d="M10,10 h10 v10 H10 z M80,10 h10 v10 H80 z M10,80 h10 v10 H10 z" />
                    <path fill="#1c1c1e" d="M40,5 h10 v10 H40 z M55,5 h10 v5 H55 z M45,20 h10 v10 H45 z M15,40 h15 v5 H15 z M50,45 h15 v15 H50 z M35,60 h10 v10 H35 z M75,45 h20 v10 H75 z M65,75 h25 v15 H65 z M40,80 h15 v5 H40 z" />
                  </svg>
                  <p className="text-cat-dark font-extrabold text-xs mt-3">{myAsset.equipmentId}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-cat-text">QR Returns Terminal</h4>
                  <p className="text-[10px] text-cat-gray leading-relaxed">Present this QR code to the logistics coordinator or click below to return the equipment.</p>
                </div>

                <button 
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-cat-border text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  <span>Return Equipment</span>
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* NO ASSIGNED EQUIPMENT: Request Checkout Form */
          <div className="max-w-xl mx-auto bg-cat-card border border-cat-border p-8 rounded-2xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2 border-b border-cat-border pb-5">
              <div className="w-12 h-12 bg-cat-yellow/10 border border-cat-yellow/20 rounded-full flex items-center justify-center mx-auto text-cat-yellow">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-cat-text uppercase">No Assigned Machinery</h3>
              <p className="text-xs text-cat-gray">Select an available heavy machine to deploy onto your project site.</p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              {/* Select Equipment dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-cat-gray font-semibold">Select Available Machine</label>
                
                {/* Search bar above dropdown */}
                <input
                  type="text"
                  placeholder="🔍 Type to filter available machines..."
                  value={gallerySearchTerm}
                  onChange={e => setGallerySearchTerm(e.target.value)}
                  className="w-full bg-cat-dark border border-cat-border rounded-lg px-3 py-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow mb-2"
                />

                <select
                  value={selectedAssetId}
                  onChange={e => setSelectedAssetId(e.target.value)}
                  required
                  className="w-full bg-cat-dark border border-cat-border rounded-lg px-4 py-2.5 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
                >
                  <option value="">-- Choose Machine --</option>
                  {filteredUnassigned.map(e => (
                    <option key={e.equipmentId} value={e.equipmentId}>
                      {e.equipmentId} - {e.name} ({e.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Site dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-cat-gray font-semibold">Project Site Destination</label>
                <select
                  value={destinationSite}
                  onChange={e => setDestinationSite(e.target.value)}
                  required
                  className="w-full bg-cat-dark border border-cat-border rounded-lg px-4 py-2.5 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
                >
                  <option value="">-- Select Destination Site --</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.id} - {site.name}</option>
                  ))}
                </select>
              </div>

              {/* Expected Return Date picker */}
              <div className="space-y-1.5">
                <label className="text-xs text-cat-gray font-semibold">Expected Return Date</label>
                <input
                  type="date"
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(e.target.value)}
                  required
                  className="w-full bg-cat-dark border border-cat-border rounded-lg px-4 py-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedAssetId || !destinationSite}
                className="w-full bg-cat-yellow hover:bg-yellow-500 disabled:bg-cat-border disabled:text-cat-gray text-cat-dark font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 mt-4"
              >
                <span>Deploy Machine Checkout</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
