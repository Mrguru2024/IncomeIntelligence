
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LockIcon, UnlockIcon } from 'lucide-react';
import { formatCurrency } from "@/lib/utils/format";

interface SafeEnvelopeProps {
  category: string;
  allocated: number;
  spent: number;
  total: number;
}

export default function SafeEnvelope({ category, allocated, spent, total }: SafeEnvelopeProps) {
  const [isLocked, setIsLocked] = useState(false);
  const progress = (spent / allocated) * 100;
  const remaining = allocated - spent;
  
  return (
    <Card className={isLocked ? 'border-2 border-primary' : ''}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-medium">{category}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsLocked(!isLocked)}
          className="h-8 w-8 p-0"
        >
          {isLocked ? (
            <LockIcon className="h-4 w-4 text-primary" />
          ) : (
            <UnlockIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs">
            <span>Spent: {formatCurrency(spent)}</span>
            <span>Allocated: {formatCurrency(allocated)}</span>
          </div>
          <div className={`text-xs ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formatCurrency(Math.abs(remaining))} {remaining < 0 ? 'over budget' : 'remaining'}
          </div>
          {isLocked && (
            <div className="text-xs text-primary mt-2">
              🔒 Envelope locked - Protect your budget
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
