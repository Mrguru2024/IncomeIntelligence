import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useStripe } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentConfirmationPage() {
  const stripe = useStripe();
  const [_, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the client secret from the URL
    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');

    if (!clientSecret) {
      setStatus('error');
      setMessage('Invalid payment confirmation link');
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) {
        setStatus('error');
        setMessage('Payment information not found');
        return;
      }

      // Check payment status
      switch (paymentIntent.status) {
        case 'succeeded':
          setStatus('success');
          setMessage('Payment succeeded! Thank you for your payment.');
          toast({
            title: 'Payment successful',
            description: 'Your payment has been processed successfully.',
          });
          break;
        case 'processing':
          setStatus('loading');
          setMessage('Your payment is processing. We\'ll update you when payment is received.');
          break;
        case 'requires_payment_method':
          setStatus('error');
          setMessage('Your payment was not successful, please try again.');
          toast({
            title: 'Payment failed',
            description: 'Your payment requires attention. Please try again.',
            variant: 'destructive',
          });
          break;
        default:
          setStatus('error');
          setMessage('Something went wrong with your payment. Please contact support.');
          toast({
            title: 'Payment issue',
            description: 'There was an issue with your payment. Please contact support.',
            variant: 'destructive',
          });
          break;
      }
    });
  }, [stripe, toast]);

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Payment Confirmation</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Checking payment status...'}
            {status === 'success' && 'Your payment has been processed'}
            {status === 'error' && 'There was an issue with your payment'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />}
          {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />}
          {status === 'error' && <XCircle className="h-16 w-16 text-red-500 mx-auto" />}
          
          <p className="mt-6 text-gray-700">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => setLocation('/invoices')}>
            Return to Invoices
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}