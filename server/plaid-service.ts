import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, AccountBase, TransactionsSyncRequest, Transaction } from 'plaid';
import { storage } from './storage';
import { InsertBankConnection, InsertBankAccount, InsertBankTransaction } from '@shared/schema';

// Plaid API configuration
const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

// Initialize Plaid client
const plaidClient = new PlaidApi(configuration);

// Log successful initialization
console.log('Plaid client initialized');

export class PlaidService {
  // Create a Plaid link token for client-side initialization
  async createLinkToken(userId: string | number): Promise<string> {
    try {
      if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        throw new Error('Plaid credentials not configured');
      }

      console.log('Creating link token with Plaid client ID:', process.env.PLAID_CLIENT_ID);
      
      const response = await plaidClient.linkTokenCreate({
        user: {
          client_user_id: userId.toString(),
        },
        client_name: 'Income Intelligence',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL,
        redirect_uri: process.env.PLAID_REDIRECT_URI,
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET
      });
      
      return response.data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw new Error('Failed to create Plaid link token. Please check your Plaid configuration.');
    }
  }
  
  // Exchange public token for access token and store connection
  async exchangePublicToken(userId: string | number, publicToken: string, metadata: Record<string, any>): Promise<number> {
    try {
      // Exchange public token for access token
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET
      });
      
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;
      
      // Get institution details
      const institution = metadata.institution;
      
      // Create bank connection record
      const connectionData: InsertBankConnection = {
        userId: userId.toString(),
        institutionId: institution.institution_id,
        institutionName: institution.name,
        accessToken,
        itemId,
        status: 'active',
        metadata: {
          institution
        }
      };
      
      // Save connection to database
      const connection = await storage.createBankConnection(connectionData);
      
      // Fetch and save accounts
      await this.fetchAndSaveAccounts(connection.id, accessToken);
      
      return connection.id;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }
  
  // Fetch and save bank accounts
  async fetchAndSaveAccounts(connectionId: number, accessToken: string): Promise<void> {
    try {
      // Get accounts from Plaid
      const response = await plaidClient.accountsGet({
        access_token: accessToken,
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET
      });
      
      const accounts = response.data.accounts;
      
      // Save each account
      for (const account of accounts) {
        const accountData: InsertBankAccount = {
          connectionId,
          accountId: account.account_id,
          accountName: account.name,
          accountType: account.type,
          accountSubtype: account.subtype || null,
          mask: account.mask || null,
          balanceAvailable: account.balances.available?.toString() || null,
          balanceCurrent: account.balances.current?.toString() || null,
          isActive: true
        };
        
        await storage.createBankAccount(accountData);
      }
    } catch (error) {
      console.error('Error fetching and saving accounts:', error);
      throw error;
    }
  }
  
  // Sync transactions for all accounts
  async syncTransactions(connectionId: number): Promise<void> {
    try {
      // Get connection details
      const connection = await storage.getBankConnectionById(connectionId);
      if (!connection) {
        throw new Error(`Bank connection with ID ${connectionId} not found`);
      }
      
      // Get accounts for this connection
      const accounts = await storage.getBankAccounts(connectionId);
      if (accounts.length === 0) {
        throw new Error(`No accounts found for connection ID ${connectionId}`);
      }
      
      // We need cursors to get incremental updates from Plaid
      let cursor = connection.metadata?.transactionCursor || null;
      
      // Prepare transaction sync request
      const syncRequest: TransactionsSyncRequest = {
        access_token: connection.accessToken,
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET
      };
      
      if (cursor) {
        syncRequest.cursor = cursor;
      }
      
      let hasMore = true;
      
      // Loop until we've fetched all transactions
      while (hasMore) {
        const response = await plaidClient.transactionsSync(syncRequest);
        
        // Store the updated cursor
        cursor = response.data.next_cursor;
        hasMore = response.data.has_more;
        
        // Update the sync request with the new cursor
        syncRequest.cursor = cursor;
        
        // Save added transactions
        for (const transaction of response.data.added) {
          // Find the account ID in our database that matches this Plaid account ID
          const account = accounts.find((a: any) => a.accountId === transaction.account_id);
          if (!account) continue;
          
          // Prepare transaction data
          const transactionData: InsertBankTransaction = {
            accountId: account.id,
            transactionId: transaction.transaction_id,
            amount: transaction.amount.toString(),
            date: new Date(transaction.date),
            name: transaction.name,
            merchantName: transaction.merchant_name || null,
            category: transaction.category?.join(', ') || null,
            pending: transaction.pending,
            importedAsIncome: false,
            metadata: {
              paymentChannel: transaction.payment_channel,
              paymentMeta: transaction.payment_meta,
              transactionType: transaction.transaction_type,
              categories: transaction.category,
              categoryId: transaction.category_id,
              location: transaction.location
            }
          };
          
          // Check if transaction already exists
          const existing = await storage.getBankTransactionByTransactionId(transaction.transaction_id);
          if (!existing) {
            await storage.createBankTransaction(transactionData);
          }
        }
        
        // Update modified transactions
        for (const transaction of response.data.modified) {
          const account = accounts.find((a: any) => a.accountId === transaction.account_id);
          if (!account) continue;
          
          const existing = await storage.getBankTransactionByTransactionId(transaction.transaction_id);
          if (existing) {
            const transactionData: Partial<InsertBankTransaction> = {
              amount: transaction.amount.toString(),
              date: new Date(transaction.date),
              name: transaction.name,
              merchantName: transaction.merchant_name || null,
              category: transaction.category?.join(', ') || null,
              pending: transaction.pending,
              metadata: {
                ...existing.metadata,
                paymentChannel: transaction.payment_channel,
                paymentMeta: transaction.payment_meta,
                transactionType: transaction.transaction_type,
                categories: transaction.category,
                categoryId: transaction.category_id,
                location: transaction.location
              }
            };
            
            await storage.updateBankTransaction(existing.id, transactionData);
          }
        }
        
        // Handle removed transactions
        for (const removedTransactionId of response.data.removed) {
          const existing = await storage.getBankTransactionByTransactionId(removedTransactionId.transaction_id);
          if (existing) {
            await storage.deleteBankTransaction(existing.id);
          }
        }
      }
      
      // Update the connection with the latest cursor
      await storage.updateBankConnection(connectionId, {
        metadata: {
          ...connection.metadata,
          transactionCursor: cursor,
          lastSyncTime: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }
  
  // Import positive transactions as income
  async importPositiveTransactionsAsIncome(connectionId: number): Promise<void> {
    try {
      // Get accounts for this connection
      const accounts = await storage.getBankAccounts(connectionId);
      
      for (const account of accounts) {
        // Get all transactions for this account
        const transactions = await storage.getBankTransactions(account.id);
        
        // Filter for negative amounts from Plaid (money coming in) and not yet imported
        // In Plaid, negative values are money coming into the account (income)
        // We'll convert these to positive values when importing as income
        const incomeTransactions = transactions.filter(
          (t: any) => parseFloat(t.amount.toString()) < 0 && !t.importedAsIncome
        );
        
        // Import each income transaction 
        for (const transaction of incomeTransactions) {
          await storage.importBankTransactionAsIncome(transaction.id);
        }
      }
    } catch (error) {
      console.error('Error importing income transactions:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const plaidService = new PlaidService();