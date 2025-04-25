/**
 * Money Mentor Module for Stackr Finance
 * This module provides an AI-powered financial advice chatbot interface
 * Powered by Perplexity API for intelligent responses
 */

import { isAuthenticated, getCurrentUser, getUserSubscriptionTier } from './auth.js';
import { createToast } from './components/toast.js';
import { renderSidebar } from './sidebar.js';
import { showUpgradeModal, renderQuickUpgradeButton } from './membership-tiers.js';

/**
 * Enum for financial topic categories
 */
const FinancialTopicCategory = {
  BUDGETING: 'budgeting',
  INVESTING: 'investing',
  SAVING: 'saving',
  DEBT: 'debt',
  RETIREMENT: 'retirement',
  TAXES: 'taxes',
  INCOME: 'income_generation',
  GENERAL: 'general'
};

/**
 * Get category label for display
 * @param {string} category - Category value
 * @returns {string} - Human-readable category label
 */
function getCategoryLabel(category) {
  const labels = {
    [FinancialTopicCategory.BUDGETING]: 'Budgeting',
    [FinancialTopicCategory.INVESTING]: 'Investing',
    [FinancialTopicCategory.SAVING]: 'Saving',
    [FinancialTopicCategory.DEBT]: 'Debt',
    [FinancialTopicCategory.RETIREMENT]: 'Retirement',
    [FinancialTopicCategory.TAXES]: 'Taxes',
    [FinancialTopicCategory.INCOME]: 'Income Generation',
    [FinancialTopicCategory.GENERAL]: 'General'
  };
  
  return labels[category] || 'General';
}

/**
 * Format date for chat messages
 * @param {Date} date - Date to format
 * @returns {string} - Formatted time string
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Create chat message element
 * @param {Object} message - Message data
 * @returns {HTMLElement} - Message element
 */
function createMessageElement(message) {
  const isUser = message.role === 'user';
  const messageContainer = document.createElement('div');
  messageContainer.className = `flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`;
  messageContainer.style.opacity = '0';
  messageContainer.style.transform = 'translateY(10px)';
  messageContainer.style.transition = 'all 0.3s ease-out';
  
  // Add animation delay
  setTimeout(() => {
    messageContainer.style.opacity = '1';
    messageContainer.style.transform = 'translateY(0)';
  }, 100);
  
  const messageBubble = document.createElement('div');
  
  if (isUser) {
    // User message bubble with gradient
    messageBubble.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
    messageBubble.style.color = 'white';
    messageBubble.style.borderRadius = '18px 18px 4px 18px';
    messageBubble.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.2)';
  } else {
    // Assistant message bubble
    messageBubble.style.background = '#f8f9fa';
    messageBubble.style.borderRadius = '18px 18px 18px 4px';
    messageBubble.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    messageBubble.style.border = '1px solid rgba(0, 0, 0, 0.08)';
  }
  
  messageBubble.style.padding = '16px';
  messageBubble.style.maxWidth = '80%';
  
  if (message.isLoading) {
    // Enhanced loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.style.display = 'flex';
    loadingDiv.style.alignItems = 'center';
    loadingDiv.style.gap = '12px';
    
    // Improved loading animation
    const loadingDots = document.createElement('div');
    loadingDots.style.display = 'flex';
    loadingDots.style.gap = '4px';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = '#6366F1';
      dot.style.animation = `dotPulse 1.5s infinite ease-in-out ${i * 0.2}s`;
      
      // Add keyframe animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes dotPulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      loadingDots.appendChild(dot);
    }
    
    const text = document.createElement('span');
    text.textContent = 'Your Money Mentor is thinking...';
    text.style.fontStyle = 'italic';
    
    loadingDiv.appendChild(loadingDots);
    loadingDiv.appendChild(text);
    messageBubble.appendChild(loadingDiv);
  } else {
    // Enhanced regular message
    if (message.category && !isUser) {
      const categoryTag = document.createElement('div');
      categoryTag.style.fontSize = '12px';
      categoryTag.style.fontWeight = '600';
      categoryTag.style.marginBottom = '8px';
      categoryTag.style.color = '#6366F1';
      categoryTag.style.display = 'flex';
      categoryTag.style.alignItems = 'center';
      categoryTag.style.gap = '4px';
      
      // Add category icon
      const categoryIcon = document.createElement('span');
      categoryIcon.innerHTML = getCategoryIcon(message.category);
      categoryIcon.style.display = 'inline-flex';
      
      const categoryText = document.createElement('span');
      categoryText.textContent = `${getCategoryLabel(message.category)} Advice`;
      
      categoryTag.appendChild(categoryIcon);
      categoryTag.appendChild(categoryText);
      messageBubble.appendChild(categoryTag);
    }
    
    const content = document.createElement('div');
    content.style.whiteSpace = 'pre-wrap';
    content.style.lineHeight = '1.5';
    
    // For assistant messages only, add typwriter effect to the first message
    if (!isUser && message.content.includes("Hello! I'm your Money Mentor")) {
      content.textContent = '';
      typeWriter(content, message.content, 0, 20);
    } else {
      content.textContent = message.content;
    }
    
    const timestamp = document.createElement('div');
    timestamp.style.fontSize = '11px';
    timestamp.style.marginTop = '8px';
    timestamp.style.opacity = '0.7';
    timestamp.style.textAlign = isUser ? 'right' : 'left';
    timestamp.textContent = formatTime(message.timestamp);
    
    messageBubble.appendChild(content);
    messageBubble.appendChild(timestamp);
  }
  
  messageContainer.appendChild(messageBubble);
  return messageContainer;
}

/**
 * Typewriter effect for welcome message
 */
function typeWriter(element, text, i, speed) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    setTimeout(() => typeWriter(element, text, i, speed), speed);
  }
}

/**
 * Get icon for financial category
 */
function getCategoryIcon(category) {
  const icons = {
    [FinancialTopicCategory.BUDGETING]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
    [FinancialTopicCategory.INVESTING]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>',
    [FinancialTopicCategory.SAVING]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path><path d="M2 9v1c0 1.1.9 2 2 2h1"></path><path d="M16 11h0"></path></svg>',
    [FinancialTopicCategory.DEBT]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>',
    [FinancialTopicCategory.RETIREMENT]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    [FinancialTopicCategory.TAXES]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"></path><path d="m16 8-8 8"></path><path d="M16 16h.01"></path><path d="M8 8h.01"></path></svg>',
    [FinancialTopicCategory.INCOME]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    [FinancialTopicCategory.GENERAL]: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  };
  
  return icons[category] || icons[FinancialTopicCategory.GENERAL];
}

/**
 * Create suggestion button element
 * @param {string} text - Suggestion text
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} - Suggestion button element
 */
function createSuggestionButton(text, onClick) {
  const item = document.createElement('li');
  item.style.marginBottom = '10px';
  item.style.opacity = '0';
  item.style.transform = 'translateY(5px)';
  item.style.transition = 'all 0.4s ease-out';
  
  // Random delay for staggered animation
  const delay = Math.random() * 0.5 + 0.1;
  setTimeout(() => {
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  }, delay * 1000);
  
  const button = document.createElement('button');
  button.style.textAlign = 'left';
  button.style.width = '100%';
  button.style.padding = '12px 14px';
  button.style.borderRadius = '10px';
  button.style.border = '1px solid rgba(99, 102, 241, 0.2)';
  button.style.background = 'white';
  button.style.color = '#6366F1';
  button.style.fontSize = '14px';
  button.style.fontWeight = '500';
  button.style.cursor = 'pointer';
  button.style.transition = 'all 0.2s ease';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.gap = '8px';
  button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
  
  // Add icon
  const icon = document.createElement('span');
  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="m12 17 .01.01"></path></svg>';
  
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  textSpan.style.flex = '1';
  
  button.appendChild(icon);
  button.appendChild(textSpan);
  
  // Add arrow icon
  const arrowIcon = document.createElement('span');
  arrowIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
  arrowIcon.style.opacity = '0';
  arrowIcon.style.transition = 'opacity 0.2s ease';
  button.appendChild(arrowIcon);
  
  // Hover effects
  button.addEventListener('mouseover', () => {
    button.style.background = 'rgba(99, 102, 241, 0.05)';
    button.style.borderColor = 'rgba(99, 102, 241, 0.5)';
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.1)';
    arrowIcon.style.opacity = '1';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.background = 'white';
    button.style.borderColor = 'rgba(99, 102, 241, 0.2)';
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
    arrowIcon.style.opacity = '0';
  });
  
  // Click effects
  button.addEventListener('mousedown', () => {
    button.style.transform = 'translateY(1px)';
    button.style.boxShadow = '0 2px 3px rgba(99, 102, 241, 0.1)';
  });
  
  button.addEventListener('mouseup', () => {
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.1)';
  });
  
  button.onclick = () => onClick(text);
  
  item.appendChild(button);
  return item;
}

/**
 * Get financial advice from Perplexity API
 * @param {string} query - User's question
 * @param {string} category - Advice category
 * @returns {Promise<string>} - AI response
 */
async function getFinancialAdvice(query, category) {
  try {
    const response = await fetch('/api/perplexity/financial-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        category
      })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('This feature requires a Pro subscription');
      }
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.advice;
  } catch (error) {
    console.error('Error getting financial advice:', error);
    throw error;
  }
}

/**
 * Render Money Mentor page
 * @returns {HTMLElement} - Page container
 */
export async function renderMoneyMentorPage(userId) {
  if (!isAuthenticated()) {
    window.location.href = '/auth.html';
    return document.createElement('div');
  }
  
  const user = getCurrentUser();
  renderSidebar('moneymentor');
  
  // Check if user has Pro subscription
  const subscriptionTier = getUserSubscriptionTier();
  const hasPro = subscriptionTier === 'pro' || subscriptionTier === 'lifetime';
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'container py-8 space-y-8';
  
  // Create header with gradient
  const header = document.createElement('div');
  header.className = 'text-center max-w-2xl mx-auto mb-8';
  header.style.opacity = '0';
  header.style.transform = 'translateY(-10px)';
  header.style.transition = 'all 0.5s ease-out';
  
  // Fade in animation
  setTimeout(() => {
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
  }, 100);
  
  // Create header with logo and title
  const titleContainer = document.createElement('div');
  titleContainer.style.display = 'flex';
  titleContainer.style.alignItems = 'center';
  titleContainer.style.justifyContent = 'center';
  titleContainer.style.marginBottom = '12px';
  
  // Add Stackr logo
  const logoImg = document.createElement('img');
  logoImg.src = 'public/stackr-logo.svg';
  logoImg.alt = 'Stackr';
  logoImg.style.height = '40px';
  logoImg.style.width = 'auto';
  logoImg.style.marginRight = '12px';
  
  // Add Money Mentor text
  const title = document.createElement('h1');
  title.className = 'text-4xl font-extrabold tracking-tight';
  title.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
  title.style.webkitBackgroundClip = 'text';
  title.style.backgroundClip = 'text';
  title.style.color = 'transparent';
  title.style.marginBottom = '0';
  title.textContent = 'Money Mentor';
  
  titleContainer.appendChild(logoImg);
  titleContainer.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-xl text-muted-foreground mt-2';
  subtitle.style.maxWidth = '80%';
  subtitle.style.margin = '0 auto';
  subtitle.style.color = '#666';
  subtitle.textContent = 'Get personalized financial advice powered by Perplexity AI';
  
  header.appendChild(titleContainer);
  header.appendChild(subtitle);
  container.appendChild(header);
  
  // Create layout grid
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-12 gap-8';
  
  // Create main chat area
  const chatArea = document.createElement('div');
  chatArea.className = 'md:col-span-9';
  
  // Create chat card
  const chatCard = document.createElement('div');
  chatCard.className = 'bg-white dark:bg-gray-900 rounded-lg shadow-md w-full max-w-3xl mx-auto h-[600px] flex flex-col';
  
  // Create card header
  const cardHeader = document.createElement('div');
  cardHeader.className = 'border-b p-4 flex items-center';
  
  const iconContainer = document.createElement('div');
  iconContainer.style.display = 'flex';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.justifyContent = 'center';
  iconContainer.style.background = '#f8f9fe';
  iconContainer.style.borderRadius = '8px';
  iconContainer.style.width = '32px';
  iconContainer.style.height = '32px';
  iconContainer.style.padding = '4px';
  iconContainer.style.marginRight = '10px';
  
  // Use Stackr logo for the icon
  const logoIcon = document.createElement('img');
  logoIcon.src = 'public/stackr-logo.svg';
  logoIcon.alt = 'Stackr';
  logoIcon.style.height = '24px';
  logoIcon.style.width = 'auto';
  
  iconContainer.appendChild(logoIcon);
  
  const headerTitle = document.createElement('h2');
  headerTitle.className = 'font-semibold text-lg';
  headerTitle.textContent = 'Money Mentor';
  
  const headerSubtitle = document.createElement('p');
  headerSubtitle.className = 'text-sm text-muted-foreground';
  headerSubtitle.textContent = 'Powered by Perplexity AI';
  
  cardHeader.appendChild(iconContainer);
  const headerTextContainer = document.createElement('div');
  headerTextContainer.appendChild(headerTitle);
  headerTextContainer.appendChild(headerSubtitle);
  cardHeader.appendChild(headerTextContainer);
  
  // Create chat content area
  const chatContent = document.createElement('div');
  chatContent.className = 'flex-grow overflow-y-auto p-4 space-y-4';
  
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'space-y-4';
  chatContent.appendChild(messagesContainer);
  
  // Create card footer with form
  const cardFooter = document.createElement('div');
  cardFooter.className = 'border-t p-4';
  
  const form = document.createElement('form');
  form.className = 'w-full space-y-2';
  
  // Create category selection with enhanced styling
  const categoryContainer = document.createElement('div');
  categoryContainer.style.display = 'flex';
  categoryContainer.style.alignItems = 'center';
  categoryContainer.style.gap = '8px';
  categoryContainer.style.marginBottom = '10px';
  
  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'advice-category';
  categoryLabel.style.fontSize = '14px';
  categoryLabel.style.fontWeight = '500';
  categoryLabel.style.color = '#555';
  categoryLabel.style.display = 'flex';
  categoryLabel.style.alignItems = 'center';
  categoryLabel.style.gap = '6px';
  
  // Add icon to label
  const labelIcon = document.createElement('span');
  labelIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path><path d="M8 10v.01"></path><path d="M12 10v.01"></path><path d="M16 10v.01"></path></svg>';
  labelIcon.style.display = 'inline-flex';
  
  const labelText = document.createElement('span');
  labelText.textContent = 'Advice category:';
  
  categoryLabel.appendChild(labelIcon);
  categoryLabel.appendChild(labelText);
  
  // Enhanced select dropdown
  const categorySelect = document.createElement('select');
  categorySelect.id = 'advice-category';
  categorySelect.style.padding = '8px 12px';
  categorySelect.style.border = '1px solid rgba(99, 102, 241, 0.3)';
  categorySelect.style.borderRadius = '8px';
  categorySelect.style.backgroundColor = 'white';
  categorySelect.style.fontSize = '14px';
  categorySelect.style.color = '#333';
  categorySelect.style.outline = 'none';
  categorySelect.style.cursor = 'pointer';
  categorySelect.style.transition = 'all 0.2s ease';
  categorySelect.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
  
  // Add hover and focus effects
  categorySelect.addEventListener('mouseover', () => {
    categorySelect.style.borderColor = 'rgba(99, 102, 241, 0.5)';
    categorySelect.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1)';
  });
  
  categorySelect.addEventListener('mouseout', () => {
    if (document.activeElement !== categorySelect) {
      categorySelect.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      categorySelect.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
    }
  });
  
  categorySelect.addEventListener('focus', () => {
    categorySelect.style.borderColor = 'rgba(99, 102, 241, 0.8)';
    categorySelect.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
  });
  
  categorySelect.addEventListener('blur', () => {
    categorySelect.style.borderColor = 'rgba(99, 102, 241, 0.3)';
    categorySelect.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
  });
  
  // Add options with category-specific icons
  const categories = [
    { value: FinancialTopicCategory.GENERAL, label: 'General Advice', icon: getCategoryIcon(FinancialTopicCategory.GENERAL) },
    { value: FinancialTopicCategory.BUDGETING, label: 'Budgeting', icon: getCategoryIcon(FinancialTopicCategory.BUDGETING) },
    { value: FinancialTopicCategory.INVESTING, label: 'Investing', icon: getCategoryIcon(FinancialTopicCategory.INVESTING) },
    { value: FinancialTopicCategory.SAVING, label: 'Saving', icon: getCategoryIcon(FinancialTopicCategory.SAVING) },
    { value: FinancialTopicCategory.DEBT, label: 'Debt Management', icon: getCategoryIcon(FinancialTopicCategory.DEBT) },
    { value: FinancialTopicCategory.RETIREMENT, label: 'Retirement', icon: getCategoryIcon(FinancialTopicCategory.RETIREMENT) },
    { value: FinancialTopicCategory.TAXES, label: 'Taxes', icon: getCategoryIcon(FinancialTopicCategory.TAXES) },
    { value: FinancialTopicCategory.INCOME, label: 'Income Generation', icon: getCategoryIcon(FinancialTopicCategory.INCOME) }
  ];
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.value;
    option.textContent = category.label;
    categorySelect.appendChild(option);
  });
  
  categoryContainer.appendChild(categoryLabel);
  categoryContainer.appendChild(categorySelect);
  
  // Create enhanced textarea input area
  const inputContainer = document.createElement('div');
  inputContainer.style.position = 'relative';
  inputContainer.style.display = 'flex';
  inputContainer.style.gap = '12px';
  inputContainer.style.alignItems = 'flex-end';
  
  const textareaWrapper = document.createElement('div');
  textareaWrapper.style.position = 'relative';
  textareaWrapper.style.flexGrow = '1';
  
  const textarea = document.createElement('textarea');
  textarea.style.width = '100%';
  textarea.style.resize = 'none';
  textarea.style.minHeight = '80px';
  textarea.style.padding = '12px 16px';
  textarea.style.borderRadius = '12px';
  textarea.style.border = '1px solid rgba(99, 102, 241, 0.3)';
  textarea.style.backgroundColor = 'white';
  textarea.style.fontSize = '15px';
  textarea.style.lineHeight = '1.5';
  textarea.style.color = '#333';
  textarea.style.transition = 'all 0.2s ease';
  textarea.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
  textarea.style.outline = 'none';
  textarea.placeholder = 'Ask for financial advice...';
  
  // Add effects
  textarea.addEventListener('focus', () => {
    textarea.style.borderColor = 'rgba(99, 102, 241, 0.8)';
    textarea.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
  });
  
  textarea.addEventListener('blur', () => {
    textarea.style.borderColor = 'rgba(99, 102, 241, 0.3)';
    textarea.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
  });
  
  textareaWrapper.appendChild(textarea);
  
  // Create character counter
  const charCounter = document.createElement('div');
  charCounter.style.position = 'absolute';
  charCounter.style.right = '10px';
  charCounter.style.bottom = '10px';
  charCounter.style.fontSize = '12px';
  charCounter.style.color = '#aaa';
  charCounter.style.pointerEvents = 'none';
  charCounter.textContent = '0/250';
  
  // Update character counter
  textarea.addEventListener('input', () => {
    const count = textarea.value.length;
    charCounter.textContent = `${count}/250`;
    
    // Change color if getting close to limit
    if (count > 200) {
      charCounter.style.color = '#f97316';
    } else if (count > 150) {
      charCounter.style.color = '#eab308';
    } else {
      charCounter.style.color = '#aaa';
    }
  });
  
  textareaWrapper.appendChild(charCounter);
  
  // Create enhanced send button with hover effects
  const sendButton = document.createElement('button');
  sendButton.type = 'submit';
  sendButton.style.width = '50px';
  sendButton.style.height = '50px';
  sendButton.style.display = 'flex';
  sendButton.style.alignItems = 'center';
  sendButton.style.justifyContent = 'center';
  sendButton.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
  sendButton.style.color = 'white';
  sendButton.style.border = 'none';
  sendButton.style.borderRadius = '12px';
  sendButton.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.3)';
  sendButton.style.transition = 'all 0.2s ease';
  sendButton.style.cursor = 'pointer';
  sendButton.style.alignSelf = 'flex-end';
  sendButton.style.marginBottom = '2px';
  
  // Add hover effects
  sendButton.addEventListener('mouseover', () => {
    sendButton.style.transform = 'translateY(-2px)';
    sendButton.style.boxShadow = '0 6px 15px rgba(99, 102, 241, 0.4)';
  });
  
  sendButton.addEventListener('mouseout', () => {
    sendButton.style.transform = 'translateY(0)';
    sendButton.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.3)';
  });
  
  // Add active effect
  sendButton.addEventListener('mousedown', () => {
    sendButton.style.transform = 'translateY(1px)';
  });
  
  sendButton.addEventListener('mouseup', () => {
    sendButton.style.transform = 'translateY(-2px)';
  });
  
  sendButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  `;
  
  inputContainer.appendChild(textareaWrapper);
  inputContainer.appendChild(sendButton);
  
  form.appendChild(categoryContainer);
  form.appendChild(inputContainer);
  cardFooter.appendChild(form);
  
  chatCard.appendChild(cardHeader);
  chatCard.appendChild(chatContent);
  chatCard.appendChild(cardFooter);
  chatArea.appendChild(chatCard);
  
  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'md:col-span-3 space-y-6';
  
  // Suggested topics with animation
  const topicsCard = document.createElement('div');
  topicsCard.style.background = 'white';
  topicsCard.style.padding = '20px';
  topicsCard.style.borderRadius = '12px';
  topicsCard.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
  topicsCard.style.border = '1px solid rgba(0, 0, 0, 0.05)';
  topicsCard.style.opacity = '0';
  topicsCard.style.transform = 'translateY(10px)';
  topicsCard.style.transition = 'all 0.5s ease-out';
  
  // Fade in animation with delay
  setTimeout(() => {
    topicsCard.style.opacity = '1';
    topicsCard.style.transform = 'translateY(0)';
  }, 300);
  
  const topicsTitle = document.createElement('h3');
  topicsTitle.style.fontSize = '18px';
  topicsTitle.style.fontWeight = '600';
  topicsTitle.style.marginBottom = '16px';
  topicsTitle.style.display = 'flex';
  topicsTitle.style.alignItems = 'center';
  topicsTitle.style.gap = '8px';
  
  // Add icon to title
  const topicIcon = document.createElement('span');
  topicIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="m12 17 .01.01"></path></svg>';
  
  const topicTextSpan = document.createElement('span');
  topicTextSpan.textContent = 'Suggested Topics';
  
  topicsTitle.appendChild(topicIcon);
  topicsTitle.appendChild(topicTextSpan);
  
  const topicsList = document.createElement('ul');
  topicsList.style.listStyle = 'none';
  topicsList.style.padding = '0';
  topicsList.style.margin = '0';
  
  const suggestedTopics = [
    'How can I start investing with only $500?',
    'What\'s the best strategy to pay off my student loans?',
    'How much should I save for retirement each month?',
    'What are some side hustles I can start this weekend?',
    'How can I create a 50/30/20 budget that works for me?'
  ];
  
  topicsCard.appendChild(topicsTitle);
  topicsCard.appendChild(topicsList);
  
  // Pro features card
  const proCard = document.createElement('div');
  proCard.style.background = 'linear-gradient(145deg, #EEF2FF 0%, #F5F3FF 100%)';
  proCard.style.padding = '20px';
  proCard.style.borderRadius = '12px';
  proCard.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
  proCard.style.border = '1px solid rgba(99, 102, 241, 0.1)';
  proCard.style.marginTop = '20px';
  proCard.style.opacity = '0';
  proCard.style.transform = 'translateY(10px)';
  proCard.style.transition = 'all 0.5s ease-out';
  
  // Fade in animation with delay
  setTimeout(() => {
    proCard.style.opacity = '1';
    proCard.style.transform = 'translateY(0)';
  }, 500);
  
  // Add pro badge
  const proBadgeContainer = document.createElement('div');
  proBadgeContainer.style.display = 'flex';
  proBadgeContainer.style.alignItems = 'center';
  proBadgeContainer.style.justifyContent = 'space-between';
  proBadgeContainer.style.marginBottom = '12px';
  
  const proTitle = document.createElement('h3');
  proTitle.style.fontSize = '18px';
  proTitle.style.fontWeight = '600';
  proTitle.style.margin = '0';
  proTitle.style.display = 'flex';
  proTitle.style.alignItems = 'center';
  proTitle.style.gap = '8px';
  
  // Add icon to pro title
  const proIcon = document.createElement('span');
  proIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>';
  
  const proTextSpan = document.createElement('span');
  proTextSpan.textContent = 'Pro Features';
  
  proTitle.appendChild(proIcon);
  proTitle.appendChild(proTextSpan);
  
  const proBadge = document.createElement('span');
  proBadge.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
  proBadge.style.color = 'white';
  proBadge.style.padding = '4px 10px';
  proBadge.style.borderRadius = '20px';
  proBadge.style.fontSize = '12px';
  proBadge.style.fontWeight = 'bold';
  proBadge.style.boxShadow = '0 2px 6px rgba(99, 102, 241, 0.3)';
  proBadge.textContent = 'PRO';
  
  proBadgeContainer.appendChild(proTitle);
  proBadgeContainer.appendChild(proBadge);
  
  const proDescription = document.createElement('p');
  proDescription.style.fontSize = '14px';
  proDescription.style.color = '#666';
  proDescription.style.marginBottom = '16px';
  proDescription.style.lineHeight = '1.5';
  proDescription.textContent = 'Upgrade to Stackr Pro to unlock enhanced Money Mentor capabilities:';
  
  const proFeaturesList = document.createElement('ul');
  proFeaturesList.style.listStyle = 'none';
  proFeaturesList.style.padding = '0';
  proFeaturesList.style.margin = '0 0 16px 0';
  
  const proFeatures = [
    'Unlimited AI-powered financial advice',
    'Custom income allocation recommendations',
    'Personalized debt repayment plans',
    'Investment strategy creation',
    'Chat history & saved advice'
  ];
  
  proFeatures.forEach((feature, index) => {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.alignItems = 'flex-start';
    item.style.marginBottom = '10px';
    item.style.fontSize = '14px';
    item.style.opacity = '0';
    item.style.transform = 'translateX(10px)';
    item.style.transition = 'all 0.4s ease-out';
    
    // Staggered animation
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 600 + (index * 100));
    
    const checkmark = document.createElement('span');
    checkmark.style.color = '#6366F1';
    checkmark.style.marginRight = '8px';
    checkmark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    
    const text = document.createElement('span');
    text.textContent = feature;
    
    item.appendChild(checkmark);
    item.appendChild(text);
    proFeaturesList.appendChild(item);
  });
  
  // Create a simple upgrade button
  const upgradeButton = document.createElement('button');
  upgradeButton.className = 'upgrade-button';
  upgradeButton.style.width = '100%';
  upgradeButton.style.padding = '10px 0';
  upgradeButton.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
  upgradeButton.style.color = 'white';
  upgradeButton.style.border = 'none';
  upgradeButton.style.borderRadius = '8px';
  upgradeButton.style.fontSize = '15px';
  upgradeButton.style.fontWeight = '600';
  upgradeButton.style.cursor = 'pointer';
  upgradeButton.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.3)';
  upgradeButton.style.transition = 'all 0.2s ease';
  upgradeButton.style.marginTop = '16px';
  upgradeButton.textContent = 'Upgrade to Pro';
  
  // Button hover effect
  upgradeButton.addEventListener('mouseover', () => {
    upgradeButton.style.transform = 'translateY(-2px)';
    upgradeButton.style.boxShadow = '0 6px 15px rgba(99, 102, 241, 0.4)';
  });
  
  upgradeButton.addEventListener('mouseout', () => {
    upgradeButton.style.transform = 'translateY(0)';
    upgradeButton.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.3)';
  });
  
  // Add click event handler to show upgrade modal
  upgradeButton.addEventListener('click', () => {
    showUpgradeModal('pro');
  });
  
  proCard.appendChild(proBadgeContainer);
  proCard.appendChild(proDescription);
  proCard.appendChild(proFeaturesList);
  proCard.appendChild(upgradeButton);
  
  sidebar.appendChild(topicsCard);
  sidebar.appendChild(proCard);
  
  grid.appendChild(chatArea);
  grid.appendChild(sidebar);
  container.appendChild(grid);
  
  // Add chat functionality
  const messages = [
    {
      role: 'assistant',
      content: 'Hello! I\'m your Money Mentor powered by Perplexity AI. I can provide advice on budgeting, investing, saving, debt management, retirement planning, taxes, and income generation. How can I help you today?',
      timestamp: new Date()
    }
  ];
  
  // Initial message
  messages.forEach(message => {
    messagesContainer.appendChild(createMessageElement(message));
  });
  
  // Add suggested topics
  suggestedTopics.forEach(topic => {
    topicsList.appendChild(createSuggestionButton(topic, (text) => {
      textarea.value = text;
      textarea.focus();
    }));
  });
  
  // Handle form submission
  let isLoading = false;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = textarea.value.trim();
    const category = categorySelect.value;
    
    if (!query || isLoading) return;
    
    if (!hasPro) {
      createToast({
        title: 'Pro Subscription Required', 
        message: 'This feature requires a Pro subscription. Please upgrade to access Money Mentor.', 
        type: 'ERROR'
      });
      // Show upgrade modal when user tries to use Money Mentor without Pro subscription
      showUpgradeModal('pro');
      return;
    }
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    messagesContainer.appendChild(createMessageElement(userMessage));
    
    // Add loading message
    const loadingMessage = {
      role: 'assistant',
      content: '',
      category: category,
      timestamp: new Date(),
      isLoading: true
    };
    
    const loadingElement = createMessageElement(loadingMessage);
    messagesContainer.appendChild(loadingElement);
    
    // Clear input
    textarea.value = '';
    
    // Scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
    
    isLoading = true;
    
    try {
      const advice = await getFinancialAdvice(query, category);
      
      // Replace loading message
      const response = {
        role: 'assistant',
        content: advice,
        category: category,
        timestamp: new Date()
      };
      
      messagesContainer.removeChild(loadingElement);
      messagesContainer.appendChild(createMessageElement(response));
      
      // Scroll to bottom again
      chatContent.scrollTop = chatContent.scrollHeight;
    } catch (error) {
      // Replace loading with error message
      messagesContainer.removeChild(loadingElement);
      
      const errorMessage = {
        role: 'assistant',
        content: error.message === 'This feature requires a Pro subscription' 
          ? 'This feature requires a Pro subscription. Please upgrade to access Money Mentor.'
          : 'Sorry, I encountered an error while trying to provide advice. Please try again later.',
        timestamp: new Date()
      };
      
      messagesContainer.appendChild(createMessageElement(errorMessage));
      
      // Show toast and upgrade modal if it's a subscription issue
      const isSubscriptionError = error.message === 'This feature requires a Pro subscription';
      createToast({
        title: isSubscriptionError ? 'Pro Subscription Required' : 'Error',
        message: error.message,
        type: 'ERROR'
      });
      
      // Show upgrade modal for subscription errors
      if (isSubscriptionError) {
        showUpgradeModal('pro');
      }
    } finally {
      isLoading = false;
    }
  });
  
  return container;
}