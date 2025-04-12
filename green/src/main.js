/**
 * Stackr Finance GREEN Edition
 * Firebase-free version
 * 
 * A financial management platform designed for service providers
 * with intelligent 40/30/30 income allocation and tracking
 */

console.log('Starting GREEN Firebase-free version of Stackr Finance');

// Global application state
export const appState = {
  user: { 
    isAuthenticated: false,
    username: '',
    email: '',
    id: null,
    onboardingCompleted: false,
    splitRatio: {
      needs: 40,
      investments: 30,
      savings: 30
    },
    subscription: {
      tier: 'free'
    }
  },
  currentPage: 'landing',
  incomeEntries: [],
  expenseEntries: [],
  financialMascot: null,
  theme: 'light',
  settings: {
    notifications: true,
    currency: 'USD'
  }
};

// Initialize authentication
function initAuth() {
  // Import auth module
  import('../auth.js').then(authModule => {
    console.log('Auth module loaded');
    
    // Check if user is authenticated
    if (authModule.isAuthenticated()) {
      console.log('User is authenticated');
      
      // Get user data
      const userData = authModule.getCurrentUser();
      if (userData) {
        appState.user = {
          ...appState.user,
          ...userData,
          isAuthenticated: true
        };
        
        // Check if onboarding is completed
        if (!appState.user.onboardingCompleted) {
          navigateTo('onboarding');
        } else {
          // If user is authenticated and onboarding is completed,
          // navigate to dashboard if they're on a non-auth page
          if (appState.currentPage === 'landing' || 
              appState.currentPage === 'login' || 
              appState.currentPage === 'register') {
            navigateTo('dashboard');
          }
        }
      }
    } else {
      console.log('User is not authenticated');
      
      // If the user is trying to access a protected route, redirect to login
      const nonAuthRoutes = ['login', 'register', 'about', 'pricing', 'landing'];
      if (!nonAuthRoutes.includes(appState.currentPage)) {
        console.log('User not authenticated, redirecting to login page');
        navigateTo('login');
      }
    }
  }).catch(error => {
    console.error('Failed to load authentication module:', error);
  });
}

// Load data from localStorage if available
function loadStateFromStorage() {
  const savedState = localStorage.getItem('stackrGreenState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      // Merge saved state with default state to ensure all required fields exist
      appState.incomeEntries = parsedState.incomeEntries || [];
      appState.expenseEntries = parsedState.expenseEntries || [];
      appState.settings = { ...appState.settings, ...parsedState.settings };
      appState.theme = parsedState.theme || 'light';
      
      console.log('Loaded state from localStorage');
    } catch (error) {
      console.error('Error parsing saved state:', error);
    }
  }
}

// Save state to localStorage
function saveStateToStorage() {
  try {
    // Only save non-sensitive data
    const stateToSave = {
      incomeEntries: appState.incomeEntries,
      expenseEntries: appState.expenseEntries,
      settings: appState.settings,
      theme: appState.theme
    };
    
    localStorage.setItem('stackrGreenState', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
}

// Make saveStateToStorage global for auth.js to use
window.saveStateToStorage = saveStateToStorage;

// Create the application layout
function createLayout() {
  // Create layout container
  const root = document.getElementById('root');
  root.innerHTML = '';
  
  // Create app container
  const app = document.createElement('div');
  app.id = 'app';
  
  // Set theme
  document.documentElement.classList.toggle('dark', appState.theme === 'dark');
  app.className = appState.theme === 'dark' ? 'dark-theme' : 'light-theme';
  
  // Create header
  const header = document.createElement('header');
  header.className = 'app-header';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = 'var(--space-4, 16px)';
  header.style.backgroundColor = 'var(--color-bg-primary, white)';
  header.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
  
  // Logo and title
  const logoContainer = document.createElement('div');
  logoContainer.className = 'logo-container';
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  
  const logoText = document.createElement('div');
  logoText.className = 'logo-text';
  logoText.textContent = 'Stackr';
  logoText.style.fontWeight = 'var(--font-bold, 700)';
  logoText.style.fontSize = 'var(--text-xl, 1.25rem)';
  logoText.style.color = 'var(--color-primary, #34A853)';
  
  const logoSubText = document.createElement('span');
  logoSubText.className = 'logo-subtext';
  logoSubText.textContent = 'Finance';
  logoSubText.style.marginLeft = '4px';
  
  // Create theme toggle button
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.setAttribute('aria-label', `Switch to ${appState.theme === 'dark' ? 'light' : 'dark'} mode`);
  themeToggle.innerHTML = appState.theme === 'dark' ? '☀️' : '🌙';
  themeToggle.style.marginLeft = 'var(--space-4, 16px)';
  themeToggle.style.background = 'none';
  themeToggle.style.border = 'none';
  themeToggle.style.fontSize = '1.25rem';
  themeToggle.style.cursor = 'pointer';
  
  // Toggle dark/light mode
  themeToggle.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', appState.theme === 'dark');
    app.className = appState.theme === 'dark' ? 'dark-theme' : 'light-theme';
    themeToggle.innerHTML = appState.theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', `Switch to ${appState.theme === 'dark' ? 'light' : 'dark'} mode`);
    saveStateToStorage();
  });
  
  // Mobile menu toggle
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle md:hidden';
  menuToggle.setAttribute('aria-label', 'Toggle menu');
  menuToggle.innerHTML = '☰';
  menuToggle.style.background = 'none';
  menuToggle.style.border = 'none';
  menuToggle.style.fontSize = '1.5rem';
  menuToggle.style.cursor = 'pointer';
  
  // Add event listener for mobile menu toggle
  menuToggle.addEventListener('click', () => {
    // Import sidebar module when needed to toggle mobile menu
    import('../sidebar.js').then(sidebarModule => {
      try {
        // Toggle the sidebar directly if this approach is available
        if (typeof sidebarModule.toggleSidebar === 'function') {
          sidebarModule.toggleSidebar();
        } else {
          // As a fallback, directly toggle sidebar visibility if we can find it
          const sidebar = document.querySelector('.stackr-sidebar');
          if (sidebar) {
            console.log('Found sidebar element, toggling directly');
            const isVisible = sidebar.style.transform === 'translateX(0px)';
            
            if (isVisible) {
              sidebar.style.transform = 'translateX(-100%)';
              document.getElementById('sidebar-overlay')?.remove();
            } else {
              sidebar.style.width = '280px';
              sidebar.style.transform = 'translateX(0px)';
              
              // Add overlay
              const overlay = document.createElement('div');
              overlay.id = 'sidebar-overlay';
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100vw';
              overlay.style.height = '100vh';
              overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              overlay.style.zIndex = '40';
              overlay.addEventListener('click', () => {
                sidebar.style.transform = 'translateX(-100%)';
                overlay.remove();
              });
              
              document.body.appendChild(overlay);
            }
          } else {
            console.warn('Could not find sidebar element to toggle');
          }
        }
      } catch (error) {
        console.error('Error toggling sidebar:', error);
      }
    }).catch(error => {
      console.error('Failed to load sidebar module for toggle:', error);
    });
  });
  
  // Assemble header elements
  logoText.appendChild(logoSubText);
  logoContainer.appendChild(logoText);
  
  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';
  headerRight.style.display = 'flex';
  headerRight.style.alignItems = 'center';
  
  // Only show theme toggle and user info if not on landing page
  if (appState.currentPage !== 'landing' && appState.currentPage !== 'login' && appState.currentPage !== 'register') {
    headerRight.appendChild(themeToggle);
    
    // Add user info if authenticated
    if (appState.user.isAuthenticated) {
      const userInfo = document.createElement('div');
      userInfo.className = 'user-info';
      userInfo.style.display = 'flex';
      userInfo.style.alignItems = 'center';
      userInfo.style.marginLeft = 'var(--space-4, 16px)';
      
      const userAvatar = document.createElement('div');
      userAvatar.className = 'user-avatar';
      userAvatar.style.width = '32px';
      userAvatar.style.height = '32px';
      userAvatar.style.borderRadius = '50%';
      userAvatar.style.backgroundColor = 'var(--color-primary, #34A853)';
      userAvatar.style.color = 'white';
      userAvatar.style.display = 'flex';
      userAvatar.style.alignItems = 'center';
      userAvatar.style.justifyContent = 'center';
      userAvatar.style.fontWeight = 'var(--font-bold, 700)';
      userAvatar.textContent = appState.user.username.charAt(0).toUpperCase();
      
      userInfo.appendChild(userAvatar);
      headerRight.appendChild(userInfo);
    }
  }
  
  // Don't show mobile menu toggle on landing, login, or register pages
  if (appState.currentPage !== 'landing' && appState.currentPage !== 'login' && appState.currentPage !== 'register') {
    headerRight.appendChild(menuToggle);
  }
  
  header.appendChild(logoContainer);
  header.appendChild(headerRight);
  
  // Main content container
  const main = document.createElement('main');
  main.className = 'app-main';
  main.style.display = 'flex';
  main.style.height = 'calc(100vh - 64px)';
  main.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
  
  // Create sidebar - only for authenticated users and not on landing/auth pages
  if (appState.user.isAuthenticated && 
      appState.currentPage !== 'landing' && 
      appState.currentPage !== 'login' && 
      appState.currentPage !== 'register' &&
      appState.currentPage !== 'onboarding') {
    
    // Load sidebar module
    import('../sidebar.js').then(sidebarModule => {
      try {
        // Check if createSidebar function exists
        if (typeof sidebarModule.createSidebar !== 'function') {
          throw new Error('createSidebar function not found in sidebar module');
        }
        
        // Make sure appState is properly initialized before passing to createSidebar
        const safeAppState = appState || {};
        if (!safeAppState.user) {
          safeAppState.user = {};
        }
        
        // Add sidebar
        const sidebar = sidebarModule.createSidebar(safeAppState);
        
        // Check if sidebar was successfully created
        if (!sidebar) {
          throw new Error('Failed to create sidebar');
        }
        
        // Add responsive styles for sidebar
        sidebar.style.width = '280px';
        sidebar.style.height = '100%';
        sidebar.style.overflowY = 'auto';
        sidebar.style.backgroundColor = 'var(--color-bg-primary, white)';
        sidebar.style.borderRight = '1px solid var(--color-border, #e5e7eb)';
        sidebar.style.position = 'relative';
        sidebar.style.transition = 'transform 0.3s ease';
        
        // Mobile styles - initially hidden on mobile
        if (window.innerWidth < 768) {
          sidebar.style.position = 'fixed';
          sidebar.style.zIndex = '50';
          sidebar.style.top = '64px';
          sidebar.style.left = '0';
          sidebar.style.bottom = '0';
          sidebar.style.transform = 'translateX(-100%)';
        }
        
        // Prepend sidebar to main content
        main.prepend(sidebar);
        
        // Add resize event listener
        window.addEventListener('resize', () => {
          if (window.innerWidth < 768) {
            sidebar.style.position = 'fixed';
            sidebar.style.transform = 'translateX(-100%)';
          } else {
            sidebar.style.position = 'relative';
            sidebar.style.transform = 'none';
          }
        });
      } catch (error) {
        console.error('Error creating sidebar:', error);
      }
    }).catch(error => {
      console.error('Failed to load sidebar module:', error);
    });
  }
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'content-container';
  content.style.flex = '1';
  content.style.padding = 'var(--space-4, 16px)';
  content.style.overflowY = 'auto';
  
  // Special layout for landing, login, and register pages
  if (appState.currentPage === 'landing' || 
      appState.currentPage === 'login' || 
      appState.currentPage === 'register' ||
      appState.currentPage === 'onboarding') {
    content.style.padding = '0';
    content.style.width = '100%';
  }
  
  // Render the page content into the content container
  renderPageContent(content);
  
  // Assemble main content
  main.appendChild(content);
  
  // Add header and main to app container
  // Skip header for landing page to allow for custom header in landing page module
  if (appState.currentPage !== 'landing') {
    app.appendChild(header);
  }
  
  app.appendChild(main);
  
  // Add app to root
  root.appendChild(app);
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
  if (appState.currentPage === 'login' || appState.currentPage === 'register') {
    // Import and render the auth page
    import('../login.js').then(module => {
      container.appendChild(module.renderAuthPage());
    }).catch(error => {
      console.error('Error loading auth module:', error);
      container.appendChild(createErrorMessage('Failed to load authentication module'));
    });
    
    // Add special full-height styling for auth page
    container.style.padding = '0';
    container.style.maxWidth = 'none';
  } else if (appState.currentPage === 'forgot-password') {
    // Extract token from URL if present (e.g., #forgot-password/TOKEN)
    const urlParts = window.location.hash.split('/');
    const token = urlParts.length > 1 ? urlParts[1] : null;
    
    // Import and render the forgot password page
    import('../forgot-password.js').then(module => {
      container.appendChild(module.renderForgotPasswordPage(token));
    }).catch(error => {
      console.error('Error loading forgot password module:', error);
      container.appendChild(createErrorMessage('Failed to load password reset module'));
    });
    
    // Add special full-height styling for forgot password page
    container.style.padding = '0';
    container.style.maxWidth = 'none';
  } else if (appState.currentPage === 'landing') {
    // Import and render the landing page
    import('../landing-new.js').then(module => {
      container.appendChild(module.renderLandingPage());
    }).catch(error => {
      console.error('Error loading landing page module:', error);
      container.appendChild(createErrorMessage('Failed to load landing page module'));
    });
    
    // Add special full-width styling for landing page
    container.style.padding = '0';
    container.style.maxWidth = 'none';
  } else if (appState.currentPage === 'onboarding') {
    // Hide the main header for the onboarding page as it has its own header with logo
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
      appHeader.style.display = 'none';
    }
    
    // Import and render the onboarding page
    import('../onboarding.js').then(module => {
      container.appendChild(module.renderOnboardingPage(appState));
    }).catch(error => {
      console.error('Error loading onboarding module:', error);
      container.appendChild(createErrorMessage('Failed to load onboarding module'));
    });
  } else {
    // Render different pages based on the current page state
    switch(appState.currentPage) {
      case 'dashboard':
        container.appendChild(renderDashboardPage());
        break;
      case 'income':
        container.appendChild(renderIncomePage());
        break;
      case 'expenses':
        // Check if receipt scanner is available, otherwise use standard expenses page
        import('../receipt-scanner.js').then(module => {
          if (module && module.renderExpensesPageWithScanner) {
            container.appendChild(module.renderExpensesPageWithScanner());
          } else {
            container.appendChild(renderExpensesPage());
          }
        }).catch(error => {
          console.error('Error loading receipt scanner module:', error);
          container.appendChild(renderExpensesPage());
        });
        break;
      case 'gigs':
        container.appendChild(renderGigsPage());
        break;
      case 'affiliates':
        // Import the affiliates hub page module
        import('../affiliates-hub.js').then(module => {
          container.appendChild(module.renderAffiliateHub(appState.user.id));
        }).catch(error => {
          console.error('Error loading affiliates hub module:', error);
          container.appendChild(createErrorMessage('Failed to load affiliates hub module'));
        });
        break;
      case 'wellness':
        // Import the Financial Wellness page module
        import('../wellness-page.js').then(module => {
          // Using async function as renderWellnessPage returns a Promise
          (async () => {
            try {
              const wellnessPage = await module.renderWellnessPage(appState.user.id);
              container.appendChild(wellnessPage);
            } catch (error) {
              console.error('Error rendering wellness page:', error);
              container.appendChild(createErrorMessage('Failed to load financial wellness data'));
            }
          })();
        }).catch(error => {
          console.error('Error loading wellness page module:', error);
          container.appendChild(createErrorMessage('Failed to load financial wellness module'));
        });
        break;
        
      case 'moneymentor':
        console.log('Loading Money Mentor module...');
        // Create main container
        const moneyMentorContainer = document.createElement('div');
        moneyMentorContainer.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
        
        // Add simple content
        moneyMentorContainer.innerHTML = `
          <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Money Mentor</h2>
            <p class="mb-4">Get personalized financial advice powered by AI.</p>
            <div class="animate-pulse inline-block p-4 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Ready to help with your financial questions!
            </div>
          </div>
        `;
        
        // Use the UI directly
        container.appendChild(moneyMentorContainer);
        break;
      case 'moneymentor-advanced':
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
        break;
        
      case 'blog':
        // Import the Blog page module
        import('../blog-page.js').then(module => {
          // Use async IIFE since blog rendering might be async
          (async () => {
            try {
              // Check if specific article is requested
              const urlParts = window.location.hash.split('/');
              if (urlParts.length > 1 && urlParts[0] === '#blog') {
                // Article view - urlParts[1] contains the slug
                const articleSlug = urlParts[1];
                const articlePage = await module.renderArticlePage(articleSlug, 
                  appState?.user?.isAuthenticated || false);
                container.appendChild(articlePage);
              } else {
                // Blog listing view
                const blogPage = await module.renderBlogPage(
                  appState?.user?.isAuthenticated || false);
                container.appendChild(blogPage);
              }
            } catch (error) {
              console.error('Error rendering blog page:', error);
              container.appendChild(createErrorMessage('Failed to load blog content'));
            }
          })();
        }).catch(error => {
          console.error('Error loading blog module:', error);
          container.appendChild(createErrorMessage('Failed to load blog module'));
        });
        break;
        
      case 'settings':
        container.appendChild(renderSettingsPage());
        break;
        
      default:
        // Handle unknown pages with an error or redirect
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full">
            <h1 class="text-2xl font-bold mb-4">Page Not Found</h1>
            <p class="mb-8">Sorry, the page "${appState.currentPage}" does not exist.</p>
            <button id="go-dashboard" class="px-4 py-2 bg-primary text-white rounded-lg">
              Go to Dashboard
            </button>
          </div>
        `;
        
        // Add event listener to the button
        setTimeout(() => {
          const goDashboardBtn = document.getElementById('go-dashboard');
          if (goDashboardBtn) {
            goDashboardBtn.addEventListener('click', () => navigateTo('dashboard'));
          }
        }, 0);
    }
  }
}

// Helper function to create error messages
function createErrorMessage(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.style.backgroundColor = 'rgba(254, 226, 226, 1)';
  errorContainer.style.color = 'rgba(185, 28, 28, 1)';
  errorContainer.style.padding = '1rem';
  errorContainer.style.borderRadius = 'var(--radius-md, 8px)';
  errorContainer.style.marginBottom = '1rem';
  
  const errorHeading = document.createElement('h3');
  errorHeading.style.fontWeight = 'bold';
  errorHeading.style.marginBottom = '0.5rem';
  errorHeading.textContent = 'Error';
  
  const errorText = document.createElement('p');
  errorText.textContent = message;
  
  const retryButton = document.createElement('button');
  retryButton.textContent = 'Retry';
  retryButton.style.marginTop = '0.5rem';
  retryButton.style.padding = '0.5rem 1rem';
  retryButton.style.backgroundColor = 'rgba(185, 28, 28, 1)';
  retryButton.style.color = 'white';
  retryButton.style.borderRadius = 'var(--radius-sm, 4px)';
  retryButton.style.cursor = 'pointer';
  
  retryButton.addEventListener('click', () => {
    // Refresh the current page
    renderApp();
  });
  
  errorContainer.appendChild(errorHeading);
  errorContainer.appendChild(errorText);
  errorContainer.appendChild(retryButton);
  
  return errorContainer;
}

// Helper function to create buttons
function createButton(text, onClick, bgColor = 'var(--color-primary, #34A853)', textColor = 'white') {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = 'stackr-button';
  button.style.backgroundColor = bgColor;
  button.style.color = textColor;
  button.style.padding = '0.5rem 1rem';
  button.style.borderRadius = 'var(--radius-md, 8px)';
  button.style.border = 'none';
  button.style.fontWeight = 'var(--font-medium, 500)';
  button.style.cursor = 'pointer';
  button.style.transition = 'background-color 0.2s';
  
  // Add hover effect
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = adjustColor(bgColor, -10);
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = bgColor;
  });
  
  // Add click handler
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

// Helper function to adjust color brightness
function adjustColor(color, percent) {
  // Simple function to darken/lighten a color - only works with hex colors
  if (color.startsWith('var(')) return color; // Skip CSS variables
  
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;
  
  // Ensure values are in valid range
  const newR = Math.max(0, Math.min(255, r));
  const newG = Math.max(0, Math.min(255, g));
  const newB = Math.max(0, Math.min(255, b));
  
  return '#' + (
    (newR << 16) + 
    (newG << 8) + 
    newB
  ).toString(16).padStart(6, '0');
}

// Navigation helper
function navigateTo(page) {
  // Save the previous page to allow "back" functionality
  const previousPage = appState.currentPage;
  appState.previousPage = previousPage;
  
  // Update current page
  appState.currentPage = page;
  
  // Update URL hash
  window.location.hash = page;
  
  // Re-render the app
  renderApp();
  
  // Log the navigation for debugging
  console.log(`Navigated from ${previousPage} to ${page}`);
}

// Main render function
function renderApp() {
  console.log('Rendering app...');
  
  try {
    // Create and render the layout
    createLayout();
    
    // Update document title based on current page
    const pageTitle = appState.currentPage.charAt(0).toUpperCase() + appState.currentPage.slice(1);
    document.title = `Stackr Finance | ${pageTitle}`;
  } catch (error) {
    console.error('Error rendering app:', error);
    
    // Show critical error message
    const root = document.getElementById('root');
    root.innerHTML = `
      <div style="padding: 2rem; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #b91c1c;">
          Critical Error
        </h1>
        <p style="margin-bottom: 1rem;">
          An unexpected error occurred while rendering the application.
        </p>
        <p style="margin-bottom: 1.5rem; font-family: monospace; background: #f5f5f5; padding: 0.5rem; border-radius: 4px; text-align: left; overflow-x: auto;">
          ${error.message}
        </p>
        <button id="retry-button" style="padding: 0.5rem 1rem; background-color: #34A853; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
    
    // Add event listener to retry button
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version initializing...');
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // Don't show error UI for now, just log it
  });
  
  // Load state from storage
  loadStateFromStorage();
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '');
  // If no hash is provided, show landing page
  if (!hash) {
    appState.currentPage = 'landing';
  } else {
    appState.currentPage = hash;
    
    // Handle URL formats like #blog/article-slug
    if (hash.includes('/')) {
      const parts = hash.split('/');
      appState.currentPage = parts[0];
      // Additional path segments are handled by specific page renderers
    }
  }
  
  // Initialize authentication
  initAuth();
  
  // Render the initial app state
  renderApp();
  
  // Set up hash-based navigation
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '');
    
    // Only navigate if the hash actually changed
    if (newHash !== appState.currentPage) {
      if (newHash) {
        navigateTo(newHash);
      } else {
        // If hash is empty, navigate to landing
        navigateTo('landing');
      }
    }
  });
  
  // Set up auto-save for state
  setInterval(saveStateToStorage, 30000); // Save every 30 seconds
  
  console.log('GREEN Firebase-free version loaded successfully!');
});

// Placeholder for Dashboard Page rendering
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

// Helper function to create summary cards for the dashboard
function createSummaryCard(title, value, subtitle, accentColor) {
  const card = document.createElement('div');
  card.className = 'summary-card';
  card.style.backgroundColor = 'var(--color-bg-primary, white)';
  card.style.borderRadius = 'var(--radius-lg, 0.5rem)';
  card.style.padding = 'var(--space-4, 1rem)';
  card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  
  // Add accent bar on the left
  const accentBar = document.createElement('div');
  accentBar.style.position = 'absolute';
  accentBar.style.left = '0';
  accentBar.style.top = '0';
  accentBar.style.bottom = '0';
  accentBar.style.width = '4px';
  accentBar.style.backgroundColor = accentColor;
  accentBar.style.borderTopLeftRadius = 'var(--radius-lg, 0.5rem)';
  accentBar.style.borderBottomLeftRadius = 'var(--radius-lg, 0.5rem)';
  card.appendChild(accentBar);
  
  // Card content
  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.style.fontSize = 'var(--text-sm, 0.875rem)';
  titleEl.style.fontWeight = 'var(--font-medium, 500)';
  titleEl.style.color = 'var(--color-text-secondary, #6b7280)';
  titleEl.style.marginBottom = 'var(--space-2, 0.5rem)';
  
  const valueEl = document.createElement('div');
  valueEl.textContent = value;
  valueEl.style.fontSize = 'var(--text-2xl, 1.5rem)';
  valueEl.style.fontWeight = 'var(--font-bold, 700)';
  valueEl.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const subtitleEl = document.createElement('div');
  subtitleEl.textContent = subtitle;
  subtitleEl.style.fontSize = 'var(--text-xs, 0.75rem)';
  subtitleEl.style.color = 'var(--color-text-secondary, #6b7280)';
  
  // Assemble card
  card.appendChild(titleEl);
  card.appendChild(valueEl);
  card.appendChild(subtitleEl);
  
  return card;
}

// Helper function to calculate total income
function calculateTotalIncome() {
  return appState.incomeEntries.reduce((total, entry) => total + entry.amount, 0);
}

// Helper function to calculate income split
function calculateIncomeSplit() {
  const total = appState.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const splitRatio = appState.user.splitRatio;
  
  return {
    total,
    needs: (total * splitRatio.needs / 100).toFixed(2),
    investments: (total * splitRatio.investments / 100).toFixed(2),
    savings: (total * splitRatio.savings / 100).toFixed(2)
  };
}

// Placeholder for Income Page rendering
function renderIncomePage() {
  const container = document.createElement('div');
  container.className = 'income-page-container';
  
  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';
  header.style.marginBottom = 'var(--space-6, 1.5rem)';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  
  const headerLeft = document.createElement('div');
  
  const title = document.createElement('h1');
  title.textContent = 'Income Tracker';
  title.style.fontSize = 'var(--text-2xl, 1.5rem)';
  title.style.fontWeight = 'var(--font-bold, 700)';
  title.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Track and manage your income streams';
  subtitle.style.color = 'var(--color-text-secondary, #6b7280)';
  
  headerLeft.appendChild(title);
  headerLeft.appendChild(subtitle);
  
  const addButton = createButton('Add Income', () => {
    // Show add income form
    const form = document.getElementById('add-income-form');
    if (form) {
      form.style.display = 'block';
      
      // Scroll to form
      form.scrollIntoView({ behavior: 'smooth' });
      
      // Focus on first input
      const firstInput = form.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  });
  
  header.appendChild(headerLeft);
  header.appendChild(addButton);
  
  container.appendChild(header);
  
  // Income entry form
  const formCard = document.createElement('div');
  formCard.className = 'form-card';
  formCard.id = 'add-income-form';
  formCard.style.backgroundColor = 'var(--color-bg-primary, white)';
  formCard.style.borderRadius = 'var(--radius-lg, 0.5rem)';
  formCard.style.padding = 'var(--space-6, 1.5rem)';
  formCard.style.marginBottom = 'var(--space-6, 1.5rem)';
  formCard.style.display = 'none'; // Hidden by default
  
  const formTitle = document.createElement('h2');
  formTitle.textContent = 'Add New Income';
  formTitle.style.fontSize = 'var(--text-xl, 1.25rem)';
  formTitle.style.fontWeight = 'var(--font-bold, 700)';
  formTitle.style.marginBottom = 'var(--space-4, 1rem)';
  
  const form = document.createElement('form');
  form.style.display = 'grid';
  form.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  form.style.gap = 'var(--space-4, 1rem)';
  
  // Source field
  const sourceField = document.createElement('div');
  sourceField.className = 'form-field';
  
  const sourceLabel = document.createElement('label');
  sourceLabel.htmlFor = 'income-source';
  sourceLabel.textContent = 'Income Source';
  sourceLabel.style.display = 'block';
  sourceLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  sourceLabel.style.fontSize = 'var(--text-sm, 0.875rem)';
  sourceLabel.style.fontWeight = 'var(--font-medium, 500)';
  
  const sourceInput = document.createElement('input');
  sourceInput.type = 'text';
  sourceInput.id = 'income-source';
  sourceInput.placeholder = 'e.g., Freelance Project, Salary';
  sourceInput.required = true;
  sourceInput.style.width = '100%';
  sourceInput.style.padding = '0.5rem 0.75rem';
  sourceInput.style.borderRadius = 'var(--radius-md, 0.375rem)';
  sourceInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  sourceField.appendChild(sourceLabel);
  sourceField.appendChild(sourceInput);
  
  // Amount field
  const amountField = document.createElement('div');
  amountField.className = 'form-field';
  
  const amountLabel = document.createElement('label');
  amountLabel.htmlFor = 'income-amount';
  amountLabel.textContent = 'Amount';
  amountLabel.style.display = 'block';
  amountLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  amountLabel.style.fontSize = 'var(--text-sm, 0.875rem)';
  amountLabel.style.fontWeight = 'var(--font-medium, 500)';
  
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.id = 'income-amount';
  amountInput.placeholder = 'e.g., 1000';
  amountInput.step = '0.01';
  amountInput.min = '0';
  amountInput.required = true;
  amountInput.style.width = '100%';
  amountInput.style.padding = '0.5rem 0.75rem';
  amountInput.style.borderRadius = 'var(--radius-md, 0.375rem)';
  amountInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  amountField.appendChild(amountLabel);
  amountField.appendChild(amountInput);
  
  // Date field
  const dateField = document.createElement('div');
  dateField.className = 'form-field';
  
  const dateLabel = document.createElement('label');
  dateLabel.htmlFor = 'income-date';
  dateLabel.textContent = 'Date Received';
  dateLabel.style.display = 'block';
  dateLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  dateLabel.style.fontSize = 'var(--text-sm, 0.875rem)';
  dateLabel.style.fontWeight = 'var(--font-medium, 500)';
  
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'income-date';
  dateInput.required = true;
  dateInput.value = new Date().toISOString().slice(0, 10); // Today's date
  dateInput.style.width = '100%';
  dateInput.style.padding = '0.5rem 0.75rem';
  dateInput.style.borderRadius = 'var(--radius-md, 0.375rem)';
  dateInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  dateField.appendChild(dateLabel);
  dateField.appendChild(dateInput);
  
  // Form actions
  const formActions = document.createElement('div');
  formActions.className = 'form-actions';
  formActions.style.display = 'flex';
  formActions.style.gap = 'var(--space-3, 0.75rem)';
  formActions.style.marginTop = 'var(--space-4, 1rem)';
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '0.5rem 1rem';
  cancelButton.style.borderRadius = 'var(--radius-md, 0.375rem)';
  cancelButton.style.border = '1px solid var(--color-border, #e5e7eb)';
  cancelButton.style.backgroundColor = 'transparent';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.addEventListener('click', () => {
    // Hide form
    formCard.style.display = 'none';
    
    // Clear form fields
    form.reset();
  });
  
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Save Income';
  saveButton.style.padding = '0.5rem 1rem';
  saveButton.style.borderRadius = 'var(--radius-md, 0.375rem)';
  saveButton.style.border = 'none';
  saveButton.style.backgroundColor = 'var(--color-primary, #34A853)';
  saveButton.style.color = 'white';
  saveButton.style.cursor = 'pointer';
  
  formActions.appendChild(cancelButton);
  formActions.appendChild(saveButton);
  
  // Add form fields
  form.appendChild(sourceField);
  form.appendChild(amountField);
  form.appendChild(dateField);
  form.appendChild(formActions);
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const newIncome = {
      id: Date.now(), // Simple unique ID
      source: sourceInput.value,
      amount: parseFloat(amountInput.value),
      date: dateInput.value,
      createdAt: new Date().toISOString()
    };
    
    // Add to income entries
    appState.incomeEntries.push(newIncome);
    
    // Save to storage
    saveStateToStorage();
    
    // Hide form
    formCard.style.display = 'none';
    
    // Clear form fields
    form.reset();
    
    // Refresh the page to show new entry
    renderApp();
  });
  
  formCard.appendChild(formTitle);
  formCard.appendChild(form);
  
  container.appendChild(formCard);
  
  // Income entries list
  const entriesCard = document.createElement('div');
  entriesCard.className = 'entries-card';
  entriesCard.style.backgroundColor = 'var(--color-bg-primary, white)';
  entriesCard.style.borderRadius = 'var(--radius-lg, 0.5rem)';
  entriesCard.style.padding = 'var(--space-6, 1.5rem)';
  
  const entriesTitle = document.createElement('h2');
  entriesTitle.textContent = 'Income History';
  entriesTitle.style.fontSize = 'var(--text-xl, 1.25rem)';
  entriesTitle.style.fontWeight = 'var(--font-bold, 700)';
  entriesTitle.style.marginBottom = 'var(--space-4, 1rem)';
  
  entriesCard.appendChild(entriesTitle);
  
  // Display income entries
  if (!appState.incomeEntries || appState.incomeEntries.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = 'var(--space-6, 1.5rem)';
    emptyState.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
    emptyState.style.borderRadius = 'var(--radius-md, 0.375rem)';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = '📊';
    emptyIcon.style.fontSize = '2rem';
    emptyIcon.style.marginBottom = 'var(--space-3, 0.75rem)';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'No income entries yet. Add your first income to get started!';
    emptyText.style.color = 'var(--color-text-secondary, #6b7280)';
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyText);
    entriesCard.appendChild(emptyState);
  } else {
    // Create income table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // Table header
    const thead = document.createElement('thead');
    thead.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
    thead.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
    
    const headerRow = document.createElement('tr');
    
    const headers = ['Source', 'Amount', 'Date', 'Actions'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.padding = 'var(--space-3, 0.75rem)';
      th.style.textAlign = 'left';
      th.style.fontWeight = 'var(--font-medium, 500)';
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    // Sort entries by date (newest first)
    const sortedEntries = [...appState.incomeEntries].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    sortedEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      // Add alternating row colors
      row.style.backgroundColor = index % 2 === 0 ? 'var(--color-bg-primary, white)' : 'var(--color-bg-secondary, #f9fafb)';
      row.style.borderBottom = '1px solid var(--color-border, #e5e7eb)';
      
      // Source column
      const sourceCell = document.createElement('td');
      sourceCell.textContent = entry.source;
      sourceCell.style.padding = 'var(--space-3, 0.75rem)';
      row.appendChild(sourceCell);
      
      // Amount column
      const amountCell = document.createElement('td');
      amountCell.textContent = `$${entry.amount.toFixed(2)}`;
      amountCell.style.padding = 'var(--space-3, 0.75rem)';
      amountCell.style.fontWeight = 'var(--font-medium, 500)';
      row.appendChild(amountCell);
      
      // Date column
      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(entry.date).toLocaleDateString();
      dateCell.style.padding = 'var(--space-3, 0.75rem)';
      row.appendChild(dateCell);
      
      // Actions column
      const actionsCell = document.createElement('td');
      actionsCell.style.padding = 'var(--space-3, 0.75rem)';
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '🗑️';
      deleteButton.setAttribute('aria-label', 'Delete entry');
      deleteButton.style.backgroundColor = 'transparent';
      deleteButton.style.border = 'none';
      deleteButton.style.cursor = 'pointer';
      deleteButton.title = 'Delete entry';
      
      deleteButton.addEventListener('click', () => {
        // Remove entry from state
        appState.incomeEntries = appState.incomeEntries.filter(e => e.id !== entry.id);
        
        // Save to storage
        saveStateToStorage();
        
        // Refresh the page
        renderApp();
      });
      
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    entriesCard.appendChild(table);
  }
  
  container.appendChild(entriesCard);
  
  return container;
}

// Placeholder for other page rendering functions
function renderExpensesPage() {
  const container = document.createElement('div');
  container.className = 'expenses-container';
  
  // Add some placeholder content for now
  const content = document.createElement('div');
  content.innerHTML = `
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Expenses Tracker</h1>
    <p style="color: var(--color-text-secondary, #6b7280); margin-bottom: 2rem;">
      Track your expenses to maintain your 40/30/30 split.
    </p>
    <div style="padding: 2rem; background-color: var(--color-bg-primary, white); border-radius: 0.5rem; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Coming Soon</h2>
      <p>The expenses tracker is being implemented. Check back soon!</p>
    </div>
  `;
  
  container.appendChild(content);
  return container;
}

function renderGigsPage() {
  const container = document.createElement('div');
  container.className = 'gigs-container';
  
  // Add some placeholder content for now
  const content = document.createElement('div');
  content.innerHTML = `
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Stackr Gigs</h1>
    <p style="color: var(--color-text-secondary, #6b7280); margin-bottom: 2rem;">
      Discover income opportunities and side hustles.
    </p>
    <div style="padding: 2rem; background-color: var(--color-bg-primary, white); border-radius: 0.5rem; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Coming Soon</h2>
      <p>The gigs platform is being implemented. Check back soon!</p>
    </div>
  `;
  
  container.appendChild(content);
  return container;
}

function renderSettingsPage() {
  const container = document.createElement('div');
  container.className = 'settings-container';
  
  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';
  header.style.marginBottom = 'var(--space-6, 1.5rem)';
  
  const title = document.createElement('h1');
  title.textContent = 'Settings';
  title.style.fontSize = 'var(--text-2xl, 1.5rem)';
  title.style.fontWeight = 'var(--font-bold, 700)';
  title.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Customize your Stackr Finance experience';
  subtitle.style.color = 'var(--color-text-secondary, #6b7280)';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  container.appendChild(header);
  
  // Settings card
  const settingsCard = document.createElement('div');
  settingsCard.className = 'settings-card';
  settingsCard.style.backgroundColor = 'var(--color-bg-primary, white)';
  settingsCard.style.borderRadius = 'var(--radius-lg, 0.5rem)';
  settingsCard.style.padding = 'var(--space-6, 1.5rem)';
  settingsCard.style.marginBottom = 'var(--space-6, 1.5rem)';
  
  const settingsTitle = document.createElement('h2');
  settingsTitle.textContent = 'User Settings';
  settingsTitle.style.fontSize = 'var(--text-xl, 1.25rem)';
  settingsTitle.style.fontWeight = 'var(--font-bold, 700)';
  settingsTitle.style.marginBottom = 'var(--space-4, 1rem)';
  settingsCard.appendChild(settingsTitle);
  
  // Theme setting
  const themeSetting = document.createElement('div');
  themeSetting.className = 'setting-item';
  themeSetting.style.marginBottom = 'var(--space-4, 1rem)';
  
  const themeLabel = document.createElement('label');
  themeLabel.htmlFor = 'theme-select';
  themeLabel.textContent = 'Theme';
  themeLabel.style.display = 'block';
  themeLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  themeLabel.style.fontSize = 'var(--text-sm, 0.875rem)';
  themeLabel.style.fontWeight = 'var(--font-medium, 500)';
  
  const themeSelect = document.createElement('select');
  themeSelect.id = 'theme-select';
  themeSelect.style.width = '100%';
  themeSelect.style.padding = '0.5rem 0.75rem';
  themeSelect.style.borderRadius = 'var(--radius-md, 0.375rem)';
  themeSelect.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  const lightOption = document.createElement('option');
  lightOption.value = 'light';
  lightOption.textContent = 'Light';
  
  const darkOption = document.createElement('option');
  darkOption.value = 'dark';
  darkOption.textContent = 'Dark';
  
  themeSelect.appendChild(lightOption);
  themeSelect.appendChild(darkOption);
  
  // Set current theme
  themeSelect.value = appState.theme;
  
  themeSelect.addEventListener('change', () => {
    appState.theme = themeSelect.value;
    document.documentElement.classList.toggle('dark', appState.theme === 'dark');
    saveStateToStorage();
    renderApp();
  });
  
  themeSetting.appendChild(themeLabel);
  themeSetting.appendChild(themeSelect);
  settingsCard.appendChild(themeSetting);
  
  // Split ratio setting
  const splitSetting = document.createElement('div');
  splitSetting.className = 'setting-item';
  splitSetting.style.marginBottom = 'var(--space-4, 1rem)';
  
  const splitLabel = document.createElement('label');
  splitLabel.textContent = 'Income Split Ratio';
  splitLabel.style.display = 'block';
  splitLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  splitLabel.style.fontSize = 'var(--text-sm, 0.875rem)';
  splitLabel.style.fontWeight = 'var(--font-medium, 500)';
  
  const splitDesc = document.createElement('p');
  splitDesc.textContent = 'Customize how you want to split your income';
  splitDesc.style.fontSize = 'var(--text-xs, 0.75rem)';
  splitDesc.style.color = 'var(--color-text-secondary, #6b7280)';
  splitDesc.style.marginBottom = 'var(--space-3, 0.75rem)';
  
  // Split form
  const splitForm = document.createElement('div');
  splitForm.className = 'split-form';
  splitForm.style.display = 'grid';
  splitForm.style.gridTemplateColumns = 'repeat(3, 1fr)';
  splitForm.style.gap = 'var(--space-3, 0.75rem)';
  
  // Needs
  const needsField = document.createElement('div');
  const needsLabel = document.createElement('label');
  needsLabel.htmlFor = 'needs-percent';
  needsLabel.textContent = 'Needs %';
  needsLabel.style.display = 'block';
  needsLabel.style.fontSize = 'var(--text-xs, 0.75rem)';
  needsLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const needsInput = document.createElement('input');
  needsInput.type = 'number';
  needsInput.id = 'needs-percent';
  needsInput.min = '0';
  needsInput.max = '100';
  needsInput.value = appState.user.splitRatio.needs;
  needsInput.style.width = '100%';
  needsInput.style.padding = '0.5rem 0.75rem';
  needsInput.style.borderRadius = 'var(--radius-md, 0.375rem)';
  needsInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  needsField.appendChild(needsLabel);
  needsField.appendChild(needsInput);
  
  // Investments
  const investmentsField = document.createElement('div');
  const investmentsLabel = document.createElement('label');
  investmentsLabel.htmlFor = 'investments-percent';
  investmentsLabel.textContent = 'Investments %';
  investmentsLabel.style.display = 'block';
  investmentsLabel.style.fontSize = 'var(--text-xs, 0.75rem)';
  investmentsLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const investmentsInput = document.createElement('input');
  investmentsInput.type = 'number';
  investmentsInput.id = 'investments-percent';
  investmentsInput.min = '0';
  investmentsInput.max = '100';
  investmentsInput.value = appState.user.splitRatio.investments;
  investmentsInput.style.width = '100%';
  investmentsInput.style.padding = '0.5rem 0.75rem';
  investmentsInput.style.borderRadius = 'var(--radius-md, 0.375rem)';
  investmentsInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  investmentsField.appendChild(investmentsLabel);
  investmentsField.appendChild(investmentsInput);
  
  // Savings
  const savingsField = document.createElement('div');
  const savingsLabel = document.createElement('label');
  savingsLabel.htmlFor = 'savings-percent';
  savingsLabel.textContent = 'Savings %';
  savingsLabel.style.display = 'block';
  savingsLabel.style.fontSize = 'var(--text-xs, 0.75rem)';
  savingsLabel.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const savingsInput = document.createElement('input');
  savingsInput.type = 'number';
  savingsInput.id = 'savings-percent';
  savingsInput.min = '0';
  savingsInput.max = '100';
  savingsInput.value = appState.user.splitRatio.savings;
  savingsInput.style.width = '100%';
  savingsInput.style.padding = '0.5rem 0.75rem';
  savingsInput.style.borderRadius = 'var(--radius-md, 0.375rem)';
  savingsInput.style.border = '1px solid var(--color-border, #e5e7eb)';
  
  savingsField.appendChild(savingsLabel);
  savingsField.appendChild(savingsInput);
  
  // Total display
  const totalDisplay = document.createElement('div');
  totalDisplay.id = 'total-display';
  totalDisplay.style.gridColumn = '1 / -1';
  totalDisplay.style.marginTop = 'var(--space-2, 0.5rem)';
  totalDisplay.style.fontSize = 'var(--text-sm, 0.875rem)';
  
  // Update total when inputs change
  function updateTotalDisplay() {
    const needs = parseInt(needsInput.value) || 0;
    const investments = parseInt(investmentsInput.value) || 0;
    const savings = parseInt(savingsInput.value) || 0;
    const total = needs + investments + savings;
    
    totalDisplay.textContent = `Total: ${total}%`;
    totalDisplay.style.color = total === 100 ? 'var(--color-success, #34A853)' : 'var(--color-error, #d32f2f)';
  }
  
  // Add event listeners to update total
  needsInput.addEventListener('input', updateTotalDisplay);
  investmentsInput.addEventListener('input', updateTotalDisplay);
  savingsInput.addEventListener('input', updateTotalDisplay);
  
  // Initial update
  updateTotalDisplay();
  
  // Assemble split form
  splitForm.appendChild(needsField);
  splitForm.appendChild(investmentsField);
  splitForm.appendChild(savingsField);
  splitForm.appendChild(totalDisplay);
  
  // Add quick presets
  const presetsContainer = document.createElement('div');
  presetsContainer.style.marginTop = 'var(--space-3, 0.75rem)';
  
  const presetsLabel = document.createElement('div');
  presetsLabel.textContent = 'Quick Presets:';
  presetsLabel.style.fontSize = 'var(--text-xs, 0.75rem)';
  presetsLabel.style.marginBottom = 'var(--space-2, 0.5rem)';
  
  const presetButtonsContainer = document.createElement('div');
  presetButtonsContainer.style.display = 'flex';
  presetButtonsContainer.style.gap = 'var(--space-2, 0.5rem)';
  presetButtonsContainer.style.flexWrap = 'wrap';
  
  const presets = [
    { name: '40/30/30', needs: 40, investments: 30, savings: 30 },
    { name: '50/30/20', needs: 50, investments: 30, savings: 20 },
    { name: '60/20/20', needs: 60, investments: 20, savings: 20 }
  ];
  
  presets.forEach(preset => {
    const presetButton = document.createElement('button');
    presetButton.type = 'button';
    presetButton.textContent = preset.name;
    presetButton.style.padding = '0.25rem 0.5rem';
    presetButton.style.fontSize = 'var(--text-xs, 0.75rem)';
    presetButton.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
    presetButton.style.border = '1px solid var(--color-border, #e5e7eb)';
    presetButton.style.borderRadius = 'var(--radius-md, 0.375rem)';
    presetButton.style.cursor = 'pointer';
    
    presetButton.addEventListener('click', () => {
      needsInput.value = preset.needs;
      investmentsInput.value = preset.investments;
      savingsInput.value = preset.savings;
      updateTotalDisplay();
    });
    
    presetButtonsContainer.appendChild(presetButton);
  });
  
  presetsContainer.appendChild(presetsLabel);
  presetsContainer.appendChild(presetButtonsContainer);
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Split Ratio';
  saveButton.style.marginTop = 'var(--space-4, 1rem)';
  saveButton.style.padding = '0.5rem 1rem';
  saveButton.style.backgroundColor = 'var(--color-primary, #34A853)';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = 'var(--radius-md, 0.375rem)';
  saveButton.style.cursor = 'pointer';
  
  saveButton.addEventListener('click', () => {
    const needs = parseInt(needsInput.value) || 0;
    const investments = parseInt(investmentsInput.value) || 0;
    const savings = parseInt(savingsInput.value) || 0;
    const total = needs + investments + savings;
    
    if (total !== 100) {
      alert('Split ratio must total 100%');
      return;
    }
    
    // Update split ratio
    appState.user.splitRatio = {
      needs,
      investments,
      savings
    };
    
    // Save to storage
    saveStateToStorage();
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Split ratio saved successfully!';
    successMessage.style.marginTop = 'var(--space-2, 0.5rem)';
    successMessage.style.padding = 'var(--space-2, 0.5rem)';
    successMessage.style.backgroundColor = 'var(--color-success-bg, #d1fae5)';
    successMessage.style.color = 'var(--color-success, #34A853)';
    successMessage.style.borderRadius = 'var(--radius-md, 0.375rem)';
    
    // Replace any existing message
    const existingMessage = document.getElementById('split-success-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    successMessage.id = 'split-success-message';
    splitSetting.appendChild(successMessage);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  });
  
  // Assemble split setting
  splitSetting.appendChild(splitLabel);
  splitSetting.appendChild(splitDesc);
  splitSetting.appendChild(splitForm);
  splitSetting.appendChild(presetsContainer);
  splitSetting.appendChild(saveButton);
  
  settingsCard.appendChild(splitSetting);
  
  // Subscription section
  const subscriptionCard = document.createElement('div');
  subscriptionCard.className = 'subscription-card';
  subscriptionCard.style.backgroundColor = 'var(--color-bg-primary, white)';
  subscriptionCard.style.borderRadius = 'var(--radius-lg, 0.5rem)';
  subscriptionCard.style.padding = 'var(--space-6, 1.5rem)';
  
  const subscriptionTitle = document.createElement('h2');
  subscriptionTitle.textContent = 'Your Subscription';
  subscriptionTitle.style.fontSize = 'var(--text-xl, 1.25rem)';
  subscriptionTitle.style.fontWeight = 'var(--font-bold, 700)';
  subscriptionTitle.style.marginBottom = 'var(--space-4, 1rem)';
  
  subscriptionCard.appendChild(subscriptionTitle);
  
  // Current plan
  const currentPlanContainer = document.createElement('div');
  currentPlanContainer.style.padding = 'var(--space-4, 1rem)';
  currentPlanContainer.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
  currentPlanContainer.style.borderRadius = 'var(--radius-md, 0.375rem)';
  currentPlanContainer.style.marginBottom = 'var(--space-4, 1rem)';
  
  const planName = document.createElement('div');
  planName.style.fontSize = 'var(--text-lg, 1.125rem)';
  planName.style.fontWeight = 'var(--font-semibold, 600)';
  planName.style.marginBottom = 'var(--space-1, 0.25rem)';
  
  const planDesc = document.createElement('div');
  planDesc.style.fontSize = 'var(--text-sm, 0.875rem)';
  planDesc.style.color = 'var(--color-text-secondary, #6b7280)';
  
  // Set plan details based on subscription tier
  if (appState.user.subscription.tier === 'free') {
    planName.textContent = 'Free Plan';
    planDesc.textContent = 'Basic features with limited functionality.';
  } else if (appState.user.subscription.tier === 'pro') {
    planName.textContent = 'Pro Plan';
    planDesc.textContent = 'Full access to all features and premium support.';
  } else if (appState.user.subscription.tier === 'lifetime') {
    planName.textContent = 'Lifetime Plan';
    planDesc.textContent = 'Permanent access to all features and premium support.';
  }
  
  currentPlanContainer.appendChild(planName);
  currentPlanContainer.appendChild(planDesc);
  
  subscriptionCard.appendChild(currentPlanContainer);
  
  // Upgrade button (only show for free users)
  if (appState.user.subscription.tier === 'free') {
    const upgradeButton = document.createElement('button');
    upgradeButton.textContent = 'Upgrade to Pro';
    upgradeButton.style.backgroundColor = 'var(--color-tertiary, #3b82f6)';
    upgradeButton.style.color = 'white';
    upgradeButton.style.padding = '0.5rem 1rem';
    upgradeButton.style.borderRadius = 'var(--radius-md, 0.375rem)';
    upgradeButton.style.border = 'none';
    upgradeButton.style.cursor = 'pointer';
    
    upgradeButton.addEventListener('click', () => {
      // Navigate to pricing page
      navigateTo('pricing');
    });
    
    subscriptionCard.appendChild(upgradeButton);
  }
  
  container.appendChild(settingsCard);
  container.appendChild(subscriptionCard);
  
  return container;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version initializing...');
  
  // Load state from storage
  loadStateFromStorage();
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '');
  // If no hash is provided, show landing page
  if (!hash) {
    appState.currentPage = 'landing';
  } else {
    appState.currentPage = hash;
  }
  
  // Initialize authentication
  initAuth();
  
  // Render the initial app state
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