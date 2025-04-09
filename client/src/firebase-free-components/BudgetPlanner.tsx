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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  FileText,
  Zap
} from 'lucide-react';

// Mock data for budget categories
const mockBudgetCategories = [
  { 
    id: 1, 
    category: 'Housing', 
    allocation: 1500, 
    spent: 1480,
    remaining: 20, 
    type: 'Needs'
  },
  { 
    id: 2, 
    category: 'Groceries', 
    allocation: 600, 
    spent: 450,
    remaining: 150, 
    type: 'Needs'
  },
  { 
    id: 3, 
    category: 'Utilities', 
    allocation: 300, 
    spent: 290,
    remaining: 10, 
    type: 'Needs'
  },
  { 
    id: 4, 
    category: 'Stock Market', 
    allocation: 1000, 
    spent: 1000,
    remaining: 0, 
    type: 'Investments'
  },
  { 
    id: 5, 
    category: 'Real Estate Fund', 
    allocation: 500, 
    spent: 500,
    remaining: 0, 
    type: 'Investments'
  },
  { 
    id: 6, 
    category: 'Emergency Fund', 
    allocation: 800, 
    spent: 800,
    remaining: 0, 
    type: 'Savings'
  },
  { 
    id: 7, 
    category: 'Vacation Fund', 
    allocation: 300, 
    spent: 300,
    remaining: 0, 
    type: 'Savings'
  },
];

// Mock data for recent expenses
const mockRecentExpenses = [
  { 
    id: 1, 
    date: '2025-04-05', 
    category: 'Housing', 
    description: 'Rent payment', 
    amount: 1480 
  },
  { 
    id: 2, 
    date: '2025-04-04', 
    category: 'Groceries', 
    description: 'Weekly shopping', 
    amount: 150 
  },
  { 
    id: 3, 
    date: '2025-04-03', 
    category: 'Utilities', 
    description: 'Electricity bill', 
    amount: 95 
  },
  { 
    id: 4, 
    date: '2025-04-02', 
    category: 'Groceries', 
    description: 'Farmer\'s market', 
    amount: 75 
  },
];

// Mock budget summary data
const budgetSummary = {
  totalIncome: 4800,
  totalAllocated: 5000,
  totalSpent: 4820,
  totalRemaining: 180,
  needsAllocation: 2400,
  investmentsAllocation: 1500,
  savingsAllocation: 1100,
  needsSpent: 2220,
  investmentsSpent: 1500,
  savingsSpent: 1100,
};

export default function BudgetPlanner() {
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [newExpenseDialogOpen, setNewExpenseDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    category: '',
    allocation: '',
    type: 'Needs'
  });
  const [expenseFormData, setExpenseFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const { toast } = useToast();
  
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };
  
  const handleCategoryTypeChange = (value: string) => {
    setCategoryFormData({ ...categoryFormData, type: value });
  };
  
  const handleExpenseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpenseFormData({ ...expenseFormData, [name]: value });
  };
  
  const handleExpenseCategoryChange = (value: string) => {
    setExpenseFormData({ ...expenseFormData, category: value });
  };
  
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Budget category added",
      description: `${categoryFormData.category} with allocation of $${categoryFormData.allocation} has been added.`,
    });
    
    setNewCategoryDialogOpen(false);
    setCategoryFormData({
      category: '',
      allocation: '',
      type: 'Needs'
    });
  };
  
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Expense added",
      description: `$${expenseFormData.amount} for ${expenseFormData.description} has been added.`,
    });
    
    setNewExpenseDialogOpen(false);
    setExpenseFormData({
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };
  
  // Calculate category allocation percentages for the progress bars
  const getCategoryProgress = (allocated: number, spent: number) => {
    return allocated > 0 ? (spent / allocated) * 100 : 0;
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budget Planner</h1>
          <p className="text-muted-foreground">Manage your 40/30/30 split budget</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Button onClick={() => setNewCategoryDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
          <Button onClick={() => setNewExpenseDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Needs (40%)</CardTitle>
            <CardDescription>Essential expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${budgetSummary.needsSpent.toLocaleString()} / ${budgetSummary.needsAllocation.toLocaleString()}</div>
            <Progress 
              value={(budgetSummary.needsSpent / budgetSummary.needsAllocation) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Investments (30%)</CardTitle>
            <CardDescription>Growth opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${budgetSummary.investmentsSpent.toLocaleString()} / ${budgetSummary.investmentsAllocation.toLocaleString()}</div>
            <Progress 
              value={(budgetSummary.investmentsSpent / budgetSummary.investmentsAllocation) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Savings (30%)</CardTitle>
            <CardDescription>For the future</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${budgetSummary.savingsSpent.toLocaleString()} / ${budgetSummary.savingsAllocation.toLocaleString()}</div>
            <Progress 
              value={(budgetSummary.savingsSpent / budgetSummary.savingsAllocation) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Your budget allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Allocation</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right">Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBudgetCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.category}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.type === 'Needs' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                : category.type === 'Investments'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                            }`}
                          >
                            {category.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">${category.allocation.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${category.spent.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${category.remaining.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Progress 
                            value={getCategoryProgress(category.allocation, category.spent)} 
                            className="h-2" 
                          />
                        </TableCell>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Last recorded expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-medium">${expense.amount.toLocaleString()}</TableCell>
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Budget Tools</CardTitle>
          <CardDescription>Helpful tools for budget management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center text-center">
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-medium">Export Budget Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center text-center">
              <Zap className="h-6 w-6 mb-2" />
              <span className="font-medium">AI Budget Analysis</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center text-center">
              <ArrowUpRight className="h-6 w-6 mb-2" />
              <span className="font-medium">Expense Trends</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center text-center">
              <ArrowDownRight className="h-6 w-6 mb-2" />
              <span className="font-medium">Savings Calculator</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Category Dialog */}
      <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
            <DialogDescription>
              Create a new budget category with a monthly allocation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={categoryFormData.category}
                  onChange={handleCategoryInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allocation" className="text-right">
                  Allocation
                </Label>
                <div className="col-span-3 relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="allocation"
                    name="allocation"
                    value={categoryFormData.allocation}
                    onChange={handleCategoryInputChange}
                    className="pl-8"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select 
                  value={categoryFormData.type} 
                  onValueChange={handleCategoryTypeChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Needs">Needs (40%)</SelectItem>
                    <SelectItem value="Investments">Investments (30%)</SelectItem>
                    <SelectItem value="Savings">Savings (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Expense Dialog */}
      <Dialog open={newExpenseDialogOpen} onOpenChange={setNewExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for your budget.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit}>
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
                    value={expenseFormData.amount}
                    onChange={handleExpenseInputChange}
                    className="pl-8"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category-select" className="text-right">
                  Category
                </Label>
                <Select 
                  value={expenseFormData.category} 
                  onValueChange={handleExpenseCategoryChange}
                >
                  <SelectTrigger id="category-select" className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBudgetCategories.map(category => (
                      <SelectItem key={category.id} value={category.category}>
                        {category.category} - {category.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={expenseFormData.date}
                  onChange={handleExpenseInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={expenseFormData.description}
                  onChange={handleExpenseInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}