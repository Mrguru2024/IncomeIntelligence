import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { config } from '../config';

let plaidClient: PlaidApi | null = null;

export const initializePlaidService = () => {
  if (!config.plaidClientId || !config.plaidSecret) {
    console.warn('Plaid credentials not configured');
    return;
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[config.plaidEnv],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.plaidClientId,
        'PLAID-SECRET': config.plaidSecret,
      },
    },
  });

  plaidClient = new PlaidApi(configuration);
  console.log('Plaid client initialized');
};

export const getPlaidClient = () => {
  if (!plaidClient) {
    throw new Error('Plaid client not initialized');
  }
  return plaidClient;
}; 