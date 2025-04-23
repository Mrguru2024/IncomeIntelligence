import React from "react";
import { BarChart3, PiggyBank, TrendingUp } from "lucide-react";

const Welcome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Let's set up your financial dashboard</h2>
        <p className="text-gray-600">
          We'll guide you through a few quick steps to personalize your financial tracking experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          icon={<BarChart3 className="h-8 w-8 text-primary" />}
          title="Track Income"
          description="Record and visualize your income streams in one place"
        />
        <FeatureCard
          icon={<TrendingUp className="h-8 w-8 text-indigo-500" />}
          title="Smart Allocation"
          description="Use the 40/30/30 rule to optimize your spending and saving"
        />
        <FeatureCard
          icon={<PiggyBank className="h-8 w-8 text-violet-500" />}
          title="Set Goals"
          description="Define and track progress toward your financial goals"
        />
      </div>

      <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
        <p className="text-sm text-gray-600">
          <strong>Privacy Note:</strong> Your financial data is stored securely and is never shared with third parties. You can export or delete your data at any time.
        </p>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="flex flex-col items-center p-4 text-center rounded-lg bg-white border border-gray-100 shadow-sm">
    <div className="mb-3">{icon}</div>
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

export default Welcome;