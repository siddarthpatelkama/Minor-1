import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../types';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Star, 
  Send, 
  Filter, 
  Building,
  MapPin,
  ChevronDown,
  ChevronUp,
  Camera,
  MessageSquare,
  Sparkles,
  Zap,
  Droplets,
  Hammer,
  Wifi
} from 'lucide-react';

interface StudentViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New complaint form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electrical');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [block, setBlock] = useState(currentUser?.block || 'Block A (Boys Hostel)');
  const [roomNo, setRoomNo] = useState(currentUser?.roomNo || 'A-204');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.getComplaints();
      const studentComplaints = data.filter(c => c.studentId === currentUser?.id || c.studentVtu === currentUser?.vtuNo);
      setComplaints(studentComplaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchComplaints();
      if (currentUser.block) setBlock(currentUser.block);
      if (currentUser.roomNo) setRoomNo(currentUser.roomNo);
    }
  }, [currentUser]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !currentUser) return;

    try {
      setSubmitting(true);
      await api.createComplaint({
        title,
        description,
        category,
        priority,
        block,
        roomNo,
        imageUrl,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentVtu: currentUser.vtuNo || 'VTU28319',
        studentPhone: currentUser.phone || '+91 98765 43210'
      });

      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      setImageUrl('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('complaints');
        fetchComplaints();
      }, 1200);
    } catch (err) {
      alert('Error lodging complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (complaintId: string) => {
    if (!currentUser) return;
    try {
      setSubmittingFeedback(true);
      await api.submitFeedback(complaintId, {
        studentId: currentUser.id,
        studentName: currentUser.name,
        rating,
        comment: feedbackComment
      });
      setFeedbackComment('');
      fetchComplaints();
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case 'Emergency':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Flame className="w-3 h-3 text-red-600" /> Immediate Hazard
          </span>
        );
      case 'High':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">High Priority</span>;
      case 'Medium':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Medium Priority</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Routine</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Pending':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-1 rounded-md">Pending Warden Triage</span>;
      case 'Assigned':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-md">Technician Assigned</span>;
      case 'In Progress':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-md">Work In Progress</span>;
      case 'Resolved':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-md">Resolved & Verified</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">{s}</span>;
    }
  };

  const getCategoryIcon = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'Electrical': return <Zap className="w-4 h-4 text-amber-600" />;
      case 'Plumbing': return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'Carpentry': return <Hammer className="w-4 h-4 text-orange-600" />;
      case 'Network': return <Wifi className="w-4 h-4 text-indigo-600" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Quick Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">
              Student Grievance Dashboard
            </h2>
            <span className="bg-red-50 text-[#750000] border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-bold font-mono">
              {currentUser?.vtuNo || 'VTU28319'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#750000]" />
            Resident: <strong className="text-slate-800">{currentUser?.name}</strong> • Allocated Room: <strong className="text-slate-800">{currentUser?.roomNo}</strong> in <strong className="text-slate-800">{currentUser?.block}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            My Grievances ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('new_complaint')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'new_complaint'
                ? 'bg-[#750000] text-white shadow-sm'
                : 'bg-red-50 text-[#750000] hover:bg-[#750000] hover:text-white border border-red-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Lodge Grievance
          </button>
        </div>
      </div>

      {/* LODGE COMPLAINT FORM */}
      {activeTab === 'new_complaint' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
          <div className="pb-4 mb-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#750000]" />
              Lodge Hostel Maintenance Grievance
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your grievance will be directly triaged by the Resident Warden and dispatched to campus trade specialists.
            </p>
          </div>

          {submitSuccess ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900">Grievance Registered Successfully</h4>
              <p className="text-xs text-slate-600 mt-1">Ticket reference created. Redirecting to your grievances list...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Summary / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken electrical switchboard / Bathroom geyser leaking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000] focus:ring-1 focus:ring-[#750000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maintenance Trade / Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                  >
                    <option value="Electrical">Electrical (Lights, Fans, Sockets, Geyser)</option>
                    <option value="Plumbing">Plumbing (Taps, Flush, Leakage, Drainage)</option>
                    <option value="Carpentry">Carpentry (Cot, Study Table, Door, Latch)</option>
                    <option value="Network">Network & Wi-Fi (LAN, AP, Connectivity)</option>
                    <option value="Housekeeping">Housekeeping (Room Cleaning, Pest Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urgency / Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                  >
                    <option value="Low">Low (Routine maintenance)</option>
                    <option value="Medium">Medium (Attention required within 24h)</option>
                    <option value="High">High (Disruptive to studies/stay)</option>
                    <option value="Emergency">Immediate Hazard (Short circuit, water flood)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hostel Block *
                  </label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Grievance Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the exact location and symptoms (e.g. The 3-pin power socket on the study table wall sparks when inserting laptop charger, burning smell detected)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000] focus:ring-1 focus:ring-[#750000]"
                />
              </div>

              {/* Real Photo Attachment Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    Attach Incident Photo Evidence (Optional)
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Select realistic sample photo:</span>
                </label>

                <div className="grid grid-cols-3 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setImageUrl('/images/switchboard.jpg')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition text-xs ${
                      imageUrl === '/images/switchboard.jpg'
                        ? 'bg-red-50 border-[#750000] text-[#750000] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <img src="/images/switchboard.jpg" alt="Switchboard" className="w-9 h-9 object-cover rounded-lg" />
                    <span className="truncate">Burnt Switchboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageUrl('/images/geyser.jpg')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition text-xs ${
                      imageUrl === '/images/geyser.jpg'
                        ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <img src="/images/geyser.jpg" alt="Geyser" className="w-9 h-9 object-cover rounded-lg" />
                    <span className="truncate">Leaking Geyser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageUrl('/images/tap.jpg')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition text-xs ${
                      imageUrl === '/images/tap.jpg'
                        ? 'bg-amber-50 border-amber-600 text-amber-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <img src="/images/tap.jpg" alt="Tap" className="w-9 h-9 object-cover rounded-lg" />
                    <span className="truncate">Dripping Tap</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Or paste external image URL / photo link..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#750000]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('complaints')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#750000] hover:bg-[#580000] text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Grievance...' : 'Submit Grievance to Warden'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* COMPLAINTS LIST VIEW */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700">Filter Status:</span>
              <div className="flex flex-wrap gap-1">
                {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      statusFilter === filter
                        ? 'bg-[#750000] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-500 font-medium">
              Showing {filteredComplaints.length} of {complaints.length} grievances
            </span>
          </div>

          {/* Grievances List */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
              <div className="w-7 h-7 border-2 border-[#750000] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Fetching your room grievances...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Complaints Recorded</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active maintenance grievances found matching the selected filter.
              </p>
              <button
                onClick={() => setActiveTab('new_complaint')}
                className="mt-4 px-4 py-2 bg-[#750000] hover:bg-[#580000] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Lodge New Grievance
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map(c => {
                const isExpanded = expandedId === c.id;
                return (
                  <div
                    key={c.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                          {getCategoryIcon(c.category)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-500">#{c.id.slice(0, 8)}</span>
                            <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                            {getPriorityBadge(c.priority)}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                            <span>{c.category}</span>
                            <span>•</span>
                            <span>{c.block} - Room {c.roomNo}</span>
                            <span>•</span>
                            <span>Lodged: {new Date(c.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {getStatusBadge(c.status)}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs">
                        {/* Description & Photo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <span className="font-bold text-slate-700 block">Description:</span>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                              {c.description}
                            </p>
                            {c.assignedStaffName && (
                              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-xs">
                                <strong>Assigned Field Technician:</strong> {c.assignedStaffName} ({c.assignedStaffRole || c.assignedDepartment || 'Trades Specialist'})
                              </div>
                            )}
                          </div>

                          {c.imageUrl && (
                            <div>
                              <span className="font-bold text-slate-700 block mb-1">Attached Incident Photo:</span>
                              <img
                                src={c.imageUrl}
                                alt="Complaint attachment"
                                className="w-full h-32 object-cover rounded-xl border border-slate-200"
                              />
                            </div>
                          )}
                        </div>

                        {/* Status Timeline */}
                        {(c.statusHistory || c.history) && ((c.statusHistory || c.history)!.length > 0) && (
                          <div className="pt-2">
                            <span className="font-bold text-slate-700 block mb-2">Resolution Progress Timeline:</span>
                            <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
                              {(c.statusHistory || c.history)!.map((h, idx) => (
                                <div key={idx} className="relative">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#750000] absolute -left-[17px] top-1" />
                                  <div className="text-[11px] font-bold text-slate-800">
                                    {h.status} <span className="font-normal text-slate-500">by {h.updatedBy} ({h.updatedByRole})</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5">{h.remarks}</p>
                                  <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rate Service Section for Resolved Complaints */}
                        {c.status === 'Resolved' && (
                          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                Rate Maintenance Service
                              </span>
                              {c.feedback && (
                                <span className="text-[11px] text-emerald-700 font-semibold">Feedback Submitted</span>
                              )}
                            </div>

                            {c.feedback ? (
                              <div className="text-xs text-slate-700">
                                <div className="flex items-center gap-1 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3.5 h-3.5 ${
                                        star <= c.feedback!.rating
                                          ? 'text-amber-500 fill-amber-500'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="font-bold ml-1">{c.feedback.rating}/5</span>
                                </div>
                                <p className="italic text-slate-600">"{c.feedback.comment}"</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-600">Your Rating:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="p-1 hover:scale-110 transition"
                                      >
                                        <Star
                                          className={`w-4 h-4 ${
                                            star <= rating
                                              ? 'text-amber-500 fill-amber-500'
                                              : 'text-slate-300'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add review remarks on technician conduct and repair quality..."
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#750000]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitFeedback(c.id)}
                                    disabled={submittingFeedback}
                                    className="px-4 py-1.5 bg-[#750000] hover:bg-[#580000] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
