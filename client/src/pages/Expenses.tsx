import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Expense } from "@shared/schema";
import ExpenseForm from "@/components/ExpenseForm";
import ExpensesList from "@/components/ExpensesList";
import ExpenseCategorySelector from "@/components/ExpenseCategorySelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function Expenses() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current month and year for filtering
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // +1 because getMonth() returns 0-11
  
  // Get all expenses, with optional category filter
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ['expenses', selectedCategoryFilter, currentYear, currentMonth],
    queryFn: async () => {
      let url = '/api/expenses';
      
      if (selectedCategoryFilter) {
        url = `/api/expenses/category/${selectedCategoryFilter}`;
      } else {
        // Default to current month if no category filter
        url = `/api/expenses/month/${currentYear}/${currentMonth}`;
      }
      
      return apiRequest<Expense[]>(url);
    }
  });

  // Current month's total expenses
  const totalExpenses = expenses?.reduce(
    (sum, expense) => sum + parseFloat(expense.amount.toString()), 
    0
  ) || 0;

  // Handle form submission
  const handleExpenseAdded = () => {
    // Close form
    setShowExpenseForm(false);
    
    // Invalidate expenses query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    
    // Show success toast
    toast({
      title: "Expense added successfully",
      description: "Your expense has been recorded.",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your spending
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="bg-primary hover:bg-primary/90"
          >
            {showExpenseForm ? "Cancel" : "Add Expense"}
          </Button>
        </div>
      </div>

      {showExpenseForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>
              Record your expense details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm onSuccess={handleExpenseAdded} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Month Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {format(today, 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedCategoryFilter(null)}>
              All Expenses
            </TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading expenses...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-600">Error loading expenses. Please try again.</p>
            </div>
          ) : expenses && expenses.length > 0 ? (
            <ExpensesList expenses={expenses} />
          ) : (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">No expenses found</h3>
              <p className="text-gray-500">
                Get started by adding your first expense using the "Add Expense" button above.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="category" className="mt-0">
          <div className="mb-6">
            <ExpenseCategorySelector 
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={setSelectedCategoryFilter}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading expenses...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-600">Error loading expenses. Please try again.</p>
            </div>
          ) : expenses && expenses.length > 0 ? (
            <ExpensesList expenses={expenses} />
          ) : (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {selectedCategoryFilter
                  ? `No expenses found in ${selectedCategoryFilter} category`
                  : "No expenses found"}
              </h3>
              <p className="text-gray-500">
                Try selecting a different category or add new expenses.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}