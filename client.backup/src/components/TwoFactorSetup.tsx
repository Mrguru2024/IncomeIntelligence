import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function TwoFactorSetup() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Get 2FA setup data (QR code and secret)
  const {
    data: setup2FAData,
    isLoading: isSetupLoading,
    refetch: refetchSetup,
  } = useQuery({
    queryKey: ["/api/auth/2fa/setup"],
    enabled: user?.twoFactorEnabled === false,
  });

  // Get existing backup codes if 2FA is already enabled
  const {
    data: backupCodesData,
    isLoading: isBackupCodesLoading,
    refetch: refetchBackupCodes,
  } = useQuery({
    queryKey: ["/api/auth/2fa/backup-codes"],
    enabled: user?.twoFactorEnabled === true && showBackupCodes,
  });

  // Enable 2FA
  const enableMutation = useMutation({
    mutationFn: async (verificationToken: string) => {
      return apiRequest("/api/auth/2fa/enable", {
        method: "POST",
        body: { token: verificationToken },
      });
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Two-factor authentication enabled",
        description: "Please save your backup codes in a secure location.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enable 2FA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async (pwd: string) => {
      return apiRequest("/api/auth/2fa/disable", {
        method: "POST",
        body: { password: pwd },
      });
    },
    onSuccess: () => {
      setShowBackupCodes(false);
      setBackupCodes([]);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Two-factor authentication disabled",
        description:
          "Your account is now less secure. We recommend enabling 2FA.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to disable 2FA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Verification code required",
        description:
          "Please enter the verification code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }
    enableMutation.mutate(token);
  };

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password to disable 2FA.",
        variant: "destructive",
      });
      return;
    }
    disableMutation.mutate(password);
  };

  const handleShowBackupCodes = () => {
    setShowBackupCodes(true);
    refetchBackupCodes();
  };

  if (!user) {
    return <div>Please login to access this feature.</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {user.twoFactorEnabled
            ? "Manage your two-factor authentication settings"
            : "Enhance your account security with two-factor authentication"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user.twoFactorEnabled ? (
          <>
            <p className="text-sm mb-4">
              Two-factor authentication is currently{" "}
              <span className="font-bold text-green-600">enabled</span> for your
              account.
            </p>

            {showBackupCodes ? (
              <>
                <h3 className="font-medium mb-2">Your backup codes</h3>
                {isBackupCodesLoading ? (
                  <div className="flex justify-center my-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : backupCodesData?.backupCodes ? (
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodesData.backupCodes.map(
                        (code: string, index: number) => (
                          <div key={index} className="font-mono text-sm">
                            {code}
                          </div>
                        ),
                      )}
                    </div>
                    <p className="text-xs mt-2 text-slate-500">
                      Save these codes somewhere safe. Each code can only be
                      used once.
                    </p>
                  </div>
                ) : (
                  <p>
                    No backup codes available. Try disabling and re-enabling
                    2FA.
                  </p>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={handleShowBackupCodes}
              >
                Show backup codes
              </Button>
            )}

            <form onSubmit={handleDisable}>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Enter your password to disable 2FA
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your current password"
                />
              </div>

              <Button
                type="submit"
                variant="destructive"
                className="mt-4 w-full"
                disabled={disableMutation.isPending}
              >
                {disableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            {isSetupLoading ? (
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : setup2FAData ? (
              <>
                <div className="mb-4">
                  <p className="text-sm mb-4">
                    Scan this QR code with your authenticator app (like Google
                    Authenticator, Authy, or Microsoft Authenticator).
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src={setup2FAData.qrCodeUrl}
                      alt="QR Code for 2FA"
                      className="border border-slate-200 rounded-md"
                    />
                  </div>
                  <p className="text-sm mb-2">Or enter this code manually:</p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md font-mono text-center mb-4">
                    {setup2FAData.secret}
                  </div>
                </div>

                <form onSubmit={handleEnable}>
                  <div className="space-y-2">
                    <Label htmlFor="token">Verification code</Label>
                    <Input
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={enableMutation.isPending}
                  >
                    {enableMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enabling...
                      </>
                    ) : (
                      "Enable 2FA"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <Button onClick={() => refetchSetup()} className="w-full">
                Setup Two-Factor Authentication
              </Button>
            )}
          </>
        )}

        {showBackupCodes && backupCodes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Your new backup codes</h3>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-2 text-slate-500">
                Save these codes somewhere safe. Each code can only be used
                once.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-slate-500 text-center">
          Two-factor authentication adds an extra layer of security to your
          account. Once enabled, you'll need to enter a verification code from
          your authenticator app when you sign in, in addition to your password.
        </p>
      </CardFooter>
    </Card>
  );
}
