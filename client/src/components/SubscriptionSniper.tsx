
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { Expense } from '@shared/schema';
import { ArrowDownIcon, ArrowUpIcon, AlertTriangle, CheckCircle } from 'lucide-react';

interface SubscriptionGroup {
  name: string;
  amount: number;
  frequency: string;
  lastCharge: Date;
  nextEstimatedCharge: Date;
  risk: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export default function SubscriptionSniper() {
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ['expenses'],
  });

  // Group recurring expenses and analyze patterns
  const subscriptions = expenses
    ?.filter(expense => expense.isRecurring)
    .reduce((groups: { [key: string]: SubscriptionGroup }, expense) => {
      const amount = parseFloat(expense.amount.toString());
      const name = expense.description;
      
      if (!groups[name]) {
        groups[name] = {
          name,
          amount,
          frequency: expense.recurringPeriod || 'monthly',
          lastCharge: new Date(expense.date),
          nextEstimatedCharge: new Date(expense.date),
          risk: amount > 50 ? 'high' : amount > 20 ? 'medium' : 'low',
          suggestion: amount > 50 ? 'Consider reviewing this subscription' : undefined
        };
      }
      
      return groups;
    }, {});

  const totalMonthly = Object.values(subscriptions || {}).reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Sniper</CardTitle>
          <CardDescription>
            Track and optimize your recurring expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Monthly Subscription Total: {formatCurrency(totalMonthly)}
            </h3>
            <p className="text-sm text-gray-500">
              {Object.keys(subscriptions || {}).length} active subscriptions detected
            </p>
          </div>

          <div className="space-y-4">
            {Object.values(subscriptions || {}).map((sub) => (
              <Card key={sub.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{sub.name}</h4>
                    <p className="text-sm text-gray-500">{formatCurrency(sub.amount)} / {sub.frequency}</p>
                  </div>
                  <Badge variant={
                    sub.risk === 'high' ? 'destructive' :
                    sub.risk === 'medium' ? 'warning' : 'default'
                  }>
                    {sub.risk === 'high' ? <AlertTriangle className="w-4 h-4 mr-1" /> :
                     sub.risk === 'medium' ? <ArrowUpIcon className="w-4 h-4 mr-1" /> :
                     <CheckCircle className="w-4 h-4 mr-1" />}
                    {sub.risk.toUpperCase()}
                  </Badge>
                </div>
                {sub.suggestion && (
                  <p className="text-sm text-amber-600 mt-2">{sub.suggestion}</p>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
