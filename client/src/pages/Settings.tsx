import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [splitRatios, setSplitRatios] = useState({
    needs: 40,
    investments: 30,
    savings: 30
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

  const handleRatioChange = (type: keyof typeof splitRatios, value: number) => {
    // Ensure that all three percentages add up to 100
    const newRatios = { ...splitRatios, [type]: value };
    const sum = Object.values(newRatios).reduce((sum, val) => sum + val, 0);
    
    if (sum !== 100) {
      toast({
        title: "Invalid Ratio",
        description: "The three percentages must add up to 100%",
        variant: "destructive"
      });
      return;
    }
    
    setSplitRatios(newRatios);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully."
    });
  };

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
        <p className="text-gray-500 mt-1">Customize your income tracking experience</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="split-ratio">Split Ratio</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="needs-percentage">Needs Percentage</Label>
                <div className="flex items-center">
                  <Input 
                    id="needs-percentage" 
                    type="number" 
                    value={splitRatios.needs}
                    onChange={(e) => handleRatioChange('needs', parseInt(e.target.value))}
                    min={0}
                    max={100}
                    className="max-w-[100px]"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-sm text-gray-500">Daily expenses, rent, bills</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="investments-percentage">Investments Percentage</Label>
                <div className="flex items-center">
                  <Input 
                    id="investments-percentage" 
                    type="number" 
                    value={splitRatios.investments}
                    onChange={(e) => handleRatioChange('investments', parseInt(e.target.value))}
                    min={0}
                    max={100}
                    className="max-w-[100px]"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-sm text-gray-500">Long-term growth, business</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="savings-percentage">Savings Percentage</Label>
                <div className="flex items-center">
                  <Input 
                    id="savings-percentage" 
                    type="number" 
                    value={splitRatios.savings}
                    onChange={(e) => handleRatioChange('savings', parseInt(e.target.value))}
                    min={0}
                    max={100}
                    className="max-w-[100px]"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-sm text-gray-500">Emergency fund, future goals</p>
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium">Total: 100%</p>
              </div>
              
              <Button onClick={handleSaveSettings}>Save Ratio Settings</Button>
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
