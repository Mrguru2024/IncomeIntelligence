
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from 'lucide-react';
import { formatCurrency } from "@/lib/utils/format";

interface SafeEnvelopeProps {
  category: string;
  allocated: number;
  spent: number;
  total: number;
}

export default function SafeEnvelope({ 
  category, 
  allocated, 
  spent, 
  total, 
  isLocked: propIsLocked, 
  onLockToggle 
}: SafeEnvelopeProps & { 
  isLocked?: boolean;
  onLockToggle?: (isLocked: boolean) => void;
}) {
  const [isLockedState, setIsLockedState] = useState(false);
  
  // Use either the prop or the state
  const isLocked = propIsLocked !== undefined ? propIsLocked : isLockedState;
  const progress = (spent / allocated) * 100;
  const remaining = allocated - spent;
  
  const handleLockToggle = () => {
    if (onLockToggle) {
      onLockToggle(!isLocked);
    } else {
      setIsLockedState(!isLocked);
    }
  };
  
  return (
    <Card className={isLocked ? 'border-2 border-primary' : ''}>
      <CardHeader className="pb-0.5 xxs:pb-1 xs:pb-2 pt-1.5 xxs:pt-2 xs:pt-3 px-1.5 xxs:px-2 xs:px-4 flex flex-row justify-between items-center">
        <CardTitle className="text-[10px] xxs:text-xs xs:text-sm font-medium">{category}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLockToggle}
          className="h-5 w-5 xxs:h-6 xxs:w-6 xs:h-8 xs:w-8 p-0"
          aria-label="Toggle lock"
        >
          {isLocked ? (
            <Lock className="h-2.5 w-2.5 xxs:h-3 xxs:w-3 xs:h-4 xs:w-4 text-primary" />
          ) : (
            <Unlock className="h-2.5 w-2.5 xxs:h-3 xxs:w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-1.5 xxs:p-2 xs:p-4">
        <div className="space-y-1 xxs:space-y-1 xs:space-y-2">
          <Progress value={progress} className="h-1 xxs:h-1.5 xs:h-2" />
          <div className="flex justify-between text-[8px] xxs:text-[9px] xs:text-xs">
            <span className="truncate pr-0.5 xxs:pr-1">Spent: {formatCurrency(spent)}</span>
            <span className="truncate pl-0.5 xxs:pl-1">Budget: {formatCurrency(allocated)}</span>
          </div>
          <div className={`text-[8px] xxs:text-[9px] xs:text-xs ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formatCurrency(Math.abs(remaining))} {remaining < 0 ? 'over' : 'left'}
          </div>
          {isLocked && (
            <div className="text-[8px] xxs:text-[9px] xs:text-xs text-primary mt-0.5 xxs:mt-1 xs:mt-2 truncate">
              🔒 Envelope locked
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
