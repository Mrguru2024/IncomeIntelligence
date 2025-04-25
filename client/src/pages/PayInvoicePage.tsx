import React, { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string | null;
  invoiceNumber: string;
  dueDate: string;
  paymentMethod: string;
  total: string;
  paid: boolean;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  createdAt: string;
  paidAt: string | null;
}

function PaymentForm({ clientSecret, invoiceId }: { clientSecret: string; invoiceId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['/api/invoices', invoiceId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/invoices/${invoiceId}`);
      const data = await response.json();
      return data as Invoice;
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    const result = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-confirmation',
      },
      redirect: 'if_required',
    });

    if (result.error) {
      // Show error to your customer
      setPaymentError(result.error.message || 'An unexpected error occurred.');
      toast({
        title: 'Payment failed',
        description: result.error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        // Show a success message to your customer
        setPaymentSuccess(true);
        toast({
          title: 'Payment successful',
          description: 'Thank you for your payment!',
        });
        
        // Redirect after a delay
        setTimeout(() => {
          setLocation('/invoices');
        }, 3000);
      }
    }

    setIsLoading(false);
  };

  if (isLoadingInvoice || !invoice) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading invoice details...</p>
      </div>
    );
  }

  if (invoice.paid) {
    return (
      <div className="max-w-md mx-auto my-8 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mt-4">This invoice has already been paid</h2>
        <p className="mt-2 text-gray-600">
          Invoice #{invoice.invoiceNumber} for ${parseFloat(invoice.total).toFixed(2)} was paid on{' '}
          {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'a previous date'}.
        </p>
        <Button
          className="mt-6"
          onClick={() => setLocation('/invoices')}
        >
          Return to Invoices
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Invoice Summary</h3>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Invoice Number:</span>
            <span className="font-medium">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Due:</span>
            <span className="font-medium">${parseFloat(invoice.total).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Due Date:</span>
            <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{paymentError}</p>
        </div>
      )}

      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
          <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>Payment processed successfully! Redirecting to invoices page...</p>
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={!stripe || !elements || isLoading || paymentSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${parseFloat(invoice.total).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PayInvoicePage() {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const clientSecret = searchParams.get('client_secret');
  const invoiceId = searchParams.get('invoice_id');

  if (!clientSecret || !invoiceId) {
    return (
      <div className="max-w-md mx-auto my-8 text-center">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Invalid Payment Link</h2>
        <p className="mt-2 text-gray-600">
          The payment link you're trying to access is invalid or expired.
          Please check your invoice email for the correct payment link.
        </p>
        <Button
          className="mt-6"
          onClick={() => window.location.href = '/invoices'}
        >
          Go to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Payment</CardTitle>
          <CardDescription>
            Complete your payment securely using Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm clientSecret={clientSecret} invoiceId={invoiceId} />
          </Elements>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-gray-500">
          <div>Secure payment processed by Stripe</div>
        </CardFooter>
      </Card>
    </div>
  );
}