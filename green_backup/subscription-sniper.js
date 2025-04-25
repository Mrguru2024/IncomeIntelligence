/**
 * Subscription Sniper Module
 * This module detects recurring subscription payments from bank transaction data
 * and provides tools to manage and cancel subscriptions
 */

// Import helper functions
import { formatCurrency, formatDate } from './bank-connections.js';

/**
 * Fetch transactions for a specific user
 * @param {string|number} userId - User ID (can be string or number)
 * @param {number} lookbackDays - Number of days to look back (default 180 days)
 * @returns {Promise<Array>} - Array of transactions
 */
async function fetchUserTransactions(userId, lookbackDays = 180) {
  try {
    // First get all bank connections for the user
    const connectionsResponse = await fetch(`/api/bank-connections/user/${encodeURIComponent(userId)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!connectionsResponse.ok) {
      const errorData = await connectionsResponse.json().catch(() => ({}));
      console.error('Failed to fetch bank connections:', {
        status: connectionsResponse.status,
        statusText: connectionsResponse.statusText,
        error: errorData,
        userId: userId
      });
      
      // If no bank connections found, return empty array instead of throwing
      if (connectionsResponse.status === 404) {
        console.warn('No bank connections found for user:', userId);
        return [];
      }
      
      throw new Error(`Failed to fetch bank connections: ${connectionsResponse.status} ${connectionsResponse.statusText}`);
    }
    
    const connections = await connectionsResponse.json();
    
    if (!connections || connections.length === 0) {
      console.warn('No bank connections found for user:', userId);
      return [];
    }
    
    // Get transactions for each account
    const allTransactions = [];
    for (const connection of connections) {
      try {
        const accountsResponse = await fetch(`/api/bank-connections/${connection.id}/accounts`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!accountsResponse.ok) {
          console.warn(`Failed to fetch accounts for connection ${connection.id}:`, {
            status: accountsResponse.status,
            statusText: accountsResponse.statusText
          });
          continue;
        }
        
        const accounts = await accountsResponse.json();
        for (const account of accounts) {
          try {
            const transactionsResponse = await fetch(`/api/bank-accounts/${account.id}/transactions`, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (!transactionsResponse.ok) {
              console.warn(`Failed to fetch transactions for account ${account.id}:`, {
                status: transactionsResponse.status,
                statusText: transactionsResponse.statusText
              });
              continue;
            }
            
            const transactions = await transactionsResponse.json();
            allTransactions.push(...transactions);
          } catch (error) {
            console.error(`Error fetching transactions for account ${account.id}:`, error);
            continue;
          }
        }
      } catch (error) {
        console.error(`Error fetching accounts for connection ${connection.id}:`, error);
        continue;
      }
    }
    
    // Filter transactions by date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endDate;
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Detect recurring subscription payments from transaction data
 * @param {Array} transactions - Transaction data
 * @returns {Array} - Array of detected subscription objects
 */
function detectSubscriptions(transactions) {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  // Group transactions by merchant name
  const groupedByMerchant = {};
  
  transactions.forEach(transaction => {
    const name = transaction.merchantName || transaction.name;
    if (!groupedByMerchant[name]) {
      groupedByMerchant[name] = [];
    }
    groupedByMerchant[name].push(transaction);
  });
  
  // Analyze patterns for recurring payments
  const subscriptions = [];
  
  for (const [merchant, merchantTransactions] of Object.entries(groupedByMerchant)) {
    // Skip if there's only 1 transaction from this merchant
    if (merchantTransactions.length <= 1) {
      continue;
    }
    
    // Sort by date (newest first)
    merchantTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Check for recurring patterns
    if (isLikelySubscription(merchantTransactions)) {
      // Get the most recent transaction for details
      const latestTransaction = merchantTransactions[0];
      
      // Estimate next charge date
      const nextChargeDate = estimateNextChargeDate(merchantTransactions);
      
      // Create subscription object
      subscriptions.push({
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantName: merchant,
        amount: latestTransaction.amount,
        currency: latestTransaction.currencyCode || 'USD',
        lastChargeDate: latestTransaction.date,
        nextChargeDate: nextChargeDate,
        frequency: detectFrequency(merchantTransactions),
        accountId: latestTransaction.accountId,
        connectionId: latestTransaction.connectionId,
        institutionName: latestTransaction.institutionName,
        category: latestTransaction.category || [],
        transactionCount: merchantTransactions.length,
        transactions: merchantTransactions.slice(0, 5), // Include last 5 transactions as reference
        status: 'active',
        logoUrl: getLogoUrl(merchant),
        cancelUrl: getCancelUrl(merchant),
        estimatedAnnualCost: calculateAnnualCost(latestTransaction.amount, detectFrequency(merchantTransactions)),
      });
    }
  }
  
  // Sort by estimated annual cost (most expensive first)
  return subscriptions.sort((a, b) => b.estimatedAnnualCost - a.estimatedAnnualCost);
}

/**
 * Determine if a set of transactions is likely a subscription
 * @param {Array} transactions - Transactions for a single merchant
 * @returns {boolean} - Whether it's likely a subscription
 */
function isLikelySubscription(transactions) {
  // Need at least 2 transactions to detect patterns
  if (transactions.length < 2) {
    return false;
  }
  
  // Check if amounts are consistent
  const amounts = transactions.map(t => t.amount);
  const uniqueAmounts = new Set(amounts);
  if (uniqueAmounts.size > 3) {
    // Too many different amounts, probably not a subscription
    return false;
  }
  
  // Check if transaction intervals are consistent
  const dates = transactions.map(t => new Date(t.date).getTime());
  // Convert to array and sort
  const sortedDates = [...dates].sort((a, b) => b - a);
  
  // Calculate intervals between consecutive dates
  const intervals = [];
  for (let i = 0; i < sortedDates.length - 1; i++) {
    intervals.push(Math.round((sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24)));
  }
  
  // Subscriptions typically have relatively consistent intervals
  // Allow for small variations (a few days)
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  
  // Calculate standard deviation
  const squareDiffs = intervals.map(interval => {
    const diff = interval - avgInterval;
    return diff * diff;
  });
  const standardDeviation = Math.sqrt(squareDiffs.reduce((sum, val) => sum + val, 0) / intervals.length);
  
  // If standard deviation is more than 7 days, intervals are too irregular for a subscription
  if (standardDeviation > 7) {
    return false;
  }
  
  // Categories that typically indicate subscriptions
  const subscriptionCategories = [
    'subscription', 'streaming', 'digital', 'recurring', 'service',
    'entertainment', 'software', 'saas', 'membership', 'music', 'video'
  ];
  
  // Check if any transaction has a subscription-related category
  const hasSubscriptionCategory = transactions.some(t => {
    if (!t.category || !Array.isArray(t.category)) return false;
    return t.category.some(cat => 
      subscriptionCategories.some(subCat => 
        cat.toLowerCase().includes(subCat)));
  });
  
  // Common subscription merchant keywords
  const subscriptionKeywords = [
    'netflix', 'spotify', 'hulu', 'disney+', 'disney', 'apple', 'amazon prime',
    'amazon music', 'youtube', 'hbo', 'paramount', 'peacock', 'adobe', 'microsoft',
    'github', 'dropbox', 'google one', 'google storage', 'icloud', 'office365',
    'norton', 'mcafee', 'vpn', 'gym', 'fitness', 'health', 'club', 'membership',
    'magazine', 'news', 'subscription', 'medium', 'substack', 'patreon'
  ];
  
  // Check if merchant name contains a subscription keyword
  const merchantName = transactions[0].merchantName || transactions[0].name;
  const hasSubscriptionKeyword = subscriptionKeywords.some(keyword => 
    merchantName.toLowerCase().includes(keyword.toLowerCase()));
  
  // Combine all factors to determine if likely a subscription
  return (
    // Consistent amounts
    uniqueAmounts.size <= 3 &&
    // Regular intervals (approximately monthly, quarterly, etc)
    avgInterval > 20 && avgInterval < 100 && standardDeviation < 7 &&
    // Either has a subscription category or keyword in merchant name
    (hasSubscriptionCategory || hasSubscriptionKeyword)
  );
}

/**
 * Detect frequency pattern from transactions
 * @param {Array} transactions - Transactions for a single merchant
 * @returns {string} - Frequency label (monthly, quarterly, etc.)
 */
function detectFrequency(transactions) {
  if (transactions.length < 2) {
    return 'unknown';
  }
  
  // Calculate average interval in days
  const dates = transactions.map(t => new Date(t.date).getTime());
  // Convert to array and sort in descending order (newest first)
  const sortedDates = [...dates].sort((a, b) => b - a);
  
  // Calculate intervals between consecutive dates
  const intervals = [];
  for (let i = 0; i < sortedDates.length - 1; i++) {
    intervals.push(Math.round((sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24)));
  }
  
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  
  // Determine frequency based on average interval
  if (avgInterval <= 7.5) {
    return 'weekly';
  } else if (avgInterval <= 15) {
    return 'bi-weekly';
  } else if (avgInterval <= 35) {
    return 'monthly';
  } else if (avgInterval <= 70) {
    return 'bi-monthly';
  } else if (avgInterval <= 100) {
    return 'quarterly';
  } else if (avgInterval <= 190) {
    return 'semi-annual';
  } else {
    return 'annual';
  }
}

/**
 * Estimate the next charge date for a subscription
 * @param {Array} transactions - Transactions for a merchant
 * @returns {string} - ISO date string for estimated next charge
 */
function estimateNextChargeDate(transactions) {
  if (transactions.length < 2) {
    return null;
  }
  
  // Get most recent transaction date
  const lastDate = new Date(transactions[0].date);
  
  // Determine frequency in days
  const frequency = detectFrequency(transactions);
  let daysToAdd = 30; // Default to monthly
  
  switch (frequency) {
    case 'weekly':
      daysToAdd = 7;
      break;
    case 'bi-weekly':
      daysToAdd = 14;
      break;
    case 'monthly':
      daysToAdd = 30;
      break;
    case 'bi-monthly':
      daysToAdd = 60;
      break;
    case 'quarterly':
      daysToAdd = 90;
      break;
    case 'semi-annual':
      daysToAdd = 180;
      break;
    case 'annual':
      daysToAdd = 365;
      break;
  }
  
  // Calculate next date
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate.toISOString();
}

/**
 * Calculate estimated annual cost for a subscription
 * @param {number} amount - Transaction amount
 * @param {string} frequency - Subscription frequency
 * @returns {number} - Estimated annual cost
 */
function calculateAnnualCost(amount, frequency) {
  switch (frequency) {
    case 'weekly':
      return amount * 52;
    case 'bi-weekly':
      return amount * 26;
    case 'monthly':
      return amount * 12;
    case 'bi-monthly':
      return amount * 6;
    case 'quarterly':
      return amount * 4;
    case 'semi-annual':
      return amount * 2;
    case 'annual':
      return amount;
    default:
      return amount * 12; // Default to monthly
  }
}

/**
 * Get logo URL for a merchant (placeholder for now)
 * @param {string} merchantName - Merchant name
 * @returns {string} - Logo URL
 */
function getLogoUrl(merchantName) {
  // This would ideally use a service or database to get accurate logos
  // For now, return a placeholder URL or generate one based on the merchant name
  const firstLetter = merchantName.charAt(0).toUpperCase();
  return `https://via.placeholder.com/48x48.png?text=${firstLetter}`;
}

/**
 * Get cancel URL for a merchant (placeholder for now)
 * @param {string} merchantName - Merchant name
 * @returns {string} - Cancellation URL or instructions
 */
function getCancelUrl(merchantName) {
  // This would ideally use a database of known subscription services
  // For now, return a generic Google search URL
  return `https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(merchantName)}+subscription`;
}

/**
 * Format a frequency string to user-friendly text
 * @param {string} frequency - Frequency string
 * @returns {string} - User-friendly frequency text
 */
function formatFrequency(frequency) {
  switch (frequency) {
    case 'weekly':
      return 'Weekly';
    case 'bi-weekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'bi-monthly':
      return 'Every 2 months';
    case 'quarterly':
      return 'Quarterly';
    case 'semi-annual':
      return 'Twice a year';
    case 'annual':
      return 'Yearly';
    default:
      return 'Unknown frequency';
  }
}

/**
 * Get help text for cancelling a subscription
 * @param {Object} subscription - Subscription object
 * @returns {string} - Help text
 */
function getCancellationHelpText(subscription) {
  const merchant = subscription.merchantName.toLowerCase();
  
  // Predefined instructions for common services
  if (merchant.includes('netflix')) {
    return "Sign in to Netflix → Profile icon → Account → Cancel Membership";
  } else if (merchant.includes('spotify')) {
    return "Sign in to Spotify → Account → Available plans → Cancel Premium → Yes, Cancel";
  } else if (merchant.includes('amazon prime') || merchant.includes('prime video')) {
    return "Sign in to Amazon → Accounts & Lists → Prime → Manage Prime Membership → End Membership";
  } else if (merchant.includes('hulu')) {
    return "Sign in to Hulu → Account → Cancel → Cancel Subscription";
  } else if (merchant.includes('disney')) {
    return "Sign in to Disney+ → Profile → Account → Cancel Subscription";
  } else if (merchant.includes('apple')) {
    return "iPhone/iPad: Settings → Apple ID → Subscriptions → Select service → Cancel\nor Mac: App Store → Account → View Information → Manage → Select service → Cancel";
  } else if (merchant.includes('youtube')) {
    return "Sign in to YouTube → Settings → Memberships → Manage → Deactivate";
  } else if (merchant.includes('hbo')) {
    return "Sign in to HBO Max → Profile → Billing Information → Manage Subscription → Cancel Subscription";
  } else {
    return "Contact the service directly through their website or customer support to cancel. You may also be able to cancel through your bank.";
  }
}

/**
 * Create a subscription detail row for a single subscription
 * @param {Object} subscription - Subscription object
 * @returns {HTMLElement} - Subscription row element
 */
function createSubscriptionRow(subscription) {
  const row = document.createElement('div');
  row.classList.add('subscription-row');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.padding = '16px';
  row.style.borderBottom = '1px solid var(--color-border)';
  row.style.transition = 'background-color 0.2s ease';
  
  // Add hover effect
  row.addEventListener('mouseover', () => {
    row.style.backgroundColor = 'var(--color-card)';
  });
  row.addEventListener('mouseout', () => {
    row.style.backgroundColor = 'transparent';
  });
  
  // Logo/icon
  const logoContainer = document.createElement('div');
  logoContainer.style.width = '48px';
  logoContainer.style.height = '48px';
  logoContainer.style.flexShrink = 0;
  logoContainer.style.marginRight = '16px';
  
  const logo = document.createElement('div');
  logo.style.width = '100%';
  logo.style.height = '100%';
  logo.style.borderRadius = '8px';
  logo.style.backgroundColor = 'var(--color-border)';
  logo.style.display = 'flex';
  logo.style.alignItems = 'center';
  logo.style.justifyContent = 'center';
  logo.style.fontWeight = 'bold';
  logo.style.fontSize = '24px';
  logo.style.color = 'var(--color-primary)';
  logo.textContent = subscription.merchantName.charAt(0).toUpperCase();
  
  logoContainer.appendChild(logo);
  row.appendChild(logoContainer);
  
  // Subscription details
  const detailsContainer = document.createElement('div');
  detailsContainer.style.flexGrow = 1;
  
  const merchantName = document.createElement('div');
  merchantName.style.fontWeight = 'bold';
  merchantName.style.marginBottom = '4px';
  merchantName.textContent = subscription.merchantName;
  
  const subscriptionInfo = document.createElement('div');
  subscriptionInfo.style.display = 'flex';
  subscriptionInfo.style.flexWrap = 'wrap';
  subscriptionInfo.style.gap = '12px';
  subscriptionInfo.style.fontSize = '14px';
  subscriptionInfo.style.color = 'var(--color-text-secondary)';
  
  const frequency = document.createElement('span');
  frequency.textContent = formatFrequency(subscription.frequency);
  
  const lastCharge = document.createElement('span');
  lastCharge.textContent = `Last: ${formatDate(subscription.lastChargeDate)}`;
  
  const nextCharge = document.createElement('span');
  nextCharge.textContent = `Next: ~${formatDate(subscription.nextChargeDate)}`;
  
  const accountInfo = document.createElement('span');
  accountInfo.textContent = subscription.institutionName || 'Unknown Bank';
  
  subscriptionInfo.appendChild(frequency);
  subscriptionInfo.appendChild(lastCharge);
  subscriptionInfo.appendChild(nextCharge);
  subscriptionInfo.appendChild(accountInfo);
  
  detailsContainer.appendChild(merchantName);
  detailsContainer.appendChild(subscriptionInfo);
  row.appendChild(detailsContainer);
  
  // Amount
  const amountContainer = document.createElement('div');
  amountContainer.style.display = 'flex';
  amountContainer.style.flexDirection = 'column';
  amountContainer.style.alignItems = 'flex-end';
  amountContainer.style.marginLeft = '16px';
  
  const amount = document.createElement('div');
  amount.style.fontWeight = 'bold';
  amount.style.fontSize = '16px';
  amount.textContent = formatCurrency(subscription.amount);
  
  const annualAmount = document.createElement('div');
  annualAmount.style.fontSize = '12px';
  annualAmount.style.color = 'var(--color-text-secondary)';
  annualAmount.textContent = `${formatCurrency(subscription.estimatedAnnualCost)}/year`;
  
  amountContainer.appendChild(amount);
  amountContainer.appendChild(annualAmount);
  row.appendChild(amountContainer);
  
  // Make the entire row clickable to show details
  row.style.cursor = 'pointer';
  row.addEventListener('click', () => {
    showSubscriptionDetails(subscription);
  });
  
  return row;
}

/**
 * Show detailed modal for a subscription
 * @param {Object} subscription - Subscription object
 */
function showSubscriptionDetails(subscription) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;
  
  // Create modal container
  const modal = document.createElement('div');
  modal.classList.add('subscription-detail-modal');
  modal.style.width = '90%';
  modal.style.maxWidth = '600px';
  modal.style.maxHeight = '90vh';
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '12px';
  modal.style.overflow = 'hidden';
  modal.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  
  // Modal header
  const header = document.createElement('div');
  header.style.padding = '20px';
  header.style.backgroundColor = 'var(--color-primary)';
  header.style.color = 'white';
  header.style.position = 'relative';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.style.position = 'absolute';
  closeButton.style.top = '12px';
  closeButton.style.right = '12px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  const title = document.createElement('h2');
  title.style.margin = 0;
  title.style.marginRight = '20px';
  title.textContent = subscription.merchantName;
  
  const subtitle = document.createElement('div');
  subtitle.style.marginTop = '8px';
  subtitle.style.opacity = 0.9;
  subtitle.textContent = `${formatFrequency(subscription.frequency)} subscription`;
  
  header.appendChild(closeButton);
  header.appendChild(title);
  header.appendChild(subtitle);
  
  // Modal body
  const body = document.createElement('div');
  body.style.padding = '20px';
  body.style.overflowY = 'auto';
  
  // Subscription summary section
  const summarySection = document.createElement('div');
  summarySection.style.marginBottom = '24px';
  
  const costSummary = document.createElement('div');
  costSummary.style.display = 'flex';
  costSummary.style.justifyContent = 'space-between';
  costSummary.style.padding = '16px';
  costSummary.style.backgroundColor = 'var(--color-card)';
  costSummary.style.borderRadius = '8px';
  costSummary.style.marginBottom = '16px';
  
  const perPaymentLabel = document.createElement('div');
  perPaymentLabel.style.fontWeight = 'bold';
  perPaymentLabel.textContent = 'Per payment';
  
  const perPaymentValue = document.createElement('div');
  perPaymentValue.style.fontWeight = 'bold';
  perPaymentValue.textContent = formatCurrency(subscription.amount);
  
  costSummary.appendChild(perPaymentLabel);
  costSummary.appendChild(perPaymentValue);
  
  const annualCostRow = document.createElement('div');
  annualCostRow.style.display = 'flex';
  annualCostRow.style.justifyContent = 'space-between';
  annualCostRow.style.padding = '16px';
  annualCostRow.style.backgroundColor = 'var(--color-primary-light)';
  annualCostRow.style.color = 'var(--color-primary-dark)';
  annualCostRow.style.borderRadius = '8px';
  annualCostRow.style.fontWeight = 'bold';
  
  const annualCostLabel = document.createElement('div');
  annualCostLabel.textContent = 'Estimated annual cost';
  
  const annualCostValue = document.createElement('div');
  annualCostValue.textContent = formatCurrency(subscription.estimatedAnnualCost);
  
  annualCostRow.appendChild(annualCostLabel);
  annualCostRow.appendChild(annualCostValue);
  
  summarySection.appendChild(costSummary);
  summarySection.appendChild(annualCostRow);
  
  // Payment details section
  const detailsSection = document.createElement('div');
  detailsSection.style.marginBottom = '24px';
  
  const detailsTitle = document.createElement('h3');
  detailsTitle.style.marginBottom = '12px';
  detailsTitle.textContent = 'Payment Details';
  
  const detailsList = document.createElement('div');
  detailsList.style.display = 'grid';
  detailsList.style.gridTemplateColumns = 'repeat(2, 1fr)';
  detailsList.style.gap = '12px';
  detailsList.style.fontSize = '14px';
  
  // Details items
  const details = [
    { label: 'Frequency', value: formatFrequency(subscription.frequency) },
    { label: 'Last charge', value: formatDate(subscription.lastChargeDate) },
    { label: 'Next charge (est.)', value: formatDate(subscription.nextChargeDate) },
    { label: 'Institution', value: subscription.institutionName || 'Unknown' },
    { label: 'Detected transactions', value: subscription.transactionCount.toString() }
  ];
  
  details.forEach(detail => {
    const detailItem = document.createElement('div');
    
    const detailLabel = document.createElement('div');
    detailLabel.style.color = 'var(--color-text-secondary)';
    detailLabel.style.marginBottom = '4px';
    detailLabel.textContent = detail.label;
    
    const detailValue = document.createElement('div');
    detailValue.style.fontWeight = '500';
    detailValue.textContent = detail.value;
    
    detailItem.appendChild(detailLabel);
    detailItem.appendChild(detailValue);
    
    detailsList.appendChild(detailItem);
  });
  
  detailsSection.appendChild(detailsTitle);
  detailsSection.appendChild(detailsList);
  
  // Cancellation help section
  const cancellationSection = document.createElement('div');
  cancellationSection.style.marginBottom = '24px';
  
  const cancellationTitle = document.createElement('h3');
  cancellationTitle.style.marginBottom = '12px';
  cancellationTitle.textContent = 'How to Cancel';
  
  const cancellationText = document.createElement('p');
  cancellationText.style.marginBottom = '16px';
  cancellationText.style.lineHeight = '1.5';
  cancellationText.textContent = getCancellationHelpText(subscription);
  
  const cancellationNote = document.createElement('div');
  cancellationNote.style.fontSize = '14px';
  cancellationNote.style.padding = '12px';
  cancellationNote.style.backgroundColor = 'rgba(255, 229, 100, 0.2)';
  cancellationNote.style.borderRadius = '8px';
  cancellationNote.style.borderLeft = '4px solid #ffd426';
  cancellationNote.innerHTML = '<strong>Note:</strong> You can also cancel most subscriptions by contacting your bank to stop recurring payments. However, this may lead to service interruptions or penalties.';
  
  cancellationSection.appendChild(cancellationTitle);
  cancellationSection.appendChild(cancellationText);
  cancellationSection.appendChild(cancellationNote);
  
  // Action buttons
  const actionsSection = document.createElement('div');
  
  const websiteButton = document.createElement('a');
  websiteButton.href = subscription.cancelUrl;
  websiteButton.target = '_blank';
  websiteButton.style.display = 'block';
  websiteButton.style.width = '100%';
  websiteButton.style.padding = '12px';
  websiteButton.style.backgroundColor = 'var(--color-primary)';
  websiteButton.style.color = 'white';
  websiteButton.style.textAlign = 'center';
  websiteButton.style.borderRadius = '8px';
  websiteButton.style.fontWeight = 'bold';
  websiteButton.style.textDecoration = 'none';
  websiteButton.style.marginBottom = '12px';
  websiteButton.textContent = 'Go to Cancellation Page';
  
  const markCancelledButton = document.createElement('button');
  markCancelledButton.style.display = 'block';
  markCancelledButton.style.width = '100%';
  markCancelledButton.style.padding = '12px';
  markCancelledButton.style.backgroundColor = 'transparent';
  markCancelledButton.style.border = '2px solid var(--color-primary)';
  markCancelledButton.style.color = 'var(--color-primary)';
  markCancelledButton.style.textAlign = 'center';
  markCancelledButton.style.borderRadius = '8px';
  markCancelledButton.style.fontWeight = 'bold';
  markCancelledButton.style.cursor = 'pointer';
  markCancelledButton.textContent = 'Mark as Cancelled';
  
  markCancelledButton.addEventListener('click', () => {
    // Mark the subscription as cancelled
    markSubscriptionAsCancelled(subscription.id);
    document.body.removeChild(overlay);
    
    // Refresh the subscription list
    const container = document.querySelector('.subscription-sniper-page');
    if (container) {
      renderSubscriptionSniperPage(subscription.userId);
    }
  });
  
  actionsSection.appendChild(websiteButton);
  actionsSection.appendChild(markCancelledButton);
  
  // Assemble modal body
  body.appendChild(summarySection);
  body.appendChild(detailsSection);
  body.appendChild(cancellationSection);
  body.appendChild(actionsSection);
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(body);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Mark a subscription as cancelled
 * @param {string} subscriptionId - Subscription ID
 */
async function markSubscriptionAsCancelled(subscriptionId) {
  try {
    // In a real implementation, this would make a backend API call
    // For this prototype, we'll use localStorage to save the cancellation state
    const cancelledSubscriptions = JSON.parse(localStorage.getItem('cancelledSubscriptions') || '[]');
    
    if (!cancelledSubscriptions.includes(subscriptionId)) {
      cancelledSubscriptions.push(subscriptionId);
      localStorage.setItem('cancelledSubscriptions', JSON.stringify(cancelledSubscriptions));
    }
    
    return true;
  } catch (error) {
    console.error('Error marking subscription as cancelled:', error);
    return false;
  }
}

/**
 * Check if a subscription is marked as cancelled
 * @param {string} subscriptionId - Subscription ID
 * @returns {boolean} - Whether the subscription is cancelled
 */
function isSubscriptionCancelled(subscriptionId) {
  try {
    const cancelledSubscriptions = JSON.parse(localStorage.getItem('cancelledSubscriptions') || '[]');
    return cancelledSubscriptions.includes(subscriptionId);
  } catch (error) {
    console.error('Error checking subscription cancelled status:', error);
    return false;
  }
}

/**
 * Create subscription sniper dashboard with stats
 * @param {Array} subscriptions - Subscription data
 * @returns {HTMLElement} - Dashboard element
 */
function createSubscriptionDashboard(subscriptions) {
  // Filter out cancelled subscriptions
  const activeSubscriptions = subscriptions.filter(sub => !isSubscriptionCancelled(sub.id));
  
  // Calculate total monthly and annual costs
  const monthlyCost = activeSubscriptions.reduce((total, sub) => {
    if (sub.frequency === 'monthly') {
      return total + sub.amount;
    } else if (sub.frequency === 'annual') {
      return total + (sub.amount / 12);
    } else if (sub.frequency === 'quarterly') {
      return total + (sub.amount / 3);
    } else if (sub.frequency === 'semi-annual') {
      return total + (sub.amount / 6);
    } else if (sub.frequency === 'weekly') {
      return total + (sub.amount * 4.33); // Average weeks per month
    } else if (sub.frequency === 'bi-weekly') {
      return total + (sub.amount * 2.17); // Average bi-weeks per month
    } else {
      return total + (sub.amount / 12); // Default to annual payments
    }
  }, 0);
  
  const annualCost = activeSubscriptions.reduce((total, sub) => total + sub.estimatedAnnualCost, 0);
  
  // Create dashboard container
  const dashboard = document.createElement('div');
  dashboard.classList.add('subscription-dashboard');
  dashboard.style.display = 'grid';
  dashboard.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  dashboard.style.gap = '16px';
  dashboard.style.marginBottom = '32px';
  
  // Create dashboard cards
  const cards = [
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions.length.toString(),
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',
      color: 'var(--color-primary)'
    },
    {
      title: 'Monthly Cost',
      value: formatCurrency(monthlyCost),
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12H9"></path></svg>',
      color: 'var(--color-secondary)'
    },
    {
      title: 'Annual Cost',
      value: formatCurrency(annualCost),
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      color: 'var(--color-accent)'
    }
  ];
  
  cards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('dashboard-card');
    cardElement.style.backgroundColor = 'white';
    cardElement.style.borderRadius = '12px';
    cardElement.style.padding = '20px';
    cardElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    cardElement.style.display = 'flex';
    cardElement.style.flexDirection = 'column';
    
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '48px';
    iconContainer.style.height = '48px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = `${card.color}20`; // 20% opacity
    iconContainer.style.color = card.color;
    iconContainer.style.marginBottom = '16px';
    iconContainer.innerHTML = card.icon;
    
    const titleElement = document.createElement('div');
    titleElement.style.fontSize = '14px';
    titleElement.style.color = 'var(--color-text-secondary)';
    titleElement.style.marginBottom = '8px';
    titleElement.textContent = card.title;
    
    const valueElement = document.createElement('div');
    valueElement.style.fontSize = '24px';
    valueElement.style.fontWeight = 'bold';
    valueElement.textContent = card.value;
    
    cardElement.appendChild(iconContainer);
    cardElement.appendChild(titleElement);
    cardElement.appendChild(valueElement);
    
    dashboard.appendChild(cardElement);
  });
  
  return dashboard;
}

/**
 * Render the subscription sniper page
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Rendered page
 */
export async function renderSubscriptionSniperPage(userId) {
  try {
    // Create page container
    const container = document.createElement('div');
    container.classList.add('subscription-sniper-page');
    
    // Page header
    const header = document.createElement('div');
    header.classList.add('page-header');
    header.style.marginBottom = '24px';
    
    const title = document.createElement('h1');
    title.classList.add('page-title');
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.textContent = 'Subscription Sniper';
    
    const description = document.createElement('p');
    description.classList.add('page-description');
    description.style.fontSize = '16px';
    description.style.color = 'var(--color-text-secondary)';
    description.style.marginBottom = '24px';
    description.textContent = 'Detect and manage your recurring subscriptions all in one place.';
    
    header.appendChild(title);
    header.appendChild(description);
    container.appendChild(header);
    
    // Loading state
    const loadingContainer = document.createElement('div');
    loadingContainer.style.textAlign = 'center';
    loadingContainer.style.padding = '40px 0';
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.style.width = '40px';
    loadingSpinner.style.height = '40px';
    loadingSpinner.style.margin = '0 auto 16px';
    loadingSpinner.style.border = '3px solid rgba(0, 0, 0, 0.1)';
    loadingSpinner.style.borderTop = '3px solid var(--color-primary)';
    loadingSpinner.style.borderRadius = '50%';
    loadingSpinner.style.animation = 'spin 1s linear infinite';
    
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Analyzing your transactions...';
    loadingText.style.color = 'var(--color-text-secondary)';
    
    loadingContainer.appendChild(loadingSpinner);
    loadingContainer.appendChild(loadingText);
    container.appendChild(loadingContainer);
    
    // Fetch transactions
    const transactions = await fetchUserTransactions(userId);
    
    // Remove loading state
    container.removeChild(loadingContainer);
    
    if (!transactions || transactions.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.style.textAlign = 'center';
      emptyState.style.padding = '40px 20px';
      emptyState.style.backgroundColor = 'var(--color-card)';
      emptyState.style.borderRadius = '12px';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      emptyIcon.style.marginBottom = '16px';
      
      const emptyTitle = document.createElement('h3');
      emptyTitle.style.fontSize = '18px';
      emptyTitle.style.fontWeight = 'bold';
      emptyTitle.style.marginBottom = '8px';
      emptyTitle.textContent = 'No transactions found';
      
      const emptyDescription = document.createElement('p');
      emptyDescription.style.color = 'var(--color-text-secondary)';
      emptyDescription.style.marginBottom = '16px';
      emptyDescription.textContent = 'Connect your bank account to start tracking subscriptions.';
      
      const connectBankButton = document.createElement('button');
      connectBankButton.classList.add('btn', 'btn-primary');
      connectBankButton.textContent = 'Connect Bank Account';
      connectBankButton.style.padding = '10px 16px';
      connectBankButton.style.backgroundColor = 'var(--color-primary)';
      connectBankButton.style.color = 'white';
      connectBankButton.style.border = 'none';
      connectBankButton.style.borderRadius = '8px';
      connectBankButton.style.fontWeight = 'bold';
      connectBankButton.style.cursor = 'pointer';
      
      connectBankButton.addEventListener('click', () => {
        window.navigateTo('bankconnections');
      });
      
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyTitle);
      emptyState.appendChild(emptyDescription);
      emptyState.appendChild(connectBankButton);
      
      container.appendChild(emptyState);
      return container;
    }
    
    // Detect subscriptions
    const subscriptions = detectSubscriptions(transactions);
    
    if (subscriptions.length === 0) {
      // Show no subscriptions found state
      const noSubscriptionsState = document.createElement('div');
      noSubscriptionsState.style.textAlign = 'center';
      noSubscriptionsState.style.padding = '40px 20px';
      noSubscriptionsState.style.backgroundColor = 'var(--color-card)';
      noSubscriptionsState.style.borderRadius = '12px';
      
      const noSubscriptionsIcon = document.createElement('div');
      noSubscriptionsIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      noSubscriptionsIcon.style.marginBottom = '16px';
      
      const noSubscriptionsTitle = document.createElement('h3');
      noSubscriptionsTitle.style.fontSize = '18px';
      noSubscriptionsTitle.style.fontWeight = 'bold';
      noSubscriptionsTitle.style.marginBottom = '8px';
      noSubscriptionsTitle.textContent = 'No subscriptions found';
      
      const noSubscriptionsDescription = document.createElement('p');
      noSubscriptionsDescription.style.color = 'var(--color-text-secondary)';
      noSubscriptionsDescription.style.marginBottom = '16px';
      noSubscriptionsDescription.textContent = 'We couldn\'t detect any recurring subscriptions in your transactions.';
      
      noSubscriptionsState.appendChild(noSubscriptionsIcon);
      noSubscriptionsState.appendChild(noSubscriptionsTitle);
      noSubscriptionsState.appendChild(noSubscriptionsDescription);
      
      container.appendChild(noSubscriptionsState);
      return container;
    }
    
    // Add dashboard
    const dashboard = createSubscriptionDashboard(subscriptions);
    container.appendChild(dashboard);
    
    // Create subscriptions list
    const subscriptionsContainer = document.createElement('div');
    subscriptionsContainer.classList.add('subscriptions-container');
    
    // Create tabs for Active and Cancelled
    const tabsContainer = document.createElement('div');
    tabsContainer.style.display = 'flex';
    tabsContainer.style.marginBottom = '16px';
    tabsContainer.style.borderBottom = '1px solid var(--color-border)';
    
    const activeTab = document.createElement('div');
    activeTab.style.padding = '12px 16px';
    activeTab.style.fontWeight = 'bold';
    activeTab.style.borderBottom = '2px solid var(--color-primary)';
    activeTab.style.color = 'var(--color-primary)';
    activeTab.style.cursor = 'pointer';
    activeTab.textContent = 'Active Subscriptions';
    
    const cancelledTab = document.createElement('div');
    cancelledTab.style.padding = '12px 16px';
    cancelledTab.style.color = 'var(--color-text-secondary)';
    cancelledTab.style.cursor = 'pointer';
    cancelledTab.textContent = 'Cancelled';
    
    tabsContainer.appendChild(activeTab);
    tabsContainer.appendChild(cancelledTab);
    
    // Subscriptions list
    const subscriptionsList = document.createElement('div');
    subscriptionsList.classList.add('subscriptions-list');
    subscriptionsList.style.backgroundColor = 'white';
    subscriptionsList.style.borderRadius = '12px';
    subscriptionsList.style.overflow = 'hidden';
    
    // Filter out cancelled subscriptions initially
    const activeSubscriptions = subscriptions.filter(sub => !isSubscriptionCancelled(sub.id));
    
    // Add subscription rows
    activeSubscriptions.forEach(subscription => {
      const row = createSubscriptionRow(subscription);
      subscriptionsList.appendChild(row);
    });
    
    // Handle tab switching
    activeTab.addEventListener('click', () => {
      activeTab.style.fontWeight = 'bold';
      activeTab.style.borderBottom = '2px solid var(--color-primary)';
      activeTab.style.color = 'var(--color-primary)';
      
      cancelledTab.style.fontWeight = 'normal';
      cancelledTab.style.borderBottom = 'none';
      cancelledTab.style.color = 'var(--color-text-secondary)';
      
      // Clear and rebuild list with active subscriptions
      subscriptionsList.innerHTML = '';
      const activeSubscriptions = subscriptions.filter(sub => !isSubscriptionCancelled(sub.id));
      
      if (activeSubscriptions.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.padding = '24px';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = 'var(--color-text-secondary)';
        emptyMessage.textContent = 'No active subscriptions found.';
        subscriptionsList.appendChild(emptyMessage);
      } else {
        activeSubscriptions.forEach(subscription => {
          const row = createSubscriptionRow(subscription);
          subscriptionsList.appendChild(row);
        });
      }
    });
    
    cancelledTab.addEventListener('click', () => {
      cancelledTab.style.fontWeight = 'bold';
      cancelledTab.style.borderBottom = '2px solid var(--color-primary)';
      cancelledTab.style.color = 'var(--color-primary)';
      
      activeTab.style.fontWeight = 'normal';
      activeTab.style.borderBottom = 'none';
      activeTab.style.color = 'var(--color-text-secondary)';
      
      // Clear and rebuild list with cancelled subscriptions
      subscriptionsList.innerHTML = '';
      const cancelledSubscriptions = subscriptions.filter(sub => isSubscriptionCancelled(sub.id));
      
      if (cancelledSubscriptions.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.padding = '24px';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = 'var(--color-text-secondary)';
        emptyMessage.textContent = 'No cancelled subscriptions.';
        subscriptionsList.appendChild(emptyMessage);
      } else {
        cancelledSubscriptions.forEach(subscription => {
          const row = createSubscriptionRow(subscription);
          // Add visual indicator that it's cancelled
          row.style.opacity = '0.6';
          
          const cancelledBadge = document.createElement('div');
          cancelledBadge.style.padding = '4px 8px';
          cancelledBadge.style.backgroundColor = '#e0e0e0';
          cancelledBadge.style.color = '#666';
          cancelledBadge.style.borderRadius = '4px';
          cancelledBadge.style.fontSize = '12px';
          cancelledBadge.style.fontWeight = 'bold';
          cancelledBadge.style.marginLeft = '8px';
          cancelledBadge.textContent = 'CANCELLED';
          
          // Add badge to the row
          const rowContent = row.querySelector('.subscription-row > div:nth-child(2)');
          if (rowContent) {
            rowContent.appendChild(cancelledBadge);
          }
          
          subscriptionsList.appendChild(row);
        });
      }
    });
    
    subscriptionsContainer.appendChild(tabsContainer);
    subscriptionsContainer.appendChild(subscriptionsList);
    container.appendChild(subscriptionsContainer);
    
    return container;
  } catch (error) {
    console.error('Error rendering subscription sniper page:', error);
    
    // Create error state
    const errorState = document.createElement('div');
    errorState.style.textAlign = 'center';
    errorState.style.padding = '40px 20px';
    errorState.style.backgroundColor = 'var(--color-card)';
    errorState.style.borderRadius = '12px';
    
    const errorIcon = document.createElement('div');
    errorIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    errorIcon.style.marginBottom = '16px';
    
    const errorTitle = document.createElement('h3');
    errorTitle.style.fontSize = '18px';
    errorTitle.style.fontWeight = 'bold';
    errorTitle.style.marginBottom = '8px';
    errorTitle.textContent = 'Something went wrong';
    
    const errorDescription = document.createElement('p');
    errorDescription.style.color = 'var(--color-text-secondary)';
    errorDescription.style.marginBottom = '16px';
    errorDescription.textContent = 'We had trouble analyzing your transactions. Please try again later.';
    
    const retryButton = document.createElement('button');
    retryButton.classList.add('btn', 'btn-primary');
    retryButton.textContent = 'Try Again';
    retryButton.style.padding = '10px 16px';
    retryButton.style.backgroundColor = 'var(--color-primary)';
    retryButton.style.color = 'white';
    retryButton.style.border = 'none';
    retryButton.style.borderRadius = '8px';
    retryButton.style.fontWeight = 'bold';
    retryButton.style.cursor = 'pointer';
    
    retryButton.addEventListener('click', () => {
      window.location.reload();
    });
    
    errorState.appendChild(errorIcon);
    errorState.appendChild(errorTitle);
    errorState.appendChild(errorDescription);
    errorState.appendChild(retryButton);
    
    return errorState;
  }
}