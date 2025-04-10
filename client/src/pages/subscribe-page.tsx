import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderIcon } from 'lucide-react';
import { subscriptionPlans } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function SubscribePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [, setLocation] = useLocation();

  // Redirect to dashboard if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    try {
      if (planId === 'free') {
        // For free tier, just update the user's subscription tier
        const response = await apiRequest('POST', '/api/update-subscription', { 
          tier: 'free',
          active: true
        });
        
        if (response.ok) {
          toast({
            title: "Subscription Updated",
            description: "You're now on the Free tier. You can upgrade anytime.",
            variant: "default",
          });
          setLocation('/dashboard');
        } else {
          throw new Error('Failed to update subscription');
        }
      } else {
        // For paid tiers, create a Stripe checkout session
        const response = await apiRequest('POST', '/api/create-subscription', {
          planId,
          billingPeriod
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.clientSecret) {
            // Redirect to checkout page with the client secret
            setLocation(`/checkout-page?clientSecret=${data.clientSecret}&planId=${planId}`);
          } else {
            throw new Error('No client secret returned');
          }
        } else {
          throw new Error('Failed to create subscription');
        }
      }
    } catch (error) {
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "An error occurred during subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Find the current plan
  const currentPlan = subscriptionPlans.find(plan => plan.id === (user?.subscriptionTier || 'free'));

  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Choose Your Stackr Plan</h1>
          <p className="text-muted-foreground">
            Select the plan that works best for you and your financial journey.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Tabs defaultValue="monthly" className="w-[400px]" onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'annual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
              <TabsTrigger value="annual">Annual Billing <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">Save 15%</Badge></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            // Check if this is the user's current plan
            const isCurrentPlan = user?.subscriptionTier === plan.id;
            
            // Calculate price display based on billing period
            const priceDisplay = billingPeriod === 'annual' && plan.id === 'pro' 
              ? `$${plan.annualPrice}/year`
              : plan.price === 0 
                ? 'Free' 
                : plan.id === 'lifetime' 
                  ? `$${plan.price} one-time` 
                  : `$${plan.price}/month`;

            // Handle specific logic for lifetime plan
            const isOneTime = plan.id === 'lifetime';
            
            return (
              <Card 
                key={plan.id} 
                className={`flex flex-col border-2 ${selectedPlanId === plan.id ? 'border-primary' : 'border-border'}`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{priceDisplay}</span>
                    {plan.trialDays && !isOneTime && (
                      <span className="text-muted-foreground ml-2">with {plan.trialDays}-day trial</span>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Icons.check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitedFeatures && (
                      <>
                        <h4 className="font-medium mt-4">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitedFeatures.map((limitation, index) => (
                            <li key={index} className="flex items-center">
                              <Icons.ellipsis className="h-4 w-4 mr-2 text-amber-500" />
                              <span className="text-muted-foreground">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={selectedPlanId === plan.id ? "default" : "outline"} 
                    disabled={isLoading || isCurrentPlan}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      handleSubscribe(plan.id);
                    }}
                  >
                    {isLoading && selectedPlanId === plan.id ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      `Select ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            <br />
            Have questions? <Button variant="link" className="p-0 h-auto">Contact our support team</Button>
          </p>
        </div>
      </div>
    </div>
  );
}