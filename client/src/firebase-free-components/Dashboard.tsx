import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'wouter';

// Types
type AuthContextType = {
  user: { 
    id: number;
    username: string;
    email?: string;
    displayName?: string;
    profilePicture?: string;
    subscriptionTier?: string;
    subscriptionActive?: boolean;
  } | null;
  isLoading: boolean;
};

// Define global for accessing the auth context
declare global {
  interface Window {
    getAuthContext?: () => AuthContextType;
  }
}

// Data for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Mock data for demonstration
const mockBalanceData = {
  needs: 2400,
  investments: 1800,
  savings: 2400
};

const incomeData = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 5000 },
  { name: 'Apr', amount: 4500 },
  { name: 'May', amount: 6000 },
  { name: 'Jun', amount: 5500 },
];

const recentActivities = [
  { id: 1, type: 'Income', amount: 1200, description: 'Freelance work', date: '2025-04-05' },
  { id: 2, type: 'Expense', amount: 340, description: 'Groceries', date: '2025-04-04' },
  { id: 3, type: 'Transfer', amount: 500, description: 'To savings', date: '2025-04-03' },
  { id: 4, type: 'Income', amount: 2000, description: 'Client payment', date: '2025-04-01' },
];

export default function Dashboard() {
  const auth = window.getAuthContext?.();
  const [, setLocation] = useLocation();
  const [balances, setBalances] = useState(mockBalanceData);
  const [goalProgress, setGoalProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call to fetch real data
    const fetchData = async () => {
      try {
        // In a real implementation, we would fetch actual data
        // const balanceResponse = await apiRequest('GET', '/api/balances');
        // setBalances(await balanceResponse.json());

        // For now, we'll just use our mock data
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for pie chart
  const pieData = [
    { name: 'Needs', value: balances.needs },
    { name: 'Investments', value: balances.investments },
    { name: 'Savings', value: balances.savings }
  ];

  // Calculate totals
  const totalBalance = pieData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome, {auth?.user?.username || 'User'}!</h1>
        <p className="text-muted-foreground">Here's an overview of your financial health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Income</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${incomeData[incomeData.length - 1].amount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>On track</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>40/30/30 Split</CardTitle>
            <CardDescription>Balance distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => ['$' + value.toLocaleString(), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-sm mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-2"></div>
                <span>Needs: ${balances.needs.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-2"></div>
                <span>Investments: ${balances.investments.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-2"></div>
                <span>Savings: ${balances.savings.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => ['$' + value.toLocaleString(), 'Income']} />
                  <Bar dataKey="amount" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-left font-medium">Description</th>
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="border-b last:border-0">
                    <td className="py-3">{activity.type}</td>
                    <td className="py-3">{activity.description}</td>
                    <td className="py-3">{new Date(activity.date).toLocaleDateString()}</td>
                    <td className={`py-3 text-right ${activity.type === 'Expense' ? 'text-red-500' : activity.type === 'Income' ? 'text-green-500' : ''}`}>
                      {activity.type === 'Expense' ? '-' : activity.type === 'Income' ? '+' : ''}
                      ${activity.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}