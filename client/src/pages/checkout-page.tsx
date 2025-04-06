import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  amount: number;
  productName: string;
  onSuccess: () => void;
}

const CheckoutForm = ({ amount, productName, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/checkout/success",
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: `Thank you for your purchase of ${productName}!`,
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    amount: 0,
    description: "",
    id: ""
  });
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Extract query params to determine what's being purchased
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const productId = params.get('product') || '';
    const productName = params.get('name') || 'Stackr Product';
    const productAmount = Number(params.get('amount')) || 0;
    const productDescription = params.get('description') || 'One-time purchase';
    
    if (productAmount <= 0) {
      setError('Invalid product information. Please try again.');
      return;
    }

    setProductDetails({
      name: productName,
      amount: productAmount,
      description: productDescription,
      id: productId
    });
  }, [location]);

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      navigate('/auth');
      return;
    }

    // Skip creating payment intent if there was an error in product info
    if (error || productDetails.amount <= 0) {
      return;
    }

    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: productDetails.amount,
          description: productDetails.description,
          metadata: {
            productId: productDetails.id
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to initialize payment');
        }
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Unable to initialize payment. Please try again later.');
        }
      } catch (err) {
        setError('Error initializing payment. Please try again later.');
        console.error('Payment error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (productDetails.amount > 0) {
      createPaymentIntent();
    }
  }, [user, navigate, productDetails, error]);

  const handlePaymentSuccess = () => {
    // Redirect to success page or dashboard
    navigate('/dashboard');
  };

  if (isLoading && !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Preparing your checkout...</h2>
        <p className="text-muted-foreground">This will only take a moment</p>
      </div>
    );
  }

  if (error || productDetails.amount <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-2">Checkout Error</h2>
          <p>{error || "Invalid product information. Please try again."}</p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="mt-6"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your payment information to complete your purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#6366f1',
                      },
                    },
                  }}
                >
                  <CheckoutForm 
                    amount={productDetails.amount} 
                    productName={productDetails.name}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ShoppingCart className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{productDetails.name}</p>
                    <p className="text-sm text-muted-foreground">{productDetails.description}</p>
                  </div>
                </div>
                <p className="font-semibold">${productDetails.amount.toFixed(2)}</p>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-bold text-lg">
                <p>Total</p>
                <p>${productDetails.amount.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground w-full text-center">
                Secure payment processing by Stripe
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;