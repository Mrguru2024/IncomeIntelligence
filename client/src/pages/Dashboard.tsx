import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Income } from "@shared/schema";
import StatCard from "@/components/StatCard";
import IncomeInputForm from "@/components/IncomeInputForm";
import IncomeBreakdown from "@/components/IncomeBreakdown";
import RecentIncome from "@/components/RecentIncome";
import ConnectedAccounts from "@/components/ConnectedAccounts";
import { formatCurrency } from "@/lib/utils/format";

export default function Dashboard() {
  const { data: incomes, isLoading } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });

  // Calculate totals for the current month
  const currentDate = new Date();
  const currentMonthIncomes = incomes?.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate.getMonth() === currentDate.getMonth() && 
           incomeDate.getFullYear() === currentDate.getFullYear();
  }) || [];

  const totalMonthlyIncome = currentMonthIncomes.reduce((sum, income) => {
    return sum + parseFloat(income.amount.toString());
  }, 0);

  const totalJobs = currentMonthIncomes.length;

  // Calculate savings (30% of all income)
  const savingsTotal = totalMonthlyIncome * 0.3;

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 mt-1">Track and manage your income distribution</p>
        </div>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Income (This Month)"
          value={formatCurrency(totalMonthlyIncome)}
          icon="dollar-sign"
          iconColor="primary"
          iconBgColor="blue-50"
          changeValue={12}
          changeText="vs last month"
        />
        
        <StatCard 
          title="Jobs Completed"
          value={totalJobs.toString()}
          icon="briefcase"
          iconColor="investments"
          iconBgColor="purple-50"
          changeValue={8}
          changeText="vs last month"
        />
        
        <StatCard 
          title="Savings Growth"
          value={formatCurrency(savingsTotal)}
          icon="piggy-bank"
          iconColor="savings"
          iconBgColor="green-50"
          changeValue={15}
          changeText="vs last month"
        />
      </div>

      {/* Income Input and Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <IncomeInputForm />
        <IncomeBreakdown />
      </div>

      {/* Recent Income Section */}
      <RecentIncome incomes={incomes || []} isLoading={isLoading} />

      {/* Connected Accounts Section */}
      <ConnectedAccounts />
    </main>
  );
}
