import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ArrowLeft, Lock, User, AlertCircle, CheckCircle2, Building, Phone, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';

interface StudentLoginProps {
  onBack: () => void;
  onNavigate?: (portal: 'select' | 'student' | 'warden' | 'staff') => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onBack, onNavigate }) => {
  const { studentLogin, registerStudent, loginWithGoogle } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [vtuNo, setVtuNo] = useState('');
  const [block, setBlock] = useState('Block A (Boys Hostel)');
  const [roomNo, setRoomNo] = useState('');
  const [phone, setPhone] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await studentLogin(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your VTU Number or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await registerStudent({
        name,
        email,
        password,
        vtuNo,
        block,
        roomNo,
        phone
      });
      setRegSuccess(true);
      setTimeout(() => {
        setIsRegistering(false);
        setIdentifier(vtuNo);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (vtu: string) => {
    setIdentifier(vtu);
    setPassword('password123');
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google sign-in failed. Please verify Supabase OAuth provider configuration.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <AuthNavbar 
        currentPortal="student" 
        onNavigate={(p) => {
          if (onNavigate) onNavigate(p);
          else if (p === 'select') onBack();
        }} 
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Guidelines & Notices */}
          <div className="lg:col-span-5 space-y-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-red-50 border border-red-200 text-[#750000] rounded-xl flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Student Residence Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vel Tech Hostel Grievance & Maintenance Management
              </p>

              <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                  <span className="font-bold text-[#750000] block mb-1">📌 Resident Guidelines:</span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Lodge complaints under the exact trade (Electrical, Plumbing, Furniture, Wi-Fi).</li>
                    <li>Attach genuine incident photos for immediate triage.</li>
                    <li>Ensure room accessibility during maintenance technician visit.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="font-semibold text-slate-800">Support & Helplines:</div>
                  <div className="text-slate-600">Hostel Supervisor: +91 44 6201 1000</div>
                  <div className="text-slate-600">Emergency Warden: +91 94440 12345</div>
                </div>
              </div>
            </div>

            {/* Quick Fill Test Accounts Pill */}
            {!isRegistering && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs">
                <span className="font-bold text-slate-700 block mb-2 text-[11px]">
                  Institutional Demo Residents (1-Click Fill):
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => quickFill('VTU28319')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-[#750000] border border-slate-200 font-medium transition text-center"
                  >
                    K. Siddarth<br /><span className="text-[10px] text-slate-400">Block A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('VTU28844')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-[#750000] border border-slate-200 font-medium transition text-center"
                  >
                    R. Sreevasthav<br /><span className="text-[10px] text-slate-400">Block B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('VTU27728')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-[#750000] border border-slate-200 font-medium transition text-center"
                  >
                    A. Rakesh<br /><span className="text-[10px] text-slate-400">Block C</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sign In or Register Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              {/* Form Mode Toggle */}
              <div className="flex border-b border-slate-200 pb-4 mb-6 justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isRegistering ? 'Hostel Room Resident Registration' : 'Sign In to Student Account'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRegistering 
                      ? 'New resident allotment registration for hostel services'
                      : 'Enter your VTU Register Number or Institutional Email'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                  }}
                  className="text-xs font-bold text-[#750000] hover:underline"
                >
                  {isRegistering ? 'Back to Sign In' : 'New Resident? Register'}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Registration successful! Redirecting to login...</span>
                </div>
              )}

              {!isRegistering ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      VTU Register Number or University Email *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. VTU28319 or student@veltech.edu.in"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#750000] focus:ring-1 focus:ring-[#750000] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Account Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#750000] focus:ring-1 focus:ring-[#750000] transition"
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
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#750000] focus:ring-0" />
                      <span>Remember credentials</span>
                    </label>
                    <span className="text-slate-400">Default pass: password123</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-3 rounded-xl bg-[#750000] hover:bg-[#580000] text-white font-bold text-xs shadow-sm transition disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Verifying Student Credentials...' : 'Sign In to Student Resident Portal'}
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                      <span className="bg-white px-3 text-slate-400">or sign in with google</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google (Supabase Auth)'}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-1">
                    Direct Supabase OAuth integration • Vel Tech @veltech.edu.in accounts
                  </p>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Student Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">VTU Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="VTU29500"
                        value={vtuNo}
                        onChange={(e) => setVtuNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Room Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A-305"
                        value={roomNo}
                        onChange={(e) => setRoomNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hostel Block *</label>
                    <select
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                    >
                      <option value="Block A (Boys Hostel)">Block A (Boys Hostel - Netaji)</option>
                      <option value="Block B (Boys Hostel)">Block B (Boys Hostel - Tagore)</option>
                      <option value="Block C (Boys Hostel)">Block C (Boys Hostel - Kalam)</option>
                      <option value="Block D (Girls Hostel)">Block D (Girls Hostel - Mother Teresa)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="student@veltech.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#750000] hover:bg-[#580000] text-white font-bold text-xs shadow-sm transition disabled:opacity-50 mt-3"
                  >
                    {loading ? 'Registering Room...' : 'Complete Resident Registration'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
