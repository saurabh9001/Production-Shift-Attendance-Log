import axios from 'axios';

// Prefer environment override for flexibility
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    // Use dummy token for development if no token exists
    if (!token) {
      token = 'dummy-token-for-development';
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Attendance API
export const attendanceAPI = {
  // Get all attendance records
  getAll: async () => {
    const response = await apiClient.get('/attendance');
    return response.data;
  },

  // Get attendance by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },

  // Get attendance by date range
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/attendance/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Create new attendance record
  create: async (data: {
    employee_name: string;
    employee_id: string;
    shift: string;
    date: string;
    status: string;
    hours_worked?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  // Update attendance record
  update: async (id: number, data: {
    employee_name: string;
    employee_id: string;
    shift: string;
    date: string;
    status: string;
    hours_worked?: number;
    notes?: string;
  }) => {
    const response = await apiClient.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete attendance record
  delete: async (id: number) => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await apiClient.get('/attendance/stats/summary');
    return response.data;
  }
};

// Employees API
export const employeesAPI = {
  // Get all employees
  getAll: async () => {
    const response = await apiClient.get('/employees');
    return response.data;
  },

  // Get employee by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  // Get employee by employee_id
  getByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get(`/employees/employee-id/${employeeId}`);
    return response.data;
  },

  // Create new employee
  create: async (data: {
    employee_id: string;
    name: string;
    shift: string;
    email?: string;
    phone?: string;
  }) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  // Update employee
  update: async (id: number, data: {
    name: string;
    shift: string;
    email?: string;
    phone?: string;
    status?: string;
  }) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },

  // Delete employee
  delete: async (id: number) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await apiClient.get('/employees/stats/summary');
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
