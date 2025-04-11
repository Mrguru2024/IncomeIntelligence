import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { occupationTypes, financialHealthStatuses } from "@shared/schema";
import SmartRulesEngine from "@/components/SmartRulesEngine"; //Import added here
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Form validation schema
const profileFormSchema = z.object({
  // Personal Info
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  
  // Business/Occupation
  occupation: z.string().optional(),
  occupationDetails: z.string().optional(),
  businessName: z.string().optional(),
  yearsInBusiness: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Must be a number",
    })
    .optional(),
  averageMonthlyIncome: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Must be a number",
    })
    .optional(),
    
  // Financial Status
  financialHealthStatus: z.string().optional(),
  riskTolerance: z.string().optional(),
  isSoleProvider: z.boolean().optional(),
  hasEmergencyFund: z.boolean().optional(),
  emergencyFundAmount: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Must be a number",
    })
    .optional(),
    
  // Contact Preferences
  preferredContactMethod: z.string().optional(),
  
  // App Preferences
  widgetEnabled: z.boolean().optional(),
  remindersEnabled: z.boolean().optional(),
  
  // Lifestyle
  lifestyleType: z.string().optional(),
  livingArrangement: z.string().optional(),
  transportationMethod: z.string().optional(),
  familySize: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Must be a number",
    })
    .optional(),
  hasChildren: z.boolean().optional(),
  numberOfChildren: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Must be a number",
    })
    .optional(),
  
  // Goals and Aspirations
  shortTermGoals: z.string().optional(),
  mediumTermGoals: z.string().optional(),
  longTermGoals: z.string().optional(),
  
  // Strengths and Weaknesses
  financialStrengths: z.string().optional(),
  financialWeaknesses: z.string().optional(),
  skillsAndExpertise: z.string().optional(),
  
  // Pain Points and Challenges
  financialPainPoints: z.string().optional(),
  stressFactors: z.string().optional(),
  improvementAreas: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Widget settings schema
const widgetFormSchema = z.object({
  enabled: z.boolean(),
  showBalance: z.boolean(),
  showIncomeGoal: z.boolean(),
  showNextReminder: z.boolean(),
  position: z.string(),
  size: z.string(),
  theme: z.string(),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

export default function Profile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");

  // Define user data interface
  interface UserProfileData {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    profileCompleted: boolean;
    profile?: {
      id: number;
      userId: number;
      occupation: string | null;
      occupationDetails: string | null;
      businessName: string | null;
      yearsInBusiness: number | null;
      averageMonthlyIncome: string | null;
      financialGoals: string | null;
      lifeGoals: string | null;
      financialHealthStatus: string | null;
      riskTolerance: string | null;
      isSoleProvider: boolean | null;
      hasEmergencyFund: boolean | null;
      emergencyFundAmount: string | null;
      preferredContactMethod: string | null;
      widgetEnabled: boolean;
      remindersEnabled: boolean;
      updatedAt: Date;
    };
  }

  // Define widget settings interface
  interface WidgetSettingsData {
    id: number;
    userId: number;
    enabled: boolean;
    showBalance: boolean;
    showIncomeGoal: boolean;
    showNextReminder: boolean;
    position: string;
    size: string;
    theme: string;
    updatedAt: Date;
    customSettings: any | null;
  }

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } =
    useQuery<UserProfileData>({
      queryKey: ["/api/user/profile"],
      retry: false,
    });

  // Fetch widget settings
  const { data: widgetData, isLoading: isWidgetLoading } =
    useQuery<WidgetSettingsData>({
      queryKey: ["/api/user/widget-settings"],
      retry: false,
    });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      occupation: "",
      occupationDetails: "",
      businessName: "",
      yearsInBusiness: "",
      averageMonthlyIncome: "",
      financialHealthStatus: "",
      riskTolerance: "medium",
      isSoleProvider: false,
      hasEmergencyFund: false,
      emergencyFundAmount: "",
      preferredContactMethod: "app",
      widgetEnabled: false,
      remindersEnabled: true,
    },
  });

  // Widget form
  const widgetForm = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      enabled: false,
      showBalance: true,
      showIncomeGoal: true,
      showNextReminder: true,
      position: "bottom-right",
      size: "medium",
      theme: "auto",
    },
  });

  // Update forms when data is loaded
  useEffect(() => {
    if (userData && !isUserLoading) {
      // Reset form with user data
      profileForm.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        occupation: userData.profile?.occupation || "",
        occupationDetails: userData.profile?.occupationDetails || "",
        businessName: userData.profile?.businessName || "",
        yearsInBusiness: userData.profile?.yearsInBusiness?.toString() || "",
        averageMonthlyIncome:
          userData.profile?.averageMonthlyIncome?.toString() || "",
        financialHealthStatus: userData.profile?.financialHealthStatus || "",
        riskTolerance: userData.profile?.riskTolerance || "medium",
        isSoleProvider: userData.profile?.isSoleProvider || false,
        hasEmergencyFund: userData.profile?.hasEmergencyFund || false,
        emergencyFundAmount:
          userData.profile?.emergencyFundAmount?.toString() || "",
        preferredContactMethod:
          userData.profile?.preferredContactMethod || "app",
        widgetEnabled: userData.profile?.widgetEnabled || false,
        remindersEnabled: userData.profile?.remindersEnabled || true,
      });
    }
  }, [userData, isUserLoading, profileForm]);

  useEffect(() => {
    if (widgetData && !isWidgetLoading) {
      widgetForm.reset({
        enabled: widgetData.enabled,
        showBalance: widgetData.showBalance,
        showIncomeGoal: widgetData.showIncomeGoal,
        showNextReminder: widgetData.showNextReminder,
        position: widgetData.position,
        size: widgetData.size,
        theme: widgetData.theme || "auto",
      });
    }
  }, [widgetData, isWidgetLoading, widgetForm]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Widget settings update mutation
  const updateWidgetMutation = useMutation({
    mutationFn: async (data: WidgetFormValues) => {
      const response = await fetch("/api/user/widget-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update widget settings");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Widget Settings Updated",
        description: "Your widget settings have been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/user/widget-settings"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onWidgetSubmit = (data: WidgetFormValues) => {
    updateWidgetMutation.mutate(data);
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="relative mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl sm:text-3xl font-semibold text-primary">
              {userData?.firstName?.[0]?.toUpperCase() ||
                userData?.username?.[0]?.toUpperCase() ||
                "?"}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-2 border-background"></div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {userData?.firstName
                ? `${userData.firstName} ${userData.lastName || ""}`
                : userData?.username}
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your profile and preferences
            </p>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="overflow-x-auto horizontal-scroll w-full px-2 xxs:px-3 pb-1 xxs:pb-2">
          <TabsList className="horizontal-scroll scrollbar-none flex pb-1 gap-2 p-1 mb-2 sm:mb-6 bg-card/50 rounded-lg min-w-[300px] xxs:min-w-[380px] sm:min-w-0 w-full">
            <TabsTrigger value="personal" className="flex-shrink-0 px-3 py-1.5">
              <i className="fas fa-user mr-2 hidden sm:inline-block" />
              <span className="whitespace-nowrap">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex-shrink-0 px-3 py-1.5">
              <i className="fas fa-briefcase mr-2 hidden sm:inline-block" />
              <span className="whitespace-nowrap">Business Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="flex-shrink-0 px-3 py-1.5"
            >
              <i className="fas fa-chart-line mr-2 hidden sm:inline-block" />
              <span className="whitespace-nowrap">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="widget" className="flex-shrink-0 px-3 py-1.5">
              <i className="fas fa-window-maximize mr-2 hidden sm:inline-block" />
              <span className="whitespace-nowrap">Widget</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-shrink-0 px-3 py-1.5">
              <i className="fas fa-cog mr-2 hidden sm:inline-block" />
              <span className="whitespace-nowrap">Account</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="preferredContactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Contact Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contact method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="app">
                              App Notifications
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Details Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your occupation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {occupationTypes.map((type) => (
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
                    control={profileForm.control}
                    name="occupationDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about what you do"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business/Company Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your business name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="yearsInBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="averageMonthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Monthly Income ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 5000" {...field} />
                        </FormControl>
                        <FormDescription>
                          This helps us provide better financial recommendations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Details Tab */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Profile</CardTitle>
              <CardDescription>
                Set your financial preferences and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="financialHealthStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Health Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How would you describe your financial status?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {financialHealthStatuses.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name} - {status.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="riskTolerance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Tolerance</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "medium"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your risk tolerance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">
                              Low - Very conservative with money
                            </SelectItem>
                            <SelectItem value="medium">
                              Medium - Balanced approach
                            </SelectItem>
                            <SelectItem value="high">
                              High - Comfortable with investment risks
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="isSoleProvider"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Sole Provider
                            </FormLabel>
                            <FormDescription>
                              Are you the sole income provider for your
                              household?
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

                    <FormField
                      control={profileForm.control}
                      name="hasEmergencyFund"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Emergency Fund
                            </FormLabel>
                            <FormDescription>
                              Do you have an emergency fund set aside?
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
                  </div>

                  {profileForm.watch("hasEmergencyFund") && (
                    <FormField
                      control={profileForm.control}
                      name="emergencyFundAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Fund Amount ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 10000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex gap-4 justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Widget Settings Tab */}
        <TabsContent value="widget">
          <Card>
            <CardHeader>
              <CardTitle>Widget Settings</CardTitle>
              <CardDescription>
                Configure your desktop and mobile widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...widgetForm}>
                <form
                  onSubmit={widgetForm.handleSubmit(onWidgetSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={widgetForm.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Widget
                          </FormLabel>
                          <FormDescription>
                            Show the 40/30/30 widget on your device
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

                  {widgetForm.watch("enabled") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={widgetForm.control}
                          name="showBalance"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Show Balance
                                </FormLabel>
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

                        <FormField
                          control={widgetForm.control}
                          name="showIncomeGoal"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Show Goal
                                </FormLabel>
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

                        <FormField
                          control={widgetForm.control}
                          name="showNextReminder"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Show Reminders
                                </FormLabel>
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={widgetForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Widget Position</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="top-left">
                                    Top Left
                                  </SelectItem>
                                  <SelectItem value="top-right">
                                    Top Right
                                  </SelectItem>
                                  <SelectItem value="bottom-left">
                                    Bottom Left
                                  </SelectItem>
                                  <SelectItem value="bottom-right">
                                    Bottom Right
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={widgetForm.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Widget Size</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="small">Small</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={widgetForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Widget Theme</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="auto">
                                    Auto (Follow System)
                                  </SelectItem>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 justify-end">
                    <Button
                      type="submit"
                      disabled={updateWidgetMutation.isPending}
                    >
                      {updateWidgetMutation.isPending
                        ? "Saving..."
                        : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account, notifications, and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="remindersEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Reminders
                          </FormLabel>
                          <FormDescription>
                            Receive notifications and reminders about your
                            financial goals and tasks
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

                  <div className="flex gap-4 justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 p-4">
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Once deleted, all your data will be permanently removed.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        {" "}
        {/* Added div for SmartRulesEngine */}
        <SmartRulesEngine />
      </div>
    </main>
  );
}
