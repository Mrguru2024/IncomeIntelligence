import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SetupGoalsProps {
  formData: {
    savingsGoal: string;
    savingsGoalDate: string;
    [key: string]: any;
  };
  updateFormData: (data: Partial<SetupGoalsProps["formData"]>) => void;
}

const SetupGoals = ({ formData, updateFormData }: SetupGoalsProps) => {
  const presetGoals = [
    { name: "Emergency Fund", amount: "5000" },
    { name: "Home Down Payment", amount: "25000" },
    { name: "Vacation", amount: "3000" },
    { name: "New Car", amount: "15000" },
    { name: "Debt Payoff", amount: "10000" },
  ];

  const applyPresetGoal = (amount: string) => {
    updateFormData({ savingsGoal: amount });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Target className="h-6 w-6 mr-2 text-primary" />
          Set Your Financial Goals
        </h2>
        <p className="text-gray-600">
          Define clear financial goals to help you stay motivated and track your progress.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg bg-white p-4 border border-gray-100 shadow-sm">
          <div className="grid gap-3">
            <div>
              <Label htmlFor="savingsGoal">Savings Goal Amount</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input
                  id="savingsGoal"
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.savingsGoal}
                  onChange={(e) => updateFormData({ savingsGoal: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="goalDate">Target Completion Date</Label>
              <div className="mt-1">
                <Input 
                  id="goalDate"
                  type="date"
                  value={formData.savingsGoalDate}
                  onChange={(e) => updateFormData({ savingsGoalDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Common Financial Goals</Label>
          <div className="flex flex-wrap gap-2">
            {presetGoals.map((goal) => (
              <Button
                key={goal.name}
                size="sm"
                variant="outline"
                onClick={() => applyPresetGoal(goal.amount)}
                className="flex-grow-0"
              >
                {goal.name} (${parseInt(goal.amount).toLocaleString()})
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Goal Timeframe</Label>
          <Select 
            onValueChange={(value) => {
              // Calculate a date based on the selected timeframe
              const today = new Date();
              let targetDate = new Date(today);
              
              switch (value) {
                case "6-months":
                  targetDate.setMonth(today.getMonth() + 6);
                  break;
                case "1-year":
                  targetDate.setFullYear(today.getFullYear() + 1);
                  break;
                case "3-years":
                  targetDate.setFullYear(today.getFullYear() + 3);
                  break;
                case "5-years":
                  targetDate.setFullYear(today.getFullYear() + 5);
                  break;
              }
              
              updateFormData({ 
                savingsGoalDate: targetDate.toISOString().split('T')[0] 
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6-months">Short Term (6 months)</SelectItem>
              <SelectItem value="1-year">Medium Term (1 year)</SelectItem>
              <SelectItem value="3-years">Long Term (3 years)</SelectItem>
              <SelectItem value="5-years">Future Planning (5+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-1">Why this matters</h3>
        <p className="text-sm text-blue-700">
          Setting specific financial goals with deadlines creates accountability and purpose for your savings.
          Research shows that people with written financial goals are more likely to achieve them.
        </p>
      </div>
    </div>
  );
};

export default SetupGoals;