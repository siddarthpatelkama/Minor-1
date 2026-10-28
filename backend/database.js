const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hostel.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');

// 1. Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'warden', 'staff')),
    vtu_no TEXT,
    reg_no TEXT,
    block TEXT,
    room_no TEXT,
    phone TEXT,
    department TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    block TEXT NOT NULL,
    room_no TEXT NOT NULL,
    image_url TEXT,
    resolution_image_url TEXT,
    resolution_notes TEXT,
    student_id TEXT,
    student_name TEXT NOT NULL,
    student_vtu TEXT NOT NULL,
    student_phone TEXT,
    assigned_staff_id TEXT,
    assigned_staff_name TEXT,
    assigned_staff_role TEXT,
    assigned_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT,
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(assigned_staff_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_by_role TEXT NOT NULL,
    remarks TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL UNIQUE,
    student_id TEXT,
    student_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
  );
`);

// 2. Seed Initial Users if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, vtu_no, reg_no, block, room_no, phone, department, created_at)
    VALUES (@id, @name, @email, @password, @role, @vtu_no, @reg_no, @block, @room_no, @phone, @department, @created_at)
  `);

  const initialUsers = [
    // Students
    {
      id: 'student-siddarth',
      name: 'K. Siddarth Patel',
      email: 'siddarth.patel@veltech.edu.in',
      password: 'password123',
      role: 'student',
      vtu_no: 'VTU28319',
      reg_no: '24UECS1237',
      block: 'Block A (Boys Hostel)',
      room_no: 'A-204',
      phone: '+91 98765 43210',
      department: 'Computer Science & Engineering',
      created_at: new Date().toISOString()
    },
    {
      id: 'student-sreevasthav',
      name: 'Ramsetty Sreevasthav',
      email: 'sreevasthav.r@veltech.edu.in',
      password: 'password123',
      role: 'student',
      vtu_no: 'VTU28844',
      reg_no: '24UECS1353',
      block: 'Block B (Boys Hostel)',
      room_no: 'B-312',
      phone: '+91 98765 43211',
      department: 'Computer Science & Engineering',
      created_at: new Date().toISOString()
    },
    {
      id: 'student-rakesh',
      name: 'A. Rakesh',
      email: 'rakesh.a@veltech.edu.in',
      password: 'password123',
      role: 'student',
      vtu_no: 'VTU27728',
      reg_no: '24UECS1121',
      block: 'Block C (Boys Hostel)',
      room_no: 'C-108',
      phone: '+91 98765 43212',
      department: 'Computer Science & Engineering',
      created_at: new Date().toISOString()
    },
    {
      id: 'student-ananya',
      name: 'Ananya Sharma',
      email: 'ananya.s@veltech.edu.in',
      password: 'password123',
      role: 'student',
      vtu_no: 'VTU29104',
      reg_no: '24UECS1401',
      block: 'Block D (Girls Hostel)',
      room_no: 'D-402',
      phone: '+91 98765 43213',
      department: 'Information Technology',
      created_at: new Date().toISOString()
    },

    // Warden
    {
      id: 'warden-manohar',
      name: 'Dr. S. Manohar',
      email: 'chiefwarden@veltech.edu.in',
      password: 'wardenpassword123',
      role: 'warden',
      vtu_no: null,
      reg_no: null,
      block: 'Chief Warden Office',
      room_no: 'Admin Block 101',
      phone: '+91 94440 12345',
      department: 'Hostel Administration / CSE Faculty',
      created_at: new Date().toISOString()
    },

    // Department Maintenance Staff
    {
      id: 'staff-ramesh',
      name: 'Ramesh Kumar',
      email: 'electrical@veltech.edu.in',
      password: 'staffpassword123',
      role: 'staff',
      vtu_no: null,
      reg_no: null,
      block: 'Campus Maintenance Depot',
      room_no: 'Depot-01',
      phone: '+91 98401 23456',
      department: 'Electrical Department',
      created_at: new Date().toISOString()
    },
    {
      id: 'staff-sundar',
      name: 'Sundar Raj',
      email: 'plumbing@veltech.edu.in',
      password: 'staffpassword123',
      role: 'staff',
      vtu_no: null,
      reg_no: null,
      block: 'Campus Maintenance Depot',
      room_no: 'Depot-02',
      phone: '+91 98402 34567',
      department: 'Plumbing & Water Supply',
      created_at: new Date().toISOString()
    },
    {
      id: 'staff-anthony',
      name: 'Anthony Das',
      email: 'carpentry@veltech.edu.in',
      password: 'staffpassword123',
      role: 'staff',
      vtu_no: null,
      reg_no: null,
      block: 'Campus Maintenance Depot',
      room_no: 'Depot-03',
      phone: '+91 98403 45678',
      department: 'Carpentry & Furniture',
      created_at: new Date().toISOString()
    },
    {
      id: 'staff-vignesh',
      name: 'Vignesh N.',
      email: 'network@veltech.edu.in',
      password: 'staffpassword123',
      role: 'staff',
      vtu_no: null,
      reg_no: null,
      block: 'Campus IT Center',
      room_no: 'IT-04',
      phone: '+91 98405 67890',
      department: 'Network & Wi-Fi Operations',
      created_at: new Date().toISOString()
    },
    {
      id: 'staff-selvam',
      name: 'Selvam K.',
      email: 'housekeeping@veltech.edu.in',
      password: 'staffpassword123',
      role: 'staff',
      vtu_no: null,
      reg_no: null,
      block: 'Campus Sanitation Depot',
      room_no: 'Depot-05',
      phone: '+91 98404 56789',
      department: 'Housekeeping & Sanitation',
      created_at: new Date().toISOString()
    }
  ];

  const insertMany = db.transaction((users) => {
    for (const u of users) insertUser.run(u);
  });
  insertMany(initialUsers);
  console.log('✓ Seeded SQLite users successfully');
}

// 3. Seed Initial Complaints if empty
const complaintCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
if (complaintCount === 0) {
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (
      id, title, description, category, priority, status, block, room_no, image_url, resolution_image_url, resolution_notes,
      student_id, student_name, student_vtu, student_phone, assigned_staff_id, assigned_staff_name, assigned_staff_role,
      assigned_at, created_at, updated_at, resolved_at
    ) VALUES (
      @id, @title, @description, @category, @priority, @status, @block, @room_no, @image_url, @resolution_image_url, @resolution_notes,
      @student_id, @student_name, @student_vtu, @student_phone, @assigned_staff_id, @assigned_staff_name, @assigned_staff_role,
      @assigned_at, @created_at, @updated_at, @resolved_at
    )
  `);

  const insertHistory = db.prepare(`
    INSERT INTO status_history (id, complaint_id, status, updated_by, updated_by_role, remarks, timestamp)
    VALUES (@id, @complaint_id, @status, @updated_by, @updated_by_role, @remarks, @timestamp)
  `);

  const insertFeedback = db.prepare(`
    INSERT INTO feedback (id, complaint_id, student_id, student_name, rating, comment, created_at)
    VALUES (@id, @complaint_id, @student_id, @student_name, @rating, @comment, @created_at)
  `);

  const initialComplaints = [
    {
      id: 'VT-CMP-1001',
      title: 'Wall Socket Sparking and Burnt Switch',
      description: 'The 3-pin switchboard beside study desk in room A-204 sparked loudly while connecting laptop charger. One socket has black burn marks and the switch is loose. Sparks occur when turned on. Urgent repair needed.',
      category: 'Electrical',
      priority: 'Emergency',
      status: 'In Progress',
      block: 'Block A (Boys Hostel)',
      room_no: 'A-204',
      image_url: '/images/switchboard.jpg',
      resolution_image_url: null,
      resolution_notes: null,
      student_id: 'student-siddarth',
      student_name: 'K. Siddarth Patel',
      student_vtu: 'VTU28319',
      student_phone: '+91 98765 43210',
      assigned_staff_id: 'staff-ramesh',
      assigned_staff_name: 'Ramesh Kumar',
      assigned_staff_role: 'Electrical Department Specialist',
      assigned_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      resolved_at: null,
      history: [
        { id: 'hist-01', status: 'Pending', updated_by: 'K. Siddarth Patel', updated_by_role: 'student', remarks: 'Grievance submitted with Emergency priority due to fire risk', timestamp: new Date(Date.now() - 3600000 * 7).toISOString() },
        { id: 'hist-02', status: 'Assigned', updated_by: 'Dr. S. Manohar', updated_by_role: 'warden', remarks: 'Dispatched Ramesh Kumar (Electrician) for immediate inspection', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
        { id: 'hist-03', status: 'In Progress', updated_by: 'Ramesh Kumar', updated_by_role: 'staff', remarks: 'Arrived at Block A with replacement switchboard modular unit', timestamp: new Date(Date.now() - 3600000 * 1).toISOString() }
      ]
    },
    {
      id: 'VT-CMP-1002',
      title: 'Bathroom Geyser Inlet Pipe Leaking Water',
      description: 'Water heater in 3rd floor washroom is continuously dripping from the cold water pipe joint onto the floor tiles, and heating indicator trips within 2 minutes of turning on. Water accumulation is causing slipping risk.',
      category: 'Plumbing',
      priority: 'High',
      status: 'Assigned',
      block: 'Block B (Boys Hostel)',
      room_no: 'B-312 (Washroom #2)',
      image_url: '/images/geyser.jpg',
      resolution_image_url: null,
      resolution_notes: null,
      student_id: 'student-sreevasthav',
      student_name: 'Ramsetty Sreevasthav',
      student_vtu: 'VTU28844',
      student_phone: '+91 98765 43211',
      assigned_staff_id: 'staff-sundar',
      assigned_staff_name: 'Sundar Raj',
      assigned_staff_role: 'Plumbing & Water Supply Lead',
      assigned_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      resolved_at: null,
      history: [
        { id: 'hist-04', status: 'Pending', updated_by: 'Ramsetty Sreevasthav', updated_by_role: 'student', remarks: 'Geyser leaking issue filed', timestamp: new Date(Date.now() - 3600000 * 10).toISOString() },
        { id: 'hist-05', status: 'Assigned', updated_by: 'Dr. S. Manohar', updated_by_role: 'warden', remarks: 'Assigned to Sundar Raj (Plumber) for pipe fitting replacement', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
      ]
    },
    {
      id: 'VT-CMP-1003',
      title: 'Continuous Washbasin Tap Leakage',
      description: 'The washbasin tap on the 1st floor corridor does not shut off completely and has a steady stream of water dripping 24/7. Handle is stripped and loose.',
      category: 'Plumbing',
      priority: 'Medium',
      status: 'Resolved',
      block: 'Block C (Boys Hostel)',
      room_no: 'Corridor Washbasin 108',
      image_url: '/images/tap.jpg',
      resolution_image_url: '/images/tap.jpg',
      resolution_notes: 'Replaced worn rubber washer and tightened spindle fitting. Tested for 15 minutes, zero leakage.',
      student_id: 'student-rakesh',
      student_name: 'A. Rakesh',
      student_vtu: 'VTU27728',
      student_phone: '+91 98765 43212',
      assigned_staff_id: 'staff-sundar',
      assigned_staff_name: 'Sundar Raj',
      assigned_staff_role: 'Plumbing & Water Supply Lead',
      assigned_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      resolved_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      history: [
        { id: 'hist-06', status: 'Pending', updated_by: 'A. Rakesh', updated_by_role: 'student', remarks: 'Tap leaking reported', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'hist-07', status: 'Assigned', updated_by: 'Dr. S. Manohar', updated_by_role: 'warden', remarks: 'Assigned to plumbing staff', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'hist-08', status: 'Resolved', updated_by: 'Sundar Raj', updated_by_role: 'staff', remarks: 'Washer replaced and tested', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() }
      ],
      feedback: {
        id: 'fb-01',
        student_id: 'student-rakesh',
        student_name: 'A. Rakesh',
        rating: 5,
        comment: 'Plumber came within 24 hours and fixed the tap cleanly. Very good service.',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    },
    {
      id: 'VT-CMP-1004',
      title: 'Study Table Chair Backrest Damaged',
      description: 'The wooden and metal support frame on the hostel study desk chair in room C-108 has detached on the right hinge. Unable to sit properly for semester exams preparation.',
      category: 'Carpentry',
      priority: 'Low',
      status: 'Pending',
      block: 'Block C (Boys Hostel)',
      room_no: 'C-108',
      image_url: null,
      resolution_image_url: null,
      resolution_notes: null,
      student_id: 'student-rakesh',
      student_name: 'A. Rakesh',
      student_vtu: 'VTU27728',
      student_phone: '+91 98765 43212',
      assigned_staff_id: null,
      assigned_staff_name: null,
      assigned_staff_role: null,
      assigned_at: null,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      resolved_at: null,
      history: [
        { id: 'hist-09', status: 'Pending', updated_by: 'A. Rakesh', updated_by_role: 'student', remarks: 'Broken study chair reported', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() }
      ]
    },
    {
      id: 'VT-CMP-1005',
      title: 'Wi-Fi Access Point Frequent Disconnections',
      description: 'Hostel Block D 4th floor corridor Wi-Fi router keeps disconnecting every 10-15 minutes during evening study hours.',
      category: 'Internet & Wi-Fi',
      priority: 'High',
      status: 'Pending',
      block: 'Block D (Girls Hostel)',
      room_no: 'D-402',
      image_url: null,
      resolution_image_url: null,
      resolution_notes: null,
      student_id: 'student-ananya',
      student_name: 'Ananya Sharma',
      student_vtu: 'VTU29104',
      student_phone: '+91 98765 43213',
      assigned_staff_id: null,
      assigned_staff_name: null,
      assigned_staff_role: null,
      assigned_at: null,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      resolved_at: null,
      history: [
        { id: 'hist-10', status: 'Pending', updated_by: 'Ananya Sharma', updated_by_role: 'student', remarks: 'Wi-Fi connectivity issue submitted', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() }
      ]
    }
  ];

  const seedComplaints = db.transaction((list) => {
    for (const c of list) {
      insertComplaint.run({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        priority: c.priority,
        status: c.status,
        block: c.block,
        room_no: c.room_no,
        image_url: c.image_url,
        resolution_image_url: c.resolution_image_url,
        resolution_notes: c.resolution_notes,
        student_id: c.student_id,
        student_name: c.student_name,
        student_vtu: c.student_vtu,
        student_phone: c.student_phone,
        assigned_staff_id: c.assigned_staff_id,
        assigned_staff_name: c.assigned_staff_name,
        assigned_staff_role: c.assigned_staff_role,
        assigned_at: c.assigned_at,
        created_at: c.created_at,
        updated_at: c.updated_at,
        resolved_at: c.resolved_at
      });

      if (c.history) {
        for (const h of c.history) {
          insertHistory.run({
            id: h.id,
            complaint_id: c.id,
            status: h.status,
            updated_by: h.updated_by,
            updated_by_role: h.updated_by_role,
            remarks: h.remarks,
            timestamp: h.timestamp
          });
        }
      }

      if (c.feedback) {
        insertFeedback.run({
          id: c.feedback.id,
          complaint_id: c.id,
          student_id: c.feedback.student_id,
          student_name: c.feedback.student_name,
          rating: c.feedback.rating,
          comment: c.feedback.comment,
          created_at: c.feedback.created_at
        });
      }
    }
  });

  seedComplaints(initialComplaints);
  console.log('✓ Seeded SQLite complaints successfully');
}

// 4. Data Access API Methods
function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    vtuNo: u.vtu_no,
    regNo: u.reg_no,
    block: u.block,
    roomNo: u.room_no,
    phone: u.phone,
    department: u.department
  };
}

function mapComplaint(c) {
  if (!c) return null;
  const historyRows = db.prepare('SELECT * FROM status_history WHERE complaint_id = ? ORDER BY timestamp ASC').all(c.id);
  const feedbackRow = db.prepare('SELECT * FROM feedback WHERE complaint_id = ?').get(c.id);

  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    priority: c.priority,
    status: c.status,
    block: c.block,
    roomNo: c.room_no,
    imageUrl: c.image_url,
    resolutionImageUrl: c.resolution_image_url,
    resolutionNotes: c.resolution_notes,
    studentId: c.student_id,
    studentName: c.student_name,
    studentVtu: c.student_vtu,
    studentPhone: c.student_phone,
    assignedStaffId: c.assigned_staff_id,
    assignedStaffName: c.assigned_staff_name,
    assignedStaffRole: c.assigned_staff_role,
    assignedAt: c.assigned_at,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    resolvedAt: c.resolved_at,
    history: historyRows.map(h => ({
      id: h.id,
      complaintId: h.complaint_id,
      status: h.status,
      updatedBy: h.updated_by,
      updatedByRole: h.updated_by_role,
      remarks: h.remarks,
      timestamp: h.timestamp
    })),
    feedback: feedbackRow ? {
      id: feedbackRow.id,
      complaintId: feedbackRow.complaint_id,
      studentId: feedbackRow.student_id,
      studentName: feedbackRow.student_name,
      rating: feedbackRow.rating,
      comment: feedbackRow.comment,
      createdAt: feedbackRow.created_at
    } : null
  };
}

const supabaseService = require('./supabase');

const sqliteMethods = {
  db,

  // USERS
  getUsers(role) {
    let rows;
    if (role) {
      rows = db.prepare('SELECT * FROM users WHERE role = ?').all(role);
    } else {
      rows = db.prepare('SELECT * FROM users').all();
    }
    return rows.map(mapUser);
  },

  findUserById(id) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return mapUser(row);
  },

  findUserByEmail(email) {
    const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    return row ? { ...mapUser(row), password: row.password } : null;
  },

  findUserByVtu(vtuNo) {
    const row = db.prepare('SELECT * FROM users WHERE UPPER(vtu_no) = UPPER(?)').get(vtuNo);
    return row ? { ...mapUser(row), password: row.password } : null;
  },

  createUser(u) {
    const id = u.id || `student-${Date.now()}`;
    const timestamp = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, vtu_no, reg_no, block, room_no, phone, department, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      u.name,
      u.email,
      u.password || 'password123',
      u.role || 'student',
      u.vtuNo || null,
      u.regNo || null,
      u.block || 'Block A (Boys Hostel)',
      u.roomNo || '101',
      u.phone || null,
      u.department || 'Computer Science & Engineering',
      timestamp
    );
    return this.findUserById(id);
  },

  // COMPLAINTS
  getComplaints(filters = {}) {
    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];

    if (filters.status && filters.status !== 'All') {
      query += ' AND LOWER(status) = LOWER(?)';
      params.push(filters.status);
    }
    if (filters.category && filters.category !== 'All') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(filters.category);
    }
    if (filters.priority && filters.priority !== 'All') {
      query += ' AND LOWER(priority) = LOWER(?)';
      params.push(filters.priority);
    }
    if (filters.block && filters.block !== 'All') {
      query += ' AND block = ?';
      params.push(filters.block);
    }
    if (filters.studentId) {
      query += ' AND (student_id = ? OR student_vtu = ?)';
      params.push(filters.studentId, filters.studentId);
    }
    if (filters.assignedStaffId) {
      query += ' AND assigned_staff_id = ?';
      params.push(filters.assignedStaffId);
    }
    if (filters.search) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ? OR LOWER(room_no) LIKE ? OR LOWER(student_name) LIKE ?)';
      const s = `%${filters.search.toLowerCase()}%`;
      params.push(s, s, s, s, s);
    }

    query += ' ORDER BY datetime(created_at) DESC';
    const rows = db.prepare(query).all(...params);
    return rows.map(mapComplaint);
  },

  getComplaintById(id) {
    const row = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    return mapComplaint(row);
  },

  createComplaint(data) {
    const count = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const complaintId = `VT-CMP-${1000 + count + 1}`;
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO complaints (
        id, title, description, category, priority, status, block, room_no, image_url,
        student_id, student_name, student_vtu, student_phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      complaintId,
      data.title,
      data.description,
      data.category || 'Other',
      data.priority || 'Medium',
      data.block || 'Block A (Boys Hostel)',
      data.roomNo || 'N/A',
      data.imageUrl || null,
      data.studentId,
      data.studentName,
      data.studentVtu,
      data.studentPhone || null,
      timestamp,
      timestamp
    );

    db.prepare(`
      INSERT INTO status_history (id, complaint_id, status, updated_by, updated_by_role, remarks, timestamp)
      VALUES (?, ?, 'Pending', ?, 'student', ?, ?)
    `).run(
      `hist-${Date.now()}`,
      complaintId,
      data.studentName,
      `Grievance registered: ${data.title}`,
      timestamp
    );

    return this.getComplaintById(complaintId);
  },

  assignComplaint(id, staffId, wardenName, notes) {
    const staff = this.findUserById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const timestamp = new Date().toISOString();
    const remarks = notes || `Assigned to ${staff.name} (${staff.department || 'Maintenance'})`;

    db.prepare(`
      UPDATE complaints
      SET assigned_staff_id = ?, assigned_staff_name = ?, assigned_staff_role = ?, assigned_at = ?, status = 'Assigned', updated_at = ?
      WHERE id = ?
    `).run(
      staff.id,
      staff.name,
      staff.department || 'Maintenance Specialist',
      timestamp,
      timestamp,
      id
    );

    db.prepare(`
      INSERT INTO status_history (id, complaint_id, status, updated_by, updated_by_role, remarks, timestamp)
      VALUES (?, ?, 'Assigned', ?, 'warden', ?, ?)
    `).run(
      `hist-${Date.now()}`,
      id,
      wardenName || 'Dr. S. Manohar',
      remarks,
      timestamp
    );

    return this.getComplaintById(id);
  },

  updateComplaintStatus(id, { status, updatedBy, updatedByRole, remarks, resolutionNotes, resolutionImageUrl }) {
    const timestamp = new Date().toISOString();

    let query = 'UPDATE complaints SET status = ?, updated_at = ?';
    const params = [status, timestamp];

    if (status === 'Resolved') {
      query += ', resolved_at = ?';
      params.push(timestamp);
      if (resolutionNotes) {
        query += ', resolution_notes = ?';
        params.push(resolutionNotes);
      }
      if (resolutionImageUrl) {
        query += ', resolution_image_url = ?';
        params.push(resolutionImageUrl);
      }
    }

    query += ' WHERE id = ?';
    params.push(id);
    db.prepare(query).run(...params);

    db.prepare(`
      INSERT INTO status_history (id, complaint_id, status, updated_by, updated_by_role, remarks, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `hist-${Date.now()}`,
      id,
      status,
      updatedBy || 'Staff',
      updatedByRole || 'staff',
      remarks || `Status updated to ${status}`,
      timestamp
    );

    return this.getComplaintById(id);
  },

  addFeedback(id, { studentId, studentName, rating, comment }) {
    const timestamp = new Date().toISOString();
    db.prepare(`
      INSERT INTO feedback (id, complaint_id, student_id, student_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(complaint_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment
    `).run(
      `fb-${Date.now()}`,
      id,
      studentId,
      studentName,
      Number(rating) || 5,
      comment || '',
      timestamp
    );

    return this.getComplaintById(id);
  },

  getAnalytics() {
    const complaints = this.getComplaints();
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

if (supabaseService.isAvailable()) {
  console.log('⚡ Connected to Supabase Cloud Database (Hostel CMS)');
  module.exports = {
    ...supabaseService,
    isSupabase: true,
    db
  };
} else {
  console.log('📦 Using Local SQLite Database');
  module.exports = {
    ...sqliteMethods,
    isSupabase: false,
    db
  };
}

