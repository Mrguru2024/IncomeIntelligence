import { db } from './db';
import { 
  spendingPersonalityQuestions, 
  spendingPersonalityResults, 
  spendingPersonalityTypes, 
  InsertSpendingPersonalityResult 
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Define the quiz answer structure
export const quizAnswerSchema = z.object({
  questionId: z.number(),
  optionId: z.string(),
  personalityType: z.string(),
  value: z.number()
});

export const quizAnswersSchema = z.array(quizAnswerSchema);

export type QuizAnswer = z.infer<typeof quizAnswerSchema>;

export class SpendingPersonalityService {
  // Get all active quiz questions
  async getQuestions() {
    try {
      const questions = await db
        .select()
        .from(spendingPersonalityQuestions)
        .where(eq(spendingPersonalityQuestions.active, true));
      
      return questions;
    } catch (error) {
      console.error('Error fetching personality questions:', error);
      throw new Error('Failed to fetch personality questions');
    }
  }

  // Get a specific quiz question
  async getQuestion(id: number) {
    try {
      const [question] = await db
        .select()
        .from(spendingPersonalityQuestions)
        .where(eq(spendingPersonalityQuestions.id, id));
      
      return question;
    } catch (error) {
      console.error(`Error fetching personality question id=${id}:`, error);
      throw new Error('Failed to fetch personality question');
    }
  }

  // Create a new quiz question
  async createQuestion(data: any) {
    try {
      const [question] = await db
        .insert(spendingPersonalityQuestions)
        .values(data)
        .returning();
      
      return question;
    } catch (error) {
      console.error('Error creating personality question:', error);
      throw new Error('Failed to create personality question');
    }
  }

  // Get quiz results for a user
  async getUserResults(userId: number) {
    try {
      const results = await db
        .select()
        .from(spendingPersonalityResults)
        .where(eq(spendingPersonalityResults.userId, userId))
        .orderBy(spendingPersonalityResults.takenAt);
      
      return results;
    } catch (error) {
      console.error(`Error fetching personality results for user id=${userId}:`, error);
      throw new Error('Failed to fetch personality results');
    }
  }

  // Get latest quiz result for a user
  async getLatestUserResult(userId: number) {
    try {
      const [result] = await db
        .select()
        .from(spendingPersonalityResults)
        .where(eq(spendingPersonalityResults.userId, userId))
        .orderBy(spendingPersonalityResults.takenAt, 'desc')
        .limit(1);
      
      return result;
    } catch (error) {
      console.error(`Error fetching latest personality result for user id=${userId}:`, error);
      throw new Error('Failed to fetch latest personality result');
    }
  }

  // Submit a quiz and calculate results
  async submitQuiz(userId: number, answers: QuizAnswer[]) {
    try {
      // Calculate the personality type based on the answers
      const scores = this.calculatePersonalityScores(answers);
      const dominantType = this.getDominantPersonalityType(scores);
      
      // Generate recommendations based on the personality type
      const recommendations = this.generateRecommendations(dominantType, scores);
      
      // Save the result
      const result: InsertSpendingPersonalityResult = {
        userId,
        personalityType: dominantType,
        score: scores,
        answers,
        recommendations
      };
      
      const [savedResult] = await db
        .insert(spendingPersonalityResults)
        .values(result)
        .returning();
      
      return savedResult;
    } catch (error) {
      console.error(`Error submitting quiz for user id=${userId}:`, error);
      throw new Error('Failed to submit quiz');
    }
  }

  // Calculate personality scores from answers
  private calculatePersonalityScores(answers: QuizAnswer[]): Record<string, number> {
    const scores: Record<string, number> = {};
    
    // Initialize scores for all personality types
    spendingPersonalityTypes.forEach(type => {
      scores[type.id] = 0;
    });
    
    // Tally the scores based on the answers
    answers.forEach(answer => {
      if (scores.hasOwnProperty(answer.personalityType)) {
        scores[answer.personalityType] += answer.value;
      }
    });
    
    return scores;
  }

  // Determine the dominant personality type
  private getDominantPersonalityType(scores: Record<string, number>): string {
    let highestScore = 0;
    let dominantType = '';
    
    Object.entries(scores).forEach(([type, score]) => {
      if (score > highestScore) {
        highestScore = score;
        dominantType = type;
      }
    });
    
    return dominantType || 'saver'; // Default to 'saver' if no clear winner
  }

  // Generate personalized recommendations based on the personality type
  private generateRecommendations(personalityType: string, scores: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    // Get the personality type details
    const personality = spendingPersonalityTypes.find(t => t.id === personalityType);
    
    if (!personality) {
      return [
        'Track your income and expenses regularly',
        'Create a budget that works for your lifestyle',
        'Set specific financial goals',
        'Build an emergency fund'
      ];
    }
    
    // Add general recommendations
    recommendations.push(`As a ${personality.name}, focus on leveraging your ${personality.traits.join(', ')} traits.`);
    
    // Add specific recommendations based on personality type
    switch (personalityType) {
      case 'saver':
        recommendations.push('Consider investment opportunities to grow your wealth');
        recommendations.push('Make sure to allocate some funds for enjoying life now');
        recommendations.push('Explore tax-advantaged retirement accounts');
        break;
        
      case 'investor':
        recommendations.push('Diversify your investment portfolio to manage risk');
        recommendations.push('Remember to maintain a healthy emergency fund');
        recommendations.push('Consider working with a financial advisor for complex strategies');
        break;
        
      case 'spender':
        recommendations.push('Create a fun money category in your budget for guilt-free spending');
        recommendations.push('Set up automatic transfers to savings before you can spend');
        recommendations.push('Track your expenses to identify patterns and potential savings');
        break;
        
      case 'debtor':
        recommendations.push('Focus on creating a debt repayment plan');
        recommendations.push('Consider the debt snowball or avalanche method');
        recommendations.push('Build a small emergency fund to avoid new debt for unexpected expenses');
        break;
        
      case 'avoider':
        recommendations.push('Start with simple automated systems for savings and bill payments');
        recommendations.push('Schedule a regular 15-minute weekly money check-in');
        recommendations.push('Consider working with a financial coach for accountability');
        break;
        
      case 'security_seeker':
        recommendations.push('Ensure you have appropriate insurance coverage');
        recommendations.push('Diversify your emergency savings into different accounts');
        recommendations.push('Consider taking small calculated risks for potential growth');
        break;
        
      case 'status_focused':
        recommendations.push('Align your spending with your true values rather than external validation');
        recommendations.push('Learn about "stealth wealth" practices');
        recommendations.push('Focus on quality over quantity in purchases');
        break;
        
      default:
        recommendations.push('Create a budget that aligns with your priorities');
        recommendations.push('Track your spending to identify areas for improvement');
        recommendations.push('Set specific, measurable financial goals');
    }
    
    // Add a recommendation about using the app features
    recommendations.push('Use Stackr\'s allocation feature to automatically divide your income into Needs, Investments, and Savings');
    
    return recommendations;
  }

  // Seed the database with initial questions (for development/testing)
  async seedQuestions() {
    try {
      const existingQuestions = await this.getQuestions();
      
      if (existingQuestions.length > 0) {
        console.log('Questions already exist in the database, skipping seed');
        return;
      }
      
      const sampleQuestions = [
        {
          questionText: "When you receive a windfall of money, what's your first thought?",
          options: [
            { id: "q1_a", text: "I'll put it in my savings account for emergencies", personalityType: "saver", value: 3 },
            { id: "q1_b", text: "I'll research investment options to grow it", personalityType: "investor", value: 3 },
            { id: "q1_c", text: "I'll treat myself to something I've wanted", personalityType: "spender", value: 3 },
            { id: "q1_d", text: "I'll catch up on some bills or debt", personalityType: "debtor", value: 3 }
          ],
          category: "behavior",
          weight: 2
        },
        {
          questionText: "How often do you check your bank account balance?",
          options: [
            { id: "q2_a", text: "Multiple times a week, I like to know exactly where I stand", personalityType: "security_seeker", value: 3 },
            { id: "q2_b", text: "About once a week to make sure everything is on track", personalityType: "saver", value: 2 },
            { id: "q2_c", text: "Only when I need to make a purchase", personalityType: "spender", value: 2 },
            { id: "q2_d", text: "I avoid checking it because it makes me anxious", personalityType: "avoider", value: 3 }
          ],
          category: "behavior",
          weight: 1
        },
        {
          questionText: "Which statement best describes your approach to budgeting?",
          options: [
            { id: "q3_a", text: "I have a detailed budget that I follow strictly", personalityType: "saver", value: 3 },
            { id: "q3_b", text: "I have a rough budget but allow flexibility", personalityType: "investor", value: 2 },
            { id: "q3_c", text: "I don't really budget, I just make sure the bills get paid", personalityType: "spender", value: 2 },
            { id: "q3_d", text: "Budgeting feels overwhelming so I don't do it", personalityType: "avoider", value: 3 }
          ],
          category: "planning",
          weight: 2
        },
        {
          questionText: "When shopping for a big purchase, what's most important to you?",
          options: [
            { id: "q4_a", text: "Getting the best deal possible, even if it takes time", personalityType: "saver", value: 3 },
            { id: "q4_b", text: "Quality and value for the long term", personalityType: "investor", value: 3 },
            { id: "q4_c", text: "How it makes me feel and whether I'll enjoy it", personalityType: "spender", value: 3 },
            { id: "q4_d", text: "That it's recognized as a premium brand", personalityType: "status_focused", value: 3 }
          ],
          category: "values",
          weight: 1
        },
        {
          questionText: "How do you feel about financial risk?",
          options: [
            { id: "q5_a", text: "I'm very comfortable with calculated risks for higher returns", personalityType: "investor", value: 3 },
            { id: "q5_b", text: "I'll take moderate risks if I understand them", personalityType: "saver", value: 2 },
            { id: "q5_c", text: "I prefer safe options even if returns are lower", personalityType: "security_seeker", value: 3 },
            { id: "q5_d", text: "I don't really think about the risks involved", personalityType: "avoider", value: 2 }
          ],
          category: "risk",
          weight: 2
        },
        {
          questionText: "What's your approach to retirement planning?",
          options: [
            { id: "q6_a", text: "I have a detailed plan and contribute regularly", personalityType: "investor", value: 3 },
            { id: "q6_b", text: "I contribute to retirement but haven't planned details", personalityType: "saver", value: 2 },
            { id: "q6_c", text: "I know I should plan but haven't started yet", personalityType: "avoider", value: 2 },
            { id: "q6_d", text: "I'm focused on current needs rather than retirement", personalityType: "debtor", value: 2 }
          ],
          category: "planning",
          weight: 2
        },
        {
          questionText: "When you encounter an unexpected expense, how do you typically handle it?",
          options: [
            { id: "q7_a", text: "Use my emergency fund that I've set aside", personalityType: "security_seeker", value: 3 },
            { id: "q7_b", text: "Temporarily cut back on other expenses to cover it", personalityType: "saver", value: 2 },
            { id: "q7_c", text: "Use a credit card and pay it off over time", personalityType: "debtor", value: 3 },
            { id: "q7_d", text: "Worry about it and hope something works out", personalityType: "avoider", value: 3 }
          ],
          category: "behavior",
          weight: 2
        },
        {
          questionText: "What motivates you to earn more money?",
          options: [
            { id: "q8_a", text: "Financial security and peace of mind", personalityType: "security_seeker", value: 3 },
            { id: "q8_b", text: "Growing wealth and achieving financial independence", personalityType: "investor", value: 3 },
            { id: "q8_c", text: "Being able to enjoy a certain lifestyle", personalityType: "spender", value: 2 },
            { id: "q8_d", text: "Recognition and status among peers", personalityType: "status_focused", value: 3 }
          ],
          category: "values",
          weight: 1
        },
        {
          questionText: "How do you feel after making a large purchase?",
          options: [
            { id: "q9_a", text: "Excited and satisfied with my new acquisition", personalityType: "spender", value: 2 },
            { id: "q9_b", text: "Anxious about spending too much", personalityType: "saver", value: 2 },
            { id: "q9_c", text: "Concerned about potential buyers remorse", personalityType: "security_seeker", value: 1 },
            { id: "q9_d", text: "I consider how others will perceive my purchase", personalityType: "status_focused", value: 3 }
          ],
          category: "emotions",
          weight: 1
        },
        {
          questionText: "What's your approach to service income (when you get paid for a job)?",
          options: [
            { id: "q10_a", text: "I have a system to allocate it to different purposes", personalityType: "investor", value: 3 },
            { id: "q10_b", text: "I save most of it for future needs", personalityType: "saver", value: 3 },
            { id: "q10_c", text: "I usually spend it on current needs and wants", personalityType: "spender", value: 2 },
            { id: "q10_d", text: "It's usually gone before I can plan what to do with it", personalityType: "debtor", value: 2 }
          ],
          category: "behavior",
          weight: 3
        }
      ];
      
      for (const question of sampleQuestions) {
        await this.createQuestion(question);
      }
      
      console.log('Successfully seeded quiz questions');
      
    } catch (error) {
      console.error('Error seeding personality questions:', error);
      throw new Error('Failed to seed personality questions');
    }
  }
}

export const spendingPersonalityService = new SpendingPersonalityService();