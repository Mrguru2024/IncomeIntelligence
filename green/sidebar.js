/**
 * Sidebar Component for GREEN version
 * This file handles the sidebar navigation UI and functionality
 */

// Import bank-related functions
import { hasBankConnections } from './bank-connections.js';
import { showUpgradeModal, renderMembershipUpgradePage } from './membership-tiers.js';

// Export navigateTo function so it can be used externally
export function navigateTo(page) {
  // Log navigation
  console.log("Navigation requested to page:", page);
  
  // If window is available, this will be imported and used by the src/main.js
  if (typeof window !== 'undefined' && window.navigateTo) {
    window.navigateTo(page);
  }
}

// Create sidebar navigation element
// Helper function to detect mobile view
function isMobileView() {
  // Special detection for Z Fold 4 and similar foldable devices
  const isFoldableDevice = /SM-F9/.test(navigator.userAgent) || 
                          window.innerWidth < 600;
  
  // Standard mobile detection with improved foldable support
  return window.innerWidth < 768 || isFoldableDevice;
}

// Detect if we're on a foldable device like Z Fold (in folded state)
function isFoldableDeviceFolded() {
  return /SM-F9/.test(navigator.userAgent) && window.innerWidth < 600;
}

// Export for use in other components
export const responsive = {
  isMobile: isMobileView,
  isFoldable: isFoldableDeviceFolded,
  addResizeListener: (callback) => {
    window.addEventListener('resize', () => {
      callback(isMobileView());
    });
  },
  removeResizeListener: (callback) => {
    window.removeEventListener('resize', callback);
  }
};

export function createSidebar(appState) {
  // Make sure we have the responsive object or fallback to direct browser check
  const isMobile = (typeof responsive !== 'undefined' && responsive.isMobile) 
    ? responsive.isMobile() 
    : (window.innerWidth < 768);
  
  // Create sidebar container
  const sidebar = document.createElement('aside');
  sidebar.classList.add('sidebar');
  sidebar.style.width = isMobile ? '0' : '280px';
  sidebar.style.height = '100vh';
  sidebar.style.position = 'fixed';
  sidebar.style.top = '0';
  sidebar.style.left = '0';
  sidebar.style.zIndex = '1000';
  sidebar.style.backgroundColor = '#171F2A';
  sidebar.style.color = 'white';
  sidebar.style.transition = 'all 0.3s ease';
  sidebar.style.boxShadow = '2px 0 10px rgba(0, 0, 0, 0.1)';
  sidebar.style.display = 'flex';
  sidebar.style.flexDirection = 'column';
  sidebar.style.overflowY = 'auto';
  sidebar.style.overflowX = 'hidden';
  
  // If mobile, initially hide the sidebar
  if (isMobile) {
    sidebar.style.transform = 'translateX(-100%)';
  }
  
  // Create sidebar header
  const sidebarHeader = document.createElement('div');
  sidebarHeader.classList.add('sidebar-header');
  sidebarHeader.style.display = 'flex';
  sidebarHeader.style.alignItems = 'center';
  sidebarHeader.style.justifyContent = 'space-between';
  sidebarHeader.style.padding = '20px 24px';
  sidebarHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
  
  // Logo and title
  const logoContainer = document.createElement('div');
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.cursor = 'pointer';
  logoContainer.style.marginRight = '8px';
  logoContainer.addEventListener('click', () => navigateTo('dashboard'));
  
  // Create logo using SVG from public folder
  const logoImg = document.createElement('img');
  logoImg.src = 'public/stackr-logo.svg'; // Updated path to be relative to green folder
  logoImg.alt = 'Stackr';
  logoImg.style.height = '48px'; // Increased to standard size
  logoImg.style.width = 'auto';
  logoImg.style.marginRight = '10px';
  logoContainer.appendChild(logoImg);
  
  // Removed GREEN badge as requested
  
  sidebarHeader.appendChild(logoContainer);
  
  // Close button for mobile view
  if (isMobile) {
    const closeButton = document.createElement('button');
    closeButton.id = 'sidebar-close';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '20px';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      sidebar.style.transform = 'translateX(-100%)';
      document.getElementById('sidebar-overlay')?.remove();
    });
    sidebarHeader.appendChild(closeButton);
  }
  
  sidebar.appendChild(sidebarHeader);
  
  // User profile section
  const profileSection = document.createElement('div');
  profileSection.classList.add('sidebar-profile');
  profileSection.style.padding = '24px';
  profileSection.style.textAlign = 'center';
  profileSection.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
  
  // User avatar
  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.style.width = '80px';
  avatar.style.height = '80px';
  avatar.style.borderRadius = '50%';
  avatar.style.backgroundColor = 'var(--color-primary-light)';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.margin = '0 auto 16px';
  avatar.style.fontSize = '32px';
  avatar.style.fontWeight = 'bold';
  avatar.style.color = 'var(--color-primary)';
  
  // Get user initial or name
  const userName = (appState?.user?.firstName || appState?.user?.name || 'User');
  avatar.textContent = userName.charAt(0).toUpperCase();
  
  profileSection.appendChild(avatar);
  
  // User name
  const displayName = document.createElement('h3');
  displayName.classList.add('user-name');
  displayName.textContent = appState?.user?.firstName ? 
    `${appState.user.firstName} ${appState?.user?.lastName || ''}` : 
    appState?.user?.name || 'User';
  displayName.style.margin = '0 0 4px';
  displayName.style.fontSize = '18px';
  displayName.style.fontWeight = 'bold';
  displayName.style.color = 'white';
  profileSection.appendChild(displayName);
  
  // User email if available
  if (appState?.user?.email) {
    const email = document.createElement('p');
    email.classList.add('user-email');
    email.textContent = appState.user.email;
    email.style.margin = '0 0 16px';
    email.style.fontSize = '14px';
    email.style.color = 'rgba(255, 255, 255, 0.7)';
    profileSection.appendChild(email);
  }
  
  // Subscription badge
  const subscriptionBadge = document.createElement('div');
  subscriptionBadge.classList.add('subscription-badge');
  
  // OVERRIDE: ALWAYS SET PRO TIER FOR DEMONSTRATING PREMIUM FEATURES
  let subscriptionTier = 'pro';
  
  // Output debug information to see what's in the user object
  console.log("User object in sidebar:", {
    // For demo purposes, supply default values for these properties
    username: appState?.user?.username || 'ProUser',
    subscriptionTier: appState?.user?.subscriptionTier || 'pro',
    subscriptionStatus: appState?.user?.subscriptionStatus || 'pro',
    subscription: appState?.user?.subscription || { type: 'pro' }
  });
  
  subscriptionBadge.textContent = subscriptionTier.toUpperCase();
  subscriptionBadge.style.display = 'inline-block';
  subscriptionBadge.style.padding = '4px 10px';
  subscriptionBadge.style.fontSize = '12px';
  subscriptionBadge.style.fontWeight = 'bold';
  subscriptionBadge.style.borderRadius = '12px';
  subscriptionBadge.style.textTransform = 'uppercase';
  
  console.log("Sidebar displaying subscription tier:", subscriptionTier);
  
  // Change color based on subscription tier
  if (subscriptionTier === 'pro') {
    subscriptionBadge.style.backgroundColor = '#FFD700';
    subscriptionBadge.style.color = '#333';
  } else if (subscriptionTier === 'lifetime') {
    subscriptionBadge.style.background = 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)';
    subscriptionBadge.style.color = 'white';
  } else {
    subscriptionBadge.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    subscriptionBadge.style.color = 'white';
  }
  
  profileSection.appendChild(subscriptionBadge);
  
  // Bank connection status badge (initially hidden, will be updated later)
  const bankStatusBadge = document.createElement('div');
  bankStatusBadge.classList.add('bank-status-badge');
  bankStatusBadge.style.display = 'inline-block';
  bankStatusBadge.style.padding = '4px 8px 4px 6px';
  bankStatusBadge.style.fontSize = '12px';
  bankStatusBadge.style.fontWeight = 'medium';
  bankStatusBadge.style.borderRadius = '12px';
  bankStatusBadge.style.marginTop = '10px';
  bankStatusBadge.style.marginLeft = '4px';
  bankStatusBadge.style.marginRight = '4px';
  bankStatusBadge.style.display = 'flex';
  bankStatusBadge.style.alignItems = 'center';
  bankStatusBadge.style.justifyContent = 'center';
  bankStatusBadge.style.gap = '4px';
  
  // Initially set to loading state
  bankStatusBadge.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  bankStatusBadge.style.color = 'rgba(255, 255, 255, 0.7)';
  bankStatusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> <span>Checking Bank Status...</span>';
  
  profileSection.appendChild(bankStatusBadge);
  
  // Check bank connection status and update badge
  if (appState?.user?.id) {
    hasBankConnections(appState.user.id)
      .then(hasConnections => {
        if (hasConnections) {
          bankStatusBadge.style.backgroundColor = 'rgba(46, 125, 50, 0.2)';
          bankStatusBadge.style.color = '#4CAF50';
          bankStatusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Bank Connected</span>';
        } else {
          bankStatusBadge.style.backgroundColor = 'rgba(245, 124, 0, 0.2)';
          bankStatusBadge.style.color = '#F57C00';
          bankStatusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>No Bank Connected</span>';
        }
      })
      .catch(error => {
        bankStatusBadge.style.backgroundColor = 'rgba(198, 40, 40, 0.2)';
        bankStatusBadge.style.color = '#E53935';
        bankStatusBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>Connection Error</span>';
        console.error('Error checking bank status:', error);
      });
  }
  
  // Profile edit button
  const editProfileButton = document.createElement('button');
  editProfileButton.classList.add('edit-profile-button');
  editProfileButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit Profile';
  editProfileButton.style.background = 'transparent';
  editProfileButton.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  editProfileButton.style.color = 'white';
  editProfileButton.style.padding = '8px 12px';
  editProfileButton.style.borderRadius = '4px';
  editProfileButton.style.fontSize = '12px';
  editProfileButton.style.cursor = 'pointer';
  editProfileButton.style.marginTop = '16px';
  editProfileButton.style.display = 'flex';
  editProfileButton.style.alignItems = 'center';
  editProfileButton.style.justifyContent = 'center';
  editProfileButton.style.gap = '6px';
  editProfileButton.style.transition = 'all 0.2s ease';
  
  editProfileButton.addEventListener('mouseover', () => {
    editProfileButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  });
  
  editProfileButton.addEventListener('mouseout', () => {
    editProfileButton.style.backgroundColor = 'transparent';
  });
  
  editProfileButton.addEventListener('click', () => {
    navigateTo('settings');
  });
  
  profileSection.appendChild(editProfileButton);
  sidebar.appendChild(profileSection);
  
  // Navigation menu
  const navMenu = document.createElement('nav');
  navMenu.classList.add('sidebar-menu');
  navMenu.style.padding = '16px 0';
  navMenu.style.flex = '1';
  
  // Menu sections
  const menuSections = [
    {
      title: 'DASHBOARD',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>'
        },
        {
          id: 'onboarding',
          label: 'Setup Wizard',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
          highlight: true
        },
        {
          id: 'personal-financial-assessment',
          label: 'Personal Financial Assessment',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
        },
        {
          id: 'quote-generator',
          label: 'Quote Generator',
          badge: 'NEW',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path><line x1="16" y1="8" x2="16" y2="8"></line><line x1="20" y1="8" x2="20" y2="8"></line><line x1="16" y1="12" x2="16" y2="12"></line><line x1="20" y1="12" x2="20" y2="12"></line><line x1="16" y1="16" x2="16" y2="16"></line><line x1="20" y1="16" x2="20" y2="16"></line><path d="M16 1l4 4-4 4"></path></svg>'
        }
      ]
    },
    {
      title: 'INCOME & EXPENSES',
      items: [
        {
          id: 'income',
          label: 'Income Tracking',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
        },
        {
          id: 'expenses',
          label: 'Expenses',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>'
        },
        {
          id: 'guardrails',
          label: 'Guardrails',
          badge: 'NEW',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
        },
        {
          id: 'savingschallenges',
          label: 'Savings Challenges',
          badge: 'NEW',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
        },
        {
          id: 'subscriptionsniper',
          label: 'Subscription Sniper',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
        },
        {
          id: 'bankconnections',
          label: 'Bank Accounts',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>'
        }
      ]
    },
    {
      title: 'INCOME GENERATION',
      items: [
        {
          id: 'gigs',
          label: 'Stackr Gigs',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>'
        },
        {
          id: 'invoices',
          label: 'Invoices',
          badge: 'NEW',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
        },
        {
          id: 'affiliates',
          label: 'Affiliate Program',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
        }
      ]
    },
    {
      title: 'SAVINGS & GROWTH',
      items: [
        {
          id: 'personal-financial-assessment',
          label: 'Personal Financial Assessment',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
        },
        {
          id: 'moneymentor',
          label: 'Money Mentor',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path><path d="M17 21.32a10 10 0 0 0 5 -5.32"></path><path d="M9 15a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path><path d="M12 13v2"></path></svg>',
          badge: 'Pro'
        }
      ]
    },
    {
      title: 'RESOURCES',
      items: [
        {
          id: 'aipersonalization',
          label: 'AI Insights',
          badge: 'NEW',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
        },
        {
          id: 'blog',
          label: 'Financial Blog',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
        }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
        },
        {
          id: 'membership',
          label: 'Membership',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
          badge: 'PRO',
          highlight: true
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
        }
      ]
    }
  ];
  
  // Create menu sections
  menuSections.forEach(section => {
    // Section title
    const sectionTitle = document.createElement('h4');
    sectionTitle.classList.add('menu-section-title');
    sectionTitle.textContent = section.title;
    sectionTitle.style.padding = '0 24px';
    sectionTitle.style.margin = '16px 0 8px';
    sectionTitle.style.fontSize = '11px';
    sectionTitle.style.fontWeight = 'bold';
    sectionTitle.style.color = 'rgba(255, 255, 255, 0.5)';
    sectionTitle.style.letterSpacing = '1px';
    navMenu.appendChild(sectionTitle);
    
    // Section items
    const itemsList = document.createElement('ul');
    itemsList.style.listStyle = 'none';
    itemsList.style.padding = '0';
    itemsList.style.margin = '0';
    
    section.items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.style.margin = '2px 0';
      
      const link = document.createElement('a');
      link.href = `#${item.id}`;
      link.style.display = 'flex';
      link.style.alignItems = 'center';
      link.style.padding = '12px 24px';
      link.style.textDecoration = 'none';
      link.style.color = 'rgba(255, 255, 255, 0.8)';
      link.style.transition = 'all 0.2s ease';
      link.style.fontSize = '14px';
      link.style.position = 'relative';
      
      // We'll use the click handler added at line ~595
      
      // Active state
      if (appState?.currentPage === item.id) {
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        link.style.color = 'white';
        link.style.fontWeight = 'bold';
        
        // Active indicator
        const activeIndicator = document.createElement('div');
        activeIndicator.style.position = 'absolute';
        activeIndicator.style.left = '0';
        activeIndicator.style.top = '0';
        activeIndicator.style.width = '4px';
        activeIndicator.style.height = '100%';
        activeIndicator.style.backgroundColor = 'var(--color-primary)';
        activeIndicator.style.borderTopRightRadius = '2px';
        activeIndicator.style.borderBottomRightRadius = '2px';
        link.appendChild(activeIndicator);
      }
      
      // Hover effects
      link.addEventListener('mouseover', () => {
        if (appState?.currentPage !== item.id) {
          link.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          link.style.color = 'white';
        }
      });
      
      link.addEventListener('mouseout', () => {
        if (appState?.currentPage !== item.id) {
          link.style.backgroundColor = 'transparent';
          link.style.color = 'rgba(255, 255, 255, 0.8)';
        }
      });
      
      // Standard render for all menu items (icon and label always rendered)
      // Icon
      const icon = document.createElement('span');
      icon.classList.add('menu-icon');
      icon.innerHTML = item.icon;
      icon.style.marginRight = '12px';
      icon.style.display = 'flex';
      icon.style.alignItems = 'center';
      link.appendChild(icon);
      
      // Label
      const label = document.createElement('span');
      label.textContent = item.label;
      link.appendChild(label);
      
      // If there's a custom status indicator for items like bank connections
      if (item.id === 'bankconnections' && appState?.user?.id) {
        // Add a simple status indicator dot
        const statusDot = document.createElement('span');
        statusDot.style.display = 'inline-block';
        statusDot.style.width = '8px';
        statusDot.style.height = '8px';
        statusDot.style.borderRadius = '50%';
        statusDot.style.backgroundColor = '#9e9e9e'; // Default gray
        statusDot.style.marginLeft = '8px';
        link.appendChild(statusDot);
        
        // Update the status dot color based on connection status
        hasBankConnections(appState.user.id)
          .then(hasConnections => {
            statusDot.style.backgroundColor = hasConnections ? '#4CAF50' : '#F57C00';
          })
          .catch(() => {
            statusDot.style.backgroundColor = '#E53935'; // Red for error
          });
      }
      
      // Special styling for the Onboarding Setup Wizard
      if (item.id === 'onboarding') {
        // Add pulsing animation for the setup wizard
        link.style.backgroundColor = 'rgba(255, 193, 7, 0.15)';
        link.style.border = '1px solid rgba(255, 193, 7, 0.3)';
        link.style.borderRadius = '6px';
        link.style.margin = '0 12px';
        link.style.width = 'calc(100% - 24px)';
        link.style.padding = '12px';
        link.style.color = 'white';
        
        // Create animation for the background
        const keyframes = document.createElement('style');
        keyframes.textContent = `
          @keyframes pulseBackground {
            0% { background-color: rgba(255, 193, 7, 0.15); }
            50% { background-color: rgba(255, 193, 7, 0.3); }
            100% { background-color: rgba(255, 193, 7, 0.15); }
          }
        `;
        document.head.appendChild(keyframes);
        
        // Apply the animation
        link.style.animation = 'pulseBackground 2s infinite ease-in-out';
        
        // Add a "Setup" badge
        const setupBadge = document.createElement('span');
        setupBadge.textContent = 'Setup';
        setupBadge.style.fontSize = '9px';
        setupBadge.style.padding = '2px 6px';
        setupBadge.style.borderRadius = '10px';
        setupBadge.style.marginLeft = '8px';
        setupBadge.style.fontWeight = 'bold';
        setupBadge.style.backgroundColor = '#FFC107';
        setupBadge.style.color = '#000';
        link.appendChild(setupBadge);
      }

      // Badge (if present)
      if (item.badge) {
        const badge = document.createElement('span');
        badge.textContent = item.badge;
        badge.style.fontSize = '9px';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '10px';
        badge.style.marginLeft = '8px';
        badge.style.fontWeight = 'bold';
        
        // Pro badge styling
        if (item.badge === 'Pro') {
          badge.style.background = 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)';
          badge.style.color = 'white';
        } 
        // New badge styling
        else if (item.badge === 'New') {
          badge.style.backgroundColor = '#4CAF50';
          badge.style.color = 'white';
        }
        // Default badge styling
        else {
          badge.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          badge.style.color = 'white';
        }
        
        link.appendChild(badge);
      }
      
      // Handle navigation or logout
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (item.id === 'logout') {
          // Handle logout
          import('../login.js').then(module => {
            module.logout();
          }).catch(error => {
            console.error('Failed to logout:', error);
          });
        } else if (item.id === 'membership') {
          // Render the membership tiers page
          const appElement = document.getElementById('app');
          if (appElement) {
            appElement.innerHTML = '';
            renderMembershipUpgradePage('app');
          }
        } else if (item.id === 'onboarding') {
          // Special handling for onboarding - ensure we reset onboarding state to the beginning
          // so the user sees the first step when clicking the menu item
          console.log('User clicked onboarding menu item - starting onboarding flow');
          
          // Reset onboarding step in local storage to ensure fresh start
          try {
            localStorage.setItem('stackrOnboardingStep', 'welcome');
            // Update the user object in localStorage if it exists
            const userData = localStorage.getItem('stackrUser');
            if (userData) {
              const user = JSON.parse(userData);
              user.onboardingStep = 'welcome';
              localStorage.setItem('stackrUser', JSON.stringify(user));
            }
            // Update app state
            if (window.appState && window.appState.user) {
              window.appState.user.onboardingStep = 'welcome';
            }
          } catch (e) {
            console.error('Failed to reset onboarding state:', e);
          }
          
          // Navigate to onboarding page
          navigateTo('onboarding');
          
          // If mobile, close sidebar
          if (isMobile) {
            sidebar.style.transform = 'translateX(-100%)';
            document.getElementById('sidebar-overlay')?.remove();
          }
        } else {
          // Handle navigation for other items
          navigateTo(item.id);
          
          // If mobile, close sidebar
          if (isMobile) {
            sidebar.style.transform = 'translateX(-100%)';
            document.getElementById('sidebar-overlay')?.remove();
          }
        }
      });
      
      listItem.appendChild(link);
      itemsList.appendChild(listItem);
    });
    
    navMenu.appendChild(itemsList);
  });
  
  sidebar.appendChild(navMenu);
  
  // Version info at bottom
  const versionInfo = document.createElement('div');
  versionInfo.classList.add('version-info');
  versionInfo.style.padding = '16px 24px';
  versionInfo.style.fontSize = '12px';
  versionInfo.style.color = 'rgba(255, 255, 255, 0.5)';
  versionInfo.style.textAlign = 'center';
  versionInfo.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
  versionInfo.textContent = 'Stackr v1.0.0';
  sidebar.appendChild(versionInfo);
  
  return sidebar;
}

// Toggle sidebar for mobile view
export function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  
  // Debug logging for mobile detection
  // Add fallback for responsive.isMobile
  const checkMobile = () => (typeof responsive !== 'undefined' && responsive.isMobile) 
    ? responsive.isMobile() 
    : (window.innerWidth < 768);
  
  console.log("Viewport:", checkMobile() ? "mobile" : "desktop");
  
  // Add fallback for responsive.isFoldable
  const checkFoldable = () => (typeof responsive !== 'undefined' && responsive.isFoldable) 
    ? responsive.isFoldable() 
    : (/SM-F9/.test(navigator.userAgent) && window.innerWidth < 600);
    
  if (checkFoldable()) {
    console.log("Detected: Foldable device (closed)");
  }
  
  if (!sidebar) {
    console.error("Sidebar element not found. Creating new sidebar.");
    const appState = window.appState || { user: { subscriptionStatus: 'pro' } };
    const newSidebar = createSidebar(appState);
    document.body.appendChild(newSidebar);
    setTimeout(() => toggleSidebar(), 50); // Call again with new sidebar after a small delay
    return;
  }
  
  // Using the checkMobile and checkFoldable functions defined above
  const isMobile = checkMobile();
  const isFoldable = checkFoldable();
  
  // Adjust width specifically for foldable devices with dynamic calculation
  if (isFoldable) {
    // For foldable devices, calculate width based on screen width
    // This makes it responsive even in different fold states
    const screenWidth = window.innerWidth;
    const idealWidth = Math.min(screenWidth * 0.85, 250); // 85% of screen width, max 250px
    console.log(`Foldable device detected: screen width ${screenWidth}px, setting sidebar width to ${idealWidth}px`);
    sidebar.style.width = `${idealWidth}px`; // Dynamic width for foldable devices
  } else if (isMobile) {
    sidebar.style.width = '280px';
  }
  
  if (isMobile) {
    // Check if sidebar is currently visible
    const isVisible = sidebar.style.transform === 'translateX(0px)' || 
                     sidebar.style.transform === 'translateX(0)' || 
                     sidebar.style.transform === '';
    
    if (isVisible) {
      // Hide sidebar
      sidebar.style.transform = 'translateX(-100%)';
      // Ensure sidebar remains in the DOM but hidden
      sidebar.style.visibility = 'hidden';
      
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        // Remove overlay after fade animation
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 300);
      }
    } else {
      // Show sidebar - make sure it's visible before transforming
      sidebar.style.visibility = 'visible';
      sidebar.style.transform = 'translateX(0)';
      
      // Ensure sidebar is in front on Z Fold devices
      sidebar.style.zIndex = '1000';
      
      // Create overlay with fade-in effect
      let overlay = document.getElementById('sidebar-overlay');
      
      // Only create a new overlay if one doesn't exist
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', () => {
          sidebar.style.transform = 'translateX(-100%)';
          overlay.style.opacity = '0';
          setTimeout(() => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          }, 300);
        });
        
        // Add swipe gesture to close sidebar
        overlay.addEventListener('touchstart', (e) => {
          const touchStartX = e.changedTouches[0].screenX;
          
          const handleTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const SWIPE_THRESHOLD = 70;
            
            // Left swipe to close
            if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
              sidebar.style.transform = 'translateX(-100%)';
              overlay.style.opacity = '0';
              setTimeout(() => {
                if (overlay.parentNode) {
                  overlay.parentNode.removeChild(overlay);
                }
              }, 300);
            }
            
            // Remove listeners after use
            overlay.removeEventListener('touchend', handleTouchEnd);
          };
          
          overlay.addEventListener('touchend', handleTouchEnd);
        }, { passive: true });
        
        document.body.appendChild(overlay);
      } else {
        // If overlay exists but is hidden, show it again
        overlay.style.display = 'block';
      }
      
      // Force reflow then set opacity to trigger transition
      setTimeout(() => overlay.style.opacity = '1', 10);
    }
  }
}

export function renderSidebar(appState) {
  // Remove existing sidebar if it exists
  const existingSidebar = document.querySelector('.sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }
  
  // Remove existing overlay if it exists
  const existingOverlay = document.getElementById('sidebar-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create and append new sidebar
  const sidebar = createSidebar(appState);
  document.body.appendChild(sidebar);
  
  // For mobile view, prepare for overlay but don't show it yet
  // Create checkMobile function if it doesn't exist in this scope
  const localCheckMobile = () => (typeof responsive !== 'undefined' && responsive.isMobile) 
    ? responsive.isMobile() 
    : (window.innerWidth < 768);
    
  if (localCheckMobile()) {
    const overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    
    overlay.addEventListener('click', () => {
      sidebar.style.transform = 'translateX(-100%)';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    });
    
    // Add swipe gesture handling
    overlay.addEventListener('touchstart', (e) => {
      const touchStartX = e.changedTouches[0].screenX;
      
      const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const SWIPE_THRESHOLD = 70;
        
        // Left swipe to close
        if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
          sidebar.style.transform = 'translateX(-100%)';
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.style.display = 'none';
          }, 300);
        }
        
        // Remove listeners after use
        overlay.removeEventListener('touchend', handleTouchEnd);
      };
      
      overlay.addEventListener('touchend', handleTouchEnd);
    }, { passive: true });
    
    document.body.appendChild(overlay);
  }
  
  // Add resize listener to handle responsive layout changes
  // Create safe wrapper for responsive.addResizeListener
  const safeAddResizeListener = (callback) => {
    if (typeof responsive !== 'undefined' && responsive.addResizeListener) {
      responsive.addResizeListener(callback);
    } else {
      // Fallback implementation if responsive isn't available
      window.addEventListener('resize', () => {
        callback(window.innerWidth < 768);
      });
    }
  };
  
  safeAddResizeListener((isMobileView) => {
    if (!isMobileView) {
      // Reset sidebar for desktop view
      sidebar.style.width = '280px';
      sidebar.style.transform = '';
      
      // Remove overlay if it exists
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }
    } else {
      // Ensure proper mobile view
      sidebar.style.width = '280px';
      if (sidebar.style.transform !== 'translateX(0px)' && sidebar.style.transform !== 'translateX(0)') {
        sidebar.style.transform = 'translateX(-100%)';
      }
    }
  });
  
  return sidebar;
}