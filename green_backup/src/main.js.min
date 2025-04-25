// Starting with our working minimal version
// Minimal version of main.js with just the core functionality

console.log('Starting GREEN Firebase-free version of Stackr Finance');

// Global state
const appState = {
  user: { isAuthenticated: false },
  currentPage: 'landing',
  incomeEntries: [],
  financialMascot: null
};

// Core navigation function
function navigateTo(page) {
  appState.currentPage = page;
  window.location.hash = page;
  renderApp();
}

// Main render function
// Function to render specific page content into a container
function renderPageContent(container) {
  // Add page transition effects
  container.style.animation = 'fadeIn 0.3s ease-in-out';
  
  // Create and append a keyframe animation if not exists
  if (!document.querySelector('#fadeInAnimation')) {
    const style = document.createElement('style');
    style.id = 'fadeInAnimation';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Special cases for pages that don't need the standard app layout
  if (appState.currentPage === 'landing') {
    // Create a basic landing page
    const landingPage = document.createElement('div');
    landingPage.className = 'landing-page';
    landingPage.innerHTML = `
      <div class="hero-section bg-gradient-to-r from-blue-500 to-purple-600 text-white p-10 text-center">
        <h1 class="text-4xl font-bold mb-4">Welcome to Stackr Finance</h1>
        <p class="text-xl mb-8">Your simplified financial management platform.</p>
        <button id="get-started-btn" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
          Get Started
        </button>
      </div>
      
      <div class="features-section py-12 px-6 bg-white">
        <h2 class="text-3xl font-bold text-center mb-10">The 40/30/30 Split</h2>
        <div class="flex flex-wrap justify-center gap-8">
          <div class="feature-card max-w-sm p-6 bg-gray-50 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold mb-3 text-blue-600">40% for Needs</h3>
            <p>Allocate 40% of your income to essential expenses like rent, groceries, and utilities.</p>
          </div>
          <div class="feature-card max-w-sm p-6 bg-gray-50 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold mb-3 text-purple-600">30% for Investments</h3>
            <p>Put 30% toward investments that will grow your wealth and secure your financial future.</p>
          </div>
          <div class="feature-card max-w-sm p-6 bg-gray-50 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold mb-3 text-green-600">30% for Savings</h3>
            <p>Save 30% for your personal goals, emergency fund, and future large purchases.</p>
          </div>
        </div>
      </div>
    `;
    
    // Add event listener to the "Get Started" button
    setTimeout(() => {
      const getStartedBtn = landingPage.querySelector('#get-started-btn');
      if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
          navigateTo('register');
        });
      }
    }, 0);
    
    container.appendChild(landingPage);
    
    // Add special full-width styling for landing page
    container.style.padding = '0';
    container.style.maxWidth = 'none';
  } else if (appState.currentPage === 'moneymentor-advanced') {
    try {
      console.log('Loading Money Mentor Advanced Module...');
      
      // Define the fallback renderer function 
      const renderFallbackMoneyMentor = () => {
        console.log('Using fallback Money Mentor interface');
        
        // Create main container
        const fallbackContainer = document.createElement('div');
        fallbackContainer.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
        
        // Add simple fallback content
        fallbackContainer.innerHTML = `
          <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Money Mentor</h2>
            <p class="mb-4">Get personalized financial advice powered by AI.</p>
            <div class="animate-pulse inline-block p-4 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              Loading module...
            </div>
          </div>
        `;
        
        return fallbackContainer;
      };
      
      // Check for previously stored import error flag in session storage
      const moneyMentorImportFailed = sessionStorage.getItem('moneyMentorImportFailed') === 'true';
      
      // If previously failed, don't attempt import again to avoid unnecessary console errors
      if (moneyMentorImportFailed) {
        console.log('Skipping Money Mentor import due to previous failure');
        // Use fallback directly
        container.appendChild(renderFallbackMoneyMentor());
      } else {
        // Try importing the module
        console.log('Attempting to import Money Mentor module');
        
        // Try loading the module dynamically
        import('../money-mentor.js')
          .then(module => {
            // Create an IIFE to handle async operations
            (async () => {
              try {
                // Validate user data
                if (!appState || !appState.user) {
                  throw new Error('User data not available');
                }
                
                // Verify the module has the required function
                if (typeof module.renderMoneyMentorPage !== 'function') {
                  throw new Error('renderMoneyMentorPage function not found in module');
                }
                
                // Render the page
                const mentorPage = await module.renderMoneyMentorPage(appState.user.id);
                
                // Verify we got a valid DOM element
                if (!(mentorPage instanceof HTMLElement)) {
                  throw new Error('Invalid return from renderMoneyMentorPage');
                }
                
                // Successfully loaded the module, clear any previous error flag
                sessionStorage.removeItem('moneyMentorImportFailed');
                container.appendChild(mentorPage);
              } catch (innerError) {
                console.error('Error rendering Money Mentor page:', innerError);
                console.log('Falling back to simplified Money Mentor interface');
                // Mark as failed in session storage to avoid future attempts
                sessionStorage.setItem('moneyMentorImportFailed', 'true');
                container.appendChild(renderFallbackMoneyMentor());
              }
            })();
          })
          .catch(importError => {
            // Instead of logging the error which may be empty, just log a message
            console.log('Unable to load Money Mentor module - using fallback interface');
            
            // Mark as failed in session storage to avoid future attempts
            sessionStorage.setItem('moneyMentorImportFailed', 'true');
            container.appendChild(renderFallbackMoneyMentor());
          });
      }
    } catch (outerError) {
      console.error('Critical error initializing Money Mentor module:', outerError);
      container.appendChild(createErrorMessage('Critical error loading Money Mentor. Please reload the application.'));
    }
  } else {
    // For all other pages, show a simple message
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'welcome-message p-8 text-center';
    welcomeMsg.innerHTML = `
      <h1 class="text-3xl font-bold mb-4">Welcome to Stackr Finance</h1>
      <p class="mb-6">Your simplified financial management platform.</p>
      <p class="text-green-500 font-bold">Currently viewing: ${appState.currentPage}</p>
    `;
    container.appendChild(welcomeMsg);
  }
}

// Helper function to create error messages
function createErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4';
  errorDiv.textContent = message;
  return errorDiv;
}

// Simplified layout creator
function createLayout() {
  const appElement = document.getElementById('app');
  if (!appElement) return;
  
  appElement.innerHTML = '';
  
  // Create simplified layout
  const layout = document.createElement('div');
  layout.className = 'layout flex flex-col min-h-screen';
  
  // Simple header
  const header = document.createElement('header');
  header.className = 'bg-white dark:bg-gray-800 border-b p-4 flex justify-between items-center';
  
  // Logo and title
  const logoSection = document.createElement('div');
  logoSection.className = 'flex items-center';
  logoSection.innerHTML = '<h1 class="text-lg font-bold">Stackr Finance</h1>';
  
  // Navigation links
  const nav = document.createElement('nav');
  nav.className = 'hidden md:flex space-x-4';
  
  const navLinks = [
    { name: 'Dashboard', path: 'dashboard' },
    { name: 'Income', path: 'income' },
    { name: 'Expenses', path: 'expenses' },
    { name: 'Money Mentor', path: 'moneymentor-advanced' }
  ];
  
  navLinks.forEach(link => {
    const navLink = document.createElement('a');
    navLink.href = `#${link.path}`;
    navLink.className = 'text-gray-600 hover:text-blue-600';
    navLink.textContent = link.name;
    navLink.onclick = (e) => {
      e.preventDefault();
      navigateTo(link.path);
    };
    nav.appendChild(navLink);
  });
  
  // Mobile menu toggle
  const menuButton = document.createElement('button');
  menuButton.className = 'md:hidden text-gray-600 hover:text-blue-600';
  menuButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `;
  
  header.appendChild(logoSection);
  header.appendChild(nav);
  header.appendChild(menuButton);
  
  // Main content area
  const main = document.createElement('main');
  main.className = 'flex-grow p-4';
  
  // Render the actual page content
  renderPageContent(main);
  
  // Add components to layout
  layout.appendChild(header);
  layout.appendChild(main);
  
  // Add layout to app
  appElement.appendChild(layout);
}

// Main render function
function renderApp() {
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = '';
  
  // Create simplified app container
  const app = document.createElement('div');
  app.id = 'app';
  rootElement.appendChild(app);
  
  // Create the layout
  createLayout();
  
  console.log(`Page rendered: ${appState.currentPage}`);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version initializing...');
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '');
  // If no hash is provided, show landing page
  if (!hash) {
    appState.currentPage = 'landing';
  } else {
    appState.currentPage = hash;
  }
  
  // Render the initial state
  renderApp();
  
  // Set up hash-based navigation
  window.addEventListener('hashchange', () => {
    const newPage = window.location.hash.replace('#', '');
    if (newPage) {
      appState.currentPage = newPage;
      renderApp();
    }
  });
  
  console.log('GREEN Firebase-free version loaded successfully!');
});