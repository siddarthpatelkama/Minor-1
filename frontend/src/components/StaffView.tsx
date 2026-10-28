import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Complaint } from '../types';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  FileCheck, 
  Camera,
  AlertTriangle,
  Flame,
  X
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [resolveModalComplaint, setResolveModalComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionImageUrl, setResolutionImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffComplaints = async () => {
    try {
      setLoading(true);
      const all = await api.getComplaints();
      const myJobs = all.filter(c => c.assignedStaffId === currentUser?.id);
      setComplaints(myJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStaffComplaints();
    }
  }, [currentUser]);

  const handleStartWork = async (complaintId: string) => {
    try {
      await api.updateStatus(complaintId, {
        status: 'In Progress',
        updatedBy: currentUser?.name || 'Technician',
        updatedByRole: 'staff',
        remarks: 'Technician arrived at room and started repair work.'
      });
      fetchStaffComplaints();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalComplaint) return;

    try {
      setSubmitting(true);
      await api.updateStatus(resolveModalComplaint.id, {
        status: 'Resolved',
        updatedBy: currentUser?.name || 'Technician',
        updatedByRole: 'staff',
        remarks: 'Maintenance completed and tested in resident room.',
        resolutionNotes: resolutionNotes || 'Repairs completed and verified working.',
        resolutionImageUrl
      });
      setResolveModalComplaint(null);
      setResolutionNotes('');
      setResolutionImageUrl('');
      fetchStaffComplaints();
    } catch (err) {
      alert('Error recording resolution');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingJobs = complaints.filter(c => c.status === 'Assigned');
  const activeJobs = complaints.filter(c => c.status === 'In Progress');
  const resolvedJobs = complaints.filter(c => c.status === 'Resolved');

  return (
    <div className="space-y-6">
      {/* Technician Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">
              Department Work Orders Console
            </h2>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {currentUser?.department || 'Maintenance Trades'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lead Technician: <strong className="text-slate-800">{currentUser?.name}</strong> • Assigned Campus Maintenance Team
          </p>
        </div>

        <button
          onClick={fetchStaffComplaints}
          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
        >
          Sync Work Orders
        </button>
      </div>

      {/* 3 Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Assigned / New Jobs</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{pendingJobs.length}</span>
          <span className="text-[10px] text-slate-400">Awaiting technician arrival</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Currently In Progress</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{activeJobs.length}</span>
          <span className="text-[10px] text-slate-400">Under active repair</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved by Me</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{resolvedJobs.length}</span>
          <span className="text-[10px] text-slate-400">Successfully closed</span>
        </div>
      </div>

      {/* Active Work Orders Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-700" />
          Active Work Orders ({pendingJobs.length + activeJobs.length})
        </h3>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
            <div className="w-7 h-7 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading work orders...
          </div>
        ) : pendingJobs.length + activeJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Pending Work Orders</h4>
            <p className="text-xs text-slate-500 mt-0.5">All assigned maintenance tickets for your trade have been completed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...pendingJobs, ...activeJobs].map(c => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-mono text-slate-400">#{c.id.slice(0, 8)}</span>
                    <div className="flex items-center gap-1.5">
                      {c.priority === 'Emergency' && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3 text-red-600" /> Hazard
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'In Progress' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">{c.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <strong>{c.block}</strong> — Room: <strong>{c.roomNo}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Resident: {c.studentName} ({c.studentPhone || c.studentVtu})</span>
                    </div>
                  </div>

                  {c.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={c.imageUrl}
                        alt="Incident Evidence"
                        className="w-full h-32 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {c.status === 'Assigned' && (
                    <button
                      onClick={() => handleStartWork(c.id)}
                      className="flex-1 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
                    >
                      Begin Repair Work
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setResolveModalComplaint(c);
                      setResolutionNotes(`Inspected and completed repairs for ${c.title.toLowerCase()}. Problem resolved and verified.`);
                    }}
                    className={`py-2 px-4 rounded-xl font-bold text-xs shadow-sm transition ${
                      c.status === 'In Progress'
                        ? 'flex-1 bg-emerald-700 hover:bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      {resolvedJobs.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700">Recently Resolved Work Orders ({resolvedJobs.length})</h3>
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
            {resolvedJobs.map(c => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-800">{c.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {c.block} ({c.roomNo}) • Student: {c.studentName}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Confirmation Modal */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  File Maintenance Resolution Report
                </h3>
              </div>
              <button
                onClick={() => setResolveModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-800">
                Ticket: #{resolveModalComplaint.id.slice(0, 8)} - {resolveModalComplaint.title}
              </div>
              <div className="text-slate-600">
                Room: {resolveModalComplaint.block} • {resolveModalComplaint.roomNo}
              </div>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resolution Notes & Remedial Actions Taken *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attach Post-Repair Photo Evidence (Optional)
                </label>
                <input
                  type="text"
                  placeholder="URL to resolved photo..."
                  value={resolutionImageUrl}
                  onChange={(e) => setResolutionImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResolveModalComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Mark Ticket Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
