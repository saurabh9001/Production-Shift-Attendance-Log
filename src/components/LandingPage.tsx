import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ClipboardList, Users, TrendingUp, Clock, Shield, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-6xl mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <ClipboardList className="size-8 text-white" />
                </div>
                <span className="text-white text-2xl">AttendanceTrack Pro</span>
              </div>
              <Button 
                onClick={onLogin}
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50"
              >
                Login to Dashboard
              </Button>
            </div>

            {/* Hero Content */}
            <div className="text-center mb-16">
              <h1 className="text-white mb-6 text-5xl lg:text-6xl">
                Production Shift Attendance
                <span className="block text-blue-400 mt-2">Made Simple</span>
              </h1>
              <p className="text-blue-200 text-xl max-w-3xl mx-auto mb-8">
                Eliminate manual errors in wage calculations. Track worker attendance, 
                monitor shift hours, and generate comprehensive reports instantly.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  onClick={onLogin}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Get Started
                  <ArrowRight className="ml-2 size-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 bg-blue-500 rounded-lg mb-4">
                    <Clock className="size-8 text-white" />
                  </div>
                  <h3 className="text-white mb-2">Real-Time Tracking</h3>
                  <p className="text-blue-200">
                    Monitor attendance across all shifts with instant updates and notifications
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 bg-green-500 rounded-lg mb-4">
                    <BarChart3 className="size-8 text-white" />
                  </div>
                  <h3 className="text-white mb-2">Smart Analytics</h3>
                  <p className="text-blue-200">
                    Get insights on attendance trends, patterns, and workforce productivity
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 bg-purple-500 rounded-lg mb-4">
                    <Shield className="size-8 text-white" />
                  </div>
                  <h3 className="text-white mb-2">Automated Reports</h3>
                  <p className="text-blue-200">
                    Export daily summaries and send supervisor alerts automatically
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-slate-900 mb-4">Everything You Need to Manage Attendance</h2>
              <p className="text-slate-600 text-xl">
                Built specifically for manufacturing and production environments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="size-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-2">Quick Check-In/Out</h3>
                      <p className="text-slate-600">
                        Workers can mark attendance in seconds with automatic time logging
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="size-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-2">Shift Management</h3>
                      <p className="text-slate-600">
                        Track morning, afternoon, and night shifts separately
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="size-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-2">Trend Analysis</h3>
                      <p className="text-slate-600">
                        Identify patterns and optimize workforce scheduling
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="size-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-2">Working Hours</h3>
                      <p className="text-slate-600">
                        Automatic calculation of working hours for accurate wages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="size-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-2">Alert System</h3>
                      <p className="text-slate-600">
                        Get notified when workers are late or leave early
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="size-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-2">Export Reports</h3>
                      <p className="text-slate-600">
                        Download CSV reports for payroll and record keeping
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-white mb-4">Ready to Transform Your Attendance Management?</h2>
            <p className="text-blue-100 text-xl mb-8">
              Join hundreds of manufacturing facilities already using AttendanceTrack Pro
            </p>
            <Button 
              onClick={onLogin}
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50"
            >
              Start Tracking Now
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 AttendanceTrack Pro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
