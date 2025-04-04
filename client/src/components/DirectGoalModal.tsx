import React, { useState } from 'react';
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function DirectGoalModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VanillaModal 
      title="Create New Goal" 
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Goal Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., New Car, Emergency Fund"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this goal important?"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Goal Type *</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select goal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="investments">Investments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount *</Label>
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
              className="pl-7"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
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
        </div>
      </div>
    </VanillaModal>
  );
}