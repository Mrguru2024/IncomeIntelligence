import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export type Rule = {
  id: string;
  type: 'recurring' | 'income-based' | 'time-based' | 'round-up' | 'challenge' | 'seasonal';
  name: string;
  enabled: boolean;
  conditions: {
    amount?: number;
    frequency?: string;
    dates?: Date[];
    selectedDays?: number[];
    roundTo?: number;
    season?: 'high' | 'low';
    challengeType?: 'login' | 'subscription-cancel';
    threshold?: number;
    recurringDate?: Date;
    startDate?: Date;
    endDate?: Date;
  };
  action: {
    type: 'save' | 'invest';
    amount: number;
    amountType: 'fixed' | 'percentage' | 'round-up';
    destination: string;
    roundUpTo?: number;
  };
};

const ruleCategories = {
  recurring: { label: 'Recurring', color: 'bg-blue-500' },
  'income-based': { label: 'Income Based', color: 'bg-green-500' },
  'time-based': { label: 'Time Based', color: 'bg-purple-500' },
  'round-up': { label: 'Round Up', color: 'bg-orange-500' },
  challenge: { label: 'Challenge', color: 'bg-pink-500' },
  seasonal: { label: 'Seasonal', color: 'bg-yellow-500' },
};

export default function SmartRulesEngine() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: 'recurring',
    name: '',
    enabled: true,
    conditions: {},
    action: {
      type: 'save',
      amount: 0,
      destination: 'savings'
    }
  });
  const [isAddingRule, setIsAddingRule] = useState(false);

  const handleAddRule = () => {
    if (!newRule.name || !newRule.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const rule: Rule = {
      id: Date.now().toString(),
      type: newRule.type!,
      name: newRule.name,
      enabled: true,
      conditions: newRule.conditions || {},
      action: newRule.action || {
        type: 'save',
        amount: 0,
        destination: 'savings'
      }
    };

    setRules([...rules, rule]);
    setIsAddingRule(false);
    setNewRule({
      type: 'recurring',
      name: '',
      enabled: true,
      conditions: {},
      action: {
        type: 'save',
        amount: 0,
        destination: 'savings'
      }
    });

    toast({
      title: "Success",
      description: "Rule added successfully",
    });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Deleted",
      description: "The rule has been removed",
    });
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getRuleDescription = (rule: Rule): string => {
    switch (rule.type) {
      case 'recurring':
        return `Save ${rule.action.amountType === 'percentage' ? rule.action.amount + '%' : '$' + rule.action.amount} every ${rule.conditions.frequency || 'month'}`;
      case 'income-based':
        return `Save ${rule.action.amount}% when income exceeds ${rule.conditions.threshold || 0}`;
      case 'time-based':
        return `Save ${rule.action.amount} on specific dates`;
      case 'round-up':
        return `Round up transactions to nearest ${rule.action.roundUpTo || 1}`;
      case 'challenge':
        return `Save ${rule.action.amount} on ${rule.conditions.challengeType || 'specific'} actions`;
      case 'seasonal':
        return `Adjust savings during ${rule.conditions.season || 'specific'} season`;
      default:
        return 'Custom rule';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Rules Engine</CardTitle>
              <CardDescription>Automate your savings with smart rules</CardDescription>
            </div>
            <Button
              onClick={() => setIsAddingRule(true)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Plus size={16} />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {isAddingRule && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 border rounded-lg"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Rule Name</Label>
                      <Input
                        placeholder="Enter rule name"
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Rule Type</Label>
                      <Select
                        value={newRule.type}
                        onValueChange={(value: any) => setNewRule({ ...newRule, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rule type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ruleCategories).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Action Type</Label>
                      <Select
                        value={newRule.action?.type}
                        onValueChange={(value: any) => setNewRule({
                          ...newRule,
                          action: { ...newRule.action!, type: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="save">Save</SelectItem>
                          <SelectItem value="invest">Invest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Amount Type</Label>
                        <Select
                          value={newRule.action?.amountType || 'fixed'}
                          onValueChange={(value: 'fixed' | 'percentage' | 'round-up') => setNewRule({
                            ...newRule,
                            action: { ...newRule.action!, amountType: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="round-up">Round Up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount {newRule.action?.amountType === 'percentage' ? '(%)' : '($)'}</Label>
                        <Input
                          type="number"
                          placeholder={newRule.action?.amountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                          value={newRule.action?.amount || ''}
                          min={0}
                          max={newRule.action?.amountType === 'percentage' ? 100 : undefined}
                          step={newRule.action?.amountType === 'percentage' ? 1 : 0.01}
                          onChange={(e) => setNewRule({
                            ...newRule,
                            action: { ...newRule.action!, amount: parseFloat(e.target.value) }
                          })}
                        />
                      </div>
                      {newRule.action?.amountType === 'round-up' && (
                        <div>
                          <Label>Round Up To</Label>
                          <Input
                            type="number"
                            placeholder="Enter round up amount"
                            value={newRule.action?.roundUpTo || ''}
                            min={0}
                            step={0.01}
                            onChange={(e) => setNewRule({
                              ...newRule,
                              action: { ...newRule.action!, roundUpTo: parseFloat(e.target.value) }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {newRule.type === 'recurring' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Recurring Schedule</Label>
                        <Select
                          value={newRule.conditions?.frequency || 'monthly'}
                          onValueChange={(value) => setNewRule({
                            ...newRule,
                            conditions: { ...newRule.conditions, frequency: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newRule.conditions?.frequency === 'monthly' && (
                        <div>
                          <Label>Monthly Date</Label>
                          <Select
                            value={String(newRule.conditions?.selectedDays?.[0] || 1)}
                            onValueChange={(value) => setNewRule({
                              ...newRule,
                              conditions: {
                                ...newRule.conditions,
                                selectedDays: [parseInt(value)]
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <SelectItem key={day} value={String(day)}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {newRule.conditions?.frequency === 'weekly' && (
                        <div>
                          <Label>Day of Week</Label>
                          <Select
                            value={String(newRule.conditions?.selectedDays?.[0] || 1)}
                            onValueChange={(value) => setNewRule({
                              ...newRule,
                              conditions: {
                                ...newRule.conditions,
                                selectedDays: [parseInt(value)]
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                              <SelectItem value="7">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {newRule.conditions?.frequency === 'yearly' && (
                        <div>
                          <Label>Select Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newRule.conditions?.recurringDate && "text-muted-foreground"
                                )}
                              >
                                {newRule.conditions?.recurringDate ? (
                                  format(newRule.conditions.recurringDate, "MMM dd")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newRule.conditions?.recurringDate}
                                onSelect={(date) => setNewRule({
                                  ...newRule,
                                  conditions: { ...newRule.conditions, recurringDate: date }
                                })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  )}

                  {newRule.type === 'seasonal' && (
                    <div>
                      <Label>Season</Label>
                      <Select
                        value={newRule.conditions?.season}
                        onValueChange={(value: 'high' | 'low') => setNewRule({
                          ...newRule,
                          conditions: { ...newRule.conditions, season: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newRule.type === 'challenge' && (
                    <div>
                      <Label>Challenge Type</Label>
                      <Select
                        value={newRule.conditions?.challengeType}
                        onValueChange={(value: 'login' | 'subscription-cancel') => setNewRule({
                          ...newRule,
                          conditions: { ...newRule.conditions, challengeType: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select challenge type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="login">Login</SelectItem>
                          <SelectItem value="subscription-cancel">Subscription Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}


                  <div className="space-y-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newRule.conditions?.startDate && "text-muted-foreground"
                            )}
                          >
                            {newRule.conditions?.startDate ? (
                              format(newRule.conditions.startDate, "PPP")
                            ) : (
                              <span>Pick a start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newRule.conditions?.startDate}
                            onSelect={(date) => setNewRule({
                              ...newRule,
                              conditions: { ...newRule.conditions, startDate: date }
                            })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newRule.conditions?.endDate && "text-muted-foreground"
                            )}
                          >
                            {newRule.conditions?.endDate ? (
                              format(newRule.conditions.endDate, "PPP")
                            ) : (
                              <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newRule.conditions?.endDate}
                            onSelect={(date) => setNewRule({
                              ...newRule,
                              conditions: { ...newRule.conditions, endDate: date }
                            })}
                            disabled={(date) => (
                              newRule.conditions?.startDate ? date < newRule.conditions.startDate : false
                            )}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingRule(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRule}>
                      Create Rule
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {rules.map(rule => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <Card className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${ruleCategories[rule.type].color} text-white`}>
                            {ruleCategories[rule.type].label}
                          </Badge>
                          <div>
                            <h3 className="font-medium">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getRuleDescription(rule)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {rules.length === 0 && !isAddingRule && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 mb-3" />
                  <p>No rules created yet. Add your first rule to start automating your savings!</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}