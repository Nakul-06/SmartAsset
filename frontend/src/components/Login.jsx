import React, { useState } from 'react';
import { Shield, User, HardHat, Key } from 'lucide-react';

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [selectedOperatorId, setSelectedOperatorId] = useState('OP101');

  // Hardcoded operator profiles for demo convenience
  const operators = [
    { id: 'OP101', name: 'John Doe', cert: 'Excavator Level 2', note: 'Assigned to EQX1001 (Active, Low Util)' },
    { id: 'OP203', name: 'Alex Carter', cert: 'Bulldozer Specialist', note: 'Assigned to EQX1003 (Active, High Util)' },
    { id: 'OP103', name: 'Mike Ross', cert: 'Bulldozer Specialist', note: 'Assigned to EQX1006 (Overdue)' },
    { id: 'OP102', name: 'Sarah Connor', cert: 'Crane Master', note: 'No active machine (Request portal)' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === 'admin') {
      onLogin({ role: 'admin', name: 'Fleet Supervisor' });
    } else {
      const op = operators.find(o => o.id === selectedOperatorId);
      onLogin({ 
        role: 'operator', 
        id: op.id, 
        name: op.name, 
        cert: op.cert 
      });
    }
  };

  return (
    <div className="min-h-screen bg-cat-dark flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-4xl bg-cat-card rounded-2xl border border-cat-border overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[480px] animate-fadeIn">
        
        {/* LEFT PANEL: Brand Info */}
        <div className="flex-1 bg-gradient-to-br from-cat-yellow to-yellow-600 p-10 flex flex-col justify-between text-cat-dark relative">
          {/* Top decoration logo */}
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
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.name} ({op.id}) - {op.cert}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Micro helper description */}
                {(() => {
                  const currentOp = operators.find(o => o.id === selectedOperatorId);
                  return currentOp ? (
                    <div className="bg-cat-dark border border-cat-border p-3.5 rounded-lg text-[10px]">
                      <span className="text-cat-gray block">Status Profile:</span>
                      <span className="font-bold text-cat-yellow mt-0.5 block">{currentOp.note}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Login Submit Button */}
            <button
              type="submit"
              className="w-full bg-cat-yellow hover:bg-yellow-500 text-cat-dark font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cat-yellow/10"
            >
              <span>Authenticate and Enter</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
