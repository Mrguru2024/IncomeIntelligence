import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Target, TrendingUp, Home, GraduationCap, Car, Plane } from "lucide-react";
import { useState } from "react";

interface SetupGoalsProps {
  formData: {
    savingsGoal: string;
    savingsGoalDate: string;
    [key: string]: any;
  };
  updateFormData: (data: Partial<SetupGoalsProps["formData"]>) => void;
}

const SetupGoals = ({ formData, updateFormData }: SetupGoalsProps) => {
  const [selectedTab, setSelectedTab] = useState("custom");

  const handleGoalSelect = (goal: string, amount: string) => {
    updateFormData({
      savingsGoal: amount,
    });
    setSelectedTab("custom");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Target className="h-6 w-6 mr-2 text-primary" />
          Set Your Financial Goals
        </h2>
        <p className="text-gray-600">
          Define what you're saving for to stay motivated and track your progress.
        </p>
      </div>

      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="common">Common Goals</TabsTrigger>
          <TabsTrigger value="custom">Custom Goal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="common" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <GoalCard
              icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
              title="Emergency Fund"
              amount="$5,000"
              description="3-6 months of expenses"
              onClick={() => handleGoalSelect("Emergency Fund", "5000")}
            />
            <GoalCard
              icon={<Home className="h-5 w-5 text-blue-500" />}
              title="Down Payment"
              amount="$30,000"
              description="Home purchase"
              onClick={() => handleGoalSelect("Down Payment", "30000")}
            />
            <GoalCard
              icon={<GraduationCap className="h-5 w-5 text-indigo-500" />}
              title="Education"
              amount="$10,000"
              description="Professional development"
              onClick={() => handleGoalSelect("Education", "10000")}
            />
            <GoalCard
              icon={<Car className="h-5 w-5 text-purple-500" />}
              title="Vehicle"
              amount="$15,000"
              description="New or used car"
              onClick={() => handleGoalSelect("Vehicle", "15000")}
            />
            <GoalCard
              icon={<Plane className="h-5 w-5 text-cyan-500" />}
              title="Vacation"
              amount="$3,000"
              description="Dream trip"
              onClick={() => handleGoalSelect("Vacation", "3000")}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6 mt-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="savingsGoal">Target amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                id="savingsGoal"
                type="number"
                placeholder="1,000"
                className="pl-7"
                value={formData.savingsGoal}
                onChange={(e) => updateFormData({ savingsGoal: e.target.value })}
              />
            </div>
            <p className="text-sm text-gray-500">
              How much do you aim to save for your goal?
            </p>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="savingsGoalDate">Target date</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="savingsGoalDate"
                type="date"
                className="pl-10"
                value={formData.savingsGoalDate}
                onChange={(e) => updateFormData({ savingsGoalDate: e.target.value })}
              />
            </div>
            <p className="text-sm text-gray-500">
              When do you aim to reach this goal?
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg bg-green-50 p-4 border border-green-100">
        <h3 className="font-medium text-green-800 mb-1">Goal-Setting Tips</h3>
        <p className="text-sm text-green-700 mb-3">
          Setting specific, measurable goals with deadlines increases your chances of success.
          Your goals should be:
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Specific</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Measurable</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Achievable</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Relevant</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Time-bound</Badge>
        </div>
      </div>
    </div>
  );
};

interface GoalCardProps {
  icon: React.ReactNode;
  title: string;
  amount: string;
  description: string;
  onClick: () => void;
}

const GoalCard = ({ icon, title, amount, description, onClick }: GoalCardProps) => (
  <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
    <CardContent className="p-4 flex items-center space-x-4">
      <div className="rounded-full p-2 bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center">
          <span className="text-lg font-bold">{amount}</span>
          <span className="text-xs text-gray-500 ml-2">{description}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SetupGoals;