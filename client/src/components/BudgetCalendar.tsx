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
  addMonths,
  getWeek,
  isWithinInterval,
  isToday,
  formatISO
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, DollarSign, XCircle } from "lucide-react";
import { Income, Goal } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

// Define view types
type CalendarView = "month" | "week" | "biweek";

export default function BudgetCalendar() {
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  
  // State for day detail modal
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  
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
              <Select 
                value={view} 
                onValueChange={(val: CalendarView) => setView(val)}
                aria-label="Select calendar view"
              >
                <SelectTrigger 
                  className="w-full text-[11px] xs:text-xs sm:text-sm h-8 xs:h-9 hover:border-primary focus:border-primary transition-colors"
                  title="Change calendar view"
                >
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    value="month" 
                    className="focus:bg-primary/10 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Monthly</span>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="biweek" 
                    className="focus:bg-primary/10 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Bi-Weekly</span>
                    </div>
                  </SelectItem>
                  <SelectItem 
                    value="week" 
                    className="focus:bg-primary/10 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Weekly</span>
                    </div>
                  </SelectItem>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevious} 
                className="p-0 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label={`Previous ${view}`}
                title={`View previous ${view}`}
              >
                <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToToday} 
                className="h-7 xs:h-8 sm:h-9 px-1 xs:px-2 sm:px-3 text-[10px] xs:text-xs hover:bg-primary/10 hover:text-primary transition-colors flex items-center"
                aria-label="Go to today"
                title="Jump to current date"
              >
                <Calendar className="h-3 w-3 mr-1 hidden xs:inline-block" />
                Today
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNext} 
                className="p-0 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label={`Next ${view}`}
                title={`View next ${view}`}
              >
                <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-2 px-2 pb-2">
            <div className="min-w-[280px] md:min-w-[500px]"> {/* Support for ultra-narrow (Z Fold) screens */}
              <div className="grid grid-cols-7 gap-0.5 xs:gap-1 text-center text-[9px] xs:text-xs sm:text-sm font-medium">
                {[
                  { letter: "S", full: "Sunday" },
                  { letter: "M", full: "Monday" },
                  { letter: "T", full: "Tuesday" },
                  { letter: "W", full: "Wednesday" },
                  { letter: "T", full: "Thursday" },
                  { letter: "F", full: "Friday" },
                  { letter: "S", full: "Saturday" }
                ].map((day, idx) => (
                  <div 
                    key={idx} 
                    className="py-0.5 xs:py-1 sm:py-2 rounded-sm hover:bg-primary/10 cursor-pointer transition-colors duration-200 flex items-center justify-center"
                    title={day.full}
                    role="button"
                    tabIndex={0}
                    aria-label={day.full}
                    onClick={() => { /* Could add functionality to filter by day of week */ }}
                  >
                    <span className="font-semibold">{day.letter}</span>
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
                      className={`h-[40px] xs:h-[60px] sm:min-h-[80px] border rounded-md p-0.5 overflow-hidden 
                        ${isToday(day) ? "bg-primary/5 border-primary" : "hover:border-primary/50"} 
                        transition-colors duration-200 cursor-pointer
                        ${dayIncomes.length > 0 || dayGoals.length > 0 ? "shadow-sm hover:shadow" : ""}
                      `}
                      onClick={() => {
                        setSelectedDay(day);
                        setIsDayModalOpen(true);
                      }}
                      title={`${format(day, 'EEEE, MMMM d, yyyy')}${dayIncomes.length > 0 ? ` - ${dayIncomes.length} income(s)` : ''}${dayGoals.length > 0 ? ` - ${dayGoals.length} goal(s)` : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}${dayIncomes.length > 0 ? ` with ${dayIncomes.length} income entries` : ''}${dayGoals.length > 0 ? ` and ${dayGoals.length} goals` : ''}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDay(day);
                          setIsDayModalOpen(true);
                        }
                      }}
                    >
                      <div className={`text-right p-0 xs:p-0.5 sm:p-1 font-medium text-[8px] xs:text-xs ${isToday(day) ? "text-primary font-bold" : ""}`}>
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
            <div 
              className="text-center p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              title="View income details"
              aria-label={`Total income for this period: ${formatCurrency(calculateTotalIncome())}`}
              onClick={() => {
                /* Could navigate to incomes page or open income modal */
                console.log('View income details');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  console.log('View income details via keyboard');
                }
              }}
            >
              <h4 className="text-[10px] xs:text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-center">
                <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                Total Income
              </h4>
              <p className="text-sm xs:text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(calculateTotalIncome())}</p>
            </div>
            
            <div 
              className="text-center p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              title="View goals details"
              aria-label={`Total goals due in this period: ${formatCurrency(calculateGoalsAmount())}`}
              onClick={() => {
                /* Could navigate to goals page or open goals modal */
                console.log('View goals details');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  console.log('View goals details via keyboard');
                }
              }}
            >
              <h4 className="text-[10px] xs:text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-center">
                <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                Goals Due
              </h4>
              <p className="text-sm xs:text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(calculateGoalsAmount())}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Day Detail Modal */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="sm:max-w-md bg-background border-2 shadow-lg dark:bg-gray-900">
          {selectedDay && (
            <>
              <div className="absolute right-4 top-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDayModalOpen(false)}
                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                  aria-label="Close dialog"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <DialogHeader className="border-b pb-3">
                <DialogTitle className="text-center text-xl font-bold">
                  {format(selectedDay, "EEEE, MMMM d, yyyy")}
                  {isToday(selectedDay) && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-center pt-1">
                  Financial activity for this day
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4 max-h-[300px] overflow-y-auto px-1 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                {/* Incomes Section */}
                <div>
                  <h3 className="font-medium text-base mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    Income
                  </h3>
                  
                  {getIncomesForDate(selectedDay).length > 0 ? (
                    <div className="space-y-2">
                      {getIncomesForDate(selectedDay).map(income => (
                        <div 
                          key={income.id} 
                          className="p-2 border rounded-md bg-green-50/50 dark:bg-green-950/20"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{income.description}</span>
                            <span className="text-green-600 font-bold">{formatCurrency(parseFloat(income.amount.toString()))}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Category: {income.category || "Uncategorized"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No income recorded for this day.
                    </div>
                  )}
                </div>
                
                {/* Goals Section */}
                <div>
                  <h3 className="font-medium text-base mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                    Goals Due
                  </h3>
                  
                  {getGoalsForDate(selectedDay).length > 0 ? (
                    <div className="space-y-2">
                      {getGoalsForDate(selectedDay).map(goal => {
                        const remaining = parseFloat(goal.targetAmount.toString()) - parseFloat(goal.currentAmount.toString());
                        const progress = (parseFloat(goal.currentAmount.toString()) / parseFloat(goal.targetAmount.toString())) * 100;
                        
                        return (
                          <div 
                            key={goal.id} 
                            className="p-2 border rounded-md bg-blue-50/50 dark:bg-blue-950/20"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{goal.name}</span>
                              <span className={remaining <= 0 ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
                                {remaining <= 0 ? "Completed!" : `${formatCurrency(remaining)} needed`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-1">
                              <div 
                                className={`h-2 rounded-full ${remaining <= 0 ? "bg-green-500" : "bg-blue-500"}`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>Progress: {progress.toFixed(0)}%</span>
                              <span>{formatCurrency(parseFloat(goal.currentAmount.toString()))} / {formatCurrency(parseFloat(goal.targetAmount.toString()))}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No goals due on this day.
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex sm:justify-between gap-2 border-t pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Navigate to previous day
                    const previousDay = new Date(selectedDay);
                    previousDay.setDate(previousDay.getDate() - 1);
                    setSelectedDay(previousDay);
                  }}
                  className="flex-1 bg-white dark:bg-gray-800 hover:bg-primary/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous Day
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Navigate to next day
                    const nextDay = new Date(selectedDay);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setSelectedDay(nextDay);
                  }}
                  className="flex-1 bg-white dark:bg-gray-800 hover:bg-primary/10"
                >
                  Next Day
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}