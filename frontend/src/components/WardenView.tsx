import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Complaint, AnalyticsStats } from '../types';
import { 
  Building, 
  Flame, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Search, 
  Printer, 
  Wrench,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  AlertCircle,
  Filter,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';

export const WardenView: React.FC = () => {
  const { currentUser, staffList } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');
  const [onlyHazards, setOnlyHazards] = useState(false);

  // Assignment Modal
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, stats] = await Promise.all([
        api.getComplaints(),
        api.getAnalytics()
      ]);
      setComplaints(list);
      setAnalytics(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = (c: Complaint) => {
    setAssignModalComplaint(c);
    // Auto-select staff from matching department if possible
    const match = staffList.find(s => s.department && c.category && s.department.toLowerCase().includes(c.category.toLowerCase()));
    setSelectedStaffId(match ? match.id : (staffList[0]?.id || ''));
    setAssignNotes(`Please inspect room ${c.roomNo} in ${c.block} and resolve ${c.title.toLowerCase()}.`);
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalComplaint || !selectedStaffId) return;

    try {
      setAssigning(true);
      await api.assignComplaint(assignModalComplaint.id, {
        staffId: selectedStaffId,
        wardenName: currentUser?.name || 'Chief Warden Dr. S. Manohar',
        notes: assignNotes
      });
      setAssignModalComplaint(null);
      fetchData();
    } catch (err) {
      alert('Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentVtu.toLowerCase().includes(search.toLowerCase()) ||
      c.roomNo.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesBlock = blockFilter === 'All' || c.block.toLowerCase().includes(blockFilter.toLowerCase());
    const matchesHazard = onlyHazards ? c.priority === 'Emergency' : true;

    return matchesSearch && matchesStatus && matchesBlock && matchesHazard;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">
              Warden Grievance Triage Console
            </h2>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Hostel Supervision & Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervising Officer: <strong className="text-slate-800">{currentUser?.name}</strong> • Chief Hostel Warden (All Blocks)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>
          <button
            onClick={fetchData}
            className="px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* 5 High-Impact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Complaints</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics?.total || complaints.length}</span>
          <span className="text-[10px] text-slate-400">Campus-wide</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Pending Triage</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{analytics?.pending ?? 0}</span>
          <span className="text-[10px] text-slate-400">Requires dispatch</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Assigned / In Progress</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {(analytics?.assigned ?? 0) + (analytics?.inProgress ?? 0)}
          </span>
          <span className="text-[10px] text-slate-400">With technicians</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved & Verified</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{analytics?.resolved ?? 0}</span>
          <span className="text-[10px] text-slate-400">Completed jobs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-600" />
            Hazards
          </span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{analytics?.emergencyActive ?? 0}</span>
          <span className="text-[10px] text-red-500 font-semibold">Immediate safety</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name, VTU number, room number, or issue title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Block Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold whitespace-nowrap">Block:</span>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Blocks (A, B, C, D)</option>
              <option value="Block A">Block A (Netaji - Boys)</option>
              <option value="Block B">Block B (Tagore - Boys)</option>
              <option value="Block C">Block C (Kalam - Boys)</option>
              <option value="Block D">Block D (Mother Teresa - Girls)</option>
            </select>
          </div>

          {/* Emergency Hazard Toggle */}
          <button
            onClick={() => setOnlyHazards(!onlyHazards)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              onlyHazards
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Emergency Hazards Only</span>
          </button>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-bold mr-1">Status:</span>
          {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === st
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-500">
            Showing {filtered.length} records
          </span>
        </div>
      </div>

      {/* Main Complaints Triage Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-7 h-7 border-2 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading grievance repository...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No complaints found matching the current search & filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Student & Room</th>
                  <th className="py-3 px-4">Category & Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Technician</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const isExpanded = expandedId === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                          #{c.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{c.studentName}</div>
                          <div className="text-[11px] text-slate-500">
                            {c.studentVtu} • {c.block} ({c.roomNo})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{c.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{c.category}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.priority === 'Emergency' ? (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Flame className="w-3 h-3 text-red-600" /> Hazard
                            </span>
                          ) : c.priority === 'High' ? (
                            <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">High</span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">{c.priority}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                            c.status === 'Pending' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            c.status === 'Assigned' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            c.status === 'In Progress' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.assignedStaffName ? (
                            <div>
                              <span className="font-semibold text-slate-800">{c.assignedStaffName}</span>
                              <div className="text-[10px] text-slate-400">{c.assignedStaffRole || c.assignedDepartment || 'Trades Specialist'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenAssign(c)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs transition"
                          >
                            {c.assignedStaffId ? 'Reassign' : 'Dispatch'}
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : c.id)}
                            className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs transition"
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Detail row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={7} className="p-4 border-t border-slate-100 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2 space-y-2">
                                <span className="font-bold text-slate-700 block">Full Grievance Report:</span>
                                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                                  {c.description}
                                </p>
                                {c.resolutionNotes && (
                                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                                    <strong>Field Resolution Report:</strong> {c.resolutionNotes}
                                  </div>
                                )}
                              </div>
                              {c.imageUrl && (
                                <div>
                                  <span className="font-bold text-slate-700 block mb-1">Attached Incident Evidence:</span>
                                  <img
                                    src={c.imageUrl}
                                    alt="Complaint Evidence"
                                    className="w-full h-28 object-cover rounded-xl border border-slate-200"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch / Assign Modal */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Dispatch Maintenance Technician
                </h3>
              </div>
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-800">
                Ticket: #{assignModalComplaint.id.slice(0, 8)} - {assignModalComplaint.title}
              </div>
              <div className="text-slate-600">
                Resident: {assignModalComplaint.studentName} ({assignModalComplaint.studentVtu})
              </div>
              <div className="text-slate-600">
                Location: {assignModalComplaint.block} • Room {assignModalComplaint.roomNo}
              </div>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Maintenance Trade Technician *
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Warden Dispatch Remarks / Specific Instructions:
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {assigning ? 'Dispatching...' : 'Confirm Work Order Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
