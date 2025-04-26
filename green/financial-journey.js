/**
 * Interactive Financial Journey Roadmap
 * 
 * This module provides a visual, interactive roadmap that allows users to:
 * - See their current financial journey stage
 * - View upcoming financial milestones
 * - Track progress towards financial independence
 * - Get personalized recommendations based on their current stage
 */

// Store the user's current journey data
let journeyData = {
  currentStage: 1, // Index of the current milestone in the journey (Building Emergency Fund)
  milestones: [
    {
      id: "income-tracking",
      title: "Getting Started",
      description: "Begin tracking your income and expenses regularly",
      criteria: "Track income and expenses for 1 month",
      tip: "Start simple with basic tracking before trying to optimize everything. Even tracking just your top 5-10 expenses will give you valuable insights into your spending patterns.",
      completed: true,
      completionPercentage: 100
    },
    {
      id: "emergency-fund",
      title: "Build Emergency Fund",
      description: "Save 3-6 months of essential expenses",
      criteria: "Save $10,000 in your emergency fund",
      tip: "Start with a $1,000 mini emergency fund for immediate emergencies, then build to the full amount over time. Keep this money in a high-yield savings account that's separate from your checking account.",
      completed: false,
      completionPercentage: 65
    },
    {
      id: "debt-reduction",
      title: "Eliminate High-Interest Debt",
      description: "Pay off credit cards and high-interest loans",
      criteria: "Reduce high-interest debt by 80%",
      tip: "Use either the avalanche method (highest interest first) for maximum savings or snowball method (smallest balance first) for psychological wins. Either way, make minimum payments on all debts and put extra money toward your target debt.",
      completed: false,
      completionPercentage: 0
    },
    {
      id: "retirement-contributions",
      title: "Max Retirement Contributions",
      description: "Maximize contributions to tax-advantaged accounts",
      criteria: "Reach maximum annual contributions",
      tip: "At minimum, contribute enough to get any employer match - it's free money! For self-employed individuals, consider a Solo 401(k) or SEP IRA which often have higher contribution limits than traditional IRAs.",
      completed: false,
      completionPercentage: 0
    },
    {
      id: "investment-portfolio",
      title: "Invest for Growth",
      description: "Build investment portfolio beyond retirement",
      criteria: "Invest 15% of income in diversified portfolio",
      tip: "Consider low-cost index funds for long-term growth with minimal effort. A simple three-fund portfolio (total US market, total international market, and bond fund) provides excellent diversification for beginners.",
      completed: false,
      completionPercentage: 0
    },
    {
      id: "financial-independence",
      title: "Financial Independence",
      description: "Reach the point where work becomes optional",
      criteria: "Investments cover 25x annual expenses",
      tip: "The 4% rule suggests you can withdraw 4% of your portfolio value annually in retirement with low risk of running out of money. This means your target number is roughly 25 times your annual expenses.",
      completed: false,
      completionPercentage: 0
    }
  ],
  achievements: [
    {
      id: "first-budget",
      title: "First Budget Created",
      description: "Created your first monthly budget",
      date: new Date(2023, 8, 15) // September 15, 2023
    },
    {
      id: "expense-tracker",
      title: "Expense Tracker",
      description: "Tracked all expenses for 30 consecutive days",
      date: new Date(2023, 9, 20) // October 20, 2023
    },
    {
      id: "savings-milestone",
      title: "Savings Milestone",
      description: "Saved first $1,000 emergency fund",
      date: new Date(2023, 11, 5) // December 5, 2023
    },
    {
      id: "debt-reduction",
      title: "Debt Reduction",
      description: "Paid off your first credit card completely",
      date: new Date(2024, 1, 12) // February 12, 2024
    },
    {
      id: "income-boost",
      title: "Income Boost",
      description: "Secured your first gig through Stackr platform",
      date: new Date(2024, 3, 8) // April 8, 2024
    }
  ]
};

/**
 * Initialize the journey data from storage or API
 * @param {string} userId - The user ID to load data for
 */
function initializeJourney(userId) {
  // In a full implementation, this would load data from backend
  // For now, we'll simulate some progress based on the userId
  const userIdLastDigit = parseInt(userId.slice(-1)) || 0;
  
  // Simulate different progress stages based on the userId
  const simulatedProgress = Math.min(userIdLastDigit, 5);
  
  // Mark milestones as completed based on the simulated progress
  for (let i = 0; i < simulatedProgress; i++) {
    journeyData.milestones[i].completed = true;
    journeyData.milestones[i].completionPercentage = 100;
  }
  
  // Set partial progress for the current milestone
  if (simulatedProgress < journeyData.milestones.length) {
    const partialProgress = (userIdLastDigit * 10) % 100;
    journeyData.milestones[simulatedProgress].completionPercentage = partialProgress;
  }
  
  journeyData.currentStage = simulatedProgress;
  
  // Add some achievements based on the progress
  if (simulatedProgress >= 1) {
    journeyData.achievements.push({
      id: "first-income",
      title: "Income Master",
      description: "Tracked your first income source",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });
  }
  
  if (simulatedProgress >= 2) {
    journeyData.achievements.push({
      id: "budget-creator",
      title: "Budget Creator",
      description: "Created your first monthly budget",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    });
  }
  
  if (simulatedProgress >= 3) {
    journeyData.achievements.push({
      id: "emergency-saver",
      title: "Safety Net Builder",
      description: "Started your emergency fund",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });
  }
}

/**
 * Generate a personalized recommendation based on the user's current stage
 * @returns {string} Personalized recommendation text
 */
function getPersonalizedRecommendation() {
  const currentStage = journeyData.currentStage;
  const currentMilestone = journeyData.milestones[currentStage];
  
  if (!currentMilestone) {
    return "Keep up the great work on your financial journey!";
  }
  
  switch (currentMilestone.id) {
    case "income-tracking":
      return "Continue tracking all income sources to maintain a clear picture of your cash flow and spot opportunities to increase earnings.";
    case "emergency-fund":
      return "Aim to consistently save at least 10% of your income until you've reached your emergency fund goal of 3-6 months of expenses.";
    case "debt-reduction":
      return "Focus on paying off your highest interest debts first while maintaining minimum payments on others to avoid fees and credit score damage.";
    case "retirement-contributions":
      return "Gradually increase your retirement contributions with each raise or income boost until you reach the maximum annual limit.";
    case "investment-portfolio":
      return "Diversify your investments across multiple asset classes to balance growth potential with appropriate risk for your age and goals.";
    case "financial-independence":
      return "Continue optimizing both your income and expenses while maintaining a sustainable investment strategy for long-term growth.";
    default:
      return "Set specific financial goals and track your progress regularly to stay motivated on your journey to financial independence.";
  }
}

/**
 * Render the Financial Journey Roadmap page
 * @param {string} containerId - ID of the container element
 */
export function renderFinancialJourneyPage(containerId) {
  // Get the container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID '${containerId}' not found`);
    return;
  }
  
  // Clear the container
  container.innerHTML = '';
  
  // Check if this is a mobile or foldable device
  const isMobile = window.innerWidth < 768;
  const isFoldable = /SM-F9/.test(navigator.userAgent);
  const isFolded = isFoldable && window.innerWidth < 600;
  
  // Create the page container
  const pageContainer = document.createElement('div');
  pageContainer.className = 'financial-journey-container';
  pageContainer.style.padding = isMobile ? '16px' : '20px';
  
  // Initialize journey data with the current user ID
  // In a real app, you would get this from the authentication system
  const userId = localStorage.getItem('userId') || 'user123';
  initializeJourney(userId);
  
  // Add page header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  
  const pageTitle = document.createElement('h1');
  pageTitle.textContent = 'Your Financial Journey';
  pageTitle.style.fontSize = isMobile ? '24px' : '28px';
  pageTitle.style.fontWeight = 'bold';
  pageTitle.style.marginBottom = '10px';
  pageTitle.style.color = 'var(--color-heading)';
  
  const pageDescription = document.createElement('p');
  pageDescription.textContent = 'Track your progress toward financial independence with these key milestones.';
  pageDescription.style.fontSize = '16px';
  pageDescription.style.color = 'var(--color-text-secondary)';
  pageDescription.style.lineHeight = '1.5';
  
  header.appendChild(pageTitle);
  header.appendChild(pageDescription);
  pageContainer.appendChild(header);
  
  // Create recommendation card
  const recommendationCard = createRecommendationCard();
  pageContainer.appendChild(recommendationCard);
  
  // Create journey visualization
  const journeyVisualization = createJourneyVisualization();
  pageContainer.appendChild(journeyVisualization);
  
  // Create achievements section if there are any
  if (journeyData.achievements.length > 0) {
    const achievementsSection = createAchievementsSection();
    pageContainer.appendChild(achievementsSection);
  }
  
  // Append the page container to the main container
  container.appendChild(pageContainer);
  
  // Apply responsive styles for mobile/foldable devices
  applyResponsiveStyles();
  
  // Add window resize listener to adjust the layout when device folds/unfolds
  window.addEventListener('resize', applyResponsiveStyles);
  
  // Log viewport information for debugging on foldable devices
  console.log("Financial Journey viewport:", {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile,
    isFoldable,
    isFolded
  });
}

/**
 * Create a recommendation card based on the user's current stage
 * @returns {HTMLElement} The recommendation card element
 */
function createRecommendationCard() {
  // Create the card container
  const card = document.createElement('div');
  card.className = 'recommendation-card';
  card.style.padding = '24px';
  card.style.backgroundColor = 'var(--color-primary-light, #e6f7ff)';
  card.style.borderRadius = '12px';
  card.style.marginBottom = '32px';
  card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Create the card title
  const cardTitle = document.createElement('h2');
  cardTitle.textContent = 'Your Next Steps';
  cardTitle.style.fontSize = '20px';
  cardTitle.style.fontWeight = 'bold';
  cardTitle.style.marginBottom = '12px';
  cardTitle.style.color = 'var(--color-heading)';
  
  // Create the personalized recommendation
  const recommendation = document.createElement('p');
  recommendation.textContent = getPersonalizedRecommendation();
  recommendation.style.fontSize = '16px';
  recommendation.style.lineHeight = '1.5';
  recommendation.style.marginBottom = '16px';
  
  // Create current stage label
  const currentMilestone = journeyData.milestones[journeyData.currentStage];
  const stageLabel = document.createElement('div');
  stageLabel.style.display = 'flex';
  stageLabel.style.alignItems = 'center';
  stageLabel.style.fontSize = '14px';
  stageLabel.style.color = 'var(--color-text-secondary)';
  
  const stageIcon = document.createElement('span');
  stageIcon.textContent = '📍';
  stageIcon.style.marginRight = '8px';
  
  const stageText = document.createElement('span');
  stageText.textContent = `Current stage: ${currentMilestone ? currentMilestone.title : 'Financial Independence'}`;
  
  stageLabel.appendChild(stageIcon);
  stageLabel.appendChild(stageText);
  
  // Assemble the card
  card.appendChild(cardTitle);
  card.appendChild(recommendation);
  card.appendChild(stageLabel);
  
  return card;
}

/**
 * Create the journey visualization showing the roadmap
 * @returns {HTMLElement} The journey visualization element
 */
function createJourneyVisualization() {
  // Create the visualization container
  const visualizationContainer = document.createElement('div');
  visualizationContainer.className = 'journey-visualization';
  visualizationContainer.style.backgroundColor = 'var(--color-card-bg)';
  visualizationContainer.style.padding = '24px';
  visualizationContainer.style.borderRadius = '12px';
  visualizationContainer.style.marginBottom = '32px';
  visualizationContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Create section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Financial Milestones';
  sectionTitle.style.fontSize = '20px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '24px';
  sectionTitle.style.color = 'var(--color-heading)';
  
  visualizationContainer.appendChild(sectionTitle);
  
  // Create the journey steps list
  const journeySteps = document.createElement('div');
  journeySteps.className = 'journey-steps';
  
  // Add each milestone as a step in the journey
  journeyData.milestones.forEach((milestone, index) => {
    const step = createJourneyStep(milestone, index);
    journeySteps.appendChild(step);
  });
  
  visualizationContainer.appendChild(journeySteps);
  
  return visualizationContainer;
}

/**
 * Create a single journey step for a milestone
 * @param {Object} milestone - The milestone data
 * @param {number} index - The milestone index
 * @returns {HTMLElement} The journey step element
 */
function createJourneyStep(milestone, index) {
  // Create step container
  const step = document.createElement('div');
  step.className = 'journey-step';
  step.style.display = 'flex';
  step.style.marginBottom = '24px';
  step.style.position = 'relative';
  
  // Add a line connecting the steps, except for the last one
  if (index < journeyData.milestones.length - 1) {
    const line = document.createElement('div');
    line.className = 'journey-line';
    line.style.position = 'absolute';
    line.style.top = '24px';
    line.style.left = '12px';
    line.style.width = '2px';
    line.style.height = '100%';
    
    // Color the line based on completion
    if (index < journeyData.currentStage) {
      line.style.backgroundColor = 'var(--color-primary)';
    } else {
      line.style.backgroundColor = 'var(--color-border)';
    }
    
    step.appendChild(line);
  }
  
  // Create milestone circle indicator
  const circleContainer = document.createElement('div');
  circleContainer.style.width = '24px';
  circleContainer.style.height = '24px';
  circleContainer.style.marginRight = '16px';
  circleContainer.style.flexShrink = '0';
  circleContainer.style.position = 'relative';
  circleContainer.style.zIndex = '1';
  
  const circle = document.createElement('div');
  circle.className = 'step-circle';
  circle.style.width = '24px';
  circle.style.height = '24px';
  circle.style.borderRadius = '50%';
  circle.style.display = 'flex';
  circle.style.alignItems = 'center';
  circle.style.justifyContent = 'center';
  
  // Style the circle based on completion status
  if (milestone.completed) {
    // Completed milestone
    circle.style.backgroundColor = 'var(--color-primary)';
    circle.style.color = 'white';
    circle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (index === journeyData.currentStage) {
    // Current milestone
    circle.style.backgroundColor = 'var(--color-primary-light)';
    circle.style.color = 'var(--color-primary)';
    circle.style.border = '2px solid var(--color-primary)';
    circle.textContent = (index + 1).toString();
  } else {
    // Future milestone
    circle.style.backgroundColor = 'var(--color-card-bg)';
    circle.style.color = 'var(--color-text-secondary)';
    circle.style.border = '2px solid var(--color-border)';
    circle.textContent = (index + 1).toString();
  }
  
  circleContainer.appendChild(circle);
  step.appendChild(circleContainer);
  
  // Create milestone content
  const content = document.createElement('div');
  content.className = 'step-content';
  content.style.flex = '1';
  
  // Milestone title
  const title = document.createElement('h3');
  title.textContent = milestone.title;
  title.style.fontSize = '16px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '4px';
  
  // Style title based on completion
  if (milestone.completed) {
    title.style.color = 'var(--color-primary)';
  } else if (index === journeyData.currentStage) {
    title.style.color = 'var(--color-heading)';
  } else {
    title.style.color = 'var(--color-text-secondary)';
  }
  
  // Milestone description
  const description = document.createElement('p');
  description.textContent = milestone.description;
  description.style.fontSize = '14px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.marginBottom = '8px';
  
  // Add progress bar for current milestone
  let progressBar;
  if (index === journeyData.currentStage && milestone.completionPercentage > 0 && milestone.completionPercentage < 100) {
    progressBar = document.createElement('div');
    progressBar.className = 'milestone-progress';
    progressBar.style.height = '6px';
    progressBar.style.backgroundColor = 'var(--color-border-light)';
    progressBar.style.borderRadius = '3px';
    progressBar.style.marginBottom = '8px';
    progressBar.style.overflow = 'hidden';
    
    const progressFill = document.createElement('div');
    progressFill.style.height = '100%';
    progressFill.style.width = `${milestone.completionPercentage}%`;
    progressFill.style.backgroundColor = 'var(--color-primary)';
    
    progressBar.appendChild(progressFill);
  }
  
  // Add criteria text
  const criteria = document.createElement('p');
  criteria.textContent = `Goal: ${milestone.criteria}`;
  criteria.style.fontSize = '13px';
  criteria.style.color = 'var(--color-text-secondary)';
  criteria.style.fontStyle = 'italic';
  
  // Add tip button
  const tipButton = document.createElement('button');
  tipButton.className = 'tip-button';
  tipButton.style.backgroundColor = 'transparent';
  tipButton.style.border = 'none';
  tipButton.style.color = 'var(--color-primary)';
  tipButton.style.fontSize = '13px';
  tipButton.style.padding = '0';
  tipButton.style.marginTop = '8px';
  tipButton.style.cursor = 'pointer';
  tipButton.style.display = 'flex';
  tipButton.style.alignItems = 'center';
  tipButton.textContent = 'View tip';
  
  // Add tip functionality
  tipButton.addEventListener('click', () => {
    showTip(milestone.title, milestone.tips);
  });
  
  // Assemble the content
  content.appendChild(title);
  content.appendChild(description);
  if (progressBar) {
    content.appendChild(progressBar);
  }
  content.appendChild(criteria);
  content.appendChild(tipButton);
  
  step.appendChild(content);
  
  return step;
}

/**
 * Apply responsive styles based on device type and screen size
 * Especially important for foldable devices like Samsung Z Fold
 */
function applyResponsiveStyles() {
  const isMobile = window.innerWidth < 768;
  const isFoldable = /SM-F9/.test(navigator.userAgent);
  const isFolded = isFoldable && window.innerWidth < 600;
  
  // Get all the journey steps
  const journeySteps = document.querySelectorAll('.journey-step');
  journeySteps.forEach((step) => {
    // Adjust padding and margins for mobile devices
    if (isMobile) {
      step.style.marginBottom = '16px';
    } else {
      step.style.marginBottom = '24px';
    }
  });
  
  // Get the recommendation card and adjust it for mobile
  const recommendationCard = document.querySelector('.recommendation-card');
  if (recommendationCard) {
    if (isMobile) {
      recommendationCard.style.padding = '16px';
      recommendationCard.style.marginBottom = '20px';
    } else {
      recommendationCard.style.padding = '24px';
      recommendationCard.style.marginBottom = '32px';
    }
  }
  
  // Adjust the journey visualization container
  const journeyContainer = document.querySelector('.journey-visualization');
  if (journeyContainer) {
    if (isMobile) {
      journeyContainer.style.padding = '16px';
      journeyContainer.style.marginBottom = '20px';
    } else {
      journeyContainer.style.padding = '24px';
      journeyContainer.style.marginBottom = '32px';
    }
  }
  
  // Special handling for folded state on foldable devices
  if (isFolded) {
    // Make content even more compact in folded state
    const contentElements = document.querySelectorAll('.step-content p');
    contentElements.forEach((element) => {
      element.style.fontSize = '12px';
      element.style.marginBottom = '4px';
    });
    
    // Reduce title sizes for folded state
    const stepTitles = document.querySelectorAll('.step-content h3');
    stepTitles.forEach((title) => {
      title.style.fontSize = '14px';
      title.style.marginBottom = '2px';
    });
  }
}

/**
 * Creates the achievements section
 * @returns {HTMLElement} The achievements section element
 */
function createAchievementsSection() {
  // Create section container
  const section = document.createElement('div');
  section.className = 'achievements-section';
  section.style.backgroundColor = 'var(--color-card-bg)';
  section.style.padding = '24px';
  section.style.borderRadius = '12px';
  section.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  
  // Create section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = 'Your Achievements';
  sectionTitle.style.fontSize = '20px';
  sectionTitle.style.fontWeight = 'bold';
  sectionTitle.style.marginBottom = '16px';
  sectionTitle.style.color = 'var(--color-heading)';
  
  section.appendChild(sectionTitle);
  
  // Create achievements grid
  const achievementsGrid = document.createElement('div');
  achievementsGrid.className = 'achievements-grid';
  achievementsGrid.style.display = 'grid';
  achievementsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
  achievementsGrid.style.gap = '16px';
  
  // Add achievement cards
  journeyData.achievements.forEach(achievement => {
    const card = createAchievementCard(achievement);
    achievementsGrid.appendChild(card);
  });
  
  section.appendChild(achievementsGrid);
  
  return section;
}

/**
 * Create an achievement card
 * @param {Object} achievement - The achievement data
 * @returns {HTMLElement} The achievement card element
 */
function createAchievementCard(achievement) {
  const card = document.createElement('div');
  card.className = 'achievement-card';
  card.style.backgroundColor = 'var(--color-bg)';
  card.style.padding = '16px';
  card.style.borderRadius = '8px';
  card.style.border = '1px solid var(--color-border)';
  
  // Format date
  const formattedDate = achievement.date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Achievement title with medal emoji
  const title = document.createElement('h3');
  title.style.display = 'flex';
  title.style.alignItems = 'center';
  title.style.fontSize = '16px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  title.style.color = 'var(--color-heading)';
  
  const medalEmoji = document.createElement('span');
  medalEmoji.textContent = '🏆 ';
  medalEmoji.style.marginRight = '6px';
  
  const titleText = document.createElement('span');
  titleText.textContent = achievement.title;
  
  title.appendChild(medalEmoji);
  title.appendChild(titleText);
  
  // Achievement description
  const description = document.createElement('p');
  description.textContent = achievement.description;
  description.style.fontSize = '14px';
  description.style.color = 'var(--color-text)';
  description.style.marginBottom = '8px';
  
  // Achievement date
  const date = document.createElement('p');
  date.textContent = `Achieved on: ${formattedDate}`;
  date.style.fontSize = '12px';
  date.style.color = 'var(--color-text-secondary)';
  
  // Assemble the card
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(date);
  
  return card;
}

/**
 * Show a tip in a modal dialog
 * @param {string} title - The tip title
 * @param {string} tipText - The tip text
 */
function showTip(title, tipText) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'tip-modal';
  modal.style.backgroundColor = 'var(--color-bg)';
  modal.style.padding = '24px';
  modal.style.borderRadius = '12px';
  modal.style.maxWidth = '400px';
  modal.style.width = '90%';
  modal.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
  
  // Create tip icon and title
  const titleContainer = document.createElement('div');
  titleContainer.style.display = 'flex';
  titleContainer.style.alignItems = 'center';
  titleContainer.style.marginBottom = '16px';
  
  const tipIcon = document.createElement('span');
  tipIcon.textContent = '💡';
  tipIcon.style.marginRight = '12px';
  tipIcon.style.fontSize = '24px';
  
  const tipTitle = document.createElement('h3');
  tipTitle.textContent = title;
  tipTitle.style.fontSize = '18px';
  tipTitle.style.fontWeight = 'bold';
  tipTitle.style.margin = '0';
  tipTitle.style.color = 'var(--color-heading)';
  
  titleContainer.appendChild(tipIcon);
  titleContainer.appendChild(tipTitle);
  
  // Tip content
  const tipContent = document.createElement('p');
  tipContent.textContent = tipText;
  tipContent.style.fontSize = '16px';
  tipContent.style.lineHeight = '1.5';
  tipContent.style.marginBottom = '24px';
  tipContent.style.color = 'var(--color-text)';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Got it';
  closeButton.style.backgroundColor = 'var(--color-primary)';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '6px';
  closeButton.style.padding = '10px 20px';
  closeButton.style.fontSize = '16px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.width = '100%';
  
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  // Assemble the modal
  modal.appendChild(titleContainer);
  modal.appendChild(tipContent);
  modal.appendChild(closeButton);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

