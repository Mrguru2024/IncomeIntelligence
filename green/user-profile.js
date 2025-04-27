/**
 * User Profile Module
 * Handles loading, saving, and managing user profile data
 */

// Default profile template
const DEFAULT_PROFILE = {
  displayName: '',
  email: '',
  phone: '',
  location: '',
  businessName: '',
  industry: '',
  experienceLevel: 'intermediate',
  targetMargin: 30,
  servicePreferences: [],
  businessGoals: [],
  businessChallenges: [],
  splitRatio: {
    needs: 40,
    investments: 30,
    savings: 30
  },
  lastUpdated: new Date().toISOString()
};

// Create a UserProfile module object
const UserProfile = {};

/**
 * Initialize user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
UserProfile.initUserProfile = async function(userId) {
  if (!userId) {
    console.error('Cannot initialize profile: No user ID provided');
    return null;
  }
  
  try {
    // Load existing profile or create new one
    let profile = await UserProfile.loadUserProfile(userId);
    
    if (!profile) {
      profile = { ...DEFAULT_PROFILE, userId };
      await UserProfile.saveUserProfile(profile);
    }
    
    return profile;
  } catch (error) {
    console.error('Error initializing user profile:', error);
    return null;
  }
}

/**
 * Load user profile from storage
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
UserProfile.loadUserProfile = async function(userId) {
  if (!userId) {
    console.error('Cannot load profile: No user ID provided');
    return null;
  }
  
  try {
    // First try to get from local storage
    const profileKey = `stackrUserProfile_${userId}`;
    const storedProfile = localStorage.getItem(profileKey);
    
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
    
    // If not found in local storage, try to get from API
    // Note: In a real app, this would be an API call to fetch from a database
    // For now, we'll return null and let the initUserProfile function create a new profile
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Save user profile to storage
 * @param {Object} profile - User profile data
 * @returns {Promise<boolean>} Success status
 */
UserProfile.saveUserProfile = async function(profile) {
  if (!profile || !profile.userId) {
    console.error('Cannot save profile: No user ID in profile data');
    return false;
  }
  
  try {
    // Update lastUpdated timestamp
    profile.lastUpdated = new Date().toISOString();
    
    // Save to local storage
    const profileKey = `stackrUserProfile_${profile.userId}`;
    localStorage.setItem(profileKey, JSON.stringify(profile));
    
    // In a real app, this would also save to a database via API call
    
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

/**
 * Update user profile with new data
 * @param {Object} profileData - New profile data
 * @returns {Promise<Object|null>} Updated profile or null if failed
 */
UserProfile.updateUserProfile = async function(profileData) {
  if (!profileData || !profileData.userId) {
    console.error('Cannot update profile: No user ID in profile data');
    return null;
  }
  
  try {
    // Load existing profile
    const currentProfile = await UserProfile.loadUserProfile(profileData.userId);
    
    if (!currentProfile) {
      console.error('Cannot update profile: Profile not found');
      return null;
    }
    
    // Merge current profile with new data
    const updatedProfile = {
      ...currentProfile,
      ...profileData,
      // Ensure nested objects are properly merged
      splitRatio: {
        ...currentProfile.splitRatio,
        ...profileData.splitRatio
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Save updated profile
    const success = await UserProfile.saveUserProfile(updatedProfile);
    
    if (success) {
      return updatedProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

/**
 * Get user's current ID
 * @returns {string|null} User ID or null if not found
 */
UserProfile.getCurrentUserId = function() {
  // Try to get from window.appState first
  if (window.appState && window.appState.user && window.appState.user.id) {
    return window.appState.user.id;
  }
  
  // Fall back to localStorage
  try {
    const userData = localStorage.getItem('stackrUser');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
  } catch (error) {
    console.error('Error getting current user ID:', error);
  }
  
  return null;
}

/**
 * Check if the current user is a service provider
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is a service provider
 */
UserProfile.isServiceProvider = async function(userId) {
  if (!userId) {
    return false;
  }
  
  try {
    const profile = await UserProfile.loadUserProfile(userId);
    
    if (!profile) {
      return false;
    }
    
    // Check if user has business name and industry set
    return Boolean(profile.businessName && profile.industry);
  } catch (error) {
    console.error('Error checking if user is service provider:', error);
    return false;
  }
}

/**
 * Get user basic info
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User basic info or null if not found
 */
UserProfile.getUserBasicInfo = async function(userId) {
  if (!userId) {
    return null;
  }
  
  try {
    const profile = await UserProfile.loadUserProfile(userId);
    
    if (!profile) {
      return null;
    }
    
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      businessName: profile.businessName,
      location: profile.location,
      experienceLevel: profile.experienceLevel
    };
  } catch (error) {
    console.error('Error getting user basic info:', error);
    return null;
  }
}

/**
 * Get current user profile with synchronous access
 * Uses cached profile data for immediate access
 * @returns {Object|null} User profile or null if not available
 */
let cachedProfile = null;

UserProfile.getCurrentProfile = function() {
  return cachedProfile;
}

/**
 * Load and cache the current user profile
 * @returns {Promise<Object|null>} User profile or null if error
 */
UserProfile.loadCurrentUserProfile = async function() {
  try {
    const userId = UserProfile.getCurrentUserId();
    if (!userId) return null;
    
    const profile = await UserProfile.loadUserProfile(userId);
    if (profile) {
      cachedProfile = profile;
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Error loading current user profile:', error);
    return null;
  }
}

/**
 * Personalize quote data based on user profile
 * @param {Object} quoteData - Original quote data
 * @returns {Object} Personalized quote data
 */
UserProfile.personalizeQuote = function(quoteData) {
  // If no cached profile, return original data
  if (!cachedProfile) return quoteData;
  
  // Create a copy to avoid modifying the original
  const personalizedData = { ...quoteData };
  
  // Apply user profile settings if they exist
  if (cachedProfile.experienceLevel) {
    personalizedData.experienceLevel = cachedProfile.experienceLevel;
  }
  
  if (cachedProfile.targetMargin) {
    personalizedData.targetMargin = cachedProfile.targetMargin;
  }
  
  if (cachedProfile.location && !personalizedData.location) {
    personalizedData.location = cachedProfile.location;
  }
  
  // Apply industry-specific adjustments if available
  if (cachedProfile.industry) {
    // Adjust material costs based on industry knowledge
    if (personalizedData.materialsCost > 0) {
      const industryFactors = {
        'construction': 1.1,   // 10% higher materials for construction
        'automotive': 1.05,    // 5% higher for automotive
        'beauty': 0.95,        // 5% lower for beauty
        'technology': 1.2,     // 20% higher for technology
        'healthcare': 1.15     // 15% higher for healthcare
      };
      
      const factor = industryFactors[cachedProfile.industry.toLowerCase()] || 1;
      personalizedData.materialsCost *= factor;
    }
  }
  
  // Apply AI-enhanced adjustment based on business goals
  if (cachedProfile.businessGoals && cachedProfile.businessGoals.length > 0) {
    // Check for specific business goals
    if (cachedProfile.businessGoals.some(goal => 
        goal.toLowerCase().includes('growth') || 
        goal.toLowerCase().includes('expansion'))) {
      // Growth-focused businesses might have more competitive pricing
      personalizedData.targetMargin = Math.max(15, personalizedData.targetMargin - 5);
    }
    
    if (cachedProfile.businessGoals.some(goal => 
        goal.toLowerCase().includes('premium') || 
        goal.toLowerCase().includes('luxury'))) {
      // Premium service providers have higher margins
      personalizedData.targetMargin = Math.min(50, personalizedData.targetMargin + 8);
    }
  }
  
  return personalizedData;
}

/**
 * Initialize the profile module 
 * Loads current user profile and sets up listeners
 */
(async function initProfileModule() {
  try {
    // Load the current user's profile
    await UserProfile.loadCurrentUserProfile();
    console.log('User profile module initialized successfully');
  } catch (error) {
    console.error('Error initializing user profile module:', error);
  }
})();

// Expose the UserProfile object globally and also as an ES module export
window.UserProfile = UserProfile;
export default UserProfile;