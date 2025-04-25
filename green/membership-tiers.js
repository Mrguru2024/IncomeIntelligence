/**
 * Membership Tiers Module for Stackr Finance
 * Defines membership tiers, benefits, and upgrade functionality
 */

import { isAuthenticated, getCurrentUser, getUserSubscriptionTier } from './auth.js';
import { createToast } from './components/toast.js';
import { renderSidebar } from './sidebar.js';

/**
 * Membership tier definitions
 */
export const MEMBERSHIP_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    color: '#6B7280', // gray
    description: 'Start your financial journey with basic tools',
    monthlyPrice: 0,
    yearlyPrice: 0,
    referralProgram: {
      creditPerReferral: 10,
      bonusThresholds: [
        { count: 3, reward: 10 },
        { count: 8, reward: 50 }
      ],
      maxReferralCredit: 100,
      lifetimeReferralBonus: false
    },
    features: [
      'Basic income & expense tracking',
      'Manual bank account syncing (1 account)',
      'Simple budget creation',
      'Basic spending reports',
      'Access to referral program',
      'Mobile web access',
      'Community forum access'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    color: '#6366F1', // indigo
    badge: 'Most Popular',
    description: 'Accelerate your financial growth with advanced tools',
    monthlyPrice: 7.99,
    yearlyPrice: 84.99, // Save ~$11/year
    features: [
      'Everything in Free tier',
      'Unlimited bank account syncing',
      'Unlimited AI financial advisor sessions',
      'Custom income splitting ratios',
      'Unlimited goals & projects tracking',
      'Advanced spending insights & guardrails',
      'Service provider business tools',
      'Weekly financial health reports',
      'Client management tools',
      'Email & priority support'
    ],
    referralProgram: {
      creditPerReferral: 15,
      bonusThresholds: [
        { count: 5, reward: 25 },
        { count: 10, reward: 75 }
      ],
      maxReferralCredit: 300,
      referralMultiplier: 1.5 // 50% bonus for Lifetime referrals
    }
  },
  LIFETIME: {
    id: 'lifetime',
    name: 'Lifetime Pro',
    color: '#8B5CF6', // purple
    badge: 'Best Value',
    description: 'Invest once in your financial future, benefit forever',
    oneTimePrice: 249.99, // ~2.5 years of Pro subscription
    features: [
      'All Pro tier features forever',
      'One-time payment, never pay again',
      'Early access to all new features',
      'Dedicated priority support',
      'VIP community access',
      'Custom dashboard layouts',
      'Unlimited devices & users',
      'Personalized quarterly financial reviews',
      'Advanced data export options',
      'Exclusive financial masterclasses'
    ],
    referralProgram: {
      creditPerReferral: 20,
      bonusThresholds: [
        { count: 5, reward: 35 },
        { count: 10, reward: 100 }
      ],
      maxReferralCredit: 500,
      lifetimeReferralBonus: true,
      referralMultiplier: 2 // Double bonus for Lifetime referrals
    }
  }
};

/**
 * Generate a referral link for the current user
 * @returns {string} - The referral link
 */
export function generateReferralLink() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || 'demo-user';
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${userId}`;
}

/**
 * Render the referral program section
 * @param {object} tier - The membership tier
 * @returns {HTMLElement} - The referral program UI element
 */
export function renderReferralProgram(tier) {
  if (!tier.referralProgram) return null;
  
  const container = document.createElement('div');
  container.className = 'referral-program';
  container.style.marginTop = '24px';
  container.style.padding = '16px';
  container.style.border = '1px solid #e5e7eb';
  container.style.borderRadius = '8px';
  container.style.backgroundColor = '#f9fafb';
  
  const title = document.createElement('h4');
  title.style.fontSize = '16px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '12px';
  title.style.display = 'flex';
  title.style.alignItems = 'center';
  title.style.color = tier.color;
  
  // Add gift icon
  title.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px">
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
    Referral Program
  `;
  
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.style.fontSize = '14px';
  description.style.marginBottom = '8px';
  description.style.color = '#4b5563';
  description.textContent = `Earn $${tier.referralProgram.creditPerReferral} credit for each friend who upgrades to a paid membership using your link.`;
  container.appendChild(description);
  
  // Add note that specifies paid membership requirement
  const requirementNote = document.createElement('p');
  requirementNote.style.fontSize = '13px';
  requirementNote.style.marginBottom = '16px';
  requirementNote.style.fontStyle = 'italic';
  requirementNote.style.color = '#6b7280';
  requirementNote.textContent = 'Note: Credit is only earned when your referred friend subscribes to a paid tier (Pro or Lifetime).';
  container.appendChild(requirementNote);
  
  // Special incentives - two-way referral bonus
  const specialBonusContainer = document.createElement('div');
  specialBonusContainer.style.marginBottom = '16px';
  specialBonusContainer.style.backgroundColor = `rgba(${hexToRgb(tier.color)}, 0.1)`;
  specialBonusContainer.style.borderRadius = '8px';
  specialBonusContainer.style.padding = '12px';
  
  const specialBonusTitle = document.createElement('p');
  specialBonusTitle.style.fontSize = '14px';
  specialBonusTitle.style.fontWeight = 'bold';
  specialBonusTitle.style.marginBottom = '8px';
  specialBonusTitle.style.color = tier.color;
  specialBonusTitle.textContent = '✨ Two-way Referral Rewards';
  specialBonusContainer.appendChild(specialBonusTitle);
  
  const specialBonusDescription = document.createElement('p');
  specialBonusDescription.style.fontSize = '13px';
  specialBonusDescription.style.marginBottom = '8px';
  specialBonusDescription.style.color = '#4b5563';
  specialBonusDescription.innerHTML = `<strong>Your friend gets:</strong> 1 month free Pro trial when they sign up with your link`;
  specialBonusContainer.appendChild(specialBonusDescription);
  
  const upgradeBonusDescription = document.createElement('p');
  upgradeBonusDescription.style.fontSize = '13px';
  upgradeBonusDescription.style.marginBottom = '0';
  upgradeBonusDescription.style.color = '#4b5563';
  upgradeBonusDescription.innerHTML = `<strong>You get:</strong> ${tier.referralProgram.referralMultiplier ? `<span style="color: ${tier.color}; font-weight: bold;">${tier.referralProgram.referralMultiplier}x bonus</span> when friends upgrade to Lifetime` : 'Standard reward for any paid plan your friend chooses'}`;
  specialBonusContainer.appendChild(upgradeBonusDescription);
  
  container.appendChild(specialBonusContainer);
  
  // Bonus thresholds
  if (tier.referralProgram.bonusThresholds && tier.referralProgram.bonusThresholds.length > 0) {
    const bonusContainer = document.createElement('div');
    bonusContainer.style.marginBottom = '16px';
    
    const bonusTitle = document.createElement('p');
    bonusTitle.style.fontSize = '14px';
    bonusTitle.style.fontWeight = 'bold';
    bonusTitle.style.marginBottom = '8px';
    bonusTitle.textContent = 'Bonus rewards:';
    bonusContainer.appendChild(bonusTitle);
    
    const bonusList = document.createElement('ul');
    bonusList.style.listStyle = 'none';
    bonusList.style.padding = '0';
    bonusList.style.margin = '0';
    
    tier.referralProgram.bonusThresholds.forEach(threshold => {
      const item = document.createElement('li');
      item.style.fontSize = '14px';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.marginBottom = '6px';
      
      // Add checkmark icon
      item.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${tier.color}" stroke-width="2" style="margin-right: 8px">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${threshold.count} referrals: <strong>$${threshold.reward} bonus</strong></span>
      `;
      
      bonusList.appendChild(item);
    });
    
    bonusContainer.appendChild(bonusList);
    container.appendChild(bonusContainer);
  }
  
  const maxInfo = document.createElement('p');
  maxInfo.style.fontSize = '13px';
  maxInfo.style.color = '#6b7280';
  maxInfo.style.marginBottom = '16px';
  maxInfo.innerHTML = `Max referral credit: <strong>$${tier.referralProgram.maxReferralCredit}</strong>`;
  
  if (tier.referralProgram.lifetimeReferralBonus) {
    maxInfo.innerHTML += ' <span style="color: #10b981; font-weight: bold;">(Unlimited for Lifetime members!)</span>';
  }
  
  container.appendChild(maxInfo);
  
  // Referral Link
  const linkContainer = document.createElement('div');
  linkContainer.style.marginTop = '16px';
  
  const linkLabel = document.createElement('label');
  linkLabel.style.display = 'block';
  linkLabel.style.fontSize = '14px';
  linkLabel.style.fontWeight = 'bold';
  linkLabel.style.marginBottom = '8px';
  linkLabel.textContent = 'Your Referral Link:';
  linkContainer.appendChild(linkLabel);
  
  const linkGroup = document.createElement('div');
  linkGroup.style.display = 'flex';
  
  const linkInput = document.createElement('input');
  linkInput.type = 'text';
  linkInput.readOnly = true;
  const referralLink = generateReferralLink();
  linkInput.value = referralLink;
  linkInput.style.flex = '1';
  linkInput.style.padding = '8px 12px';
  linkInput.style.border = '1px solid #d1d5db';
  linkInput.style.borderRadius = '4px 0 0 4px';
  linkInput.style.fontSize = '14px';
  linkGroup.appendChild(linkInput);
  
  const copyButton = document.createElement('button');
  copyButton.style.padding = '8px 12px';
  copyButton.style.backgroundColor = tier.color;
  copyButton.style.color = 'white';
  copyButton.style.border = 'none';
  copyButton.style.borderRadius = '0 4px 0 0';
  copyButton.style.fontSize = '14px';
  copyButton.style.cursor = 'pointer';
  copyButton.textContent = 'Copy';
  
  copyButton.addEventListener('click', () => {
    linkInput.select();
    document.execCommand('copy');
    createToast('Referral link copied to clipboard!', 'success');
  });
  
  linkGroup.appendChild(copyButton);
  
  // Add share button if Web Share API is available
  if (navigator.share) {
    const shareButton = document.createElement('button');
    shareButton.style.padding = '8px 12px';
    shareButton.style.backgroundColor = '#10b981'; // Green color for share
    shareButton.style.color = 'white';
    shareButton.style.border = 'none';
    shareButton.style.borderRadius = '0 4px 4px 0';
    shareButton.style.fontSize = '14px';
    shareButton.style.cursor = 'pointer';
    
    // Add share icon
    shareButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
    `;
    
    shareButton.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: 'Join me on Stackr',
          text: 'Use my referral link to join Stackr and get 1 month free Pro trial!',
          url: referralLink
        });
        createToast('Thanks for sharing!', 'success');
      } catch (err) {
        console.error('Share failed:', err);
      }
    });
    
    linkGroup.appendChild(shareButton);
  }
  
  linkContainer.appendChild(linkGroup);
  
  // Add share suggestions
  const shareSuggestions = document.createElement('div');
  shareSuggestions.style.marginTop = '12px';
  shareSuggestions.style.fontSize = '13px';
  shareSuggestions.style.color = '#6b7280';
  
  const shareText = document.createElement('p');
  shareText.style.margin = '0 0 8px 0';
  shareText.textContent = 'Suggested message:';
  shareSuggestions.appendChild(shareText);
  
  const messageBox = document.createElement('div');
  messageBox.style.padding = '8px 12px';
  messageBox.style.backgroundColor = '#f9fafb';
  messageBox.style.border = '1px solid #e5e7eb';
  messageBox.style.borderRadius = '4px';
  messageBox.style.fontSize = '13px';
  messageBox.style.fontStyle = 'italic';
  messageBox.style.color = '#4b5563';
  messageBox.textContent = 'I\'ve been using Stackr to manage my finances and thought you might like it too! Use my referral link for 1 month of Pro access free.';
  shareSuggestions.appendChild(messageBox);
  
  linkContainer.appendChild(shareSuggestions);
  
  container.appendChild(linkContainer);
  
  return container;
}

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
  
  // Add referral program section if authenticated
  if (isAuthenticated() && tier.referralProgram) {
    const referralSection = renderReferralProgram(tier);
    if (referralSection) {
      card.appendChild(referralSection);
    }
  }
  
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
  
  // Render sidebar with membership section active
  renderSidebar('membership');
  
  // Get user's current tier
  const currentTier = isAuthenticated() ? getUserSubscriptionTier() : 'free';
  
  // Create page container
  const pageContainer = document.createElement('div');
  pageContainer.style.maxWidth = '1200px';
  pageContainer.style.margin = '0 auto';
  pageContainer.style.padding = '20px 20px 40px';
  pageContainer.style.position = 'relative'; // Added for absolute positioning of close button
  
  // Add close button (X)
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
  closeButton.style.zIndex = '10';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button clicked - redirecting to dashboard');
    
    // Create a close button that works with the app's navigation system
    try {
      // First trigger a hashchange event
      window.location.hash = '#dashboard';
      
      // Also manually dispatch a popstate event to ensure the app handles it
      const popStateEvent = new PopStateEvent('popstate', {
        bubbles: true,
        cancelable: true,
        state: { page: 'dashboard' }
      });
      window.dispatchEvent(popStateEvent);
      
      // Fallback - try to reload the page if needed
      if (document.getElementById('app').innerHTML.includes('Stackr Finance Membership')) {
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (err) {
      console.error('Error navigating:', err);
      // Last resort fallback
      window.location.href = window.location.origin + window.location.pathname + '#dashboard';
    }
  });
  pageContainer.appendChild(closeButton);
  
  // Add Stackr logo at the top
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.marginBottom = '30px';
  logoContainer.style.cursor = 'pointer';
  
  const logo = document.createElement('img');
  logo.src = '/green/public/stackr-logo.svg';
  logo.alt = 'Stackr Logo';
  logo.style.width = '180px';
  logo.style.height = 'auto';
  
  // Add click event to redirect based on authentication status
  logoContainer.addEventListener('click', () => {
    if (isAuthenticated()) {
      window.location.hash = '#dashboard';
    } else {
      window.location.hash = '#';
    }
  });
  
  logoContainer.appendChild(logo);
  pageContainer.appendChild(logoContainer);
  
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
  subtitle.textContent = 'Choose the plan that"s right for you and take your financial journey to the next level.';
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
  
  // Ensure sidebar is rendered
  renderSidebar('membership');
  
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
  
  // Add Stackr logo at the top of the modal
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.marginBottom = '24px';
  logoContainer.style.cursor = 'pointer';
  
  const logo = document.createElement('img');
  logo.src = '/green/public/stackr-logo.svg';
  logo.alt = 'Stackr Logo';
  logo.style.width = '150px';
  logo.style.height = 'auto';
  
  // Add click event to redirect based on authentication status
  logoContainer.addEventListener('click', () => {
    // Remove the modal first
    document.body.removeChild(overlay);
    
    // Then redirect
    if (isAuthenticated()) {
      window.location.hash = '#dashboard';
    } else {
      window.location.hash = '#';
    }
  });
  
  logoContainer.appendChild(logo);
  modal.appendChild(logoContainer);
  
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
    
    // If the user is authenticated, try to trigger navigation to dashboard
    if (isAuthenticated()) {
      try {
        // First trigger a hashchange event
        window.location.hash = '#dashboard';
        
        // Also manually dispatch a popstate event to ensure the app handles it
        const popStateEvent = new PopStateEvent('popstate', {
          bubbles: true,
          cancelable: true,
          state: { page: 'dashboard' }
        });
        window.dispatchEvent(popStateEvent);
      } catch (err) {
        console.error('Error navigating from modal:', err);
      }
    }
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
  featuresTitle.textContent = 'What"s included:';
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
  
  // Add referral program section if authenticated and tier has a referral program
  if (isAuthenticated() && tier.referralProgram) {
    const referralSection = renderReferralProgram(tier);
    if (referralSection) {
      modal.appendChild(referralSection);
    }
  }
  
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