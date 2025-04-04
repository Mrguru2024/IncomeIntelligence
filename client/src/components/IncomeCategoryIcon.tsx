import React from "react";
import { cn } from "@/lib/utils";
import { getCategoryById } from "@shared/schema";
import * as LucideIcons from "lucide-react";

interface IncomeCategoryIconProps {
  categoryId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  withBackground?: boolean;
}

export default function IncomeCategoryIcon({
  categoryId,
  size = "md",
  className,
  withBackground = false,
}: IncomeCategoryIconProps) {
  const category = getCategoryById(categoryId);
  // Convert to proper icon name format (first letter capitalized)
  const formattedIconName = category.icon.charAt(0).toUpperCase() + category.icon.slice(1);
  // Get the icon component from LucideIcons
  const IconComponent = (LucideIcons as any)[formattedIconName];

  // Define size classes
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Define background size classes
  const bgSizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  // Bail out if no icon found
  if (!IconComponent) {
    return null;
  }

  if (withBackground) {
    return (
      <div
        className={cn(
          `bg-${category.color}-100 text-${category.color}-500 rounded-full flex items-center justify-center`,
          bgSizeClasses[size],
          className
        )}
      >
        <IconComponent className={sizeClasses[size]} />
      </div>
    );
  }

  return (
    <IconComponent 
      className={cn(`text-${category.color}-500`, sizeClasses[size], className)} 
    />
  );
}