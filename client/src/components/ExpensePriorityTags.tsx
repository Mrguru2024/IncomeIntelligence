import React from "react";
import { Badge } from "@/components/ui/badge";
import { useIncomeStore } from "@/hooks/useIncomeStore";

type ExpenseCategory = {
  id: string;
  name: string;
  priority: "needs" | "investments" | "savings" | "other";
  icon?: string;
  color?: string;
};

const expenseCategoryPriorities: ExpenseCategory[] = [
  { id: "housing", name: "Housing", priority: "needs", icon: "home", color: "slate" },
  { id: "food", name: "Food & Groceries", priority: "needs", icon: "utensils", color: "red" },
  { id: "transportation", name: "Transportation", priority: "needs", icon: "car", color: "blue" },
  { id: "utilities", name: "Utilities", priority: "needs", icon: "plug", color: "amber" },
  { id: "healthcare", name: "Healthcare", priority: "needs", icon: "stethoscope", color: "emerald" },
  { id: "personal", name: "Personal", priority: "needs", icon: "user", color: "purple" },
  { id: "entertainment", name: "Entertainment", priority: "other", icon: "film", color: "pink" },
  { id: "education", name: "Education", priority: "investments", icon: "graduationCap", color: "indigo" },
  { id: "debt", name: "Debt", priority: "needs", icon: "creditCard", color: "rose" },
  { id: "savings", name: "Savings", priority: "savings", icon: "piggyBank", color: "green" },
  { id: "investment", name: "Investment", priority: "investments", icon: "trendingUp", color: "purple" },
  { id: "retirement", name: "Retirement", priority: "investments", icon: "clock", color: "indigo" },
  { id: "emergency", name: "Emergency Fund", priority: "savings", icon: "shield", color: "amber" },
  { id: "other", name: "Other", priority: "other", icon: "moreHorizontal", color: "gray" }
];

interface ExpensePriorityTagsProps {
  categoryId: string;
  showDescription?: boolean;
}

export default function ExpensePriorityTags({ 
  categoryId, 
  showDescription = true 
}: ExpensePriorityTagsProps) {
  const { needsPercentage, investmentsPercentage, savingsPercentage } = useIncomeStore();
  
  // Find the category in our priority map
  const category = expenseCategoryPriorities.find(cat => cat.id === categoryId) || 
    { id: categoryId, name: categoryId, priority: "other" as const };
  
  // Get appropriate badge color and styling based on priority
  const getBadgeStyles = () => {
    switch(category.priority) {
      case "needs":
        return { 
          variant: "outline" as const, 
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
          percentage: needsPercentage
        };
      case "investments":
        return { 
          variant: "outline" as const, 
          className: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
          percentage: investmentsPercentage
        };
      case "savings":
        return { 
          variant: "outline" as const, 
          className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
          percentage: savingsPercentage
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
          percentage: 0
        };
    }
  };

  const badgeStyles = getBadgeStyles();

  return (
    <div className="flex flex-col space-y-1">
      <Badge variant={badgeStyles.variant} className={badgeStyles.className}>
        {category.priority.charAt(0).toUpperCase() + category.priority.slice(1)} 
        {badgeStyles.percentage > 0 && ` (${badgeStyles.percentage}%)`}
      </Badge>
      
      {showDescription && (
        <p className="text-xs text-gray-500">
          {category.priority === "needs" && 
            `This is a necessity expense from your ${needsPercentage}% Needs allocation.`}
          {category.priority === "investments" && 
            `This expense builds your future from your ${investmentsPercentage}% Investments allocation.`}
          {category.priority === "savings" && 
            `This contributes to your financial security from your ${savingsPercentage}% Savings allocation.`}
          {category.priority === "other" && 
            "This expense isn't categorized within your income allocation framework."}
        </p>
      )}
    </div>
  );
}