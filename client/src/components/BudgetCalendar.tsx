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
import { ChevronLeft, ChevronRight, Calendar, DollarSign } from "lucide-react";
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
        <CardHeader className="pb-1 px-2 xs:px-4 sm:px-6">
          <div className="flex flex-col justify-between items-start gap-1 xs:gap-2">
            <CardTitle className="text-base xs:text-lg sm:text-2xl">Budget Calendar</CardTitle>
            <div className="w-full">
              <Select value={view} onValueChange={(val: CalendarView) => setView(val)}>
                <SelectTrigger className="w-full text-[11px] xs:text-xs sm:text-sm h-8 xs:h-9">
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
        
        <CardContent className="px-1 xs:px-2 sm:px-6 pt-1 pb-0">
          <div className="flex flex-col justify-between items-start gap-1 xs:gap-2 mb-2 xs:mb-3">
            <h3 className="text-xs xs:text-sm sm:text-lg font-medium truncate w-full">
              {view === "month" 
                ? format(currentDate, "MMMM yyyy")
                : view === "biweek"
                ? `Weeks ${getWeek(dateRange.start)}-${getWeek(dateRange.end)}, ${format(currentDate, "yyyy")}`
                : `Week ${getWeek(currentDate)}, ${format(currentDate, "yyyy")}`
              }
            </h3>
            <div className="flex space-x-1 xs:space-x-2 w-full justify-between xs:justify-start">
              <Button variant="outline" size="sm" onClick={goToPrevious} className="p-0 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9">
                <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="h-7 xs:h-8 sm:h-9 px-1 xs:px-2 sm:px-3 text-[10px] xs:text-xs">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext} className="p-0 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9">
                <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-2 px-2 pb-2">
            <div className="min-w-[280px] md:min-w-[500px]"> {/* Support for ultra-narrow (Z Fold) screens */}
              <div className="grid grid-cols-7 gap-0.5 xs:gap-1 text-center text-[8px] xs:text-xs sm:text-sm font-medium">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <div key={idx} className="py-0.5 xs:py-1 sm:py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-0.5 xs:gap-1 mt-0.5 xs:mt-1">
                {days.map((day, i) => {
                  const dayIncomes = getIncomesForDate(day);
                  const dayGoals = getGoalsForDate(day);
                  const dayIncomesTotal = dayIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount.toString()), 0);
                  
                  return (
                    <div
                      key={i}
                      className={`h-[40px] xs:h-[60px] sm:min-h-[80px] border rounded-md p-0.5 overflow-hidden ${
                        isToday(day) ? "bg-primary/5 border-primary" : ""
                      }`}
                    >
                      <div className="text-right p-0 xs:p-0.5 sm:p-1 font-medium text-[8px] xs:text-xs">
                        {format(day, "d")}
                      </div>
                      
                      <div className="text-[8px] xs:text-[10px] sm:text-xs space-y-0.5 sm:space-y-1">
                        {dayIncomes.length > 0 && (
                          <div className="bg-green-50 p-0.5 rounded text-green-800 flex items-center text-[7px] xs:text-[9px] sm:text-xs">
                            <DollarSign className="h-1.5 w-1.5 xs:h-2 xs:w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                            <span className="truncate">{formatCurrency(dayIncomesTotal)}</span>
                          </div>
                        )}
                        
                        {dayGoals.map((goal) => (
                          <div key={goal.id} className="bg-blue-50 p-0.5 rounded text-blue-800 text-[7px] xs:text-[9px] truncate">
                            {goal.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t px-1 xs:px-2 sm:px-6 py-2 xs:py-3 sm:py-4">
          <div className="w-full grid grid-cols-2 gap-1 xs:gap-2 sm:gap-4">
            <div className="text-center">
              <h4 className="text-[10px] xs:text-xs sm:text-sm font-medium text-muted-foreground">Total Income</h4>
              <p className="text-sm xs:text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(calculateTotalIncome())}</p>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] xs:text-xs sm:text-sm font-medium text-muted-foreground">Goals Due</h4>
              <p className="text-sm xs:text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(calculateGoalsAmount())}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}