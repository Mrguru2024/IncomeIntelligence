import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { incomeCategories, getCategoryById } from "@shared/schema";
import * as LucideIcons from "lucide-react";

interface IncomeCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IncomeCategorySelector({
  value,
  onChange,
}: IncomeCategorySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCategory = getCategoryById(value);

  // Helper function to render the selected icon
  const renderIcon = (iconName: string) => {
    // Convert to proper icon name format (first letter capitalized)
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    // Get the icon component from LucideIcons
    const IconComponent = (LucideIcons as any)[formattedIconName];
    return IconComponent ? <IconComponent className="h-4 w-4 mr-2" /> : null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            {renderIcon(selectedCategory.icon)}
            <span className={`text-${selectedCategory.color}-500`}>
              {selectedCategory.name}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search income category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {incomeCategories.map((category) => (
              <CommandItem
                key={category.id}
                value={category.id}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <div className="flex items-center">
                  {renderIcon(category.icon)}
                  <span className={`text-${category.color}-500`}>
                    {category.name}
                  </span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === category.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}