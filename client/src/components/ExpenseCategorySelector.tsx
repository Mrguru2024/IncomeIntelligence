import React from "react";
import { expenseCategories } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ExpenseCategorySelectorProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function ExpenseCategorySelector({
  selectedCategory,
  onSelectCategory,
}: ExpenseCategorySelectorProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        Filter by Category
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            !selectedCategory
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
        >
          All
        </button>

        {expenseCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center",
              selectedCategory === category.id
                ? `bg-${category.color}-100 text-${category.color}-700`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            <span className={`mr-1.5 text-${category.color}-500`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            </span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
