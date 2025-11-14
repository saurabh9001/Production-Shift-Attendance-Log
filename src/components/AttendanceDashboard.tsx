import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Users, UserCheck, UserX, Clock, Download, Calendar, TrendingUp, TrendingDown, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { AttendanceRecord, Worker } from '../App';

interface AttendanceDashboardProps {
  attendanceRecords: AttendanceRecord[];
  workers: Worker[];
}

export function AttendanceDashboard({ attendanceRecords, workers }: AttendanceDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);

  const stats = {
    totalWorkers: workers.length,
    present: todayRecords.filter(r => r.status === 'Present').length,
    absent: todayRecords.filter(r => r.status === 'Absent').length,
    notMarked: workers.length - todayRecords.length,
  };

  // Calculate shift-wise totals for today
  const shiftStats = {
    Morning: {
      present: todayRecords.filter(r => r.shift === 'Morning' && r.status === 'Present').length,
      absent: todayRecords.filter(r => r.shift === 'Morning' && r.status === 'Absent').length,
      totalHours: todayRecords
        .filter(r => r.shift === 'Morning' && r.status === 'Present')
        .reduce((sum, r) => sum + (r.workingHours || 0), 0),
    },
    Afternoon: {
      present: todayRecords.filter(r => r.shift === 'Afternoon' && r.status === 'Present').length,
      absent: todayRecords.filter(r => r.shift === 'Afternoon' && r.status === 'Absent').length,
      totalHours: todayRecords
        .filter(r => r.shift === 'Afternoon' && r.status === 'Present')
        .reduce((sum, r) => sum + (r.workingHours || 0), 0),
    },
    Night: {
      present: todayRecords.filter(r => r.shift === 'Night' && r.status === 'Present').length,
      absent: todayRecords.filter(r => r.shift === 'Night' && r.status === 'Absent').length,
      totalHours: todayRecords
        .filter(r => r.shift === 'Night' && r.status === 'Present')
        .reduce((sum, r) => sum + (r.workingHours || 0), 0),
    },
  };

  // Calculate most and least present employees
  const employeeStats = workers.map(worker => {
    const workerRecords = attendanceRecords.filter(r => r.workerId === worker.id);
    const presentCount = workerRecords.filter(r => r.status === 'Present').length;
    const totalCount = workerRecords.length;
    const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
    
    return {
      ...worker,
      presentCount,
      totalCount,
      attendanceRate,
    };
  });

  const mostPresent = employeeStats.length > 0 ? employeeStats.reduce((max, emp) => 
    emp.attendanceRate > max.attendanceRate ? emp : max
  , employeeStats[0]) : null;

  const leastPresent = employeeStats.length > 0 ? employeeStats.reduce((min, emp) => 
    emp.attendanceRate < min.attendanceRate ? emp : min
  , employeeStats[0]) : null;

  // Check for late arrivals and early departures
  const checkLateOrEarlyWorkers = () => {
    const issues: Array<{worker: string, employeeId: string, issue: string, time: string, shift: string}> = [];
    
    todayRecords.forEach(record => {
      if (record.status === 'Present' && record.checkIn) {
        const [checkInHour] = record.checkIn.split(':').map(Number);
        let expectedHour = 0;
        
        if (record.shift === 'Morning') expectedHour = 6;
        else if (record.shift === 'Afternoon') expectedHour = 14;
        else expectedHour = 22;
        
        // Check if late (more than 30 minutes)
        if (checkInHour > expectedHour || (checkInHour === expectedHour && parseInt(record.checkIn.split(':')[1]) > 30)) {
          issues.push({
            worker: record.workerName,
            employeeId: record.employeeId,
            issue: 'Late Arrival',
            time: record.checkIn,
            shift: record.shift,
          });
        }
        
        // Check if left early (more than 30 minutes before shift end)
        if (record.checkOut) {
          const [checkOutHour] = record.checkOut.split(':').map(Number);
          let expectedEndHour = 0;
          
          if (record.shift === 'Morning') expectedEndHour = 14;
          else if (record.shift === 'Afternoon') expectedEndHour = 22;
          else expectedEndHour = 6;
          
          if (checkOutHour < expectedEndHour - 1) {
            issues.push({
              worker: record.workerName,
              employeeId: record.employeeId,
              issue: 'Early Departure',
              time: record.checkOut,
              shift: record.shift,
            });
          }
        }
      }
    });
    
    return issues;
  };

  const handlePrepareEmail = () => {
    const issues = checkLateOrEarlyWorkers();
    
    if (issues.length === 0) {
      toast.info('No late arrivals or early departures today');
      return;
    }

    const emailBody = `
Subject: Attendance Alert - ${new Date(today).toLocaleDateString()}

Dear Supervisor,

This is an automated alert regarding attendance irregularities for ${new Date(today).toLocaleDateString()}.

ISSUES DETECTED:
${issues.map((issue, idx) => `
${idx + 1}. ${issue.worker} (${issue.employeeId})
   - Issue: ${issue.issue}
   - Shift: ${issue.shift}
   - Time: ${issue.time}
`).join('')}

SUMMARY:
- Total Issues: ${issues.length}
- Late Arrivals: ${issues.filter(i => i.issue === 'Late Arrival').length}
- Early Departures: ${issues.filter(i => i.issue === 'Early Departure').length}

Please review and take appropriate action.

This is an automated message from AttendanceTrack Pro.
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(emailBody);
    toast.success(`Email draft prepared! ${issues.length} issue(s) found. Email copied to clipboard.`);
  };

  const handleDownloadSummary = () => {
    const summary = `
PRODUCTION SHIFT ATTENDANCE SUMMARY
Date: ${new Date(today).toLocaleDateString()}
Generated: ${new Date().toLocaleString()}

===========================================
OVERALL STATISTICS
===========================================
Total Workers: ${stats.totalWorkers}
Present: ${stats.present}
Absent: ${stats.absent}
Not Marked: ${stats.notMarked}
Attendance Rate: ${((stats.present / stats.totalWorkers) * 100).toFixed(1)}%

===========================================
TOP PERFORMERS
===========================================
MOST PRESENT EMPLOYEE
Most Present: ${mostPresent ? `${mostPresent.name} (${mostPresent.employeeId})` : 'N/A'}
- Attendance Rate: ${mostPresent ? `${mostPresent.attendanceRate.toFixed(1)}%` : 'N/A'}
- Days Present: ${mostPresent ? `${mostPresent.presentCount}/${mostPresent.totalCount}` : 'N/A'}

Needs Attention: ${leastPresent ? `${leastPresent.name} (${leastPresent.employeeId})` : 'N/A'}
- Attendance Rate: ${leastPresent ? `${leastPresent.attendanceRate.toFixed(1)}%` : 'N/A'}
- Days Present: ${leastPresent ? `${leastPresent.presentCount}/${leastPresent.totalCount}` : 'N/A'}

===========================================
SHIFT-WISE BREAKDOWN
===========================================

MORNING SHIFT (6 AM - 2 PM)
- Present: ${shiftStats.Morning.present}
- Absent: ${shiftStats.Morning.absent}
- Total Working Hours: ${shiftStats.Morning.totalHours.toFixed(2)} hrs

AFTERNOON SHIFT (2 PM - 10 PM)
- Present: ${shiftStats.Afternoon.present}
- Absent: ${shiftStats.Afternoon.absent}
- Total Working Hours: ${shiftStats.Afternoon.totalHours.toFixed(2)} hrs

NIGHT SHIFT (10 PM - 6 AM)
- Present: ${shiftStats.Night.present}
- Absent: ${shiftStats.Night.absent}
- Total Working Hours: ${shiftStats.Night.totalHours.toFixed(2)} hrs

===========================================
DETAILED RECORDS
===========================================
${todayRecords.map(r => 
  `${r.employeeId} | ${r.workerName} | ${r.shift} | ${r.status}${r.checkIn ? ` | In: ${r.checkIn} Out: ${r.checkOut} | Hours: ${r.workingHours?.toFixed(2)}` : ''}`
).join('\n')}
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-summary-${today}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Daily summary downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">Dashboard Overview</h1>
          <p className="text-slate-600">Real-time attendance monitoring and insights</p>
        </div>
      </div>

      {/* Header with Action Buttons */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="size-8" />
              <div>
                <h2 className="text-white mb-1">Today's Summary</h2>
                <p className="text-blue-100">{new Date(today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrepareEmail} variant="secondary">
                <Mail className="size-4 mr-2" />
                Email Alert
              </Button>
              <Button onClick={handleDownloadSummary} variant="secondary">
                <Download className="size-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-600">Total Workers</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="size-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 text-3xl mb-1">{stats.totalWorkers}</div>
            <p className="text-slate-500 text-sm">Registered employees</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-700">Present</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="size-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-green-900 text-3xl mb-1">{stats.present}</div>
            <p className="text-green-700 text-sm">
              {((stats.present / stats.totalWorkers) * 100).toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-700">Absent</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="size-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-red-900 text-3xl mb-1">{stats.absent}</div>
            <p className="text-red-700 text-sm">
              {((stats.absent / stats.totalWorkers) * 100).toFixed(1)}% absence rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-700">Not Marked</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="size-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-amber-900 text-3xl mb-1">{stats.notMarked}</div>
            <p className="text-amber-700 text-sm">Pending records</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
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
            {mostPresent ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-900">{mostPresent.name}</div>
                    <div className="text-green-700 text-sm">{mostPresent.employeeId} • {mostPresent.shift} Shift</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-900 text-2xl">{mostPresent.attendanceRate.toFixed(1)}%</div>
                    <div className="text-green-700 text-sm">Attendance</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Days Present:</span>
                    <span className="text-green-900">{mostPresent.presentCount} / {mostPresent.totalCount}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500">No employee data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-shadow">
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
            {leastPresent ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-red-900">{leastPresent.name}</div>
                    <div className="text-red-700 text-sm">{leastPresent.employeeId} • {leastPresent.shift} Shift</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-900 text-2xl">{leastPresent.attendanceRate.toFixed(1)}%</div>
                    <div className="text-red-700 text-sm">Attendance</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-red-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700">Days Present:</span>
                    <span className="text-red-900">{leastPresent.presentCount} / {leastPresent.totalCount}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500">No employee data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shift-wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">Morning Shift</CardTitle>
            <CardDescription>6 AM - 2 PM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Present:</span>
              <span className="text-green-700">{shiftStats.Morning.present}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Absent:</span>
              <span className="text-red-700">{shiftStats.Morning.absent}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Hours:</span>
                <span className="text-blue-700">
                  {shiftStats.Morning.totalHours.toFixed(2)} hrs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-purple-900">Afternoon Shift</CardTitle>
            <CardDescription>2 PM - 10 PM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Present:</span>
              <span className="text-green-700">{shiftStats.Afternoon.present}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Absent:</span>
              <span className="text-red-700">{shiftStats.Afternoon.absent}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Hours:</span>
                <span className="text-purple-700">
                  {shiftStats.Afternoon.totalHours.toFixed(2)} hrs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-indigo-900">Night Shift</CardTitle>
            <CardDescription>10 PM - 6 AM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Present:</span>
              <span className="text-green-700">{shiftStats.Night.present}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Absent:</span>
              <span className="text-red-700">{shiftStats.Night.absent}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Hours:</span>
                <span className="text-indigo-700">
                  {shiftStats.Night.totalHours.toFixed(2)} hrs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}