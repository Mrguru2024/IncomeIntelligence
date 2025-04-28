/**
 * User Profile Module
 * Functions for working with user profiles to personalize quotes
 * Integrates with the enhanced quote generator
 */

// In-memory cache for user profiles (would connect to database in production)
const userProfileCache = new Map();

// Experience Level options
const ExperienceLevelEnum = [
  'novice',
  'apprentice',
  'intermediate',
  'advanced',
  'expert',
  'master'
];

// Service industries
const ServiceIndustryEnum = [
  'home_services',
  'professional_services',
  'beauty_wellness',
  'automotive',
  'electronics_repair',
  'construction',
  'landscaping',
  'cleaning',
  'education_training',
  'other'
];

// Business goals
const BusinessGoalEnum = [
  'increase_revenue',
  'reduce_costs',
  'expand_services',
  'improve_efficiency',
  'attract_new_clients',
  'retain_existing_clients',
  'enter_new_markets',
  'improve_quality',
  'build_brand'
];

// Business challenges
const BusinessChallengeEnum = [
  'limited_budget',
  'time_constraints',
  'competitive_market',
  'finding_clients',
  'pricing_strategy',
  'skilled_labor_shortage',
  'equipment_costs',
  'cash_flow',
  'marketing',
  'seasonality'
];

// Service preferences
const ServicePreferenceEnum = [
  'value_oriented',
  'quality_oriented',
  'speed_oriented',
  'relationship_oriented',
  'detail_oriented',
  'reliability_oriented'
];

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User profile or null if not found
 */
function getUserProfile(userId) {
  if (!userId) return null;
  
  // Try to get from cache first
  if (userProfileCache.has(userId)) {
    return userProfileCache.get(userId);
  }
  
  try {
    // In a real app, this would fetch from a database
    // For now, check if we have a profile in localStorage
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem(`userProfile_${userId}`);
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        userProfileCache.set(userId, profile);
        return profile;
      }
    }
    
    // If no profile found, create a default one
    return initializeUserProfile(userId);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Initialize a new user profile with default values
 * @param {string} userId - User ID
 * @returns {Object} New user profile
 */
function initializeUserProfile(userId) {
  console.log('No user profile found, attempting to initialize');
  
  // Create default profile
  const newProfile = {
    userId: userId,
    businessName: '',
    businessType: '',
    serviceIndustry: 'home_services',
    experienceLevel: 'intermediate',
    
    // Business parameters
    targetMargin: 30, // Default 30%
    businessGoals: ['increase_revenue', 'attract_new_clients'],
    businessChallenges: ['competitive_market', 'pricing_strategy'],
    servicePreferences: ['quality_oriented', 'reliability_oriented'],
    
    // Service behavior and history
    preferredJobTypes: [],
    averageLaborRate: 0,
    averageLaborHours: 0,
    averageMaterialCost: 0,
    
    // Quote history
    quoteHistory: [],
    
    // Last updated timestamps
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  // Save to cache
  userProfileCache.set(userId, newProfile);
  
  // Save to localStorage if available
  if (typeof window !== 'undefined') {
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(newProfile));
  }
  
  return newProfile;
}

/**
 * Save or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Object} Updated profile
 */
function saveUserProfile(userId, profileData) {
  // Get existing profile or create new one
  const existingProfile = getUserProfile(userId) || initializeUserProfile(userId);
  
  // Merge with existing profile
  const updatedProfile = {
    ...existingProfile,
    ...profileData,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to cache
  userProfileCache.set(userId, updatedProfile);
  
  // Save to localStorage if available
  if (typeof window !== 'undefined') {
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(updatedProfile));
  }
  
  return updatedProfile;
}

/**
 * Add a quote to the user's quote history
 * @param {string} userId - User ID
 * @param {Object} quoteData - Quote data
 * @returns {Object} Updated profile
 */
function addQuoteToHistory(userId, quoteData) {
  const profile = getUserProfile(userId);
  if (!profile) return null;
  
  // Create a history entry with minimal data
  const historyEntry = {
    jobType: quoteData.jobType,
    jobSubtype: quoteData.jobSubtype || '',
    totalAmount: quoteData.total || 0,
    date: new Date().toISOString(),
    status: 'draft',
    margin: quoteData.actualProfitMargin || 0
  };
  
  // Add to history
  const quoteHistory = [...(profile.quoteHistory || []), historyEntry];
  
  // Update profile with new history and recalculate averages
  return saveUserProfile(userId, { 
    quoteHistory,
    averageLaborRate: calculateAverageLaborRate(quoteHistory),
    averageLaborHours: calculateAverageLaborHours(quoteHistory),
    averageMaterialCost: calculateAverageMaterialCost(quoteHistory),
    // Update preferred job types
    preferredJobTypes: extractPreferredJobTypes(quoteHistory)
  });
}

/**
 * Update quote status in history
 * @param {string} userId - User ID
 * @param {string} quoteDate - Original quote date as ISO string
 * @param {string} status - New status
 * @returns {Object} Updated profile
 */
function updateQuoteStatus(userId, quoteDate, status) {
  const profile = getUserProfile(userId);
  if (!profile || !profile.quoteHistory) return null;
  
  // Find the quote in history
  const quoteHistory = profile.quoteHistory.map(quote => {
    if (quote.date === quoteDate) {
      return { ...quote, status };
    }
    return quote;
  });
  
  // Update profile with modified history
  return saveUserProfile(userId, { quoteHistory });
}

/**
 * Extract the most common job types from quote history
 * @param {Array} quoteHistory - Quote history array
 * @returns {Array} Array of preferred job types
 */
function extractPreferredJobTypes(quoteHistory) {
  if (!quoteHistory || quoteHistory.length === 0) return [];
  
  // Count occurrences of each job type
  const jobTypeCounts = {};
  quoteHistory.forEach(quote => {
    const jobType = quote.jobType;
    jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1;
  });
  
  // Sort by count and take top 3
  return Object.entries(jobTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
}

/**
 * Calculate average labor rate from quote history
 * @param {Array} quoteHistory - Quote history array
 * @returns {number} Average labor rate
 */
function calculateAverageLaborRate(quoteHistory) {
  // In a real app, this would use the actual labor rates from each quote
  // For now, using a placeholder calculation
  return 0; // Would be calculated from actual quote data
}

/**
 * Calculate average labor hours from quote history
 * @param {Array} quoteHistory - Quote history array
 * @returns {number} Average labor hours
 */
function calculateAverageLaborHours(quoteHistory) {
  // In a real app, this would use the actual labor hours from each quote
  // For now, using a placeholder calculation
  return 0; // Would be calculated from actual quote data
}

/**
 * Calculate average material cost from quote history
 * @param {Array} quoteHistory - Quote history array
 * @returns {number} Average material cost
 */
function calculateAverageMaterialCost(quoteHistory) {
  // In a real app, this would use the actual material costs from each quote
  // For now, using a placeholder calculation
  return 0; // Would be calculated from actual quote data
}

/**
 * Update user profile based on quote form data
 * This allows the system to learn from user's quoting behavior
 * @param {string} userId - User ID
 * @param {Object} formData - Quote form data
 * @returns {Object} Updated profile
 */
function updateProfileFromQuoteForm(userId, formData) {
  console.log('Storing form data for future refreshes:', formData);
  const profile = getUserProfile(userId);
  if (!profile) {
    console.log('No profile found for user ID:', userId);
    return null;
  }
  
  // Extract relevant data that we want to save to the profile
  const updatedData = {};
  
  // If service industry can be determined from job type
  const serviceIndustry = mapJobTypeToIndustry(formData.jobType);
  if (serviceIndustry) {
    updatedData.serviceIndustry = serviceIndustry;
  }
  
  // If experience level is included
  if (formData.experienceLevel && ExperienceLevelEnum.includes(formData.experienceLevel)) {
    updatedData.experienceLevel = formData.experienceLevel;
  }
  
  // If target margin is included
  if (typeof formData.targetMargin === 'number') {
    updatedData.targetMargin = formData.targetMargin;
  }
  
  // Add job type to preferred if not already in top 3
  if (formData.jobType && !profile.preferredJobTypes?.includes(formData.jobType)) {
    const preferredJobTypes = [...(profile.preferredJobTypes || [])];
    if (!preferredJobTypes.includes(formData.jobType)) {
      preferredJobTypes.unshift(formData.jobType);
      updatedData.preferredJobTypes = preferredJobTypes.slice(0, 3);
    }
  }
  
  // Update profile with new data
  return saveUserProfile(userId, updatedData);
}

/**
 * Map job type to service industry
 * @param {string} jobType - Job type
 * @returns {string} Service industry or null if unknown
 */
function mapJobTypeToIndustry(jobType) {
  const industryMap = {
    // Home services
    'plumbing': 'home_services',
    'electrical': 'home_services',
    'hvac': 'home_services',
    'handyman': 'home_services',
    'locksmith': 'home_services',
    'landscaping': 'home_services',
    'cleaning': 'home_services',
    
    // Automotive
    'oil_change': 'automotive',
    'brake_service': 'automotive',
    'transmission': 'automotive',
    'engine_repair': 'automotive',
    'tire_service': 'automotive',
    'diagnostics': 'automotive',
    
    // Beauty/wellness
    'hair_stylist': 'beauty_wellness',
    'nail_technician': 'beauty_wellness',
    'makeup_artist': 'beauty_wellness',
    'esthetician': 'beauty_wellness',
    'massage_therapist': 'beauty_wellness',
    'spa_services': 'beauty_wellness',
    
    // Electronics repair
    'computer_repair': 'electronics_repair',
    'cellphone_repair': 'electronics_repair',
    'tv_repair': 'electronics_repair',
    'appliance_repair': 'electronics_repair',
    
    // Professional services
    'legal_services': 'professional_services',
    'accounting': 'professional_services',
    'consulting': 'professional_services',
    'design_services': 'professional_services',
    'marketing': 'professional_services',
  };
  
  return industryMap[jobType] || null;
}

/**
 * Get all available options for user profile fields
 * Useful for UI form rendering
 */
function getProfileFieldOptions() {
  return {
    experienceLevels: ExperienceLevelEnum,
    serviceIndustries: ServiceIndustryEnum,
    businessGoals: BusinessGoalEnum,
    businessChallenges: BusinessChallengeEnum,
    servicePreferences: ServicePreferenceEnum
  };
}

/**
 * Get complete user stats
 * @param {string} userId - User ID
 * @returns {Object} User statistics object
 */
function getUserStats(userId) {
  const profile = getUserProfile(userId);
  if (!profile) return null;
  
  // Calculate quote stats
  const quoteHistory = profile.quoteHistory || [];
  const totalQuotes = quoteHistory.length;
  
  // Calculate acceptance rate
  const acceptedQuotes = quoteHistory.filter(q => q.status === 'accepted').length;
  const acceptanceRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
  
  // Calculate average margin
  let avgMargin = 0;
  if (totalQuotes > 0) {
    avgMargin = quoteHistory.reduce((sum, q) => sum + (q.margin || 0), 0) / totalQuotes;
  }
  
  // Calculate average quote amount
  let avgAmount = 0;
  if (totalQuotes > 0) {
    avgAmount = quoteHistory.reduce((sum, q) => sum + (q.totalAmount || 0), 0) / totalQuotes;
  }
  
  // Aggregate by job type
  const jobTypeCounts = {};
  quoteHistory.forEach(quote => {
    const jobType = quote.jobType;
    jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1;
  });
  
  return {
    userId: profile.userId,
    businessName: profile.businessName,
    serviceIndustry: profile.serviceIndustry,
    experienceLevel: profile.experienceLevel,
    totalQuotes,
    acceptedQuotes,
    acceptanceRate,
    avgMargin,
    avgAmount,
    topJobTypes: Object.entries(jobTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count })),
    createdAt: profile.createdAt,
    lastUpdated: profile.lastUpdated
  };
}

// Auto-initialize profile from URL/localStorage when module loads
if (typeof window !== 'undefined') {
  try {
    // Check if we can get user ID from localStorage
    const userId = localStorage.getItem('currentUserId') ||
                   localStorage.getItem('userId');
                   
    if (userId) {
      console.log('Using user ID from localStorage:', userId);
      // Initialize user profile
      const profile = getUserProfile(userId);
      if (profile) {
        console.log('User profile initialized from quote generator:', 'success');
      }
    }
  } catch (e) {
    console.error('Error auto-initializing user profile:', e);
  }
}

// Export methods
module.exports = {
  getUserProfile,
  saveUserProfile,
  addQuoteToHistory,
  updateQuoteStatus,
  updateProfileFromQuoteForm,
  getUserStats,
  getProfileFieldOptions
};