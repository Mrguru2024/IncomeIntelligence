/**
 * Subscriptions Page for Stackr Finance GREEN version
 * This page handles the display and management of subscription plans
 */

/**
 * Render the subscriptions page
 * @returns {HTMLElement} The subscriptions page element
 */
export function renderSubscriptionsPage() {
  // Create page container
  const container = document.createElement('div');
  container.classList.add('subscriptions-page');
  container.style.padding = '40px 20px';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';

  // Create page header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '50px';

  const title = document.createElement('h1');
  title.textContent = 'Choose Your Plan';
  title.style.fontSize = '36px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  title.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  title.style.WebkitBackgroundClip = 'text';
  title.style.WebkitTextFillColor = 'transparent';
  title.style.color = 'var(--color-primary)';
  
  const description = document.createElement('p');
  description.textContent = 'Unlock powerful features to maximize your financial growth and success.';
  description.style.fontSize = '18px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.maxWidth = '600px';
  description.style.margin = '0 auto';
  
  header.appendChild(title);
  header.appendChild(description);
  container.appendChild(header);

  // Create pricing cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexWrap = 'wrap';
  cardsContainer.style.justifyContent = 'center';
  cardsContainer.style.gap = '30px';
  cardsContainer.style.marginBottom = '60px';
  
  // Define subscription plans
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic features to get started with financial tracking.',
      features: [
        'Income tracking',
        'Basic expense categorization',
        'Single bank account connection',
        'Monthly financial summary',
        'Standard customer support'
      ],
      popular: false,
      buttonText: 'Current Plan',
      buttonAction: () => {},
      buttonDisabled: true
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'Advanced features for financial growth and management.',
      features: [
        'Everything in Free',
        'Unlimited bank connections',
        'AI-powered financial advice',
        'Income allocation automation',
        'Advanced goal tracking',
        'Export data to CSV/PDF',
        'Priority customer support'
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonAction: () => handleSubscribe('pro'),
      buttonDisabled: false
    },
    {
      name: 'Lifetime',
      price: '$99',
      period: 'one-time payment',
      description: 'All Pro features forever with a single payment.',
      features: [
        'Everything in Pro',
        'One-time payment (no recurring charges)',
        'Early access to new features',
        'Personalized onboarding session',
        'Dedicated support line',
        'Unlimited exports',
        'Custom financial reports'
      ],
      popular: false,
      buttonText: 'Get Lifetime Access',
      buttonAction: () => handleSubscribe('lifetime'),
      buttonDisabled: false
    }
  ];
  
  // Create cards for each plan
  plans.forEach(plan => {
    const card = createPricingCard(plan);
    cardsContainer.appendChild(card);
  });
  
  container.appendChild(cardsContainer);
  
  // FAQ Section
  const faqSection = createFAQSection();
  container.appendChild(faqSection);
  
  return container;
}

/**
 * Create a pricing card for a subscription plan
 * @param {Object} plan - The subscription plan data
 * @returns {HTMLElement} The pricing card element
 */
function createPricingCard(plan) {
  const currentUser = JSON.parse(localStorage.getItem('stackrUser') || '{}');
  const isCurrentPlan = currentUser.subscriptionTier === plan.name.toLowerCase();
  
  const card = document.createElement('div');
  card.classList.add('pricing-card');
  card.style.background = 'white';
  card.style.borderRadius = '12px';
  card.style.boxShadow = plan.popular ? 
    '0 8px 30px rgba(0, 0, 0, 0.15)' :
    '0 5px 15px rgba(0, 0, 0, 0.08)';
  card.style.padding = '32px';
  card.style.width = '340px';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.position = 'relative';
  card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
  card.style.border = plan.popular ? 
    '2px solid var(--color-primary)' : 
    '1px solid var(--color-border)';
  
  // Hover effect
  card.onmouseenter = () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = plan.popular ? 
      '0 12px 40px rgba(0, 0, 0, 0.2)' :
      '0 8px 25px rgba(0, 0, 0, 0.12)';
  };
  
  card.onmouseleave = () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = plan.popular ? 
      '0 8px 30px rgba(0, 0, 0, 0.15)' :
      '0 5px 15px rgba(0, 0, 0, 0.08)';
  };
  
  // Popular badge
  if (plan.popular) {
    const badge = document.createElement('div');
    badge.textContent = 'MOST POPULAR';
    badge.style.position = 'absolute';
    badge.style.top = '-12px';
    badge.style.left = '50%';
    badge.style.transform = 'translateX(-50%)';
    badge.style.background = 'var(--color-primary)';
    badge.style.color = 'white';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.padding = '4px 12px';
    badge.style.borderRadius = '20px';
    badge.style.letterSpacing = '1px';
    card.appendChild(badge);
  }
  
  // Plan name
  const planName = document.createElement('h3');
  planName.textContent = plan.name;
  planName.style.fontSize = '24px';
  planName.style.fontWeight = 'bold';
  planName.style.marginBottom = '8px';
  planName.style.color = plan.popular ? 'var(--color-primary)' : 'var(--color-text)';
  
  // Plan price
  const priceContainer = document.createElement('div');
  priceContainer.style.marginBottom = '16px';
  
  const price = document.createElement('span');
  price.textContent = plan.price;
  price.style.fontSize = '36px';
  price.style.fontWeight = 'bold';
  price.style.color = 'var(--color-text)';
  
  const period = document.createElement('span');
  period.textContent = ` ${plan.period}`;
  period.style.fontSize = '16px';
  period.style.color = 'var(--color-text-secondary)';
  
  priceContainer.appendChild(price);
  priceContainer.appendChild(period);
  
  // Plan description
  const description = document.createElement('p');
  description.textContent = plan.description;
  description.style.fontSize = '16px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.marginBottom = '24px';
  description.style.lineHeight = '1.5';
  
  // Features list
  const featuresList = document.createElement('ul');
  featuresList.style.listStyleType = 'none';
  featuresList.style.padding = '0';
  featuresList.style.marginBottom = '32px';
  featuresList.style.flexGrow = '1';
  
  plan.features.forEach(feature => {
    const featureItem = document.createElement('li');
    featureItem.style.display = 'flex';
    featureItem.style.alignItems = 'center';
    featureItem.style.marginBottom = '12px';
    featureItem.style.color = 'var(--color-text)';
    featureItem.style.fontSize = '15px';
    
    const checkIcon = document.createElement('span');
    checkIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    checkIcon.style.marginRight = '10px';
    checkIcon.style.color = 'var(--color-primary)';
    checkIcon.style.display = 'flex';
    checkIcon.style.alignItems = 'center';
    checkIcon.style.justifyContent = 'center';
    
    featureItem.appendChild(checkIcon);
    featureItem.appendChild(document.createTextNode(feature));
    featuresList.appendChild(featureItem);
  });
  
  // Action button
  const button = document.createElement('button');
  button.textContent = isCurrentPlan ? 'Current Plan' : plan.buttonText;
  button.style.width = '100%';
  button.style.padding = '12px';
  button.style.borderRadius = '8px';
  button.style.fontSize = '16px';
  button.style.fontWeight = '600';
  button.style.cursor = isCurrentPlan ? 'default' : 'pointer';
  button.style.transition = 'all 0.2s ease';
  
  if (isCurrentPlan) {
    button.style.backgroundColor = '#e0e0e0';
    button.style.color = '#666666';
    button.style.border = 'none';
    button.disabled = true;
  } else {
    button.style.backgroundColor = plan.popular ? 'var(--color-primary)' : 'white';
    button.style.color = plan.popular ? 'white' : 'var(--color-primary)';
    button.style.border = plan.popular ? 'none' : '2px solid var(--color-primary)';
    
    // Hover effect for button
    button.onmouseenter = () => {
      if (plan.popular) {
        button.style.backgroundColor = 'var(--color-primary-dark)';
      } else {
        button.style.backgroundColor = 'var(--color-primary-light)';
      }
    };
    
    button.onmouseleave = () => {
      if (plan.popular) {
        button.style.backgroundColor = 'var(--color-primary)';
      } else {
        button.style.backgroundColor = 'white';
      }
    };
    
    button.onclick = plan.buttonAction;
  }
  
  // Assemble card
  card.appendChild(planName);
  card.appendChild(priceContainer);
  card.appendChild(description);
  card.appendChild(featuresList);
  card.appendChild(button);
  
  return card;
}

/**
 * Handle subscription purchase
 * @param {string} tier - The subscription tier to purchase
 */
async function handleSubscribe(tier) {
  try {
    // Check if user is logged in
    const token = localStorage.getItem('stackrToken');
    if (!token) {
      window.location.href = '#login?redirect=subscriptions';
      return;
    }
    
    // Redirect to Stripe checkout
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tier })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    const { url } = await response.json();
    window.location.href = url;
    
  } catch (error) {
    console.error('Subscription error:', error);
    alert(`Subscription error: ${error.message}`);
  }
}

/**
 * Create FAQ section
 * @returns {HTMLElement} The FAQ section element
 */
function createFAQSection() {
  const faqSection = document.createElement('div');
  faqSection.style.marginTop = '60px';
  faqSection.style.maxWidth = '800px';
  faqSection.style.margin = '60px auto 0';
  
  const faqTitle = document.createElement('h2');
  faqTitle.textContent = 'Frequently Asked Questions';
  faqTitle.style.fontSize = '28px';
  faqTitle.style.fontWeight = 'bold';
  faqTitle.style.marginBottom = '30px';
  faqTitle.style.textAlign = 'center';
  
  faqSection.appendChild(faqTitle);
  
  const faqs = [
    {
      question: 'Can I upgrade or downgrade my plan later?',
      answer: 'Yes, you can upgrade your plan at any time. If you upgrade from Free to Pro, you\'ll have immediate access to all Pro features. If you want to downgrade, you can do so at the end of your billing period.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Absolutely. We use Stripe, a PCI-compliant payment processor, to handle all transactions. Your payment details are never stored on our servers.'
    },
    {
      question: 'What happens when my Pro subscription ends?',
      answer: 'If you choose not to renew your Pro subscription, your account will automatically revert to the Free plan. You\'ll still have access to your data, but Pro features will no longer be available.'
    },
    {
      question: 'Is there a trial period for Pro?',
      answer: 'Yes, we offer a 14-day free trial of Pro features. No credit card is required for the trial, and you can cancel at any time.'
    },
    {
      question: 'What is the refund policy?',
      answer: 'We offer a 30-day money-back guarantee for Pro subscriptions. If you're not satisfied with our service, contact our support team within 30 days of purchase for a full refund. Lifetime purchases are eligible for refunds within 60 days of purchase.'
    }
  ];
  
  faqs.forEach(faq => {
    const faqItem = document.createElement('div');
    faqItem.style.marginBottom = '24px';
    faqItem.style.padding = '20px';
    faqItem.style.borderRadius = '8px';
    faqItem.style.backgroundColor = 'white';
    faqItem.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
    
    const question = document.createElement('h3');
    question.textContent = faq.question;
    question.style.fontSize = '18px';
    question.style.fontWeight = '600';
    question.style.marginBottom = '12px';
    question.style.color = 'var(--color-primary)';
    
    const answer = document.createElement('p');
    answer.textContent = faq.answer;
    answer.style.fontSize = '16px';
    answer.style.lineHeight = '1.6';
    answer.style.color = 'var(--color-text-secondary)';
    
    faqItem.appendChild(question);
    faqItem.appendChild(answer);
    faqSection.appendChild(faqItem);
  });
  
  // Contact support section
  const supportSection = document.createElement('div');
  supportSection.style.textAlign = 'center';
  supportSection.style.marginTop = '40px';
  
  const supportText = document.createElement('p');
  supportText.textContent = 'Still have questions?';
  supportText.style.fontSize = '18px';
  supportText.style.marginBottom = '16px';
  
  const supportButton = document.createElement('a');
  supportButton.textContent = 'Contact Support';
  supportButton.href = '#support';
  supportButton.style.display = 'inline-block';
  supportButton.style.padding = '10px 20px';
  supportButton.style.borderRadius = '8px';
  supportButton.style.backgroundColor = 'white';
  supportButton.style.color = 'var(--color-primary)';
  supportButton.style.border = '2px solid var(--color-primary)';
  supportButton.style.textDecoration = 'none';
  supportButton.style.fontWeight = '600';
  supportButton.style.transition = 'all 0.2s ease';
  
  supportButton.onmouseenter = () => {
    supportButton.style.backgroundColor = 'var(--color-primary-light)';
  };
  
  supportButton.onmouseleave = () => {
    supportButton.style.backgroundColor = 'white';
  };
  
  supportSection.appendChild(supportText);
  supportSection.appendChild(supportButton);
  faqSection.appendChild(supportSection);
  
  return faqSection;
}