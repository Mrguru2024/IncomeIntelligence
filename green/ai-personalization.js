/**
 * AI Personalization Module
 * 
 * This module provides AI personalization features that:
 * 1. Recognize users by name and verify login status
 * 2. Check for subscription status
 * 3. Personalize messages and recommendations based on user profile
 * 4. Share profile data throughout the app while respecting privacy
 */

const AIPersonalization = {
  // Cache for user data to avoid repeated lookups
  _userCache: null,
  
  // Event listener attached status
  _listenersAttached: false,
  
  /**
   * Initialize the AI personalization module
   * Sets up listeners for profile changes
   */
  init: function() {
    // Only set up listeners once
    if (this._listenersAttached) return;
    
    // Listen for profile updates
    document.addEventListener('user-profile-updated', this._handleProfileUpdate.bind(this));
    document.addEventListener('userProfileUpdated', this._handleProfileUpdate.bind(this));
    
    // Attempt to get initial user info
    this.refreshUserData();
    
    this._listenersAttached = true;
    console.log('AI personalization module initialized');
  },
  
  /**
   * Handle profile update events
   * @param {CustomEvent} event - Profile update event
   */
  _handleProfileUpdate: function(event) {
    console.log('Profile update detected, refreshing AI personalization');
    this._userCache = event.detail || null;
  },
  
  /**
   * Refresh user data from various sources
   * @returns {Object|null} - User data or null if not available
   */
  refreshUserData: function() {
    // Try to get data from global UserProfile first
    if (window.UserProfile && typeof window.UserProfile.getCurrentProfile === 'function') {
      const profile = window.UserProfile.getCurrentProfile();
      if (profile) {
        this._userCache = profile;
        return profile;
      }
    }
    
    // Fall back to sidebar user data
    if (window.appState && window.appState.user) {
      this._userCache = {
        displayName: window.appState.user.username || 'user',
        subscriptionTier: window.appState.user.subscriptionTier || 'free',
        subscriptionStatus: window.appState.user.subscriptionStatus || 'active'
      };
      return this._userCache;
    }
    
    // Last resort: localStorage
    try {
      const userData = localStorage.getItem('stackrUser');
      if (userData) {
        const user = JSON.parse(userData);
        this._userCache = {
          displayName: user.username || 'user',
          subscriptionTier: user.subscriptionTier || 'free',
          subscriptionStatus: user.subscriptionStatus || 'active'
        };
        return this._userCache;
      }
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
    }
    
    return null;
  },
  
  /**
   * Check if user is logged in
   * @returns {boolean} - True if user is logged in
   */
  isLoggedIn: function() {
    // Refresh user data if needed
    if (!this._userCache) {
      this.refreshUserData();
    }
    
    return this._userCache !== null;
  },
  
  /**
   * Get user's name for personalization
   * @returns {string} - User's name or "there" if not found
   */
  getUserName: function() {
    // Refresh user data if needed
    if (!this._userCache) {
      this.refreshUserData();
    }
    
    if (this._userCache) {
      return this._userCache.displayName || 'there';
    }
    
    return 'there';
  },
  
  /**
   * Get user's subscription tier
   * @returns {string} - Subscription tier (free, basic, pro) or "free" if not found
   */
  getSubscriptionTier: function() {
    // Refresh user data if needed
    if (!this._userCache) {
      this.refreshUserData();
    }
    
    if (this._userCache) {
      return this._userCache.subscriptionTier || 'free';
    }
    
    return 'free';
  },
  
  /**
   * Check if user is a premium subscriber
   * @returns {boolean} - True if user has pro subscription
   */
  isPremiumUser: function() {
    return this.getSubscriptionTier() === 'pro';
  },
  
  /**
   * Generate a personalized greeting based on user profile
   * @returns {string} - Personalized greeting
   */
  getPersonalizedGreeting: function() {
    const userName = this.getUserName();
    const isPremium = this.isPremiumUser();
    
    // Get time of day for contextual greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    
    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 18) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }
    
    // Personalize based on subscription status
    if (isPremium) {
      return `${timeGreeting}, ${userName}! Welcome back to your Pro workspace.`;
    } else {
      return `${timeGreeting}, ${userName}!`;
    }
  },
  
  /**
   * Verify dashboard shows the correct user and subscription
   * @returns {Object} - Result of verification with success status and any issues
   */
  verifyDashboardUser: function() {
    const result = {
      success: true,
      issues: []
    };
    
    // First check if the user is logged in
    if (!this.isLoggedIn()) {
      result.success = false;
      result.issues.push('User is not logged in');
      return result;
    }
    
    // Check if the sidebar exists and has user info
    const sidebar = document.getElementById('sidebar-container');
    if (!sidebar) {
      result.success = false;
      result.issues.push('Sidebar not found in DOM');
      return result;
    }
    
    // Try to find user info display elements
    const usernameElements = sidebar.querySelectorAll('.user-name, .username, .user-display-name');
    const subscriptionElements = sidebar.querySelectorAll('.subscription-tier, .membership-tier, .user-tier');
    
    // Check username display
    let usernameVerified = false;
    const expectedName = this.getUserName();
    
    if (usernameElements.length > 0) {
      for (const element of usernameElements) {
        if (element.textContent.includes(expectedName)) {
          usernameVerified = true;
          break;
        }
      }
    }
    
    if (!usernameVerified) {
      result.success = false;
      result.issues.push(`Username verification failed: expected "${expectedName}" not found in sidebar`);
    }
    
    // Check subscription display
    let subscriptionVerified = false;
    const expectedTier = this.getSubscriptionTier();
    
    if (subscriptionElements.length > 0) {
      for (const element of subscriptionElements) {
        if (element.textContent.toLowerCase().includes(expectedTier.toLowerCase())) {
          subscriptionVerified = true;
          break;
        }
      }
    }
    
    if (!subscriptionVerified) {
      result.success = false;
      result.issues.push(`Subscription verification failed: expected "${expectedTier}" not found in sidebar`);
    }
    
    return result;
  },
  
  /**
   * Add AI personalization to any generated response or content
   * @param {string} content - Original content
   * @returns {string} - Personalized content
   */
  personalizeContent: function(content) {
    if (!content) return '';
    
    // Replace generic greeting placeholders with personalized ones
    const userName = this.getUserName();
    const greeting = this.getPersonalizedGreeting();
    
    let personalizedContent = content;
    
    // Replace placeholders with actual user data
    personalizedContent = personalizedContent
      .replace(/\{user\}/g, userName)
      .replace(/\{greeting\}/g, greeting)
      .replace(/\{subscription\}/g, this.getSubscriptionTier())
      .replace(/Hello user/gi, `Hello ${userName}`)
      .replace(/Hi user/gi, `Hi ${userName}`)
      .replace(/Hey user/gi, `Hey ${userName}`)
      .replace(/Welcome user/gi, `Welcome ${userName}`);
    
    return personalizedContent;
  }
};

// Initialize the module
AIPersonalization.init();

// Make available globally
window.AIPersonalization = AIPersonalization;

// Make available in modules registry
if (!window.modules) window.modules = {};
window.modules['ai-personalization'] = AIPersonalization;

// Export as module
export default AIPersonalization;