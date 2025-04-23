import React from "react";
import { CheckCircle2, Calendar, CreditCard, BarChart3, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from 'canvas-confetti';

interface CompleteProps {
  formData: {
    income: string;
    incomeFrequency: string;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    savingsGoal: string;
    savingsGoalDate: string;
    [key: string]: any;
  };
}

const Complete = ({ formData }: CompleteProps) => {
  // Parse and format various data values
  const income = parseFloat(formData.income) || 0;
  const savingsGoal = parseFloat(formData.savingsGoal) || 0;
  
  // Calculate allocated amounts
  const needsAmount = income * (formData.needsPercentage / 100);
  const wantsAmount = income * (formData.wantsPercentage / 100);
  const savingsAmount = income * (formData.savingsPercentage / 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Frequency formatter
  const formatFrequency = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
      default: return freq;
    }
  };
  
  // Calculate monthly savings
  const getMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'monthly': return amount;
      case 'annual': return amount / 12;
      default: return amount;
    }
  };
  
  // Calculate time to reach savings goal
  const calculateTimeToGoal = () => {
    if (!savingsGoal || !savingsAmount) return "N/A";
    
    const monthlySavings = getMonthlyAmount(savingsAmount, formData.incomeFrequency);
    const monthsToGoal = savingsGoal / monthlySavings;
    
    if (monthsToGoal < 1) return "Less than a month";
    if (monthsToGoal === 1) return "About 1 month";
    if (monthsToGoal < 12) return `About ${Math.round(monthsToGoal)} months`;
    
    const years = Math.floor(monthsToGoal / 12);
    const months = Math.round(monthsToGoal % 12);
    
    if (months === 0) return `About ${years} year${years !== 1 ? 's' : ''}`;
    return `About ${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
  };
  
  // Trigger confetti on component mount
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <h2 className="text-xl font-semibold mb-2">Your Financial Plan is Ready!</h2>
        <p className="text-gray-600">
          Here's a summary of your personalized financial setup.
        </p>
      </div>

      <div className="space-y-4">
        <SummaryCard 
          icon={<CreditCard className="h-5 w-5 text-blue-500" />}
          title="Income Details" 
          items={[
            {
              label: 'Amount',
              value: `${formatCurrency(income)} ${formatFrequency(formData.incomeFrequency)}`
            }
          ]} 
        />
        
        <SummaryCard 
          icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
          title="Your Allocations" 
          items={[
            {
              label: 'Needs (40%)',
              value: formatCurrency(needsAmount),
              badge: `${formData.needsPercentage}%`
            },
            {
              label: 'Wants (30%)',
              value: formatCurrency(wantsAmount),
              badge: `${formData.wantsPercentage}%`
            },
            {
              label: 'Savings (30%)',
              value: formatCurrency(savingsAmount),
              badge: `${formData.savingsPercentage}%`
            }
          ]} 
        />
        
        <SummaryCard 
          icon={<PiggyBank className="h-5 w-5 text-violet-500" />}
          title="Savings Goal" 
          items={[
            {
              label: 'Target Amount',
              value: formatCurrency(savingsGoal)
            },
            {
              label: 'Target Date',
              value: formatDate(formData.savingsGoalDate)
            },
            {
              label: 'Estimated Time',
              value: calculateTimeToGoal(),
              badge: savingsAmount > 0 ? "Based on current savings rate" : "Add savings to calculate"
            }
          ]} 
        />
      </div>

      <div className="rounded-lg bg-green-50 p-4 border border-green-100">
        <h3 className="font-medium text-green-800 mb-1">Next Steps</h3>
        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
          <li>Explore your dashboard to track your progress</li>
          <li>Set up automatic transfers to your savings account</li>
          <li>Review your budget categories and adjust as needed</li>
          <li>Connect your bank accounts for automatic income tracking</li>
        </ul>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  items: {
    label: string;
    value: string;
    badge?: string;
  }[];
}

const SummaryCard = ({ icon, title, items }: SummaryCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.badge && (
                <Badge variant="outline" className="h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
              <span className="font-semibold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default Complete;