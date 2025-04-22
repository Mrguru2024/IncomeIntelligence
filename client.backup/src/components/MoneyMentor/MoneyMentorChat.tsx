import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Define financial topic categories to match backend enum
enum FinancialTopicCategory {
  BUDGETING = 'budgeting',
  INVESTING = 'investing',
  SAVING = 'saving',
  DEBT = 'debt',
  RETIREMENT = 'retirement',
  TAXES = 'taxes',
  INCOME = 'income_generation',
  GENERAL = 'general',
}

// Interface for a chat message
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  category?: FinancialTopicCategory;
  timestamp: Date;
  isLoading?: boolean;
}

// Component for a single chat message
const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Get category label for display
  const getCategoryLabel = (category?: FinancialTopicCategory): string => {
    if (!category) return '';
    
    const labels: Record<FinancialTopicCategory, string> = {
      [FinancialTopicCategory.BUDGETING]: 'Budgeting',
      [FinancialTopicCategory.INVESTING]: 'Investing',
      [FinancialTopicCategory.SAVING]: 'Saving',
      [FinancialTopicCategory.DEBT]: 'Debt',
      [FinancialTopicCategory.RETIREMENT]: 'Retirement',
      [FinancialTopicCategory.TAXES]: 'Taxes',
      [FinancialTopicCategory.INCOME]: 'Income',
      [FinancialTopicCategory.GENERAL]: 'General',
    };
    
    return labels[category];
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Your Money Mentor is thinking...</span>
          </div>
        ) : (
          <>
            {message.category && !isUser && (
              <div className="text-xs font-medium mb-1 text-primary">
                {getCategoryLabel(message.category)} Advice
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs mt-2 opacity-70">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main Money Mentor Chat component
const MoneyMentorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FinancialTopicCategory>(FinancialTopicCategory.GENERAL);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Display welcome message on first load
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your Money Mentor powered by Perplexity AI. I can provide advice on budgeting, investing, saving, debt management, retirement planning, taxes, and income generation. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      category: selectedCategory,
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/perplexity/financial-advice', {
        query: inputValue,
        category: selectedCategory,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Replace loading message with actual response
      setMessages((prev) => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isLoading
            ? {
                role: 'assistant',
                content: data.advice,
                category: selectedCategory,
                timestamp: new Date(),
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error getting financial advice:', error);
      
      // Replace loading message with error message
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.isLoading
            ? {
                role: 'assistant',
                content: 'Sorry, I encountered an error while trying to provide advice. This feature may require a Pro subscription or there might be a temporary service disruption. Please try again later.',
                timestamp: new Date(),
              }
            : msg
        )
      );
      
      toast({
        title: 'Error getting advice',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as FinancialTopicCategory);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary" />
          <CardTitle>Money Mentor</CardTitle>
        </div>
        <CardDescription>
          Powered by Perplexity AI - Ask for personalized financial advice
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto mb-4 space-y-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessageItem key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full space-y-2">
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Advice Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FinancialTopicCategory.GENERAL}>General Advice</SelectItem>
                <SelectItem value={FinancialTopicCategory.BUDGETING}>Budgeting</SelectItem>
                <SelectItem value={FinancialTopicCategory.INVESTING}>Investing</SelectItem>
                <SelectItem value={FinancialTopicCategory.SAVING}>Saving</SelectItem>
                <SelectItem value={FinancialTopicCategory.DEBT}>Debt Management</SelectItem>
                <SelectItem value={FinancialTopicCategory.RETIREMENT}>Retirement</SelectItem>
                <SelectItem value={FinancialTopicCategory.TAXES}>Taxes</SelectItem>
                <SelectItem value={FinancialTopicCategory.INCOME}>Income Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for financial advice..."
              className="flex-grow resize-none"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default MoneyMentorChat;