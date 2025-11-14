import express from 'express';
import { verifyToken } from './auth.js';

const router = express.Router();
let pool;

const findEmployeeByEmployeeId = async (employeeId) => {
  if (!employeeId) {
    return null;
  }
  const [rows] = await pool.query(
    'SELECT id, employee_id, name, shift FROM employees WHERE employee_id = ? LIMIT 1',
    [employeeId]
  );
  return rows[0] || null;
};

export const setPool = (dbPool) => {
  pool = dbPool;
};

// Get all attendance records
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance ORDER BY date DESC, shift ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance by date range
// Get attendance by date range (legacy path)
router.get('/filter/date-range', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [rows] = await pool.query(
      'SELECT * FROM attendance WHERE date BETWEEN ? AND ? ORDER BY date DESC, shift ASC',
      [startDate, endDate]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias path expected by frontend client (/attendance/date-range)
router.get('/date-range', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }
    const [rows] = await pool.query(
      'SELECT * FROM attendance WHERE date BETWEEN ? AND ? ORDER BY date DESC, shift ASC',
      [startDate, endDate]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching attendance date-range:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new attendance record
router.post('/', verifyToken, async (req, res) => {
  try {
    const { employee_name, employee_id, shift, date, status, check_in, check_out, hours_worked, notes } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required' });
    }

    const employee = await findEmployeeByEmployeeId(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const resolvedName = employee_name || employee.name;
    const resolvedShift = shift || employee.shift;
    const workerId = employee.id;

    const [result] = await pool.query(
      'INSERT INTO attendance (employee_name, employee_id, worker_id, shift, date, status, check_in, check_out, hours_worked, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        resolvedName,
        employee.employee_id,
        workerId,
        resolvedShift,
        date,
        status,
        check_in || null,
        check_out || null,
        hours_worked ?? 0,
        notes || ''
      ]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Attendance record created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, message: 'Attendance record already exists for this employee, date, and shift' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// Update attendance record
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { employee_name, employee_id, shift, date, status, check_in, check_out, hours_worked, notes } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required' });
    }

    const employee = await findEmployeeByEmployeeId(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const resolvedName = employee_name || employee.name;
    const resolvedShift = shift || employee.shift;

    const [result] = await pool.query(
      'UPDATE attendance SET employee_name = ?, employee_id = ?, worker_id = ?, shift = ?, date = ?, status = ?, check_in = ?, check_out = ?, hours_worked = ?, notes = ? WHERE id = ?',
      [
        resolvedName,
        employee.employee_id,
        employee.id,
        resolvedShift,
        date,
        status,
        check_in || null,
        check_out || null,
        hours_worked ?? 0,
        notes,
        req.params.id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Attendance record updated successfully'
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete attendance record
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as half_day_count,
        ROUND(AVG(hours_worked),2) as avg_hours
      FROM attendance
    `);
    // Derive percentages
    const summary = stats[0] || {};
    const total = summary.total_records || 0;
    const percent = (n) => total ? +( (n / total) * 100 ).toFixed(2) : 0;
    res.json({ 
      success: true, 
      data: {
        ...summary,
        present_percent: percent(summary.present_count),
        absent_percent: percent(summary.absent_count),
        late_percent: percent(summary.late_count),
        half_day_percent: percent(summary.half_day_count)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
