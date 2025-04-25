/**
 * Stackr AI Personalization Module
 * Provides AI-powered insights, reflections, and behavior tracking
 */

import { renderAIPersonalization } from './user-context.js';

/**
 * Initialize the AI Personalization page
 * @param {string} userId - Current user ID
 * @returns {HTMLElement} - The AI personalization page element
 */
export function initAIPersonalizationPage(userId) {
  // Create main container
  const container = document.createElement('div');
  container.className = 'ai-personalization-container';
  container.style.maxWidth = '1000px';
  container.style.margin = '0 auto';
  container.style.padding = '24px';
  
  // Add page header
  const header = document.createElement('div');
  header.style.marginBottom = '32px';
  header.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <div style="margin-right: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Smart Money Insights</h1>
    </div>
    <p style="color: #666; margin-top: 8px;">
      Personalized financial analysis, motivation, and guidance powered by artificial intelligence.
    </p>
  `;
  container.appendChild(header);
  
  // Loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.style.display = 'flex';
  loadingIndicator.style.justifyContent = 'center';
  loadingIndicator.style.alignItems = 'center';
  loadingIndicator.style.padding = '48px 0';
  loadingIndicator.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #6366F1; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 16px; color: #6b7280;">Loading your personalized insights...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  container.appendChild(loadingIndicator);
  
  // Load and render AI personalization components
  renderAIPersonalization(container, userId).then(() => {
    // Remove loading indicator
    container.removeChild(loadingIndicator);
  }).catch(error => {
    console.error('Error rendering AI personalization:', error);
    
    // Show error message
    loadingIndicator.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="margin-top: 16px; color: #6b7280;">
          Sorry, we couldn't load your personalized insights. Please try again later.
        </p>
        <button id="retry-ai-personalization" style="margin-top: 16px; padding: 8px 16px; background-color: #6366F1; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Try Again
        </button>
      </div>
    `;
    
    // Add event listener for retry button
    setTimeout(() => {
      const retryButton = document.getElementById('retry-ai-personalization');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          // Replace the current page with a new instance
          const parent = container.parentNode;
          if (parent) {
            parent.replaceChild(initAIPersonalizationPage(userId), container);
          }
        });
      }
    }, 0);
  });
  
  return container;
}