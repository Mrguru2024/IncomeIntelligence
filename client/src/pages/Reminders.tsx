import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reminderTypes, reminderFrequencies } from "@shared/schema";

// Icon imports
import {
  Bell,
  CalendarDays,
  Clock,
  AlertCircle,
  Check,
  X,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  ArrowUpRight,
  ChevronDown,
  Filter,
  PlusCircle,
} from "lucide-react";

// Form schema for creating/editing reminders
const reminderFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  type: z.string(),
  frequency: z.string(),
  nextRemindAt: z.date(),
  isActive: z.boolean().default(true),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function Reminders() {
  const { toast } = useToast();
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<number | null>(
    null,
  );
  const [tab, setTab] = useState("all");

  // Define Reminder interface
  interface ReminderData {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: string;
    frequency: string;
    nextRemindAt: string | Date;
    lastSentAt: string | Date | null;
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    metadata: any | null;
  }

  // Get all reminders
  const {
    data: reminders = [],
    isLoading,
    refetch,
  } = useQuery<ReminderData[]>({
    queryKey: ["/api/reminders"],
  });

  // Form setup
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "custom",
      frequency: "weekly",
      nextRemindAt: new Date(),
      isActive: true,
    },
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create reminder");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Created",
        description: "Your reminder has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setReminderDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: ReminderFormValues;
    }) => {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Updated",
        description: "Your reminder has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setReminderDialogOpen(false);
      setEditingReminderId(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reminder");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "Your reminder has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle reminder active status
  const toggleReminderMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder status");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isActive ? "Reminder Activated" : "Reminder Paused",
        description: `The reminder has been ${variables.isActive ? "activated" : "paused"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get reminder type details
  const getReminderType = (typeId: string) => {
    return (
      reminderTypes.find((type) => type.id === typeId) || {
        id: "custom",
        name: "Custom",
        icon: "bell",
        color: "amber",
      }
    );
  };

  // Get frequency name
  const getFrequencyName = (frequencyId: string) => {
    return (
      reminderFrequencies.find((freq) => freq.id === frequencyId)?.name ||
      "Custom"
    );
  };

  // Handle form submissions
  const onSubmit = (data: ReminderFormValues) => {
    if (editingReminderId !== null) {
      updateReminderMutation.mutate({ id: editingReminderId, data });
    } else {
      createReminderMutation.mutate(data);
    }
  };

  // Open edit dialog with reminder data
  const handleEdit = (reminder: ReminderData) => {
    setEditingReminderId(reminder.id);
    form.reset({
      title: reminder.title,
      message: reminder.message,
      type: reminder.type,
      frequency: reminder.frequency,
      nextRemindAt: new Date(reminder.nextRemindAt),
      isActive: reminder.isActive,
    });
    setReminderDialogOpen(true);
  };

  // Confirm deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      deleteReminderMutation.mutate(id);
    }
  };

  // Toggle active status
  const handleToggleActive = (id: number, currentStatus: boolean) => {
    toggleReminderMutation.mutate({ id, isActive: !currentStatus });
  };

  // Helper to set next date based on frequency
  const setDateByFrequency = (frequency: string) => {
    const today = new Date();
    let nextDate;

    switch (frequency) {
      case "daily":
        nextDate = addDays(today, 1);
        break;
      case "weekly":
        nextDate = addWeeks(today, 1);
        break;
      case "biweekly":
        nextDate = addWeeks(today, 2);
        break;
      case "monthly":
        nextDate = addMonths(today, 1);
        break;
      default:
        nextDate = addWeeks(today, 1);
    }

    form.setValue("nextRemindAt", nextDate);
  };

  // Handle frequency change
  const handleFrequencyChange = (value: string) => {
    form.setValue("frequency", value);
    setDateByFrequency(value);
  };

  // Get filtered reminders based on tab
  const filteredReminders =
    tab === "all"
      ? reminders
      : tab === "active"
        ? reminders.filter((r: ReminderData) => r.isActive)
        : reminders.filter((r: ReminderData) => !r.isActive);

  // Define type for grouped reminders
  interface GroupedReminders {
    [date: string]: ReminderData[];
  }

  // Group reminders by date
  const groupedReminders = filteredReminders.reduce(
    (groups: GroupedReminders, reminder: ReminderData) => {
      const date = new Date(reminder.nextRemindAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(reminder);
      return groups;
    },
    {},
  );

  // Sort dates
  const sortedDates = Object.keys(groupedReminders).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
          <p className="text-muted-foreground">
            Manage your financial tasks and reminders
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog
            open={reminderDialogOpen}
            onOpenChange={setReminderDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="whitespace-nowrap"
                onClick={() => {
                  setEditingReminderId(null);
                  form.reset({
                    title: "",
                    message: "",
                    type: "custom",
                    frequency: "weekly",
                    nextRemindAt: new Date(),
                    isActive: true,
                  });
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingReminderId ? "Edit Reminder" : "Create New Reminder"}
                </DialogTitle>
                <DialogDescription>
                  {editingReminderId
                    ? "Update your reminder details below"
                    : "Set up a new reminder for your financial tasks"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter reminder title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Reminder details or message"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reminderTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              handleFrequencyChange(value)
                            }
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reminderFrequencies.map((freq) => (
                                <SelectItem key={freq.id} value={freq.id}>
                                  {freq.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nextRemindAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>First Reminder Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal flex justify-between items-center"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          This is when you'll first receive this reminder
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Enable or disable this reminder
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReminderDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createReminderMutation.isPending ||
                        updateReminderMutation.isPending
                      }
                    >
                      {createReminderMutation.isPending ||
                      updateReminderMutation.isPending
                        ? "Saving..."
                        : editingReminderId
                          ? "Update Reminder"
                          : "Create Reminder"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <div className="overflow-x-auto horizontal-scroll w-full -mx-2 xxs:-mx-3 px-2 xxs:px-3 pb-1 xxs:pb-2">
                    <TabsList className="horizontal-scroll scrollbar-none flex pb-1 min-w-[280px] xxs:min-w-[360px] sm:min-w-0 inline-flex w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Paused</TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredReminders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="rounded-full bg-muted p-3">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No reminders found</h3>
              <p className="text-muted-foreground max-w-sm">
                {tab === "all"
                  ? "You don't have any reminders set up yet. Create your first reminder to stay on top of your financial tasks."
                  : tab === "active"
                    ? "You don't have any active reminders. Activate existing reminders or create new ones."
                    : "You don't have any paused reminders."}
              </p>
              <Button
                onClick={() => {
                  setEditingReminderId(null);
                  form.reset({
                    title: "",
                    message: "",
                    type: "custom",
                    frequency: "weekly",
                    nextRemindAt: new Date(),
                    isActive: true,
                  });
                  setReminderDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
            const isToday =
              new Date(date).toDateString() === new Date().toDateString();
            const isPast =
              new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-foreground">
                    {isToday ? "Today" : formattedDate}
                  </h3>
                  {isToday && <Badge className="bg-green-600">Today</Badge>}
                  {isPast && !isToday && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedReminders[date].map((reminder: ReminderData) => {
                    const reminderType = getReminderType(reminder.type);

                    return (
                      <Card
                        key={reminder.id}
                        className={`border ${!reminder.isActive ? "opacity-60" : ""}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`bg-${reminderType.color}-100 text-${reminderType.color}-800 hover:bg-${reminderType.color}-200`}
                              >
                                {reminderType.name}
                              </Badge>
                              {!reminder.isActive && (
                                <Badge
                                  variant="outline"
                                  className="text-amber-800"
                                >
                                  Paused
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleToggleActive(
                                    reminder.id,
                                    reminder.isActive,
                                  )
                                }
                                title={
                                  reminder.isActive
                                    ? "Pause reminder"
                                    : "Activate reminder"
                                }
                                className="h-8 w-8"
                              >
                                {reminder.isActive ? (
                                  <X className="h-4 w-4 text-amber-600" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(reminder)}
                                className="h-8 w-8"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(reminder.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg mt-2">
                            {reminder.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {reminder.message}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(reminder.nextRemindAt),
                                  "h:mm a",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>
                                Repeats {getFrequencyName(reminder.frequency)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          {reminder.lastSentAt && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>
                                Last sent:{" "}
                                {format(
                                  new Date(reminder.lastSentAt),
                                  "MMM d, yyyy",
                                )}
                              </span>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
