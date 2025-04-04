import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { expenseCategories } from '@shared/schema';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

interface VoiceExpenseEntryProps {
  onSuccess?: () => void;
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Trash2, Check, X, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Expense form schema for validation (simplified for voice entry)
const formSchema = z.object({
  description: z.string().min(2, "Description is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  date: z.date(),
  category: z.string(),
  paymentMethod: z.string(),
  userId: z.number().optional(),
});

type ExpenseData = z.infer<typeof formSchema>;

const VoiceExpenseEntry: React.FC<VoiceExpenseEntryProps> = ({ onSuccess }) => {
  const [isListening, setIsListening] = useState(false);
  const [parsedExpense, setParsedExpense] = useState<Partial<ExpenseData> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const queryClient = useQueryClient();

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ExpenseData) => 
      apiRequest("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      // Reset parsed expense
      setParsedExpense(null);
      
      // Show success toast
      toast({
        title: "Expense added successfully",
        description: "Your expense has been recorded via voice command.",
        variant: "default",
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error adding expense",
        description: "There was a problem adding your expense. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding expense:", error);
    }
  });

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsProcessing(true); // Start processing when we stop listening
    } else {
      resetTranscript();
      setParsedExpense(null);
      SpeechRecognition.startListening({ continuous: true });
    }
    setIsListening(!isListening);
  };

  // Cancel current expense
  const cancelExpense = () => {
    setParsedExpense(null);
    resetTranscript();
  };

  // Submit expense
  const submitExpense = () => {
    if (parsedExpense && 
        parsedExpense.description && 
        parsedExpense.amount && 
        parsedExpense.category) {
      
      const expense: ExpenseData = {
        description: parsedExpense.description,
        amount: parsedExpense.amount,
        date: parsedExpense.date || new Date(),
        category: parsedExpense.category,
        paymentMethod: parsedExpense.paymentMethod || 'cash',
        userId: 1, // Default user ID
      };
      
      mutate(expense);
    } else {
      toast({
        title: "Missing information",
        description: "Please provide at least a description, amount, and category.",
        variant: "destructive",
      });
    }
  };

  // Process transcript to extract expense details
  const processTranscript = () => {
    if (!transcript || transcript.trim() === '') {
      setIsProcessing(false);
      return;
    }

    const lowerTranscript = transcript.toLowerCase();
    
    // Try to extract expense information
    const expenseData: Partial<ExpenseData> = {
      date: new Date(),  // Default to today
      paymentMethod: 'cash',  // Default payment method
      category: 'other',  // Default category
    };

    // Extract amount - look for number patterns with or without dollar sign
    const amountMatch = lowerTranscript.match(/\$?(\d+(?:\.\d{1,2})?)/);
    if (amountMatch) {
      expenseData.amount = amountMatch[1]; // Get the number part
    }

    // Extract description
    // Look for common phrases like "for", "spent on", "paid for", "bought"
    let description = '';
    
    if (lowerTranscript.includes("for")) {
      const forMatch = lowerTranscript.match(/(?:spent|paid|expense|bought|purchased|for|on) (.*?)(?:for|at|in|with|using|on|$)/i);
      if (forMatch) {
        description = forMatch[1].trim();
      }
    } else if (lowerTranscript.includes("spent on") || lowerTranscript.includes("paid for") || lowerTranscript.includes("bought")) {
      const actionMatch = lowerTranscript.match(/(?:spent on|paid for|bought) (.*?)(?:for|at|in|with|using|on|$)/i);
      if (actionMatch) {
        description = actionMatch[1].trim();
      }
    }
    
    // If no match found, use everything after amount as description
    if (!description && amountMatch) {
      const parts = lowerTranscript.split(amountMatch[0]);
      if (parts.length > 1) {
        description = parts[1].trim();
      }
    }
    
    // If still no description, use the full transcript
    if (!description) {
      description = lowerTranscript;
    }
    
    // Clean up description by removing common filler words
    const fillerWords = ['dollars', 'dollar', 'for', 'spent', 'paid', 'bought', 'purchased', 'expense', 'add', 'create', 'new'];
    let cleanedDescription = description;
    
    fillerWords.forEach(word => {
      cleanedDescription = cleanedDescription.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });
    
    cleanedDescription = cleanedDescription.trim();
    
    // If we have a cleaned description, use it
    if (cleanedDescription) {
      // Capitalize first letter
      expenseData.description = cleanedDescription.charAt(0).toUpperCase() + cleanedDescription.slice(1);
    }

    // Try to detect category based on keywords in transcript
    for (const category of expenseCategories) {
      if (lowerTranscript.includes(category.id) || 
          lowerTranscript.includes(category.name.toLowerCase())) {
        expenseData.category = category.id;
        break;
      }
    }

    // Try to detect payment method
    const paymentMethods: { [key: string]: string } = {
      'cash': 'cash',
      'credit': 'credit',
      'credit card': 'credit',
      'debit': 'debit',
      'debit card': 'debit',
      'check': 'check',
      'bank transfer': 'transfer',
      'transfer': 'transfer',
      'mobile': 'mobile',
      'mobile payment': 'mobile',
      'venmo': 'mobile',
      'paypal': 'mobile',
      'apple pay': 'mobile',
      'google pay': 'mobile'
    };

    for (const [keyword, method] of Object.entries(paymentMethods)) {
      if (lowerTranscript.includes(keyword)) {
        expenseData.paymentMethod = method;
        break;
      }
    }

    setParsedExpense(expenseData);
    setIsProcessing(false);
  };

  // Process transcript after listening stops
  useEffect(() => {
    if (isProcessing && transcript) {
      processTranscript();
    }
  }, [isProcessing, transcript]);

  // Check for browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Voice Expense Entry Unavailable</CardTitle>
          <CardDescription>
            Your browser doesn't support speech recognition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try using a modern browser like Chrome, Edge, or Safari.</p>
        </CardContent>
      </Card>
    );
  }

  // Check microphone access
  if (!isMicrophoneAvailable) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Microphone Access Required</CardTitle>
          <CardDescription>
            Please allow microphone access to use voice expense entry.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Voice Expense Entry</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Add expenses quickly using your voice
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-9 sm:w-9"
                    onClick={() => setShowExamples(!showExamples)}
                  >
                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show example phrases</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Badge 
              variant={isListening ? "default" : "outline"} 
              className="text-xs py-0.5 px-2"
            >
              {isListening ? "Listening" : parsedExpense ? "Ready" : "Idle"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4 space-y-3">
        {showExamples && (
          <Alert className="mb-3 bg-muted/50">
            <AlertTitle className="text-xs sm:text-sm font-semibold">Example Commands</AlertTitle>
            <AlertDescription className="text-xs">
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>"I spent $25 on lunch at the cafe"</li>
                <li>"$45 for groceries"</li>
                <li>"Add a transportation expense for $30"</li>
                <li>"I bought gas for $35 using credit card"</li>
                <li>"Paid $120 for utilities with bank transfer"</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="p-2 sm:p-3 bg-muted rounded-md min-h-[60px] sm:min-h-[70px] flex items-center">
          {isListening ? (
            <p className="text-sm sm:text-base">
              {transcript || "Listening... Speak your expense details."}
            </p>
          ) : parsedExpense ? (
            <div className="w-full">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="font-medium text-muted-foreground">Description:</dt>
                <dd>{parsedExpense.description || "Not detected"}</dd>
                
                <dt className="font-medium text-muted-foreground">Amount:</dt>
                <dd>${parsedExpense.amount || "0.00"}</dd>
                
                <dt className="font-medium text-muted-foreground">Category:</dt>
                <dd>{expenseCategories.find(c => c.id === parsedExpense.category)?.name || "Other"}</dd>
                
                <dt className="font-medium text-muted-foreground">Payment:</dt>
                <dd className="capitalize">{parsedExpense.paymentMethod || "Cash"}</dd>
              </dl>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-muted-foreground">
              Click the microphone button to start recording an expense.
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-2 flex justify-between">
        {parsedExpense ? (
          <>
            <Button 
              variant="outline" 
              className="text-xs sm:text-sm" 
              onClick={cancelExpense}
              disabled={isPending}
            >
              <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Cancel
            </Button>
            <Button 
              onClick={submitExpense} 
              className="text-xs sm:text-sm bg-primary hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? (
                "Saving..."
              ) : (
                <>
                  <Check className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Save Expense
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className={`text-xs sm:text-sm w-full ${isListening ? "animate-pulse" : ""}`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : isListening ? (
              <>
                <MicOff className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
                Record Expense
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VoiceExpenseEntry;