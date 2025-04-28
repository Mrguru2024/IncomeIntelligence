/**
 * Enhanced Quote Generator
 * Features:
 * - Advanced profit margin calculation with industry benchmarks
 * - Dynamic parameters based on service industries
 * - User profile integration for personalized quotes
 * - Multi-tier pricing structure
 * - Competitive pricing insights
 */

// Import necessary utilities and data
const { marketRates, stateToRegion, stateTaxRates } = require('./quote-data.js');
const { getUserProfile } = require('./user-profile.js');

// Service industry categories with specialized parameters
const INDUSTRY_PARAMETERS = {
  // Home services industry parameters
  home_services: {
    baseMargin: 35,
    materialMarkupRate: 1.25, // 25% markup on materials
    emergency_multiplier: 1.75,
    weekend_multiplier: 1.35,
    seasonality: {
      peak: { margin_adjustment: 5, min_hourly_rate_adjustment: 15 },
      off_peak: { margin_adjustment: -5, min_hourly_rate_adjustment: -10 }
    },
    service_warranty: {
      basic: 30, // 30 days
      standard: 90, // 90 days
      premium: 365 // 1 year
    }
  },

  // Automotive industry parameters
  automotive: {
    baseMargin: 40,
    materialMarkupRate: 1.35, // 35% markup on parts
    emergency_multiplier: 1.5,
    weekend_multiplier: 1.4,
    diagnostics_fee: { 
      basic: 49.99,
      standard: 89.99,
      premium: 129.99
    },
    service_warranty: {
      basic: 90, // 3 months
      standard: 180, // 6 months
      premium: 365 // 1 year
    }
  },

  // Beauty/wellness industry parameters
  beauty_wellness: {
    baseMargin: 45,
    productMarkupRate: 2.0, // 100% markup on products
    weekend_multiplier: 1.25,
    prime_hours_multiplier: 1.2, // Prime hours (evenings, etc.)
    booking_intervals: {
      basic: 30, // 30 min slots
      standard: 45, // 45 min slots
      premium: 60 // 60 min slots with buffer time
    },
    addon_services: {
      basic: 1,
      standard: 2,
      premium: 3
    }
  },

  // Electronics repair industry parameters
  electronics_repair: {
    baseMargin: 50,
    materialMarkupRate: 1.4, // 40% markup on parts
    emergency_multiplier: 1.6,
    service_warranty: {
      basic: 30, // 30 days
      standard: 90, // 90 days
      premium: 180 // 6 months
    },
    complexity_multiplier: {
      low: 0.9,
      medium: 1.0,
      high: 1.3
    }
  },

  // Professional services industry parameters
  professional_services: {
    baseMargin: 45,
    retainer_discount: 0.1, // 10% discount on retainer
    rush_multiplier: 1.5,
    service_tiers: {
      basic: { deliverables: 1, revisions: 1 },
      standard: { deliverables: 2, revisions: 2 },
      premium: { deliverables: 3, revisions: 'unlimited' }
    }
  },

  // Default parameters if industry not specified
  default: {
    baseMargin: 30,
    materialMarkupRate: 1.2, // 20% markup on materials
    emergency_multiplier: 1.5,
    weekend_multiplier: 1.25
  }
};

// Experience level modifiers
const EXPERIENCE_MODIFIERS = {
  novice: { marginAdjustment: -5, laborRateMultiplier: 0.85 },
  apprentice: { marginAdjustment: -2, laborRateMultiplier: 0.9 },
  intermediate: { marginAdjustment: 0, laborRateMultiplier: 1.0 },
  advanced: { marginAdjustment: 2, laborRateMultiplier: 1.10 },
  expert: { marginAdjustment: 5, laborRateMultiplier: 1.25 },
  master: { marginAdjustment: 8, laborRateMultiplier: 1.4 }
};

// Season detection for seasonality adjustments
function getCurrentSeason() {
  const month = new Date().getMonth();
  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

// Get industry peak seasons
function getIndustrySeasonality(industry, season) {
  const PEAK_SEASONS = {
    home_services: {
      spring: "peak", // Spring cleaning, home improvements
      summer: "peak", // Home renovations, landscaping
      fall: "normal",
      winter: "off_peak" // Except HVAC for winter regions
    },
    beauty_wellness: {
      spring: "normal",
      summer: "peak", // Wedding season, summer events
      fall: "normal",
      winter: "peak" // Holiday season
    },
    automotive: {
      spring: "peak", // Spring maintenance after winter
      summer: "peak", // Summer travel season
      fall: "normal",
      winter: "peak" // Winter preparations, snow tires
    },
    electronics_repair: {
      spring: "normal",
      summer: "off_peak",
      fall: "peak", // Back to school, pre-holiday
      winter: "peak" // Post-holiday repairs
    },
    professional_services: {
      spring: "peak", // New fiscal year for many businesses
      summer: "off_peak", // Vacation season
      fall: "peak", // Year-end planning
      winter: "normal"
    }
  };

  // Default to normal if no specific seasonality found
  return (PEAK_SEASONS[industry] && PEAK_SEASONS[industry][season]) || "normal";
}

/**
 * Get dynamic parameters based on user profile and industry
 * This allows for personalized quotes that reflect the user's business
 */
function getDynamicParameters(userId, serviceIndustry) {
  // Get user profile
  const userProfile = getUserProfile(userId);
  
  // Get industry parameters (default if not found)
  const industryParams = INDUSTRY_PARAMETERS[serviceIndustry] || INDUSTRY_PARAMETERS.default;
  
  // Get experience level modifiers
  const experienceModifiers = EXPERIENCE_MODIFIERS[userProfile?.experienceLevel || 'intermediate'];
  
  // Calculate target margin based on base industry margin and user preferences
  let targetMargin = industryParams.baseMargin;
  
  // Apply user's preferred margin if available
  if (userProfile?.targetMargin) {
    targetMargin = userProfile.targetMargin;
  }
  
  // Apply experience level adjustment to margin
  targetMargin += experienceModifiers.marginAdjustment;
  
  // Get current season and seasonality
  const currentSeason = getCurrentSeason();
  const seasonality = getIndustrySeasonality(serviceIndustry, currentSeason);
  
  // Apply seasonality adjustments if applicable
  if (seasonality === "peak" && industryParams.seasonality?.peak) {
    targetMargin += industryParams.seasonality.peak.margin_adjustment;
  } else if (seasonality === "off_peak" && industryParams.seasonality?.off_peak) {
    targetMargin += industryParams.seasonality.off_peak.margin_adjustment;
  }
  
  // Adjust target margin based on business goals
  if (userProfile?.businessGoals) {
    if (userProfile.businessGoals.includes('increase_revenue')) {
      targetMargin += 2; // Slight increase for revenue goals
    }
    if (userProfile.businessGoals.includes('attract_new_clients')) {
      targetMargin -= 3; // Reduction to be more competitive for new clients
    }
  }
  
  // Adjust based on service preferences
  if (userProfile?.servicePreferences) {
    if (userProfile.servicePreferences.includes('value_oriented')) {
      targetMargin -= 5; // Lower margin for value-oriented providers
    }
    if (userProfile.servicePreferences.includes('quality_oriented')) {
      targetMargin += 5; // Higher margin for quality-oriented providers
    }
  }
  
  // Cap margin between reasonable bounds
  targetMargin = Math.max(15, Math.min(60, targetMargin));
  
  return {
    targetMargin,
    serviceIndustry,
    industryParams,
    experienceLevel: userProfile?.experienceLevel || 'intermediate',
    experienceModifiers,
    seasonality,
    currentSeason,
    businessGoals: userProfile?.businessGoals || [],
    servicePreferences: userProfile?.servicePreferences || []
  };
}

/**
 * Enhanced profit margin calculation with advanced formula
 * Accounts for industry standards, experience level, and regional factors
 */
function calculateEnhancedProfitMargin(data, parameters) {
  // Extract parameters
  const { 
    targetMargin, 
    industryParams, 
    experienceModifiers 
  } = parameters;
  
  // Extract state from location
  const state = getStateFromLocation(data.location);
  
  // Get region and rates
  const region = stateToRegion[state] || 'northeast';
  let baseRate = marketRates[data.jobType]?.[region] || 85; // Default rate if not found
  const taxRate = stateTaxRates[state] || 0.06; // Default 6% if not found
  
  // Apply experience level modifier to labor rate
  baseRate *= experienceModifiers.laborRateMultiplier;
  
  // Calculate labor cost with time-based multipliers if applicable
  let laborRate = baseRate;
  if (data.emergency && industryParams.emergency_multiplier) {
    laborRate *= industryParams.emergency_multiplier;
  }
  if (data.weekend && industryParams.weekend_multiplier) {
    laborRate *= industryParams.weekend_multiplier;
  }
  
  const laborCost = laborRate * data.laborHours;
  
  // Calculate materials cost with industry-specific markup
  const materialBase = data.materialsCost;
  let materialsCost = materialBase;
  
  // Apply industry-specific material markup if applicable
  if (industryParams.materialMarkupRate) {
    materialsCost = materialBase * industryParams.materialMarkupRate;
  }
  
  // Calculate materials tax
  const materialsTax = materialBase * taxRate; // Tax is on base cost, not markup
  
  // Calculate cost basis (direct costs)
  const costBasis = laborCost + materialBase; // Original material cost without markup
  
  // Calculate target revenue to achieve desired margin
  // Formula: Revenue = Cost / (1 - Margin%)
  const targetMarginDecimal = targetMargin / 100;
  const targetRevenue = costBasis / (1 - targetMarginDecimal);
  
  // Add tax to get final total
  const total = targetRevenue + materialsTax;
  
  // Calculate actual profit after tax considerations
  const profit = targetRevenue - costBasis;
  const actualProfitMargin = (profit / targetRevenue) * 100;
  
  // Generate competitive context for region
  const regionalAverageMargin = getRegionalMarginData(data.jobType, region);
  const competitivePosition = determineCompetitivePosition(actualProfitMargin, regionalAverageMargin);
  
  return {
    laborRate,
    laborCost,
    materialsCost: materialBase, // Original material cost
    materialMarkup: materialsCost - materialBase, // The markup amount
    materialsTax,
    costBasis,
    targetRevenue,
    total,
    profit,
    targetMargin,
    actualProfitMargin,
    regionalAverageMargin,
    competitivePosition
  };
}

/**
 * Get regional margin data for competitive positioning
 */
function getRegionalMarginData(jobType, region) {
  // This would ideally come from a database with real market data
  // For now using simulated data based on job type and region
  const AVERAGE_MARGINS = {
    'home_services': {
      'northeast': 32,
      'southeast': 30,
      'midwest': 28,
      'southwest': 31,
      'west': 34
    },
    'beauty_wellness': {
      'northeast': 40,
      'southeast': 38,
      'midwest': 35,
      'southwest': 37,
      'west': 42
    },
    'automotive': {
      'northeast': 37,
      'southeast': 35,
      'midwest': 33,
      'southwest': 34,
      'west': 38
    },
    'electronics_repair': {
      'northeast': 45,
      'southeast': 42,
      'midwest': 40,
      'southwest': 41,
      'west': 47
    },
    'professional_services': {
      'northeast': 42,
      'southeast': 40,
      'midwest': 38,
      'southwest': 39,
      'west': 44
    }
  };

  // Map job type to industry category
  const industryMap = {
    'plumbing': 'home_services',
    'electrical': 'home_services',
    'hvac': 'home_services',
    'handyman': 'home_services',
    'locksmith': 'home_services',
    'landscaping': 'home_services',
    'cleaning': 'home_services',
    'oil_change': 'automotive',
    'brake_service': 'automotive',
    'transmission': 'automotive',
    'engine_repair': 'automotive',
    'tire_service': 'automotive',
    'diagnostics': 'automotive',
    'hair_stylist': 'beauty_wellness',
    'nail_technician': 'beauty_wellness',
    'makeup_artist': 'beauty_wellness',
    'esthetician': 'beauty_wellness',
    'massage_therapist': 'beauty_wellness',
    'spa_services': 'beauty_wellness',
    'computer_repair': 'electronics_repair',
    'cellphone_repair': 'electronics_repair',
    'tv_repair': 'electronics_repair',
    'appliance_repair': 'electronics_repair',
  };

  const industry = industryMap[jobType] || 'home_services';
  return AVERAGE_MARGINS[industry]?.[region] || 30;
}

/**
 * Determine competitive position compared to regional average
 */
function determineCompetitivePosition(actualMargin, regionalAverage) {
  const difference = actualMargin - regionalAverage;
  
  if (difference < -5) {
    return { 
      position: 'significantly_below_market',
      message: 'Your pricing is significantly below market average. This may signal value to customers but could limit profitability.',
      recommendation: 'Consider a gradual price increase or adding premium service options.'
    };
  } else if (difference < -2) {
    return { 
      position: 'below_market',
      message: 'Your pricing is slightly below market average, which may be attractive to price-sensitive customers.',
      recommendation: 'Emphasize value in your client communications to avoid being seen as simply "cheap".'
    };
  } else if (difference < 2) {
    return { 
      position: 'at_market',
      message: 'Your pricing is aligned with market averages in your region.',
      recommendation: 'Differentiate your service with unique features or exceptional quality to stand out.'
    };
  } else if (difference < 5) {
    return { 
      position: 'above_market',
      message: 'Your pricing is slightly above market average, which can signal premium quality.',
      recommendation: 'Ensure your service quality and customer experience justify the premium price point.'
    };
  } else {
    return { 
      position: 'significantly_above_market',
      message: 'Your pricing is significantly above market average. This requires exceptional service quality and clear value demonstration.',
      recommendation: 'Be prepared to articulate your unique value proposition and premium service elements.'
    };
  }
}

/**
 * Extract state from location string
 */
function getStateFromLocation(location) {
  // Extract two-letter state code from location string
  // Example: "New York, NY" -> "NY"
  const stateMatch = location.match(/,\s*([A-Z]{2})$/);
  return stateMatch ? stateMatch[1] : 'NY'; // Default to NY if not found
}

/**
 * Generate tiered pricing options with appropriate parameters
 * for different service levels
 */
function generateTieredOptions(data, parameters) {
  // Generate basic, standard, and premium tier options
  const basicParams = { ...data, targetMargin: parameters.targetMargin - 5 };
  const standardParams = { ...data, targetMargin: parameters.targetMargin };
  const premiumParams = { ...data, targetMargin: parameters.targetMargin + 7 };
  
  // Calculate margins for each tier
  const basicMargin = calculateEnhancedProfitMargin(basicParams, parameters);
  const standardMargin = calculateEnhancedProfitMargin(standardParams, parameters);
  const premiumMargin = calculateEnhancedProfitMargin(premiumParams, parameters);
  
  // Get industry specific features for each tier
  const { industryParams, serviceIndustry } = parameters;
  
  const tiers = {
    basic: {
      ...basicMargin,
      name: "Basic",
      description: getBasicDescription(serviceIndustry, data.jobType),
      features: getBasicFeatures(serviceIndustry, data.jobType, industryParams),
      warranty: industryParams.service_warranty?.basic || 30
    },
    standard: {
      ...standardMargin,
      name: "Standard",
      description: getStandardDescription(serviceIndustry, data.jobType),
      features: getStandardFeatures(serviceIndustry, data.jobType, industryParams),
      warranty: industryParams.service_warranty?.standard || 90
    },
    premium: {
      ...premiumMargin,
      name: "Premium",
      description: getPremiumDescription(serviceIndustry, data.jobType),
      features: getPremiumFeatures(serviceIndustry, data.jobType, industryParams),
      warranty: industryParams.service_warranty?.premium || 365
    }
  };
  
  return tiers;
}

/**
 * Get tier descriptions based on industry and job type
 */
function getBasicDescription(serviceIndustry, jobType) {
  const descriptions = {
    home_services: {
      default: "Essential service with standard parts and basic guarantee.",
      plumbing: "Basic plumbing service with standard parts and 30-day guarantee.",
      electrical: "Basic electrical service with standard parts and 30-day guarantee.",
      hvac: "Basic HVAC service with standard components and 30-day guarantee."
    },
    automotive: {
      default: "Standard service with OEM-equivalent parts and basic warranty.",
      oil_change: "Standard oil change with conventional oil and basic inspection.",
      brake_service: "Basic brake service with standard parts and 90-day warranty."
    },
    beauty_wellness: {
      default: "Standard service with essential products and techniques.",
      hair_stylist: "Basic cut and style with standard products.",
      nail_technician: "Basic manicure/pedicure with standard polish."
    },
    electronics_repair: {
      default: "Standard diagnosis and repair with compatible parts.",
      computer_repair: "Basic computer diagnostics and repair with compatible parts.",
      cellphone_repair: "Standard phone repair with compatible replacement parts."
    }
  };
  
  // Return job-specific description or industry default or general default
  return descriptions[serviceIndustry]?.[jobType] || 
         descriptions[serviceIndustry]?.default || 
         "Basic service package with essential components.";
}

function getStandardDescription(serviceIndustry, jobType) {
  const descriptions = {
    home_services: {
      default: "Complete service with quality parts and extended guarantee.",
      plumbing: "Complete plumbing service with quality parts and 90-day guarantee.",
      electrical: "Thorough electrical service with quality components and 90-day guarantee.",
      hvac: "Complete HVAC service with quality components and 90-day guarantee."
    },
    automotive: {
      default: "Complete service with OEM-quality parts and extended warranty.",
      oil_change: "Complete oil change with synthetic-blend oil and comprehensive inspection.",
      brake_service: "Complete brake service with quality parts and 6-month warranty."
    },
    beauty_wellness: {
      default: "Complete service with quality products and detailed techniques.",
      hair_stylist: "Complete cut, style, and treatment with quality products.",
      nail_technician: "Complete manicure/pedicure with gel polish and hand treatment."
    },
    electronics_repair: {
      default: "Thorough diagnosis and repair with high-quality replacement parts.",
      computer_repair: "Complete computer repair with thorough diagnostics and quality replacement parts.",
      cellphone_repair: "Complete phone repair with high-quality replacement parts and screen protector."
    }
  };
  
  // Return job-specific description or industry default or general default
  return descriptions[serviceIndustry]?.[jobType] || 
         descriptions[serviceIndustry]?.default || 
         "Standard service package with quality components and comprehensive coverage.";
}

function getPremiumDescription(serviceIndustry, jobType) {
  const descriptions = {
    home_services: {
      default: "Premium service with top-tier parts and comprehensive guarantee.",
      plumbing: "Premium plumbing service with top-quality parts and 1-year guarantee.",
      electrical: "Premium electrical service with high-end components and 1-year guarantee.",
      hvac: "Premium HVAC service with top-tier components and 1-year guarantee."
    },
    automotive: {
      default: "Premium service with OEM parts and comprehensive warranty.",
      oil_change: "Premium oil change with full synthetic oil and detailed inspection with preventative maintenance.",
      brake_service: "Premium brake service with ceramic pads and 1-year warranty."
    },
    beauty_wellness: {
      default: "Premium service with luxury products and advanced techniques.",
      hair_stylist: "Premium cut, color, and treatment with luxury products and styling lesson.",
      nail_technician: "Premium manicure/pedicure with gel extensions and paraffin treatment."
    },
    electronics_repair: {
      default: "Comprehensive diagnosis and repair with premium parts and optimization.",
      computer_repair: "Premium computer repair with detailed diagnostics, premium parts, and performance optimization.",
      cellphone_repair: "Premium phone repair with OEM parts, tempered glass, and case."
    }
  };
  
  // Return job-specific description or industry default or general default
  return descriptions[serviceIndustry]?.[jobType] || 
         descriptions[serviceIndustry]?.default || 
         "Premium service package with top-tier components and comprehensive coverage.";
}

/**
 * Generate tier-specific features based on industry and job type
 */
function getBasicFeatures(serviceIndustry, jobType, industryParams) {
  const features = {
    home_services: {
      default: [
        "Standard service call",
        "Basic components and materials",
        `${industryParams.service_warranty?.basic || 30}-day labor warranty`,
        "Standard scheduling"
      ],
      plumbing: [
        "Standard service call",
        "Basic components and materials",
        `${industryParams.service_warranty?.basic || 30}-day leak-free guarantee`,
        "Standard scheduling"
      ]
    },
    automotive: {
      default: [
        "Standard diagnostics",
        "OEM-equivalent parts",
        `${industryParams.service_warranty?.basic || 90}-day parts warranty`,
        "Standard appointment scheduling"
      ],
      oil_change: [
        "Conventional oil",
        "Standard oil filter",
        "Basic fluid check",
        "Basic visual inspection"
      ]
    },
    beauty_wellness: {
      default: [
        `${industryParams.booking_intervals?.basic || 30}-minute appointment`,
        "Essential service only",
        "Standard products",
        `${industryParams.addon_services?.basic || 1} complimentary addon`
      ]
    },
    electronics_repair: {
      default: [
        "Basic diagnostics",
        "Compatible replacement parts",
        `${industryParams.service_warranty?.basic || 30}-day repair warranty`,
        "Standard turnaround time"
      ]
    }
  };
  
  // Return job-specific features or industry default or general default
  return features[serviceIndustry]?.[jobType] || 
         features[serviceIndustry]?.default || 
         [
           "Basic service package",
           "Standard components",
           "30-day warranty",
           "Essential service elements only"
         ];
}

function getStandardFeatures(serviceIndustry, jobType, industryParams) {
  const features = {
    home_services: {
      default: [
        "Priority service call",
        "Quality components and materials",
        `${industryParams.service_warranty?.standard || 90}-day labor warranty`,
        "Flexible scheduling",
        "Detailed work documentation"
      ],
      plumbing: [
        "Priority service call",
        "Quality components and materials",
        `${industryParams.service_warranty?.standard || 90}-day leak-free guarantee`,
        "Flexible scheduling",
        "Detailed plumbing inspection"
      ]
    },
    automotive: {
      default: [
        "Comprehensive diagnostics",
        "OEM-quality parts",
        `${industryParams.service_warranty?.standard || 180}-day parts and labor warranty`,
        "Priority scheduling",
        "Detailed vehicle inspection"
      ],
      oil_change: [
        "Synthetic-blend oil",
        "Premium oil filter",
        "Comprehensive fluid check and top-off",
        "Multi-point inspection",
        "Tire pressure adjustment"
      ]
    },
    beauty_wellness: {
      default: [
        `${industryParams.booking_intervals?.standard || 45}-minute appointment`,
        "Complete service package",
        "Professional-grade products",
        `${industryParams.addon_services?.standard || 2} complimentary addons`,
        "Basic styling consultation"
      ]
    },
    electronics_repair: {
      default: [
        "Thorough diagnostics and testing",
        "High-quality replacement parts",
        `${industryParams.service_warranty?.standard || 90}-day repair warranty`,
        "Expedited turnaround time",
        "Basic device optimization"
      ]
    }
  };
  
  // Return job-specific features or industry default or general default
  return features[serviceIndustry]?.[jobType] || 
         features[serviceIndustry]?.default || 
         [
           "Standard service package",
           "Quality components",
           "90-day warranty",
           "Comprehensive service coverage",
           "Additional value elements"
         ];
}

function getPremiumFeatures(serviceIndustry, jobType, industryParams) {
  const features = {
    home_services: {
      default: [
        "Same-day service call",
        "Top-tier components and materials",
        `${industryParams.service_warranty?.premium || 365}-day labor warranty`,
        "Priority scheduling with 2-hour window",
        "Detailed work documentation with photos",
        "Complimentary follow-up inspection",
        "Emergency service discount"
      ],
      plumbing: [
        "Same-day service call",
        "Top-tier components and materials",
        `${industryParams.service_warranty?.premium || 365}-day leak-free guarantee`,
        "Priority scheduling with 2-hour window",
        "Comprehensive plumbing inspection",
        "Complimentary water pressure test",
        "Future service discount"
      ]
    },
    automotive: {
      default: [
        "Advanced computer diagnostics",
        "OEM or premium aftermarket parts",
        `${industryParams.service_warranty?.premium || 365}-day parts and labor warranty`,
        "Same-day service when available",
        "Comprehensive vehicle inspection",
        "Complimentary detailing",
        "Courtesy vehicle"
      ],
      oil_change: [
        "Full synthetic oil",
        "Premium extended-life oil filter",
        "Complete fluid check and replacement",
        "Comprehensive multi-point inspection",
        "Tire rotation and pressure adjustment",
        "Filter inspection and replacement",
        "Exterior wash"
      ]
    },
    beauty_wellness: {
      default: [
        `${industryParams.booking_intervals?.premium || 60}-minute appointment`,
        "Premium service package",
        "Luxury professional products",
        `${industryParams.addon_services?.premium || 3} complimentary addons`,
        "Personalized consultation",
        "Complimentary beverage service",
        "Take-home product sample"
      ]
    },
    electronics_repair: {
      default: [
        "Comprehensive diagnostics and testing",
        "Premium or OEM replacement parts",
        `${industryParams.service_warranty?.premium || 180}-day repair warranty`,
        "Express turnaround service",
        "Complete device optimization and cleaning",
        "Data backup and recovery",
        "Protective accessories included"
      ]
    }
  };
  
  // Return job-specific features or industry default or general default
  return features[serviceIndustry]?.[jobType] || 
         features[serviceIndustry]?.default || 
         [
           "Premium service package",
           "Top-tier components",
           "1-year warranty",
           "Comprehensive coverage with extras",
           "Priority scheduling and service",
           "Complimentary add-ons and enhancements",
           "Exclusive client benefits"
         ];
}

/**
 * Main quote generation function with user profile integration
 */
function generateEnhancedQuote(data, userId) {
  // Determine service industry based on job type
  const serviceIndustry = mapJobTypeToIndustry(data.jobType);
  
  // Get dynamic parameters based on user profile and industry
  const parameters = getDynamicParameters(userId, serviceIndustry);
  
  // Calculate profit margin
  const marginData = calculateEnhancedProfitMargin(data, parameters);
  
  // Generate tiered pricing options
  const tiers = generateTieredOptions(data, parameters);
  
  // Compile quote information
  const quote = {
    quoteName: data.quoteName || `Quote for ${data.clientName || 'Client'}`,
    jobType: data.jobType,
    jobSubtype: data.jobSubtype,
    location: data.location,
    clientName: data.clientName,
    dateCreated: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    notes: data.notes || '',
    
    // Core calculation results
    laborRate: marginData.laborRate,
    laborHours: data.laborHours,
    laborCost: marginData.laborCost,
    materialsCost: marginData.materialsCost,
    materialMarkup: marginData.materialMarkup,
    materialsTax: marginData.materialsTax,
    total: marginData.total,
    
    // Profit analysis
    targetMargin: parameters.targetMargin,
    actualProfitMargin: marginData.actualProfitMargin,
    profit: marginData.profit,
    
    // Competitive context
    regionalAverageMargin: marginData.regionalAverageMargin,
    competitivePosition: marginData.competitivePosition,
    
    // User profile integration
    userExperienceLevel: parameters.experienceLevel,
    serviceIndustry: parameters.serviceIndustry,
    businessGoals: parameters.businessGoals,
    
    // Environment context
    season: parameters.currentSeason,
    seasonality: parameters.seasonality,
    
    // Tiered options
    tiers: tiers,
    
    // Recommendations based on all analysis
    recommendations: generateRecommendations(marginData, parameters, data)
  };
  
  return quote;
}

/**
 * Map job type to service industry
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
  
  return industryMap[jobType] || 'default';
}

/**
 * Generate customized recommendations based on quote analysis
 */
function generateRecommendations(marginData, parameters, data) {
  const recommendations = [];
  
  // Add competitive position recommendation
  recommendations.push(marginData.competitivePosition.recommendation);
  
  // Add margin-based recommendations
  if (marginData.actualProfitMargin < 15) {
    recommendations.push(`Your profit margin is very low at ${marginData.actualProfitMargin.toFixed(1)}%. Consider increasing prices or finding ways to reduce costs.`);
  } else if (marginData.actualProfitMargin > 45) {
    recommendations.push(`Your profit margin of ${marginData.actualProfitMargin.toFixed(1)}% is very high. While profitable, this may price you out of competitive bids. Consider offering value-adds or premium service guarantees.`);
  }
  
  // Add industry-specific recommendations
  switch (parameters.serviceIndustry) {
    case 'home_services':
      if (parameters.seasonality === "peak") {
        recommendations.push(`You're quoting during a peak season for ${parameters.serviceIndustry}. Consider adding a seasonal demand surcharge or highlighting limited availability to justify premium pricing.`);
      } else if (parameters.seasonality === "off_peak") {
        recommendations.push(`You're quoting during an off-peak season for ${parameters.serviceIndustry}. Consider offering a limited-time discount or package deals to incentivize bookings.`);
      }
      
      // Add recommendation based on service type
      if (data.jobType === 'plumbing' || data.jobType === 'electrical') {
        recommendations.push(`Consider offering a preventative maintenance package or annual service plan to create recurring revenue.`);
      }
      break;
      
    case 'automotive':
      recommendations.push(`For ${data.jobType}, successful shops in your region are offering free multi-point inspections as a lead generation tool, with a 60% upsell rate to additional services.`);
      
      if (data.jobType === 'oil_change') {
        recommendations.push(`Consider offering a subscription-based oil change package (3-5 changes per year) at a discounted rate to increase customer retention.`);
      }
      break;
      
    case 'beauty_wellness':
      recommendations.push(`For ${data.jobType}, top providers in your area are creating tiered service packages with take-home products included, increasing average transaction value by 35%.`);
      
      if (parameters.seasonality === "peak") {
        recommendations.push(`During this peak season, consider offering bundle packages or introducing a booking fee for prime time slots that can be applied to the service.`);
      }
      break;
      
    case 'electronics_repair':
      recommendations.push(`For ${data.jobType}, consider offering a "repair plus protection" package that includes the current repair plus a discounted extended warranty or insurance option.`);
      
      if (data.jobType === 'cellphone_repair' || data.jobType === 'computer_repair') {
        recommendations.push(`Adding data backup/recovery as a premium service has shown a 25% attachment rate and 40% profit margin for top providers in your industry.`);
      }
      break;
      
    case 'professional_services':
      recommendations.push(`Consider creating packaged services with clear deliverables and fixed pricing to improve conversion rates. Top firms report 30% higher close rates with defined packages versus hourly billing.`);
      break;
  }
  
  // Add recommendations based on business goals
  if (parameters.businessGoals.includes('attract_new_clients')) {
    recommendations.push(`To support your goal of attracting new clients, consider creating an introductory offer at 10-15% below your standard rate with clear explanation of regular pricing for future services.`);
  }
  
  if (parameters.businessGoals.includes('increase_revenue')) {
    recommendations.push(`To increase revenue, focus on upselling to your premium tier. Highlighting the cost-per-benefit ratio can help clients see the value in selecting higher-priced options.`);
  }
  
  return recommendations;
}

// Export functions
module.exports = {
  generateEnhancedQuote,
  calculateEnhancedProfitMargin,
  getDynamicParameters
};