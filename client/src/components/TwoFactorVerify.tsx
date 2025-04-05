import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TwoFactorVerifyProps {
  userId: number;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export default function TwoFactorVerify({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  
  // Verify 2FA token
  const verifyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/2fa/verify', {
        method: 'POST',
        body: { userId, token }
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Verification successful',
        description: 'You have been logged in successfully.',
      });
      onSuccess(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    }
  });
  
  // Verify backup code
  const backupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/2fa/backup', {
        method: 'POST',
        body: { userId, backupCode }
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Backup code verified',
        description: 'You have been logged in successfully.',
      });
      onSuccess(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid backup code',
        variant: 'destructive',
      });
    }
  });
  
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: 'Verification code required',
        description: 'Please enter the verification code from your authenticator app.',
        variant: 'destructive',
      });
      return;
    }
    verifyMutation.mutate();
  };
  
  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode) {
      toast({
        title: 'Backup code required',
        description: 'Please enter a valid backup code.',
        variant: 'destructive',
      });
      return;
    }
    backupMutation.mutate();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          For added security, please enter the verification code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="authenticator">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="authenticator">Authenticator App</TabsTrigger>
            <TabsTrigger value="backup">Backup Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="authenticator">
            <form onSubmit={handleTokenSubmit}>
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                className="mt-4 w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify Code'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="backup">
            <form onSubmit={handleBackupSubmit}>
              <div className="space-y-2">
                <Label htmlFor="backupCode">Backup Code</Label>
                <Input
                  id="backupCode"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="Enter your backup code"
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Enter one of your backup codes if you don't have access to your authenticator app.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="mt-4 w-full"
                disabled={backupMutation.isPending}
              >
                {backupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Use Backup Code'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          onClick={onCancel} 
          className="w-full text-slate-500 hover:text-slate-700"
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}