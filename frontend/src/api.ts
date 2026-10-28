import { Complaint, User, AnalyticsStats } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async studentLogin(identifier: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Student login failed');
    return data;
  },

  async wardenLogin(email: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/warden-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Warden authentication failed');
    return data;
  },

  async staffLogin(email: string, department?: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/staff-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, department, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Department staff authentication failed');
    return data;
  },

  async registerStudent(userData: Partial<User> & { password?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async getUsers(role?: string): Promise<User[]> {
    const query = role ? `?role=${role}` : '';
    const res = await fetch(`${API_BASE}/users${query}`);
    return res.json();
  },

  async getStaff(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/staff`);
    return res.json();
  },

  async getComplaints(params?: Record<string, string>): Promise<Complaint[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/complaints${query}`);
    return res.json();
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}`);
    if (!res.ok) throw new Error('Complaint not found');
    return res.json();
  },

  async createComplaint(data: Partial<Complaint>): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit grievance');
    return result;
  },

  async assignStaff(id: string, staffId: string, wardenName: string, notes?: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId, wardenName, notes })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to assign staff');
    return result;
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
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update status');
    return result;
  },

  async submitFeedback(
    id: string, 
    data: { studentId: string; studentName: string; rating: number; comment?: string }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit feedback');
    return result;
  },

  async getAnalytics(): Promise<AnalyticsStats> {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  }
};
