import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, Search, Filter, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { AttendanceRecord, Worker } from '../App';

interface AttendanceTableProps {
  attendanceRecords: AttendanceRecord[];
  workers: Worker[];
  onUpdateRecord: (record: AttendanceRecord) => void;
}

export function AttendanceTable({ attendanceRecords, workers, onUpdateRecord }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    status: 'Present' | 'Absent';
    checkIn: string;
    checkOut: string;
  }>({ status: 'Present', checkIn: '', checkOut: '' });

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesSearch = 
        record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesShift = filterShift === 'all' || record.shift === filterShift;
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      const matchesDate = !filterDate || record.date === filterDate;

      return matchesSearch && matchesShift && matchesStatus && matchesDate;
    });
  }, [attendanceRecords, searchTerm, filterShift, filterStatus, filterDate]);

  const handleStartEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditForm({
      status: record.status,
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
    });
  };

  const handleSaveEdit = (record: AttendanceRecord) => {
    let workingHours: number | undefined;
    
    if (editForm.status === 'Present' && editForm.checkIn && editForm.checkOut) {
      const [inHour, inMin] = editForm.checkIn.split(':').map(Number);
      const [outHour, outMin] = editForm.checkOut.split(':').map(Number);
      
      let hours = outHour - inHour;
      let minutes = outMin - inMin;
      
      if (hours < 0) {
        hours += 24;
      }
      
      workingHours = hours + minutes / 60;
    }

    const updatedRecord: AttendanceRecord = {
      ...record,
      status: editForm.status,
      checkIn: editForm.status === 'Present' ? editForm.checkIn : undefined,
      checkOut: editForm.status === 'Present' ? editForm.checkOut : undefined,
      workingHours: editForm.status === 'Present' ? workingHours : undefined,
    };

    onUpdateRecord(updatedRecord);
    setEditingId(null);
    toast.success('Attendance record updated');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDownloadReport = () => {
    const csv = [
      ['Employee ID', 'Name', 'Date', 'Shift', 'Status', 'Check In', 'Check Out', 'Working Hours'],
      ...filteredRecords.map(r => [
        r.employeeId,
        r.workerName,
        new Date(r.date).toLocaleDateString(),
        r.shift,
        r.status,
        r.checkIn || '-',
        r.checkOut || '-',
        r.workingHours ? r.workingHours.toFixed(2) : '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterShift('all');
    setFilterStatus('all');
    setFilterDate('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-slate-900 mb-1">Attendance Records</h1>
        <p className="text-slate-600">View, edit, and export attendance history</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Records</CardTitle>
              <CardDescription>
                {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button onClick={handleDownloadReport} className="bg-green-600 hover:bg-green-700">
              <Download className="size-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <Select value={filterShift} onValueChange={setFilterShift}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Afternoon">Afternoon</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="bg-white"
              />
              {(searchTerm || filterShift !== 'all' || filterStatus !== 'all' || filterDate) && (
                <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear filters">
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="border-2 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead className="text-right">Working Hours</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-slate-50">
                        <TableCell>{record.employeeId}</TableCell>
                        <TableCell>{record.workerName}</TableCell>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {record.shift}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingId === record.id ? (
                            <Select 
                              value={editForm.status} 
                              onValueChange={(value: 'Present' | 'Absent') => setEditForm({ ...editForm, status: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant={record.status === 'Present' ? 'default' : 'destructive'}
                              className={record.status === 'Present' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              {record.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === record.id && editForm.status === 'Present' ? (
                            <Input 
                              type="time" 
                              value={editForm.checkIn}
                              onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                              className="w-32"
                            />
                          ) : (
                            record.checkIn || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === record.id && editForm.status === 'Present' ? (
                            <Input 
                              type="time" 
                              value={editForm.checkOut}
                              onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                              className="w-32"
                            />
                          ) : (
                            record.checkOut || '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.workingHours ? `${record.workingHours.toFixed(2)} hrs` : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === record.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleSaveEdit(record)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="size-4 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="size-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleStartEdit(record)}
                              className="hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit2 className="size-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}