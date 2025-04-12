// GREEN Edition - No dependencies on any external libraries - completely self-contained
// Simple single-page application with route handling

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
  
  // Transitions
  root.style.setProperty('--transition-fast', '150ms');
  root.style.setProperty('--transition-normal', '250ms');
  root.style.setProperty('--transition-slow', '350ms');
  
  // Apply base styles
  document.body.style.fontFamily = 'var(--font-family)';
  document.body.style.fontSize = 'var(--font-size-base)';
  document.body.style.color = 'var(--color-text)';
  document.body.style.lineHeight = '1.5';
  document.body.style.backgroundColor = 'var(--color-background)';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  
  // Add Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);
  
  console.log('Design system initialized');
}

// Call once when the app loads
setupDesignSystem();

// In-memory data store
const appState = {
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
  import('../login.js').then(auth => {
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
  }).catch(error => {
    console.error('Failed to load authentication module:', error);
  });
}

// Load data from localStorage if available
function loadStateFromStorage() {
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
    console.log('Data loaded from localStorage');
  } else {
    // Initialize empty arrays if no saved state
    appState.incomeEntries = [];
    appState.expenseEntries = [];
  }
  
  // Check authentication status after loading local state
  checkAuthentication();
}

// Save data to localStorage
function saveStateToStorage() {
  localStorage.setItem('stackrGreenState', JSON.stringify({
    incomeEntries: appState.incomeEntries,
    expenseEntries: appState.expenseEntries,
    user: appState.user
  }));
  console.log('Data saved to localStorage');
}

// Router function
// Make navigateTo function accessible globally
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

// Create responsive layout elements using the sidebar
function createLayout() {
  const width = window.innerWidth;
  const isMobile = width < 768;
  
  // Create layout container with sidebar and main content
  const layoutContainer = document.createElement('div');
  layoutContainer.classList.add('layout-container');
  layoutContainer.style.display = 'flex';
  layoutContainer.style.width = '100%';
  layoutContainer.style.minHeight = '100vh';
  
  // Import and use the sidebar component
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
      if (!sidebar || !(sidebar instanceof HTMLElement)) {
        throw new Error('Sidebar could not be created properly');
      }
      
      layoutContainer.appendChild(sidebar);
    
    // Create main content wrapper
    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content');
    mainContent.style.flexGrow = '1';
    mainContent.style.marginLeft = isMobile ? '0' : '280px';
    mainContent.style.transition = 'margin-left 0.3s ease';
    mainContent.style.width = '100%';
    
    // Create header for mobile view (contains only the toggle button)
    if (isMobile) {
      const mobileHeader = document.createElement('header');
      mobileHeader.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
      mobileHeader.style.color = 'white';
      mobileHeader.style.padding = '12px 16px';
      mobileHeader.style.boxShadow = 'var(--shadow-md)';
      mobileHeader.style.display = 'flex';
      mobileHeader.style.alignItems = 'center';
      mobileHeader.style.justifyContent = 'space-between';
      
      // Logo
      const logoContainer = document.createElement('div');
      logoContainer.style.display = 'flex';
      logoContainer.style.alignItems = 'center';
      
      const logo = document.createElement('h1');
      logo.textContent = 'Stackr';
      logo.style.margin = '0';
      logo.style.fontSize = '22px';
      logo.style.fontWeight = 'bold';
      logoContainer.appendChild(logo);
      
      const badge = document.createElement('span');
      badge.textContent = 'GREEN';
      badge.style.fontSize = '10px';
      badge.style.fontWeight = 'bold';
      badge.style.padding = '3px 6px';
      badge.style.marginLeft = '8px';
      badge.style.background = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
      badge.style.borderRadius = '4px';
      badge.style.color = 'white';
      logoContainer.appendChild(badge);
      
      mobileHeader.appendChild(logoContainer);
      
      // Menu toggle button
      const menuButton = document.createElement('button');
      menuButton.id = 'mobile-menu-toggle';
      menuButton.style.background = 'rgba(255, 255, 255, 0.2)';
      menuButton.style.border = 'none';
      menuButton.style.color = 'white';
      menuButton.style.padding = '8px 10px';
      menuButton.style.borderRadius = '4px';
      menuButton.style.cursor = 'pointer';
      menuButton.style.display = 'flex';
      menuButton.style.alignItems = 'center';
      menuButton.style.justifyContent = 'center';
      menuButton.style.transition = 'all 0.2s ease';
      
      // Menu icon (hamburger)
      menuButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      
      menuButton.addEventListener('click', () => {
        // Log for debugging
        console.log('Menu button clicked');
        
        try {
          // Toggle the sidebar directly if this approach is available
          sidebarModule.toggleSidebar();
          
          // As a fallback, directly toggle sidebar visibility if we can find it
          const sidebar = document.querySelector('.sidebar');
          if (sidebar) {
            console.log('Found sidebar element, toggling directly');
            const isVisible = sidebar.style.transform === 'translateX(0px)';
            
            if (isVisible) {
              sidebar.style.transform = 'translateX(-100%)';
              document.getElementById('sidebar-overlay')?.remove();
            } else {
              sidebar.style.width = '280px';
              sidebar.style.transform = 'translateX(0px)';
              sidebar.style.display = 'flex';
              
              // Create overlay
              const overlay = document.createElement('div');
              overlay.id = 'sidebar-overlay';
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100%';
              overlay.style.height = '100%';
              overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              overlay.style.zIndex = '999';
              
              // Click on overlay closes sidebar
              overlay.addEventListener('click', () => {
                sidebar.style.transform = 'translateX(-100%)';
                overlay.remove();
              });
              
              document.body.appendChild(overlay);
            }
          }
        } catch (error) {
          console.error('Error toggling sidebar:', error);
        }
      });
      
      mobileHeader.appendChild(menuButton);
      mainContent.appendChild(mobileHeader);
    }
    
    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'content-container';
    contentContainer.style.padding = '24px';
    contentContainer.style.maxWidth = '1200px';
    contentContainer.style.margin = '0 auto';
    mainContent.appendChild(contentContainer);
    
    layoutContainer.appendChild(mainContent);
    
    // Append layout to root element
    const root = document.getElementById('app');
    root.innerHTML = '';
    root.appendChild(layoutContainer);
    
    // Render page content in the content container
    renderPageContent(contentContainer);
    
    } catch (error) {
      console.error('Error in sidebar initialization:', error);
      throw error; // Rethrow so the outer catch can handle it
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newIsMobile = newWidth < 768;
      
      // Update sidebar and main content based on screen size
      if (newIsMobile) {
        sidebar.style.transform = 'translateX(-100%)';
        mainContent.style.marginLeft = '0';
      } else {
        sidebar.style.transform = 'translateX(0)';
        mainContent.style.marginLeft = '280px';
        // Remove overlay if it exists
        document.getElementById('sidebar-overlay')?.remove();
      }
    });
  }).catch(error => {
    console.error('Failed to load sidebar:', error);
    
    // Fallback header if sidebar fails to load
    const fallbackHeader = createFallbackHeader();
    
    // Create main content wrapper
    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content');
    mainContent.style.flexGrow = '1';
    mainContent.style.width = '100%';
    
    // Add fallback header to main content
    mainContent.appendChild(fallbackHeader);
    
    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'content-container';
    contentContainer.style.padding = '24px';
    contentContainer.style.maxWidth = '1200px';
    contentContainer.style.margin = '0 auto';
    mainContent.appendChild(contentContainer);
    
    layoutContainer.appendChild(mainContent);
    
    // Append layout to root element
    const root = document.getElementById('app');
    root.innerHTML = '';
    root.appendChild(layoutContainer);
    
    // Render page content in the content container
    renderPageContent(contentContainer);
  });
  
  return layoutContainer;
}

// Fallback header in case the sidebar fails to load
function createFallbackHeader() {
  const width = window.innerWidth;
  const isMobile = width < 768;
  
  const header = document.createElement('header');
  header.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  header.style.color = 'white';
  header.style.padding = isMobile ? '12px 16px' : '16px 24px';
  header.style.boxShadow = 'var(--shadow-md)';
  
  // Create top section with logo and user info
  const topSection = document.createElement('div');
  topSection.style.display = 'flex';
  topSection.style.justifyContent = 'space-between';
  topSection.style.alignItems = 'center';
  
  // Logo container
  const logoContainer = document.createElement('div');
  logoContainer.style.cursor = 'pointer';
  logoContainer.addEventListener('click', () => navigateTo('dashboard'));
  
  const logo = document.createElement('h1');
  logo.textContent = isMobile ? 'Stackr' : 'Stackr Finance';
  logo.style.margin = '0';
  logo.style.fontSize = isMobile ? '22px' : '24px';
  logo.style.fontWeight = 'bold';
  logoContainer.appendChild(logo);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'GREEN Edition';
  subtitle.style.margin = '4px 0 0 0';
  subtitle.style.fontSize = '12px';
  subtitle.style.opacity = '0.9';
  logoContainer.appendChild(subtitle);
  
  topSection.appendChild(logoContainer);
  
  // User profile button
  const userButton = document.createElement('button');
  userButton.style.background = 'rgba(255, 255, 255, 0.2)';
  userButton.style.border = 'none';
  userButton.style.color = 'white';
  userButton.style.padding = isMobile ? '6px 10px' : '8px 16px';
  userButton.style.borderRadius = '20px';
  userButton.style.cursor = 'pointer';
  userButton.style.display = 'flex';
  userButton.style.alignItems = 'center';
  userButton.style.gap = '8px';
  userButton.style.fontSize = '14px';
  
  userButton.innerHTML = isMobile 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path></svg>` 
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path></svg>
      <span>${appState.user.name}</span>`;
  
  userButton.addEventListener('click', () => navigateTo('settings'));
  
  topSection.appendChild(userButton);
  header.appendChild(topSection);
  
  return header;
}

// Original header function (kept for reference)
function createHeader() {
  const width = window.innerWidth;
  const isMobile = width < 640;
  
  const header = document.createElement('header');
  header.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  header.style.color = 'white';
  header.style.padding = isMobile ? 'var(--space-4)' : 'var(--space-6) var(--space-4)';
  header.style.boxShadow = 'var(--shadow-md)';
  
  // Create top section with logo and user info
  const topSection = document.createElement('div');
  topSection.style.display = 'flex';
  topSection.style.justifyContent = 'space-between';
  topSection.style.alignItems = 'center';
  topSection.style.marginBottom = isMobile ? 'var(--space-3)' : 'var(--space-4)';
  
  // Logo container with gradient effect
  const logoContainer = document.createElement('div');
  logoContainer.style.cursor = 'pointer';
  logoContainer.addEventListener('click', () => navigateTo('dashboard'));
  
  const logo = document.createElement('h1');
  logo.textContent = isMobile ? 'Stackr' : 'Stackr Finance';
  logo.style.margin = '0';
  logo.style.fontSize = isMobile ? 'var(--font-size-xl)' : 'var(--font-size-2xl)';
  logo.style.fontWeight = 'var(--font-bold)';
  logoContainer.appendChild(logo);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'GREEN Edition';
  subtitle.style.margin = '4px 0 0 0';
  subtitle.style.fontSize = 'var(--font-size-xs)';
  subtitle.style.opacity = '0.9';
  logoContainer.appendChild(subtitle);
  
  topSection.appendChild(logoContainer);
  
  // User profile and mobile menu buttons container
  const rightContainer = document.createElement('div');
  rightContainer.style.display = 'flex';
  rightContainer.style.alignItems = 'center';
  rightContainer.style.gap = 'var(--space-2)';
  
  // User profile button
  const userButton = document.createElement('button');
  userButton.style.background = 'rgba(255, 255, 255, 0.2)';
  userButton.style.border = 'none';
  userButton.style.color = 'white';
  userButton.style.padding = isMobile ? '6px 10px' : '8px 16px';
  userButton.style.borderRadius = 'var(--radius-full)';
  userButton.style.cursor = 'pointer';
  userButton.style.display = 'flex';
  userButton.style.alignItems = 'center';
  userButton.style.gap = '8px';
  userButton.style.fontSize = 'var(--font-size-sm)';
  userButton.style.transition = 'all var(--transition-fast) ease';
  
  // In mobile view, just show the icon
  userButton.innerHTML = isMobile 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path></svg>` 
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path></svg>
      <span>${appState.user.name}</span>`;
      
  userButton.addEventListener('mouseover', () => {
    userButton.style.background = 'rgba(255, 255, 255, 0.3)';
  });
  userButton.addEventListener('mouseout', () => {
    userButton.style.background = 'rgba(255, 255, 255, 0.2)';
  });
  userButton.addEventListener('click', () => navigateTo('settings'));
  
  rightContainer.appendChild(userButton);
  
  // Mobile menu toggle button
  if (isMobile) {
    const menuButton = document.createElement('button');
    menuButton.id = 'mobile-menu-toggle';
    menuButton.style.background = 'rgba(255, 255, 255, 0.2)';
    menuButton.style.border = 'none';
    menuButton.style.color = 'white';
    menuButton.style.padding = '6px 10px';
    menuButton.style.borderRadius = 'var(--radius-md)';
    menuButton.style.cursor = 'pointer';
    menuButton.style.display = 'flex';
    menuButton.style.alignItems = 'center';
    menuButton.style.justifyContent = 'center';
    menuButton.style.transition = 'all var(--transition-fast) ease';
    
    // Menu icon (hamburger)
    menuButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    
    menuButton.addEventListener('mouseover', () => {
      menuButton.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    menuButton.addEventListener('mouseout', () => {
      menuButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    // Toggle mobile menu
    menuButton.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-nav');
      if (mobileMenu) {
        const isVisible = mobileMenu.style.height !== '0px';
        if (isVisible) {
          // Close menu
          mobileMenu.style.height = '0px';
          mobileMenu.style.padding = '0';
          mobileMenu.style.opacity = '0';
          
          // Change icon to hamburger
          menuButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          `;
        } else {
          // Open menu
          mobileMenu.style.height = 'auto';
          mobileMenu.style.padding = 'var(--space-2)';
          mobileMenu.style.opacity = '1';
          
          // Change icon to X
          menuButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `;
        }
      }
    });
    
    rightContainer.appendChild(menuButton);
  }
  
  topSection.appendChild(rightContainer);
  header.appendChild(topSection);
  
  // Pages configuration - shared between mobile and desktop
  const pages = [
    { 
      id: 'dashboard', 
      title: 'Dashboard',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>'
    },
    { 
      id: 'income', 
      title: 'Income',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
    },
    { 
      id: 'bankconnections', 
      title: 'Bank Accounts',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>'
    },
    { 
      id: 'affiliates', 
      title: 'Affiliates',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
    },
    { 
      id: 'gigs', 
      title: 'Stackr Gigs',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>'
    },
    { 
      id: 'settings', 
      title: 'Settings',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    }
  ];
  
  if (isMobile) {
    // Create mobile navigation (collapsed by default)
    const mobileNav = document.createElement('nav');
    mobileNav.id = 'mobile-nav';
    mobileNav.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    mobileNav.style.borderRadius = 'var(--radius-lg)';
    mobileNav.style.overflow = 'hidden';
    mobileNav.style.display = 'flex';
    mobileNav.style.flexDirection = 'column';
    mobileNav.style.transition = 'all var(--transition-fast) ease';
    mobileNav.style.height = '0px';
    mobileNav.style.opacity = '0';
    mobileNav.style.marginTop = '0';
    
    pages.forEach(page => {
      const link = document.createElement('a');
      link.href = `#${page.id}`;
      link.style.color = 'white';
      link.style.textDecoration = 'none';
      link.style.padding = 'var(--space-3) var(--space-4)';
      link.style.display = 'flex';
      link.style.alignItems = 'center';
      link.style.gap = 'var(--space-3)';
      link.style.fontSize = 'var(--font-size-sm)';
      link.style.fontWeight = 'var(--font-medium)';
      link.style.borderRadius = 'var(--radius-md)';
      link.style.margin = 'var(--space-1) 0';
      
      if (appState.currentPage === page.id) {
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        link.style.fontWeight = 'var(--font-semibold)';
      }
      
      link.innerHTML = `${page.icon} <span>${page.title}</span>`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(page.id);
        
        // Close the menu after clicking
        mobileNav.style.height = '0px';
        mobileNav.style.padding = '0';
        mobileNav.style.opacity = '0';
        
        // Change hamburger icon back
        const menuButton = document.getElementById('mobile-menu-toggle');
        if (menuButton) {
          menuButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          `;
        }
      });
      
      mobileNav.appendChild(link);
    });
    
    header.appendChild(mobileNav);
  } else {
    // Create desktop navigation
    const desktopNav = document.createElement('nav');
    desktopNav.style.display = 'flex';
    desktopNav.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    desktopNav.style.borderRadius = 'var(--radius-lg)';
    desktopNav.style.overflow = 'hidden';
    
    pages.forEach(page => {
      const link = document.createElement('a');
      link.href = `#${page.id}`;
      link.style.color = 'white';
      link.style.textDecoration = 'none';
      link.style.padding = '12px 16px';
      link.style.display = 'flex';
      link.style.alignItems = 'center';
      link.style.gap = '8px';
      link.style.fontSize = 'var(--font-size-sm)';
      link.style.fontWeight = 'var(--font-medium)';
      link.style.flex = '1';
      link.style.justifyContent = 'center';
      link.style.transition = 'all var(--transition-fast) ease';
      
      if (appState.currentPage === page.id) {
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        link.style.fontWeight = 'var(--font-semibold)';
      } else {
        link.addEventListener('mouseover', () => {
          link.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        link.addEventListener('mouseout', () => {
          link.style.backgroundColor = 'transparent';
        });
      }
      
      link.innerHTML = `${page.icon} <span>${page.title}</span>`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(page.id);
      });
      
      desktopNav.appendChild(link);
    });
    
    header.appendChild(desktopNav);
  }
  
  return header;
}

function createFooter() {
  const footer = document.createElement('footer');
  footer.style.backgroundColor = 'var(--color-card)';
  footer.style.padding = 'var(--space-10) var(--space-4)';
  footer.style.textAlign = 'center';
  footer.style.marginTop = 'var(--space-12)';
  footer.style.borderTop = '1px solid var(--color-border)';
  
  // Create footer content
  const footerContent = document.createElement('div');
  footerContent.style.maxWidth = '1200px';
  footerContent.style.margin = '0 auto';
  
  // Create logo section
  const logoSection = document.createElement('div');
  logoSection.style.marginBottom = 'var(--space-6)';
  
  const footerLogo = document.createElement('h3');
  footerLogo.textContent = 'Stackr Finance';
  footerLogo.style.fontSize = 'var(--font-size-lg)';
  footerLogo.style.fontWeight = 'var(--font-bold)';
  footerLogo.style.margin = '0 0 var(--space-2) 0';
  
  const footerTagline = document.createElement('p');
  footerTagline.textContent = 'Helping service providers manage their finances better';
  footerTagline.style.color = 'var(--color-text-secondary)';
  footerTagline.style.fontSize = 'var(--font-size-sm)';
  footerTagline.style.margin = '0';
  
  logoSection.appendChild(footerLogo);
  logoSection.appendChild(footerTagline);
  footerContent.appendChild(logoSection);
  
  // Create links
  const linksContainer = document.createElement('div');
  linksContainer.style.display = 'flex';
  linksContainer.style.justifyContent = 'center';
  linksContainer.style.gap = 'var(--space-10)';
  linksContainer.style.flexWrap = 'wrap';
  linksContainer.style.marginBottom = 'var(--space-6)';
  
  const sections = [
    {
      title: 'App',
      links: [
        { name: 'Dashboard', url: '#dashboard' },
        { name: 'Income', url: '#income' },
        { name: 'Bank Accounts', url: '#bankconnections' },
        { name: 'Affiliates', url: '#affiliates' },
        { name: 'Gigs', url: '#gigs' },
        { name: 'Settings', url: '#settings' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', url: '#' },
        { name: 'Terms of Service', url: '#' }
      ]
    },
    {
      title: 'About',
      links: [
        { name: 'GREEN Edition', url: '#' },
        { name: 'Firebase-free', url: '#' }
      ]
    }
  ];
  
  sections.forEach(section => {
    const sectionEl = document.createElement('div');
    
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = section.title;
    sectionTitle.style.fontSize = 'var(--font-size-sm)';
    sectionTitle.style.fontWeight = 'var(--font-semibold)';
    sectionTitle.style.marginBottom = 'var(--space-3)';
    sectionTitle.style.color = 'var(--color-text)';
    sectionEl.appendChild(sectionTitle);
    
    const linksList = document.createElement('ul');
    linksList.style.listStyle = 'none';
    linksList.style.padding = '0';
    linksList.style.margin = '0';
    
    section.links.forEach(link => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = 'var(--space-2)';
      
      const anchor = document.createElement('a');
      anchor.textContent = link.name;
      anchor.href = link.url;
      anchor.style.color = 'var(--color-text-secondary)';
      anchor.style.fontSize = 'var(--font-size-sm)';
      anchor.style.textDecoration = 'none';
      anchor.style.transition = 'color var(--transition-fast) ease';
      
      anchor.addEventListener('mouseenter', () => {
        anchor.style.color = 'var(--color-primary)';
      });
      
      anchor.addEventListener('mouseleave', () => {
        anchor.style.color = 'var(--color-text-secondary)';
      });
      
      listItem.appendChild(anchor);
      linksList.appendChild(listItem);
    });
    
    sectionEl.appendChild(linksList);
    linksContainer.appendChild(sectionEl);
  });
  
  footerContent.appendChild(linksContainer);
  
  // Copyright and attribution
  const copyright = document.createElement('div');
  copyright.style.borderTop = '1px solid var(--color-border)';
  copyright.style.paddingTop = 'var(--space-6)';
  copyright.style.color = 'var(--color-text-muted)';
  copyright.style.fontSize = 'var(--font-size-xs)';
  
  const copyrightText = document.createElement('p');
  copyrightText.textContent = '© ' + new Date().getFullYear() + ' Stackr Finance - GREEN Edition. All rights reserved.';
  copyrightText.style.margin = '0';
  
  copyright.appendChild(copyrightText);
  footerContent.appendChild(copyright);
  
  footer.appendChild(footerContent);
  return footer;
}

// Create a reusable card component
function createCard(title, content, accent = false, icon = null) {
  const card = document.createElement('div');
  card.style.backgroundColor = 'var(--color-card)';
  card.style.borderRadius = 'var(--radius-lg)';
  card.style.padding = 'var(--space-6)';
  card.style.boxShadow = 'var(--shadow-md)';
  card.style.marginBottom = 'var(--space-6)';
  card.style.border = accent ? `1px solid var(--color-border)` : 'none';
  card.style.overflow = 'hidden';
  card.style.transition = 'all var(--transition-normal) ease';
  
  // Optional top accent bar
  if (accent) {
    const accentBar = document.createElement('div');
    accentBar.style.position = 'absolute';
    accentBar.style.top = '0';
    accentBar.style.left = '0';
    accentBar.style.right = '0';
    accentBar.style.height = '4px';
    accentBar.style.background = `linear-gradient(to right, var(--color-primary), var(--color-accent))`;
    card.appendChild(accentBar);
    card.style.position = 'relative';
    card.style.paddingTop = 'var(--space-8)';
  }
  
  // Card header with title and optional icon
  if (title) {
    const cardHeader = document.createElement('div');
    cardHeader.style.display = 'flex';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.marginBottom = 'var(--space-4)';
    
    if (icon) {
      const iconContainer = document.createElement('div');
      iconContainer.style.marginRight = 'var(--space-3)';
      iconContainer.style.display = 'flex';
      iconContainer.style.alignItems = 'center';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.width = '28px';
      iconContainer.style.height = '28px';
      iconContainer.style.borderRadius = 'var(--radius-md)';
      iconContainer.style.backgroundColor = 'var(--color-primary-light)';
      iconContainer.style.color = 'white';
      iconContainer.innerHTML = icon;
      cardHeader.appendChild(iconContainer);
    }
    
    const cardTitle = document.createElement('h3');
    cardTitle.textContent = title;
    cardTitle.style.margin = '0';
    cardTitle.style.fontSize = 'var(--font-size-lg)';
    cardTitle.style.fontWeight = 'var(--font-semibold)';
    cardTitle.style.color = 'var(--color-text)';
    cardHeader.appendChild(cardTitle);
    
    card.appendChild(cardHeader);
  }
  
  // Card content
  const cardBody = document.createElement('div');
  
  if (content) {
    if (typeof content === 'string') {
      const cardContent = document.createElement('p');
      cardContent.textContent = content;
      cardContent.style.color = 'var(--color-text-secondary)';
      cardContent.style.fontSize = 'var(--font-size-base)';
      cardContent.style.lineHeight = '1.6';
      cardContent.style.margin = '0';
      cardBody.appendChild(cardContent);
    } else {
      cardBody.appendChild(content);
    }
  }
  
  card.appendChild(cardBody);
  
  // Add hover effect
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = 'var(--shadow-lg)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'var(--shadow-md)';
  });
  
  return card;
}

// Create a button component
function createButton(text, onClick, color = 'var(--color-primary)', icon = null, variant = 'filled') {
  const button = document.createElement('button');
  
  // Button container
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.gap = 'var(--space-2)';
  button.style.padding = '10px 20px';
  button.style.borderRadius = 'var(--radius-md)';
  button.style.cursor = 'pointer';
  button.style.fontSize = 'var(--font-size-sm)';
  button.style.fontWeight = 'var(--font-medium)';
  button.style.transition = 'all var(--transition-fast) ease';
  button.style.outline = 'none';
  button.style.marginRight = 'var(--space-2)';
  button.style.marginBottom = 'var(--space-2)';
  
  // Style based on variant
  if (variant === 'filled') {
    button.style.backgroundColor = color;
    button.style.color = 'white';
    button.style.border = 'none';
    
    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.boxShadow = 'var(--shadow-md)';
      button.style.transform = 'translateY(-2px)';
      
      // Darken the color on hover
      if (color === 'var(--color-primary)') {
        button.style.backgroundColor = 'var(--color-primary-dark)';
      } else {
        // Apply a darkening effect using rgba
        const computedStyle = getComputedStyle(document.documentElement);
        const colorValue = computedStyle.getPropertyValue(color.replace('var(', '').replace(')', ''));
        const darkenedColor = applyColorOverlay(colorValue || color, 'rgba(0,0,0,0.15)');
        button.style.backgroundColor = darkenedColor;
      }
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.boxShadow = 'none';
      button.style.transform = 'translateY(0)';
      button.style.backgroundColor = color;
    });
  } else if (variant === 'outline') {
    button.style.backgroundColor = 'transparent';
    button.style.color = color;
    button.style.border = `1px solid ${color}`;
    
    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = `${color}20`; // 20 is hex for 12% opacity
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });
  } else if (variant === 'ghost') {
    button.style.backgroundColor = 'transparent';
    button.style.color = color;
    button.style.border = 'none';
    
    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = `${color}10`; // 10 is hex for 6% opacity
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });
  }
  
  // Add ripple effect on click
  button.addEventListener('mousedown', (e) => {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.style.position = 'absolute';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    const animation = ripple.animate(
      [
        { width: '0', height: '0', opacity: 1 },
        { width: '300px', height: '300px', opacity: 0 }
      ],
      {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      }
    );
    
    animation.onfinish = () => {
      button.removeChild(ripple);
    };
  });
  
  // Add icon if provided
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = icon;
    iconSpan.style.display = 'flex';
    iconSpan.style.alignItems = 'center';
    iconSpan.style.justifyContent = 'center';
    button.appendChild(iconSpan);
  }
  
  // Add text
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  button.appendChild(textSpan);
  
  // Add click handler
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

// Helper function to apply color overlay
function applyColorOverlay(baseColor, overlayColor) {
  // This is a simple implementation - in a real app, would use a proper color library
  return overlayColor; // For now, just return the overlay color
}

// Create an input field component
function createInput(type, placeholder, value = '', onChange) {
  const inputContainer = document.createElement('div');
  inputContainer.style.position = 'relative';
  inputContainer.style.width = '100%';
  
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.style.padding = '12px 16px';
  input.style.paddingLeft = type === 'number' ? '16px' : type === 'date' ? '16px' : '16px';
  input.style.borderRadius = 'var(--radius-md)';
  input.style.border = '1px solid var(--color-border)';
  input.style.backgroundColor = 'var(--color-background)';
  input.style.fontSize = 'var(--font-size-sm)';
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';
  input.style.transition = 'all var(--transition-normal) ease';
  input.style.color = 'var(--color-text)';
  input.style.outline = 'none';
  
  // Focus effect
  input.addEventListener('focus', () => {
    input.style.borderColor = 'var(--color-primary)';
    input.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
  });
  
  input.addEventListener('blur', () => {
    input.style.borderColor = 'var(--color-border)';
    input.style.boxShadow = 'none';
  });
  
  // Add validation visual cues
  if (type === 'number') {
    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      if (!isNaN(val) && val > 0) {
        input.style.borderColor = 'var(--color-success)';
      } else if (input.value === '') {
        input.style.borderColor = 'var(--color-border)';
      } else {
        input.style.borderColor = 'var(--color-error)';
      }
    });
  }
  
  if (onChange) {
    input.addEventListener('input', onChange);
  }
  
  inputContainer.appendChild(input);
  return inputContainer;
}

// Create a form group with label
function createFormGroup(labelText, inputElement) {
  const formGroup = document.createElement('div');
  formGroup.style.marginBottom = 'var(--space-5)';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = 'var(--space-2)';
  label.style.fontWeight = 'var(--font-medium)';
  label.style.fontSize = 'var(--font-size-sm)';
  label.style.color = 'var(--color-text)';
  
  // Optional help text or error message container
  const helpTextContainer = document.createElement('div');
  helpTextContainer.style.marginTop = 'var(--space-1)';
  helpTextContainer.style.fontSize = 'var(--font-size-xs)';
  helpTextContainer.style.color = 'var(--color-text-muted)';
  
  // Add attributes for accessibility
  const inputId = `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Find the actual input element (it might be inside a container)
  let actualInput;
  if (inputElement.tagName === 'INPUT') {
    actualInput = inputElement;
  } else {
    actualInput = inputElement.querySelector('input');
  }
  
  if (actualInput) {
    actualInput.id = inputId;
    label.htmlFor = inputId;
    
    // Add accessible error handling
    actualInput.setAttribute('aria-describedby', `${inputId}-help`);
    helpTextContainer.id = `${inputId}-help`;
    
    // Listen for validation errors
    actualInput.addEventListener('invalid', () => {
      helpTextContainer.textContent = actualInput.validationMessage;
      helpTextContainer.style.color = 'var(--color-error)';
      inputElement.style.borderColor = 'var(--color-error)';
    });
    
    // Clear error on input
    actualInput.addEventListener('input', () => {
      if (actualInput.validity.valid) {
        helpTextContainer.textContent = '';
      }
    });
  }
  
  formGroup.appendChild(label);
  formGroup.appendChild(inputElement);
  formGroup.appendChild(helpTextContainer);
  
  return formGroup;
}

// Split ratio visualization
function createSplitVisualization(splitRatio) {
  const container = document.createElement('div');
  
  // Create the split description
  const splitDesc = document.createElement('p');
  splitDesc.textContent = 'Your income allocation:';
  container.appendChild(splitDesc);
  
  // Create the colored bars to represent the split
  const barContainer = document.createElement('div');
  barContainer.style.display = 'flex';
  barContainer.style.height = '40px';
  barContainer.style.borderRadius = '4px';
  barContainer.style.overflow = 'hidden';
  barContainer.style.marginBottom = '10px';
  
  const needsBar = document.createElement('div');
  needsBar.style.width = `${splitRatio.needs}%`;
  needsBar.style.backgroundColor = '#34A853'; // Green
  barContainer.appendChild(needsBar);
  
  const investBar = document.createElement('div');
  investBar.style.width = `${splitRatio.investments}%`;
  investBar.style.backgroundColor = '#4285F4'; // Blue
  barContainer.appendChild(investBar);
  
  const savingsBar = document.createElement('div');
  savingsBar.style.width = `${splitRatio.savings}%`;
  savingsBar.style.backgroundColor = '#FBBC05'; // Yellow
  barContainer.appendChild(savingsBar);
  
  container.appendChild(barContainer);
  
  // Create labels for the split sections
  const labelsContainer = document.createElement('div');
  labelsContainer.style.display = 'flex';
  labelsContainer.style.justifyContent = 'space-between';
  
  const needsLabel = document.createElement('div');
  needsLabel.innerHTML = `<strong>${splitRatio.needs}%</strong> Needs`;
  needsLabel.style.width = '33%';
  labelsContainer.appendChild(needsLabel);
  
  const investLabel = document.createElement('div');
  investLabel.innerHTML = `<strong>${splitRatio.investments}%</strong> Invest`;
  investLabel.style.width = '33%';
  labelsContainer.appendChild(investLabel);
  
  const savingsLabel = document.createElement('div');
  savingsLabel.innerHTML = `<strong>${splitRatio.savings}%</strong> Save`;
  savingsLabel.style.width = '33%';
  labelsContainer.appendChild(savingsLabel);
  
  container.appendChild(labelsContainer);
  
  return container;
}

// Calculate total income and allocations
function calculateIncomeStats() {
  const total = appState.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const splitRatio = appState.user.splitRatio;
  
  return {
    total,
    needs: (total * splitRatio.needs / 100).toFixed(2),
    investments: (total * splitRatio.investments / 100).toFixed(2),
    savings: (total * splitRatio.savings / 100).toFixed(2)
  };
}

// Page Components
function renderDashboardPage() {
  const isMobile = window.innerWidth < 640;
  const container = document.createElement('div');
  
  // Animated welcome heading with gradient text
  const welcomeHeading = document.createElement('h2');
  welcomeHeading.textContent = `Welcome, ${appState.user.name}!`;
  welcomeHeading.style.marginBottom = 'var(--space-6)';
  welcomeHeading.style.fontSize = isMobile ? 'var(--font-size-xl)' : 'var(--font-size-3xl)';
  welcomeHeading.style.fontWeight = 'var(--font-bold)';
  welcomeHeading.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-accent))';
  welcomeHeading.style.WebkitBackgroundClip = 'text';
  welcomeHeading.style.WebkitTextFillColor = 'transparent';
  welcomeHeading.style.backgroundClip = 'text';
  welcomeHeading.style.textFillColor = 'transparent';
  welcomeHeading.style.animation = 'fadeIn 0.6s ease-out';
  container.appendChild(welcomeHeading);

  // Dashboard summary - shows total income and quick stats
  const dashboardSummary = document.createElement('div');
  dashboardSummary.style.marginBottom = 'var(--space-8)';
  dashboardSummary.style.display = 'flex';
  dashboardSummary.style.flexDirection = isMobile ? 'column' : 'row';
  dashboardSummary.style.gap = 'var(--space-4)';
  
  // Calculate the stats
  const stats = calculateIncomeStats();
  
  // Create summary cards grid
  const summaryGrid = document.createElement('div');
  summaryGrid.style.display = 'grid';
  summaryGrid.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))';
  summaryGrid.style.gap = 'var(--space-4)';
  summaryGrid.style.width = '100%';
  
  // Total Income Card (larger and more prominent)
  const totalIncomeCard = document.createElement('div');
  totalIncomeCard.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))';
  totalIncomeCard.style.color = 'white';
  totalIncomeCard.style.borderRadius = 'var(--radius-lg)';
  totalIncomeCard.style.padding = 'var(--space-6)';
  totalIncomeCard.style.display = 'flex';
  totalIncomeCard.style.flexDirection = 'column';
  totalIncomeCard.style.justifyContent = 'center';
  totalIncomeCard.style.textAlign = 'center';
  totalIncomeCard.style.boxShadow = 'var(--shadow-md)';
  totalIncomeCard.style.transition = 'transform var(--transition-normal) ease, box-shadow var(--transition-normal) ease';
  
  // Add hover effect
  totalIncomeCard.addEventListener('mouseenter', () => {
    totalIncomeCard.style.transform = 'translateY(-5px)';
    totalIncomeCard.style.boxShadow = 'var(--shadow-lg)';
  });
  
  totalIncomeCard.addEventListener('mouseleave', () => {
    totalIncomeCard.style.transform = 'translateY(0)';
    totalIncomeCard.style.boxShadow = 'var(--shadow-md)';
  });
  
  const totalIncomeLabel = document.createElement('div');
  totalIncomeLabel.textContent = 'Total Income';
  totalIncomeLabel.style.fontSize = 'var(--font-size-sm)';
  totalIncomeLabel.style.opacity = '0.9';
  totalIncomeLabel.style.marginBottom = 'var(--space-2)';
  totalIncomeCard.appendChild(totalIncomeLabel);
  
  const totalIncomeValue = document.createElement('div');
  totalIncomeValue.textContent = `$${stats.total.toFixed(2)}`;
  totalIncomeValue.style.fontSize = isMobile ? 'var(--font-size-2xl)' : 'var(--font-size-3xl)';
  totalIncomeValue.style.fontWeight = 'var(--font-bold)';
  totalIncomeCard.appendChild(totalIncomeValue);
  
  // Add change percentage if there's history
  if (appState.incomeEntries.length > 0) {
    const changeText = document.createElement('div');
    changeText.textContent = '+12.5% from last month';
    changeText.style.fontSize = 'var(--font-size-xs)';
    changeText.style.marginTop = 'var(--space-1)';
    changeText.style.opacity = '0.8';
    totalIncomeCard.appendChild(changeText);
  }
  
  summaryGrid.appendChild(totalIncomeCard);
  
  // Create three allocation cards
  const allocations = [
    { 
      name: 'Needs', 
      percentage: appState.user.splitRatio.needs, 
      amount: stats.needs,
      color: 'var(--color-success)',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"></path><circle cx="12" cy="12" r="5"></circle></svg>'
    },
    { 
      name: 'Investments', 
      percentage: appState.user.splitRatio.investments, 
      amount: stats.investments,
      color: 'var(--color-accent)',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
    },
    { 
      name: 'Savings', 
      percentage: appState.user.splitRatio.savings, 
      amount: stats.savings,
      color: 'var(--color-secondary)',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"></circle><path d="M14 14c0-3.314-2.686-6-6-6s-6 2.686-6 6H14z"></path><path d="M18 14c0-3.314-2.686-6-6-6s-6 2.686-6 6H18z"></path><path d="M12 14v7"></path><path d="M16 19h-8"></path></svg>'
    }
  ];
  
  allocations.forEach(allocation => {
    const allocationCard = document.createElement('div');
    allocationCard.style.backgroundColor = 'var(--color-card)';
    allocationCard.style.borderRadius = 'var(--radius-lg)';
    allocationCard.style.padding = 'var(--space-4)';
    allocationCard.style.boxShadow = 'var(--shadow-sm)';
    allocationCard.style.border = '1px solid var(--color-border)';
    allocationCard.style.display = 'flex';
    allocationCard.style.flexDirection = 'row';
    allocationCard.style.alignItems = 'center';
    allocationCard.style.gap = 'var(--space-3)';
    allocationCard.style.transition = 'transform var(--transition-normal) ease, box-shadow var(--transition-normal) ease';
    
    // Add hover effect
    allocationCard.addEventListener('mouseenter', () => {
      allocationCard.style.transform = 'translateY(-2px)';
      allocationCard.style.boxShadow = 'var(--shadow-md)';
    });
    
    allocationCard.addEventListener('mouseleave', () => {
      allocationCard.style.transform = 'translateY(0)';
      allocationCard.style.boxShadow = 'var(--shadow-sm)';
    });
    
    // Icon for category
    const iconContainer = document.createElement('div');
    iconContainer.style.width = '36px';
    iconContainer.style.height = '36px';
    iconContainer.style.borderRadius = 'var(--radius-md)';
    iconContainer.style.backgroundColor = `${allocation.color}20`; // 20 is hex for 12% opacity
    iconContainer.style.color = allocation.color;
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.innerHTML = allocation.icon;
    allocationCard.appendChild(iconContainer);
    
    // Text content
    const textContent = document.createElement('div');
    textContent.style.flex = '1';
    
    const nameAndPercentage = document.createElement('div');
    nameAndPercentage.style.display = 'flex';
    nameAndPercentage.style.justifyContent = 'space-between';
    nameAndPercentage.style.alignItems = 'center';
    
    const name = document.createElement('div');
    name.textContent = allocation.name;
    name.style.fontSize = 'var(--font-size-sm)';
    name.style.fontWeight = 'var(--font-medium)';
    name.style.color = 'var(--color-text)';
    nameAndPercentage.appendChild(name);
    
    const percentage = document.createElement('div');
    percentage.textContent = `${allocation.percentage}%`;
    percentage.style.fontSize = 'var(--font-size-xs)';
    percentage.style.color = 'var(--color-text-secondary)';
    percentage.style.fontWeight = 'var(--font-medium)';
    nameAndPercentage.appendChild(percentage);
    
    textContent.appendChild(nameAndPercentage);
    
    // Amount
    const amount = document.createElement('div');
    amount.textContent = `$${allocation.amount}`;
    amount.style.fontSize = 'var(--font-size-lg)';
    amount.style.fontWeight = 'var(--font-bold)';
    amount.style.color = allocation.color;
    amount.style.marginTop = 'var(--space-1)';
    textContent.appendChild(amount);
    
    allocationCard.appendChild(textContent);
    summaryGrid.appendChild(allocationCard);
  });
  
  dashboardSummary.appendChild(summaryGrid);
  container.appendChild(dashboardSummary);
  
  // Split visualization
  const splitVisual = createSplitVisualization(appState.user.splitRatio);
  const splitCard = createCard('Income Allocation', splitVisual, true, 
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>'
  );
  container.appendChild(splitCard);
  
  // Quick actions section 
  const actionsHeading = document.createElement('h3');
  actionsHeading.textContent = 'Quick Actions';
  actionsHeading.style.fontSize = 'var(--font-size-lg)';
  actionsHeading.style.marginTop = 'var(--space-8)';
  actionsHeading.style.marginBottom = 'var(--space-4)';
  actionsHeading.style.fontWeight = 'var(--font-semibold)';
  container.appendChild(actionsHeading);
  
  // Actions grid for better responsive layout
  const actionsGrid = document.createElement('div');
  actionsGrid.style.display = 'grid';
  actionsGrid.style.gridTemplateColumns = isMobile 
    ? 'repeat(2, 1fr)' 
    : 'repeat(auto-fill, minmax(200px, 1fr))';
  actionsGrid.style.gap = 'var(--space-4)';
  
  // Action cards 
  const actions = [
    {
      title: 'Add Income',
      description: 'Record your income and track your earnings.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      color: 'var(--color-success)',
      onClick: () => navigateTo('income')
    },
    {
      title: 'Find Gigs',
      description: 'Discover opportunities to earn more income.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      color: 'var(--color-accent)',
      onClick: () => navigateTo('gigs')
    },
    {
      title: 'Adjust Split',
      description: 'Customize your income allocation percentages.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>',
      color: 'var(--color-secondary)',
      onClick: () => navigateTo('settings')
    }
  ];
  
  actions.forEach(action => {
    const actionCard = document.createElement('div');
    actionCard.style.backgroundColor = 'var(--color-card)';
    actionCard.style.borderRadius = 'var(--radius-lg)';
    actionCard.style.padding = 'var(--space-5)';
    actionCard.style.boxShadow = 'var(--shadow-sm)';
    actionCard.style.border = '1px solid var(--color-border)';
    actionCard.style.cursor = 'pointer';
    actionCard.style.transition = 'all var(--transition-normal) ease';
    
    // Add hover effect
    actionCard.addEventListener('mouseenter', () => {
      actionCard.style.transform = 'translateY(-3px)';
      actionCard.style.boxShadow = 'var(--shadow-md)';
      actionCard.style.borderColor = action.color;
    });
    
    actionCard.addEventListener('mouseleave', () => {
      actionCard.style.transform = 'translateY(0)';
      actionCard.style.boxShadow = 'var(--shadow-sm)';
      actionCard.style.borderColor = 'var(--color-border)';
    });
    
    actionCard.addEventListener('click', action.onClick);
    
    // Icon
    const iconContainer = document.createElement('div');
    iconContainer.style.width = '40px';
    iconContainer.style.height = '40px';
    iconContainer.style.borderRadius = 'var(--radius-md)';
    iconContainer.style.backgroundColor = `${action.color}20`; // 20 is hex for 12% opacity
    iconContainer.style.color = action.color;
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.marginBottom = 'var(--space-3)';
    iconContainer.innerHTML = action.icon;
    actionCard.appendChild(iconContainer);
    
    // Title
    const title = document.createElement('div');
    title.textContent = action.title;
    title.style.fontWeight = 'var(--font-semibold)';
    title.style.fontSize = 'var(--font-size-base)';
    title.style.marginBottom = 'var(--space-2)';
    actionCard.appendChild(title);
    
    // Description (hidden on small mobile)
    if (!isMobile || window.innerWidth > 400) {
      const description = document.createElement('div');
      description.textContent = action.description;
      description.style.color = 'var(--color-text-secondary)';
      description.style.fontSize = 'var(--font-size-sm)';
      actionCard.appendChild(description);
    }
    
    actionsGrid.appendChild(actionCard);
  });
  
  container.appendChild(actionsGrid);
  
  // Prompt for first time users
  if (appState.incomeEntries.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.marginTop = 'var(--space-8)';
    emptyState.style.padding = 'var(--space-6)';
    emptyState.style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
    emptyState.style.borderRadius = 'var(--radius-lg)';
    emptyState.style.textAlign = 'center';
    emptyState.style.border = '1px dashed var(--color-accent)';
    
    const emptyIcon = document.createElement('div');
    emptyIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    `;
    emptyIcon.style.marginBottom = 'var(--space-4)';
    emptyState.appendChild(emptyIcon);
    
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
    
    const emptyButton = createButton('Add Your First Income', () => navigateTo('income'), 'var(--color-accent)');
    emptyState.appendChild(emptyButton);
    
    container.appendChild(emptyState);
  }
  
  return container;
}

function renderIncomePage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Income Tracker';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  // Income Entry Form Card
  const formCard = document.createElement('div');
  formCard.style.backgroundColor = '#f5f5f5';
  formCard.style.borderRadius = '8px';
  formCard.style.padding = '20px';
  formCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  formCard.style.marginBottom = '30px';
  
  const formHeading = document.createElement('h3');
  formHeading.textContent = 'Add New Income';
  formHeading.style.marginTop = '0';
  formCard.appendChild(formHeading);
  
  // Create form
  const form = document.createElement('form');
  form.onsubmit = (e) => {
    e.preventDefault();
    
    const description = document.getElementById('income-description').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    const source = document.getElementById('income-source').value;
    
    if (description && amount && date) {
      // Add new income entry
      const newEntry = {
        id: Date.now(), // Use timestamp as ID
        description,
        amount,
        date,
        source,
        timestamp: new Date().toISOString()
      };
      
      appState.incomeEntries.push(newEntry);
      saveStateToStorage();
      renderApp(); // Re-render the app
      
      // Reset form
      form.reset();
    }
  };
  
  // Form fields
  const descriptionInput = createInput('text', 'Description', '', null);
  descriptionInput.id = 'income-description';
  descriptionInput.required = true;
  form.appendChild(createFormGroup('Description', descriptionInput));
  
  const amountInput = createInput('number', 'Amount', '', null);
  amountInput.id = 'income-amount';
  amountInput.min = '0.01';
  amountInput.step = '0.01';
  amountInput.required = true;
  form.appendChild(createFormGroup('Amount ($)', amountInput));
  
  const dateInput = createInput('date', '', new Date().toISOString().split('T')[0], null);
  dateInput.id = 'income-date';
  dateInput.required = true;
  form.appendChild(createFormGroup('Date', dateInput));
  
  const sourceInput = createInput('text', 'Source (e.g., Client, Gig, Job)', '', null);
  sourceInput.id = 'income-source';
  form.appendChild(createFormGroup('Source', sourceInput));
  
  const submitBtn = createButton('Add Income', null, '#34A853');
  submitBtn.type = 'submit';
  form.appendChild(submitBtn);
}

// Expenses page function
function renderExpensesPage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Expense Tracker';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  // Expense Entry Form Card
  const formCard = document.createElement('div');
  formCard.style.backgroundColor = '#f5f5f5';
  formCard.style.borderRadius = '8px';
  formCard.style.padding = '20px';
  formCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  formCard.style.marginBottom = '30px';
  
  const formHeading = document.createElement('h3');
  formHeading.textContent = 'Add New Expense';
  formHeading.style.marginTop = '0';
  formCard.appendChild(formHeading);
  
  // Initialize expenses array if it doesn't exist
  if (!appState.expenseEntries) {
    appState.expenseEntries = [];
    saveStateToStorage();
  }
  
  // Create form
  const form = document.createElement('form');
  form.onsubmit = (e) => {
    e.preventDefault();
    
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    
    if (description && amount && date && category) {
      // Add new expense entry
      const newEntry = {
        id: Date.now(), // Use timestamp as ID
        description,
        amount,
        date,
        category,
        timestamp: new Date().toISOString()
      };
      
      appState.expenseEntries.push(newEntry);
      saveStateToStorage();
      renderApp(); // Re-render the app
      
      // Reset form
      form.reset();
    }
  };
  
  // Form fields
  const descriptionInput = createInput('text', 'Description', '', null);
  descriptionInput.id = 'expense-description';
  descriptionInput.required = true;
  form.appendChild(createFormGroup('Description', descriptionInput));
  
  const amountInput = createInput('number', 'Amount', '', null);
  amountInput.id = 'expense-amount';
  amountInput.min = '0.01';
  amountInput.step = '0.01';
  amountInput.required = true;
  form.appendChild(createFormGroup('Amount ($)', amountInput));
  
  const dateInput = createInput('date', '', new Date().toISOString().split('T')[0], null);
  dateInput.id = 'expense-date';
  dateInput.required = true;
  form.appendChild(createFormGroup('Date', dateInput));
  
  // Category dropdown
  const categoryField = document.createElement('div');
  categoryField.style.marginBottom = '15px';
  
  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Category';
  categoryLabel.style.display = 'block';
  categoryLabel.style.marginBottom = '5px';
  categoryField.appendChild(categoryLabel);
  
  const categorySelect = document.createElement('select');
  categorySelect.id = 'expense-category';
  categorySelect.required = true;
  categorySelect.style.width = '100%';
  categorySelect.style.padding = '10px';
  categorySelect.style.borderRadius = '4px';
  categorySelect.style.border = '1px solid #ddd';
  
  // Default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a category';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  categorySelect.appendChild(defaultOption);
  
  // Add expense categories - organized by 40/30/30 split
  const categories = {
    "Needs (40%)": [
      "Housing", "Rent", "Mortgage", "Utilities", "Groceries", 
      "Transportation", "Insurance", "Healthcare", "Childcare",
      "Education", "Essential Supplies"
    ],
    "Investments (30%)": [
      "Retirement", "Stocks", "Bonds", "Real Estate", 
      "Business", "Education", "Skills Development", 
      "Equipment", "Technology", "Professional Services"
    ],
    "Savings (30%)": [
      "Emergency Fund", "Vacation", "Future Purchase", 
      "Entertainment", "Dining Out", "Shopping", "Gifts", 
      "Subscriptions", "Hobbies", "Personal Care"
    ]
  };
  
  // Create option groups
  for (const [group, options] of Object.entries(categories)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group;
    
    options.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      optgroup.appendChild(option);
    });
    
    categorySelect.appendChild(optgroup);
  }
  
  categoryField.appendChild(categorySelect);
  form.appendChild(categoryField);
  
  const submitBtn = createButton('Add Expense', null, '#EA4335');
  submitBtn.type = 'submit';
  form.appendChild(submitBtn);
  
  formCard.appendChild(form);
  container.appendChild(formCard);
  
  // Expense History Card
  const historyCard = document.createElement('div');
  historyCard.style.backgroundColor = '#f5f5f5';
  historyCard.style.borderRadius = '8px';
  historyCard.style.padding = '20px';
  historyCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  
  const historyHeading = document.createElement('h3');
  historyHeading.textContent = 'Expense History';
  historyHeading.style.marginTop = '0';
  historyCard.appendChild(historyHeading);
  
  if (!appState.expenseEntries || appState.expenseEntries.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No expense entries yet. Add your first expense above!';
    emptyMessage.style.fontStyle = 'italic';
    historyCard.appendChild(emptyMessage);
  } else {
    // Create table for expense entries
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    
    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Description', 'Amount', 'Date', 'Category', 'Actions'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.textAlign = 'left';
      th.style.padding = '10px';
      th.style.borderBottom = '2px solid #ddd';
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    
    // Sort entries by date (newest first)
    const sortedEntries = [...appState.expenseEntries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    sortedEntries.forEach(entry => {
      const row = document.createElement('tr');
      
      const descCell = document.createElement('td');
      descCell.textContent = entry.description;
      descCell.style.padding = '10px';
      descCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(descCell);
      
      const amountCell = document.createElement('td');
      amountCell.textContent = `$${entry.amount.toFixed(2)}`;
      amountCell.style.padding = '10px';
      amountCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(amountCell);
      
      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(entry.date).toLocaleDateString();
      dateCell.style.padding = '10px';
      dateCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(dateCell);
      
      const categoryCell = document.createElement('td');
      categoryCell.textContent = entry.category || '-';
      categoryCell.style.padding = '10px';
      categoryCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(categoryCell);
      
      const actionsCell = document.createElement('td');
      actionsCell.style.padding = '10px';
      actionsCell.style.borderBottom = '1px solid #ddd';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.backgroundColor = '#EA4335';
      deleteBtn.style.color = 'white';
      deleteBtn.style.border = 'none';
      deleteBtn.style.padding = '5px 10px';
      deleteBtn.style.borderRadius = '4px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.onclick = () => {
        appState.expenseEntries = appState.expenseEntries.filter(item => item.id !== entry.id);
        saveStateToStorage();
        renderApp();
      };
      
      actionsCell.appendChild(deleteBtn);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    historyCard.appendChild(table);
    
    // Add total
    const totalContainer = document.createElement('div');
    totalContainer.style.marginTop = '20px';
    totalContainer.style.fontWeight = 'bold';
    totalContainer.style.fontSize = '18px';
    totalContainer.style.textAlign = 'right';
    
    const total = appState.expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
    totalContainer.textContent = `Total Expenses: $${total.toFixed(2)}`;
    
    historyCard.appendChild(totalContainer);
    
    // Add breakdown by category
    const breakdownContainer = document.createElement('div');
    breakdownContainer.style.marginTop = '30px';
    
    const breakdownHeading = document.createElement('h4');
    breakdownHeading.textContent = 'Expenses by Category';
    breakdownHeading.style.marginBottom = '15px';
    breakdownContainer.appendChild(breakdownHeading);
    
    // Calculate expenses by category
    const categoryTotals = {};
    appState.expenseEntries.forEach(entry => {
      const category = entry.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += entry.amount;
    });
    
    // Create category breakdown list
    const categoryList = document.createElement('ul');
    categoryList.style.listStyleType = 'none';
    categoryList.style.padding = '0';
    
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]) // Sort by amount (highest first)
      .forEach(([category, amount]) => {
        const item = document.createElement('li');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.padding = '8px 0';
        item.style.borderBottom = '1px solid #ddd';
        
        const categoryName = document.createElement('span');
        categoryName.textContent = category;
        item.appendChild(categoryName);
        
        const categoryAmount = document.createElement('span');
        categoryAmount.textContent = `$${amount.toFixed(2)}`;
        categoryAmount.style.fontWeight = '500';
        item.appendChild(categoryAmount);
        
        categoryList.appendChild(item);
      });
    
    breakdownContainer.appendChild(categoryList);
    historyCard.appendChild(breakdownContainer);
  }
  
  container.appendChild(historyCard);
  
  return container;
}

function renderGigsPage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Stackr Gigs';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  const description = document.createElement('p');
  description.textContent = 'Find opportunities to earn extra income with these gig options:';
  container.appendChild(description);
  
  // List of gig categories in cards
  const gigCategories = [
    {
      title: 'Freelance Services',
      description: 'Offer your professional skills on platforms like Upwork, Fiverr or Freelancer.',
      color: '#34A853'
    },
    {
      title: 'Affiliate Marketing',
      description: 'Earn commission by promoting products you love through affiliate programs.',
      color: '#4285F4'
    },
    {
      title: 'Content Creation',
      description: 'Create and monetize blogs, videos, podcasts or other digital content.',
      color: '#FBBC05'
    },
    {
      title: 'Sell Digital Products',
      description: 'Create and sell e-books, courses, templates, or digital art.',
      color: '#EA4335'
    },
    {
      title: 'Local Services',
      description: 'Offer services in your community like tutoring, pet sitting, or handyman work.',
      color: '#34A853'
    }
  ];
  
  const gigGrid = document.createElement('div');
  gigGrid.style.display = 'grid';
  gigGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  gigGrid.style.gap = '20px';
  gigGrid.style.marginTop = '20px';
  
  gigCategories.forEach(gig => {
    const gigCard = document.createElement('div');
    gigCard.style.backgroundColor = '#f5f5f5';
    gigCard.style.borderRadius = '8px';
    gigCard.style.overflow = 'hidden';
    gigCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    
    // Color accent at the top
    const colorBar = document.createElement('div');
    colorBar.style.height = '8px';
    colorBar.style.backgroundColor = gig.color;
    gigCard.appendChild(colorBar);
    
    const content = document.createElement('div');
    content.style.padding = '20px';
    
    const title = document.createElement('h3');
    title.textContent = gig.title;
    title.style.marginTop = '0';
    title.style.color = gig.color;
    content.appendChild(title);
    
    const desc = document.createElement('p');
    desc.textContent = gig.description;
    content.appendChild(desc);
    
    const exploreBtn = createButton('Explore', null, gig.color);
    exploreBtn.style.marginTop = '10px';
    content.appendChild(exploreBtn);
    
    gigCard.appendChild(content);
    gigGrid.appendChild(gigCard);
  });
  
  container.appendChild(gigGrid);
  
  // Income Generation Program Highlight
  const programHighlight = document.createElement('div');
  programHighlight.style.backgroundColor = '#34A853';
  programHighlight.style.color = 'white';
  programHighlight.style.padding = '30px';
  programHighlight.style.borderRadius = '8px';
  programHighlight.style.marginTop = '40px';
  programHighlight.style.textAlign = 'center';
  
  const programTitle = document.createElement('h3');
  programTitle.textContent = 'Stackr Referral Program';
  programTitle.style.fontSize = '24px';
  programTitle.style.marginTop = '0';
  programHighlight.appendChild(programTitle);
  
  const programDesc = document.createElement('p');
  programDesc.textContent = 'Invite friends to use Stackr and earn $10 for each person who signs up for a Pro account!';
  programDesc.style.fontSize = '18px';
  programDesc.style.marginBottom = '20px';
  programHighlight.appendChild(programDesc);
  
  const learnMoreBtn = createButton('Learn More', null, '#FBBC05');
  learnMoreBtn.style.backgroundColor = 'white';
  learnMoreBtn.style.color = '#34A853';
  learnMoreBtn.style.fontWeight = 'bold';
  programHighlight.appendChild(learnMoreBtn);
  
  container.appendChild(programHighlight);
  
  return container;
}

function renderSettingsPage() {
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.textContent = 'Settings';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  // Profile Card
  const profileCard = document.createElement('div');
  profileCard.style.backgroundColor = '#f5f5f5';
  profileCard.style.borderRadius = '8px';
  profileCard.style.padding = '20px';
  profileCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  profileCard.style.marginBottom = '30px';
  
  const profileHeading = document.createElement('h3');
  profileHeading.textContent = 'Profile Settings';
  profileHeading.style.marginTop = '0';
  profileCard.appendChild(profileHeading);
  
  // Profile form
  const profileForm = document.createElement('form');
  profileForm.onsubmit = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value;
    
    if (name) {
      appState.user.name = name;
      saveStateToStorage();
      renderApp();
    }
  };
  
  const nameInput = createInput('text', 'Your Name', appState.user.name, null);
  nameInput.id = 'user-name';
  nameInput.required = true;
  profileForm.appendChild(createFormGroup('Name', nameInput));
  
  const saveProfileBtn = createButton('Save Profile', null, '#34A853');
  saveProfileBtn.type = 'submit';
  profileForm.appendChild(saveProfileBtn);
  
  profileCard.appendChild(profileForm);
  container.appendChild(profileCard);
  
  // Stackr Split Settings Card
  const splitCard = document.createElement('div');
  splitCard.style.backgroundColor = '#f5f5f5';
  splitCard.style.borderRadius = '8px';
  splitCard.style.padding = '20px';
  splitCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  
  const splitHeading = document.createElement('h3');
  splitHeading.textContent = 'Income Split Settings';
  splitHeading.style.marginTop = '0';
  splitCard.appendChild(splitHeading);
  
  const splitDesc = document.createElement('p');
  splitDesc.textContent = 'Customize your income allocation percentages. The total must equal 100%.';
  splitCard.appendChild(splitDesc);
  
  // Current split visualization
  const currentSplit = createSplitVisualization(appState.user.splitRatio);
  splitCard.appendChild(currentSplit);
  
  // Split adjustment form
  const splitForm = document.createElement('form');
  splitForm.style.marginTop = '20px';
  splitForm.onsubmit = (e) => {
    e.preventDefault();
    
    const needs = parseInt(document.getElementById('needs-percent').value);
    const investments = parseInt(document.getElementById('investments-percent').value);
    const savings = parseInt(document.getElementById('savings-percent').value);
    
    if (needs + investments + savings === 100) {
      appState.user.splitRatio = { needs, investments, savings };
      saveStateToStorage();
      renderApp();
    } else {
      alert('The total percentage must equal 100%');
    }
  };
  
  // Needs percent input
  const needsInput = createInput('number', 'Needs %', appState.user.splitRatio.needs.toString(), null);
  needsInput.id = 'needs-percent';
  needsInput.min = '0';
  needsInput.max = '100';
  needsInput.required = true;
  splitForm.appendChild(createFormGroup('Needs %', needsInput));
  
  // Investments percent input
  const investmentsInput = createInput('number', 'Investments %', appState.user.splitRatio.investments.toString(), null);
  investmentsInput.id = 'investments-percent';
  investmentsInput.min = '0';
  investmentsInput.max = '100';
  investmentsInput.required = true;
  splitForm.appendChild(createFormGroup('Investments %', investmentsInput));
  
  // Savings percent input
  const savingsInput = createInput('number', 'Savings %', appState.user.splitRatio.savings.toString(), null);
  savingsInput.id = 'savings-percent';
  savingsInput.min = '0';
  savingsInput.max = '100';
  savingsInput.required = true;
  splitForm.appendChild(createFormGroup('Savings %', savingsInput));
  
  // Form controls
  const formControls = document.createElement('div');
  formControls.style.display = 'flex';
  formControls.style.gap = '10px';
  
  const saveSplitBtn = createButton('Save Split', null, '#34A853');
  saveSplitBtn.type = 'submit';
  formControls.appendChild(saveSplitBtn);
  
  const resetBtn = createButton('Reset to 40/30/30', () => {
    document.getElementById('needs-percent').value = '40';
    document.getElementById('investments-percent').value = '30';
    document.getElementById('savings-percent').value = '30';
  }, '#FBBC05');
  resetBtn.type = 'button';
  formControls.appendChild(resetBtn);
  
  splitForm.appendChild(formControls);
  splitCard.appendChild(splitForm);
  
  container.appendChild(splitCard);
  
  // Account Management Card
  const accountCard = document.createElement('div');
  accountCard.style.backgroundColor = '#f5f5f5';
  accountCard.style.borderRadius = '8px';
  accountCard.style.padding = '20px';
  accountCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  accountCard.style.marginBottom = '30px';
  
  const accountHeading = document.createElement('h3');
  accountHeading.textContent = 'Account Management';
  accountHeading.style.marginTop = '0';
  accountCard.appendChild(accountHeading);
  
  const accountInfo = document.createElement('div');
  accountInfo.style.marginBottom = '20px';
  
  // Import login module to use the logout function
  import('../login.js').then(loginModule => {
    // Create logout button
    const logoutButton = createButton('Logout', async () => {
      try {
        await loginModule.logout();
        // The logout function already handles redirecting to login page
      } catch (error) {
        console.error('Logout error:', error);
      }
    }, '#EA4335', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>');
    
    logoutButton.style.marginTop = '10px';
    accountInfo.appendChild(logoutButton);
  });
  
  accountCard.appendChild(accountInfo);
  container.appendChild(accountCard);
  
  // Data management card
  const dataCard = document.createElement('div');
  dataCard.style.backgroundColor = '#f5f5f5';
  dataCard.style.borderRadius = '8px';
  dataCard.style.padding = '20px';
  dataCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  dataCard.style.marginTop = '30px';
  
  const dataHeading = document.createElement('h3');
  dataHeading.textContent = 'Data Management';
  dataHeading.style.marginTop = '0';
  dataCard.appendChild(dataHeading);
  
  const dataControls = document.createElement('div');
  dataControls.style.display = 'flex';
  dataControls.style.gap = '10px';
  dataControls.style.marginTop = '15px';
  
  const exportBtn = createButton('Export Data', () => {
    // Create a JSON file with all data
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `stackr-green-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, '#4285F4');
  dataControls.appendChild(exportBtn);
  
  const clearBtn = createButton('Clear All Data', () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      appState.incomeEntries = [];
      saveStateToStorage();
      renderApp();
    }
  }, '#EA4335');
  dataControls.appendChild(clearBtn);
  
  dataCard.appendChild(dataControls);
  container.appendChild(dataCard);
  
  // Financial Mascot Settings Card
  const mascotCard = document.createElement('div');
  mascotCard.style.backgroundColor = '#f5f5f5';
  mascotCard.style.borderRadius = '8px';
  mascotCard.style.padding = '20px';
  mascotCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  mascotCard.style.marginBottom = '30px';
  
  const mascotHeading = document.createElement('h3');
  mascotHeading.textContent = 'Financial Mascot Settings';
  mascotHeading.style.marginTop = '0';
  mascotCard.appendChild(mascotHeading);
  
  // Mascot description
  const mascotDesc = document.createElement('p');
  mascotDesc.textContent = 'Customize your financial education mascot that provides tips and guidance throughout the app.';
  mascotDesc.style.marginBottom = '15px';
  mascotCard.appendChild(mascotDesc);
  
  // Mascot toggle section
  const toggleSection = document.createElement('div');
  toggleSection.style.display = 'flex';
  toggleSection.style.alignItems = 'center';
  toggleSection.style.marginBottom = '15px';
  
  const toggleLabel = document.createElement('label');
  toggleLabel.textContent = 'Show Financial Mascot';
  toggleLabel.style.marginRight = '10px';
  toggleLabel.htmlFor = 'mascot-toggle';
  toggleSection.appendChild(toggleLabel);
  
  // Get current visibility setting from localStorage
  let isMascotVisible = true;
  const savedPreferences = localStorage.getItem('mascotPreferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    isMascotVisible = preferences.visible !== undefined ? preferences.visible : true;
  }
  
  // Create toggle switch
  const toggleSwitch = document.createElement('div');
  toggleSwitch.className = 'toggle-switch';
  toggleSwitch.style.position = 'relative';
  toggleSwitch.style.display = 'inline-block';
  toggleSwitch.style.width = '46px';
  toggleSwitch.style.height = '24px';
  
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.id = 'mascot-toggle';
  toggleInput.checked = isMascotVisible;
  toggleInput.style.opacity = '0';
  toggleInput.style.width = '0';
  toggleInput.style.height = '0';
  
  const toggleSlider = document.createElement('span');
  toggleSlider.style.position = 'absolute';
  toggleSlider.style.cursor = 'pointer';
  toggleSlider.style.top = '0';
  toggleSlider.style.left = '0';
  toggleSlider.style.right = '0';
  toggleSlider.style.bottom = '0';
  toggleSlider.style.backgroundColor = isMascotVisible ? '#3cb371' : '#ccc';
  toggleSlider.style.borderRadius = '24px';
  toggleSlider.style.transition = '.4s';
  
  const toggleKnob = document.createElement('span');
  toggleKnob.style.position = 'absolute';
  toggleKnob.style.content = '""';
  toggleKnob.style.height = '18px';
  toggleKnob.style.width = '18px';
  toggleKnob.style.left = isMascotVisible ? '24px' : '4px';
  toggleKnob.style.bottom = '3px';
  toggleKnob.style.backgroundColor = 'white';
  toggleKnob.style.borderRadius = '50%';
  toggleKnob.style.transition = '.4s';
  
  // Add event listener to toggle switch
  toggleInput.addEventListener('change', function() {
    const isChecked = this.checked;
    toggleSlider.style.backgroundColor = isChecked ? '#3cb371' : '#ccc';
    toggleKnob.style.left = isChecked ? '24px' : '4px';
    
    // Save preferences to localStorage
    let preferences = {};
    const savedPrefs = localStorage.getItem('mascotPreferences');
    if (savedPrefs) {
      preferences = JSON.parse(savedPrefs);
    }
    
    preferences.visible = isChecked;
    localStorage.setItem('mascotPreferences', JSON.stringify(preferences));
    
    // Update mascot visibility if it exists
    if (appState.financialMascot) {
      if (isChecked) {
        appState.financialMascot.show();
      } else {
        appState.financialMascot.hide();
      }
    }
  });
  
  toggleSlider.appendChild(toggleKnob);
  toggleSwitch.appendChild(toggleInput);
  toggleSwitch.appendChild(toggleSlider);
  toggleSection.appendChild(toggleSwitch);
  mascotCard.appendChild(toggleSection);
  
  // Personality selection section
  const personalitySection = document.createElement('div');
  personalitySection.style.marginBottom = '15px';
  
  const personalityLabel = document.createElement('label');
  personalityLabel.textContent = 'Mascot Personality';
  personalityLabel.style.display = 'block';
  personalityLabel.style.marginBottom = '8px';
  personalitySection.appendChild(personalityLabel);
  
  // Create a select drop-down for mascot personalities
  const personalitySelect = document.createElement('select');
  personalitySelect.id = 'mascot-personality';
  personalitySelect.style.width = '100%';
  personalitySelect.style.padding = '8px';
  personalitySelect.style.borderRadius = '4px';
  personalitySelect.style.border = '1px solid #ddd';
  
  // Get current personality from localStorage
  let currentPersonality = 'friend';
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    currentPersonality = preferences.personality || 'friend';
  }
  
  // Add personality options - must match the personalities in financial-mascot.js
  const personalities = {
    sage: "Professor Penny (Wise & Thoughtful)",
    cheerleader: "Cash Carter (Enthusiastic & Positive)",
    coach: "Buck Bailey (Straightforward & Motivating)",
    friend: "Sunny Savings (Supportive & Empathetic)",
    jester: "Cash Quips (Humorous & Lighthearted)"
  };
  
  for (const [value, text] of Object.entries(personalities)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    option.selected = value === currentPersonality;
    personalitySelect.appendChild(option);
  }
  
  // Add change event listener to save personality preference
  personalitySelect.addEventListener('change', function() {
    const selectedPersonality = this.value;
    
    // Save preference to localStorage
    let preferences = {};
    const savedPrefs = localStorage.getItem('mascotPreferences');
    if (savedPrefs) {
      preferences = JSON.parse(savedPrefs);
    }
    
    preferences.personality = selectedPersonality;
    localStorage.setItem('mascotPreferences', JSON.stringify(preferences));
    
    // Show update message
    const feedbackMsg = document.createElement('div');
    feedbackMsg.textContent = 'Settings saved! Refresh the page to see changes.';
    feedbackMsg.style.backgroundColor = '#d4edda';
    feedbackMsg.style.color = '#155724';
    feedbackMsg.style.padding = '10px';
    feedbackMsg.style.borderRadius = '4px';
    feedbackMsg.style.marginTop = '10px';
    
    // Remove feedback message after 5 seconds
    mascotCard.appendChild(feedbackMsg);
    setTimeout(() => {
      if (feedbackMsg.parentNode === mascotCard) {
        mascotCard.removeChild(feedbackMsg);
      }
    }, 5000);
  });
  
  personalitySection.appendChild(personalitySelect);
  mascotCard.appendChild(personalitySection);
  
  // Add "Apply Changes" button
  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply Changes';
  applyBtn.style.padding = '8px 16px';
  applyBtn.style.backgroundColor = 'var(--color-primary, #3cb371)';
  applyBtn.style.color = 'white';
  applyBtn.style.border = 'none';
  applyBtn.style.borderRadius = '4px';
  applyBtn.style.cursor = 'pointer';
  
  applyBtn.addEventListener('click', function() {
    // Show message about refreshing
    const refreshMsg = document.createElement('div');
    refreshMsg.textContent = 'Settings saved! Refresh the page to apply all changes.';
    refreshMsg.style.backgroundColor = '#d4edda';
    refreshMsg.style.color = '#155724';
    refreshMsg.style.padding = '10px';
    refreshMsg.style.borderRadius = '4px';
    refreshMsg.style.marginTop = '10px';
    
    // Optionally, offer auto-refresh
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh Now';
    refreshBtn.style.marginLeft = '10px';
    refreshBtn.style.padding = '4px 8px';
    refreshBtn.style.backgroundColor = '#155724';
    refreshBtn.style.color = 'white';
    refreshBtn.style.border = 'none';
    refreshBtn.style.borderRadius = '4px';
    refreshBtn.style.cursor = 'pointer';
    
    refreshBtn.addEventListener('click', function() {
      window.location.reload();
    });
    
    refreshMsg.appendChild(refreshBtn);
    mascotCard.appendChild(refreshMsg);
  });
  
  mascotCard.appendChild(applyBtn);
  container.appendChild(mascotCard);
  
  return container;
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
                <div class="animate-pulse inline-block p-4 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
            break;
          }
            console.log('Using fallback Money Mentor interface');
            
            // Create main container
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'money-mentor-container p-4 max-w-5xl mx-auto';
            
            // Create header with animated gradient
            const header = document.createElement('div');
            header.className = 'mb-8 text-center relative overflow-hidden rounded-xl p-6';
            header.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed, #2563eb)';
            header.style.backgroundSize = '300% 300%';
            header.style.animation = 'gradient-animation 10s ease infinite';
            
            // Add keyframes for gradient animation
            const style = document.createElement('style');
            style.textContent = `
              @keyframes gradient-animation {
                0% { background-position: 0% 50% }
                50% { background-position: 100% 50% }
                100% { background-position: 0% 50% }
              }
              @keyframes bubble-animation {
                0% { transform: translateY(0) scale(1); opacity: 0.7; }
                50% { transform: translateY(-20px) scale(1.1); opacity: 0.9; }
                100% { transform: translateY(-40px) scale(1); opacity: 0; }
              }
              .bubble {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                animation: bubble-animation 3s ease-in infinite;
              }
            `;
            document.head.appendChild(style);
            
            // Add decorative bubbles
            for (let i = 0; i < 10; i++) {
              const bubble = document.createElement('div');
              bubble.className = 'bubble';
              bubble.style.width = `${Math.random() * 50 + 10}px`;
              bubble.style.height = bubble.style.width;
              bubble.style.left = `${Math.random() * 100}%`;
              bubble.style.bottom = `${Math.random() * 20}%`;
              bubble.style.animationDelay = `${Math.random() * 3}s`;
              header.appendChild(bubble);
            }
            
            // Header content
            const headerContent = document.createElement('div');
            headerContent.className = 'relative z-10';
            headerContent.innerHTML = `
              <div class="flex items-center justify-center mb-3">
                <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                    <path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
              </div>
              <h1 class="text-3xl font-bold text-white mb-2">Money Mentor AI</h1>
              <p class="text-white/80">Your intelligent financial guide powered by advanced AI</p>
              <div class="mt-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  PRO Feature
                </span>
              </div>
            `;
            
            header.appendChild(headerContent);
            
            // Create main content grid
            const contentGrid = document.createElement('div');
            contentGrid.className = 'grid grid-cols-1 md:grid-cols-4 gap-6';
            
            // Create chat area with shadow and border
            const chatArea = document.createElement('div');
            chatArea.className = 'md:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700';
            
            // Top tabs for different chat modes
            const tabs = document.createElement('div');
            tabs.className = 'flex space-x-1 mb-5 border-b border-gray-200 dark:border-gray-700 pb-3';
            
            const modes = [
              { id: 'chat', name: 'Chat', icon: 'message-circle', active: true },
              { id: 'assistant', name: 'Financial Plans', icon: 'pie-chart' },
              { id: 'insights', name: 'Market Insights', icon: 'trending-up' }
            ];
            
            modes.forEach(mode => {
              const tab = document.createElement('button');
              tab.className = `px-4 py-2 rounded-lg text-sm font-medium flex items-center ${mode.active ? 
                'bg-primary/10 text-primary' : 
                'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`;
              
              tab.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                  ${mode.icon === 'message-circle' ? 
                    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>' : 
                    mode.icon === 'pie-chart' ? 
                    '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>' :
                    '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>'}
                </svg>
                ${mode.name}
              `;
              
              // Add click event to tabs
              tab.addEventListener('click', () => {
                // Simulate tab change - in a real app this would show different content
                tabs.querySelectorAll('button').forEach(t => {
                  t.classList.remove('bg-primary/10', 'text-primary');
                  t.classList.add('text-gray-600', 'hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
                });
                tab.classList.remove('text-gray-600', 'hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
                tab.classList.add('bg-primary/10', 'text-primary');
              });
              
              tabs.appendChild(tab);
            });
            
            // Chat message container with custom scrollbar
            const messageContainer = document.createElement('div');
            messageContainer.className = 'h-[400px] overflow-y-auto p-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg';
            messageContainer.style.cssText = `
              scrollbar-width: thin;
              scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
            `;
            
            // Add custom scrollbar styles
            const scrollbarStyle = document.createElement('style');
            scrollbarStyle.textContent = `
              .money-mentor-container *::-webkit-scrollbar {
                width: 6px;
              }
              .money-mentor-container *::-webkit-scrollbar-track {
                background: transparent;
              }
              .money-mentor-container *::-webkit-scrollbar-thumb {
                background-color: rgba(156, 163, 175, 0.5);
                border-radius: 20px;
              }
            `;
            document.head.appendChild(scrollbarStyle);
            
            // Create welcome message with animated typing effect
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'flex p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mb-4 border border-blue-100 dark:border-blue-800';
            
            const welcomeAvatar = document.createElement('div');
            welcomeAvatar.className = 'mr-4 flex-shrink-0';
            welcomeAvatar.innerHTML = `
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            `;
            
            const welcomeContent = document.createElement('div');
            welcomeContent.innerHTML = `
              <div class="flex items-center">
                <p class="font-bold text-blue-800 dark:text-blue-300">Money Mentor AI</p>
                <span class="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">PRO</span>
              </div>
              <div class="typing-animation mt-1">Hello! I'm your AI-powered financial assistant. I can help you with budgeting, investing, saving strategies, and much more. What would you like to know today?</div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">${new Date().toLocaleTimeString()} • Powered by Stackr AI</p>
            `;
            
            // Add typing animation styles
            const typingStyle = document.createElement('style');
            typingStyle.textContent = `
              .typing-animation {
                border-right: 2px solid transparent;
                white-space: wrap;
                overflow: hidden;
                animation: typing 3s steps(40, end), blink-caret .75s step-end infinite;
              }
              @keyframes typing {
                from { width: 0 }
                to { width: 100% }
              }
              @keyframes blink-caret {
                from, to { border-color: transparent }
                50% { border-color: #4f46e5 }
              }
            `;
            document.head.appendChild(typingStyle);
            
            welcomeMessage.appendChild(welcomeAvatar);
            welcomeMessage.appendChild(welcomeContent);
            messageContainer.appendChild(welcomeMessage);
            
            // Add a sample conversation
            const createMessage = (isUser, text) => {
              const msgElement = document.createElement('div');
              msgElement.className = `flex ${isUser ? 'flex-row-reverse' : ''} mb-4`;
              
              const avatar = document.createElement('div');
              avatar.className = isUser ? 'ml-4 flex-shrink-0' : 'mr-4 flex-shrink-0';
              
              if (isUser) {
                avatar.innerHTML = `
                  <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                `;
              } else {
                avatar.innerHTML = `
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                `;
              }
              
              const content = document.createElement('div');
              content.className = `flex-1 ${isUser ? 'text-right' : ''}`;
              content.innerHTML = `
                <div class="flex items-center ${isUser ? 'justify-end' : ''}">
                  <p class="font-bold ${isUser ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'}">${isUser ? 'You' : 'Money Mentor AI'}</p>
                  ${!isUser ? '<span class="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">PRO</span>' : ''}
                </div>
                <p class="mt-1 text-gray-800 dark:text-gray-200">${text}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${new Date(Date.now() - Math.random() * 300000).toLocaleTimeString()}</p>
              `;
              
              msgElement.appendChild(isUser ? content : avatar);
              msgElement.appendChild(isUser ? avatar : content);
              
              return msgElement;
            };
            
            // Add sample conversation
            messageContainer.appendChild(createMessage(true, "How can I create a 40/30/30 budget for my income?"));
            messageContainer.appendChild(createMessage(false, "The 40/30/30 budget is an excellent framework for financial stability! Here's how to implement it: <br><br><b>40%</b> - Essential needs (housing, utilities, groceries, transportation)<br><b>30%</b> - Long-term savings & investments<br><b>30%</b> - Personal spending & lifestyle"));
            
            // Add a sample AI-generated visualization
            const chartElement = document.createElement('div');
            chartElement.className = 'p-3 bg-white dark:bg-gray-800 rounded-lg mb-3 border border-gray-200 dark:border-gray-700 flex flex-col items-center';
            chartElement.innerHTML = `
              <div class="flex justify-center mb-2 w-full">
                <div class="relative w-40 h-40">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300">40/30/30 Split</div>
                  </div>
                  <svg viewBox="0 0 36 36" class="w-full h-full">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" stroke-width="2" stroke-dasharray="100, 100"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4f46e5" stroke-width="2" stroke-dasharray="40, 100"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="30, 100" stroke-dashoffset="-40"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="30, 100" stroke-dashoffset="-70"/>
                  </svg>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 w-full text-center text-xs">
                <div><span class="inline-block w-3 h-3 rounded-full bg-indigo-600 mr-1"></span>40% Needs</div>
                <div><span class="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>30% Savings</div>
                <div><span class="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>30% Wants</div>
              </div>
            `;
            messageContainer.appendChild(chartElement);
            
            // Continue conversation
            messageContainer.appendChild(createMessage(true, "What's the best way to start investing with $500?"));
            
            // Create enhanced input area
            const inputArea = document.createElement('div');
            inputArea.className = 'relative';
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'w-full p-4 pl-5 pr-16 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary dark:focus:border-primary transition-all duration-200';
            textInput.placeholder = 'Ask anything about your finances...';
            
            const inputIcons = document.createElement('div');
            inputIcons.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2';
            
            // Add voice input button
            const voiceButton = document.createElement('button');
            voiceButton.className = 'p-2 text-gray-500 hover:text-primary transition-colors duration-200';
            voiceButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            `;
            
            // Add send button
            const sendButton = document.createElement('button');
            sendButton.className = 'p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center';
            sendButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            `;
            
            inputIcons.appendChild(voiceButton);
            inputIcons.appendChild(sendButton);
            inputArea.appendChild(textInput);
            inputArea.appendChild(inputIcons);
            
            // Add event listener to input
            const handleSendMessage = () => {
              if (textInput.value.trim()) {
                // Create user message
                messageContainer.appendChild(createMessage(true, textInput.value));
                
                // Loading indicator
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'flex p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3';
                loadingIndicator.innerHTML = `
                  <div class="mr-4 flex-shrink-0">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div class="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                `;
                
                // Add typing dots animation
                const dotsStyle = document.createElement('style');
                dotsStyle.textContent = `
                  .typing-dots {
                    display: flex;
                    align-items: center;
                  }
                  .typing-dots span {
                    height: 8px;
                    width: 8px;
                    margin: 0 2px;
                    background-color: #4f46e5;
                    border-radius: 50%;
                    opacity: 0.4;
                    animation: dot-pulse 1.5s infinite ease-in-out;
                  }
                  .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                  }
                  .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                  }
                  @keyframes dot-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                  }
                `;
                document.head.appendChild(dotsStyle);
                
                messageContainer.appendChild(loadingIndicator);
                messageContainer.scrollTop = messageContainer.scrollHeight;
                
                // Add system message about Pro requirement
                setTimeout(() => {
                  messageContainer.removeChild(loadingIndicator);
                  
                  const proMessage = document.createElement('div');
                  proMessage.className = 'flex p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg mb-3 border border-amber-200 dark:border-amber-800';
                  proMessage.innerHTML = `
                    <div class="mr-4 flex-shrink-0">
                      <div class="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center">
                        <p class="font-bold text-amber-800 dark:text-amber-300">Money Mentor AI</p>
                        <span class="ml-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded text-xs font-medium">PRO</span>
                      </div>
                      <p class="mt-1 text-gray-800 dark:text-gray-200">
                        This feature requires a Pro subscription. Upgrade to unlock personalized financial advice tailored to your specific situation.
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${new Date().toLocaleTimeString()}</p>
                      
                      <button class="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        Upgrade to Pro
                      </button>
                    </div>
                  `;
                  
                  messageContainer.appendChild(proMessage);
                  messageContainer.scrollTop = messageContainer.scrollHeight;
                  
                  // Add upgrade button click event
                  proMessage.querySelector('button').addEventListener('click', () => {
                    window.location.hash = '#subscriptions';
                  });
                }, 1500);
                
                // Clear input
                textInput.value = '';
              }
            };
            
            sendButton.addEventListener('click', handleSendMessage);
            
            // Allow Enter key to send
            textInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            });
            
            // Voice button effect
            voiceButton.addEventListener('click', () => {
              voiceButton.classList.toggle('text-red-500');
              voiceButton.classList.toggle('animate-pulse');
              
              // Simulate voice input after 2 seconds
              if (voiceButton.classList.contains('text-red-500')) {
                setTimeout(() => {
                  textInput.value = "What are some passive income ideas?";
                  voiceButton.classList.remove('text-red-500', 'animate-pulse');
                  handleSendMessage();
                }, 2000);
              }
            });
            
            chatArea.appendChild(tabs);
            chatArea.appendChild(messageContainer);
            chatArea.appendChild(inputArea);
            
            // Create enhanced sidebar with more modern design
            const sidebar = document.createElement('div');
            sidebar.className = 'md:col-span-1 space-y-5';
            
            // User profile card
            const profileCard = document.createElement('div');
            profileCard.className = 'bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700';
            profileCard.innerHTML = `
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    ${appState?.user?.username?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <span class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                </div>
                <div>
                  <p class="font-medium">${appState?.user?.username || 'ProUser'}</p>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">PRO</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">Financial Health Score</div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div class="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full" style="width: 68%"></div>
                </div>
                <p class="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">68/100</p>
              </div>
            `;
            
            // AI topics with hover effects
            const topicsCard = document.createElement('div');
            topicsCard.className = 'bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700';
            
            const topicsTitle = document.createElement('h3');
            topicsTitle.className = 'text-md font-semibold mb-3 flex items-center';
            topicsTitle.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-primary">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Popular Questions
            `;
            
            const topicsList = document.createElement('ul');
            topicsList.className = 'space-y-2 mt-3';
            
            const suggestedTopics = [
              { text: 'How do I create a 40/30/30 budget?', icon: 'pie-chart' },
              { text: 'Best strategies for student loans?', icon: 'book-open' },
              { text: 'How much should I save for retirement?', icon: 'trending-up' },
              { text: 'Side hustles to start this weekend?', icon: 'dollar-sign' },
              { text: 'How to build an emergency fund?', icon: 'shield' }
            ];
            
            suggestedTopics.forEach(topic => {
              const item = document.createElement('li');
              item.className = 'cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 transform hover:scale-[1.01]';
              
              let iconPath = '';
              switch (topic.icon) {
                case 'pie-chart':
                  iconPath = '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>';
                  break;
                case 'book-open':
                  iconPath = '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>';
                  break;
                case 'trending-up':
                  iconPath = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>';
                  break;
                case 'dollar-sign':
                  iconPath = '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>';
                  break;
                case 'shield':
                  iconPath = '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>';
                  break;
              }
              
              item.innerHTML = `
                <div class="flex items-center">
                  <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      ${iconPath}
                    </svg>
                  </div>
                  <span class="text-sm">${topic.text}</span>
                </div>
              `;
              
              item.addEventListener('click', () => {
                textInput.value = topic.text;
                handleSendMessage();
              });
              
              topicsList.appendChild(item);
            });
            
            topicsCard.appendChild(topicsTitle);
            topicsCard.appendChild(topicsList);
            
            // Enhanced pro features card
            const proCard = document.createElement('div');
            proCard.className = 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-5 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-800';
            
            const proTitle = document.createElement('h3');
            proTitle.className = 'text-md font-semibold mb-3 flex items-center text-indigo-900 dark:text-indigo-300';
            proTitle.innerHTML = `
              <div class="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mr-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </div>
              Pro Features
            `;
            
            const proDescription = document.createElement('p');
            proDescription.className = 'text-xs text-gray-600 dark:text-gray-300 mb-4';
            proDescription.textContent = 'Unlock powerful financial tools:';
            
            const proFeaturesList = document.createElement('ul');
            proFeaturesList.className = 'space-y-3 mb-4';
            
            const proFeatures = [
              { text: 'Unlimited AI financial advice', icon: 'message-square' },
              { text: 'Custom income allocation plans', icon: 'sliders' },
              { text: 'Personalized debt repayment', icon: 'credit-card' },
              { text: 'Investment strategy creation', icon: 'trending-up' },
              { text: 'Chat history & saved advice', icon: 'save' }
            ];
            
            proFeatures.forEach(feature => {
              const item = document.createElement('li');
              item.className = 'flex items-center';
              
              let iconPath = '';
              switch (feature.icon) {
                case 'message-square':
                  iconPath = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
                  break;
                case 'sliders':
                  iconPath = '<line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>';
                  break;
                case 'credit-card':
                  iconPath = '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>';
                  break;
                case 'trending-up':
                  iconPath = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>';
                  break;
                case 'save':
                  iconPath = '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>';
                  break;
              }
              
              item.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center mr-2 text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${iconPath}
                  </svg>
                </div>
                <span class="text-xs text-indigo-900 dark:text-indigo-200">${feature.text}</span>
              `;
              
              proFeaturesList.appendChild(item);
            });
            
            const upgradeProButton = document.createElement('button');
            upgradeProButton.className = 'w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center';
            upgradeProButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Upgrade to Pro
            `;
            
            upgradeProButton.addEventListener('click', () => {
              window.location.hash = '#subscriptions';
            });
            
            proCard.appendChild(proTitle);
            proCard.appendChild(proDescription);
            proCard.appendChild(proFeaturesList);
            proCard.appendChild(upgradeProButton);
            
            // Add cards to sidebar
            sidebar.appendChild(profileCard);
            sidebar.appendChild(topicsCard);
            sidebar.appendChild(proCard);
            
            // Add elements to the content grid
            contentGrid.appendChild(chatArea);
            contentGrid.appendChild(sidebar);
            
            // Add header and content grid to container
            fallbackContainer.appendChild(header);
            fallbackContainer.appendChild(contentGrid);
            
            return fallbackContainer;
          };
          
          try {
            // Try to import the module first
            import('../money-mentor.js').then(module => {
            // Use async IIFE since renderMoneyMentorPage is async
            (async () => {
              try {
                if (!appState || !appState.user) {
                  throw new Error('User data not available');
                }
                
                // Verify the module has the required function
                if (typeof module.renderMoneyMentorPage !== 'function') {
                  throw new Error('renderMoneyMentorPage function not found in module');
                }
                
                const mentorPage = await module.renderMoneyMentorPage(appState.user.id);
                
                // Verify we got a valid DOM element
                if (!(mentorPage instanceof HTMLElement)) {
                  throw new Error('Invalid return from renderMoneyMentorPage');
                }
                
                // Successfully loaded the module, clear any previous error flag
                sessionStorage.removeItem('moneyMentorImportFailed');
                container.appendChild(mentorPage);
              } catch (error) {
                console.error('Error rendering money mentor page:', error);
                console.log('Falling back to simplified Money Mentor interface');
                // Mark as failed in session storage to avoid future attempts
                sessionStorage.setItem('moneyMentorImportFailed', 'true');
                container.appendChild(renderFallbackMoneyMentor());
              }
            })();
          }).catch(error => {
            // Instead of logging the error which may be empty, just log a message
            console.log('Unable to load Money Mentor module - using fallback interface');
            
            // Mark as failed in session storage to avoid future attempts
            sessionStorage.setItem('moneyMentorImportFailed', 'true');
            container.appendChild(renderFallbackMoneyMentor());
          });
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
                // Blog listing view - pass authentication status
                const blogPage = await module.renderBlogPage(
                  appState?.user?.isAuthenticated || false);
                container.appendChild(blogPage);
              }
            } catch (error) {
              console.error('Error rendering blog page:', error);
              container.appendChild(createErrorMessage('Failed to load blog content. Please try again later.'));
            }
          })();
        }).catch(error => {
          console.error('Error loading blog module:', error);
          container.appendChild(createErrorMessage('Failed to load blog module. Please refresh the page and try again.'));
        });
        break;
      case 'challenges':
        // Import the Savings Challenges page module
        import('../challenges-page.js').then(module => {
          // Using async function as renderChallengesPage returns a Promise
          (async () => {
            try {
              const challengesPage = await module.renderChallengesPage(appState.user.id);
              container.appendChild(challengesPage);
            } catch (error) {
              console.error('Error rendering challenges page:', error);
              container.appendChild(createErrorMessage('Failed to load savings challenges data'));
            }
          })();
        }).catch(error => {
          console.error('Error loading challenges page module:', error);
          container.appendChild(createErrorMessage('Failed to load savings challenges module'));
        });
        break;
      case 'subscriptionsniper':
        console.log('Loading Subscription Sniper module...');
        // Create main container
        const subscriptionSniperContainer = document.createElement('div');
        subscriptionSniperContainer.className = 'subscription-sniper-container p-4 max-w-5xl mx-auto';
        
        // Add simple content
        subscriptionSniperContainer.innerHTML = `
          <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 class="text-2xl font-bold mb-4">Subscription Sniper</h2>
            <p class="mb-4">Track and manage your recurring subscriptions to save money.</p>
            <div class="animate-pulse inline-block p-4 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Ready to optimize your subscriptions!
            </div>
          </div>
        `;
        
        // Use the UI directly
        container.appendChild(subscriptionSniperContainer);
        break;
      case 'subscriptionsniper-advanced':
          const renderFallbackSubscriptionSniper = () => {
            console.log('Using fallback Subscription Sniper interface');
            
            // Create main container
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'subscription-sniper-container p-4 max-w-5xl mx-auto';
            
            // Add fallback content here...
            fallbackContainer.innerHTML = `
              <div class="text-center p-8 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h2 class="text-2xl font-bold mb-4">Subscription Sniper</h2>
                <p class="mb-4">Track and manage your recurring subscriptions to save money.</p>
                <div class="animate-pulse inline-block p-4 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Loading module...
                </div>
              </div>
            `;
            
            return fallbackContainer;
          };
          
          const subscriptionSniperImportFailed = sessionStorage.getItem('subscriptionSniperImportFailed') === 'true';
          
          // If previously failed, don't attempt import again to avoid unnecessary console errors
          if (subscriptionSniperImportFailed) {
            console.log('Skipping Subscription Sniper import due to previous failure');
            // Use fallback directly
            container.appendChild(renderFallbackSubscriptionSniper());
            break;
          }
            
            // Create main container
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'subscription-sniper-container p-4 max-w-5xl mx-auto';
            
            // Create animated header with gradient background
            const header = document.createElement('div');
            header.className = 'mb-8 text-center relative overflow-hidden rounded-xl p-6';
            header.style.background = 'linear-gradient(135deg, #ef4444, #f97316, #f59e0b)';
            header.style.backgroundSize = '300% 300%';
            header.style.animation = 'gradient-animation 8s ease infinite';
            
            // Add keyframes for gradient animation
            const style = document.createElement('style');
            style.textContent = `
              @keyframes gradient-animation {
                0% { background-position: 0% 50% }
                50% { background-position: 100% 50% }
                100% { background-position: 0% 50% }
              }
              @keyframes float-animation {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
              }
              @keyframes pulse-animation {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
              }
              @keyframes slide-in {
                0% { transform: translateX(-50px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes fade-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              .subscription-item {
                animation: fade-in 0.4s ease-out forwards;
                opacity: 0;
              }
              .subscription-item:nth-child(1) { animation-delay: 0.1s; }
              .subscription-item:nth-child(2) { animation-delay: 0.2s; }
              .subscription-item:nth-child(3) { animation-delay: 0.3s; }
              .subscription-item:nth-child(4) { animation-delay: 0.4s; }
              .subscription-item:nth-child(5) { animation-delay: 0.5s; }
              .grow-on-hover {
                transition: all 0.2s ease;
              }
              .grow-on-hover:hover {
                transform: scale(1.02);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              }
            `;
            document.head.appendChild(style);
            
            // Add decorative elements
            for (let i = 0; i < 3; i++) {
              const circle = document.createElement('div');
              circle.className = 'absolute rounded-full bg-white/10';
              circle.style.width = `${Math.random() * 100 + 50}px`;
              circle.style.height = circle.style.width;
              circle.style.left = `${Math.random() * 80}%`;
              circle.style.top = `${Math.random() * 60 + 20}%`;
              circle.style.animation = `float-animation ${Math.random() * 2 + 3}s ease-in-out infinite`;
              circle.style.animationDelay = `${Math.random()}s`;
              header.appendChild(circle);
            }
            
            // Header content
            const headerContent = document.createElement('div');
            headerContent.className = 'relative z-10';
            headerContent.innerHTML = `
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                    <path d="M12 20V10"></path>
                    <path d="M18 20V4"></path>
                    <path d="M6 20v-6"></path>
                  </svg>
                </div>
              </div>
              <h1 class="text-3xl font-bold text-white mb-2">Subscription Sniper</h1>
              <p class="text-white/80 mb-4">Track, manage, and optimize your recurring expenses</p>
              <div class="flex justify-center space-x-2">
                <span class="px-3 py-1 bg-white/20 rounded-full text-white text-sm backdrop-blur-sm">
                  <span class="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                  Premium Feature
                </span>
                <span class="px-3 py-1 bg-white/20 rounded-full text-white text-sm backdrop-blur-sm">AI Powered</span>
              </div>
            `;
            
            header.appendChild(headerContent);
            
            // Create tab navigation
            const tabNav = document.createElement('div');
            tabNav.className = 'flex justify-center -mt-5 mb-6 relative z-20';
            
            const tabs = [
              { id: 'dashboard', name: 'Dashboard', icon: 'grid', active: true },
              { id: 'analysis', name: 'Analysis', icon: 'bar-chart-2' },
              { id: 'recommendations', name: 'Recommendations', icon: 'zap' }
            ];
            
            // Create tab container with card-like styling
            const tabContainer = document.createElement('div');
            tabContainer.className = 'bg-white dark:bg-gray-800 rounded-full shadow-lg p-1.5 inline-flex';
            
            tabs.forEach(tab => {
              const tabButton = document.createElement('button');
              tabButton.className = `px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 ${
                tab.active ? 
                'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md' : 
                'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`;
              
              let iconPath = '';
              switch (tab.icon) {
                case 'grid':
                  iconPath = '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>';
                  break;
                case 'bar-chart-2':
                  iconPath = '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>';
                  break;
                case 'zap':
                  iconPath = '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>';
                  break;
              }
              
              tabButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                  ${iconPath}
                </svg>
                ${tab.name}
              `;
              
              // Add click event
              tabButton.addEventListener('click', () => {
                tabContainer.querySelectorAll('button').forEach(t => {
                  t.classList.remove('bg-gradient-to-r', 'from-red-500', 'to-amber-500', 'text-white', 'shadow-md');
                  t.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
                });
                tabButton.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
                tabButton.classList.add('bg-gradient-to-r', 'from-red-500', 'to-amber-500', 'text-white', 'shadow-md');
                
                // This would switch content panels in a real app
              });
              
              tabContainer.appendChild(tabButton);
            });
            
            tabNav.appendChild(tabContainer);
            
            // Create main content area with grid layout
            const contentArea = document.createElement('div');
            contentArea.className = 'grid grid-cols-1 xl:grid-cols-3 gap-6';
            
            // Left column - summary and controls
            const leftColumn = document.createElement('div');
            leftColumn.className = 'xl:col-span-1 space-y-6';
            
            // User profile card
            const profileCard = document.createElement('div');
            profileCard.className = 'bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700';
            profileCard.innerHTML = `
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <div class="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center text-white text-lg font-bold">
                    ${appState?.user?.username?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div class="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-gray-100">${appState?.user?.username || 'ProUser'}</h3>
                  <div class="flex items-center mt-1">
                    <span class="inline-flex items-center bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      PRO
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">Since Apr 2025</span>
                  </div>
                </div>
              </div>
              <div class="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div class="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">Optimization Score</div>
                <div class="relative pt-1">
                  <div class="flex mb-2 items-center justify-between">
                    <div>
                      <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-200">
                        In Progress
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-semibold inline-block text-amber-600 dark:text-amber-200">
                        72%
                      </span>
                    </div>
                  </div>
                  <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-100 dark:bg-gray-700">
                    <div style="width: 72%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-500 to-red-500 rounded"></div>
                  </div>
                </div>
              </div>
            `;
            
            // Create enhanced search bar with filter options
            const searchArea = document.createElement('div');
            searchArea.className = 'bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700';
            
            const searchTitle = document.createElement('h3');
            searchTitle.className = 'text-md font-semibold mb-4 flex items-center';
            searchTitle.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-amber-500">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Find Subscriptions
            `;
            
            const searchForm = document.createElement('div');
            searchForm.className = 'space-y-3';
            
            // Search input with icon
            const searchInputGroup = document.createElement('div');
            searchInputGroup.className = 'relative';
            searchInputGroup.innerHTML = `
              <input type="text" placeholder="Search by name or category..." class="w-full p-3 pl-10 pr-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-3.5 text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            `;
            
            // Add filter options
            const filterOptions = document.createElement('div');
            filterOptions.className = 'grid grid-cols-2 gap-2';
            
            const priceRangeSelect = document.createElement('div');
            priceRangeSelect.className = 'relative';
            priceRangeSelect.innerHTML = `
              <select class="w-full appearance-none p-2 pl-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <option>All Prices</option>
                <option>Under $10</option>
                <option>$10 - $25</option>
                <option>Over $25</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2 top-2.5 text-gray-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            `;
            
            const categorySelect = document.createElement('div');
            categorySelect.className = 'relative';
            categorySelect.innerHTML = `
              <select class="w-full appearance-none p-2 pl-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <option>All Categories</option>
                <option>Entertainment</option>
                <option>Shopping</option>
                <option>Health & Fitness</option>
                <option>News & Media</option>
                <option>Software & Services</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2 top-2.5 text-gray-400">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            `;
            
            const valueSelect = document.createElement('div');
            valueSelect.className = 'relative';
            valueSelect.innerHTML = `
              <select class="w-full appearance-none p-2 pl-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <option>All Value Rating</option>
                <option>High Value</option>
                <option>Medium Value</option>
                <option>Low Value</option>
                <option>Unrated</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2 top-2.5 text-gray-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            `;
            
            const statusSelect = document.createElement('div');
            statusSelect.className = 'relative';
            statusSelect.innerHTML = `
              <select class="w-full appearance-none p-2 pl-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2 top-2.5 text-gray-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            `;
            
            filterOptions.appendChild(priceRangeSelect);
            filterOptions.appendChild(categorySelect);
            filterOptions.appendChild(valueSelect);
            filterOptions.appendChild(statusSelect);
            
            // Search button
            const searchButton = document.createElement('button');
            searchButton.className = 'w-full p-2 mt-2 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-lg hover:from-amber-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg transform hover:-translate-y-0.5';
            searchButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search
            `;
            
            searchForm.appendChild(searchInputGroup);
            searchForm.appendChild(filterOptions);
            searchForm.appendChild(searchButton);
            
            searchArea.appendChild(searchTitle);
            searchArea.appendChild(searchForm);
            
            // AI value assessment card with enhanced design
            const aiValueCard = document.createElement('div');
            aiValueCard.className = 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-5 shadow-md border border-purple-100 dark:border-purple-800 overflow-hidden relative';
            
            // Add decorative circles
            const circlesContainer = document.createElement('div');
            circlesContainer.className = 'absolute inset-0 overflow-hidden';
            
            for (let i = 0; i < 5; i++) {
              const circle = document.createElement('div');
              const size = Math.random() * 50 + 20;
              circle.className = 'absolute rounded-full bg-purple-500/5';
              circle.style.width = `${size}px`;
              circle.style.height = `${size}px`;
              circle.style.top = `${Math.random() * 100}%`;
              circle.style.left = `${Math.random() * 100}%`;
              circlesContainer.appendChild(circle);
            }
            
            aiValueCard.appendChild(circlesContainer);
            
            // AI card content
            const aiCardContent = document.createElement('div');
            aiCardContent.className = 'relative z-10';
            aiCardContent.innerHTML = `
              <div class="flex items-start">
                <div class="mr-4">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="flex items-center">
                    <h3 class="font-bold text-purple-900 dark:text-purple-300">AI Value Analysis</h3>
                    <span class="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-xs font-medium">PRO</span>
                  </div>
                  <p class="text-sm text-purple-800/70 dark:text-purple-300/70 mt-1">Identify high-value vs. low-value subscriptions with AI-powered analysis</p>
                </div>
              </div>
              
              <div class="mt-5 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                <div class="text-xs text-purple-800 dark:text-purple-300 font-medium mb-2">Recently Analyzed Services</div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Spotify</span>
                    <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">High Value</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Gym Membership</span>
                    <span class="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">Low Value</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Amazon Prime</span>
                    <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">High Value</span>
                  </div>
                </div>
              </div>
              
              <button class="w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                  <line x1="16" y1="8" x2="2" y2="22"></line>
                  <line x1="17.5" y1="15" x2="9" y2="15"></line>
                </svg>
                Analyze My Subscriptions
              </button>
            `;
            
            // Right column (main content) with subscription data
            const rightColumn = document.createElement('div');
            rightColumn.className = 'xl:col-span-2 space-y-6';
            
            // Create summary cards with animated counters
            const summaryGrid = document.createElement('div');
            summaryGrid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-5';
            
            // Add counter animation
            const counterStyle = document.createElement('style');
            counterStyle.textContent = `
              @property --num {
                syntax: "<integer>";
                initial-value: 0;
                inherits: false;
              }
              .counter {
                animation: counter 1.5s forwards;
                counter-reset: num var(--num);
              }
              .counter::after {
                content: counter(num);
              }
              @keyframes counter {
                from {
                  --num: 0;
                }
                to {
                  --num: attr(data-value integer);
                }
              }
            `;
            document.head.appendChild(counterStyle);
            
            // Summary cards with enhanced design
            const createSummaryCard = (title, value, unit, icon, trend, trendValue, color, delay) => {
              const card = document.createElement('div');
              card.className = 'bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 grow-on-hover';
              card.style.animation = `fade-in 0.4s ease-out ${delay}s forwards`;
              card.style.opacity = '0';
              
              // Icon based on parameter
              let iconPath = '';
              switch (icon) {
                case 'dollar-sign':
                  iconPath = '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>';
                  break;
                case 'calendar':
                  iconPath = '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>';
                  break;
                case 'check-square':
                  iconPath = '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>';
                  break;
              }
              
              // Trend icon based on trend parameter
              let trendIcon = '';
              let trendClass = '';
              if (trend === 'up') {
                trendIcon = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>';
                trendClass = 'text-red-500 dark:text-red-400';
              } else if (trend === 'down') {
                trendIcon = '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>';
                trendClass = 'text-green-500 dark:text-green-400';
              } else {
                trendIcon = '<path d="M22 12H2"></path>';
                trendClass = 'text-gray-500 dark:text-gray-400';
              }
              
              card.innerHTML = `
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm text-gray-500 dark:text-gray-400 font-medium">${title}</h3>
                    <div class="flex items-baseline mt-1">
                      <span class="text-3xl font-bold ${color}" data-count="${value}">
                        <span class="counter" data-value="${value}"></span>
                      </span>
                      <span class="ml-1 text-sm text-gray-500 dark:text-gray-400">${unit}</span>
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-full ${color.replace('text', 'bg')}/10 flex items-center justify-center ${color}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      ${iconPath}
                    </svg>
                  </div>
                </div>
                <div class="flex items-center mt-4 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${trendClass} mr-1">
                    ${trendIcon}
                  </svg>
                  <span class="${trendClass}">${trendValue}</span>
                </div>
              `;
              
              // Initialize counter animation
              setTimeout(() => {
                const counterElement = card.querySelector('.counter');
                if (counterElement) {
                  counterElement.style.animation = 'counter 1.5s forwards';
                  counterElement.style.setProperty('--num', value);
                }
              }, delay * 1000 + 100);
              
              return card;
            };
            
            // Create summary cards
            summaryGrid.appendChild(createSummaryCard('Monthly Spending', 59, '/mo', 'dollar-sign', 'up', '7% from last month', 'text-amber-600 dark:text-amber-400', 0.1));
            summaryGrid.appendChild(createSummaryCard('Active Subscriptions', 8, 'services', 'calendar', 'up', '1 new subscription', 'text-blue-600 dark:text-blue-400', 0.2));
            summaryGrid.appendChild(createSummaryCard('Optimization Savings', 23, '/mo', 'check-square', 'down', 'Canceled 3 services', 'text-green-600 dark:text-green-400', 0.3));
            
            // Create subscription list section with enhanced cards
            const subscriptionSection = document.createElement('div');
            subscriptionSection.className = 'bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700';
            
            // Section header with tabs
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3';
            
            const sectionTitle = document.createElement('h2');
            sectionTitle.className = 'text-xl font-bold flex items-center';
            sectionTitle.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-amber-500">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
              </svg>
              Your Subscriptions
            `;
            
            const subscriptionTabs = document.createElement('div');
            subscriptionTabs.className = 'flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg';
            
            ['All', 'Monthly', 'Annual', 'Inactive'].forEach((tab, index) => {
              const tabButton = document.createElement('button');
              tabButton.className = `px-3 py-1 text-sm font-medium rounded-md ${index === 0 ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'}`;
              tabButton.textContent = tab;
              
              tabButton.addEventListener('click', () => {
                // Update active tab
                subscriptionTabs.querySelectorAll('button').forEach(btn => {
                  btn.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow-sm');
                  btn.classList.add('text-gray-500', 'dark:text-gray-300', 'hover:text-gray-700', 'dark:hover:text-white');
                });
                
                tabButton.classList.remove('text-gray-500', 'dark:text-gray-300', 'hover:text-gray-700', 'dark:hover:text-white');
                tabButton.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm');
                
                // This would filter subscription items in a real app
              });
              
              subscriptionTabs.appendChild(tabButton);
            });
            
            sectionHeader.appendChild(sectionTitle);
            sectionHeader.appendChild(subscriptionTabs);
            
            // Create enhanced subscription list
            const subscriptionList = document.createElement('div');
            subscriptionList.className = 'space-y-3';
            
            // Enhanced sample subscription data
            const subscriptions = [
              {
                name: 'Netflix',
                icon: '🎬',
                logo: 'bg-red-600',
                amount: 14.99,
                frequency: 'Monthly',
                nextBilling: '2025-05-02',
                category: 'Entertainment',
                status: 'Active',
                usage: 'High'
              },
              {
                name: 'Spotify',
                icon: '🎵',
                logo: 'bg-green-600',
                amount: 9.99,
                frequency: 'Monthly',
                nextBilling: '2025-05-15',
                category: 'Entertainment',
                status: 'Active',
                valueAssessment: 'High Value',
                usage: 'Very High'
              },
              {
                name: 'Amazon Prime',
                icon: '📦',
                logo: 'bg-blue-600',
                amount: 12.99,
                frequency: 'Monthly',
                nextBilling: '2025-05-04',
                category: 'Shopping',
                status: 'Active',
                valueAssessment: 'High Value',
                usage: 'Medium'
              },
              {
                name: 'Gym Membership',
                icon: '💪',
                logo: 'bg-purple-600',
                amount: 29.99,
                frequency: 'Monthly',
                nextBilling: '2025-05-01',
                category: 'Health',
                status: 'Inactive',
                valueAssessment: 'Low Value',
                usage: 'Low'
              },
              {
                name: 'The New York Times',
                icon: '📰',
                logo: 'bg-gray-600',
                amount: 17.99,
                frequency: 'Monthly',
                nextBilling: 'Canceled',
                category: 'News',
                status: 'Inactive',
                usage: 'Very Low'
              }
            ];
            
            // Create enhanced subscription items
            subscriptions.forEach((sub, index) => {
              const subItem = document.createElement('div');
              subItem.className = 'subscription-item bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-amber-200 dark:hover:border-amber-700 grow-on-hover';
              
              // Usage indicator
              let usagePercentage = 0;
              switch (sub.usage) {
                case 'Very High': usagePercentage = 95; break;
                case 'High': usagePercentage = 80; break;
                case 'Medium': usagePercentage = 60; break;
                case 'Low': usagePercentage = 30; break;
                case 'Very Low': usagePercentage = 10; break;
              }
              
              // Calculate days until next billing
              let daysLeft = '';
              let daysLeftClass = '';
              
              if (sub.status === 'Active' && sub.nextBilling !== 'Canceled') {
                const today = new Date();
                const billingDate = new Date(sub.nextBilling);
                const timeDiff = billingDate - today;
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                daysLeft = `${dayDiff} days left`;
                
                if (dayDiff <= 3) {
                  daysLeftClass = 'text-red-600 dark:text-red-400';
                } else if (dayDiff <= 7) {
                  daysLeftClass = 'text-amber-600 dark:text-amber-400';
                } else {
                  daysLeftClass = 'text-gray-500 dark:text-gray-400';
                }
              } else {
                daysLeft = 'Canceled';
                daysLeftClass = 'text-gray-500 dark:text-gray-400';
              }
              
              subItem.innerHTML = `
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-xl ${sub.logo} flex items-center justify-center text-xl text-white shadow-sm">
                      ${sub.icon}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-gray-100">${sub.name}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <span>${sub.category}</span>
                        <span class="mx-1.5">•</span>
                        <span>${sub.frequency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-end">
                    <div class="font-bold text-gray-900 dark:text-gray-100">$${sub.amount.toFixed(2)}</div>
                    <div class="text-xs ${daysLeftClass}">${daysLeft}</div>
                  </div>
                </div>
                
                <div class="mt-3 grid grid-cols-3 items-center gap-3">
                  <div class="col-span-2">
                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Usage</span>
                      <span>${sub.usage}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div class="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 rounded-full" style="width: ${usagePercentage}%"></div>
                    </div>
                  </div>
                  
                  <div class="flex justify-end space-x-1">
                    ${sub.valueAssessment ? 
                      `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${sub.valueAssessment.includes('High') ? 
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }">${sub.valueAssessment}</span>` : 
                      ''
                    }
                    <button class="p-1.5 text-xs text-amber-600 bg-amber-100 hover:bg-amber-200 dark:text-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800 rounded-lg transition-colors">
                      ${sub.status === 'Active' ? 'Manage' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              `;
              
              // Add hover interactivity
              subItem.addEventListener('mouseenter', () => {
                subItem.style.transform = 'translateY(-2px)';
              });
              
              subItem.addEventListener('mouseleave', () => {
                subItem.style.transform = 'translateY(0)';
              });
              
              subscriptionList.appendChild(subItem);
            });
            
            // Add a new subscription button
            const addNewButton = document.createElement('button');
            addNewButton.className = 'w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200 border border-dashed border-gray-300 dark:border-gray-600';
            addNewButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Subscription Manually
            `;
            
            // Add Savings Challenges section
            const savingsChallengesSection = document.createElement('div');
            savingsChallengesSection.className = 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 shadow-md border border-emerald-100 dark:border-emerald-800 animation-pulse';
            
            // Create header with title and description
            const challengesHeader = document.createElement('div');
            challengesHeader.className = 'flex items-start mb-5';
            challengesHeader.innerHTML = `
              <div class="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white mr-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-emerald-900 dark:text-emerald-300">Subscription Savings Challenges</h3>
                <p class="text-sm text-emerald-800/70 dark:text-emerald-300/70 mt-1">Complete these challenges to optimize your subscriptions and save money!</p>
              </div>
            `;
            
            // Create challenges cards
            const challengesGrid = document.createElement('div');
            challengesGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 mt-3';
            
            const challenges = [
              {
                title: 'Cancel Unused Memberships',
                description: 'Identify and cancel 2 subscriptions you haven\'t used in 30+ days',
                reward: 'Save up to $35/month',
                progress: 50,
                icon: 'trash-2'
              },
              {
                title: 'Downgrade Premium Plans',
                description: 'Downgrade at least one subscription to a more affordable tier',
                reward: 'Save $5-15/month',
                progress: 0,
                icon: 'arrow-down'
              },
              {
                title: 'Switch to Annual Billing',
                description: 'Convert 2 monthly subscriptions to annual billing',
                reward: 'Save up to 20% overall',
                progress: 75,
                icon: 'calendar'
              },
              {
                title: 'Subscription Detox Week',
                description: 'Go one week without using paid streaming services',
                reward: 'Learn which services you actually miss',
                progress: 25,
                icon: 'zap-off'
              }
            ];
            
            challenges.forEach(challenge => {
              // Create challenge card
              const challengeCard = document.createElement('div');
              challengeCard.className = 'bg-white/70 dark:bg-gray-800/50 rounded-lg p-4 shadow-sm border border-emerald-100 dark:border-emerald-800/50 grow-on-hover';
              
              // Set icon based on challenge type
              let iconPath = '';
              switch (challenge.icon) {
                case 'trash-2':
                  iconPath = '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>';
                  break;
                case 'arrow-down':
                  iconPath = '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>';
                  break;
                case 'calendar':
                  iconPath = '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>';
                  break;
                case 'zap-off':
                  iconPath = '<polyline points="12.41 6.75 13 2 10.57 4.92"></polyline><polyline points="18.57 12.91 21 10 15.66 10"></polyline><polyline points="8 8 3 14 12 14 11 22 16 16"></polyline><line x1="1" y1="1" x2="23" y2="23"></line>';
                  break;
              }
              
              // Construct challenge card content
              challengeCard.innerHTML = `
                <div class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/70 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      ${iconPath}
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-emerald-900 dark:text-emerald-300">${challenge.title}</h4>
                    <p class="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-1">${challenge.description}</p>
                  </div>
                </div>
                
                <div class="mt-3">
                  <div class="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                    <span>Progress</span>
                    <span class="font-medium">${challenge.progress}%</span>
                  </div>
                  <div class="w-full bg-emerald-100 dark:bg-emerald-900/50 rounded-full h-2">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style="width: ${challenge.progress}%"></div>
                  </div>
                </div>
                
                <div class="mt-3 flex justify-between items-center">
                  <span class="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full">
                    ${challenge.reward}
                  </span>
                  
                  <button class="text-xs px-3 py-1.5 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg shadow-sm">
                    ${challenge.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                </div>
              `;
              
              challengesGrid.appendChild(challengeCard);
            });
            
            // Assemble the savings challenges section
            savingsChallengesSection.appendChild(challengesHeader);
            savingsChallengesSection.appendChild(challengesGrid);
            
            // Assemble subscription section
            subscriptionSection.appendChild(sectionHeader);
            subscriptionSection.appendChild(subscriptionList);
            subscriptionSection.appendChild(addNewButton);
            
            // Connect bank account section with enhanced design
            const connectBankSection = document.createElement('div');
            connectBankSection.className = 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 shadow-md border border-blue-100 dark:border-blue-800 relative overflow-hidden';
            
            // Add decorative elements
            const decorativeShapes = document.createElement('div');
            decorativeShapes.className = 'absolute inset-0 overflow-hidden';
            
            // Add decorative circles with different opacities
            for (let i = 0; i < 5; i++) {
              const circle = document.createElement('div');
              const size = Math.random() * 120 + 40;
              circle.className = 'absolute rounded-full bg-blue-500/5';
              circle.style.width = `${size}px`;
              circle.style.height = `${size}px`;
              circle.style.top = `${Math.random() * 100}%`;
              circle.style.left = `${Math.random() * 100}%`;
              decorativeShapes.appendChild(circle);
            }
            
            connectBankSection.appendChild(decorativeShapes);
            
            // Connect bank content
            const connectBankContent = document.createElement('div');
            connectBankContent.className = 'relative z-10 flex items-center';
            connectBankContent.innerHTML = `
              <div class="mr-4 flex-shrink-0">
                <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg animation-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </div>
              </div>
              <div class="flex-grow">
                <h3 class="font-bold text-blue-900 dark:text-blue-300">Connect Your Bank Account</h3>
                <p class="text-sm text-blue-800/70 dark:text-blue-300/70 mt-1">Automatically detect all your recurring subscriptions and get personalized insights</p>
                <div class="mt-3 flex items-center">
                  <button class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Connect with Plaid
                    <span class="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded text-white backdrop-blur-sm">PRO</span>
                  </button>
                </div>
              </div>
            `;
            
            // Assign click handler to the connect button
            connectBankContent.querySelector('button').addEventListener('click', () => {
              window.location.hash = '#bankconnections';
            });
            
            connectBankSection.appendChild(connectBankContent);
            
            // Add everything to the left column
            leftColumn.appendChild(profileCard);
            leftColumn.appendChild(searchArea);
            leftColumn.appendChild(aiValueCard);
            
            // Add everything to the right column
            rightColumn.appendChild(summaryGrid);
            rightColumn.appendChild(subscriptionSection);
            rightColumn.appendChild(savingsChallengesSection);
            rightColumn.appendChild(connectBankSection);
            
            // Add columns to content area
            contentArea.appendChild(leftColumn);
            contentArea.appendChild(rightColumn);
            
            // Add header, tabs and content to main container
            fallbackContainer.appendChild(header);
            fallbackContainer.appendChild(tabNav);
            fallbackContainer.appendChild(contentArea);
            
            return fallbackContainer;
          };
          
          try {
            // Try to import the module first
            import('../subscription-sniper.js').then(module => {
            // Use async IIFE since renderSubscriptionSniperPage is async
            (async () => {
              try {
                if (!appState || !appState.user) {
                  throw new Error('User data not available');
                }
                
                // Verify the module has the required function
                if (typeof module.renderSubscriptionSniperPage !== 'function') {
                  throw new Error('renderSubscriptionSniperPage function not found in module');
                }
                
                const sniperPage = await module.renderSubscriptionSniperPage(appState.user.id);
                
                // Verify we got a valid DOM element
                if (!(sniperPage instanceof HTMLElement)) {
                  throw new Error('Invalid return from renderSubscriptionSniperPage');
                }
                
                // Successfully loaded the module, clear any previous error flag
                sessionStorage.removeItem('subscriptionSniperImportFailed');
                container.appendChild(sniperPage);
              } catch (error) {
                console.error('Error rendering subscription sniper page:', error);
                console.log('Falling back to simplified Subscription Sniper interface');
                // Mark as failed in session storage to avoid future attempts
                sessionStorage.setItem('subscriptionSniperImportFailed', 'true');
                container.appendChild(renderFallbackSubscriptionSniper());
              }
            })();
          }).catch(error => {
            // Instead of logging the error which may be empty, just log a message
            console.log('Unable to load Subscription Sniper module - using fallback interface');
            
            // Mark as failed in session storage to avoid future attempts
            sessionStorage.setItem('subscriptionSniperImportFailed', 'true');
            container.appendChild(renderFallbackSubscriptionSniper());
          });
        } catch (outerError) {
          console.error('Critical error initializing Subscription Sniper module:', outerError);
          container.appendChild(createErrorMessage('Critical error loading Subscription Sniper. Please reload the application.'));
        }
        break;
      case 'bankconnections':
        // Import the bank connections page module
        import('../bank-connections.js').then(module => {
          // Use async IIFE since renderBankConnectionsPage might be async
          (async () => {
            try {
              if (!appState || !appState.user) {
                throw new Error('User data not available');
              }
              
              const connectionPage = await module.renderBankConnectionsPage(appState.user.id);
              container.appendChild(connectionPage);
            } catch (error) {
              console.error('Error rendering bank connections page:', error);
              container.appendChild(createErrorMessage('Failed to load bank account data. Please check your Plaid API connection and try again.'));
            }
          })();
        }).catch(error => {
          console.error('Error loading bank connections module:', error);
          container.appendChild(createErrorMessage('Failed to load Bank Connections module. Please refresh the page and try again.'));
        });
        break;
      case 'subscriptions':
        // Import the subscriptions page module
        import('../subscriptions.js').then(module => {
          // Use async IIFE since renderSubscriptionsPage might be async
          (async () => {
            try {
              const subscriptionsPage = await module.renderSubscriptionsPage();
              container.appendChild(subscriptionsPage);
            } catch (error) {
              console.error('Error rendering subscriptions page:', error);
              container.appendChild(createErrorMessage('Failed to load subscription details. Please check your subscription settings and try again.'));
            }
          })();
        }).catch(error => {
          console.error('Error loading subscriptions module:', error);
          container.appendChild(createErrorMessage('Failed to load subscriptions module. Please refresh the page and try again.'));
        });
        break;
      case 'settings':
        container.appendChild(renderSettingsPage());
        break;
      default:
        container.appendChild(renderDashboardPage());
    }
  }
  
  // Initialize financial mascot for authenticated users on relevant pages
  if (appState.user.isAuthenticated && 
      !['login', 'register', 'landing'].includes(appState.currentPage)) {
    
    // Add a delayed initialization of the mascot
    setTimeout(() => {
      // Only add if not already initialized
      if (!appState.financialMascot) {
        initFinancialMascot();
      } else {
        // Update mascot category based on current page
        const pageToCategory = {
          'dashboard': 'budgeting',
          'income': 'income', 
          'expenses': 'budgeting',
          'savings': 'saving',
          'investments': 'investing',
          'moneymentor': 'psychology',
          'subscriptionsniper': 'budgeting',
          'savingschallenges': 'saving',
          'wellnessscorecard': 'psychology',
          'debt': 'debt'
        };
        
        if (pageToCategory[appState.currentPage]) {
          appState.financialMascot.currentTipCategory = pageToCategory[appState.currentPage];
          
          // Show a tip after page loads
          setTimeout(() => {
            appState.financialMascot.showNextTip();
          }, 1000);
        }
      }
    }, 1500); // Delay to allow page content to load first
  }
}

// Main render function with the new sidebar layout
function renderApp() {
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = ''; // Clear previous content
  
  // Add responsive viewport classes to the body
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  document.body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop', 'viewport-fold-closed', 'viewport-fold-open');
  
  // Enhanced breakpoints to handle foldable devices like Samsung Z Fold 4:
  // Small Mobile (Folded): < 500px width
  // Mobile: < 768px (changed from 640px to match sidebar breakpoint)
  // Tablet/Fold Open: 768px - 1023px
  // Desktop: >= 1024px
  
  // Detect foldable states - Z Fold 4 has these approximate dimensions:
  // - Folded: ~285-305px width
  // - Unfolded: ~720-740px width
  const isFoldableClosed = width < 500 && aspectRatio < 0.7; // Tall and narrow
  const isFoldableOpen = width >= 500 && width < 840 && aspectRatio > 0.9; // More square-like when open
  
  if (width < 500) {
    document.body.classList.add('viewport-mobile');
    console.log('Viewport: small mobile');
    // Add fold-specific class if detected
    if (isFoldableClosed) {
      document.body.classList.add('viewport-fold-closed');
      console.log('Detected: Foldable device (closed)');
    }
  } else if (width < 768) {
    document.body.classList.add('viewport-mobile');
    console.log('Viewport: mobile');
  } else if (width < 1024) {
    document.body.classList.add('viewport-tablet');
    console.log('Viewport: tablet');
    // Add fold-specific class if detected
    if (isFoldableOpen) {
      document.body.classList.add('viewport-fold-open');
      console.log('Detected: Foldable device (open)');
    }
  } else {
    document.body.classList.add('viewport-desktop');
    console.log('Viewport: desktop');
  }
  
  // Add responsive styles to root document
  const htmlRoot = document.documentElement;
  
  // Set responsive spacing variables with special handling for foldable devices
  if (width < 500) {
    // Small mobile / folded foldable spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-3)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-3)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-4)');
    htmlRoot.style.setProperty('--font-size-base', '14px');
    // Special handling for Samsung Z Fold 4 folded
    if (isFoldableClosed) {
      htmlRoot.style.setProperty('--container-padding', 'var(--space-2)');
      htmlRoot.style.setProperty('--content-max-width', '280px');
    }
  } else if (width < 768) {
    // Regular mobile spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-4)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-4)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-6)');
    htmlRoot.style.setProperty('--font-size-base', '15px');
  } else if (width < 1024) {
    // Tablet spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-6)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-5)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-8)');
    htmlRoot.style.setProperty('--font-size-base', '16px');
    // Special handling for Samsung Z Fold 4 unfolded
    if (isFoldableOpen) {
      htmlRoot.style.setProperty('--container-padding', 'var(--space-5)');
      htmlRoot.style.setProperty('--content-max-width', '720px');
    }
  } else {
    // Desktop spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-8)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-6)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-10)');
    htmlRoot.style.setProperty('--font-size-base', '16px');
  }
  
  // Check authentication for protected routes
  if (!appState.user.isAuthenticated) {
    const nonAuthRoutes = ['login', 'register', 'about', 'pricing', 'landing', 'blog', 'forgot-password'];
    if (!nonAuthRoutes.includes(appState.currentPage)) {
      console.log('User not authenticated, redirecting to login page');
      navigateTo('login');
      return; // Stop rendering protected page
    }
  } else {
    // If authenticated but onboarding not completed, redirect to onboarding
    // Exception: user is already on the onboarding page
    if (appState.currentPage !== 'onboarding' && 
        (!appState.user.onboardingCompleted && 
         (!appState.user.onboardingStep || 
          appState.user.onboardingStep !== 'complete'))) {
      console.log('Onboarding not completed, redirecting to onboarding page');
      navigateTo('onboarding');
      return; // Stop rendering protected page
    }
  }
  
  // For auth, landing, onboarding, and blog pages, use simple layout without sidebar when not authenticated
  if (appState.currentPage === 'login' || 
      appState.currentPage === 'register' || 
      appState.currentPage === 'landing' ||
      appState.currentPage === 'onboarding' ||
      appState.currentPage === 'forgot-password' ||
      (appState.currentPage === 'blog' && !appState.user.isAuthenticated)) {
      
    // Create simple app container
    const simpleContainer = document.createElement('div');
    simpleContainer.className = 'app-container';
    simpleContainer.style.display = 'flex';
    simpleContainer.style.flexDirection = 'column';
    simpleContainer.style.minHeight = '100vh';
    
    // Create main content area
    const main = document.createElement('main');
    main.style.flex = '1';
    
    // Render the page content
    renderPageContent(main);
    
    simpleContainer.appendChild(main);
    rootElement.appendChild(simpleContainer);
  } else {
    // For authenticated pages, use the sidebar layout
    const app = document.createElement('div');
    app.id = 'app';
    rootElement.appendChild(app);
    
    // Show app header if it was hidden before (when coming from onboarding)
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
      appHeader.style.display = 'flex';
    }
    
    // Create the layout with sidebar
    createLayout();
  }
  
  // Debug info
  console.log(`Page rendered: ${appState.currentPage}`);
  console.log(`Viewport: ${width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'}`);
  
  // Setup responsive event listener
  if (!window.resizeListenerAttached) {
    window.addEventListener('resize', debounce(() => {
      renderApp();
    }, 250));
    window.resizeListenerAttached = true;
  }
}

// Helper function to limit how often the resize event fires
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Create an error message element 
function createErrorMessage(message) {
  const container = document.createElement('div');
  container.style.padding = '40px';
  container.style.textAlign = 'center';
  container.style.backgroundColor = 'var(--color-error-light, #FFEBEE)';
  container.style.color = 'var(--color-error, #EA4335)';
  container.style.borderRadius = 'var(--radius-lg, 12px)';
  container.style.marginBottom = '24px';
  
  const icon = document.createElement('div');
  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  icon.style.marginBottom = '16px';
  
  const title = document.createElement('h3');
  title.textContent = 'Error';
  title.style.marginBottom = '8px';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  
  const text = document.createElement('p');
  text.textContent = message;
  text.style.fontSize = '16px';
  
  container.appendChild(icon);
  container.appendChild(title);
  container.appendChild(text);
  
  return container;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('GREEN Firebase-free version initializing...');
  
  // Initialize security measures
  import('../utils/security-utils.js').then(module => {
    if (module && module.initializeSecurityMeasures) {
      module.initializeSecurityMeasures();
    }
  }).catch(error => {
    console.error('Error initializing security measures:', error);
  });
  
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
  
  // Initialize the financial mascot after app is rendered
  // But only for authenticated users viewing protected pages
  if (appState.user.isAuthenticated && appState.currentPage !== 'landing' && 
      appState.currentPage !== 'login' && appState.currentPage !== 'register') {
    initFinancialMascot();
  }
  
  console.log('GREEN Firebase-free version loaded successfully!');
});

// Initialize the financial education mascot
function initFinancialMascot() {
  // Make sure we don't attempt to load if not authenticated
  if (!appState || !appState.user || !appState.user.isAuthenticated) {
    console.log('Not initializing mascot: user not authenticated');
    return;
  }
  
  console.log('Loading financial mascot module...');
  
  // Import and initialize the mascot
  import('../financial-mascot.js').then(module => {
    try {
      console.log('Financial mascot module loaded successfully');
      
      // Verify that the imported module has the required functions
      if (typeof module.initMascot !== 'function') {
        throw new Error('initMascot function not found in module');
      }
      
      // Initialize the mascot when user is on a protected page
      const mascot = module.initMascot();
      
      if (!mascot) {
        throw new Error('initMascot did not return a valid mascot instance');
      }
      
      console.log('Financial mascot initialized successfully');
      
      // Store the mascot instance in the appState for future access
      appState.financialMascot = mascot;
    
    // Add mascot settings link to the settings page
    if (appState.currentPage === 'settings') {
      const settingsPage = document.querySelector('.settings-container');
      if (settingsPage) {
        // Create the mascot settings section
        const settingsContainer = module.createMascotSettings(mascot);
        
        // Add a header for the section
        const sectionHeader = document.createElement('h2');
        sectionHeader.textContent = 'Financial Education Mascot';
        sectionHeader.style.fontSize = '1.5rem';
        sectionHeader.style.fontWeight = 'bold';
        sectionHeader.style.marginTop = '2rem';
        sectionHeader.style.marginBottom = '1rem';
        
        // Find a good place to add the mascot settings
        const lastSection = settingsPage.querySelector('.settings-container > div:last-child');
        if (lastSection) {
          lastSection.parentNode.insertBefore(sectionHeader, lastSection.nextSibling);
          lastSection.parentNode.insertBefore(settingsContainer, sectionHeader.nextSibling);
        } else {
          settingsPage.appendChild(sectionHeader);
          settingsPage.appendChild(settingsContainer);
        }
      }
    }
    
    // Based on current page, show relevant category tips
    const pageToCategory = {
      'dashboard': 'budgeting',
      'income': 'income',
      'expenses': 'budgeting',
      'savings': 'saving',
      'investments': 'investing',
      'moneymentor': 'psychology',
      'subscriptionsniper': 'budgeting',
      'savingschallenges': 'saving',
      'wellnessscorecard': 'psychology',
      'debt': 'debt'
    };
    
    // Show a relevant tip for the current page after a delay
    if (pageToCategory[appState.currentPage]) {
      setTimeout(() => {
        // Set category based on current page
        mascot.currentTipCategory = pageToCategory[appState.currentPage];
        // Show a tip
        mascot.showNextTip();
      }, 3000); // Show tip after 3 seconds
    }
    } catch (err) {
      console.error('Error setting up financial mascot:', err);
    }
  }).catch(error => {
    console.error('Error initializing financial mascot:', error);
  });
}