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
  user: {
    id: 1, // Add a default user ID for API calls
    name: 'User',
    splitRatio: {
      needs: 40,
      investments: 30,
      savings: 30
    },
    // This simulates authenticated user
    isAuthenticated: false
  }
};

// Load data from localStorage if available
function loadStateFromStorage() {
  const savedState = localStorage.getItem('stackrGreenState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Merge with existing state
    appState.incomeEntries = parsedState.incomeEntries || [];
    if (parsedState.user) {
      appState.user.id = parsedState.user.id || 1; // Preserve user ID or use default
      appState.user.name = parsedState.user.name || 'User';
      appState.user.splitRatio = parsedState.user.splitRatio || { needs: 40, investments: 30, savings: 30 };
      appState.user.isAuthenticated = parsedState.user.isAuthenticated || false;
    }
    console.log('Data loaded from localStorage');
  }
}

// Save data to localStorage
function saveStateToStorage() {
  localStorage.setItem('stackrGreenState', JSON.stringify({
    incomeEntries: appState.incomeEntries,
    user: appState.user
  }));
  console.log('Data saved to localStorage');
}

// Router function
function navigateTo(page) {
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

// Create common layout elements
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
  
  formCard.appendChild(form);
  container.appendChild(formCard);
  
  // Income History Card
  const historyCard = document.createElement('div');
  historyCard.style.backgroundColor = '#f5f5f5';
  historyCard.style.borderRadius = '8px';
  historyCard.style.padding = '20px';
  historyCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  
  const historyHeading = document.createElement('h3');
  historyHeading.textContent = 'Income History';
  historyHeading.style.marginTop = '0';
  historyCard.appendChild(historyHeading);
  
  if (appState.incomeEntries.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No income entries yet. Add your first income above!';
    emptyMessage.style.fontStyle = 'italic';
    historyCard.appendChild(emptyMessage);
  } else {
    // Create table for income entries
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    
    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Description', 'Amount', 'Date', 'Source', 'Actions'];
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
    const sortedEntries = [...appState.incomeEntries].sort((a, b) => 
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
      
      const sourceCell = document.createElement('td');
      sourceCell.textContent = entry.source || '-';
      sourceCell.style.padding = '10px';
      sourceCell.style.borderBottom = '1px solid #ddd';
      row.appendChild(sourceCell);
      
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
        appState.incomeEntries = appState.incomeEntries.filter(item => item.id !== entry.id);
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
    
    const total = appState.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
    totalContainer.textContent = `Total Income: $${total.toFixed(2)}`;
    
    historyCard.appendChild(totalContainer);
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
  
  return container;
}

// Main render function
function renderApp() {
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = ''; // Clear previous content
  
  // Add responsive viewport classes to the body
  const width = window.innerWidth;
  document.body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
  
  // Standard breakpoints:
  // Mobile: < 640px
  // Tablet: 640px - 1023px
  // Desktop: >= 1024px
  if (width < 640) {
    document.body.classList.add('viewport-mobile');
    console.log('Viewport: mobile');
  } else if (width < 1024) {
    document.body.classList.add('viewport-tablet');
    console.log('Viewport: tablet');
  } else {
    document.body.classList.add('viewport-desktop');
    console.log('Viewport: desktop');
  }
  
  // Add responsive styles to root document
  const htmlRoot = document.documentElement;
  
  // Set responsive spacing variables
  if (width < 640) {
    // Mobile spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-4)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-4)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-6)');
  } else if (width < 1024) {
    // Tablet spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-6)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-5)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-8)');
  } else {
    // Desktop spacing adjustments
    htmlRoot.style.setProperty('--container-padding', 'var(--space-8)');
    htmlRoot.style.setProperty('--card-gap', 'var(--space-6)');
    htmlRoot.style.setProperty('--section-gap', 'var(--space-10)');
  }
  
  // Create application structure with responsive container
  const appContainer = document.createElement('div');
  appContainer.className = 'app-container';
  appContainer.style.display = 'flex';
  appContainer.style.flexDirection = 'column';
  appContainer.style.minHeight = '100vh'; // Full height
  
  // Build page structure
  const header = createHeader();
  appContainer.appendChild(header);
  
  // Create main content container with responsive padding
  const main = document.createElement('main');
  main.style.padding = width < 640 ? 'var(--space-4)' : 'var(--space-8) var(--space-6)';
  main.style.maxWidth = '1200px';
  main.style.width = '100%';
  main.style.margin = '0 auto';
  main.style.flex = '1'; // Takes up available space
  main.style.boxSizing = 'border-box';
  
  // Add page transition effects
  main.style.animation = 'fadeIn 0.3s ease-in-out';
  
  // Create and append a keyframe animation
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
  
  // Render different pages based on the current page state
  switch(appState.currentPage) {
    case 'dashboard':
      main.appendChild(renderDashboardPage());
      break;
    case 'income':
      main.appendChild(renderIncomePage());
      break;
    case 'gigs':
      main.appendChild(renderGigsPage());
      break;
    case 'affiliates':
      // Import the affiliates hub page module
      import('../affiliates-hub.js').then(module => {
        main.appendChild(module.renderAffiliateHub(appState.user.id));
      }).catch(error => {
        console.error('Error loading affiliates hub module:', error);
        main.appendChild(createErrorMessage('Failed to load affiliates hub module'));
      });
      break;
    case 'bankconnections':
      // Import the bank connections page module if needed
      import('../bank-connections.js').then(module => {
        main.appendChild(module.renderBankConnectionsPage(appState.user.id));
      }).catch(error => {
        console.error('Error loading bank connections module:', error);
        main.appendChild(createErrorMessage('Failed to load bank connections module'));
      });
      break;
    case 'settings':
      main.appendChild(renderSettingsPage());
      break;
    default:
      main.appendChild(renderDashboardPage());
  }
  
  appContainer.appendChild(main);
  
  // Add footer
  const footer = createFooter();
  appContainer.appendChild(footer);
  
  // Append the entire container to the root
  rootElement.appendChild(appContainer);
  
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
  
  // Load saved data
  loadStateFromStorage();
  
  // Check URL for initial navigation
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  appState.currentPage = hash;
  
  // Render the initial state
  renderApp();
  
  console.log('GREEN Firebase-free version loaded successfully!');
});