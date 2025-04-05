
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export type Rule = {
  id: string;
  type: 'recurring' | 'income-based' | 'time-based' | 'round-up' | 'challenge';
  enabled: boolean;
  conditions: {
    amount?: number;
    frequency?: string;
    dates?: string[];
    roundTo?: number;
  };
  action: {
    type: 'save' | 'invest';
    amount: number;
    destination: string;
  };
};

export default function SmartRulesEngine() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: 'recurring',
    enabled: true,
    conditions: {},
    action: {
      type: 'save',
      amount: 0,
      destination: 'savings'
    }
  });

  const handleAddRule = () => {
    if (!newRule.type) return;

    const rule: Rule = {
      id: Date.now().toString(),
      type: newRule.type,
      enabled: true,
      conditions: newRule.conditions || {},
      action: newRule.action || {
        type: 'save',
        amount: 0,
        destination: 'savings'
      }
    };
    setRules([...rules, rule]);
    setNewRule({
      type: 'recurring',
      enabled: true,
      conditions: {},
      action: {
        type: 'save',
        amount: 0,
        destination: 'savings'
      }
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
        return `Save ${rule.action.amount} every ${rule.conditions.frequency || 'month'}`;
      case 'income-based':
        return `Save ${rule.action.amount}% when income exceeds ${rule.conditions.amount || 0}`;
      case 'time-based':
        return `Save ${rule.action.amount} on specific dates`;
      case 'round-up':
        return `Round up transactions to nearest ${rule.conditions.roundTo || 1}`;
      case 'challenge':
        return `Save ${rule.action.amount} on specific actions`;
      default:
        return 'Custom rule';
    }
  };

  const handleConditionChange = (value: any, field: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      }
    }));
  };

  const handleActionChange = (value: any, field: string) => {
    setNewRule(prev => ({
      ...prev,
      action: {
        ...prev.action!,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Smart Rules Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="recurring">Recurring Rule</SelectItem>
                      <SelectItem value="income-based">Income-based Rule</SelectItem>
                      <SelectItem value="time-based">Time-based Rule</SelectItem>
                      <SelectItem value="round-up">Round-up Rule</SelectItem>
                      <SelectItem value="challenge">Challenge Rule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newRule.type === 'recurring' && (
                  <div>
                    <Label>Frequency</Label>
                    <Select 
                      value={newRule.conditions?.frequency}
                      onValueChange={(value) => handleConditionChange(value, 'frequency')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newRule.type === 'income-based' && (
                  <div>
                    <Label>Threshold Amount</Label>
                    <Input 
                      type="number"
                      placeholder="Enter amount"
                      value={newRule.conditions?.amount || ''}
                      onChange={(e) => handleConditionChange(parseFloat(e.target.value), 'amount')}
                    />
                  </div>
                )}

                {newRule.type === 'round-up' && (
                  <div>
                    <Label>Round to nearest</Label>
                    <Select 
                      value={newRule.conditions?.roundTo?.toString()}
                      onValueChange={(value) => handleConditionChange(parseInt(value), 'roundTo')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select round amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">$1</SelectItem>
                        <SelectItem value="5">$5</SelectItem>
                        <SelectItem value="10">$10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Action Type</Label>
                  <Select 
                    value={newRule.action?.type}
                    onValueChange={(value: any) => handleActionChange(value, 'type')}
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

                <div>
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    placeholder="Enter amount"
                    value={newRule.action?.amount || ''}
                    onChange={(e) => handleActionChange(parseFloat(e.target.value), 'amount')}
                  />
                </div>
              </div>

              <Button onClick={handleAddRule} className="w-full md:w-auto">Add Rule</Button>
            </div>

            <div className="space-y-4 mt-8">
              {rules.map(rule => (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{rule.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getRuleDescription(rule)}
                      </p>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
