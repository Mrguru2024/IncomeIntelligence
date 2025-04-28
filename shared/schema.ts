import { pgTable, text, serial, integer, boolean, timestamp, numeric, json, jsonb, decimal, date, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Stackr Subscription Plans Definition
 * 
 * This defines the subscription plans available in the application:
 * - Free: Basic features with limited functionality
 * - Pro: Advanced features with premium functionality
 * - Lifetime: One-time purchase for permanent Pro access
 */
export const subscriptionPlans = [
  {
    id: "free",
    name: "Stackr Free",
    description: "Basic financial tracking and management tools",
    price: 0,
    billingPeriod: "monthly",
    features: [
      "Manual income tracking",
      "Basic expense categorization",
      "Simple budget planning",
      "40/30/30 allocation tracking",
      "Simple goal setting",
      "Basic financial insights",
      "2 active goals limit"
    ],
    limitedFeatures: [
      "No AI-powered financial advice",
      "Limited voice commands",
      "No offline mode",
      "No customizable categories",
      "Standard notifications only"
    ]
  },
  {
    id: "pro",
    name: "Stackr Pro",
    description: "Advanced financial tools for professionals",
    price: 9.99,
    trialDays: 14,
    billingPeriod: "monthly",
    annualPrice: 99.99,
    features: [
      "Unlimited manual income tracking",
      "AI-powered expense categorization",
      "Advanced budget planning",
      "Custom income allocation ratios",
      "Unlimited goals with tracking",
      "AI financial analysis and advice",
      "Voice commands and automation",
      "Offline mode access",
      "Custom categories and tags",
      "Priority notifications",
      "Income generation features",
      "Affiliate program access",
      "Access to money challenges",
      "Invoice generator tools",
      "Early access to new features"
    ]
  },
  {
    id: "lifetime",
    name: "Stackr Lifetime",
    description: "One-time purchase for permanent Pro access",
    price: 99.99,
    billingPeriod: "onetime",
    features: [
      "All Pro features",
      "Lifetime access",
      "No recurring payments",
      "Premium support",
      "Early access to all future features",
      "Exclusive content and guides"
    ]
  }
];

// User profile options and enums
export const occupationTypes = [
  { id: "tradesperson", name: "Tradesperson" },
  { id: "locksmith", name: "Locksmith" },
  { id: "contractor", name: "Contractor" },
  { id: "plumber", name: "Plumber" },
  { id: "electrician", name: "Electrician" },
  { id: "repair", name: "Repair Service" },
  { id: "consultant", name: "Consultant" },
  { id: "freelancer", name: "Freelancer" },
  { id: "self_employed", name: "Self-Employed" },
  { id: "other", name: "Other" }
];

export const financialHealthStatuses = [
  { id: "building", name: "Building", description: "Starting to build financial foundation" },
  { id: "stable", name: "Stable", description: "Maintaining stable finances" },
  { id: "growing", name: "Growing", description: "Actively growing wealth" },
  { id: "established", name: "Established", description: "Well-established financial position" }
];

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User profile for detailed personal and financial information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  occupation: text("occupation"),
  occupationDetails: text("occupation_details"),
  businessName: text("business_name"),
  yearsInBusiness: integer("years_in_business"),
  averageMonthlyIncome: numeric("average_monthly_income"),
  
  // Goals and Aspirations
  financialGoals: json("financial_goals"), // Array of goal objects
  lifeGoals: json("life_goals"), // Array of goal objects
  shortTermGoals: json("short_term_goals"), // 0-2 years
  mediumTermGoals: json("medium_term_goals"), // 2-5 years
  longTermGoals: json("long_term_goals"), // 5+ years
  
  // Financial Status
  financialHealthStatus: text("financial_health_status"),
  riskTolerance: text("risk_tolerance"), // low, medium, high
  isSoleProvider: boolean("is_sole_provider"),
  hasEmergencyFund: boolean("has_emergency_fund"),
  emergencyFundAmount: numeric("emergency_fund_amount"),
  
  // Contact and Preferences
  preferredContactMethod: text("preferred_contact_method"), // email, phone, app
  spendingPersonalityType: text("spending_personality_type"),
  
  // Lifestyle Data
  lifestyleType: text("lifestyle_type"), // urban, suburban, rural, nomadic, etc.
  livingArrangement: text("living_arrangement"), // rent, own, shared, etc.
  transportationMethod: text("transportation_method"), // car, public transit, bike, walk, etc.
  familySize: integer("family_size"),
  hasChildren: boolean("has_children"),
  numberOfChildren: integer("number_of_children"),
  
  // Strengths and Limitations
  financialStrengths: json("financial_strengths"), // Array of strengths
  financialWeaknesses: json("financial_weaknesses"), // Areas for improvement
  skillsAndExpertise: json("skills_and_expertise"), // Professional/personal skills for potential income
  
  // Pain Points and Challenges
  financialPainPoints: json("financial_pain_points"), // Key challenges the user faces
  stressFactors: json("stress_factors"), // What causes financial stress
  improvementAreas: json("improvement_areas"), // Areas the user wants to improve
  
  // Income Split Preferences
  incomeSplitProfile: text("income_split_profile").default("balanced"), // Default to the classic 40/30/30 split
  customIncomeSplitNeeds: integer("custom_income_split_needs").default(40),
  customIncomeSplitInvestments: integer("custom_income_split_investments").default(30),
  customIncomeSplitSavings: integer("custom_income_split_savings").default(30),
  
  // App Preferences
  widgetEnabled: boolean("widget_enabled").notNull().default(false),
  remindersEnabled: boolean("reminders_enabled").notNull().default(true),
  notificationsEmail: boolean("notifications_email").notNull().default(true),
  notificationsPush: boolean("notifications_push").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  occupation: true,
  occupationDetails: true,
  businessName: true,
  yearsInBusiness: true,
  averageMonthlyIncome: true,
  
  // Goals
  financialGoals: true,
  lifeGoals: true,
  shortTermGoals: true,
  mediumTermGoals: true,
  longTermGoals: true,
  
  // Financial Status
  financialHealthStatus: true,
  riskTolerance: true,
  isSoleProvider: true,
  hasEmergencyFund: true,
  emergencyFundAmount: true,
  
  // Contact and Preferences
  preferredContactMethod: true,
  spendingPersonalityType: true,
  
  // Lifestyle Data
  lifestyleType: true, 
  livingArrangement: true,
  transportationMethod: true,
  familySize: true,
  hasChildren: true,
  numberOfChildren: true,
  
  // Strengths and Weaknesses
  financialStrengths: true,
  financialWeaknesses: true,
  skillsAndExpertise: true,
  
  // Pain Points
  financialPainPoints: true,
  stressFactors: true,
  improvementAreas: true,
  
  // Income Split
  incomeSplitProfile: true,
  customIncomeSplitNeeds: true,
  customIncomeSplitInvestments: true,
  customIncomeSplitSavings: true,
  
  // App Settings
  widgetEnabled: true,
  remindersEnabled: true,
  notificationsEmail: true,
  notificationsPush: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Define income categories
export const incomeCategories = [
  { id: "service", name: "Service Job", icon: "wrench", color: "blue" },
  { id: "emergency", name: "Emergency Call", icon: "bell", color: "red" },
  { id: "installation", name: "Installation", icon: "settings", color: "purple" },
  { id: "consulting", name: "Consulting", icon: "messagesSquare", color: "indigo" },
  { id: "repair", name: "Repair", icon: "tool", color: "amber" },
  { id: "retail", name: "Retail Sale", icon: "shoppingBag", color: "green" },
  { id: "gig", name: "Stackr Gig", icon: "briefcase", color: "teal" },
  { id: "affiliate", name: "Affiliate Income", icon: "link", color: "pink" },
  { id: "referral", name: "Referral Bonus", icon: "userPlus", color: "violet" },
  { id: "digital", name: "Digital Product", icon: "smartphone", color: "cyan" },
  { id: "challenge", name: "Money Challenge", icon: "target", color: "rose" },
  { id: "investment", name: "Investment", icon: "trendingUp", color: "lime" },
  { id: "sale", name: "Used Gear Sale", icon: "package", color: "orange" },
  { id: "invoice", name: "Client Invoice", icon: "fileText", color: "sky" },
  { id: "grant", name: "Stackr Grant", icon: "award", color: "emerald" },
  { id: "other", name: "Other", icon: "moreHorizontal", color: "gray" }
];

// Income entry schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  source: text("source").notNull().default("Manual"),
  category: text("category").notNull().default("other"), // New category field
  userId: text("user_id"),
  notes: text("notes"),
});

// Create the base schema
const baseInsertIncomeSchema = createInsertSchema(incomes).pick({
  description: true,
  amount: true,
  date: true,
  source: true,
  category: true,
  userId: true,
  notes: true,
});

// Extend it to handle date conversion
export const insertIncomeSchema = baseInsertIncomeSchema.extend({
  // Override the date field to accept both string and Date objects
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomes.$inferSelect;

// Helper function to get category by ID
export function getCategoryById(categoryId: string) {
  return incomeCategories.find(cat => cat.id === categoryId) || incomeCategories[incomeCategories.length - 1]; // Default to "Other"
}

// Invoices schema
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  deliveryMethod: text("delivery_method").default("email"), // email, sms, both
  lineItems: jsonb("line_items").notNull(),
  total: numeric("total").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentMethod: text("payment_method").notNull(), // online, mobile, in_person
  paymentType: text("payment_type"), // card, cash, zelle, etc for in_person payments
  paid: boolean("paid").default(false),
  stripePaymentIntent: text("stripe_payment_intent"),
  stripeTerminalId: text("stripe_terminal_id"),
  paidAt: timestamp("paid_at"),
  invoiceNumber: text("invoice_number").notNull(),
  invoicePdf: text("invoice_pdf"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).extend({
  // Convert dueDate from string or Date to Date
  dueDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
  // Line items should be an array of objects
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    amount: z.number().nonnegative()
  })),
  // Make client phone optional
  clientPhone: z.string().optional(),
  // Define valid delivery methods
  deliveryMethod: z.enum(['email', 'sms', 'both']).default('email')
}).omit({ id: true, paidAt: true, invoicePdf: true });

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Stackr Gigs schema
export const stackrGigs = pgTable("stackr_gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("open"), // open, assigned, completed, cancelled
  requesterUserId: text("requester_user_id").notNull(), // User who created the gig
  assignedUserId: text("assigned_user_id"), // User who accepted the gig
  category: text("category").notNull(),
  skills: json("skills"), // Array of required skills
  estimatedHours: numeric("estimated_hours"),
  dueDate: timestamp("due_date"),
  completionDate: timestamp("completion_date"),
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, processing, paid
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  location: text("location"), // Online or physical location
  hasAttachments: boolean("has_attachments").default(false),
});

const baseInsertStackrGigSchema = createInsertSchema(stackrGigs).pick({
  title: true,
  description: true,
  amount: true,
  status: true,
  requesterUserId: true,
  assignedUserId: true,
  category: true,
  skills: true,
  estimatedHours: true,
  dueDate: true,
  completionDate: true,
  paymentStatus: true,
  location: true,
  hasAttachments: true,
});

// Extend it to handle date conversion
export const insertStackrGigSchema = baseInsertStackrGigSchema.extend({
  dueDate: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined) return null;
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date().nullable()
  ),
  completionDate: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined) return null;
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date().nullable()
  ),
});

export type InsertStackrGig = z.infer<typeof insertStackrGigSchema>;
export type StackrGig = typeof stackrGigs.$inferSelect;

// Affiliate Programs schema
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  category: text("category").notNull(),
  commissionRate: text("commission_rate").notNull(),
  payoutThreshold: numeric("payout_threshold"),
  payoutSchedule: text("payout_schedule"),
  termsUrl: text("terms_url"),
  signupUrl: text("signup_url").notNull(),
  logoUrl: text("logo_url"),
  status: text("status").notNull().default("active"), // active, inactive
  tags: json("tags"), // Array of tags for searching
  aiRecommendationScore: integer("ai_recommendation_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  featured: boolean("featured").default(false),
});

export const insertAffiliateProgramSchema = createInsertSchema(affiliatePrograms).pick({
  name: true,
  description: true,
  company: true,
  category: true,
  commissionRate: true,
  payoutThreshold: true,
  payoutSchedule: true,
  termsUrl: true,
  signupUrl: true,
  logoUrl: true,
  status: true,
  tags: true,
  aiRecommendationScore: true,
  featured: true,
});

export type InsertAffiliateProgram = z.infer<typeof insertAffiliateProgramSchema>;
export type AffiliateProgram = typeof affiliatePrograms.$inferSelect;

// User Affiliates schema (tracks which programs a user is part of)
export const userAffiliates = pgTable("user_affiliates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  programId: integer("program_id").notNull(),
  affiliateId: text("affiliate_id"), // User's ID in the affiliate program
  referralCode: text("referral_code"),
  referralUrl: text("referral_url"),
  dateJoined: timestamp("date_joined").notNull().defaultNow(),
  totalEarnings: numeric("total_earnings").default("0"),
  status: text("status").notNull().default("active"), // active, inactive
  lastPayout: timestamp("last_payout"),
  notes: text("notes"),
});

// Discount Codes Schema
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'percentage', 'fixed', 'free_months'
  value: numeric("value").notNull(), // Percentage or fixed amount
  maxUses: integer("max_uses"), // Maximum number of times this code can be used
  currentUses: integer("current_uses").default(0),
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdBy: integer("created_by"), // Admin or user who created the code
  createdAt: timestamp("created_at").notNull().defaultNow(),
  applicablePlans: json("applicable_plans"), // Array of plan IDs this code can be applied to
  referralBased: boolean("referral_based").default(false), // Is this a referral-generated code?
  referrerId: integer("referrer_id"), // User who referred and gets credit
  minimumSubscriptionMonths: integer("minimum_subscription_months").default(1),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).pick({
  code: true,
  type: true,
  value: true,
  maxUses: true,
  validFrom: true,
  validUntil: true,
  isActive: true,
  description: true,
  createdBy: true,
  applicablePlans: true,
  referralBased: true,
  referrerId: true,
  minimumSubscriptionMonths: true,
});

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;

// Discount Code Usage Schema (tracks which users have used which codes)
export const discountCodeUsage = pgTable("discount_code_usage", {
  id: serial("id").primaryKey(),
  codeId: integer("code_id").notNull(),
  userId: text("user_id").notNull(),
  appliedToOrder: text("applied_to_order"),
  usedAt: timestamp("used_at").notNull().defaultNow(),
  discountAmount: numeric("discount_amount").notNull(), // The actual discount amount applied
  planId: text("plan_id").notNull(), // Which plan this was applied to
  referrerId: integer("referrer_id"), // If referral-based, the user who gets credit
});

export const insertDiscountCodeUsageSchema = createInsertSchema(discountCodeUsage).pick({
  codeId: true,
  userId: true,
  appliedToOrder: true,
  discountAmount: true,
  planId: true,
  referrerId: true,
});

export type InsertDiscountCodeUsage = z.infer<typeof insertDiscountCodeUsageSchema>;
export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;

export const insertUserAffiliateSchema = createInsertSchema(userAffiliates).pick({
  userId: true,
  programId: true,
  affiliateId: true,
  referralCode: true,
  referralUrl: true,
  totalEarnings: true,
  status: true,
  lastPayout: true,
  notes: true,
});

export type InsertUserAffiliate = z.infer<typeof insertUserAffiliateSchema>;
export type UserAffiliate = typeof userAffiliates.$inferSelect;

// Digital Products schema
export const digitalProducts = pgTable("digital_products", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Creator of the product
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  category: text("category").notNull(),
  fileUrl: text("file_url"), // URL to download the product
  previewUrl: text("preview_url"), // URL for preview image/content
  downloadCount: integer("download_count").default(0),
  published: boolean("published").default(false),
  created: timestamp("created").notNull().defaultNow(),
  updated: timestamp("updated").notNull().defaultNow(),
  stripePriceId: text("stripe_price_id"), // For Stripe integration
  tags: json("tags"), // Array of tags for searching
  version: text("version").default("1.0"),
  ratings: json("ratings"), // Array of rating objects
  averageRating: numeric("average_rating"),
});

export const insertDigitalProductSchema = createInsertSchema(digitalProducts).pick({
  userId: true,
  title: true,
  description: true,
  price: true,
  category: true,
  fileUrl: true,
  previewUrl: true,
  downloadCount: true,
  published: true,
  stripePriceId: true,
  tags: true,
  version: true,
  ratings: true,
  averageRating: true,
});

export type InsertDigitalProduct = z.infer<typeof insertDigitalProductSchema>;
export type DigitalProduct = typeof digitalProducts.$inferSelect;

// Money Challenges schema
export const moneyChallenges = pgTable("money_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  days: integer("days").notNull(), // Duration in days
  amount: numeric("amount").notNull(), // Amount to be earned/saved
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  category: text("category").notNull(),
  instructions: json("instructions"), // Array of steps to complete
  pointsReward: integer("points_reward").notNull().default(50),
  badgeId: integer("badge_id"), // Optional badge to be awarded
  active: boolean("active").default(true),
  created: timestamp("created").notNull().defaultNow(),
  startDate: timestamp("start_date"), // When challenge becomes available
  endDate: timestamp("end_date"), // When challenge expires
  featured: boolean("featured").default(false),
});

export const insertMoneyChallengeSchema = createInsertSchema(moneyChallenges).pick({
  title: true,
  description: true,
  days: true,
  amount: true,
  difficulty: true,
  category: true,
  instructions: true,
  pointsReward: true,
  badgeId: true,
  active: true,
  startDate: true,
  endDate: true,
  featured: true,
});

export type InsertMoneyChallenge = z.infer<typeof insertMoneyChallengeSchema>;
export type MoneyChallenge = typeof moneyChallenges.$inferSelect;

// User Challenges schema (tracks user participation in challenges)
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  completionDate: timestamp("completion_date"),
  status: text("status").notNull().default("in_progress"), // not_started, in_progress, completed, failed
  progress: integer("progress").default(0), // Percentage completed
  currentDay: integer("current_day").default(1),
  dailyLogs: json("daily_logs"), // Array of daily activity logs
  pointsEarned: integer("points_earned").default(0),
  notes: text("notes"),
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).pick({
  userId: true,
  challengeId: true,
  startDate: true,
  completionDate: true,
  status: true,
  progress: true,
  currentDay: true,
  dailyLogs: true,
  pointsEarned: true,
  notes: true,
});

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

// Investment Strategies schema
export const investmentStrategies = pgTable("investment_strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  riskLevel: text("risk_level").notNull(), // low, medium, high
  timeHorizon: text("time_horizon").notNull(), // short, medium, long
  minimumInvestment: numeric("minimum_investment"),
  category: text("category").notNull(),
  returnPotential: text("return_potential").notNull(),
  steps: json("steps"), // Array of steps to implement the strategy
  resources: json("resources"), // Array of resource links
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  featured: boolean("featured").default(false),
  forSubscribersOnly: boolean("for_subscribers_only").default(false),
});

export const insertInvestmentStrategySchema = createInsertSchema(investmentStrategies).pick({
  name: true,
  description: true,
  riskLevel: true,
  timeHorizon: true,
  minimumInvestment: true,
  category: true,
  returnPotential: true,
  steps: true,
  resources: true,
  featured: true,
  forSubscribersOnly: true,
});

export type InsertInvestmentStrategy = z.infer<typeof insertInvestmentStrategySchema>;
export type InvestmentStrategy = typeof investmentStrategies.$inferSelect;

// Used Gear Listings schema
export const usedGearListings = pgTable("used_gear_listings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  images: json("images"), // Array of image URLs
  status: text("status").notNull().default("active"), // active, sold, withdrawn
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  contactMethod: text("contact_method").notNull().default("app"), // app, email, phone
  tags: json("tags"), // Array of searchable tags
  sold: boolean("sold").default(false),
  soldPrice: numeric("sold_price"),
  soldDate: timestamp("sold_date"),
});

export const insertUsedGearListingSchema = createInsertSchema(usedGearListings).pick({
  userId: true,
  title: true,
  description: true,
  price: true,
  category: true,
  condition: true,
  location: true,
  images: true,
  status: true,
  contactMethod: true,
  tags: true,
  sold: true,
  soldPrice: true,
  soldDate: true,
});

export type InsertUsedGearListing = z.infer<typeof insertUsedGearListingSchema>;
export type UsedGearListing = typeof usedGearListings.$inferSelect;

// Creative Grants schema
export const creativeGrants = pgTable("creative_grants", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  category: text("category").notNull(),
  applicationDeadline: timestamp("application_deadline").notNull(),
  announcementDate: timestamp("announcement_date").notNull(),
  eligibilityCriteria: json("eligibility_criteria"), // JSON array of criteria
  submissionRequirements: json("submission_requirements"), // JSON array of requirements
  status: text("status").notNull().default("open"), // open, reviewing, closed, awarded
  maxApplicants: integer("max_applicants"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  winnerUserId: text("winner_user_id"),
});

export const insertCreativeGrantSchema = createInsertSchema(creativeGrants).pick({
  title: true,
  description: true,
  amount: true,
  category: true,
  applicationDeadline: true,
  announcementDate: true,
  eligibilityCriteria: true,
  submissionRequirements: true,
  status: true,
  maxApplicants: true,
  winnerUserId: true,
});

export type InsertCreativeGrant = z.infer<typeof insertCreativeGrantSchema>;
export type CreativeGrant = typeof creativeGrants.$inferSelect;

// Grant Applications schema
export const grantApplications = pgTable("grant_applications", {
  id: serial("id").primaryKey(),
  grantId: integer("grant_id").notNull(),
  userId: text("user_id").notNull(),
  applicationDate: timestamp("application_date").notNull().defaultNow(),
  status: text("status").notNull().default("submitted"), // submitted, under_review, accepted, rejected
  submissionContent: json("submission_content"), // JSON containing the application content
  reviewNotes: text("review_notes"),
  reviewerId: integer("reviewer_id"),
  reviewDate: timestamp("review_date"),
  score: integer("score"),
});

export const insertGrantApplicationSchema = createInsertSchema(grantApplications).pick({
  grantId: true,
  userId: true,
  status: true,
  submissionContent: true,
  reviewNotes: true,
  reviewerId: true,
  reviewDate: true,
  score: true,
});

export type InsertGrantApplication = z.infer<typeof insertGrantApplicationSchema>;
export type GrantApplication = typeof grantApplications.$inferSelect;

// Referral System schema
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerUserId: text("referrer_user_id").notNull(),
  referredEmail: text("referred_email").notNull(),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("pending"), // pending, registered, subscribed, expired
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  dateRegistered: timestamp("date_registered"),
  referredUserId: text("referred_user_id"),
  rewardClaimed: boolean("reward_claimed").default(false),
  rewardAmount: numeric("reward_amount"),
  rewardType: text("reward_type"), // points, cash, subscription_extension
  expirationDate: timestamp("expiration_date"),
  campaignId: text("campaign_id"),
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerUserId: true,
  referredEmail: true,
  referralCode: true,
  status: true,
  referredUserId: true,
  rewardClaimed: true,
  rewardAmount: true,
  rewardType: true,
  expirationDate: true,
  campaignId: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Define goal types
export const goalTypes = [
  { id: "savings", name: "Savings", icon: "piggyBank", color: "green" },
  { id: "investments", name: "Investments", icon: "barChart", color: "purple" },
  { id: "needs", name: "Needs", icon: "home", color: "blue" },
  { id: "income", name: "Income", icon: "wallet", color: "amber" }
];

// Goals schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  type: text("type").notNull(),
  deadline: timestamp("deadline"),
  isCompleted: boolean("is_completed").notNull().default(false),
  startDate: timestamp("start_date").notNull().defaultNow(),
  userId: text("user_id"),
  description: text("description"),
});

// Create the base schema
const baseInsertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  targetAmount: true,
  currentAmount: true,
  type: true,
  deadline: true,
  isCompleted: true,
  startDate: true,
  userId: true,
  description: true,
});

// Extend it to handle date conversion
export const insertGoalSchema = baseInsertGoalSchema.extend({
  // Override the date fields to accept both string and Date objects
  deadline: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined) return null;
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date().nullable()
  ),
  startDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Helper function to get goal type by ID
export function getGoalTypeById(typeId: string) {
  return goalTypes.find(type => type.id === typeId) || { id: "savings", name: "Savings", icon: "piggyBank", color: "green" };
}

// Bank connections schema
export const bankConnections = pgTable("bank_connections", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  institutionId: text("institution_id").notNull(),
  institutionName: text("institution_name").notNull(),
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull(),
  status: text("status").notNull().default("active"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  metadata: jsonb("metadata"),
});

// Create the base schema
const baseInsertBankConnectionSchema = createInsertSchema(bankConnections).pick({
  userId: true,
  institutionId: true,
  institutionName: true,
  accessToken: true,
  itemId: true,
  status: true,
  metadata: true,
});

export const insertBankConnectionSchema = baseInsertBankConnectionSchema;

export type InsertBankConnection = z.infer<typeof insertBankConnectionSchema>;
export type BankConnection = typeof bankConnections.$inferSelect;

// Bank accounts schema
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull().references(() => bankConnections.id),
  accountId: text("account_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  subtype: text("subtype"),
  mask: text("mask"),
  balanceAvailable: numeric("balance_available"),
  balanceCurrent: numeric("balance_current"),
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Create the base schema
const baseInsertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  connectionId: true,
  accountId: true,
  name: true,
  type: true,
  subtype: true,
  mask: true,
  balanceAvailable: true,
  balanceCurrent: true,
  isActive: true,
});

export const insertBankAccountSchema = baseInsertBankAccountSchema;

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

// Bank Transactions schema
export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => bankAccounts.id),
  transactionId: text("transaction_id").notNull(),
  amount: decimal("amount").notNull(),
  date: date("date").notNull(),
  name: text("name").notNull(),
  merchantName: text("merchant_name"),
  category: text("category").array(),
  pending: boolean("pending").notNull().default(false),
  importedAsIncome: boolean("imported_as_income").notNull().default(false),
  metadata: jsonb("metadata"),
});

// Create the base schema
const baseInsertBankTransactionSchema = createInsertSchema(bankTransactions).pick({
  accountId: true,
  transactionId: true,
  amount: true,
  date: true,
  name: true,
  merchantName: true,
  category: true,
  pending: true,
  importedAsIncome: true,
  metadata: true,
});

// Extend it to handle date conversion
export const insertBankTransactionSchema = baseInsertBankTransactionSchema.extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;

// Define expense categories with 40/30/30 allocation tags 
// (needs:40%, investments:30%, savings:30%)
export const expenseCategories = [
  { id: "housing", name: "Housing", icon: "home", color: "slate", priority: "needs" },
  { id: "food", name: "Food & Groceries", icon: "utensils", color: "red", priority: "needs" },
  { id: "transportation", name: "Transportation", icon: "car", color: "blue", priority: "needs" },
  { id: "utilities", name: "Utilities", icon: "plug", color: "amber", priority: "needs" },
  { id: "healthcare", name: "Healthcare", icon: "stethoscope", color: "emerald", priority: "needs" },
  { id: "personal", name: "Personal", icon: "user", color: "purple", priority: "other" },
  { id: "entertainment", name: "Entertainment", icon: "film", color: "pink", priority: "other" },
  { id: "education", name: "Education", icon: "graduationCap", color: "indigo", priority: "investments" },
  { id: "debt", name: "Debt", icon: "creditCard", color: "rose", priority: "needs" },
  { id: "savings", name: "Savings", icon: "piggyBank", color: "green", priority: "savings" },
  { id: "other", name: "Other", icon: "moreHorizontal", color: "gray", priority: "other" }
];

// Expenses schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  category: text("category").notNull().default("other"),
  userId: text("user_id"),
  paymentMethod: text("payment_method").default("cash"),
  location: text("location"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPeriod: text("recurring_period"),
  offlineCreated: boolean("offline_created").default(false),
  offlineId: text("offline_id").unique(),
});

// Create the base schema
const baseInsertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  date: true,
  category: true,
  userId: true,
  paymentMethod: true,
  location: true,
  notes: true,
  isRecurring: true,
  recurringPeriod: true,
  offlineCreated: true,
  offlineId: true,
});

// Extend it to handle date conversion
export const insertExpenseSchema = baseInsertExpenseSchema.extend({
  // Override the date field to accept both string and Date objects
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Helper function to get expense category by ID
export function getExpenseCategoryById(categoryId: string) {
  return expenseCategories.find(cat => cat.id === categoryId) || expenseCategories[expenseCategories.length - 1]; // Default to "Other"
}

// Spending Personality Types
export const spendingPersonalityTypes = [
  { id: "saver", name: "The Saver", description: "Cautious with money, focused on security and future stability", traits: ["thrifty", "patient", "methodical", "security-focused"] },
  { id: "investor", name: "The Investor", description: "Strategic with money, sees finances as tools for growth", traits: ["analytical", "strategic", "growth-oriented", "calculated risk-taker"] },
  { id: "spender", name: "The Spender", description: "Lives in the moment, uses money for experiences and enjoyment", traits: ["spontaneous", "experience-driven", "generous", "present-focused"] },
  { id: "debtor", name: "The Debtor", description: "Struggles with managing credit, often spends beyond means", traits: ["impulsive", "optimistic", "comfort-seeking", "pressure-sensitive"] },
  { id: "avoider", name: "The Avoider", description: "Prefers not to think about finances and money management", traits: ["inattentive", "anxious", "procrastinating", "overwhelmed"] },
  { id: "security_seeker", name: "The Security Seeker", description: "Plans extensively to protect against financial risks", traits: ["cautious", "protective", "detail-oriented", "conservative"] },
  { id: "status_focused", name: "The Status Focused", description: "Uses money to signal achievement and social position", traits: ["image-conscious", "ambitious", "competitive", "quality-focused"] },
  { id: "minimalist", name: "The Minimalist", description: "Values simplicity and reduced consumption", traits: ["intentional", "quality-focused", "frugal", "values-driven"] },
];

// Recommended Income Split Profiles
export const incomeSplitProfiles = [
  { 
    id: "wealth_builder", 
    name: "Wealth Builder", 
    needs: 30, 
    investments: 50, 
    savings: 20, 
    description: "Aggressive growth focus with higher emphasis on investments",
    recommendedFor: ["investor", "minimalist"],
    incomeRange: { min: 5000, max: null },
    financialHealth: ["stable", "growing", "established"]
  },
  { 
    id: "balanced", 
    name: "Balanced Growth", 
    needs: 40, 
    investments: 30, 
    savings: 30, 
    description: "The classic 40/30/30 balanced approach",
    recommendedFor: ["saver", "investor", "security_seeker"],
    incomeRange: { min: 3000, max: null },
    financialHealth: ["building", "stable", "growing", "established"]
  },
  { 
    id: "stability_first", 
    name: "Stability First", 
    needs: 50, 
    investments: 20, 
    savings: 30, 
    description: "Focus on covering needs and building security",
    recommendedFor: ["saver", "security_seeker", "avoider"],
    incomeRange: { min: 2000, max: 5000 },
    financialHealth: ["building", "stable"]
  },
  { 
    id: "debt_reducer", 
    name: "Debt Reducer", 
    needs: 60, 
    investments: 10, 
    savings: 30, 
    description: "Higher allocation for needs to tackle existing debt",
    recommendedFor: ["debtor", "avoider"],
    incomeRange: { min: 0, max: 4000 },
    financialHealth: ["building"]
  },
  { 
    id: "lifestyle_plus", 
    name: "Lifestyle Plus", 
    needs: 50, 
    investments: 30, 
    savings: 20, 
    description: "Balance lifestyle needs with future planning",
    recommendedFor: ["spender", "status_focused"],
    incomeRange: { min: 4000, max: null },
    financialHealth: ["stable", "growing", "established"]
  },
  { 
    id: "freedom_seeker", 
    name: "Freedom Seeker", 
    needs: 30, 
    investments: 40, 
    savings: 30, 
    description: "Focus on investments for financial independence",
    recommendedFor: ["investor", "minimalist"],
    incomeRange: { min: 3500, max: null },
    financialHealth: ["stable", "growing", "established"]
  },
  { 
    id: "high_earner", 
    name: "High Earner", 
    needs: 25, 
    investments: 50, 
    savings: 25, 
    description: "Optimized for high income with aggressive investment strategy",
    recommendedFor: ["investor", "status_focused"],
    incomeRange: { min: 7500, max: null },
    financialHealth: ["growing", "established"]
  },
  { 
    id: "new_starter", 
    name: "New Starter", 
    needs: 55, 
    investments: 15, 
    savings: 30, 
    description: "For those just starting their financial journey",
    recommendedFor: ["saver", "avoider", "debtor"],
    incomeRange: { min: 0, max: 3000 },
    financialHealth: ["building"]
  }
];

// Balance tracking schema
export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  beginningBalance: numeric("beginning_balance").notNull(),
  currentBalance: numeric("current_balance").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Create the balance schema
const baseInsertBalanceSchema = createInsertSchema(balances).pick({
  userId: true,
  beginningBalance: true,
  currentBalance: true,
  month: true,
  year: true,
});

export const insertBalanceSchema = baseInsertBalanceSchema;

export type InsertBalance = z.infer<typeof insertBalanceSchema>;
export type Balance = typeof balances.$inferSelect;

// Gamification System

// Define achievement types
export const achievementTypes = [
  { id: "income", name: "Income Achievements", icon: "wallet", color: "blue" },
  { id: "savings", name: "Savings Achievements", icon: "piggyBank", color: "green" },
  { id: "streak", name: "Streak Achievements", icon: "flame", color: "amber" },
  { id: "goals", name: "Goal Achievements", icon: "target", color: "purple" },
  { id: "expense", name: "Expense Achievements", icon: "receipt", color: "red" },
  { id: "milestone", name: "Milestone Achievements", icon: "trophy", color: "yellow" }
];

// Achievements schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  pointsValue: integer("points_value").notNull().default(10),
  icon: text("icon"),
  level: integer("level").notNull().default(1),
  criteria: json("criteria").notNull(), // JSON data with criteria for unlocking
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const baseInsertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  category: true,
  pointsValue: true,
  icon: true,
  level: true,
  criteria: true,
});

export const insertAchievementSchema = baseInsertAchievementSchema;

// User Achievements junction table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  dateEarned: timestamp("date_earned").notNull().defaultNow(),
  progress: json("progress"), // For tracking partial progress
});

const baseInsertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  progress: true,
});

export const insertUserAchievementSchema = baseInsertUserAchievementSchema;

// Gamification Profile
export const gamificationProfiles = pgTable("gamification_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  totalPointsEarned: integer("total_points_earned").notNull().default(0),
  milestones: json("milestones"), // JSON array of milestones reached
  achievements: json("achievements"), // Summary of achievements earned
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const baseInsertGamificationProfileSchema = createInsertSchema(gamificationProfiles).pick({
  userId: true,
  points: true,
  level: true,
  streak: true,
  lastActive: true,
  totalPointsEarned: true,
  milestones: true,
  achievements: true,
});

export const insertGamificationProfileSchema = baseInsertGamificationProfileSchema.extend({
  lastActive: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

// Point Transactions - history of points earned/spent
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(), // Positive = earned, Negative = spent
  reason: text("reason").notNull(),
  source: text("source").notNull(), // achievement, milestone, etc.
  sourceId: integer("source_id"), // Optional ID reference to the source
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
});

const baseInsertPointTransactionSchema = createInsertSchema(pointTransactions).pick({
  userId: true,
  amount: true,
  reason: true,
  source: true,
  sourceId: true,
});

export const insertPointTransactionSchema = baseInsertPointTransactionSchema;

// Types for gamification
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type GamificationProfile = typeof gamificationProfiles.$inferSelect;
export type InsertGamificationProfile = z.infer<typeof insertGamificationProfileSchema>;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

// Reminder system
export const reminderFrequencies = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "biweekly", name: "Bi-Weekly" },
  { id: "monthly", name: "Monthly" }
];

export const reminderTypes = [
  { id: "income", name: "Income Entry", icon: "dollarSign", color: "green" },
  { id: "expense", name: "Expense Tracking", icon: "receipt", color: "red" },
  { id: "goal", name: "Goal Update", icon: "target", color: "blue" },
  { id: "budget", name: "Budget Check", icon: "pieChart", color: "purple" },
  { id: "custom", name: "Custom", icon: "bell", color: "amber" }
];

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("custom"),
  frequency: text("frequency").notNull(),
  nextRemindAt: timestamp("next_remind_at").notNull(),
  lastSentAt: timestamp("last_sent_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: json("metadata"),
});

const baseInsertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  frequency: true,
  nextRemindAt: true,
  isActive: true,
  metadata: true,
});

export const insertReminderSchema = baseInsertReminderSchema.extend({
  nextRemindAt: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Notification Types
export const notificationTypes = [
  { id: "info", name: "Information", icon: "info", color: "blue" },
  { id: "success", name: "Success", icon: "checkCircle", color: "green" },
  { id: "warning", name: "Warning", icon: "alertTriangle", color: "amber" },
  { id: "reminder", name: "Reminder", icon: "bell", color: "purple" }
];

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  metadata: json("metadata"),
});

// Create the notifications schema
const baseInsertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  metadata: true,
});

export const insertNotificationSchema = baseInsertNotificationSchema;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Widget settings
export const widgetSettings = pgTable("widget_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  showBalance: boolean("show_balance").notNull().default(true),
  showIncomeGoal: boolean("show_income_goal").notNull().default(true),
  showNextReminder: boolean("show_next_reminder").notNull().default(true),
  position: text("position").notNull().default("bottom-right"),
  size: text("size").notNull().default("medium"),
  theme: text("theme").notNull().default("auto"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  customSettings: json("custom_settings"),
});

const baseInsertWidgetSettingsSchema = createInsertSchema(widgetSettings).pick({
  userId: true,
  enabled: true,
  showBalance: true,
  showIncomeGoal: true,
  showNextReminder: true,
  position: true,
  size: true,
  theme: true,
  customSettings: true,
});

export const insertWidgetSettingsSchema = baseInsertWidgetSettingsSchema;

export type InsertWidgetSettings = z.infer<typeof insertWidgetSettingsSchema>;
export type WidgetSettings = typeof widgetSettings.$inferSelect;

// Spending Personality Quiz System

// Quiz Result Schema
export const spendingPersonalityResults = pgTable("spending_personality_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  personalityType: text("personality_type").notNull(),
  score: json("score").notNull(), // Score breakdown by personality type
  answers: json("answers").notNull(), // Record of user's answers
  takenAt: timestamp("taken_at").notNull().defaultNow(),
  recommendations: json("recommendations"), // Personalized recommendations based on results
});

const baseInsertSpendingPersonalityResultSchema = createInsertSchema(spendingPersonalityResults).pick({
  userId: true,
  personalityType: true,
  score: true,
  answers: true,
  recommendations: true,
});

export const insertSpendingPersonalityResultSchema = baseInsertSpendingPersonalityResultSchema;

export type InsertSpendingPersonalityResult = z.infer<typeof insertSpendingPersonalityResultSchema>;
export type SpendingPersonalityResult = typeof spendingPersonalityResults.$inferSelect;

// Define budget schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  needsPercentage: decimal("needs_percentage").notNull(),
  wantsPercentage: decimal("wants_percentage").notNull(),
  savingsPercentage: decimal("savings_percentage").notNull(),
  needsCategories: text("needs_categories").array(),
  wantsCategories: text("wants_categories").array(),
  savingsCategories: text("savings_categories").array(),
  monthlyIncome: decimal("monthly_income"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  month: true,
  year: true,
  needsPercentage: true,
  wantsPercentage: true,
  savingsPercentage: true,
  needsCategories: true,
  wantsCategories: true,
  savingsCategories: true,
  monthlyIncome: true,
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Quiz Questions Schema
export const spendingPersonalityQuestions = pgTable("spending_personality_questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  options: json("options").notNull(), // Array of possible answers
  category: text("category").notNull(), // For grouping related questions
  weight: integer("weight").notNull().default(1), // Importance of this question
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const baseInsertSpendingPersonalityQuestionSchema = createInsertSchema(spendingPersonalityQuestions).pick({
  questionText: true,
  options: true,
  category: true,
  weight: true,
  active: true,
});

export const insertSpendingPersonalityQuestionSchema = baseInsertSpendingPersonalityQuestionSchema;

export type InsertSpendingPersonalityQuestion = z.infer<typeof insertSpendingPersonalityQuestionSchema>;
export type SpendingPersonalityQuestion = typeof spendingPersonalityQuestions.$inferSelect;

// Quiz answer schema for validation
export const quizAnswerSchema = z.object({
  questionId: z.number(),
  optionId: z.string(),
  personalityType: z.string(),
  value: z.number()
});

export const quizAnswersSchema = z.array(quizAnswerSchema);
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;

// Gig applications
export const gigApplications = pgTable("gig_applications", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull(),
  userId: text("user_id").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGigApplicationSchema = createInsertSchema(gigApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertGigApplication = z.infer<typeof insertGigApplicationSchema>;
export type GigApplication = typeof gigApplications.$inferSelect;

// Professional Services schema
export const professionalServices = pgTable("professional_services", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // locksmith, plumber, electrician, etc.
  pricing: json("pricing"), // { hourly, flat_rate, minimum, etc. }
  location: text("location"),
  availability: json("availability"), // { days, hours, etc. }
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  contactInfo: json("contact_info"), // { phone, email, website, etc. }
  ratings: numeric("ratings").default("0"),
  reviewCount: integer("review_count").default(0),
  licenseInfo: text("license_info"),
  certifications: json("certifications"), // Array of certification details
  serviceArea: json("service_area"), // Geographic area details
  businessHours: json("business_hours"), // Structured business hours
});

export const insertProfessionalServiceSchema = createInsertSchema(professionalServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ratings: true,
  reviewCount: true,
});

export type ProfessionalService = typeof professionalServices.$inferSelect;
export type InsertProfessionalService = z.infer<typeof insertProfessionalServiceSchema>;

// Stackr Guardrails Feature - Spending Discipline Tool
// ----------------------------------------------------

// Spending limits table to track budget limits per category
export const spendingLimits = pgTable("spending_limits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  category: text("category", { length: 100 }).notNull(),
  limitAmount: numeric("limit_amount").notNull(),
  cycle: text("cycle", { length: 20 }).notNull(), // 'weekly', 'monthly'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Create insert schema for spending limits
export const insertSpendingLimitSchema = createInsertSchema(spendingLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SpendingLimit = typeof spendingLimits.$inferSelect;
export type InsertSpendingLimit = z.infer<typeof insertSpendingLimitSchema>;

// Spending logs table to track actual spending
export const spendingLogs = pgTable("spending_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  category: text("category", { length: 100 }).notNull(),
  amountSpent: numeric("amount_spent").notNull(),
  description: text("description"),
  source: text("source"), // 'manual', 'plaid', etc.
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schema for spending logs
export const insertSpendingLogSchema = createInsertSchema(spendingLogs).omit({
  id: true,
  createdAt: true,
});

export type SpendingLog = typeof spendingLogs.$inferSelect;
export type InsertSpendingLog = z.infer<typeof insertSpendingLogSchema>;

// Weekly spending reflections for AI insights
export const spendingReflections = pgTable("spending_reflections", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  overallStatus: text("overall_status"), // 'good', 'warning', 'over_budget'
  categorySummary: jsonb("category_summary"), // JSON summary of each category status
  aiSuggestion: text("ai_suggestion"), // Generated advice from AI
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schema for spending reflections
export const insertSpendingReflectionSchema = createInsertSchema(spendingReflections).omit({
  id: true,
  createdAt: true,
});

export type SpendingReflection = typeof spendingReflections.$inferSelect;
export type InsertSpendingReflection = z.infer<typeof insertSpendingReflectionSchema>;

// Scheduled Exports for regular financial data reports
export const scheduledExports = pgTable("scheduled_exports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  frequency: text("frequency").notNull(), // 'weekly', 'biweekly', 'monthly'
  dataType: text("data_type").notNull(), // 'income', 'expenses', 'transactions', 'summary'
  format: text("format").notNull(), // 'csv', 'pdf'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastSentAt: timestamp("last_sent_at"),
  nextSendAt: timestamp("next_send_at").notNull(),
  customTitle: text("custom_title"),
  includeNotes: boolean("include_notes").default(true),
  categories: json("categories"), // Optional array of categories to include
});

// Create insert schema for scheduled exports
export const insertScheduledExportSchema = createInsertSchema(scheduledExports).omit({
  id: true,
  createdAt: true,
});

export type ScheduledExport = typeof scheduledExports.$inferSelect;
export type InsertScheduledExport = z.infer<typeof insertScheduledExportSchema>;
