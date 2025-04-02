import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Income } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentIncomeProps {
  incomes: Income[];
  isLoading: boolean;
}

export default function RecentIncome({ incomes, isLoading }: RecentIncomeProps) {
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get the 5 most recent incomes
  const recentIncomes = incomes.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border border-gray-100 mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Income</h3>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-100 mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Income</h3>
          <Link href="/income-history" className="text-primary hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split (40/30/30)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentIncomes.length > 0 ? (
                recentIncomes.map((income) => {
                  const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
                  const needsAmount = amount * 0.4;
                  const investmentsAmount = amount * 0.3;
                  const savingsAmount = amount * 0.3;

                  return (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(income.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{income.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{formatCurrency(needsAmount)}</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{formatCurrency(investmentsAmount)}</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{formatCurrency(savingsAmount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`text-xs px-2 py-1 rounded ${income.source === 'Manual' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                          {income.source}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No income entries yet. Add your first income entry above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
