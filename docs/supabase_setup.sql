-- ====================================================================
-- Vel Tech Hostel Complaint Management System
-- Supabase PostgreSQL Database Setup & Migrations Script
-- Project: hostel complaint management system (edqgwpotuscvpioledod)
-- ====================================================================

-- 1. Create Core Application Tables (if not already existing)

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'warden', 'staff')),
  vtu_no TEXT,
  reg_no TEXT,
  block TEXT,
  room_no TEXT,
  phone TEXT,
  department TEXT,
  specialization TEXT,
  alt_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Electrical', 'Plumbing', 'Cleanliness', 'Carpentry', 'Internet & Wi-Fi', 'Food & Mess', 'Other')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
  block TEXT NOT NULL,
  room_no TEXT NOT NULL,
  image_url TEXT,
  resolution_image_url TEXT,
  resolution_notes TEXT,
  student_id TEXT REFERENCES public.users(id),
  student_name TEXT NOT NULL,
  student_vtu TEXT NOT NULL,
  student_phone TEXT,
  assigned_staff_id TEXT REFERENCES public.users(id),
  assigned_staff_name TEXT,
  assigned_staff_role TEXT,
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.status_history (
  id TEXT PRIMARY KEY,
  complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_by_role TEXT NOT NULL,
  remarks TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id TEXT PRIMARY KEY,
  complaint_id TEXT UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.users(id),
  student_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  complaint_id TEXT,
  is_read BOOLEAN DEFAULT false,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Schema Migration: Ensure password, department, and alt_email exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS alt_email TEXT;

-- 3. Seed / Update Verified Passwords & Accounts
-- Students
UPDATE public.users SET password = 'password123' WHERE role = 'student' AND (password IS NULL OR password = '');
UPDATE public.users SET department = 'Computer Science & Engineering' WHERE role = 'student' AND department IS NULL;

-- Warden
UPDATE public.users SET password = 'wardenpassword123' WHERE role = 'warden' AND (password IS NULL OR password = '');

-- Maintenance Staff
UPDATE public.users SET password = 'staffpassword123' WHERE role = 'staff' AND (password IS NULL OR password = '');
UPDATE public.users SET alt_email = 'ramesh.electrician@veltech.edu.in', email = 'electrical@veltech.edu.in' WHERE id = 'staff-ramesh';
UPDATE public.users SET alt_email = 'sundar.plumber@veltech.edu.in', email = 'plumbing@veltech.edu.in' WHERE id = 'staff-sundar';
UPDATE public.users SET alt_email = 'anthony.carpenter@veltech.edu.in', email = 'carpentry@veltech.edu.in' WHERE id = 'staff-anthony';
UPDATE public.users SET alt_email = 'vignesh.network@veltech.edu.in', email = 'network@veltech.edu.in' WHERE id = 'staff-vignesh';

INSERT INTO public.users (id, name, email, role, department, specialization, password, block, room_no, phone)
VALUES ('staff-selvam', 'Selvam K.', 'housekeeping@veltech.edu.in', 'staff', 'Housekeeping & Sanitation', 'Sanitation Lead', 'staffpassword123', 'Campus Maintenance Depot', 'Depot-05', '+91 98406 12345')
ON CONFLICT (id) DO UPDATE SET password = 'staffpassword123';

-- 4. Enable Row Level Security (RLS) & Grant Public Permissions
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies for Anonymous/Public API Key access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow select on users') THEN
    CREATE POLICY "Allow select on users" ON public.users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow insert on users') THEN
    CREATE POLICY "Allow insert on users" ON public.users FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow update on users') THEN
    CREATE POLICY "Allow update on users" ON public.users FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'Allow select on complaints') THEN
    CREATE POLICY "Allow select on complaints" ON public.complaints FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'Allow insert on complaints') THEN
    CREATE POLICY "Allow insert on complaints" ON public.complaints FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'Allow update on complaints') THEN
    CREATE POLICY "Allow update on complaints" ON public.complaints FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'status_history' AND policyname = 'Allow select on status_history') THEN
    CREATE POLICY "Allow select on status_history" ON public.status_history FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'status_history' AND policyname = 'Allow insert on status_history') THEN
    CREATE POLICY "Allow insert on status_history" ON public.status_history FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Allow select on feedback') THEN
    CREATE POLICY "Allow select on feedback" ON public.feedback FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Allow insert on feedback') THEN
    CREATE POLICY "Allow insert on feedback" ON public.feedback FOR INSERT WITH CHECK (true);
  END IF;
END $$;
