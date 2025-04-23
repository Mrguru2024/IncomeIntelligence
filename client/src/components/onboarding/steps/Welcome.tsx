import { Rocket } from "lucide-react";

const Welcome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Rocket className="h-6 w-6 mr-2 text-primary" />
          Welcome to Stackr Finance
        </h2>
        <p className="text-gray-600">
          Your personal finance management journey starts here. We'll help you set up your financial dashboard in just a few steps.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">Track Income</h3>
          <p className="text-sm text-gray-600">
            Easily track and categorize all your income sources in one place.
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">Smart Allocation</h3>
          <p className="text-sm text-gray-600">
            Use the 40/30/30 principle to allocate your money efficiently.
          </p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">Set Financial Goals</h3>
          <p className="text-sm text-gray-600">
            Define clear financial goals and track your progress over time.
          </p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">AI Assistance</h3>
          <p className="text-sm text-gray-600">
            Get personalized financial advice from our AI assistant.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
        <p className="text-sm text-blue-700">
          Let's get started by setting up your income and allocation preferences. Click "Continue" to proceed.
        </p>
      </div>
    </div>
  );
};

export default Welcome;