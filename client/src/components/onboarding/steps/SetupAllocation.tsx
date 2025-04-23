import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PieChartIcon } from "lucide-react";

interface SetupAllocationProps {
  formData: {
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    [key: string]: any;
  };
  updateFormData: (data: Partial<SetupAllocationProps["formData"]>) => void;
}

const SetupAllocation = ({ formData, updateFormData }: SetupAllocationProps) => {
  const [needs, setNeeds] = useState(formData.needsPercentage);
  const [wants, setWants] = useState(formData.wantsPercentage);
  const [savings, setSavings] = useState(formData.savingsPercentage);
  const [total, setTotal] = useState(100);
  const [isBalanced, setIsBalanced] = useState(true);

  // Update the total whenever any of the percentages change
  useEffect(() => {
    const newTotal = needs + wants + savings;
    setTotal(newTotal);
    setIsBalanced(newTotal === 100);
  }, [needs, wants, savings]);

  // Update the parent form data when components change
  useEffect(() => {
    if (isBalanced) {
      updateFormData({
        needsPercentage: needs,
        wantsPercentage: wants,
        savingsPercentage: savings,
      });
    }
  }, [isBalanced, needs, wants, savings, updateFormData]);

  // Adjust percentages to ensure they always sum to 100%
  const adjustPercentages = (
    primaryValue: number,
    secondaryIndex: 0 | 1 | 2,
    tertiaryIndex: 0 | 1 | 2
  ) => {
    const values = [needs, wants, savings];
    values[secondaryIndex] = Math.round((100 - primaryValue) * (values[secondaryIndex] / (values[secondaryIndex] + values[tertiaryIndex])));
    values[tertiaryIndex] = 100 - primaryValue - values[secondaryIndex];
    
    setNeeds(values[0]);
    setWants(values[1]);
    setSavings(values[2]);
  };

  const handleNeedsChange = (value: number[]) => {
    const newNeeds = value[0];
    setNeeds(newNeeds);
    adjustPercentages(newNeeds, 1, 2);
  };

  const handleWantsChange = (value: number[]) => {
    const newWants = value[0];
    setWants(newWants);
    adjustPercentages(newWants, 0, 2);
  };

  const handleSavingsChange = (value: number[]) => {
    const newSavings = value[0];
    setSavings(newSavings);
    adjustPercentages(newSavings, 0, 1);
  };

  const applyDefaultRule = () => {
    setNeeds(40);
    setWants(30);
    setSavings(30);
  };

  const applyAggressiveSavings = () => {
    setNeeds(40);
    setWants(20);
    setSavings(40);
  };

  const applyConservativeSpending = () => {
    setNeeds(50);
    setWants(20);
    setSavings(30);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <PieChartIcon className="h-6 w-6 mr-2 text-primary" />
          Customize Your Allocation
        </h2>
        <p className="text-gray-600">
          The 40/30/30 rule recommends allocating your income to needs, wants, and savings.
          Adjust the sliders below to customize your allocation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={applyDefaultRule}
          className="flex-1 min-w-[120px]"
        >
          Default (40/30/30)
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={applyAggressiveSavings}
          className="flex-1 min-w-[120px]"
        >
          Savings First (40/20/40)
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={applyConservativeSpending}
          className="flex-1 min-w-[120px]"
        >
          Conservative (50/20/30)
        </Button>
      </div>

      <div className="grid gap-6 py-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="needs-slider" className="font-medium">
              Needs (Bills, Groceries, Housing)
            </Label>
            <span className={`font-medium ${isBalanced ? 'text-primary' : 'text-red-500'}`}>
              {needs}%
            </span>
          </div>
          <Slider
            id="needs-slider"
            value={[needs]}
            min={20}
            max={70}
            step={1}
            onValueChange={handleNeedsChange}
            className="mt-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="wants-slider" className="font-medium">
              Wants (Entertainment, Dining, Shopping)
            </Label>
            <span className={`font-medium ${isBalanced ? 'text-primary' : 'text-red-500'}`}>
              {wants}%
            </span>
          </div>
          <Slider
            id="wants-slider"
            value={[wants]}
            min={10}
            max={50}
            step={1}
            onValueChange={handleWantsChange}
            className="mt-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="savings-slider" className="font-medium">
              Savings (Emergency Fund, Investments)
            </Label>
            <span className={`font-medium ${isBalanced ? 'text-primary' : 'text-red-500'}`}>
              {savings}%
            </span>
          </div>
          <Slider
            id="savings-slider"
            value={[savings]}
            min={10}
            max={50}
            step={1}
            onValueChange={handleSavingsChange}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">Total</div>
        <div className={`text-lg font-semibold ${isBalanced ? 'text-primary' : 'text-red-500'}`}>
          {total}%
        </div>
      </div>

      {!isBalanced && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <p className="text-sm text-red-700">
            Your allocation percentages must add up to 100%. Please adjust the sliders.
          </p>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-1">Why this matters</h3>
        <p className="text-sm text-blue-700">
          Allocating your income properly helps you balance your immediate needs with long-term financial goals.
          The 40/30/30 rule is a flexible guideline that you can adjust to your financial situation.
        </p>
      </div>
    </div>
  );
};

export default SetupAllocation;