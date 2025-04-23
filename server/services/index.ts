import { initializeAIClients } from './ai-service';
import { initializeEmailClient } from './email-service';
import { initializePerplexityService } from './perplexity-service';
import { initializePlaidService } from './plaid-service';
import { initializeImageGenerationService } from './image-generation-service';

export const initializeServices = () => {
  try {
    initializeAIClients();
    initializeEmailClient();
    initializePerplexityService();
    initializePlaidService();
    
    // Initialize the image generation service for blog post images
    try {
      initializeImageGenerationService();
      console.log('Image generation service initialized successfully');
    } catch (error) {
      console.warn('Image generation service could not be initialized:', error.message);
      console.warn('Blog image generation will not be available');
    }
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
}; 