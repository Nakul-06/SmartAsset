import React, { useState, useEffect } from 'react';
import { Shield, User, HardHat, Key } from 'lucide-react';

export default function Login({ onLogin, operators = [], equipment = [] }) {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [selectedOperatorId, setSelectedOperatorId] = useState('');

  // Sort operators so that special demo profiles are at the top of the dropdown
  const sortedOperators = [...operators].sort((a, b) => {
    const primaryIds = ['OP101', 'OP203', 'OP103', 'OP102'];
    const aIdx = primaryIds.indexOf(a.id);
    const bIdx = primaryIds.indexOf(b.id);
    
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.id.localeCompare(b.id);
  });

  // Set default selection when operators list loads
  useEffect(() => {
    if (sortedOperators.length > 0 && !selectedOperatorId) {
      setSelectedOperatorId(sortedOperators[0].id);
    }
  }, [sortedOperators, selectedOperatorId]);

  // Find selected operator metadata
  const currentOp = sortedOperators.find(o => o.id === selectedOperatorId);

  // Determine dynamic asset assignment description
  const myAsset = currentOp 
    ? equipment.find(e => e.operatorId === currentOp.id && e.status === 'Active') 
    : null;

  const isOverdue = myAsset?.status === 'Active' && 
                    myAsset?.checkOutDate && 
                    new Date(myAsset.checkOutDate) < new Date('2026-07-30');

  let opNote = 'No active machine (Request portal)';
  if (myAsset) {
    if (isOverdue) {
      opNote = `Assigned to ${myAsset.equipmentId} (${myAsset.name}) — OVERDUE`;
    } else {
      opNote = `Assigned to ${myAsset.equipmentId} (${myAsset.name}) — Active, ${myAsset.utilization}% Util`;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === 'admin') {
      onLogin({ role: 'admin', name: 'Fleet Supervisor' });
    } else if (currentOp) {
      onLogin({ 
        role: 'operator', 
        id: currentOp.id, 
        name: currentOp.name, 
        cert: currentOp.certification || 'General Heavy Equipment' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-cat-dark flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-4xl bg-cat-card rounded-2xl border border-cat-border overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[480px] animate-fadeIn">
        
        {/* LEFT PANEL: Brand Info */}
        <div className="flex-1 bg-gradient-to-br from-cat-yellow to-yellow-600 p-10 flex flex-col justify-between text-cat-dark relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cat-dark flex items-center justify-center font-black text-cat-yellow text-xl">
              CAT
            </div>
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-cat-dark">SmartRent AI</h2>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Fleet Systems</span>
            </div>
          </div>

          <div className="space-y-4 my-8">
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none">
              EQUIPMENT & RENTAL INTELLIGENCE
            </h1>
            <p className="text-xs font-semibold opacity-90 leading-relaxed">
              Log in to access live telematics feeds, smart fleet optimization recommendations, and QR-guided check-in/out services.
            </p>
          </div>

          <div className="text-[10px] font-bold tracking-widest opacity-80 border-t border-cat-dark/20 pt-4 flex justify-between">
            <span>VISIONLINK COMPATIBLE</span>
            <span>v2.1.0</span>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="flex-1 p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-cat-text uppercase">System Authorization</h3>
            <p className="text-xs text-cat-gray">Select your operational profile below to enter the portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Tab selection */}
            <div className="flex bg-cat-dark border border-cat-border p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                  selectedRole === 'admin' 
                    ? 'bg-cat-yellow text-cat-dark' 
                    : 'text-cat-gray hover:text-cat-text'
                }`}
              >
                <Shield size={14} />
                <span>Fleet Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('operator')}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                  selectedRole === 'operator' 
                    ? 'bg-cat-yellow text-cat-dark' 
                    : 'text-cat-gray hover:text-cat-text'
                }`}
              >
                <HardHat size={14} />
                <span>Operator / Requester</span>
              </button>
            </div>

            {selectedRole === 'admin' ? (
              /* Fleet Manager Info */
              <div className="bg-cat-dark border border-cat-border p-4 rounded-xl space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Key className="text-cat-yellow shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-semibold text-cat-text">Administrator Credentials</p>
                    <p className="text-cat-gray text-[10px] mt-0.5">Grants full workspace read/write access: dashboards, Live GPS map, ML analytics, alerts, and reallocation engines.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Operator Selection Dropdown */
              <div className="space-y-2">
                <label className="text-[10px] text-cat-gray uppercase font-bold tracking-wider">Choose Operator Profile</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cat-gray pointer-events-none">
                    <User size={14} />
                  </span>
                  <select
                    value={selectedOperatorId}
                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                    className="w-full bg-cat-dark border border-cat-border rounded-lg pl-9 pr-4 py-3 text-xs text-cat-text focus:outline-none focus:border-cat-yellow cursor-pointer"
                  >
                    {sortedOperators.length > 0 ? (
                      sortedOperators.map(op => {
                        const isPrimary = ['OP101', 'OP203', 'OP103', 'OP102'].includes(op.id);
                        return (
                          <option key={op.id} value={op.id}>
                            {isPrimary ? '⭐ ' : ''}{op.name} ({op.id}) - {op.certification || 'Heavy Operator'}
                          </option>
                        );
                      })
                    ) : (
                      <option value="">No operators loaded</option>
                    )}
                  </select>
                </div>

                {/* Micro helper description */}
                {currentOp && (
                  <div className="bg-cat-dark border border-cat-border p-3.5 rounded-lg text-[10px]">
                    <span className="text-cat-gray block">Status Profile:</span>
                    <span className={`font-bold mt-0.5 block ${isOverdue ? 'text-red-500' : 'text-cat-yellow'}`}>
                      {opNote}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={selectedRole === 'operator' && !selectedOperatorId}
              className="w-full bg-cat-yellow hover:bg-yellow-500 disabled:bg-cat-border text-cat-dark font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cat-yellow/10"
            >
              <span>Authenticate and Enter</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
