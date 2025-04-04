import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Mail, 
  Settings, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Switch
} from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface NotificationData {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
  metadata: any | null;
}

export default function NotificationCenter() {
  const { toast } = useToast();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  
  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<NotificationData[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Update notification count when data changes
  useEffect(() => {
    if (notifications && notifications.length) {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      setNotificationCount(unreadCount);
      
      // Request permission for browser notifications if not granted yet
      if (pushEnabled && "Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, [notifications, pushEnabled]);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Marked all as read',
        description: 'All notifications have been marked as read.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Toggle notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: { emailEnabled: boolean, pushEnabled: boolean }) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      // Restore previous state
      setEmailEnabled(!emailEnabled);
      setPushEnabled(!pushEnabled);
    }
  });

  // Handle notification icons based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Filter notifications based on tab
  const filteredNotifications = currentTab === 'all' 
    ? notifications 
    : currentTab === 'unread' 
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === currentTab);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center"
                variant="destructive"
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 mr-4" align="end">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 space-y-3">
                    <h4 className="font-medium text-sm mb-2">Notification Settings</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">Email</div>
                        <div className="text-xs text-muted-foreground">Receive notifications by email</div>
                      </div>
                      <Switch 
                        checked={emailEnabled}
                        onCheckedChange={(checked) => {
                          setEmailEnabled(checked);
                          updatePreferencesMutation.mutate({ emailEnabled: checked, pushEnabled });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">Push</div>
                        <div className="text-xs text-muted-foreground">Receive push notifications</div>
                      </div>
                      <Switch 
                        checked={pushEnabled}
                        onCheckedChange={(checked) => {
                          setPushEnabled(checked);
                          updatePreferencesMutation.mutate({ emailEnabled, pushEnabled: checked });
                        }}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {notificationCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
            <div className="border-b border-border">
              <TabsList className="w-full rounded-none grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="reminder">Reminders</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {currentTab === 'all' 
                      ? "You don't have any notifications yet." 
                      : currentTab === 'unread'
                        ? "No unread notifications."
                        : `No ${currentTab} notifications.`
                    }
                  </p>
                </div>
              ) : (
                <TabsContent value={currentTab} className="m-0 p-0">
                  <ul className="divide-y divide-border">
                    {filteredNotifications.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-3 transition-colors ${notification.isRead ? 'bg-background' : 'bg-muted/20'}`}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3 pt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-foreground truncate">
                                {notification.title}
                              </p>
                              <div className="flex-shrink-0 flex ml-2">
                                {!notification.isRead && (
                                  <button 
                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                    title="Mark as read"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  className="text-muted-foreground hover:text-destructive p-1"
                                  title="Delete notification"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              )}
            </div>
          </Tabs>
          
          <div className="border-t border-border p-2 text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href="/notifications">View all notifications</a>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}