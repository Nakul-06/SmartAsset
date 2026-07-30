import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  MapPin, 
  User, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function CheckInOut({ equipment, sites, operators, fetchData, initialAssetId, clearParentAssetId }) {
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId || '');
  const [actionType, setActionType] = useState('checkout'); // 'checkout' or 'checkin'
  
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Form states
  const [destinationSite, setDestinationSite] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('2026-08-15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sync initial asset if passed from parent
  useEffect(() => {
    if (initialAssetId) {
      setSelectedAssetId(initialAssetId);
      const asset = equipment.find(e => e.equipmentId === initialAssetId);
      if (asset) {
        setActionType(asset.status === 'Active' ? 'checkin' : 'checkout');
      }
    }
  }, [initialAssetId, equipment]);

  const selectedAsset = equipment.find(e => e.equipmentId === selectedAssetId);

  // Simulate scanning action
  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setSuccessMessage(null);

    // Simulate scanning for 2 seconds, then randomly "detect" a machine
    // Prioritize EQX1003 (as mentioned in the user flow) or the selected dropdown asset
    setTimeout(() => {
      setIsScanning(false);
      const targetId = selectedAssetId || 'EQX1003';
      setScanResult(targetId);
      setSelectedAssetId(targetId);
      
      const asset = equipment.find(e => e.equipmentId === targetId);
      if (asset) {
        setActionType(asset.status === 'Active' ? 'checkin' : 'checkout');
      }
    }, 2200);
  };

  // Submit Checkout API
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !destinationSite || !selectedOperator || !expectedReturn) {
      alert('Please fill out all checkout fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5001/api/equipment/${selectedAssetId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: destinationSite,
          operatorId: selectedOperator,
          checkOutDate: expectedReturn
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage({
          type: 'CHECKOUT',
          message: `✓ Equipment checked out successfully`,
          details: `${selectedAssetId} → Site ${destinationSite}`,
          operator: `Operator → ${selectedOperator}`
        });
        setSelectedAssetId('');
        setDestinationSite('');
        setSelectedOperator('');
        if (clearParentAssetId) clearParentAssetId();
        await fetchData();
      } else {
        alert('Failed to check out equipment.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Checkin API
  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5001/api/equipment/${selectedAssetId}/checkin`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccessMessage({
          type: 'CHECKIN',
          message: `✓ Equipment returned successfully`,
          details: `${selectedAssetId} is now Unassigned.`,
          operator: 'Available in local fleet yard.'
        });
        setSelectedAssetId('');
        if (clearParentAssetId) clearParentAssetId();
        await fetchData();
      } else {
        alert('Failed to check in equipment.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. CHOOSE ACTION TYPE */}
      <div className="flex gap-4">
        <button
          onClick={() => { setActionType('checkout'); setSuccessMessage(null); }}
          className={`flex-1 py-3 px-6 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
            actionType === 'checkout'
              ? 'bg-cat-yellow border-cat-yellow text-cat-dark'
              : 'bg-cat-card border-cat-border text-cat-gray hover:text-cat-text'
          }`}
        >
          Check Out (Deploy Machine)
        </button>
        <button
          onClick={() => { setActionType('checkin'); setSuccessMessage(null); }}
          className={`flex-1 py-3 px-6 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
            actionType === 'checkin'
              ? 'bg-cat-yellow border-cat-yellow text-cat-dark'
              : 'bg-cat-card border-cat-border text-cat-gray hover:text-cat-text'
          }`}
        >
          Check In (Return Machine)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: QR CODE SIMULATION & CAMERA VIEWFINDER */}
        <div className="bg-cat-card border border-cat-border p-6 rounded-xl space-y-6 flex flex-col justify-center items-center relative min-h-[350px]">
          
          {isScanning ? (
            /* Viewfinder Camera Simulation */
            <div className="w-full aspect-square max-w-[280px] bg-black rounded-lg border border-cat-border relative overflow-hidden flex flex-col items-center justify-center">
              {/* Scan grid and laser line */}
              <div className="absolute top-0 bottom-0 left-0 right-0 border-[30px] border-black/70 z-10" />
              <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-dashed border-emerald-500 z-10 rounded" />
              <div className="w-full h-0.5 bg-emerald-400 absolute top-10 shadow-[0_0_8px_#10B981] animate-scanner z-20" />
              
              <Camera size={48} className="text-cat-gray animate-pulse" />
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-3 z-20">Scanning QR Code...</p>
            </div>
          ) : successMessage ? (
            /* Success Feedback Card */
            <div className="w-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-cat-text text-base">{successMessage.message}</h4>
                <p className="text-sm font-semibold text-emerald-400 mt-1">{successMessage.details}</p>
                <p className="text-xs text-cat-gray mt-0.5">{successMessage.operator}</p>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="mt-4 bg-cat-dark border border-cat-border text-cat-gray hover:text-cat-text px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
              >
                Scan Another Machine
              </button>
            </div>
          ) : (
            /* Static QR Representation */
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-cat-yellow flex flex-col items-center">
                {/* SVG Mock QR Code */}
                <svg className="w-36 h-36" viewBox="0 0 100 100" shapeRendering="crispEdges">
                  <path fill="#ffffff" d="M0,0 h100 v100 H0 z" />
                  {/* Position detection markers */}
                  <path fill="#1c1c1e" d="M0,0 h30 v30 H0 z M70,0 h30 v30 H70 z M0,70 h30 v30 H0 z" />
                  <path fill="#ffffff" d="M10,10 h10 v10 H10 z M80,10 h10 v10 H80 z M10,80 h10 v10 H10 z" />
                  {/* Random pixels to look like a barcode */}
                  <path fill="#1c1c1e" d="M40,5 h10 v10 H40 z M55,5 h10 v5 H55 z M45,20 h10 v10 H45 z M15,40 h15 v5 H15 z M50,45 h15 v15 H50 z M35,60 h10 v10 H35 z M75,45 h20 v10 H75 z M65,75 h25 v15 H65 z M40,80 h15 v5 H40 z" />
                </svg>
                <div className="text-center mt-3 text-cat-dark">
                  <p className="font-extrabold text-sm">{selectedAssetId || 'EQX1003'}</p>
                  <p className="text-[10px] font-bold text-cat-gray uppercase">{selectedAsset?.type || 'Bulldozer'}</p>
                </div>
              </div>

              <button
                onClick={handleStartScan}
                className="bg-cat-yellow hover:bg-yellow-500 text-cat-dark font-extrabold py-3 px-8 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shadow-md shadow-cat-yellow/20"
              >
                <Camera size={16} />
                <span>Scan Equipment QR</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: DEPLOYMENT / RETURN FORM PANEL */}
        <div className="bg-cat-card border border-cat-border p-6 rounded-xl">
          <h3 className="font-bold text-cat-text text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
            <QrCode size={16} className="text-cat-yellow" />
            {actionType === 'checkout' ? 'Check-out Deployment Form' : 'Check-in Return Form'}
          </h3>

          <form onSubmit={actionType === 'checkout' ? handleCheckoutSubmit : handleCheckinSubmit} className="space-y-5">
            {/* 1. Equipment Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-cat-gray font-semibold">Select Equipment</label>
              <select
                value={selectedAssetId}
                onChange={e => setSelectedAssetId(e.target.value)}
                className="w-full bg-cat-dark border border-cat-border rounded-lg px-4 py-2.5 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
              >
                <option value="">-- Choose Equipment --</option>
                {/* Group dropdown by availability */}
                <optgroup label="Available (Unassigned)">
                  {equipment.filter(e => e.status === 'Unassigned').map(e => (
                    <option key={e.equipmentId} value={e.equipmentId}>{e.equipmentId} - {e.name} ({e.type})</option>
                  ))}
                </optgroup>
                <optgroup label="Deployed (Active)">
                  {equipment.filter(e => e.status === 'Active').map(e => (
                    <option key={e.equipmentId} value={e.equipmentId}>{e.equipmentId} - {e.name} ({e.type})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {selectedAsset && (
              <div className="bg-cat-dark border border-cat-border p-3.5 rounded-lg grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-cat-gray font-semibold">Category</p>
                  <p className="font-bold text-cat-text mt-0.5">{selectedAsset.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-cat-gray font-semibold">Current Location</p>
                  <p className="font-bold text-cat-text mt-0.5">{selectedAsset.siteId ? `Site ${selectedAsset.siteId}` : 'Equipment Yard'}</p>
                </div>
              </div>
            )}

            {actionType === 'checkout' ? (
              /* Checkout Form Fields */
              <>
                {/* 2. Destination Job Site */}
                <div className="space-y-1.5">
                  <label className="text-xs text-cat-gray font-semibold">Destination Site</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cat-gray pointer-events-none">
                      <MapPin size={14} />
                    </span>
                    <select
                      value={destinationSite}
                      onChange={e => setDestinationSite(e.target.value)}
                      required
                      className="w-full bg-cat-dark border border-cat-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
                    >
                      <option value="">-- Select Destination --</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.id} - {site.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Operator Assignment */}
                <div className="space-y-1.5">
                  <label className="text-xs text-cat-gray font-semibold">Operator ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cat-gray pointer-events-none">
                      <User size={14} />
                    </span>
                    <select
                      value={selectedOperator}
                      onChange={e => setSelectedOperator(e.target.value)}
                      required
                      className="w-full bg-cat-dark border border-cat-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
                    >
                      <option value="">-- Assign Operator --</option>
                      {operators.map(op => (
                        <option key={op.id} value={op.id}>{op.id} - {op.name} ({op.certification})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Expected Return Date */}
                <div className="space-y-1.5">
                  <label className="text-xs text-cat-gray font-semibold">Expected Return Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cat-gray pointer-events-none">
                      <Calendar size={14} />
                    </span>
                    <input
                      type="date"
                      value={expectedReturn}
                      onChange={e => setExpectedReturn(e.target.value)}
                      required
                      className="w-full bg-cat-dark border border-cat-border rounded-lg pl-9 pr-4 py-2 text-xs text-cat-text focus:outline-none focus:border-cat-yellow"
                    />
                  </div>
                </div>

                {/* Checkout Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAssetId}
                  className="w-full bg-cat-yellow hover:bg-yellow-500 disabled:bg-cat-border disabled:text-cat-gray text-cat-dark font-extrabold py-3 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 mt-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Checking Out...' : 'Confirm Check-out'}
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              /* Checkin Form Fields */
              <>
                {selectedAsset && selectedAsset.status !== 'Active' ? (
                  <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-lg flex items-start gap-2.5 text-xs text-red-400">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>This equipment is already checked in (Unassigned). You can only return equipment that is currently deployed on active lease.</p>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-900/60 p-4 rounded-lg text-xs text-emerald-400 space-y-1">
                    <p className="font-semibold">Return Logistics:</p>
                    <p className="text-cat-gray text-[10px]">Machine telemetry will be locked. Hours will be archived into history, and site S00{selectedAsset?.siteId} allocation will clear.</p>
                  </div>
                )}

                {/* Checkin Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAssetId || (selectedAsset && selectedAsset.status !== 'Active')}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-cat-border disabled:text-cat-gray text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors mt-2"
                >
                  {isSubmitting ? 'Checking In...' : 'Confirm Return (Check-In)'}
                </button>
              </>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
