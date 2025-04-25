/**
 * AI Personalization Module
 * Provides interface for personalized AI insights and settings
 */

import { 
  initUserContext, 
  updateUserGoals, 
  updateUserPainPoints,
  renderDailyMotivation,
  renderWeeklyReflection,
  getBehaviorSummaries
} from './user-context.js';
import { createToast } from './components/toast.js';
import { checkOpenAIConfigured } from './openai-helper.js';

/**
 * Initialize the AI Personalization page
 * @param {string} userId - User ID
 * @returns {HTMLElement} The page element
 */
export function initAIPersonalizationPage(userId) {
  // Initialize user context
  initUserContext(userId);
  
  // Create page container
  const container = document.createElement('div');
  container.className = 'ai-personalization-page';
  container.style.padding = '20px';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  
  // Header section
  const header = document.createElement('header');
  header.style.marginBottom = '32px';
  
  // Create status indicator element
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'ai-status-indicator';
  statusIndicator.style.display = 'flex';
  statusIndicator.style.alignItems = 'center';
  statusIndicator.style.gap = '8px';
  statusIndicator.style.marginTop = '8px';
  statusIndicator.style.padding = '6px 12px';
  statusIndicator.style.borderRadius = '16px';
  statusIndicator.style.fontSize = '14px';
  statusIndicator.style.fontWeight = '500';
  statusIndicator.style.backgroundColor = '#f3f4f6';
  statusIndicator.style.color = '#6b7280';
  statusIndicator.style.width = 'fit-content';
  
  // Set initial loading state
  statusIndicator.innerHTML = `
    <span class="status-dot" style="height: 8px; width: 8px; border-radius: 50%; background-color: #9ca3af;"></span>
    <span>AI Status: Checking...</span>
  `;
  
  header.innerHTML = `
    <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #1f2937;">AI Insights</h1>
    <p style="color: #4b5563; font-size: 16px; margin: 0;">
      Get personalized financial insights powered by Stackr's AI. Update your preferences to receive more tailored advice.
    </p>
  `;
  
  header.appendChild(statusIndicator);
  container.appendChild(header);
  
  // Create insights section
  const insightsSection = createInsightsSection();
  container.appendChild(insightsSection);
  
  // Create preferences section
  const preferencesSection = createPreferencesSection();
  container.appendChild(preferencesSection);
  
  // Check OpenAI status and update indicator
  updateAIStatusIndicator();
  
  return container;
}

/**
 * Update the AI status indicator with the current status
 */
async function updateAIStatusIndicator() {
  const statusIndicator = document.getElementById('ai-status-indicator');
  if (!statusIndicator) return;
  
  try {
    const configStatus = await checkOpenAIConfigured();
    let statusColor, statusText;
    
    switch (configStatus.status) {
      case 'active':
        statusColor = '#10b981'; // Green
        statusText = 'AI Status: Active';
        break;
      case 'quota_exceeded':
        statusColor = '#f59e0b'; // Yellow/Orange
        statusText = 'AI Status: Quota Exceeded (Using Fallbacks)';
        break;
      case 'error':
        statusColor = '#ef4444'; // Red
        statusText = 'AI Status: Error';
        break;
      case 'unavailable':
        statusColor = '#ef4444'; // Red
        statusText = 'AI Status: Unavailable';
        break;
      default:
        statusColor = '#9ca3af'; // Gray
        statusText = `AI Status: ${configStatus.status || 'Unknown'}`;
    }
    
    statusIndicator.innerHTML = `
      <span class="status-dot" style="height: 8px; width: 8px; border-radius: 50%; background-color: ${statusColor};"></span>
      <span>${statusText}</span>
    `;
    
    // Update the background color based on status
    if (configStatus.status === 'active') {
      statusIndicator.style.backgroundColor = '#ecfdf5'; // Light green bg
      statusIndicator.style.color = '#065f46'; // Dark green text
    } else if (configStatus.status === 'quota_exceeded') {
      statusIndicator.style.backgroundColor = '#fffbeb'; // Light yellow bg
      statusIndicator.style.color = '#92400e'; // Dark orange text
    } else if (configStatus.status === 'error' || configStatus.status === 'unavailable') {
      statusIndicator.style.backgroundColor = '#fee2e2'; // Light red bg
      statusIndicator.style.color = '#b91c1c'; // Dark red text
    }
    
    console.log(`OpenAI API status: ${configStatus.status}`);
  } catch (error) {
    console.error('Error updating AI status indicator:', error);
    statusIndicator.innerHTML = `
      <span class="status-dot" style="height: 8px; width: 8px; border-radius: 50%; background-color: #ef4444;"></span>
      <span>AI Status: Error checking status</span>
    `;
    statusIndicator.style.backgroundColor = '#fee2e2'; // Light red bg
    statusIndicator.style.color = '#b91c1c'; // Dark red text
  }
}

/**
 * Create the financial insights section
 * @returns {HTMLElement} The insights section
 */
function createInsightsSection() {
  const section = document.createElement('section');
  section.className = 'insights-section';
  section.style.marginBottom = '40px';
  
  // Section header
  const sectionHeader = document.createElement('div');
  sectionHeader.style.marginBottom = '24px';
  sectionHeader.innerHTML = `
    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: text-bottom; margin-right: 8px;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      Your Financial Insights
    </h2>
    <p style="color: #6b7280; margin: 0;">
      Personalized insights updated daily based on your financial behavior.
    </p>
  `;
  section.appendChild(sectionHeader);
  
  // Create a grid for insights
  const insightsGrid = document.createElement('div');
  insightsGrid.style.display = 'grid';
  insightsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
  insightsGrid.style.gap = '24px';
  
  // Add the insights cards
  
  // Card 1: Daily Motivation
  const motivationCard = document.createElement('div');
  motivationCard.className = 'card motivation-card';
  motivationCard.style.borderRadius = '8px';
  motivationCard.style.backgroundColor = '#f9fafb';
  motivationCard.style.border = '1px solid #e5e7eb';
  motivationCard.style.padding = '24px';
  
  // We'll add content to this card via renderDailyMotivation
  renderDailyMotivation(motivationCard);
  
  insightsGrid.appendChild(motivationCard);
  
  // Card 2: Weekly Reflection
  const reflectionCard = document.createElement('div');
  reflectionCard.className = 'card reflection-card';
  reflectionCard.style.borderRadius = '8px';
  reflectionCard.style.backgroundColor = '#f9fafb';
  reflectionCard.style.border = '1px solid #e5e7eb';
  reflectionCard.style.padding = '24px';
  
  // We'll add content to this card via renderWeeklyReflection
  renderWeeklyReflection(reflectionCard);
  
  insightsGrid.appendChild(reflectionCard);
  
  // Card 3: Behavior Summaries
  const summariesCard = document.createElement('div');
  summariesCard.className = 'card summaries-card';
  summariesCard.style.borderRadius = '8px';
  summariesCard.style.backgroundColor = '#f9fafb';
  summariesCard.style.border = '1px solid #e5e7eb';
  summariesCard.style.padding = '24px';
  
  // Header for the card
  const summariesHeader = document.createElement('div');
  summariesHeader.style.marginBottom = '16px';
  summariesHeader.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <div style="margin-right: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </div>
      <h3 style="margin: 0; font-size: 18px; font-weight: 600;">📊 Monthly Spending Insights</h3>
    </div>
  `;
  summariesCard.appendChild(summariesHeader);
  
  // Load behavior summaries
  const summaries = getBehaviorSummaries(3);
  
  if (summaries && summaries.length > 0) {
    // Create content for each summary
    const summariesContent = document.createElement('div');
    summariesContent.style.display = 'flex';
    summariesContent.style.flexDirection = 'column';
    summariesContent.style.gap = '16px';
    
    summaries.forEach(summary => {
      const summaryItem = document.createElement('div');
      summaryItem.style.padding = '16px';
      summaryItem.style.backgroundColor = 'white';
      summaryItem.style.borderRadius = '6px';
      summaryItem.style.border = '1px solid #e5e7eb';
      
      summaryItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;">${summary.month}</h4>
          <span style="font-size: 12px; color: #6b7280;">${new Date(summary.createdAt).toLocaleDateString()}</span>
        </div>
        <div style="margin-bottom: 8px;">
          <span style="display: inline-block; padding: 4px 8px; background-color: #e9f7ef; color: #34A853; border-radius: 4px; font-size: 12px; margin-right: 8px;">
            <strong>Top:</strong> ${summary.topCategory}
          </span>
          ${summary.overspendCategory ? `
            <span style="display: inline-block; padding: 4px 8px; background-color: #fee2e2; color: #dc2626; border-radius: 4px; font-size: 12px;">
              <strong>Overspent:</strong> ${summary.overspendCategory}
            </span>
          ` : ''}
        </div>
        <p style="margin: 0; color: #4b5563; font-size: 14px;">${summary.summary}</p>
      `;
      
      summariesContent.appendChild(summaryItem);
    });
    
    summariesCard.appendChild(summariesContent);
  } else {
    // No summaries yet
    const noSummaries = document.createElement('div');
    noSummaries.style.padding = '16px';
    noSummaries.style.backgroundColor = 'white';
    noSummaries.style.borderRadius = '6px';
    noSummaries.style.textAlign = 'center';
    noSummaries.style.color = '#6b7280';
    
    noSummaries.innerHTML = `
      <p style="margin: 0 0 8px 0; font-size: 16px;">No monthly summaries yet</p>
      <p style="margin: 0; font-size: 14px;">Continue using Stackr to get personalized monthly insights.</p>
    `;
    
    summariesCard.appendChild(noSummaries);
  }
  
  insightsGrid.appendChild(summariesCard);
  
  // Add grid to section
  section.appendChild(insightsGrid);
  
  return section;
}

/**
 * Create the preferences section
 * @returns {HTMLElement} The preferences section
 */
function createPreferencesSection() {
  const section = document.createElement('section');
  section.className = 'preferences-section';
  
  // Section header
  const sectionHeader = document.createElement('div');
  sectionHeader.style.marginBottom = '24px';
  sectionHeader.innerHTML = `
    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: text-bottom; margin-right: 8px;">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      Personalization Settings
    </h2>
    <p style="color: #6b7280; margin: 0;">
      Update your preferences to receive more relevant financial insights.
    </p>
  `;
  section.appendChild(sectionHeader);
  
  // Create preferences form
  const preferencesForm = document.createElement('form');
  preferencesForm.className = 'preferences-form';
  preferencesForm.style.display = 'grid';
  preferencesForm.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
  preferencesForm.style.gap = '24px';
  
  // Financial goals section
  const goalsSection = document.createElement('div');
  goalsSection.className = 'goals-section';
  goalsSection.style.borderRadius = '8px';
  goalsSection.style.backgroundColor = '#f9fafb';
  goalsSection.style.border = '1px solid #e5e7eb';
  goalsSection.style.padding = '24px';
  
  goalsSection.innerHTML = `
    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #1f2937;">Financial Goals</h3>
    <p style="color: #6b7280; margin: 0 0 16px 0;">Select your top financial goals to receive personalized insights.</p>
    
    <div class="checkboxes" style="display: flex; flex-direction: column; gap: 12px;">
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="goals" value="Save for emergency fund" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Save for emergency fund</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="goals" value="Reduce debt" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Reduce debt</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="goals" value="Grow business income" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Grow business income</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="goals" value="Invest for retirement" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Invest for retirement</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="goals" value="Save for major purchase" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Save for major purchase</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="goals" value="Optimize tax strategy" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Optimize tax strategy</span>
      </label>
    </div>
    
    <div style="margin-top: 20px;">
      <input type="text" id="custom-goal" placeholder="Add a custom goal..." style="width: 100%; padding: 8px 12px; border-radius: 4px; border: 1px solid #d1d5db; margin-bottom: 8px;">
      <button type="button" id="add-goal-btn" style="background-color: #e5e7eb; border: none; padding: 8px 16px; border-radius: 4px; color: #4b5563; cursor: pointer; font-weight: 500;">Add Goal</button>
    </div>
  `;
  
  preferencesForm.appendChild(goalsSection);
  
  // Pain points section
  const painPointsSection = document.createElement('div');
  painPointsSection.className = 'pain-points-section';
  painPointsSection.style.borderRadius = '8px';
  painPointsSection.style.backgroundColor = '#f9fafb';
  painPointsSection.style.border = '1px solid #e5e7eb';
  painPointsSection.style.padding = '24px';
  
  painPointsSection.innerHTML = `
    <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #1f2937;">Financial Challenges</h3>
    <p style="color: #6b7280; margin: 0 0 16px 0;">Select your financial challenges to get targeted advice.</p>
    
    <div class="checkboxes" style="display: flex; flex-direction: column; gap: 12px;">
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="painPoints" value="Inconsistent income" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Inconsistent income</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="painPoints" value="Unexpected expenses" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Unexpected expenses</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="painPoints" value="Client payment delays" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Client payment delays</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="painPoints" value="Difficulty pricing services" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Difficulty pricing services</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="painPoints" value="Healthcare costs" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Healthcare costs</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" name="painPoints" value="Retirement planning" style="width: 16px; height: 16px;">
        <span style="color: #4b5563;">Retirement planning</span>
      </label>
    </div>
    
    <div style="margin-top: 20px;">
      <input type="text" id="custom-pain-point" placeholder="Add a custom challenge..." style="width: 100%; padding: 8px 12px; border-radius: 4px; border: 1px solid #d1d5db; margin-bottom: 8px;">
      <button type="button" id="add-pain-point-btn" style="background-color: #e5e7eb; border: none; padding: 8px 16px; border-radius: 4px; color: #4b5563; cursor: pointer; font-weight: 500;">Add Challenge</button>
    </div>
  `;
  
  preferencesForm.appendChild(painPointsSection);
  
  // Save preferences button
  const saveButtonContainer = document.createElement('div');
  saveButtonContainer.style.gridColumn = '1 / -1';
  saveButtonContainer.style.marginTop = '20px';
  saveButtonContainer.style.display = 'flex';
  saveButtonContainer.style.justifyContent = 'flex-end';
  
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.id = 'save-preferences-btn';
  saveButton.innerText = 'Save Preferences';
  saveButton.style.backgroundColor = '#34A853';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.padding = '12px 24px';
  saveButton.style.borderRadius = '4px';
  saveButton.style.fontWeight = '500';
  saveButton.style.cursor = 'pointer';
  saveButton.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
  
  saveButtonContainer.appendChild(saveButton);
  preferencesForm.appendChild(saveButtonContainer);
  
  // Add event listeners
  setTimeout(() => {
    // Add custom goal
    const addGoalBtn = document.getElementById('add-goal-btn');
    const customGoalInput = document.getElementById('custom-goal');
    
    if (addGoalBtn && customGoalInput) {
      addGoalBtn.addEventListener('click', () => {
        const goalValue = customGoalInput.value.trim();
        if (goalValue) {
          const goalsContainer = goalsSection.querySelector('.checkboxes');
          
          // Create new checkbox
          const newLabel = document.createElement('label');
          newLabel.style.display = 'flex';
          newLabel.style.alignItems = 'center';
          newLabel.style.gap = '8px';
          newLabel.style.cursor = 'pointer';
          
          newLabel.innerHTML = `
            <input type="checkbox" name="goals" value="${goalValue}" style="width: 16px; height: 16px;" checked>
            <span style="color: #4b5563;">${goalValue}</span>
          `;
          
          goalsContainer.appendChild(newLabel);
          customGoalInput.value = '';
        }
      });
    }
    
    // Add custom pain point
    const addPainPointBtn = document.getElementById('add-pain-point-btn');
    const customPainPointInput = document.getElementById('custom-pain-point');
    
    if (addPainPointBtn && customPainPointInput) {
      addPainPointBtn.addEventListener('click', () => {
        const painPointValue = customPainPointInput.value.trim();
        if (painPointValue) {
          const painPointsContainer = painPointsSection.querySelector('.checkboxes');
          
          // Create new checkbox
          const newLabel = document.createElement('label');
          newLabel.style.display = 'flex';
          newLabel.style.alignItems = 'center';
          newLabel.style.gap = '8px';
          newLabel.style.cursor = 'pointer';
          
          newLabel.innerHTML = `
            <input type="checkbox" name="painPoints" value="${painPointValue}" style="width: 16px; height: 16px;" checked>
            <span style="color: #4b5563;">${painPointValue}</span>
          `;
          
          painPointsContainer.appendChild(newLabel);
          customPainPointInput.value = '';
        }
      });
    }
    
    // Save preferences
    const savePreferencesBtn = document.getElementById('save-preferences-btn');
    
    if (savePreferencesBtn) {
      savePreferencesBtn.addEventListener('click', () => {
        // Get selected goals
        const goalCheckboxes = document.querySelectorAll('input[name="goals"]:checked');
        const goals = Array.from(goalCheckboxes).map(checkbox => checkbox.value);
        
        // Get selected pain points
        const painPointCheckboxes = document.querySelectorAll('input[name="painPoints"]:checked');
        const painPoints = Array.from(painPointCheckboxes).map(checkbox => checkbox.value);
        
        // Update user context
        updateUserGoals(goals);
        updateUserPainPoints(painPoints);
        
        // Show toast
        createToast('Preferences saved successfully', 'success');
      });
    }
  }, 100);
  
  section.appendChild(preferencesForm);
  
  return section;
}