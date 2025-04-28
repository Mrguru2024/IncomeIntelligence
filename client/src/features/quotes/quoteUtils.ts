/**
 * Enhanced Quote Generator Utilities for Stackr
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
export function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// Types for seasonality factors
type Season = 'spring' | 'summer' | 'fall' | 'winter';
type IndustrySeasonality = Record<Season, number>;
interface SeasonalityFactors {
  [key: string]: IndustrySeasonality;
}

// Get industry seasonality factor
export function getIndustrySeasonality(industry: string, season: Season): number {
  const seasonalityFactors: SeasonalityFactors = {
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
    hvac: {
      spring: 1.15, summer: 1.3, fall: 1.0, winter: 1.2
    },
    roofing: {
      spring: 1.2, summer: 1.15, fall: 1.1, winter: 0.8
    },
    cleaning: {
      spring: 1.2, summer: 1.0, fall: 1.1, winter: 0.95
    },
    painting: {
      spring: 1.15, summer: 1.1, fall: 1.05, winter: 0.9
    },
    locksmith: {
      spring: 1.0, summer: 1.0, fall: 1.0, winter: 1.0
    },
    flooring: {
      spring: 1.05, summer: 1.0, fall: 1.1, winter: 0.95
    },
    security: {
      spring: 1.0, summer: 1.05, fall: 1.0, winter: 1.05
    },
    beauty: {
      spring: 1.1, summer: 1.15, fall: 1.0, winter: 1.05
    },
    electronics: {
      spring: 0.95, summer: 1.0, fall: 1.05, winter: 1.2
    },
    graphicDesign: {
      spring: 1.0, summer: 0.95, fall: 1.05, winter: 1.1
    }
  };

  // Default to 1.0 (no adjustment) if industry not found
  if (!seasonalityFactors[industry]) {
    return 1.0;
  }

  return seasonalityFactors[industry][season];
}

// Get base profit margin by industry
export function getBaseMargin(industry: string): number {
  const baseMargins: Record<string, number> = {
    construction: 0.25,
    landscaping: 0.30,
    automotive: 0.35,
    plumbing: 0.40,
    electrical: 0.35,
    hvac: 0.30,
    roofing: 0.25,
    cleaning: 0.45,
    painting: 0.35,
    locksmith: 0.50,
    flooring: 0.30,
    security: 0.35,
    beauty: 0.45,
    electronics: 0.40,
    graphicDesign: 0.50
  };

  // Default to 0.35 (35%) if industry not found
  return baseMargins[industry] || 0.35;
}

// Calculate profit margin based on experience level
export function calculateExperienceMargin(experienceYears: number): number {
  if (experienceYears < 1) return 0.15;
  if (experienceYears < 3) return 0.22;
  if (experienceYears < 5) return 0.28;
  if (experienceYears < 10) return 0.35;
  if (experienceYears < 15) return 0.40;
  return 0.45;
}

// Calculate tiered pricing for services
export interface TieredPrice {
  basic: number;
  standard: number;
  premium: number;
}

export function calculateTieredPricing(basePrice: number): TieredPrice {
  return {
    basic: basePrice * 0.85,
    standard: basePrice,
    premium: basePrice * 1.25
  };
}

// Calculate pricing for different service providers based on their experience
export function calculateCompetitivePricing(
  basePrice: number, 
  experienceYears: number, 
  industry: string
): number {
  const baseMargin = getBaseMargin(industry);
  const experienceMargin = calculateExperienceMargin(experienceYears);
  const season = getCurrentSeason();
  const seasonalFactor = getIndustrySeasonality(industry, season as Season);
  
  // Calculate adjusted price based on margin, experience, and seasonality
  const adjustedPrice = basePrice * (1 + ((baseMargin + experienceMargin) / 2)) * seasonalFactor;
  
  return Math.round(adjustedPrice * 100) / 100; // Round to 2 decimal places
}

// Line item structure for quote breakdowns
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

// Quote tier definitions
export type QuoteTier = 'basic' | 'standard' | 'premium';

// Quote data structure
export interface QuoteData {
  id?: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  industry: string;
  serviceType: string;
  description: string;
  experienceYears: number;
  profitMargin: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  tieredPricing: {
    basic: number;
    standard: number;
    premium: number;
  };
  selectedTier?: QuoteTier;
}

// Create an empty quote template
export function createEmptyQuote(userId: string): QuoteData {
  const now = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(now.getDate() + 30); // Default 30 day expiry
  
  return {
    userId,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    industry: 'automotive',
    serviceType: '',
    description: '',
    experienceYears: 5,
    profitMargin: 0.35,
    createdAt: now,
    expiresAt: expiryDate,
    status: 'draft',
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    tieredPricing: {
      basic: 0,
      standard: 0,
      premium: 0
    }
  };
}

// Calculate quote totals
export function calculateQuoteTotals(quote: QuoteData): QuoteData {
  // Calculate subtotal from line items
  const subtotal = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
  
  // Apply tax rate (default 7%)
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Calculate tiered pricing
  const tieredPricing = calculateTieredPricing(total);
  
  return {
    ...quote,
    subtotal,
    tax,
    total,
    tieredPricing
  };
}