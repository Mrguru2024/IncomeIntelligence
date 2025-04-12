/**
 * Authentication Utilities for Stackr Finance GREEN Edition
 * This module provides functions to check authentication status and retrieve user data
 */

// Import application state
import { appState } from './src/main.js';

/**
 * Check if current user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
  if (!appState || !appState.user) {
    return false;
  }
  return appState.user.isAuthenticated === true;
}

/**
 * Get the current user object
 * @returns {Object|null} - User object or null if not authenticated
 */
export function getCurrentUser() {
  if (!isAuthenticated()) {
    return null;
  }
  return { ...appState.user }; // Return a copy to prevent direct mutation
}

/**
 * Get user subscription tier
 * @returns {string} - 'free', 'pro', or 'lifetime'
 */
export function getUserSubscriptionTier() {
  const user = getCurrentUser();
  if (!user) {
    return 'free';
  }
  return user.subscriptionTier || 'free';
}

/**
 * Check if user is a Pro or Lifetime subscriber
 * @returns {boolean} - True if Pro or Lifetime
 */
export function isPremiumUser() {
  const tier = getUserSubscriptionTier();
  return tier === 'pro' || tier === 'lifetime';
}

/**
 * Check if current user has admin privileges
 * @returns {boolean} - True if user has admin privileges
 */
export function isAdminUser() {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  return user.isAdmin === true;
}

/**
 * Get the user ID
 * @returns {number|null} - User ID or null if not authenticated
 */
export function getUserId() {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }
  return user.id;
}

/**
 * Get user display name (username or email)
 * @returns {string} - User display name
 */
export function getUserDisplayName() {
  const user = getCurrentUser();
  if (!user) {
    return 'Guest';
  }
  return user.username || user.email || 'User';
}

/**
 * Update the current user's data in appState
 * This function only updates the local state, not the backend
 * @param {Object} userData - Updated user properties
 */
export function updateUserData(userData) {
  if (!appState || !appState.user) {
    console.error('Cannot update user data: User not authenticated');
    return;
  }
  
  appState.user = {
    ...appState.user,
    ...userData
  };
  
  // Trigger state save if needed
  if (typeof window.saveStateToStorage === 'function') {
    window.saveStateToStorage();
  }
}