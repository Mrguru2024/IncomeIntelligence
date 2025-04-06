import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Briefcase, 
  Search, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Tag,
  Plus,
  Loader2
} from "lucide-react";

const StackrGigs = () => {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Placeholder - would be replaced with real API call
  const { data: gigs, isLoading } = useQuery({
    queryKey: ["/api/gigs"], 
    enabled: !!user,
  });

  // Sample gigs data for demonstration
  const sampleGigs = [
    {
      id: 1,
      title: "Website Feedback - 30 Min Test",
      description: "Test my new locksmith website and provide detailed feedback on usability and design.",
      amount: 25,
      category: "digital",
      status: "open",
      requesterName: "Michael S.",
      location: "Remote",
      estimatedHours: 0.5,
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      skills: ["Web Testing", "Feedback"],
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 2,
      title: "Optimize My Service Van Organization",
      description: "Need advice and implementation tips to better organize my locksmith service van. Send photos of your own setup for reference.",
      amount: 40,
      category: "consulting",
      status: "open",
      requesterName: "David R.",
      location: "Remote",
      estimatedHours: 1,
      dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      skills: ["Organization", "Service Vehicles"],
      createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
      id: 3,
      title: "Create Quote Template for Excel",
      description: "Need someone to create a professional Excel template for generating customer quotes quickly.",
      amount: 35,
      category: "digital",
      status: "open",
      requesterName: "Sandra T.",
      location: "Remote",
      estimatedHours: 1.5,
      dueDate: new Date(Date.now() + 86400000 * 4), // 4 days from now
      skills: ["Excel", "Templates"],
      createdAt: new Date(Date.now() - 86400000 * 1)
    },
    {
      id: 4,
      title: "Social Media Post Creation - 1 Week",
      description: "Create 7 professional social media posts for my locksmith business. Need captions and simple graphics.",
      amount: 70,
      category: "marketing",
      status: "open",
      requesterName: "James L.",
      location: "Remote",
      estimatedHours: 3,
      dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      skills: ["Social Media", "Graphics", "Copywriting"],
      createdAt: new Date(Date.now() - 86400000 * 3)
    },
    {
      id: 5,
      title: "Equipment Photography - 10 Items",
      description: "Need professional photos of 10 locksmith tools for my online store. Must have proper lighting and white background.",
      amount: 60,
      category: "photography",
      status: "assigned",
      requesterName: "Robert K.",
      location: "Denver, CO (Local)",
      estimatedHours: 2,
      dueDate: new Date(Date.now() + 86400000 * 6), // 6 days from now
      skills: ["Photography", "Product Photos"],
      createdAt: new Date(Date.now() - 86400000 * 5)
    }
  ];

  const gigsToDisplay = gigs || sampleGigs;
  
  // Filter by search term and category
  const filteredGigs = gigsToDisplay.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || gig.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "digital", name: "Digital Tasks" },
    { id: "consulting", name: "Consulting" },
    { id: "marketing", name: "Marketing" },
    { id: "photography", name: "Photography" },
    { id: "writing", name: "Writing" },
    { id: "other", name: "Other" }
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stackr Gigs</h1>
          <p className="text-muted-foreground">Find quick tasks to earn extra income</p>
        </div>
        <Button onClick={() => setLocation("/income/gigs/new")} className="gap-2">
          <Plus size={16} />
          Post New Gig
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gigs..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-span-1">
          <select 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gigs Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="my-gigs">My Gigs</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGigs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No gigs found matching your criteria</p>
                <Button variant="link" onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGigs.map((gig) => (
                <Card key={gig.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="outline" className="mb-1">
                        {gig.category.charAt(0).toUpperCase() + gig.category.slice(1)}
                      </Badge>
                      <Badge variant={gig.status === "open" ? "default" : "secondary"}>
                        {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{gig.title}</CardTitle>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{gig.requesterName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <CardDescription>{gig.requesterName}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 mb-4">{gig.description}</p>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">${gig.amount}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{gig.estimatedHours} {gig.estimatedHours === 1 ? 'hour' : 'hours'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Due {formatDate(gig.dueDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{gig.location}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {gig.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="default" className="w-full gap-2" onClick={() => setLocation(`/income/gigs/${gig.id}`)}>
                      View Details
                      <ArrowRight size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-gigs">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No active gigs yet</p>
              <p className="text-muted-foreground text-center mb-4">
                You haven't accepted any gigs yet. Browse the marketplace to find tasks that match your skills.
              </p>
              <Button onClick={() => document.querySelector('button[value="browse"]')?.click()}>
                Browse Available Gigs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="posted">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No posted gigs</p>
              <p className="text-muted-foreground text-center mb-4">
                You haven't posted any gigs yet. Create a new gig to find help with tasks.
              </p>
              <Button onClick={() => setLocation("/income/gigs/new")}>
                Post a New Gig
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No completed gigs</p>
              <p className="text-muted-foreground text-center mb-4">
                You haven't completed any gigs yet. Gigs you complete will appear here.
              </p>
              <Button onClick={() => document.querySelector('button[value="browse"]')?.click()}>
                Find Gigs to Complete
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">How Stackr Gigs Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Find a Gig</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse the marketplace for tasks that match your skills. Filter by category, price, and time commitment.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. Complete the Work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Accept the gig and complete the requested task. Submit your work through the platform for review.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>3. Get Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Once your work is approved, payment is released to your account. Funds can be withdrawn or used within Stackr.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StackrGigs;