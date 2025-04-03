import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { goalTypes, insertGoalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const goalFormSchema = insertGoalSchema.extend({
  deadline: z.date().optional(),
  askAiAdvice: z.boolean().optional(),
  aiQuestion: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalFormModal({ isOpen, onClose }: GoalFormModalProps) {
  console.log("GoalFormModal rendered with isOpen:", isOpen);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [aiMode, setAiMode] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      type: "",
      targetAmount: "",
      currentAmount: "0",
      description: "",
      askAiAdvice: false,
      aiQuestion: "",
    },
  });

  const handleAskAi = async () => {
    const aiQuestion = form.watch("aiQuestion");
    if (!aiQuestion) {
      toast({
        title: "Please enter a question",
        description: "Enter a question about financial goals to get AI suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsAiLoading(true);

    // Simulate AI response with timeout
    setTimeout(() => {
      // These would normally come from an AI API like OpenAI
      const suggestions = [
        "Consider the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
        "Make your goal specific, measurable, achievable, relevant, and time-bound (SMART).",
        "For retirement, aim to save at least 15% of your pre-tax income annually.",
        "Build an emergency fund covering 3-6 months of expenses before other financial goals.",
        "When saving for a large purchase, calculate monthly savings needed: Target ÷ Months until deadline."
      ];
      
      setAiSuggestions(suggestions);
      setIsAiLoading(false);
    }, 1500);
  };

  async function onSubmit(data: GoalFormValues) {
    try {
      // Process deadline date
      const formattedData: any = { ...data };
      if (deadlineDate) {
        formattedData.deadline = format(deadlineDate, "yyyy-MM-dd");
      } else {
        delete formattedData.deadline;
      }

      // Remove AI-specific fields before submission
      delete formattedData.askAiAdvice;
      delete formattedData.aiQuestion;

      await apiRequest("/api/goals", {
        method: "POST",
        body: JSON.stringify(formattedData)
      });

      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      
      toast({
        title: "Goal created!",
        description: "Your financial goal has been successfully added.",
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to create goal:", error);
      toast({
        title: "Failed to create goal",
        description: "There was an error creating your goal. Please try again.",
        variant: "destructive",
      });
    }
  }

  const goalTypeOptions = goalTypes.map(type => ({
    value: type.id,
    label: type.name
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Goal</DialogTitle>
          <DialogDescription>
            Set a new financial goal to track your progress towards financial milestones.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Goal Details</TabsTrigger>
            <TabsTrigger value="ai" onClick={() => setAiMode(true)}>AI Advisor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="New Car, Emergency Fund, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a goal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {goalTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Categorize your financial goal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5000" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="currentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Progress ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        How much have you already saved towards this goal?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <div className="mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !deadlineDate && "text-muted-foreground"
                          )}
                        >
                          {deadlineDate ? format(deadlineDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deadlineDate}
                          onSelect={setDeadlineDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => {
                    // Ensure field.value is always a string
                    const value = typeof field.value === 'string' ? field.value : '';
                    
                    return (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Why is this goal important to you?"
                            className="resize-none" 
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={(e) => field.onChange(e.target.value)}
                            value={value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Create Goal</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="ai">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M9 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0"></path>
                    </svg>
                    Financial Goal Advisor
                  </CardTitle>
                  <CardDescription>
                    Ask for advice on setting realistic and effective financial goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="How do I set a good savings goal?"
                        value={form.watch("aiQuestion")}
                        onChange={(e) => form.setValue("aiQuestion", e.target.value)}
                      />
                      <Button 
                        onClick={handleAskAi} 
                        disabled={isAiLoading}
                      >
                        {isAiLoading ? "Processing..." : "Ask"}
                      </Button>
                    </div>
                    
                    {isAiLoading && (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                    
                    {aiSuggestions.length > 0 && (
                      <div className="space-y-4 mt-4">
                        <h3 className="text-sm font-medium">Suggestions:</h3>
                        <ul className="space-y-3">
                          {aiSuggestions.map((suggestion, index) => (
                            <li key={index} className="p-3 bg-muted rounded-lg text-sm">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                        
                        <div className="pt-4">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Continue to Goal Form
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}