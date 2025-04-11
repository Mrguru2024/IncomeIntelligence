import React from "react";
import { expenseCategories } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface ExpensePriorityTagsProps {
  categoryId: string;
  showDescription?: boolean;
}

export default function ExpensePriorityTags({ 
  categoryId, 
  showDescription = false 
}: ExpensePriorityTagsProps) {
  // Find the category by ID
  const category = expenseCategories.find(cat => cat.id === categoryId);

  if (!category) {
    return null;
  }

  // Define styles and labels for each priority
  const priorityStyles = {
    needs: {
      variant: "default",
      class: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      label: "Needs",
      description: "40% of your income should go to essential expenses like housing, utilities, and groceries."
    },
    investments: {
      variant: "outline",
      class: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
      label: "Investments",
      description: "30% of your income should be invested in your future, including retirement, education, and business ventures."
    },
    savings: {
      variant: "outline",
      class: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
      label: "Savings",
      description: "30% of your income should be saved for goals like emergency funds, travel, and major purchases."
    },
    other: {
      variant: "outline",
      class: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
      label: "Discretionary",
      description: "This expense doesn't fit cleanly into the 40/30/30 model, but may fulfill multiple purposes."
    }
  };

  const priorityInfo = priorityStyles[category.priority];

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <Badge 
          variant="outline" 
          className={`${priorityInfo.class} text-xs font-medium`}
        >
          {priorityInfo.label}
        </Badge>
        <span className="ml-1 text-xs text-gray-500">
          {category.priority === "needs" && "40%"}
          {category.priority === "investments" && "30%"}
          {category.priority === "savings" && "30%"}
        </span>
      </div>
      
      {showDescription && (
        <p className="mt-1 text-xs text-gray-500">
          {priorityInfo.description}
        </p>
      )}
    </div>
  );
}