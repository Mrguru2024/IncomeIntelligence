import React from 'react';
import MoneyMentorChat from '@/components/MoneyMentor/MoneyMentorChat';

const MoneyMentorPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Money Mentor</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get personalized financial advice powered by Perplexity AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
          <MoneyMentorChat />
        </div>
        
        <div className="md:col-span-3 space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Suggested Topics</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-primary hover:underline text-left w-full"
                  onClick={() => navigator.clipboard.writeText('How can I start investing with only $500?')}
                >
                  How can I start investing with only $500?
                </button>
              </li>
              <li>
                <button 
                  className="text-primary hover:underline text-left w-full"
                  onClick={() => navigator.clipboard.writeText('What\'s the best strategy to pay off my student loans?')}
                >
                  What's the best strategy to pay off my student loans?
                </button>
              </li>
              <li>
                <button 
                  className="text-primary hover:underline text-left w-full"
                  onClick={() => navigator.clipboard.writeText('How much should I save for retirement each month?')}
                >
                  How much should I save for retirement each month?
                </button>
              </li>
              <li>
                <button 
                  className="text-primary hover:underline text-left w-full"
                  onClick={() => navigator.clipboard.writeText('What are some side hustles I can start this weekend?')}
                >
                  What are some side hustles I can start this weekend?
                </button>
              </li>
              <li>
                <button 
                  className="text-primary hover:underline text-left w-full"
                  onClick={() => navigator.clipboard.writeText('How can I create a 50/30/20 budget that works for me?')}
                >
                  How can I create a 50/30/20 budget that works for me?
                </button>
              </li>
            </ul>
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Pro Features</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Stackr Pro to unlock enhanced Money Mentor capabilities:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Unlimited AI-powered financial advice</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Custom income allocation recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Personalized debt repayment plans</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Investment strategy creation</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Chat history &amp; saved advice</span>
              </li>
            </ul>
            <a href="/pricing" className="block mt-4">
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium">
                Upgrade to Pro
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneyMentorPage;