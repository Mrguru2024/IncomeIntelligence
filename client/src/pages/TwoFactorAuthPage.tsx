import { useState } from 'react';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2, Shield, UserCheck, AlertTriangle } from 'lucide-react';

// Security tips data
const securityTips = [
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Use a strong, unique password",
    description: "Create a password that is at least 12 characters long with a mix of uppercase, lowercase, numbers, and symbols."
  },
  {
    icon: <UserCheck className="h-6 w-6 text-green-600" />,
    title: "Enable two-factor authentication",
    description: "Add an extra layer of security by requiring a verification code in addition to your password."
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    title: "Be cautious of phishing attempts",
    description: "Be wary of suspicious emails or messages asking for your credentials or personal information."
  }
];

export default function TwoFactorAuthPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("setup");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please log in to access this page.",
      variant: "destructive",
    });
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Security</h1>
          <p className="text-muted-foreground">
            Manage your account's security settings and two-factor authentication.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="setup">Two-Factor Authentication</TabsTrigger>
            <TabsTrigger value="security-tips">Security Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-6">
            <TwoFactorSetup />
          </TabsContent>
          
          <TabsContent value="security-tips" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {securityTips.map((tip, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    {tip.icon}
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{tip.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!user.twoFactorEnabled && (
              <Card className="bg-slate-50 dark:bg-slate-900 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-1">Your account is not fully protected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your account is currently only protected by a password. We strongly recommend enabling two-factor authentication for additional security.
                      </p>
                      <Button variant="outline" onClick={() => setActiveTab("setup")}>
                        Enable Two-Factor Authentication
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}