/**
 * Financial Education Mascot
 * A friendly, playful character that guides users through financial concepts
 * and provides educational tips throughout the application.
 */

// Collection of financial tips organized by category
const financialTips = {
  budgeting: [
    "Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
    "Track your expenses for a month to identify spending patterns and areas to cut back.",
    "Create a zero-based budget where every dollar has a purpose.",
    "Review your budget monthly and adjust as needed.",
    "Use cash envelopes for categories where you tend to overspend.",
    "Plan for irregular expenses like car maintenance or holiday gifts.",
    "Automate your bill payments to avoid late fees.",
    "Include fun money in your budget to avoid feeling deprived.",
    "Consider meal planning to reduce food waste and dining out expenses.",
    "Remember to budget for your future self through retirement contributions.",
  ],
  saving: [
    "Start an emergency fund aiming for 3-6 months of essential expenses.",
    "Set up automatic transfers to your savings account on payday.",
    "Try the 24-hour rule before making non-essential purchases.",
    "Look for no-fee, high-interest savings accounts.",
    "Save your tax refunds, work bonuses, and other windfalls.",
    "Challenge yourself to a no-spend week each month.",
    "Consider saving in a ladder of certificates of deposit (CDs) for higher returns.",
    "Use apps that round up purchases and save the difference.",
    "Review and cancel subscriptions you don't regularly use.",
    "Try the 52-week challenge: save $1 week 1, $2 week 2, and so on.",
  ],
  income: [
    "Diversify your income with a side hustle or freelance work.",
    "Negotiate your salary during job offers and performance reviews.",
    "Optimize your skills through education and certifications.",
    "Consider passive income sources like dividends, rental properties, or digital products.",
    "Use cashback credit cards for everyday purchases (and pay them off in full).",
    "Leverage your expertise by teaching, consulting, or creating content.",
    "Sell items you no longer need through online marketplaces.",
    "Research tax deductions you may be eligible for.",
    "Participate in focus groups or online surveys for extra cash.",
    "Look into rewards programs for stores you frequently visit.",
  ],
  debt: [
    "List all your debts with interest rates and minimum payments.",
    "Consider the debt avalanche method (highest interest first) or snowball method (smallest balance first).",
    "Look into balance transfer offers for high-interest credit cards.",
    "Check if refinancing loans could lower your interest rates.",
    "Pay more than the minimum payment whenever possible.",
    "Consider consolidating multiple debts into a single loan.",
    "Avoid taking on new debt while paying off existing debt.",
    "Check your credit report regularly for errors that could affect your score.",
    "Communicate with creditors if you're having trouble making payments.",
    "Remember that becoming debt-free is a marathon, not a sprint.",
  ],
  investing: [
    "Start investing early to benefit from compound interest.",
    "Diversify your investments across different asset classes.",
    "Consider low-cost index funds for long-term investing.",
    "Take advantage of employer-matched retirement contributions.",
    "Understand the difference between tax-advantaged and taxable accounts.",
    "Keep investment costs low by watching out for fees.",
    "Set up regular, automatic investments to practice dollar-cost averaging.",
    "Rebalance your portfolio annually to maintain your desired asset allocation.",
    "Consider your risk tolerance and time horizon when choosing investments.",
    "Don't try to time the market; consistency is key for most investors.",
  ],
  psychology: [
    "Practice gratitude for what you already have to reduce impulse spending.",
    "Identify your financial values to align your spending with what matters most.",
    "Celebrate financial wins, no matter how small.",
    "Find money accountability partners or communities for support.",
    "Be mindful of lifestyle inflation when your income increases.",
    "Use visualization techniques to maintain motivation for long-term goals.",
    "Remember that financial comparison to others can be misleading and harmful.",
    "Practice self-compassion when you make financial mistakes.",
    "Consider how your upbringing has shaped your money mindset.",
    "Take breaks from financial planning to avoid decision fatigue.",
  ]
};

// Mascot personalities to choose from
const mascotPersonalities = {
  sage: {
    name: "Professor Penny",
    traits: "Wise, experienced, thoughtful",
    style: "Offers deeper insights and context for financial concepts",
    icon: "🦉",
    color: "#8B5CF6", // Purple
    greeting: "Financial wisdom at your service! What would you like to learn today?",
    farewell: "Remember, knowledge compounds just like interest. See you next time!",
  },
  cheerleader: {
    name: "Cash Carter",
    traits: "Enthusiastic, encouraging, positive",
    style: "Celebrates your wins and motivates you through challenges",
    icon: "🐿️",
    color: "#F59E0B", // Amber
    greeting: "You're doing great! Ready to crush your financial goals today?",
    farewell: "You've got this! Every small step adds up to big progress!",
  },
  coach: {
    name: "Buck Bailey",
    traits: "Disciplined, straightforward, motivating",
    style: "Provides clear, actionable advice and accountability",
    icon: "🦬",
    color: "#2563EB", // Blue
    greeting: "Let's get down to business. What's your financial game plan today?",
    farewell: "Stay focused on your goals. Consistency is key to financial fitness!",
  },
  friend: {
    name: "Sunny Savings",
    traits: "Relatable, supportive, empathetic",
    style: "Offers judgment-free guidance and emotional support",
    icon: "🦊",
    color: "#10B981", // Emerald
    greeting: "Hey there! How's your money journey going today?",
    farewell: "Remember, we all have ups and downs with money. I'm here whenever you need me!",
  },
  jester: {
    name: "Cash Quips",
    traits: "Humorous, witty, lighthearted",
    style: "Makes financial concepts fun with jokes and wordplay",
    icon: "🦜",
    color: "#EC4899", // Pink
    greeting: "Want to hear a joke about money? Never mind, I'm saving it!",
    farewell: "Remember: budgeting is like a diet for your wallet, but you can still have treats!",
  }
};

/**
 * Financial Mascot class that provides guidance, tips, and encouragement
 */
class FinancialMascot {
  constructor(personalityType = 'friend') {
    this.personality = mascotPersonalities[personalityType];
    this.name = this.personality.name;
    this.icon = this.personality.icon;
    this.color = this.personality.color;
    this.isVisible = false;
    this.messageQueue = [];
    this.currentTipCategory = 'budgeting';
    this.container = null;
    this.bubble = null;
    this.tipIndex = {};
    
    // Initialize tip indexes for each category
    Object.keys(financialTips).forEach(category => {
      this.tipIndex[category] = 0;
    });
  }

  /**
   * Initialize the mascot on the page
   * @param {boolean} startVisible - Whether the mascot should be visible on init
   * @returns {HTMLElement} - The mascot container element
   */
  init(startVisible = true) {
    // Create container for the mascot
    this.container = document.createElement('div');
    this.container.className = 'financial-mascot-container';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '20px';
    this.container.style.right = '20px';
    this.container.style.zIndex = '1000';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'flex-end';
    this.container.style.transition = 'all 0.3s ease';
    
    // Create the mascot character
    const mascotCharacter = document.createElement('div');
    mascotCharacter.className = 'financial-mascot-character';
    mascotCharacter.style.width = '60px';
    mascotCharacter.style.height = '60px';
    mascotCharacter.style.borderRadius = '50%';
    mascotCharacter.style.backgroundColor = this.color;
    mascotCharacter.style.display = 'flex';
    mascotCharacter.style.alignItems = 'center';
    mascotCharacter.style.justifyContent = 'center';
    mascotCharacter.style.fontSize = '30px';
    mascotCharacter.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    mascotCharacter.style.cursor = 'pointer';
    mascotCharacter.style.transition = 'all 0.2s ease';
    mascotCharacter.textContent = this.icon;
    
    // Add hover effect
    mascotCharacter.onmouseover = () => {
      mascotCharacter.style.transform = 'scale(1.1)';
      mascotCharacter.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.15)';
    };
    
    mascotCharacter.onmouseout = () => {
      mascotCharacter.style.transform = 'scale(1)';
      mascotCharacter.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    };
    
    // Speech bubble for messages
    this.bubble = document.createElement('div');
    this.bubble.className = 'financial-mascot-bubble';
    this.bubble.style.maxWidth = '300px';
    this.bubble.style.padding = '15px';
    this.bubble.style.backgroundColor = 'white';
    this.bubble.style.borderRadius = '15px';
    this.bubble.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    this.bubble.style.marginBottom = '10px';
    this.bubble.style.position = 'relative';
    this.bubble.style.transition = 'all 0.3s ease';
    this.bubble.style.transformOrigin = 'bottom right';
    this.bubble.style.opacity = '0';
    this.bubble.style.transform = 'scale(0.8)';
    this.bubble.style.pointerEvents = 'auto';
    this.bubble.style.display = 'none';
    
    // Add the tail to the speech bubble
    const bubbleTail = document.createElement('div');
    bubbleTail.style.position = 'absolute';
    bubbleTail.style.bottom = '-8px';
    bubbleTail.style.right = '15px';
    bubbleTail.style.width = '0';
    bubbleTail.style.height = '0';
    bubbleTail.style.borderLeft = '8px solid transparent';
    bubbleTail.style.borderRight = '8px solid transparent';
    bubbleTail.style.borderTop = '8px solid white';
    
    this.bubble.appendChild(bubbleTail);
    
    // Close button for the bubble
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '10px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#666';
    closeBtn.style.padding = '0';
    closeBtn.style.lineHeight = '1';
    
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.hideBubble();
    };
    
    this.bubble.appendChild(closeBtn);
    
    // Message content container
    const messageContent = document.createElement('div');
    messageContent.className = 'financial-mascot-message';
    messageContent.style.display = 'flex';
    messageContent.style.flexDirection = 'column';
    messageContent.style.paddingRight = '10px';
    this.bubble.appendChild(messageContent);
    
    // Mascot name header
    const nameHeader = document.createElement('div');
    nameHeader.textContent = this.name;
    nameHeader.style.fontWeight = 'bold';
    nameHeader.style.marginBottom = '5px';
    nameHeader.style.color = this.color;
    messageContent.appendChild(nameHeader);
    
    // Message text
    const messageText = document.createElement('div');
    messageText.className = 'financial-mascot-text';
    messageText.style.lineHeight = '1.4';
    messageText.style.fontSize = '14px';
    messageText.textContent = this.personality.greeting;
    messageContent.appendChild(messageText);
    
    // Button container at the bottom of the bubble
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.justifyContent = 'space-between';
    messageContent.appendChild(buttonContainer);
    
    // "Next Tip" button
    const nextTipBtn = document.createElement('button');
    nextTipBtn.textContent = 'Next Tip';
    nextTipBtn.style.background = this.color;
    nextTipBtn.style.color = 'white';
    nextTipBtn.style.border = 'none';
    nextTipBtn.style.borderRadius = '15px';
    nextTipBtn.style.padding = '6px 12px';
    nextTipBtn.style.fontSize = '12px';
    nextTipBtn.style.cursor = 'pointer';
    nextTipBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    nextTipBtn.style.transition = 'all 0.2s ease';
    
    nextTipBtn.onmouseover = () => {
      nextTipBtn.style.backgroundColor = adjustColor(this.color, -20);
      nextTipBtn.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.15)';
    };
    
    nextTipBtn.onmouseout = () => {
      nextTipBtn.style.backgroundColor = this.color;
      nextTipBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    };
    
    nextTipBtn.onclick = (e) => {
      e.stopPropagation();
      this.showNextTip();
    };
    
    // Category selector
    const categorySelect = document.createElement('select');
    categorySelect.style.backgroundColor = '#f1f5f9';
    categorySelect.style.border = '1px solid #cbd5e1';
    categorySelect.style.borderRadius = '15px';
    categorySelect.style.padding = '5px 10px 5px 10px';
    categorySelect.style.fontSize = '12px';
    categorySelect.style.cursor = 'pointer';
    categorySelect.style.marginRight = '8px';
    
    // Add options for each category
    Object.keys(financialTips).forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      categorySelect.appendChild(option);
    });
    
    categorySelect.value = this.currentTipCategory;
    
    categorySelect.onchange = () => {
      this.currentTipCategory = categorySelect.value;
      this.showNextTip();
    };
    
    buttonContainer.appendChild(categorySelect);
    buttonContainer.appendChild(nextTipBtn);
    
    // Add click handler to toggle bubble
    mascotCharacter.onclick = () => {
      if (this.bubble.style.display === 'none') {
        this.showBubble();
      } else {
        this.hideBubble();
      }
    };
    
    // Add elements to container
    this.container.appendChild(this.bubble);
    this.container.appendChild(mascotCharacter);
    
    // Set initial visibility
    this.isVisible = startVisible;
    
    if (!startVisible) {
      this.container.style.display = 'none';
    }
    
    // Append to document body
    document.body.appendChild(this.container);
    
    // Show greeting after a short delay
    if (startVisible) {
      setTimeout(() => {
        this.showBubble();
        
        // Auto-hide after 10 seconds if no interaction
        setTimeout(() => {
          if (this.bubble.style.display !== 'none') {
            this.hideBubble();
          }
        }, 10000);
      }, 1500);
    }
    
    return this.container;
  }
  
  /**
   * Show the speech bubble with a message
   * @param {string} message - Optional custom message
   */
  showBubble(message) {
    const textElement = this.bubble.querySelector('.financial-mascot-text');
    if (message) {
      textElement.textContent = message;
    }
    
    this.bubble.style.display = 'block';
    
    // Trigger reflow for animation
    void this.bubble.offsetWidth;
    
    this.bubble.style.opacity = '1';
    this.bubble.style.transform = 'scale(1)';
  }
  
  /**
   * Hide the speech bubble
   */
  hideBubble() {
    this.bubble.style.opacity = '0';
    this.bubble.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      this.bubble.style.display = 'none';
    }, 300);
  }
  
  /**
   * Show the mascot on the page
   */
  show() {
    this.isVisible = true;
    this.container.style.display = 'flex';
  }
  
  /**
   * Hide the mascot from the page
   */
  hide() {
    this.isVisible = false;
    this.hideBubble();
    
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 300);
  }
  
  /**
   * Toggle the mascot's visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Show a tip from the selected category
   */
  showNextTip() {
    // Check if bubble exists first
    if (!this.bubble) {
      console.log('Financial mascot bubble not initialized yet, creating it now');
      this.createBubble();
      return;
    }
    
    const categoryTips = financialTips[this.currentTipCategory];
    
    // Get current index for this category
    let index = this.tipIndex[this.currentTipCategory];
    
    // Update the message text
    const textElement = this.bubble.querySelector('.financial-mascot-text');
    if (textElement) {
      textElement.textContent = categoryTips[index];
      
      // Increment index for next time, wrapping around if necessary
      index = (index + 1) % categoryTips.length;
      this.tipIndex[this.currentTipCategory] = index;
      
      // If bubble was hidden, show it
      if (this.bubble.style.display === 'none') {
        this.showBubble();
      }
    } else {
      console.log('Financial mascot text element not found in bubble');
    }
  }
  
  /**
   * Show a specific financial tip
   * @param {string} category - The tip category
   * @param {number} index - The tip index
   */
  showSpecificTip(category, index) {
    if (!financialTips[category]) {
      console.error(`Category "${category}" does not exist`);
      return;
    }
    
    const categoryTips = financialTips[category];
    
    // Validate index
    if (index < 0 || index >= categoryTips.length) {
      console.error(`Invalid tip index: ${index}`);
      return;
    }
    
    // Update the current category
    this.currentTipCategory = category;
    
    // Update the category selector if it exists
    const categorySelect = this.bubble.querySelector('select');
    if (categorySelect) {
      categorySelect.value = category;
    }
    
    // Set the tip index for this category
    this.tipIndex[category] = index;
    
    // Show the tip
    const textElement = this.bubble.querySelector('.financial-mascot-text');
    textElement.textContent = categoryTips[index];
    
    // If bubble was hidden, show it
    if (this.bubble.style.display === 'none') {
      this.showBubble();
    }
  }
  
  /**
   * Change the mascot's personality
   * @param {string} personalityType - The personality type to change to
   */
  changePersonality(personalityType) {
    if (!mascotPersonalities[personalityType]) {
      console.error(`Personality "${personalityType}" does not exist`);
      return;
    }
    
    this.personality = mascotPersonalities[personalityType];
    this.name = this.personality.name;
    this.icon = this.personality.icon;
    this.color = this.personality.color;
    
    // Update the mascot's appearance
    const mascotCharacter = this.container.querySelector('.financial-mascot-character');
    mascotCharacter.textContent = this.icon;
    mascotCharacter.style.backgroundColor = this.color;
    
    // Update the name in the bubble
    const nameHeader = this.bubble.querySelector('.financial-mascot-message > div:first-child');
    nameHeader.textContent = this.name;
    nameHeader.style.color = this.color;
    
    // Update button color
    const nextTipBtn = this.bubble.querySelector('button:last-child');
    nextTipBtn.style.backgroundColor = this.color;
    
    // Show a greeting from the new personality
    this.showBubble(this.personality.greeting);
  }
  
  /**
   * Get a random tip from a specific category
   * @param {string} category - The category to get a tip from
   * @returns {string} A random tip
   */
  getRandomTip(category = 'budgeting') {
    if (!financialTips[category]) {
      console.error(`Category "${category}" does not exist`);
      return '';
    }
    
    const tips = financialTips[category];
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }
  
  /**
   * Destroy the mascot and remove it from the DOM
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

/**
 * Utility function to adjust a color's brightness
 * @param {string} color - The hex color to adjust
 * @param {number} amount - The amount to adjust by (positive for lighter, negative for darker)
 * @returns {string} The adjusted hex color
 */
function adjustColor(color, amount) {
  // Remove # if present
  color = color.replace('#', '');
  
  // Parse the color components
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Adjust each component
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Create a settings UI to customize the mascot
 * @param {FinancialMascot} mascot - The mascot instance
 * @returns {HTMLElement} The settings UI element
 */
function createMascotSettings(mascot) {
  const container = document.createElement('div');
  container.className = 'mascot-settings';
  container.style.padding = '20px';
  container.style.backgroundColor = 'white';
  container.style.borderRadius = '12px';
  container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  container.style.maxWidth = '500px';
  container.style.margin = '0 auto';
  
  // Title
  const title = document.createElement('h2');
  title.textContent = 'Financial Mascot Settings';
  title.style.marginBottom = '20px';
  title.style.color = '#333';
  title.style.fontSize = '20px';
  container.appendChild(title);
  
  // Personality selector
  const personalityContainer = document.createElement('div');
  personalityContainer.style.marginBottom = '20px';
  
  const personalityLabel = document.createElement('div');
  personalityLabel.textContent = 'Choose Your Mascot Personality';
  personalityLabel.style.marginBottom = '10px';
  personalityLabel.style.fontWeight = '500';
  personalityContainer.appendChild(personalityLabel);
  
  const personalityOptions = document.createElement('div');
  personalityOptions.style.display = 'grid';
  personalityOptions.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
  personalityOptions.style.gap = '10px';
  
  // Create a card for each personality
  Object.entries(mascotPersonalities).forEach(([key, value]) => {
    const card = document.createElement('div');
    card.style.padding = '15px';
    card.style.borderRadius = '8px';
    card.style.border = `2px solid ${mascot.personality.name === value.name ? value.color : '#e2e8f0'}`;
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.2s ease';
    
    // Add hover effects
    card.onmouseover = () => {
      if (mascot.personality.name !== value.name) {
        card.style.backgroundColor = '#f8fafc';
        card.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
      }
    };
    
    card.onmouseout = () => {
      if (mascot.personality.name !== value.name) {
        card.style.backgroundColor = 'white';
        card.style.boxShadow = 'none';
      }
    };
    
    // Add click handler to select personality
    card.onclick = () => {
      // Update all card borders
      personalityOptions.querySelectorAll('div').forEach(element => {
        element.style.border = '2px solid #e2e8f0';
        element.style.backgroundColor = 'white';
      });
      
      // Highlight selected card
      card.style.border = `2px solid ${value.color}`;
      card.style.backgroundColor = '#f8fafc';
      
      // Change mascot personality
      mascot.changePersonality(key);
    };
    
    // Icon and name
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.marginBottom = '8px';
    
    const icon = document.createElement('div');
    icon.textContent = value.icon;
    icon.style.fontSize = '24px';
    icon.style.marginRight = '8px';
    
    const name = document.createElement('div');
    name.textContent = value.name;
    name.style.fontWeight = '500';
    name.style.color = value.color;
    
    header.appendChild(icon);
    header.appendChild(name);
    card.appendChild(header);
    
    // Traits
    const traits = document.createElement('div');
    traits.textContent = value.traits;
    traits.style.fontSize = '12px';
    traits.style.marginBottom = '8px';
    traits.style.color = '#64748b';
    card.appendChild(traits);
    
    personalityOptions.appendChild(card);
  });
  
  personalityContainer.appendChild(personalityOptions);
  container.appendChild(personalityContainer);
  
  // Visibility toggle
  const visibilityContainer = document.createElement('div');
  visibilityContainer.style.marginBottom = '20px';
  
  const visibilityLabel = document.createElement('div');
  visibilityLabel.textContent = 'Mascot Visibility';
  visibilityLabel.style.marginBottom = '10px';
  visibilityLabel.style.fontWeight = '500';
  visibilityContainer.appendChild(visibilityLabel);
  
  const toggleContainer = document.createElement('div');
  toggleContainer.style.display = 'flex';
  toggleContainer.style.alignItems = 'center';
  
  const toggle = document.createElement('label');
  toggle.className = 'toggle-switch';
  toggle.style.position = 'relative';
  toggle.style.display = 'inline-block';
  toggle.style.width = '50px';
  toggle.style.height = '24px';
  toggle.style.marginRight = '10px';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = mascot.isVisible;
  checkbox.style.opacity = '0';
  checkbox.style.width = '0';
  checkbox.style.height = '0';
  
  const slider = document.createElement('span');
  slider.style.position = 'absolute';
  slider.style.cursor = 'pointer';
  slider.style.top = '0';
  slider.style.left = '0';
  slider.style.right = '0';
  slider.style.bottom = '0';
  slider.style.backgroundColor = checkbox.checked ? mascot.color : '#cbd5e1';
  slider.style.transition = '0.4s';
  slider.style.borderRadius = '34px';
  
  const sliderButton = document.createElement('span');
  sliderButton.style.position = 'absolute';
  sliderButton.style.content = '""';
  sliderButton.style.height = '16px';
  sliderButton.style.width = '16px';
  sliderButton.style.left = checkbox.checked ? 'calc(100% - 20px)' : '4px';
  sliderButton.style.bottom = '4px';
  sliderButton.style.backgroundColor = 'white';
  sliderButton.style.transition = '0.4s';
  sliderButton.style.borderRadius = '50%';
  
  slider.appendChild(sliderButton);
  toggle.appendChild(checkbox);
  toggle.appendChild(slider);
  
  const toggleLabel = document.createElement('span');
  toggleLabel.textContent = mascot.isVisible ? 'Visible' : 'Hidden';
  
  checkbox.onchange = () => {
    if (checkbox.checked) {
      mascot.show();
      slider.style.backgroundColor = mascot.color;
      sliderButton.style.left = 'calc(100% - 20px)';
      toggleLabel.textContent = 'Visible';
    } else {
      mascot.hide();
      slider.style.backgroundColor = '#cbd5e1';
      sliderButton.style.left = '4px';
      toggleLabel.textContent = 'Hidden';
    }
  };
  
  toggleContainer.appendChild(toggle);
  toggleContainer.appendChild(toggleLabel);
  visibilityContainer.appendChild(toggleContainer);
  container.appendChild(visibilityContainer);
  
  // Save preferences in localstorage
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save Preferences';
  saveBtn.style.backgroundColor = mascot.color;
  saveBtn.style.color = 'white';
  saveBtn.style.border = 'none';
  saveBtn.style.borderRadius = '8px';
  saveBtn.style.padding = '10px 20px';
  saveBtn.style.fontWeight = '500';
  saveBtn.style.cursor = 'pointer';
  saveBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  saveBtn.style.transition = 'all 0.2s ease';
  
  saveBtn.onmouseover = () => {
    saveBtn.style.backgroundColor = adjustColor(mascot.color, -20);
    saveBtn.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.15)';
  };
  
  saveBtn.onmouseout = () => {
    saveBtn.style.backgroundColor = mascot.color;
    saveBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  };
  
  saveBtn.onclick = () => {
    // Save preferences to localStorage
    const preferences = {
      personality: Object.keys(mascotPersonalities).find(
        key => mascotPersonalities[key].name === mascot.name
      ),
      visible: mascot.isVisible
    };
    
    localStorage.setItem('mascotPreferences', JSON.stringify(preferences));
    
    // Show confirmation
    saveBtn.textContent = 'Saved!';
    saveBtn.disabled = true;
    
    setTimeout(() => {
      saveBtn.textContent = 'Save Preferences';
      saveBtn.disabled = false;
    }, 2000);
  };
  
  container.appendChild(saveBtn);
  
  return container;
}

/**
 * Initialize the mascot with saved preferences or defaults
 * @returns {FinancialMascot} The initialized mascot instance
 */
function initMascot() {
  // Check for saved preferences
  let personality = 'friend';
  let visible = true;
  
  const savedPreferences = localStorage.getItem('mascotPreferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    personality = preferences.personality || 'friend';
    visible = preferences.visible !== undefined ? preferences.visible : true;
  }
  
  // Create and initialize the mascot
  const mascot = new FinancialMascot(personality);
  mascot.init(visible);
  
  return mascot;
}

export { FinancialMascot, createMascotSettings, initMascot, mascotPersonalities, financialTips };