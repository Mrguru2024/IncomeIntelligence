
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/format";

interface SafeEnvelopeProps {
  category: string;
  allocated: number;
  spent: number;
  total: number;
}

export default function SafeEnvelope({ category, allocated, spent, total }: SafeEnvelopeProps) {
  const progress = (spent / allocated) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs">
            <span>Spent: {formatCurrency(spent)}</span>
            <span>Allocated: {formatCurrency(allocated)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(allocated - spent)} remaining
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
