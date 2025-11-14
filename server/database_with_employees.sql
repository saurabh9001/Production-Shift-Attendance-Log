-- Enhanced database schema with employees table
DROP DATABASE IF EXISTS attendance_db;
CREATE DATABASE attendance_db;
USE attendance_db;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  shift ENUM('Morning', 'Afternoon', 'Night') NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_id (employee_id),
  INDEX idx_shift (shift),
  INDEX idx_status (status)
);

-- Create attendance table with foreign key to employees
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(100) NOT NULL,
  shift ENUM('Morning', 'Afternoon', 'Night') NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late', 'Half Day') NOT NULL,
  check_in TIME,
  check_out TIME,
  hours_worked DECIMAL(4,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_employee (employee_id),
  INDEX idx_shift (shift),
  INDEX idx_status (status),
  UNIQUE KEY unique_attendance (employee_id, date, shift)
);

-- Insert sample employees
INSERT INTO employees (employee_id, name, shift, email, phone, status) VALUES
('EMP001', 'John Smith', 'Morning', 'john.smith@company.com', '555-0101', 'Active'),
('EMP002', 'Sarah Johnson', 'Morning', 'sarah.j@company.com', '555-0102', 'Active'),
('EMP003', 'Mike Wilson', 'Afternoon', 'mike.w@company.com', '555-0103', 'Active'),
('EMP004', 'Emily Brown', 'Afternoon', 'emily.b@company.com', '555-0104', 'Active'),
('EMP005', 'David Lee', 'Night', 'david.l@company.com', '555-0105', 'Active'),
('EMP006', 'Lisa Garcia', 'Night', 'lisa.g@company.com', '555-0106', 'Active'),
('EMP007', 'James Martinez', 'Morning', 'james.m@company.com', '555-0107', 'Active'),
('EMP008', 'Maria Rodriguez', 'Afternoon', 'maria.r@company.com', '555-0108', 'Active'),
('EMP009', 'Robert Chen', 'Night', 'robert.c@company.com', '555-0109', 'Active'),
('EMP010', 'Jennifer Taylor', 'Morning', 'jennifer.t@company.com', '555-0110', 'Active');

-- Insert sample attendance data for today
INSERT INTO attendance (employee_name, employee_id, shift, date, status, hours_worked, notes) VALUES
('John Smith', 'EMP001', 'Morning', CURDATE(), 'Present', 8.00, 'On time'),
('Sarah Johnson', 'EMP002', 'Morning', CURDATE(), 'Present', 7.83, 'Slightly late'),
('Mike Wilson', 'EMP003', 'Afternoon', CURDATE(), 'Present', 8.00, 'On time'),
('Emily Brown', 'EMP004', 'Afternoon', CURDATE(), 'Late', 7.25, 'Late arrival'),
('David Lee', 'EMP005', 'Night', CURDATE(), 'Absent', 0.00, 'Sick leave'),
('Lisa Garcia', 'EMP006', 'Night', CURDATE(), 'Present', 8.00, 'On time');

-- Insert some historical data (last 7 days)
INSERT INTO attendance (employee_name, employee_id, shift, date, status, hours_worked, notes)
SELECT 
  e.name,
  e.employee_id,
  e.shift,
  DATE_SUB(CURDATE(), INTERVAL d.day DAY) as date,
  CASE 
    WHEN RAND() > 0.15 THEN 'Present'
    ELSE 'Absent'
  END as status,
  CASE 
    WHEN RAND() > 0.15 THEN 8.00
    ELSE 0.00
  END as hours_worked,
  '' as notes
FROM employees e
CROSS JOIN (
  SELECT 1 as day UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
  UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
) d
WHERE e.status = 'Active';

SELECT 'Database schema updated with employees table and sample data!' AS message;
