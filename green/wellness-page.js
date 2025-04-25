/**
 * Personal Financial Assessment Page
 * This module renders the personal financial assessment and related UI
 */

import { 
  renderWellnessScorecardPage, 
  calculateWellnessScore,
  getLatestWellnessScorecard,
  shouldGenerateWellnessScorecard
} from './wellness-scorecard.js';

/**
 * Render the main personal financial assessment page
 * @param {string} userId - User ID
 * @returns {Promise<HTMLElement>} - The assessment page container
 */
export async function renderWellnessPage(userId) {
  // Create main container
  const container = document.createElement('div');
  container.className = 'wellness-page';
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  container.style.padding = 'var(--container-padding)';
  
  // Add page header
  const header = document.createElement('header');
  header.className = 'wellness-page-header';
  header.style.marginBottom = '2rem';
  header.innerHTML = `
    <h1 style="margin-bottom: 0.5rem; font-size: 2rem; font-weight: 700;">Personal Financial Assessment</h1>
    <p style="color: var(--color-text-secondary); max-width: 700px;">
      Your personalized financial health assessment based on your income, expenses, savings, and financial habits.
      This assessment helps identify your strengths and opportunities for improvement.
    </p>
  `;
  container.appendChild(header);
  
  try {
    // Check if we need to generate a new scorecard
    if (shouldGenerateWellnessScorecard(userId)) {
      // Add loading indicator
      const loadingElement = document.createElement('div');
      loadingElement.className = 'wellness-loading';
      loadingElement.innerHTML = `
        <div class="loading-spinner" style="
          width: 40px;
          height: 40px;
          border: 4px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        "></div>
        <p style="text-align: center;">Generating your personal financial assessment...</p>
      `;
      container.appendChild(loadingElement);
      
      // Calculate new wellness score
      await calculateWellnessScore(userId);
      
      // Remove loading indicator
      container.removeChild(loadingElement);
    }
    
    // Render the scorecard page
    const scorecardElement = await renderWellnessScorecardPage(userId);
    container.appendChild(scorecardElement);
    
    // Add scorecard explanation section
    const explanationSection = createExplanationSection();
    container.appendChild(explanationSection);
    
    return container;
  } catch (error) {
    console.log('Error in personal financial assessment page:', error);
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'wellness-error';
    errorElement.style.textAlign = 'center';
    errorElement.style.padding = '2rem';
    errorElement.style.maxWidth = '600px';
    errorElement.style.margin = '0 auto';
    errorElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" 
          stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          style="margin: 0 auto 1rem;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h2 style="margin-bottom: 1rem;">Unable to Generate Assessment</h2>
      <p style="margin-bottom: 1.5rem;">We couldn't generate your personal financial assessment. This may be because we need more financial data to analyze.</p>
      <button class="retry-button" style="
        background: var(--color-primary);
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
      ">Try Again</button>
    `;
    
    // Add retry functionality
    const retryButton = errorElement.querySelector('.retry-button');
    retryButton.addEventListener('click', async () => {
      // Replace error with the full page (recursive call)
      container.innerHTML = '';
      container.appendChild(header);
      
      try {
        // Add loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'wellness-loading';
        loadingElement.innerHTML = `
          <div class="loading-spinner" style="
            width: 40px;
            height: 40px;
            border: 4px solid var(--color-border);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
          "></div>
          <p style="text-align: center;">Generating your personal financial assessment...</p>
        `;
        container.appendChild(loadingElement);
        
        // Force recalculation
        await calculateWellnessScore(userId);
        
        // Remove loading indicator
        container.removeChild(loadingElement);
        
        // Render scorecard
        const scorecardElement = await renderWellnessScorecardPage(userId);
        container.appendChild(scorecardElement);
        
        // Add explanation section
        const explanationSection = createExplanationSection();
        container.appendChild(explanationSection);
      } catch (retryError) {
        console.log('Error on personal financial assessment retry:', retryError);
        container.appendChild(errorElement);
      }
    });
    
    container.appendChild(errorElement);
    return container;
  }
}

/**
 * Create the scorecard explanation section
 * @returns {HTMLElement} - The explanation section
 */
function createExplanationSection() {
  const section = document.createElement('section');
  section.className = 'wellness-explanation';
  section.style.marginTop = '3rem';
  section.style.padding = '2rem';
  section.style.background = 'var(--color-card-background)';
  section.style.borderRadius = 'var(--radius-lg)';
  section.style.boxShadow = 'var(--shadow-sm)';
  
  section.innerHTML = `
    <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 600;">Understanding Your Personal Financial Assessment</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--color-primary);">
          What is the Personal Financial Assessment?
        </h3>
        <p style="color: var(--color-text);">
          Your Personal Financial Assessment evaluates your overall financial health across multiple dimensions, 
          including income stability, savings ratio, investment health, debt management, and expense control.
        </p>
      </div>
      
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--color-primary);">
          How is it Calculated?
        </h3>
        <p style="color: var(--color-text);">
          The score analyzes your financial data within Stackr, including your income patterns, savings ratio, 
          investment diversification, debt-to-income ratio, budget adherence, and goal progress.
        </p>
      </div>
      
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--color-primary);">
          How to Improve Your Assessment
        </h3>
        <p style="color: var(--color-text);">
          Focus on the recommendations provided in your assessment. Prioritize the high-priority items first, 
          and use other Stackr tools like Guardrails and Goal Setting to make consistent improvements.
        </p>
      </div>
    </div>
    
    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
      <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem;">Assessment Score Ranges</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: var(--color-success-600);"></div>
          <span><strong>90-100:</strong> Excellent financial health</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: var(--color-success-500);"></div>
          <span><strong>75-89:</strong> Strong financial foundation</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: var(--color-warning-400);"></div>
          <span><strong>60-74:</strong> Good with improvement areas</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: var(--color-warning-500);"></div>
          <span><strong>40-59:</strong> Fair with challenges</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: var(--color-danger-500);"></div>
          <span><strong>0-39:</strong> Needs immediate attention</span>
        </div>
      </div>
    </div>
  `;
  
  return section;
}

// Add key animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);