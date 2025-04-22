import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Lightbulb,
  TrendingUp,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface SpendingPattern {
  category: string;
  amount: number;
  trend: "up" | "down" | "stable";
}

export default function CashFlowCoach() {
  const [isCoachMode, setIsCoachMode] = useState(false);

  // Example spending patterns - in a real app, this would come from your backend
  const spendingPatterns: SpendingPattern[] = [
    { category: "Restaurants", amount: 450, trend: "up" },
    { category: "Groceries", amount: 380, trend: "down" },
    { category: "Entertainment", amount: 200, trend: "stable" },
  ];

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cash Flow Coach</CardTitle>
            <CardDescription>
              Smart insights to optimize your money flow
            </CardDescription>
          </div>
          <Button
            variant={isCoachMode ? "default" : "outline"}
            onClick={() => setIsCoachMode(!isCoachMode)}
          >
            {isCoachMode ? "Coaching Active" : "Start Coaching"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCoachMode && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Active Recommendations</AlertTitle>
            <AlertDescription>
              Based on your spending patterns, here are some optimization
              opportunities.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Spending Patterns
            </h4>
            {spendingPatterns.map((pattern, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{pattern.category}</span>
                  <span
                    className={`text-sm font-medium ${getTrendColor(pattern.trend)}`}
                  >
                    {formatCurrency(pattern.amount)}
                  </span>
                </div>
                <Progress value={pattern.amount / 10} className="h-1" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Savings Opportunities
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                  Reduce restaurant spending by 20%
                </div>
                <div>Potential monthly savings: {formatCurrency(90)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Get Personalized Tips
              </Button>
              <Button className="w-full" variant="outline">
                Schedule Review
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
