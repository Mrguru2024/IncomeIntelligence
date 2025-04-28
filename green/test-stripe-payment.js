/**
 * Test script to verify Stripe payment integration
 */

// Function to test the create-payment-intent API endpoint
async function testCreatePaymentIntent() {
  console.log('Testing /api/create-payment-intent endpoint...');
  
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 99.99,
        invoiceId: 'TEST-INV-123',
        customerName: 'Test Customer',
        description: 'Test Quote for Stripe Integration',
        tier: 'standard'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Successfully created payment intent:');
    console.log('Client Secret:', data.clientSecret ? 'PRESENT (beginning with ' + data.clientSecret.substr(0, 10) + '...)' : 'MISSING');
    console.log('Payment Intent ID:', data.paymentIntentId || 'Not provided');
    console.log('Development Mode:', data.isDevelopment ? 'YES' : 'NO');
    
    if (data.isDevelopment) {
      console.log('Note: Running in development mode. Stripe API key may not be configured.');
    }
    
    if (data.stripeError) {
      console.warn('A Stripe error occurred but the system provided a fallback client secret for development testing.');
    }
    
    return data;
  } catch (error) {
    console.error('Error testing create-payment-intent:', error);
    throw error;
  }
}

// Function to simulate a Stripe payment form
function simulateStripePaymentForm(clientSecret) {
  console.log('\nSimulating Stripe payment form initialization...');
  
  try {
    if (typeof Stripe !== 'function') {
      console.error('Stripe.js is not loaded. Please run this test from a page with Stripe.js included.');
      return;
    }
    
    console.log('Initializing Stripe with publishable key (or using test key in development)...');
    const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Test publishable key for simulation
    
    console.log('Creating payment element with client secret...');
    const elements = stripe.elements({
      clientSecret
    });
    
    console.log('Payment elements would be created and mounted to the DOM in a real implementation');
    
    console.log('\nSimulation complete - in a real implementation, the user would enter their payment details and submit.');
    console.log('Stripe.js would then handle tokenization and confirmation of the payment.');
  } catch (error) {
    console.error('Error simulating Stripe payment form:', error);
  }
}

// Run the test
async function runTest() {
  console.log('=== STRIPE INTEGRATION TEST ===');
  
  try {
    // Test creating a payment intent
    const paymentData = await testCreatePaymentIntent();
    
    // If we have a client secret, simulate the payment form
    if (paymentData.clientSecret) {
      simulateStripePaymentForm(paymentData.clientSecret);
    }
    
    console.log('\n=== TEST COMPLETED ===');
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);
  }
}

// Execute the test when the script is loaded
runTest();