import React from 'react';
import { X, Phone, Mail, MapPin, Building, ShieldCheck, Clock } from 'lucide-react';

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="p-3 bg-red-50 text-[#750000] border border-red-200 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Hostel Administration Directory</h3>
            <p className="text-xs text-slate-500">Emergency & 24x7 Maintenance Desks • Vel Tech Hostels</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-xs">
          {/* Emergency 24x7 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <Phone className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950 text-sm">24x7 Emergency Helpline</h4>
                <p className="text-slate-600 mt-0.5">Short circuit, fire, severe water leakage, medical</p>
                <p className="font-mono text-red-700 font-bold mt-2">+91 44 6201 1000 / Ext: 911</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-950 text-sm">Maintenance Control Room</h4>
                <p className="text-slate-600 mt-0.5">General repairs, carpentry, Wi-Fi complaints</p>
                <p className="font-mono text-blue-700 font-bold mt-2">+91 44 6201 1012 (8 AM - 9 PM)</p>
              </div>
            </div>
          </div>

          {/* Wardens List */}
          <div className="mt-4">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
              Hostel Wardens & Supervisors
            </h4>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900">Dr. S. Manohar, Ph.D.</h5>
                  <p className="text-[11px] text-slate-500">Chief Hostel Warden • Estate Oversight</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800">+91 94440 12345</p>
                  <p className="text-[10px] text-slate-400">chiefwarden@veltech.edu.in</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900">Prof. K. Rajasekharan</h5>
                  <p className="text-[11px] text-slate-500">Resident Warden (Blocks A & B - Boys)</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800">+91 94440 23456</p>
                  <p className="text-[10px] text-slate-400">warden.boys@veltech.edu.in</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900">Dr. M. Geetha Lakshmi</h5>
                  <p className="text-[11px] text-slate-500">Resident Warden (Block D - Girls)</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800">+91 94440 34567</p>
                  <p className="text-[10px] text-slate-400">warden.girls@veltech.edu.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Supervisors */}
          <div className="mt-4">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
              Department Engineering Leads
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Electrical Lead: Ramesh Kumar</span>
                <span className="text-slate-500">+91 98401 22331 • Ext 104</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Plumbing Lead: Sundar Raj</span>
                <span className="text-slate-500">+91 98401 33442 • Ext 105</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Carpentry Lead: Anthony Das</span>
                <span className="text-slate-500">+91 98401 44553 • Ext 106</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Wi-Fi & Network: Vignesh N.</span>
                <span className="text-slate-500">+91 98401 55664 • Ext 108</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Campus Security Control Desk • Main Gate: +91 44 6201 1999
        </div>
      </div>
    </div>
  );
};
