import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, CheckCheck, Crown, Gift, Sparkles, Star, Trophy, Users } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Link } from "wouter";

// Define types for our subscription data
interface SubscriptionInfo {
  tier: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface DiscountCode {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description: string;
  maxUses?: number;
  currentUses?: number;
  validUntil?: string;
}

interface SubscriptionBenefit {
  title: string;
  description: string;
  icon: React.ReactNode;
  freeTier: boolean;
  proTier: boolean;
  lifetimeTier: boolean;
}

const SubscriptionBenefits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discountCode, setDiscountCode] = useState("");
  const [activeTab, setActiveTab] = useState("benefits");

  // Query to get the user's subscription status
  const { data: subscriptionInfo, isLoading: isSubscriptionLoading } = useQuery<SubscriptionInfo>({
    queryKey: ['/api/users', user?.id, 'subscription'],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await apiRequest("GET", `/api/users/${user.id}/subscription`);
      return res.json();
    },
    enabled: !!user?.id
  });

  // Mutation to validate a discount code
  const validateDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const planId = "pro"; // Assuming "pro" is the ID of the Pro plan
      const res = await apiRequest("GET", `/api/validate-discount/${code}?planId=${planId}`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: "Valid Discount Code",
          description: `${data.code.description} - ${data.code.type === 'percentage' ? data.code.value + '%' : '$' + data.code.value} off`,
          variant: "default",
        });
      } else {
        toast({
          title: "Invalid Discount Code",
          description: data.message || "This discount code is invalid or expired.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error Validating Code",
        description: "There was an error validating your discount code. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Define subscription benefits
  const benefits: SubscriptionBenefit[] = [
    {
      title: "Income Tracking",
      description: "Track your service-based income with custom categories",
      icon: <Check className="h-5 w-5 text-green-500" />,
      freeTier: true,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Expense Tracking",
      description: "Monitor and categorize your business expenses",
      icon: <Check className="h-5 w-5 text-green-500" />,
      freeTier: true,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Goal Setting",
      description: "Set and track financial goals for your business",
      icon: <Check className="h-5 w-5 text-green-500" />,
      freeTier: true,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Stackr Gigs",
      description: "Access to the Stackr gig marketplace",
      icon: <Crown className="h-5 w-5 text-amber-500" />,
      freeTier: false,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Affiliate Programs",
      description: "Join premium affiliate programs for service providers",
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      freeTier: false,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Invoice Generator",
      description: "Create and send professional invoices",
      icon: <Crown className="h-5 w-5 text-amber-500" />,
      freeTier: false,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Used Gear Marketplace",
      description: "Buy and sell used equipment with no fees",
      icon: <Crown className="h-5 w-5 text-amber-500" />,
      freeTier: false,
      proTier: true,
      lifetimeTier: true
    },
    {
      title: "Creative Grant Applications",
      description: "Apply for Stackr creative grants and funding",
      icon: <Gift className="h-5 w-5 text-purple-500" />,
      freeTier: false,
      proTier: false,
      lifetimeTier: true
    },
    {
      title: "Team Access",
      description: "Add team members to your Stackr account",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      freeTier: false,
      proTier: false,
      lifetimeTier: true
    },
    {
      title: "Subscriber Community",
      description: "Access to exclusive Stackr community",
      icon: <Trophy className="h-5 w-5 text-purple-500" />,
      freeTier: false,
      proTier: false,
      lifetimeTier: true
    }
  ];

  const validateDiscountCode = () => {
    if (!discountCode) {
      toast({
        title: "Discount Code Required",
        description: "Please enter a discount code to validate.",
        variant: "destructive",
      });
      return;
    }
    validateDiscountMutation.mutate(discountCode);
  };

  // Determine what plan the user is on
  const userPlan = subscriptionInfo?.tier || "free";
  const isFreePlan = userPlan === "free";
  const isProPlan = userPlan === "pro";
  const isLifetimePlan = userPlan === "lifetime";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Benefits</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Your Subscription
              {isProPlan && <Badge className="ml-2 bg-amber-500">PRO</Badge>}
              {isLifetimePlan && <Badge className="ml-2 bg-purple-600">LIFETIME</Badge>}
            </CardTitle>
            <CardDescription>
              {isFreePlan && "You're currently on the Free tier. Upgrade to access premium features."}
              {isProPlan && "You have access to all Pro features."}
              {isLifetimePlan && "You have lifetime access to all Stackr features."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubscriptionLoading ? (
              <div className="flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Subscription Status</Label>
                  <div className="flex items-center mt-1">
                    {subscriptionInfo?.active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                    )}
                  </div>
                </div>
                
                {subscriptionInfo?.startDate && (
                  <div>
                    <Label>Start Date</Label>
                    <div className="text-sm mt-1">
                      {new Date(subscriptionInfo.startDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {subscriptionInfo?.endDate && (
                  <div>
                    <Label>End Date</Label>
                    <div className="text-sm mt-1">
                      {new Date(subscriptionInfo.endDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {isFreePlan && (
              <Button asChild>
                <Link href="/subscribe-page">Upgrade to Pro</Link>
              </Button>
            )}
            {isProPlan && (
              <Button variant="outline" asChild>
                <Link href="/subscription-page">Manage Subscription</Link>
              </Button>
            )}
            {isLifetimePlan && (
              <div className="text-sm text-green-600 font-medium flex items-center">
                <CheckCheck className="h-4 w-4 mr-1" />
                Lifetime Access
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="benefits">Subscription Benefits</TabsTrigger>
          <TabsTrigger value="discount">Discount Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="benefits" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className={`overflow-hidden ${
                (!benefit.freeTier && isFreePlan) ? "opacity-50" : ""
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    <div className="flex space-x-1">
                      {benefit.freeTier && <Badge variant="outline" className="text-xs">Free</Badge>}
                      {benefit.proTier && <Badge className="bg-amber-500 text-xs">Pro</Badge>}
                      {benefit.lifetimeTier && <Badge className="bg-purple-600 text-xs">Lifetime</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm pt-0">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {benefit.icon}
                    </div>
                    <p>{benefit.description}</p>
                  </div>
                </CardContent>
                {(!benefit.freeTier && isFreePlan) && (
                  <CardFooter className="bg-secondary/50 pt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Requires upgrade
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
          
          {isFreePlan && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/subscribe-page">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="discount" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Discount Codes</CardTitle>
              <CardDescription>
                Enter a discount code to get a reduced price on your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <Button 
                  onClick={validateDiscountCode} 
                  disabled={validateDiscountMutation.isPending}
                >
                  {validateDiscountMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  ) : "Apply"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start">
              <div className="text-sm text-muted-foreground">
                <p>Discount codes can be applied during checkout or can be redeemed here.</p>
                <p className="mt-2">If you received a referral code from another user, you can enter it here.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionBenefits;