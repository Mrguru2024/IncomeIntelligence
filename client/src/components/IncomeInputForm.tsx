import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incomeCategories } from "@shared/schema";
import * as LucideIcons from "lucide-react";

const incomeFormSchema = z.object({
  description: z.string().min(1, "Job description is required"),
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string().min(1, "Date is required"),
  source: z.string().default("Manual"),
  category: z.string().default("other"),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export default function IncomeInputForm() {
  const { toast } = useToast();
  
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: "",
      amount: "", // Changed back to string
      date: new Date().toISOString().split('T')[0],
      source: "Manual",
      category: "other",
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormValues) => {
      // Convert form data to match the API requirements
      // Make sure to format the date as a proper ISO string for the API
      const dateObj = new Date(data.date);
      
      const response = await apiRequest('/api/incomes', {
        method: 'POST',
        body: JSON.stringify({
          description: data.description,
          amount: data.amount, // This should be a string matching the schema
          date: dateObj, // Send the Date object, not a string
          source: data.source,
          category: data.category,
          userId: 1, // In a real app, we would get this from auth context
        })
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomes'] });
      toast({
        title: "Income Added",
        description: "Your income entry has been saved successfully.",
      });
      form.reset({
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        source: "Manual",
        category: "other",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save income entry.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    createIncomeMutation.mutate(data);
  };

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Income</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Job Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Emergency lockout service"
                      {...field}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      {...field}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeCategories.map((category) => {
                        // Handle icon names to match Lucide icons
                        const iconName = category.icon.charAt(0).toUpperCase() + category.icon.slice(1);
                        // Create a dynamic component based on the icon name
                        let IconComponent: React.FC<{ className?: string }> | null = null;
                        
                        // Check if the icon exists in LucideIcons
                        if (iconName in LucideIcons) {
                          IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<{ className?: string }>;
                        }
                        
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              {IconComponent && (
                                <IconComponent className="h-4 w-4 text-primary" />
                              )}
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={createIncomeMutation.isPending}
              >
                {createIncomeMutation.isPending ? "Saving..." : "Save Income Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
