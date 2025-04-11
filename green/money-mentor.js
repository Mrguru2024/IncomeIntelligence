/**
 * Money Mentor - AI-powered financial advisor and journey storyteller
 * This module provides personalized financial guidance through an interactive chat interface
 * and creates a narrative of the user's financial journey
 */

// Check if we have API keys for AI services
const hasApiKey = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

/**
 * Generate financial advice using AI
 * @param {string} prompt - User's financial question or situation
 * @param {Object} userData - User's financial data for context
 * @returns {Promise<string>} - AI-generated response
 */
async function generateFinancialAdvice(prompt, userData) {
  try {
    // If no API keys available, use pre-written responses
    if (!hasApiKey) {
      return getPreWrittenAdvice(prompt, userData);
    }
    
    // Try to use available AI service
    if (process.env.ANTHROPIC_API_KEY) {
      return generateAdviceWithAnthropic(prompt, userData);
    } else if (process.env.OPENAI_API_KEY) {
      return generateAdviceWithOpenAI(prompt, userData);
    } else {
      return getPreWrittenAdvice(prompt, userData);
    }
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return "I'm having trouble connecting to my knowledge base right now. Let me share some general advice: It's important to build an emergency fund, aim to save at least 20% of your income, and prioritize paying off high-interest debt.";
  }
}

/**
 * Generate financial advice using Anthropic Claude
 * @param {string} prompt - User's financial question
 * @param {Object} userData - User's financial data
 * @returns {Promise<string>} - AI-generated response
 */
async function generateAdviceWithAnthropic(prompt, userData) {
  try {
    // Prepare user context based on their financial data
    const userContext = prepareUserContext(userData);
    
    // Construct system prompt with financial advisor persona and user context
    const systemPrompt = `You are Money Mentor, a helpful and friendly financial advisor. Your goal is to provide personalized, practical financial advice. Be conversational but concise. Focus on actionable steps the user can take. 
    
    Here's what you know about this user:
    ${userContext}
    
    Rules to follow:
    1. Always be encouraging and positive, even when discussing financial challenges.
    2. Provide specific, actionable advice - not generic platitudes.
    3. Your advice should be realistic and tailored to the user's financial situation.
    4. Keep responses under 250 words.
    5. Don't mention that you're an AI or that you have limited knowledge.
    6. Never recommend specific investment products or services by name.
    7. Acknowledge the emotional aspects of financial decisions.
    8. Respect the user's 40/30/30 split approach (Needs/Investments/Savings) in your advice.`;
    
    // Make API call to Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219', // Using the most recent Claude model as of 2025
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error with Anthropic API:', error);
    throw error;
  }
}

/**
 * Generate financial advice using OpenAI GPT-4
 * @param {string} prompt - User's financial question
 * @param {Object} userData - User's financial data
 * @returns {Promise<string>} - AI-generated response
 */
async function generateAdviceWithOpenAI(prompt, userData) {
  try {
    // Prepare user context based on their financial data
    const userContext = prepareUserContext(userData);
    
    // Construct system message with financial advisor persona and user context
    const systemMessage = `You are Money Mentor, a helpful and friendly financial advisor. Your goal is to provide personalized, practical financial advice. Be conversational but concise. Focus on actionable steps the user can take. 
    
    Here's what you know about this user:
    ${userContext}
    
    Rules to follow:
    1. Always be encouraging and positive, even when discussing financial challenges.
    2. Provide specific, actionable advice - not generic platitudes.
    3. Your advice should be realistic and tailored to the user's financial situation.
    4. Keep responses under 250 words.
    5. Don't mention that you're an AI or that you have limited knowledge.
    6. Never recommend specific investment products or services by name.
    7. Acknowledge the emotional aspects of financial decisions.
    8. Respect the user's 40/30/30 split approach (Needs/Investments/Savings) in your advice.`;
    
    // Make API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using the most recent GPT model as of 2025
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    throw error;
  }
}

/**
 * Prepare the user context from their financial data
 * @param {Object} userData - User's financial data
 * @returns {string} - Contextual information about the user
 */
function prepareUserContext(userData) {
  if (!userData) {
    return "No detailed financial information available for this user yet.";
  }
  
  // Extract relevant information from userData
  const {
    monthlyIncome = 'unknown',
    expenses = {},
    savingsRate = 'unknown',
    debtAmount = 'unknown',
    financialGoals = [],
    riskTolerance = 'moderate',
    age = 'unknown',
    splitRatio = { needs: 40, investments: 30, savings: 30 }
  } = userData;
  
  // Format financial goals if available
  let goalsText = "No specific financial goals set.";
  if (financialGoals && financialGoals.length > 0) {
    goalsText = "Financial goals:\n" + financialGoals.map(goal => 
      `- ${goal.description} (Target: $${goal.targetAmount}, Timeline: ${goal.timeline} months)`
    ).join('\n');
  }
  
  // Calculate monthly expenses total if available
  let expensesTotal = 0;
  let expensesBreakdown = "No detailed expense information available.";
  
  if (expenses && Object.keys(expenses).length > 0) {
    expensesTotal = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    expensesBreakdown = "Monthly expenses breakdown:\n" + 
      Object.entries(expenses)
        .map(([category, amount]) => `- ${category}: $${amount}`)
        .join('\n');
  }
  
  // Construct the user context
  return `
    Monthly Income: $${monthlyIncome}
    Monthly Expenses Total: $${expensesTotal}
    ${expensesBreakdown}
    Current Savings Rate: ${savingsRate}%
    Income Allocation Strategy: ${splitRatio.needs}% for Needs, ${splitRatio.investments}% for Investments, ${splitRatio.savings}% for Savings
    Outstanding Debt: $${debtAmount}
    Risk Tolerance: ${riskTolerance}
    Age: ${age}
    
    ${goalsText}
  `;
}

/**
 * Get pre-written advice for common financial questions
 * @param {string} prompt - User's financial question
 * @param {Object} userData - User's financial data
 * @returns {string} - Pre-written advice
 */
function getPreWrittenAdvice(prompt, userData) {
  // Normalize the prompt by converting to lowercase and removing punctuation
  const normalizedPrompt = prompt.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Extract income for personalization
  const income = userData?.monthlyIncome || 3000;
  const emergencyFundTarget = Math.round(income * 6); // 6 months of income
  
  // Library of pre-written responses for common financial questions
  const responses = {
    // Budgeting
    'budget': `Based on your monthly income of $${income}, I recommend following the 40/30/30 rule: allocate 40% ($${Math.round(income * 0.4)}) to needs like housing and food, 30% ($${Math.round(income * 0.3)}) to investments for the future, and 30% ($${Math.round(income * 0.3)}) to savings. Start by tracking all expenses for a month, then adjust these percentages to fit your situation.`,
    
    'save money': `To boost your savings on a $${income} monthly income, try the 30-day no-spend challenge: commit to no discretionary spending for a month. Also, review subscriptions—most people can save $100+ monthly by cutting unused services. Automate savings by setting up an automatic transfer of $${Math.round(income * 0.1)} on payday to a separate account.`,
    
    'emergency fund': `Your emergency fund should cover 3-6 months of expenses, so aim for about $${emergencyFundTarget}. Start by saving $${Math.round(income * 0.1)} monthly in a high-yield savings account. Even $25 weekly adds up to $1,300 in a year. This fund will protect you from unexpected expenses without derailing your financial progress.`,
    
    'debt': `Tackle debt using either the avalanche method (paying off highest interest rates first) or the snowball method (smallest balances first). Allocate at least $${Math.round(income * 0.2)} monthly to debt repayment. Once a debt is paid off, roll that payment into the next debt. Consider calling creditors to negotiate lower interest rates.`,
    
    'invest': `For investing, first ensure you have an emergency fund and are contributing to retirement. Then consider index funds for long-term growth with less risk than individual stocks. Start with $${Math.round(income * 0.05)} monthly and increase gradually. Remember that investing is marathon, not a sprint—consistency matters more than timing the market.`,
    
    'retire': `For retirement planning, aim to save 15% of your income, or about $${Math.round(income * 0.15)} monthly. Start with any employer match in your 401(k) if available—it's free money. Then consider a Roth IRA for tax-free growth. The power of compound interest means that starting early is crucial, even with small amounts.`,
    
    'buy house': `When saving for a home, aim for a 20% down payment to avoid PMI, plus extra for closing costs and moving expenses. For a $300,000 home, that's $60,000+ in savings. Set aside $${Math.round(income * 0.15)} monthly in a high-yield savings account and consider temporarily increasing your income with side gigs to reach your goal faster.`,
    
    // Default response for unrecognized topics
    'default': `I recommend focusing on three financial priorities: building an emergency fund of $${emergencyFundTarget}, paying down high-interest debt, and saving at least $${Math.round(income * 0.15)} monthly for retirement. Track your spending for greater awareness, and remember that small, consistent actions lead to significant financial progress over time.`
  };
  
  // Check for keyword matches
  for (const [keyword, response] of Object.entries(responses)) {
    if (normalizedPrompt.includes(keyword)) {
      return response;
    }
  }
  
  // Return default advice if no keyword matches
  return responses.default;
}

/**
 * Generate a financial journey story or chapter
 * @param {Object} userData - User's financial data
 * @param {Array} events - Financial events to include in the story
 * @returns {string} - Generated financial journey story
 */
function generateJourneyStory(userData, events) {
  if (!userData || !events || events.length === 0) {
    return "Your financial journey is just beginning. As you take actions, we'll document your progress and achievements here.";
  }
  
  // Sort events by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Create story introduction
  let story = `# ${userData.name}'s Financial Journey\n\n`;
  story += `## Chapter ${userData.journeyChapter || 1}: ${getJourneyChapterTitle(userData, events)}\n\n`;
  
  // Add narrative based on recent events
  story += createJourneyNarrative(userData, events);
  
  // Add achievements section
  const achievements = extractAchievements(events);
  if (achievements.length > 0) {
    story += "\n## Achievements Unlocked\n\n";
    achievements.forEach(achievement => {
      story += `### ${achievement.title} 🏆\n`;
      story += `${achievement.description}\n\n`;
    });
  }
  
  // Add next steps/goals section
  story += "\n## Your Next Financial Milestones\n\n";
  const nextSteps = generateNextSteps(userData, events);
  nextSteps.forEach((step, index) => {
    story += `${index + 1}. **${step.title}**: ${step.description}\n`;
  });
  
  return story;
}

/**
 * Generate a journey chapter title based on user data and recent events
 * @param {Object} userData - User's financial data
 * @param {Array} events - Financial events
 * @returns {string} - Chapter title
 */
function getJourneyChapterTitle(userData, events) {
  // Analyze recent events to determine chapter theme
  const hasIncomeEvent = events.some(e => e.type === 'income');
  const hasSavingsEvent = events.some(e => e.type === 'savings');
  const hasInvestmentEvent = events.some(e => e.type === 'investment');
  const hasDebtEvent = events.some(e => e.type === 'debt_payment');
  const hasGoalEvent = events.some(e => e.type === 'goal_progress');
  
  // Determine the dominant theme
  if (hasGoalEvent) {
    return "Setting Course for Success";
  } else if (hasDebtEvent) {
    return "Breaking Free from Financial Burdens";
  } else if (hasInvestmentEvent) {
    return "Planting Seeds for Future Growth";
  } else if (hasSavingsEvent) {
    return "Building Your Financial Fortress";
  } else if (hasIncomeEvent) {
    return "Expanding Your Financial Horizons";
  } else {
    return "The Beginning of Financial Wisdom";
  }
}

/**
 * Create a narrative based on user's financial events
 * @param {Object} userData - User's financial data
 * @param {Array} events - Financial events
 * @returns {string} - Narrative text
 */
function createJourneyNarrative(userData, events) {
  // Get the most recent events (last 5)
  const recentEvents = events.slice(-5);
  
  // Start with an introduction
  let narrative = `As ${userData.name} continues on the path to financial well-being, `;
  
  // Add details about recent financial actions
  if (recentEvents.length === 1) {
    // Single event narrative
    narrative += createSingleEventNarrative(recentEvents[0], userData);
  } else {
    // Multiple event narrative
    narrative += createMultiEventNarrative(recentEvents, userData);
  }
  
  // Add a forward-looking conclusion
  narrative += "\n\n";
  narrative += createForwardLookingConclusion(userData, events);
  
  return narrative;
}

/**
 * Create narrative for a single financial event
 * @param {Object} event - Financial event
 * @param {Object} userData - User's financial data
 * @returns {string} - Narrative text
 */
function createSingleEventNarrative(event, userData) {
  switch (event.type) {
    case 'income':
      return `a significant milestone was reached by earning ${formatCurrency(event.amount)}. This income isn't just a number—it's a testament to hard work and dedication. Following the 40/30/30 principle, this translates to ${formatCurrency(event.amount * 0.4)} for needs, ${formatCurrency(event.amount * 0.3)} for investments, and ${formatCurrency(event.amount * 0.3)} for savings.`;
      
    case 'savings':
      return `a wise decision was made to set aside ${formatCurrency(event.amount)} for the future. Each dollar saved is a step toward financial security and peace of mind. This brings the total savings to ${formatCurrency(userData.totalSavings || event.amount)}, creating a stronger financial foundation.`;
      
    case 'investment':
      return `an investment of ${formatCurrency(event.amount)} was made, planting seeds for future growth. While the market may fluctuate, consistent investing is a proven strategy for long-term wealth building. This decision demonstrates a commitment to future financial prosperity.`;
      
    case 'debt_payment':
      return `progress was made by paying down ${formatCurrency(event.amount)} of debt. Each payment is not just reducing the balance—it's buying freedom and opening doors to new financial opportunities. This commitment to becoming debt-free is a powerful force in the financial journey.`;
      
    case 'goal_progress':
      const percentComplete = Math.round((event.currentAmount / event.targetAmount) * 100);
      return `exciting progress was made toward the goal of "${event.goalName}". Now at ${percentComplete}% complete with ${formatCurrency(event.currentAmount)} saved toward the target of ${formatCurrency(event.targetAmount)}, this goal is becoming more attainable with each passing day.`;
      
    case 'subscription_cancelled':
      return `a smart choice was made to cancel the ${event.name} subscription, saving ${formatCurrency(event.amount)} per month or ${formatCurrency(event.amount * 12)} annually. These small decisions compound over time, creating significant financial impact through mindful spending.`;
      
    default:
      return `important steps were taken that continue to build a strong financial foundation. Each decision, no matter how small, contributes to a larger picture of financial well-being.`;
  }
}

/**
 * Create narrative for multiple financial events
 * @param {Array} events - Financial events
 * @param {Object} userData - User's financial data
 * @returns {string} - Narrative text
 */
function createMultiEventNarrative(events, userData) {
  // Categorize events
  const incomeEvents = events.filter(e => e.type === 'income');
  const savingsEvents = events.filter(e => e.type === 'savings');
  const investmentEvents = events.filter(e => e.type === 'investment');
  const debtEvents = events.filter(e => e.type === 'debt_payment');
  const goalEvents = events.filter(e => e.type === 'goal_progress');
  const subscriptionEvents = events.filter(e => e.type === 'subscription_cancelled');
  
  let narrative = "several important financial moves were made. ";
  
  // Add income narrative
  if (incomeEvents.length > 0) {
    const totalIncome = incomeEvents.reduce((sum, event) => sum + event.amount, 0);
    narrative += `A total of ${formatCurrency(totalIncome)} was earned, providing resources to fuel financial goals. `;
  }
  
  // Add savings narrative
  if (savingsEvents.length > 0) {
    const totalSaved = savingsEvents.reduce((sum, event) => sum + event.amount, 0);
    narrative += `Wisdom was demonstrated by saving ${formatCurrency(totalSaved)}, strengthening the financial foundation. `;
  }
  
  // Add investment narrative
  if (investmentEvents.length > 0) {
    const totalInvested = investmentEvents.reduce((sum, event) => sum + event.amount, 0);
    narrative += `Forward-thinking investments of ${formatCurrency(totalInvested)} were made, planting seeds for future growth. `;
  }
  
  // Add debt payment narrative
  if (debtEvents.length > 0) {
    const totalPaid = debtEvents.reduce((sum, event) => sum + event.amount, 0);
    narrative += `Significant progress was made by paying down ${formatCurrency(totalPaid)} of debt, moving closer to financial freedom. `;
  }
  
  // Add goal progress narrative
  if (goalEvents.length > 0) {
    const recentGoal = goalEvents[goalEvents.length - 1];
    const percentComplete = Math.round((recentGoal.currentAmount / recentGoal.targetAmount) * 100);
    narrative += `The goal of "${recentGoal.goalName}" is now ${percentComplete}% complete, with ${formatCurrency(recentGoal.currentAmount)} saved toward the target. `;
  }
  
  // Add subscription cancellation narrative
  if (subscriptionEvents.length > 0) {
    const totalSaved = subscriptionEvents.reduce((sum, event) => sum + event.amount, 0) * 12; // Annual savings
    narrative += `By cancelling ${subscriptionEvents.length} subscription${subscriptionEvents.length > 1 ? 's' : ''}, an impressive ${formatCurrency(totalSaved)} will be saved annually. `;
  }
  
  return narrative;
}

/**
 * Create a forward-looking conclusion for the narrative
 * @param {Object} userData - User's financial data
 * @param {Array} events - Financial events
 * @returns {string} - Conclusion text
 */
function createForwardLookingConclusion(userData, events) {
  // Analyze user situation to create appropriate conclusion
  const hasDebt = (userData.debtAmount || 0) > 0;
  const hasSavings = (userData.totalSavings || 0) > 0;
  const hasInvestments = (userData.investmentTotal || 0) > 0;
  const hasActiveGoals = (userData.financialGoals || []).some(goal => !goal.completed);
  
  if (hasDebt && !hasSavings) {
    return "Looking ahead, focusing on building an emergency fund while continuing to pay down debt will create a more secure financial foundation. Remember that each step, no matter how small, is progress toward financial freedom.";
  } else if (hasDebt && hasSavings) {
    return "The journey continues with a balanced approach—maintaining emergency savings while systematically reducing debt. This dual focus creates both security today and freedom tomorrow.";
  } else if (hasSavings && !hasInvestments) {
    return "With a solid foundation of savings in place, the next chapter may involve exploring investment opportunities for long-term growth. The journey from saver to investor is an exciting evolution in financial progress.";
  } else if (hasActiveGoals) {
    return "The path forward is clear with well-defined goals providing direction. By maintaining consistency and focus, these ambitions will transform from plans into achievements, one step at a time.";
  } else {
    return "The financial journey ahead is full of opportunity. By continuing to make intentional decisions aligned with personal values and goals, each chapter will build upon the last, creating a story of financial confidence and freedom.";
  }
}

/**
 * Extract achievements from financial events
 * @param {Array} events - Financial events
 * @returns {Array} - Achievements
 */
function extractAchievements(events) {
  const achievements = [];
  
  // Define achievement triggers
  const triggers = {
    // Income achievements
    totalIncome: {
      thresholds: [5000, 10000, 25000, 50000, 100000],
      getTitle: (amount) => `Income Milestone: ${formatCurrency(amount)}`,
      getDescription: (amount) => `Reached a total income of ${formatCurrency(amount)}. Your earning power is a key asset in your financial journey.`
    },
    
    // Savings achievements
    savingsStreak: {
      thresholds: [3, 6, 12, 24],
      getTitle: (months) => `Savings Streak: ${months} Months`,
      getDescription: (months) => `Consistently saved money for ${months} consecutive months. This discipline is the foundation of financial success.`
    },
    
    emergencyFund: {
      thresholds: [1000, 5000, 10000, 20000],
      getTitle: (amount) => `Emergency Fund Builder`,
      getDescription: (amount) => `Built an emergency fund of ${formatCurrency(amount)}. This financial buffer provides security and peace of mind.`
    },
    
    // Debt achievements
    debtPayoff: {
      thresholds: [1000, 5000, 10000, 25000, 50000],
      getTitle: (amount) => `Debt Destroyer`,
      getDescription: (amount) => `Paid off ${formatCurrency(amount)} in debt. Each dollar of debt eliminated is a step toward financial freedom.`
    },
    
    // Investment achievements
    investmentMilestone: {
      thresholds: [1000, 5000, 10000, 50000, 100000],
      getTitle: (amount) => `Investment Builder: ${formatCurrency(amount)}`,
      getDescription: (amount) => `Reached ${formatCurrency(amount)} in investments. Your money is now working hard for your future.`
    },
    
    // Goal achievements
    goalCompleted: {
      getTitle: (goalName) => `Goal Achieved: ${goalName}`,
      getDescription: (goalName, amount) => `Successfully reached your financial goal of "${goalName}" by saving ${formatCurrency(amount)}. Setting and achieving goals is a powerful financial skill.`
    }
  };
  
  // Check for achievements based on events
  // Income total achievement
  const incomeEvents = events.filter(e => e.type === 'income');
  const totalIncome = incomeEvents.reduce((sum, event) => sum + event.amount, 0);
  for (const threshold of triggers.totalIncome.thresholds) {
    if (totalIncome >= threshold) {
      achievements.push({
        title: triggers.totalIncome.getTitle(threshold),
        description: triggers.totalIncome.getDescription(threshold),
        date: incomeEvents[incomeEvents.length - 1]?.date || new Date().toISOString()
      });
      break; // Only get the highest threshold achieved
    }
  }
  
  // Emergency fund achievement
  const savingsEvents = events.filter(e => e.type === 'savings');
  const totalSavings = savingsEvents.reduce((sum, event) => sum + event.amount, 0);
  for (const threshold of triggers.emergencyFund.thresholds) {
    if (totalSavings >= threshold) {
      achievements.push({
        title: triggers.emergencyFund.getTitle(threshold),
        description: triggers.emergencyFund.getDescription(threshold),
        date: savingsEvents[savingsEvents.length - 1]?.date || new Date().toISOString()
      });
      break; // Only get the highest threshold achieved
    }
  }
  
  // Debt payoff achievement
  const debtEvents = events.filter(e => e.type === 'debt_payment');
  const totalDebtPaid = debtEvents.reduce((sum, event) => sum + event.amount, 0);
  for (const threshold of triggers.debtPayoff.thresholds) {
    if (totalDebtPaid >= threshold) {
      achievements.push({
        title: triggers.debtPayoff.getTitle(threshold),
        description: triggers.debtPayoff.getDescription(threshold),
        date: debtEvents[debtEvents.length - 1]?.date || new Date().toISOString()
      });
      break; // Only get the highest threshold achieved
    }
  }
  
  // Investment milestone achievement
  const investmentEvents = events.filter(e => e.type === 'investment');
  const totalInvested = investmentEvents.reduce((sum, event) => sum + event.amount, 0);
  for (const threshold of triggers.investmentMilestone.thresholds) {
    if (totalInvested >= threshold) {
      achievements.push({
        title: triggers.investmentMilestone.getTitle(threshold),
        description: triggers.investmentMilestone.getDescription(threshold),
        date: investmentEvents[investmentEvents.length - 1]?.date || new Date().toISOString()
      });
      break; // Only get the highest threshold achieved
    }
  }
  
  // Completed goals achievements
  const goalEvents = events.filter(e => e.type === 'goal_completed');
  goalEvents.forEach(event => {
    achievements.push({
      title: triggers.goalCompleted.getTitle(event.goalName),
      description: triggers.goalCompleted.getDescription(event.goalName, event.amount),
      date: event.date
    });
  });
  
  return achievements;
}

/**
 * Generate next financial steps based on user data and events
 * @param {Object} userData - User's financial data
 * @param {Array} events - Financial events
 * @returns {Array} - Next steps
 */
function generateNextSteps(userData, events) {
  const nextSteps = [];
  
  // Get user's financial state
  const hasEmergencyFund = (userData.totalSavings || 0) >= (userData.monthlyIncome || 1000) * 3;
  const hasHighInterestDebt = (userData.debts || []).some(debt => debt.interestRate > 10);
  const hasRetirementSavings = (userData.accounts || []).some(account => account.type === 'retirement');
  const activeGoals = (userData.financialGoals || []).filter(goal => !goal.completed);
  
  // Priority 1: Emergency fund if missing
  if (!hasEmergencyFund) {
    nextSteps.push({
      title: "Build Your Emergency Fund",
      description: `Aim to save 3-6 months of expenses (about $${formatNumber((userData.monthlyIncome || 3000) * 4)}) for unexpected events.`
    });
  }
  
  // Priority 2: High-interest debt
  if (hasHighInterestDebt) {
    nextSteps.push({
      title: "Tackle High-Interest Debt",
      description: "Focus on paying off debts with interest rates above 10% to reduce financial drag."
    });
  }
  
  // Priority 3: Retirement savings
  if (!hasRetirementSavings) {
    nextSteps.push({
      title: "Start Retirement Contributions",
      description: `Begin investing for retirement, aiming to save 15% of your income or about $${formatNumber((userData.monthlyIncome || 3000) * 0.15)} per month.`
    });
  }
  
  // Priority 4: Active financial goals
  if (activeGoals.length > 0) {
    const nextGoal = activeGoals[0];
    const amountNeeded = nextGoal.targetAmount - (nextGoal.currentAmount || 0);
    nextSteps.push({
      title: `Progress on "${nextGoal.description}"`,
      description: `Continue saving toward this goal. You need $${formatNumber(amountNeeded)} more to reach your target.`
    });
  }
  
  // Additional steps based on specific scenarios
  
  // If no investment activity, suggest starting
  const hasInvestments = events.some(e => e.type === 'investment');
  if (!hasInvestments) {
    nextSteps.push({
      title: "Begin Your Investment Journey",
      description: "Start with small, regular investments to build wealth through the power of compound returns."
    });
  }
  
  // If no subscription optimization
  const hasOptimizedSubscriptions = events.some(e => e.type === 'subscription_cancelled');
  if (!hasOptimizedSubscriptions) {
    nextSteps.push({
      title: "Optimize Your Subscriptions",
      description: "Review your recurring payments and cancel unused services to free up money for your financial goals."
    });
  }
  
  // If no recent income increase
  const recentIncomeEvents = events.filter(e => e.type === 'income').slice(-5);
  const hasIncomeGrowth = recentIncomeEvents.length >= 2 && 
                          recentIncomeEvents[recentIncomeEvents.length - 1].amount > 
                          recentIncomeEvents[0].amount;
  
  if (!hasIncomeGrowth) {
    nextSteps.push({
      title: "Explore Income Growth Opportunities",
      description: "Look for ways to increase your earning potential through skill development, negotiation, or side projects."
    });
  }
  
  // Return top 3-4 steps, ensuring we don't overwhelm
  return nextSteps.slice(0, 4);
}

/**
 * Format currency number
 * @param {number} value - Number to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format number with commas
 * @param {number} value - Number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Process a message from the user and generate a response
 * @param {string} message - User's message
 * @param {Object} userData - User's financial data
 * @returns {Promise<Object>} - Response object with text and suggestions
 */
export async function processUserMessage(message, userData) {
  // Generate the AI response
  const response = await generateFinancialAdvice(message, userData);
  
  // Generate suggested follow-up questions
  const suggestions = generateSuggestions(message, userData);
  
  return {
    text: response,
    suggestions
  };
}

/**
 * Generate suggested follow-up questions based on context
 * @param {string} message - User's message
 * @param {Object} userData - User's financial data
 * @returns {Array} - Suggested follow-up questions
 */
function generateSuggestions(message, userData) {
  const normalizedMessage = message.toLowerCase();
  
  // Topic-based suggestions
  if (normalizedMessage.includes('budget') || normalizedMessage.includes('spending')) {
    return [
      "How can I create a budget that I'll actually stick to?",
      "What's the best way to track my expenses?",
      "How much should I allocate to different budget categories?"
    ];
  } else if (normalizedMessage.includes('debt') || normalizedMessage.includes('loan')) {
    return [
      "Which debts should I pay off first?",
      "Should I consolidate my debts?",
      "How can I improve my credit score while paying off debt?"
    ];
  } else if (normalizedMessage.includes('invest') || normalizedMessage.includes('stock')) {
    return [
      "How should I start investing with limited funds?",
      "What investment options are good for beginners?",
      "How do I balance investing with other financial goals?"
    ];
  } else if (normalizedMessage.includes('save') || normalizedMessage.includes('saving')) {
    return [
      "How much should I have in my emergency fund?",
      "What are the best accounts for short-term savings?",
      "How can I save more when my income is limited?"
    ];
  } else if (normalizedMessage.includes('retire') || normalizedMessage.includes('401k')) {
    return [
      "How much do I need to save for retirement?",
      "What's the difference between a Roth IRA and traditional IRA?",
      "Should I focus on retirement or other financial goals first?"
    ];
  }
  
  // Default suggestions based on user data
  return [
    "How can I improve my financial wellness score?",
    "What should be my next financial goal?",
    "How can I optimize my 40/30/30 allocation strategy?"
  ];
}

/**
 * Get the user's financial journey
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Journey data
 */
export async function getUserJourney(userId) {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll use localStorage for persistence
    const journeyData = localStorage.getItem(`journey_${userId}`);
    
    if (journeyData) {
      return JSON.parse(journeyData);
    }
    
    // Return a starter journey if none exists
    return {
      userId,
      chapter: 1,
      title: "The Beginning of Your Financial Journey",
      events: [],
      story: "Your financial journey is just beginning. As you take actions, Money Mentor will document your progress and achievements here.",
      achievements: []
    };
  } catch (error) {
    console.error('Error fetching user journey:', error);
    return null;
  }
}

/**
 * Record a financial event in the user's journey
 * @param {number} userId - User ID
 * @param {Object} event - Financial event
 * @returns {Promise<boolean>} - Success indicator
 */
export async function recordFinancialEvent(userId, event) {
  try {
    // Get current journey
    const journey = await getUserJourney(userId);
    
    // Add the event
    journey.events.push({
      ...event,
      date: event.date || new Date().toISOString()
    });
    
    // Update the story with the new event
    const userData = await getUserData(userId);
    journey.story = generateJourneyStory(userData, journey.events);
    
    // Check for chapter progression
    if (journey.events.length % 10 === 0) {
      journey.chapter += 1;
      journey.title = getJourneyChapterTitle(userData, journey.events.slice(-10));
    }
    
    // Save updated journey
    localStorage.setItem(`journey_${userId}`, JSON.stringify(journey));
    
    return true;
  } catch (error) {
    console.error('Error recording financial event:', error);
    return false;
  }
}

/**
 * Get user data for personalization
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User data
 */
async function getUserData(userId) {
  try {
    // In a real implementation, this would fetch from a database
    // For now we'll simulate with localStorage
    const userData = localStorage.getItem(`user_${userId}`);
    
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Return placeholder data if none exists
    return {
      name: "User",
      monthlyIncome: 3000,
      expenses: {
        housing: 1000,
        food: 400,
        transportation: 200,
        utilities: 150,
        entertainment: 100,
        other: 150
      },
      savingsRate: 10,
      debtAmount: 5000,
      financialGoals: [
        {
          description: "Emergency Fund",
          targetAmount: 10000,
          currentAmount: 2000,
          timeline: 12,
          priority: "high",
          completed: false
        }
      ],
      splitRatio: { needs: 40, investments: 30, savings: 30 }
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Render Money Mentor chatbot interface
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Rendered chat interface
 */
export function renderMoneyMentorChat(userId) {
  // Create main container
  const container = document.createElement('div');
  container.className = 'money-mentor-container';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';
  container.style.backgroundColor = 'white';
  container.style.borderRadius = '12px';
  container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  container.style.overflow = 'hidden';
  
  // Chat header
  const header = document.createElement('div');
  header.className = 'chat-header';
  header.style.padding = '16px 20px';
  header.style.backgroundColor = 'var(--color-primary)';
  header.style.color = 'white';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
  
  const avatarContainer = document.createElement('div');
  avatarContainer.style.width = '48px';
  avatarContainer.style.height = '48px';
  avatarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  avatarContainer.style.borderRadius = '50%';
  avatarContainer.style.display = 'flex';
  avatarContainer.style.alignItems = 'center';
  avatarContainer.style.justifyContent = 'center';
  avatarContainer.style.marginRight = '12px';
  avatarContainer.style.fontSize = '24px';
  avatarContainer.textContent = '💰';
  
  const headerInfo = document.createElement('div');
  headerInfo.style.flex = '1';
  
  const chatTitle = document.createElement('h2');
  chatTitle.textContent = 'Money Mentor';
  chatTitle.style.margin = '0';
  chatTitle.style.fontSize = '18px';
  chatTitle.style.fontWeight = 'bold';
  
  const chatSubtitle = document.createElement('div');
  chatSubtitle.textContent = 'Your personal financial guide';
  chatSubtitle.style.fontSize = '14px';
  chatSubtitle.style.opacity = '0.9';
  
  headerInfo.appendChild(chatTitle);
  headerInfo.appendChild(chatSubtitle);
  
  // Toggle button to switch between chat and journey views
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'View Journey';
  toggleButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '20px';
  toggleButton.style.padding = '8px 16px';
  toggleButton.style.color = 'white';
  toggleButton.style.fontWeight = 'bold';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.display = 'flex';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.gap = '8px';
  toggleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path><polyline points="10 2 10 22"></polyline></svg>
    View Journey
  `;
  
  header.appendChild(avatarContainer);
  header.appendChild(headerInfo);
  header.appendChild(toggleButton);
  
  // Chat and journey container (for toggle functionality)
  const contentContainer = document.createElement('div');
  contentContainer.style.flex = '1';
  contentContainer.style.display = 'flex';
  contentContainer.style.overflow = 'hidden';
  contentContainer.style.position = 'relative';
  
  // Chat messages container (scrollable)
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-messages';
  chatContainer.style.flex = '1';
  chatContainer.style.padding = '20px';
  chatContainer.style.overflowY = 'auto';
  chatContainer.style.display = 'flex';
  chatContainer.style.flexDirection = 'column';
  chatContainer.style.gap = '16px';
  
  // Journey view container (initially hidden)
  const journeyContainer = document.createElement('div');
  journeyContainer.className = 'journey-view';
  journeyContainer.style.position = 'absolute';
  journeyContainer.style.top = '0';
  journeyContainer.style.left = '100%';
  journeyContainer.style.width = '100%';
  journeyContainer.style.height = '100%';
  journeyContainer.style.padding = '20px';
  journeyContainer.style.backgroundColor = 'white';
  journeyContainer.style.overflowY = 'auto';
  journeyContainer.style.transition = 'left 0.3s ease';
  
  contentContainer.appendChild(chatContainer);
  contentContainer.appendChild(journeyContainer);
  
  // Add welcome message
  const welcomeMessage = document.createElement('div');
  welcomeMessage.className = 'chat-message bot';
  welcomeMessage.style.alignSelf = 'flex-start';
  welcomeMessage.style.maxWidth = '80%';
  welcomeMessage.style.padding = '12px 16px';
  welcomeMessage.style.backgroundColor = '#f0f4f8';
  welcomeMessage.style.color = '#333';
  welcomeMessage.style.borderRadius = '12px 12px 12px 0';
  welcomeMessage.style.position = 'relative';
  welcomeMessage.style.marginTop = '12px';
  
  const messageContent = document.createElement('div');
  messageContent.innerHTML = `
    <p>👋 Hi there! I'm Money Mentor, your personal financial guide.</p>
    <p>I'm here to help answer your financial questions and guide you on your journey. Here are some things you can ask me about:</p>
    <ul>
      <li>Budgeting and expense tracking</li>
      <li>Saving strategies</li>
      <li>Debt management</li>
      <li>Investment basics</li>
      <li>Retirement planning</li>
    </ul>
    <p>What would you like to know about today?</p>
  `;
  
  welcomeMessage.appendChild(messageContent);
  chatContainer.appendChild(welcomeMessage);
  
  // Suggested questions buttons
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'suggestions-container';
  suggestionsContainer.style.display = 'flex';
  suggestionsContainer.style.flexWrap = 'wrap';
  suggestionsContainer.style.gap = '8px';
  suggestionsContainer.style.marginTop = '8px';
  
  const initialSuggestions = [
    "How do I create a budget?",
    "How much should I save for emergencies?",
    "What's the best way to pay off debt?",
    "How do I start investing?"
  ];
  
  initialSuggestions.forEach(suggestion => {
    const suggestionButton = document.createElement('button');
    suggestionButton.className = 'suggestion-button';
    suggestionButton.textContent = suggestion;
    suggestionButton.style.backgroundColor = 'rgba(66, 153, 225, 0.1)';
    suggestionButton.style.color = 'var(--color-primary)';
    suggestionButton.style.border = '1px solid rgba(66, 153, 225, 0.3)';
    suggestionButton.style.borderRadius = '16px';
    suggestionButton.style.padding = '8px 12px';
    suggestionButton.style.fontSize = '14px';
    suggestionButton.style.cursor = 'pointer';
    suggestionButton.style.transition = 'all 0.2s ease';
    
    suggestionButton.addEventListener('mouseover', () => {
      suggestionButton.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
    });
    
    suggestionButton.addEventListener('mouseout', () => {
      suggestionButton.style.backgroundColor = 'rgba(66, 153, 225, 0.1)';
    });
    
    suggestionButton.addEventListener('click', () => {
      // Send the suggestion as a user message
      const userInput = inputField.value = suggestion;
      sendMessage();
    });
    
    suggestionsContainer.appendChild(suggestionButton);
  });
  
  chatContainer.appendChild(suggestionsContainer);
  
  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'chat-input-area';
  inputArea.style.padding = '16px';
  inputArea.style.borderTop = '1px solid #e2e8f0';
  inputArea.style.display = 'flex';
  inputArea.style.alignItems = 'center';
  inputArea.style.gap = '12px';
  
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.placeholder = 'Ask a question about your finances...';
  inputField.style.flex = '1';
  inputField.style.padding = '12px 16px';
  inputField.style.border = '1px solid #e2e8f0';
  inputField.style.borderRadius = '24px';
  inputField.style.fontSize = '16px';
  inputField.style.outline = 'none';
  
  // Handle input field focus
  inputField.addEventListener('focus', () => {
    inputField.style.border = '1px solid var(--color-primary)';
    inputField.style.boxShadow = '0 0 0 2px rgba(66, 153, 225, 0.2)';
  });
  
  inputField.addEventListener('blur', () => {
    inputField.style.border = '1px solid #e2e8f0';
    inputField.style.boxShadow = 'none';
  });
  
  // Handle enter key
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  const sendButton = document.createElement('button');
  sendButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  `;
  sendButton.style.backgroundColor = 'var(--color-primary)';
  sendButton.style.color = 'white';
  sendButton.style.border = 'none';
  sendButton.style.borderRadius = '50%';
  sendButton.style.width = '44px';
  sendButton.style.height = '44px';
  sendButton.style.display = 'flex';
  sendButton.style.alignItems = 'center';
  sendButton.style.justifyContent = 'center';
  sendButton.style.cursor = 'pointer';
  
  sendButton.addEventListener('click', sendMessage);
  
  inputArea.appendChild(inputField);
  inputArea.appendChild(sendButton);
  
  // Function to send a message
  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;
    
    // Clear input field
    inputField.value = '';
    
    // Add user message to chat
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.style.alignSelf = 'flex-end';
    userMessage.style.maxWidth = '80%';
    userMessage.style.padding = '12px 16px';
    userMessage.style.backgroundColor = 'var(--color-primary)';
    userMessage.style.color = 'white';
    userMessage.style.borderRadius = '12px 12px 0 12px';
    userMessage.style.marginTop = '12px';
    userMessage.textContent = message;
    
    chatContainer.appendChild(userMessage);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Remove old suggestions if they exist
    const oldSuggestions = chatContainer.querySelector('.suggestions-container');
    if (oldSuggestions) {
      chatContainer.removeChild(oldSuggestions);
    }
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.alignSelf = 'flex-start';
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.gap = '4px';
    loadingIndicator.style.padding = '12px 16px';
    loadingIndicator.style.backgroundColor = '#f0f4f8';
    loadingIndicator.style.borderRadius = '12px 12px 12px 0';
    loadingIndicator.style.margin = '4px 0';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.backgroundColor = '#a0aec0';
      dot.style.borderRadius = '50%';
      dot.style.animation = `bobble 1s infinite ${i * 0.2}s`;
      loadingIndicator.appendChild(dot);
    }
    
    // Add animation keyframes if not already in the document
    if (!document.getElementById('chat-animations')) {
      const style = document.createElement('style');
      style.id = 'chat-animations';
      style.textContent = `
        @keyframes bobble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    chatContainer.appendChild(loadingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    try {
      // Get user data
      const userData = await getUserData(userId);
      
      // Process the message and generate a response
      const response = await processUserMessage(message, userData);
      
      // Remove loading indicator
      chatContainer.removeChild(loadingIndicator);
      
      // Add bot response to chat
      const botMessage = document.createElement('div');
      botMessage.className = 'chat-message bot';
      botMessage.style.alignSelf = 'flex-start';
      botMessage.style.maxWidth = '80%';
      botMessage.style.padding = '12px 16px';
      botMessage.style.backgroundColor = '#f0f4f8';
      botMessage.style.color = '#333';
      botMessage.style.borderRadius = '12px 12px 12px 0';
      
      const botMessageContent = document.createElement('div');
      botMessageContent.textContent = response.text;
      
      botMessage.appendChild(botMessageContent);
      chatContainer.appendChild(botMessage);
      
      // Add new suggestions
      const newSuggestionsContainer = document.createElement('div');
      newSuggestionsContainer.className = 'suggestions-container';
      newSuggestionsContainer.style.display = 'flex';
      newSuggestionsContainer.style.flexWrap = 'wrap';
      newSuggestionsContainer.style.gap = '8px';
      newSuggestionsContainer.style.marginTop = '8px';
      
      response.suggestions.forEach(suggestion => {
        const suggestionButton = document.createElement('button');
        suggestionButton.className = 'suggestion-button';
        suggestionButton.textContent = suggestion;
        suggestionButton.style.backgroundColor = 'rgba(66, 153, 225, 0.1)';
        suggestionButton.style.color = 'var(--color-primary)';
        suggestionButton.style.border = '1px solid rgba(66, 153, 225, 0.3)';
        suggestionButton.style.borderRadius = '16px';
        suggestionButton.style.padding = '8px 12px';
        suggestionButton.style.fontSize = '14px';
        suggestionButton.style.cursor = 'pointer';
        
        suggestionButton.addEventListener('mouseover', () => {
          suggestionButton.style.backgroundColor = 'rgba(66, 153, 225, 0.2)';
        });
        
        suggestionButton.addEventListener('mouseout', () => {
          suggestionButton.style.backgroundColor = 'rgba(66, 153, 225, 0.1)';
        });
        
        suggestionButton.addEventListener('click', () => {
          inputField.value = suggestion;
          sendMessage();
        });
        
        newSuggestionsContainer.appendChild(suggestionButton);
      });
      
      chatContainer.appendChild(newSuggestionsContainer);
      
      // Record the conversation in the journey
      recordFinancialEvent(userId, {
        type: 'mentor_conversation',
        question: message,
        response: response.text,
        date: new Date().toISOString()
      });
      
      // Update journey view
      updateJourneyView(userId);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Remove loading indicator
      chatContainer.removeChild(loadingIndicator);
      
      // Add error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'chat-message bot';
      errorMessage.style.alignSelf = 'flex-start';
      errorMessage.style.maxWidth = '80%';
      errorMessage.style.padding = '12px 16px';
      errorMessage.style.backgroundColor = '#f8d7da';
      errorMessage.style.color = '#721c24';
      errorMessage.style.borderRadius = '12px 12px 12px 0';
      errorMessage.textContent = "I'm sorry, I'm having trouble right now. Let's try again in a moment.";
      
      chatContainer.appendChild(errorMessage);
    }
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  // Toggle between chat and journey views
  let showingJourney = false;
  
  toggleButton.addEventListener('click', () => {
    if (showingJourney) {
      // Switch to chat view
      journeyContainer.style.left = '100%';
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path><polyline points="10 2 10 22"></polyline></svg>
        View Journey
      `;
    } else {
      // Switch to journey view
      journeyContainer.style.left = '0';
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Return to Chat
      `;
      
      // Update journey view content
      updateJourneyView(userId);
    }
    
    showingJourney = !showingJourney;
  });
  
  // Function to update journey view content
  async function updateJourneyView(userId) {
    try {
      const journey = await getUserJourney(userId);
      
      // Clear current content
      journeyContainer.innerHTML = '';
      
      // Add journey content
      const journeyTitle = document.createElement('h2');
      journeyTitle.textContent = 'Your Financial Journey';
      journeyTitle.style.fontSize = '24px';
      journeyTitle.style.fontWeight = 'bold';
      journeyTitle.style.marginBottom = '20px';
      journeyTitle.style.textAlign = 'center';
      journeyTitle.style.color = 'var(--color-primary)';
      
      journeyContainer.appendChild(journeyTitle);
      
      // Chapter heading
      const chapterHeading = document.createElement('h3');
      chapterHeading.textContent = `Chapter ${journey.chapter}: ${journey.title || "Your Financial Story"}`;
      chapterHeading.style.fontSize = '18px';
      chapterHeading.style.fontWeight = '600';
      chapterHeading.style.marginBottom = '16px';
      chapterHeading.style.padding = '0 0 16px';
      chapterHeading.style.borderBottom = '1px solid #e2e8f0';
      
      journeyContainer.appendChild(chapterHeading);
      
      // Story content - convert markdown to HTML-like formatting
      const storyContent = document.createElement('div');
      storyContent.style.lineHeight = '1.6';
      storyContent.style.color = '#333';
      
      // Simple markdown parsing
      let storyHtml = journey.story
        .replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 10px;">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 16px 0 8px;">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 style="font-size: 18px; font-weight: bold; margin: 12px 0 6px;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      
      storyContent.innerHTML = storyHtml;
      journeyContainer.appendChild(storyContent);
      
      // Add a record financial event section
      const recordSection = document.createElement('div');
      recordSection.style.marginTop = '40px';
      recordSection.style.padding = '20px';
      recordSection.style.backgroundColor = '#f8f9fa';
      recordSection.style.borderRadius = '8px';
      
      const recordTitle = document.createElement('h3');
      recordTitle.textContent = 'Record a Financial Milestone';
      recordTitle.style.fontSize = '18px';
      recordTitle.style.fontWeight = 'bold';
      recordTitle.style.marginBottom = '16px';
      
      const recordDescription = document.createElement('p');
      recordDescription.textContent = 'Add a significant financial event to your journey:';
      recordDescription.style.marginBottom = '16px';
      
      const eventTypeContainer = document.createElement('div');
      eventTypeContainer.style.marginBottom = '16px';
      
      const eventTypeLabel = document.createElement('label');
      eventTypeLabel.textContent = 'Event Type:';
      eventTypeLabel.style.display = 'block';
      eventTypeLabel.style.marginBottom = '8px';
      eventTypeLabel.style.fontWeight = '600';
      
      const eventTypeSelect = document.createElement('select');
      eventTypeSelect.style.width = '100%';
      eventTypeSelect.style.padding = '10px';
      eventTypeSelect.style.borderRadius = '4px';
      eventTypeSelect.style.border = '1px solid #e2e8f0';
      
      const eventTypes = [
        { value: 'income', label: 'Income Received' },
        { value: 'savings', label: 'Money Saved' },
        { value: 'investment', label: 'Investment Made' },
        { value: 'debt_payment', label: 'Debt Payment' },
        { value: 'goal_progress', label: 'Goal Progress' },
        { value: 'subscription_cancelled', label: 'Subscription Cancelled' }
      ];
      
      eventTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        eventTypeSelect.appendChild(option);
      });
      
      eventTypeContainer.appendChild(eventTypeLabel);
      eventTypeContainer.appendChild(eventTypeSelect);
      
      const amountContainer = document.createElement('div');
      amountContainer.style.marginBottom = '16px';
      
      const amountLabel = document.createElement('label');
      amountLabel.textContent = 'Amount ($):';
      amountLabel.style.display = 'block';
      amountLabel.style.marginBottom = '8px';
      amountLabel.style.fontWeight = '600';
      
      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.min = '0';
      amountInput.step = '0.01';
      amountInput.style.width = '100%';
      amountInput.style.padding = '10px';
      amountInput.style.borderRadius = '4px';
      amountInput.style.border = '1px solid #e2e8f0';
      
      amountContainer.appendChild(amountLabel);
      amountContainer.appendChild(amountInput);
      
      const descriptionContainer = document.createElement('div');
      descriptionContainer.style.marginBottom = '16px';
      
      const descriptionLabel = document.createElement('label');
      descriptionLabel.textContent = 'Description:';
      descriptionLabel.style.display = 'block';
      descriptionLabel.style.marginBottom = '8px';
      descriptionLabel.style.fontWeight = '600';
      
      const descriptionInput = document.createElement('input');
      descriptionInput.type = 'text';
      descriptionInput.style.width = '100%';
      descriptionInput.style.padding = '10px';
      descriptionInput.style.borderRadius = '4px';
      descriptionInput.style.border = '1px solid #e2e8f0';
      
      descriptionContainer.appendChild(descriptionLabel);
      descriptionContainer.appendChild(descriptionInput);
      
      const submitButton = document.createElement('button');
      submitButton.textContent = 'Record Event';
      submitButton.style.backgroundColor = 'var(--color-primary)';
      submitButton.style.color = 'white';
      submitButton.style.border = 'none';
      submitButton.style.borderRadius = '4px';
      submitButton.style.padding = '10px 16px';
      submitButton.style.fontWeight = 'bold';
      submitButton.style.cursor = 'pointer';
      
      submitButton.addEventListener('click', async () => {
        const eventType = eventTypeSelect.value;
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        
        if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid amount.');
          return;
        }
        
        // Create the event object based on type
        let event = {
          type: eventType,
          amount,
          description,
          date: new Date().toISOString()
        };
        
        // Add specific fields based on event type
        if (eventType === 'goal_progress') {
          event.goalName = description || 'Financial Goal';
          event.currentAmount = amount;
          event.targetAmount = amount * 2; // Simple default
        } else if (eventType === 'subscription_cancelled') {
          event.name = description || 'Subscription';
        }
        
        // Record the event
        await recordFinancialEvent(userId, event);
        
        // Clear form
        amountInput.value = '';
        descriptionInput.value = '';
        
        // Update the journey view
        updateJourneyView(userId);
        
        // Show success message
        alert('Event recorded successfully!');
      });
      
      recordSection.appendChild(recordTitle);
      recordSection.appendChild(recordDescription);
      recordSection.appendChild(eventTypeContainer);
      recordSection.appendChild(amountContainer);
      recordSection.appendChild(descriptionContainer);
      recordSection.appendChild(submitButton);
      
      journeyContainer.appendChild(recordSection);
      
    } catch (error) {
      console.error('Error updating journey view:', error);
      
      // Show error message
      journeyContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <h3 style="color: #e53e3e; margin-bottom: 10px;">Error Loading Journey</h3>
          <p>We're having trouble loading your financial journey. Please try again later.</p>
        </div>
      `;
    }
  }
  
  // Assemble all components
  container.appendChild(header);
  container.appendChild(contentContainer);
  container.appendChild(inputArea);
  
  return container;
}

/**
 * Render the Money Mentor page
 * @param {number} userId - User ID
 * @returns {HTMLElement} - Rendered page
 */
export function renderMoneyMentorPage(userId) {
  // Create page container
  const container = document.createElement('div');
  container.className = 'money-mentor-page';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  
  // Page header
  const header = document.createElement('div');
  header.style.padding = '24px';
  
  const title = document.createElement('h1');
  title.textContent = 'Money Mentor & Financial Journey';
  title.style.fontSize = '28px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '12px';
  title.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)';
  title.style.WebkitBackgroundClip = 'text';
  title.style.WebkitTextFillColor = 'transparent';
  
  const description = document.createElement('p');
  description.textContent = 'Get personalized financial guidance and track your progress through an interactive financial journey.';
  description.style.fontSize = '16px';
  description.style.color = 'var(--color-text-secondary)';
  description.style.maxWidth = '800px';
  
  header.appendChild(title);
  header.appendChild(description);
  
  // Chatbot container (takes remaining height)
  const chatContainer = document.createElement('div');
  chatContainer.style.flex = '1';
  chatContainer.style.padding = '0 24px 24px';
  chatContainer.style.overflow = 'hidden';
  
  // Render the chat interface
  const chatInterface = renderMoneyMentorChat(userId);
  chatContainer.appendChild(chatInterface);
  
  // Assemble the page
  container.appendChild(header);
  container.appendChild(chatContainer);
  
  return container;
}