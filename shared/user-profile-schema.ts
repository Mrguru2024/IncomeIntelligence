import { z } from 'zod';

// Define the types of business goals users might have
export const BusinessGoalEnum = z.enum([
  'increase_revenue',
  'reduce_costs',
  'expand_services',
  'improve_efficiency',
  'attract_new_clients',
  'retain_existing_clients',
  'enter_new_markets',
  'improve_quality',
  'build_brand'
]);

// Define the common challenges users might face
export const BusinessChallengeEnum = z.enum([
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
]);

// Define service preferences that influence quotes
export const ServicePreferenceEnum = z.enum([
  'value_oriented', // Prefers cost-effective solutions
  'quality_oriented', // Prefers premium quality regardless of price
  'speed_oriented', // Values quick turnaround time
  'relationship_oriented', // Values long-term relationships
  'detail_oriented', // Focused on precision and exactness
  'reliability_oriented' // Values consistency and dependability
]);

// Define the service industry the user operates in
export const ServiceIndustryEnum = z.enum([
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
]);

// Define the experience level of the user
export const ExperienceLevelEnum = z.enum([
  'junior', // 1-2 years
  'intermediate', // 3-5 years
  'senior', // 6-10 years
  'expert' // 10+ years
]);

// Define the user profile schema
export const userProfileSchema = z.object({
  userId: z.string(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  serviceIndustry: ServiceIndustryEnum.optional(),
  experienceLevel: ExperienceLevelEnum.optional(),
  
  // Business parameters
  targetMargin: z.number().min(0).max(100).default(30), // Default 30%
  businessGoals: z.array(BusinessGoalEnum).optional(),
  businessChallenges: z.array(BusinessChallengeEnum).optional(),
  servicePreferences: z.array(ServicePreferenceEnum).optional(),
  
  // Service behavior and history
  preferredJobTypes: z.array(z.string()).optional(), // Array of job types the user commonly creates quotes for
  averageLaborRate: z.number().optional(), // Average labor rate used in past quotes
  averageLaborHours: z.number().optional(), // Average labor hours for past quotes
  averageMaterialCost: z.number().optional(), // Average material cost for past quotes
  
  // Quote behavior
  quoteHistory: z.array(z.object({
    jobType: z.string(),
    jobSubtype: z.string().optional(),
    totalAmount: z.number(),
    date: z.string(),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
    margin: z.number().optional(),
  })).optional(),
  
  // Last updated
  lastUpdated: z.string().default(() => new Date().toISOString()),
  createdAt: z.string().default(() => new Date().toISOString()),
});

// Define the type from the schema
export type UserProfile = z.infer<typeof userProfileSchema>;

// Create a request schema for user profile updates
export const updateUserProfileSchema = userProfileSchema.partial().omit({ userId: true, createdAt: true });
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;