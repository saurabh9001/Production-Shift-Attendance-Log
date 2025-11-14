import express from 'express';
import { verifyToken } from './auth.js';

const router = express.Router();
let pool;

export const setPool = (dbPool) => {
  pool = dbPool;
};

// Get all employees
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM employees ORDER BY name ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get employee by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get employee by employee_id
router.get('/employee-id/:employeeId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [req.params.employeeId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new employee
router.post('/', verifyToken, async (req, res) => {
  try {
    const { employee_id, name, shift, email, phone } = req.body;
    
    // Validate required fields
    if (!employee_id || !name || !shift) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID, name, and shift are required' 
      });
    }

    // Check if employee_id already exists
    const [existing] = await pool.query(
      'SELECT id FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Employee ID already exists' 
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO employees (employee_id, name, shift, email, phone, status) VALUES (?, ?, ?, ?, ?, "Active")',
      [employee_id, name, shift, email || null, phone || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Employee created successfully',
      data: { 
        id: result.insertId,
        employee_id,
        name,
        shift,
        email,
        phone
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, message: 'Employee ID already exists' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// Update employee
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, shift, email, phone, status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE employees SET name = ?, shift = ?, email = ?, phone = ?, status = ? WHERE id = ?',
      [name, shift, email || null, phone || null, status || 'Active', req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete employee (soft delete - mark as inactive)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE employees SET status = "Inactive" WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get employee statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN shift = 'Morning' THEN 1 ELSE 0 END) as morning_shift,
        SUM(CASE WHEN shift = 'Afternoon' THEN 1 ELSE 0 END) as afternoon_shift,
        SUM(CASE WHEN shift = 'Night' THEN 1 ELSE 0 END) as night_shift,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_employees,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive_employees
      FROM employees
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
