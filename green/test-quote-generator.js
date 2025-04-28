/**
 * Test script for enhanced quote generator
 * 
 * This script tests the enhanced quote generator with sample data
 * and displays the results in the console.
 */

import { generateEnhancedQuote } from './enhanced-quote-generator.js';
import sampleQuoteData from './quote-data.js';
import { getUserProfile, initializeUserProfile, saveUserProfile } from './user-profile.js';

// Test user ID
const TEST_USER_ID = 'test-user-123';

// Initialize test user if not exists
function setupTestUser() {
  let userProfile = getUserProfile(TEST_USER_ID);
  
  if (!userProfile) {
    console.log('Creating test user profile...');
    userProfile = initializeUserProfile(TEST_USER_ID);
    
    // Add some experience to the profile
    userProfile.preferences.experienceYears = 5;
    
    // Save the profile
    saveUserProfile(TEST_USER_ID, userProfile);
    console.log('Test user profile created.');
  }
  
  return userProfile;
}

// Run tests for each sample quote
function runQuoteTests() {
  console.log('=== ENHANCED QUOTE GENERATOR TESTS ===');
  console.log('Testing quote generation for multiple industries...\n');
  
  // Setup test user
  const userProfile = setupTestUser();
  
  // Test each sample quote
  for (const [name, quoteData] of Object.entries(sampleQuoteData)) {
    console.log(`\n--- Testing ${name} quote ---`);
    
    try {
      // Generate enhanced quote
      const enhancedQuote = generateEnhancedQuote(quoteData, TEST_USER_ID);
      
      // Print key results
      console.log(`Job Type: ${enhancedQuote.jobType}`);
      console.log(`Location: ${enhancedQuote.location} (Region: ${enhancedQuote.region})`);
      console.log(`Profit Margin: ${(enhancedQuote.profitMargin * 100).toFixed(1)}%`);
      console.log(`Regional Average: ${(enhancedQuote.regionalAverage * 100).toFixed(1)}%`);
      console.log(`Total Price: $${enhancedQuote.total.toFixed(2)}`);
      console.log(`Competitive Position: ${enhancedQuote.competitivePosition.position} (${enhancedQuote.competitivePosition.percentDiff.toFixed(1)}%)`);
      console.log(`Deposit Required: ${enhancedQuote.depositRequired ? 'Yes' : 'No'} (${enhancedQuote.depositPercent}%)`);
      
      // Show tier options (summarized)
      console.log('\nTier Options:');
      for (const [tier, option] of Object.entries(enhancedQuote.tierOptions)) {
        console.log(`  ${option.name}: $${option.price.toFixed(2)} - Profit: $${option.profit.toFixed(2)} (${(option.profitMargin * 100).toFixed(1)}%)`);
      }
      
      // Show one recommendation as example
      if (enhancedQuote.recommendations && enhancedQuote.recommendations.length > 0) {
        const recommendation = enhancedQuote.recommendations[0];
        console.log(`\nSample Recommendation (${recommendation.priority}): ${recommendation.title}`);
        console.log(`  "${recommendation.description}"`);
      }
      
      console.log('Test successful ✓');
    } catch (error) {
      console.error(`Error generating quote for ${name}:`, error);
      console.log('Test failed ✗');
    }
  }
  
  console.log('\n=== TESTS COMPLETED ===');
}

// Run the tests
runQuoteTests();