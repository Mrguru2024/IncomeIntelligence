/**
 * Membership Tiers Module for Stackr Finance
 * Defines membership tiers, benefits, and upgrade functionality
 */

import { isAuthenticated, getCurrentUser, getUserSubscriptionTier } from './auth.js';
import { createToast } from './components/toast.js';

/**
 * Membership tier definitions
 */
export const MEMBERSHIP_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    color: '#6B7280', // gray
    description: 'Get started with basic financial tracking',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Basic income & expense tracking',
      'Manual bank account syncing',
      'Core budgeting tools',
      'Limited AI financial advice',
      'Community forum access'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    color: '#6366F1', // indigo
    description: 'Enhanced financial tools for serious growth',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      'Everything in Free tier',
      'Unlimited bank account syncing',
      'Advanced AI financial advisor',
      'Custom income splitting ratios',
      'Unlimited goals & projects',
      'Smart spending insights',
      'Service provider tools',
      'Email & priority support'
    ]
  },
  LIFETIME: {
    id: 'lifetime',
    name: 'Lifetime Pro',
    color: '#8B5CF6', // purple
    badge: 'Best Deal',
    description: 'One-time payment for lifetime Pro benefits',
    oneTimePrice: 299.99,
    features: [
      'All Pro tier features',
      'Lifetime access, never pay again',
      'Early access to new features',
      'Dedicated support',
      'VIP community access',
      'Custom dashboard',
      'Unlimited devices'
    ]
  }
};

/**
 * Initialize Stripe checkout
 * @param {string} priceId - Stripe price ID
 * @param {string} customerEmail - Customer email
 * @param {string} tierId - Membership tier ID
 * @returns {Promise<string>} - Checkout URL
 */
async function initializeStripeCheckout(priceId, customerEmail, tierId) {
  try {
    // In actual implementation, this would call your backend API
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceId,
        customerEmail: customerEmail,
        tierId: tierId
      }),
    });
    
    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error initializing checkout:', error);
    createToast('Error initializing checkout', 'error');
    return null;
  }
}

/**
 * Redirect to Stripe checkout for the selected tier
 * @param {string} tierId - Membership tier ID
 * @param {string} billingInterval - 'monthly', 'yearly', or 'once'
 */
export async function upgradeMembership(tierId, billingInterval = 'monthly') {
  if (!isAuthenticated()) {
    window.location.href = '/auth.html?redirect=membership-upgrade';
    return;
  }
  
  const tier = MEMBERSHIP_TIERS[tierId.toUpperCase()];
  if (!tier) {
    createToast('Invalid membership tier', 'error');
    return;
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    createToast('User information not available', 'error');
    return;
  }
  
  // For demo purposes, we'll just show what would happen
  // In a real implementation, we'd use the Stripe API
  // Set some placeholders for price IDs
  const priceIds = {
    'pro-monthly': 'price_1234567890abcdef',
    'pro-yearly': 'price_0987654321fedcba',
    'lifetime-once': 'price_lifetime12345678'
  };
  
  const priceKey = `${tier.id}-${billingInterval}`;
  const mockPriceId = priceIds[priceKey];
  
  // Show a confirmation modal
  const confirmed = confirm(`
    Upgrade to ${tier.name} membership
    
    ${billingInterval === 'monthly' ? `$${tier.monthlyPrice}/month` 
      : billingInterval === 'yearly' ? `$${tier.yearlyPrice}/year (save ${Math.round((1 - tier.yearlyPrice / (tier.monthlyPrice * 12)) * 100)}%)` 
      : `$${tier.oneTimePrice} one-time payment`
    }
    
    Continue to secure checkout?
  `);
  
  if (confirmed) {
    // In a real implementation, redirect to Stripe checkout
    createToast(`Redirecting to ${tier.name} ${billingInterval} checkout...`, 'info');
    
    // Here, we'd normally use the actual Stripe checkout URL
    // For demo purposes, we'll just simulate success
    setTimeout(() => {
      createToast(`Successfully upgraded to ${tier.name} tier!`, 'success');
      // Reload the page to reflect the new membership status
      location.reload();
    }, 2000);
    
    /*
    // This would be the real implementation:
    const checkoutUrl = await initializeStripeCheckout(mockPriceId, currentUser.email, tier.id);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
    */
  }
}

/**
 * Render a membership tier card
 * @param {object} tier - The tier definition
 * @param {string} billingInterval - 'monthly', 'yearly', or 'once'
 * @param {string} currentTier - The user's current tier
 * @returns {HTMLElement} - The tier card element
 */
function renderTierCard(tier, billingInterval, currentTier) {
  const isCurrentTier = currentTier === tier.id;
  
  const card = document.createElement('div');
  card.className = 'membership-tier-card';
  card.style.borderRadius = '12px';
  card.style.border = `1px solid ${isCurrentTier ? tier.color : '#e5e7eb'}`;
  card.style.boxShadow = isCurrentTier ? `0 4px 14px 0 rgba(${hexToRgb(tier.color)}, 0.25)` : '0 1px 3px rgba(0, 0, 0, 0.1)';
  card.style.padding = '24px';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.transition = 'all 0.2s ease';
  card.style.height = '100%';
  
  // Hover effect
  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = `0 10px 25px 0 rgba(${hexToRgb(tier.color)}, ${isCurrentTier ? '0.3' : '0.15'})`;
  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = isCurrentTier ? `0 4px 14px 0 rgba(${hexToRgb(tier.color)}, 0.25)` : '0 1px 3px rgba(0, 0, 0, 0.1)';
  });
  
  // Card header
  const cardHeader = document.createElement('div');
  cardHeader.style.marginBottom = '16px';
  
  if (tier.badge) {
    const badge = document.createElement('div');
    badge.style.display = 'inline-block';
    badge.style.padding = '4px 12px';
    badge.style.backgroundColor = tier.color;
    badge.style.color = 'white';
    badge.style.borderRadius = '99px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.marginBottom = '12px';
    badge.textContent = tier.badge;
    cardHeader.appendChild(badge);
  }
  
  const tierName = document.createElement('h3');
  tierName.style.color = tier.color;
  tierName.style.margin = '0 0 8px 0';
  tierName.style.fontSize = '24px';
  tierName.style.fontWeight = 'bold';
  tierName.textContent = tier.name;
  cardHeader.appendChild(tierName);
  
  const tierDescription = document.createElement('p');
  tierDescription.style.color = '#6b7280';
  tierDescription.style.margin = '0';
  tierDescription.style.fontSize = '14px';
  tierDescription.textContent = tier.description;
  cardHeader.appendChild(tierDescription);
  
  card.appendChild(cardHeader);
  
  // Price display
  const priceDisplay = document.createElement('div');
  priceDisplay.style.margin = '16px 0';
  
  const price = document.createElement('div');
  price.style.fontSize = '32px';
  price.style.fontWeight = 'bold';
  price.style.display = 'flex';
  price.style.alignItems = 'baseline';
  
  let priceText = '';
  let intervalText = '';
  
  // Determine price based on billing interval
  if (tier.id === 'free') {
    priceText = 'Free';
    intervalText = 'forever';
  } else if (tier.id === 'lifetime') {
    priceText = `$${tier.oneTimePrice}`;
    intervalText = 'one-time';
  } else if (billingInterval === 'monthly') {
    priceText = `$${tier.monthlyPrice}`;
    intervalText = '/month';
  } else if (billingInterval === 'yearly') {
    priceText = `$${tier.yearlyPrice}`;
    intervalText = '/year';
  }
  
  const priceAmount = document.createElement('span');
  priceAmount.textContent = priceText;
  price.appendChild(priceAmount);
  
  const priceInterval = document.createElement('span');
  priceInterval.style.fontSize = '16px';
  priceInterval.style.color = '#6b7280';
  priceInterval.style.marginLeft = '4px';
  priceInterval.textContent = intervalText;
  price.appendChild(priceInterval);
  
  priceDisplay.appendChild(price);
  
  if (tier.id === 'pro' && billingInterval === 'yearly') {
    const savings = document.createElement('div');
    savings.style.fontSize = '14px';
    savings.style.color = '#10b981'; // Green
    savings.style.marginTop = '4px';
    
    const savingsPercent = Math.round((1 - tier.yearlyPrice / (tier.monthlyPrice * 12)) * 100);
    savings.textContent = `Save ${savingsPercent}% with annual billing`;
    
    priceDisplay.appendChild(savings);
  }
  
  card.appendChild(priceDisplay);
  
  // Features list
  const featuresList = document.createElement('ul');
  featuresList.style.listStyle = 'none';
  featuresList.style.padding = '0';
  featuresList.style.margin = '0 0 24px 0';
  featuresList.style.flexGrow = '1';
  
  tier.features.forEach(feature => {
    const featureItem = document.createElement('li');
    featureItem.style.display = 'flex';
    featureItem.style.alignItems = 'flex-start';
    featureItem.style.marginBottom = '12px';
    
    const checkIcon = document.createElement('div');
    checkIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${tier.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
    checkIcon.style.marginRight = '10px';
    checkIcon.style.flexShrink = '0';
    featureItem.appendChild(checkIcon);
    
    const featureText = document.createElement('span');
    featureText.textContent = feature;
    featureText.style.fontSize = '14px';
    featureItem.appendChild(featureText);
    
    featuresList.appendChild(featureItem);
  });
  
  card.appendChild(featuresList);
  
  // Button
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = 'auto';
  
  const button = document.createElement('button');
  button.style.width = '100%';
  button.style.padding = '10px 16px';
  button.style.backgroundColor = isCurrentTier ? '#f9fafb' : tier.color;
  button.style.color = isCurrentTier ? '#111827' : 'white';
  button.style.border = isCurrentTier ? '1px solid #d1d5db' : 'none';
  button.style.borderRadius = '6px';
  button.style.fontSize = '16px';
  button.style.fontWeight = '600';
  button.style.cursor = isCurrentTier ? 'default' : 'pointer';
  button.style.transition = 'all 0.2s ease';
  
  button.textContent = isCurrentTier 
    ? 'Current Plan' 
    : tier.id === 'free' 
      ? 'Get Started' 
      : `Upgrade to ${tier.name}`;
  
  if (!isCurrentTier) {
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = adjustColor(tier.color, -20);
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = tier.color;
    });
    
    button.addEventListener('click', () => {
      if (tier.id === 'free') {
        // Free downgrade process
        const confirmed = confirm('Are you sure you want to downgrade to the Free tier? You"ll lose access to premium features.');
        if (confirmed) {
          createToast('Successfully downgraded to Free tier', 'success');
          setTimeout(() => location.reload(), 1000);
        }
      } else {
        // Upgrade to paid tier
        const interval = tier.id === 'lifetime' ? 'once' : billingInterval;
        upgradeMembership(tier.id, interval);
      }
    });
  }
  
  buttonContainer.appendChild(button);
  card.appendChild(buttonContainer);
  
  return card;
}

/**
 * Render membership upgrade page
 * @param {string} containerId - Container ID to render the page into
 * @param {string} [preselectedTier] - Preselected tier ID
 * @param {string} [billingInterval] - Preselected billing interval ('monthly' or 'yearly')
 */
export function renderMembershipUpgradePage(containerId = 'app', preselectedTier = null, billingInterval = 'monthly') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Get user's current tier
  const currentTier = isAuthenticated() ? getUserSubscriptionTier() : 'free';
  
  // Create page container
  const pageContainer = document.createElement('div');
  pageContainer.style.maxWidth = '1200px';
  pageContainer.style.margin = '0 auto';
  pageContainer.style.padding = '40px 20px';
  
  // Create page header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '48px';
  
  const title = document.createElement('h1');
  title.style.fontSize = '32px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 16px 0';
  title.style.background = 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)';
  title.style.WebkitBackgroundClip = 'text';
  title.style.backgroundClip = 'text';
  title.style.color = 'transparent';
  title.textContent = 'Stackr Finance Membership';
  header.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.style.fontSize = '18px';
  subtitle.style.color = '#6b7280';
  subtitle.style.maxWidth = '600px';
  subtitle.style.margin = '0 auto';
  subtitle.textContent = 'Choose the plan that's right for you and take your financial journey to the next level.';
  header.appendChild(subtitle);
  
  pageContainer.appendChild(header);
  
  // Billing toggle
  const billingToggle = document.createElement('div');
  billingToggle.style.display = 'flex';
  billingToggle.style.justifyContent = 'center';
  billingToggle.style.alignItems = 'center';
  billingToggle.style.gap = '16px';
  billingToggle.style.marginBottom = '40px';
  
  // Only show billing toggle if needed
  if (Object.values(MEMBERSHIP_TIERS).some(tier => tier.monthlyPrice && tier.yearlyPrice)) {
    const monthlyLabel = document.createElement('span');
    monthlyLabel.textContent = 'Monthly';
    monthlyLabel.style.color = billingInterval === 'monthly' ? '#111827' : '#6b7280';
    monthlyLabel.style.fontWeight = billingInterval === 'monthly' ? '600' : '400';
    monthlyLabel.style.cursor = 'pointer';
    monthlyLabel.addEventListener('click', () => {
      // Update toggle state
      monthlyLabel.style.color = '#111827';
      monthlyLabel.style.fontWeight = '600';
      yearlyLabel.style.color = '#6b7280';
      yearlyLabel.style.fontWeight = '400';
      toggleSwitch.setAttribute('aria-checked', 'false');
      toggleBall.style.transform = 'translateX(0)';
      
      // Re-render with monthly billing
      renderTierCards('monthly');
    });
    billingToggle.appendChild(monthlyLabel);
    
    // Toggle switch
    const toggleSwitch = document.createElement('div');
    toggleSwitch.setAttribute('role', 'switch');
    toggleSwitch.setAttribute('aria-checked', billingInterval === 'yearly' ? 'true' : 'false');
    toggleSwitch.style.width = '48px';
    toggleSwitch.style.height = '24px';
    toggleSwitch.style.backgroundColor = '#6366F1';
    toggleSwitch.style.borderRadius = '12px';
    toggleSwitch.style.position = 'relative';
    toggleSwitch.style.cursor = 'pointer';
    
    const toggleBall = document.createElement('div');
    toggleBall.style.position = 'absolute';
    toggleBall.style.top = '2px';
    toggleBall.style.left = '2px';
    toggleBall.style.width = '20px';
    toggleBall.style.height = '20px';
    toggleBall.style.backgroundColor = 'white';
    toggleBall.style.borderRadius = '50%';
    toggleBall.style.transition = 'transform 0.2s ease';
    toggleBall.style.transform = billingInterval === 'yearly' ? 'translateX(24px)' : 'translateX(0)';
    
    toggleSwitch.appendChild(toggleBall);
    
    toggleSwitch.addEventListener('click', () => {
      const isYearly = toggleSwitch.getAttribute('aria-checked') === 'true';
      toggleSwitch.setAttribute('aria-checked', isYearly ? 'false' : 'true');
      toggleBall.style.transform = isYearly ? 'translateX(0)' : 'translateX(24px)';
      
      // Update labels
      monthlyLabel.style.color = isYearly ? '#111827' : '#6b7280';
      monthlyLabel.style.fontWeight = isYearly ? '600' : '400';
      yearlyLabel.style.color = isYearly ? '#6b7280' : '#111827';
      yearlyLabel.style.fontWeight = isYearly ? '400' : '600';
      
      // Re-render with new billing interval
      renderTierCards(isYearly ? 'monthly' : 'yearly');
    });
    
    billingToggle.appendChild(toggleSwitch);
    
    const yearlyLabel = document.createElement('span');
    yearlyLabel.textContent = 'Yearly';
    yearlyLabel.style.color = billingInterval === 'yearly' ? '#111827' : '#6b7280';
    yearlyLabel.style.fontWeight = billingInterval === 'yearly' ? '600' : '400';
    yearlyLabel.style.cursor = 'pointer';
    yearlyLabel.addEventListener('click', () => {
      // Update toggle state
      yearlyLabel.style.color = '#111827';
      yearlyLabel.style.fontWeight = '600';
      monthlyLabel.style.color = '#6b7280';
      monthlyLabel.style.fontWeight = '400';
      toggleSwitch.setAttribute('aria-checked', 'true');
      toggleBall.style.transform = 'translateX(24px)';
      
      // Re-render with yearly billing
      renderTierCards('yearly');
    });
    billingToggle.appendChild(yearlyLabel);
    
    const saveTag = document.createElement('div');
    saveTag.style.backgroundColor = '#10b981';
    saveTag.style.color = 'white';
    saveTag.style.padding = '4px 8px';
    saveTag.style.borderRadius = '4px';
    saveTag.style.fontSize = '12px';
    saveTag.style.fontWeight = 'bold';
    saveTag.textContent = 'Save up to 20%';
    billingToggle.appendChild(saveTag);
  }
  
  pageContainer.appendChild(billingToggle);
  
  // Tier cards grid
  const tiersGrid = document.createElement('div');
  tiersGrid.className = 'membership-tiers-grid';
  tiersGrid.style.display = 'grid';
  tiersGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  tiersGrid.style.gap = '24px';
  
  pageContainer.appendChild(tiersGrid);
  
  // Function to render tier cards
  function renderTierCards(interval) {
    tiersGrid.innerHTML = '';
    
    // Add each tier card to the grid
    Object.values(MEMBERSHIP_TIERS).forEach(tier => {
      const card = renderTierCard(tier, interval, currentTier);
      tiersGrid.appendChild(card);
    });
  }
  
  // Initial render
  renderTierCards(billingInterval);
  
  // Add page to container
  container.appendChild(pageContainer);
}

/**
 * Show a modal with tier details and upgrade button
 * @param {string} tierId - The tier ID to show
 * @param {string} [billingInterval] - Billing interval ('monthly' or 'yearly')
 */
export function showUpgradeModal(tierId = 'pro', billingInterval = 'monthly') {
  // Get the tier details
  const tier = MEMBERSHIP_TIERS[tierId.toUpperCase()];
  if (!tier) return;
  
  // Get current tier
  const currentTier = isAuthenticated() ? getUserSubscriptionTier() : 'free';
  const isCurrentTier = currentTier === tier.id;
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '500px';
  modal.style.width = '90%';
  modal.style.padding = '32px';
  modal.style.position = 'relative';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;
  closeButton.style.position = 'absolute';
  closeButton.style.top = '16px';
  closeButton.style.right = '16px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  modal.appendChild(closeButton);
  
  // Modal header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  
  if (tier.badge) {
    const badge = document.createElement('div');
    badge.style.display = 'inline-block';
    badge.style.padding = '4px 12px';
    badge.style.backgroundColor = tier.color;
    badge.style.color = 'white';
    badge.style.borderRadius = '99px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.marginBottom = '12px';
    badge.textContent = tier.badge;
    header.appendChild(badge);
  }
  
  const title = document.createElement('h2');
  title.style.color = tier.color;
  title.style.fontSize = '28px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 8px 0';
  title.textContent = tier.name;
  header.appendChild(title);
  
  const description = document.createElement('p');
  description.style.color = '#6b7280';
  description.style.margin = '0';
  description.textContent = tier.description;
  header.appendChild(description);
  
  modal.appendChild(header);
  
  // Price display
  const priceDisplay = document.createElement('div');
  priceDisplay.style.margin = '24px 0';
  priceDisplay.style.display = 'flex';
  priceDisplay.style.justifyContent = 'space-between';
  priceDisplay.style.alignItems = 'center';
  
  // Create price options
  if (tier.id !== 'free' && tier.id !== 'lifetime') {
    const pricingOptions = document.createElement('div');
    pricingOptions.style.display = 'flex';
    pricingOptions.style.alignItems = 'center';
    pricingOptions.style.gap = '12px';
    
    // Monthly option
    const monthlyOption = document.createElement('div');
    monthlyOption.style.display = 'flex';
    monthlyOption.style.flexDirection = 'column';
    monthlyOption.style.alignItems = 'center';
    monthlyOption.style.cursor = 'pointer';
    
    const monthlyRadio = document.createElement('div');
    monthlyRadio.style.width = '18px';
    monthlyRadio.style.height = '18px';
    monthlyRadio.style.borderRadius = '50%';
    monthlyRadio.style.border = `2px solid ${billingInterval === 'monthly' ? tier.color : '#d1d5db'}`;
    monthlyRadio.style.marginBottom = '4px';
    monthlyRadio.style.position = 'relative';
    
    if (billingInterval === 'monthly') {
      const innerDot = document.createElement('div');
      innerDot.style.position = 'absolute';
      innerDot.style.top = '3px';
      innerDot.style.left = '3px';
      innerDot.style.width = '8px';
      innerDot.style.height = '8px';
      innerDot.style.borderRadius = '50%';
      innerDot.style.backgroundColor = tier.color;
      monthlyRadio.appendChild(innerDot);
    }
    
    monthlyOption.appendChild(monthlyRadio);
    
    const monthlyLabel = document.createElement('span');
    monthlyLabel.style.fontSize = '14px';
    monthlyLabel.style.color = billingInterval === 'monthly' ? '#111827' : '#6b7280';
    monthlyLabel.textContent = 'Monthly';
    monthlyOption.appendChild(monthlyLabel);
    
    monthlyOption.addEventListener('click', () => {
      changeBillingInterval('monthly');
    });
    
    pricingOptions.appendChild(monthlyOption);
    
    // Yearly option
    const yearlyOption = document.createElement('div');
    yearlyOption.style.display = 'flex';
    yearlyOption.style.flexDirection = 'column';
    yearlyOption.style.alignItems = 'center';
    yearlyOption.style.cursor = 'pointer';
    
    const yearlyRadio = document.createElement('div');
    yearlyRadio.style.width = '18px';
    yearlyRadio.style.height = '18px';
    yearlyRadio.style.borderRadius = '50%';
    yearlyRadio.style.border = `2px solid ${billingInterval === 'yearly' ? tier.color : '#d1d5db'}`;
    yearlyRadio.style.marginBottom = '4px';
    yearlyRadio.style.position = 'relative';
    
    if (billingInterval === 'yearly') {
      const innerDot = document.createElement('div');
      innerDot.style.position = 'absolute';
      innerDot.style.top = '3px';
      innerDot.style.left = '3px';
      innerDot.style.width = '8px';
      innerDot.style.height = '8px';
      innerDot.style.borderRadius = '50%';
      innerDot.style.backgroundColor = tier.color;
      yearlyRadio.appendChild(innerDot);
    }
    
    yearlyOption.appendChild(yearlyRadio);
    
    const yearlyLabel = document.createElement('span');
    yearlyLabel.style.fontSize = '14px';
    yearlyLabel.style.color = billingInterval === 'yearly' ? '#111827' : '#6b7280';
    yearlyLabel.textContent = 'Yearly';
    yearlyOption.appendChild(yearlyLabel);
    
    if (billingInterval === 'yearly') {
      const savingsTag = document.createElement('div');
      savingsTag.style.fontSize = '10px';
      savingsTag.style.padding = '2px 6px';
      savingsTag.style.backgroundColor = '#10b981';
      savingsTag.style.color = 'white';
      savingsTag.style.borderRadius = '99px';
      savingsTag.style.marginTop = '4px';
      savingsTag.textContent = 'Save 20%';
      yearlyOption.appendChild(savingsTag);
    }
    
    yearlyOption.addEventListener('click', () => {
      changeBillingInterval('yearly');
    });
    
    pricingOptions.appendChild(yearlyOption);
    priceDisplay.appendChild(pricingOptions);
  }
  
  // Price amount
  const priceInfo = document.createElement('div');
  priceInfo.style.display = 'flex';
  priceInfo.style.flexDirection = 'column';
  priceInfo.style.alignItems = 'flex-end';
  
  let priceText = '';
  let intervalText = '';
  
  // Determine price based on billing interval
  if (tier.id === 'free') {
    priceText = 'Free';
    intervalText = 'forever';
  } else if (tier.id === 'lifetime') {
    priceText = `$${tier.oneTimePrice}`;
    intervalText = 'one-time';
  } else if (billingInterval === 'monthly') {
    priceText = `$${tier.monthlyPrice}`;
    intervalText = '/month';
  } else if (billingInterval === 'yearly') {
    priceText = `$${tier.yearlyPrice}`;
    intervalText = '/year';
  }
  
  const price = document.createElement('div');
  price.style.fontSize = '32px';
  price.style.fontWeight = 'bold';
  price.style.display = 'flex';
  price.style.alignItems = 'baseline';
  
  const priceAmount = document.createElement('span');
  priceAmount.textContent = priceText;
  price.appendChild(priceAmount);
  
  const priceInterval = document.createElement('span');
  priceInterval.style.fontSize = '16px';
  priceInterval.style.color = '#6b7280';
  priceInterval.style.marginLeft = '4px';
  priceInterval.textContent = intervalText;
  price.appendChild(priceInterval);
  
  priceInfo.appendChild(price);
  
  if (tier.id === 'pro' && billingInterval === 'yearly') {
    const savings = document.createElement('div');
    savings.style.fontSize = '14px';
    savings.style.color = '#10b981';
    
    const savingsPercent = Math.round((1 - tier.yearlyPrice / (tier.monthlyPrice * 12)) * 100);
    savings.textContent = `Save ${savingsPercent}% compared to monthly`;
    
    priceInfo.appendChild(savings);
  }
  
  priceDisplay.appendChild(priceInfo);
  modal.appendChild(priceDisplay);
  
  // Function to change billing interval
  function changeBillingInterval(interval) {
    // Prevent changing interval for free or lifetime tiers
    if (tier.id === 'free' || tier.id === 'lifetime') return;
    
    // Update modal content
    document.body.removeChild(overlay);
    showUpgradeModal(tier.id, interval);
  }
  
  // Features list
  const featuresList = document.createElement('div');
  featuresList.style.marginBottom = '32px';
  
  const featuresTitle = document.createElement('h3');
  featuresTitle.style.fontSize = '18px';
  featuresTitle.style.fontWeight = '600';
  featuresTitle.style.marginBottom = '16px';
  featuresTitle.textContent = 'What's included:';
  featuresList.appendChild(featuresTitle);
  
  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.padding = '0';
  list.style.margin = '0';
  
  tier.features.forEach(feature => {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.alignItems = 'flex-start';
    item.style.marginBottom = '12px';
    
    const checkIcon = document.createElement('div');
    checkIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${tier.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
    checkIcon.style.marginRight = '12px';
    checkIcon.style.flexShrink = '0';
    item.appendChild(checkIcon);
    
    const text = document.createElement('span');
    text.textContent = feature;
    text.style.fontSize = '16px';
    item.appendChild(text);
    
    list.appendChild(item);
  });
  
  featuresList.appendChild(list);
  modal.appendChild(featuresList);
  
  // Action button
  const buttonContainer = document.createElement('div');
  
  const actionButton = document.createElement('button');
  actionButton.style.width = '100%';
  actionButton.style.padding = '12px 24px';
  actionButton.style.backgroundColor = isCurrentTier ? '#f9fafb' : tier.color;
  actionButton.style.color = isCurrentTier ? '#111827' : 'white';
  actionButton.style.border = isCurrentTier ? '1px solid #d1d5db' : 'none';
  actionButton.style.borderRadius = '6px';
  actionButton.style.fontSize = '16px';
  actionButton.style.fontWeight = '600';
  actionButton.style.cursor = isCurrentTier ? 'default' : 'pointer';
  actionButton.style.transition = 'all 0.2s ease';
  
  actionButton.textContent = isCurrentTier 
    ? 'Current Plan' 
    : tier.id === 'free' 
      ? 'Downgrade to Free' 
      : `Upgrade to ${tier.name}`;
  
  if (!isCurrentTier) {
    actionButton.addEventListener('mouseover', () => {
      actionButton.style.backgroundColor = adjustColor(tier.color, -20);
    });
    
    actionButton.addEventListener('mouseout', () => {
      actionButton.style.backgroundColor = tier.color;
    });
    
    actionButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      
      if (tier.id === 'free') {
        // Free downgrade process
        const confirmed = confirm('Are you sure you want to downgrade to the Free tier? You'll lose access to premium features.');
        if (confirmed) {
          createToast('Successfully downgraded to Free tier', 'success');
          setTimeout(() => location.reload(), 1000);
        }
      } else {
        // Upgrade to paid tier
        const interval = tier.id === 'lifetime' ? 'once' : billingInterval;
        upgradeMembership(tier.id, interval);
      }
    });
  }
  
  buttonContainer.appendChild(actionButton);
  modal.appendChild(buttonContainer);
  
  // Add modal to page
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Close on outside click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

/**
 * Render a quick upgrade button
 * @param {HTMLElement} container - Container to append the button to
 * @param {string} [tierId] - Target tier ID
 * @param {string} [variant] - Button variant ('text', 'button', 'pill')
 * @param {string} [size] - Button size ('small', 'medium', 'large')
 */
export function renderQuickUpgradeButton(container, tierId = 'pro', variant = 'button', size = 'medium') {
  if (!container) return;
  
  const tier = MEMBERSHIP_TIERS[tierId.toUpperCase()];
  if (!tier) return;
  
  // Get current tier
  const currentTier = isAuthenticated() ? getUserSubscriptionTier() : 'free';
  
  // Don't render if user already has this tier or higher
  if (currentTier === tier.id || 
      (currentTier === 'lifetime' && tier.id === 'pro')) {
    return;
  }
  
  const button = document.createElement('button');
  button.className = 'upgrade-button';
  
  // Apply variant styles
  if (variant === 'text') {
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.color = tier.color;
    button.style.textDecoration = 'underline';
    button.textContent = `Upgrade to ${tier.name}`;
  } else if (variant === 'pill') {
    button.style.backgroundColor = tier.color;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '99px';
    button.style.fontWeight = '600';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    
    // Add sparkle icon
    const sparkleIcon = document.createElement('span');
    sparkleIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
      </svg>
    `;
    sparkleIcon.style.marginRight = '4px';
    button.appendChild(sparkleIcon);
    
    const text = document.createElement('span');
    text.textContent = `Upgrade`;
    button.appendChild(text);
  } else {
    // Default button
    button.style.backgroundColor = tier.color;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '6px';
    button.style.fontWeight = '600';
    button.textContent = `Upgrade to ${tier.name}`;
  }
  
  // Apply size styles
  if (size === 'small') {
    button.style.padding = variant === 'pill' ? '4px 12px' : '6px 12px';
    button.style.fontSize = '14px';
  } else if (size === 'large') {
    button.style.padding = variant === 'pill' ? '10px 24px' : '12px 24px';
    button.style.fontSize = '18px';
  } else {
    // Medium (default)
    button.style.padding = variant === 'pill' ? '8px 16px' : '8px 16px';
    button.style.fontSize = '16px';
  }
  
  button.style.cursor = 'pointer';
  button.style.transition = 'all 0.2s ease';
  
  if (variant !== 'text') {
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = adjustColor(tier.color, -20);
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = tier.color;
      button.style.transform = 'translateY(0)';
    });
  }
  
  button.addEventListener('click', () => {
    showUpgradeModal(tier.id);
  });
  
  container.appendChild(button);
}

/**
 * Helper function to convert hex to RGB
 * @param {string} hex - Hex color code
 * @returns {string} - RGB values comma-separated
 */
function hexToRgb(hex) {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Helper function to adjust color lightness
 * @param {string} hex - Hex color code
 * @param {number} amount - Amount to lighten/darken 
 * @returns {string} - Adjusted hex color
 */
function adjustColor(hex, amount) {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust the values
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}