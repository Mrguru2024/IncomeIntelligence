/**
 * Utilities for handling subscription status and Pro features access
 */

/**
 * Check if the user has Pro access
 * @param {Object} user - User object from authentication
 * @returns {boolean} - Whether user has Pro access
 */
export function hasProAccess(user) {
  if (!user) return false;
  
  // If the user has a subscription plan, check if it's Pro or Lifetime
  if (user.subscriptionPlan) {
    return ['pro', 'lifetime'].includes(user.subscriptionPlan.toLowerCase());
  }
  
  // If user has a stripe subscription ID, they have Pro access
  if (user.stripeSubscriptionId) {
    return true;
  }
  
  // Special case for users with username containing "Pro"
  // This is for testing purposes in development, remove in production
  if (user.username && user.username.toLowerCase().includes('pro')) {
    return true;
  }
  
  return false;
}

/**
 * Check if a specific feature is accessible to the user
 * @param {Object} user - User object from authentication
 * @param {string} featureId - ID of the feature to check
 * @returns {boolean} - Whether user can access the feature
 */
export function canAccessFeature(user, featureId) {
  // List of features that require Pro access
  const proFeatures = [
    'moneymentor',
    'challenges',
    'bankconnections',
    'subscriptionsniper',
    'financialmascot'
  ];
  
  // If the feature requires Pro, check Pro access
  if (proFeatures.includes(featureId)) {
    return hasProAccess(user);
  }
  
  // All users can access non-Pro features
  return true;
}

/**
 * Get subscription details for a user
 * @param {Object} user - User object from authentication
 * @returns {Object} - Subscription details
 */
export function getSubscriptionDetails(user) {
  const isPro = hasProAccess(user);
  
  // Default free plan
  let plan = {
    name: 'Free',
    level: 'free',
    features: [
      'Basic Income Tracking',
      'Expense Management',
      'Basic Dashboard',
    ],
    restrictions: [
      'No AI Assistant',
      'No Subscription Management',
      'No Bank Connections'
    ]
  };
  
  // If Pro user, return Pro plan details
  if (isPro) {
    plan = {
      name: 'Professional',
      level: 'pro',
      features: [
        'Advanced Income Tracking',
        'Subscription Management',
        'Money Mentor AI',
        'Bank Connections',
        'Savings Challenges',
        'Unlimited Goals',
        'Advanced Analytics',
        'Financial Mascot Personalities'
      ],
      restrictions: []
    };
    
    // Check if Lifetime subscriber
    if (user.subscriptionPlan && user.subscriptionPlan.toLowerCase() === 'lifetime') {
      plan.name = 'Lifetime Pro';
      plan.level = 'lifetime';
    }
  }
  
  return {
    isPro,
    plan,
    renewalDate: user.subscriptionRenewalDate || null,
    status: isPro ? 'active' : 'free'
  };
}

/**
 * Display an upgrade prompt for a feature that requires Pro subscription
 * @param {string} featureName - Name of the feature requiring Pro
 * @returns {HTMLElement} - Upgrade prompt element
 */
export function createUpgradePrompt(featureName) {
  const container = document.createElement('div');
  container.className = 'pro-upgrade-prompt';
  container.style.padding = '24px';
  container.style.borderRadius = '12px';
  container.style.background = 'linear-gradient(135deg, rgba(88, 68, 179, 0.1) 0%, rgba(112, 65, 181, 0.15) 100%)';
  container.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  container.style.textAlign = 'center';
  container.style.maxWidth = '500px';
  container.style.margin = '40px auto';
  
  const lockIcon = document.createElement('div');
  lockIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lock-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
  lockIcon.style.margin = '0 auto 16px';
  lockIcon.style.color = 'var(--color-primary)';
  container.appendChild(lockIcon);
  
  const title = document.createElement('h3');
  title.textContent = `Unlock ${featureName}`;
  title.style.fontSize = '22px';
  title.style.fontWeight = '700';
  title.style.marginBottom = '12px';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = `This premium feature is available exclusively to Stackr Pro subscribers. Upgrade your account to access ${featureName} and other advanced tools to boost your financial success.`;
  description.style.fontSize = '15px';
  description.style.lineHeight = '1.5';
  description.style.marginBottom = '24px';
  description.style.color = '#666';
  container.appendChild(description);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '12px';
  
  const upgradeButton = document.createElement('button');
  upgradeButton.textContent = 'Upgrade to Pro';
  upgradeButton.style.padding = '12px 24px';
  upgradeButton.style.borderRadius = '6px';
  upgradeButton.style.backgroundColor = 'var(--color-primary)';
  upgradeButton.style.color = 'white';
  upgradeButton.style.fontWeight = '600';
  upgradeButton.style.border = 'none';
  upgradeButton.style.cursor = 'pointer';
  upgradeButton.style.transition = 'all 0.2s ease';
  
  upgradeButton.addEventListener('mouseover', () => {
    upgradeButton.style.transform = 'translateY(-2px)';
    upgradeButton.style.boxShadow = '0 6px 20px rgba(var(--color-primary-rgb), 0.3)';
  });
  
  upgradeButton.addEventListener('mouseout', () => {
    upgradeButton.style.transform = 'translateY(0)';
    upgradeButton.style.boxShadow = 'none';
  });
  
  upgradeButton.addEventListener('click', () => {
    // Navigate to the pricing page
    import('../sidebar.js').then(module => {
      module.navigateTo('pricing');
    });
  });
  
  buttonContainer.appendChild(upgradeButton);
  
  const learnMoreButton = document.createElement('button');
  learnMoreButton.textContent = 'Learn More';
  learnMoreButton.style.padding = '12px 24px';
  learnMoreButton.style.borderRadius = '6px';
  learnMoreButton.style.backgroundColor = 'transparent';
  learnMoreButton.style.color = 'var(--color-primary)';
  learnMoreButton.style.fontWeight = '600';
  learnMoreButton.style.border = '1px solid var(--color-primary)';
  learnMoreButton.style.cursor = 'pointer';
  learnMoreButton.style.transition = 'all 0.2s ease';
  
  learnMoreButton.addEventListener('mouseover', () => {
    learnMoreButton.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)';
  });
  
  learnMoreButton.addEventListener('mouseout', () => {
    learnMoreButton.style.backgroundColor = 'transparent';
  });
  
  learnMoreButton.addEventListener('click', () => {
    // Open a modal with more information about Pro features
    const featuresModal = createProFeaturesModal();
    document.body.appendChild(featuresModal);
  });
  
  buttonContainer.appendChild(learnMoreButton);
  container.appendChild(buttonContainer);
  
  return container;
}

/**
 * Create a modal showcasing Pro features
 * @returns {HTMLElement} - Modal element
 */
function createProFeaturesModal() {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '9999';
  
  const modal = document.createElement('div');
  modal.className = 'pro-features-modal';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '600px';
  modal.style.width = '90%';
  modal.style.maxHeight = '80vh';
  modal.style.overflow = 'auto';
  modal.style.position = 'relative';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '16px';
  closeButton.style.right = '16px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = '#666';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  modal.appendChild(closeButton);
  
  const header = document.createElement('div');
  header.style.padding = '32px 32px 0';
  modal.appendChild(header);
  
  const title = document.createElement('h2');
  title.textContent = 'Stackr Pro Features';
  title.style.fontSize = '24px';
  title.style.marginBottom = '8px';
  header.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Elevate your financial journey with our premium features';
  subtitle.style.fontSize = '16px';
  subtitle.style.color = '#666';
  header.appendChild(subtitle);
  
  const content = document.createElement('div');
  content.style.padding = '24px 32px 32px';
  modal.appendChild(content);
  
  // List of Pro features
  const features = [
    {
      name: 'Money Mentor AI',
      description: 'Your personal AI financial advisor, available 24/7 to answer questions, analyze spending patterns, and provide personalized advice.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path><path d="M17 21.32a10 10 0 0 0 5 -5.32"></path><path d="M9 15a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path><path d="M12 13v2"></path></svg>'
    },
    {
      name: 'Bank Connections',
      description: 'Securely connect your bank accounts to automatically import transactions and maintain a comprehensive financial overview.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>'
    },
    {
      name: 'Subscription Sniper',
      description: 'Track, manage, and optimize your recurring subscriptions. Identify unused services and potential savings opportunities automatically.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
    },
    {
      name: 'Financial Mascot',
      description: 'Customize your financial coach with different personalities and mascot styles to make your financial journey more engaging and personalized.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><circle cx="12" cy="8" r="1" /><path d="M12 16v-5" /><path d="M16 16c-1.5 0-3-1.5-4-2-1 .5-2.5 2-4 2" /></svg>'
    },
    {
      name: 'Savings Challenges',
      description: 'Interactive savings challenges designed to make saving fun and rewarding with progress tracking and achievement badges.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    },
    {
      name: 'Advanced Analytics',
      description: 'Comprehensive financial insights with detailed charts, trends, predictions, and personalized recommendations.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'
    }
  ];
  
  features.forEach(feature => {
    const featureCard = document.createElement('div');
    featureCard.style.display = 'flex';
    featureCard.style.alignItems = 'flex-start';
    featureCard.style.padding = '16px';
    featureCard.style.marginBottom = '16px';
    featureCard.style.borderRadius = '8px';
    featureCard.style.backgroundColor = '#f8f9fa';
    
    const iconContainer = document.createElement('div');
    iconContainer.style.backgroundColor = 'var(--color-primary)';
    iconContainer.style.color = 'white';
    iconContainer.style.width = '40px';
    iconContainer.style.height = '40px';
    iconContainer.style.borderRadius = '8px';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.marginRight = '16px';
    iconContainer.style.flexShrink = '0';
    iconContainer.innerHTML = feature.icon;
    featureCard.appendChild(iconContainer);
    
    const textContainer = document.createElement('div');
    
    const featureName = document.createElement('h4');
    featureName.textContent = feature.name;
    featureName.style.fontSize = '16px';
    featureName.style.marginBottom = '4px';
    textContainer.appendChild(featureName);
    
    const description = document.createElement('p');
    description.textContent = feature.description;
    description.style.fontSize = '14px';
    description.style.margin = '0';
    description.style.color = '#666';
    textContainer.appendChild(description);
    
    featureCard.appendChild(textContainer);
    content.appendChild(featureCard);
  });
  
  const footer = document.createElement('div');
  footer.style.padding = '0 32px 32px';
  footer.style.textAlign = 'center';
  modal.appendChild(footer);
  
  const ctaButton = document.createElement('button');
  ctaButton.textContent = 'Upgrade to Pro';
  ctaButton.style.padding = '12px 32px';
  ctaButton.style.borderRadius = '6px';
  ctaButton.style.backgroundColor = 'var(--color-primary)';
  ctaButton.style.color = 'white';
  ctaButton.style.fontWeight = '600';
  ctaButton.style.border = 'none';
  ctaButton.style.cursor = 'pointer';
  ctaButton.style.fontSize = '16px';
  ctaButton.style.width = '100%';
  
  ctaButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    // Navigate to pricing page
    import('../sidebar.js').then(module => {
      module.navigateTo('pricing');
    });
  });
  
  footer.appendChild(ctaButton);
  modalOverlay.appendChild(modal);
  
  // Close modal when clicking on overlay
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
  
  return modalOverlay;
}