/**
 * Sidebar component for Stackr Finance
 * This module creates and manages the sidebar navigation.
 */

import { appState } from './src/main.js';

// Create and return the sidebar element
export function renderSidebar() {
  return createSidebar(appState);
}

// Create and return the sidebar element
export function createSidebar(appState) {
  try {
    // Default sidebar config if appState is not provided
    if (!appState) {
      console.warn('Sidebar created without appState, using default values');
      appState = {
        currentPage: 'dashboard',
        user: { 
          isAuthenticated: true,
          username: 'User',
          subscription: { tier: 'free' }
        }
      };
    }
    
    if (!appState.user) {
      console.warn('Sidebar created without user data, using default values');
      appState.user = { 
        isAuthenticated: true,
        username: 'User',
        subscription: { tier: 'free' }
      };
    }
    
    // Check if user is Pro for premium features
    const isPro = appState.user.subscription && 
                 (appState.user.subscription.tier === 'pro' || 
                  appState.user.subscription.tier === 'lifetime');
    
    console.log('Pro status detected for user:', appState.user.username, isPro ? 'PRO' : 'FREE');
    
    // Create sidebar container
    const sidebar = document.createElement('aside');
    sidebar.className = 'stackr-sidebar';
    sidebar.style.transition = 'width 0.3s ease';
    sidebar.style.position = 'relative';
    sidebar.style.width = '250px';
    sidebar.style.height = '100%';
    sidebar.style.overflowX = 'hidden';
    
    // Set data attribute for collapsed state
    sidebar.setAttribute('data-collapsed', 'false');
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    `;
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '20px';
    toggleButton.style.right = '-12px';
    toggleButton.style.zIndex = '100';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.width = '24px';
    toggleButton.style.height = '24px';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.backgroundColor = 'var(--color-primary)';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Add event listener to toggle button
    toggleButton.addEventListener('click', () => {
      const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
      
      if (isCollapsed) {
        // Expand
        sidebar.style.width = '250px';
        sidebar.setAttribute('data-collapsed', 'false');
        toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        `;
        
        // Show text labels
        const menuTexts = sidebar.querySelectorAll('.menu-text');
        menuTexts.forEach(text => {
          text.style.display = 'inline';
        });
        
        // Show logo text
        const logoText = sidebar.querySelector('.logo-text');
        if (logoText) logoText.style.display = 'inline';
        
        // Show user section text
        const userTexts = sidebar.querySelectorAll('.user-text');
        userTexts.forEach(text => {
          text.style.display = 'block';
        });
      } else {
        // Collapse
        sidebar.style.width = '60px';
        sidebar.setAttribute('data-collapsed', 'true');
        toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
        
        // Hide text labels
        const menuTexts = sidebar.querySelectorAll('.menu-text');
        menuTexts.forEach(text => {
          text.style.display = 'none';
        });
        
        // Hide logo text
        const logoText = sidebar.querySelector('.logo-text');
        if (logoText) logoText.style.display = 'none';
        
        // Hide user section text
        const userTexts = sidebar.querySelectorAll('.user-text');
        userTexts.forEach(text => {
          text.style.display = 'none';
        });
      }
    });
    
    sidebar.appendChild(toggleButton);
    
    // Create logo section
    const logoSection = document.createElement('div');
    logoSection.className = 'sidebar-logo';
    logoSection.innerHTML = `
      <div style="font-size: 1.5rem; font-weight: bold; padding: 20px 16px; display: flex; align-items: center;">
        <span style="color: var(--color-primary);">S</span>
        <span class="logo-text" style="margin-left: 4px;">tack Finance</span>
      </div>
    `;
    
    // Create navigation section
    const navSection = document.createElement('nav');
    navSection.className = 'sidebar-nav';
    navSection.style.padding = '8px';
    
    // Define menu items
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { id: 'income', label: 'Income', icon: 'trending-up' },
      { id: 'expenses', label: 'Expenses', icon: 'credit-card' },
      { id: 'savings', label: 'Savings', icon: 'piggy-bank', pro: false },
      { id: 'moneymentor', label: 'Money Mentor', icon: 'message-circle', pro: true },
      { id: 'subscriptionsniper', label: 'Subscription Sniper', icon: 'scissors', pro: true },
      { id: 'bankconnections', label: 'Bank Connections', icon: 'credit-card', pro: true },
      { divider: true },
      { id: 'export', label: 'Export Data', icon: 'download' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ];
    
    // Create menu items
    menuItems.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div');
        divider.style.height = '1px';
        divider.style.backgroundColor = 'var(--color-border, #e5e7eb)';
        divider.style.margin = '12px 0';
        navSection.appendChild(divider);
        return;
      }
      
      const menuItem = document.createElement('a');
      menuItem.href = `#${item.id}`;
      menuItem.className = `sidebar-menu-item ${appState.currentPage === item.id ? 'active' : ''}`;
      menuItem.style.display = 'flex';
      menuItem.style.alignItems = 'center';
      menuItem.style.padding = '10px 12px';
      menuItem.style.borderRadius = 'var(--radius-md, 8px)';
      menuItem.style.textDecoration = 'none';
      menuItem.style.color = 'var(--color-text, #1f2937)';
      menuItem.style.marginBottom = '4px';
      menuItem.style.transition = 'background-color 0.2s';
      
      // Apply active styles
      if (appState.currentPage === item.id) {
        menuItem.style.backgroundColor = 'var(--color-primary, #34A853)';
        menuItem.style.color = 'white';
      } else {
        menuItem.style.backgroundColor = 'transparent';
        menuItem.addEventListener('mouseover', () => {
          menuItem.style.backgroundColor = 'var(--color-bg-secondary, #f5f5f5)';
        });
        
        menuItem.addEventListener('mouseout', () => {
          menuItem.style.backgroundColor = 'transparent';
        });
      }
      
      // Simplified icon rendering as text
      const iconSpan = document.createElement('span');
      iconSpan.style.marginRight = '10px';
      iconSpan.style.fontSize = '20px';
      iconSpan.style.display = 'inline-flex';
      iconSpan.style.alignItems = 'center';
      iconSpan.style.justifyContent = 'center';
      iconSpan.style.width = '24px';
      
      // Simple icon representation based on name
      switch (item.icon) {
        case 'grid':
          iconSpan.textContent = '▦';
          break;
        case 'trending-up':
          iconSpan.textContent = '↗';
          break;
        case 'credit-card':
          iconSpan.textContent = '💳';
          break;
        case 'piggy-bank':
          iconSpan.textContent = '🐷';
          break;
        case 'message-circle':
          iconSpan.textContent = '💬';
          break;
        case 'scissors':
          iconSpan.textContent = '✂️';
          break;
        case 'settings':
          iconSpan.textContent = '⚙️';
          break;
        case 'download':
          iconSpan.textContent = '⬇️';
          break;
        default:
          iconSpan.textContent = '•';
      }
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'menu-text';
      labelSpan.textContent = item.label;
      
      // Add PRO badge if feature is premium and user is not pro
      if (item.pro && !isPro) {
        const proBadge = document.createElement('span');
        proBadge.textContent = 'PRO';
        proBadge.style.marginLeft = 'auto';
        proBadge.style.fontSize = '10px';
        proBadge.style.fontWeight = 'bold';
        proBadge.style.padding = '2px 6px';
        proBadge.style.borderRadius = '9999px';
        proBadge.style.backgroundColor = 'var(--color-tertiary, #F2994A)';
        proBadge.style.color = 'white';
        menuItem.appendChild(proBadge);
      }
      
      menuItem.appendChild(iconSpan);
      menuItem.appendChild(labelSpan);
      navSection.appendChild(menuItem);
    });
    
    // Create user section at bottom
    const userSection = document.createElement('div');
    userSection.className = 'sidebar-user';
    userSection.style.borderTop = '1px solid var(--color-border, #e5e7eb)';
    userSection.style.marginTop = 'auto';
    userSection.style.padding = '16px';
    userSection.style.marginTop = '16px';
    
    // Display username or placeholder
    const username = appState.user?.username || 'Guest';
    const subscriptionTier = appState.user?.subscription?.tier || 'free';
    
    userSection.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: var(--color-primary, #34A853); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
          ${username.charAt(0).toUpperCase()}
        </div>
        <div style="margin-left: 12px;">
          <div style="font-weight: 500;">${username}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary, #4b5563);">
            ${subscriptionTier === 'free' ? 'Free Plan' : subscriptionTier === 'pro' ? 'Pro Plan' : 'Lifetime Plan'}
          </div>
        </div>
      </div>
    `;
    
    // Assemble the sidebar
    sidebar.appendChild(logoSection);
    sidebar.appendChild(navSection);
    sidebar.appendChild(userSection);
    
    return sidebar;
  } catch (error) {
    console.error('Error creating sidebar:', error);
    
    // Return basic fallback sidebar
    const fallbackSidebar = document.createElement('aside');
    fallbackSidebar.innerHTML = '<div style="padding: 20px;">Stackr Finance</div>';
    return fallbackSidebar;
  }
}