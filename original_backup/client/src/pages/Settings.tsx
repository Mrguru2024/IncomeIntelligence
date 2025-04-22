import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIncomeStore } from "@/hooks/useIncomeStore";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

// Income Split Profiles data from the schema (simplified for client-side use)
type IncomeSplitProfile = {
  id: string;
  name: string;
  needs: number;
  investments: number;
  savings: number;
  description: string;
  recommendedFor: string[];
  incomeRange: { min: number; max: number | null };
  financialHealth: string[];
};

const incomeSplitProfiles: IncomeSplitProfile[] = [
  { 
    id: "wealth_builder", 
    name: "Wealth Builder", 
    needs: 30, 
    investments: 50, 
    savings: 20, 
    description: "Aggressive growth focus with higher emphasis on investments",
    recommendedFor: ["investor", "minimalist"],
    incomeRange: { min: 5000, max: null },
    financialHealth: ["stable", "growing", "established"]
  },
  { 
    id: "balanced", 
    name: "Balanced Growth", 
    needs: 40, 
    investments: 30, 
    savings: 30, 
    description: "The classic 40/30/30 balanced approach",
    recommendedFor: ["saver", "investor", "security_seeker"],
    incomeRange: { min: 3000, max: null },
    financialHealth: ["building", "stable", "growing", "established"]
  },
  { 
    id: "stability_first", 
    name: "Stability First", 
    needs: 50, 
    investments: 20, 
    savings: 30, 
    description: "Focus on covering needs and building security",
    recommendedFor: ["saver", "security_seeker", "avoider"],
    incomeRange: { min: 2000, max: 5000 },
    financialHealth: ["building", "stable"]
  },
  { 
    id: "debt_reducer", 
    name: "Debt Reducer", 
    needs: 60, 
    investments: 10, 
    savings: 30, 
    description: "Higher allocation for needs to tackle existing debt",
    recommendedFor: ["debtor", "avoider"],
    incomeRange: { min: 0, max: 4000 },
    financialHealth: ["building"]
  },
  { 
    id: "lifestyle_plus", 
    name: "Lifestyle Plus", 
    needs: 50, 
    investments: 30, 
    savings: 20, 
    description: "Balance lifestyle needs with future planning",
    recommendedFor: ["spender", "status_focused"],
    incomeRange: { min: 4000, max: null },
    financialHealth: ["stable", "growing", "established"]
  },
  { 
    id: "freedom_seeker", 
    name: "Freedom Seeker", 
    needs: 30, 
    investments: 40, 
    savings: 30, 
    description: "Focus on investments for financial independence",
    recommendedFor: ["investor", "minimalist"],
    incomeRange: { min: 3500, max: null },
    financialHealth: ["stable", "growing", "established"]
  },
  { 
    id: "high_earner", 
    name: "High Earner", 
    needs: 25, 
    investments: 50, 
    savings: 25, 
    description: "Optimized for high income with aggressive investment strategy",
    recommendedFor: ["investor", "status_focused"],
    incomeRange: { min: 7500, max: null },
    financialHealth: ["growing", "established"]
  },
  { 
    id: "new_starter", 
    name: "New Starter", 
    needs: 55, 
    investments: 15, 
    savings: 30, 
    description: "For those just starting their financial journey",
    recommendedFor: ["saver", "avoider", "debtor"],
    incomeRange: { min: 0, max: 3000 },
    financialHealth: ["building"]
  }
];

type AISettings = {
  CACHE_ENABLED: boolean;
  CACHE_EXPIRY: number;
  CACHE_DIR: string;
  DEFAULT_PROVIDER: string;
  AUTO_FALLBACK: boolean;
  MAX_RETRIES: number;
};

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    needsPercentage,
    investmentsPercentage,
    savingsPercentage,
    updatePercentages,
  } = useIncomeStore();

  // AI settings
  const {
    data: aiSettings,
    isLoading: isLoadingAISettings,
    error: aiSettingsError,
  } = useQuery<AISettings>({
    queryKey: ["/api/ai/settings"],
    refetchOnWindowFocus: false,
  });

  // Local state for AI settings form values
  const [aiFormValues, setAIFormValues] = useState<Partial<AISettings>>({
    DEFAULT_PROVIDER: "",
    AUTO_FALLBACK: true,
    MAX_RETRIES: 3,
    CACHE_ENABLED: true,
  });

  // Update AI form values when settings are loaded
  useEffect(() => {
    if (aiSettings) {
      setAIFormValues({
        DEFAULT_PROVIDER: aiSettings.DEFAULT_PROVIDER,
        AUTO_FALLBACK: aiSettings.AUTO_FALLBACK,
        MAX_RETRIES: aiSettings.MAX_RETRIES,
        CACHE_ENABLED: aiSettings.CACHE_ENABLED,
      });
    }
  }, [aiSettings]);

  // Mutation to update AI settings
  const updateAISettingsMutation = useMutation<
    void,
    Error,
    Partial<AISettings>
  >({
    mutationFn: async (newSettings: Partial<AISettings>) => {
      await apiRequest("POST", "/api/ai/settings", newSettings);
    },
    onSuccess: () => {
      toast({
        title: "AI Settings Updated",
        description: "AI provider settings have been updated successfully.",
      });

      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/ai/settings"] });
    },
    onError: (error) => {
      console.error("Failed to update AI settings:", error);
      toast({
        title: "Update Failed",
        description: "Could not update AI provider settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAIProviderChange = (value: string) => {
    setAIFormValues({ ...aiFormValues, DEFAULT_PROVIDER: value });
  };

  const handleAIToggleChange = (setting: keyof AISettings, value: boolean) => {
    setAIFormValues({ ...aiFormValues, [setting]: value });
  };

  const handleAIRetryChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setAIFormValues({ ...aiFormValues, MAX_RETRIES: numValue });
    }
  };

  const handleAISubmit = () => {
    updateAISettingsMutation.mutate(aiFormValues);
  };

  const [splitRatios, setSplitRatios] = useState({
    needs: needsPercentage,
    investments: investmentsPercentage,
    savings: savingsPercentage,
  });

  // Update local state when store values change
  useEffect(() => {
    setSplitRatios({
      needs: needsPercentage,
      investments: investmentsPercentage,
      savings: savingsPercentage,
    });
  }, [needsPercentage, investmentsPercentage, savingsPercentage]);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const handleRatioChange = (type: keyof typeof splitRatios, value: number) => {
    // Calculate the remaining percentages
    let newRatios = { ...splitRatios };
    newRatios[type] = value;

    // Adjust other values proportionally
    if (type === "needs") {
      // Distribute remaining percentage between investments and savings
      const remaining = 100 - value;
      const ratio =
        splitRatios.investments /
        (splitRatios.investments + splitRatios.savings);
      newRatios.investments = Math.round(remaining * ratio);
      newRatios.savings = remaining - newRatios.investments;
    } else if (type === "investments") {
      // Adjust savings to maintain 100% total
      newRatios.savings = 100 - value - newRatios.needs;
    } else if (type === "savings") {
      // Adjust investments to maintain 100% total
      newRatios.investments = 100 - value - newRatios.needs;
    }

    // Validate that values are positive
    if (
      newRatios.needs < 0 ||
      newRatios.investments < 0 ||
      newRatios.savings < 0
    ) {
      toast({
        title: "Invalid Ratio",
        description: "All percentages must be positive values",
        variant: "destructive",
      });
      return;
    }

    setSplitRatios(newRatios);
    setIsDirty(true);
  };

  const handleSaveSettings = () => {
    // Save to global store
    updatePercentages(
      splitRatios.needs,
      splitRatios.investments,
      splitRatios.savings,
    );
    setIsDirty(false);

    toast({
      title: "Settings Saved",
      description: "Your income split ratio has been updated successfully.",
    });
  };

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
        <p className="text-gray-500 mt-1">
          Customize your income tracking experience
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto horizontal-scroll w-full -mx-2 xxs:-mx-3 px-2 xxs:px-3 pb-1 xxs:pb-2">
          <TabsList className="horizontal-scroll scrollbar-none flex pb-1 min-w-[320px] xxs:min-w-[380px] sm:min-w-0 inline-flex w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="split-ratio">Split Ratio</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your basic application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Your Name"
                  defaultValue="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  defaultValue="john.doe@example.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch defaultChecked={false} id="dark-mode" />
              </div>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="split-ratio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Split Ratio Settings</CardTitle>
              <CardDescription>
                Customize how your income is split (must add up to 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual ratio representation */}
              <div className="flex h-12 w-full rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue-500 flex items-center justify-center text-white font-medium"
                  style={{ width: `${splitRatios.needs}%` }}
                >
                  {splitRatios.needs}%
                </div>
                <div
                  className="h-full bg-purple-500 flex items-center justify-center text-white font-medium"
                  style={{ width: `${splitRatios.investments}%` }}
                >
                  {splitRatios.investments}%
                </div>
                <div
                  className="h-full bg-green-500 flex items-center justify-center text-white font-medium"
                  style={{ width: `${splitRatios.savings}%` }}
                >
                  {splitRatios.savings}%
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <div>Needs</div>
                <div>Investments</div>
                <div>Savings</div>
              </div>

              {/* Current status summary */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h3 className="font-medium mb-2">
                  Current Split: {splitRatios.needs}/{splitRatios.investments}/
                  {splitRatios.savings}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 mb-1">
                      Needs
                    </Badge>
                    <p className="text-2xl font-bold text-blue-600">
                      {splitRatios.needs}%
                    </p>
                    <p className="text-xs text-gray-500">Essential expenses</p>
                  </div>
                  <div>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 mb-1">
                      Investments
                    </Badge>
                    <p className="text-2xl font-bold text-purple-600">
                      {splitRatios.investments}%
                    </p>
                    <p className="text-xs text-gray-500">Long-term growth</p>
                  </div>
                  <div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 mb-1">
                      Savings
                    </Badge>
                    <p className="text-2xl font-bold text-green-600">
                      {splitRatios.savings}%
                    </p>
                    <p className="text-xs text-gray-500">Future security</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="needs-percentage">Needs Percentage</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="needs-percentage"
                        type="number"
                        value={splitRatios.needs}
                        onChange={(e) =>
                          handleRatioChange(
                            "needs",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min={0}
                        max={100}
                        className="w-16 h-8"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <Slider
                    value={[splitRatios.needs]}
                    min={0}
                    max={100}
                    step={1}
                    className="bg-blue-100"
                    onValueChange={(value) =>
                      handleRatioChange("needs", value[0])
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Daily expenses, rent, bills, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="investments-percentage">
                      Investments Percentage
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="investments-percentage"
                        type="number"
                        value={splitRatios.investments}
                        onChange={(e) =>
                          handleRatioChange(
                            "investments",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min={0}
                        max={100}
                        className="w-16 h-8"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <Slider
                    value={[splitRatios.investments]}
                    min={0}
                    max={100}
                    step={1}
                    className="bg-purple-100"
                    onValueChange={(value) =>
                      handleRatioChange("investments", value[0])
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Long-term growth, business, retirement
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="savings-percentage">
                      Savings Percentage
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="savings-percentage"
                        type="number"
                        value={splitRatios.savings}
                        onChange={(e) =>
                          handleRatioChange(
                            "savings",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min={0}
                        max={100}
                        className="w-16 h-8"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <Slider
                    value={[splitRatios.savings]}
                    min={0}
                    max={100}
                    step={1}
                    className="bg-green-100"
                    onValueChange={(value) =>
                      handleRatioChange("savings", value[0])
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Emergency fund, future goals
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium flex items-center gap-2">
                  Total:{" "}
                  <span
                    className={
                      splitRatios.needs +
                        splitRatios.investments +
                        splitRatios.savings ===
                      100
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {splitRatios.needs +
                      splitRatios.investments +
                      splitRatios.savings}
                    %
                  </span>
                  {splitRatios.needs +
                    splitRatios.investments +
                    splitRatios.savings ===
                    100 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={
                    splitRatios.needs +
                      splitRatios.investments +
                      splitRatios.savings !==
                      100 || !isDirty
                  }
                >
                  {isDirty ? "Save Changes" : "No Changes"}
                </Button>
              </div>

              {/* Income Split Profiles */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Income Split Profiles</h3>
                <div className="mb-4">
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    onChange={(e) => {
                      // Find the selected profile
                      const profileId = e.target.value;
                      if (profileId === 'custom') return;
                      
                      const selectedProfile = incomeSplitProfiles.find((profile) => profile.id === profileId);
                      if (selectedProfile) {
                        setSplitRatios({
                          needs: selectedProfile.needs,
                          investments: selectedProfile.investments,
                          savings: selectedProfile.savings,
                        });
                        setIsDirty(true);
                      }
                    }}
                  >
                    <option value="custom">Custom Split</option>
                    {incomeSplitProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.needs}/{profile.investments}/{profile.savings})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 mb-4 bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-1">Income Split Recommendations</h4>
                  <p className="mb-2">Based on your profile and spending patterns, we recommend these allocations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>If your income is less than $3,000/month: <span className="font-medium">New Starter (55/15/30)</span></li>
                    <li>If you have debt to pay off: <span className="font-medium">Debt Reducer (60/10/30)</span></li>
                    <li>If you're saving for retirement: <span className="font-medium">Freedom Seeker (30/40/30)</span></li>
                    <li>If you have high income: <span className="font-medium">Wealth Builder (30/50/20)</span></li>
                  </ul>
                </div>

                <h3 className="text-sm font-medium mb-2">Quick Presets</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSplitRatios({
                        needs: 40,
                        investments: 30,
                        savings: 30,
                      });
                      setIsDirty(true);
                    }}
                  >
                    40/30/30 (Default)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSplitRatios({
                        needs: 50,
                        investments: 30,
                        savings: 20,
                      });
                      setIsDirty(true);
                    }}
                  >
                    50/30/20
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSplitRatios({
                        needs: 60,
                        investments: 20,
                        savings: 20,
                      });
                      setIsDirty(true);
                    }}
                  >
                    60/20/20
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSplitRatios({
                        needs: 33,
                        investments: 33,
                        savings: 34,
                      });
                      setIsDirty(true);
                    }}
                  >
                    33/33/34 (Equal)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive emails for important updates
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  id="email-notifications"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Summary Reports</Label>
                  <p className="text-sm text-gray-500">
                    Get a summary of your weekly income
                  </p>
                </div>
                <Switch
                  checked={weeklyReports}
                  onCheckedChange={setWeeklyReports}
                  id="weekly-reports"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Monthly Summary Reports</Label>
                  <p className="text-sm text-gray-500">
                    Get a summary of your monthly income
                  </p>
                </div>
                <Switch
                  checked={monthlyReports}
                  onCheckedChange={setMonthlyReports}
                  id="monthly-reports"
                />
              </div>

              <Button onClick={handleSaveSettings}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider Settings</CardTitle>
              <CardDescription>
                Configure how AI-powered features work in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingAISettings ? (
                <div className="flex justify-center items-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading AI settings...</span>
                </div>
              ) : aiSettingsError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load AI provider settings. Please refresh the page
                    or try again later.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2">
                      Current AI Provider Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Primary Provider</p>
                        <p className="text-lg font-bold">
                          {aiSettings?.DEFAULT_PROVIDER === "openai"
                            ? "OpenAI GPT-4o"
                            : aiSettings?.DEFAULT_PROVIDER === "anthropic"
                              ? "Anthropic Claude"
                              : "Perplexity AI"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Auto Fallback</p>
                        <div className="flex items-center">
                          {aiSettings?.AUTO_FALLBACK ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                          ) : null}
                          <p className="text-lg font-bold">
                            {aiSettings?.AUTO_FALLBACK ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Response Caching</p>
                        <div className="flex items-center">
                          {aiSettings?.CACHE_ENABLED ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                          ) : null}
                          <p className="text-lg font-bold">
                            {aiSettings?.CACHE_ENABLED ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Max Retries</p>
                        <p className="text-lg font-bold">
                          {aiSettings?.MAX_RETRIES}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Default AI Provider</Label>
                      <p className="text-sm text-gray-500">
                        Select which AI provider to use for financial advice and
                        analysis.
                      </p>
                      <RadioGroup
                        value={aiFormValues.DEFAULT_PROVIDER}
                        onValueChange={handleAIProviderChange}
                        className="gap-4"
                      >
                        <div className="flex flex-col space-y-4">
                          <h4 className="text-base font-medium text-primary">
                            Financial Advice AI Models
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            These models are great for generating financial
                            suggestions, answering money questions, and
                            assisting with user education.
                          </p>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="openai" id="openai" />
                            <Label htmlFor="openai" className="font-normal">
                              OpenAI GPT-4o (Advanced financial reasoning, may
                              require more tokens)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="anthropic" id="anthropic" />
                            <Label htmlFor="anthropic" className="font-normal">
                              Anthropic Claude (Strong dialogue and financial
                              advice capabilities)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="perplexity"
                              id="perplexity"
                            />
                            <Label htmlFor="perplexity" className="font-normal">
                              Perplexity AI (Free model specialized in searching
                              and analyzing financial information)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mistral" id="mistral" />
                            <Label htmlFor="mistral" className="font-normal">
                              Mistral 7B/Mixtral (Handles logic, planning,
                              summarization, financial Q&A)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="llama" id="llama" />
                            <Label htmlFor="llama" className="font-normal">
                              LLaMA 2 (Meta's model for reasoning and dialogue
                              generation)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="open-assistant"
                              id="open-assistant"
                            />
                            <Label
                              htmlFor="open-assistant"
                              className="font-normal"
                            >
                              Open-Assistant (Chatbot focused on real
                              conversation-style interaction)
                            </Label>
                          </div>

                          <h4 className="text-base font-medium text-primary mt-4">
                            Voice & Text Processing
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Models for voice commands and expense categorization
                          </p>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="whisper" id="whisper" />
                            <Label htmlFor="whisper" className="font-normal">
                              Whisper (OpenAI's high-accuracy speech-to-text)
                            </Label>
                          </div>

                          <h4 className="text-base font-medium text-primary mt-4">
                            Expense Categorization
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Models for automatic expense tagging and
                            categorization
                          </p>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="scikit-learn"
                              id="scikit-learn"
                            />
                            <Label
                              htmlFor="scikit-learn"
                              className="font-normal"
                            >
                              scikit-learn (Basic models for expense
                              classification)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fasttext" id="fasttext" />
                            <Label htmlFor="fasttext" className="font-normal">
                              fastText (Lightweight NLP for text-based merchant
                              categorization)
                            </Label>
                          </div>

                          <h4 className="text-base font-medium text-primary mt-4">
                            Rules & Summarization
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Models for automation logic and generating summaries
                          </p>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="json-logic"
                              id="json-logic"
                            />
                            <Label htmlFor="json-logic" className="font-normal">
                              JSON Logic (Rules engine for savings automation)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="t5" id="t5" />
                            <Label htmlFor="t5" className="font-normal">
                              T5 (Text-To-Text Transformer for generating
                              summaries and feedback)
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto Fallback</Label>
                          <p className="text-sm text-gray-500">
                            Automatically try alternative AI provider if the
                            first one fails
                          </p>
                        </div>
                        <Switch
                          checked={aiFormValues.AUTO_FALLBACK}
                          onCheckedChange={(checked) =>
                            handleAIToggleChange("AUTO_FALLBACK", checked)
                          }
                          id="auto-fallback"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Cache AI Responses</Label>
                          <p className="text-sm text-gray-500">
                            Save AI responses to reduce API calls and improve
                            performance
                          </p>
                        </div>
                        <Switch
                          checked={aiFormValues.CACHE_ENABLED}
                          onCheckedChange={(checked) =>
                            handleAIToggleChange("CACHE_ENABLED", checked)
                          }
                          id="cache-enabled"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <Label htmlFor="max-retries">Maximum Retries</Label>
                          <p className="text-sm text-gray-500">
                            Number of times to retry API calls if they fail
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="max-retries"
                            type="number"
                            value={aiFormValues.MAX_RETRIES}
                            onChange={(e) =>
                              handleAIRetryChange(e.target.value)
                            }
                            min={1}
                            max={10}
                            className="w-16 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAISubmit}
                    disabled={updateAISettingsMutation.isPending}
                    className="mt-4"
                  >
                    {updateAISettingsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save AI Settings
                  </Button>

                  <Alert className="mt-6 bg-blue-50">
                    <AlertTitle>About AI Providers</AlertTitle>
                    <AlertDescription>
                      <p className="text-sm">
                        This application uses advanced AI models to generate
                        financial advice and analysis. You can configure which
                        provider to use as the default and whether to
                        automatically fall back to an alternative if the first
                        one fails.
                      </p>

                      <div className="text-sm mt-3 space-y-3">
                        <h4 className="font-medium">
                          Financial Advice Models:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            <strong>OpenAI GPT-4o</strong>: Latest model from
                            OpenAI with strong financial analysis capabilities.
                          </li>
                          <li>
                            <strong>Anthropic Claude</strong>: Alternative
                            provider that may offer different insights and
                            perspectives.
                          </li>
                          <li>
                            <strong>Perplexity AI</strong>: Free alternative
                            specialized in searching and analyzing financial
                            information.
                          </li>
                          <li>
                            <strong>Mistral 7B/Mixtral</strong>: Apache 2.0
                            licensed model good for logic, planning, and
                            summarization.
                          </li>
                          <li>
                            <strong>LLaMA 2</strong>: Meta's model for reasoning
                            and dialogue generation.
                          </li>
                          <li>
                            <strong>Open-Assistant</strong>: Apache 2.0 licensed
                            chatbot focused on conversation-style interaction.
                          </li>
                        </ul>

                        <h4 className="font-medium">
                          Voice & Text Processing:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            <strong>Whisper</strong>: OpenAI's MIT-licensed
                            high-accuracy speech-to-text for voice commands.
                          </li>
                        </ul>

                        <h4 className="font-medium">Expense Categorization:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            <strong>scikit-learn</strong>: Basic ML models for
                            expense classification and prediction.
                          </li>
                          <li>
                            <strong>fastText</strong>: Lightweight NLP for
                            text-based merchant categorization.
                          </li>
                        </ul>

                        <h4 className="font-medium">Rules & Summarization:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            <strong>JSON Logic</strong>: Rules engine for
                            defining savings rules and automation.
                          </li>
                          <li>
                            <strong>T5</strong>: Text-To-Text Transformer for
                            generating summaries and user feedback.
                          </li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button onClick={handleSaveSettings}>Update Password</Button>

              <Separator className="my-6" />

              <div>
                <h4 className="text-base font-medium text-destructive mb-2">
                  Danger Zone
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. This
                  action cannot be undone.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
