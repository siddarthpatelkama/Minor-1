import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wrench, ArrowLeft, Lock, Mail, AlertCircle, Zap, Droplets, Hammer, Wifi, Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

interface StaffLoginProps {
  onBack: () => void;
  onNavigate?: (portal: 'select' | 'student' | 'warden' | 'staff') => void;
}

const DEPARTMENTS = [
  { id: 'electrical', name: 'Electrical Department', email: 'electrical@veltech.edu.in', lead: 'Ramesh Kumar', roleDesc: 'Switchboards, Wiring, Fans, Geysers', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'plumbing', name: 'Plumbing & Water Supply', email: 'plumbing@veltech.edu.in', lead: 'Sundar Raj', roleDesc: 'Taps, Washrooms, Pipe leakages, Tanks', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'carpentry', name: 'Carpentry & Furniture', email: 'carpentry@veltech.edu.in', lead: 'Anthony Das', roleDesc: 'Doors, Cupboards, Cots, Study tables', icon: Hammer, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'network', name: 'Network & Wi-Fi Operations', email: 'network@veltech.edu.in', lead: 'Vignesh N.', roleDesc: 'Wi-Fi Routers, LAN ports, Bandwidth', icon: Wifi, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'housekeeping', name: 'Housekeeping & Sanitation', email: 'housekeeping@veltech.edu.in', lead: 'Selvam K.', roleDesc: 'Corridors, Waste disposal, Pest control', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
];

export const StaffLogin: React.FC<StaffLoginProps> = ({ onBack, onNavigate }) => {
  const { staffLogin } = useAuth();
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState(DEPARTMENTS[0].email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectDept = (dept: typeof DEPARTMENTS[0]) => {
    setSelectedDept(dept);
    setEmail(dept.email);
    setPassword('staffpassword123');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await staffLogin(email, selectedDept.name, password);
    } catch (err: any) {
      setError(err.message || 'Staff authentication failed. Please verify department credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <AuthNavbar 
        currentPortal="staff" 
        onNavigate={(p) => {
          if (onNavigate) onNavigate(p);
          else if (p === 'select') onBack();
        }} 
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Department Selector */}
          <div className="lg:col-span-5 space-y-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-t-4 border-t-amber-600">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Department Operations
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Campus Field Technician Work Order Console
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Maintenance Trade:
                </span>

                <div className="space-y-1.5">
                  {DEPARTMENTS.map(d => {
                    const Icon = d.icon;
                    const isSelected = selectedDept.id === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectDept(d)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${d.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="block truncate font-semibold text-slate-800">{d.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{d.lead}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Staff Login Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md mb-2">
                  <span>Selected Department:</span>
                  <strong>{selectedDept.name}</strong>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Technician Sign In
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead Technician: <strong>{selectedDept.lead}</strong> ({selectedDept.roleDesc})
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Department Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Technician Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-amber-600 focus:ring-0" />
                    <span>Remember technician login</span>
                  </label>
                  <span className="text-slate-400">Default pass: staffpassword123</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 mt-2"
                >
                  {loading ? 'Authenticating Technician...' : `Sign In as ${selectedDept.lead}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
