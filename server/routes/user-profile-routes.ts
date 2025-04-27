import { Router } from 'express';
import { userProfileService } from '../services/user-profile-service';
import { updateUserProfileSchema } from '@shared/user-profile-schema';

const router = Router();

// Get user profile
router.get('/api/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const profile = await userProfileService.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Create user profile
router.post('/api/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { body } = req;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if profile already exists
    const existingProfile = await userProfileService.getProfile(userId);
    
    if (existingProfile) {
      return res.status(409).json({ error: 'User profile already exists' });
    }
    
    const newProfile = await userProfileService.createProfile(userId, body);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

// Update user profile
router.patch('/api/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { body } = req;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate the update data against the schema
    try {
      updateUserProfileSchema.parse(body);
    } catch (validationError) {
      return res.status(400).json({ error: 'Invalid profile data', details: validationError });
    }
    
    // Check if profile exists
    const existingProfile = await userProfileService.getProfile(userId);
    
    if (!existingProfile) {
      // Create a new profile if it doesn't exist
      const newProfile = await userProfileService.createProfile(userId, body);
      return res.status(201).json(newProfile);
    }
    
    // Update the existing profile
    const updatedProfile = await userProfileService.updateProfile(userId, body);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Add quote to user profile history
router.post('/api/user-profile/:userId/quotes', async (req, res) => {
  try {
    const { userId } = req.params;
    const { jobType, totalAmount, jobSubtype, margin } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!jobType || typeof totalAmount !== 'number') {
      return res.status(400).json({ error: 'Job type and total amount are required' });
    }
    
    // Check if profile exists
    const existingProfile = await userProfileService.getProfile(userId);
    
    if (!existingProfile) {
      // Create a new profile if it doesn't exist
      await userProfileService.createProfile(userId);
    }
    
    // Add the quote to history
    const updatedProfile = await userProfileService.addQuoteToHistory(
      userId,
      jobType,
      totalAmount,
      jobSubtype,
      margin
    );
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error adding quote to user profile:', error);
    res.status(500).json({ error: 'Failed to add quote to user profile' });
  }
});

// Delete user profile
router.delete('/api/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const result = await userProfileService.deleteProfile(userId);
    
    if (!result) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ error: 'Failed to delete user profile' });
  }
});

export default router;