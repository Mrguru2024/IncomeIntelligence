import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIncomeStore } from '@/hooks/useIncomeStore';
import { Slider } from '@/components/ui/slider';

export default function Settings() {
  const { toast } = useToast();
  const { 
    needsPercentage, 
    investmentsPercentage, 
    savingsPercentage, 
    updatePercentages 
  } = useIncomeStore();
  
  const [splitRatios, setSplitRatios] = useState({
    needs: needsPercentage,
    investments: investmentsPercentage,
    savings: savingsPercentage
  });

  // Update local state when store values change
  useEffect(() => {
    setSplitRatios({
      needs: needsPercentage,
      investments: investmentsPercentage,
      savings: savingsPercentage
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
    if (type === 'needs') {
      // Distribute remaining percentage between investments and savings
      const remaining = 100 - value;
      const ratio = splitRatios.investments / (splitRatios.investments + splitRatios.savings);
      newRatios.investments = Math.round(remaining * ratio);
      newRatios.savings = remaining - newRatios.investments;
    } else if (type === 'investments') {
      // Adjust savings to maintain 100% total
      newRatios.savings = 100 - value - newRatios.needs;
    } else if (type === 'savings') {
      // Adjust investments to maintain 100% total
      newRatios.investments = 100 - value - newRatios.needs;
    }
    
    // Validate that values are positive
    if (newRatios.needs < 0 || newRatios.investments < 0 || newRatios.savings < 0) {
      toast({
        title: "Invalid Ratio",
        description: "All percentages must be positive values",
        variant: "destructive"
      });
      return;
    }
    
    setSplitRatios(newRatios);
    setIsDirty(true);
  };

  const handleSaveSettings = () => {
    // Save to global store
    updatePercentages(splitRatios.needs, splitRatios.investments, splitRatios.savings);
    setIsDirty(false);
    
    toast({
      title: "Settings Saved",
      description: "Your income split ratio has been updated successfully."
    });
  };

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
        <p className="text-gray-500 mt-1">Customize your income tracking experience</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto horizontal-scroll w-full -mx-2 xxs:-mx-3 px-2 xxs:px-3 pb-1 xxs:pb-2">
          <TabsList className="horizontal-scroll scrollbar-none flex pb-1 min-w-[320px] xxs:min-w-[380px] sm:min-w-0 inline-flex w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="split-ratio">Split Ratio</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your basic application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" placeholder="Your Name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" defaultValue="john.doe@example.com" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">Switch between light and dark themes</p>
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
              <CardDescription>Customize how your income is split (must add up to 100%)</CardDescription>
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
                <h3 className="font-medium mb-2">Current Split: {splitRatios.needs}/{splitRatios.investments}/{splitRatios.savings}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 mb-1">Needs</Badge>
                    <p className="text-2xl font-bold text-blue-600">{splitRatios.needs}%</p>
                    <p className="text-xs text-gray-500">Essential expenses</p>
                  </div>
                  <div>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 mb-1">Investments</Badge>
                    <p className="text-2xl font-bold text-purple-600">{splitRatios.investments}%</p>
                    <p className="text-xs text-gray-500">Long-term growth</p>
                  </div>
                  <div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 mb-1">Savings</Badge>
                    <p className="text-2xl font-bold text-green-600">{splitRatios.savings}%</p>
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
                        onChange={(e) => handleRatioChange('needs', parseInt(e.target.value) || 0)}
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
                    onValueChange={(value) => handleRatioChange('needs', value[0])}
                  />
                  <p className="text-sm text-gray-500">Daily expenses, rent, bills, etc.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="investments-percentage">Investments Percentage</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="investments-percentage" 
                        type="number" 
                        value={splitRatios.investments}
                        onChange={(e) => handleRatioChange('investments', parseInt(e.target.value) || 0)}
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
                    onValueChange={(value) => handleRatioChange('investments', value[0])}
                  />
                  <p className="text-sm text-gray-500">Long-term growth, business, retirement</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="savings-percentage">Savings Percentage</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="savings-percentage" 
                        type="number" 
                        value={splitRatios.savings}
                        onChange={(e) => handleRatioChange('savings', parseInt(e.target.value) || 0)}
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
                    onValueChange={(value) => handleRatioChange('savings', value[0])}
                  />
                  <p className="text-sm text-gray-500">Emergency fund, future goals</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium flex items-center gap-2">
                  Total: <span className={splitRatios.needs + splitRatios.investments + splitRatios.savings === 100 ? "text-green-600" : "text-red-600"}>
                    {splitRatios.needs + splitRatios.investments + splitRatios.savings}%
                  </span>
                  {splitRatios.needs + splitRatios.investments + splitRatios.savings === 100 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={splitRatios.needs + splitRatios.investments + splitRatios.savings !== 100 || !isDirty}
                >
                  {isDirty ? "Save Changes" : "No Changes"}
                </Button>
              </div>

              {/* Preset templates */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Presets</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSplitRatios({needs: 40, investments: 30, savings: 30});
                      setIsDirty(true);
                    }}
                  >
                    40/30/30 (Default)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSplitRatios({needs: 50, investments: 30, savings: 20});
                      setIsDirty(true);
                    }}
                  >
                    50/30/20
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSplitRatios({needs: 60, investments: 20, savings: 20});
                      setIsDirty(true);
                    }}
                  >
                    60/20/20
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSplitRatios({needs: 33, investments: 33, savings: 34});
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
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive emails for important updates</p>
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
                  <p className="text-sm text-gray-500">Get a summary of your weekly income</p>
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
                  <p className="text-sm text-gray-500">Get a summary of your monthly income</p>
                </div>
                <Switch 
                  checked={monthlyReports} 
                  onCheckedChange={setMonthlyReports} 
                  id="monthly-reports" 
                />
              </div>
              
              <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account security and preferences</CardDescription>
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
                <h4 className="text-base font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. This action cannot be undone.
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
