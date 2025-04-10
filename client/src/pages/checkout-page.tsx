import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, ArrowLeft, LoaderIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { subscriptionPlans } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Component that handles the actual payment form
function CheckoutForm({ planId }: { planId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success?planId=${planId}`,
        },
      });

      if (error) {
        // Payment failed
        setErrorMessage(error.message || 'An error occurred during payment.');
        toast({
          title: "Payment Failed",
          description: error.message || 'An error occurred during payment.',
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        toast({
          title: "Payment Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <PaymentElement />
      </div>

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setLocation('/subscribe-page')}
          disabled={processing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Payment'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get the client secret from URL parameters
  useEffect(() => {
    // Extract params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('clientSecret');
    const plan = urlParams.get('planId');
    
    if (secret) {
      setClientSecret(secret);
    } else {
      // No client secret found, redirect back to subscription page
      toast({
        title: 'Missing Payment Information',
        description: 'There was a problem with your payment session. Please try again.',
        variant: 'destructive',
      });
      setLocation('/subscribe-page');
    }

    if (plan) {
      setPlanId(plan);
    }
  }, [setLocation, toast]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Find the selected plan details
  const selectedPlan = planId ? 
    subscriptionPlans.find(plan => plan.id === planId) : 
    null;

  if (!clientSecret || !planId || !selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Complete Your Subscription</CardTitle>
            <CardDescription>
              You're subscribing to <strong>{selectedPlan.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="font-medium mb-2">Subscription Summary</h3>
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Price:</span>
                  <span className="font-medium">
                    {selectedPlan.id === 'lifetime' 
                      ? `$${selectedPlan.price} (one-time payment)` 
                      : `$${selectedPlan.price}/month`}
                  </span>
                </div>
                {selectedPlan.trialDays && (
                  <div className="flex justify-between">
                    <span>Free trial:</span>
                    <span className="font-medium">{selectedPlan.trialDays} days</span>
                  </div>
                )}
              </div>
            </div>

            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: { 
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#6366f1',
                  }
                }
              }}
            >
              <CheckoutForm planId={planId} />
            </Elements>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Your payment is secure and processed through Stripe. We don't store your card details on our servers.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}