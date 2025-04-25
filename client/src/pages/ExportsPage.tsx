import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Export schema
const exportSchema = z.object({
  dataType: z.enum(["income", "expenses", "transactions", "summary"], {
    required_error: "Please select what data to export",
  }),
  format: z.enum(["csv", "pdf"], {
    required_error: "Please select a format",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  includeNotes: z.boolean().default(false),
  categories: z.array(z.string()).optional(),
  email: z.string().email().optional(),
  title: z.string().optional(),
});

// Schedule schema
const scheduleSchema = z.object({
  frequency: z.enum(["weekly", "biweekly", "monthly"], {
    required_error: "Please select a frequency",
  }),
  dataType: z.enum(["income", "expenses", "transactions", "summary"], {
    required_error: "Please select what data to export",
  }),
  format: z.enum(["csv", "pdf"], {
    required_error: "Please select a format",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  customTitle: z.string().optional(),
  includeNotes: z.boolean().default(false),
});

type ScheduledExport = {
  id: string;
  userId: string;
  email: string;
  frequency: string;
  dataType: string;
  format: string;
  createdAt: string;
  nextSendAt: string;
  lastSentAt?: string;
  isActive: boolean;
};

export default function ExportsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // This would normally come from auth context
  const userId = "google-1745586875353"; // Temporary hardcoded user ID for testing

  // Fetch scheduled exports
  const { data: scheduledExports, isLoading: scheduledExportsLoading } = useQuery<ScheduledExport[]>({
    queryKey: ["/api/exports/scheduled", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/exports/scheduled/${userId}`);
      return response.json();
    },
  });

  // Form for generating exports
  const exportForm = useForm<z.infer<typeof exportSchema>>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      dataType: "summary",
      format: "pdf",
      includeNotes: false,
    },
  });

  // Form for scheduling exports
  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      frequency: "monthly",
      dataType: "summary",
      format: "pdf",
      includeNotes: false,
    },
  });

  // Mutation for generating exports
  const generateExportMutation = useMutation({
    mutationFn: async (values: z.infer<typeof exportSchema>) => {
      // Prepare request data
      const requestData = {
        ...values,
        userId,
      };

      // If both startDate and endDate are set, include them as dateRange
      if (values.startDate && values.endDate) {
        requestData.dateRange = {
          startDate: values.startDate,
          endDate: values.endDate,
        };
        // Remove the original fields to keep the request clean
        delete requestData.startDate;
        delete requestData.endDate;
      }

      // If email is set, the export will be emailed
      // Otherwise, it will be downloaded directly
      const response = await apiRequest("POST", "/api/exports/generate", requestData);

      // If email is provided, we expect a JSON response with success status
      if (values.email) {
        return response.json();
      }

      // Otherwise, we get a file download
      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1].replace(/"/g, "") || 
                  `export-${new Date().toISOString()}.${values.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export successful",
        description: exportForm.getValues("email") 
          ? `Your export has been sent to ${exportForm.getValues("email")}`
          : "Your export has been downloaded",
      });
      setIsSubmitting(false);
      exportForm.reset();
    },
    onError: (error) => {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating your export. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Mutation for scheduling exports
  const scheduleExportMutation = useMutation({
    mutationFn: async (values: z.infer<typeof scheduleSchema>) => {
      const response = await apiRequest("POST", "/api/exports/schedule", {
        ...values,
        userId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Export scheduled",
        description: `Your ${scheduleForm.getValues("frequency")} export has been scheduled.`,
      });
      setIsScheduleSubmitting(false);
      scheduleForm.reset();
      setShowScheduleDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/exports/scheduled', userId] });
    },
    onError: (error) => {
      console.error('Schedule error:', error);
      toast({
        title: "Scheduling failed",
        description: "There was an error scheduling your export. Please try again.",
        variant: "destructive",
      });
      setIsScheduleSubmitting(false);
    }
  });

  // Mutation for toggling scheduled export status
  const toggleScheduledExportMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/exports/scheduled/${id}`, {
        isActive: !isActive
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Your scheduled export status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exports/scheduled', userId] });
    },
    onError: (error) => {
      console.error('Toggle error:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the export schedule.",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting scheduled exports
  const deleteScheduledExportMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/exports/scheduled/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete scheduled export");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Export schedule deleted",
        description: "Your scheduled export has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exports/scheduled', userId] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the export schedule.",
        variant: "destructive",
      });
    }
  });

  // Handle export generation submit
  const onExportSubmit = (values: z.infer<typeof exportSchema>) => {
    setIsSubmitting(true);
    generateExportMutation.mutate(values);
  };

  // Handle schedule submit
  const onScheduleSubmit = (values: z.infer<typeof scheduleSchema>) => {
    setIsScheduleSubmitting(true);
    scheduleExportMutation.mutate(values);
  };

  // Method to show the frequency in a readable format
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  // Method to get the badge color for data type
  const getDataTypeBadge = (dataType: string) => {
    switch (dataType) {
      case 'income': return 'bg-green-100 text-green-800';
      case 'expenses': return 'bg-red-100 text-red-800';
      case 'transactions': return 'bg-blue-100 text-blue-800';
      case 'summary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Exports</h1>
          <p className="text-muted-foreground mt-1">
            Export your financial data in different formats or schedule regular reports
          </p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Icons.calendar className="w-4 h-4 mr-2" />
              Schedule New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Regular Export</DialogTitle>
              <DialogDescription>
                Set up automated exports to be sent to your email on a regular schedule.
              </DialogDescription>
            </DialogHeader>
            <Form {...scheduleForm}>
              <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-5">
                <FormField
                  control={scheduleForm.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="dataType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data to Export</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                          <SelectItem value="transactions">All Transactions</SelectItem>
                          <SelectItem value="summary">Financial Summary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The export will be sent to this email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="customTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="My Financial Report" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="includeNotes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Notes</FormLabel>
                        <FormDescription>
                          Include notes fields in the exported data
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowScheduleDialog(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isScheduleSubmitting}
                  >
                    {isScheduleSubmitting && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Schedule Export
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="generate" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Exports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Financial Export</CardTitle>
              <CardDescription>
                Export your financial data in various formats for personal records or external use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...exportForm}>
                <form onSubmit={exportForm.handleSubmit(onExportSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={exportForm.control}
                      name="dataType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data to Export</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select data type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="income">Income</SelectItem>
                              <SelectItem value="expenses">Expenses</SelectItem>
                              <SelectItem value="transactions">All Transactions</SelectItem>
                              <SelectItem value="summary">Financial Summary</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose what financial data you want to export
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exportForm.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Export Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            PDF is better for viewing, CSV for data analysis
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={exportForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span className="text-muted-foreground">Pick a date</span>
                                  )}
                                  <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Filter data starting from this date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exportForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span className="text-muted-foreground">Pick a date</span>
                                  )}
                                  <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Filter data ending on this date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={exportForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Title (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="My Financial Export" {...field} />
                        </FormControl>
                        <FormDescription>
                          Add a custom title to your export
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exportForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          If provided, export will be emailed instead of downloaded
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exportForm.control}
                    name="includeNotes"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Include Notes</FormLabel>
                          <FormDescription>
                            Include notes fields in the exported data
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                      {isSubmitting && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {exportForm.watch("email") ? "Email Export" : "Download Export"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exports</CardTitle>
              <CardDescription>
                View and manage your scheduled recurring exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledExportsLoading ? (
                <div className="flex justify-center py-8">
                  <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !scheduledExports || scheduledExports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icons.calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No scheduled exports</h3>
                  <p className="text-muted-foreground mt-2">
                    You haven't scheduled any recurring exports yet.
                  </p>
                  <Button className="mt-4" onClick={() => setShowScheduleDialog(true)}>
                    Schedule First Export
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of your scheduled exports</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Next Send</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledExports.map((export_item) => (
                      <TableRow key={export_item.id}>
                        <TableCell className="font-medium">
                          {formatFrequency(export_item.frequency)}
                          <div>
                            <Badge variant={export_item.isActive ? "default" : "secondary"}>
                              {export_item.isActive ? "Active" : "Paused"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDataTypeBadge(export_item.dataType)}>
                            {export_item.dataType.charAt(0).toUpperCase() + export_item.dataType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="uppercase">
                          {export_item.format}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {export_item.email}
                        </TableCell>
                        <TableCell>
                          {format(new Date(export_item.nextSendAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleScheduledExportMutation.mutate({
                                id: export_item.id,
                                isActive: export_item.isActive
                              })}
                            >
                              {export_item.isActive ? "Pause" : "Resume"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteScheduledExportMutation.mutate(export_item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}