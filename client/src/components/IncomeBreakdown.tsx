import { useState, useEffect, useRef } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function IncomeBreakdown() {
  const formContext = useFormContext();
  const amount = formContext ? useWatch({ control: formContext.control, name: 'amount' }) : "0";
  
  const [breakdown, setBreakdown] = useState({
    needs: 0,
    investments: 0,
    savings: 0
  });

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setBreakdown({
      needs: numAmount * 0.4,
      investments: numAmount * 0.3,
      savings: numAmount * 0.3
    });
  }, [amount]);

  const chartData = [
    { name: 'Needs (40%)', value: breakdown.needs > 0 ? breakdown.needs : 40 },
    { name: 'Investments (30%)', value: breakdown.investments > 0 ? breakdown.investments : 30 },
    { name: 'Savings (30%)', value: breakdown.savings > 0 ? breakdown.savings : 30 }
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981'];

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Breakdown</h3>
        <div className="flex flex-col h-full">
          <div className="mb-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Needs</span>
                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">40%</span>
              </div>
              <div className="text-xl font-semibold text-gray-800">{formatCurrency(breakdown.needs)}</div>
              <div className="text-xs text-gray-500 mt-1">Daily expenses, rent, bills</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Investments</span>
                <span className="bg-investments text-white text-xs font-bold px-2 py-1 rounded">30%</span>
              </div>
              <div className="text-xl font-semibold text-gray-800">{formatCurrency(breakdown.investments)}</div>
              <div className="text-xs text-gray-500 mt-1">Long-term growth, business</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Savings</span>
                <span className="bg-savings text-white text-xs font-bold px-2 py-1 rounded">30%</span>
              </div>
              <div className="text-xl font-semibold text-gray-800">{formatCurrency(breakdown.savings)}</div>
              <div className="text-xs text-gray-500 mt-1">Emergency fund, future goals</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
