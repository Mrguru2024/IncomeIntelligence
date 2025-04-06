import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Clock, CreditCard, Calendar, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type SubscriptionInfo = {
  tier: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

const SubscriptionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Get subscription information
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery<SubscriptionInfo>({
    queryKey: ['/api/subscription'],
    enabled: !!user,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cancel-subscription');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will remain active until the end of the billing period.',
      });
      setCancelDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCancel = async () => {
    cancelMutation.mutate();
  };

  // Format date to display in a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Determine subscription status and next steps
  const getSubscriptionStatus = () => {
    if (!subscription) return null;

    if (subscription.tier === 'free') {
      return {
        label: 'Free',
        color: 'bg-gray-100 text-gray-800',
        icon: null,
      };
    }

    if (subscription.active) {
      return {
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        icon: <Check className="h-4 w-4 mr-1" />,
      };
    }

    return {
      label: 'Inactive',
      color: 'bg-red-100 text-red-800',
      icon: <ShieldOff className="h-4 w-4 mr-1" />,
    };
  };

  const status = getSubscriptionStatus();

  if (subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Loading subscription details...</h2>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p>Failed to load subscription information. Please try again later.</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} className="mt-6">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your Stackr subscription and billing details</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Subscription Details</CardTitle>
            {status && (
              <Badge 
                className={`flex items-center ${status.color}`}
                variant="outline"
              >
                {status.icon}
                {status.label}
              </Badge>
            )}
          </div>
          <CardDescription>
            Your current plan and subscription information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Plan</p>
              <p className="text-lg font-semibold">
                {subscription?.tier === 'pro' ? 'Stackr Pro' : 'Free Plan'}
              </p>
            </div>
            
            {subscription?.active && subscription?.tier === 'pro' && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Price</p>
                <p className="text-lg font-semibold">$9.99/month</p>
              </div>
            )}

            {subscription?.startDate && (
              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Started on</p>
                  <p>{formatDate(subscription.startDate)}</p>
                </div>
              </div>
            )}

            {subscription?.endDate && (
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {subscription.active ? 'Next Billing Date' : 'Expired on'}
                  </p>
                  <p>{formatDate(subscription.endDate)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium">Plan Features</h3>
            {subscription?.tier === 'pro' ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> AI Financial Assistant</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Voice Commands</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Bank Account Integration</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Advanced Analytics</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Unlimited Categories</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Income Opportunities</li>
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Upgrade to Stackr Pro to unlock all premium features.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          {subscription?.tier === 'free' ? (
            <Button 
              variant="default" 
              onClick={() => navigate('/subscribe')}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
            >
              Upgrade to Pro
            </Button>
          ) : (
            <>
              {subscription?.active ? (
                <Button 
                  variant="outline" 
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Cancel Subscription
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  onClick={() => navigate('/subscribe')}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
                >
                  Renew Subscription
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {subscription?.tier === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <CreditCard className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment information is managed through Stripe</p>
                <p className="text-sm text-muted-foreground">
                  For security reasons, your payment details are securely stored with our payment processor.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Your Subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your Stackr Pro subscription? You'll still have access to Pro features until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">What you'll lose:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> AI Financial Assistant</li>
              <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Voice Commands</li>
              <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Bank Account Integration</li>
              <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Advanced Analytics</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;