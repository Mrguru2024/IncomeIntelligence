import { AIProvider } from './ai-service';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';
import { z } from 'zod';
import {
  spendingPersonalityTypes,
  InsertSpendingPersonalityQuestion,
  SpendingPersonalityQuestion,
  InsertSpendingPersonalityResult
} from '@shared/schema';

// Initialize AI providers
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default quiz questions
const DEFAULT_QUIZ_QUESTIONS: InsertSpendingPersonalityQuestion[] = [
  {
    questionText: "When you receive an unexpected windfall, your first instinct is to:",
    options: [
      { text: "Save it for emergencies", personalityType: "saver", value: 3 },
      { text: "Invest it for future growth", personalityType: "investor", value: 3 },
      { text: "Spend it on something enjoyable", personalityType: "spender", value: 3 },
      { text: "Pay off existing debts", personalityType: "debtor", value: 3 }
    ],
    category: "windfall",
    weight: 2,
    active: true
  },
  {
    questionText: "How often do you check your bank account balance?",
    options: [
      { text: "Multiple times a day", personalityType: "security_seeker", value: 3 },
      { text: "A few times a week", personalityType: "saver", value: 2 },
      { text: "Only when I need to make a purchase", personalityType: "spender", value: 2 },
      { text: "Rarely - I prefer not to look", personalityType: "avoider", value: 3 }
    ],
    category: "monitoring",
    weight: 1,
    active: true
  },
  {
    questionText: "Which statement best describes your approach to budgeting?",
    options: [
      { text: "I have a detailed budget and track every expense", personalityType: "saver", value: 3 },
      { text: "I follow general guidelines but remain flexible", personalityType: "investor", value: 2 },
      { text: "I only budget for major expenses", personalityType: "spender", value: 2 },
      { text: "I find budgeting stressful and avoid it", personalityType: "avoider", value: 3 }
    ],
    category: "budgeting",
    weight: 2,
    active: true
  },
  {
    questionText: "When making a major purchase, you typically:",
    options: [
      { text: "Research extensively to find the best value", personalityType: "saver", value: 2 },
      { text: "Consider how it fits into your long-term financial plan", personalityType: "investor", value: 3 },
      { text: "Buy what feels right in the moment", personalityType: "spender", value: 3 },
      { text: "Choose based on brand name or status", personalityType: "status_focused", value: 3 }
    ],
    category: "purchasing",
    weight: 2,
    active: true
  },
  {
    questionText: "How do you feel about financial risk?",
    options: [
      { text: "Very uncomfortable - I prefer guaranteed security", personalityType: "security_seeker", value: 3 },
      { text: "Willing to take calculated risks for higher returns", personalityType: "investor", value: 3 },
      { text: "I don't think much about risk when spending", personalityType: "spender", value: 2 },
      { text: "Nervous about financial matters in general", personalityType: "avoider", value: 2 }
    ],
    category: "risk",
    weight: 2,
    active: true
  },
  {
    questionText: "When it comes to saving for retirement:",
    options: [
      { text: "I'm maximizing my contributions and planning carefully", personalityType: "saver", value: 3 },
      { text: "I'm investing strategically with specific goals", personalityType: "investor", value: 3 },
      { text: "I know I should save more, but present needs come first", personalityType: "debtor", value: 2 },
      { text: "It seems too far away to worry about now", personalityType: "avoider", value: 3 }
    ],
    category: "long_term",
    weight: 2,
    active: true
  },
  {
    questionText: "Your approach to material possessions is best described as:",
    options: [
      { text: "Quality over quantity - I buy fewer, better things", personalityType: "minimalist", value: 3 },
      { text: "I enjoy having the latest and best items", personalityType: "status_focused", value: 3 },
      { text: "I appreciate nice things but am not attached to them", personalityType: "spender", value: 2 },
      { text: "I tend to accumulate things without much planning", personalityType: "debtor", value: 2 }
    ],
    category: "materialism",
    weight: 1,
    active: true
  },
  {
    questionText: "When you receive your income, what's your priority?",
    options: [
      { text: "Ensuring bills and necessities are covered first", personalityType: "security_seeker", value: 2 },
      { text: "Allocating set percentages to savings, investing and spending", personalityType: "investor", value: 3 },
      { text: "Taking care of immediate needs and desires", personalityType: "spender", value: 2 },
      { text: "Catching up on overdue payments", personalityType: "debtor", value: 3 }
    ],
    category: "cash_flow",
    weight: 2,
    active: true
  },
  {
    questionText: "How do you feel after making impulse purchases?",
    options: [
      { text: "Guilty or anxious about the money spent", personalityType: "saver", value: 2 },
      { text: "Concerned about the impact on my financial plans", personalityType: "investor", value: 2 },
      { text: "Excited and happy with my new purchase", personalityType: "spender", value: 3 },
      { text: "A mix of pleasure and worry about debt", personalityType: "debtor", value: 3 }
    ],
    category: "impulse",
    weight: 1,
    active: true
  },
  {
    questionText: "Which financial goal is most important to you right now?",
    options: [
      { text: "Building an emergency fund", personalityType: "security_seeker", value: 3 },
      { text: "Growing wealth through investments", personalityType: "investor", value: 3 },
      { text: "Having funds for experiences and enjoyment", personalityType: "spender", value: 3 },
      { text: "Getting out of debt", personalityType: "debtor", value: 3 }
    ],
    category: "goals",
    weight: 3,
    active: true
  }
];

// Quiz input validation schema
export const quizAnswersSchema = z.object({
  userId: z.number(),
  answers: z.array(
    z.object({
      questionId: z.number(),
      selectedOptionIndex: z.number(),
    })
  )
});

export type QuizAnswers = z.infer<typeof quizAnswersSchema>;

export class SpendingPersonalityService {
  /**
   * Initialize the quiz system by ensuring questions exist in the database
   */
  async initializeQuiz(): Promise<void> {
    try {
      // Check if questions already exist
      const existingQuestions = await storage.getSpendingPersonalityQuestions();
      
      if (!existingQuestions || existingQuestions.length === 0) {
        // No questions found, insert default questions
        for (const question of DEFAULT_QUIZ_QUESTIONS) {
          await storage.createSpendingPersonalityQuestion(question);
        }
        console.log('Default spending personality quiz questions initialized');
      }
    } catch (error) {
      console.error('Error initializing quiz questions:', error);
      throw new Error('Failed to initialize quiz system');
    }
  }

  /**
   * Get all active quiz questions
   */
  async getQuizQuestions(): Promise<SpendingPersonalityQuestion[]> {
    try {
      const questions = await storage.getActiveSpendingPersonalityQuestions();
      return questions;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw new Error('Failed to fetch quiz questions');
    }
  }

  /**
   * Calculate quiz results based on user's answers
   */
  async calculateQuizResults(quizData: QuizAnswers): Promise<InsertSpendingPersonalityResult> {
    try {
      // Get all questions to match with answers
      const questions = await storage.getSpendingPersonalityQuestions();
      
      // Initialize score tracking
      const scoresByType: Record<string, number> = {};
      const maxScoresByType: Record<string, number> = {};
      
      // Initialize all personality types with zero score
      spendingPersonalityTypes.forEach(type => {
        scoresByType[type.id] = 0;
        maxScoresByType[type.id] = 0;
      });
      
      // Process each answer
      const processedAnswers = [];
      
      for (const answer of quizData.answers) {
        const question = questions.find(q => q.id === answer.questionId);
        
        if (!question) {
          continue; // Skip if question not found
        }
        
        const selectedOption = question.options[answer.selectedOptionIndex];
        if (!selectedOption) {
          continue; // Skip if option not found
        }
        
        // Add to score based on the personality type and weight
        const personalityType = selectedOption.personalityType;
        const value = selectedOption.value * question.weight;
        
        scoresByType[personalityType] = (scoresByType[personalityType] || 0) + value;
        
        // Track max possible score for this personality type
        maxScoresByType[personalityType] = (maxScoresByType[personalityType] || 0) + 
                                           (3 * question.weight); // Max value is 3
        
        // Record processed answer
        processedAnswers.push({
          questionId: question.id,
          questionText: question.questionText,
          selectedOption: selectedOption,
          category: question.category
        });
      }
      
      // Calculate percentages and determine dominant type
      const normalizedScores: Record<string, number> = {};
      
      Object.keys(scoresByType).forEach(type => {
        if (maxScoresByType[type] > 0) {
          normalizedScores[type] = (scoresByType[type] / maxScoresByType[type]) * 100;
        } else {
          normalizedScores[type] = 0;
        }
      });
      
      // Find dominant personality type
      let dominantType = Object.keys(normalizedScores)[0];
      let highestScore = normalizedScores[dominantType];
      
      Object.keys(normalizedScores).forEach(type => {
        if (normalizedScores[type] > highestScore) {
          highestScore = normalizedScores[type];
          dominantType = type;
        }
      });
      
      // Get personality description
      const personalityInfo = spendingPersonalityTypes.find(t => t.id === dominantType);
      
      // Generate AI-powered recommendations
      const recommendations = await this.generateRecommendations(dominantType, normalizedScores, processedAnswers);
      
      // Create result object
      const result: InsertSpendingPersonalityResult = {
        userId: quizData.userId,
        personalityType: dominantType,
        score: {
          normalized: normalizedScores,
          raw: scoresByType,
          dominant: dominantType,
          dominantScore: highestScore,
          personalityInfo
        },
        answers: processedAnswers,
        recommendations
      };
      
      // Save the results
      await storage.createSpendingPersonalityResult(result);
      
      return result;
    } catch (error) {
      console.error('Error calculating quiz results:', error);
      throw new Error('Failed to calculate quiz results');
    }
  }

  /**
   * Generate personalized recommendations based on quiz results using AI
   */
  private async generateRecommendations(
    dominantType: string,
    scores: Record<string, number>,
    answers: any[]
  ): Promise<any> {
    try {
      const personalityInfo = spendingPersonalityTypes.find(t => t.id === dominantType);
      
      if (!personalityInfo) {
        throw new Error('Personality type information not found');
      }
      
      // Create a prompt for the AI
      const prompt = `
        I need personalized financial recommendations for someone with the following spending personality profile:
        
        Dominant type: ${personalityInfo.name} (${personalityInfo.description})
        
        Personality trait scores (percentages):
        ${Object.entries(scores)
          .map(([type, score]) => {
            const info = spendingPersonalityTypes.find(t => t.id === type);
            return `- ${info?.name}: ${score.toFixed(1)}%`;
          })
          .join('\n')}
        
        Based on this financial personality profile, provide:
        1. A short summary of their financial tendencies (3-4 sentences)
        2. 3 specific strengths they likely have
        3. 3 potential financial blind spots or challenges
        4. 5 actionable recommendations tailored to their personality to improve their financial health
        
        Format the response as a structured JSON object with the following keys:
        {
          "summary": "...",
          "strengths": ["...", "...", "..."],
          "challenges": ["...", "...", "..."],
          "recommendations": ["...", "...", "...", "...", "..."]
        }
      `;

      try {
        // Try with OpenAI first
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a financial advisor specializing in behavioral finance and spending personalities."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0].message.content;
        if (responseText) {
          return JSON.parse(responseText);
        }
      } catch (openaiError) {
        // Fall back to Anthropic if OpenAI fails
        console.error('OpenAI error, falling back to Anthropic:', openaiError);

        try {
          const anthropicResponse = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219", // the newest Anthropic model
            max_tokens: 1000,
            system: "You are a financial advisor specializing in behavioral finance and spending personalities. Always respond with valid JSON.",
            messages: [
              { role: "user", content: prompt }
            ]
          });

          const responseText = anthropicResponse.content[0].text;
          if (responseText) {
            return JSON.parse(responseText);
          }
        } catch (anthropicError) {
          console.error('Anthropic error:', anthropicError);
          
          // Fallback to static recommendations if both AI services fail
          return this.getFallbackRecommendations(dominantType);
        }
      }

      // If OpenAI and Anthropic both failed, use fallback
      return this.getFallbackRecommendations(dominantType);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(dominantType);
    }
  }

  /**
   * Get fallback recommendations if AI generation fails
   */
  private getFallbackRecommendations(personalityType: string): any {
    // Default recommendations map by personality type
    const recommendationsByType: Record<string, any> = {
      "saver": {
        summary: "You are careful and methodical with money, prioritizing security and future stability. You likely have a strong emergency fund and minimal debt, but may be overly cautious with investments.",
        strengths: [
          "Excellent at building emergency funds and avoiding debt",
          "Disciplined approach to spending and budgeting",
          "Generally prepared for financial emergencies"
        ],
        challenges: [
          "May be too conservative with investments, limiting growth potential",
          "Could miss opportunities for reasonable financial risks",
          "Might prioritize saving over enjoying life experiences"
        ],
        recommendations: [
          "Consider increasing exposure to growth investments for long-term goals",
          "Allocate a specific 'fun money' budget to enjoy without guilt",
          "Explore calculated risks that align with your financial goals",
          "Review your investment allocation to ensure it matches your time horizon",
          "Balance present enjoyment with future security by setting spending thresholds"
        ]
      },
      "investor": {
        summary: "You take a strategic approach to finances, viewing money as a tool for growth and focusing on the bigger picture. You're comfortable with calculated risks and likely have a diversified portfolio.",
        strengths: [
          "Strategic long-term financial planning",
          "Comfortable with calculated risks for potential growth",
          "Good at seeing the big financial picture"
        ],
        challenges: [
          "May focus too much on future goals at the expense of present needs",
          "Could take excessive risks in pursuit of returns",
          "Might overlook day-to-day budget management"
        ],
        recommendations: [
          "Regularly review risk tolerance and adjust investments accordingly",
          "Establish a strong cash reserve alongside investments",
          "Set up automated systems for tracking day-to-day expenses",
          "Balance growth objectives with protection strategies",
          "Consider working with a financial advisor to optimize strategies"
        ]
      },
      "spender": {
        summary: "You prioritize experiences and enjoyment in the present, using money to enhance your quality of life. While you appreciate nice things, you're often motivated by experiences rather than just material possessions.",
        strengths: [
          "Good at enjoying life and using money to create happiness",
          "Usually generous and willing to invest in relationships",
          "Adaptable and comfortable with financial changes"
        ],
        challenges: [
          "May struggle with long-term saving and retirement planning",
          "Could face challenges with unexpected expenses",
          "Might have difficulty tracking where money goes"
        ],
        recommendations: [
          "Implement automated savings that happen before money reaches your checking account",
          "Create a '24-hour rule' for purchases over a certain amount",
          "Build an emergency fund to protect your lifestyle",
          "Use budgeting apps that give real-time feedback on spending",
          "Focus on value-based spending that aligns with your priorities"
        ]
      },
      "debtor": {
        summary: "You tend to use credit frequently and may sometimes spend beyond your means. You're optimistic about future income but might face challenges with managing current obligations and building savings.",
        strengths: [
          "Optimistic outlook on financial future",
          "Willing to take action when necessary",
          "Good at finding creative financial solutions"
        ],
        challenges: [
          "May struggle with managing credit and debt levels",
          "Could face cash flow challenges with monthly obligations",
          "Might find it difficult to build emergency savings"
        ],
        recommendations: [
          "Create a debt repayment plan focusing on highest interest debts first",
          "Track all expenses to identify spending patterns and opportunities to cut back",
          "Build a starter emergency fund of $1,000 before aggressive debt repayment",
          "Consider consolidating high-interest debt to lower rates",
          "Implement a cash-only approach for discretionary spending"
        ]
      },
      "avoider": {
        summary: "You prefer not to think about finances and may feel anxious or overwhelmed when dealing with money matters. This can lead to missed opportunities and unaddressed financial issues.",
        strengths: [
          "Likely to be less materialistic than others",
          "Not driven by financial status or comparisons",
          "Potential for rapid improvement with the right systems"
        ],
        challenges: [
          "May miss important financial deadlines or opportunities",
          "Could have unresolved financial issues that grow over time",
          "Might lack awareness of current financial status"
        ],
        recommendations: [
          "Start with simple automated systems for bill payment and saving",
          "Schedule a monthly 'money date' for just 30 minutes of financial review",
          "Work with a financial professional who can provide accountability",
          "Use financial apps that require minimal engagement",
          "Break down financial tasks into very small, manageable steps"
        ]
      },
      "security_seeker": {
        summary: "You prioritize financial safety and protection against risks. You're thorough in planning and likely have good insurance coverage and emergency savings, but might be overly cautious with investments.",
        strengths: [
          "Excellent at preparing for contingencies and emergencies",
          "Detail-oriented approach to financial planning",
          "Conservative, stable approach to money management"
        ],
        challenges: [
          "May be excessively risk-averse, limiting growth potential",
          "Could spend too much on insurance and protections",
          "Might experience anxiety about financial uncertainties"
        ],
        recommendations: [
          "Review insurance coverages to ensure they're appropriate, not excessive",
          "Consider a staged approach to investing with increasing risk tolerance",
          "Establish clear criteria for what constitutes 'enough' security",
          "Explore moderate-risk investments for a portion of your portfolio",
          "Set specific time intervals for reviewing financial plans to avoid constant worry"
        ]
      },
      "status_focused": {
        summary: "You see money as a way to achieve recognition and demonstrate success. You appreciate quality and are willing to spend on visible signs of accomplishment, which can motivate achievement but also lead to excess spending.",
        strengths: [
          "Highly motivated to increase income and achieve financial goals",
          "Appreciates quality and is willing to invest in lasting items",
          "Often knowledgeable about products and services"
        ],
        challenges: [
          "May overspend on status items at the expense of financial security",
          "Could be influenced by social comparison and pressure",
          "Might focus on appearances rather than actual financial health"
        ],
        recommendations: [
          "Define success in terms of net worth rather than visible possessions",
          "Create a selective splurge strategy for meaningful status items",
          "Implement a waiting period for large discretionary purchases",
          "Focus on wealth-building activities that also bring recognition",
          "Consider the long-term cost of ownership for status purchases"
        ]
      },
      "minimalist": {
        summary: "You value simplicity and intentional consumption, preferring quality over quantity. You likely have low fixed expenses and are comfortable living below your means, which supports solid financial health.",
        strengths: [
          "Naturally good at avoiding lifestyle inflation",
          "Focused on value and utility rather than accumulation",
          "Usually has low fixed expenses relative to income"
        ],
        challenges: [
          "May under-invest in necessary tools or resources",
          "Could sacrifice convenience to an excessive degree",
          "Might avoid financial tools that would be beneficial"
        ],
        recommendations: [
          "Create a value-based spending plan that allows for quality where it matters most",
          "Consider investments in tools and services that meaningfully improve quality of life",
          "Explore financial instruments that align with minimalist values",
          "Automate financial processes to reduce time and attention needed",
          "Balance minimalism with appropriate preparation for future needs"
        ]
      }
    };
    
    // Return the recommendations for the specified type, or a generic set if not found
    return recommendationsByType[personalityType] || {
      summary: "You have a unique approach to managing your finances that combines elements of different spending personalities.",
      strengths: [
        "You have developed your own approach to managing money",
        "Your financial style likely has unique strengths",
        "You may be adaptable to different financial situations"
      ],
      challenges: [
        "You might need to be more aware of your financial tendencies",
        "Could benefit from more structure in financial planning",
        "May need to balance different aspects of your financial approach"
      ],
      recommendations: [
        "Take time to reflect on your financial successes and challenges",
        "Consider working with a financial advisor to develop a personalized plan",
        "Implement a simple budgeting system that works with your tendencies",
        "Set specific financial goals aligned with your priorities",
        "Regularly review your progress and adjust strategies as needed"
      ]
    };
  }

  /**
   * Get the most recent quiz result for a user
   */
  async getUserQuizResult(userId: number) {
    try {
      return await storage.getLatestSpendingPersonalityResult(userId);
    } catch (error) {
      console.error('Error fetching user quiz result:', error);
      throw new Error('Failed to fetch quiz result');
    }
  }

  /**
   * Add a new quiz question (admin only)
   */
  async addQuizQuestion(question: InsertSpendingPersonalityQuestion) {
    try {
      return await storage.createSpendingPersonalityQuestion(question);
    } catch (error) {
      console.error('Error adding quiz question:', error);
      throw new Error('Failed to add quiz question');
    }
  }

  /**
   * Update an existing quiz question (admin only)
   */
  async updateQuizQuestion(id: number, question: Partial<InsertSpendingPersonalityQuestion>) {
    try {
      return await storage.updateSpendingPersonalityQuestion(id, question);
    } catch (error) {
      console.error('Error updating quiz question:', error);
      throw new Error('Failed to update quiz question');
    }
  }

  /**
   * Delete a quiz question (admin only)
   */
  async deleteQuizQuestion(id: number) {
    try {
      return await storage.deleteSpendingPersonalityQuestion(id);
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      throw new Error('Failed to delete quiz question');
    }
  }
}

export const spendingPersonalityService = new SpendingPersonalityService();