import { Button } from './ui/button';
import { ClipboardList, LayoutDashboard, UserCheck, FileText, BarChart3, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: 'landing' | 'dashboard' | 'mark-attendance' | 'records' | 'analytics';
  onNavigate: (page: 'dashboard' | 'mark-attendance' | 'records' | 'analytics') => void;
  onLogout: () => void;
}

export function Navbar({ currentPage, onNavigate, onLogout }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mark-attendance' as const, label: 'Mark Attendance', icon: UserCheck },
    { id: 'records' as const, label: 'Attendance Records', icon: FileText },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <ClipboardList className="size-6 text-white" />
            </div>
            <div>
              <div className="text-slate-900">AttendanceTrack Pro</div>
              <div className="text-slate-500 text-xs">Manufacturing System</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className={isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <Icon className="size-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button variant="outline" onClick={onLogout} className="border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className={isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Icon className="size-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
