export type UserRole = 'student' | 'warden' | 'staff';

export type ComplaintCategory = 
  | 'Electrical' 
  | 'Plumbing' 
  | 'Cleanliness' 
  | 'Carpentry' 
  | 'Internet & Wi-Fi' 
  | 'Network'
  | 'Housekeeping'
  | 'Food & Mess' 
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export type ComplaintStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  vtuNo?: string;
  regNo?: string;
  block?: string;
  roomNo?: string;
  phone?: string;
  avatar?: string;
  specialization?: string;
  department?: string;
}

export interface StatusHistoryEntry {
  id: string;
  complaintId?: string;
  status: ComplaintStatus | string;
  updatedBy: string;
  updatedByRole?: UserRole | string;
  timestamp: string;
  remarks?: string;
}

export interface Feedback {
  id: string;
  complaintId?: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  block: string;
  roomNo: string;
  imageUrl?: string;
  resolutionImageUrl?: string;
  resolutionNotes?: string;
  
  studentId: string;
  studentName: string;
  studentVtu: string;
  studentPhone?: string;

  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffRole?: string;
  assignedDepartment?: string;
  assignedAt?: string;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;

  history?: StatusHistoryEntry[];
  statusHistory?: StatusHistoryEntry[];
  feedback?: Feedback;
}

export interface AnalyticsStats {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  avgRating: string;
  categories: Record<string, number>;
  priorities: Record<string, number>;
  blocks: Record<string, number>;
  emergencyActive: number;
  emergencyCount?: number;
  byStatus?: {
    Pending?: number;
    Assigned?: number;
    'In Progress'?: number;
    Resolved?: number;
    [key: string]: number | undefined;
  };
}

export interface ProgressMilestone {
  day: number;
  workDone: string;
}
