import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface CompleteProps {
  formData: {
    income: string;
    incomeFrequency: string;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    savingsGoal: string;
    savingsGoalDate: string;
  };
}

const Complete = ({ formData }: CompleteProps) => {
  // Calculate monthly values
  const getMonthlyIncome = () => {
    if (!formData.income || isNaN(Number(formData.income))) return 0;
    
    const income = Number(formData.income);
    switch (formData.incomeFrequency) {
      case "weekly":
        return (income * 52) / 12;
      case "biweekly":
        return (income * 26) / 12;
      case "monthly":
        return income;
      case "annual":
        return income / 12;
      default:
        return income;
    }
  };

  const monthlyIncome = getMonthlyIncome();
  const monthlyNeeds = (monthlyIncome * formData.needsPercentage) / 100;
  const monthlyWants = (monthlyIncome * formData.wantsPercentage) / 100;
  const monthlySavings = (monthlyIncome * formData.savingsPercentage) / 100;

  // Trigger confetti effect on component mount
  useEffect(() => {
    const triggerConfetti = () => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    };

    // Trigger confetti with a slight delay for better visual effect
    const timer = setTimeout(() => {
      triggerConfetti();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          You're All Set!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Your financial dashboard is ready to go. Here's a summary of your financial plan:
        </p>
      </div>

      <div className="rounded-lg bg-white border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <h3 className="font-semibold text-lg">Monthly Allocation</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Income:</span>
            <span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Needs ({formData.needsPercentage}%):</span>
            <span className="font-semibold">{formatCurrency(monthlyNeeds)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Wants ({formData.wantsPercentage}%):</span>
            <span className="font-semibold">{formatCurrency(monthlyWants)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Savings ({formData.savingsPercentage}%):</span>
            <span className="font-semibold">{formatCurrency(monthlySavings)}</span>
          </div>
        </div>
      </div>

      {formData.savingsGoal && (
        <div className="rounded-lg bg-white border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
            <h3 className="font-semibold text-lg">Savings Goal</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Target Amount:</span>
              <span className="font-semibold">{formatCurrency(Number(formData.savingsGoal))}</span>
            </div>
            {formData.savingsGoalDate && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Target Date:</span>
                <span className="font-semibold">
                  {new Date(formData.savingsGoalDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {formData.savingsGoalDate && monthlySavings > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Time to Goal:</span>
                <span className="font-semibold">
                  {Math.ceil(Number(formData.savingsGoal) / monthlySavings)} months
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-1">What's Next?</h3>
        <p className="text-sm text-blue-700">
          Your dashboard is now personalized based on your financial preferences.
          Explore the dashboard features, set up bank connections, and track your spending.
        </p>
      </div>
    </div>
  );
};

export default Complete;