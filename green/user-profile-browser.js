/**
 * User Profile Management for Stackr Quoting System - Browser Compatible Version
 * 
 * Features:
 * - Profile persistence with industry-specific parameters
 * - Quote history tracking
 * - Preference learning from past quotes
 * - Adaptive parameter adjustments based on user behavior
 */

// In-memory cache of user profiles
let userProfilesCache = null;

/**
 * Load all user profiles from storage (browser localStorage)
 * @private
 */
function loadUserProfiles() {
  try {
    const profiles = localStorage.getItem('stackr_user_profiles');
    if (profiles) {
      const parsedProfiles = JSON.parse(profiles);
      console.log(`Loaded ${Object.keys(parsedProfiles).length} user profiles from localStorage`);
      return parsedProfiles;
    } else {
      // Initialize empty profiles object
      console.log('No user profiles found, creating new profiles store');
      return {};
    }
  } catch (error) {
    console.error('Error loading user profiles from localStorage:', error);
    return {};
  }
}

/**
 * Save user profiles to storage (browser localStorage)
 * @private
 * @param {Object} profiles - Profiles object
 * @returns {boolean} Success
 */
function saveUserProfiles(profiles) {
  try {
    localStorage.setItem('stackr_user_profiles', JSON.stringify(profiles));
    return true;
  } catch (error) {
    console.error('Error saving user profiles to localStorage:', error);
    return false;
  }
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User profile or null if not found
 */
function getUserProfile(userId) {
  if (!userId) return null;
  
  // Load profiles if not cached
  if (!userProfilesCache) {
    userProfilesCache = loadUserProfiles();
  }
  
  // Return profile or null if not found
  return userProfilesCache[userId] || null;
}

/**
 * Get current user profile based on session info
 * Attempts to find the current user ID from session storage
 * @returns {Object|null} User profile or null if not found
 */
function loadCurrentUserProfile() {
  // Try to get userId from session storage
  let userId = null;
  try {
    const sessionUser = sessionStorage.getItem('stackrUser');
    if (sessionUser) {
      const userObj = JSON.parse(sessionUser);
      userId = userObj.id;
    }
  } catch (e) {
    console.warn('Error reading user from session storage:', e);
  }
  
  // If not found in session, try localStorage
  if (!userId) {
    try {
      const localUser = localStorage.getItem('stackrUser');
      if (localUser) {
        const userObj = JSON.parse(localUser);
        userId = userObj.id;
      }
    } catch (e) {
      console.warn('Error reading user from local storage:', e);
    }
  }
  
  // If still no userId, check for temp ID
  if (!userId) {
    userId = localStorage.getItem('stackr_temp_user_id');
    if (!userId) {
      // Create temporary ID
      userId = `temp-${Date.now()}`;
      localStorage.setItem('stackr_temp_user_id', userId);
    }
  }
  
  // Get profile for user
  return getUserProfile(userId) || initializeUserProfile(userId);
}

/**
 * Initialize a new user profile with default values
 * @param {string} userId - User ID
 * @returns {Object} New user profile
 */
function initializeUserProfile(userId) {
  const newProfile = {
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
      defaultIndustry: null,
      preferredJobTypes: [],
      preferredMargin: 0.3,
      experienceYears: 0
    },
    statistics: {
      totalQuotes: 0,
      averageMargin: 0.3,
      acceptedQuotes: 0,
      rejectedQuotes: 0,
      averageJobValue: 0
    },
    quoteHistory: [],
    industryParameters: {}
  };
  
  // Save to storage
  if (!userProfilesCache) {
    userProfilesCache = loadUserProfiles();
  }
  
  userProfilesCache[userId] = newProfile;
  saveUserProfiles(userProfilesCache);
  
  return newProfile;
}

/**
 * Save or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Object} Updated profile
 */
function saveUserProfile(userId, profileData) {
  if (!userId) throw new Error('User ID is required');
  
  // Load profiles if not cached
  if (!userProfilesCache) {
    userProfilesCache = loadUserProfiles();
  }
  
  // Get existing profile or initialize new one
  const existingProfile = userProfilesCache[userId] || initializeUserProfile(userId);
  
  // Deep merge existing profile with new data
  const updatedProfile = {
    ...existingProfile,
    ...profileData,
    // Ensure nested objects are merged properly
    preferences: {
      ...existingProfile.preferences,
      ...(profileData.preferences || {})
    },
    statistics: {
      ...existingProfile.statistics,
      ...(profileData.statistics || {})
    },
    industryParameters: {
      ...existingProfile.industryParameters,
      ...(profileData.industryParameters || {})
    },
    updatedAt: new Date().toISOString()
  };
  
  // Update cache
  userProfilesCache[userId] = updatedProfile;
  
  // Save to storage
  saveUserProfiles(userProfilesCache);
  
  return updatedProfile;
}

/**
 * Add a quote to the user's quote history
 * @param {string} userId - User ID
 * @param {Object} quoteData - Quote data
 * @returns {Object} Updated profile
 */
function addQuoteToHistory(userId, quoteData) {
  if (!userId) throw new Error('User ID is required');
  if (!quoteData) throw new Error('Quote data is required');
  
  // Get user profile
  const userProfile = getUserProfile(userId) || initializeUserProfile(userId);
  
  // Add timestamp if not present
  const quoteWithTimestamp = {
    ...quoteData,
    createdAt: quoteData.createdAt || new Date().toISOString(),
    status: quoteData.status || 'draft'
  };
  
  // Add to quote history
  const quoteHistory = [...(userProfile.quoteHistory || []), quoteWithTimestamp];
  
  // Update statistics
  const margin = quoteData.profitMargin || 0.3;
  const total = parseFloat(quoteData.total) || 0;
  const totalQuotes = quoteHistory.length;
  
  // Calculate new average margin
  const oldAverageMargin = userProfile.statistics.averageMargin || 0.3;
  const oldTotalQuotes = userProfile.statistics.totalQuotes || 0;
  const newAverageMargin = ((oldAverageMargin * oldTotalQuotes) + margin) / (oldTotalQuotes + 1);
  
  // Calculate new average job value
  const oldAverageJobValue = userProfile.statistics.averageJobValue || 0;
  const newAverageJobValue = ((oldAverageJobValue * oldTotalQuotes) + total) / (oldTotalQuotes + 1);
  
  // Extract preferred job types based on quote history
  const preferredJobTypes = extractPreferredJobTypes(quoteHistory);
  
  // Update user profile
  const updatedProfile = saveUserProfile(userId, {
    quoteHistory,
    statistics: {
      totalQuotes,
      averageMargin: newAverageMargin,
      acceptedQuotes: userProfile.statistics.acceptedQuotes || 0,
      rejectedQuotes: userProfile.statistics.rejectedQuotes || 0,
      averageJobValue: newAverageJobValue
    },
    preferences: {
      ...userProfile.preferences,
      preferredJobTypes
    }
  });
  
  return updatedProfile;
}

/**
 * Update quote status in history
 * @param {string} userId - User ID
 * @param {string} quoteDate - Original quote date as ISO string
 * @param {string} status - New status
 * @returns {Object} Updated profile
 */
function updateQuoteStatus(userId, quoteDate, status) {
  if (!userId) throw new Error('User ID is required');
  if (!quoteDate) throw new Error('Quote date is required');
  if (!status) throw new Error('Status is required');
  
  // Valid statuses
  const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Get user profile
  const userProfile = getUserProfile(userId);
  if (!userProfile) throw new Error('User profile not found');
  
  // Find the quote in history
  const quoteHistory = [...(userProfile.quoteHistory || [])];
  const quoteIndex = quoteHistory.findIndex(quote => quote.createdAt === quoteDate);
  
  if (quoteIndex === -1) throw new Error('Quote not found in history');
  
  // Update quote status
  quoteHistory[quoteIndex] = {
    ...quoteHistory[quoteIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  
  // Update acceptance/rejection counts
  let acceptedQuotes = userProfile.statistics.acceptedQuotes || 0;
  let rejectedQuotes = userProfile.statistics.rejectedQuotes || 0;
  
  if (status === 'accepted') {
    acceptedQuotes++;
  } else if (status === 'rejected') {
    rejectedQuotes++;
  }
  
  // Update user profile
  const updatedProfile = saveUserProfile(userId, {
    quoteHistory,
    statistics: {
      ...userProfile.statistics,
      acceptedQuotes,
      rejectedQuotes
    }
  });
  
  return updatedProfile;
}

/**
 * Extract the most common job types from quote history
 * @private
 * @param {Array} quoteHistory - Quote history array
 * @returns {Array} Array of preferred job types
 */
function extractPreferredJobTypes(quoteHistory) {
  if (!quoteHistory || !quoteHistory.length) return [];
  
  // Count job types
  const jobTypeCounts = {};
  quoteHistory.forEach(quote => {
    const jobType = quote.jobType;
    if (jobType) {
      jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1;
    }
  });
  
  // Sort by count
  const sortedJobTypes = Object.keys(jobTypeCounts).sort((a, b) => {
    return jobTypeCounts[b] - jobTypeCounts[a];
  });
  
  // Return top 5
  return sortedJobTypes.slice(0, 5);
}

/**
 * Calculate average labor rate from quote history
 * @private
 * @param {Array} quoteHistory - Quote history array
 * @returns {number} Average labor rate
 */
function calculateAverageLaborRate(quoteHistory) {
  if (!quoteHistory || !quoteHistory.length) return 75; // Default
  
  let totalRate = 0;
  let count = 0;
  
  quoteHistory.forEach(quote => {
    if (quote.laborRate) {
      totalRate += parseFloat(quote.laborRate);
      count++;
    }
  });
  
  return count > 0 ? totalRate / count : 75;
}

/**
 * Update user profile parameters from quote form data
 * @param {string} userId - User ID
 * @param {Object} quoteFormData - Quote form data
 * @returns {Object} Updated profile
 */
function updateProfileFromQuoteForm(userId, quoteFormData) {
  if (!userId) throw new Error('User ID is required');
  if (!quoteFormData) throw new Error('Quote form data is required');
  
  // Get user profile
  const userProfile = getUserProfile(userId) || initializeUserProfile(userId);
  
  // Extract the service industry from the job type if not provided
  const serviceIndustry = quoteFormData.serviceIndustry || mapJobTypeToIndustry(quoteFormData.jobType);
  if (!serviceIndustry) {
    console.warn('Unable to determine service industry from quote data');
    return userProfile;
  }
  
  // Get existing industry parameters or initialize
  const existingIndustryParams = 
    (userProfile.industryParameters && userProfile.industryParameters[serviceIndustry]) || 
    getDefaultIndustryParameters(serviceIndustry);
  
  // Update industry parameters based on form data
  const updatedIndustryParams = { ...existingIndustryParams };
  
  // Update experience years if provided
  if (quoteFormData.experienceYears) {
    updatedIndustryParams.experienceYears = parseInt(quoteFormData.experienceYears) || 0;
  }
  
  // Update complexity preferences if provided
  if (quoteFormData.complexity) {
    const complexity = quoteFormData.complexity;
    if (!updatedIndustryParams.complexityPreferences) {
      updatedIndustryParams.complexityPreferences = { low: 0, medium: 0, high: 0 };
    }
    updatedIndustryParams.complexityPreferences[complexity] = 
      (updatedIndustryParams.complexityPreferences[complexity] || 0) + 1;
  }
  
  // Update labor rate if provided
  if (quoteFormData.laborRate) {
    updatedIndustryParams.preferredLaborRate = parseFloat(quoteFormData.laborRate) || existingIndustryParams.preferredLaborRate;
  }
  
  // Update industryParameters in user profile
  const industryParameters = {
    ...userProfile.industryParameters,
    [serviceIndustry]: updatedIndustryParams
  };
  
  // Update preferences based on form data
  const preferences = {
    ...userProfile.preferences,
    defaultIndustry: userProfile.preferences.defaultIndustry || serviceIndustry,
    experienceYears: quoteFormData.experienceYears || userProfile.preferences.experienceYears
  };
  
  // Save updated profile
  const updatedProfile = saveUserProfile(userId, {
    industryParameters,
    preferences
  });
  
  return updatedProfile;
}

/**
 * Map job type to service industry
 * @param {string} jobType - Job type
 * @returns {string} Service industry
 */
function mapJobTypeToIndustry(jobType) {
  if (!jobType) return null;
  
  // Industry categories
  const industries = {
    construction: [
      'general_contractor', 'carpenter', 'painter', 'roofer', 'flooring_specialist', 
      'window_installer', 'handyman', 'fence_installer'
    ],
    plumbing: ['plumber'],
    electrical: ['electrician'],
    hvac: ['hvac'],
    automotive: ['automotive_repair'],
    electronics: ['electronic_repair', 'cellphone_repair', 'computer_repair', 'tv_repair'],
    security: ['locksmith', 'security_system'],
    beauty: [
      'beauty_services', 'hair_stylist', 'nail_technician', 'makeup_artist', 
      'esthetician', 'massage_therapist', 'spa_services', 'waxing_services', 
      'tanning_services', 'eyebrow_threading', 'lash_extensions', 'facial_services'
    ],
    creative: ['graphic_design', 'photography', 'interior_design'],
    home_services: ['cleaning_services', 'pest_control', 'pool_service', 'landscaper'],
    appliance: ['appliance_repair']
  };
  
  // Find the industry that contains this job type
  for (const [industry, jobTypes] of Object.entries(industries)) {
    if (jobTypes.includes(jobType)) {
      return industry;
    }
  }
  
  // If not found, return null
  return null;
}

/**
 * Get default industry parameters
 * @param {string} serviceIndustry - Service industry
 * @returns {Object} Default industry parameters
 */
function getDefaultIndustryParameters(serviceIndustry) {
  // Default parameters by industry
  const defaultParams = {
    default: {
      preferredLaborRate: 75,
      overheadPercentage: 0.15,
      targetMargin: 0.30,
      minimumCharge: 50,
      travelCharge: 0.55,
      defaultComplexity: 'medium',
      emergencyRate: 1.5,
      materialMarkup: 0.25,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.2
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    
    construction: {
      preferredLaborRate: 85,
      overheadPercentage: 0.18,
      targetMargin: 0.25,
      minimumCharge: 150,
      travelCharge: 0.65,
      defaultComplexity: 'medium',
      emergencyRate: 1.5,
      materialMarkup: 0.20,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.25
      }
    },
    
    plumbing: {
      preferredLaborRate: 95,
      overheadPercentage: 0.20,
      targetMargin: 0.30,
      minimumCharge: 125,
      travelCharge: 0.65,
      defaultComplexity: 'medium',
      emergencyRate: 1.75,
      materialMarkup: 0.30,
      complexityMultipliers: {
        low: 0.75,
        medium: 1.0,
        high: 1.35
      }
    },
    
    electrical: {
      preferredLaborRate: 90,
      overheadPercentage: 0.18,
      targetMargin: 0.28,
      minimumCharge: 100,
      travelCharge: 0.65,
      defaultComplexity: 'medium',
      emergencyRate: 1.8,
      materialMarkup: 0.25,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.3
      }
    },
    
    hvac: {
      preferredLaborRate: 95,
      overheadPercentage: 0.20,
      targetMargin: 0.28,
      minimumCharge: 125,
      travelCharge: 0.65,
      defaultComplexity: 'medium',
      emergencyRate: 1.7,
      materialMarkup: 0.25,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.25
      }
    },
    
    automotive: {
      preferredLaborRate: 85,
      overheadPercentage: 0.25,
      targetMargin: 0.35,
      minimumCharge: 75,
      travelCharge: 1.25,
      defaultComplexity: 'medium',
      emergencyRate: 1.5,
      materialMarkup: 0.35,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.3
      }
    },
    
    electronics: {
      preferredLaborRate: 70,
      overheadPercentage: 0.15,
      targetMargin: 0.45,
      minimumCharge: 50,
      travelCharge: 0.55,
      defaultComplexity: 'medium',
      emergencyRate: 1.4,
      materialMarkup: 0.40,
      complexityMultipliers: {
        low: 0.75,
        medium: 1.0,
        high: 1.4
      }
    },
    
    security: {
      preferredLaborRate: 75,
      overheadPercentage: 0.15,
      targetMargin: 0.35,
      minimumCharge: 75,
      travelCharge: 0.65,
      defaultComplexity: 'medium',
      emergencyRate: 1.75,
      materialMarkup: 0.30,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.25
      }
    },
    
    beauty: {
      preferredLaborRate: 60,
      overheadPercentage: 0.20,
      targetMargin: 0.40,
      minimumCharge: 25,
      travelCharge: 0.55,
      defaultComplexity: 'medium',
      emergencyRate: 1.25,
      materialMarkup: 0.50,
      complexityMultipliers: {
        low: 0.75,
        medium: 1.0,
        high: 1.35
      }
    },
    
    creative: {
      preferredLaborRate: 65,
      overheadPercentage: 0.12,
      targetMargin: 0.45,
      minimumCharge: 150,
      travelCharge: 0.55,
      defaultComplexity: 'medium',
      emergencyRate: 1.3,
      materialMarkup: 0.15,
      complexityMultipliers: {
        low: 0.7,
        medium: 1.0,
        high: 1.5
      }
    },
    
    home_services: {
      preferredLaborRate: 55,
      overheadPercentage: 0.15,
      targetMargin: 0.30,
      minimumCharge: 75,
      travelCharge: 0.60,
      defaultComplexity: 'medium',
      emergencyRate: 1.5,
      materialMarkup: 0.25,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.2
      }
    },
    
    appliance: {
      preferredLaborRate: 75,
      overheadPercentage: 0.15,
      targetMargin: 0.32,
      minimumCharge: 85,
      travelCharge: 0.65,
      defaultComplexity: 'medium',
      emergencyRate: 1.6,
      materialMarkup: 0.28,
      complexityMultipliers: {
        low: 0.8,
        medium: 1.0,
        high: 1.2
      }
    }
  };
  
  return defaultParams[serviceIndustry] || defaultParams.default;
}

/**
 * Personalize quote data based on user profile
 * @param {Object} quoteData - Quote data to personalize
 * @returns {Object} Personalized quote data
 */
function personalizeQuote(quoteData) {
  // Get the current user profile
  const profile = loadCurrentUserProfile();
  if (!profile) {
    console.log('No user profile available for personalization');
    return quoteData;
  }
  
  // Get the industry parameters for this job type
  const industry = mapJobTypeToIndustry(quoteData.jobType);
  if (!industry || !profile.industryParameters || !profile.industryParameters[industry]) {
    console.log('No industry parameters available for personalization');
    return quoteData;
  }
  
  const industryParams = profile.industryParameters[industry];
  
  // Create a copy of the quote data
  const personalizedData = { ...quoteData };
  
  // Adjust labor rate based on profile
  if (industryParams.preferredLaborRate) {
    personalizedData.laborRate = industryParams.preferredLaborRate;
    console.log(`Adjusted labor rate to ${personalizedData.laborRate} based on user profile`);
  }
  
  // Adjust target margin based on profile
  if (industryParams.targetMargin) {
    personalizedData.targetMargin = Math.round(industryParams.targetMargin * 100);
    console.log(`Adjusted target margin to ${personalizedData.targetMargin}% based on user profile`);
  }
  
  // Adjust experience level if needed
  if (profile.preferences && profile.preferences.experienceYears) {
    const years = profile.preferences.experienceYears;
    
    if (years < 2) {
      personalizedData.experienceLevel = 'junior';
    } else if (years < 5) {
      personalizedData.experienceLevel = 'intermediate';
    } else if (years < 10) {
      personalizedData.experienceLevel = 'senior';
    } else {
      personalizedData.experienceLevel = 'expert';
    }
    
    console.log(`Adjusted experience level to ${personalizedData.experienceLevel} based on ${years} years experience`);
  }
  
  return personalizedData;
}

// Initialize the module by loading profiles
userProfilesCache = loadUserProfiles();

// Create a bundle of all exports for global access
window.UserProfile = {
  getUserProfile,
  initializeUserProfile,
  saveUserProfile,
  addQuoteToHistory, 
  updateQuoteStatus,
  updateProfileFromQuoteForm,
  getDefaultIndustryParameters,
  mapJobTypeToIndustry,
  loadCurrentUserProfile,
  personalizeQuote
};

// Log successful initialization
console.log('UserProfile browser module initialized successfully');