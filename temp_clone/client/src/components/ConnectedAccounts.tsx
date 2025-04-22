import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BankConnectionModal from "./BankConnectionModal";

interface BankConnection {
  id: number;
  name: string;
  status: string;
}

export default function ConnectedAccounts() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This would be populated from real bank connections in a production app
  const connections: BankConnection[] = [];

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Connected Accounts
          </h3>
          <Button
            variant="ghost"
            className="text-primary hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus mr-1"></i> Add Account
          </Button>
        </div>

        {connections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {connections.map((connection, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 flex items-center justify-center rounded-lg mr-2 sm:mr-3">
                    <i className="fas fa-university text-sm sm:text-base text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-medium">
                      {connection.name}
                    </div>
                    <div className="text-xs text-gray-500">Connected</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <i className="fas fa-ellipsis-h text-xs sm:text-sm"></i>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="text-gray-400 mb-2 sm:mb-3">
              <i className="fas fa-university text-3xl sm:text-5xl"></i>
            </div>
            <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
              No accounts connected yet
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 max-w-md">
              Connect your bank accounts to automatically track income and apply
              the 40/30/30 rule.
            </p>
            <Button
              className="bg-primary text-white text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 hover:bg-blue-600 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Connect Your Bank
            </Button>
          </div>
        )}
      </CardContent>

      <BankConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}
