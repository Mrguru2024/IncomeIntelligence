import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import { join } from "path";
import { createHash } from "crypto";

// Define AI providers enum first
export enum AIProvider {
  OPENAI = "openai", // OpenAI GPT models
  ANTHROPIC = "anthropic", // Anthropic Claude models
  PERPLEXITY = "perplexity", // Perplexity AI
  MISTRAL = "mistral", // Mistral 7B/Mixtral
  LLAMA = "llama", // LLaMA 2
  OPEN_ASSISTANT = "open-assistant", // Open-Assistant
  WHISPER = "whisper", // Whisper (voice-to-text)
  SCIKIT = "scikit-learn", // scikit-learn for expense categorization
  FASTTEXT = "fasttext", // fastText for text categorization
  JSON_LOGIC = "json-logic", // Rules engine
  T5 = "t5", // T5 for text summarization
}

// AI provider instances
let openai: OpenAI;
let anthropic: Anthropic;
let perplexity: OpenAI;

export function initializeAIClients() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "WARNING: OPENAI_API_KEY not set. OpenAI functionality will be disabled."
    );
  } else {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "WARNING: ANTHROPIC_API_KEY not set. Anthropic functionality will be disabled."
    );
  } else {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    console.warn(
      "WARNING: PERPLEXITY_API_KEY not set. Perplexity functionality will be disabled."
    );
  } else {
    perplexity = new OpenAI({
      baseURL: "https://api.perplexity.ai",
      apiKey: process.env.PERPLEXITY_API_KEY,
    });
  }
}

// Service settings
const AI_SETTINGS = {
  // Cache settings
  CACHE_ENABLED: true,
  CACHE_EXPIRY: 1000 * 60 * 60 * 24 * 7, // 7 days
  CACHE_DIR: "./.cache",

  // AI provider settings
  DEFAULT_PROVIDER: "openai" as AIProvider, // Use the string directly to avoid circular reference
  AUTO_FALLBACK: true, // Automatically try another provider if the first one fails
  MAX_RETRIES: 3, // Maximum number of retries per provider
};

// Export settings for external access
export const getAISettings = () => {
  // Get all available providers from the AIProvider enum
  const availableProviders = Object.values(AIProvider);

  // Return settings with the list of available providers
  return {
    ...AI_SETTINGS,
    availableProviders,
  };
};

export const updateAISettings = (settings: Partial<typeof AI_SETTINGS>) => {
  Object.assign(AI_SETTINGS, settings);
  return getAISettings(); // Use getAISettings to get consistent structure
};

// Initialize cache directory
async function ensureCacheDir() {
  try {
    await fs.mkdir(AI_SETTINGS.CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create cache directory:", error);
  }
}

ensureCacheDir();

// Generate a hash for cache keys
function generateCacheKey(data: any, provider: AIProvider): string {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  return createHash("md5").update(`${provider}-${stringData}`).digest("hex");
}

// Cache operations
async function saveToCache(key: string, data: any): Promise<void> {
  if (!AI_SETTINGS.CACHE_ENABLED) return;

  try {
    const cacheFile = join(AI_SETTINGS.CACHE_DIR, `${key}.json`);
    await fs.writeFile(
      cacheFile,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save to cache:", error);
  }
}

async function getFromCache(key: string): Promise<any | null> {
  if (!AI_SETTINGS.CACHE_ENABLED) return null;

  try {
    const cacheFile = join(AI_SETTINGS.CACHE_DIR, `${key}.json`);
    const data = await fs.readFile(cacheFile, "utf-8");
    const parsed = JSON.parse(data);

    // Check if cache is expired
    if (Date.now() - parsed.timestamp > AI_SETTINGS.CACHE_EXPIRY) {
      await fs.unlink(cacheFile);
      return null;
    }

    return parsed.data;
  } catch (error) {
    return null;
  }
}

// Retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = AI_SETTINGS.MAX_RETRIES,
  initialDelay = 1000
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      retries++;

      // If we've hit max retries or it's not a retryable error, throw
      if (retries >= maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(
        `Retrying after ${delay}ms (attempt ${retries} of ${maxRetries})...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function isRetryableError(error: any): boolean {
  // Retryable errors: rate limits, temporary server errors
  return (
    error.status === 429 || // Rate limit
    (error.status >= 500 && error.status < 600) // Server errors
  );
}

// Multi-provider execution with fallback
async function executeWithFallback<T>(
  openAIFn: () => Promise<T>,
  anthropicFn: () => Promise<T>,
  perplexityFn: () => Promise<T>,
  preferredProvider = AI_SETTINGS.DEFAULT_PROVIDER
): Promise<{ data: T; provider: AIProvider }> {
  // Check if auto fallback is disabled
  if (!AI_SETTINGS.AUTO_FALLBACK) {
    // If fallback is disabled, just use the preferred provider
    try {
      let fn;
      if (preferredProvider === AIProvider.OPENAI) {
        fn = openAIFn;
      } else if (preferredProvider === AIProvider.ANTHROPIC) {
        fn = anthropicFn;
      } else {
        fn = perplexityFn;
      }

      const result = await withRetry(fn);
      return { data: result, provider: preferredProvider };
    } catch (error) {
      console.error(
        `Error with ${preferredProvider} and fallback disabled:`,
        error
      );
      throw error;
    }
  }

  // If fallback is enabled, determine the provider sequence
  // We prioritize free providers (Perplexity) first to save quota on paid providers
  let providers: AIProvider[] = [];

  if (preferredProvider === AIProvider.PERPLEXITY) {
    providers = [
      AIProvider.PERPLEXITY,
      AIProvider.OPENAI,
      AIProvider.ANTHROPIC,
    ];
  } else if (preferredProvider === AIProvider.OPENAI) {
    providers = [
      AIProvider.OPENAI,
      AIProvider.PERPLEXITY,
      AIProvider.ANTHROPIC,
    ];
  } else {
    providers = [
      AIProvider.ANTHROPIC,
      AIProvider.PERPLEXITY,
      AIProvider.OPENAI,
    ];
  }

  let lastError: any;

  for (const provider of providers) {
    try {
      let fn;
      if (provider === AIProvider.OPENAI) {
        fn = openAIFn;
      } else if (provider === AIProvider.ANTHROPIC) {
        fn = anthropicFn;
      } else {
        fn = perplexityFn;
      }

      const result = await withRetry(fn);
      return { data: result, provider };
    } catch (error: any) {
      console.error(`Error with ${provider}:`, error);
      lastError = error;

      // If it's just a quota error, try the next provider
      if (error.status === 429 || error.code === "insufficient_quota") {
        continue;
      } else {
        // For other errors, it might be an issue with our prompt, so fail fast
        throw error;
      }
    }
  }

  // If we got here, all providers failed
  throw lastError;
}

// Types
export type FinancialAdviceRequest = {
  userId: number;
  incomeData?: any[]; // Recent income data
  expenseData?: any[]; // Recent expense data
  goalData?: any[]; // User's financial goals
  balanceData?: any; // Current balance information
  question?: string; // Specific financial question (optional)
  preferredProvider?: AIProvider; // Preferred AI provider to use
};

export type FinancialAdviceResponse = {
  advice: string;
  suggestions: string[];
  summary?: string;
  provider?: string;
  errorType?: string;
  error?: boolean;
};

// Main AI functions
export async function getFinancialAdvice(
  requestData: FinancialAdviceRequest
): Promise<FinancialAdviceResponse> {
  // Generate cache key based on the request data
  const cacheKey = generateCacheKey(requestData, AIProvider.OPENAI);

  // Try to get from cache first
  const cachedResult = await getFromCache(cacheKey);
  if (cachedResult) {
    console.log("Using cached financial advice");
    return {
      ...cachedResult,
      provider: "cache", // Mark as coming from cache
    };
  }

  try {
    const prompt = buildFinancialAdvicePrompt(requestData);

    // Use preferred provider from request or fall back to default setting
    const providerToUse =
      requestData.preferredProvider || AI_SETTINGS.DEFAULT_PROVIDER;

    const result = await executeWithFallback(
      // OpenAI function
      async () => {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a financial advisor specialized in personal finance. Provide thoughtful, detailed advice based on the user's financial situation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText || "{}");
      },
      // Anthropic function
      async () => {
        const message = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1024,
          system:
            'You are a financial advisor specialized in personal finance. Provide thoughtful, detailed advice based on the user\'s financial situation. Always respond with JSON in the format: { "advice": string, "suggestions": string[], "summary": string }',
          messages: [{ role: "user", content: prompt }],
        });

        // Handle the content correctly for Anthropic's response format
        let responseText = "";
        if (
          message.content &&
          message.content.length > 0 &&
          message.content[0].type === "text"
        ) {
          responseText = message.content[0].text;
        }

        return JSON.parse(responseText || "{}");
      },
      // Perplexity function (using the same API format as OpenAI)
      async () => {
        const completion = await perplexity.chat.completions.create({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content:
                "You are a financial advisor specialized in personal finance. Provide thoughtful, detailed advice based on the user's financial situation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1, // Lower temperature for more deterministic financial advice
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText || "{}");
      },
      providerToUse
    );

    // Format the response
    const formattedResponse: FinancialAdviceResponse = {
      advice:
        result.data.advice ||
        "No specific advice could be generated at this time.",
      suggestions: result.data.suggestions || [],
      summary: result.data.summary,
      provider: result.provider,
    };

    // Save to cache for future use
    await saveToCache(cacheKey, formattedResponse);

    return formattedResponse;
  } catch (error: any) {
    console.error("Error generating financial advice:", error);

    // Determine the error type
    let errorType = "unknown";
    if (error.status === 429 || error.code === "insufficient_quota") {
      errorType = "quota_exceeded";
    } else if (error.status === 429) {
      errorType = "rate_limited";
    }

    return {
      advice: "",
      suggestions: [],
      summary: "",
      error: true,
      errorType,
    };
  }
}

export interface GoalSuggestionsResponse {
  goals?: any[];
  error?: boolean;
  errorType?: string;
}

export async function suggestFinancialGoals(
  incomeData: any[]
): Promise<GoalSuggestionsResponse> {
  const cacheKey = generateCacheKey(incomeData, AIProvider.OPENAI);

  // Try to get from cache first
  const cachedResult = await getFromCache(cacheKey);
  if (cachedResult) {
    console.log("Using cached goal suggestions");
    return cachedResult;
  }

  try {
    const prompt = `Based on the following income data, suggest 3-5 realistic financial goals:
      ${JSON.stringify(incomeData, null, 2)}
      
      Provide the goals in a JSON array format with the following structure for each goal:
      {
        "name": "Goal name",
        "description": "Detailed description",
        "targetAmount": numeric amount,
        "timeframe": "time period (e.g., '3 months', '1 year')"
      }
      
      Response should be in the format:
      {
        "goals": [ ... array of goal objects ... ]
      }`;

    const result = await executeWithFallback(
      // OpenAI function
      async () => {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a financial goals expert. Generate realistic, achievable financial goals based on income data.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText || "{}");
      },
      // Anthropic function
      async () => {
        const message = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1024,
          system:
            'You are a financial goals expert. Generate realistic, achievable financial goals based on income data. Always respond with JSON in the format: { "goals": [...array of goal objects...] }',
          messages: [{ role: "user", content: prompt }],
        });

        // Handle the content correctly for Anthropic's response format
        let responseText = "";
        if (
          message.content &&
          message.content.length > 0 &&
          message.content[0].type === "text"
        ) {
          responseText = message.content[0].text;
        }

        return JSON.parse(responseText || "{}");
      },
      // Perplexity function
      async () => {
        const completion = await perplexity.chat.completions.create({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content:
                "You are a financial goals expert. Generate realistic, achievable financial goals based on income data.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText || "{}");
      },
      AI_SETTINGS.DEFAULT_PROVIDER
    );

    // Save to cache for future use
    await saveToCache(cacheKey, result.data);

    return result.data;
  } catch (error: any) {
    console.error("Error suggesting financial goals:", error);

    // Determine the error type
    let errorType = "unknown";
    if (error.status === 429 || error.code === "insufficient_quota") {
      errorType = "quota_exceeded";
    } else if (error.status === 429) {
      errorType = "rate_limited";
    }

    return {
      goals: [],
      error: true,
      errorType,
    };
  }
}

export interface ExpenseAnalysisResponse {
  summary?: string;
  topCategories?: any[];
  insights?: string[];
  recommendations?: any[];
  error?: boolean;
  errorType?: string;
}

export async function analyzeExpenses(
  expenseData: any[]
): Promise<ExpenseAnalysisResponse> {
  const cacheKey = generateCacheKey(expenseData, AIProvider.OPENAI);

  // Try to get from cache first
  const cachedResult = await getFromCache(cacheKey);
  if (cachedResult) {
    console.log("Using cached expense analysis");
    return cachedResult;
  }

  try {
    const prompt = `Analyze the following expense data and provide insights:
      ${JSON.stringify(expenseData, null, 2)}
      
      Provide the analysis in a JSON format with the following structure:
      {
        "summary": "Brief overview of spending patterns",
        "topCategories": [
          {
            "name": "Category name",
            "amount": numeric amount,
            "percentage": percentage of total
          }
        ],
        "insights": ["Insight 1", "Insight 2", ...],
        "recommendations": [
          {
            "title": "Recommendation title",
            "description": "Detailed recommendation",
            "savingsEstimate": numeric amount (if applicable)
          }
        ]
      }`;

    const result = await executeWithFallback(
      // OpenAI function
      async () => {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a financial analyst specializing in personal expense optimization. Analyze expense data and provide actionable insights.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText || "{}");
      },
      // Anthropic function
      async () => {
        const message = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1024,
          system:
            "You are a financial analyst specializing in personal expense optimization. Analyze expense data and provide actionable insights. Respond with JSON matching the expected format.",
          messages: [{ role: "user", content: prompt }],
        });

        // Handle the content correctly for Anthropic's response format
        let responseText = "";
        if (
          message.content &&
          message.content.length > 0 &&
          message.content[0].type === "text"
        ) {
          responseText = message.content[0].text;
        }

        return JSON.parse(responseText || "{}");
      },
      // Perplexity function
      async () => {
        const completion = await perplexity.chat.completions.create({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content:
                "You are a financial analyst specializing in personal expense optimization. Analyze expense data and provide actionable insights.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const responseText = completion.choices[0].message.content;
        return JSON.parse(responseText || "{}");
      },
      AI_SETTINGS.DEFAULT_PROVIDER
    );

    // Save to cache for future use
    await saveToCache(cacheKey, result.data);

    return result.data;
  } catch (error: any) {
    console.error("Error analyzing expenses:", error);

    // Determine the error type
    let errorType = "unknown";
    if (error.status === 429 || error.code === "insufficient_quota") {
      errorType = "quota_exceeded";
    } else if (error.status === 429) {
      errorType = "rate_limited";
    }

    return {
      summary: "",
      topCategories: [],
      insights: [],
      recommendations: [],
      error: true,
      errorType,
    };
  }
}

// Helper functions
function buildFinancialAdvicePrompt(
  requestData: FinancialAdviceRequest
): string {
  // Build a comprehensive prompt based on the user's financial data
  let prompt = `Provide financial advice based on the following data:\n\n`;

  if (requestData.incomeData && requestData.incomeData.length > 0) {
    prompt += `## Income Data\n${JSON.stringify(requestData.incomeData, null, 2)}\n\n`;
  }

  if (requestData.expenseData && requestData.expenseData.length > 0) {
    prompt += `## Expense Data\n${JSON.stringify(requestData.expenseData, null, 2)}\n\n`;
  }

  if (requestData.goalData && requestData.goalData.length > 0) {
    prompt += `## Financial Goals\n${JSON.stringify(requestData.goalData, null, 2)}\n\n`;
  }

  if (requestData.balanceData) {
    prompt += `## Current Balance\n${JSON.stringify(requestData.balanceData, null, 2)}\n\n`;
  }

  if (requestData.question) {
    prompt += `## Specific Question\n${requestData.question}\n\n`;
  }

  prompt += `
  Please provide your advice in the following JSON format:
  {
    "advice": "detailed financial advice",
    "suggestions": ["specific actionable suggestion 1", "suggestion 2", ...],
    "summary": "brief summary of key points"
  }`;

  return prompt;
}
