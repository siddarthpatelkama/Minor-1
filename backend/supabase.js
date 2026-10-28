require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseKey);
const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    vtuNo: u.vtu_no || u.vtuNo || null,
    regNo: u.reg_no || u.regNo || null,
    block: u.block || null,
    roomNo: u.room_no || u.roomNo || null,
    phone: u.phone || null,
    department: u.department || u.specialization || null,
    createdAt: u.created_at || u.createdAt || null
  };
}

function mapComplaint(c) {
  if (!c) return null;
  const history = Array.isArray(c.status_history) ? c.status_history : [];
  const feedbackList = Array.isArray(c.feedback) ? c.feedback : (c.feedback ? [c.feedback] : []);
  const fb = feedbackList.length > 0 ? feedbackList[0] : null;

  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    priority: c.priority,
    status: c.status,
    block: c.block,
    roomNo: c.room_no || c.roomNo || '',
    imageUrl: c.image_url || c.imageUrl || null,
    resolutionImageUrl: c.resolution_image_url || c.resolutionImageUrl || null,
    resolutionNotes: c.resolution_notes || c.resolutionNotes || null,
    studentId: c.student_id || c.studentId || null,
    studentName: c.student_name || c.studentName || '',
    studentVtu: c.student_vtu || c.studentVtu || '',
    studentPhone: c.student_phone || c.studentPhone || null,
    assignedStaffId: c.assigned_staff_id || c.assignedStaffId || null,
    assignedStaffName: c.assigned_staff_name || c.assignedStaffName || null,
    assignedStaffRole: c.assigned_staff_role || c.assignedStaffRole || null,
    assignedAt: c.assigned_at || c.assignedAt || null,
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
    updatedAt: c.updated_at || c.updatedAt || new Date().toISOString(),
    resolvedAt: c.resolved_at || c.resolvedAt || null,
    history: history.map(h => ({
      id: h.id,
      complaintId: h.complaint_id || h.complaintId,
      status: h.status,
      updatedBy: h.updated_by || h.updatedBy,
      updatedByRole: h.updated_by_role || h.updatedByRole,
      remarks: h.remarks,
      timestamp: h.timestamp
    })),
    feedback: fb ? {
      id: fb.id,
      complaintId: fb.complaint_id || fb.complaintId,
      studentId: fb.student_id || fb.studentId,
      studentName: fb.student_name || fb.studentName,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.created_at || fb.createdAt
    } : null
  };
}

const SupabaseService = {
  isAvailable() {
    return isConfigured && supabase !== null;
  },

  client: supabase,

  // USERS
  async getUsers(role) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    let query = supabase.from('users').select('*');
    if (role) {
      query = query.eq('role', role);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapUser);
  },

  async findUserById(id) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? { ...mapUser(data), password: data.password } : null;
  },

  async findUserByEmail(email) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanEmail},alt_email.ilike.${cleanEmail}`)
      .maybeSingle();

    if (error) throw error;
    return data ? { ...mapUser(data), password: data.password } : null;
  },

  async findUserByVtu(vtuNo) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const cleanVtu = vtuNo.trim();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('vtu_no', cleanVtu)
      .maybeSingle();

    if (error) throw error;
    return data ? { ...mapUser(data), password: data.password } : null;
  },

  async createUser(u) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const id = u.id || `student-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const insertData = {
      id,
      name: u.name,
      email: u.email.toLowerCase().trim(),
      password: u.password || 'password123',
      role: u.role || 'student',
      vtu_no: u.vtuNo || u.vtu_no || null,
      reg_no: u.regNo || u.reg_no || null,
      block: u.block || 'Block A (Boys Hostel)',
      room_no: u.roomNo || u.room_no || '101',
      phone: u.phone || null,
      department: u.department || 'Computer Science & Engineering',
      created_at: timestamp
    };

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return mapUser(data);
  },

  // COMPLAINTS
  async getComplaints(filters = {}) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    let query = supabase
      .from('complaints')
      .select('*, status_history(*), feedback(*)')
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'All') {
      query = query.ilike('status', filters.status);
    }
    if (filters.category && filters.category !== 'All') {
      query = query.ilike('category', filters.category);
    }
    if (filters.priority && filters.priority !== 'All') {
      query = query.ilike('priority', filters.priority);
    }
    if (filters.block && filters.block !== 'All') {
      query = query.eq('block', filters.block);
    }
    if (filters.studentId) {
      query = query.or(`student_id.eq.${filters.studentId},student_vtu.ilike.${filters.studentId}`);
    }
    if (filters.assignedStaffId) {
      query = query.eq('assigned_staff_id', filters.assignedStaffId);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = (data || []).map(mapComplaint);

    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(c =>
        c.title?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s) ||
        c.id?.toLowerCase().includes(s) ||
        c.roomNo?.toLowerCase().includes(s) ||
        c.studentName?.toLowerCase().includes(s)
      );
    }

    return results;
  },

  async getComplaintById(id) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('complaints')
      .select('*, status_history(*), feedback(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return mapComplaint(data);
  },

  async createComplaint(data) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    
    // Count complaints to determine sequential ID
    const { count } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
    const complaintId = `VT-CMP-${1000 + (count || 0) + 1}`;
    const timestamp = new Date().toISOString();

    const complaintData = {
      id: complaintId,
      title: data.title,
      description: data.description,
      category: data.category || 'Other',
      priority: data.priority || 'Medium',
      status: 'Pending',
      block: data.block || 'Block A (Boys Hostel)',
      room_no: data.roomNo || 'N/A',
      image_url: data.imageUrl || null,
      student_id: data.studentId || null,
      student_name: data.studentName || 'Student',
      student_vtu: data.studentVtu || 'VTU28319',
      student_phone: data.studentPhone || null,
      created_at: timestamp,
      updated_at: timestamp
    };

    const { error: insertError } = await supabase.from('complaints').insert(complaintData);
    if (insertError) throw insertError;

    // Record initial status in history
    await supabase.from('status_history').insert({
      id: `hist-${Date.now()}`,
      complaint_id: complaintId,
      status: 'Pending',
      updated_by: data.studentName || 'Student',
      updated_by_role: 'student',
      remarks: `Grievance registered: ${data.title}`,
      timestamp
    });

    return this.getComplaintById(complaintId);
  },

  async assignComplaint(id, staffId, wardenName, notes) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const staff = await this.findUserById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const timestamp = new Date().toISOString();
    const remarks = notes || `Assigned to ${staff.name} (${staff.department || 'Maintenance'})`;

    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        assigned_staff_id: staff.id,
        assigned_staff_name: staff.name,
        assigned_staff_role: staff.department || 'Maintenance Specialist',
        assigned_at: timestamp,
        status: 'Assigned',
        updated_at: timestamp
      })
      .eq('id', id);

    if (updateError) throw updateError;

    await supabase.from('status_history').insert({
      id: `hist-${Date.now()}`,
      complaint_id: id,
      status: 'Assigned',
      updated_by: wardenName || 'Dr. S. Manohar',
      updated_by_role: 'warden',
      remarks,
      timestamp
    });

    return this.getComplaintById(id);
  },

  async updateComplaintStatus(id, { status, updatedBy, updatedByRole, remarks, resolutionNotes, resolutionImageUrl }) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const timestamp = new Date().toISOString();

    const updatePayload = {
      status,
      updated_at: timestamp
    };

    if (status === 'Resolved') {
      updatePayload.resolved_at = timestamp;
      if (resolutionNotes) updatePayload.resolution_notes = resolutionNotes;
      if (resolutionImageUrl) updatePayload.resolution_image_url = resolutionImageUrl;
    }

    const { error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) throw updateError;

    await supabase.from('status_history').insert({
      id: `hist-${Date.now()}`,
      complaint_id: id,
      status,
      updated_by: updatedBy || 'Staff',
      updated_by_role: updatedByRole || 'staff',
      remarks: remarks || `Status updated to ${status}`,
      timestamp
    });

    return this.getComplaintById(id);
  },

  async addFeedback(id, { studentId, studentName, rating, comment }) {
    if (!this.isAvailable()) throw new Error('Supabase not configured');
    const timestamp = new Date().toISOString();

    const feedbackPayload = {
      id: `fb-${Date.now()}`,
      complaint_id: id,
      student_id: studentId || null,
      student_name: studentName,
      rating: Number(rating) || 5,
      comment: comment || '',
      created_at: timestamp
    };

    const { error } = await supabase
      .from('feedback')
      .upsert(feedbackPayload, { onConflict: 'complaint_id' });

    if (error) throw error;
    return this.getComplaintById(id);
  },

  async getAnalytics() {
    const complaints = await this.getComplaints();
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const assigned = complaints.filter(c => c.status === 'Assigned').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    return {
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      emergencyActive: complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length
    };
  }
};

module.exports = SupabaseService;
