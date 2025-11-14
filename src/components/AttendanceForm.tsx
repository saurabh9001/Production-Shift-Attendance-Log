import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { UserCheck, Clock } from 'lucide-react';
import type { Worker, AttendanceRecord } from '../App';

interface AttendanceFormProps {
  workers: Worker[];
  onSubmit: (record: AttendanceRecord) => void;
}

export function AttendanceForm({ workers, onSubmit }: AttendanceFormProps) {
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorker) {
      toast.error('Please select a worker');
      return;
    }

    const worker = workers.find(w => w.id === selectedWorker);
    if (!worker) return;

    let workingHours: number | undefined;
    if (status === 'Present' && checkIn && checkOut) {
      const [inHour, inMin] = checkIn.split(':').map(Number);
      const [outHour, outMin] = checkOut.split(':').map(Number);
      
      let hours = outHour - inHour;
      let minutes = outMin - inMin;
      
      if (hours < 0) {
        hours += 24; // Handle overnight shifts
      }
      
      workingHours = hours + minutes / 60;
    }

    const record: AttendanceRecord = {
      id: `${selectedWorker}-${date}-${Date.now()}`,
      workerId: selectedWorker,
      workerName: worker.name,
      employeeId: worker.employeeId,
      date,
      shift,
      status,
      checkIn: status === 'Present' ? checkIn : undefined,
      checkOut: status === 'Present' ? checkOut : undefined,
      workingHours,
    };

    onSubmit(record);
    toast.success('Attendance recorded successfully');

    // Reset form
    setSelectedWorker('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Present');
    setCheckIn('');
    setCheckOut('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-slate-900 mb-1">Mark Attendance</h1>
        <p className="text-slate-600">Record worker attendance for production shifts</p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <UserCheck className="size-5 text-white" />
            </div>
            <div>
              <CardTitle>Attendance Entry Form</CardTitle>
              <CardDescription>
                Fill in the details to record attendance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="worker">Worker *</Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger id="worker">
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} ({worker.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift *</Label>
                <Select value={shift} onValueChange={(value: any) => setShift(value)}>
                  <SelectTrigger id="shift">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning (6 AM - 2 PM)</SelectItem>
                    <SelectItem value="Afternoon">Afternoon (2 PM - 10 PM)</SelectItem>
                    <SelectItem value="Night">Night (10 PM - 6 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {status === 'Present' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="space-y-2">
                  <Label htmlFor="checkIn" className="flex items-center gap-2">
                    <Clock className="size-4 text-blue-600" />
                    Check In Time *
                  </Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required={status === 'Present'}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOut" className="flex items-center gap-2">
                    <Clock className="size-4 text-blue-600" />
                    Check Out Time *
                  </Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required={status === 'Present'}
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <UserCheck className="size-4 mr-2" />
                Record Attendance
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setSelectedWorker('');
                  setDate(new Date().toISOString().split('T')[0]);
                  setStatus('Present');
                  setCheckIn('');
                  setCheckOut('');
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}