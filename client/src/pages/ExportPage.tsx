import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download, FileText, Table } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import {
  exportToCSV,
  exportToPDF,
  formatIncomeData,
  formatExpenseData,
  formatGoalsData,
  formatBudgetData,
  formatTransactionData,
  ExportableData,
} from "@/lib/exportUtils";

const DataTypeSelector = ({
  dataType,
  setDataType,
}: {
  dataType: string;
  setDataType: (dataType: string) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="data-type">Select data to export</Label>
      <Select value={dataType} onValueChange={setDataType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select data type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="incomes">Income Records</SelectItem>
          <SelectItem value="expenses">Expense Records</SelectItem>
          <SelectItem value="goals">Financial Goals</SelectItem>
          <SelectItem value="budgets">Budget Records</SelectItem>
          <SelectItem value="transactions">Bank Transactions</SelectItem>
          <SelectItem value="all">All Financial Data</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const DateRangeSelector = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Date</Label>
        <DatePicker
          date={startDate}
          setDate={setStartDate}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>End Date</Label>
        <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
      </div>
    </div>
  );
};

const FilterOptions = ({
  includeNotes,
  setIncludeNotes,
  includeCategoryBreakdown,
  setIncludeCategoryBreakdown,
}: {
  includeNotes: boolean;
  setIncludeNotes: (include: boolean) => void;
  includeCategoryBreakdown: boolean;
  setIncludeCategoryBreakdown: (include: boolean) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="include-notes" className="cursor-pointer">
          Include notes & descriptions
        </Label>
        <Switch
          id="include-notes"
          checked={includeNotes}
          onCheckedChange={setIncludeNotes}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="include-category-breakdown" className="cursor-pointer">
          Include category breakdown
        </Label>
        <Switch
          id="include-category-breakdown"
          checked={includeCategoryBreakdown}
          onCheckedChange={setIncludeCategoryBreakdown}
        />
      </div>
    </div>
  );
};

const ExportPage = () => {
  const { toast } = useToast();
  const [dataType, setDataType] = useState("incomes");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeCategoryBreakdown, setIncludeCategoryBreakdown] =
    useState(true);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");

  // Fetch income data
  const { data: incomeData, isLoading: incomesLoading } = useQuery({
    queryKey: ["/api/incomes"],
    enabled: dataType === "incomes" || dataType === "all",
  });

  // Fetch expense data
  const { data: expenseData, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
    enabled: dataType === "expenses" || dataType === "all",
  });

  // Fetch goals data
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/goals"],
    enabled: dataType === "goals" || dataType === "all",
  });

  // Fetch budget data - assuming budget API endpoint
  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ["/api/budgets"],
    enabled: dataType === "budgets" || dataType === "all",
  });

  // Fetch bank transactions - assuming transaction API endpoint
  const { data: transactionData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: dataType === "transactions" || dataType === "all",
  });

  const isLoading =
    incomesLoading ||
    expensesLoading ||
    goalsLoading ||
    budgetLoading ||
    transactionsLoading;

  const filterDataByDateRange = (data: any[] | undefined) => {
    if (!data) return [];
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
    });
  };

  const handleExport = () => {
    try {
      const fileName = `stackr-${dataType}-${new Date().toISOString().split("T")[0]}`;
      const options = {
        fileName,
        title: `Stackr Financial Data: ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`,
        subtitle:
          startDate && endDate
            ? `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : undefined,
        includeDate: true,
      };

      let exportData: ExportableData | null = null;

      // Format data based on selected data type
      switch (dataType) {
        case "incomes":
          exportData = formatIncomeData(filterDataByDateRange(incomeData));
          break;
        case "expenses":
          exportData = formatExpenseData(filterDataByDateRange(expenseData));
          break;
        case "goals":
          exportData = formatGoalsData(goalsData || []);
          break;
        case "budgets":
          exportData = formatBudgetData(budgetData || []);
          break;
        case "transactions":
          exportData = formatTransactionData(
            filterDataByDateRange(transactionData),
          );
          break;
        case "all":
          // For all data, we'll create a combined export with multiple sections
          // This is a simplified approach - in a real app we'd likely create a more
          // structured report with separate sections

          const allData: ExportableData = {
            headers: ["Type", "Description", "Amount", "Category", "Date"],
            data: [],
          };

          // Add incomes
          if (incomeData) {
            filterDataByDateRange(incomeData).forEach((income) => {
              allData.data.push([
                "Income",
                income.description,
                `$${parseFloat(income.amount).toFixed(2)}`,
                income.category,
                new Date(income.date).toLocaleDateString(),
              ]);
            });
          }

          // Add expenses
          if (expenseData) {
            filterDataByDateRange(expenseData).forEach((expense) => {
              allData.data.push([
                "Expense",
                expense.description,
                `$${parseFloat(expense.amount).toFixed(2)}`,
                expense.category,
                new Date(expense.date).toLocaleDateString(),
              ]);
            });
          }

          // Sort by date
          allData.data.sort((a, b) => {
            return new Date(b[4]).getTime() - new Date(a[4]).getTime();
          });

          exportData = allData;
          break;
      }

      // Perform the export based on the selected format
      if (exportData) {
        if (exportFormat === "csv") {
          exportToCSV(exportData, options);
        } else {
          exportToPDF(exportData, options);
        }

        toast({
          title: "Export Successful",
          description: `Your ${dataType} data has been exported as a ${exportFormat.toUpperCase()} file.`,
        });
      } else {
        throw new Error("No data available to export");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Export Financial Data</h1>
      <p className="text-muted-foreground mb-8">
        Export your financial data for record keeping, tax purposes, or further
        analysis in your preferred tools.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Select the type of data you want to export and set your
              preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DataTypeSelector dataType={dataType} setDataType={setDataType} />
            <DateRangeSelector
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            <FilterOptions
              includeNotes={includeNotes}
              setIncludeNotes={setIncludeNotes}
              includeCategoryBreakdown={includeCategoryBreakdown}
              setIncludeCategoryBreakdown={setIncludeCategoryBreakdown}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
            <CardDescription>
              Choose how you want your data delivered.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={exportFormat === "csv" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-24 ${
                  exportFormat === "csv" ? "border-primary" : ""
                }`}
                onClick={() => setExportFormat("csv")}
              >
                <Table className="h-8 w-8 mb-2" />
                <span>CSV File</span>
                <span className="text-xs text-muted-foreground mt-1">
                  For spreadsheets
                </span>
              </Button>
              <Button
                variant={exportFormat === "pdf" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-24 ${
                  exportFormat === "pdf" ? "border-primary" : ""
                }`}
                onClick={() => setExportFormat("pdf")}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span>PDF Document</span>
                <span className="text-xs text-muted-foreground mt-1">
                  For printing/sharing
                </span>
              </Button>
            </div>

            <div className="mt-8">
              <Button
                className="w-full py-6"
                size="lg"
                onClick={handleExport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading Data...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <p className="text-sm text-muted-foreground text-center">
              Exports include data filtered by your selected date range and
              preferences
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ExportPage;
