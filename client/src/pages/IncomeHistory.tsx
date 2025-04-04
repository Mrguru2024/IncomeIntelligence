import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Income, getCategoryById, incomeCategories, InsertIncome } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { format, startOfMonth, endOfMonth, parseISO, addMonths, subMonths, isSameMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  BarChart2Icon,
  PieChartIcon,
  LineChartIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  XIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";
import { apiRequest } from "@/lib/queryClient";
import * as LucideIcons from "lucide-react";

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#8DD1E1', '#A4DE6C', '#D0ED57', '#F7C59F', '#F38181'];

// Schema for income form
const incomeFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
  category: z.string().min(1, "Category is required"),
  date: z.date(),
  source: z.string().default("Manual"),
  notes: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

type GroupByOption = "none" | "month" | "category" | "source";
type ChartType = "bar" | "pie" | "line";

export default function IncomeHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [groupBy, setGroupBy] = useState<GroupByOption>("none");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch incomes
  const { data: incomes = [], isLoading } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });

  // Update income mutation
  const updateIncomeMutation = useMutation({
    mutationFn: async (data: { id: number; income: Partial<InsertIncome> }) => {
      return await apiRequest(`/api/incomes/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data.income)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomes'] });
      toast({
        title: "Income updated",
        description: "Income entry has been successfully updated.",
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update income",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  // Delete income mutation
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/incomes/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomes'] });
      toast({
        title: "Income deleted",
        description: "Income entry has been successfully deleted.",
      });
      setIsDeleteAlertOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete income",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  // Form for editing income
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      source: "Manual",
      notes: "",
    },
  });

  // Reset form with selected income data
  useEffect(() => {
    if (selectedIncome) {
      form.reset({
        description: selectedIncome.description,
        amount: selectedIncome.amount.toString(),
        category: selectedIncome.category || "",
        date: new Date(selectedIncome.date),
        source: selectedIncome.source || "Manual",
        notes: selectedIncome.notes || "",
      });
    }
  }, [selectedIncome, form]);

  // Handle income form submission
  const onSubmit = (data: IncomeFormValues) => {
    if (!selectedIncome) return;
    
    updateIncomeMutation.mutate({
      id: selectedIncome.id,
      income: {
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        source: data.source,
        notes: data.notes,
      },
    });
  };

  // Open edit modal
  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteConfirm = (income: Income) => {
    setSelectedIncome(income);
    setIsDeleteAlertOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  // Filter and sort incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      // Filter by search term
      const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by source
      const matchesSource = filterSource === "all" || income.source === filterSource;
      
      // Filter by category
      const matchesCategory = filterCategory === "all" || income.category === filterCategory;
      
      // Filter by selected month if grouping by month
      const matchesMonth = groupBy !== "month" || isSameMonth(new Date(income.date), selectedMonth);
      
      return matchesSearch && matchesSource && matchesCategory && matchesMonth;
    }).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [incomes, searchTerm, filterSource, filterCategory, sortOrder, groupBy, selectedMonth]);

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, income) => {
    return sum + (typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount);
  }, 0);

  // Group incomes by month
  const incomesByMonth = useMemo(() => {
    const grouped = filteredIncomes.reduce((acc, income) => {
      const date = new Date(income.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthKey,
          total: 0,
          count: 0,
        };
      }
      
      acc[monthKey].total += typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, { name: string; total: number; count: number }>);
    
    return Object.values(grouped).sort((a, b) => {
      // Sort months chronologically
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredIncomes]);

  // Group incomes by category
  const incomesByCategory = useMemo(() => {
    const grouped = filteredIncomes.reduce((acc, income) => {
      const categoryId = income.category || 'other';
      const category = getCategoryById(categoryId);
      const categoryName = category?.name || 'Other';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          total: 0,
          count: 0,
          color: category?.color || '#888',
        };
      }
      
      acc[categoryName].total += typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      acc[categoryName].count += 1;
      
      return acc;
    }, {} as Record<string, { name: string; total: number; count: number; color: string }>);
    
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredIncomes]);

  // Group incomes by source
  const incomesBySource = useMemo(() => {
    const grouped = filteredIncomes.reduce((acc, income) => {
      const source = income.source || 'Manual';
      
      if (!acc[source]) {
        acc[source] = {
          name: source,
          total: 0,
          count: 0,
        };
      }
      
      acc[source].total += typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      acc[source].count += 1;
      
      return acc;
    }, {} as Record<string, { name: string; total: number; count: number }>);
    
    return Object.values(grouped);
  }, [filteredIncomes]);

  // Navigation to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prevMonth => {
      if (direction === 'prev') {
        return subMonths(prevMonth, 1);
      } else {
        return addMonths(prevMonth, 1);
      }
    });
  };

  // Get chart data based on grouping
  const chartData = useMemo(() => {
    switch (groupBy) {
      case 'month':
        return incomesByMonth;
      case 'category':
        return incomesByCategory;
      case 'source':
        return incomesBySource;
      default:
        return [];
    }
  }, [groupBy, incomesByMonth, incomesByCategory, incomesBySource]);

  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-6 mx-auto max-w-[100vw] sm:max-w-7xl overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Income History</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Review, analyze and manage your income</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 overflow-x-auto pb-2 -mx-1 px-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setGroupBy('none')} 
            className={`whitespace-nowrap text-xs sm:text-sm ${groupBy === 'none' ? "bg-primary text-white" : ""}`}
          >
            All Entries
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setGroupBy('month')} 
            className={`whitespace-nowrap text-xs sm:text-sm ${groupBy === 'month' ? "bg-primary text-white" : ""}`}
          >
            By Month
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setGroupBy('category')} 
            className={groupBy === 'category' ? "bg-primary text-white" : ""}
          >
            By Category
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setGroupBy('source')} 
            className={groupBy === 'source' ? "bg-primary text-white" : ""}
          >
            By Source
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
              <p className="text-sm text-gray-500 mt-1">{filteredIncomes.length} entries</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Needs (40%)</p>
              <p className="text-2xl font-bold text-blue-500">{formatCurrency(totalIncome * 0.4)}</p>
              <p className="text-sm text-gray-500 mt-1">Essential expenses</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Investments (30%)</p>
              <p className="text-2xl font-bold text-purple-500">{formatCurrency(totalIncome * 0.3)}</p>
              <p className="text-sm text-gray-500 mt-1">Long-term growth</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Savings (30%)</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome * 0.3)}</p>
              <p className="text-sm text-gray-500 mt-1">Future security</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations section - shown when grouping is applied */}
      {groupBy !== 'none' && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Income {groupBy === 'month' ? 'Monthly' : groupBy === 'category' ? 'by Category' : 'by Source'} Breakdown</CardTitle>
                <CardDescription>
                  {groupBy === 'month' 
                    ? 'View your income trends over time' 
                    : groupBy === 'category'
                      ? 'Analyze your income sources by category'
                      : 'See how your income is distributed by source'}
                </CardDescription>
              </div>
              
              {groupBy === 'month' && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="min-w-[160px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedMonth, 'MMMM yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedMonth}
                        onSelect={(date: Date | undefined) => date && setSelectedMonth(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setChartType('bar')}
                  className={chartType === 'bar' ? "bg-primary text-white" : ""}
                >
                  <BarChart2Icon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setChartType('pie')}
                  className={chartType === 'pie' ? "bg-primary text-white" : ""}
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setChartType('line')}
                  className={chartType === 'line' ? "bg-primary text-white" : ""}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="name"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Legend />
                    </PieChart>
                  ) : chartType === 'line' ? (
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Total Income"
                      />
                    </LineChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar 
                        dataKey="total" 
                        fill="#8884d8" 
                        name="Total Income"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available for the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Income Listing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Income Entries</CardTitle>
          <CardDescription>
            Detailed list of all income transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search income entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[130px]">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[130px]">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {incomeCategories.map((category) => {
                    const iconName = category.icon as keyof typeof LucideIcons;
                    let IconComponent = null;
                    
                    if (iconName in LucideIcons) {
                      IconComponent = LucideIcons[iconName] as React.FC<{ className?: string }>;
                    }
                    
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                className="w-[40px]"
              >
                <ArrowUpDownIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Responsive Content */}
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 opacity-50 hover:opacity-100"
                      onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                    >
                      {sortOrder === "newest" ? (
                        <ArrowDownIcon className="h-3 w-3" />
                      ) : (
                        <ArrowUpIcon className="h-3 w-3" />
                      )}
                    </Button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split (40/30/30)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncomes.map((income) => {
                  const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
                  const needsAmount = amount * 0.4;
                  const investAmount = amount * 0.3;
                  const saveAmount = amount * 0.3;
                  
                  // Get category details
                  const categoryId = income.category || 'other';
                  const category = getCategoryById(categoryId);
                  
                  // Create icon component
                  let IconComponent = null;
                  if (category) {
                    const iconName = category.icon as keyof typeof LucideIcons;
                    if (iconName in LucideIcons) {
                      IconComponent = LucideIcons[iconName] as React.FC<{ className?: string }>;
                    }
                  }

                  return (
                    <tr key={income.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(income.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div>
                          <span className="font-medium">{income.description}</span>
                          {income.notes && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{income.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {IconComponent && (
                            <div className={`p-1 rounded-full ${
                              category?.color === "blue" ? "bg-blue-100" : 
                              category?.color === "red" ? "bg-red-100" : 
                              category?.color === "purple" ? "bg-purple-100" : 
                              category?.color === "indigo" ? "bg-indigo-100" : 
                              category?.color === "amber" ? "bg-amber-100" : 
                              category?.color === "green" ? "bg-green-100" : 
                              "bg-gray-100"
                            }`}>
                              <IconComponent className={`h-3.5 w-3.5 ${
                                category?.color === "blue" ? "text-blue-500" : 
                                category?.color === "red" ? "text-red-500" : 
                                category?.color === "purple" ? "text-purple-500" : 
                                category?.color === "indigo" ? "text-indigo-500" : 
                                category?.color === "amber" ? "text-amber-500" : 
                                category?.color === "green" ? "text-green-500" : 
                                "text-gray-500"
                              }`} />
                            </div>
                          )}
                          <span>{category?.name || 'Other'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0 text-xs">
                            N: {formatCurrency(needsAmount)}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0 text-xs">
                            I: {formatCurrency(investAmount)}
                          </Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-0 text-xs">
                            S: {formatCurrency(saveAmount)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant="outline" className={`border-0 ${income.source === 'Manual' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                          {income.source}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(income)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteConfirm(income)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredIncomes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      {isLoading ? (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <SearchIcon className="h-10 w-10 text-gray-300 mb-2" />
                          <p>No income entries found matching your filters.</p>
                          <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={() => {
                              setSearchTerm("");
                              setFilterSource("all");
                              setFilterCategory("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Hidden on desktop) */}
          <div className="sm:hidden space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredIncomes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                <SearchIcon className="h-10 w-10 text-gray-300 mb-2" />
                <p>No income entries found matching your filters.</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterSource("all");
                    setFilterCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filteredIncomes.map((income) => {
                const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
                const needsAmount = amount * 0.4;
                const investAmount = amount * 0.3;
                const saveAmount = amount * 0.3;
                
                // Get category details
                const categoryId = income.category || 'other';
                const category = getCategoryById(categoryId);
                
                // Create icon component
                let IconComponent = null;
                if (category) {
                  const iconName = category.icon as keyof typeof LucideIcons;
                  if (iconName in LucideIcons) {
                    IconComponent = LucideIcons[iconName] as React.FC<{ className?: string }>;
                  }
                }

                return (
                  <Card key={income.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {IconComponent && (
                              <div className={`p-1 rounded-full ${
                                category?.color === "blue" ? "bg-blue-100" : 
                                category?.color === "red" ? "bg-red-100" : 
                                category?.color === "purple" ? "bg-purple-100" : 
                                category?.color === "indigo" ? "bg-indigo-100" : 
                                category?.color === "amber" ? "bg-amber-100" : 
                                category?.color === "green" ? "bg-green-100" : 
                                "bg-gray-100"
                              }`}>
                                <IconComponent className={`h-3.5 w-3.5 ${
                                  category?.color === "blue" ? "text-blue-500" : 
                                  category?.color === "red" ? "text-red-500" : 
                                  category?.color === "purple" ? "text-purple-500" : 
                                  category?.color === "indigo" ? "text-indigo-500" : 
                                  category?.color === "amber" ? "text-amber-500" : 
                                  category?.color === "green" ? "text-green-500" : 
                                  "text-gray-500"
                                }`} />
                              </div>
                            )}
                            <h3 className="font-medium">{income.description}</h3>
                          </div>
                          <div className="text-sm text-gray-500">{formatDate(income.date)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg mb-1">{formatCurrency(amount)}</div>
                          <Badge variant="outline" className={`border-0 ${income.source === 'Manual' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                            {income.source}
                          </Badge>
                        </div>
                      </div>

                      {income.notes && (
                        <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                          {income.notes}
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="text-xs font-medium text-gray-500 mb-1">Split (40/30/30)</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
                            Needs: {formatCurrency(needsAmount)}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
                            Invest: {formatCurrency(investAmount)}
                          </Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                            Save: {formatCurrency(saveAmount)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(income)}
                        >
                          <EditIcon className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteConfirm(income)}
                        >
                          <TrashIcon className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Income Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Income Entry</DialogTitle>
            <DialogDescription>
              Update the details of this income entry. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Work Project, Contract Payment, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incomeCategories.map((category) => {
                            const iconName = category.icon as keyof typeof LucideIcons;
                            let IconComponent = null;
                            
                            if (iconName in LucideIcons) {
                              IconComponent = LucideIcons[iconName] as React.FC<{ className?: string }>;
                            }
                            
                            return (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
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
                
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manual">Manual Entry</SelectItem>
                          <SelectItem value="Bank">Bank Import</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => {
                  // Ensure field.value is always a string
                  const value = typeof field.value === 'string' ? field.value : '';
                  
                  return (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional details"
                          className="resize-none" 
                          value={value}
                          onChange={(e) => field.onChange(e.target.value)}
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateIncomeMutation.isPending}>
                  {updateIncomeMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the income entry "{selectedIncome?.description}" for {formatCurrency(typeof selectedIncome?.amount === 'string' ? parseFloat(selectedIncome?.amount || '0') : selectedIncome?.amount || 0)}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedIncome && deleteIncomeMutation.mutate(selectedIncome.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteIncomeMutation.isPending}
            >
              {deleteIncomeMutation.isPending ? "Deleting..." : "Delete Income"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
