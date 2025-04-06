import React, { useState } from "react";
import {
  Expense,
  expenseCategories,
  getExpenseCategoryById,
} from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExpensesListProps {
  expenses: Expense[];
}

export default function ExpensesList({ expenses }: ExpensesListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  // Delete expense mutation
  const { mutate: deleteExpense } = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/expenses/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      });
      setExpenseToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (expenseToDelete !== null) {
      deleteExpense(expenseToDelete);
    }
  };

  // If no expenses, show empty state
  if (expenses.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No expenses to display.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {expenses.map((expense) => {
          const category = getExpenseCategoryById(expense.category);
          const date = new Date(expense.date);

          return (
            <Card key={expense.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start p-4">
                  <div
                    className={`p-2 rounded-full bg-${category.color}-100 flex-shrink-0 mr-4`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={`currentColor`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-${category.color}-500`}
                    >
                      {category.icon === "home" && (
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      )}
                      {category.icon === "utensils" && (
                        <path d="M5 22h14a2 2 0 0 0 2-2V7.5L14.5 2H5a2 2 0 0 0-2 2v16.5A2 2 0 0 0 5 22z"></path>
                      )}
                      {category.icon === "car" && (
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.3-.9-2.1-.9H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                      )}
                      {category.icon === "plug" && (
                        <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"></path>
                      )}
                      {category.icon === "stethoscope" && (
                        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
                      )}
                      {category.icon === "user" && (
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      )}
                      {category.icon === "film" && (
                        <rect
                          width="20"
                          height="20"
                          x="2"
                          y="2"
                          rx="2.18"
                          ry="2.18"
                        ></rect>
                      )}
                      {category.icon === "graduationCap" && (
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      )}
                      {category.icon === "creditCard" && (
                        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      )}
                      {category.icon === "piggyBank" && (
                        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"></path>
                      )}
                      {category.icon === "moreHorizontal" && (
                        <circle cx="12" cy="12" r="1"></circle>
                      )}
                      {category.icon === "moreHorizontal" && (
                        <circle cx="6" cy="12" r="1"></circle>
                      )}
                      {category.icon === "moreHorizontal" && (
                        <circle cx="18" cy="12" r="1"></circle>
                      )}
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {expense.description}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {format(date, "MMM d, yyyy")} ·{" "}
                          {expense.paymentMethod}
                          {expense.location && ` · ${expense.location}`}
                        </div>
                        {expense.isRecurring && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            Recurring {expense.recurringPeriod}
                          </span>
                        )}
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold text-lg text-gray-900">
                          ${parseFloat(expense.amount.toString()).toFixed(2)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 ml-2"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setExpenseToDelete(expense.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={expenseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setExpenseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
