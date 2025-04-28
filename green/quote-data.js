/**
 * Data file for quote generator
 * Contains reference data and market rates for quote generation
 */

// Market rates by job type and region (hourly rates)
const marketRates = {
  // Home Services
  'plumbing': {
    northeast: 125,
    southeast: 95,
    midwest: 90,
    southwest: 100,
    west: 130
  },
  'electrical': {
    northeast: 115,
    southeast: 90,
    midwest: 85,
    southwest: 95,
    west: 120
  },
  'hvac': {
    northeast: 120,
    southeast: 100,
    midwest: 95,
    southwest: 105,
    west: 125
  },
  'handyman': {
    northeast: 85,
    southeast: 65,
    midwest: 60,
    southwest: 70,
    west: 90
  },
  'locksmith': {
    northeast: 95,
    southeast: 75,
    midwest: 70,
    southwest: 80,
    west: 100
  },
  
  // Automotive
  'automotive_repair': {
    northeast: 110,
    southeast: 90,
    midwest: 85,
    southwest: 95,
    west: 115
  },
  'oil_change': {
    northeast: 85,
    southeast: 70,
    midwest: 65,
    southwest: 75,
    west: 90
  },
  'brake_service': {
    northeast: 110,
    southeast: 90,
    midwest: 85,
    southwest: 95,
    west: 115
  },
  'transmission': {
    northeast: 130,
    southeast: 110,
    midwest: 105,
    southwest: 115,
    west: 135
  },
  
  // Beauty/Wellness
  'hair_stylist': {
    northeast: 85,
    southeast: 65,
    midwest: 60,
    southwest: 70,
    west: 95
  },
  'nail_technician': {
    northeast: 70,
    southeast: 55,
    midwest: 50,
    southwest: 60,
    west: 80
  },
  'makeup_artist': {
    northeast: 110,
    southeast: 85,
    midwest: 80,
    southwest: 90,
    west: 120
  },
  'esthetician': {
    northeast: 95,
    southeast: 75,
    midwest: 70,
    southwest: 80,
    west: 100
  },
  
  // Electronics Repair
  'computer_repair': {
    northeast: 100,
    southeast: 80,
    midwest: 75,
    southwest: 85,
    west: 110
  },
  'cellphone_repair': {
    northeast: 85,
    southeast: 70,
    midwest: 65,
    southwest: 75,
    west: 90
  },
  'tv_repair': {
    northeast: 95,
    southeast: 80,
    midwest: 75,
    southwest: 85,
    west: 100
  },
  'appliance_repair': {
    northeast: 105,
    southeast: 85,
    midwest: 80,
    southwest: 90,
    west: 110
  },
  
  // Professional Services
  'legal_services': {
    northeast: 300,
    southeast: 250,
    midwest: 225,
    southwest: 240,
    west: 325
  },
  'accounting': {
    northeast: 200,
    southeast: 170,
    midwest: 160,
    southwest: 175,
    west: 220
  },
  'consulting': {
    northeast: 250,
    southeast: 200,
    midwest: 190,
    southwest: 210,
    west: 275
  },
  'design_services': {
    northeast: 125,
    southeast: 100,
    midwest: 95,
    southwest: 105,
    west: 135
  }
};

// Map states to regions
const stateToRegion = {
  // Northeast
  'ME': 'northeast',
  'NH': 'northeast',
  'VT': 'northeast',
  'MA': 'northeast',
  'RI': 'northeast',
  'CT': 'northeast',
  'NY': 'northeast',
  'NJ': 'northeast',
  'PA': 'northeast',
  
  // Southeast
  'DE': 'southeast',
  'MD': 'southeast',
  'DC': 'southeast',
  'VA': 'southeast',
  'WV': 'southeast',
  'KY': 'southeast',
  'NC': 'southeast',
  'SC': 'southeast',
  'TN': 'southeast',
  'GA': 'southeast',
  'FL': 'southeast',
  'AL': 'southeast',
  'MS': 'southeast',
  'AR': 'southeast',
  'LA': 'southeast',
  
  // Midwest
  'OH': 'midwest',
  'IN': 'midwest',
  'MI': 'midwest',
  'IL': 'midwest',
  'WI': 'midwest',
  'MN': 'midwest',
  'IA': 'midwest',
  'MO': 'midwest',
  'KS': 'midwest',
  'NE': 'midwest',
  'SD': 'midwest',
  'ND': 'midwest',
  
  // Southwest
  'TX': 'southwest',
  'OK': 'southwest',
  'NM': 'southwest',
  'AZ': 'southwest',
  
  // West
  'MT': 'west',
  'WY': 'west',
  'CO': 'west',
  'UT': 'west',
  'ID': 'west',
  'NV': 'west',
  'CA': 'west',
  'OR': 'west',
  'WA': 'west',
  'AK': 'west',
  'HI': 'west'
};

// State tax rates
const stateTaxRates = {
  'AK': 0.00,  // Alaska
  'AL': 0.09,  // Alabama
  'AR': 0.065, // Arkansas
  'AZ': 0.08,  // Arizona
  'CA': 0.0725,// California
  'CO': 0.029, // Colorado
  'CT': 0.0635,// Connecticut
  'DC': 0.06,  // District of Columbia
  'DE': 0.00,  // Delaware
  'FL': 0.06,  // Florida
  'GA': 0.04,  // Georgia
  'HI': 0.04,  // Hawaii
  'IA': 0.06,  // Iowa
  'ID': 0.06,  // Idaho
  'IL': 0.0625,// Illinois
  'IN': 0.07,  // Indiana
  'KS': 0.065, // Kansas
  'KY': 0.06,  // Kentucky
  'LA': 0.0445,// Louisiana
  'MA': 0.0625,// Massachusetts
  'MD': 0.06,  // Maryland
  'ME': 0.055, // Maine
  'MI': 0.06,  // Michigan
  'MN': 0.06875,// Minnesota
  'MO': 0.04225,// Missouri
  'MS': 0.07,  // Mississippi
  'MT': 0.00,  // Montana
  'NC': 0.0475,// North Carolina
  'ND': 0.05,  // North Dakota
  'NE': 0.055, // Nebraska
  'NH': 0.00,  // New Hampshire
  'NJ': 0.06625,// New Jersey
  'NM': 0.05125,// New Mexico
  'NV': 0.0685,// Nevada
  'NY': 0.04,  // New York
  'OH': 0.0575,// Ohio
  'OK': 0.045, // Oklahoma
  'OR': 0.00,  // Oregon
  'PA': 0.06,  // Pennsylvania
  'RI': 0.07,  // Rhode Island
  'SC': 0.06,  // South Carolina
  'SD': 0.045, // South Dakota
  'TN': 0.07,  // Tennessee
  'TX': 0.0625,// Texas
  'UT': 0.0595,// Utah
  'VA': 0.053, // Virginia
  'VT': 0.06,  // Vermont
  'WA': 0.065, // Washington
  'WI': 0.05,  // Wisconsin
  'WV': 0.06,  // West Virginia
  'WY': 0.04   // Wyoming
};

// Material markup data by industry
const materialMarkupRates = {
  'home_services': 1.3,      // 30% markup
  'automotive': 1.5,         // 50% markup
  'beauty_wellness': 2.0,    // 100% markup
  'electronics_repair': 1.4, // 40% markup
  'professional_services': 1.2 // 20% markup
};

// Export all data
module.exports = {
  marketRates,
  stateToRegion,
  stateTaxRates,
  materialMarkupRates
};