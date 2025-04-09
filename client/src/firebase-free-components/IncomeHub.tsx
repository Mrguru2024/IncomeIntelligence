import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  BriefcaseBusiness,
  Handshake,
  Pencil,
  PieChart,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  DollarSign,
  Target,
  UsersRound
} from 'lucide-react';

// Mock data for income history
const mockIncomeHistory = [
  { 
    id: 1, 
    date: '2025-04-05', 
    source: 'Client Project', 
    amount: 2500, 
    category: 'Freelance',
    needsAmount: 1000,
    investmentAmount: 750,
    savingsAmount: 750
  },
  { 
    id: 2, 
    date: '2025-03-20', 
    source: 'Website Development', 
    amount: 3800, 
    category: 'Contract Work',
    needsAmount: 1520,
    investmentAmount: 1140,
    savingsAmount: 1140
  },
  { 
    id: 3, 
    date: '2025-03-10', 
    source: 'Logo Design', 
    amount: 850, 
    category: 'Design',
    needsAmount: 340,
    investmentAmount: 255,
    savingsAmount: 255
  },
  { 
    id: 4, 
    date: '2025-02-28', 
    source: 'SEO Consultation', 
    amount: 1200, 
    category: 'Consulting',
    needsAmount: 480,
    investmentAmount: 360,
    savingsAmount: 360
  },
];

// Income generation opportunity cards data
const incomeOpportunities = [
  {
    id: 1,
    title: 'Stackr Gigs Marketplace',
    icon: <BriefcaseBusiness className="h-6 w-6" />,
    description: 'Find short-term service provider jobs posted by businesses needing immediate help.',
    link: '/income-hub/gigs'
  },
  {
    id: 2,
    title: 'Affiliate Program Hub',
    icon: <Handshake className="h-6 w-6" />,
    description: 'Join affiliate programs for tools and services you already use and recommend.',
    link: '/income-hub/affiliates'
  },
  {
    id: 3,
    title: 'Used Gear Listings',
    icon: <ShoppingBag className="h-6 w-6" />,
    description: 'Sell professional equipment you no longer need to other service providers.',
    link: '/income-hub/used-gear'
  },
  {
    id: 4,
    title: 'Referral System',
    icon: <UsersRound className="h-6 w-6" />,
    description: 'Earn rewards for referring other service providers to jobs you can't take.',
    link: '/income-hub/referrals'
  },
  {
    id: 5,
    title: 'Daily Money Challenges',
    icon: <Target className="h-6 w-6" />,
    description: 'Complete daily financial tasks to earn badges and small cash rewards.',
    link: '/income-hub/challenges'
  },
  {
    id: 6,
    title: 'Professional Services Page',
    icon: <PieChart className="h-6 w-6" />,
    description: 'Create a Stackr services page to showcase your offerings and get new clients.',
    link: '/income-hub/services'
  }
];

export default function IncomeHub() {
  const [activeTab, setActiveTab] = useState('history');
  const [newIncomeDialogOpen, setNewIncomeDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    notes: ''
  });
  const { toast } = useToast();
  
  // For calculating allocation based on 40/30/30 split
  const [needsPercentage, setNeedsPercentage] = useState(40);
  const [investmentsPercentage, setInvestmentsPercentage] = useState(30);
  const [savingsPercentage, setSavingsPercentage] = useState(30);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would submit this to the backend
    toast({
      title: "Income added",
      description: `$${formData.amount} from ${formData.source} has been added.`,
    });
    
    setNewIncomeDialogOpen(false);
    setFormData({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      notes: ''
    });
  };
  
  // Calculate allocation for the form data
  const amountValue = parseFloat(formData.amount) || 0;
  const needsAllocation = (needsPercentage / 100) * amountValue;
  const investmentsAllocation = (investmentsPercentage / 100) * amountValue;
  const savingsAllocation = (savingsPercentage / 100) * amountValue;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Income Hub</h1>
          <p className="text-muted-foreground">Track income and explore new opportunities</p>
        </div>
        
        <Button onClick={() => setNewIncomeDialogOpen(true)} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Add Income
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Income History</TabsTrigger>
          <TabsTrigger value="opportunities">Income Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Overview</CardTitle>
              <CardDescription>Your income and allocations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Needs (40%)</TableHead>
                        <TableHead className="text-right">Investments (30%)</TableHead>
                        <TableHead className="text-right">Savings (30%)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockIncomeHistory.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                          <TableCell>{income.source}</TableCell>
                          <TableCell>{income.category}</TableCell>
                          <TableCell className="text-right font-medium">${income.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${income.needsAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${income.investmentAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${income.savingsAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeOpportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                      {opportunity.icon}
                    </div>
                    <CardTitle>{opportunity.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{opportunity.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={newIncomeDialogOpen} onOpenChange={setNewIncomeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Income</DialogTitle>
            <DialogDescription>
              Enter the details for your new income. The 40/30/30 split will be calculated automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="pl-8"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">
                  Source
                </Label>
                <Input
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">
                  Split Preview
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="grid grid-cols-2 items-center gap-1">
                    <span className="text-sm">Needs ({needsPercentage}%)</span>
                    <span className="font-medium">${needsAllocation.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-1">
                    <span className="text-sm">Investments ({investmentsPercentage}%)</span>
                    <span className="font-medium">${investmentsAllocation.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-1">
                    <span className="text-sm">Savings ({savingsPercentage}%)</span>
                    <span className="font-medium">${savingsAllocation.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Income</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}