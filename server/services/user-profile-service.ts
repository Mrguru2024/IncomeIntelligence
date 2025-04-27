import { db } from '../db';
import { UpdateUserProfile, UserProfile, userProfileSchema } from '@shared/user-profile-schema';

class UserProfileService {
  private profiles: Map<string, UserProfile> = new Map();
  
  constructor() {
    // Initialize with any existing data from persistent storage
    this.loadProfiles();
  }
  
  private async loadProfiles() {
    try {
      // Try to load from database if available
      // For the MemStorage implementation, we'll use localStorage in memory
      const storedProfiles = localStorage.getItem('userProfiles');
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles);
        if (Array.isArray(parsedProfiles)) {
          parsedProfiles.forEach(profile => {
            try {
              // Validate against schema
              const validProfile = userProfileSchema.parse(profile);
              this.profiles.set(validProfile.userId, validProfile);
            } catch (error) {
              console.error('Invalid profile data:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }
  
  private async saveProfiles() {
    try {
      // Save to persistent storage
      const profilesArray = Array.from(this.profiles.values());
      localStorage.setItem('userProfiles', JSON.stringify(profilesArray));
    } catch (error) {
      console.error('Error saving user profiles:', error);
    }
  }
  
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    return this.profiles.get(userId);
  }
  
  async createProfile(userId: string, initialData: Partial<UserProfile> = {}): Promise<UserProfile> {
    // Create a new profile with default values and any provided initial data
    const newProfile: UserProfile = userProfileSchema.parse({
      userId,
      ...initialData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    this.profiles.set(userId, newProfile);
    await this.saveProfiles();
    return newProfile;
  }
  
  async updateProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
    const existingProfile = this.profiles.get(userId);
    
    if (!existingProfile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    // Update the profile with the new data
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // Validate the updated profile against the schema
    const validatedProfile = userProfileSchema.parse(updatedProfile);
    
    this.profiles.set(userId, validatedProfile);
    await this.saveProfiles();
    return validatedProfile;
  }
  
  async addQuoteToHistory(
    userId: string, 
    jobType: string, 
    totalAmount: number, 
    jobSubtype?: string, 
    margin?: number
  ): Promise<UserProfile> {
    const profile = this.profiles.get(userId);
    
    if (!profile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    // Create a new quote history entry
    const newQuoteEntry = {
      jobType,
      jobSubtype,
      totalAmount,
      date: new Date().toISOString(),
      status: 'draft' as const,
      margin
    };
    
    // Update the profile
    const updatedProfile: UserProfile = {
      ...profile,
      quoteHistory: [...(profile.quoteHistory || []), newQuoteEntry],
      lastUpdated: new Date().toISOString()
    };
    
    // Update preferred job types based on frequency
    const jobTypeCounts = new Map<string, number>();
    
    updatedProfile.quoteHistory?.forEach(quote => {
      const count = jobTypeCounts.get(quote.jobType) || 0;
      jobTypeCounts.set(quote.jobType, count + 1);
    });
    
    // Sort job types by frequency and take the top 5
    const sortedJobTypes = [...jobTypeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
    
    updatedProfile.preferredJobTypes = sortedJobTypes;
    
    // Update average values
    if (updatedProfile.quoteHistory && updatedProfile.quoteHistory.length > 0) {
      // Calculate averages for labor rate, labor hours, and material cost
      // These would normally come from the quote data, but for now we'll use estimates
      const totalQuotes = updatedProfile.quoteHistory.length;
      
      // For demonstration, we'll use some calculated averages
      // In a real implementation, you would extract these from the actual quote data
      updatedProfile.averageLaborRate = Math.round(
        updatedProfile.quoteHistory.reduce((sum, quote) => sum + (quote.totalAmount * 0.6), 0) / totalQuotes
      );
      
      updatedProfile.averageMaterialCost = Math.round(
        updatedProfile.quoteHistory.reduce((sum, quote) => sum + (quote.totalAmount * 0.3), 0) / totalQuotes
      );
      
      updatedProfile.averageLaborHours = parseFloat(
        (updatedProfile.quoteHistory.reduce((sum, quote) => sum + (quote.totalAmount / 100), 0) / totalQuotes).toFixed(1)
      );
    }
    
    this.profiles.set(userId, updatedProfile);
    await this.saveProfiles();
    return updatedProfile;
  }
  
  async deleteProfile(userId: string): Promise<boolean> {
    const result = this.profiles.delete(userId);
    if (result) {
      await this.saveProfiles();
    }
    return result;
  }
}

// Create and export a singleton instance
export const userProfileService = new UserProfileService();