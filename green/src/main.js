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
  const header = document.createElement('header');
  header.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  header.style.color = 'white';
  header.style.padding = '20px';
  header.style.boxShadow = 'var(--shadow-md)';
  
  // Create top section with logo and user info
  const topSection = document.createElement('div');
  topSection.style.display = 'flex';
  topSection.style.justifyContent = 'space-between';
  topSection.style.alignItems = 'center';
  topSection.style.marginBottom = '16px';
  
  // Logo container with gradient effect
  const logoContainer = document.createElement('div');
  logoContainer.style.cursor = 'pointer';
  logoContainer.addEventListener('click', () => navigateTo('dashboard'));
  
  const logo = document.createElement('h1');
  logo.textContent = 'Stackr Finance';
  logo.style.margin = '0';
  logo.style.fontSize = 'var(--font-size-2xl)';
  logo.style.fontWeight = 'var(--font-bold)';
  logoContainer.appendChild(logo);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'GREEN Edition';
  subtitle.style.margin = '4px 0 0 0';
  subtitle.style.fontSize = 'var(--font-size-sm)';
  subtitle.style.opacity = '0.9';
  logoContainer.appendChild(subtitle);
  
  topSection.appendChild(logoContainer);
  
  // User profile button
  const userButton = document.createElement('button');
  userButton.style.background = 'rgba(255, 255, 255, 0.2)';
  userButton.style.border = 'none';
  userButton.style.color = 'white';
  userButton.style.padding = '8px 16px';
  userButton.style.borderRadius = 'var(--radius-full)';
  userButton.style.cursor = 'pointer';
  userButton.style.display = 'flex';
  userButton.style.alignItems = 'center';
  userButton.style.gap = '8px';
  userButton.style.fontSize = 'var(--font-size-sm)';
  userButton.style.transition = 'all var(--transition-fast) ease';
  userButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path></svg>
    <span>${appState.user.name}</span>
  `;
  userButton.addEventListener('mouseover', () => {
    userButton.style.background = 'rgba(255, 255, 255, 0.3)';
  });
  userButton.addEventListener('mouseout', () => {
    userButton.style.background = 'rgba(255, 255, 255, 0.2)';
  });
  userButton.addEventListener('click', () => navigateTo('settings'));
  
  topSection.appendChild(userButton);
  header.appendChild(topSection);
  
  // Create modern navigation
  const nav = document.createElement('nav');
  nav.style.display = 'flex';
  nav.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  nav.style.borderRadius = 'var(--radius-lg)';
  nav.style.overflow = 'hidden';
  
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
    
    nav.appendChild(link);
  });
  
  header.appendChild(nav);
  
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
  const container = document.createElement('div');
  
  const welcomeHeading = document.createElement('h2');
  welcomeHeading.textContent = `Welcome to your dashboard, ${appState.user.name}!`;
  welcomeHeading.style.marginBottom = '20px';
  container.appendChild(welcomeHeading);
  
  // Income summary card
  const stats = calculateIncomeStats();
  const incomeSummary = document.createElement('div');
  
  const totalIncomeHeading = document.createElement('h3');
  totalIncomeHeading.textContent = `Total Income: $${stats.total.toFixed(2)}`;
  totalIncomeHeading.style.color = '#34A853';
  incomeSummary.appendChild(totalIncomeHeading);
  
  // Allocations list
  const allocations = document.createElement('ul');
  allocations.style.listStyleType = 'none';
  allocations.style.padding = '0';
  
  const needsItem = document.createElement('li');
  needsItem.innerHTML = `<strong>Needs (${appState.user.splitRatio.needs}%):</strong> $${stats.needs}`;
  needsItem.style.marginBottom = '10px';
  allocations.appendChild(needsItem);
  
  const investmentsItem = document.createElement('li');
  investmentsItem.innerHTML = `<strong>Investments (${appState.user.splitRatio.investments}%):</strong> $${stats.investments}`;
  investmentsItem.style.marginBottom = '10px';
  allocations.appendChild(investmentsItem);
  
  const savingsItem = document.createElement('li');
  savingsItem.innerHTML = `<strong>Savings (${appState.user.splitRatio.savings}%):</strong> $${stats.savings}`;
  allocations.appendChild(savingsItem);
  
  incomeSummary.appendChild(allocations);
  
  const incomeCard = createCard('Income Summary', incomeSummary);
  container.appendChild(incomeCard);
  
  // Split ratio visualization card
  const splitVisual = createSplitVisualization(appState.user.splitRatio);
  const splitCard = createCard('Stackr Split', splitVisual);
  container.appendChild(splitCard);
  
  // Quick actions
  const actionsContainer = document.createElement('div');
  actionsContainer.style.display = 'flex';
  actionsContainer.style.flexWrap = 'wrap';
  actionsContainer.style.gap = '10px';
  actionsContainer.style.marginTop = '20px';
  
  const addIncomeBtn = createButton('Add Income', () => navigateTo('income'), '#34A853');
  actionsContainer.appendChild(addIncomeBtn);
  
  const viewGigsBtn = createButton('Find Gigs', () => navigateTo('gigs'), '#4285F4');
  actionsContainer.appendChild(viewGigsBtn);
  
  const settingsBtn = createButton('Adjust Split', () => navigateTo('settings'), '#FBBC05');
  actionsContainer.appendChild(settingsBtn);
  
  container.appendChild(actionsContainer);
  
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
  const root = document.getElementById('root');
  root.innerHTML = ''; // Clear previous content
  
  // Build page structure
  const header = createHeader();
  root.appendChild(header);
  
  // Create main content container
  const main = document.createElement('main');
  main.style.padding = '40px 20px';
  main.style.maxWidth = '1000px';
  main.style.margin = '0 auto';
  
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
    case 'settings':
      main.appendChild(renderSettingsPage());
      break;
    default:
      main.appendChild(renderDashboardPage());
  }
  
  root.appendChild(main);
  
  // Add footer
  const footer = createFooter();
  root.appendChild(footer);
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