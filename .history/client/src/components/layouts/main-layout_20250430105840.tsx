import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  PiggyBank,
  BadgeDollarSign,
  Target,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StackrLogo from "@/components/StackrLogo";

// Custom hook for media queries
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

// Navigation item component
const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => (
  <Link href={href}>
    <a
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  </Link>
);

// Main navigation items
const navItems = [
  { href: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { href: "/income", icon: <BadgeDollarSign size={20} />, label: "Income Hub" },
  { href: "/budget", icon: <PiggyBank size={20} />, label: "Budget Planner" },
  { href: "/goals", icon: <Target size={20} />, label: "Goals" },
  { href: "/advice", icon: <Lightbulb size={20} />, label: "Financial Advice" },
  { href: "/settings", icon: <Settings size={20} />, label: "Settings" },
];

// User info component
const UserInfo = () => {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>
            {user.username ? user.username.substring(0, 2).toUpperCase() : "ST"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.username || "User"}</p>
          <p className="text-sm text-muted-foreground">Pro Member</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <LogOut size={18} />
      </Button>
    </div>
  );
};

// Mobile navigation
const MobileNav = () => {
  const [location] = useLocation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <StackrLogo showText={false} />
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <X size={18} />
                  <span className="sr-only">Close menu</span>
                </Button>
              </SheetTrigger>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={location === item.href}
                onClick={() => {}}
              />
            ))}
          </nav>
          <UserInfo />
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Desktop sidebar
const DesktopSidebar = () => {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <StackrLogo />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={location === item.href}
            />
          ))}
        </nav>
        <UserInfo />
      </div>
    </div>
  );
};

// Main layout component
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div>
      <DesktopSidebar />

      <div className="md:pl-64">
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <StackrLogo showText={false} />
          <MobileNav />
        </div>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
