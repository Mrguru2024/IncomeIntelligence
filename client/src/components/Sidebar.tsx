import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import StackrLogo from "@/components/StackrLogo";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Clock, 
  Receipt, 
  Building, 
  Target, 
  CalendarDays, 
  BookOpen, 
  Bell, 
  Mic, 
  User, 
  Lock, 
  Gift, 
  Settings, 
  Home, 
  Briefcase, 
  BadgeDollarSign,
  ListChecks,
  CircleDollarSign,
  Users
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// Navigation structure with categories
const navigationStructure = [
  {
    category: "Main",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: <LayoutDashboard size={20} />,
      },
      {
        name: "Income History",
        path: "/income-history",
        icon: <Clock size={20} />,
      },
      {
        name: "Expenses",
        path: "/expenses",
        icon: <Receipt size={20} />,
      },
      {
        name: "Bank Connections",
        path: "/bank-connections",
        icon: <Building size={20} />,
      }
    ]
  },
  {
    category: "Planning",
    items: [
      {
        name: "Goals",
        path: "/goals",
        icon: <Target size={20} />,
      },
      {
        name: "Budget Planner",
        path: "/budget-planner",
        icon: <CalendarDays size={20} />,
      },
      {
        name: "Reminders",
        path: "/reminders",
        icon: <Bell size={20} />,
      }
    ]
  },
  {
    category: "Income Generation",
    items: [
      {
        name: "Income Hub",
        path: "/income-hub",
        icon: <BadgeDollarSign size={20} />,
        badge: "New"
      },
      {
        name: "Stackr Gigs",
        path: "/income-hub/gigs",
        icon: <Briefcase size={20} />,
        badge: "Hot"
      },
      {
        name: "Affiliate Program",
        path: "/income-hub/affiliate",
        icon: <Users size={20} />,
      },
      {
        name: "Services",
        path: "/income-hub/services",
        icon: <CircleDollarSign size={20} />,
      }
    ]
  },
  {
    category: "Tools & Resources",
    items: [
      {
        name: "Stackr Advice",
        path: "/financial-advice",
        icon: <BookOpen size={20} />,
      },
      {
        name: "Money Mentor AI",
        path: "/money-mentor",
        icon: <Brain size={20} />,
        badge: "Pro",
        badgeColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
      },
      {
        name: "Voice Commands",
        path: "/voice-commands",
        icon: <Mic size={20} />,
      }
    ]
  },
  {
    category: "Account",
    items: [
      {
        name: "Profile",
        path: "/profile",
        icon: <User size={20} />,
      },
      {
        name: "Security",
        path: "/security",
        icon: <Lock size={20} />,
      },
      {
        name: "Subscription Benefits",
        path: "/subscription-benefits",
        icon: <Gift size={20} />,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: <Settings size={20} />,
      }
    ]
  }
];

export default function Sidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Main", "Planning", "Income Generation", "Tools & Resources", "Account"
  ]);

  // Fetch user profile data for improved avatar display
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Prevent background scrolling when menu is open
      document.body.style.overflow = "hidden";
    } else {
      // Allow scrolling when menu is closed
      document.body.style.overflow = "";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = (e?: React.MouseEvent | React.TouchEvent) => {
    // If there's an event, prevent it from bubbling up
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Close the menu with a slight delay to ensure smooth transitions
    setTimeout(() => {
      setMobileMenuOpen(false);
      // Restore scrolling after a short delay
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 100);
    }, 50);
  };

  // Create initials for avatar fallback
  const getInitials = () => {
    if (userProfile?.firstName) {
      return `${userProfile.firstName[0]}${userProfile.lastName?.[0] || ''}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || '?';
  };

  // Desktop sidebar - collapsible
  const DesktopSidebar = () => (
    <aside 
      className={cn(
        "hidden lg:flex flex-col bg-opacity-100 bg-[var(--card-background)] border-r border-border min-h-screen transition-all duration-300 ease-in-out relative z-30",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center border-b border-border transition-all duration-300 ease-in-out",
        collapsed ? "p-4 justify-center" : "p-6 justify-between"
      )}>
        {collapsed ? (
          <div className="flex justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L14 6H20V18H4V6H10L12 4Z" fill="currentColor" />
              <path d="M12 4L14 6H20V18H4V6H10L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 10L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 14L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <>
            <StackrLogo />
          </>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-full hover:bg-muted-background transition-colors",
            collapsed ? "absolute -right-3 top-6 bg-card-background border border-border" : ""
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User profile section */}
      <div className={cn(
        "border-b border-border transition-all duration-300",
        collapsed ? "px-2 py-4" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "flex-col" : "flex-row"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className={cn(
                  "bg-primary/10 text-primary font-medium cursor-pointer transition-all",
                  collapsed ? "h-10 w-10" : "h-12 w-12 mr-3"
                )}>
                  <AvatarImage 
                    src={userProfile?.profileImage || ''} 
                    alt={userProfile?.firstName || user?.username || 'User'} 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" align="start" className="p-4 max-w-[300px]">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">
                    {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : user?.username}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {userProfile?.email || user?.email || ''}
                  </span>
                  {userProfile?.profile?.occupation && (
                    <span className="text-muted-foreground text-sm mt-2">
                      {userProfile.profile.occupation}
                    </span>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-medium text-sm truncate max-w-[180px]">
                {userProfile?.firstName 
                  ? `${userProfile.firstName} ${userProfile.lastName || ''}` 
                  : user?.username}
              </div>
              <div className="text-muted-foreground text-xs truncate max-w-[180px]">
                {user?.email || userProfile?.email || ''}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4">
        {navigationStructure.map((section) => (
          <div key={section.category} className="mb-2">
            {/* Category header - only show when not collapsed */}
            {!collapsed && (
              <div 
                className="flex items-center justify-between px-3 py-2 cursor-pointer"
                onClick={() => toggleCategory(section.category)}
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.category}
                </span>
                <ChevronRight 
                  size={14} 
                  className={cn(
                    "text-muted-foreground transition-transform",
                    expandedCategories.includes(section.category) ? "transform rotate-90" : ""
                  )} 
                />
              </div>
            )}
            
            {/* Items - conditionally show based on category expansion */}
            {(collapsed || expandedCategories.includes(section.category)) && (
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.path;
                  
                  return (
                    <li key={item.path}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.path}
                              className={cn(
                                "flex items-center rounded-lg font-medium transition-colors",
                                isActive 
                                  ? "text-primary bg-accent-background" 
                                  : "text-foreground hover:bg-muted-background",
                                collapsed ? "justify-center p-3" : "px-4 py-3"
                              )}
                            >
                              <span className={cn(collapsed ? "" : "mr-3")}>
                                {item.icon}
                              </span>
                              
                              {!collapsed && (
                                <span className="truncate">{item.name}</span>
                              )}
                              
                              {!collapsed && item.badge && (
                                <Badge 
                                  variant={item.badge === "New" ? "default" : "secondary"} 
                                  className="ml-auto text-[0.65rem] py-0 h-5"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              <div className="flex items-center">
                                <span>{item.name}</span>
                                {item.badge && (
                                  <Badge 
                                    variant={item.badge === "New" ? "default" : "secondary"} 
                                    className="ml-2 text-[0.65rem] py-0 h-5"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
      
      {/* Footer - Theme toggle & Logout */}
      <div className={cn(
        "border-t border-border",
        collapsed ? "px-2 py-4" : "p-4"
      )}>
        <div className={cn(
          "flex",
          collapsed ? "flex-col items-center space-y-4" : "justify-between items-center"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "flex items-center text-foreground hover:text-foreground",
                    collapsed ? "p-2" : ""
                  )}
                  onClick={() => {
                    logoutMutation.mutate();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={collapsed ? "20" : "18"}
                    height={collapsed ? "20" : "18"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={collapsed ? "" : "mr-2"}
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  {!collapsed && <span>Logout</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <span>Logout</span>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );

  // Mobile sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-[150] lg:hidden touch-manipulation transition-opacity duration-300",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={closeMobileMenu}
        onTouchEnd={closeMobileMenu}
        role="button"
        tabIndex={-1}
        aria-label="Close menu overlay"
        aria-hidden={!mobileMenuOpen}
      />

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[200] w-[85vw] max-w-64 bg-opacity-100 bg-[var(--card-background)] border-r border-border transition-transform duration-300 ease-in-out transform lg:hidden overflow-y-auto shadow-lg",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ pointerEvents: mobileMenuOpen ? "auto" : "none" }}
        aria-hidden={!mobileMenuOpen}
        aria-label="Mobile navigation"
      >
        <div className="p-3 xxs:p-4 xs:p-6 border-b border-border flex justify-between items-center">
          <StackrLogo className="scale-90" />
          <button
            onClick={closeMobileMenu}
            className="text-foreground p-1.5 xxs:p-2 rounded-full hover:bg-muted-background flex items-center justify-center cursor-pointer touch-manipulation"
            aria-label="Close menu"
            role="button"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* User profile section - mobile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3 bg-primary/10 text-primary font-medium">
              <AvatarImage 
                src={userProfile?.profileImage || ''} 
                alt={userProfile?.firstName || user?.username || 'User'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">
                {userProfile?.firstName 
                  ? `${userProfile.firstName} ${userProfile.lastName || ''}` 
                  : user?.username}
              </div>
              <div className="text-muted-foreground text-xs">
                {user?.email || userProfile?.email || ''}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation - mobile */}
        <nav className="flex-1 overflow-y-auto p-2 xxs:p-3 xs:p-4">
          {navigationStructure.map((section) => (
            <div key={section.category} className="mb-3">
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer"
                onClick={() => toggleCategory(section.category)}
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.category}
                </span>
                <ChevronRight 
                  size={14} 
                  className={cn(
                    "text-muted-foreground transition-transform",
                    expandedCategories.includes(section.category) ? "transform rotate-90" : ""
                  )} 
                />
              </div>
              
              {expandedCategories.includes(section.category) && (
                <ul className="space-y-0.5 xxs:space-y-1 mt-1">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center px-2 xxs:px-3 xs:px-4 py-2 xxs:py-2.5 xs:py-3 rounded-lg text-sm xxs:text-base font-medium w-full touch-manipulation",
                          location === item.path
                            ? "text-primary bg-accent-background"
                            : "text-foreground hover:bg-muted-background active:bg-muted",
                        )}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default link behavior temporarily
                          closeMobileMenu(); // Close the menu first

                          // Navigate to the link after the menu animation completes
                          const href = item.path;
                          setTimeout(() => {
                            window.history.pushState({}, "", href);
                            const navEvent = new PopStateEvent("popstate");
                            window.dispatchEvent(navEvent);
                          }, 300);
                        }}
                      >
                        <span className="mr-1.5 xxs:mr-2 xs:mr-3">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === "New" ? "default" : "secondary"} 
                            className="ml-auto text-[0.65rem] py-0 h-5"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
        
        {/* Footer - mobile */}
        <div className="p-2 xxs:p-3 xs:p-4 border-t border-border flex justify-between items-center">
          <button
            className="flex items-center text-foreground text-xs xxs:text-sm xs:text-base"
            onClick={() => {
              logoutMutation.mutate();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1 xxs:mr-1.5 xs:mr-2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
