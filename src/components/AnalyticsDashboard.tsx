import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export interface AnalyticsDashboardProps {
  attendanceRecords: any[];
  workers: any[];
}

export function AnalyticsDashboard({ attendanceRecords, workers }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
