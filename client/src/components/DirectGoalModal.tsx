import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import VanillaModal from './VanillaModal';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TargetIcon, PiggyBankIcon, TrendingUpIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function DirectGoalModal({ onClose }: { onClose: () => void }) {
  // State management for the form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use useEffect to set focus when modal opens
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, []);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (!name || !targetAmount || !type) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Submit the form
      const formData = {
        name,
        description,
        type,
        targetAmount: targetAmount, // Keep as string for numeric type in DB
        currentAmount: "0", // Send as string for numeric type in DB
        userId: 1, // Default user for now
        startDate: new Date(),
        deadline: deadline || null,
      };
      
      await apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });

      // Show success message
      toast({
        title: "Goal created",
        description: "Your goal has been created successfully",
      });
      
      // Invalidate goals cache
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Failed to create goal",
        description: "There was an error creating your goal",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Get icon by goal type
  const getGoalIcon = () => {
    switch (type) {
      case 'income':
        return <TargetIcon className="h-5 w-5 text-blue-500" />;
      case 'savings':
        return <PiggyBankIcon className="h-5 w-5 text-emerald-500" />;
      case 'investments':
        return <TrendingUpIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <TargetIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper for type-specific colors
  const getTypeColor = () => {
    switch (type) {
      case 'income': return 'border-blue-200 bg-blue-50';
      case 'savings': return 'border-emerald-200 bg-emerald-50';
      case 'investments': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <VanillaModal 
      title="Create New Goal" 
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-5">
        <div className={`p-3 rounded-md border ${getTypeColor()} mb-2`}>
          <div className="flex items-center gap-3">
            {getGoalIcon()}
            <div>
              <h4 className="font-medium text-sm">{type.charAt(0).toUpperCase() + type.slice(1)} Goal</h4>
              <p className="text-xs text-gray-600">
                {type === 'income' && 'Track income targets for financial growth'}
                {type === 'savings' && 'Save for emergencies or future purchases'}
                {type === 'investments' && 'Grow your wealth through investments'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Goal Name *</Label>
          <Input
            id="name"
            ref={nameInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., New Car, Emergency Fund"
            className="text-sm"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this goal important?"
            className="text-sm resize-none"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium">Goal Type *</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select goal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income" className="text-sm">
                <div className="flex items-center gap-2">
                  <TargetIcon className="h-4 w-4 text-blue-500" />
                  Income
                </div>
              </SelectItem>
              <SelectItem value="savings" className="text-sm">
                <div className="flex items-center gap-2">
                  <PiggyBankIcon className="h-4 w-4 text-emerald-500" />
                  Savings
                </div>
              </SelectItem>
              <SelectItem value="investments" className="text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-purple-500" />
                  Investments
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetAmount" className="text-sm font-medium">Target Amount *</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="targetAmount"
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              className="pl-7 text-sm"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deadline" className="text-sm font-medium">Deadline Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="deadline"
                variant="outline"
                className="w-full justify-start text-left font-normal text-sm"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                {deadline ? format(deadline, "MMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {deadline && (
            <p className="text-xs text-muted-foreground mt-1">
              Deadline set for {format(deadline, "EEEE, MMMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
    </VanillaModal>
  );
}