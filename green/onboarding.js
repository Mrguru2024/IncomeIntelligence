/**
 * Onboarding Page Component for Stackr Finance
 * This file handles user onboarding experience
 */

// Helper function to get viewport width - to avoid redeclaring variables
function getViewportWidth() {
  return window.innerWidth;
}

// Helper function to detect and get device type
function getDeviceInfo() {
  const width = getViewportWidth();
  const height = window.innerHeight;
  const aspectRatio = width / height;
  
  // Detect Samsung Z Fold 4 in folded state (approximately)
  const isFoldableClosed = width < 400 && aspectRatio < 0.7; // Tall and narrow
  
  // Detect Samsung Z Fold 4 in unfolded state (approximately)
  const isFoldableOpen = width >= 400 && width < 840 && aspectRatio > 0.9; // More square-like when open
  
  let deviceType = 'desktop';
  if (width < 500) {
    deviceType = 'small-mobile';
  } else if (width < 768) {
    deviceType = 'mobile'; 
  } else if (width < 1024) {
    deviceType = 'tablet';
  }
  
  return {
    width,
    height,
    aspectRatio,
    deviceType,
    isFoldableClosed,
    isFoldableOpen
  };
}

// Export navigateTo function so it can be used externally
export function navigateTo(page) {
  // If window is available, this will be imported and used by the src/main.js
  if (typeof window !== 'undefined' && window.navigateTo) {
    window.navigateTo(page);
  }
}

// Function to show the onboarding modal on the dashboard
export function showOnboardingModal() {
  // Check if onboarding has been completed
  const onboardingCompleted = localStorage.getItem('stackrOnboardingCompleted') === 'true';
  
  if (onboardingCompleted) {
    return null; // Don't show modal if onboarding is completed
  }
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'onboarding-modal';
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100vw';
  modalContainer.style.height = '100vh';
  modalContainer.style.background = 'rgba(0, 0, 0, 0.5)';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  modalContainer.style.zIndex = '9999';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.background = '#fff';
  modalContent.style.borderRadius = '8px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.padding = '24px';
  modalContent.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
  modalContent.style.animation = 'modalFadeIn 0.3s ease-out forwards';
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.style.borderBottom = '1px solid #e5e7eb';
  modalHeader.style.paddingBottom = '16px';
  modalHeader.style.marginBottom = '16px';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Welcome to Stackr Finance';
  modalTitle.style.fontSize = '1.5rem';
  modalTitle.style.fontWeight = '700';
  modalTitle.style.margin = '0';
  modalTitle.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-accent))';
  modalTitle.style.WebkitBackgroundClip = 'text';
  modalTitle.style.WebkitTextFillColor = 'transparent';
  
  modalHeader.appendChild(modalTitle);
  
  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.innerHTML = `
    <div style="margin-bottom: 20px;">
      <p style="margin-bottom: 16px;">
        Let's set up your financial dashboard with a few quick steps to get you started.
      </p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: transform 0.2s;">
          <h3 style="margin-top: 0; color: var(--color-primary);">Track Income</h3>
          <p style="margin-bottom: 0; color: var(--color-text-secondary);">
            Record and categorize all your income sources in one place.
          </p>
        </div>
        
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: transform 0.2s;">
          <h3 style="margin-top: 0; color: var(--color-primary);">Smart Allocation</h3>
          <p style="margin-bottom: 0; color: var(--color-text-secondary);">
            Use the 40/30/30 principle for needs, wants, and savings.
          </p>
        </div>
      </div>
      
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-top: 20px;">
        <p style="margin: 0; color: #0369a1;">
          <strong>Tip:</strong> Setting up your profile now will help personalize your financial recommendations.
        </p>
      </div>
    </div>
  `;
  
  // Create modal footer
  const modalFooter = document.createElement('div');
  modalFooter.style.borderTop = '1px solid #e5e7eb';
  modalFooter.style.paddingTop = '16px';
  modalFooter.style.marginTop = '16px';
  modalFooter.style.display = 'flex';
  modalFooter.style.justifyContent = 'space-between';
  
  const skipButton = document.createElement('button');
  skipButton.textContent = 'Skip for Now';
  skipButton.style.background = 'transparent';
  skipButton.style.border = '1px solid #e5e7eb';
  skipButton.style.borderRadius = '6px';
  skipButton.style.padding = '8px 16px';
  skipButton.style.cursor = 'pointer';
  skipButton.style.color = 'var(--color-text-secondary)';
  skipButton.style.transition = 'all 0.2s';
  
  skipButton.addEventListener('mouseover', () => {
    skipButton.style.backgroundColor = '#f9fafb';
  });
  
  skipButton.addEventListener('mouseout', () => {
    skipButton.style.backgroundColor = 'transparent';
  });
  
  skipButton.addEventListener('click', () => {
    // Mark onboarding as completed
    localStorage.setItem('stackrOnboardingCompleted', 'true');
    
    // Update the user's onboarding step
    updateOnboardingStep(getUserId(), 'complete')
      .then(() => {
        // Close the modal
        modalContainer.remove();
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        // Close the modal anyway
        modalContainer.remove();
      });
  });
  
  const setupButton = document.createElement('button');
  setupButton.textContent = 'Setup Now';
  setupButton.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-primary-dark))';
  setupButton.style.color = 'white';
  setupButton.style.border = 'none';
  setupButton.style.borderRadius = '6px';
  setupButton.style.padding = '10px 20px';
  setupButton.style.cursor = 'pointer';
  setupButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  setupButton.style.transition = 'all 0.2s';
  
  setupButton.addEventListener('mouseover', () => {
    setupButton.style.transform = 'translateY(-2px)';
    setupButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
  });
  
  setupButton.addEventListener('mouseout', () => {
    setupButton.style.transform = 'translateY(0)';
    setupButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  });
  
  setupButton.addEventListener('click', () => {
    // Navigate to the onboarding page
    navigateTo('onboarding');
    
    // Close the modal
    modalContainer.remove();
  });
  
  modalFooter.appendChild(skipButton);
  modalFooter.appendChild(setupButton);
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modalContainer.appendChild(modalContent);
  
  // Add click event to close modal when clicking outside
  modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer) {
      modalContainer.remove();
    }
  });
  
  return modalContainer;
}

// Helper function to get user ID
function getUserId() {
  try {
    const userData = localStorage.getItem('stackrUser');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || 1;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return 1;
}

// The onboarding steps
const ONBOARDING_STEPS = [
  'welcome',
  'profile',
  'financial-goals',
  'split-ratio',
  'tutorial',
  'complete'
];

// Function to render the onboarding page
export function renderOnboardingPage(appState) {
  // Get device information for responsive design
  const deviceInfo = getDeviceInfo();
  const { width, isFoldableClosed, isFoldableOpen } = deviceInfo;
  
  const container = document.createElement('div');
  container.classList.add('onboarding-container');
  
  // Apply responsive max-width based on device
  if (width < 500) {
    container.style.maxWidth = '95%';
  } else if (width < 768) {
    container.style.maxWidth = '90%';
  } else {
    container.style.maxWidth = '1100px';
  }
  
  // Apply responsive padding based on device
  if (width < 350) {
    container.style.padding = '20px 10px';
  } else if (width < 500) {
    container.style.padding = '30px 15px';
  } else {
    container.style.padding = '40px 20px';
  }
  
  container.style.margin = '0 auto';
  container.style.minHeight = '90vh';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'center';
  
  // Apply a subtle background gradient for the entire onboarding experience
  document.body.style.background = 'linear-gradient(120deg, rgba(240,245,255,1) 0%, rgba(235,240,255,1) 100%)';
  
  const currentStep = appState.user.onboardingStep || 'welcome';
  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  
  // Header section with logo and progress
  const header = document.createElement('div');
  header.classList.add('onboarding-header');
  header.style.marginBottom = '40px';
  
  // Logo container
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.marginBottom = '32px';
  
  // Create logo element - using stylized text instead of an image
  const logo = document.createElement('div');
  logo.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 42px; font-weight: 800; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">STACKR</span>
      <!-- Removed GREEN label as requested -->
    </div>
  `;
  logo.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))';
  logo.style.transition = 'transform 0.2s ease';
  logo.style.cursor = 'pointer';
  
  // Add hover effect to logo
  logo.addEventListener('mouseover', () => {
    logo.style.transform = 'scale(1.05)';
  });
  
  logo.addEventListener('mouseout', () => {
    logo.style.transform = 'scale(1)';
  });
  
  // Add click event to return to landing page (optional)
  logo.addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the onboarding process?')) {
      navigateTo('landing');
    }
  });
  
  logoContainer.appendChild(logo);
  header.appendChild(logoContainer);
  header.style.textAlign = 'center';
  
  // Create a container for the title with animated gradient
  const titleContainer = document.createElement('div');
  titleContainer.style.position = 'relative';
  titleContainer.style.marginBottom = '16px';
  titleContainer.style.padding = '0 10px';
  
  const title = document.createElement('h1');
  title.textContent = 'Welcome to Stackr Finance';
  title.style.fontSize = '42px';
  title.style.fontWeight = '800';
  title.style.marginBottom = '0';
  title.style.background = 'linear-gradient(120deg, var(--color-primary) 10%, var(--color-primary-dark) 50%, var(--color-primary) 90%)';
  title.style.backgroundSize = '200% 200%';
  title.style.WebkitBackgroundClip = 'text';
  title.style.WebkitTextFillColor = 'transparent';
  title.style.backgroundClip = 'text';
  title.style.animation = 'gradientAnimation 8s ease infinite';
  
  // Add a subtle animation to the title
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gradientAnimation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .animated-element {
      animation: fadeIn 0.6s ease-out forwards;
      opacity: 0;
    }
    
    .animated-element.delay-1 {
      animation-delay: 0.2s;
    }
    
    .animated-element.delay-2 {
      animation-delay: 0.4s;
    }
    
    .animated-element.delay-3 {
      animation-delay: 0.6s;
    }
    
    .animated-element.delay-4 {
      animation-delay: 0.8s;
    }
    
    .animated-form-group {
      transition: all 0.3s ease;
    }
    
    .animated-form-group:focus-within {
      transform: translateY(-5px);
    }
    
    .interactive-split {
      transition: all 0.4s ease;
    }
    
    .interactive-split:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(style);
  
  titleContainer.appendChild(title);
  header.appendChild(titleContainer);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Let\'s set up your account to make the most of your financial journey.';
  subtitle.style.fontSize = '18px';
  subtitle.style.color = 'var(--color-text-secondary)';
  subtitle.style.marginBottom = '32px';
  subtitle.style.fontWeight = '400';
  subtitle.style.maxWidth = '700px';
  subtitle.style.margin = '0 auto 32px';
  subtitle.classList.add('animated-element');
  header.appendChild(subtitle);
  
  // Progress bar - more futuristic design with responsive adjustments
  const progressContainer = document.createElement('div');
  progressContainer.style.display = 'flex';
  progressContainer.style.justifyContent = 'space-between';
  progressContainer.style.position = 'relative';
  progressContainer.style.maxWidth = '800px';
  progressContainer.style.margin = '0 auto';
  progressContainer.style.padding = '10px 5px';
  progressContainer.classList.add('animated-element');
  progressContainer.classList.add('delay-1');
  
  // Responsive adjustments for mobile devices and foldable screens
  // Using the existing width variable from parent scope
  if (width < 400) {
    // Extra small screens - likely folded foldable device 
    progressContainer.style.transform = 'scale(0.8)';
    progressContainer.style.transformOrigin = 'center top';
  } else if (width < 640) {
    // Mobile screens
    progressContainer.style.transform = 'scale(0.9)';
    progressContainer.style.transformOrigin = 'center top';
  }
  
  // Progress line with special gradient
  const progressLine = document.createElement('div');
  progressLine.style.position = 'absolute';
  progressLine.style.top = '24px';
  progressLine.style.left = '0';
  progressLine.style.right = '0';
  progressLine.style.height = '4px';
  progressLine.style.background = 'linear-gradient(90deg, rgba(233,236,239,1) 0%, rgba(222,226,230,1) 100%)';
  progressLine.style.borderRadius = '2px';
  progressLine.style.zIndex = '1';
  progressLine.style.opacity = '0.8';
  progressContainer.appendChild(progressLine);
  
  // Progress line fill with animated gradient
  const progressFill = document.createElement('div');
  progressFill.style.position = 'absolute';
  progressFill.style.top = '24px';
  progressFill.style.left = '0';
  progressFill.style.height = '4px';
  progressFill.style.background = 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 50%, var(--color-primary) 100%)';
  progressFill.style.backgroundSize = '200% 100%';
  progressFill.style.borderRadius = '2px';
  progressFill.style.zIndex = '2';
  progressFill.style.width = `${(currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100}%`;
  progressFill.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  progressFill.style.animation = 'gradientAnimation 3s ease infinite';
  progressFill.style.boxShadow = '0 0 10px rgba(var(--color-primary-rgb), 0.5)';
  progressContainer.appendChild(progressFill);
  
  // Step indicators with enhanced styling
  const stepTitles = ['Welcome', 'Profile', 'Goals', 'Split Ratio', 'Tutorial', 'Complete'];
  const stepIcons = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.95V3.05"></path><path d="M20.95 12H3.05"></path><path d="M3.05 3.05h16.9v16.9H3.05z"></path></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  ];
  
  ONBOARDING_STEPS.forEach((step, index) => {
    const stepContainer = document.createElement('div');
    stepContainer.style.display = 'flex';
    stepContainer.style.flexDirection = 'column';
    stepContainer.style.alignItems = 'center';
    stepContainer.style.position = 'relative';
    stepContainer.style.zIndex = '3';
    stepContainer.style.flex = '1';
    stepContainer.style.maxWidth = '100px';
    stepContainer.classList.add('animated-element');
    stepContainer.classList.add(`delay-${index + 1}`);
    
    // Create a clickable step indicator
    const stepIndicator = document.createElement('div');
    stepIndicator.style.width = '50px';
    stepIndicator.style.height = '50px';
    stepIndicator.style.borderRadius = '50%';
    stepIndicator.style.display = 'flex';
    stepIndicator.style.alignItems = 'center';
    stepIndicator.style.justifyContent = 'center';
    stepIndicator.style.marginBottom = '10px';
    stepIndicator.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    stepIndicator.style.cursor = index <= currentStepIndex ? 'pointer' : 'default';
    stepIndicator.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    if (index < currentStepIndex) {
      // Completed step with checkmark and glow effect
      stepIndicator.style.backgroundColor = 'var(--color-primary)';
      stepIndicator.style.boxShadow = '0 0 15px rgba(var(--color-primary-rgb), 0.4)';
      stepIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      
      // Allow clicking on previous steps to go back
      stepIndicator.addEventListener('click', () => {
        updateOnboardingStep(appState.user.id, step)
          .then(() => {
            appState.user.onboardingStep = step;
            navigateTo('onboarding');
          })
          .catch(error => {
            console.error('Failed to update onboarding step:', error);
          });
      });
      
      // Add tooltip for revisiting completed steps
      stepIndicator.title = `Return to ${stepTitles[index]}`;
      
      // Add hover effect
      stepIndicator.addEventListener('mouseover', () => {
        stepIndicator.style.transform = 'scale(1.1)';
      });
      
      stepIndicator.addEventListener('mouseout', () => {
        stepIndicator.style.transform = 'scale(1)';
      });
      
    } else if (index === currentStepIndex) {
      // Current step with pulsing animation
      stepIndicator.style.backgroundColor = 'var(--color-primary)';
      stepIndicator.style.color = 'white';
      stepIndicator.style.fontWeight = 'bold';
      stepIndicator.style.fontSize = '18px';
      stepIndicator.style.animation = 'pulse 2s infinite';
      stepIndicator.style.boxShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.5)';
      stepIndicator.innerHTML = stepIcons[index];
      
    } else {
      // Future step with glass-like effect
      stepIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      stepIndicator.style.backdropFilter = 'blur(4px)';
      stepIndicator.style.border = '2px solid var(--color-border)';
      stepIndicator.style.color = 'var(--color-text-secondary)';
      stepIndicator.innerHTML = stepIcons[index];
      stepIndicator.style.opacity = '0.7';
    }
    
    // Step title with enhanced styling and better mobile visibility
    const stepTitle = document.createElement('span');
    stepTitle.textContent = stepTitles[index];
    stepTitle.style.textAlign = 'center';
    stepTitle.style.transition = 'all 0.3s ease';
    
    // Responsive font sizing based on device info from parent scope
    if (width < 350) {
      // Very small screens (Samsung Z Fold 4 folded)
      stepTitle.style.fontSize = '10px';
      stepTitle.style.marginTop = '4px';
      // On extremely small screens, only show titles for current and completed steps
      if (index > currentStepIndex) {
        stepTitle.style.display = 'none';
      }
    } else if (width < 500) {
      // Small mobile screens
      stepTitle.style.fontSize = '11px';
      stepTitle.style.marginTop = '6px';
    } else {
      // Larger screens
      stepTitle.style.fontSize = '13px';
      stepTitle.style.marginTop = '8px';
    }
    
    stepTitle.style.fontWeight = index === currentStepIndex ? 'bold' : 'normal';
    stepTitle.style.color = index <= currentStepIndex ? 'var(--color-text)' : 'var(--color-text-secondary)';
    
    // Animation for current step title
    if (index === currentStepIndex) {
      stepTitle.style.transform = 'scale(1.05)';
    }
    
    stepContainer.appendChild(stepIndicator);
    stepContainer.appendChild(stepTitle);
    progressContainer.appendChild(stepContainer);
  });
  
  header.appendChild(progressContainer);
  container.appendChild(header);
  
  // Content container with enhanced styling
  const content = document.createElement('div');
  content.classList.add('onboarding-content', 'animated-element', 'delay-2');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '16px';
  content.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.08)';
  content.style.marginBottom = '32px';
  content.style.transition = 'all 0.3s ease';
  content.style.border = '1px solid rgba(235, 238, 241, 0.8)';
  content.style.position = 'relative';
  content.style.overflow = 'hidden';
  
  // Responsive padding based on device info from parent scope
  if (width < 350) {
    // Extra small screens (folded Z Fold 4)
    content.style.padding = '20px';
  } else if (width < 500) {
    // Small mobile screens
    content.style.padding = '30px';
  } else if (width < 768) {
    // Mobile screens
    content.style.padding = '35px 40px';
  } else {
    // Tablets and larger
    content.style.padding = '40px 50px';
  }
  
  // Add subtle decorative elements
  const decorElement1 = document.createElement('div');
  decorElement1.style.position = 'absolute';
  decorElement1.style.width = '300px';
  decorElement1.style.height = '300px';
  decorElement1.style.borderRadius = '50%';
  decorElement1.style.background = 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.03) 0%, rgba(var(--color-primary-rgb), 0) 70%)';
  decorElement1.style.top = '-150px';
  decorElement1.style.right = '-150px';
  decorElement1.style.zIndex = '0';
  content.appendChild(decorElement1);
  
  const decorElement2 = document.createElement('div');
  decorElement2.style.position = 'absolute';
  decorElement2.style.width = '200px';
  decorElement2.style.height = '200px';
  decorElement2.style.borderRadius = '50%';
  decorElement2.style.background = 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.03) 0%, rgba(var(--color-primary-rgb), 0) 70%)';
  decorElement2.style.bottom = '-100px';
  decorElement2.style.left = '-100px';
  decorElement2.style.zIndex = '0';
  content.appendChild(decorElement2);
  
  // Create an inner content container to properly layer content above decorative elements
  const contentInner = document.createElement('div');
  contentInner.style.position = 'relative';
  contentInner.style.zIndex = '1';
  content.appendChild(contentInner);
  
  // Render different content based on current step
  switch (currentStep) {
    case 'welcome':
      renderWelcomeStep(contentInner, appState);
      break;
    case 'profile':
      renderProfileStep(contentInner, appState);
      break;
    case 'financial-goals':
      renderGoalsStep(contentInner, appState);
      break;
    case 'split-ratio':
      renderSplitRatioStep(contentInner, appState);
      break;
    case 'tutorial':
      renderTutorialStep(contentInner, appState);
      break;
    case 'complete':
      renderCompleteStep(contentInner, appState);
      break;
    default:
      renderWelcomeStep(contentInner, appState);
  }
  
  container.appendChild(content);
  
  return container;
}

// Welcome step with enhanced futuristic styling and animations
function renderWelcomeStep(container, appState) {
  // Create a more engaging title with animation
  const titleWrapper = document.createElement('div');
  titleWrapper.style.position = 'relative';
  titleWrapper.style.marginBottom = '24px';
  titleWrapper.classList.add('animated-element');
  
  const title = document.createElement('h2');
  title.textContent = 'Welcome to Stackr Finance!';
  title.style.fontSize = '32px';
  title.style.fontWeight = '800';
  title.style.marginBottom = '16px';
  title.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 70%, var(--color-primary) 100%)';
  title.style.backgroundSize = '200% auto';
  title.style.WebkitBackgroundClip = 'text';
  title.style.WebkitTextFillColor = 'transparent';
  title.style.backgroundClip = 'text';
  title.style.animation = 'gradientAnimation 6s ease infinite';
  title.style.textAlign = 'center';
  title.style.letterSpacing = '-0.5px';
  
  // Add a decorative line under the title
  const decorLine = document.createElement('div');
  decorLine.style.height = '4px';
  decorLine.style.width = '80px';
  decorLine.style.background = 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))';
  decorLine.style.borderRadius = '2px';
  decorLine.style.margin = '0 auto 24px';
  
  titleWrapper.appendChild(title);
  titleWrapper.appendChild(decorLine);
  container.appendChild(titleWrapper);
  
  // Attractive welcome message with better typography
  const description = document.createElement('p');
  description.innerHTML = `We're thrilled to have you join us on your financial journey. Stackr Finance is designed to help service providers and freelancers like you manage your income and build wealth through our unique <strong>40/30/30 Split System</strong>.`;
  description.style.fontSize = '18px';
  description.style.lineHeight = '1.7';
  description.style.textAlign = 'center';
  description.style.maxWidth = '800px';
  description.style.margin = '0 auto 32px';
  description.style.color = 'var(--color-text)';
  description.style.fontWeight = '400';
  description.classList.add('animated-element');
  description.classList.add('delay-1');
  container.appendChild(description);
  
  // Add enhanced, interactive explanation of the 40/30/30 split
  const splitExplanation = document.createElement('div');
  splitExplanation.style.backgroundColor = 'rgba(var(--color-background-secondary-rgb), 0.5)';
  splitExplanation.style.padding = '30px';
  splitExplanation.style.borderRadius = '16px';
  splitExplanation.style.marginBottom = '40px';
  splitExplanation.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.03)';
  splitExplanation.style.border = '1px solid rgba(235, 238, 241, 0.8)';
  splitExplanation.style.transition = 'all 0.3s ease';
  splitExplanation.classList.add('animated-element');
  splitExplanation.classList.add('delay-2');
  splitExplanation.classList.add('interactive-split');
  
  // Add title with a modern look
  const splitTitle = document.createElement('h3');
  splitTitle.innerHTML = 'The <span style="background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">40/30/30</span> Split System';
  splitTitle.style.fontSize = '22px';
  splitTitle.style.fontWeight = '700';
  splitTitle.style.marginBottom = '20px';
  splitTitle.style.textAlign = 'center';
  splitExplanation.appendChild(splitTitle);
  
  // Add a subtitle that explains the concept
  const splitSubtitle = document.createElement('p');
  splitSubtitle.textContent = 'A proven formula for financial success that balances necessities with opportunities.';
  splitSubtitle.style.textAlign = 'center';
  splitSubtitle.style.marginBottom = '25px';
  splitSubtitle.style.fontSize = '16px';
  splitSubtitle.style.color = 'var(--color-text-secondary)';
  splitExplanation.appendChild(splitSubtitle);
  
  // Enhanced split visualization with interactive hover effects
  const splitVisual = document.createElement('div');
  splitVisual.style.display = 'flex';
  splitVisual.style.width = '100%';
  splitVisual.style.height = '80px';
  splitVisual.style.borderRadius = '12px';
  splitVisual.style.overflow = 'hidden';
  splitVisual.style.marginBottom = '24px';
  splitVisual.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
  splitVisual.style.position = 'relative';
  
  // Create segments with enhanced styling and interactive effects
  const createSegment = (percentage, label, color, icon, description) => {
    const segment = document.createElement('div');
    segment.style.backgroundColor = `var(--color-${color})`;
    segment.style.width = `${percentage}%`;
    segment.style.display = 'flex';
    segment.style.alignItems = 'center';
    segment.style.justifyContent = 'center';
    segment.style.color = 'white';
    segment.style.fontWeight = 'bold';
    segment.style.fontSize = '16px';
    segment.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    segment.style.position = 'relative';
    segment.style.overflow = 'hidden';
    segment.style.cursor = 'pointer';
    
    // Create label with icon
    const labelContainer = document.createElement('div');
    labelContainer.style.display = 'flex';
    labelContainer.style.alignItems = 'center';
    labelContainer.style.gap = '8px';
    labelContainer.style.zIndex = '2';
    
    labelContainer.innerHTML = `${icon} <span>${percentage}% ${label}</span>`;
    segment.appendChild(labelContainer);
    
    // Add hover effect
    segment.addEventListener('mouseover', () => {
      segment.style.transform = 'scale(1.03)';
      segment.style.boxShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.3)';
      segment.style.zIndex = '10';
      
      // Show tooltip on hover
      const tooltip = document.createElement('div');
      tooltip.classList.add('segment-tooltip');
      tooltip.textContent = description;
      tooltip.style.position = 'absolute';
      tooltip.style.bottom = '-60px';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.backgroundColor = 'rgba(40, 44, 52, 0.95)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '6px';
      tooltip.style.fontSize = '14px';
      tooltip.style.zIndex = '100';
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
      tooltip.style.animation = 'fadeIn 0.2s ease-out forwards';
      
      segment.appendChild(tooltip);
    });
    
    segment.addEventListener('mouseout', () => {
      segment.style.transform = 'scale(1)';
      segment.style.boxShadow = 'none';
      segment.style.zIndex = '1';
      
      // Remove tooltip
      const tooltip = segment.querySelector('.segment-tooltip');
      if (tooltip) {
        segment.removeChild(tooltip);
      }
    });
    
    // Decorative background pattern
    const pattern = document.createElement('div');
    pattern.style.position = 'absolute';
    pattern.style.top = '0';
    pattern.style.left = '0';
    pattern.style.right = '0';
    pattern.style.bottom = '0';
    pattern.style.backgroundImage = `radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10.5%)`;
    pattern.style.backgroundSize = '20px 20px';
    pattern.style.opacity = '0.3';
    segment.appendChild(pattern);
    
    return segment;
  };
  
  // Create the three segments with icons and descriptions
  const needsSegment = createSegment(
    40, 
    'Needs', 
    'needs', 
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    'Essential expenses like housing, food, utilities, and transportation'
  );
  
  const investmentsSegment = createSegment(
    30, 
    'Investments', 
    'investments', 
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>',
    'Building your future through stocks, mutual funds, education, or your business'
  );
  
  const savingsSegment = createSegment(
    30, 
    'Savings', 
    'savings', 
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    'Emergency funds, big purchases, and peace of mind'
  );
  
  splitVisual.appendChild(needsSegment);
  splitVisual.appendChild(investmentsSegment);
  splitVisual.appendChild(savingsSegment);
  
  splitExplanation.appendChild(splitVisual);
  
  const splitDetails = document.createElement('ul');
  splitDetails.style.listStyleType = 'none';
  splitDetails.style.padding = '0';
  splitDetails.style.margin = '0';
  
  const needs = document.createElement('li');
  needs.innerHTML = '<strong>40% for Needs:</strong> Essential expenses like housing, food, utilities, and transportation.';
  needs.style.marginBottom = '8px';
  needs.style.display = 'flex';
  needs.style.alignItems = 'flex-start';
  needs.style.gap = '8px';
  needs.insertAdjacentHTML('afterbegin', '<span style="color: var(--color-needs); font-size: 18px;">●</span>');
  splitDetails.appendChild(needs);
  
  const investments = document.createElement('li');
  investments.innerHTML = '<strong>30% for Investments:</strong> Building your future through stocks, mutual funds, education, or your business.';
  investments.style.marginBottom = '8px';
  investments.style.display = 'flex';
  investments.style.alignItems = 'flex-start';
  investments.style.gap = '8px';
  investments.insertAdjacentHTML('afterbegin', '<span style="color: var(--color-investments); font-size: 18px;">●</span>');
  splitDetails.appendChild(investments);
  
  const savings = document.createElement('li');
  savings.innerHTML = '<strong>30% for Savings:</strong> Emergency funds, big purchases, and peace of mind.';
  savings.style.display = 'flex';
  savings.style.alignItems = 'flex-start';
  savings.style.gap = '8px';
  savings.insertAdjacentHTML('afterbegin', '<span style="color: var(--color-savings); font-size: 18px;">●</span>');
  splitDetails.appendChild(savings);
  
  splitExplanation.appendChild(splitDetails);
  container.appendChild(splitExplanation);
  
  // Enhanced features section with modern card-based layout
  const featuresSection = document.createElement('div');
  featuresSection.style.marginBottom = '40px';
  featuresSection.classList.add('animated-element');
  featuresSection.classList.add('delay-3');
  
  const featuresTitle = document.createElement('h3');
  featuresTitle.innerHTML = 'What You\'ll <span style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Be Able To Do</span>';
  featuresTitle.style.fontSize = '24px';
  featuresTitle.style.fontWeight = '700';
  featuresTitle.style.marginBottom = '24px';
  featuresTitle.style.textAlign = 'center';
  featuresSection.appendChild(featuresTitle);
  
  // Create grid layout for features cards
  const featuresGrid = document.createElement('div');
  featuresGrid.style.display = 'grid';
  featuresGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
  featuresGrid.style.gap = '20px';
  featuresGrid.style.marginBottom = '20px';
  
  // Define features with icons and descriptions
  const features = [
    {
      title: 'Track Your Income Split',
      description: 'Visualize your 40/30/30 split and see where your money is going in real-time.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>'
    },
    {
      title: 'Connect Bank Accounts',
      description: 'Securely connect your accounts for automatic updates to your financial dashboard.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    },
    {
      title: 'Set Financial Goals',
      description: 'Create and track your short, medium, and long-term financial goals with ease.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l2 2"></path></svg>'
    },
    {
      title: 'Discover Income Opportunities',
      description: 'Find new ways to earn through Stackr Gigs, tailored for service providers like you.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>'
    },
    {
      title: 'Get Financial Advice',
      description: 'Receive personalized financial insights and recommendations based on your goals.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    },
    {
      title: 'Join Money Challenges',
      description: 'Participate in fun, motivating challenges designed to help you save more.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
    }
  ];
  
  // Create feature cards with hover effects
  features.forEach((feature, index) => {
    const featureCard = document.createElement('div');
    featureCard.style.backgroundColor = 'white';
    featureCard.style.borderRadius = '12px';
    featureCard.style.padding = '24px';
    featureCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    featureCard.style.transition = 'all 0.3s ease';
    featureCard.style.cursor = 'pointer';
    featureCard.style.border = '1px solid rgba(235, 238, 241, 0.8)';
    featureCard.style.height = '100%';
    featureCard.style.display = 'flex';
    featureCard.style.flexDirection = 'column';
    featureCard.classList.add('animated-element');
    featureCard.classList.add(`delay-${index % 3 + 1}`);
    
    // Icon container with colored background
    const iconContainer = document.createElement('div');
    iconContainer.style.width = '48px';
    iconContainer.style.height = '48px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.marginBottom = '16px';
    iconContainer.style.color = 'var(--color-primary)';
    iconContainer.style.transition = 'all 0.3s ease';
    iconContainer.innerHTML = feature.icon;
    
    // Feature title
    const featureTitle = document.createElement('h4');
    featureTitle.textContent = feature.title;
    featureTitle.style.fontSize = '18px';
    featureTitle.style.fontWeight = '600';
    featureTitle.style.marginBottom = '8px';
    featureTitle.style.color = 'var(--color-text)';
    
    // Feature description
    const featureDescription = document.createElement('p');
    featureDescription.textContent = feature.description;
    featureDescription.style.fontSize = '14px';
    featureDescription.style.color = 'var(--color-text-secondary)';
    featureDescription.style.lineHeight = '1.5';
    featureDescription.style.marginBottom = '0';
    featureDescription.style.flex = '1';
    
    // Append elements to card
    featureCard.appendChild(iconContainer);
    featureCard.appendChild(featureTitle);
    featureCard.appendChild(featureDescription);
    
    // Add hover effect
    featureCard.addEventListener('mouseover', () => {
      featureCard.style.transform = 'translateY(-5px)';
      featureCard.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      iconContainer.style.backgroundColor = 'var(--color-primary)';
      iconContainer.style.color = 'white';
    });
    
    featureCard.addEventListener('mouseout', () => {
      featureCard.style.transform = 'translateY(0)';
      featureCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
      iconContainer.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
      iconContainer.style.color = 'var(--color-primary)';
    });
    
    featuresGrid.appendChild(featureCard);
  });
  
  featuresSection.appendChild(featuresGrid);
  container.appendChild(featuresSection);
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.marginTop = '24px';
  
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Get Started';
  nextButton.classList.add('btn', 'btn-primary');
  nextButton.style.padding = '12px 24px';
  nextButton.style.fontSize = '16px';
  nextButton.style.fontWeight = '600';
  nextButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  nextButton.style.color = 'white';
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '8px';
  nextButton.style.cursor = 'pointer';
  nextButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  nextButton.style.transition = 'all 0.2s ease';
  
  nextButton.addEventListener('mouseover', () => {
    nextButton.style.transform = 'translateY(-2px)';
    nextButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.15)';
  });
  
  nextButton.addEventListener('mouseout', () => {
    nextButton.style.transform = 'translateY(0)';
    nextButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  });
  
  nextButton.addEventListener('click', () => {
    updateOnboardingStep(appState.user.id, 'profile')
      .then(() => {
        appState.user.onboardingStep = 'profile';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  buttonContainer.appendChild(nextButton);
  container.appendChild(buttonContainer);
}

// Profile step
function renderProfileStep(container, appState) {
  const title = document.createElement('h2');
  title.textContent = 'Complete Your Profile';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '24px';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = 'Help us get to know you better so we can personalize your experience.';
  description.style.marginBottom = '32px';
  container.appendChild(description);
  
  // Create profile form
  const form = document.createElement('form');
  form.id = 'profile-form';
  form.style.display = 'grid';
  form.style.gridTemplateColumns = 'repeat(2, 1fr)';
  form.style.gap = '24px';
  
  // First Name
  const firstNameGroup = createFormGroup('firstName', 'First Name', 'text', appState.user.firstName || '');
  form.appendChild(firstNameGroup);
  
  // Last Name
  const lastNameGroup = createFormGroup('lastName', 'Last Name', 'text', appState.user.lastName || '');
  form.appendChild(lastNameGroup);
  
  // Occupation
  const occupationGroup = createFormGroup('occupation', 'Occupation', 'text', appState.user.occupation || '');
  occupationGroup.style.gridColumn = '1 / -1';
  form.appendChild(occupationGroup);
  
  // About you - textarea, spans full width
  const aboutGroup = document.createElement('div');
  aboutGroup.style.gridColumn = '1 / -1';
  
  const aboutLabel = document.createElement('label');
  aboutLabel.htmlFor = 'about';
  aboutLabel.textContent = 'About You';
  aboutLabel.style.display = 'block';
  aboutLabel.style.marginBottom = '8px';
  aboutLabel.style.fontWeight = '500';
  
  const aboutInput = document.createElement('textarea');
  aboutInput.id = 'about';
  aboutInput.name = 'about';
  aboutInput.rows = 4;
  aboutInput.placeholder = 'Tell us a bit about yourself and your financial goals...';
  aboutInput.value = appState.user.about || '';
  aboutInput.style.width = '100%';
  aboutInput.style.padding = '12px';
  aboutInput.style.borderRadius = '8px';
  aboutInput.style.border = '1px solid var(--color-border)';
  aboutInput.style.fontSize = '16px';
  
  aboutGroup.appendChild(aboutLabel);
  aboutGroup.appendChild(aboutInput);
  form.appendChild(aboutGroup);
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.gridColumn = '1 / -1';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';
  buttonContainer.style.marginTop = '24px';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = 'Back';
  backButton.classList.add('btn', 'btn-secondary');
  backButton.style.padding = '12px 24px';
  backButton.style.fontSize = '16px';
  backButton.style.fontWeight = '600';
  backButton.style.color = 'var(--color-text)';
  backButton.style.backgroundColor = 'var(--color-background)';
  backButton.style.border = '1px solid var(--color-border)';
  backButton.style.borderRadius = '8px';
  backButton.style.cursor = 'pointer';
  
  backButton.addEventListener('click', () => {
    updateOnboardingStep(appState.user.id, 'welcome')
      .then(() => {
        appState.user.onboardingStep = 'welcome';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  const nextButton = document.createElement('button');
  nextButton.type = 'submit';
  nextButton.textContent = 'Next';
  nextButton.classList.add('btn', 'btn-primary');
  nextButton.style.padding = '12px 24px';
  nextButton.style.fontSize = '16px';
  nextButton.style.fontWeight = '600';
  nextButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  nextButton.style.color = 'white';
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '8px';
  nextButton.style.cursor = 'pointer';
  
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(nextButton);
  form.appendChild(buttonContainer);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      occupation: form.occupation.value,
      about: form.about.value
    };
    
    // Show loading state
    nextButton.disabled = true;
    nextButton.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Saving...';
    
    // Save profile data and move to next step
    updateUserProfile(appState.user.id, formData)
      .then((response) => {
        console.log('Profile update response:', response);
        
        // Update app state with the returned data or form data
        appState.user.firstName = formData.firstName;
        appState.user.lastName = formData.lastName;
        appState.user.occupation = formData.occupation;
        appState.user.about = formData.about;
        
        // Check if we're in offline mode
        if (response && response.offlineMode) {
          // Show a toast or notification that we're in offline mode
          const offlineNotice = document.createElement('div');
          offlineNotice.className = 'offline-notice';
          offlineNotice.innerHTML = `
            <div class="alert alert-warning" role="alert">
              <i class="fas fa-wifi-slash"></i> 
              You're currently in offline mode. Your changes will be saved locally until you reconnect.
              <button class="close" data-dismiss="alert">&times;</button>
            </div>
          `;
          document.body.appendChild(offlineNotice);
          
          // Remove the notice after 5 seconds
          setTimeout(() => {
            offlineNotice.remove();
          }, 5000);
        }
        
        // Move to next step regardless of online/offline status
        return updateOnboardingStep(appState.user.id, 'financial-goals');
      })
      .then(() => {
        appState.user.onboardingStep = 'financial-goals';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update profile:', error);
        nextButton.disabled = false;
        nextButton.textContent = 'Next';
        
        // Create a more user-friendly error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message alert alert-danger';
        errorMessage.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          We encountered an issue saving your profile. Your data will be saved locally, and you can continue.
          <button class="btn btn-sm btn-primary ml-3" id="retry-profile-button">Retry</button>
          <button class="btn btn-sm btn-secondary ml-2" id="continue-anyway-button">Continue Anyway</button>
        `;
        
        // Insert the error message at the top of the form
        const formElement = document.querySelector('form');
        formElement.insertBefore(errorMessage, formElement.firstChild);
        
        // Add event listeners to the retry and continue buttons
        document.getElementById('retry-profile-button').addEventListener('click', (e) => {
          e.preventDefault();
          errorMessage.remove();
          nextButton.click();
        });
        
        document.getElementById('continue-anyway-button').addEventListener('click', (e) => {
          e.preventDefault();
          errorMessage.remove();
          
          // Force update app state
          appState.user.firstName = formData.firstName;
          appState.user.lastName = formData.lastName;
          appState.user.occupation = formData.occupation;
          appState.user.about = formData.about;
          
          // Save to localStorage as backup
          try {
            const userData = JSON.parse(localStorage.getItem('stackrUser') || '{}');
            const updatedUser = { ...userData, ...formData };
            localStorage.setItem('stackrUser', JSON.stringify(updatedUser));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          
          // Move to next step anyway
          appState.user.onboardingStep = 'financial-goals';
          navigateTo('onboarding');
        });
      });
  });
  
  container.appendChild(form);
}

// Financial goals step
function renderGoalsStep(container, appState) {
  const title = document.createElement('h2');
  title.textContent = 'Set Your Financial Goals';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '24px';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = 'Setting clear financial goals is a powerful way to stay motivated and track your progress.';
  description.style.marginBottom = '32px';
  container.appendChild(description);
  
  // Create goals form
  const form = document.createElement('form');
  form.id = 'goals-form';
  
  // Short-term goals
  const shortTermSection = document.createElement('div');
  shortTermSection.style.marginBottom = '32px';
  
  const shortTermTitle = document.createElement('h3');
  shortTermTitle.textContent = 'Short-Term Goal (0-12 months)';
  shortTermTitle.style.fontSize = '18px';
  shortTermTitle.style.fontWeight = 'bold';
  shortTermTitle.style.marginBottom = '16px';
  shortTermSection.appendChild(shortTermTitle);
  
  const shortTermGoalGroup = createFormGroup('shortTermGoal', 'Goal Description', 'text', '', 'E.g., Build a $2,000 emergency fund');
  shortTermSection.appendChild(shortTermGoalGroup);
  
  const shortTermAmountGroup = createFormGroup('shortTermAmount', 'Target Amount', 'number', '', '1000');
  shortTermAmountGroup.style.marginTop = '16px';
  shortTermSection.appendChild(shortTermAmountGroup);
  
  form.appendChild(shortTermSection);
  
  // Mid-term goals
  const midTermSection = document.createElement('div');
  midTermSection.style.marginBottom = '32px';
  
  const midTermTitle = document.createElement('h3');
  midTermTitle.textContent = 'Mid-Term Goal (1-5 years)';
  midTermTitle.style.fontSize = '18px';
  midTermTitle.style.fontWeight = 'bold';
  midTermTitle.style.marginBottom = '16px';
  midTermSection.appendChild(midTermTitle);
  
  const midTermGoalGroup = createFormGroup('midTermGoal', 'Goal Description', 'text', '', 'E.g., Save for a house down payment');
  midTermSection.appendChild(midTermGoalGroup);
  
  const midTermAmountGroup = createFormGroup('midTermAmount', 'Target Amount', 'number', '', '20000');
  midTermAmountGroup.style.marginTop = '16px';
  midTermSection.appendChild(midTermAmountGroup);
  
  form.appendChild(midTermSection);
  
  // Long-term goals
  const longTermSection = document.createElement('div');
  longTermSection.style.marginBottom = '32px';
  
  const longTermTitle = document.createElement('h3');
  longTermTitle.textContent = 'Long-Term Goal (5+ years)';
  longTermTitle.style.fontSize = '18px';
  longTermTitle.style.fontWeight = 'bold';
  longTermTitle.style.marginBottom = '16px';
  longTermSection.appendChild(longTermTitle);
  
  const longTermGoalGroup = createFormGroup('longTermGoal', 'Goal Description', 'text', '', 'E.g., Retirement fund or college savings');
  longTermSection.appendChild(longTermGoalGroup);
  
  const longTermAmountGroup = createFormGroup('longTermAmount', 'Target Amount', 'number', '', '100000');
  longTermAmountGroup.style.marginTop = '16px';
  longTermSection.appendChild(longTermAmountGroup);
  
  form.appendChild(longTermSection);
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';
  buttonContainer.style.marginTop = '24px';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = 'Back';
  backButton.classList.add('btn', 'btn-secondary');
  backButton.style.padding = '12px 24px';
  backButton.style.fontSize = '16px';
  backButton.style.fontWeight = '600';
  backButton.style.color = 'var(--color-text)';
  backButton.style.backgroundColor = 'var(--color-background)';
  backButton.style.border = '1px solid var(--color-border)';
  backButton.style.borderRadius = '8px';
  backButton.style.cursor = 'pointer';
  
  backButton.addEventListener('click', () => {
    updateOnboardingStep(appState.user.id, 'profile')
      .then(() => {
        appState.user.onboardingStep = 'profile';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  const nextButton = document.createElement('button');
  nextButton.type = 'submit';
  nextButton.textContent = 'Next';
  nextButton.classList.add('btn', 'btn-primary');
  nextButton.style.padding = '12px 24px';
  nextButton.style.fontSize = '16px';
  nextButton.style.fontWeight = '600';
  nextButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  nextButton.style.color = 'white';
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '8px';
  nextButton.style.cursor = 'pointer';
  
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(nextButton);
  form.appendChild(buttonContainer);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const goals = [
      {
        description: form.shortTermGoal.value,
        amount: parseFloat(form.shortTermAmount.value) || 0,
        type: 'short-term',
        progress: 0
      },
      {
        description: form.midTermGoal.value,
        amount: parseFloat(form.midTermAmount.value) || 0,
        type: 'mid-term',
        progress: 0
      },
      {
        description: form.longTermGoal.value,
        amount: parseFloat(form.longTermAmount.value) || 0,
        type: 'long-term',
        progress: 0
      }
    ].filter(goal => goal.description && goal.amount > 0);
    
    // Show loading state
    nextButton.disabled = true;
    nextButton.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Saving...';
    
    // Save goals and move to next step
    saveUserGoals(appState.user.id, goals)
      .then((response) => {
        console.log('Goals update response:', response);
        
        // Update app state
        appState.user.goals = goals;
        
        // Check if we're in offline mode
        if (response && response.offlineMode) {
          // Show a toast or notification that we're in offline mode
          const offlineNotice = document.createElement('div');
          offlineNotice.className = 'offline-notice';
          offlineNotice.innerHTML = `
            <div class="alert alert-warning" role="alert">
              <i class="fas fa-wifi-slash"></i> 
              You're currently in offline mode. Your goals will be saved locally until you reconnect.
              <button class="close" data-dismiss="alert">&times;</button>
            </div>
          `;
          document.body.appendChild(offlineNotice);
          
          // Remove the notice after 5 seconds
          setTimeout(() => {
            offlineNotice.remove();
          }, 5000);
        }
        
        // Move to next step regardless of online/offline status
        return updateOnboardingStep(appState.user.id, 'split-ratio');
      })
      .then(() => {
        appState.user.onboardingStep = 'split-ratio';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to save goals:', error);
        nextButton.disabled = false;
        nextButton.textContent = 'Next';
        
        // Create a more user-friendly error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message alert alert-danger';
        errorMessage.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          We encountered an issue saving your goals. Your data will be saved locally, and you can continue.
          <button class="btn btn-sm btn-primary ml-3" id="retry-goals-button">Retry</button>
          <button class="btn btn-sm btn-secondary ml-2" id="continue-anyway-button">Continue Anyway</button>
        `;
        
        // Insert the error message at the top of the form
        const formElement = document.querySelector('#goals-form');
        formElement.insertBefore(errorMessage, formElement.firstChild);
        
        // Add event listeners to the retry and continue buttons
        document.getElementById('retry-goals-button').addEventListener('click', (e) => {
          e.preventDefault();
          errorMessage.remove();
          nextButton.click();
        });
        
        document.getElementById('continue-anyway-button').addEventListener('click', (e) => {
          e.preventDefault();
          errorMessage.remove();
          
          // Force update app state
          appState.user.goals = goals;
          
          // Save to localStorage as backup
          try {
            localStorage.setItem('stackrGoals', JSON.stringify(goals));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          
          // Move to next step anyway
          appState.user.onboardingStep = 'split-ratio';
          navigateTo('onboarding');
        });
      });
  });
  
  container.appendChild(form);
}

// Split ratio step
function renderSplitRatioStep(container, appState) {
  const title = document.createElement('h2');
  title.textContent = 'Customize Your Split Ratio';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '24px';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.innerHTML = 'The default <strong>40/30/30</strong> split works well for many people, but you can customize it to fit your specific situation.';
  description.style.marginBottom = '32px';
  container.appendChild(description);
  
  // Enhanced current split ratio display
  const currentRatio = appState.user.splitRatio || { needs: 40, investments: 30, savings: 30 };
  
  // Container for the interactive split visualization
  const splitVisualContainer = document.createElement('div');
  splitVisualContainer.style.marginBottom = '40px';
  splitVisualContainer.classList.add('animated-element');
  splitVisualContainer.classList.add('delay-1');
  
  // Split ratio title
  const splitTitle = document.createElement('h3');
  splitTitle.textContent = 'Your Income Split';
  splitTitle.style.fontSize = '20px';
  splitTitle.style.fontWeight = '600';
  splitTitle.style.marginBottom = '16px';
  splitTitle.style.textAlign = 'center';
  splitVisualContainer.appendChild(splitTitle);
  
  // Interactive split bar
  const splitVisual = document.createElement('div');
  splitVisual.style.display = 'flex';
  splitVisual.style.width = '100%';
  splitVisual.style.height = '80px';
  splitVisual.style.borderRadius = '12px';
  splitVisual.style.overflow = 'hidden';
  splitVisual.style.marginBottom = '24px';
  splitVisual.style.position = 'relative';
  splitVisual.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
  splitVisual.style.cursor = 'pointer';
  
  // Helper function to create segments with enhanced styling
  const createSegment = (id, name, color, percentage, icon) => {
    const segment = document.createElement('div');
    segment.id = `${id}-segment`;
    segment.style.backgroundColor = `var(--color-${color})`;
    segment.style.width = `${percentage}%`;
    segment.style.display = 'flex';
    segment.style.alignItems = 'center';
    segment.style.justifyContent = 'center';
    segment.style.color = 'white';
    segment.style.fontWeight = 'bold';
    segment.style.fontSize = '16px';
    segment.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    segment.style.position = 'relative';
    segment.style.cursor = 'grab';
    segment.dataset.type = id;
    segment.dataset.value = percentage;
    
    // Create label with icon
    const labelContainer = document.createElement('div');
    labelContainer.style.display = 'flex';
    labelContainer.style.alignItems = 'center';
    labelContainer.style.gap = '8px';
    labelContainer.style.zIndex = '2';
    
    labelContainer.innerHTML = `${icon} <span>${percentage}% ${name}</span>`;
    
    // Decorative background pattern
    const pattern = document.createElement('div');
    pattern.style.position = 'absolute';
    pattern.style.top = '0';
    pattern.style.left = '0';
    pattern.style.right = '0';
    pattern.style.bottom = '0';
    pattern.style.backgroundImage = `radial-gradient(circle, rgba(255,255,255,0.15) 10%, transparent 10.5%)`;
    pattern.style.backgroundSize = '15px 15px';
    pattern.style.opacity = '0.5';
    
    // Resize handle for dragging
    const handle = document.createElement('div');
    handle.style.position = 'absolute';
    handle.style.right = '0';
    handle.style.top = '0';
    handle.style.bottom = '0';
    handle.style.width = '10px';
    handle.style.cursor = 'col-resize';
    handle.style.zIndex = '10';
    
    // Handle hover effects
    handle.addEventListener('mouseover', () => {
      handle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    });
    
    handle.addEventListener('mouseout', () => {
      handle.style.backgroundColor = 'transparent';
    });
    
    segment.appendChild(pattern);
    segment.appendChild(labelContainer);
    segment.appendChild(handle);
    
    return { segment, handle };
  };
  
  // Create the three segments with icons
  const needsIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
  const investmentsIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>';
  const savingsIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
  
  const { segment: needsSegment, handle: needsHandle } = createSegment('needs', 'Needs', 'needs', currentRatio.needs, needsIcon);
  const { segment: investmentsSegment, handle: investmentsHandle } = createSegment('investments', 'Inv', 'investments', currentRatio.investments, investmentsIcon);
  const { segment: savingsSegment, handle: savingsHandle } = createSegment('savings', 'Sav', 'savings', currentRatio.savings, savingsIcon);
  
  splitVisual.appendChild(needsSegment);
  splitVisual.appendChild(investmentsSegment);
  splitVisual.appendChild(savingsSegment);
  
  // Add interactive dragging functionality
  let isDragging = false;
  let startX = 0;
  let startWidth = 0;
  let currentHandle = null;
  let currentSegment = null;
  let nextSegment = null;
  
  // Setup drag handlers for needs & investments handles (savings auto-adjusts)
  [needsHandle, investmentsHandle].forEach((handle, index) => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      currentHandle = handle;
      currentSegment = index === 0 ? needsSegment : investmentsSegment;
      nextSegment = index === 0 ? investmentsSegment : savingsSegment;
      startWidth = parseFloat(currentSegment.style.width);
      
      document.body.style.cursor = 'col-resize';
      
      // Add temporary overlay to capture mouse events
      const overlay = document.createElement('div');
      overlay.id = 'drag-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.zIndex = '1000';
      overlay.style.cursor = 'col-resize';
      document.body.appendChild(overlay);
    });
  });
  
  // Mouse move handler for dragging
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentHandle || !currentSegment || !nextSegment) return;
    
    const deltaX = e.clientX - startX;
    const containerWidth = splitVisual.offsetWidth;
    const deltaPercentage = (deltaX / containerWidth) * 100;
    
    // Calculate new widths ensuring minimum 10% for each segment
    let newCurrentWidth = Math.max(10, Math.min(80, startWidth + deltaPercentage));
    
    // Update current segment width
    currentSegment.style.width = `${newCurrentWidth}%`;
    currentSegment.dataset.value = Math.round(newCurrentWidth);
    
    // Find the percentage in the label span and update it
    const currentLabel = currentSegment.querySelector('span');
    if (currentLabel) {
      currentLabel.textContent = `${Math.round(newCurrentWidth)}% ${currentSegment.dataset.type === 'needs' ? 'Needs' : 'Inv'}`;
    }
    
    // Adjust next segments to maintain total of 100%
    if (currentSegment.id === 'needs-segment') {
      // When adjusting needs, recalculate investments and savings
      const remainingPercentage = 100 - newCurrentWidth;
      const investmentsRatio = parseInt(investmentsSegment.dataset.value) / (parseInt(investmentsSegment.dataset.value) + parseInt(savingsSegment.dataset.value));
      
      let newInvestmentsWidth = Math.round(remainingPercentage * investmentsRatio);
      let newSavingsWidth = 100 - newCurrentWidth - newInvestmentsWidth;
      
      // Ensure minimums
      if (newInvestmentsWidth < 10) {
        newInvestmentsWidth = 10;
        newSavingsWidth = 100 - newCurrentWidth - newInvestmentsWidth;
      }
      
      if (newSavingsWidth < 10) {
        newSavingsWidth = 10;
        newInvestmentsWidth = 100 - newCurrentWidth - newSavingsWidth;
      }
      
      investmentsSegment.style.width = `${newInvestmentsWidth}%`;
      investmentsSegment.dataset.value = newInvestmentsWidth;
      savingsSegment.style.width = `${newSavingsWidth}%`;
      savingsSegment.dataset.value = newSavingsWidth;
      
      // Update labels
      const investmentsLabel = investmentsSegment.querySelector('span');
      const savingsLabel = savingsSegment.querySelector('span');
      
      if (investmentsLabel) investmentsLabel.textContent = `${newInvestmentsWidth}% Inv`;
      if (savingsLabel) savingsLabel.textContent = `${newSavingsWidth}% Sav`;
      
    } else if (currentSegment.id === 'investments-segment') {
      // When adjusting investments, only recalculate savings
      const needsWidth = parseInt(needsSegment.dataset.value);
      const newSavingsWidth = 100 - needsWidth - newCurrentWidth;
      
      if (newSavingsWidth >= 10) {
        savingsSegment.style.width = `${newSavingsWidth}%`;
        savingsSegment.dataset.value = newSavingsWidth;
        
        // Update savings label
        const savingsLabel = savingsSegment.querySelector('span');
        if (savingsLabel) savingsLabel.textContent = `${newSavingsWidth}% Sav`;
      }
    }
    
    // Update form sliders
    const needsSlider = document.getElementById('needs');
    const investmentsSlider = document.getElementById('investments');
    const savingsSlider = document.getElementById('savings');
    
    if (needsSlider && investmentsSlider && savingsSlider) {
      needsSlider.value = needsSegment.dataset.value;
      investmentsSlider.value = investmentsSegment.dataset.value;
      savingsSlider.value = savingsSegment.dataset.value;
      
      // Trigger the update function
      const event = new Event('input');
      needsSlider.dispatchEvent(event);
    }
  });
  
  // Mouse up handler to end dragging
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = '';
      currentHandle = null;
      currentSegment = null;
      nextSegment = null;
      
      // Remove temporary overlay
      const overlay = document.getElementById('drag-overlay');
      if (overlay) overlay.remove();
    }
  });
  
  splitVisualContainer.appendChild(splitVisual);
  
  // Legend with descriptions
  const splitLegend = document.createElement('div');
  splitLegend.style.display = 'flex';
  splitLegend.style.flexDirection = 'column';
  splitLegend.style.gap = '10px';
  splitLegend.style.marginBottom = '24px';
  
  const legendItems = [
    {
      color: 'needs',
      title: 'Needs',
      description: 'Essential expenses like housing, food, utilities, and transportation.'
    },
    {
      color: 'investments',
      title: 'Investments',
      description: 'Building your future through stocks, mutual funds, education, or your business.'
    },
    {
      color: 'savings',
      title: 'Savings',
      description: 'Emergency funds, big purchases, and peace of mind.'
    }
  ];
  
  legendItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.style.display = 'flex';
    legendItem.style.alignItems = 'flex-start';
    legendItem.style.gap = '10px';
    
    const colorDot = document.createElement('div');
    colorDot.style.width = '16px';
    colorDot.style.height = '16px';
    colorDot.style.borderRadius = '50%';
    colorDot.style.backgroundColor = `var(--color-${item.color})`;
    colorDot.style.marginTop = '4px';
    
    const legendContent = document.createElement('div');
    
    const legendTitle = document.createElement('div');
    legendTitle.textContent = item.title;
    legendTitle.style.fontWeight = '600';
    legendTitle.style.marginBottom = '4px';
    
    const legendDescription = document.createElement('div');
    legendDescription.textContent = item.description;
    legendDescription.style.fontSize = '14px';
    legendDescription.style.color = 'var(--color-text-secondary)';
    
    legendContent.appendChild(legendTitle);
    legendContent.appendChild(legendDescription);
    
    legendItem.appendChild(colorDot);
    legendItem.appendChild(legendContent);
    
    splitLegend.appendChild(legendItem);
  });
  
  // Tip about dragging
  const dragTip = document.createElement('div');
  dragTip.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
  dragTip.style.borderRadius = '8px';
  dragTip.style.padding = '12px 16px';
  dragTip.style.fontSize = '14px';
  dragTip.style.display = 'flex';
  dragTip.style.alignItems = 'center';
  dragTip.style.gap = '12px';
  dragTip.style.marginBottom = '24px';
  
  // Light bulb icon
  dragTip.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span><strong>Pro tip:</strong> Drag the dividers between segments to adjust your split ratio visually, or use the sliders below for precise control.</span>
  `;
  
  splitVisualContainer.appendChild(splitLegend);
  splitVisualContainer.appendChild(dragTip);
  container.appendChild(splitVisualContainer);
  
  // Create form for split ratio adjustment
  const form = document.createElement('form');
  form.id = 'split-ratio-form';
  
  // Needs slider
  const needsGroup = document.createElement('div');
  needsGroup.style.marginBottom = '24px';
  
  const needsLabel = document.createElement('div');
  needsLabel.style.display = 'flex';
  needsLabel.style.justifyContent = 'space-between';
  needsLabel.style.marginBottom = '8px';
  
  const needsTitle = document.createElement('label');
  needsTitle.htmlFor = 'needs';
  needsTitle.innerHTML = '<span style="color: var(--color-needs);">●</span> Needs';
  needsTitle.style.fontWeight = '500';
  
  const needsValue = document.createElement('span');
  needsValue.id = 'needs-value';
  needsValue.textContent = `${currentRatio.needs}%`;
  needsValue.style.fontWeight = '500';
  
  needsLabel.appendChild(needsTitle);
  needsLabel.appendChild(needsValue);
  needsGroup.appendChild(needsLabel);
  
  const needsSlider = document.createElement('input');
  needsSlider.type = 'range';
  needsSlider.id = 'needs';
  needsSlider.min = '10';
  needsSlider.max = '80';
  needsSlider.step = '5';
  needsSlider.value = currentRatio.needs;
  needsSlider.style.width = '100%';
  needsSlider.style.accentColor = 'var(--color-needs)';
  needsGroup.appendChild(needsSlider);
  
  form.appendChild(needsGroup);
  
  // Investments slider
  const investmentsGroup = document.createElement('div');
  investmentsGroup.style.marginBottom = '24px';
  
  const investmentsLabel = document.createElement('div');
  investmentsLabel.style.display = 'flex';
  investmentsLabel.style.justifyContent = 'space-between';
  investmentsLabel.style.marginBottom = '8px';
  
  const investmentsTitle = document.createElement('label');
  investmentsTitle.htmlFor = 'investments';
  investmentsTitle.innerHTML = '<span style="color: var(--color-investments);">●</span> Investments';
  investmentsTitle.style.fontWeight = '500';
  
  const investmentsValue = document.createElement('span');
  investmentsValue.id = 'investments-value';
  investmentsValue.textContent = `${currentRatio.investments}%`;
  investmentsValue.style.fontWeight = '500';
  
  investmentsLabel.appendChild(investmentsTitle);
  investmentsLabel.appendChild(investmentsValue);
  investmentsGroup.appendChild(investmentsLabel);
  
  const investmentsSlider = document.createElement('input');
  investmentsSlider.type = 'range';
  investmentsSlider.id = 'investments';
  investmentsSlider.min = '10';
  investmentsSlider.max = '80';
  investmentsSlider.step = '5';
  investmentsSlider.value = currentRatio.investments;
  investmentsSlider.style.width = '100%';
  investmentsSlider.style.accentColor = 'var(--color-investments)';
  investmentsGroup.appendChild(investmentsSlider);
  
  form.appendChild(investmentsGroup);
  
  // Savings slider
  const savingsGroup = document.createElement('div');
  savingsGroup.style.marginBottom = '24px';
  
  const savingsLabel = document.createElement('div');
  savingsLabel.style.display = 'flex';
  savingsLabel.style.justifyContent = 'space-between';
  savingsLabel.style.marginBottom = '8px';
  
  const savingsTitle = document.createElement('label');
  savingsTitle.htmlFor = 'savings';
  savingsTitle.innerHTML = '<span style="color: var(--color-savings);">●</span> Savings';
  savingsTitle.style.fontWeight = '500';
  
  const savingsValue = document.createElement('span');
  savingsValue.id = 'savings-value';
  savingsValue.textContent = `${currentRatio.savings}%`;
  savingsValue.style.fontWeight = '500';
  
  savingsLabel.appendChild(savingsTitle);
  savingsLabel.appendChild(savingsValue);
  savingsGroup.appendChild(savingsLabel);
  
  const savingsSlider = document.createElement('input');
  savingsSlider.type = 'range';
  savingsSlider.id = 'savings';
  savingsSlider.min = '10';
  savingsSlider.max = '80';
  savingsSlider.step = '5';
  savingsSlider.value = currentRatio.savings;
  savingsSlider.style.width = '100%';
  savingsSlider.style.accentColor = 'var(--color-savings)';
  savingsGroup.appendChild(savingsSlider);
  
  form.appendChild(savingsGroup);
  
  // Total display
  const totalGroup = document.createElement('div');
  totalGroup.style.backgroundColor = 'var(--color-background-secondary)';
  totalGroup.style.padding = '16px';
  totalGroup.style.borderRadius = '8px';
  totalGroup.style.marginBottom = '32px';
  totalGroup.style.textAlign = 'center';
  
  const totalLabel = document.createElement('div');
  totalLabel.textContent = 'Total:';
  totalLabel.style.marginBottom = '8px';
  totalLabel.style.fontWeight = '500';
  totalGroup.appendChild(totalLabel);
  
  const totalValue = document.createElement('div');
  totalValue.id = 'total-value';
  totalValue.textContent = '100%';
  totalValue.style.fontSize = '24px';
  totalValue.style.fontWeight = 'bold';
  totalValue.style.color = parseInt(totalValue.textContent) === 100 ? 'var(--color-success)' : 'var(--color-error)';
  totalGroup.appendChild(totalValue);
  
  const totalHint = document.createElement('div');
  totalHint.id = 'total-hint';
  totalHint.textContent = 'Your split ratio must add up to 100%';
  totalHint.style.fontSize = '14px';
  totalHint.style.color = 'var(--color-text-secondary)';
  totalHint.style.display = parseInt(totalValue.textContent) === 100 ? 'none' : 'block';
  totalGroup.appendChild(totalHint);
  
  form.appendChild(totalGroup);
  
  // Preset buttons
  const presetGroup = document.createElement('div');
  presetGroup.style.marginBottom = '32px';
  
  const presetTitle = document.createElement('h3');
  presetTitle.textContent = 'Try these common split ratios:';
  presetTitle.style.fontSize = '16px';
  presetTitle.style.fontWeight = '500';
  presetTitle.style.marginBottom = '16px';
  presetGroup.appendChild(presetTitle);
  
  const presetButtons = document.createElement('div');
  presetButtons.style.display = 'flex';
  presetButtons.style.flexWrap = 'wrap';
  presetButtons.style.gap = '8px';
  
  const presets = [
    { name: 'Balanced (40/30/30)', needs: 40, investments: 30, savings: 30 },
    { name: 'Debt Focus (50/20/30)', needs: 50, investments: 20, savings: 30 },
    { name: 'Wealth Builder (30/50/20)', needs: 30, investments: 50, savings: 20 },
    { name: 'Safety Net (40/20/40)', needs: 40, investments: 20, savings: 40 }
  ];
  
  presets.forEach(preset => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = preset.name;
    button.style.backgroundColor = 'var(--color-background)';
    button.style.border = '1px solid var(--color-border)';
    button.style.borderRadius = '8px';
    button.style.padding = '8px 12px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', () => {
      // Update sliders
      needsSlider.value = preset.needs;
      investmentsSlider.value = preset.investments;
      savingsSlider.value = preset.savings;
      
      // Update display values
      needsValue.textContent = `${preset.needs}%`;
      investmentsValue.textContent = `${preset.investments}%`;
      savingsValue.textContent = `${preset.savings}%`;
      
      // Update visual segments
      needsSegment.style.width = `${preset.needs}%`;
      needsSegment.textContent = `${preset.needs}% Needs`;
      investmentsSegment.style.width = `${preset.investments}%`;
      investmentsSegment.textContent = `${preset.investments}% Inv`;
      savingsSegment.style.width = `${preset.savings}%`;
      savingsSegment.textContent = `${preset.savings}% Sav`;
      
      // Update total
      const total = preset.needs + preset.investments + preset.savings;
      totalValue.textContent = `${total}%`;
      totalValue.style.color = total === 100 ? 'var(--color-success)' : 'var(--color-error)';
      totalHint.style.display = total === 100 ? 'none' : 'block';
    });
    
    presetButtons.appendChild(button);
  });
  
  presetGroup.appendChild(presetButtons);
  form.appendChild(presetGroup);
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';
  buttonContainer.style.marginTop = '24px';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = 'Back';
  backButton.classList.add('btn', 'btn-secondary');
  backButton.style.padding = '12px 24px';
  backButton.style.fontSize = '16px';
  backButton.style.fontWeight = '600';
  backButton.style.color = 'var(--color-text)';
  backButton.style.backgroundColor = 'var(--color-background)';
  backButton.style.border = '1px solid var(--color-border)';
  backButton.style.borderRadius = '8px';
  backButton.style.cursor = 'pointer';
  
  backButton.addEventListener('click', () => {
    updateOnboardingStep(appState.user.id, 'financial-goals')
      .then(() => {
        appState.user.onboardingStep = 'financial-goals';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  const nextButton = document.createElement('button');
  nextButton.type = 'submit';
  nextButton.textContent = 'Next';
  nextButton.classList.add('btn', 'btn-primary');
  nextButton.style.padding = '12px 24px';
  nextButton.style.fontSize = '16px';
  nextButton.style.fontWeight = '600';
  nextButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  nextButton.style.color = 'white';
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '8px';
  nextButton.style.cursor = 'pointer';
  
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(nextButton);
  form.appendChild(buttonContainer);
  
  // Slider change event handlers
  function updateTotalAndVisuals() {
    const needs = parseInt(needsSlider.value);
    const investments = parseInt(investmentsSlider.value);
    const savings = parseInt(savingsSlider.value);
    const total = needs + investments + savings;
    
    // Update display values
    needsValue.textContent = `${needs}%`;
    investmentsValue.textContent = `${investments}%`;
    savingsValue.textContent = `${savings}%`;
    
    // Update visual segments
    needsSegment.style.width = `${needs}%`;
    needsSegment.textContent = `${needs}% Needs`;
    investmentsSegment.style.width = `${investments}%`;
    investmentsSegment.textContent = `${investments}% Inv`;
    savingsSegment.style.width = `${savings}%`;
    savingsSegment.textContent = `${savings}% Sav`;
    
    // Update total
    totalValue.textContent = `${total}%`;
    totalValue.style.color = total === 100 ? 'var(--color-success)' : 'var(--color-error)';
    totalHint.style.display = total === 100 ? 'none' : 'block';
    
    // Disable next button if total isn't 100%
    nextButton.disabled = total !== 100;
    nextButton.style.opacity = total === 100 ? '1' : '0.5';
  }
  
  needsSlider.addEventListener('input', updateTotalAndVisuals);
  investmentsSlider.addEventListener('input', updateTotalAndVisuals);
  savingsSlider.addEventListener('input', updateTotalAndVisuals);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const needs = parseInt(needsSlider.value);
    const investments = parseInt(investmentsSlider.value);
    const savings = parseInt(savingsSlider.value);
    const total = needs + investments + savings;
    
    if (total !== 100) {
      alert('Your split ratio must add up to 100%');
      return;
    }
    
    const splitRatio = { needs, investments, savings };
    
    // Show loading state
    nextButton.disabled = true;
    nextButton.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Saving...';
    
    // Save split ratio and move to next step
    updateUserSplitRatio(appState.user.id, splitRatio)
      .then((response) => {
        console.log('Split ratio update response:', response);
        
        // Update app state
        appState.user.splitRatio = splitRatio;
        
        // Check if we're in offline mode
        if (response && response.offlineMode) {
          // Show a toast or notification that we're in offline mode
          const offlineNotice = document.createElement('div');
          offlineNotice.className = 'offline-notice';
          offlineNotice.innerHTML = `
            <div class="alert alert-warning" role="alert">
              <i class="fas fa-wifi-slash"></i> 
              You're currently in offline mode. Your split ratio will be saved locally until you reconnect.
              <button class="close" data-dismiss="alert">&times;</button>
            </div>
          `;
          document.body.appendChild(offlineNotice);
          
          // Remove the notice after 5 seconds
          setTimeout(() => {
            offlineNotice.remove();
          }, 5000);
        }
        
        // Move to next step regardless of online/offline status
        return updateOnboardingStep(appState.user.id, 'tutorial');
      })
      .then(() => {
        appState.user.onboardingStep = 'tutorial';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to save split ratio:', error);
        nextButton.disabled = false;
        nextButton.textContent = 'Next';
        
        // Create a more user-friendly error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message alert alert-danger';
        errorMessage.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          We encountered an issue saving your split ratio. Your data will be saved locally, and you can continue.
          <button class="btn btn-sm btn-primary ml-3" id="retry-split-button">Retry</button>
          <button class="btn btn-sm btn-secondary ml-2" id="continue-anyway-button">Continue Anyway</button>
        `;
        
        // Insert the error message at the top of the form
        const formElement = document.querySelector('#split-ratio-form');
        formElement.insertBefore(errorMessage, formElement.firstChild);
        
        // Add event listeners to the retry and continue buttons
        document.getElementById('retry-split-button').addEventListener('click', (e) => {
          e.preventDefault();
          errorMessage.remove();
          nextButton.click();
        });
        
        document.getElementById('continue-anyway-button').addEventListener('click', (e) => {
          e.preventDefault();
          errorMessage.remove();
          
          // Force update app state
          appState.user.splitRatio = splitRatio;
          
          // Save to localStorage as backup
          try {
            localStorage.setItem('stackrSplitRatio', JSON.stringify(splitRatio));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          
          // Move to next step anyway
          appState.user.onboardingStep = 'tutorial';
          navigateTo('onboarding');
        });
      });
  });
  
  container.appendChild(form);
  
  // Initialize the display
  updateTotalAndVisuals();
}

// Tutorial step
function renderTutorialStep(container, appState) {
  const title = document.createElement('h2');
  title.textContent = 'Getting Started with Stackr Finance';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '24px';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = 'Let\'s take a quick tour of the main features to help you get started.';
  description.style.marginBottom = '32px';
  container.appendChild(description);
  
  // Tutorial content
  const tutorialContainer = document.createElement('div');
  tutorialContainer.style.display = 'flex';
  tutorialContainer.style.flexDirection = 'column';
  tutorialContainer.style.gap = '24px';
  
  // Dashboard section
  const dashboardSection = createTutorialSection(
    'Dashboard',
    'This is your financial command center where you can see your overall financial health at a glance.',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>',
    [
      'View your 40/30/30 split visualization',
      'Track your income and expenses',
      'Monitor your financial goals progress',
      'See upcoming bill reminders'
    ]
  );
  tutorialContainer.appendChild(dashboardSection);
  
  // Income section
  const incomeSection = createTutorialSection(
    'Income Tracking',
    'Log your income sources and see how they align with your split ratio.',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    [
      'Add income sources manually',
      'Connect bank accounts for automatic updates',
      'View income history and trends',
      'Categorize income for better tracking'
    ]
  );
  tutorialContainer.appendChild(incomeSection);
  
  // Gigs section
  const gigsSection = createTutorialSection(
    'Stackr Gigs',
    'Discover new income opportunities and boost your earnings.',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
    [
      'Browse available gigs in your area',
      'Filter by category, pay rate, and more',
      'Apply for gigs directly through the platform',
      'Track your gig earnings and performance'
    ]
  );
  tutorialContainer.appendChild(gigsSection);
  
  container.appendChild(tutorialContainer);
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';
  buttonContainer.style.marginTop = '32px';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = 'Back';
  backButton.classList.add('btn', 'btn-secondary');
  backButton.style.padding = '12px 24px';
  backButton.style.fontSize = '16px';
  backButton.style.fontWeight = '600';
  backButton.style.color = 'var(--color-text)';
  backButton.style.backgroundColor = 'var(--color-background)';
  backButton.style.border = '1px solid var(--color-border)';
  backButton.style.borderRadius = '8px';
  backButton.style.cursor = 'pointer';
  
  backButton.addEventListener('click', () => {
    updateOnboardingStep(appState.user.id, 'split-ratio')
      .then(() => {
        appState.user.onboardingStep = 'split-ratio';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.textContent = 'Finish Setup';
  nextButton.classList.add('btn', 'btn-primary');
  nextButton.style.padding = '12px 24px';
  nextButton.style.fontSize = '16px';
  nextButton.style.fontWeight = '600';
  nextButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  nextButton.style.color = 'white';
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '8px';
  nextButton.style.cursor = 'pointer';
  
  nextButton.addEventListener('click', () => {
    updateOnboardingStep(appState.user.id, 'complete')
      .then(() => {
        appState.user.onboardingStep = 'complete';
        navigateTo('onboarding');
      })
      .catch(error => {
        console.error('Failed to update onboarding step:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(nextButton);
  container.appendChild(buttonContainer);
}

// Complete step
function renderCompleteStep(container, appState) {
  const title = document.createElement('h2');
  title.textContent = 'Setup Complete!';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '24px';
  container.appendChild(title);
  
  const confettiContainer = document.createElement('div');
  confettiContainer.style.textAlign = 'center';
  confettiContainer.style.marginBottom = '32px';
  confettiContainer.innerHTML = `
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="var(--color-success)" />
      <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
  container.appendChild(confettiContainer);
  
  const message = document.createElement('p');
  message.textContent = 'Congratulations! Your Stackr Finance account is set up and ready to go. You\'re now on your way to better financial management.';
  message.style.textAlign = 'center';
  message.style.fontSize = '18px';
  message.style.marginBottom = '32px';
  container.appendChild(message);
  
  const quote = document.createElement('div');
  quote.style.backgroundColor = 'var(--color-background-secondary)';
  quote.style.padding = '24px';
  quote.style.borderRadius = '8px';
  quote.style.marginBottom = '32px';
  quote.style.textAlign = 'center';
  quote.style.fontStyle = 'italic';
  
  const quoteText = document.createElement('p');
  quoteText.textContent = '"The best time to start managing your money was 5 years ago. The second best time is today."';
  quoteText.style.fontSize = '18px';
  quoteText.style.marginBottom = '8px';
  quote.appendChild(quoteText);
  
  container.appendChild(quote);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.marginTop = '32px';
  
  const dashboardButton = document.createElement('button');
  dashboardButton.type = 'button';
  dashboardButton.textContent = 'Go to Dashboard';
  dashboardButton.classList.add('btn', 'btn-primary');
  dashboardButton.style.padding = '16px 32px';
  dashboardButton.style.fontSize = '18px';
  dashboardButton.style.fontWeight = '600';
  dashboardButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  dashboardButton.style.color = 'white';
  dashboardButton.style.border = 'none';
  dashboardButton.style.borderRadius = '8px';
  dashboardButton.style.cursor = 'pointer';
  dashboardButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  dashboardButton.style.transition = 'all 0.2s ease';
  
  dashboardButton.addEventListener('mouseover', () => {
    dashboardButton.style.transform = 'translateY(-2px)';
    dashboardButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.15)';
  });
  
  dashboardButton.addEventListener('mouseout', () => {
    dashboardButton.style.transform = 'translateY(0)';
    dashboardButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  });
  
  dashboardButton.addEventListener('click', () => {
    // Mark onboarding as completed
    completeOnboarding(appState.user.id)
      .then(() => {
        // Update app state and ensure localStorage is synced
        appState.user.onboardingCompleted = true;
        appState.user.onboardingStep = 'complete';
        
        // Force update localStorage with the current app state
        try {
          const userData = localStorage.getItem('stackrUser');
          if (userData) {
            const user = JSON.parse(userData);
            user.onboardingCompleted = true;
            user.onboardingStep = 'complete';
            localStorage.setItem('stackrUser', JSON.stringify(user));
            console.log('Updated user data in localStorage before navigating to dashboard');
          }
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        // Navigate to dashboard
        navigateTo('dashboard');
      })
      .catch(error => {
        console.error('Failed to complete onboarding:', error);
        
        // Update app state anyway to prevent redirect loop
        appState.user.onboardingCompleted = true;
        appState.user.onboardingStep = 'complete';
        
        // Force update localStorage with the current app state even in error case
        try {
          const userData = localStorage.getItem('stackrUser');
          if (userData) {
            const user = JSON.parse(userData);
            user.onboardingCompleted = true;
            user.onboardingStep = 'complete';
            localStorage.setItem('stackrUser', JSON.stringify(user));
            console.log('Updated user data in localStorage (error fallback)');
          }
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        // Navigate to dashboard even if there was an error
        navigateTo('dashboard');
      });
  });
  
  buttonContainer.appendChild(dashboardButton);
  container.appendChild(buttonContainer);
}

// Helper functions

// Create a form group with appropriate autocomplete attributes
function createFormGroup(id, label, type, value, placeholder = '') {
  const group = document.createElement('div');
  group.classList.add('form-group');
  group.style.marginBottom = '16px';
  
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelEl.style.display = 'block';
  labelEl.style.marginBottom = '8px';
  labelEl.style.fontWeight = '500';
  
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = id;
  input.value = value;
  input.placeholder = placeholder;
  input.style.width = '100%';
  input.style.padding = '12px';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid var(--color-border)';
  input.style.fontSize = '16px';
  
  // Add autocomplete attributes based on input ID and type
  switch(id) {
    case 'firstName':
      input.autocomplete = 'given-name';
      break;
    case 'lastName':
      input.autocomplete = 'family-name';
      break;
    case 'email':
      input.autocomplete = 'email';
      break;
    case 'username':
      input.autocomplete = 'username';
      break;
    case 'password':
      input.autocomplete = 'current-password';
      break;
    case 'occupation':
      input.autocomplete = 'organization-title';
      break;
    case 'about':
      input.autocomplete = 'off'; // Biographical info doesn't need autocomplete
      break;
    case 'shortTermGoal':
    case 'midTermGoal':
    case 'longTermGoal':
      input.autocomplete = 'off'; // Goals are custom inputs
      break;
    case 'shortTermAmount':
    case 'midTermAmount':
    case 'longTermAmount':
      input.autocomplete = 'off'; // Amounts are custom inputs
      input.inputMode = 'decimal'; // Help mobile users with numeric input
      if (type === 'number') {
        input.step = '0.01'; // Allow decimal amounts for currency
      }
      break;
    default:
      // For other numeric fields, add numeric input attributes
      if (type === 'number') {
        input.inputMode = 'decimal';
        input.step = '0.01';
        input.autocomplete = 'off';
      } else if (type === 'tel') {
        input.autocomplete = 'tel';
        input.inputMode = 'tel';
      } else if (type === 'date') {
        input.autocomplete = 'off';
      } else {
        input.autocomplete = 'on'; // Default to on for other fields
      }
  }
  
  // Add data list for occupation if applicable
  if (id === 'occupation') {
    const dataList = document.createElement('datalist');
    dataList.id = `${id}-options`;
    
    const commonOccupations = [
      'Software Developer', 'Designer', 'Marketer', 'Freelancer', 
      'Teacher', 'Student', 'Business Owner', 'Consultant',
      'Writer', 'Artist', 'Engineer', 'Financial Advisor'
    ];
    
    commonOccupations.forEach(occupation => {
      const option = document.createElement('option');
      option.value = occupation;
      dataList.appendChild(option);
    });
    
    input.setAttribute('list', dataList.id);
    group.appendChild(dataList);
  }
  
  group.appendChild(labelEl);
  group.appendChild(input);
  
  return group;
}

// Create a tutorial section
function createTutorialSection(title, description, icon, features) {
  const section = document.createElement('div');
  section.style.backgroundColor = 'var(--color-background-secondary)';
  section.style.padding = '24px';
  section.style.borderRadius = '12px';
  
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '16px';
  header.style.gap = '16px';
  
  const iconContainer = document.createElement('div');
  iconContainer.style.backgroundColor = 'var(--color-primary-light)';
  iconContainer.style.color = 'var(--color-primary)';
  iconContainer.style.borderRadius = '12px';
  iconContainer.style.width = '48px';
  iconContainer.style.height = '48px';
  iconContainer.style.display = 'flex';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.justifyContent = 'center';
  iconContainer.innerHTML = icon;
  header.appendChild(iconContainer);
  
  const titleContainer = document.createElement('div');
  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.style.fontSize = '18px';
  titleEl.style.fontWeight = 'bold';
  titleEl.style.margin = '0';
  titleContainer.appendChild(titleEl);
  
  const descriptionEl = document.createElement('p');
  descriptionEl.textContent = description;
  descriptionEl.style.fontSize = '14px';
  descriptionEl.style.color = 'var(--color-text-secondary)';
  descriptionEl.style.margin = '4px 0 0 0';
  titleContainer.appendChild(descriptionEl);
  
  header.appendChild(titleContainer);
  section.appendChild(header);
  
  const featuresList = document.createElement('ul');
  featuresList.style.listStyleType = 'none';
  featuresList.style.padding = '0';
  featuresList.style.margin = '0';
  
  features.forEach(feature => {
    const featureItem = document.createElement('li');
    featureItem.style.display = 'flex';
    featureItem.style.alignItems = 'center';
    featureItem.style.gap = '8px';
    featureItem.style.marginBottom = '8px';
    
    featureItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${feature}</span>
    `;
    
    featuresList.appendChild(featureItem);
  });
  
  section.appendChild(featuresList);
  return section;
}

// API calls

// Update onboarding step - export to make it available to other modules
export async function updateOnboardingStep(userId, step, retryCount = 0) {
  try {
    // Always update local storage first to ensure UI flow continues even if API fails
    try {
      // Update localStorage onboarding state
      localStorage.setItem('stackrOnboardingStep', step);
      
      // If this is the "complete" step, also update the completed flag
      if (step === 'complete') {
        localStorage.setItem('stackrOnboardingCompleted', 'true');
      }
      
      // Also update the user object in localStorage if it exists
      const userData = localStorage.getItem('stackrUser');
      if (userData) {
        const user = JSON.parse(userData);
        user.onboardingStep = step;
        if (step === 'complete') {
          user.onboardingCompleted = true;
        }
        localStorage.setItem('stackrUser', JSON.stringify(user));
      }
      
      // Update the application state if accessible
      if (window.appState && window.appState.user) {
        window.appState.user.onboardingStep = step;
        if (step === 'complete') {
          window.appState.user.onboardingCompleted = true;
        }
      }
      
      console.log('Updated onboarding step in local storage:', step);
    } catch (e) {
      console.error('Failed to update local storage:', e);
    }
    
    // Get all possible auth tokens
    const token = getToken();
    console.log('Token available:', !!token);
    
    // Build complete auth headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the request with improved error handling
    const response = await fetch(`/api/users/${userId}/onboarding`, {
      method: 'PATCH',
      headers: headers,
      credentials: 'include', // Important for sending cookies
      body: JSON.stringify({ onboardingStep: step })
    });
    
    if (!response.ok) {
      // Get detailed error info
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error('Server response:', response.status, errorText);
      
      // Special handling for invalid user ID errors
      if (response.status === 400 && errorText.includes('Invalid user ID')) {
        console.log('Invalid user ID detected. Using generic user ID as fallback.');
        
        // If the API doesn't recognize this user ID, try with a simplified format
        // This could happen when using OAuth IDs that contain special characters
        if (retryCount < 1) {
          // Try using a simpler user ID format (like a numeric ID)
          const simpleUserId = localStorage.getItem('stackrSimpleUserId') || '1';
          return updateOnboardingStep(simpleUserId, step, retryCount + 1);
        }
      }
      
      // Implement retry logic for 401/403 errors (auth issues)
      if ((response.status === 401 || response.status === 403) && retryCount < 2) {
        console.log(`Auth error, retrying (attempt ${retryCount + 1})...`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force token refresh if possible
        refreshAuthToken();
        
        // Retry with incremented retry count
        return updateOnboardingStep(userId, step, retryCount + 1);
      }
      
      throw new Error(`Failed to update onboarding step: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    
    // Since we already updated the local state at the beginning of the function,
    // we can just return a successful result to continue the UI flow
    console.log('Using fallback method to continue onboarding');
    
    return { success: true, onboardingStep: step };
  }
}

// Function to attempt token refresh if needed
function refreshAuthToken() {
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem('stackrUser');
    if (userData) {
      const user = JSON.parse(userData);
      if (user && user.token) {
        // Re-save the token to ensure it's accessible
        localStorage.setItem('stackrToken', user.token);
        
        return true;
      }
    }
  } catch (e) {
    console.error('Error refreshing auth token:', e);
  }
  return false;
}

// Complete onboarding with improved error handling and retry logic
async function completeOnboarding(userId, retryCount = 0) {
  try {
    // Always update local storage first to ensure the user experience continues
    try {
      // Update localStorage onboarding state
      localStorage.setItem('stackrOnboardingStep', 'complete');
      localStorage.setItem('stackrOnboardingCompleted', 'true');
      
      // Also update the user object in localStorage if it exists
      const userData = localStorage.getItem('stackrUser');
      if (userData) {
        const user = JSON.parse(userData);
        user.onboardingCompleted = true;
        user.onboardingStep = 'complete';
        localStorage.setItem('stackrUser', JSON.stringify(user));
        console.log('Updated onboarding completion status in local storage');
      } else {
        console.warn('No user data found in local storage to update');
      }
      
      // Update the application state if accessible
      if (window.appState && window.appState.user) {
        window.appState.user.onboardingCompleted = true;
        window.appState.user.onboardingStep = 'complete';
      }
    } catch (e) {
      console.error('Failed to update local storage:', e);
    }
    
    const token = getToken();
    
    // Build complete auth headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/users/${userId}/onboarding`, {
      method: 'PATCH',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({ 
        onboardingStep: 'complete', 
        onboardingCompleted: true 
      })
    });
    
    if (!response.ok) {
      // Get detailed error info
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error('Server response:', response.status, errorText);
      
      // Special handling for invalid user ID errors
      if (response.status === 400 && errorText.includes('Invalid user ID')) {
        console.log('Invalid user ID detected while completing onboarding. Using generic user ID as fallback.');
        
        // If the API doesn't recognize this user ID, try with a simplified format
        if (retryCount < 1) {
          // Try using a simpler user ID format
          const simpleUserId = localStorage.getItem('stackrSimpleUserId') || '1';
          return completeOnboarding(simpleUserId, retryCount + 1);
        }
      }
      
      // Implement retry logic for 401/403 errors (auth issues)
      if ((response.status === 401 || response.status === 403) && retryCount < 2) {
        console.log(`Auth error, retrying completion (attempt ${retryCount + 1})...`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force token refresh if possible
        refreshAuthToken();
        
        // Retry with incremented retry count
        return completeOnboarding(userId, retryCount + 1);
      }
      
      throw new Error(`Failed to complete onboarding: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error completing onboarding:', error);
    
    // Since we already updated the local state at the beginning of the function,
    // we can just return a successful result to continue the user flow
    console.log('Using fallback method to continue from onboarding');
    
    return { success: true, onboardingCompleted: true };
  }
}

// Update user profile with improved error handling and retry logic
async function updateUserProfile(userId, profileData, retryCount = 0) {
  try {
    const token = getToken();
    
    // Build complete auth headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/users/${userId}/profile`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      // Get detailed error info
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error('Server response:', response.status, errorText);
      
      // Implement retry logic for 401/403 errors (auth issues)
      if ((response.status === 401 || response.status === 403) && retryCount < 2) {
        console.log(`Auth error, retrying profile update (attempt ${retryCount + 1})...`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force token refresh if possible
        refreshAuthToken();
        
        // Retry with incremented retry count
        return updateUserProfile(userId, profileData, retryCount + 1);
      }
      
      throw new Error(`Failed to update user profile: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Save the profile data locally as fallback
    try {
      const currentUserData = localStorage.getItem('stackrUser');
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        const updatedUserData = { ...userData, ...profileData };
        localStorage.setItem('stackrUser', JSON.stringify(updatedUserData));
      }
    } catch (e) {
      console.error('Failed to save profile data locally:', e);
    }
    
    // Instead of rethrowing, return a successful result to let onboarding continue
    // but make sure we indicate that we're using offline data
    return { 
      success: true, 
      offlineMode: true,
      ...profileData
    };
  }
}

// Save user goals with improved error handling and retry logic
async function saveUserGoals(userId, goals, retryCount = 0) {
  try {
    const token = getToken();
    
    // Build complete auth headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/users/${userId}/goals`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({ goals })
    });
    
    if (!response.ok) {
      // Get detailed error info
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error('Server response:', response.status, errorText);
      
      // Implement retry logic for 401/403 errors (auth issues)
      if ((response.status === 401 || response.status === 403) && retryCount < 2) {
        console.log(`Auth error, retrying goals save (attempt ${retryCount + 1})...`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force token refresh if possible
        refreshAuthToken();
        
        // Retry with incremented retry count
        return saveUserGoals(userId, goals, retryCount + 1);
      }
      
      throw new Error(`Failed to save user goals: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving user goals:', error);
    
    // Save goals locally as fallback
    try {
      localStorage.setItem('stackrGoals', JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals locally:', e);
    }
    
    // Continue without rethrowing to allow the user to proceed with onboarding
    return { success: true, goals };
  }
}

// Update user split ratio with improved error handling and retry logic
async function updateUserSplitRatio(userId, splitRatio, retryCount = 0) {
  try {
    const token = getToken();
    
    // Build complete auth headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/users/${userId}/profile`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({ splitRatio })
    });
    
    if (!response.ok) {
      // Get detailed error info
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error('Server response:', response.status, errorText);
      
      // Implement retry logic for 401/403 errors (auth issues)
      if ((response.status === 401 || response.status === 403) && retryCount < 2) {
        console.log(`Auth error, retrying split ratio update (attempt ${retryCount + 1})...`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force token refresh if possible
        refreshAuthToken();
        
        // Retry with incremented retry count
        return updateUserSplitRatio(userId, splitRatio, retryCount + 1);
      }
      
      throw new Error(`Failed to update split ratio: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating split ratio:', error);
    
    // Save split ratio locally as fallback
    try {
      localStorage.setItem('stackrSplitRatio', JSON.stringify(splitRatio));
    } catch (e) {
      console.error('Failed to save split ratio locally:', e);
    }
    
    // Continue without rethrowing to allow the user to proceed with onboarding
    return { success: true, splitRatio };
  }
}

// Get token from storage
function getToken() {
  return localStorage.getItem('stackrToken') || sessionStorage.getItem('stackrToken');
}