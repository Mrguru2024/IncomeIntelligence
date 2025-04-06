import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const CheckoutSuccessPage = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      navigate("/auth");
      return;
    }

    // Parse query parameters to show specific success message
    const params = new URLSearchParams(location.split("?")[1]);
    const paymentType = params.get("type") || "payment";
    const paymentAmount = params.get("amount");
    const productName = params.get("product") || "Your purchase";

    // Show success toast based on payment type
    if (paymentType === "subscription") {
      toast({
        title: "Subscription Activated",
        description:
          "Your Stackr Pro subscription has been successfully activated!",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: productName
          ? `Thank you for purchasing ${productName}!`
          : "Your payment was successful!",
      });
    }
  }, [user, navigate, location, toast]);

  return (
    <div className="container mx-auto py-16 px-4 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your purchase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your payment has been processed successfully. A confirmation has
            been sent to your email address.
          </p>
          <div className="bg-green-50 text-green-800 p-4 rounded-lg">
            <p className="font-medium">Your transaction is complete</p>
            <p className="text-sm">
              Transaction ID: {Math.random().toString(36).substring(2, 15)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Return to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/subscription")}
            className="w-full"
          >
            View Subscription Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutSuccessPage;
