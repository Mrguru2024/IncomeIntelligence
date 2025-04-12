/**
 * Money Mentor - AI-powered financial advice component for Stackr Finance
 * This module provides AI-assisted financial advice and insights
 */

import { appState } from './src/main.js';

// Sample financial advice data to simulate AI responses
const financialAdviceDatabase = [
  {
    category: 'budgeting',
    title: 'Optimize your 40/30/30 split',
    advice: `Based on your current income and expenses, your 40/30/30 split is working well, but there's room for optimization. Your "needs" category is currently at 35% of your income, which is below the 40% recommendation - that's good! Consider directing some of those savings to your investments category, which is slightly under target at 25%.`,
    action: 'Try increasing your investments allocation by 5% this month to reach the recommended 30%.',
    priority: 'high'
  },
  {
    category: 'savings',
    title: 'Emergency fund status',
    advice: `Your emergency fund is currently at $2,500, which covers approximately 1.5 months of your essential expenses. Financial experts typically recommend having 3-6 months of essential expenses saved.`,
    action: 'Consider directing an additional $100-$200 per month to your emergency fund until you reach at least the 3-month mark.',
    priority: 'medium'
  },
  {
    category: 'debt',
    title: 'High-interest debt detection',
    advice: `I've noticed you have a credit card balance with an interest rate of 19.99%. This high-interest debt is costing you approximately $30 per month in interest.`,
    action: 'Prioritize paying off this credit card balance before focusing on lower-interest debts or additional investments.',
    priority: 'high'
  },
  {
    category: 'investments',
    title: 'Investment diversity',
    advice: `Your current investment portfolio is primarily in individual stocks (85%), with limited exposure to other asset classes. This creates higher volatility and potential risk.`,
    action: 'Consider diversifying by adding some index funds or ETFs to your portfolio to reduce overall risk while maintaining growth potential.',
    priority: 'medium'
  },
  {
    category: 'income',
    title: 'Income growth opportunities',
    advice: `Your income has remained stable over the past 6 months. While consistency is good, there may be opportunities to increase your earning potential.`,
    action: 'Explore additional income streams like freelance work, or investigate skill development that could lead to a promotion or higher-paying position.',
    priority: 'low'
  },
  {
    category: 'spending',
    title: 'Subscription optimization',
    advice: `You're currently spending $65 monthly on various subscription services. Some of these appear to have minimal usage patterns.`,
    action: 'Review your subscription services and consider canceling or pausing those you use less than once per month to save approximately $25 monthly.',
    priority: 'medium'
  }
];

// Generates a personalized financial tip
function generateFinancialTip() {
  // In a real implementation, this would use actual user data to generate personalized tips
  const tipIndex = Math.floor(Math.random() * financialAdviceDatabase.length);
  return financialAdviceDatabase[tipIndex];
}

// Generate financial insights based on user data
function generateFinancialInsights() {
  // This would normally analyze the user's real financial data
  // For now, we'll return a sample response
  return [
    {
      title: 'Spending Analysis',
      insight: 'Your dining out expenses have increased by 15% this month compared to your three-month average.',
      recommendation: 'Consider setting a specific budget for dining out to help manage this expense category.'
    },
    {
      title: 'Savings Opportunity',
      insight: 'You currently have $2,500 in your checking account, which exceeds your monthly expenses by $1,200.',
      recommendation: 'Consider moving $1,000 to your savings account or investment account to earn better returns.'
    },
    {
      title: 'Income Utilization',
      insight: 'You\'re saving approximately 22% of your income, which is above the average of 15%.',
      recommendation: 'You\'re on a good track! Consider setting specific savings goals to stay motivated.'
    }
  ];
}

// Function to simulate AI response with a delay
function simulateAIResponse(query) {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Simple keyword-based response system
      const keywords = {
        'budget': 'To improve your budget, start by tracking all expenses for a month to understand your spending patterns. Then create categories aligned with the 40/30/30 rule and set spending limits for each.',
        'save': 'To save more effectively, automate your savings by setting up automatic transfers to your savings account on paydays. Consider the 50/30/20 rule as an alternative to 40/30/30 if you need to emphasize savings.',
        'invest': 'For beginning investors, consider starting with low-cost index funds that provide broad market exposure. Aim to invest consistently through dollar-cost averaging rather than trying to time the market.',
        'debt': 'To tackle debt efficiently, use either the avalanche method (paying highest interest debt first) or the snowball method (paying smallest debts first). The avalanche method saves more money, while the snowball method provides psychological wins.',
        'income': 'To increase your income, consider developing high-demand skills, negotiating a raise, starting a side hustle, or freelancing in your area of expertise.',
        'credit': 'To improve your credit score, ensure you pay all bills on time, reduce credit card balances, avoid opening too many new accounts, and regularly check your credit report for errors.',
        'retirement': 'For retirement planning, aim to save at least 15% of your income, take full advantage of employer matching in retirement plans, diversify your investments, and adjust your strategy as you get closer to retirement age.',
        'house': 'When saving for a house, aim for a 20% down payment to avoid PMI, keep housing costs below 28% of your income, and establish an emergency fund separate from your down payment savings.',
        'car': 'For car purchases, consider the 20/4/10 rule: 20% down payment, 4-year loan term, and transportation costs under 10% of your income. Used cars often provide better financial value than new ones.'
      };
      
      // Default response if no keywords match
      let response = 'I can provide advice on budgeting, saving, investing, debt management, income growth, credit improvement, retirement planning, and major purchases like homes or cars. What specific financial question do you have?';
      
      // Check for keyword matches
      const lowerQuery = query.toLowerCase();
      for (const [keyword, advice] of Object.entries(keywords)) {
        if (lowerQuery.includes(keyword)) {
          response = advice;
          break;
        }
      }
      
      resolve({
        query,
        response,
        timestamp: new Date().toISOString()
      });
    }, 1500); // 1.5 second delay to simulate AI processing
  });
}

// Function to calculate a financial health score
function calculateFinancialHealthScore() {
  // In a real implementation, this would analyze various financial metrics
  // For now, return a sample score with explanations
  
  // Mock budget data based on app state
  const income = appState.income?.monthly || 4500;
  const expenses = {
    needs: appState.expenses?.monthly?.needs || 1600,
    investments: appState.expenses?.monthly?.investments || 900,
    savings: appState.expenses?.monthly?.savings || 1200
  };
  
  // Calculate metrics
  const savingsRate = ((income - expenses.needs - expenses.investments - expenses.savings) / income) * 100;
  const debtToIncomeRatio = 0.25; // Mock ratio
  const emergencyFundRatio = 3.2; // Mock months of expenses covered
  
  // Calculate subscores
  const savingsScore = Math.min(100, savingsRate * 5); // 20% savings = 100 score
  const debtScore = Math.max(0, 100 - (debtToIncomeRatio * 200)); // 0.5 ratio = 0 score
  const emergencyScore = Math.min(100, emergencyFundRatio * 20); // 5 months = 100 score
  const budgetScore = Math.min(100, 100 - Math.abs(expenses.needs / income * 100 - 40) * 2.5); // How close to 40% for needs
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round((savingsScore * 0.3) + (debtScore * 0.25) + (emergencyScore * 0.25) + (budgetScore * 0.2));
  
  // Interpret the score
  let scoreCategory;
  let recommendations = [];
  
  if (overallScore >= 90) {
    scoreCategory = 'Excellent';
    recommendations = [
      'Consider increasing your investment allocation for potentially higher returns',
      'Explore tax optimization strategies',
      'Review your insurance coverage to ensure it still meets your needs'
    ];
  } else if (overallScore >= 70) {
    scoreCategory = 'Good';
    recommendations = [
      'Continue building your emergency fund to reach 6 months of expenses',
      'Focus on increasing retirement contributions',
      'Look for opportunities to reduce high-interest debt'
    ];
  } else if (overallScore >= 50) {
    scoreCategory = 'Average';
    recommendations = [
      'Prioritize building an emergency fund',
      'Focus on reducing high-interest debt',
      'Try to increase your savings rate by 1-2% every few months'
    ];
  } else {
    scoreCategory = 'Needs Attention';
    recommendations = [
      'Create a detailed budget and track all expenses',
      'Focus on reducing non-essential spending',
      'Consider consolidating high-interest debt',
      'Build a starter emergency fund of $1,000'
    ];
  }
  
  return {
    score: overallScore,
    category: scoreCategory,
    components: [
      { name: 'Savings Rate', score: savingsScore, weight: '30%' },
      { name: 'Debt Management', score: debtScore, weight: '25%' },
      { name: 'Emergency Fund', score: emergencyScore, weight: '25%' },
      { name: 'Budget Alignment', score: budgetScore, weight: '20%' }
    ],
    recommendations
  };
}

// Render the Money Mentor page
export function renderMoneyMentorPage() {
  // Main container
  const mentorContainer = document.createElement('div');
  mentorContainer.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
  
  // Generate financial insights
  const financialInsights = generateFinancialInsights();
  const financialTip = generateFinancialTip();
  const healthScore = calculateFinancialHealthScore();
  
  // Header section
  const header = document.createElement('header');
  header.className = 'mb-6';
  header.innerHTML = `
    <div class="text-center p-8 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
      <h1 class="text-3xl font-bold mb-2">Money Mentor</h1>
      <p class="text-lg mb-4">Your AI-powered financial advisor</p>
      <p class="text-gray-600">Get personalized insights, advice, and recommendations based on your financial data.</p>
    </div>
  `;
  mentorContainer.appendChild(header);
  
  // Financial health score section
  const scoreSection = document.createElement('section');
  scoreSection.className = 'financial-health-section mb-8';
  scoreSection.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-xl font-semibold mb-4">Your Financial Health Score</h2>
      
      <div class="flex flex-col md:flex-row items-center mb-6">
        <div class="score-display bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-full w-32 h-32 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
          <div class="text-center">
            <div class="text-3xl font-bold ${
              healthScore.score >= 90 ? 'text-green-600' : 
              healthScore.score >= 70 ? 'text-emerald-600' : 
              healthScore.score >= 50 ? 'text-yellow-600' : 
              'text-red-600'
            }">${healthScore.score}</div>
            <div class="text-sm text-gray-600">${healthScore.category}</div>
          </div>
        </div>
        
        <div class="score-explanation flex-1">
          <p class="mb-3">Your financial health score measures your overall financial stability and preparedness across multiple dimensions.</p>
          
          <div class="score-components">
            ${healthScore.components.map(component => `
              <div class="mb-2">
                <div class="flex justify-between items-center text-sm mb-1">
                  <div>${component.name}</div>
                  <div class="text-gray-600">${component.score}/100 (${component.weight})</div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full ${
                    component.score >= 90 ? 'bg-green-600' : 
                    component.score >= 70 ? 'bg-emerald-600' : 
                    component.score >= 50 ? 'bg-yellow-600' : 
                    'bg-red-600'
                  }" style="width: ${component.score}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="recommendations p-4 bg-blue-50 rounded-lg">
        <h3 class="font-medium mb-2">Recommendations to Improve Your Score</h3>
        <ul class="list-disc list-inside text-sm space-y-1">
          ${healthScore.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  mentorContainer.appendChild(scoreSection);
  
  // Financial insights section
  const insightsSection = document.createElement('section');
  insightsSection.className = 'insights-section mb-8 grid grid-cols-1 md:grid-cols-2 gap-6';
  
  // AI Tip of the Day card
  const tipCard = document.createElement('div');
  tipCard.className = 'bg-white p-6 rounded-lg shadow-sm';
  tipCard.innerHTML = `
    <div class="flex items-start mb-4">
      <div class="bg-primary/10 p-2 rounded-full mr-3">
        <span class="text-xl">💡</span>
      </div>
      <div>
        <h2 class="text-xl font-semibold">AI Tip of the Day</h2>
        <div class="text-sm text-gray-600">Personalized for your financial situation</div>
      </div>
    </div>
    
    <div class="tip-content mb-3">
      <h3 class="font-medium text-lg mb-2">${financialTip.title}</h3>
      <p class="mb-4">${financialTip.advice}</p>
      
      <div class="action-item p-3 bg-primary/10 rounded-lg">
        <div class="font-medium mb-1">Recommended Action:</div>
        <div>${financialTip.action}</div>
      </div>
    </div>
    
    <div class="flex justify-between items-center">
      <div class="priority-badge px-3 py-1 rounded-full text-xs ${
        financialTip.priority === 'high' ? 'bg-red-100 text-red-800' : 
        financialTip.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-blue-100 text-blue-800'
      }">
        ${financialTip.priority.charAt(0).toUpperCase() + financialTip.priority.slice(1)} Priority
      </div>
      
      <button class="text-primary text-sm hover:underline">Get New Tip</button>
    </div>
  `;
  
  // Financial Insights card
  const insightsCard = document.createElement('div');
  insightsCard.className = 'bg-white p-6 rounded-lg shadow-sm';
  insightsCard.innerHTML = `
    <div class="flex items-start mb-4">
      <div class="bg-accent/10 p-2 rounded-full mr-3">
        <span class="text-xl">📊</span>
      </div>
      <div>
        <h2 class="text-xl font-semibold">Financial Insights</h2>
        <div class="text-sm text-gray-600">Analysis of your recent activity</div>
      </div>
    </div>
    
    <div class="insights-list space-y-4">
      ${financialInsights.map(insight => `
        <div class="insight-item p-4 border border-gray-100 rounded-lg">
          <h3 class="font-medium mb-2">${insight.title}</h3>
          <p class="text-sm mb-2">${insight.insight}</p>
          <p class="text-sm text-primary">${insight.recommendation}</p>
        </div>
      `).join('')}
    </div>
  `;
  
  insightsSection.appendChild(tipCard);
  insightsSection.appendChild(insightsCard);
  mentorContainer.appendChild(insightsSection);
  
  // AI chat section
  const chatSection = document.createElement('section');
  chatSection.className = 'chat-section mb-8';
  chatSection.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="flex items-start mb-4">
        <div class="bg-secondary/10 p-2 rounded-full mr-3">
          <span class="text-xl">🤖</span>
        </div>
        <div>
          <h2 class="text-xl font-semibold">Ask Money Mentor</h2>
          <div class="text-sm text-gray-600">Get personalized financial advice</div>
        </div>
      </div>
      
      <div id="chat-messages" class="chat-messages bg-gray-50 p-4 rounded-lg mb-4 h-64 overflow-y-auto">
        <div class="message ai-message mb-4">
          <div class="message-content bg-primary/10 p-3 rounded-lg inline-block max-w-[80%]">
            <p>Hello! I'm Money Mentor, your AI financial advisor. How can I help you with your finances today?</p>
          </div>
          <div class="message-time text-xs text-gray-500 mt-1">Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      
      <div class="chat-input flex">
        <input type="text" id="chat-input" placeholder="Ask a financial question..." 
               class="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        <button id="send-chat" class="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark">
          Send
        </button>
      </div>
      
      <div class="suggested-questions mt-4">
        <div class="text-sm text-gray-600 mb-2">Suggested questions:</div>
        <div class="flex flex-wrap gap-2">
          <button class="suggested-question px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">How can I improve my budget?</button>
          <button class="suggested-question px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">Tips for investing with limited funds?</button>
          <button class="suggested-question px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full">How to reduce my debt?</button>
        </div>
      </div>
    </div>
  `;
  mentorContainer.appendChild(chatSection);
  
  // Goal planning section
  const goalSection = document.createElement('section');
  goalSection.className = 'goal-section';
  goalSection.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-xl font-semibold mb-4">Financial Goal Planning</h2>
      
      <div class="current-goals mb-6">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-medium">Your Current Goals</h3>
          <button id="add-goal-btn" class="text-sm text-primary hover:underline">+ Add New Goal</button>
        </div>
        
        <div class="goals-list space-y-4">
          <div class="goal-item p-4 border border-gray-100 rounded-lg">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-medium">Emergency Fund</h4>
                <div class="text-sm text-gray-600">Savings goal</div>
              </div>
              <div class="text-right">
                <div class="font-medium">$6,500 / $10,000</div>
                <div class="text-sm text-gray-600">65% complete</div>
              </div>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div class="bg-primary h-2 rounded-full" style="width: 65%"></div>
            </div>
            
            <div class="flex justify-between text-sm">
              <div class="text-gray-600">Started: Jan 10, 2025</div>
              <div class="text-gray-600">Target: Aug 15, 2025</div>
            </div>
          </div>
          
          <div class="goal-item p-4 border border-gray-100 rounded-lg">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-medium">New Laptop</h4>
                <div class="text-sm text-gray-600">Purchase goal</div>
              </div>
              <div class="text-right">
                <div class="font-medium">$800 / $2,000</div>
                <div class="text-sm text-gray-600">40% complete</div>
              </div>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div class="bg-secondary h-2 rounded-full" style="width: 40%"></div>
            </div>
            
            <div class="flex justify-between text-sm">
              <div class="text-gray-600">Started: Feb 15, 2025</div>
              <div class="text-gray-600">Target: Jun 30, 2025</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="goal-achievement p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
        <h3 class="font-medium mb-2">AI Goal Advice</h3>
        <p class="text-sm">Based on your current saving rate of $350/month toward your emergency fund, you're on track to reach your goal by August 15, 2025. To reach it one month earlier, consider increasing your monthly contribution by $60.</p>
      </div>
    </div>
  `;
  mentorContainer.appendChild(goalSection);
  
  // Add event listeners after the container is added to the DOM
  setTimeout(() => {
    // Chat functionality
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');
    
    // Function to add a message to the chat
    function addChatMessage(text, isUser = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'} mb-4`;
      
      const alignClass = isUser ? 'text-right' : '';
      const bgColorClass = isUser ? 'bg-accent/10' : 'bg-primary/10';
      const alignSide = isUser ? 'ml-auto' : '';
      
      messageDiv.innerHTML = `
        <div class="${alignClass}">
          <div class="message-content ${bgColorClass} p-3 rounded-lg inline-block max-w-[80%] ${alignSide}">
            <p>${text}</p>
          </div>
          <div class="message-time text-xs text-gray-500 mt-1">
            ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      `;
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to handle user sending a message
    async function handleSendMessage() {
      const messageText = chatInput.value.trim();
      if (!messageText) return;
      
      // Add user message to chat
      addChatMessage(messageText, true);
      
      // Clear input
      chatInput.value = '';
      
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator message ai-message mb-4';
      typingIndicator.innerHTML = `
        <div class="message-content bg-primary/10 p-3 rounded-lg inline-block">
          <div class="flex space-x-2">
            <div class="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
            <div class="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
          </div>
        </div>
      `;
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Get AI response (with simulated delay)
      try {
        const aiResponse = await simulateAIResponse(messageText);
        
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        // Add AI response
        addChatMessage(aiResponse.response);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        // Add error message
        addChatMessage('Sorry, I encountered a problem generating a response. Please try again.');
      }
    }
    
    // Send button click event
    if (sendButton) {
      sendButton.addEventListener('click', handleSendMessage);
    }
    
    // Input enter key press event
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      });
    }
    
    // Suggested questions click events
    const suggestedQuestions = document.querySelectorAll('.suggested-question');
    suggestedQuestions.forEach(button => {
      button.addEventListener('click', () => {
        if (chatInput) {
          chatInput.value = button.textContent;
          handleSendMessage();
        }
      });
    });
    
    // "Get New Tip" button click event
    const newTipButton = tipCard.querySelector('button');
    if (newTipButton) {
      newTipButton.addEventListener('click', () => {
        const newTip = generateFinancialTip();
        
        // Update the tip content
        const titleElement = tipCard.querySelector('h3');
        const adviceElement = tipCard.querySelector('p');
        const actionElement = tipCard.querySelector('.action-item div:last-child');
        const priorityElement = tipCard.querySelector('.priority-badge');
        
        if (titleElement) titleElement.textContent = newTip.title;
        if (adviceElement) adviceElement.textContent = newTip.advice;
        if (actionElement) actionElement.textContent = newTip.action;
        
        if (priorityElement) {
          // Update priority badge class
          priorityElement.className = `priority-badge px-3 py-1 rounded-full text-xs ${
            newTip.priority === 'high' ? 'bg-red-100 text-red-800' : 
            newTip.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-blue-100 text-blue-800'
          }`;
          
          // Update priority text
          priorityElement.textContent = `${newTip.priority.charAt(0).toUpperCase() + newTip.priority.slice(1)} Priority`;
        }
      });
    }
    
    // Add goal button (placeholder functionality)
    const addGoalButton = document.getElementById('add-goal-btn');
    if (addGoalButton) {
      addGoalButton.addEventListener('click', () => {
        alert('Goal creation functionality will be available in a future update!');
      });
    }
  }, 100);
  
  return mentorContainer;
}