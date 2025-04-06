import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Stripe } from "@stripe/stripe-js";

// Ensure stripe is initialized only once
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirect to dashboard after successful payment
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description:
          "An unexpected error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
        variant="default"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  );
};

const SubscribePage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      navigate("/auth");
      return;
    }

    // Check if user already has active subscription
    if (user && user.subscriptionActive && user.subscriptionTier === "pro") {
      toast({
        title: "Already Subscribed",
        description: "You already have an active Stackr Pro subscription.",
      });
      navigate("/dashboard");
      return;
    }

    const getSubscription = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/create-subscription");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to start subscription process",
          );
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError("Unable to initialize payment. Please try again later.");
        }
      } catch (err) {
        setError("Error initializing subscription. Please try again later.");
        console.error("Subscription error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getSubscription();
  }, [user, navigate, toast]);

  const pricingFeatures = [
    { name: "Custom 40/30/30 Income Split", free: true, pro: true },
    { name: "AI Financial Assistant", free: false, pro: true },
    { name: "Voice Commands", free: false, pro: true },
    { name: "Bank Account Integration", free: false, pro: true },
    { name: "Expense Analytics", free: true, pro: true },
    { name: "Goal Setting", free: true, pro: true },
    { name: "Gamified Experience", free: true, pro: true },
    { name: "Automated Savings Rules", free: false, pro: true },
    { name: "Export Reports", free: false, pro: true },
    { name: "Unlimited Expense Categories", free: false, pro: true },
    { name: "Income Opportunity Recommendations", free: false, pro: true },
    { name: "Offline Access", free: false, pro: true },
  ];

  if (isLoading && !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">
          Preparing your subscription...
        </h2>
        <p className="text-muted-foreground">This will only take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Subscription Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/dashboard")} className="mt-6">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Upgrade to Stackr Pro
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Take control of your finances with advanced features designed
          specifically for service providers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <div className="text-3xl font-bold">
              $0
              <span className="text-muted-foreground text-sm font-normal">
                /month
              </span>
            </div>
            <CardDescription>
              Basic income tracking with manual splits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                {feature.free ? (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-gray-300 mr-2" />
                )}
                <span className={!feature.free ? "text-muted-foreground" : ""}>
                  {feature.name}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
            Recommended
          </div>
          <CardHeader>
            <CardTitle>Stackr Pro</CardTitle>
            <div className="text-3xl font-bold">
              $9.99
              <span className="text-muted-foreground text-sm font-normal">
                /month
              </span>
            </div>
            <CardDescription>
              Advanced features for financial growth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                {feature.pro ? (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-gray-300 mr-2" />
                )}
                <span
                  className={
                    feature.pro ? "font-medium" : "text-muted-foreground"
                  }
                >
                  {feature.name}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Cancel anytime - No long-term commitment
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>
              Your card will be charged $9.99 monthly. You can cancel anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!stripePromise ? (
              <div className="flex justify-center py-4">
                <p className="text-red-500">Failed to load payment system. Please refresh the page.</p>
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  loader: "auto",
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#6366f1",
                    },
                  },
                }}
              >
                <SubscribeForm />
              </Elements>
            ) : (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By subscribing, you agree to our Terms of Service and Privacy
            Policy.
          </p>
          <p className="mt-2">Questions? Contact support@stackr.finance</p>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;