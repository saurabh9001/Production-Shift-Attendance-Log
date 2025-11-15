import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import authRoutes, { setPool as setAuthPool } from './routes/auth.js';
import attendanceRoutes, { setPool as setAttendancePool } from './routes/attendance.js';
import employeesRoutes, { setPool as setEmployeesPool } from './routes/employees.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'https://virtualduniya.com', 'http://virtualduniya.com', 'https://production-shift-attendance-log.onrender.com'], // Allow frontend from different ports
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected Successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

// Set pool for routes
setAuthPool(pool);
setAttendancePool(pool);
setEmployeesPool(pool);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Employees routes (protected)
app.use('/api/employees', employeesRoutes);

// Attendance routes (protected)
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - Health: GET /api/health`);
  console.log(`   - Auth: POST /api/auth/login, /register, /logout`);
  console.log(`   - Attendance: /api/attendance (CRUD operations)`);
});
