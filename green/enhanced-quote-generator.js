/**
 * Enhanced Quote Generator for Stackr
 * 
 * Features:
 * - Dynamic profit margin calculations based on industry standards
 * - Regional competitive positioning analysis
 * - Tiered pricing options (Basic, Standard, Premium)
 * - User profile integration for personalized quotes
 * - Seasonal adjustments for pricing
 * - Experience-based pricing recommendations
 */

// Utility function to get current season
function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// Get industry seasonality factor
function getIndustrySeasonality(industry, season) {
  const seasonalityFactors = {
    construction: {
      spring: 1.15, summer: 1.2, fall: 1.05, winter: 0.9
    },
    landscaping: {
      spring: 1.3, summer: 1.15, fall: 1.1, winter: 0.7
    },
    automotive: {
      spring: 1.05, summer: 1.1, fall: 1.05, winter: 1.15
    },
    plumbing: {
      spring: 1.1, summer: 0.95, fall: 1.0, winter: 1.2
    },
    electrical: {
      spring: 1.05, summer: 1.1, fall: 1.0, winter: 1.05
    },
    locksmith: {
      spring: 1.0, summer: 1.0, fall: 1.0, winter: 1.05
    },
    cleaning: {
      spring: 1.2, summer: 1.0, fall: 1.1, winter: 0.9
    },
    beauty: {
      spring: 1.1, summer: 1.15, fall: 1.05, winter: 0.95
    },
    graphic_design: {
      spring: 1.0, summer: 0.95, fall: 1.1, winter: 1.0
    },
    electronics_repair: {
      spring: 0.95, summer: 1.0, fall: 1.05, winter: 1.15
    },
    default: {
      spring: 1.0, summer: 1.0, fall: 1.0, winter: 1.0
    }
  };
  
  const industryFactors = seasonalityFactors[industry] || seasonalityFactors.default;
  return industryFactors[season];
}

/**
 * Get dynamic parameters based on user profile and industry
 * This allows for personalized quotes that reflect the user's business
 */
import { getUserProfile } from './user-profile.js';

function getDynamicParameters(userId, serviceIndustry) {
  try {
    // Try to get parameters from user profile if userId is provided
    if (userId) {
      const userProfile = getUserProfile(userId);
      
      if (userProfile && userProfile.industryParameters) {
        // Return industry-specific parameters from user profile
        return userProfile.industryParameters[serviceIndustry] || getDefaultParameters(serviceIndustry);
      }
    }
    
    // Fallback to default parameters
    return getDefaultParameters(serviceIndustry);
  } catch (error) {
    console.warn('Error getting dynamic parameters:', error);
    return getDefaultParameters(serviceIndustry);
  }
}

/**
 * Default parameters by industry if user profile is not available
 */
function getDefaultParameters(serviceIndustry) {
  const defaultParams = {
    construction: {
      baseMargin: 0.25,
      laborMultiplier: 1.8,
      materialMarkup: 0.2,
      experienceWeight: 0.05,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      }
    },
    automotive: {
      baseMargin: 0.30,
      laborMultiplier: 1.7,
      materialMarkup: 0.25,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      complexity: {
        low: 0.85,
        medium: 1.0,
        high: 1.25
      }
    },
    plumbing: {
      baseMargin: 0.28,
      laborMultiplier: 1.75,
      materialMarkup: 0.22,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.15
      }
    },
    electrical: {
      baseMargin: 0.27,
      laborMultiplier: 1.8,
      materialMarkup: 0.2,
      experienceWeight: 0.05,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      }
    },
    locksmith: {
      baseMargin: 0.35,
      laborMultiplier: 1.6,
      materialMarkup: 0.3,
      experienceWeight: 0.03,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.1
      }
    },
    cleaning: {
      baseMargin: 0.33,
      laborMultiplier: 1.5,
      materialMarkup: 0.15,
      experienceWeight: 0.02,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.1
      }
    },
    beauty: {
      baseMargin: 0.40,
      laborMultiplier: 1.4,
      materialMarkup: 0.25,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.15
      }
    },
    landscaping: {
      baseMargin: 0.28,
      laborMultiplier: 1.65,
      materialMarkup: 0.2,
      experienceWeight: 0.03,
      regionFactor: 1.0,
      complexity: {
        low: 0.85,
        medium: 1.0,
        high: 1.2
      }
    },
    graphic_design: {
      baseMargin: 0.45,
      laborMultiplier: 1.0,
      materialMarkup: 0.0,
      experienceWeight: 0.08,
      regionFactor: 1.0,
      complexity: {
        low: 0.8,
        medium: 1.0,
        high: 1.3
      }
    },
    electronics_repair: {
      baseMargin: 0.32,
      laborMultiplier: 1.6,
      materialMarkup: 0.3,
      experienceWeight: 0.05,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      }
    },
    default: {
      baseMargin: 0.3,
      laborMultiplier: 1.7,
      materialMarkup: 0.2,
      experienceWeight: 0.04,
      regionFactor: 1.0,
      complexity: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      }
    }
  };
  
  return defaultParams[serviceIndustry] || defaultParams.default;
}

/**
 * Enhanced profit margin calculation with advanced formula
 * Accounts for industry standards, experience level, and regional factors
 */
function calculateEnhancedProfitMargin(data, parameters) {
  // Base values
  const baseMargin = parameters.baseMargin;
  const complexity = data.complexity || 'medium';
  const complexityFactor = parameters.complexity[complexity] || 1.0;
  
  // Experience adjustment (0-30 years)
  const experienceYears = Math.min(30, parseInt(data.experienceYears) || 0);
  const experienceMultiplier = 1 + (experienceYears * parameters.experienceWeight);
  
  // Get seasonal adjustment
  const season = getCurrentSeason();
  const seasonality = getIndustrySeasonality(data.serviceIndustry, season);
  
  // Regional adjustment
  const regionFactor = parameters.regionFactor;
  
  // Competition adjustment
  const competitionLevel = data.competitionLevel || 'medium';
  let competitionFactor = 1.0;
  if (competitionLevel === 'high') competitionFactor = 0.92;
  if (competitionLevel === 'low') competitionFactor = 1.08;
  
  // Urgency adjustment
  const isUrgent = data.isUrgent || false;
  const urgencyFactor = isUrgent ? 1.15 : 1.0;
  
  // Calculate final margin with all factors
  const calculatedMargin = baseMargin * complexityFactor * experienceMultiplier * 
    seasonality * regionFactor * competitionFactor * urgencyFactor;
  
  // Round to the nearest 0.5% and ensure reasonable bounds
  return Math.max(0.15, Math.min(0.6, Math.round(calculatedMargin * 200) / 200));
}

/**
 * Get regional margin data for competitive positioning
 */
function getRegionalMarginData(jobType, region) {
  // Regional average margins by job type and region
  // This would ideally come from a database of competitive intelligence
  const regionalMargins = {
    'Bathroom Remodel': {
      'Northeast': 0.28,
      'Southeast': 0.25,
      'Midwest': 0.23,
      'Southwest': 0.24,
      'West': 0.29,
      'default': 0.25
    },
    'Oil Change': {
      'Northeast': 0.35,
      'Southeast': 0.32,
      'Midwest': 0.30,
      'Southwest': 0.33,
      'West': 0.38,
      'default': 0.33
    },
    'Haircut': {
      'Northeast': 0.42,
      'Southeast': 0.38,
      'Midwest': 0.36,
      'Southwest': 0.37,
      'West': 0.43,
      'default': 0.40
    },
    'Logo Design': {
      'Northeast': 0.48,
      'Southeast': 0.43,
      'Midwest': 0.40,
      'Southwest': 0.42,
      'West': 0.50,
      'default': 0.45
    },
    'default': {
      'Northeast': 0.32,
      'Southeast': 0.29,
      'Midwest': 0.27,
      'Southwest': 0.28,
      'West': 0.33,
      'default': 0.30
    }
  };
  
  const jobMargins = regionalMargins[jobType] || regionalMargins.default;
  return jobMargins[region] || jobMargins.default;
}

/**
 * Determine competitive position compared to regional average
 */
function determineCompetitivePosition(actualMargin, regionalAverage) {
  const difference = ((actualMargin - regionalAverage) / regionalAverage) * 100;
  
  if (difference < -10) return { position: 'below-market', percentDiff: Math.abs(difference) };
  if (difference > 10) return { position: 'above-market', percentDiff: difference };
  return { position: 'at-market', percentDiff: Math.abs(difference) };
}

/**
 * Extract state from location string
 */
function getStateFromLocation(location) {
  // Basic state extraction
  const stateAbbrs = {
    'AL': 'Southeast', 'AK': 'West', 'AZ': 'Southwest', 'AR': 'Southeast',
    'CA': 'West', 'CO': 'West', 'CT': 'Northeast', 'DE': 'Northeast',
    'FL': 'Southeast', 'GA': 'Southeast', 'HI': 'West', 'ID': 'West',
    'IL': 'Midwest', 'IN': 'Midwest', 'IA': 'Midwest', 'KS': 'Midwest',
    'KY': 'Southeast', 'LA': 'Southeast', 'ME': 'Northeast', 'MD': 'Northeast',
    'MA': 'Northeast', 'MI': 'Midwest', 'MN': 'Midwest', 'MS': 'Southeast',
    'MO': 'Midwest', 'MT': 'West', 'NE': 'Midwest', 'NV': 'West',
    'NH': 'Northeast', 'NJ': 'Northeast', 'NM': 'Southwest', 'NY': 'Northeast',
    'NC': 'Southeast', 'ND': 'Midwest', 'OH': 'Midwest', 'OK': 'Southwest',
    'OR': 'West', 'PA': 'Northeast', 'RI': 'Northeast', 'SC': 'Southeast',
    'SD': 'Midwest', 'TN': 'Southeast', 'TX': 'Southwest', 'UT': 'West',
    'VT': 'Northeast', 'VA': 'Southeast', 'WA': 'West', 'WV': 'Southeast',
    'WI': 'Midwest', 'WY': 'West'
  };
  
  // Try to find a state abbreviation in the location string
  for (const [abbr, region] of Object.entries(stateAbbrs)) {
    if (location.includes(abbr) || location.includes(abbr.toLowerCase())) {
      return region;
    }
  }
  
  // Try to match state names
  const stateNames = {
    'Alabama': 'Southeast', 'Alaska': 'West', 'Arizona': 'Southwest', 'Arkansas': 'Southeast',
    'California': 'West', 'Colorado': 'West', 'Connecticut': 'Northeast', 'Delaware': 'Northeast',
    'Florida': 'Southeast', 'Georgia': 'Southeast', 'Hawaii': 'West', 'Idaho': 'West',
    'Illinois': 'Midwest', 'Indiana': 'Midwest', 'Iowa': 'Midwest', 'Kansas': 'Midwest',
    'Kentucky': 'Southeast', 'Louisiana': 'Southeast', 'Maine': 'Northeast', 'Maryland': 'Northeast',
    'Massachusetts': 'Northeast', 'Michigan': 'Midwest', 'Minnesota': 'Midwest', 'Mississippi': 'Southeast',
    'Missouri': 'Midwest', 'Montana': 'West', 'Nebraska': 'Midwest', 'Nevada': 'West',
    'New Hampshire': 'Northeast', 'New Jersey': 'Northeast', 'New Mexico': 'Southwest', 'New York': 'Northeast',
    'North Carolina': 'Southeast', 'North Dakota': 'Midwest', 'Ohio': 'Midwest', 'Oklahoma': 'Southwest',
    'Oregon': 'West', 'Pennsylvania': 'Northeast', 'Rhode Island': 'Northeast', 'South Carolina': 'Southeast',
    'South Dakota': 'Midwest', 'Tennessee': 'Southeast', 'Texas': 'Southwest', 'Utah': 'West',
    'Vermont': 'Northeast', 'Virginia': 'Southeast', 'Washington': 'West', 'West Virginia': 'Southeast',
    'Wisconsin': 'Midwest', 'Wyoming': 'West'
  };
  
  for (const [name, region] of Object.entries(stateNames)) {
    if (location.includes(name)) {
      return region;
    }
  }
  
  // Default to "unknown" region if no match
  return 'default';
}

/**
 * Generate tiered pricing options with appropriate parameters
 * for different service levels
 */
function generateTieredOptions(data, parameters) {
  const baseMargin = parameters.baseMargin;
  
  // Define tier-specific margins
  const tierMargins = {
    basic: baseMargin * 0.85,
    standard: baseMargin,
    premium: baseMargin * 1.25
  };
  
  // Get industry for tier descriptions
  const serviceIndustry = data.serviceIndustry || mapJobTypeToIndustry(data.jobType);
  
  // Calculate base costs (labor + materials without profit)
  const laborHours = parseFloat(data.laborHours) || 0;
  const laborRate = parseFloat(data.laborRate) || 75;
  const materialCost = parseFloat(data.materialCost) || 0;
  
  const baseLaborCost = laborHours * laborRate;
  const baseCosts = baseLaborCost + materialCost;
  
  // Generate tier options
  const basicTotal = Math.round(baseCosts / (1 - tierMargins.basic));
  const standardTotal = Math.round(baseCosts / (1 - tierMargins.standard));
  const premiumTotal = Math.round(baseCosts / (1 - tierMargins.premium));
  
  // Get tier descriptions
  const basicDescription = getBasicDescription(serviceIndustry, data.jobType);
  const standardDescription = getStandardDescription(serviceIndustry, data.jobType);
  const premiumDescription = getPremiumDescription(serviceIndustry, data.jobType);
  
  // Calculate actual profit amounts
  const basicProfit = basicTotal - baseCosts;
  const standardProfit = standardTotal - baseCosts;
  const premiumProfit = premiumTotal - baseCosts;
  
  return {
    basic: {
      name: "Basic",
      description: basicDescription,
      price: basicTotal,
      profit: basicProfit,
      profitMargin: tierMargins.basic,
      features: getBasicFeatures(serviceIndustry, data.jobType, parameters)
    },
    standard: {
      name: "Standard",
      description: standardDescription,
      price: standardTotal,
      profit: standardProfit,
      profitMargin: tierMargins.standard,
      features: getStandardFeatures(serviceIndustry, data.jobType, parameters),
      recommended: true
    },
    premium: {
      name: "Premium",
      description: premiumDescription,
      price: premiumTotal,
      profit: premiumProfit,
      profitMargin: tierMargins.premium,
      features: getPremiumFeatures(serviceIndustry, data.jobType, parameters)
    }
  };
}

/**
 * Get tier descriptions based on industry and job type
 */
function getBasicDescription(serviceIndustry, jobType) {
  const descriptions = {
    construction: "Essential service with standard materials and no frills.",
    automotive: "Basic service using standard parts and materials.",
    plumbing: "Standard repair with basic fixtures and components.",
    electrical: "Basic electrical work with standard components.",
    locksmith: "Standard lock service with basic hardware.",
    cleaning: "Basic cleaning service for standard maintenance.",
    beauty: "Standard service with basic styling products.",
    landscaping: "Basic landscaping with standard plants and materials.",
    graphic_design: "Simple design with limited revisions.",
    electronics_repair: "Basic repair with standard parts."
  };
  
  return descriptions[serviceIndustry] || "Basic service package with essential elements.";
}

function getStandardDescription(serviceIndustry, jobType) {
  const descriptions = {
    construction: "Complete service with quality materials and standard warranty.",
    automotive: "Comprehensive service with quality parts and standard warranty.",
    plumbing: "Complete plumbing service with quality fixtures and components.",
    electrical: "Comprehensive electrical service with quality components.",
    locksmith: "Complete lock service with quality hardware and additional security features.",
    cleaning: "Thorough cleaning service with premium products.",
    beauty: "Complete service with premium styling products.",
    landscaping: "Comprehensive landscaping with quality plants and materials.",
    graphic_design: "Professional design with multiple revisions and format options.",
    electronics_repair: "Comprehensive repair with quality parts and extended testing."
  };
  
  return descriptions[serviceIndustry] || "Standard service package with quality materials and comprehensive coverage.";
}

function getPremiumDescription(serviceIndustry, jobType) {
  const descriptions = {
    construction: "Premium service with top-tier materials, extended warranty and priority scheduling.",
    automotive: "Premium service with top-quality parts, extended warranty and complimentary extras.",
    plumbing: "Premium plumbing service with high-end fixtures and extended warranty.",
    electrical: "Premium electrical service with high-end components and smart home integration.",
    locksmith: "Premium lock service with high-security hardware and smart lock options.",
    cleaning: "Premium cleaning service with eco-friendly products and detailed attention.",
    beauty: "Premium service with luxury products and extended consultation.",
    landscaping: "Premium landscaping with exotic plants and custom features.",
    graphic_design: "Premium design with unlimited revisions, multiple concepts, and all file formats.",
    electronics_repair: "Premium repair with highest quality parts and extended warranty."
  };
  
  return descriptions[serviceIndustry] || "Premium service package with top-tier materials and exclusive benefits.";
}

/**
 * Generate tier-specific features based on industry and job type
 */
function getBasicFeatures(serviceIndustry, jobType, industryParams) {
  const basicFeatures = {
    construction: [
      "Standard materials",
      "30-day workmanship guarantee",
      "Standard cleanup",
      "Regular scheduling"
    ],
    automotive: [
      "Standard parts",
      "90-day parts warranty",
      "Basic inspection",
      "Regular scheduling"
    ],
    plumbing: [
      "Standard fixtures",
      "30-day warranty",
      "Basic cleanup",
      "Regular scheduling"
    ],
    electrical: [
      "Standard components",
      "Basic testing",
      "30-day warranty",
      "Regular scheduling"
    ],
    locksmith: [
      "Standard hardware",
      "Basic security",
      "30-day warranty",
      "Regular scheduling"
    ],
    cleaning: [
      "Standard cleaning products",
      "Basic surfaces cleaned",
      "Regular scheduling",
      "Satisfaction guarantee"
    ],
    beauty: [
      "Standard products",
      "Basic consultation",
      "Regular scheduling",
      "Basic styling"
    ],
    landscaping: [
      "Standard plants and materials",
      "Basic design",
      "Regular scheduling",
      "30-day plant guarantee"
    ],
    graphic_design: [
      "1 design concept",
      "2 revisions",
      "Standard file formats",
      "5-day delivery"
    ],
    electronics_repair: [
      "Standard replacement parts",
      "Basic testing",
      "30-day warranty",
      "Regular scheduling"
    ]
  };
  
  return basicFeatures[serviceIndustry] || [
    "Essential service",
    "Standard materials",
    "Basic warranty",
    "Regular scheduling"
  ];
}

function getStandardFeatures(serviceIndustry, jobType, industryParams) {
  const standardFeatures = {
    construction: [
      "Quality materials",
      "1-year workmanship guarantee",
      "Thorough cleanup",
      "Flexible scheduling",
      "Detailed documentation"
    ],
    automotive: [
      "Quality OEM-equivalent parts",
      "1-year parts warranty",
      "Comprehensive inspection",
      "Flexible scheduling",
      "Detailed service report"
    ],
    plumbing: [
      "Quality fixtures",
      "1-year warranty",
      "Thorough cleanup",
      "Flexible scheduling",
      "Follow-up inspection"
    ],
    electrical: [
      "Quality components",
      "Comprehensive testing",
      "1-year warranty",
      "Flexible scheduling",
      "Code compliance guarantee"
    ],
    locksmith: [
      "Quality hardware",
      "Enhanced security features",
      "1-year warranty",
      "Flexible scheduling",
      "Security assessment"
    ],
    cleaning: [
      "Premium cleaning products",
      "All surfaces cleaned",
      "Flexible scheduling",
      "Satisfaction guarantee",
      "Follow-up inspection"
    ],
    beauty: [
      "Premium products",
      "Extended consultation",
      "Flexible scheduling",
      "Enhanced styling",
      "Product recommendations"
    ],
    landscaping: [
      "Quality plants and materials",
      "Custom design",
      "Flexible scheduling",
      "1-year plant guarantee",
      "Seasonal maintenance plan"
    ],
    graphic_design: [
      "2 design concepts",
      "5 revisions",
      "Multiple file formats",
      "3-day delivery",
      "Social media optimization"
    ],
    electronics_repair: [
      "Quality replacement parts",
      "Comprehensive testing",
      "1-year warranty",
      "Flexible scheduling",
      "Performance optimization"
    ]
  };
  
  return standardFeatures[serviceIndustry] || [
    "Comprehensive service",
    "Quality materials",
    "1-year warranty",
    "Flexible scheduling",
    "Detailed documentation"
  ];
}

function getPremiumFeatures(serviceIndustry, jobType, industryParams) {
  const premiumFeatures = {
    construction: [
      "Premium materials",
      "5-year workmanship guarantee",
      "White-glove cleanup",
      "Priority scheduling",
      "Detailed documentation",
      "Project manager assigned",
      "Complimentary follow-ups"
    ],
    automotive: [
      "Premium OEM parts",
      "3-year parts warranty",
      "Comprehensive inspection",
      "Priority scheduling",
      "Detailed service report",
      "Complimentary detailing",
      "Loaner vehicle available"
    ],
    plumbing: [
      "Premium fixtures",
      "5-year warranty",
      "White-glove cleanup",
      "Priority scheduling",
      "Regular maintenance checks",
      "24/7 emergency support",
      "Water efficiency upgrades"
    ],
    electrical: [
      "Premium components",
      "Comprehensive testing",
      "5-year warranty",
      "Priority scheduling",
      "Code compliance guarantee",
      "Smart home integration",
      "Energy efficiency consultation"
    ],
    locksmith: [
      "High-security hardware",
      "Smart lock options",
      "5-year warranty",
      "Priority scheduling",
      "Comprehensive security assessment",
      "24/7 emergency support",
      "Security system integration"
    ],
    cleaning: [
      "Eco-friendly premium products",
      "Deep cleaning of all surfaces",
      "Priority scheduling",
      "Satisfaction guarantee",
      "Regular maintenance plan",
      "Special treatments included",
      "Personalized cleaning protocol"
    ],
    beauty: [
      "Luxury products",
      "Extended consultation",
      "Priority scheduling",
      "Advanced styling techniques",
      "Take-home product package",
      "Complimentary touch-up appointment",
      "Personalized style guide"
    ],
    landscaping: [
      "Exotic plants and premium materials",
      "Custom design with 3D visualization",
      "Priority scheduling",
      "5-year plant guarantee",
      "Comprehensive maintenance plan",
      "Irrigation system installation",
      "Seasonal decor changes"
    ],
    graphic_design: [
      "5 unique design concepts",
      "Unlimited revisions",
      "All file formats included",
      "1-day rush delivery",
      "Social media optimization",
      "Brand style guide",
      "Marketing consultation"
    ],
    electronics_repair: [
      "Premium replacement parts",
      "Comprehensive testing suite",
      "5-year warranty",
      "Priority scheduling",
      "Performance optimization",
      "Protective case included",
      "Data backup service"
    ]
  };
  
  return premiumFeatures[serviceIndustry] || [
    "Premium service",
    "Top-tier materials",
    "5-year extended warranty",
    "Priority scheduling",
    "Dedicated account manager",
    "Complimentary add-ons",
    "24/7 support"
  ];
}

/**
 * Main quote generation function with user profile integration
 */
function generateEnhancedQuote(data, userId) {
  try {
    // Map job type to service industry if not provided
    const serviceIndustry = data.serviceIndustry || mapJobTypeToIndustry(data.jobType);
    data.serviceIndustry = serviceIndustry;

    // Get dynamic parameters based on user profile and industry
    const parameters = getDynamicParameters(userId, serviceIndustry);
    
    // Calculate enhanced profit margin
    const enhancedMargin = calculateEnhancedProfitMargin(data, parameters);
    
    // Get region from location
    const region = getStateFromLocation(data.location);
    
    // Get regional average for competitive positioning
    const regionalAverage = getRegionalMarginData(data.jobType, region);
    
    // Determine competitive position
    const competitivePosition = determineCompetitivePosition(enhancedMargin, regionalAverage);
    
    // Generate tiered pricing options
    const tierOptions = generateTieredOptions(data, parameters);
    
    // Generate recommendations based on analysis
    const recommendations = generateRecommendations({
      margin: enhancedMargin,
      regional: regionalAverage,
      position: competitivePosition
    }, parameters, data);
    
    // Calculate base costs
    const laborHours = parseFloat(data.laborHours) || 0;
    const laborRate = parseFloat(data.laborRate) || 75;
    const materialCost = parseFloat(data.materialCost) || 0;
    
    const baseLaborCost = laborHours * laborRate;
    const baseCost = baseLaborCost + materialCost;
    
    // Calculate total with profit margin
    const totalPrice = Math.round(baseCost / (1 - enhancedMargin));
    const profit = totalPrice - baseCost;
    
    // Format the date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Include the current season in the response
    const currentSeason = getCurrentSeason();
    const seasonalityFactor = getIndustrySeasonality(serviceIndustry, currentSeason);
    
    // Determine deposit requirements based on job total
    let depositPercent = totalPrice > 2000 ? 25 : 50;
    let depositAmount = Math.round(totalPrice * (depositPercent / 100));
    
    // Return the enhanced quote
    return {
      quoteDate: formattedDate,
      jobType: data.jobType,
      serviceIndustry: serviceIndustry,
      location: data.location,
      region: region,
      customerName: data.customerName || "Customer",
      description: data.description || `${data.jobType} service`,
      
      // Pricing breakdown
      laborHours: laborHours,
      laborRate: laborRate,
      laborCost: baseLaborCost,
      materialCost: materialCost,
      subtotal: baseCost,
      profitMargin: enhancedMargin,
      profitAmount: profit,
      total: totalPrice,
      
      // Payment terms
      depositRequired: totalPrice > 500, // Only require deposit for jobs over $500
      depositPercent: depositPercent,
      depositAmount: depositAmount,
      balanceDue: totalPrice - depositAmount,
      
      // Competitive positioning
      regionalAverage: regionalAverage,
      competitivePosition: competitivePosition,
      
      // Seasonal factors
      season: currentSeason,
      seasonalityFactor: seasonalityFactor,
      
      // Tiered options
      tierOptions: tierOptions,
      
      // Recommendations
      recommendations: recommendations
    };
  } catch (error) {
    console.error('Error generating enhanced quote:', error);
    throw new Error(`Failed to generate quote: ${error.message}`);
  }
}

/**
 * Map job type to service industry
 */
function mapJobTypeToIndustry(jobType) {
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
 * Generate customized recommendations based on quote analysis
 */
function generateRecommendations(marginData, parameters, data) {
  const recommendations = [];
  
  // Competitive positioning recommendations
  if (marginData.position.position === 'above-market' && marginData.position.percentDiff > 15) {
    recommendations.push({
      type: 'pricing',
      title: 'Consider competitive adjustment',
      description: `Your margin is ${marginData.position.percentDiff.toFixed(1)}% above regional averages. Consider adjusting if experiencing customer resistance.`,
      priority: 'medium'
    });
  } else if (marginData.position.position === 'below-market' && marginData.position.percentDiff > 15) {
    recommendations.push({
      type: 'pricing',
      title: 'Potential for margin improvement',
      description: `Your margin is ${marginData.position.percentDiff.toFixed(1)}% below regional averages. Consider increasing prices to improve profitability.`,
      priority: 'high'
    });
  }
  
  // Season-specific recommendations
  const season = getCurrentSeason();
  if (season === 'winter' && data.serviceIndustry === 'construction') {
    recommendations.push({
      type: 'seasonal',
      title: 'Winter construction incentive',
      description: 'Consider offering a winter discount to attract customers during this typically slower season for construction.',
      priority: 'medium'
    });
  } else if (season === 'spring' && data.serviceIndustry === 'landscaping') {
    recommendations.push({
      type: 'seasonal',
      title: 'Spring demand premium',
      description: 'Spring is peak season for landscaping. Consider a slight premium for priority scheduling.',
      priority: 'high'
    });
  }
  
  // Experience-based recommendations
  const experienceYears = parseInt(data.experienceYears) || 0;
  if (experienceYears < 2) {
    recommendations.push({
      type: 'experience',
      title: 'New business positioning',
      description: 'As a newer service provider, consider emphasizing customer service and satisfaction guarantees to overcome experience concerns.',
      priority: 'high'
    });
  } else if (experienceYears > 10) {
    recommendations.push({
      type: 'experience',
      title: 'Leverage your expertise',
      description: 'With over 10 years of experience, emphasize your expertise and track record to justify premium pricing.',
      priority: 'medium'
    });
  }
  
  // Payment terms recommendations
  const total = parseFloat(data.total) || 0;
  if (total > 1000) {
    recommendations.push({
      type: 'payment',
      title: 'Offer payment options',
      description: 'For this higher-value job, consider offering payment plans or financing options to improve conversion rate.',
      priority: 'medium'
    });
  }
  
  // Upsell recommendations based on job type
  if (data.jobType === 'Bathroom Remodel') {
    recommendations.push({
      type: 'upsell',
      title: 'Fixture package upsell',
      description: 'Offer a premium fixture package as an upsell opportunity.',
      priority: 'low'
    });
  } else if (data.jobType === 'Lawn Mowing') {
    recommendations.push({
      type: 'upsell',
      title: 'Maintenance package',
      description: 'Offer a seasonal maintenance package for recurring revenue.',
      priority: 'high'
    });
  }
  
  return recommendations;
}

// Export functions for use in the application
export {
  generateEnhancedQuote,
  calculateEnhancedProfitMargin,
  getDynamicParameters,
  getCurrentSeason,
  getIndustrySeasonality,
  generateTieredOptions
};