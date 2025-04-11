/**
 * Onboarding Page Component for GREEN version
 * This file handles user onboarding experience
 */

// Export navigateTo function so it can be used externally
export function navigateTo(page) {
  // If window is available, this will be imported and used by the src/main.js
  if (typeof window !== 'undefined' && window.navigateTo) {
    window.navigateTo(page);
  }
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
  const container = document.createElement('div');
  container.classList.add('onboarding-container');
  container.style.maxWidth = '960px';
  container.style.margin = '0 auto';
  container.style.padding = '40px 20px';
  
  const currentStep = appState.user.onboardingStep || 'welcome';
  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  
  // Header section with progress
  const header = document.createElement('div');
  header.classList.add('onboarding-header');
  header.style.marginBottom = '40px';
  header.style.textAlign = 'center';
  
  const title = document.createElement('h1');
  title.textContent = 'Welcome to Stackr Finance';
  title.style.fontSize = '32px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  title.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  title.style.WebkitBackgroundClip = 'text';
  title.style.WebkitTextFillColor = 'transparent';
  title.style.backgroundClip = 'text';
  header.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Let\'s set up your account to make the most of your financial journey.';
  subtitle.style.fontSize = '16px';
  subtitle.style.color = 'var(--color-text-secondary)';
  subtitle.style.marginBottom = '32px';
  header.appendChild(subtitle);
  
  // Progress bar
  const progressContainer = document.createElement('div');
  progressContainer.style.display = 'flex';
  progressContainer.style.justifyContent = 'space-between';
  progressContainer.style.position = 'relative';
  progressContainer.style.maxWidth = '700px';
  progressContainer.style.margin = '0 auto';
  
  // Progress line
  const progressLine = document.createElement('div');
  progressLine.style.position = 'absolute';
  progressLine.style.top = '14px';
  progressLine.style.left = '0';
  progressLine.style.right = '0';
  progressLine.style.height = '2px';
  progressLine.style.backgroundColor = 'var(--color-border)';
  progressLine.style.zIndex = '1';
  progressContainer.appendChild(progressLine);
  
  // Progress line fill
  const progressFill = document.createElement('div');
  progressFill.style.position = 'absolute';
  progressFill.style.top = '14px';
  progressFill.style.left = '0';
  progressFill.style.height = '2px';
  progressFill.style.backgroundColor = 'var(--color-primary)';
  progressFill.style.zIndex = '2';
  progressFill.style.width = `${(currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100}%`;
  progressFill.style.transition = 'width 0.3s ease';
  progressContainer.appendChild(progressFill);
  
  // Step indicators
  const stepTitles = ['Welcome', 'Profile', 'Goals', 'Split Ratio', 'Tutorial', 'Complete'];
  
  ONBOARDING_STEPS.forEach((step, index) => {
    const stepContainer = document.createElement('div');
    stepContainer.style.display = 'flex';
    stepContainer.style.flexDirection = 'column';
    stepContainer.style.alignItems = 'center';
    stepContainer.style.position = 'relative';
    stepContainer.style.zIndex = '3';
    
    const stepIndicator = document.createElement('div');
    stepIndicator.style.width = '30px';
    stepIndicator.style.height = '30px';
    stepIndicator.style.borderRadius = '50%';
    stepIndicator.style.display = 'flex';
    stepIndicator.style.alignItems = 'center';
    stepIndicator.style.justifyContent = 'center';
    stepIndicator.style.marginBottom = '8px';
    stepIndicator.style.transition = 'all 0.3s ease';
    
    if (index < currentStepIndex) {
      // Completed step
      stepIndicator.style.backgroundColor = 'var(--color-primary)';
      stepIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (index === currentStepIndex) {
      // Current step
      stepIndicator.style.backgroundColor = 'var(--color-primary)';
      stepIndicator.style.color = 'white';
      stepIndicator.textContent = (index + 1).toString();
      stepIndicator.style.fontWeight = 'bold';
    } else {
      // Future step
      stepIndicator.style.backgroundColor = 'white';
      stepIndicator.style.border = '2px solid var(--color-border)';
      stepIndicator.style.color = 'var(--color-text-secondary)';
      stepIndicator.textContent = (index + 1).toString();
    }
    
    const stepTitle = document.createElement('span');
    stepTitle.textContent = stepTitles[index];
    stepTitle.style.fontSize = '12px';
    stepTitle.style.color = index <= currentStepIndex ? 'var(--color-text)' : 'var(--color-text-secondary)';
    stepTitle.style.fontWeight = index === currentStepIndex ? 'bold' : 'normal';
    
    stepContainer.appendChild(stepIndicator);
    stepContainer.appendChild(stepTitle);
    progressContainer.appendChild(stepContainer);
  });
  
  header.appendChild(progressContainer);
  container.appendChild(header);
  
  // Content container
  const content = document.createElement('div');
  content.classList.add('onboarding-content');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '12px';
  content.style.padding = '40px';
  content.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
  content.style.marginBottom = '24px';
  
  // Render different content based on current step
  switch (currentStep) {
    case 'welcome':
      renderWelcomeStep(content, appState);
      break;
    case 'profile':
      renderProfileStep(content, appState);
      break;
    case 'financial-goals':
      renderGoalsStep(content, appState);
      break;
    case 'split-ratio':
      renderSplitRatioStep(content, appState);
      break;
    case 'tutorial':
      renderTutorialStep(content, appState);
      break;
    case 'complete':
      renderCompleteStep(content, appState);
      break;
    default:
      renderWelcomeStep(content, appState);
  }
  
  container.appendChild(content);
  
  return container;
}

// Welcome step
function renderWelcomeStep(container, appState) {
  const title = document.createElement('h2');
  title.textContent = 'Welcome to Stackr Finance!';
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '16px';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.innerHTML = `We're thrilled to have you join us on your financial journey. Stackr Finance is designed to help service providers and freelancers like you manage your income and build wealth through our unique <strong>40/30/30 Split System</strong>.`;
  description.style.marginBottom = '24px';
  description.style.lineHeight = '1.6';
  container.appendChild(description);
  
  // Add explanation of the 40/30/30 split
  const splitExplanation = document.createElement('div');
  splitExplanation.style.backgroundColor = 'var(--color-background-secondary)';
  splitExplanation.style.padding = '24px';
  splitExplanation.style.borderRadius = '8px';
  splitExplanation.style.marginBottom = '32px';
  
  const splitTitle = document.createElement('h3');
  splitTitle.textContent = 'The 40/30/30 Split System';
  splitTitle.style.fontSize = '18px';
  splitTitle.style.fontWeight = 'bold';
  splitTitle.style.marginBottom = '16px';
  splitExplanation.appendChild(splitTitle);
  
  // Split visualization
  const splitVisual = document.createElement('div');
  splitVisual.style.display = 'flex';
  splitVisual.style.width = '100%';
  splitVisual.style.height = '64px';
  splitVisual.style.borderRadius = '8px';
  splitVisual.style.overflow = 'hidden';
  splitVisual.style.marginBottom = '16px';
  
  const needsSegment = document.createElement('div');
  needsSegment.style.backgroundColor = 'var(--color-needs)';
  needsSegment.style.width = '40%';
  needsSegment.style.display = 'flex';
  needsSegment.style.alignItems = 'center';
  needsSegment.style.justifyContent = 'center';
  needsSegment.style.color = 'white';
  needsSegment.style.fontWeight = 'bold';
  needsSegment.textContent = '40% Needs';
  splitVisual.appendChild(needsSegment);
  
  const investmentsSegment = document.createElement('div');
  investmentsSegment.style.backgroundColor = 'var(--color-investments)';
  investmentsSegment.style.width = '30%';
  investmentsSegment.style.display = 'flex';
  investmentsSegment.style.alignItems = 'center';
  investmentsSegment.style.justifyContent = 'center';
  investmentsSegment.style.color = 'white';
  investmentsSegment.style.fontWeight = 'bold';
  investmentsSegment.textContent = '30% Investments';
  splitVisual.appendChild(investmentsSegment);
  
  const savingsSegment = document.createElement('div');
  savingsSegment.style.backgroundColor = 'var(--color-savings)';
  savingsSegment.style.width = '30%';
  savingsSegment.style.display = 'flex';
  savingsSegment.style.alignItems = 'center';
  savingsSegment.style.justifyContent = 'center';
  savingsSegment.style.color = 'white';
  savingsSegment.style.fontWeight = 'bold';
  savingsSegment.textContent = '30% Savings';
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
  
  const featuresTitle = document.createElement('h3');
  featuresTitle.textContent = 'What You\'ll Be Able To Do:';
  featuresTitle.style.fontSize = '18px';
  featuresTitle.style.fontWeight = 'bold';
  featuresTitle.style.marginBottom = '16px';
  container.appendChild(featuresTitle);
  
  const featuresList = document.createElement('ul');
  featuresList.style.paddingLeft = '20px';
  featuresList.style.marginBottom = '32px';
  
  const features = [
    'Track income and visualize your 40/30/30 split',
    'Connect your bank accounts for automatic updates',
    'Set and track financial goals',
    'Discover new income opportunities through Stackr Gigs',
    'Get personalized financial advice',
    'Join money challenges to boost your savings'
  ];
  
  features.forEach(feature => {
    const featureItem = document.createElement('li');
    featureItem.textContent = feature;
    featureItem.style.marginBottom = '8px';
    featureItem.style.lineHeight = '1.5';
    featuresList.appendChild(featureItem);
  });
  
  container.appendChild(featuresList);
  
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
      .then(() => {
        // Update app state
        appState.user.firstName = formData.firstName;
        appState.user.lastName = formData.lastName;
        appState.user.occupation = formData.occupation;
        appState.user.about = formData.about;
        
        // Move to next step
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
        alert('There was an error saving your profile. Please try again.');
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
      .then(() => {
        // Update app state
        appState.user.goals = goals;
        
        // Move to next step
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
        alert('There was an error saving your goals. Please try again.');
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
  
  // Current split ratio display
  const currentRatio = appState.user.splitRatio || { needs: 40, investments: 30, savings: 30 };
  
  const splitVisual = document.createElement('div');
  splitVisual.style.display = 'flex';
  splitVisual.style.width = '100%';
  splitVisual.style.height = '64px';
  splitVisual.style.borderRadius = '8px';
  splitVisual.style.overflow = 'hidden';
  splitVisual.style.marginBottom = '32px';
  
  const needsSegment = document.createElement('div');
  needsSegment.id = 'needs-segment';
  needsSegment.style.backgroundColor = 'var(--color-needs)';
  needsSegment.style.width = `${currentRatio.needs}%`;
  needsSegment.style.display = 'flex';
  needsSegment.style.alignItems = 'center';
  needsSegment.style.justifyContent = 'center';
  needsSegment.style.color = 'white';
  needsSegment.style.fontWeight = 'bold';
  needsSegment.style.transition = 'width 0.3s ease';
  needsSegment.textContent = `${currentRatio.needs}% Needs`;
  splitVisual.appendChild(needsSegment);
  
  const investmentsSegment = document.createElement('div');
  investmentsSegment.id = 'investments-segment';
  investmentsSegment.style.backgroundColor = 'var(--color-investments)';
  investmentsSegment.style.width = `${currentRatio.investments}%`;
  investmentsSegment.style.display = 'flex';
  investmentsSegment.style.alignItems = 'center';
  investmentsSegment.style.justifyContent = 'center';
  investmentsSegment.style.color = 'white';
  investmentsSegment.style.fontWeight = 'bold';
  investmentsSegment.style.transition = 'width 0.3s ease';
  investmentsSegment.textContent = `${currentRatio.investments}% Inv`;
  splitVisual.appendChild(investmentsSegment);
  
  const savingsSegment = document.createElement('div');
  savingsSegment.id = 'savings-segment';
  savingsSegment.style.backgroundColor = 'var(--color-savings)';
  savingsSegment.style.width = `${currentRatio.savings}%`;
  savingsSegment.style.display = 'flex';
  savingsSegment.style.alignItems = 'center';
  savingsSegment.style.justifyContent = 'center';
  savingsSegment.style.color = 'white';
  savingsSegment.style.fontWeight = 'bold';
  savingsSegment.style.transition = 'width 0.3s ease';
  savingsSegment.textContent = `${currentRatio.savings}% Sav`;
  splitVisual.appendChild(savingsSegment);
  
  container.appendChild(splitVisual);
  
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
      .then(() => {
        // Update app state
        appState.user.splitRatio = splitRatio;
        
        // Move to next step
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
        alert('There was an error saving your split ratio. Please try again.');
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
        appState.user.onboardingCompleted = true;
        navigateTo('dashboard');
      })
      .catch(error => {
        console.error('Failed to complete onboarding:', error);
        alert('There was an error. Please try again.');
      });
  });
  
  buttonContainer.appendChild(dashboardButton);
  container.appendChild(buttonContainer);
}

// Helper functions

// Create a form group
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

// Update onboarding step
async function updateOnboardingStep(userId, step) {
  try {
    const response = await fetch(`/api/users/${userId}/onboarding`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ onboardingStep: step })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update onboarding step');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    throw error;
  }
}

// Complete onboarding
async function completeOnboarding(userId) {
  try {
    const response = await fetch(`/api/users/${userId}/onboarding`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ 
        onboardingStep: 'complete', 
        onboardingCompleted: true 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete onboarding');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

// Update user profile
async function updateUserProfile(userId, profileData) {
  try {
    const response = await fetch(`/api/users/${userId}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Save user goals
async function saveUserGoals(userId, goals) {
  try {
    const response = await fetch(`/api/users/${userId}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ goals })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save user goals');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving user goals:', error);
    throw error;
  }
}

// Update user split ratio
async function updateUserSplitRatio(userId, splitRatio) {
  try {
    const response = await fetch(`/api/users/${userId}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ splitRatio })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update split ratio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating split ratio:', error);
    throw error;
  }
}

// Get token from storage
function getToken() {
  return localStorage.getItem('stackrToken') || sessionStorage.getItem('stackrToken');
}