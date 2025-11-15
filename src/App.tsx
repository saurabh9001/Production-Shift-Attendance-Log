import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { AttendanceForm } from './components/AttendanceForm';
import { AttendanceDashboard } from './components/AttendanceDashboard';
import { AttendanceTable } from './components/AttendanceTable';
import { AttendanceChart } from './components/AttendanceChart';
import { attendanceAPI, employeesAPI } from './services/api';
import { toast } from 'sonner';

export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  employeeId: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  status: 'Present' | 'Absent';
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
}

// Mock data for demonstration
const initialWorkers: Worker[] = [
  { id: '1', name: 'John Smith', employeeId: 'EMP001', shift: 'Morning' },
  { id: '2', name: 'Sarah Johnson', employeeId: 'EMP002', shift: 'Morning' },
  { id: '3', name: 'Mike Wilson', employeeId: 'EMP003', shift: 'Afternoon' },
  { id: '4', name: 'Emily Brown', employeeId: 'EMP004', shift: 'Afternoon' },
  { id: '5', name: 'David Lee', employeeId: 'EMP005', shift: 'Night' },
  { id: '6', name: 'Lisa Garcia', employeeId: 'EMP006', shift: 'Night' },
  { id: '7', name: 'James Martinez', employeeId: 'EMP007', shift: 'Morning' },
  { id: '8', name: 'Maria Rodriguez', employeeId: 'EMP008', shift: 'Afternoon' },
  { id: '9', name: 'Robert Chen', employeeId: 'EMP009', shift: 'Night' },
  { id: '10', name: 'Jennifer Taylor', employeeId: 'EMP010', shift: 'Morning' },
];

// Generate mock attendance data for the last 30 days
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    initialWorkers.forEach((worker) => {
      // Different attendance patterns for different workers
      let attendanceRate = 0.85;
      if (worker.id === '1') attendanceRate = 0.95; // Most present
      if (worker.id === '5') attendanceRate = 0.65; // Least present
      
      const isPresent = Math.random() < attendanceRate;
      const record: AttendanceRecord = {
        id: `${worker.id}-${dateStr}`,
        workerId: worker.id,
        workerName: worker.name,
        employeeId: worker.employeeId,
        date: dateStr,
        shift: worker.shift,
        status: isPresent ? 'Present' : 'Absent',
      };
      
      if (isPresent) {
        let checkInHour = 0;
        let checkOutHour = 0;
        let expectedCheckIn = 0;
        let expectedCheckOut = 0;
        
        if (worker.shift === 'Morning') {
          expectedCheckIn = 6;
          expectedCheckOut = 14;
          checkInHour = 6 + Math.floor(Math.random() * 2); // Can be late
          checkOutHour = 14 - Math.floor(Math.random() * 2); // Can leave early
        } else if (worker.shift === 'Afternoon') {
          expectedCheckIn = 14;
          expectedCheckOut = 22;
          checkInHour = 14 + Math.floor(Math.random() * 2);
          checkOutHour = 22 - Math.floor(Math.random() * 2);
        } else {
          expectedCheckIn = 22;
          expectedCheckOut = 6;
          checkInHour = 22 + Math.floor(Math.random() * 2);
          checkOutHour = 6 - Math.floor(Math.random() * 2);
        }
        
        const checkInMin = Math.floor(Math.random() * 60);
        const checkOutMin = Math.floor(Math.random() * 60);
        
        record.checkIn = `${String(checkInHour % 24).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`;
        record.checkOut = `${String(checkOutHour % 24).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`;
        record.workingHours = 8 + (Math.random() * 0.5 - 0.25);
      }
      
      records.push(record);
    });
  }
  
  return records;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
      // Auto-set dummy token for development
      token = 'dummy-token-for-development';
      localStorage.setItem('token', token);
    }
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  }, []);

  // Fetch data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn]);

  // Fetch attendance records after workers are loaded
  useEffect(() => {
    if (workers.length > 0) {
      fetchAttendanceRecords();
    }
  }, [workers]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll();
      if (response.success && response.data) {
        // Transform database format to frontend format
        const transformedWorkers = response.data.map((emp: any) => ({
          id: emp.employee_id,
          name: emp.name,
          employeeId: emp.employee_id,
          shift: emp.shift,
        }));
        setWorkers(transformedWorkers);
        console.log('✅ Employees loaded from database:', transformedWorkers.length);
      }
    } catch (err: any) {
      console.error('❌ Error fetching employees:', err);
      toast.error('Failed to fetch employees from database');
      // Fallback to mock data if API fails
      setWorkers(initialWorkers);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAll();
      if (response.success && response.data) {
        // Transform database format to frontend format
        const transformedRecords = response.data.map((record: any) => {
          return {
            id: record.id.toString(),
            workerId: record.worker_id?.toString() || record.employee_id,
            workerName: record.employee_name,
            employeeId: record.employee_id,
            date: record.date.split('T')[0], // Convert to YYYY-MM-DD
            shift: record.shift,
            status: record.status,
            checkIn: record.check_in || undefined,
            checkOut: record.check_out || undefined,
            workingHours: record.hours_worked ? parseFloat(record.hours_worked) : undefined,
          };
        });
        setAttendanceRecords(transformedRecords);
        console.log('✅ Attendance records loaded from database:', transformedRecords.length);
      }
    } catch (err: any) {
      console.error('❌ Error fetching attendance:', err);
      toast.error('Failed to fetch attendance records from database');
      // Fallback to mock data if API fails
      setAttendanceRecords(generateMockAttendance());
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Set a dummy token for API access (bypassing real authentication for now)
    localStorage.setItem('token', 'dummy-token-for-development');
    localStorage.setItem('user', JSON.stringify({ name: 'Admin User' }));
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentPage('landing');
    setWorkers([]);
    setAttendanceRecords([]);
  };

  const handleAddAttendance = async (record: any) => {
    try {
      setLoading(true);
      
      // Transform frontend format to database format
      const dbRecord = {
        employee_name: record.workerName,
        employee_id: record.employeeId,
        shift: record.shift,
        date: record.date,
        status: record.status,
        hours_worked: record.workingHours || 0,
        notes: '',
      };
      
      console.log('📝 Creating attendance record:', dbRecord);
      const response = await attendanceAPI.create(dbRecord);
      
      if (response.success) {
        toast.success('✅ Attendance recorded in database successfully');
        // Refresh attendance records from database
        await fetchAttendanceRecords();
      } else {
        throw new Error(response.message || 'Failed to create attendance record');
      }
    } catch (err: any) {
      console.error('❌ Error creating attendance:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create attendance record';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (updatedRecord: any) => {
    try {
      setLoading(true);
      
      // Transform frontend format to database format
      const dbRecord = {
        employee_name: updatedRecord.workerName,
        employee_id: updatedRecord.employeeId,
        shift: updatedRecord.shift,
        date: updatedRecord.date,
        status: updatedRecord.status,
        hours_worked: updatedRecord.workingHours || 0,
        notes: '',
      };
      
      console.log('📝 Updating attendance record:', dbRecord);
      const response = await attendanceAPI.update(parseInt(updatedRecord.id), dbRecord);
      
      if (response.success) {
        toast.success('✅ Attendance updated in database successfully');
        // Refresh attendance records from database
        await fetchAttendanceRecords();
      } else {
        throw new Error(response.message || 'Failed to update attendance record');
      }
    } catch (err: any) {
      console.error('❌ Error updating attendance:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update attendance record';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {loading && (
          <div className="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            🔄 Loading from database...
          </div>
        )}

        {currentPage === 'dashboard' && (
          <AttendanceDashboard 
            attendanceRecords={attendanceRecords}
            workers={workers}
          />
        )}

        {currentPage === 'mark-attendance' && (
          <AttendanceForm 
            workers={workers}
            onSubmit={handleAddAttendance}
          />
        )}

        {currentPage === 'records' && (
          <AttendanceTable 
            attendanceRecords={attendanceRecords}
            workers={workers}
            onUpdateRecord={handleUpdateAttendance}
          />
        )}

        {currentPage === 'analytics' && (
          <AttendanceChart 
            attendanceRecords={attendanceRecords}
            workers={workers}
          />
        )}
      </div>
    </div>
  );
}
