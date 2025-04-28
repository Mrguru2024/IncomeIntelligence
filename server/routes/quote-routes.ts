import { Router } from 'express';
const router = Router();

/**
 * Quote routes for the enhanced quote generator
 * Integrates user profile data with advanced profit margin calculation
 * and industry-specific parameters
 */

// Enhanced Quote generator routes with user profile integration
router.post("/api/generate-enhanced-quote", (req, res) => {
  try {
    const { quoteData, userId } = req.body;
    
    if (!quoteData) {
      return res.status(400).json({ error: "Quote data is required" });
    }
    
    // Validate essential fields
    const requiredFields = ['jobType', 'laborHours', 'location'];
    for (const field of requiredFields) {
      if (!quoteData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    // Import the enhanced quote generator
    try {
      const { generateEnhancedQuote } = require('../../green/enhanced-quote-generator.js');
      
      // Update user profile if userId is provided
      if (userId) {
        try {
          const { updateProfileFromQuoteForm } = require('../../green/user-profile.js');
          updateProfileFromQuoteForm(userId, quoteData);
          console.log(`Updated user profile for user ${userId} based on quote data`);
        } catch (profileError) {
          console.warn("Warning: Could not update user profile:", profileError);
          // Continue with quote generation even if profile update fails
        }
      }
      
      // Generate enhanced quote with user profiling
      const enhancedQuote = generateEnhancedQuote(quoteData, userId);
      
      res.json(enhancedQuote);
    } catch (importError) {
      console.error("Error importing enhanced quote generator:", importError);
      res.status(500).json({ 
        error: "Failed to load quote generator module",
        message: importError.message
      });
    }
  } catch (error) {
    console.error("Error generating enhanced quote:", error);
    res.status(500).json({ 
      error: "Failed to generate enhanced quote",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user quote history from profile
router.get("/api/user/:userId/quote-history", (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Get user profile
    try {
      const { getUserProfile } = require('../../green/user-profile.js');
      const userProfile = getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      
      // Return quote history from profile
      res.json({ 
        userId,
        quoteHistory: userProfile.quoteHistory || [],
        stats: {
          totalQuotes: (userProfile.quoteHistory || []).length,
          averageMargin: userProfile.averageMargin || 0,
          preferredJobTypes: userProfile.preferredJobTypes || []
        }
      });
    } catch (profileError) {
      console.error("Error retrieving user profile:", profileError);
      res.status(500).json({ 
        error: "Failed to retrieve user profile",
        message: profileError.message
      });
    }
  } catch (error) {
    console.error("Error retrieving quote history:", error);
    res.status(500).json({ 
      error: "Failed to retrieve quote history",
      message: error.message
    });
  }
});

// Save a quote to user history
router.post("/api/user/:userId/save-quote", (req, res) => {
  try {
    const { userId } = req.params;
    const { quoteData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    if (!quoteData) {
      return res.status(400).json({ error: "Quote data is required" });
    }
    
    // Add quote to history
    try {
      const { addQuoteToHistory } = require('../../green/user-profile.js');
      const updatedProfile = addQuoteToHistory(userId, quoteData);
      
      if (!updatedProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      
      // Return updated history
      res.json({ 
        success: true, 
        message: "Quote saved to history",
        quoteHistory: updatedProfile.quoteHistory
      });
    } catch (profileError) {
      console.error("Error saving quote to history:", profileError);
      res.status(500).json({ 
        error: "Failed to save quote to history",
        message: profileError.message
      });
    }
  } catch (error) {
    console.error("Error saving quote:", error);
    res.status(500).json({ 
      error: "Failed to save quote",
      message: error.message
    });
  }
});

// Update quote status in history
router.patch("/api/user/:userId/quote-status", (req, res) => {
  try {
    const { userId } = req.params;
    const { quoteDate, status } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    if (!quoteDate || !status) {
      return res.status(400).json({ error: "Quote date and status are required" });
    }
    
    // Valid status values
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status", 
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Update quote status
    try {
      const { updateQuoteStatus } = require('../../green/user-profile.js');
      const updatedProfile = updateQuoteStatus(userId, quoteDate, status);
      
      if (!updatedProfile) {
        return res.status(404).json({ error: "User profile or quote not found" });
      }
      
      // Return updated history
      res.json({ 
        success: true, 
        message: `Quote status updated to ${status}`,
        quoteHistory: updatedProfile.quoteHistory
      });
    } catch (profileError) {
      console.error("Error updating quote status:", profileError);
      res.status(500).json({ 
        error: "Failed to update quote status",
        message: profileError.message
      });
    }
  } catch (error) {
    console.error("Error updating quote:", error);
    res.status(500).json({ 
      error: "Failed to update quote",
      message: error.message
    });
  }
});

export default router;