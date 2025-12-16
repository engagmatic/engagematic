import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Mail,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { LogoWithText } from '../LogoWithText';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/affiliates', label: 'Affiliates', icon: UserPlus },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/email-analytics', label: 'Email Analytics', icon: Mail },
  { path: '/admin/blog', label: 'Blog CMS', icon: FileText },
  { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout, isLoading } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading if admin is not loaded yet
  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <LogoWithText 
                textSize="sm"
                showLink={false}
              />
              <div className="hidden sm:block">
                <div className="text-xs text-muted-foreground">Admin Portal</div>
              </div>
            </Link>
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">{admin?.username}</div>
              <div className="text-xs text-muted-foreground capitalize">{admin?.role?.replace('_', ' ')}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 
            transform transition-transform duration-300 ease-in-out
            bg-white dark:bg-gray-800 border-r
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

