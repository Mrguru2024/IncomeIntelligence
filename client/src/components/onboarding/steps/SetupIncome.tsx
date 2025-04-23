import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IncomeSource, DollarSign } from "lucide-react";

interface SetupIncomeProps {
  formData: {
    income: string;
    incomeFrequency: string;
    [key: string]: any;
  };
  updateFormData: (data: Partial<SetupIncomeProps["formData"]>) => void;
}

const SetupIncome = ({ formData, updateFormData }: SetupIncomeProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-primary" />
          Setup Your Income
        </h2>
        <p className="text-gray-600">
          Enter your income details to help us calculate your optimal financial allocations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="income">Your income amount</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              id="income"
              type="number"
              placeholder="0.00"
              className="pl-7"
              value={formData.income}
              onChange={(e) => updateFormData({ income: e.target.value })}
            />
          </div>
          <p className="text-sm text-gray-500">
            Enter your take-home pay (after taxes and deductions)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Income frequency</Label>
          <RadioGroup
            value={formData.incomeFrequency}
            onValueChange={(value) => updateFormData({ incomeFrequency: value })}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="biweekly" id="biweekly" />
              <Label htmlFor="biweekly" className="cursor-pointer">Bi-weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="annual" id="annual" />
              <Label htmlFor="annual" className="cursor-pointer">Annual</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-1">Why this matters</h3>
        <p className="text-sm text-blue-700">
          Accurately tracking your income is the foundation of financial planning. This helps 
          us calculate your allocation percentages correctly and provide personalized recommendations.
        </p>
      </div>
    </div>
  );
};

export default SetupIncome;