
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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
    enabled: true
  });

  const handleAddRule = () => {
    const rule: Rule = {
      id: Date.now().toString(),
      type: newRule.type || 'recurring',
      enabled: true,
      conditions: {},
      action: {
        type: 'save',
        amount: 0,
        destination: 'savings'
      }
    };
    setRules([...rules, rule]);
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Smart Rules Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
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
            <Button onClick={handleAddRule}>Add Rule</Button>
          </div>

          <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}

function getRuleDescription(rule: Rule): string {
  switch (rule.type) {
    case 'recurring':
      return 'Save money on a recurring schedule';
    case 'income-based':
      return 'Save based on income thresholds';
    case 'time-based':
      return 'Save on specific dates';
    case 'round-up':
      return 'Round up transactions and save the difference';
    case 'challenge':
      return 'Save money through challenges';
    default:
      return '';
  }
}
