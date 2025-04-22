/**
 * Money Mentor Module for Stackr Finance GREEN Edition
 * This module provides an AI-powered financial advice chatbot interface
 * Powered by Perplexity API for intelligent responses
 */

import { isAuthenticated, getCurrentUser, getUserSubscriptionTier } from './auth.js';
import { createToast } from './components/toast.js';
import { renderSidebar } from './sidebar.js';

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
  
  const messageBubble = document.createElement('div');
  messageBubble.className = `max-w-[80%] rounded-lg p-4 ${
    isUser ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'
  }`;
  
  if (message.isLoading) {
    // Loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'flex items-center space-x-2';
    
    const spinner = document.createElement('div');
    spinner.className = 'h-4 w-4 animate-spin border-2 border-t-transparent border-primary rounded-full';
    
    const text = document.createElement('span');
    text.textContent = 'Your Money Mentor is thinking...';
    
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);
    messageBubble.appendChild(loadingDiv);
  } else {
    // Regular message
    if (message.category && !isUser) {
      const categoryTag = document.createElement('div');
      categoryTag.className = 'text-xs font-medium mb-1 text-primary';
      categoryTag.textContent = `${getCategoryLabel(message.category)} Advice`;
      messageBubble.appendChild(categoryTag);
    }
    
    const content = document.createElement('div');
    content.className = 'whitespace-pre-wrap';
    content.textContent = message.content;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'text-xs mt-2 opacity-70';
    timestamp.textContent = formatTime(message.timestamp);
    
    messageBubble.appendChild(content);
    messageBubble.appendChild(timestamp);
  }
  
  messageContainer.appendChild(messageBubble);
  return messageContainer;
}

/**
 * Create suggestion button element
 * @param {string} text - Suggestion text
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} - Suggestion button element
 */
function createSuggestionButton(text, onClick) {
  const button = document.createElement('button');
  button.className = 'text-primary hover:underline text-left w-full';
  button.textContent = text;
  button.onclick = () => onClick(text);
  
  const item = document.createElement('li');
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
  
  // Create header
  const header = document.createElement('div');
  header.className = 'text-center max-w-2xl mx-auto mb-8';
  
  const title = document.createElement('h1');
  title.className = 'text-4xl font-extrabold tracking-tight';
  title.textContent = 'Money Mentor';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-xl text-muted-foreground mt-2';
  subtitle.textContent = 'Get personalized financial advice powered by Perplexity AI';
  
  header.appendChild(title);
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
  cardHeader.className = 'border-b p-4 flex items-center space-x-2';
  
  const iconContainer = document.createElement('div');
  iconContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `;
  
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
  
  // Create category selection
  const categoryContainer = document.createElement('div');
  categoryContainer.className = 'flex gap-2';
  
  const categoryLabel = document.createElement('label');
  categoryLabel.htmlFor = 'advice-category';
  categoryLabel.className = 'text-sm font-medium';
  categoryLabel.textContent = 'Advice category:';
  
  const categorySelect = document.createElement('select');
  categorySelect.id = 'advice-category';
  categorySelect.className = 'border rounded p-1.5 text-sm bg-white dark:bg-gray-800 dark:border-gray-700';
  
  // Add options
  const categories = [
    { value: FinancialTopicCategory.GENERAL, label: 'General Advice' },
    { value: FinancialTopicCategory.BUDGETING, label: 'Budgeting' },
    { value: FinancialTopicCategory.INVESTING, label: 'Investing' },
    { value: FinancialTopicCategory.SAVING, label: 'Saving' },
    { value: FinancialTopicCategory.DEBT, label: 'Debt Management' },
    { value: FinancialTopicCategory.RETIREMENT, label: 'Retirement' },
    { value: FinancialTopicCategory.TAXES, label: 'Taxes' },
    { value: FinancialTopicCategory.INCOME, label: 'Income Generation' }
  ];
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.value;
    option.textContent = category.label;
    categorySelect.appendChild(option);
  });
  
  categoryContainer.appendChild(categoryLabel);
  categoryContainer.appendChild(categorySelect);
  
  // Create input area
  const inputContainer = document.createElement('div');
  inputContainer.className = 'flex gap-2';
  
  const textarea = document.createElement('textarea');
  textarea.className = 'flex-grow resize-none border rounded p-2 min-h-[80px] bg-white dark:bg-gray-800 dark:border-gray-700';
  textarea.placeholder = 'Ask for financial advice...';
  
  const sendButton = document.createElement('button');
  sendButton.type = 'submit';
  sendButton.className = 'bg-primary text-white h-10 w-10 rounded-md flex items-center justify-center self-end';
  sendButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  `;
  
  inputContainer.appendChild(textarea);
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
  
  // Suggested topics
  const topicsCard = document.createElement('div');
  topicsCard.className = 'bg-gray-100 dark:bg-gray-800 p-6 rounded-lg';
  
  const topicsTitle = document.createElement('h3');
  topicsTitle.className = 'text-lg font-medium mb-3';
  topicsTitle.textContent = 'Suggested Topics';
  
  const topicsList = document.createElement('ul');
  topicsList.className = 'space-y-2';
  
  const suggestedTopics = [
    'How can I start investing with only $500?',
    'What\'s the best strategy to pay off my student loans?',
    'How much should I save for retirement each month?',
    'What are some side hustles I can start this weekend?',
    'How can I create a 50/30/20 budget that works for me?'
  ];
  
  topicsCard.appendChild(topicsTitle);
  topicsCard.appendChild(topicsList);
  
  // Pro features
  const proCard = document.createElement('div');
  proCard.className = 'bg-gray-100 dark:bg-gray-800 p-6 rounded-lg';
  
  const proTitle = document.createElement('h3');
  proTitle.className = 'text-lg font-medium mb-3';
  proTitle.textContent = 'Pro Features';
  
  const proDescription = document.createElement('p');
  proDescription.className = 'text-sm text-muted-foreground mb-4';
  proDescription.textContent = 'Upgrade to Stackr Pro to unlock enhanced Money Mentor capabilities:';
  
  const proFeaturesList = document.createElement('ul');
  proFeaturesList.className = 'space-y-2 text-sm';
  
  const proFeatures = [
    'Unlimited AI-powered financial advice',
    'Custom income allocation recommendations',
    'Personalized debt repayment plans',
    'Investment strategy creation',
    'Chat history & saved advice'
  ];
  
  proFeatures.forEach(feature => {
    const item = document.createElement('li');
    item.className = 'flex items-start';
    
    const checkmark = document.createElement('span');
    checkmark.className = 'text-primary mr-2';
    checkmark.textContent = '✓';
    
    const text = document.createElement('span');
    text.textContent = feature;
    
    item.appendChild(checkmark);
    item.appendChild(text);
    proFeaturesList.appendChild(item);
  });
  
  const upgradeButton = document.createElement('a');
  upgradeButton.href = '/subscription.html';
  upgradeButton.className = 'block mt-4';
  
  const upgradeButtonInner = document.createElement('button');
  upgradeButtonInner.className = 'w-full bg-primary text-white py-2 rounded-md font-medium';
  upgradeButtonInner.textContent = 'Upgrade to Pro';
  
  upgradeButton.appendChild(upgradeButtonInner);
  
  proCard.appendChild(proTitle);
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
      createToast('Pro Subscription Required', 'This feature requires a Pro subscription. Please upgrade to access Money Mentor.', 'error');
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
      
      // Show toast
      createToast(
        error.message === 'This feature requires a Pro subscription' ? 'Pro Subscription Required' : 'Error',
        error.message,
        'error'
      );
    } finally {
      isLoading = false;
    }
  });
  
  return container;
}