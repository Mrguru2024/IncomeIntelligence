import { initializeAIClients } from './ai-service';
import { initializeEmailClient } from './email-service';
import { initializePerplexityService } from './perplexity-service';
import { initializePlaidService } from './plaid-service';

export const initializeServices = () => {
  try {
    initializeAIClients();
    initializeEmailClient();
    initializePerplexityService();
    initializePlaidService();
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
}; 