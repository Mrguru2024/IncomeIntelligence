import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, LoaderIcon } from 'lucide-react';
import { subscriptionPlans } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function CheckoutSuccess() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      setLocation('/auth');
      return;
    }

    // Get plan from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('planId');
    if (plan) {
      setPlanId(plan);
    }

    // Verify payment status with server
    const verifyPayment = async () => {
      try {
        await apiRequest('GET', '/api/verify-subscription');
        setLoading(false);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [user, setLocation]);

  const selectedPlan = planId ? 
    subscriptionPlans.find(plan => plan.id === planId) : 
    null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoaderIcon className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Verifying your subscription...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 mx-auto">
      <div className="max-w-lg mx-auto">
        <Card className="border-2 border-green-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
            <CardDescription>
              Thank you for subscribing to {selectedPlan?.name || 'Stackr Pro'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              Your subscription has been activated and you now have access to all the premium features.
            </p>
            
            {selectedPlan && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Your subscription includes:</h3>
                <ul className="space-y-1">
                  {selectedPlan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {selectedPlan.features.length > 5 && (
                    <li className="text-muted-foreground text-sm italic">
                      And {selectedPlan.features.length - 5} more features...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={() => setLocation('/dashboard')}
            >
              Continue to Dashboard <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setLocation('/profile')}
            >
              View Your Subscription
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}