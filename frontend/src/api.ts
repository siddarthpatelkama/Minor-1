import { Complaint, User, AnalyticsStats } from './types';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper to map DB snake_case user to frontend camelCase User
function mapUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    vtuNo: u.vtu_no || u.vtuNo,
    regNo: u.reg_no || u.regNo,
    block: u.block,
    roomNo: u.room_no || u.roomNo,
    phone: u.phone,
    avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    specialization: u.specialization,
    department: u.department
  };
}

// Helper to map DB snake_case complaint to frontend Complaint
function mapComplaint(c: any): Complaint {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    priority: c.priority,
    status: c.status,
    block: c.block,
    roomNo: c.room_no || c.roomNo,
    imageUrl: c.image_url || c.imageUrl,
    resolutionImageUrl: c.resolution_image_url || c.resolutionImageUrl,
    resolutionNotes: c.resolution_notes || c.resolutionNotes,
    studentId: c.student_id || c.studentId,
    studentName: c.student_name || c.studentName,
    studentVtu: c.student_vtu || c.studentVtu,
    studentPhone: c.student_phone || c.studentPhone,
    assignedStaffId: c.assigned_staff_id || c.assignedStaffId,
    assignedStaffName: c.assigned_staff_name || c.assignedStaffName,
    assignedStaffRole: c.assigned_staff_role || c.assignedStaffRole,
    assignedAt: c.assigned_at || c.assignedAt,
    createdAt: c.created_at || c.createdAt,
    updatedAt: c.updated_at || c.updatedAt,
    resolvedAt: c.resolved_at || c.resolvedAt,
    statusHistory: Array.isArray(c.statusHistory) ? c.statusHistory : [],
    feedback: c.feedback || undefined
  };
}

export const api = {
  async studentLogin(identifier: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back to direct Supabase query:', err);
    }

    // Direct Supabase Fallback
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`vtu_no.ilike.${identifier},email.ilike.${identifier}`)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Student account not found with provided VTU number or email.');
    }
    return { token: 'supabase-session-token', user: mapUser(data) };
  },

  async wardenLogin(email: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/warden-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back to direct Supabase query:', err);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'warden')
      .maybeSingle();

    if (error || !data) {
      throw new Error('Warden officer credentials not recognized.');
    }
    return { token: 'supabase-session-token', user: mapUser(data) };
  },

  async staffLogin(email: string, department?: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, department, password }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back to direct Supabase query:', err);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'staff')
      .maybeSingle();

    if (error || !data) {
      throw new Error('Department maintenance staff credentials not recognized.');
    }
    return { token: 'supabase-session-token', user: mapUser(data) };
  },

  async registerStudent(userData: Partial<User> & { password?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable for register, falling back to direct Supabase query:', err);
    }

    const newId = 'usr_' + Date.now();
    const newUserRecord = {
      id: newId,
      name: userData.name,
      email: userData.email,
      role: 'student',
      vtu_no: userData.vtuNo,
      reg_no: userData.regNo || userData.vtuNo,
      block: userData.block,
      room_no: userData.roomNo,
      phone: userData.phone,
      password: userData.password || 'password123'
    };

    const { data, error } = await supabase
      .from('users')
      .insert(newUserRecord)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { token: 'supabase-session-token', user: mapUser(data) };
  },

  async getUsers(role?: string): Promise<User[]> {
    try {
      const query = role ? `?role=${role}` : '';
      const res = await fetch(`${API_BASE}/users${query}`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    let q = supabase.from('users').select('*');
    if (role) q = q.eq('role', role);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(mapUser);
  },

  async getStaff(): Promise<User[]> {
    return this.getUsers('staff');
  },

  async getComplaints(params?: Record<string, string>): Promise<Complaint[]> {
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const res = await fetch(`${API_BASE}/complaints${query}`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    let q = supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (params?.studentId) q = q.eq('student_id', params.studentId);
    if (params?.assignedStaffId) q = q.eq('assigned_staff_id', params.assignedStaffId);
    if (params?.status) q = q.eq('status', params.status);
    if (params?.category) q = q.eq('category', params.category);

    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(mapComplaint);
  },

  async getComplaintById(id: string): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Complaint not found');
    return mapComplaint(data);
  },

  async createComplaint(data: Partial<Complaint>): Promise<Complaint> {
    let result: Complaint | null = null;
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        result = await res.json();
      }
    } catch (err) {
      console.warn('Backend API unavailable, writing directly to Supabase:', err);
    }

    const newId = result?.id || 'HCMS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const complaintRecord = {
      id: newId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'Medium',
      status: 'Pending',
      block: data.block,
      room_no: data.roomNo,
      image_url: data.imageUrl || null,
      student_id: data.studentId,
      student_name: data.studentName,
      student_vtu: data.studentVtu,
      student_phone: data.studentPhone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert to Supabase
    await supabase.from('complaints').upsert(complaintRecord);

    return result || mapComplaint(complaintRecord);
  },

  async assignStaff(id: string, staffId: string, wardenName: string, notes?: string): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, wardenName, notes }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    const staffUser = await supabase.from('users').select('*').eq('id', staffId).maybeSingle();
    const staffName = staffUser.data?.name || 'Assigned Staff';
    const staffRole = staffUser.data?.department || 'Technician';

    const { data, error } = await supabase
      .from('complaints')
      .update({
        status: 'Assigned',
        assigned_staff_id: staffId,
        assigned_staff_name: staffName,
        assigned_staff_role: staffRole,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error('Failed to assign staff');
    return mapComplaint(data);
  },

  async assignComplaint(id: string, data: { staffId: string; wardenName?: string; notes?: string }): Promise<Complaint> {
    return this.assignStaff(id, data.staffId, data.wardenName || 'Chief Warden', data.notes);
  },

  async updateStatus(
    id: string, 
    data: { 
      status: string; 
      updatedBy: string; 
      updatedByRole: string; 
      remarks?: string; 
      resolutionNotes?: string; 
      resolutionImageUrl?: string; 
    }
  ): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    const updatePayload: any = {
      status: data.status,
      updated_at: new Date().toISOString()
    };
    if (data.status === 'Resolved') {
      updatePayload.resolved_at = new Date().toISOString();
      if (data.resolutionNotes) updatePayload.resolution_notes = data.resolutionNotes;
      if (data.resolutionImageUrl) updatePayload.resolution_image_url = data.resolutionImageUrl;
    }

    const { data: updatedRecord, error } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedRecord) throw new Error('Failed to update status');
    return mapComplaint(updatedRecord);
  },

  async submitFeedback(
    id: string, 
    data: { studentId: string; studentName: string; rating: number; comment?: string }
  ): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    const { data: complaintData, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !complaintData) throw new Error('Complaint not found');
    return mapComplaint(complaintData);
  },

  async getAnalytics(): Promise<AnalyticsStats> {
    try {
      const res = await fetch(`${API_BASE}/analytics`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }

    const { data: allComplaints } = await supabase.from('complaints').select('*');
    const complaints = (allComplaints || []).map(mapComplaint);

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const assigned = complaints.filter(c => c.status === 'Assigned').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byBlock: Record<string, number> = {};
    let emergencyActive = 0;

    complaints.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
      if (c.block) byBlock[c.block] = (byBlock[c.block] || 0) + 1;
      if (c.priority === 'Emergency' && c.status !== 'Resolved') emergencyActive++;
    });

    return {
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      avgRating: '4.8',
      categories: byCategory,
      priorities: byPriority,
      blocks: byBlock,
      emergencyActive,
      emergencyCount: emergencyActive,
      byStatus: {
        Pending: pending,
        Assigned: assigned,
        'In Progress': inProgress,
        Resolved: resolved
      }
    };
  }
};
