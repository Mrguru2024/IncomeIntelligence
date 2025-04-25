/**
 * Stackr User Context Module
 * Provides personalized AI reflections, motivations, and behavior tracking
 */

// Import necessary services
import { createToast } from './components/toast.js';
import { 
  generateMotivationMessage, 
  generateFinancialReflection, 
  generateBehaviorSummary, 
  generateTeamMemberEncouragement 
} from './openai-helper.js';

// User context data (localStorage based for GREEN version)
class UserContextStore {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.context = null;
  }

  // Initialize with user ID
  init(userId) {
    if (this.initialized && this.userId === userId) return;
    
    this.userId = userId;
    this.loadFromStorage();
    this.initialized = true;
  }

  // Load user context from localStorage
  loadFromStorage() {
    try {
      const storedContext = localStorage.getItem(`stackr-user-context-${this.userId}`);
      this.context = storedContext ? JSON.parse(storedContext) : this.getDefaultContext();
    } catch (error) {
      console.error('Error loading user context:', error);
      this.context = this.getDefaultContext();
    }
    return this.context;
  }

  // Save user context to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(`stackr-user-context-${this.userId}`, JSON.stringify(this.context));
    } catch (error) {
      console.error('Error saving user context:', error);
    }
  }

  // Default context structure
  getDefaultContext() {
    return {
      goals: ['Save for emergency fund', 'Reduce debt'],
      painPoints: ['Inconsistent income', 'Unexpected expenses'],
      interactionHistory: [],
      lastMotivationDate: null,
      lastReflectionDate: null,
      behaviorSummaries: []
    };
  }

  // Get user context
  getContext() {
    return {...this.context};
  }

  // Update goals
  updateGoals(goals) {
    this.context.goals = goals;
    this.saveToStorage();
  }

  // Update pain points
  updatePainPoints(painPoints) {
    this.context.painPoints = painPoints;
    this.saveToStorage();
  }

  // Track user interaction
  trackInteraction(type, detail) {
    const interaction = {
      type,
      detail,
      timestamp: new Date().toISOString()
    };
    
    // Keep only the last 50 interactions
    this.context.interactionHistory = 
      [interaction, ...this.context.interactionHistory].slice(0, 50);
    
    this.saveToStorage();
  }

  // Generate AI prompts based on user context
  generateReflectionPrompt() {
    const ctx = this.context;
    // Get recent interactions, limited to last 10
    const recentActivity = ctx.interactionHistory
      .slice(0, 10)
      .map(i => `${i.type}: ${i.detail}`)
      .join(', ');
    
    return `
You're an empathetic financial assistant.
User goals: ${ctx.goals.join(", ")}.
Struggles: ${ctx.painPoints.join(", ")}.
Recent activity: ${recentActivity || "none"}.
Give one clear suggestion for this week + 1 small win.
Keep your response under 150 words, be encouraging but honest.
`;
  }

  generateMotivationPrompt() {
    const ctx = this.context;
    
    return `
You're a motivational financial coach. 
Based on this user's goals (${ctx.goals.join(", ")}) and struggles (${ctx.painPoints.join(", ")}),
give them one sentence of motivational advice for today.
Be specific, actionable, and uplifting. Keep it under 150 characters.
`;
  }

  generateBehaviorSummaryPrompt(monthData) {
    return `
Summarize this month's financial behavior:
${monthData}
Give 1 insight, 1 concern, 1 win.
Keep the entire response under 150 words.
`;
  }

  // Save a monthly behavior summary
  saveBehaviorSummary(month, topCategory, overspendCategory, summary) {
    const behaviorSummary = {
      month,
      topCategory,
      overspendCategory,
      summary,
      createdAt: new Date().toISOString()
    };
    
    this.context.behaviorSummaries.unshift(behaviorSummary);
    
    // Keep only the last 12 months
    if (this.context.behaviorSummaries.length > 12) {
      this.context.behaviorSummaries = this.context.behaviorSummaries.slice(0, 12);
    }
    
    this.saveToStorage();
    return behaviorSummary;
  }

  // Get recent behavior summaries
  getBehaviorSummaries(limit = 3) {
    return this.context.behaviorSummaries.slice(0, limit);
  }

  // Update last motivation date
  updateMotivationDate() {
    this.context.lastMotivationDate = new Date().toISOString();
    this.saveToStorage();
  }

  // Update last reflection date
  updateReflectionDate() {
    this.context.lastReflectionDate = new Date().toISOString();
    this.saveToStorage();
  }

  // Check if enough time has passed since last motivation message
  shouldShowMotivation() {
    if (!this.context.lastMotivationDate) return true;
    
    const lastDate = new Date(this.context.lastMotivationDate);
    const currentDate = new Date();
    
    // Show once per day (24 hours)
    return (currentDate - lastDate) > (24 * 60 * 60 * 1000);
  }

  // Check if enough time has passed since last reflection
  shouldShowReflection() {
    if (!this.context.lastReflectionDate) return true;
    
    const lastDate = new Date(this.context.lastReflectionDate);
    const currentDate = new Date();
    
    // Show once per week (7 days)
    return (currentDate - lastDate) > (7 * 24 * 60 * 60 * 1000);
  }
}

// Create global store instance
const userContextStore = new UserContextStore();

/**
 * Initialize the module with user ID
 * @param {string} userId - User ID
 */
export function initUserContext(userId) {
  userContextStore.init(userId);
}

/**
 * Track user interaction
 * @param {string} type - Interaction type (e.g., 'page_view', 'click')
 * @param {string} detail - Interaction detail (e.g., 'dashboard', 'income_chart')
 */
export function trackUserAction(type, detail) {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return;
  }
  
  userContextStore.trackInteraction(type, detail);
}

/**
 * Get user's daily motivation message
 * Uses OpenAI to generate personalized motivation
 * @returns {Promise<string>} - Motivation message
 */
export async function getDailyMotivation() {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return 'Keep pushing forward on your financial journey!';
  }
  
  // Check if we should show motivation (once per day)
  if (!userContextStore.shouldShowMotivation()) {
    // Return the cached message or a fallback
    return 'Keep pushing forward on your financial journey!';
  }
  
  try {
    // Generate AI prompt
    const prompt = userContextStore.generateMotivationPrompt();
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }
    
    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || 'Your daily actions build toward financial freedom.';
    
    // Update the last motivation date
    userContextStore.updateMotivationDate();
    
    return message;
  } catch (error) {
    console.error('Error getting daily motivation:', error);
    return 'Your consistent efforts today create financial freedom tomorrow.';
  }
}

/**
 * Get user's weekly financial reflection
 * Uses OpenAI to generate personalized advice
 * @returns {Promise<Object>} - Reflection data
 */
export async function getWeeklyReflection() {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return {
      struggles: ['Not enough data yet'],
      wins: ['Starting your financial journey'],
      advice: 'Keep using Stackr to get personalized reflections.'
    };
  }
  
  // Check if we should show reflection (once per week)
  if (!userContextStore.shouldShowReflection()) {
    // Return basic response
    const ctx = userContextStore.getContext();
    return {
      struggles: ctx.painPoints,
      wins: ['Consistent tracking', 'Setting clear goals'],
      advice: 'Continue building your financial habits with Stackr.'
    };
  }
  
  try {
    // Generate AI prompt
    const prompt = userContextStore.generateReflectionPrompt();
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }
    
    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || 'Keep tracking your expenses and setting realistic goals.';
    
    // Update the last reflection date
    userContextStore.updateReflectionDate();
    
    const ctx = userContextStore.getContext();
    return {
      struggles: ctx.painPoints,
      wins: ['Consistent tracking', 'Setting clear goals'],
      advice
    };
  } catch (error) {
    console.error('Error getting weekly reflection:', error);
    const ctx = userContextStore.getContext();
    return {
      struggles: ctx.painPoints,
      wins: ['Tracking finances', 'Setting goals'],
      advice: 'Continue to track and reflect on your spending patterns.'
    };
  }
}

/**
 * Generate and save monthly behavior summary
 * @param {string} month - Month identifier (e.g., '2025-04')
 * @param {string} monthData - Text description of monthly data
 * @returns {Promise<Object>} - Generated summary
 */
export async function generateMonthlySummary(month, monthData) {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return null;
  }
  
  try {
    // Extract top and overspend categories from data
    // This is a simple simulation for GREEN version
    const topCategory = monthData.includes('top:') 
      ? monthData.split('top:')[1].split(',')[0].trim()
      : 'uncategorized';
      
    const overspendCategory = monthData.includes('overspend:')
      ? monthData.split('overspend:')[1].split(',')[0].trim()
      : null;
    
    // Generate AI prompt
    const prompt = userContextStore.generateBehaviorSummaryPrompt(monthData);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }
    
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || 'Monthly summary not available.';
    
    // Save the behavior summary
    return userContextStore.saveBehaviorSummary(month, topCategory, overspendCategory, summary);
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    return null;
  }
}

/**
 * Get recent behavior summaries
 * @param {number} limit - Number of summaries to return
 * @returns {Array} - Recent behavior summaries
 */
export function getBehaviorSummaries(limit = 3) {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return [];
  }
  
  return userContextStore.getBehaviorSummaries(limit);
}

/**
 * Update user goals
 * @param {Array} goals - List of financial goals
 */
export function updateUserGoals(goals) {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return;
  }
  
  userContextStore.updateGoals(goals);
}

/**
 * Update user pain points
 * @param {Array} painPoints - List of financial pain points
 */
export function updateUserPainPoints(painPoints) {
  if (!userContextStore.initialized) {
    console.error('User context not initialized');
    return;
  }
  
  userContextStore.updatePainPoints(painPoints);
}

/**
 * Generate multi-user summary for teams or families
 * @param {Array} users - List of users in the team/family
 * @returns {Promise<Array>} - List of user summaries
 */
export async function getTeamSummary(users) {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return [];
  }
  
  try {
    const summaries = await Promise.all(users.map(async user => {
      // Generate a basic prompt for each user
      const prompt = `
${user.name} is working towards these financial goals: ${user.goals.join(', ')}.
Their struggles are: ${user.painPoints.join(', ')}.
Write one sentence of financial encouragement that's specific to their situation.
Keep it under 150 characters.
`;
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 100
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || 'Keep up the good work!';
      
      return { 
        user: user.name, 
        summary 
      };
    }));
    
    return summaries;
  } catch (error) {
    console.error('Error generating team summary:', error);
    
    // Return basic fallback summaries
    return users.map(user => ({
      user: user.name,
      summary: 'Keep working toward your financial goals!'
    }));
  }
}

/**
 * Render the Daily Motivation component
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement} - Rendered component
 */
export async function renderDailyMotivation(container) {
  const motivationEl = document.createElement('div');
  motivationEl.id = 'daily-motivation';
  motivationEl.className = 'daily-motivation';
  motivationEl.style.marginBottom = '24px';
  motivationEl.style.padding = '16px';
  motivationEl.style.borderRadius = '8px';
  motivationEl.style.backgroundColor = 'rgba(52, 168, 83, 0.1)';
  motivationEl.style.borderLeft = '4px solid #34A853';
  
  // Loading state
  motivationEl.innerHTML = `
    <div style="display: flex; align-items: center;">
      <div style="margin-right: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34A853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </div>
      <p style="margin: 0; font-size: 16px; font-weight: 500; color: #34A853;">Getting your daily motivation...</p>
    </div>
  `;
  
  container.appendChild(motivationEl);
  
  try {
    // Get the motivation message
    const message = await getDailyMotivation();
    
    // Update the element
    motivationEl.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="margin-right: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34A853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #34A853;">${message}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering daily motivation:', error);
    
    // Fallback message
    motivationEl.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="margin-right: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34A853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #34A853;">Your small wins today build your financial future tomorrow.</p>
      </div>
    `;
  }
  
  return motivationEl;
}

/**
 * Render the Weekly Reflection panel
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement} - Rendered component
 */
export async function renderWeeklyReflection(container) {
  const reflectionEl = document.createElement('div');
  reflectionEl.id = 'weekly-reflection';
  reflectionEl.className = 'weekly-reflection';
  reflectionEl.style.marginBottom = '24px';
  reflectionEl.style.padding = '24px';
  reflectionEl.style.borderRadius = '8px';
  reflectionEl.style.backgroundColor = '#f9fafb';
  reflectionEl.style.border = '1px solid #e5e7eb';
  
  // Loading state
  reflectionEl.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <div style="margin-right: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🧠 Weekly Financial Reflection</h3>
    </div>
    <p style="margin: 0 0 16px 0; color: #6b7280;">Loading your personalized insights...</p>
  `;
  
  container.appendChild(reflectionEl);
  
  try {
    // Get the reflection data
    const reflection = await getWeeklyReflection();
    
    // Create HTML for struggles and wins
    const strugglesHtml = reflection.struggles.map(s => `<li>${s}</li>`).join('');
    const winsHtml = reflection.wins.map(w => `<li>${w}</li>`).join('');
    
    // Update the element
    reflectionEl.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="margin-right: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🧠 Weekly Financial Reflection</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #4b5563;">Financial Challenges</h4>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
            ${strugglesHtml}
          </ul>
        </div>
        <div>
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #4b5563;">Recent Wins</h4>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
            ${winsHtml}
          </ul>
        </div>
      </div>
      
      <div style="padding: 16px; background-color: #e9f7ef; border-radius: 6px;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #34A853;">AI Suggestion</h4>
        <p style="margin: 0; color: #4b5563;">${reflection.advice}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering weekly reflection:', error);
    
    // Fallback content
    reflectionEl.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="margin-right: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🧠 Weekly Financial Reflection</h3>
      </div>
      
      <p style="margin: 0 0 16px 0; color: #6b7280;">
        Keep using Stackr to get personalized insights about your financial behavior and specific recommendations.
      </p>
      
      <div style="padding: 16px; background-color: #e9f7ef; border-radius: 6px;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #34A853;">Getting Started</h4>
        <p style="margin: 0; color: #4b5563;">Track your spending consistently, set specific goals, and check back for personalized advice.</p>
      </div>
    `;
  }
  
  return reflectionEl;
}

/**
 * Render the Behavior History component
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement} - Rendered component
 */
export function renderBehaviorHistory(container) {
  const behaviorEl = document.createElement('div');
  behaviorEl.id = 'behavior-history';
  behaviorEl.className = 'behavior-history';
  behaviorEl.style.marginBottom = '24px';
  
  // Get summaries
  const summaries = getBehaviorSummaries();
  
  // Header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '16px';
  header.innerHTML = `
    <div style="margin-right: 12px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    </div>
    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Monthly Behavior Insights</h3>
  `;
  behaviorEl.appendChild(header);
  
  // Content
  if (summaries.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.padding = '20px';
    emptyState.style.backgroundColor = '#f8f9fa';
    emptyState.style.borderRadius = '8px';
    emptyState.style.textAlign = 'center';
    emptyState.innerHTML = `
      <p style="margin: 0 0 16px 0; color: #6b7280;">No monthly summaries available yet.</p>
      <button id="generate-sample-summary" class="btn" style="padding: 8px 16px; background-color: #6366F1; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Generate Sample Summary
      </button>
    `;
    behaviorEl.appendChild(emptyState);
    
    // Add event listener for the button
    setTimeout(() => {
      const button = document.getElementById('generate-sample-summary');
      if (button) {
        button.addEventListener('click', async () => {
          // Generate a sample summary
          const currentDate = new Date();
          const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          
          const sampleData = `
            Spent $850 on housing (top: housing), $325 on food, $245 on entertainment.
            Overspent in category: entertainment (overspend: entertainment) by $95.
            Saved $200 toward emergency fund goal.
            Income: $2,500. Total expenses: $1,980.
          `;
          
          try {
            await generateMonthlySummary(month, sampleData);
            
            // Show success message
            createToast('Monthly summary generated successfully', 'success');
            
            // Re-render the component
            const parent = behaviorEl.parentNode;
            if (parent) {
              const newEl = renderBehaviorHistory(parent);
              parent.replaceChild(newEl, behaviorEl);
            }
          } catch (error) {
            console.error('Error generating sample summary:', error);
            createToast('Failed to generate sample summary', 'error');
          }
        });
      }
    }, 0);
  } else {
    // Create cards for each summary
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    grid.style.gap = '16px';
    
    summaries.forEach(summary => {
      const card = document.createElement('div');
      card.style.padding = '16px';
      card.style.borderRadius = '8px';
      card.style.backgroundColor = '#f9fafb';
      card.style.border = '1px solid #e5e7eb';
      
      // Format date
      const date = new Date(summary.createdAt);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
      }).format(date);
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${formattedDate}</h4>
          <span style="font-size: 12px; color: #6b7280;">${summary.month}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span style="font-size: 14px; color: #4b5563;">Top category: <strong>${summary.topCategory}</strong></span>
          </div>
          
          ${summary.overspendCategory ? `
          <div style="display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span style="font-size: 14px; color: #4b5563;">Overspent on: <strong>${summary.overspendCategory}</strong></span>
          </div>
          ` : ''}
        </div>
        
        <p style="margin: 0; font-size: 14px; color: #6b7280;">${summary.summary}</p>
      `;
      
      grid.appendChild(card);
    });
    
    behaviorEl.appendChild(grid);
  }
  
  container.appendChild(behaviorEl);
  return behaviorEl;
}

/**
 * Render the Team Summary component
 * @param {HTMLElement} container - Container element
 * @param {Array} teamMembers - Team members data
 * @returns {HTMLElement} - Rendered component
 */
export async function renderTeamSummary(container, teamMembers) {
  const teamEl = document.createElement('div');
  teamEl.id = 'team-summary';
  teamEl.className = 'team-summary';
  teamEl.style.marginBottom = '24px';
  teamEl.style.padding = '24px';
  teamEl.style.borderRadius = '8px';
  teamEl.style.backgroundColor = '#f9fafb';
  teamEl.style.border = '1px solid #e5e7eb';
  
  // Header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '16px';
  header.innerHTML = `
    <div style="margin-right: 12px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </div>
    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Team Financial Overview</h3>
  `;
  teamEl.appendChild(header);
  
  // Content
  const content = document.createElement('div');
  content.style.marginBottom = '16px';
  
  if (!teamMembers || teamMembers.length === 0) {
    content.innerHTML = `
      <p style="margin: 0; color: #6b7280;">No team members available.</p>
    `;
  } else {
    // Loading state
    content.innerHTML = `
      <p style="margin: 0; color: #6b7280;">Loading team insights...</p>
    `;
    
    try {
      // Get team summaries
      const summaries = await getTeamSummary(teamMembers);
      
      // Create list items
      const items = summaries.map(summary => `
        <div style="padding: 12px; background-color: white; border-radius: 6px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 16px; color: #4b5563;">${summary.user}</strong>
            <button class="team-message-btn" data-user="${summary.user}" style="background: none; border: none; color: #6366F1; cursor: pointer; font-size: 14px;">
              Message
            </button>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${summary.summary}</p>
        </div>
      `).join('');
      
      content.innerHTML = items;
      
      // Add event listeners to message buttons
      setTimeout(() => {
        document.querySelectorAll('.team-message-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const user = btn.getAttribute('data-user');
            createToast(`Message sent to ${user}`, 'success');
          });
        });
      }, 0);
    } catch (error) {
      console.error('Error rendering team summary:', error);
      content.innerHTML = `
        <p style="margin: 0; color: #6b7280;">Failed to load team insights.</p>
      `;
    }
  }
  
  teamEl.appendChild(content);
  
  // Add button to generate sample team summary
  if (!teamMembers || teamMembers.length === 0) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'center';
    
    const button = document.createElement('button');
    button.id = 'generate-sample-team';
    button.className = 'btn';
    button.style.padding = '8px 16px';
    button.style.backgroundColor = '#6366F1';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.textContent = 'Generate Sample Team';
    
    buttonContainer.appendChild(button);
    teamEl.appendChild(buttonContainer);
    
    // Add event listener for the button
    setTimeout(() => {
      const btn = document.getElementById('generate-sample-team');
      if (btn) {
        btn.addEventListener('click', async () => {
          // Sample team members
          const sampleTeam = [
            {
              name: 'Alex Chen',
              goals: ['Save for home purchase', 'Reduce credit card debt'],
              painPoints: ['Inconsistent freelance income', 'High rent expenses']
            },
            {
              name: 'Jordan Smith',
              goals: ['Save for vacation', 'Build emergency fund'],
              painPoints: ['Impulsive spending', 'Managing subscriptions']
            },
            {
              name: 'Taylor Lopez',
              goals: ['Invest for retirement', 'Save for child education'],
              painPoints: ['Healthcare costs', 'Balancing multiple financial goals']
            }
          ];
          
          try {
            // Re-render with sample team
            const parent = teamEl.parentNode;
            if (parent) {
              const newEl = await renderTeamSummary(parent, sampleTeam);
              parent.replaceChild(newEl, teamEl);
            }
            
            // Show success message
            createToast('Sample team generated successfully', 'success');
          } catch (error) {
            console.error('Error generating sample team:', error);
            createToast('Failed to generate sample team', 'error');
          }
        });
      }
    }, 0);
  }
  
  container.appendChild(teamEl);
  return teamEl;
}

/**
 * Render all AI personalization components
 * @param {HTMLElement} container - Container element
 * @param {string} userId - User ID
 * @returns {Object} - Rendered components
 */
export async function renderAIPersonalization(container, userId) {
  // Initialize user context
  initUserContext(userId);
  
  // Create container for AI components
  const aiContainer = document.createElement('div');
  aiContainer.className = 'ai-personalization';
  aiContainer.style.marginBottom = '32px';
  
  // Section header
  const header = document.createElement('div');
  header.style.marginBottom = '24px';
  header.innerHTML = `
    <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Smart Insights</h2>
    <p style="margin: 0; color: #6b7280;">AI-powered financial insights and recommendations personalized for you.</p>
  `;
  aiContainer.appendChild(header);
  
  // Track page view
  trackUserAction('page_view', 'ai_personalization');
  
  // Render components
  await renderDailyMotivation(aiContainer);
  await renderWeeklyReflection(aiContainer);
  renderBehaviorHistory(aiContainer);
  
  // Sample team members (comment out for production)
  /*
  const sampleTeam = [
    {
      name: 'Alex Chen',
      goals: ['Save for home purchase', 'Reduce credit card debt'],
      painPoints: ['Inconsistent freelance income', 'High rent expenses']
    },
    {
      name: 'Jordan Smith',
      goals: ['Save for vacation', 'Build emergency fund'],
      painPoints: ['Impulsive spending', 'Managing subscriptions']
    }
  ];
  await renderTeamSummary(aiContainer, sampleTeam);
  */
  
  // Add container to the page
  container.appendChild(aiContainer);
  
  return {
    container: aiContainer
  };
}