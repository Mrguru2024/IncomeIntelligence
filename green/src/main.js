/**
 * Stackr Finance GREEN Edition
 * Firebase-free version
 * 
 * A financial management platform designed for service providers
 * with intelligent 40/30/30 income allocation and tracking
 */

console.log('Starting GREEN Firebase-free version of Stackr Finance');

// Setup modern design system with CSS variables
function setupDesignSystem() {
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-primary', '#34A853');
  root.style.setProperty('--color-primary-dark', '#2E8545');
  root.style.setProperty('--color-primary-light', '#6FCF8A');
  root.style.setProperty('--color-accent', '#4285F4');
  root.style.setProperty('--color-accent-dark', '#3B77DB');
  root.style.setProperty('--color-secondary', '#FBBC05');
  root.style.setProperty('--color-error', '#EA4335');
  root.style.setProperty('--color-success', '#34A853');
  root.style.setProperty('--color-tertiary', '#3b82f6');
  
  // Neutral colors
  root.style.setProperty('--color-background', '#FFFFFF');
  root.style.setProperty('--color-card', '#F9FAFB');
  root.style.setProperty('--color-border', '#E5E7EB');
  root.style.setProperty('--color-text', '#111827');
  root.style.setProperty('--color-text-secondary', '#4B5563');
  root.style.setProperty('--color-text-muted', '#6B7280');
  
  // Typography
  root.style.setProperty('--font-family', "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
  root.style.setProperty('--font-size-xs', '0.75rem');
  root.style.setProperty('--font-size-sm', '0.875rem');
  root.style.setProperty('--font-size-base', '1rem');
  root.style.setProperty('--font-size-lg', '1.125rem');
  root.style.setProperty('--font-size-xl', '1.25rem');
  root.style.setProperty('--font-size-2xl', '1.5rem');
  root.style.setProperty('--font-size-3xl', '1.875rem');
  root.style.setProperty('--font-size-4xl', '2.25rem');
  
  // Font weights
  root.style.setProperty('--font-normal', '400');
  root.style.setProperty('--font-medium', '500');
  root.style.setProperty('--font-semibold', '600');
  root.style.setProperty('--font-bold', '700');
  
  // Spacing
  root.style.setProperty('--space-1', '0.25rem');
  root.style.setProperty('--space-2', '0.5rem');
  root.style.setProperty('--space-3', '0.75rem');
  root.style.setProperty('--space-4', '1rem');
  root.style.setProperty('--space-5', '1.25rem');
  root.style.setProperty('--space-6', '1.5rem');
  root.style.setProperty('--space-8', '2rem');
  root.style.setProperty('--space-10', '2.5rem');
  root.style.setProperty('--space-12', '3rem');
  root.style.setProperty('--space-16', '4rem');
  
  // Border radius
  root.style.setProperty('--radius-sm', '0.125rem');
  root.style.setProperty('--radius-md', '0.375rem');
  root.style.setProperty('--radius-lg', '0.5rem');
  root.style.setProperty('--radius-xl', '0.75rem');
  root.style.setProperty('--radius-full', '9999px');
  
  // Shadows
  root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
  root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
  root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
  root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
  
  // Transitions
  root.style.setProperty('--transition-fast', '0.15s ease');
  root.style.setProperty('--transition-normal', '0.3s ease');
  root.style.setProperty('--transition-slow', '0.5s ease');
  
  // Add animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(52, 168, 83, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(52, 168, 83, 0); }
      100% { box-shadow: 0 0 0 0 rgba(52, 168, 83, 0); }
    }
  `;
  document.head.appendChild(styleSheet);
}

// Call once when the app loads
setupDesignSystem();

// Global application state - must be exported for auth.js
export const appState = {
  currentPage: 'dashboard',
  incomeEntries: [],
  expenseEntries: [], // Initialize expense entries array
  user: {
    id: 1, // Add a default user ID for API calls
    name: 'User',
    email: '',
    role: 'user',
    subscriptionStatus: 'free',
    splitRatio: {
      needs: 40,
      investments: 30,
      savings: 30
    },
    // Authentication state
    isAuthenticated: false,
    token: null
  }
};

// Check user authentication status and load user data
function checkAuthentication() {
  // Import authentication functions from login.js
  import('../auth.js').then(auth => {
    try {
      // Check if user is authenticated
      const isAuthenticated = auth.isAuthenticated();
      appState.user.isAuthenticated = isAuthenticated;
      
      if (isAuthenticated) {
        // Get user data from localStorage
        const userData = auth.getCurrentUser();
        if (userData) {
          appState.user.id = userData.id || 1;
          appState.user.name = userData.username || 'User';
          appState.user.email = userData.email || '';
          appState.user.role = userData.role || 'user';
          appState.user.subscriptionStatus = userData.subscriptionStatus || 'free';
          appState.user.onboardingCompleted = userData.onboardingCompleted || false;
          appState.user.onboardingStep = userData.onboardingStep || 'welcome';
          
          console.log('User authenticated:', userData.username);
          
          // Check if onboarding is completed - multiple fallbacks to prevent redirect loops
          const onboardingCompleted = 
            userData.onboardingCompleted === true || 
            userData.onboardingStep === 'complete' ||
            localStorage.getItem('stackrOnboardingCompleted') === 'true';
          
          // Update app state with the definitive value
          appState.user.onboardingCompleted = onboardingCompleted;
          
          // Store the definitive value back to localStorage for future checks
          if (onboardingCompleted) {
            try {
              // Update localStorage to ensure consistency
              const currentUserData = localStorage.getItem('stackrUser');
              if (currentUserData) {
                const user = JSON.parse(currentUserData);
                user.onboardingCompleted = true;
                user.onboardingStep = 'complete';
                localStorage.setItem('stackrUser', JSON.stringify(user));
                localStorage.setItem('stackrOnboardingCompleted', 'true');
                console.log('Ensured onboarding completion state is synced');
              }
            } catch (e) {
              console.error('Error syncing onboarding status:', e);
            }
          }
          
          // Only redirect if definitely not completed AND not already on onboarding page
          if (!onboardingCompleted && appState.currentPage !== 'onboarding') {
            console.log('Onboarding not completed, redirecting to onboarding page');
            navigateTo('onboarding');
            return;
          }
          
          // Re-render the app with authenticated user data
          renderApp();
        }
      } else {
        // If the user is trying to access a protected route, redirect to login
        const nonAuthRoutes = ['login', 'register', 'about', 'pricing', 'landing'];
        if (!nonAuthRoutes.includes(appState.currentPage)) {
          console.log('User not authenticated, redirecting to login page');
          navigateTo('login');
        }
      }
    } catch (error) {
      console.error("Error in authentication check:", error);
    }
  }).catch(error => {
    console.error('Failed to load authentication module:', error);
  });
}

// Load data from localStorage if available
function loadStateFromStorage() {
  try {
    const savedState = localStorage.getItem('stackrGreenState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Merge with existing state
      appState.incomeEntries = parsedState.incomeEntries || [];
      appState.expenseEntries = parsedState.expenseEntries || [];
      if (parsedState.user && !appState.user.isAuthenticated) { 
        // Only use localStorage user data if not authenticated via login
        appState.user.id = parsedState.user.id || 1;
        appState.user.name = parsedState.user.name || 'User';
        appState.user.splitRatio = parsedState.user.splitRatio || { needs: 40, investments: 30, savings: 30 };
      }
      console.log('Loaded state from localStorage');
    } else {
      // Initialize empty arrays if no saved state
      appState.incomeEntries = [];
      appState.expenseEntries = [];
    }
  } catch (error) {
    console.error("Error loading state from storage:", error);
  }
  
  // Check authentication status after loading local state
  checkAuthentication();
}

// Save data to localStorage
function saveStateToStorage() {
  try {
    localStorage.setItem('stackrGreenState', JSON.stringify({
      incomeEntries: appState.incomeEntries,
      expenseEntries: appState.expenseEntries,
      user: appState.user
    }));
    console.log('Data saved to localStorage');
  } catch (error) {
    console.error("Error saving state to storage:", error);
  }
}

// Make saveStateToStorage globally accessible for auth.js
window.saveStateToStorage = saveStateToStorage;

// Router function - make navigateTo function accessible globally
window.navigateTo = function(page) {
  appState.currentPage = page;
  renderApp();
  // Update URL without page reload
  window.history.pushState(null, '', `#${page}`);
}

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  appState.currentPage = hash;
  renderApp();
});

// Render the Dashboard Page
function renderDashboardPage() {
  const isMobile = window.innerWidth < 640;
  const container = document.createElement('div');
  container.className = 'dashboard-container';
  
  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';
  header.style.marginBottom = 'var(--space-6, 1.5rem)';
  
  const title = document.createElement('h1');
  title.textContent = 'Dashboard';
  title.style.fontSize = 'var(--text-2xl, 1.5rem)';
  title.style.fontWeight = 'var(--font-bold, 700)';
  title.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Welcome back to your financial overview';
  subtitle.style.color = 'var(--color-text-secondary, #6b7280)';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  container.appendChild(header);
  
  // Add sample dashboard content - Income stats
  const incomeStats = document.createElement('div');
  incomeStats.className = 'income-stats';
  incomeStats.style.marginBottom = 'var(--space-6, 1.5rem)';
  
  // Create a grid for dashboard cards
  const grid = document.createElement('div');
  grid.className = 'dashboard-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))';
  grid.style.gap = 'var(--space-4, 1rem)';
  
  // Add a placeholder card if no data
  if (!appState.incomeEntries || appState.incomeEntries.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.style.backgroundColor = 'var(--color-bg-primary, white)';
    emptyState.style.borderRadius = 'var(--radius-lg, 0.5rem)';
    emptyState.style.padding = 'var(--space-6, 1.5rem)';
    emptyState.style.textAlign = 'center';
    emptyState.style.border = '1px dashed var(--color-border, #e5e7eb)';
    
    const emptyTitle = document.createElement('h3');
    emptyTitle.textContent = 'Track your first income entry';
    emptyTitle.style.fontWeight = 'var(--font-semibold)';
    emptyTitle.style.marginBottom = 'var(--space-2)';
    emptyTitle.style.color = 'var(--color-accent)';
    emptyState.appendChild(emptyTitle);
    
    const emptyDesc = document.createElement('p');
    emptyDesc.textContent = 'Start by adding your income to see your Stackr Split in action.';
    emptyDesc.style.marginBottom = 'var(--space-4)';
    emptyDesc.style.color = 'var(--color-text-secondary)';
    emptyState.appendChild(emptyDesc);
    
    const emptyButton = createButton('Add Your First Income', () => navigateTo('income'), 'var(--color-accent, #3b82f6)');
    emptyState.appendChild(emptyButton);
    
    grid.appendChild(emptyState);
  } else {
    // Placeholder for real data - Total Income Card
    const incomeCard = createSummaryCard(
      'Total Income', 
      '$' + calculateTotalIncome().toFixed(2), 
      'This Month', 
      'var(--color-success, #34A853)'
    );
    grid.appendChild(incomeCard);
    
    // Add split summary cards
    const splitSummary = calculateIncomeSplit();
    
    const needsCard = createSummaryCard(
      'Needs (40%)', 
      '$' + splitSummary.needs, 
      'Housing, Food, Utilities', 
      'var(--color-primary, #34A853)'
    );
    grid.appendChild(needsCard);
    
    const investmentsCard = createSummaryCard(
      'Investments (30%)', 
      '$' + splitSummary.investments, 
      'Stocks, Crypto, Real Estate', 
      'var(--color-secondary, #9C27B0)'
    );
    grid.appendChild(investmentsCard);
    
    const savingsCard = createSummaryCard(
      'Savings (30%)', 
      '$' + splitSummary.savings, 
      'Emergency Fund, Goals', 
      'var(--color-tertiary, #3b82f6)'
    );
    grid.appendChild(savingsCard);
  }
  
  incomeStats.appendChild(grid);
  container.appendChild(incomeStats);
  
  return container;
}

// Function to calculate total income
function calculateTotalIncome() {
  return appState.incomeEntries.reduce((total, entry) => total + parseFloat(entry.amount), 0);
}

// Function to calculate income split based on user's ratio
function calculateIncomeSplit() {
  const totalIncome = calculateTotalIncome();
  const ratio = appState.user.splitRatio;
  
  return {
    needs: ((totalIncome * ratio.needs) / 100).toFixed(2),
    investments: ((totalIncome * ratio.investments) / 100).toFixed(2),
    savings: ((totalIncome * ratio.savings) / 100).toFixed(2)
  };
}

// Create a summary card for the dashboard
function createSummaryCard(title, value, subtitle, accentColor) {
  const card = document.createElement('div');
  card.className = 'summary-card';
  card.style.backgroundColor = 'var(--color-bg-primary, white)';
  card.style.borderRadius = 'var(--radius-lg, 0.5rem)';
  card.style.padding = 'var(--space-4, 1rem)';
  card.style.boxShadow = 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))';
  card.style.border = '1px solid var(--color-border, #e5e7eb)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  
  // Colored accent line at top of card
  const accentLine = document.createElement('div');
  accentLine.style.position = 'absolute';
  accentLine.style.top = '0';
  accentLine.style.left = '0';
  accentLine.style.right = '0';
  accentLine.style.height = '4px';
  accentLine.style.backgroundColor = accentColor;
  card.appendChild(accentLine);
  
  const cardTitle = document.createElement('h3');
  cardTitle.textContent = title;
  cardTitle.style.fontSize = 'var(--font-size-sm, 0.875rem)';
  cardTitle.style.fontWeight = 'var(--font-medium, 500)';
  cardTitle.style.color = 'var(--color-text-secondary, #6b7280)';
  cardTitle.style.marginTop = 'var(--space-2, 0.5rem)';
  cardTitle.style.marginBottom = 'var(--space-2, 0.5rem)';
  card.appendChild(cardTitle);
  
  const cardValue = document.createElement('div');
  cardValue.textContent = value;
  cardValue.style.fontSize = 'var(--font-size-2xl, 1.5rem)';
  cardValue.style.fontWeight = 'var(--font-bold, 700)';
  cardValue.style.color = 'var(--color-text, #111827)';
  cardValue.style.marginBottom = 'var(--space-1, 0.25rem)';
  card.appendChild(cardValue);
  
  const cardSubtitle = document.createElement('div');
  cardSubtitle.textContent = subtitle;
  cardSubtitle.style.fontSize = 'var(--font-size-xs, 0.75rem)';
  cardSubtitle.style.color = 'var(--color-text-secondary, #6b7280)';
  card.appendChild(cardSubtitle);
  
  return card;
}

// Create a button element with specified text, click handler and color
function createButton(text, onClick, color = 'var(--color-primary)') {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = 'btn';
  button.style.backgroundColor = color;
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = 'var(--radius-md, 0.375rem)';
  button.style.padding = '0.5rem 1rem';
  button.style.fontWeight = 'var(--font-medium, 500)';
  button.style.cursor = 'pointer';
  button.style.transition = 'background-color 0.2s ease';
  
  button.addEventListener('click', onClick);
  
  return button;
}

// Initialize application
console.log('GREEN Firebase-free version initializing...');
loadStateFromStorage();

// Render the application
function renderApp() {
  console.log('Rendering app...');
  
  const appContainer = document.getElementById('root');
  if (!appContainer) {
    console.error('App container not found');
    return;
  }
  
  // Handle different pages
  const currentPage = appState.currentPage;
  
  // Landing page is shown to non-authenticated users
  if (currentPage === 'landing') {
    import('../landing-page.js')
      .then(module => {
        try {
          const landingPage = module.renderLandingPage();
          appContainer.innerHTML = '';
          appContainer.appendChild(landingPage);
          console.log('Navigated to landing page');
        } catch (error) {
          console.error('Error rendering landing page:', error);
          appContainer.innerHTML = '<div class="error">Error loading landing page</div>';
        }
      })
      .catch(error => {
        console.error('Failed to load landing page module:', error);
        appContainer.innerHTML = '<div class="error">Failed to load landing page module</div>';
      });
    return;
  }
  
  // Login page
  if (currentPage === 'login') {
    import('../auth.js')
      .then(module => {
        try {
          const loginPage = module.renderLoginPage();
          appContainer.innerHTML = '';
          appContainer.appendChild(loginPage);
          console.log('Navigated from ' + (appState.previousPage || 'landing') + ' to login');
        } catch (error) {
          console.error('Error rendering login page:', error);
          appContainer.innerHTML = '<div class="error">Error loading login page</div>';
        }
      })
      .catch(error => {
        console.error('Failed to load auth module:', error);
        appContainer.innerHTML = '<div class="error">Failed to load authentication module</div>';
      });
    return;
  }
  
  // For authenticated pages, create layout with sidebar
  appContainer.innerHTML = '';
  try {
    const layoutContainer = createLayout();
    appContainer.appendChild(layoutContainer);
  } catch (error) {
    console.error('Error creating layout:', error);
    appContainer.innerHTML = '<div class="error">Error creating application layout</div>';
  }
}

// Function to render page content based on current route
function renderPageContent(contentContainer) {
  // Clear previous content
  contentContainer.innerHTML = '';
  
  // Get current page from app state
  const page = appState.currentPage;
  
  // Determine viewport for better mobile UX
  const width = window.innerWidth;
  let viewport = 'desktop';
  if (width < 640) viewport = 'mobile';
  else if (width < 1024) viewport = 'tablet';
  console.log(`Viewport: ${viewport}`);
  
  // Use switch statement to render appropriate page
  switch (page) {
    case 'dashboard':
      contentContainer.appendChild(renderDashboardPage());
      break;
      
    case 'income':
      contentContainer.appendChild(renderIncomePage());
      break;
      
    case 'expenses':
      contentContainer.appendChild(renderExpensesPage());
      break;
      
    case 'gigs':
      contentContainer.appendChild(renderGigsPage());
      break;
      
    case 'affiliates':
      // Import the Affiliates Hub module dynamically
      import('../affiliates-hub.js')
        .then(module => {
          try {
            const affiliatesPage = module.renderAffiliateHub(appState.user.id);
            contentContainer.appendChild(affiliatesPage);
          } catch (error) {
            console.error('Error rendering affiliates page:', error);
            contentContainer.appendChild(createErrorMessage('Failed to load the affiliates section. Please try again later.'));
          }
        })
        .catch(error => {
          console.error('Failed to load affiliates module:', error);
          contentContainer.appendChild(createErrorMessage('Failed to load the affiliates section. Please try again later.'));
        });
      break;
      
    case 'moneymentor':
      console.log('Loading Money Mentor module...');
      try {
        // Create main container
        const moneyMentorContainer = document.createElement('div');
        moneyMentorContainer.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
        
        // Add simple content
        moneyMentorContainer.innerHTML = `
          <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Money Mentor</h2>
            <p class="mb-4">Get personalized financial advice powered by AI.</p>
          </div>
        `;
        
        contentContainer.appendChild(moneyMentorContainer);
      } catch (error) {
        console.error('Error rendering Money Mentor module:', error);
        contentContainer.appendChild(createErrorMessage('Failed to load the Money Mentor. Please try again later.'));
      }
      break;
      
    case 'blog':
      // Import the Blog page module
      import('../blog-page.js')
        .then(module => {
          try {
            // Check if specific article is requested
            const urlParts = window.location.hash.split('/');
            if (urlParts.length > 1 && urlParts[0] === '#blog') {
              // Article view - urlParts[1] contains the slug
              const articleSlug = urlParts[1];
              const articlePage = module.renderArticlePage(articleSlug, 
                appState?.user?.isAuthenticated || false);
              contentContainer.appendChild(articlePage);
            } else {
              // Blog listing view - pass authentication status
              const blogPage = module.renderBlogPage(
                appState?.user?.isAuthenticated || false);
              contentContainer.appendChild(blogPage);
            }
          } catch (error) {
            console.error('Error rendering blog page:', error);
            contentContainer.appendChild(createErrorMessage('Failed to load blog content. Please try again later.'));
          }
        }).catch(error => {
          console.error('Error loading blog module:', error);
          contentContainer.appendChild(createErrorMessage('Failed to load blog module. Please refresh the page and try again.'));
        });
      break;
      
    case 'challenges':
      // Create challenges page
      try {
        const challengesContainer = document.createElement('div');
        challengesContainer.className = 'challenges-container';
        
        challengesContainer.innerHTML = `
          <h2 class="text-2xl font-bold mb-4">Financial Challenges</h2>
          <p class="mb-6">Complete these challenges to improve your financial health.</p>
          <div class="challenges-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="challenge-card p-4 border rounded-lg shadow-sm bg-white">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold">30-Day Savings Challenge</h3>
                <span class="badge bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">In Progress</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">Save a little more each day for 30 days.</p>
              <div class="progress-bar h-2 bg-gray-200 rounded-full mb-2">
                <div class="h-2 bg-blue-500 rounded-full" style="width: 40%"></div>
              </div>
              <div class="text-xs text-right text-gray-500">12/30 days completed</div>
            </div>
          </div>
        `;
        
        contentContainer.appendChild(challengesContainer);
      } catch (error) {
        console.error('Error rendering challenges page:', error);
        contentContainer.appendChild(createErrorMessage('Failed to load challenges. Please try again later.'));
      }
      break;
      
    case 'subscriptionsniper':
      try {
        console.log('Loading Subscription Sniper module...');
        // Create main container
        const subscriptionSniperContainer = document.createElement('div');
        subscriptionSniperContainer.className = 'subscription-sniper-container p-4 max-w-5xl mx-auto';
        
        // Add simple content
        subscriptionSniperContainer.innerHTML = `
          <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Subscription Sniper</h2>
            <p class="mb-4">Track and optimize your recurring subscriptions.</p>
            <p class="text-sm text-gray-500">Premium feature - requires subscription upgrade</p>
          </div>
        `;
        
        contentContainer.appendChild(subscriptionSniperContainer);
      } catch (error) {
        console.error('Error rendering Subscription Sniper module:', error);
        contentContainer.appendChild(createErrorMessage('Failed to load Subscription Sniper. Please try again later.'));
      }
      break;
      
    case 'bankconnections':
      // Import the Bank Connections module dynamically
      import('../bank-connections.js')
        .then(module => {
          try {
            const bankConnectionsPage = module.renderBankConnectionsPage(appState.user.id);
            contentContainer.appendChild(bankConnectionsPage);
          } catch (error) {
            console.error('Error rendering bank connections page:', error);
            contentContainer.appendChild(createErrorMessage('Failed to load bank connections. Please try again later.'));
          }
        })
        .catch(error => {
          console.error('Error loading bank connections module:', error);
          contentContainer.appendChild(createErrorMessage('Failed to load bank connections module. Please try again later.'));
        });
      break;
      
    case 'subscriptions':
      // Import the Subscriptions module dynamically
      import('../subscription-manager.js')
        .then(module => {
          try {
            const subscriptionsPage = module.renderSubscriptionsPage(appState.user.id);
            contentContainer.appendChild(subscriptionsPage);
          } catch (error) {
            console.error('Error rendering subscriptions page:', error);
            contentContainer.appendChild(createErrorMessage('Failed to load subscription manager. Please try again later.'));
          }
        })
        .catch(error => {
          console.error('Error loading subscriptions module:', error);
          contentContainer.appendChild(createErrorMessage('Failed to load subscription manager module. Please try again later.'));
        });
      break;
      
    case 'settings':
      try {
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        
        const title = document.createElement('h2');
        title.textContent = 'Settings';
        title.className = 'text-2xl font-bold mb-6';
        settingsContainer.appendChild(title);
        
        // Create settings sections
        const sections = [
          {
            title: 'Account Settings',
            icon: 'user',
            fields: [
              { name: 'Name', type: 'text', value: appState.user.name || '' },
              { name: 'Email', type: 'email', value: appState.user.email || '' },
              { name: 'Password', type: 'password', value: '********' }
            ]
          },
          {
            title: 'Income Split Ratio',
            icon: 'pie-chart',
            fields: [
              { name: 'Needs', type: 'range', value: appState.user.splitRatio.needs, min: 0, max: 100 },
              { name: 'Investments', type: 'range', value: appState.user.splitRatio.investments, min: 0, max: 100 },
              { name: 'Savings', type: 'range', value: appState.user.splitRatio.savings, min: 0, max: 100 }
            ]
          }
        ];
        
        // Create sections
        sections.forEach(section => {
          const sectionEl = document.createElement('div');
          sectionEl.className = 'settings-section mb-8 p-6 bg-white rounded-lg shadow-sm';
          
          const header = document.createElement('div');
          header.className = 'section-header flex items-center mb-4';
          
          const headerTitle = document.createElement('h3');
          headerTitle.textContent = section.title;
          headerTitle.className = 'text-lg font-semibold';
          header.appendChild(headerTitle);
          
          sectionEl.appendChild(header);
          
          // Create fields
          section.fields.forEach(field => {
            const fieldEl = document.createElement('div');
            fieldEl.className = 'field-group mb-4';
            
            const label = document.createElement('label');
            label.textContent = field.name;
            label.className = 'block text-sm font-medium text-gray-700 mb-1';
            fieldEl.appendChild(label);
            
            const input = document.createElement('input');
            input.type = field.type;
            input.value = field.value;
            input.className = 'w-full p-2 border border-gray-300 rounded-md';
            
            if (field.type === 'range') {
              input.min = field.min;
              input.max = field.max;
              
              const valueDisplay = document.createElement('div');
              valueDisplay.textContent = `${field.value}%`;
              valueDisplay.className = 'text-sm text-gray-600 mt-1';
              
              input.addEventListener('input', () => {
                valueDisplay.textContent = `${input.value}%`;
              });
              
              fieldEl.appendChild(input);
              fieldEl.appendChild(valueDisplay);
            } else {
              fieldEl.appendChild(input);
            }
            
            sectionEl.appendChild(fieldEl);
          });
          
          const saveBtn = document.createElement('button');
          saveBtn.textContent = 'Save Changes';
          saveBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark';
          sectionEl.appendChild(saveBtn);
          
          settingsContainer.appendChild(sectionEl);
        });
        
        contentContainer.appendChild(settingsContainer);
      } catch (error) {
        console.error('Error rendering settings page:', error);
        contentContainer.appendChild(createErrorMessage('Failed to load settings page. Please try again later.'));
      }
      break;
      
    default:
      contentContainer.innerHTML = `<div class="error-message">Page not found: ${page}</div>`;
      break;
  }
}

// Helper function to create error messages
function createErrorMessage(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
  errorContainer.style.color = 'rgb(185, 28, 28)';
  errorContainer.style.padding = '1rem';
  errorContainer.style.borderRadius = '0.5rem';
  errorContainer.style.marginTop = '1rem';
  errorContainer.style.textAlign = 'center';
  
  const errorIcon = document.createElement('div');
  errorIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="inline-block w-6 h-6 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  `;
  
  const errorText = document.createElement('span');
  errorText.textContent = message;
  
  errorContainer.appendChild(errorIcon);
  errorContainer.appendChild(errorText);
  
  return errorContainer;
}

// Initialize Placeholder Render Functions
function renderIncomePage() {
  const container = document.createElement('div');
  container.innerHTML = '<h2>Income Page</h2><p>This is a placeholder for the Income tracking page.</p>';
  return container;
}

function renderExpensesPage() {
  const container = document.createElement('div');
  container.innerHTML = '<h2>Expenses Page</h2><p>This is a placeholder for the Expenses tracking page.</p>';
  return container;
}

function renderGigsPage() {
  const container = document.createElement('div');
  container.innerHTML = '<h2>Gigs Page</h2><p>This is a placeholder for the Gigs tracking page.</p>';
  return container;
}

// Run the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version loaded successfully!');
});
