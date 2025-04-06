import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ArrowRight, Briefcase, Link, UserPlus, Smartphone, Target, TrendingUp, Package, FileText, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Income Hub Page - Central location for all income generation features
const IncomeHub = () => {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is on Pro subscription
  const isPro = user?.subscriptionTier === "pro" || user?.subscriptionTier === "lifetime";
  
  // Fetch income data
  const { data: incomeData, isLoading: isLoadingIncome } = useQuery({
    queryKey: ["/api/income/total"],
    enabled: !!user,
  });

  // Placeholder until implemented in backend
  const totalMonthlyIncome = incomeData?.total || 0;
  const incomeGoal = 1000; // $1,000 monthly income goal
  const percentCompleted = Math.min(100, Math.round((totalMonthlyIncome / incomeGoal) * 100));

  const incomeFeatures = [
    {
      id: "stackr-gigs",
      name: "Stackr Gigs",
      description: "Find quick remote tasks & micro-income opportunities",
      icon: <Briefcase className="h-8 w-8 text-blue-500" />,
      route: "/income/gigs",
      proRequired: false,
      badge: "Popular"
    },
    {
      id: "affiliate-hub",
      name: "Affiliate Program Hub",
      description: "AI-recommended passive income affiliate opportunities",
      icon: <Link className="h-8 w-8 text-pink-500" />,
      route: "/income/affiliates",
      proRequired: false,
      badge: null
    },
    {
      id: "referral-system",
      name: "Referral System",
      description: "Earn by referring friends to Stackr Pro and partner apps",
      icon: <UserPlus className="h-8 w-8 text-violet-500" />,
      route: "/income/referrals",
      proRequired: false,
      badge: "Easy Money"
    },
    {
      id: "digital-services",
      name: "Stackr Services",
      description: "Sell your digital products, templates, and skills",
      icon: <Smartphone className="h-8 w-8 text-cyan-500" />,
      route: "/income/services",
      proRequired: false,
      badge: null
    },
    {
      id: "money-challenges",
      name: "Daily Money Challenges",
      description: "Complete short money tasks for rewards and income",
      icon: <Target className="h-8 w-8 text-rose-500" />,
      route: "/income/challenges",
      proRequired: true,
      badge: "Pro Feature"
    },
    {
      id: "investment-wizard",
      name: "Invest-to-Earn Wizard",
      description: "Personalized investment strategies to generate income",
      icon: <TrendingUp className="h-8 w-8 text-lime-500" />,
      route: "/income/investments",
      proRequired: true,
      badge: "Pro Feature"
    },
    {
      id: "used-gear",
      name: "Used Gear / Local Listings",
      description: "Sell your gear, tools, and unused equipment",
      icon: <Package className="h-8 w-8 text-orange-500" />,
      route: "/income/gear",
      proRequired: false,
      badge: null
    },
    {
      id: "invoice-builder",
      name: "Invoice Builder",
      description: "Create, send, and track payment for professional invoices",
      icon: <FileText className="h-8 w-8 text-sky-500" />,
      route: "/income/invoices",
      proRequired: false,
      badge: null
    },
    {
      id: "creative-grants",
      name: "Stackr Creative Grants",
      description: "Apply for grants, contests, and financial rewards",
      icon: <Award className="h-8 w-8 text-emerald-500" />,
      route: "/income/grants",
      proRequired: true,
      badge: "Pro Feature"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income Hub</h1>
          <p className="text-muted-foreground">Generate extra income with the 40/30/30 method</p>
        </div>
        <Button onClick={() => setLocation("/income/new")} className="gap-2">
          <Plus size={16} />
          Log New Income
        </Button>
      </div>

      {/* Income Progress Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-xl">Income Goal Progress</CardTitle>
          <CardDescription>Track your progress toward $1,000 monthly income</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingIncome ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">${totalMonthlyIncome.toFixed(2)} / ${incomeGoal}</span>
                <span className="text-sm text-muted-foreground">{percentCompleted}% Complete</span>
              </div>
              
              {/* Progress bar */}
              <div className="h-3 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${percentCompleted}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setLocation("/income/history")}>
            View Income History
          </Button>
        </CardFooter>
      </Card>

      {/* Income Generation Features */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-[400px] w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="free">Free Features</TabsTrigger>
          <TabsTrigger value="pro">Pro Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {incomeFeatures.map((feature) => (
              <Card key={feature.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  {feature.badge && (
                    <Badge className="w-fit mb-2" variant={feature.badge === "Pro Feature" ? "default" : "outline"}>
                      {feature.badge}
                    </Badge>
                  )}
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{feature.name}</CardTitle>
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    disabled={feature.proRequired && !isPro}
                    onClick={() => setLocation(feature.route)}
                  >
                    {feature.proRequired && !isPro ? 'Requires Pro Subscription' : 'Explore'}
                    <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="free" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {incomeFeatures
              .filter(f => !f.proRequired)
              .map((feature) => (
                <Card key={feature.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    {feature.badge && (
                      <Badge className="w-fit mb-2" variant="outline">
                        {feature.badge}
                      </Badge>
                    )}
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{feature.name}</CardTitle>
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between"
                      onClick={() => setLocation(feature.route)}
                    >
                      Explore
                      <ArrowRight size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pro" className="space-y-6">
          {!isPro ? (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-100 dark:border-purple-900">
              <CardHeader>
                <CardTitle>Unlock Pro Income Features</CardTitle>
                <CardDescription>Upgrade to Stackr Pro to access premium income generation tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>With Stackr Pro, you'll unlock:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Daily Money Challenges with rewards</li>
                  <li>Invest-to-Earn Strategy Wizard</li>
                  <li>Stackr Creative Grants program</li>
                  <li>Advanced AI-powered income suggestions</li>
                  <li>Exclusive income opportunities</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setLocation("/subscribe")} className="w-full">
                  Upgrade to Pro
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {incomeFeatures
                .filter(f => f.proRequired)
                .map((feature) => (
                  <Card key={feature.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Badge className="w-fit mb-2">
                        Pro Feature
                      </Badge>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{feature.name}</CardTitle>
                        {feature.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between"
                        onClick={() => setLocation(feature.route)}
                      >
                        Explore
                        <ArrowRight size={16} />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncomeHub;