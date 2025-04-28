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
  
  // Initialize animations and loading state
  startLoadingAnimation();
  animateProgressBar();
  
  if (quoteId) {
    // Fetch quote data from API
    fetchQuoteData(quoteId);
  } else {
    // Just use demo data if no ID is provided
    // Adding a small delay makes the loading feel more natural
    setTimeout(() => {
      initPageWithDemoData();
      completeLoadingAnimation();
    }, 1200);
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Set up interactive features
  initializeInteractiveFeatures();
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
  // Generate random reference number for confirmation
  const refNumber = `REF-${Math.floor(10000 + Math.random() * 90000)}`;
  const refElement = document.getElementById('reference-number');
  
  // Hide the quote details with fade-out effect
  const quoteDetails = document.getElementById('quote-details');
  quoteDetails.style.opacity = '0';
  quoteDetails.style.transform = 'translateY(20px)';
  quoteDetails.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  
  // Hide the selected package with fade-out effect
  const selectedPackage = document.getElementById('selected-package');
  if (!selectedPackage.classList.contains('hidden')) {
    selectedPackage.style.opacity = '0';
    selectedPackage.style.transform = 'translateY(20px)';
    selectedPackage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  }
  
  // After the fade-out completes, hide the elements and show success message
  setTimeout(() => {
    quoteDetails.classList.add('hidden');
    selectedPackage.classList.add('hidden');
    
    // Show success message with entrance animation
    const successMessage = document.getElementById('success-message');
    successMessage.classList.remove('hidden');
    
    // Add confetti effect
    addConfettiEffect();
    
    // Animate the reference number with a typewriter effect
    if (refElement) {
      refElement.textContent = '';
      let i = 0;
      const typeRefNumber = () => {
        if (i < refNumber.length) {
          refElement.textContent += refNumber.charAt(i);
          i++;
          setTimeout(typeRefNumber, 50);
        }
      };
      setTimeout(typeRefNumber, 500);
    }
    
    // Scroll to the top of the success message
    successMessage.scrollIntoView({ behavior: 'smooth' });
  }, 600);
}

// Add confetti effect to celebrate successful quote acceptance
function addConfettiEffect() {
  // Create canvas element for confetti
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  document.body.appendChild(canvas);
  
  // Draw confetti particles
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const colors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'];
  
  // Create particles
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      speed: Math.random() * 5 + 2
    });
  }
  
  // Animate confetti falling
  let animationFrame;
  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let complete = true;
    
    particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      
      particle.y += particle.speed;
      
      // Add some horizontal movement
      particle.x += Math.sin(particle.y / 30) * 2;
      
      // If any particle is still on screen, continue animation
      if (particle.y < canvas.height) {
        complete = false;
      }
    });
    
    if (!complete) {
      animationFrame = requestAnimationFrame(animateConfetti);
    } else {
      // Remove canvas after animation completes
      setTimeout(() => {
        canvas.remove();
      }, 1000);
    }
  }
  
  // Start animation
  animationFrame = requestAnimationFrame(animateConfetti);
  
  // Clean up after 4 seconds
  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    canvas.remove();
  }, 4000);
}

// Loading animation functions
function startLoadingAnimation() {
  const container = document.createElement('div');
  container.id = 'loading-overlay';
  container.className = 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50';
  container.innerHTML = `
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p class="text-gray-700 text-lg">Loading your quote...</p>
    </div>
  `;
  document.body.appendChild(container);
}

function completeLoadingAnimation() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
      // Reveal content with animation
      document.querySelectorAll('.fade-in-element').forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('fade-in');
        }, index * 150); // Stagger the animations
      });
    }, 500);
  }
}

// Progress bar animation
function animateProgressBar() {
  const progressBar = document.querySelector('.progress-bar-fill');
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 500);
  }
}

// Interactive features for quote preview
function initializeInteractiveFeatures() {
  // Add comparison popover functionality
  setupComparisonPopovers();
  
  // Add interactive pricing slider if available
  setupPricingSliders();
  
  // Add interactive feature highlights
  setupFeatureHighlights();
  
  // Add tier card hover effects
  setupTierCardEffects();
  
  // Add floating price counter effect when tiers change
  setupPriceCounters();
  
  // Add subtle parallax scrolling effect
  setupParallaxEffect();
  
  // Add interactive button effects
  setupButtonEffects();
  
  // Add dynamic data update animations
  setupDataUpdateAnimations();
}

// Setup comparison popovers
function setupComparisonPopovers() {
  const comparisonButtons = document.querySelectorAll('.comparison-button');
  comparisonButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const popoverId = this.dataset.popover;
      const popover = document.getElementById(popoverId);
      
      // Toggle popover visibility
      if (popover) {
        // Hide all other popovers first
        document.querySelectorAll('.comparison-popover').forEach(p => {
          if (p.id !== popoverId) {
            p.classList.add('hidden');
          }
        });
        
        // Toggle this popover
        popover.classList.toggle('hidden');
        
        // Position the popover
        const buttonRect = this.getBoundingClientRect();
        popover.style.top = buttonRect.bottom + window.scrollY + 10 + 'px';
        popover.style.left = buttonRect.left + window.scrollX + 'px';
      }
    });
  });
  
  // Close popovers when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.comparison-button') && !e.target.closest('.comparison-popover')) {
      document.querySelectorAll('.comparison-popover').forEach(p => {
        p.classList.add('hidden');
      });
    }
  });
}

// Setup interactive price sliders
function setupPricingSliders() {
  const sliders = document.querySelectorAll('.pricing-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', function() {
      const targetId = this.dataset.target;
      const valueDisplay = document.getElementById(targetId);
      
      if (valueDisplay) {
        // Update the display value
        const value = parseInt(this.value);
        valueDisplay.textContent = value;
        
        // If this affects pricing, recalculate
        if (this.dataset.affects === 'price') {
          const selectedTier = document.querySelector('.select-tier.bg-blue-500')?.dataset.tier || 'standard';
          updateBreakdown(selectedTier);
        }
      }
    });
  });
}

// Setup feature highlights
function setupFeatureHighlights() {
  // Apply feature-highlight class to all feature items
  document.querySelectorAll('.tier-card li').forEach(item => {
    item.classList.add('feature-highlight');
  });

  // Add event listeners
  const features = document.querySelectorAll('.feature-highlight');
  features.forEach(feature => {
    feature.addEventListener('mouseenter', function() {
      this.classList.add('feature-pulse');
    });
    
    feature.addEventListener('mouseleave', function() {
      this.classList.remove('feature-pulse');
    });
  });
}

// Setup tier card effects
function setupTierCardEffects() {
  const cards = document.querySelectorAll('.tier-card');
  cards.forEach(card => {
    // Add 3D tilt effect on mouse move
    card.addEventListener('mousemove', function(e) {
      if (window.innerWidth >= 768) { // Only on desktop
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the card
        const y = e.clientY - rect.top; // y position within the card
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX * 5; // Max tilt of 5 degrees
        const deltaY = (y - centerY) / centerY * 5;
        
        this.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) translateY(-5px)`;
      }
    });
    
    // Reset on mouse leave
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
}

// Setup floating price counter effect
function setupPriceCounters() {
  const tierButtons = document.querySelectorAll('.select-tier');
  tierButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tier = this.dataset.tier;
      const priceElement = document.getElementById(`${tier}-price`);
      
      if (priceElement) {
        const priceText = priceElement.textContent;
        const priceValue = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        // Create floating element
        const floatingPrice = document.createElement('div');
        floatingPrice.className = 'absolute text-xl font-bold text-blue-600 price-float z-20';
        floatingPrice.textContent = priceText;
        
        // Position near the price element
        const rect = priceElement.getBoundingClientRect();
        floatingPrice.style.top = rect.top + window.scrollY + 'px';
        floatingPrice.style.left = rect.left + window.scrollX + 'px';
        
        // Add to document
        document.body.appendChild(floatingPrice);
        
        // Animate to the total in breakdown
        const totalElement = document.getElementById('breakdown-total');
        const totalRect = totalElement.getBoundingClientRect();
        
        // Start animation after a small delay
        setTimeout(() => {
          floatingPrice.style.top = totalRect.top + window.scrollY + 'px';
          floatingPrice.style.left = totalRect.left + window.scrollX + 'px';
          floatingPrice.style.opacity = '0';
          
          // Highlight the total
          totalElement.classList.add('highlight-pulse');
          
          // Clean up after animation
          setTimeout(() => {
            floatingPrice.remove();
            totalElement.classList.remove('highlight-pulse');
          }, 1000);
        }, 50);
      }
    });
  });
}

// Setup parallax effect for a more immersive experience
function setupParallaxEffect() {
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const elements = document.querySelectorAll('.tier-card, .quote-header');
    
    elements.forEach(element => {
      const distance = element.getBoundingClientRect().top;
      if (Math.abs(distance) < window.innerHeight) {
        const speed = element.classList.contains('quote-header') ? 0.15 : 0.05;
        element.style.transform = `translateY(${scrollPosition * speed}px)`;
      }
    });
  });
}

// Setup interactive button effects
function setupButtonEffects() {
  const buttons = document.querySelectorAll('.select-tier, button');
  
  buttons.forEach(button => {
    // Add click ripple effect
    button.addEventListener('click', function(e) {
      if (!this.classList.contains('select-tier')) {
        this.classList.add('select-tier'); // Add ripple effects to all buttons
      }
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('absolute', 'inline-block', 'bg-white', 'rounded-full', 'opacity-50');
      ripple.style.width = '10px';
      ripple.style.height = '10px';
      ripple.style.transform = 'scale(0)';
      ripple.style.pointerEvents = 'none';
      
      // Position the ripple
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      // Animate and remove
      ripple.animate([
        { transform: 'scale(0)', opacity: 0.5 },
        { transform: 'scale(40)', opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }).onfinish = () => {
        ripple.remove();
      };
    });
  });
}

// Setup animations for when data updates
function setupDataUpdateAnimations() {
  // Target elements that may be updated dynamically
  const dataElements = document.querySelectorAll('#breakdown-total, #breakdown-subtotal, .price-tag');
  
  // Store original values
  dataElements.forEach(element => {
    element.dataset.originalValue = element.textContent.trim();
  });
  
  // Create a MutationObserver to watch for content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const element = mutation.target;
        const newValue = element.textContent.trim();
        const oldValue = element.dataset.originalValue;
        
        if (newValue !== oldValue) {
          // Play animation when values change
          element.classList.add('highlight-pulse');
          setTimeout(() => {
            element.classList.remove('highlight-pulse');
            element.dataset.originalValue = newValue;
          }, 1000);
        }
      }
    });
  });
  
  // Start observing
  dataElements.forEach(element => {
    observer.observe(element, { 
      childList: true,
      characterData: true,
      subtree: true
    });
  });
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