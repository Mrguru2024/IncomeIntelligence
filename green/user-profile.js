/**
 * User Profile Management for Stackr Quoting System
 * 
 * Features:
 * - Profile persistence with industry-specific parameters
 * - Quote history tracking
 * - Preference learning from past quotes
 * - Adaptive parameter adjustments based on user behavior
 */

// Individual exports for ES modules
export function getUserProfile(userId) {
  // This function will be defined later, this is just a forward declaration
  return getUserProfileImplementation(userId);
}

export function initializeUserProfile(userId) {
  // Forward declaration
  return initializeUserProfileImplementation(userId);
}

export function saveUserProfile(userId, profileData) {
  // Forward declaration
  return saveUserProfileImplementation(userId, profileData);
}

export function addQuoteToHistory(userId, quoteData) {
  // Forward declaration
  return addQuoteToHistoryImplementation(userId, quoteData);
}

export function updateQuoteStatus(userId, quoteDate, status) {
  // Forward declaration
  return updateQuoteStatusImplementation(userId, quoteDate, status);
}

export function updateProfileFromQuoteForm(userId, quoteFormData) {
  // Forward declaration
  return updateProfileFromQuoteFormImplementation(userId, quoteFormData);
}

export function getDefaultIndustryParameters(serviceIndustry) {
  // Forward declaration
  return getDefaultIndustryParametersImplementation(serviceIndustry);
}

export function mapJobTypeToIndustry(jobType) {
  // Forward declaration
  return mapJobTypeToIndustryImplementation(jobType);
}

// Export the module as a whole
export const UserProfileModule = {
  getUserProfile: null,
  initializeUserProfile: null,
  saveUserProfile: null,
  addQuoteToHistory: null, 
  updateQuoteStatus: null,
  updateProfileFromQuoteForm: null,
  getDefaultIndustryParameters: null,
  mapJobTypeToIndustry: null
};

// In-memory cache of user profiles
let userProfilesCache = null;

/**
 * Load all user profiles from storage
 * Works in both browser (localStorage) and Node.js (filesystem) environments
 */
function loadUserProfiles() {
  // In Node.js environment - use filesystem if possible
  if (typeof window === 'undefined') {
    try {
      // Use sample data for server-side
      return {
        'default': {
          userId: 'default',
          name: 'Default Profile',
          preferredJobTypes: ['Maintenance', 'Repair'],
          industryParameters: {
            laborRate: 85,
            profitMargin: 0.25,
            overheadRate: 0.15
          },
          quoteHistory: []
        }
      };
    } catch (error) {
      console.error('Error loading user profiles in Node.js:', error);
      return {};
    }
  } else {
    // Browser environment - use localStorage
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
}

/**
 * Save user profiles to storage
 * Works in both browser (localStorage) and Node.js (filesystem) environments
 */
function saveUserProfiles(profiles) {
  // In Node.js environment - use filesystem if possible
  if (typeof window === 'undefined') {
    try {
      // Just log for server-side (no actual saving needed for our server implementation)
      console.log('Server-side profile saving not implemented');
      return true;
    } catch (error) {
      console.error('Error saving user profiles in Node.js:', error);
      return false;
    }
  } else {
    // Browser environment - use localStorage
    try {
      localStorage.setItem('stackr_user_profiles', JSON.stringify(profiles));
      return true;
    } catch (error) {
      console.error('Error saving user profiles to localStorage:', error);
      return false;
    }
  }
}

/**
 * Get user profile by ID - Implementation
 * @param {string} userId - User ID
 * @returns {Object|null} User profile or null if not found
 */
function getUserProfileImplementation(userId) {
  if (!userId) return null;
  
  // Load profiles if not cached
  if (!userProfilesCache) {
    userProfilesCache = loadUserProfiles();
  }
  
  // Return profile or null if not found
  return userProfilesCache[userId] || null;
}

/**
 * Initialize a new user profile with default values - Implementation
 * @param {string} userId - User ID
 * @returns {Object} New user profile
 */
function initializeUserProfileImplementation(userId) {
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
  
  return newProfile;
}

/**
 * Save or update user profile - Implementation
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Object} Updated profile
 */
function saveUserProfileImplementation(userId, profileData) {
  if (!userId) throw new Error('User ID is required');
  
  // Load profiles if not cached
  if (!userProfilesCache) {
    userProfilesCache = loadUserProfiles();
  }
  
  // Get existing profile or initialize new one
  const existingProfile = userProfilesCache[userId] || initializeUserProfileImplementation(userId);
  
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
  
  // Save to file
  saveUserProfiles(userProfilesCache);
  
  return updatedProfile;
}

/**
 * Add a quote to the user's quote history - Implementation
 * @param {string} userId - User ID
 * @param {Object} quoteData - Quote data
 * @returns {Object} Updated profile
 */
function addQuoteToHistoryImplementation(userId, quoteData) {
  if (!userId) throw new Error('User ID is required');
  if (!quoteData) throw new Error('Quote data is required');
  
  // Get user profile
  const userProfile = getUserProfileImplementation(userId) || initializeUserProfileImplementation(userId);
  
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
  const updatedProfile = saveUserProfileImplementation(userId, {
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
 * Update quote status in history - Implementation
 * @param {string} userId - User ID
 * @param {string} quoteDate - Original quote date as ISO string
 * @param {string} status - New status
 * @returns {Object} Updated profile
 */
function updateQuoteStatusImplementation(userId, quoteDate, status) {
  if (!userId) throw new Error('User ID is required');
  if (!quoteDate) throw new Error('Quote date is required');
  if (!status) throw new Error('Status is required');
  
  // Valid statuses
  const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Get user profile
  const userProfile = getUserProfileImplementation(userId);
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
  const updatedProfile = saveUserProfileImplementation(userId, {
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
 * Update user profile parameters from quote form data - Implementation
 * @param {string} userId - User ID
 * @param {Object} quoteFormData - Quote form data
 * @returns {Object} Updated profile
 */
function updateProfileFromQuoteFormImplementation(userId, quoteFormData) {
  if (!userId) throw new Error('User ID is required');
  if (!quoteFormData) throw new Error('Quote form data is required');
  
  // Get user profile
  const userProfile = getUserProfileImplementation(userId) || initializeUserProfileImplementation(userId);
  
  // Extract the service industry from the job type if not provided
  const serviceIndustry = quoteFormData.serviceIndustry || mapJobTypeToIndustryImplementation(quoteFormData.jobType);
  if (!serviceIndustry) {
    console.warn('Unable to determine service industry from quote data');
    return userProfile;
  }
  
  // Get existing industry parameters or initialize
  const existingIndustryParams = 
    (userProfile.industryParameters && userProfile.industryParameters[serviceIndustry]) || 
    getDefaultIndustryParametersImplementation(serviceIndustry);
  
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
  const updatedProfile = saveUserProfileImplementation(userId, {
    industryParameters,
    preferences
  });
  
  return updatedProfile;
}

/**
 * Map job type to service industry - Implementation
 * @param {string} jobType - Job type
 * @returns {string} Service industry
 */
function mapJobTypeToIndustryImplementation(jobType) {
  const jobTypeMap = {
    // Construction
    'Bathroom Remodel': 'construction',
    'Kitchen Remodel': 'construction',
    'Home Renovation': 'construction',
    'Deck Building': 'construction',
    'Fence Installation': 'construction',
    'Room Addition': 'construction',
    
    // Automotive
    'Oil Change': 'automotive',
    'Brake Replacement': 'automotive',
    'Tire Rotation': 'automotive',
    'Engine Repair': 'automotive',
    'Car Detailing': 'automotive',
    'Transmission Repair': 'automotive',
    
    // Beauty
    'Haircut': 'beauty',
    'Hair Coloring': 'beauty',
    'Manicure': 'beauty',
    'Pedicure': 'beauty',
    'Facial': 'beauty',
    'Makeup Application': 'beauty',
    
    // Electronics Repair
    'Phone Screen Repair': 'electronics_repair',
    'Computer Repair': 'electronics_repair',
    'TV Repair': 'electronics_repair',
    'Game Console Repair': 'electronics_repair',
    
    // Graphic Design
    'Logo Design': 'graphic_design',
    'Business Card Design': 'graphic_design',
    'Website Design': 'graphic_design',
    'Brochure Design': 'graphic_design',
    'Social Media Graphics': 'graphic_design',
    
    // Plumbing
    'Pipe Repair': 'plumbing',
    'Drain Cleaning': 'plumbing',
    'Water Heater Installation': 'plumbing',
    'Faucet Replacement': 'plumbing',
    'Toilet Repair': 'plumbing',
    
    // Electrical
    'Outlet Installation': 'electrical',
    'Light Fixture Installation': 'electrical',
    'Panel Upgrade': 'electrical',
    'Wiring Repair': 'electrical',
    'Ceiling Fan Installation': 'electrical',
    
    // Landscaping
    'Lawn Mowing': 'landscaping',
    'Garden Design': 'landscaping',
    'Tree Trimming': 'landscaping',
    'Irrigation Installation': 'landscaping',
    'Mulch Installation': 'landscaping',
    
    // Locksmith
    'Lock Replacement': 'locksmith',
    'Key Duplication': 'locksmith',
    'Lock Rekeying': 'locksmith',
    'Safe Installation': 'locksmith',
    
    // Cleaning
    'House Cleaning': 'cleaning',
    'Office Cleaning': 'cleaning',
    'Carpet Cleaning': 'cleaning',
    'Window Cleaning': 'cleaning',
    'Move-out Cleaning': 'cleaning'
  };
  
  return jobTypeMap[jobType] || 'default';
}

/**
 * Get default industry parameters - Implementation
 * @param {string} serviceIndustry - Service industry
 * @returns {Object} Default industry parameters
 */
function getDefaultIndustryParametersImplementation(serviceIndustry) {
  const defaultParams = {
    construction: {
      baseMargin: 0.25,
      laborMultiplier: 1.8,
      materialMarkup: 0.2,
      experienceWeight: 0.05,
      regionFactor: 1.0,
      preferredLaborRate: 85,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    automotive: {
      baseMargin: 0.30,
      laborMultiplier: 1.7,
      materialMarkup: 0.25,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      preferredLaborRate: 95,
      experienceYears: 0,
      complexity: {
        low: 0.85,
        medium: 1.0,
        high: 1.25
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    plumbing: {
      baseMargin: 0.28,
      laborMultiplier: 1.75,
      materialMarkup: 0.22,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      preferredLaborRate: 90,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.15
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    electrical: {
      baseMargin: 0.27,
      laborMultiplier: 1.8,
      materialMarkup: 0.2,
      experienceWeight: 0.05,
      regionFactor: 1.0,
      preferredLaborRate: 95,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    locksmith: {
      baseMargin: 0.35,
      laborMultiplier: 1.6,
      materialMarkup: 0.3,
      experienceWeight: 0.03,
      regionFactor: 1.0,
      preferredLaborRate: 75,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.1
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    cleaning: {
      baseMargin: 0.33,
      laborMultiplier: 1.5,
      materialMarkup: 0.15,
      experienceWeight: 0.02,
      regionFactor: 1.0,
      preferredLaborRate: 45,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.1
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    beauty: {
      baseMargin: 0.40,
      laborMultiplier: 1.4,
      materialMarkup: 0.25,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      preferredLaborRate: 65,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.15
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    landscaping: {
      baseMargin: 0.28,
      laborMultiplier: 1.65,
      materialMarkup: 0.2,
      experienceWeight: 0.03,
      regionFactor: 1.0,
      preferredLaborRate: 55,
      experienceYears: 0,
      complexity: {
        low: 0.85,
        medium: 1.0,
        high: 1.2
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    graphic_design: {
      baseMargin: 0.45,
      laborMultiplier: 1.0,
      materialMarkup: 0.0,
      experienceWeight: 0.08,
      regionFactor: 1.0,
      preferredLaborRate: 85,
      experienceYears: 0,
      complexity: {
        low: 0.8,
        medium: 1.0,
        high: 1.3
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    electronics_repair: {
      baseMargin: 0.32,
      laborMultiplier: 1.6,
      materialMarkup: 0.3,
      experienceWeight: 0.05,
      regionFactor: 1.0,
      preferredLaborRate: 75,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    },
    default: {
      baseMargin: 0.3,
      laborMultiplier: 1.7,
      materialMarkup: 0.2,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      preferredLaborRate: 75,
      experienceYears: 0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      },
      complexityPreferences: {
        low: 0,
        medium: 1,
        high: 0
      }
    }
  };
  
  return defaultParams[serviceIndustry] || defaultParams.default;
}

// Initialize the module by loading profiles
userProfilesCache = loadUserProfiles();

// Create a bundle of all exports
const profileModule = {
  getUserProfile: getUserProfileImplementation,
  initializeUserProfile: initializeUserProfileImplementation,
  saveUserProfile: saveUserProfileImplementation,
  addQuoteToHistory: addQuoteToHistoryImplementation,
  updateQuoteStatus: updateQuoteStatusImplementation,
  updateProfileFromQuoteForm: updateProfileFromQuoteFormImplementation,
  getDefaultIndustryParameters: getDefaultIndustryParametersImplementation,
  mapJobTypeToIndustry: mapJobTypeToIndustryImplementation
};

// Update the exported ES module object with the actual functions
if (typeof UserProfileModule !== 'undefined') {
  UserProfileModule.getUserProfile = getUserProfileImplementation;
  UserProfileModule.initializeUserProfile = initializeUserProfileImplementation;
  UserProfileModule.saveUserProfile = saveUserProfileImplementation;
  UserProfileModule.addQuoteToHistory = addQuoteToHistoryImplementation;
  UserProfileModule.updateQuoteStatus = updateQuoteStatusImplementation;
  UserProfileModule.updateProfileFromQuoteForm = updateProfileFromQuoteFormImplementation;
  UserProfileModule.getDefaultIndustryParameters = getDefaultIndustryParametersImplementation;
  UserProfileModule.mapJobTypeToIndustry = mapJobTypeToIndustryImplementation;
}

// Check environment and export accordingly
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS environment (Node.js)
  module.exports = profileModule;
} else if (typeof window !== 'undefined') {
  // Browser environment - add to global scope
  window.UserProfile = profileModule;
  window.UserProfileModule = profileModule; // Alternative name for compatibility
}