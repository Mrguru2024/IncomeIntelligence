import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Income } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils/format";

export default function IncomeHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const { data: incomes, isLoading } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filter and sort incomes
  const filteredIncomes = incomes?.filter(income => {
    // Filter by search term
    const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by source
    const matchesSource = filterSource === "all" || income.source === filterSource;
    
    return matchesSearch && matchesSource;
  }).sort((a, b) => {
    // Sort by date
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  }) || [];

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, income) => {
    return sum + (typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount);
  }, 0);

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Income History</h2>
          <p className="text-gray-500 mt-1">Review and manage your past income entries</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-700">Total:</div>
              <div className="text-xl font-semibold text-primary">{formatCurrency(totalIncome)}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-700">Needs (40%):</div>
              <div className="text-xl font-semibold text-needs">{formatCurrency(totalIncome * 0.4)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-700">Invest (30%):</div>
                <div className="text-lg font-semibold text-investments">{formatCurrency(totalIncome * 0.3)}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-700">Save (30%):</div>
                <div className="text-lg font-semibold text-savings">{formatCurrency(totalIncome * 0.3)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search income entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncomes.map((income) => {
                  const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
                  const needsAmount = amount * 0.4;
                  const investAmount = amount * 0.3;
                  const saveAmount = amount * 0.3;

                  return (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(income.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{income.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{formatCurrency(needsAmount)}</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{formatCurrency(investAmount)}</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{formatCurrency(saveAmount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`text-xs px-2 py-1 rounded ${income.source === 'Manual' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                          {income.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <i className="fas fa-edit text-gray-500"></i>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <i className="fas fa-trash text-gray-500"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredIncomes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {isLoading ? "Loading income data..." : "No income entries found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
