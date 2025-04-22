import {
  getAISettings,
  updateAISettings,
  AIProvider,
  getFinancialAdvice,
  suggestFinancialGoals,
  analyzeExpenses,
} from "./ai-service";

// Mock OpenAI and Anthropic
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    advice: "Test advice from OpenAI",
                    suggestions: ["Suggestion 1", "Suggestion 2"],
                    summary: "Summary of advice",
                  }),
                },
              },
            ],
          }),
        },
      },
    };
  });
});

jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => {
    return {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                advice: "Test advice from Anthropic",
                suggestions: ["Suggestion 1", "Suggestion 2"],
                summary: "Summary of advice",
              }),
            },
          ],
        }),
      },
    };
  });
});

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockImplementation((path) => {
      if (path.includes("cache-hit")) {
        return Promise.resolve(
          JSON.stringify({
            data: {
              advice: "Cached advice",
              suggestions: ["Cached suggestion 1", "Cached suggestion 2"],
              summary: "Cached summary",
            },
            timestamp: Date.now(),
          }),
        );
      }
      return Promise.reject(new Error("File not found"));
    }),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock crypto for cache key generation
jest.mock("crypto", () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mock-cache-key"),
  }),
}));

describe("AI Service", () => {
  // Reset environment variables and mocks between tests
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "mock-openai-key";
    process.env.ANTHROPIC_API_KEY = "mock-anthropic-key";
    jest.clearAllMocks();
  });

  describe("AI Settings", () => {
    it("should return AI settings", () => {
      const settings = getAISettings();
      expect(settings).toBeDefined();
      expect(settings.DEFAULT_PROVIDER).toBeDefined();
      expect(settings.AUTO_FALLBACK).toBeDefined();
      expect(settings.CACHE_ENABLED).toBeDefined();
    });

    it("should update AI settings", () => {
      const newSettings = {
        DEFAULT_PROVIDER: AIProvider.ANTHROPIC,
        AUTO_FALLBACK: false,
        MAX_RETRIES: 5,
      };

      const updatedSettings = updateAISettings(newSettings);

      expect(updatedSettings.DEFAULT_PROVIDER).toBe(AIProvider.ANTHROPIC);
      expect(updatedSettings.AUTO_FALLBACK).toBe(false);
      expect(updatedSettings.MAX_RETRIES).toBe(5);
    });
  });

  describe("Financial Advice", () => {
    it("should generate financial advice using the default provider", async () => {
      // First, update settings to use OpenAI as default provider
      updateAISettings({
        DEFAULT_PROVIDER: AIProvider.OPENAI,
        CACHE_ENABLED: false, // Disable cache for this test
      });

      const requestData = {
        userId: 1,
        incomeData: [{ amount: 5000, description: "Salary" }],
        expenseData: [{ amount: 2000, description: "Rent" }],
        question: "How can I save more money?",
      };

      const advice = await getFinancialAdvice(requestData);

      expect(advice).toBeDefined();
      expect(advice.advice).toBe("Test advice from OpenAI");
      expect(advice.suggestions).toHaveLength(2);
      expect(advice.provider).toBe("openai");
    });

    it("should use cache when available and enabled", async () => {
      // Enable cache
      updateAISettings({
        CACHE_ENABLED: true,
      });

      // Mock createHash to return a key that will hit the cache
      const createHash = require("crypto").createHash;
      createHash.mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("cache-hit"),
      }));

      const requestData = {
        userId: 1,
        question: "Cached question",
      };

      const advice = await getFinancialAdvice(requestData);

      expect(advice).toBeDefined();
      expect(advice.advice).toBe("Cached advice");
      expect(advice.provider).toBe("cache");
    });

    it("should fall back to alternative provider when primary fails", async () => {
      // Configure fallback to be enabled
      updateAISettings({
        DEFAULT_PROVIDER: AIProvider.OPENAI,
        AUTO_FALLBACK: true,
        CACHE_ENABLED: false,
      });

      // Make OpenAI fail
      const OpenAI = require("openai");
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue({
              status: 429,
              code: "insufficient_quota",
              message: "You exceeded your current quota",
            }),
          },
        },
      }));

      const requestData = {
        userId: 1,
        question: "How can I invest?",
      };

      const advice = await getFinancialAdvice(requestData);

      expect(advice).toBeDefined();
      expect(advice.advice).toBe("Test advice from Anthropic");
      expect(advice.provider).toBe("anthropic");
    });

    it("should return error info when all providers fail", async () => {
      // Configure fallback to be enabled
      updateAISettings({
        DEFAULT_PROVIDER: AIProvider.OPENAI,
        AUTO_FALLBACK: true,
        CACHE_ENABLED: false,
      });

      // Make both providers fail
      const OpenAI = require("openai");
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue({
              status: 429,
              code: "insufficient_quota",
            }),
          },
        },
      }));

      const Anthropic = require("@anthropic-ai/sdk");
      Anthropic.mockImplementationOnce(() => ({
        messages: {
          create: jest.fn().mockRejectedValue({
            status: 429,
            code: "insufficient_quota",
          }),
        },
      }));

      const requestData = {
        userId: 1,
        question: "How can I invest?",
      };

      const advice = await getFinancialAdvice(requestData);

      expect(advice).toBeDefined();
      expect(advice.error).toBe(true);
      expect(advice.errorType).toBe("quota_exceeded");
    });
  });

  describe("Financial Goals Suggestions", () => {
    it("should suggest financial goals based on income data", async () => {
      updateAISettings({
        DEFAULT_PROVIDER: AIProvider.OPENAI,
        CACHE_ENABLED: false,
      });

      const incomeData = [
        { amount: 5000, description: "Salary" },
        { amount: 1000, description: "Side gig" },
      ];

      const goals = await suggestFinancialGoals(incomeData);

      expect(goals).toBeDefined();
      expect(goals.goals).toBeDefined();
    });
  });

  describe("Expense Analysis", () => {
    it("should analyze expenses and provide insights", async () => {
      updateAISettings({
        DEFAULT_PROVIDER: AIProvider.OPENAI,
        CACHE_ENABLED: false,
      });

      const expenseData = [
        { amount: 2000, description: "Rent", category: "Housing" },
        { amount: 500, description: "Groceries", category: "Food" },
        { amount: 300, description: "Entertainment", category: "Leisure" },
      ];

      const analysis = await analyzeExpenses(expenseData);

      expect(analysis).toBeDefined();
      expect(analysis.summary).toBeDefined();
    });
  });
});
