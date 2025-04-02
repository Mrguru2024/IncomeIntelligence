import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BankConnectionModal from "./BankConnectionModal";

export default function ConnectedAccounts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // This would be populated from real bank connections in a production app
  const connections = [];

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Connected Accounts</h3>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-blue-700 text-sm font-medium flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus mr-1"></i> Add Account
          </Button>
        </div>
        
        {connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg mr-3">
                    <i className="fas fa-university text-blue-600"></i>
                  </div>
                  <div>
                    <div className="font-medium">{connection.name}</div>
                    <div className="text-xs text-gray-500">Connected</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <i className="fas fa-ellipsis-h"></i>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
            <div className="text-gray-400 mb-3">
              <i className="fas fa-university text-5xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">No accounts connected yet</h4>
            <p className="text-gray-500 mb-4 max-w-md">Connect your bank accounts to automatically track income and apply the 40/30/30 rule.</p>
            <Button 
              className="bg-primary text-white py-2 px-6 hover:bg-blue-600 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Connect Your Bank
            </Button>
          </div>
        )}
      </CardContent>
      
      <BankConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Card>
  );
}
