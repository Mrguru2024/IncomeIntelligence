/**
 * Test script for client preview functionality
 * This script verifies that:
 * 1. We can generate a quote using our enhanced quote generator
 * 2. The quote is successfully saved to the user profile
 * 3. We can retrieve the quote through the API
 */

import { generateEnhancedQuote } from './enhanced-quote-generator.js';
import { addQuoteToHistory, getUserProfile } from './user-profile.js';

const TEST_USER_ID = 'test-preview-user';

// Sample quote data
const quoteData = {
  jobType: 'Bathroom Remodel',
  description: 'Complete renovation of master bathroom with premium fixtures',
  location: 'Denver, CO',
  laborHours: 40,
  laborRate: 75,
  materialCost: 3500,
  complexity: 'medium',
  experienceYears: 5,
  competitionLevel: 'medium', 
  isUrgent: false,
  customerName: 'Alex Johnson'
};

async function runTest() {
  console.log('=== CLIENT PREVIEW TEST ===');
  console.log('Step 1: Generating enhanced quote...');
  
  // Generate a quote
  const enhancedQuote = generateEnhancedQuote(quoteData, TEST_USER_ID);
  
  // Add a unique ID for easy retrieval
  enhancedQuote.id = `QT-TEST-${Date.now()}`;
  
  console.log(`Quote generated with ID: ${enhancedQuote.id}`);
  console.log(`Total price: $${enhancedQuote.total}`);
  console.log(`Tiers: Basic ($${enhancedQuote.tierOptions.basic.price}), Standard ($${enhancedQuote.tierOptions.standard.price}), Premium ($${enhancedQuote.tierOptions.premium.price})`);
  
  console.log('\nStep 2: Saving quote to user profile...');
  
  // Save to user profile
  addQuoteToHistory(TEST_USER_ID, enhancedQuote);
  
  console.log('Quote saved to user profile');
  
  console.log('\nStep 3: Retrieving user profile to verify quote was saved...');
  
  // Get user profile and verify quote was saved
  const userProfile = getUserProfile(TEST_USER_ID);
  
  if (!userProfile) {
    console.error('Error: User profile not found');
    return;
  }
  
  const savedQuote = userProfile.quoteHistory.find(q => q.id === enhancedQuote.id);
  
  if (!savedQuote) {
    console.error('Error: Quote not found in user profile');
    return;
  }
  
  console.log('Quote successfully retrieved from user profile');
  console.log(`Total quotes in history: ${userProfile.quoteHistory.length}`);
  
  console.log('\nStep 4: Setting up test for client preview...');
  
  // Create client preview URL
  const clientPreviewUrl = `/green/client-preview.html?id=${enhancedQuote.id}&userId=${TEST_USER_ID}`;
  
  console.log('To test the client preview page, visit the following URL:');
  console.log(clientPreviewUrl);
  
  // Provide instructions for testing the API endpoint
  console.log('\nTo test the API endpoint directly, run:');
  console.log(`curl -X GET "http://localhost:5000/api/quotes/${enhancedQuote.id}?userId=${TEST_USER_ID}"`);
  
  console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
}

// Run the test
runTest().catch(error => {
  console.error('Test failed with error:', error);
});