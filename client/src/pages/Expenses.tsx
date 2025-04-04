import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Expense } from "@shared/schema";
import ExpenseForm from "@/components/ExpenseForm";
import ExpensesList from "@/components/ExpensesList";
import ExpenseCategorySelector from "@/components/ExpenseCategorySelector";
import VoiceExpenseEntry from "@/components/VoiceExpenseEntry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function Expenses() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showVoiceExpense, setShowVoiceExpense] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Get current month and year for filtering
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // +1 because getMonth() returns 0-11
  
  // Process URL parameters for opening forms
  useEffect(() => {
    const url = new URL(window.location.href);
    const openExpenseForm = url.searchParams.get('openExpenseForm');
    const openVoiceExpense = url.searchParams.get('openVoiceExpense');
    
    if (openExpenseForm === 'true') {
      setShowExpenseForm(true);
      setShowVoiceExpense(false);
      // Clean up the URL
      window.history.replaceState({}, document.title, '/expenses');
    }
    
    if (openVoiceExpense === 'true') {
      setShowVoiceExpense(true);
      setShowExpenseForm(false);
      // Clean up the URL
      window.history.replaceState({}, document.title, '/expenses');
    }
  }, [location]);
  
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
      
      return apiRequest(url) as Promise<Expense[]>;
    }
  });

  // Current month's total expenses
  const totalExpenses = expenses?.reduce(
    (sum: number, expense: Expense) => sum + parseFloat(expense.amount.toString()), 
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
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Track and manage your spending
          </p>
        </div>
        <div className="mt-3 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => {
              setShowExpenseForm(!showExpenseForm);
              setShowVoiceExpense(false);
            }}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            {showExpenseForm ? "Cancel" : "Add Expense"}
          </Button>
          <Button 
            onClick={() => {
              setShowVoiceExpense(!showVoiceExpense);
              setShowExpenseForm(false);
            }}
            variant={showVoiceExpense ? "destructive" : "outline"}
            className="w-full sm:w-auto"
          >
            {showVoiceExpense ? "Cancel Voice" : "Voice Entry"}
          </Button>
        </div>
      </div>

      {showExpenseForm && (
        <Card className="mb-4 sm:mb-6 overflow-hidden">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
            <CardTitle className="text-lg sm:text-xl">Add New Expense</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Record your expense details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm onSuccess={handleExpenseAdded} />
          </CardContent>
        </Card>
      )}
      
      {showVoiceExpense && (
        <div className="mb-4 sm:mb-6">
          <VoiceExpenseEntry onSuccess={() => {
            setShowVoiceExpense(false);
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
          }} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
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