import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: "chart-pie" },
    { name: "Income History", path: "/income-history", icon: "history" },
    { name: "Bank Connections", path: "/bank-connections", icon: "university" },
    { name: "Settings", path: "/settings", icon: "cog" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">40/30/30</h1>
          <p className="text-sm text-gray-500 mt-1">Income Tracker</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium",
                    location === item.path
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <i className={`fas fa-${item.icon} mr-3`}></i>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">40/30/30</h1>
            <p className="text-sm text-gray-500 mt-1">Income Tracker</p>
          </div>
          <button 
            onClick={closeMobileMenu}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium",
                    location === item.path
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={closeMobileMenu}
                >
                  <i className={`fas fa-${item.icon} mr-3`}></i>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
