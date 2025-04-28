import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';
import Stripe from 'stripe';

// Import quote generator utilities using dynamic import to handle ES modules in a CommonJS context
let generateEnhancedQuote: any;
let addQuoteToHistory: any;
let saveUserProfile: any;
let getUserProfile: any;

// Dynamically import the ES modules
async function importModules() {
  try {
    const quoteGeneratorModule = await import('../../green/enhanced-quote-generator.js');
    const userProfileModule = await import('../../green/user-profile.js');
    
    generateEnhancedQuote = quoteGeneratorModule.generateEnhancedQuote;
    addQuoteToHistory = userProfileModule.addQuoteToHistory;
    saveUserProfile = userProfileModule.saveUserProfile;
    getUserProfile = userProfileModule.getUserProfile;
    
    console.log('Quote generator modules imported successfully');
  } catch (importError) {
    console.error('Error importing quote generator modules:', importError);
  }
}

// Initialize module imports
importModules().catch(error => {
  console.error('Failed to initialize quote modules:', error);
});

const router = Router();

// Get all quotes for a user
router.get('/quotes', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    try {
      const userProfile = getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      
      const quotes = userProfile.quoteHistory || [];
      
      return res.json({ quotes });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Error fetching user quotes' });
    }
  } catch (error) {
    console.error('Error in GET /quotes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific quote by ID
router.get('/quotes/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    try {
      const userProfile = getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      
      const quotes = userProfile.quoteHistory || [];
      const quote = quotes.find(q => q.id === quoteId);
      
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      return res.json({ quote });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Error fetching quote' });
    }
  } catch (error) {
    console.error('Error in GET /quotes/:quoteId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new quote
router.post('/quotes', async (req, res) => {
  try {
    const quoteData = req.body;
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (!quoteData.jobType) {
      return res.status(400).json({ error: 'jobType is required' });
    }
    
    try {
      // Generate enhanced quote
      const enhancedQuote = generateEnhancedQuote(quoteData, userId);
      
      // Add unique ID to quote if not present
      if (!enhancedQuote.id) {
        enhancedQuote.id = `QT${Date.now()}`;
      }
      
      // Add quote to user's history
      const updatedProfile = addQuoteToHistory(userId, enhancedQuote);
      
      // Update user profile
      if (quoteData.experienceYears) {
        saveUserProfile(userId, {
          preferences: {
            experienceYears: quoteData.experienceYears
          }
        });
      }
      
      return res.status(201).json({
        success: true,
        quote: enhancedQuote
      });
    } catch (profileError) {
      console.error('Error with user profile operations:', profileError);
      return res.status(500).json({ error: 'Error generating or saving quote' });
    }
  } catch (error) {
    console.error('Error in POST /quotes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update quote status
router.patch('/quotes/:quoteId/status', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { status, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }
    
    try {
      const userProfile = getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      
      const quotes = userProfile.quoteHistory || [];
      const quoteIndex = quotes.findIndex(q => q.id === quoteId);
      
      if (quoteIndex === -1) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Update the quote status
      const quote = { ...quotes[quoteIndex], status, updatedAt: new Date().toISOString() };
      
      // Save updated quote to user profile
      userProfile.quoteHistory[quoteIndex] = quote;
      saveUserProfile(userId, userProfile);
      
      return res.json({ success: true, quote });
    } catch (error) {
      console.error('Error updating quote status:', error);
      return res.status(500).json({ error: 'Error updating quote status' });
    }
  } catch (error) {
    console.error('Error in PATCH /quotes/:quoteId/status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Convert quote to invoice
router.post('/quotes/:quoteId/convert', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { userId, tier } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (!tier) {
      return res.status(400).json({ error: 'tier is required' });
    }
    
    // Valid tiers
    const validTiers = ['basic', 'standard', 'premium'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        error: `Invalid tier: ${tier}. Valid tiers are: ${validTiers.join(', ')}`
      });
    }
    
    try {
      const userProfile = getUserProfile(userId);
      
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      
      const quotes = userProfile.quoteHistory || [];
      const quote = quotes.find(q => q.id === quoteId);
      
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      // Create an invoice from the quote (simplified for demo)
      const invoice = {
        id: `INV${Date.now()}`,
        quoteId,
        userId,
        customerName: quote.customerName,
        jobType: quote.jobType,
        description: quote.description,
        location: quote.location,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), // 30 days from now
        status: 'pending',
        tier,
        amount: quote.tierOptions[tier].price,
        depositAmount: quote.depositRequired ? (quote.tierOptions[tier].price * (quote.depositPercent / 100)) : 0,
        depositRequired: quote.depositRequired,
        depositPercent: quote.depositPercent,
        items: [
          {
            description: `${quote.jobType} - ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier`,
            quantity: 1,
            rate: quote.tierOptions[tier].price,
            amount: quote.tierOptions[tier].price
          }
        ]
      };
      
      // In a real app, we would store this in a database
      // For demo purposes, we'll just return it
      
      // Update the quote status to reflect that it was converted to an invoice
      const quoteIndex = quotes.findIndex(q => q.id === quoteId);
      quotes[quoteIndex].status = 'accepted';
      quotes[quoteIndex].updatedAt = new Date().toISOString();
      quotes[quoteIndex].invoiceId = invoice.id;
      
      // Save updated quote to user profile
      userProfile.quoteHistory = quotes;
      saveUserProfile(userId, userProfile);
      
      return res.json({ success: true, invoice });
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      return res.status(500).json({ error: 'Error converting quote to invoice' });
    }
  } catch (error) {
    console.error('Error in POST /quotes/:quoteId/convert:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Stripe payment intent for invoice payment
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, invoiceId, customerName, description, tier } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' });
    }
    
    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.log('STRIPE_SECRET_KEY is not set, returning simulated client secret for development');
      // For development, return a fake client secret
      return res.json({ 
        clientSecret: `demo_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`,
        isDevelopment: true
      });
    }
    
    try {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      });
      
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency: 'usd',
        description: `Payment for ${description || 'services'} - ${tier} tier`,
        metadata: {
          invoiceId,
          customerName,
          tier
        },
        // Optional: Set up automatic payment methods
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (stripeError) {
      console.error('Stripe payment intent creation error:', stripeError);
      
      // For development, provide a fallback
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          clientSecret: `demo_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`,
          isDevelopment: true,
          stripeError: true
        });
      }
      
      return res.status(500).json({ 
        error: 'Error creating payment intent',
        message: stripeError.message
      });
    }
  } catch (error) {
    console.error('Error in POST /create-payment-intent:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;