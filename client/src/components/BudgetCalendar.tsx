import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addWeeks,
  getWeek,
  isWithinInterval,
  isToday,
  formatISO
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { Income, Goal } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format";

// Define view types
type CalendarView = "month" | "week" | "biweek";

export default function BudgetCalendar() {
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  
  // Get incomes and goals from API
  const { data: incomes = [] } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });
  
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Calculate date range based on view
  const getDateRange = () => {
    if (view === "month") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    } else if (view === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      };
    } else if (view === "biweek") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return {
        start: weekStart,
        end: endOfWeek(addWeeks(weekStart, 1), { weekStartsOn: 0 }),
      };
    }
    
    // Default to month
    return {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    };
  };
  
  const dateRange = getDateRange();
  const days = eachDayOfInterval({
    start: dateRange.start,
    end: dateRange.end,
  });
  
  // Navigation handlers
  const goToPrevious = () => {
    if (view === "month") {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    } else if (view === "week") {
      setCurrentDate(prevDate => addWeeks(prevDate, -1));
    } else if (view === "biweek") {
      setCurrentDate(prevDate => addWeeks(prevDate, -2));
    }
  };
  
  const goToNext = () => {
    if (view === "month") {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    } else if (view === "week") {
      setCurrentDate(prevDate => addWeeks(prevDate, 1));
    } else if (view === "biweek") {
      setCurrentDate(prevDate => addWeeks(prevDate, 2));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Calculate income for a specific date
  const getIncomesForDate = (date: Date) => {
    return incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return isSameDay(incomeDate, date);
    });
  };
  
  // Calculate goals due on a specific date
  const getGoalsForDate = (date: Date) => {
    return goals.filter(goal => {
      if (!goal.deadline) return false;
      const deadlineDate = new Date(goal.deadline);
      return isSameDay(deadlineDate, date);
    });
  };
  
  // Calculate total income for current view
  const calculateTotalIncome = () => {
    let total = 0;
    
    incomes.forEach(income => {
      const incomeDate = new Date(income.date);
      
      if (isWithinInterval(incomeDate, {
        start: dateRange.start,
        end: dateRange.end
      })) {
        total += parseFloat(income.amount.toString());
      }
    });
    
    return total;
  };
  
  // Calculate total goals due in current view
  const calculateGoalsAmount = () => {
    let total = 0;
    
    goals.forEach(goal => {
      if (!goal.deadline) return;
      
      const deadlineDate = new Date(goal.deadline);
      
      if (isWithinInterval(deadlineDate, {
        start: dateRange.start,
        end: dateRange.end
      })) {
        const remaining = parseFloat(goal.targetAmount.toString()) - parseFloat(goal.currentAmount.toString());
        total += remaining > 0 ? remaining : 0;
      }
    });
    
    return total;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Budget Calendar</CardTitle>
            <div className="flex space-x-2">
              <Select value={view} onValueChange={(val: CalendarView) => setView(val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="biweek">Bi-Weekly</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {view === "month" 
                ? format(currentDate, "MMMM yyyy")
                : view === "biweek"
                ? `Weeks ${getWeek(dateRange.start)} - ${getWeek(dateRange.end)}, ${format(currentDate, "yyyy")}`
                : `Week ${getWeek(currentDate)}, ${format(currentDate, "yyyy")}`
              }
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={goToPrevious}>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mt-1">
            {days.map((day, i) => {
              const dayIncomes = getIncomesForDate(day);
              const dayGoals = getGoalsForDate(day);
              const dayIncomesTotal = dayIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount.toString()), 0);
              
              return (
                <div
                  key={i}
                  className={`min-h-[100px] border rounded-md p-1 ${
                    isToday(day) ? "bg-primary-50 border-primary" : ""
                  }`}
                >
                  <div className="text-right p-1 font-medium">
                    {format(day, "d")}
                  </div>
                  
                  <div className="text-xs space-y-1">
                    {dayIncomes.length > 0 && (
                      <div className="bg-green-50 p-1 rounded text-green-800 flex items-center">
                        <DollarSignIcon className="h-3 w-3 mr-1" />
                        {formatCurrency(dayIncomesTotal)}
                      </div>
                    )}
                    
                    {dayGoals.map((goal) => (
                      <div key={goal.id} className="bg-blue-50 p-1 rounded text-blue-800 text-[10px] truncate">
                        {goal.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter className="border-t">
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Total Income</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalIncome())}</p>
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Goal Payments Due</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateGoalsAmount())}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}