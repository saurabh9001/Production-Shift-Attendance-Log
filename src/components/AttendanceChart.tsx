import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { AttendanceRecord, Worker } from '../App';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AttendanceChartProps {
  attendanceRecords: AttendanceRecord[];
  workers: Worker[];
}

export function AttendanceChart({ attendanceRecords, workers }: AttendanceChartProps) {
  // Get last 30 days
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  // Calculate daily attendance trends
  const trendData = useMemo(() => {
    return last30Days.map(date => {
      const dayRecords = attendanceRecords.filter(r => r.date === date);
      const present = dayRecords.filter(r => r.status === 'Present').length;
      const absent = dayRecords.filter(r => r.status === 'Absent').length;
      const total = dayRecords.length;
      const rate = total > 0 ? (present / total) * 100 : 0;
      
      return {
        date,
        present,
        absent,
        rate,
      };
    });
  }, [last30Days, attendanceRecords]);

  // Calculate shift-wise distribution
  const shiftData = useMemo(() => {
    const shifts = ['Morning', 'Afternoon', 'Night'];
    return shifts.map(shift => {
      const shiftRecords = attendanceRecords.filter(r => r.shift === shift);
      const present = shiftRecords.filter(r => r.status === 'Present').length;
      const absent = shiftRecords.filter(r => r.status === 'Absent').length;
      const totalHours = shiftRecords
        .filter(r => r.status === 'Present')
        .reduce((sum, r) => sum + (r.workingHours || 0), 0);
      
      return {
        shift,
        present,
        absent,
        totalHours,
      };
    });
  }, [attendanceRecords]);

  // Calculate employee performance
  const employeeStats = useMemo(() => {
    return workers.map(worker => {
      const workerRecords = attendanceRecords.filter(r => r.workerId === worker.id);
      const presentCount = workerRecords.filter(r => r.status === 'Present').length;
      const totalCount = workerRecords.length;
      const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
      
      return {
        ...worker,
        presentCount,
        absentCount: totalCount - presentCount,
        totalCount,
        attendanceRate,
      };
    });
  }, [workers, attendanceRecords]);

  const mostPresent = employeeStats.reduce((max, emp) => 
    emp.attendanceRate > max.attendanceRate ? emp : max
  , employeeStats[0]);

  const leastPresent = employeeStats.reduce((min, emp) => 
    emp.attendanceRate < min.attendanceRate ? emp : min
  , employeeStats[0]);

  // Get last 7 days for smaller chart
  const last7Days = last30Days.slice(-7);
  const last7DaysData = trendData.slice(-7);

  const attendanceTrendData = {
    labels: trendData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: trendData.map(d => d.rate),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const absenceTrendData = {
    labels: trendData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Absent Count',
        data: trendData.map(d => d.absent),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Present Count',
        data: trendData.map(d => d.present),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: shiftData.map(d => d.shift),
    datasets: [
      {
        label: 'Present',
        data: shiftData.map(d => d.present),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Absent',
        data: shiftData.map(d => d.absent),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const hoursChartData = {
    labels: shiftData.map(d => d.shift),
    datasets: [
      {
        label: 'Total Working Hours',
        data: shiftData.map(d => d.totalHours),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-slate-900 mb-1">Analytics & Insights</h1>
        <p className="text-slate-600">Comprehensive attendance trends and performance metrics</p>
      </div>

      {/* Employee Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-900">Most Present Employee</CardTitle>
                <CardDescription>Best attendance record</CardDescription>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="size-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-900 text-xl">{mostPresent.name}</div>
                <div className="text-green-700 text-sm">{mostPresent.employeeId} • {mostPresent.shift} Shift</div>
              </div>
              <div className="text-right">
                <div className="text-green-900 text-3xl">{mostPresent.attendanceRate.toFixed(1)}%</div>
                <div className="text-green-700 text-sm">Attendance</div>
              </div>
            </div>
            <div className="pt-3 border-t border-green-200 grid grid-cols-2 gap-4">
              <div>
                <div className="text-green-700 text-sm">Days Present</div>
                <div className="text-green-900 text-xl">{mostPresent.presentCount}</div>
              </div>
              <div>
                <div className="text-green-700 text-sm">Days Absent</div>
                <div className="text-green-900 text-xl">{mostPresent.absentCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-xl transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-900">Needs Attention</CardTitle>
                <CardDescription>Lowest attendance record</CardDescription>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="size-6 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-900 text-xl">{leastPresent.name}</div>
                <div className="text-red-700 text-sm">{leastPresent.employeeId} • {leastPresent.shift} Shift</div>
              </div>
              <div className="text-right">
                <div className="text-red-900 text-3xl">{leastPresent.attendanceRate.toFixed(1)}%</div>
                <div className="text-red-700 text-sm">Attendance</div>
              </div>
            </div>
            <div className="pt-3 border-t border-red-200 grid grid-cols-2 gap-4">
              <div>
                <div className="text-red-700 text-sm">Days Present</div>
                <div className="text-red-900 text-xl">{leastPresent.presentCount}</div>
              </div>
              <div>
                <div className="text-red-700 text-sm">Days Absent</div>
                <div className="text-red-900 text-xl">{leastPresent.absentCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Attendance Rate Trend (Last 30 Days)</CardTitle>
          <CardDescription>
            Daily attendance percentage over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={attendanceTrendData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Absence Trend */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            <CardTitle>Absence Trend Analysis (Last 30 Days)</CardTitle>
          </div>
          <CardDescription>
            Track absent and present counts to identify patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={absenceTrendData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift-wise Distribution */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Shift-wise Distribution</CardTitle>
            <CardDescription>
              Present vs Absent by shift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Total Working Hours by Shift */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Total Working Hours</CardTitle>
            <CardDescription>
              Cumulative hours by shift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={hoursChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-600">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 text-3xl mb-1">
              {(trendData.reduce((sum, d) => sum + d.rate, 0) / trendData.length).toFixed(1)}%
            </div>
            <p className="text-slate-600 text-sm">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-600">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 text-3xl mb-1">
              {shiftData.reduce((sum, d) => sum + d.totalHours, 0).toFixed(0)}
            </div>
            <p className="text-slate-600 text-sm">All shifts combined</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-600">Best Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 text-xl mb-1">
              {(() => {
                const best = trendData.reduce((max, d) => d.rate > max.rate ? d : max, trendData[0]);
                return new Date(best.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              })()}
            </div>
            <p className="text-slate-600 text-sm">
              {trendData.reduce((max, d) => d.rate > max.rate ? d : max, trendData[0]).rate.toFixed(1)}% attendance
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-slate-600">Total Absences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 text-3xl mb-1">
              {trendData.reduce((sum, d) => sum + d.absent, 0)}
            </div>
            <p className="text-slate-600 text-sm">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Employee Performance Summary</CardTitle>
          <CardDescription>
            Detailed attendance statistics for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-slate-700">Employee</th>
                  <th className="text-left p-3 text-slate-700">ID</th>
                  <th className="text-left p-3 text-slate-700">Shift</th>
                  <th className="text-center p-3 text-slate-700">Present</th>
                  <th className="text-center p-3 text-slate-700">Absent</th>
                  <th className="text-right p-3 text-slate-700">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {employeeStats
                  .sort((a, b) => b.attendanceRate - a.attendanceRate)
                  .map((emp) => (
                    <tr key={emp.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-slate-900">{emp.name}</td>
                      <td className="p-3 text-slate-600">{emp.employeeId}</td>
                      <td className="p-3 text-slate-600">{emp.shift}</td>
                      <td className="p-3 text-center text-green-700">{emp.presentCount}</td>
                      <td className="p-3 text-center text-red-700">{emp.absentCount}</td>
                      <td className="p-3 text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          emp.attendanceRate >= 90 
                            ? 'bg-green-100 text-green-800' 
                            : emp.attendanceRate >= 75 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
