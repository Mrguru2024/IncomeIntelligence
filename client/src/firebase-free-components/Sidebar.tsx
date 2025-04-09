import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  DollarSign,
  Target,
  Building2,
  BarChart4,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

// Import our auth context from the no-firebase-main
// We'll define a type for it here since we can't easily import it
type AuthContextType = {
  user: { 
    id: number;
    username: string;
    email?: string;
    displayName?: string;
    profilePicture?: string;
    subscriptionTier?: string;
    subscriptionActive?: boolean;
  } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
};

// Get the auth context function from the window object that we'll add to no-firebase-main
declare global {
  interface Window {
    getAuthContext?: () => AuthContextType;
  }
}

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();
  const auth = window.getAuthContext?.();

  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/',
      active: location === '/'
    },
    {
      name: 'Income Hub',
      icon: <DollarSign size={20} />,
      path: '/income-hub',
      active: location.includes('/income-hub')
    },
    {
      name: 'Goals',
      icon: <Target size={20} />,
      path: '/goals',
      active: location === '/goals'
    },
    {
      name: 'Budget',
      icon: <BarChart4 size={20} />,
      path: '/budget-planner',
      active: location === '/budget-planner'
    },
    {
      name: 'Accounts',
      icon: <Building2 size={20} />,
      path: '/bank-connections',
      active: location === '/bank-connections'
    },
    {
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
      active: location === '/settings'
    }
  ];

  const handleLogout = async () => {
    try {
      await auth?.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              S
            </div>
            <span className="font-bold text-xl">Stackr</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {auth?.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium">{auth?.user?.username || 'User'}</div>
                <div className="text-sm text-muted-foreground">{auth?.user?.email || ''}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-[200] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[201] w-[250px] border-r border-border bg-card transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              S
            </div>
            <span className="font-bold text-xl">Stackr</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-foreground/70 hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {auth?.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium">{auth?.user?.username || 'User'}</div>
                <div className="text-sm text-muted-foreground">{auth?.user?.email || ''}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header with hamburger menu */}
      <header className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-[100] w-full">
        <h1 className="text-xl font-semibold text-foreground">Stackr</h1>
        <button
          className="text-foreground hover:bg-accent p-2 rounded-md"
          onClick={() => setMobileMenuOpen(true)}
          type="button"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </header>
    </>
  );
}