// ULTRA SIMPLIFIED VERSION
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Ultra simplified component for debugging
export default function SpendingGuardrails() {
  // Debug log when component renders
  useEffect(() => {
    console.log("⚠️⚠️⚠️ SpendingGuardrails TEST component rendered!");
  }, []);

  return (
    <div className="container py-8 max-w-7xl">
      <div className="bg-purple-600 text-white p-10 rounded-lg text-center my-10">
        <h1 className="text-4xl font-bold mb-4">Spending Guardrails</h1>
        <p className="text-xl">TEST COMPONENT ACTIVE</p>
      </div>
            
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Guardrails Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test implementation of the Guardrails feature.</p>
        </CardContent>
      </Card>
    </div>
  );
}