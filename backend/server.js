require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db.isSupabase ? 'supabase' : 'sqlite',
    supabaseConnected: Boolean(db.isSupabase),
    institution: 'Vel Tech University',
    portal: 'Hostel Complaint Management System',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// DEDICATED LOGIN ENDPOINTS FOR EACH ROLE
// -------------------------------------------------------------

// 1. Student Login (VTU No. or Email + Password)
app.post('/api/auth/student-login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'VTU Number or Email is required' });
    }

    let user = null;
    if (identifier.includes('@')) {
      user = await db.findUserByEmail(identifier);
    } else {
      user = await db.findUserByVtu(identifier);
    }

    if (!user || user.role !== 'student') {
      return res.status(401).json({ error: 'No student account found with this VTU number or email' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `token-student-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Warden Administrative Login
app.post('/api/auth/warden-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Warden Email or Staff ID is required' });
    }

    const user = await db.findUserByEmail(email);
    if (!user || user.role !== 'warden') {
      return res.status(401).json({ error: 'Unauthorized: Warden credentials required' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect warden password' });
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `token-warden-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Department Maintenance Staff Login
app.post('/api/auth/staff-login', async (req, res) => {
  try {
    const { email, department, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Staff Email or Department ID is required' });
    }

    const user = await db.findUserByEmail(email);
    if (!user || user.role !== 'staff') {
      return res.status(401).json({ error: 'No maintenance staff account found with this email' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `token-staff-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic login fallback
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Account not found' });
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Self-Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, vtuNo, regNo, block, roomNo, phone, department } = req.body;
    if (!name || !email || !vtuNo) {
      return res.status(400).json({ error: 'Name, email, and VTU Number are required' });
    }

    const existing = (await db.findUserByEmail(email)) || (await db.findUserByVtu(vtuNo));
    if (existing) {
      return res.status(400).json({ error: 'Account already registered with this email or VTU number' });
    }

    const user = await db.createUser({
      name,
      email,
      password: password || 'password123',
      role: 'student',
      vtuNo,
      regNo: regNo || `24UECS${Math.floor(1000 + Math.random() * 900)}`,
      block: block || 'Block A (Boys Hostel)',
      roomNo: roomNo || '101',
      phone: phone || '+91 98765 00000',
      department: department || 'Computer Science & Engineering'
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users & Staff
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers(req.query.role);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    const staff = await db.getUsers('staff');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// COMPLAINTS REST API
// -------------------------------------------------------------

app.get('/api/complaints', async (req, res) => {
  try {
    const list = await db.getComplaints(req.query);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const item = await db.getComplaintById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Complaint not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { title, description, category, priority, block, roomNo, imageUrl, studentId, studentName, studentVtu, studentPhone } = req.body;
    if (!title || !description || !studentId) {
      return res.status(400).json({ error: 'Title, description, and studentId are required' });
    }

    const created = await db.createComplaint({
      title,
      description,
      category,
      priority,
      block,
      roomNo,
      imageUrl,
      studentId,
      studentName: studentName || 'Student',
      studentVtu: studentVtu || 'VTU28319',
      studentPhone: studentPhone || ''
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/complaints/:id/assign', async (req, res) => {
  try {
    const { staffId, wardenName, notes } = req.body;
    if (!staffId) return res.status(400).json({ error: 'staffId is required' });

    const updated = await db.assignComplaint(req.params.id, staffId, wardenName, notes);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/complaints/:id/status', async (req, res) => {
  try {
    const { status, updatedBy, updatedByRole, remarks, resolutionNotes, resolutionImageUrl } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const updated = await db.updateComplaintStatus(req.params.id, {
      status,
      updatedBy,
      updatedByRole,
      remarks,
      resolutionNotes,
      resolutionImageUrl
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complaints/:id/feedback', async (req, res) => {
  try {
    const { studentId, studentName, rating, comment } = req.body;
    if (!rating) return res.status(400).json({ error: 'rating is required' });

    const updated = await db.addFeedback(req.params.id, {
      studentId,
      studentName,
      rating,
      comment
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Vel Tech Hostel Complaint Backend Running`);
  console.log(`Database: ${db.isSupabase ? 'Supabase Cloud (PostgreSQL)' : 'Local SQLite'}`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
