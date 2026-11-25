import React, { useState } from 'react';
import { GraduationCap, Building, Wrench, Shield, ArrowRight, PhoneCall, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AuthNavbar } from './AuthNavbar';
import { useAuth } from '../../context/AuthContext';

interface PortalSelectProps {
  onSelectPortal: (portal: 'student' | 'warden' | 'staff') => void;
  onQuickDemo: (role: 'student' | 'warden' | 'staff') => void;
}

export const PortalSelect: React.FC<PortalSelectProps> = ({ onSelectPortal, onQuickDemo }) => {
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      alert(err.message || 'Google Auth Error');
    } finally {
      setGoogleLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <AuthNavbar currentPortal="select" onNavigate={(p) => p !== 'select' && onSelectPortal(p)} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Institutional Notice & Greeting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-50 text-[#750000] border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            Centralized Hostel Administration • 2026-27 Academic Session
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hostel Maintenance Management & Redressal Portal
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed">
            Vel Tech University provides an automated system for hostel residents to register room maintenance requests, track repair workflows, and obtain expedited service resolution from campus engineering teams.
          </p>

          {/* SLA Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-left">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Electrical SLA</span>
              <span className="text-sm font-bold text-slate-800">Within 2-4 Hours</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Plumbing SLA</span>
              <span className="text-sm font-bold text-slate-800">Within 4 Hours</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Wi-Fi & LAN</span>
              <span className="text-sm font-bold text-slate-800">Same-Day Resolution</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Emergency Hazard</span>
              <span className="text-sm font-bold text-red-600">Immediate Response</span>
            </div>
          </div>
        </div>

        {/* 3 Dedicated Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1: Student Resident Portal */}
          <div className="bg-white border-2 border-slate-200 hover:border-[#750000] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-[#750000] flex items-center justify-center mb-4 group-hover:bg-[#750000] group-hover:text-white transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#750000] block">
                Hostel Residents & Allotment
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Student Portal
              </h2>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Log room maintenance issues (switchboard, geyser, taps, Wi-Fi), attach photo proof, track technician work orders in real-time, and rate completed resolutions.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Blocks A, B, C (Boys) & Block D (Girls)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-time SMS & Status Tracking</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onSelectPortal('student')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#750000] hover:bg-[#580000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Access Student Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{googleLoading ? 'Redirecting...' : 'Sign in with Google'}</span>
              </button>
              <button
                onClick={() => onQuickDemo('student')}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium text-[11px] border border-slate-200 transition"
              >
                Test Resident: K. Siddarth Patel (VTU28319)
              </button>
            </div>
          </div>

          {/* Card 2: Warden Administration */}
          <div className="bg-white border-2 border-slate-200 hover:border-blue-700 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-800 group-hover:text-white transition">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                Administrative Oversight
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Warden Office
              </h2>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Supervise maintenance across all campus blocks. Review priority ratings, triage electrical/plumbing emergencies, and dispatch maintenance technicians.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Emergency Hazard Prioritization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Work Order Allocation & Escalation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onSelectPortal('warden')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Access Warden Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onQuickDemo('warden')}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium text-[11px] border border-slate-200 transition"
              >
                Test Officer: Dr. K. Ramanathan (Hostel Warden)
              </button>
            </div>
          </div>

          {/* Card 3: Maintenance Operations */}
          <div className="bg-white border-2 border-slate-200 hover:border-amber-600 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-700 group-hover:text-white transition">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                Field Operations & Trades
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Department Depot
              </h2>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Dedicated console for Electrical, Plumbing, Carpentry, Network, and Housekeeping trades. Receive room job slips and record resolution notes.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>5 Campus Maintenance Trades</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Student Room Contact & Directions</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onSelectPortal('staff')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Access Department Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onQuickDemo('staff')}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium text-[11px] border border-slate-200 transition"
              >
                Test Field Staff: Ramesh (Electrical)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded border border-slate-200 shadow-sm">
                <img
                  src="/veltech_logo.jpg"
                  alt="Vel Tech University Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology
                </p>
                <p className="text-[11px] text-slate-500">
                  Deemed to be University • 400 Feet Outer Ring Road, Avadi, Chennai - 600 062
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#750000]">
                <PhoneCall className="w-3.5 h-3.5" />
                Emergency Helpline: +91 44 6201 1000
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
