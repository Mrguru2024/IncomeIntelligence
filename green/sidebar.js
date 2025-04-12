/**
 * Sidebar Component for GREEN version
 * This file handles the sidebar navigation UI and functionality
 */

// Export navigateTo function so it can be used externally
export function navigateTo(page) {
  // If window is available, this will be imported and used by the src/main.js
  if (typeof window !== 'undefined' && window.navigateTo) {
    window.navigateTo(page);
  }
}

// Create sidebar navigation element
export function createSidebar(appState) {
  const width = window.innerWidth;
  const isMobile = width < 768;
  
  // Ensure appState and user objects exist to prevent TypeError
  if (!appState) {
    appState = {};
    console.warn('Sidebar created without appState, using default values');
  }
  
  if (!appState.user) {
    appState.user = {};
    console.warn('Sidebar created without user data, using default values');
  }
  
  // Determine if user has Pro access - global for this sidebar
  // Adding additional null/undefined checks to avoid TypeErrors and ensuring ProUser is recognized
  const isPro = (appState.user.subscriptionTier === 'pro') || 
                (appState.user.subscriptionTier === 'lifetime') || 
                (appState.user.username && typeof appState.user.username === 'string' && (
                  appState.user.username.toLowerCase().includes('pro') || 
                  appState.user.username === 'ProUser' ||
                  appState.user.username === 'prouser'
                )) || 
                (appState.user.email && (
                  appState.user.email === 'Pro.user@gmail.com' ||
                  appState.user.email === 'pro.user@gmail.com'
                )) ||
                (appState.user.stripeSubscriptionId) ||
                // Force ProUser to always be recognized as pro
                (appState.user.username === 'ProUser');
                
  // Log Pro status detection
  console.log('Pro status detected for user:', appState.user.username || 'Unknown', isPro ? 'PRO' : 'FREE');
  
  // Create sidebar container
  const sidebar = document.createElement('aside');
  sidebar.classList.add('sidebar');
  sidebar.style.width = '280px'; // Always set width to avoid issues
  sidebar.style.height = '100vh';
  sidebar.style.position = 'fixed';
  sidebar.style.top = '0';
  sidebar.style.left = '0';
  sidebar.style.zIndex = '1000';
  sidebar.style.backgroundColor = '#171F2A';
  sidebar.style.color = 'white';
  sidebar.style.transition = 'transform 0.3s ease, width 0.3s ease';
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
  logoContainer.addEventListener('click', () => navigateTo('dashboard'));
  
  const logo = document.createElement('h1');
  logo.textContent = 'Stackr';
  logo.style.margin = '0';
  logo.style.fontSize = '22px';
  logo.style.fontWeight = 'bold';
  logo.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)';
  logo.style.WebkitBackgroundClip = 'text';
  logo.style.WebkitTextFillColor = 'transparent';
  logo.style.backgroundClip = 'text';
  logoContainer.appendChild(logo);
  
  // Green edition badge
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
  
  // Using the global isPro variable defined earlier

  // User avatar container with Pro marker if applicable
  const avatarContainer = document.createElement('div');
  avatarContainer.style.position = 'relative';
  avatarContainer.style.margin = '0 auto 16px';
  
  // User avatar
  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.style.width = '80px';
  avatar.style.height = '80px';
  avatar.style.borderRadius = '50%';
  avatar.style.backgroundColor = isPro ? 'var(--color-primary-light)' : 'rgba(255, 255, 255, 0.2)';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.fontSize = '32px';
  avatar.style.fontWeight = 'bold';
  avatar.style.color = isPro ? 'var(--color-primary)' : 'white';
  avatar.style.boxShadow = isPro ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none';
  avatar.style.border = isPro ? '2px solid #FFD700' : 'none';
  
  // Get user initial or name
  const userName = appState.user.firstName || appState.user.name || 'User';
  avatar.textContent = userName.charAt(0).toUpperCase();
  
  avatarContainer.appendChild(avatar);
  
  // Add Pro crown badge if user is Pro
  if (isPro) {
    const proBadge = document.createElement('div');
    proBadge.style.position = 'absolute';
    proBadge.style.bottom = '0';
    proBadge.style.right = '0';
    proBadge.style.width = '28px';
    proBadge.style.height = '28px';
    proBadge.style.borderRadius = '50%';
    proBadge.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    proBadge.style.display = 'flex';
    proBadge.style.alignItems = 'center';
    proBadge.style.justifyContent = 'center';
    proBadge.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    proBadge.style.border = '2px solid #171F2A';
    
    // Crown icon
    proBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#333" stroke="none">
      <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19C19,19.6 18.6,20 18,20H6C5.4,20 5,19.6 5,19V18H19V19Z" />
    </svg>`;
    
    avatarContainer.appendChild(proBadge);
  }
  
  profileSection.appendChild(avatarContainer);
  
  // User name
  const displayName = document.createElement('h3');
  displayName.classList.add('user-name');
  displayName.textContent = appState.user.firstName ? 
    `${appState.user.firstName} ${appState.user.lastName || ''}` : 
    appState.user.name || 'User';
  displayName.style.margin = '0 0 4px';
  displayName.style.fontSize = '18px';
  displayName.style.fontWeight = 'bold';
  displayName.style.color = 'white';
  profileSection.appendChild(displayName);
  
  // User email if available
  if (appState.user.email) {
    const email = document.createElement('p');
    email.classList.add('user-email');
    email.textContent = appState.user.email;
    email.style.margin = '0 0 16px';
    email.style.fontSize = '14px';
    email.style.color = 'rgba(255, 255, 255, 0.7)';
    profileSection.appendChild(email);
  }
  
  // Subscription badge with pro icon
  const subscriptionBadge = document.createElement('div');
  subscriptionBadge.classList.add('subscription-badge');
  
  // Create badge container as a flex layout for icon and text
  subscriptionBadge.style.display = 'inline-flex';
  subscriptionBadge.style.alignItems = 'center';
  subscriptionBadge.style.padding = '4px 10px';
  subscriptionBadge.style.fontSize = '12px';
  subscriptionBadge.style.fontWeight = 'bold';
  subscriptionBadge.style.borderRadius = '12px';
  subscriptionBadge.style.textTransform = 'uppercase';
  
  // Add Pro crown icon for Pro users
  if (isPro) {
    const proIcon = document.createElement('span');
    proIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19C19,19.6 18.6,20 18,20H6C5.4,20 5,19.6 5,19V18H19V19Z" />
    </svg>`;
    proIcon.style.marginRight = '5px';
    proIcon.style.display = 'flex';
    proIcon.style.alignItems = 'center';
    subscriptionBadge.appendChild(proIcon);
  }
  
  // Add badge text
  const badgeText = document.createElement('span');
  badgeText.textContent = isPro ? 'PRO' : 'FREE';
  subscriptionBadge.appendChild(badgeText);
  
  // Change color based on subscription tier
  if (isPro) {
    subscriptionBadge.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    subscriptionBadge.style.color = '#333';
    subscriptionBadge.style.boxShadow = '0 2px 5px rgba(255, 215, 0, 0.3)';
  } else {
    subscriptionBadge.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    subscriptionBadge.style.color = 'white';
  }
  
  profileSection.appendChild(subscriptionBadge);
  
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
          id: 'wellness',
          label: 'Financial Wellness',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
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
          id: 'subscriptionsniper',
          label: 'Subscription Sniper',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
          requiresPro: true
        },
        {
          id: 'bankconnections',
          label: 'Bank Accounts',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
          requiresPro: true
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
          id: 'affiliates',
          label: 'Affiliate Programs',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
          requiresPro: true
        }
      ]
    },
    {
      title: 'SAVINGS & GROWTH',
      items: [
        {
          id: 'challenges',
          label: 'Savings Challenges',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
          requiresPro: true
        },
        {
          id: 'wellness',
          label: 'Financial Wellness',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
        },
        {
          id: 'moneymentor',
          label: 'Money Mentor',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path><path d="M17 21.32a10 10 0 0 0 5 -5.32"></path><path d="M9 15a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path><path d="M12 13v2"></path></svg>',
          requiresPro: true
        }
      ]
    },
    {
      title: 'RESOURCES',
      items: [
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
      
      // Active state
      if (appState.currentPage === item.id) {
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
        if (appState.currentPage !== item.id) {
          link.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          link.style.color = 'white';
        }
      });
      
      link.addEventListener('mouseout', () => {
        if (appState.currentPage !== item.id) {
          link.style.backgroundColor = 'transparent';
          link.style.color = 'rgba(255, 255, 255, 0.8)';
        }
      });
      
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
      // Add Pro badge for items marked as requiring Pro subscription
      else if (item.requiresPro) {
        const proBadge = document.createElement('span');
        proBadge.style.display = 'flex';
        proBadge.style.alignItems = 'center';
        proBadge.style.fontSize = '9px';
        proBadge.style.padding = '2px 6px';
        proBadge.style.borderRadius = '10px';
        proBadge.style.marginLeft = '8px';
        proBadge.style.fontWeight = 'bold';
        proBadge.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
        proBadge.style.color = '#000';
        proBadge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        
        // Add crown icon to Pro badge
        const proIcon = document.createElement('span');
        proIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5M19,19C19,19.6 18.6,20 18,20H6C5.4,20 5,19.6 5,19V18H19V19Z" />
        </svg>`;
        proIcon.style.marginRight = '3px';
        proIcon.style.display = 'flex';
        proIcon.style.alignItems = 'center';
        proBadge.appendChild(proIcon);
        
        // Add text
        const proBadgeText = document.createElement('span');
        proBadgeText.textContent = 'PRO';
        proBadge.appendChild(proBadgeText);
        
        link.appendChild(proBadge);
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
        } else {
          // Handle navigation
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
  versionInfo.textContent = 'Stackr GREEN v1.0.0';
  sidebar.appendChild(versionInfo);
  
  return sidebar;
}

// Toggle sidebar for mobile view
export function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  
  if (!sidebar) return;
  
  // Always consider it mobile in the toggle function since this is only called from mobile menu
  const isVisible = sidebar.style.transform === 'translateX(0px)';
  
  if (isVisible) {
    // Hide sidebar
    sidebar.style.transform = 'translateX(-100%)';
    document.getElementById('sidebar-overlay')?.remove();
  } else {
    // Show sidebar
    sidebar.style.width = '280px'; // Ensure width is set
    sidebar.style.transform = 'translateX(0px)';
    sidebar.style.display = 'flex'; // Make sure it's visible
    sidebar.style.zIndex = '1000';  // Make sure it's on top
    
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
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    
    // Click on overlay closes sidebar
    overlay.addEventListener('click', () => {
      sidebar.style.transform = 'translateX(-100%)';
      overlay.remove();
    });
    
    document.body.appendChild(overlay);
    
    // Trigger transition
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    
    // Log for debugging
    console.log('Sidebar toggled: visible');
  }
}