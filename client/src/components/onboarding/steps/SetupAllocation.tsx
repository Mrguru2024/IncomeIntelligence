import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Home, Gift, PiggyBank } from "lucide-react";

interface SetupAllocationProps {
  formData: {
    income: string;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    [key: string]: any;
  };
  updateFormData: (data: Partial<SetupAllocationProps["formData"]>) => void;
}

const SetupAllocation = ({ formData, updateFormData }: SetupAllocationProps) => {
  const [needsValue, setNeedsValue] = useState(formData.needsPercentage);
  const [wantsValue, setWantsValue] = useState(formData.wantsPercentage);
  const [savingsValue, setSavingsValue] = useState(formData.savingsPercentage);
  const [total, setTotal] = useState(100);
  const [incomeNumber, setIncomeNumber] = useState(0);

  useEffect(() => {
    // Convert income string to number
    setIncomeNumber(parseFloat(formData.income) || 0);
  }, [formData.income]);

  useEffect(() => {
    // Update total whenever any value changes
    const newTotal = needsValue + wantsValue + savingsValue;
    setTotal(newTotal);
  }, [needsValue, wantsValue, savingsValue]);

  const handleChange = (type: 'needs' | 'wants' | 'savings', value: number) => {
    if (type === 'needs') {
      setNeedsValue(value);
      
      // Adjust other values to maintain total of 100
      const remaining = 100 - value;
      const ratio = remaining / (wantsValue + savingsValue);
      
      setWantsValue(Math.round(wantsValue * ratio));
      setSavingsValue(Math.round(savingsValue * ratio));
    } else if (type === 'wants') {
      setWantsValue(value);
      
      // Adjust other values to maintain total of 100
      const remaining = 100 - value;
      const ratio = remaining / (needsValue + savingsValue);
      
      setNeedsValue(Math.round(needsValue * ratio));
      setSavingsValue(Math.round(savingsValue * ratio));
    } else if (type === 'savings') {
      setSavingsValue(value);
      
      // Adjust other values to maintain total of 100
      const remaining = 100 - value;
      const ratio = remaining / (needsValue + wantsValue);
      
      setNeedsValue(Math.round(needsValue * ratio));
      setWantsValue(Math.round(wantsValue * ratio));
    }
  };

  const applyChanges = () => {
    updateFormData({
      needsPercentage: needsValue,
      wantsPercentage: wantsValue,
      savingsPercentage: savingsValue,
    });
  };

  // Apply default 40/30/30 rule
  const applyDefaultRule = () => {
    setNeedsValue(40);
    setWantsValue(30);
    setSavingsValue(30);
    
    updateFormData({
      needsPercentage: 40,
      wantsPercentage: 30,
      savingsPercentage: 30,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Customize Your Allocations</h2>
        <p className="text-gray-600">
          Adjust the sliders to determine how your income will be allocated across needs, wants, and savings.
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 mb-6">
        <h3 className="font-medium text-blue-800 mb-1">The 40/30/30 Rule</h3>
        <p className="text-sm text-blue-700 mb-2">
          The recommended allocation is 40% for needs, 30% for wants, and 30% for savings. 
          This balanced approach helps ensure financial stability while allowing for enjoyment and growth.
        </p>
        <Button
          variant="outline" 
          size="sm" 
          className="text-blue-700 border-blue-200 hover:bg-blue-100"
          onClick={applyDefaultRule}
        >
          Apply 40/30/30 Rule
        </Button>
      </div>

      <div className="space-y-6">
        <AllocationSlider 
          label="Needs" 
          icon={<Home className="h-5 w-5 text-primary" />} 
          value={needsValue}
          onChange={(value) => handleChange('needs', value)}
          description="Essential expenses like housing, utilities, groceries, and transportation"
          color="bg-primary"
          amount={incomeNumber * (needsValue / 100)}
          frequency={formData.incomeFrequency}
        />

        <AllocationSlider 
          label="Wants" 
          icon={<Gift className="h-5 w-5 text-indigo-500" />} 
          value={wantsValue}
          onChange={(value) => handleChange('wants', value)}
          description="Discretionary spending like entertainment, dining out, and hobbies"
          color="bg-indigo-500"
          amount={incomeNumber * (wantsValue / 100)}
          frequency={formData.incomeFrequency}
        />

        <AllocationSlider 
          label="Savings" 
          icon={<PiggyBank className="h-5 w-5 text-violet-500" />} 
          value={savingsValue}
          onChange={(value) => handleChange('savings', value)}
          description="Future security including emergency fund, investments, and retirement"
          color="bg-violet-500"
          amount={incomeNumber * (savingsValue / 100)}
          frequency={formData.incomeFrequency}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          Total: {total}%
          <span className={total !== 100 ? "text-red-500 ml-2" : "text-green-500 ml-2"}>
            {total !== 100 ? `(Adjust to reach 100%)` : `(Perfect balance!)`}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={applyChanges}
          disabled={total !== 100}
        >
          Apply Changes
        </Button>
      </div>
    </div>
  );
};

interface AllocationSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  description: string;
  color: string;
  amount: number;
  frequency: string;
}

const AllocationSlider = ({ label, icon, value, onChange, description, color, amount, frequency }: AllocationSliderProps) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-2">{icon}</div>
          <Label className="text-base font-medium">{label}</Label>
        </div>
        <div className="flex items-center">
          <span className="text-xl font-bold">{value}%</span>
          <span className="ml-2 text-sm text-gray-500">
            ({formatAmount(amount)}/{frequency})
          </span>
        </div>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={5}
        max={80}
        step={5}
        className={color}
      />
      
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default SetupAllocation;