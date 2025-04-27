import express from 'express';
import { z } from 'zod';
import { userProfileSchema, updateUserProfileSchema } from '@shared/user-profile-schema';
import { userProfileService } from '../services/user-profile-service';

const router = express.Router();

// Get user profile by ID
router.get('/api/user-profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const profile = await userProfileService.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Create a new user profile
router.post('/api/user-profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if profile already exists
    const existingProfile = await userProfileService.getProfile(userId);
    
    if (existingProfile) {
      return res.status(409).json({ 
        message: 'Profile already exists, use PATCH to update',
        profile: existingProfile
      });
    }
    
    // Create a new profile
    const profileData = {
      userId,
      ...req.body
    };
    
    try {
      // Validate with schema
      userProfileSchema.parse(profileData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid profile data',
          errors: err.errors
        });
      }
    }
    
    const newProfile = await userProfileService.createProfile(userId, req.body);
    
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ message: 'Failed to create user profile' });
  }
});

// Update an existing user profile
router.patch('/api/user-profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if profile exists
    const existingProfile = await userProfileService.getProfile(userId);
    
    if (!existingProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    try {
      // Validate update data with schema
      updateUserProfileSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid profile data',
          errors: err.errors
        });
      }
    }
    
    // Update the profile
    const updatedProfile = await userProfileService.updateProfile(userId, req.body);
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// Add a quote to the user's history
router.post('/api/user-profile/:userId/quotes', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if profile exists
    const existingProfile = await userProfileService.getProfile(userId);
    
    if (!existingProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    // Validate quote data
    const quoteSchema = z.object({
      jobType: z.string(),
      jobSubtype: z.string().optional(),
      totalAmount: z.number(),
      margin: z.number().optional()
    });
    
    try {
      quoteSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid quote data',
          errors: err.errors
        });
      }
    }
    
    // Add quote to history
    const updatedProfile = await userProfileService.addQuoteToHistory(
      userId, 
      req.body.jobType, 
      req.body.totalAmount, 
      req.body.jobSubtype, 
      req.body.margin
    );
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error adding quote to history:', error);
    res.status(500).json({ message: 'Failed to add quote to history' });
  }
});

export default router;