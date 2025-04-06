import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PricingPage = () => {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(false);
  
  const isPro = user?.subscriptionTier === "pro" || user?.subscriptionTier === "lifetime";
  const isLifetime = user?.subscriptionTier === "lifetime";

  const freeFeatures = [
    "Manual 40/30/30 income split",
    "Basic budget tracking",
    "Transaction logs",
    "Voice logging (10 entries/month)",
    "Income & expense tracking",
    "2 smart rules maximum",
    "Stackr Gigs marketplace access",
    "Referral system (basic)",
    "Used gear listings (3 max)",
    "Basic invoice builder"
  ];

  const proFeatures = [
    "Everything in Free, plus:",
    "Unlimited smart rules engine",
    "Subscription sniper auto-cancel",
    "Financial coach AI chatbot",
    "Advanced analytics & insights",
    "Unlimited voice tracking",
    "Daily money challenges with rewards",
    "Invest-to-Earn strategy wizard",
    "Stackr Creative Grants access",
    "Priority support",
    "Stackr roadmap input",
    "Export & backup features",
    "Unlocked affiliate program hub",
    "Unlimited used gear listings",
    "Pro invoice builder with templates"
  ];

  const lifetimeFeatures = [
    "Everything in Pro, plus:",
    "One-time payment, lifetime access",
    "No monthly/annual fees ever",
    "Priority for new features",
    "Early access to beta features",
    "Support Stackr's development"
  ];

  // Calculate prices based on annual vs monthly
  const monthlyPrice = 8.99;
  const annualPrice = 79.99;
  const lifetimePrice = 99.99;
  
  const currentPrice = annualBilling ? annualPrice : monthlyPrice;
  const monthlySavings = annualBilling 
    ? Math.round((monthlyPrice * 12 - annualPrice) / 12 * 100) / 100
    : 0;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that works best for your financial journey
        </p>
        
        {/* Monthly/Annual Toggle */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <span className={!annualBilling ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </span>
          <Switch 
            checked={annualBilling} 
            onCheckedChange={setAnnualBilling} 
            className="data-[state=checked]:bg-green-600"
          />
          <div className="flex items-center">
            <span className={annualBilling ? "font-medium" : "text-muted-foreground"}>
              Annual
            </span>
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800">
              Save 26%
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Tier */}
        <Card className="border-muted relative">
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <CardDescription>Get started with Stackr basics</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground ml-1">forever</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2.5">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check size={18} className="text-green-500 shrink-0 mt-0.5 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col">
            {user ? (
              <Button 
                variant={isPro ? "outline" : "default"} 
                className="w-full"
                disabled={true}
              >
                Current Plan
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/auth")}
              >
                Get Started Free
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Tier */}
        <Card className="border-primary relative md:scale-105 shadow-md">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <Badge className="bg-primary hover:bg-primary-focus">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Stackr Pro</CardTitle>
            <CardDescription>Unlock all premium features</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">${annualBilling ? (annualPrice / 12).toFixed(2) : monthlyPrice}</span>
              <span className="text-muted-foreground ml-1">
                / month
              </span>
              {annualBilling && (
                <div className="text-sm text-muted-foreground mt-1">
                  Billed ${annualPrice} annually
                </div>
              )}
              {annualBilling && (
                <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                  Save ${monthlySavings}/month
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2.5">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check size={18} className="text-green-500 shrink-0 mt-0.5 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {!user ? (
              <Button 
                className="w-full"
                onClick={() => setLocation("/auth?redirect=/subscribe")}
              >
                Sign Up for Pro
              </Button>
            ) : isPro && !isLifetime ? (
              <Button 
                variant="outline" 
                className="w-full"
                disabled={true}
              >
                Current Plan
              </Button>
            ) : !isPro ? (
              <Button 
                className="w-full"
                onClick={() => setLocation("/subscribe")}
              >
                Upgrade to Pro
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="w-full"
                disabled={true}
              >
                Included in Lifetime
              </Button>
            )}
            <div className="text-center text-sm text-muted-foreground">
              14-day money-back guarantee
            </div>
          </CardFooter>
        </Card>

        {/* Lifetime Tier */}
        <Card className="border-muted relative">
          <CardHeader>
            <CardTitle className="text-xl">Lifetime Pass</CardTitle>
            <CardDescription>One-time payment, forever access</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">${lifetimePrice}</span>
              <span className="text-muted-foreground ml-1">one-time</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2.5">
              {lifetimeFeatures.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Star size={18} className="text-amber-500 shrink-0 mt-0.5 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {!user ? (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/auth?redirect=/subscribe?plan=lifetime")}
              >
                Get Lifetime Access
              </Button>
            ) : isLifetime ? (
              <Button 
                variant="outline" 
                className="w-full"
                disabled={true}
              >
                Current Plan
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/subscribe?plan=lifetime")}
              >
                Upgrade to Lifetime
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">What's included in the free tier?</h3>
            <p className="text-muted-foreground">
              The free tier includes the core functionality of Stackr: manual 40/30/30 income splits, basic budget tracking, 
              transaction logs, and access to the marketplace. It's perfect for getting started and testing the app.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Can I upgrade or downgrade my plan later?</h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade from Free to Pro, or from Pro to Lifetime at any time. You can also downgrade from 
              Pro to Free at the end of your billing cycle. Lifetime access never expires.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Is my payment information secure?</h3>
            <p className="text-muted-foreground">
              Absolutely. We use Stripe for payment processing, which maintains the highest level of security standards. 
              We never store your credit card information on our servers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">What's the refund policy?</h3>
            <p className="text-muted-foreground">
              We offer a 14-day money-back guarantee for Pro subscriptions. If you're not satisfied with Stackr Pro, 
              contact us within 14 days of your purchase for a full refund. Lifetime purchases are non-refundable after 14 days.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Still have questions about our pricing or features?</p>
          <Button variant="outline" onClick={() => setLocation("/support")}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;