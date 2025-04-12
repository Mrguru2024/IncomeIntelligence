// GREEN Edition - No dependencies on any external libraries - completely self-contained
// Simple single-page application with route handling

// Setup modern design system with CSS variables
function setupDesignSystem() {
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-primary', '#34A853');
  root.style.setProperty('--color-primary-dark', '#2E8545');
  root.style.setProperty('--color-primary-light', '#6FCF97');
  root.style.setProperty('--color-secondary', '#5B5BD6');
  root.style.setProperty('--color-secondary-dark', '#4747C2');
  root.style.setProperty('--color-secondary-light', '#7676FF');
  root.style.setProperty('--color-tertiary', '#F2994A');
  root.style.setProperty('--color-tertiary-dark', '#E07D26');
  root.style.setProperty('--color-tertiary-light', '#F6C897');
  root.style.setProperty('--color-error', '#EA4335');
  root.style.setProperty('--color-error-light', '#FFEBEE');
  root.style.setProperty('--color-success', '#34A853');
  root.style.setProperty('--color-success-light', '#E8F5E9');
  root.style.setProperty('--color-warning', '#FBBC05');
  root.style.setProperty('--color-warning-light', '#FFF8E1');
  root.style.setProperty('--color-info', '#4285F4');
  root.style.setProperty('--color-info-light', '#E3F2FD');
  
  // Text colors
  root.style.setProperty('--color-text-primary', '#212121');
  root.style.setProperty('--color-text-secondary', '#546E7A');
  root.style.setProperty('--color-text-tertiary', '#90A4AE');
  
  // Background
  root.style.setProperty('--color-bg-primary', '#FFFFFF');
  root.style.setProperty('--color-bg-secondary', '#F5F5F5');
  
  // Border
  root.style.setProperty('--color-border', '#E0E0E0');
  
  // Dark mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    enableDarkMode();
  }
  
  function enableDarkMode() {
    root.style.setProperty('--color-bg-primary', '#121212');
    root.style.setProperty('--color-bg-secondary', '#212121');
    root.style.setProperty('--color-text-primary', '#E1E1E1');
    root.style.setProperty('--color-text-secondary', '#B0B0B0');
    root.style.setProperty('--color-text-tertiary', '#737373');
    root.style.setProperty('--color-border', '#424242');
  }
  
  // Spacing
  root.style.setProperty('--space-1', '0.25rem');
  root.style.setProperty('--space-2', '0.5rem');
  root.style.setProperty('--space-3', '0.75rem');
  root.style.setProperty('--space-4', '1rem');
  root.style.setProperty('--space-5', '1.5rem');
  root.style.setProperty('--space-6', '2rem');
  root.style.setProperty('--space-8', '3rem');
  root.style.setProperty('--space-10', '4rem');
  root.style.setProperty('--space-12', '5rem');
  
  // Container width
  root.style.setProperty('--container-width', '1200px');
  root.style.setProperty('--content-max-width', '1200px');
  
  // Border radius
  root.style.setProperty('--radius-sm', '4px');
  root.style.setProperty('--radius-md', '8px');
  root.style.setProperty('--radius-lg', '12px');
  root.style.setProperty('--radius-xl', '16px');
  root.style.setProperty('--radius-full', '999px');
  
  // Font sizes
  root.style.setProperty('--font-size-xs', '0.75rem');
  root.style.setProperty('--font-size-sm', '0.875rem');
  root.style.setProperty('--font-size-base', '1rem');
  root.style.setProperty('--font-size-lg', '1.125rem');
  root.style.setProperty('--font-size-xl', '1.25rem');
  root.style.setProperty('--font-size-2xl', '1.5rem');
  root.style.setProperty('--font-size-3xl', '1.875rem');
  root.style.setProperty('--font-size-4xl', '2.25rem');
  
  // Font weights
  root.style.setProperty('--font-weight-normal', '400');
  root.style.setProperty('--font-weight-medium', '500');
  root.style.setProperty('--font-weight-bold', '700');
  
  // Shadows
  root.style.setProperty('--shadow-sm', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)');
  root.style.setProperty('--shadow-md', '0 4px 6px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)');
  root.style.setProperty('--shadow-lg', '0 10px 15px rgba(0,0,0,0.12), 0 4px 6px rgba(0,0,0,0.08)');
  root.style.setProperty('--shadow-xl', '0 20px 25px rgba(0,0,0,0.12), 0 10px 10px rgba(0,0,0,0.08)');
  
  // Transitions
  root.style.setProperty('--transition-fast', '150ms cubic-bezier(0.4, 0, 0.2, 1)');
  root.style.setProperty('--transition-normal', '300ms cubic-bezier(0.4, 0, 0.2, 1)');
  root.style.setProperty('--transition-slow', '500ms cubic-bezier(0.4, 0, 0.2, 1)');
  
  // Container padding - will be adjusted by responsive styles
  root.style.setProperty('--container-padding', 'var(--space-6)');
  
  // Card & section spacing - will be adjusted by responsive styles
  root.style.setProperty('--card-gap', 'var(--space-6)');
  root.style.setProperty('--section-gap', 'var(--space-10)');
}

// Application state (In-memory database)
const appState = {
  currentPage: 'landing', // landing, login, register, dashboard, etc.
  user: {
    isAuthenticated: false,
    id: null,
    username: null,
    email: null,
    profilePicture: null,
    onboardingCompleted: false,
    onboardingStep: null,
    preferences: {
      theme: 'light',
      notifications: true,
      defaultAllocationRatio: {
        needs: 40,
        investments: 30,
        savings: 30
      }
    },
    subscription: {
      tier: 'free' // free, pro, lifetime
    }
  },
  financialData: {
    income: [],
    expenses: [],
    savings: [],
    investments: [],
    budgets: [],
    goals: [],
    accounts: []
  },
  financialInsights: {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    investmentRate: 0,
    netWorth: 0
  },
  ui: {
    sidebarOpen: true,
    darkMode: false,
    toasts: []
  },
  financialMascot: null
};

// Check user authentication status
function checkAuthentication() {
  // In this pure frontend version, we'll use localStorage for "auth"
  const savedAuth = localStorage.getItem('stackr_auth');
  
  if (savedAuth) {
    try {
      const authData = JSON.parse(savedAuth);
      
      // Check if auth data has actually expired
      const now = new Date();
      const expiry = new Date(authData.expiresAt);
      
      if (now < expiry) {
        // Valid auth
        appState.user.isAuthenticated = true;
        appState.user.id = authData.userId;
        appState.user.username = authData.username;
        appState.user.email = authData.email;
        appState.user.profilePicture = authData.profilePicture;
        appState.user.onboardingCompleted = authData.onboardingCompleted;
        
        return true;
      } else {
        // Expired auth
        localStorage.removeItem('stackr_auth');
      }
    } catch (e) {
      // Invalid auth data
      localStorage.removeItem('stackr_auth');
    }
  }
  
  return false;
}

// Load state from storage
function loadStateFromStorage() {
  // In a real app, we would load this from an API or IndexedDB
  const savedState = localStorage.getItem('stackr_app_state');
  
  if (savedState) {
    try {
      // Merge the saved state with the default state
      const parsedState = JSON.parse(savedState);
      
      // Only merge the parts that should be persisted
      if (parsedState.user && parsedState.user.preferences) {
        appState.user.preferences = {
          ...appState.user.preferences,
          ...parsedState.user.preferences
        };
      }
      
      if (parsedState.financialData) {
        appState.financialData = {
          ...appState.financialData,
          ...parsedState.financialData
        };
      }
      
      // Check authentication after loading state
      checkAuthentication();
    } catch (e) {
      console.error('Error loading state from storage:', e);
    }
  } else {
    // No saved state, check authentication only
    checkAuthentication();
  }
}

// Save state to storage
function saveStateToStorage() {
  // We don't save the entire state, only parts that should be persisted
  const stateToSave = {
    user: {
      preferences: appState.user.preferences
    },
    financialData: appState.financialData
  };
  
  localStorage.setItem('stackr_app_state', JSON.stringify(stateToSave));
}

// Handle navigation
function navigateTo(page) {
  appState.currentPage = page;
  
  // Update URL hash for direct linking
  window.location.hash = page;
  
  // Re-render the app with the new page
  renderApp();
  
  // Log navigation (in a real app, this could send analytics)
  console.log(`Navigated to: ${page}`);
}

// Create page layout with sidebar
function createLayout() {
  try {
    // Container for the entire app
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    appContainer.style.display = 'flex';
    appContainer.style.height = '100vh';
    appContainer.style.overflow = 'hidden';
    
    // Import and render the sidebar
    import('../sidebar.js').then(module => {
      try {
        // Create the sidebar
        const sidebar = module.createSidebar();
        sidebar.style.width = '240px';
        sidebar.style.flexShrink = 0;
        sidebar.style.borderRight = '1px solid var(--color-border)';
        sidebar.style.backgroundColor = 'var(--color-bg-primary)';
        sidebar.style.overflow = 'auto';
        sidebar.style.zIndex = '10';
        
        // Handle mobile viewport sidebar behavior
        const viewportWidth = window.innerWidth;
        if (viewportWidth < 768) {
          // On mobile, make sidebar initially hidden
          sidebar.style.width = '240px';
          sidebar.style.position = 'fixed';
          sidebar.style.top = '0';
          sidebar.style.left = appState.ui.sidebarOpen ? '0' : '-240px';
          sidebar.style.bottom = '0';
          sidebar.style.transition = 'left 0.3s ease';
          
          // Add backdrop when sidebar is open on mobile
          if (appState.ui.sidebarOpen) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.style.position = 'fixed';
            backdrop.style.top = '0';
            backdrop.style.left = '0';
            backdrop.style.right = '0';
            backdrop.style.bottom = '0';
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            backdrop.style.zIndex = '5';
            backdrop.style.opacity = '0';
            backdrop.style.transition = 'opacity 0.3s ease';
            
            // Animate in
            setTimeout(() => {
              backdrop.style.opacity = '1';
            }, 10);
            
            // Close sidebar when backdrop is clicked
            backdrop.addEventListener('click', () => {
              appState.ui.sidebarOpen = false;
              renderApp();
            });
            
            appContainer.appendChild(backdrop);
          }
        }
        
        // Create the main content area
        const main = document.createElement('main');
        main.style.flex = '1';
        main.style.padding = 'var(--container-padding)';
        main.style.overflow = 'auto';
        main.style.backgroundColor = 'var(--color-bg-secondary)';
        
        // Render the page content
        renderPageContent(main);
        
        // Add elements to the container
        appContainer.appendChild(sidebar);
        appContainer.appendChild(main);
        
        const app = document.getElementById('app');
        app.innerHTML = '';
        app.appendChild(appContainer);
      } catch (error) {
        console.error('Error creating sidebar:', error);
        createFallbackHeader();
      }
    }).catch(error => {
      console.error('Error loading sidebar module:', error);
      createFallbackHeader();
    });
  } catch (error) {
    console.error('Error creating layout:', error);
    createFallbackHeader();
  }
}

// Create a fallback header when sidebar fails to load
function createFallbackHeader() {
  try {
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    appContainer.style.display = 'flex';
    appContainer.style.flexDirection = 'column';
    appContainer.style.height = '100vh';
    
    // Create a simple header
    const header = document.createElement('header');
    header.className = 'app-header';
    header.style.backgroundColor = 'var(--color-primary)';
    header.style.color = 'white';
    header.style.padding = 'var(--space-4)';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    // Logo
    const logo = document.createElement('div');
    logo.className = 'app-logo';
    logo.innerHTML = '<strong>Stackr</strong> Finance';
    
    // Navigation
    const nav = document.createElement('nav');
    
    // Only show nav links if authenticated
    if (appState.user.isAuthenticated) {
      const pages = ['dashboard', 'income', 'expenses', 'settings'];
      
      pages.forEach(page => {
        const link = document.createElement('a');
        link.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        link.href = '#';
        link.style.color = 'white';
        link.style.marginLeft = 'var(--space-4)';
        link.style.textDecoration = 'none';
        
        if (appState.currentPage === page) {
          link.style.fontWeight = 'bold';
          link.style.textDecoration = 'underline';
        }
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigateTo(page);
        });
        
        nav.appendChild(link);
      });
    } else {
      // For unauthenticated users
      ['login', 'register'].forEach(page => {
        const link = document.createElement('a');
        link.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        link.href = '#';
        link.style.color = 'white';
        link.style.marginLeft = 'var(--space-4)';
        link.style.textDecoration = 'none';
        
        if (appState.currentPage === page) {
          link.style.fontWeight = 'bold';
          link.style.textDecoration = 'underline';
        }
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigateTo(page);
        });
        
        nav.appendChild(link);
      });
    }
    
    header.appendChild(logo);
    header.appendChild(nav);
    
    // Create main content area
    const main = document.createElement('main');
    main.style.flex = '1';
    main.style.padding = 'var(--container-padding)';
    main.style.overflow = 'auto';
    main.style.backgroundColor = 'var(--color-bg-secondary)';
    
    // Render the page content
    renderPageContent(main);
    
    appContainer.appendChild(header);
    appContainer.appendChild(main);
    app.appendChild(appContainer);
  } catch (error) {
    console.error('Error creating fallback header:', error);
    
    // Last resort fallback
    const app = document.getElementById('app');
    app.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Stackr Finance</h1><p>An error occurred. Please refresh the page.</p></div>';
  }
}

// Render page content based on current route
function renderPageContent(container) {
  // Clear previous content
  container.innerHTML = '';
  
  // Render based on current page
  switch (appState.currentPage) {
    case 'landing':
      // Show landing page for unauthenticated users
      const landing = document.createElement('div');
      landing.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Welcome to Stackr Finance</h1>
          <p style="font-size: 1.25rem; margin-bottom: 30px;">Track your income, manage your finances, and build wealth.</p>
          <div>
            <button class="btn-primary" style="margin-right: 10px;">Get Started</button>
            <button class="btn-secondary">Learn More</button>
          </div>
        </div>
      `;
      
      // Add event listeners
      landing.querySelector('.btn-primary').addEventListener('click', () => {
        navigateTo('register');
      });
      
      landing.querySelector('.btn-secondary').addEventListener('click', () => {
        // Scroll to features section or navigate to about page
        // Here we'll just scroll down a bit
        window.scrollTo({
          top: 500,
          behavior: 'smooth'
        });
      });
      
      container.appendChild(landing);
      break;
      
    case 'dashboard':
      container.appendChild(renderDashboardPage());
      break;
      
    default:
      container.appendChild(renderDashboardPage());
  }
}

// Simple dashboard render function
function renderDashboardPage() {
  const dashboard = document.createElement('div');
  dashboard.innerHTML = '<h1>Dashboard</h1><p>Welcome to your financial dashboard!</p>';
  return dashboard;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting GREEN Firebase-free version of Stackr Finance');
  
  // Setup modern design system
  setupDesignSystem();
  
  // Load saved data
  loadStateFromStorage();
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '');
  
  // If no hash is provided, show landing page for unauthenticated and dashboard for authenticated users
  if (!hash) {
    appState.currentPage = appState.user.isAuthenticated ? 'dashboard' : 'landing';
  } else {
    appState.currentPage = hash;
  }
  
  // Render the initial state
  renderApp();
});

// Main render function
function renderApp() {
  createLayout();
}