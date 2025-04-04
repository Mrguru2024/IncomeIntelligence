import { useState, useEffect } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Income } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useIncomeStore } from '@/hooks/useIncomeStore';

export default function IncomeBreakdown() {
  // Get percentage settings from the store
  const { 
    needsPercentage, 
    investmentsPercentage, 
    savingsPercentage 
  } = useIncomeStore();

  // Get form data for real-time updates during form input
  const formContext = useFormContext();
  const formAmount = formContext ? useWatch({ control: formContext.control, name: 'amount' }) : "0";
  
  // Get actual income data from API
  const { data: incomes } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });

  const [breakdown, setBreakdown] = useState({
    needs: 0,
    investments: 0,
    savings: 0
  });

  useEffect(() => {
    // Handle both string and number amount values from the form
    const formNumAmount = typeof formAmount === 'string' ? parseFloat(formAmount) || 0 : formAmount || 0;
    
    // Also calculate total from actual income if available
    let totalIncomeAmount = 0;
    if (incomes && incomes.length > 0) {
      // Sum up all income amounts
      totalIncomeAmount = incomes.reduce((sum, income) => {
        return sum + (typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount);
      }, 0);
    }
    
    // Use the form amount for preview when typing, otherwise use real data total
    const amountToUse = formNumAmount > 0 ? formNumAmount : totalIncomeAmount;
    
    // Use the custom percentages from the store
    setBreakdown({
      needs: amountToUse * (needsPercentage / 100),
      investments: amountToUse * (investmentsPercentage / 100),
      savings: amountToUse * (savingsPercentage / 100)
    });
  }, [formAmount, incomes, needsPercentage, investmentsPercentage, savingsPercentage]);

  // Always show proportional data even when no actual values
  const chartData = breakdown.needs > 0 || breakdown.investments > 0 || breakdown.savings > 0 
    ? [
        { name: `Needs (${needsPercentage}%)`, value: breakdown.needs },
        { name: `Investments (${investmentsPercentage}%)`, value: breakdown.investments },
        { name: `Savings (${savingsPercentage}%)`, value: breakdown.savings }
      ]
    : [
        { name: `Needs (${needsPercentage}%)`, value: needsPercentage },
        { name: `Investments (${investmentsPercentage}%)`, value: investmentsPercentage },
        { name: `Savings (${savingsPercentage}%)`, value: savingsPercentage }
      ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981'];

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Income Breakdown</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          {breakdown.needs > 0 || breakdown.investments > 0 || breakdown.savings > 0 
            ? `Total income: ${formatCurrency(breakdown.needs + breakdown.investments + breakdown.savings)}`
            : `Add income to see your ${needsPercentage}/${investmentsPercentage}/${savingsPercentage} breakdown`}
        </p>
        <div className="flex flex-col h-full">
          <div className="mb-3 sm:mb-4 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="70%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Needs</span>
                <span className="bg-primary text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{needsPercentage}%</span>
              </div>
              <div className="text-base sm:text-xl font-semibold text-gray-800">{formatCurrency(breakdown.needs)}</div>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Daily expenses, rent, bills</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Investments</span>
                <span className="bg-purple-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{investmentsPercentage}%</span>
              </div>
              <div className="text-base sm:text-xl font-semibold text-gray-800">{formatCurrency(breakdown.investments)}</div>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Long-term growth, business</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Savings</span>
                <span className="bg-green-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{savingsPercentage}%</span>
              </div>
              <div className="text-base sm:text-xl font-semibold text-gray-800">{formatCurrency(breakdown.savings)}</div>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Emergency fund, future goals</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
