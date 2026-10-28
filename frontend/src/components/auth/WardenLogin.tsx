import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building, ArrowLeft, Lock, Mail, AlertCircle, ShieldCheck, Eye, EyeOff, ShieldAlert, Users } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

interface WardenLoginProps {
  onBack: () => void;
  onNavigate?: (portal: 'select' | 'student' | 'warden' | 'staff') => void;
}

export const WardenLogin: React.FC<WardenLoginProps> = ({ onBack, onNavigate }) => {
  const { wardenLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await wardenLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Warden authentication failed. Invalid institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <AuthNavbar 
        currentPortal="warden" 
        onNavigate={(p) => {
          if (onNavigate) onNavigate(p);
          else if (p === 'select') onBack();
        }} 
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Institutional Credentials & Oversight notice */}
          <div className="lg:col-span-5 space-y-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-t-4 border-t-blue-800">
              <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                <Building className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Warden Administration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Supervisory Console & Maintenance Escalation Desk
              </p>

              <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-700">
                    <span className="font-bold text-blue-900 block mb-0.5">Authorized Administrative Access</span>
                    Restricted to Vel Tech Chief Wardens, Resident Deputy Wardens, and Hostel Estate Officers.
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Hostel Supervision Jurisdiction:
                  </div>
                  <div className="text-slate-600">Boys Hostels: Block A (Netaji), Block B (Tagore), Block C (Kalam)</div>
                  <div className="text-slate-600">Girls Hostel: Block D (Mother Teresa)</div>
                </div>
              </div>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs">
              <span className="font-bold text-slate-700 block mb-2 text-[11px]">
                Administrative Test Account (1-Click Fill):
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('chiefwarden@veltech.edu.in');
                  setPassword('wardenpassword123');
                  setError(null);
                }}
                className="w-full p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-semibold text-xs flex items-center justify-between transition"
              >
                <span>Dr. S. Manohar (Chief Warden)</span>
                <span className="text-[10px] text-blue-700 font-mono">chiefwarden@veltech.edu.in</span>
              </button>
            </div>
          </div>

          {/* Right Column: Warden Login Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Officer Sign In
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticate with official Vel Tech staff credentials
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
                    Official Warden Email or Staff ID *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="chiefwarden@veltech.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Administrative Passcode *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition"
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
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-700 focus:ring-0" />
                    <span>Remember officer session</span>
                  </label>
                  <span className="text-slate-400">Default pass: wardenpassword123</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 mt-2"
                >
                  {loading ? 'Authenticating Officer...' : 'Sign In to Warden Office'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
