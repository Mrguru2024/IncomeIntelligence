import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";

// Interface for Gig data structure
interface Gig {
  id: number;
  title: string;
  description: string;
  amount: string;
  status: string;
  requesterUserId: number;
  assignedUserId: number | null;
  category: string;
  skills: string[];
  estimatedHours: string;
  dueDate: string | null;
  completionDate: string | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  location: string;
  hasAttachments: boolean;
}

// Interface for new gig form
interface NewGigForm {
  title: string;
  description: string;
  amount: string;
  category: string;
  location: string;
  estimatedHours: string;
  skills: string;
}

export default function ZenGigs() {
  const { toast } = useToast();
  const [applyingToGigId, setApplyingToGigId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGig, setNewGig] = useState<NewGigForm>({
    title: '',
    description: '',
    amount: '',
    category: 'General',
    location: '',
    estimatedHours: '',
    skills: ''
  });
  
  // Use React Query for data fetching
  const { 
    data: gigs = [], // Default to empty array
    isLoading: loading, 
    error
  } = useQuery<Gig[]>({
    queryKey: ['/api/gigs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    throwOnError: false,
    placeholderData: []
  });
  
  // Apply to gig mutation
  const applyMutation = useMutation({
    mutationFn: async (gigId: number) => {
      const response = await apiRequest('POST', `/api/gigs/${gigId}/apply`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application successful",
        description: "You've successfully applied for this gig!",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs'] });
      setApplyingToGigId(null);
    },
    onError: (error) => {
      toast({
        title: "Error applying to gig",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setApplyingToGigId(null);
    }
  });
  
  // Create gig mutation
  const createGigMutation = useMutation({
    mutationFn: async (gigData: any) => {
      const response = await apiRequest('POST', '/api/gigs', gigData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Gig created successfully",
        description: "Your gig has been posted successfully.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs'] });
      setIsCreateDialogOpen(false);
      // Reset form
      setNewGig({
        title: '',
        description: '',
        amount: '',
        category: 'General',
        location: '',
        estimatedHours: '',
        skills: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating gig",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Handle input changes for the new gig form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission for creating a new gig
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert skills string to array
    const formData = {
      ...newGig,
      skills: newGig.skills.split(',').map(skill => skill.trim()).filter(Boolean)
    };
    
    createGigMutation.mutate(formData);
  };
  
  // Handle apply button click
  const handleApply = (gigId: number) => {
    setApplyingToGigId(gigId);
    applyMutation.mutate(gigId);
  };

  // Show error toast if there's an issue fetching data
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading gigs",
        description: "There was a problem loading gigs. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (loading) return <div>Loading gigs...</div>;
  if (error) return <div>Error loading gigs</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Gigs</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Create Gig
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gigs && gigs.length > 0 ? (
          gigs.map((gig) => (
            <div key={gig.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{gig.title}</h2>
              <p className="text-gray-600 mb-4">{gig.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">${gig.amount}</span>
                <span className="text-sm text-gray-500">{gig.estimatedHours}h</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {gig.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">{gig.location}</span>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-60"
                  onClick={() => handleApply(gig.id)}
                  disabled={applyingToGigId === gig.id || applyMutation.isPending}
                >
                  {applyingToGigId === gig.id ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500">No gigs available at the moment</p>
          </div>
        )}
      </div>
      
      {/* Create Gig Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Gig</DialogTitle>
            <DialogDescription>
              Post a new gig for service providers to apply for.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={newGig.title}
                onChange={handleInputChange}
                placeholder="Enter gig title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newGig.description}
                onChange={handleInputChange}
                placeholder="Describe the gig in detail"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="text"
                  value={newGig.amount}
                  onChange={handleInputChange}
                  placeholder="100.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Est. Hours</Label>
                <Input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="text"
                  value={newGig.estimatedHours}
                  onChange={handleInputChange}
                  placeholder="5"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={newGig.category}
                onChange={handleInputChange}
                placeholder="General"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={newGig.location}
                onChange={handleInputChange}
                placeholder="Remote or physical location"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={newGig.skills}
                onChange={handleInputChange}
                placeholder="JavaScript, React, CSS"
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createGigMutation.isPending}
              >
                {createGigMutation.isPending ? 'Creating...' : 'Create Gig'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}