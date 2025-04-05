
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LineChart, Lightbulb } from "lucide-react";

export default function CashFlowCoach() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Coach</CardTitle>
        <CardDescription>Smart insights to optimize your money flow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Spending Pattern Detected</AlertTitle>
          <AlertDescription>
            Your restaurant expenses tend to peak on weekends. Consider meal prepping to reduce costs.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Spending Rhythm</h4>
            <LineChart className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">Get Personalized Tips</Button>
            <Button className="w-full" variant="outline">Schedule Review</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
