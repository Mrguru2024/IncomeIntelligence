import express, { Express } from 'express';
import request from 'supertest';
import { registerRoutes } from './routes';
import { getAISettings, updateAISettings, AIProvider } from './ai-service';

// Mock AI service
jest.mock('./ai-service', () => ({
  getAISettings: jest.fn().mockReturnValue({
    CACHE_ENABLED: true,
    CACHE_EXPIRY: 604800000,
    CACHE_DIR: './.cache',
    DEFAULT_PROVIDER: 'openai',
    AUTO_FALLBACK: true,
    MAX_RETRIES: 3
  }),
  updateAISettings: jest.fn().mockImplementation((settings) => ({
    ...getAISettings(),
    ...settings
  })),
  getFinancialAdvice: jest.fn().mockResolvedValue({
    advice: 'Test financial advice',
    suggestions: ['Suggestion 1', 'Suggestion 2'],
    summary: 'Summary',
    provider: 'openai'
  }),
  suggestFinancialGoals: jest.fn().mockResolvedValue({
    goals: [
      {
        name: 'Emergency Fund',
        description: 'Save 3-6 months of expenses',
        targetAmount: 10000,
        timeframe: '12 months'
      }
    ]
  }),
  analyzeExpenses: jest.fn().mockResolvedValue({
    summary: 'Expense analysis summary',
    topCategories: [
      { name: 'Housing', amount: 2000, percentage: 50 }
    ],
    insights: ['You spend a lot on housing'],
    recommendations: [
      { title: 'Reduce housing costs', description: 'Consider a roommate' }
    ]
  }),
  AIProvider: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic'
  }
}));

// Mock storage
jest.mock('./storage', () => ({
  storage: {
    getIncomes: jest.fn().mockResolvedValue([
      { id: 1, description: 'Salary', amount: 5000 }
    ]),
    getExpenses: jest.fn().mockResolvedValue([
      { id: 1, description: 'Rent', amount: 2000 }
    ]),
    getGoals: jest.fn().mockResolvedValue([
      { id: 1, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 5000 }
    ])
  }
}));

// Mock notification service
jest.mock('./notification-service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({ id: 1 }),
    sendReminderNotifications: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock plaid service
jest.mock('./plaid-service', () => ({
  plaidService: {
    createLinkToken: jest.fn().mockResolvedValue('link-token'),
    exchangePublicToken: jest.fn().mockResolvedValue(1),
    syncTransactions: jest.fn().mockResolvedValue(undefined),
    importPositiveTransactionsAsIncome: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('API Routes', () => {
  let app: Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('AI Settings Endpoints', () => {
    it('GET /api/ai/settings - should return AI settings', async () => {
      const response = await request(app).get('/api/ai/settings');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        CACHE_ENABLED: true,
        CACHE_EXPIRY: 604800000,
        CACHE_DIR: './.cache',
        DEFAULT_PROVIDER: 'openai',
        AUTO_FALLBACK: true,
        MAX_RETRIES: 3
      });
      expect(getAISettings).toHaveBeenCalled();
    });

    it('PATCH /api/ai/settings - should update AI settings', async () => {
      const newSettings = {
        DEFAULT_PROVIDER: 'anthropic',
        AUTO_FALLBACK: false,
        MAX_RETRIES: 5
      };
      
      const response = await request(app)
        .patch('/api/ai/settings')
        .send(newSettings);
      
      expect(response.status).toBe(200);
      expect(updateAISettings).toHaveBeenCalledWith(newSettings);
      expect(response.body.settings).toEqual(expect.objectContaining(newSettings));
      expect(response.body.message).toBe('AI settings updated successfully');
    });

    it('PATCH /api/ai/settings - should reject invalid settings', async () => {
      const invalidSettings = {
        DEFAULT_PROVIDER: 'invalid-provider',
        MAX_RETRIES: 'not-a-number'
      };
      
      const response = await request(app)
        .patch('/api/ai/settings')
        .send(invalidSettings);
      
      expect(response.status).toBe(400);
      expect(updateAISettings).not.toHaveBeenCalledWith(invalidSettings);
    });
  });

  describe('Financial Advice Endpoints', () => {
    it('POST /api/ai/financial-advice - should generate advice', async () => {
      const requestData = {
        userId: 1,
        question: 'How can I save money?'
      };
      
      const response = await request(app)
        .post('/api/ai/financial-advice')
        .send(requestData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        advice: 'Test financial advice',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        summary: 'Summary',
        provider: 'openai'
      });
    });

    it('POST /api/ai/suggest-goals - should suggest financial goals', async () => {
      const requestData = {
        userId: 1
      };
      
      const response = await request(app)
        .post('/api/ai/suggest-goals')
        .send(requestData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        goals: [
          {
            name: 'Emergency Fund',
            description: 'Save 3-6 months of expenses',
            targetAmount: 10000,
            timeframe: '12 months'
          }
        ]
      });
    });

    it('POST /api/ai/analyze-expenses - should analyze expenses', async () => {
      const requestData = {
        userId: 1
      };
      
      const response = await request(app)
        .post('/api/ai/analyze-expenses')
        .send(requestData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        summary: 'Expense analysis summary',
        topCategories: [
          { name: 'Housing', amount: 2000, percentage: 50 }
        ],
        insights: ['You spend a lot on housing'],
        recommendations: [
          { title: 'Reduce housing costs', description: 'Consider a roommate' }
        ]
      });
    });
  });
});