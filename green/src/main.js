// Stackr Finance - No dependencies on any external libraries - completely self-contained
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
// Export appState so it can be imported by other modules
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
    // Add sidebar
    const sidebar = sidebarModule.createSidebar(appState);
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
      
      // Removed GREEN badge as requested
      
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
      
      menuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event bubbling
        console.log("Hamburger menu clicked - toggling sidebar");
        setTimeout(() => sidebarModule.toggleSidebar(), 50); // Small delay to ensure proper rendering
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
  
  // Removed GREEN Edition subtitle as requested
  
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
  
  // Logo container with SVG logo
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.cursor = 'pointer';
  logoContainer.addEventListener('click', () => navigateTo('dashboard'));
  
  // Create logo using SVG from public folder with standard size
  const logoImg = document.createElement('img');
  logoImg.src = 'public/stackr-logo.svg'; // Path relative to green folder
  logoImg.alt = 'Stackr';
  logoImg.style.height = '48px'; // Increased to standard size
  logoImg.style.width = 'auto';
  logoImg.style.marginRight = '10px';
  
  logoContainer.appendChild(logoImg);
  
  // Only add text on desktop
  if (!isMobile) {
    const logoText = document.createElement('span');
    logoText.textContent = 'Finance';
    logoText.style.fontSize = '26px'; // Increased for better proportions
    logoText.style.fontWeight = 'bold';
    logoText.style.color = 'white';
    logoContainer.appendChild(logoText);
  }
  
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
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent event bubbling
      
      // First try to toggle the sidebar if it exists
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        console.log("Hamburger menu clicked in fallback header - toggling sidebar");
        setTimeout(() => {
          if (typeof sidebarModule !== 'undefined' && sidebarModule.toggleSidebar) {
            sidebarModule.toggleSidebar();
            return;
          }
        }, 50);
      }
      
      // Fallback to the mobile menu toggle if sidebar isn't available
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
      id: 'savingschallenges', 
      title: 'Savings Challenges',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      badge: 'New'
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
  
  // Create container for logo and text 
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.marginBottom = 'var(--space-2)';
  
  // Create logo using SVG from public folder with standard size
  const logoImg = document.createElement('img');
  logoImg.src = 'public/stackr-logo.svg'; // Path relative to green folder
  logoImg.alt = 'Stackr';
  logoImg.style.height = '48px'; // Standard size
  logoImg.style.width = 'auto';
  logoImg.style.marginRight = '10px';
  
  // Add the "Finance" text
  const logoText = document.createElement('span');
  logoText.textContent = 'Finance';
  logoText.style.fontSize = '26px'; // Increased for better proportions
  logoText.style.fontWeight = 'bold';
  logoText.style.color = 'var(--color-text)';
  
  logoContainer.appendChild(logoImg);
  logoContainer.appendChild(logoText);
  
  const footerTagline = document.createElement('p');
  footerTagline.textContent = 'Helping service providers manage their finances better';
  footerTagline.style.color = 'var(--color-text-secondary)';
  footerTagline.style.fontSize = 'var(--font-size-sm)';
  footerTagline.style.margin = '10px 0 0 0';
  
  logoSection.appendChild(logoContainer);
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
        { name: 'Savings Challenges', url: '#savingschallenges' },
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
        { name: 'About Stackr', url: '#' },
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
  copyrightText.textContent = '© ' + new Date().getFullYear() + ' Stackr Finance. All rights reserved.';
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
// Import the bank connection functions
import { hasBankConnections, getBankConnectionStatusBadge } from '../bank-connections.js';

async function renderDashboardPage() {
  const isMobile = window.innerWidth < 640;
  const container = document.createElement('div');
  
  // Header container with status indicators
  const headerContainer = document.createElement('div');
  headerContainer.style.display = 'flex';
  headerContainer.style.flexDirection = isMobile ? 'column' : 'row';
  headerContainer.style.justifyContent = 'space-between';
  headerContainer.style.alignItems = isMobile ? 'flex-start' : 'center';
  headerContainer.style.marginBottom = 'var(--space-6)';
  headerContainer.style.animation = 'fadeIn 0.6s ease-out';
  
  // Animated welcome heading with gradient text
  const welcomeHeading = document.createElement('h2');
  welcomeHeading.textContent = `Welcome, ${appState.user.name}!`;
  welcomeHeading.style.marginBottom = isMobile ? 'var(--space-2)' : '0';
  welcomeHeading.style.fontSize = isMobile ? 'var(--font-size-xl)' : 'var(--font-size-3xl)';
  welcomeHeading.style.fontWeight = 'var(--font-bold)';
  welcomeHeading.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-accent))';
  welcomeHeading.style.WebkitBackgroundClip = 'text';
  welcomeHeading.style.WebkitTextFillColor = 'transparent';
  welcomeHeading.style.backgroundClip = 'text';
  welcomeHeading.style.textFillColor = 'transparent';
  
  // Status indicators container
  const statusContainer = document.createElement('div');
  statusContainer.style.display = 'flex';
  statusContainer.style.gap = 'var(--space-2)';
  statusContainer.style.marginTop = isMobile ? 'var(--space-2)' : '0';
  
  // Add bank connection status badge
  const bankStatusBadgePlaceholder = document.createElement('div');
  statusContainer.appendChild(bankStatusBadgePlaceholder);
  
  // Add status indicators to the header
  headerContainer.appendChild(welcomeHeading);
  headerContainer.appendChild(statusContainer);
  container.appendChild(headerContainer);
  
  // Asynchronously load the bank connection status
  try {
    const bankStatusBadge = await getBankConnectionStatusBadge(appState.user.id);
    // Replace the placeholder with the actual badge
    statusContainer.replaceChild(bankStatusBadge, bankStatusBadgePlaceholder);
  } catch (error) {
    console.error('Error loading bank connection status:', error);
  }
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
  
  // Create tabs for both finding and offering gigs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'gigs-tabs';
  tabsContainer.style.display = 'flex';
  tabsContainer.style.borderBottom = '1px solid #eee';
  tabsContainer.style.marginBottom = '24px';
  
  const tabs = [
    { id: 'find-gigs', label: 'Find Gig Opportunities' },
    { id: 'service-listings', label: 'Post Your Services' },
    { id: 'find-services', label: 'Find Local Services' }
  ];
  
  // Initialize the current gig tab if not set
  if (!appState.currentGigTab) {
    appState.currentGigTab = 'find-gigs';
  }
  
  tabs.forEach(tab => {
    const tabElement = document.createElement('button');
    tabElement.dataset.tabId = tab.id;
    tabElement.textContent = tab.label;
    tabElement.style.padding = '16px 24px';
    tabElement.style.backgroundColor = 'transparent';
    tabElement.style.border = 'none';
    tabElement.style.borderBottom = tab.id === appState.currentGigTab ? '3px solid #34A853' : '3px solid transparent';
    tabElement.style.color = tab.id === appState.currentGigTab ? '#34A853' : '#666';
    tabElement.style.fontWeight = tab.id === appState.currentGigTab ? 'bold' : 'normal';
    tabElement.style.fontSize = '16px';
    tabElement.style.cursor = 'pointer';
    tabElement.style.transition = 'all 0.2s';
    
    tabElement.addEventListener('mouseover', () => {
      if (tabElement.dataset.tabId !== appState.currentGigTab) {
        tabElement.style.color = '#333';
      }
    });
    
    tabElement.addEventListener('mouseout', () => {
      if (tabElement.dataset.tabId !== appState.currentGigTab) {
        tabElement.style.color = '#666';
      }
    });
    
    tabElement.addEventListener('click', () => {
      // Update active tab in appState
      appState.currentGigTab = tab.id;
      
      // Update tab styling
      document.querySelectorAll('.gigs-tabs button').forEach(t => {
        t.style.borderBottom = '3px solid transparent';
        t.style.color = '#666';
        t.style.fontWeight = 'normal';
      });
      
      tabElement.style.borderBottom = '3px solid #34A853';
      tabElement.style.color = '#34A853';
      tabElement.style.fontWeight = 'bold';
      
      // Render tab content
      renderGigsTabContent(tab.id, tabContentContainer);
    });
    
    tabsContainer.appendChild(tabElement);
  });
  
  container.appendChild(tabsContainer);
  
  // Tab content container
  const tabContentContainer = document.createElement('div');
  tabContentContainer.className = 'gigs-tab-content';
  container.appendChild(tabContentContainer);
  
  // Render the initial tab content
  renderGigsTabContent(appState.currentGigTab, tabContentContainer);
  
  return container;
}

/**
 * Render the content for each gig tab
 */
function renderGigsTabContent(tabId, container) {
  // Clear container
  container.innerHTML = '';
  
  switch (tabId) {
    case 'find-gigs':
      renderFindGigsTab(container);
      break;
    case 'service-listings':
      import('../service-listings.js').then(module => {
        module.renderServiceListingManager(container, appState);
      }).catch(error => {
        showErrorMessage(container, 'Failed to load service listings manager', error);
      });
      break;
    case 'find-services':
      import('../service-listings.js').then(module => {
        module.renderServiceFinder(container, appState);
      }).catch(error => {
        showErrorMessage(container, 'Failed to load service finder', error);
      });
      break;
  }
}

/**
 * Render the find gigs tab content
 */
function renderFindGigsTab(container) {
  const heading = document.createElement('h2');
  heading.textContent = 'Stackr Gigs';
  heading.style.marginBottom = '20px';
  container.appendChild(heading);
  
  const description = document.createElement('p');
  description.textContent = 'Find opportunities to earn extra income with these gig platforms and resources:';
  container.appendChild(description);
  
  // Loading state
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="loading-spinner" style="display: flex; justify-content: center; margin: 40px 0;">
      <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style>
        <g class="spinner_OSmW"><circle cx="12" cy="2.5" r="1.5" fill="#34A853"/><circle cx="16.5" cy="4" r="1.5" fill="#34A853" opacity=".8"/><circle cx="19.5" cy="7.5" r="1.5" fill="#34A853" opacity=".7"/><circle cx="20.5" cy="12" r="1.5" fill="#34A853" opacity=".6"/><circle cx="19.5" cy="16.5" r="1.5" fill="#34A853" opacity=".5"/><circle cx="16.5" cy="19.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="12" cy="20.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="7.5" cy="19.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="16.5" r="1.5" fill="#34A853" opacity=".3"/><circle cx="2.5" cy="12" r="1.5" fill="#34A853" opacity=".3"/><circle cx="4" cy="7.5" r="1.5" fill="#34A853" opacity=".4"/><circle cx="7.5" cy="4" r="1.5" fill="#34A853" opacity=".5"/></g>
      </svg>
    </div>
    <p style="text-align: center; color: #666;">Loading gig resources...</p>
  `;
  container.appendChild(loadingIndicator);
  
  // Dynamically import the gig-resources module
  import('../gig-resources.js').then(module => {
    // Remove loading indicator
    loadingIndicator.remove();
    
    // Get categories from the module
    const gigCategories = module.gigCategories;
    
    // Create category tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'category-tabs';
    tabsContainer.style.display = 'flex';
    tabsContainer.style.overflowX = 'auto';
    tabsContainer.style.padding = '10px 0';
    tabsContainer.style.marginBottom = '20px';
    
    // Add "All Categories" tab
    const allCategoriesTab = document.createElement('button');
    allCategoriesTab.textContent = 'All Categories';
    allCategoriesTab.className = 'active-tab';
    allCategoriesTab.style.padding = '8px 16px';
    allCategoriesTab.style.marginRight = '10px';
    allCategoriesTab.style.border = 'none';
    allCategoriesTab.style.borderRadius = '4px';
    allCategoriesTab.style.backgroundColor = '#34A853';
    allCategoriesTab.style.color = 'white';
    allCategoriesTab.style.fontWeight = 'bold';
    allCategoriesTab.style.cursor = 'pointer';
    allCategoriesTab.dataset.categoryId = 'all';
    tabsContainer.appendChild(allCategoriesTab);
    
    // Add tab for each category
    gigCategories.forEach(category => {
      const tab = document.createElement('button');
      tab.textContent = category.name;
      tab.style.padding = '8px 16px';
      tab.style.marginRight = '10px';
      tab.style.border = 'none';
      tab.style.borderRadius = '4px';
      tab.style.backgroundColor = '#f0f0f0';
      tab.style.color = '#333';
      tab.style.cursor = 'pointer';
      tab.dataset.categoryId = category.id;
      tabsContainer.appendChild(tab);
    });
    
    container.appendChild(tabsContainer);
    
    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'gig-content-container';
    container.appendChild(contentContainer);
    
    // Function to display all categories
    function displayAllCategories() {
      contentContainer.innerHTML = '';
      
      // Beginner-friendly platforms section
      const beginnerSection = document.createElement('div');
      beginnerSection.className = 'beginner-section';
      beginnerSection.style.marginBottom = '40px';
      
      const beginnerTitle = document.createElement('h3');
      beginnerTitle.textContent = 'Beginner-Friendly Platforms';
      beginnerTitle.style.fontSize = '20px';
      beginnerTitle.style.marginBottom = '16px';
      beginnerSection.appendChild(beginnerTitle);
      
      // Grid for beginner-friendly platforms
      const beginnerGrid = document.createElement('div');
      beginnerGrid.style.display = 'grid';
      beginnerGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      beginnerGrid.style.gap = '20px';
      
      const beginnerPlatforms = module.getBeginnerFriendlyPlatforms().slice(0, 6);
      beginnerPlatforms.forEach(platform => {
        beginnerGrid.appendChild(createPlatformCard(platform));
      });
      
      beginnerSection.appendChild(beginnerGrid);
      contentContainer.appendChild(beginnerSection);
      
      // Display each category with limited items
      gigCategories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.style.marginBottom = '40px';
        
        const sectionHeader = document.createElement('div');
        sectionHeader.style.display = 'flex';
        sectionHeader.style.justifyContent = 'space-between';
        sectionHeader.style.alignItems = 'center';
        sectionHeader.style.marginBottom = '16px';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.name;
        categoryTitle.style.fontSize = '20px';
        categoryTitle.style.margin = '0';
        sectionHeader.appendChild(categoryTitle);
        
        const viewAllLink = document.createElement('a');
        viewAllLink.textContent = 'View all';
        viewAllLink.href = '#';
        viewAllLink.style.color = '#34A853';
        viewAllLink.style.fontWeight = 'medium';
        viewAllLink.dataset.category = category.id;
        viewAllLink.addEventListener('click', (e) => {
          e.preventDefault();
          displayCategory(category.id);
          
          // Update active tab
          document.querySelectorAll('.category-tabs button').forEach(btn => {
            btn.style.backgroundColor = '#f0f0f0';
            btn.style.color = '#333';
            btn.className = '';
          });
          
          const categoryTab = document.querySelector(`.category-tabs button[data-category-id="${category.id}"]`);
          if (categoryTab) {
            categoryTab.style.backgroundColor = '#34A853';
            categoryTab.style.color = 'white';
            categoryTab.className = 'active-tab';
          }
        });
        sectionHeader.appendChild(viewAllLink);
        
        categorySection.appendChild(sectionHeader);
        
        const categoryDesc = document.createElement('p');
        categoryDesc.textContent = category.description;
        categoryDesc.style.marginBottom = '16px';
        categorySection.appendChild(categoryDesc);
        
        // Grid for platforms
        const platformsGrid = document.createElement('div');
        platformsGrid.style.display = 'grid';
        platformsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        platformsGrid.style.gap = '20px';
        
        category.platforms.slice(0, 3).forEach(platform => {
          platformsGrid.appendChild(createPlatformCard({...platform, category: category.name}));
        });
        
        categorySection.appendChild(platformsGrid);
        contentContainer.appendChild(categorySection);
      });
      
      // Add resources section
      const resourcesSection = document.createElement('div');
      resourcesSection.className = 'resources-section';
      resourcesSection.style.marginBottom = '40px';
      
      const resourcesTitle = document.createElement('h3');
      resourcesTitle.textContent = 'Learning Resources';
      resourcesTitle.style.fontSize = '20px';
      resourcesTitle.style.marginBottom = '16px';
      resourcesSection.appendChild(resourcesTitle);
      
      // Grid for resources
      const resourcesGrid = document.createElement('div');
      resourcesGrid.style.display = 'grid';
      resourcesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      resourcesGrid.style.gap = '20px';
      
      module.getAllGigResources().slice(0, 6).forEach(resource => {
        resourcesGrid.appendChild(createResourceCard(resource));
      });
      
      resourcesSection.appendChild(resourcesGrid);
      contentContainer.appendChild(resourcesSection);
    }
    
    // Function to display a specific category
    function displayCategory(categoryId) {
      const category = module.getGigCategoryById(categoryId);
      if (!category) return;
      
      contentContainer.innerHTML = '';
      
      const categoryHeader = document.createElement('div');
      categoryHeader.style.marginBottom = '20px';
      
      const categoryTitle = document.createElement('h3');
      categoryTitle.textContent = category.name;
      categoryTitle.style.fontSize = '20px';
      categoryTitle.style.marginBottom = '8px';
      categoryHeader.appendChild(categoryTitle);
      
      const categoryDesc = document.createElement('p');
      categoryDesc.textContent = category.description;
      categoryHeader.appendChild(categoryDesc);
      
      contentContainer.appendChild(categoryHeader);
      
      // Platforms section
      const platformsSection = document.createElement('div');
      platformsSection.style.marginBottom = '30px';
      
      const platformsTitle = document.createElement('h4');
      platformsTitle.textContent = 'Available Platforms';
      platformsTitle.style.fontSize = '18px';
      platformsTitle.style.marginBottom = '16px';
      platformsSection.appendChild(platformsTitle);
      
      // Grid for platforms
      const platformsGrid = document.createElement('div');
      platformsGrid.style.display = 'grid';
      platformsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
      platformsGrid.style.gap = '20px';
      
      category.platforms.forEach(platform => {
        platformsGrid.appendChild(createPlatformCard({...platform, category: category.name}));
      });
      
      platformsSection.appendChild(platformsGrid);
      contentContainer.appendChild(platformsSection);
      
      // Resources section (if available)
      if (category.resources && category.resources.length > 0) {
        const resourcesSection = document.createElement('div');
        
        const resourcesTitle = document.createElement('h4');
        resourcesTitle.textContent = 'Learning Resources';
        resourcesTitle.style.fontSize = '18px';
        resourcesTitle.style.marginBottom = '16px';
        resourcesSection.appendChild(resourcesTitle);
        
        // Grid for resources
        const resourcesGrid = document.createElement('div');
        resourcesGrid.style.display = 'grid';
        resourcesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        resourcesGrid.style.gap = '20px';
        
        category.resources.forEach(resource => {
          resourcesGrid.appendChild(createResourceCard({...resource, category: category.name}));
        });
        
        resourcesSection.appendChild(resourcesGrid);
        contentContainer.appendChild(resourcesSection);
      }
    }
    
    // Add event listeners to tabs
    tabsContainer.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        // Update active tab
        tabsContainer.querySelectorAll('button').forEach(btn => {
          btn.style.backgroundColor = '#f0f0f0';
          btn.style.color = '#333';
          btn.className = '';
        });
        
        e.target.style.backgroundColor = '#34A853';
        e.target.style.color = 'white';
        e.target.className = 'active-tab';
        
        // Display appropriate content
        const categoryId = e.target.dataset.categoryId;
        if (categoryId === 'all') {
          displayAllCategories();
        } else {
          displayCategory(categoryId);
        }
      }
    });
    
    // Initially display all categories
    displayAllCategories();
    
    // Add search functionality
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '24px';
    
    const searchForm = document.createElement('form');
    searchForm.style.display = 'flex';
    searchForm.style.position = 'relative';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for gig platforms...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '12px 16px';
    searchInput.style.paddingRight = '48px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #ccc';
    searchInput.style.fontSize = '16px';
    
    const searchButton = document.createElement('button');
    searchButton.type = 'submit';
    searchButton.style.position = 'absolute';
    searchButton.style.right = '12px';
    searchButton.style.top = '50%';
    searchButton.style.transform = 'translateY(-50%)';
    searchButton.style.background = 'none';
    searchButton.style.border = 'none';
    searchButton.style.cursor = 'pointer';
    searchButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    
    searchForm.appendChild(searchInput);
    searchForm.appendChild(searchButton);
    searchContainer.appendChild(searchForm);
    
    // Insert search at the top, below description
    container.insertBefore(searchContainer, container.childNodes[2]);
    
    // Handle search submission
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      
      if (query === '') return;
      
      // Reset tabs
      tabsContainer.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.color = '#333';
        btn.className = '';
      });
      
      // Display search results
      contentContainer.innerHTML = '';
      
      const resultsHeader = document.createElement('div');
      resultsHeader.style.marginBottom = '20px';
      
      const resultsTitle = document.createElement('h3');
      resultsTitle.textContent = `Search Results for "${query}"`;
      resultsTitle.style.fontSize = '20px';
      resultsTitle.style.marginBottom = '8px';
      resultsHeader.appendChild(resultsTitle);
      
      const results = module.searchGigPlatforms(query);
      
      const resultsCount = document.createElement('p');
      resultsCount.textContent = `Found ${results.length} platforms`;
      resultsHeader.appendChild(resultsCount);
      
      contentContainer.appendChild(resultsHeader);
      
      if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '40px 0';
        
        const noResultsIcon = document.createElement('div');
        noResultsIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
        noResultsIcon.style.marginBottom = '16px';
        noResults.appendChild(noResultsIcon);
        
        const noResultsTitle = document.createElement('h4');
        noResultsTitle.textContent = 'No results found';
        noResultsTitle.style.fontSize = '18px';
        noResultsTitle.style.marginBottom = '8px';
        noResults.appendChild(noResultsTitle);
        
        const noResultsText = document.createElement('p');
        noResultsText.textContent = 'Try different keywords or browse by category';
        noResultsText.style.color = '#666';
        noResults.appendChild(noResultsText);
        
        contentContainer.appendChild(noResults);
      } else {
        // Grid for results
        const resultsGrid = document.createElement('div');
        resultsGrid.style.display = 'grid';
        resultsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        resultsGrid.style.gap = '20px';
        
        results.forEach(platform => {
          resultsGrid.appendChild(createPlatformCard(platform));
        });
        
        contentContainer.appendChild(resultsGrid);
      }
    });
  }).catch(error => {
    // Remove loading indicator
    loadingIndicator.remove();
    
    // Show error message
    showErrorMessage(container, 'Failed to load gig resources', error);
  });
  
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
}

/**
 * Show error message in the container
 */
function showErrorMessage(container, title, error) {
  const errorMsg = document.createElement('div');
  errorMsg.style.textAlign = 'center';
  errorMsg.style.padding = '40px 20px';
  errorMsg.style.backgroundColor = '#ffebee';
  errorMsg.style.color = '#d32f2f';
  errorMsg.style.borderRadius = '8px';
  errorMsg.style.marginTop = '20px';
  
  const errorIcon = document.createElement('div');
  errorIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  errorMsg.appendChild(errorIcon);
  
  const errorTitle = document.createElement('h3');
  errorTitle.textContent = title;
  errorTitle.style.marginTop = '16px';
  errorMsg.appendChild(errorTitle);
  
  const errorDesc = document.createElement('p');
  errorDesc.textContent = `Error: ${error.message}. Please try again later.`;
  errorMsg.appendChild(errorDesc);
  
  const retryBtn = createButton('Retry', () => {
    window.location.reload();
  });
  errorMsg.appendChild(retryBtn);
  
  container.appendChild(errorMsg);
  console.error('Error:', error);
}

// Helper function to create platform cards
function createPlatformCard(platform) {
  const card = document.createElement('div');
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  
  // Hover effect
  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  });
  
  const cardContent = document.createElement('div');
  cardContent.style.padding = '20px';
  
  // Header with title and optional badge
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  header.style.marginBottom = '12px';
  
  const title = document.createElement('h4');
  title.textContent = platform.name;
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  title.style.color = '#34A853';
  header.appendChild(title);
  
  if (platform.beginner_friendly) {
    const badge = document.createElement('span');
    badge.textContent = 'Beginner Friendly';
    badge.style.fontSize = '11px';
    badge.style.padding = '4px 8px';
    badge.style.backgroundColor = '#e8f5e9';
    badge.style.color = '#2e7d32';
    badge.style.borderRadius = '12px';
    badge.style.fontWeight = 'medium';
    header.appendChild(badge);
  }
  
  cardContent.appendChild(header);
  
  // Category if available
  if (platform.category) {
    const category = document.createElement('div');
    category.textContent = platform.category;
    category.style.fontSize = '14px';
    category.style.color = '#666';
    category.style.marginBottom = '8px';
    cardContent.appendChild(category);
  }
  
  // Description
  const description = document.createElement('p');
  description.textContent = platform.description;
  description.style.marginBottom = '16px';
  description.style.color = '#333';
  cardContent.appendChild(description);
  
  // Button
  const button = document.createElement('a');
  button.href = platform.url;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.textContent = 'Visit Platform';
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.color = '#34A853';
  button.style.fontWeight = 'medium';
  button.style.textDecoration = 'none';
  
  const buttonIcon = document.createElement('span');
  buttonIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';
  buttonIcon.style.marginLeft = '4px';
  button.appendChild(buttonIcon);
  
  cardContent.appendChild(button);
  card.appendChild(cardContent);
  
  return card;
}

// Helper function to create resource cards
function createResourceCard(resource) {
  const card = document.createElement('div');
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.overflow = 'hidden';
  card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  
  // Hover effect
  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  });
  
  const cardContent = document.createElement('div');
  cardContent.style.padding = '20px';
  
  // Header with title and type badge
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  header.style.marginBottom = '12px';
  
  const title = document.createElement('h4');
  title.textContent = resource.title;
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = 'bold';
  title.style.color = '#4285F4';
  header.appendChild(title);
  
  // Type badge styling
  let badgeColor = '#e3f2fd';
  let textColor = '#1565c0';
  
  if (resource.type === 'article') {
    badgeColor = '#f3e5f5';
    textColor = '#6a1b9a';
  } else if (resource.type === 'course') {
    badgeColor = '#fff3e0';
    textColor = '#e65100';
  } else if (resource.type === 'video') {
    badgeColor = '#ffebee';
    textColor = '#c62828';
  }
  
  const typeBadge = document.createElement('span');
  typeBadge.textContent = resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
  typeBadge.style.fontSize = '11px';
  typeBadge.style.padding = '4px 8px';
  typeBadge.style.backgroundColor = badgeColor;
  typeBadge.style.color = textColor;
  typeBadge.style.borderRadius = '12px';
  typeBadge.style.fontWeight = 'medium';
  header.appendChild(typeBadge);
  
  cardContent.appendChild(header);
  
  // Category if available
  if (resource.category) {
    const category = document.createElement('div');
    category.textContent = resource.category;
    category.style.fontSize = '14px';
    category.style.color = '#666';
    category.style.marginBottom = '8px';
    cardContent.appendChild(category);
  }
  
  // Button
  const button = document.createElement('a');
  button.href = resource.url;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.textContent = 'View Resource';
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.color = '#4285F4';
  button.style.fontWeight = 'medium';
  button.style.textDecoration = 'none';
  button.style.marginTop = '16px';
  
  const buttonIcon = document.createElement('span');
  buttonIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';
  buttonIcon.style.marginLeft = '4px';
  button.appendChild(buttonIcon);
  
  cardContent.appendChild(button);
  card.appendChild(cardContent);
  
  return card;
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
  
  // Onboarding Reset Section
  const onboardingSection = document.createElement('div');
  onboardingSection.style.marginBottom = '20px';
  onboardingSection.style.padding = '15px';
  onboardingSection.style.border = '1px solid #e0e0e0';
  onboardingSection.style.borderRadius = '6px';
  onboardingSection.style.backgroundColor = '#fafafa';
  
  const onboardingTitle = document.createElement('h4');
  onboardingTitle.textContent = 'Onboarding Settings';
  onboardingTitle.style.marginTop = '0';
  onboardingTitle.style.marginBottom = '10px';
  onboardingSection.appendChild(onboardingTitle);
  
  const onboardingDescription = document.createElement('p');
  onboardingDescription.textContent = 'Reset your onboarding progress to go through the setup process again.';
  onboardingDescription.style.marginBottom = '15px';
  onboardingDescription.style.fontSize = '14px';
  onboardingSection.appendChild(onboardingDescription);
  
  const onboardingStatus = document.createElement('div');
  onboardingStatus.style.marginBottom = '15px';
  onboardingStatus.style.fontSize = '14px';
  
  // Get current onboarding status
  const onboardingComplete = localStorage.getItem('stackrOnboardingCompleted') === 'true';
  const currentStep = appState.user.onboardingStep || 'welcome';
  
  onboardingStatus.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <span style="font-weight: 500;">Current Status:</span>
      <span style="
        padding: 4px 8px; 
        border-radius: 4px; 
        background-color: ${onboardingComplete ? '#e6f7ed' : '#fff3e0'}; 
        color: ${onboardingComplete ? '#0d904f' : '#e65100'};
        font-weight: 500;
      ">
        ${onboardingComplete ? 'Completed' : 'In Progress'}
      </span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: 500;">Current Step:</span>
      <span style="font-family: monospace; color: #444;">${currentStep}</span>
    </div>
  `;
  
  onboardingSection.appendChild(onboardingStatus);
  
  const resetOnboardingBtn = createButton('Reset Onboarding', async () => {
    if (confirm('Are you sure you want to reset your onboarding progress? You will need to go through the setup process again.')) {
      // Clear local storage flag
      localStorage.removeItem('stackrOnboardingCompleted');
      
      try {
        // Reset onboarding step in API
        await import('../onboarding.js').then(module => {
          // Update the user's onboarding step
          module.updateOnboardingStep(appState.user.id, 'welcome')
            .then(() => {
              // Update local app state
              appState.user.onboardingStep = 'welcome';
              saveStateToStorage();
              
              // Show success message
              alert('Onboarding has been reset successfully. Navigate to the Dashboard to start the onboarding process again.');
              
              // Refresh the page
              renderApp();
            })
            .catch(error => {
              console.error('Failed to reset onboarding step:', error);
              alert('Failed to reset onboarding. Please try again.');
            });
        });
      } catch (error) {
        console.error('Error importing onboarding module:', error);
        alert('Failed to reset onboarding. Please try again.');
      }
    }
  }, '#4285F4', true);
  
  resetOnboardingBtn.style.width = '100%';
  resetOnboardingBtn.style.marginTop = '10px';
  
  onboardingSection.appendChild(resetOnboardingBtn);
  accountCard.appendChild(onboardingSection);
  
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
        // Dashboard is an async function, so we need to handle it with promises
        renderDashboardPage()
          .then(dashboardElement => {
            container.appendChild(dashboardElement);
            
            // Check if onboarding should be shown
            import('../onboarding.js').then(module => {
              // Check if user is new and needs onboarding
              if (appState.user && (!appState.user.onboardingStep || appState.user.onboardingStep !== 'complete')) {
                // Show the onboarding modal
                const onboardingModal = module.showOnboardingModal();
                if (onboardingModal) {
                  document.body.appendChild(onboardingModal);
                  console.log('Onboarding modal shown');
                }
              } else {
                console.log('User has completed onboarding or has onboarding step:', appState.user?.onboardingStep);
              }
            }).catch(error => {
              console.error('Error loading onboarding module:', error);
            });
          })
          .catch(error => {
            console.error('Error rendering dashboard:', error);
            container.appendChild(createErrorMessage('Failed to load dashboard. Please try again.'));
          });
        break;
      case 'income':
        // Use the futuristic income module with enhanced animations
        container.innerHTML = '<div class="loading-spinner">Loading income dashboard...</div>';
        
        // Make appState available globally so the income module can access it
        window.appState = appState;
        
        // Import our new futuristic income module
        import('../futuristic-income.js').then(module => {
          try {
            // Reset container first for clean rendering
            container.innerHTML = '';
            
            // Create animation container for smoother transition
            const animationContainer = document.createElement('div');
            animationContainer.className = 'fade-in-animation';
            animationContainer.style.opacity = '0';
            animationContainer.style.transform = 'translateY(20px)';
            animationContainer.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            
            // Get current user ID for rendering
            const userId = appState.user.id;
            
            // Render income page with futuristic UI
            const incomeElement = module.renderIncomePage(userId);
            
            if (incomeElement instanceof Node) {
              animationContainer.appendChild(incomeElement);
              container.appendChild(animationContainer);
              
              // Create ambient background animation effect
              const ambientBackground = document.createElement('div');
              ambientBackground.className = 'ambient-background';
              ambientBackground.style.position = 'absolute';
              ambientBackground.style.top = '0';
              ambientBackground.style.left = '0';
              ambientBackground.style.right = '0';
              ambientBackground.style.bottom = '0';
              ambientBackground.style.zIndex = '-10';
              ambientBackground.style.pointerEvents = 'none';
              ambientBackground.style.background = 'radial-gradient(circle at 15% 50%, rgba(79, 70, 229, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.1), transparent 25%)';
              container.appendChild(ambientBackground);
              
              // Trigger entrance animation after a brief delay
              setTimeout(() => {
                animationContainer.style.opacity = '1';
                animationContainer.style.transform = 'translateY(0)';
                
                // Add ambient animation
                const ambientStyle = document.createElement('style');
                ambientStyle.textContent = `
                  @keyframes ambientMove {
                    0% { background-position: 0% 0%; }
                    50% { background-position: 100% 100%; }
                    100% { background-position: 0% 0%; }
                  }
                  
                  .ambient-background {
                    animation: ambientMove 120s infinite ease-in-out;
                    background-size: 200% 200%;
                  }
                `;
                document.head.appendChild(ambientStyle);
                
                console.log('Futuristic income dashboard rendered');
              }, 100);
            } else {
              console.error('Income element is not a DOM Node:', incomeElement);
              container.appendChild(createErrorMessage('Error loading futuristic income dashboard'));
            }
          } catch (err) {
            console.error('Error rendering income page:', err);
            container.appendChild(createErrorMessage('Failed to load income dashboard'));
          }
        }).catch(error => {
          console.error('Error loading futuristic income module:', error);
          container.appendChild(createErrorMessage('Failed to load income dashboard'));
        });
        break;
      case 'expenses':
        container.appendChild(renderExpensesPage());
        break;
      case 'guardrails':
        // Import the Guardrails page module
        import('../guardrails.js').then(module => {
          container.appendChild(module.initGuardrailsPage(appState.user.id));
        }).catch(error => {
          console.error('Error loading guardrails module:', error);
          container.appendChild(createErrorMessage('Failed to load guardrails module'));
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
      case 'invoices':
        console.log("Invoices page case triggered in main.js");
        // Import the invoices page module
        import('../invoices.js').then(({renderInvoicesPage}) => {
          console.log("Invoices module imported successfully");
          // Clear container first for clean rendering
          container.innerHTML = '';
          // Create app container for the invoices page
          const appContainer = document.createElement('div');
          appContainer.id = 'app-container';
          container.appendChild(appContainer);
          console.log("Created app-container for invoices:", appContainer);
          // Render invoices in the container
          renderInvoicesPage('app-container');
        }).catch(error => {
          console.error('Error loading invoices module:', error);
          container.appendChild(createErrorMessage('Failed to load invoices module'));
        });
        break;
      case 'personal-financial-assessment':
        // Import the Personal Financial Assessment page module
        import('../personal-financial-assessment-page.js').then(module => {
          // Using async function as renderPersonalFinancialAssessmentPage returns a Promise
          (async () => {
            try {
              const assessmentPage = await module.renderPersonalFinancialAssessmentPage(appState.user.id);
              container.appendChild(assessmentPage);
            } catch (error) {
              console.error('Error rendering personal financial assessment page:', error);
              container.appendChild(createErrorMessage('Failed to load personal financial assessment data'));
            }
          })();
        }).catch(error => {
          console.error('Error loading personal financial assessment module:', error);
          container.appendChild(createErrorMessage('Failed to load personal financial assessment module'));
        });
        break;
        
      case 'aipersonalization':
        // Import the AI Personalization page module
        import('../ai-personalization.js').then(module => {
          console.log('AI Personalization module loaded successfully:', Object.keys(module));
          try {
            const aiPage = module.initAIPersonalizationPage(appState.user.id);
            console.log('AI Personalization page created successfully');
            if (aiPage && aiPage.nodeType) {
              container.appendChild(aiPage);
            } else {
              throw new Error('Invalid DOM element returned from AI Personalization module');
            }
          } catch (error) {
            console.error('Error rendering AI Personalization page:', error);
            container.appendChild(createErrorMessage('Error rendering AI Insights: ' + error.message));
          }
        }).catch(error => {
          console.error('Error loading AI Personalization module:', error);
          container.appendChild(createErrorMessage('Failed to load AI Insights module'));
        });
        break;
        
      case 'moneymentor':
        // Import the Money Mentor page module
        import('../money-mentor.js').then(async module => {
          console.log('Money Mentor module loaded successfully:', Object.keys(module));
          try {
            console.log('User ID being passed:', appState.user.id);
            // Using await since renderMoneyMentorPage is an async function
            const mentorPage = await module.renderMoneyMentorPage(appState.user.id);
            console.log('Mentor page created successfully');
            if (mentorPage && mentorPage.nodeType) {
              container.appendChild(mentorPage);
            } else {
              throw new Error('Invalid DOM element returned from Money Mentor module');
            }
          } catch (error) {
            console.error('Error rendering Money Mentor page:', error);
            container.appendChild(createErrorMessage('Error rendering Money Mentor: ' + error.message));
          }
        }).catch(error => {
          console.error('Error loading money mentor module:', error);
          container.appendChild(createErrorMessage('Failed to load Money Mentor. Please check your API keys and try again.'));
        });
        break;
        
      case 'blog':
        // Import the Blog page module
        import('../blog-page.js').then(module => {
          // Check if specific article is requested
          const urlParts = window.location.hash.split('/');
          if (urlParts.length > 1 && urlParts[0] === '#blog') {
            // Article view - urlParts[1] contains the slug
            const articleSlug = urlParts[1];
            const articlePage = module.renderArticlePage(articleSlug, appState.user.isAuthenticated);
            container.appendChild(articlePage);
          } else {
            // Blog listing view - pass authentication status
            const blogPage = module.renderBlogPage(appState.user.isAuthenticated);
            container.appendChild(blogPage);
          }
        }).catch(error => {
          console.error('Error loading blog module:', error);
          container.appendChild(createErrorMessage('Failed to load blog content.'));
        });
        break;
      case 'challenges':
        // Import the Savings Challenges page module (using the new fixed version)
        import('../challenges-page-new.js').then(module => {
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
        // Import the subscription sniper page module
        import('../subscription-sniper.js').then(module => {
          // Need to await the async function first
          module.renderSubscriptionSniperPage(appState.user.id)
            .then(pageElement => {
              container.appendChild(pageElement);
            })
            .catch(err => {
              console.error('Error rendering subscription sniper page:', err);
              container.appendChild(createErrorMessage('Failed to render subscription data'));
            });
        }).catch(error => {
          console.error('Error loading subscription sniper module:', error);
          container.appendChild(createErrorMessage('Failed to load subscription sniper module'));
        });
        break;
      case 'bankconnections':
        // Import the bank connections page module if needed
        import('../bank-connections.js').then(module => {
          // Check if the function is async (returns a promise)
          const result = module.renderBankConnectionsPage(appState.user.id);
          if (result instanceof Promise) {
            result
              .then(pageElement => {
                container.appendChild(pageElement);
              })
              .catch(err => {
                console.error('Error rendering bank connections page:', err);
                container.appendChild(createErrorMessage('Failed to load bank account connections'));
              });
          } else {
            // Handle synchronous return (directly append to container)
            container.appendChild(result);
          }
        }).catch(error => {
          console.error('Error loading bank connections module:', error);
          container.appendChild(createErrorMessage('Failed to load bank connections module'));
        });
        break;
      case 'subscriptions':
        // Import the subscriptions page module
        import('../subscriptions.js').then(module => {
          container.appendChild(module.renderSubscriptionsPage());
        }).catch(error => {
          console.error('Error loading subscriptions module:', error);
          container.appendChild(createErrorMessage('Failed to load subscriptions module'));
        });
        break;
      case 'settings':
        container.appendChild(renderSettingsPage());
        break;
      case 'membership':
        // Import the membership tiers page module
        import('../membership-tiers.js').then(module => {
          module.renderMembershipUpgradePage('app');
        }).catch(error => {
          console.error('Error loading membership module:', error);
          container.innerHTML = '<div class="error-message">Unable to load membership page. Please try again later.</div>';
        });
        break;
      case 'savingschallenges':
        // Import the savings challenges module
        import('../savings-challenges.js').then(module => {
          try {
            // The function expects a containerId, not a userId
            module.renderSavingsChallengesPage('app');
            console.log('Savings challenges page rendered successfully');
          } catch (err) {
            console.error('Error rendering savings challenges page:', err);
            container.appendChild(createErrorMessage('Failed to load savings challenges'));
          }
        }).catch(error => {
          console.error('Error loading savings challenges module:', error);
          container.appendChild(createErrorMessage('Failed to load savings challenges module'));
        });
        break;
      default:
        // Dashboard is an async function, so we need to handle it with promises
        renderDashboardPage()
          .then(dashboardElement => {
            container.appendChild(dashboardElement);
          })
          .catch(error => {
            console.error('Error rendering dashboard (default case):', error);
            container.appendChild(createErrorMessage('Failed to load page. Please try again.'));
          });
    }
  }
  
  // Initialize notification system for authenticated users
  if (appState.user && appState.user.isAuthenticated && 
      !['login', 'register', 'landing'].includes(appState.currentPage)) {
    
    try {
      // Create backup ID for safety
      const userId = appState.user.id || `user-${Date.now()}`;
      
      // Import and initialize notification system with error handling
      import('../notification-ui.js').then(module => {
        try {
          // Set up a safe version of the app state with all required properties
          const safeAppState = {
            ...appState,
            user: {
              ...appState.user,
              id: userId
            },
            userData: appState.userData || {}
          };
          
          // Initialize notification UI with safety wrapping
          module.initNotificationUI(safeAppState);
          
          // Financial summaries handling with try/catch
          try {
            import('../financial-summary.js').then(summaryModule => {
              try {
                // Check if it's time for weekly or monthly summary
                if (shouldGenerateWeeklySummary(userId)) {
                  const generateWeeklySummary = summaryModule.scheduleWeeklySummary(userId);
                  generateWeeklySummary();
                  
                  // Save last summary time
                  saveLastSummaryTime(userId, 'weekly');
                }
                
                if (shouldGenerateMonthlySummary(userId)) {
                  const generateMonthlySummary = summaryModule.scheduleMonthlySummary(userId);
                  generateMonthlySummary();
                  
                  // Save last summary time
                  saveLastSummaryTime(userId, 'monthly');
                }
              } catch (summaryError) {
                console.log('Financial summary generation error:', summaryError);
              }
            }).catch(error => {
              console.log('Financial summary module error:', error);
            });
          } catch (fsModuleError) {
            console.log('Financial summary module import error:', fsModuleError);
          }
          
          // Achievements handling with try/catch
          try {
            import('../achievement-service.js').then(achieveModule => {
              try {
                achieveModule.checkAchievements(userId, safeAppState.userData);
                achieveModule.updateLoginStreak(userId);
              } catch (achieveError) {
                console.log('Achievement checking error:', achieveError);
              }
            }).catch(error => {
              console.log('Achievement module error:', error);
            });
          } catch (achieveModuleError) {
            console.log('Achievement module import error:', achieveModuleError);
          }
          
          // Guardrails checking with try/catch
          try {
            if (safeAppState.userData && safeAppState.userData.spendingLimits &&
                Array.isArray(safeAppState.userData.spendingLimits) &&
                safeAppState.userData.spendingLimits.length > 0) {
              
              import('../guardrails-notifications.js').then(guardrailsModule => {
                try {
                  // Check all spending categories against limits
                  guardrailsModule.checkAllSpendingLimits(
                    userId, 
                    safeAppState.userData.spendingLimits
                  );
                } catch (guardError) {
                  console.log('Guardrails checking error:', guardError);
                }
              }).catch(error => {
                console.log('Guardrails module error:', error);
              });
            }
          } catch (guardrailsModuleError) {
            console.log('Guardrails module import error:', guardrailsModuleError);
          }
        } catch (notifError) {
          console.log('Notification initialization error:', notifError);
        }
      }).catch(error => {
        console.log('Notification UI module error:', error);
      });
    } catch (outerError) {
      console.log('Notification system setup error:', outerError);
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
          'personal-financial-assessment': 'psychology',
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
    const nonAuthRoutes = ['login', 'register', 'about', 'pricing', 'landing', 'blog'];
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

/**
 * Check if it's time to generate a weekly summary
 * @param {string} userId - User ID
 * @returns {boolean} - True if summary should be generated
 */
function shouldGenerateWeeklySummary(userId) {
  if (!userId) return false;
  
  try {
    const lastSummaryKey = `stackr_last_weekly_summary_${userId}`;
    const lastSummaryTime = localStorage.getItem(lastSummaryKey);
    
    if (!lastSummaryTime) {
      return true; // First time, generate summary
    }
    
    const lastTime = new Date(lastSummaryTime);
    const currentTime = new Date();
    
    // Check if it's been at least 6 days since the last summary
    const timeDiff = currentTime.getTime() - lastTime.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    return daysDiff >= 6;
  } catch (error) {
    console.error('Error checking weekly summary schedule:', error);
    return false;
  }
}

/**
 * Check if it's time to generate a monthly summary
 * @param {string} userId - User ID
 * @returns {boolean} - True if summary should be generated
 */
function shouldGenerateMonthlySummary(userId) {
  if (!userId) return false;
  
  try {
    const lastSummaryKey = `stackr_last_monthly_summary_${userId}`;
    const lastSummaryTime = localStorage.getItem(lastSummaryKey);
    
    if (!lastSummaryTime) {
      return true; // First time, generate summary
    }
    
    const lastTime = new Date(lastSummaryTime);
    const currentTime = new Date();
    
    // Check if we're in a new month compared to the last summary
    return (
      lastTime.getMonth() !== currentTime.getMonth() ||
      lastTime.getFullYear() !== currentTime.getFullYear()
    );
  } catch (error) {
    console.error('Error checking monthly summary schedule:', error);
    return false;
  }
}

/**
 * Save the timestamp of the last summary generation
 * @param {string} userId - User ID
 * @param {string} summaryType - Type of summary ('weekly' or 'monthly')
 */
function saveLastSummaryTime(userId, summaryType) {
  if (!userId || !summaryType) return;
  
  try {
    const summaryKey = `stackr_last_${summaryType}_summary_${userId}`;
    const currentTime = new Date().toISOString();
    localStorage.setItem(summaryKey, currentTime);
  } catch (error) {
    console.error(`Error saving ${summaryType} summary time:`, error);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Stackr Finance initializing...');
  
  // Load saved data
  loadStateFromStorage();
  
  // Check if user came through a referral link
  import('../auth.js').then(authModule => {
    if (typeof authModule.checkAndStoreReferralCode === 'function') {
      authModule.checkAndStoreReferralCode();
    }
  }).catch(err => {
    console.error('Error loading auth module for referral check:', err);
  });
  
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
  
  console.log('Stackr Finance loaded successfully!');
});

// Initialize the financial education mascot
function initFinancialMascot() {
  // Import and initialize the mascot
  import('../financial-mascot.js').then(module => {
    // Initialize the mascot when user is on a protected page
    const mascot = module.initMascot();
    
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
      'personal-financial-assessment-scorecard': 'psychology',
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
  }).catch(error => {
    console.error('Error initializing financial mascot:', error);
  });
}