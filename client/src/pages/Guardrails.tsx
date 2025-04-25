import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeDollarSign, Bell, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the category types and interfaces
type SpendingCategory = 
  | "housing" 
  | "food" 
  | "transportation" 
  | "utilities" 
  | "entertainment" 
  | "shopping" 
  | "health" 
  | "personal" 
  | "education" 
  | "other";

type LimitPeriod = "weekly" | "monthly";

interface SpendingLimit {
  id: string;
  category: SpendingCategory;
  amount: number;
  period: LimitPeriod;
  notifyAtPercent: number;
  enabled: boolean;
}

// Category configuration with icons and display names
const categoryConfig = {
  housing: { 
    name: "Housing", 
    icon: <BadgeDollarSign className="h-5 w-5 text-blue-500" />,
    color: "border-blue-500" 
  },
  food: { 
    name: "Food & Dining", 
    icon: <BadgeDollarSign className="h-5 w-5 text-green-500" />,
    color: "border-green-500" 
  },
  transportation: { 
    name: "Transportation", 
    icon: <BadgeDollarSign className="h-5 w-5 text-yellow-500" />,
    color: "border-yellow-500" 
  },
  utilities: { 
    name: "Utilities", 
    icon: <BadgeDollarSign className="h-5 w-5 text-purple-500" />,
    color: "border-purple-500" 
  },
  entertainment: { 
    name: "Entertainment", 
    icon: <BadgeDollarSign className="h-5 w-5 text-pink-500" />,
    color: "border-pink-500" 
  },
  shopping: { 
    name: "Shopping", 
    icon: <BadgeDollarSign className="h-5 w-5 text-indigo-500" />,
    color: "border-indigo-500" 
  },
  health: { 
    name: "Health & Medical", 
    icon: <BadgeDollarSign className="h-5 w-5 text-red-500" />,
    color: "border-red-500" 
  },
  personal: { 
    name: "Personal", 
    icon: <BadgeDollarSign className="h-5 w-5 text-teal-500" />,
    color: "border-teal-500" 
  },
  education: { 
    name: "Education", 
    icon: <BadgeDollarSign className="h-5 w-5 text-orange-500" />,
    color: "border-orange-500" 
  },
  other: { 
    name: "Other", 
    icon: <BadgeDollarSign className="h-5 w-5 text-gray-500" />,
    color: "border-gray-500" 
  }
};

const GuardrailsPage = () => {
  // Mock data for the spending limits
  const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([
    {
      id: "1",
      category: "food",
      amount: 300,
      period: "monthly",
      notifyAtPercent: 75,
      enabled: true
    },
    {
      id: "2",
      category: "entertainment",
      amount: 100,
      period: "monthly",
      notifyAtPercent: 90,
      enabled: true
    }
  ]);

  const [newLimit, setNewLimit] = useState<Omit<SpendingLimit, "id">>({
    category: "food",
    amount: 200,
    period: "monthly",
    notifyAtPercent: 80,
    enabled: true
  });

  const { toast } = useToast();

  const handleAddLimit = () => {
    const id = Math.random().toString(36).substring(2, 9);
    setSpendingLimits([...spendingLimits, { ...newLimit, id }]);
    
    toast({
      title: "Spending limit added",
      description: `New limit for ${categoryConfig[newLimit.category].name} has been created.`,
    });
    
    // Reset form for next entry
    setNewLimit({
      category: "food",
      amount: 200,
      period: "monthly",
      notifyAtPercent: 80,
      enabled: true
    });
  };

  const handleDeleteLimit = (id: string) => {
    const updatedLimits = spendingLimits.filter(limit => limit.id !== id);
    setSpendingLimits(updatedLimits);
    
    toast({
      title: "Spending limit removed",
      description: "The spending limit has been deleted.",
    });
  };

  const handleToggleLimit = (id: string) => {
    const updatedLimits = spendingLimits.map(limit => {
      if (limit.id === id) {
        return { ...limit, enabled: !limit.enabled };
      }
      return limit;
    });
    setSpendingLimits(updatedLimits);
    
    const limit = spendingLimits.find(l => l.id === id);
    if (limit) {
      toast({
        title: limit.enabled ? "Limit disabled" : "Limit enabled",
        description: `${categoryConfig[limit.category].name} spending limit has been ${limit.enabled ? "disabled" : "enabled"}.`,
      });
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold mb-1 flex items-center">
          <Shield className="h-8 w-8 mr-2 text-primary" />
          Stackr Guardrails
        </h1>
        <p className="text-muted-foreground mb-6">
          Set weekly or monthly spending limits by category and get alerted before you overspend.
        </p>
      </div>

      {/* Current Spending Limits */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Spending Limits</h2>
        
        {spendingLimits.length === 0 ? (
          <Alert>
            <AlertTitle>No spending limits set</AlertTitle>
            <AlertDescription>
              You haven't set any spending limits yet. Create your first one below.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {spendingLimits.map((limit) => (
              <Card 
                key={limit.id} 
                className={`border-l-4 ${categoryConfig[limit.category].color} ${!limit.enabled ? "opacity-70" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {categoryConfig[limit.category].icon}
                      <CardTitle className="ml-2">{categoryConfig[limit.category].name}</CardTitle>
                    </div>
                    <Switch 
                      checked={limit.enabled} 
                      onCheckedChange={() => handleToggleLimit(limit.id)} 
                    />
                  </div>
                  <CardDescription>
                    {limit.period === "weekly" ? "Weekly" : "Monthly"} spending limit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Limit Amount</span>
                      <span className="text-xl font-semibold">${limit.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Alert Threshold</span>
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-1 text-amber-500" />
                        <span>{limit.notifyAtPercent}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto text-destructive" 
                    onClick={() => handleDeleteLimit(limit.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Spending Limit */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Spending Limit</CardTitle>
          <CardDescription>
            Set up a new category-based spending limit to help track and control your expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Expense Category</Label>
                <Select 
                  value={newLimit.category} 
                  onValueChange={(value: SpendingCategory) => 
                    setNewLimit({...newLimit, category: value})
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select 
                  value={newLimit.period}
                  onValueChange={(value: LimitPeriod) => 
                    setNewLimit({...newLimit, period: value})
                  }
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Spending Limit Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                min="1"
                value={newLimit.amount} 
                onChange={(e) => setNewLimit({...newLimit, amount: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="alert-threshold">Alert Threshold ({newLimit.notifyAtPercent}%)</Label>
                <span className="text-sm text-muted-foreground">
                  Alert when spending reaches ${(newLimit.amount * newLimit.notifyAtPercent / 100).toFixed(2)}
                </span>
              </div>
              <Slider 
                id="alert-threshold"
                min={10} 
                max={100} 
                step={5} 
                value={[newLimit.notifyAtPercent]} 
                onValueChange={(value) => setNewLimit({...newLimit, notifyAtPercent: value[0]})}
              />
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive notifications when your spending reaches this percentage of your limit.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddLimit} className="ml-auto">Add Spending Limit</Button>
        </CardFooter>
      </Card>

      {/* Guardrails Information */}
      <Alert className="bg-background">
        <Shield className="h-5 w-5 text-primary" />
        <AlertTitle>About Stackr Guardrails</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Guardrails help you stay on track with your financial goals by preventing overspending in specific categories.
          </p>
          <p>
            When you approach or exceed your set limits, Stackr will notify you to help keep your spending in check.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GuardrailsPage;