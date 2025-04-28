/**
 * Client Quote Preview JavaScript
 * 
 * This script handles loading and displaying quote data for client review,
 * as well as handling client interactions like selecting tiers and accepting quotes.
 */

// Load quote data from URL parameter (in a real app, would get this from a database)
document.addEventListener('DOMContentLoaded', function() {
  // Get quote ID from URL
  const quoteParams = new URLSearchParams(window.location.search);
  const quoteId = quoteParams.get('id');
  
  if (quoteId) {
    // Fetch quote data from API
    fetchQuoteData(quoteId);
  } else {
    // Just use demo data if no ID is provided
    initPageWithDemoData();
  }
  
  // Set up event listeners
  setupEventListeners();
});

// Fetch quote data from API
async function fetchQuoteData(quoteId) {
  try {
    // In a real app, we'd also pass user authentication headers
    const userId = localStorage.getItem('user_id') || 'test-user-123';
    
    const response = await fetch(`/api/quotes/${quoteId}?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching quote: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.quote) {
      initPageWithQuoteData(data.quote);
    } else {
      console.error('Quote data not found in API response');
      initPageWithDemoData(); // Fallback to demo data
    }
  } catch (error) {
    console.error('Error fetching quote data:', error);
    initPageWithDemoData(); // Fallback to demo data
  }
}

// Initialize page with data from API
function initPageWithQuoteData(quote) {
  // Set basic quote information
  document.getElementById('business-name').textContent = quote.businessName || 'Professional Services';
  document.getElementById('business-tagline').textContent = quote.businessTagline || 'Quality service you can trust';
  document.getElementById('quote-number').textContent = quote.id || 'QT12345';
  document.getElementById('quote-date').textContent = formatDate(quote.createdAt) || new Date().toLocaleDateString();
  
  // Calculate valid until date (30 days from creation)
  const createdDate = new Date(quote.createdAt || Date.now());
  const validUntil = new Date(createdDate);
  validUntil.setDate(validUntil.getDate() + 30);
  document.getElementById('valid-until').textContent = validUntil.toLocaleDateString();
  
  // Set customer and service details
  document.getElementById('customer-name').textContent = quote.customerName || 'Client';
  document.getElementById('quote-description').textContent = quote.description || '';
  document.getElementById('service-type').textContent = quote.jobType || '';
  document.getElementById('service-location').textContent = quote.location || '';
  document.getElementById('service-complexity').textContent = quote.complexity || 'Medium';
  
  // Set provider details if available
  if (quote.providerName) {
    document.getElementById('provider-name').textContent = quote.providerName;
  }
  if (quote.providerExperience) {
    document.getElementById('provider-experience').textContent = quote.providerExperience;
  }
  
  // Set pricing options
  if (quote.tierOptions) {
    // Basic tier
    if (quote.tierOptions.basic) {
      document.getElementById('basic-price').textContent = `$${quote.tierOptions.basic.price.toLocaleString()}`;
      
      // Set features if available
      if (quote.tierOptions.basic.features && quote.tierOptions.basic.features.length > 0) {
        document.getElementById('basic-features').innerHTML = quote.tierOptions.basic.features.map(feature => `
          <li class="flex items-start">
            <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${feature}</span>
          </li>
        `).join('');
      }
    }
    
    // Standard tier
    if (quote.tierOptions.standard) {
      document.getElementById('standard-price').textContent = `$${quote.tierOptions.standard.price.toLocaleString()}`;
      
      // Set features if available
      if (quote.tierOptions.standard.features && quote.tierOptions.standard.features.length > 0) {
        document.getElementById('standard-features').innerHTML = quote.tierOptions.standard.features.map(feature => `
          <li class="flex items-start">
            <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${feature}</span>
          </li>
        `).join('');
      }
    }
    
    // Premium tier
    if (quote.tierOptions.premium) {
      document.getElementById('premium-price').textContent = `$${quote.tierOptions.premium.price.toLocaleString()}`;
      
      // Set features if available
      if (quote.tierOptions.premium.features && quote.tierOptions.premium.features.length > 0) {
        document.getElementById('premium-features').innerHTML = quote.tierOptions.premium.features.map(feature => `
          <li class="flex items-start">
            <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${feature}</span>
          </li>
        `).join('');
      }
    }
  }
  
  // Initialize breakdown with standard tier as default
  updateBreakdown('standard', quote);
}

// Initialize page with demo data
function initPageWithDemoData() {
  // Demo data for the bathroom remodel example
  const demoQuote = {
    id: "QT12345",
    businessName: "Stackr Remodeling",
    businessTagline: "Quality renovations you can trust",
    createdAt: new Date().toISOString(),
    customerName: "David Thompson",
    description: "Complete bathroom renovation with modern fixtures",
    jobType: "Bathroom Remodel",
    location: "Denver, CO",
    complexity: "Medium",
    providerName: "John Smith",
    providerExperience: "5 years",
    providerRating: 4.8,
    tierOptions: {
      basic: {
        price: 7492,
        features: [
          "Standard fixtures",
          "Basic materials",
          "30-day warranty",
          "Standard cleanup"
        ]
      },
      standard: {
        price: 7867,
        features: [
          "Premium fixtures",
          "Quality materials",
          "90-day warranty",
          "Priority scheduling",
          "Thorough cleanup"
        ]
      },
      premium: {
        price: 8582,
        features: [
          "Luxury fixtures",
          "Premium materials",
          "1-year warranty",
          "Priority scheduling",
          "Free follow-up inspection",
          "Detailed cleanup",
          "Designer consultation"
        ]
      }
    },
    laborCost: 5000,
    materialCost: 2500,
    depositRequired: true,
    depositPercent: 25
  };
  
  // Initialize page with demo data
  initPageWithQuoteData(demoQuote);
}

// Update quote breakdown based on selected tier
function updateBreakdown(tier, quoteData) {
  // Use provided quote data or get it from a data attribute
  const quote = quoteData || window.currentQuote;
  
  // Default values if no quote data is available
  const labor = quote?.laborCost || 5000;
  const materials = quote?.materialCost || 2500;
  const price = quote?.tierOptions?.[tier]?.price || 0;
  
  // If we don't have the price, try to calculate it
  const calculatedPrice = price || (labor + materials);
  
  const taxRate = 0.05; // 5% tax rate
  const tax = calculatedPrice * taxRate;
  const total = calculatedPrice + tax;
  
  const depositPercent = quote?.depositPercent || 25;
  const depositRequired = quote?.depositRequired || total >= 2000;
  const deposit = depositRequired ? (total * (depositPercent / 100)) : 0;
  
  // Update the breakdown display
  document.getElementById('breakdown-labor').textContent = `$${labor.toLocaleString()}`;
  document.getElementById('breakdown-materials').textContent = `$${materials.toLocaleString()}`;
  document.getElementById('breakdown-subtotal').textContent = `$${calculatedPrice.toLocaleString()}`;
  document.getElementById('breakdown-tax').textContent = `$${tax.toLocaleString()}`;
  document.getElementById('breakdown-total').textContent = `$${total.toLocaleString()}`;
  
  // Update deposit information
  if (depositRequired) {
    document.getElementById('deposit-amount').textContent = `$${deposit.toLocaleString()} (${depositPercent}%)`;
    document.getElementById('deposit-notice').classList.remove('hidden');
  } else {
    document.getElementById('deposit-notice').classList.add('hidden');
  }
  
  // Show the breakdown section
  document.getElementById('quote-breakdown-section').classList.remove('hidden');
}

// Set up event listeners for user interactions
function setupEventListeners() {
  // Tier selection
  const tierButtons = document.querySelectorAll('.select-tier');
  tierButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tier = this.dataset.tier;
      
      // Reset all tier cards and buttons
      document.querySelectorAll('.tier-card').forEach(card => {
        card.classList.remove('border-2', 'border-blue-500', 'shadow-md');
        card.classList.add('border', 'border-gray-200');
      });
      
      document.querySelectorAll('.select-tier').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-800');
      });
      
      // Highlight selected tier
      const selectedCard = this.closest('.tier-card');
      selectedCard.classList.remove('border', 'border-gray-200');
      selectedCard.classList.add('border-2', 'border-blue-500', 'shadow-md');
      
      this.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-800');
      this.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
      
      // Update breakdown
      updateBreakdown(tier);
      
      // Enable accept button
      document.getElementById('accept-quote').removeAttribute('disabled');
    });
  });
  
  // Accept quote button
  document.getElementById('accept-quote').addEventListener('click', async function() {
    const quoteId = new URLSearchParams(window.location.search).get('id') || 'demo';
    
    if (quoteId === 'demo') {
      // In demo mode, show the Stripe payment flow
      redirectToStripeCheckout();
      return;
    }
    
    // Get selected tier
    const selectedTier = document.querySelector('.select-tier.bg-blue-500').dataset.tier;
    
    try {
      // Make API call to convert quote to invoice
      const userId = localStorage.getItem('user_id') || 'test-user-123';
      
      const response = await fetch(`/api/quotes/${quoteId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          tier: selectedTier
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error accepting quote: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Now redirect to Stripe for payment
        redirectToStripeCheckout(data.invoice);
      } else {
        console.error('Error accepting quote:', data.error);
        alert('There was an error accepting this quote. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('There was an error accepting this quote. Please try again.');
    }
  });
  
  // Function to redirect to Stripe Checkout
  function redirectToStripeCheckout(invoice) {
    // Get current price from the breakdown
    const totalPriceText = document.getElementById('breakdown-total').textContent;
    const totalPrice = parseFloat(totalPriceText.replace(/[^0-9.]/g, ''));
    const selectedTier = document.querySelector('.select-tier.bg-blue-500').dataset.tier;
    
    // If we have an invoice object from the API, use that data
    const amount = invoice ? invoice.amount : totalPrice;
    const invoiceId = invoice ? invoice.id : `INV-DEMO-${Date.now()}`;
    const customerName = document.getElementById('customer-name').textContent;
    const description = document.getElementById('quote-description').textContent;
    
    // In a real app, we'd call our backend to create a Stripe Checkout session
    // For demo purposes, we'll simulate going to Stripe Checkout
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        invoiceId: invoiceId,
        customerName: customerName,
        description: description,
        tier: selectedTier
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.clientSecret) {
        // In a real app, this would redirect to Stripe's checkout page
        // For now, we'll simulate the redirect for development testing
        console.log('Redirecting to Stripe with client secret:', data.clientSecret);
        
        // For development environment, we'll show a confirmation dialog
        if (confirm('In production, you would now be redirected to Stripe to complete payment. Press OK to simulate a successful payment or Cancel to cancel.')) {
          // Simulate successful payment
          showSuccessMessage();
        }
      } else if (data.url) {
        // If the API returns a URL, redirect to it
        window.location.href = data.url;
      } else {
        // For development, show demo success
        if (confirm('Stripe payment processing is in development mode. Press OK to simulate a successful payment.')) {
          showSuccessMessage();
        }
      }
    })
    .catch(error => {
      console.error('Error creating Stripe checkout session:', error);
      
      // For development, show demo success
      if (confirm('Error connecting to payment processor. In development mode, press OK to simulate a successful payment.')) {
        showSuccessMessage();
      }
    });
  }
}

// Show success message after accepting quote
function showSuccessMessage() {
  document.getElementById('success-message').classList.remove('hidden');
  
  // Scroll to success message
  document.getElementById('success-message').scrollIntoView({ behavior: 'smooth' });
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toLocaleDateString();
}